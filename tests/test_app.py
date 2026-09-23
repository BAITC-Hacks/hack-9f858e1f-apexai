import json
import os
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from unittest.mock import patch
from catalog import Catalog, normalize, search, alternatives, rows_and_pages
from server import Assistant, Store, make_handler


class AppTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.env = patch.dict(os.environ, {'OPENAI_API_KEY': ''})
        self.env.start(); self.addCleanup(self.env.stop)
        self.catalog = Catalog('demo'); self.catalog.refresh()
        self.store = Store(self.temp.name + '/cart.sqlite')
        self.app = Assistant(self.catalog, self.store)
        self.sid = 'test-session'

    def act(self, **body):
        return self.app.handle(self.sid, body)

    def test_search_ratings_and_articles(self):
        for text, ids in [('Есть ли 027228?', [515291]), ('DRX250 125А', [48783]), ('Подбери аналог LED STARK 30W', [45357]), ('200300286_', [48783]), ('неизвестный товар zzz', [])]:
            self.assertEqual([p['id'] for p in search(self.catalog.all(), text)], ids)

    def test_analog_is_light_not_breaker(self):
        p = self.catalog.detail(45357)
        candidates = alternatives(self.catalog.all(), p)
        self.assertEqual([x['id'] for x in candidates], [45102])
        self.assertEqual(alternatives(self.catalog.all(), self.catalog.detail(515291)), [])

    def test_confirm_persistence_and_cumulative_stock(self):
        proposal = self.act(message='Добавь 23 шт 027228')
        self.assertEqual(proposal['cart'], [])
        token = proposal['pending']['token']
        result = self.act(action='confirm', token=token)
        self.assertEqual(result['cart'][0]['qty'], 23)
        self.assertEqual(Store(self.store.path).load(self.sid)['cart'][0]['qty'], 23)
        self.assertEqual(self.act(action='confirm', token=token)['cart'][0]['qty'], 23)
        over = self.act(message='Добавь 1 шт 027228')
        self.assertIsNone(over['pending']); self.assertEqual(over['cart'][0]['qty'], 23)

    def test_cancel_and_new_request_never_confirm_old(self):
        self.act(message='Добавь 2 шт 027228')
        result = self.act(message='Добавь 3 шт DRX250 125А')
        self.assertEqual(result['cart'], [])
        self.assertEqual(result['pending']['product']['id'], 48783)
        self.act(message='не добавляй')
        result = self.act(message='Да, добавь')
        self.assertEqual(result['cart'], [])

    def test_invalid_quantities(self):
        for qty in ('0', '-1', '1.5', '100001'):
            result = self.act(message=f'Добавь {qty} шт 027228')
            self.assertIsNone(result['pending']); self.assertEqual(result['cart'], [])
        for qty in (True, 1.5, -2, '2'):
            self.assertIsNone(self.act(action='propose', id=515291, qty=qty)['pending'])

    def test_expired_quote(self):
        result = self.act(message='Добавь 2 шт 027228')
        with patch('server.time.time', return_value=time.time() + 400):
            self.assertEqual(self.act(action='confirm', token=result['pending']['token'])['cart'], [])

    def test_stock_change_at_confirmation(self):
        result = self.act(message='Добавь 2 шт 027228')
        self.catalog.products[0]['stock'] = 1
        self.assertEqual(self.act(action='confirm', token=result['pending']['token'])['cart'], [])

    def test_price_change_requires_new_confirmation(self):
        result = self.act(message='Добавь 2 шт 027228')
        self.catalog.products[0]['price'] += 10
        next_result = self.act(action='confirm', token=result['pending']['token'])
        self.assertEqual(next_result['cart'], [])
        self.assertNotEqual(next_result['pending']['token'], result['pending']['token'])

    def test_separate_sessions(self):
        result = self.act(message='Добавь 2 шт 027228')
        self.act(action='confirm', token=result['pending']['token'])
        self.assertEqual(self.app.handle('other', {'action':'state'})['cart'], [])

    def test_upload_is_session_local(self):
        item = self.app.attach(self.sid, 'список.xlsx', b'not a real spreadsheet')
        self.assertEqual(item['name'], 'список.xlsx')
        self.assertEqual(len(self.store.load(self.sid)['uploads']), 1)
        self.assertEqual(self.store.load('other')['uploads'], [])
        with self.assertRaises(ValueError):
            self.app.attach(self.sid, 'secret.exe', b'x')

    def test_selection_offers_questions_without_changing_cart(self):
        proposal = self.act(action='propose', id=515291, qty=2)
        self.assertEqual(proposal['cart'], [])
        self.assertIsNotNone(proposal['pending'])
        self.assertEqual([item['label'] for item in proposal['companions']], ['Кабель', 'Монтаж', 'Сертификат'])
        self.assertTrue(all('Добав' not in item['message'] for item in proposal['companions']))

    def test_voice_transcription_sends_audio_without_persisting_it(self):
        captured = []
        class Response:
            def read(self): return '{"text":"Нужны автоматы на щиток"}'.encode()
            def __enter__(self): return self
            def __exit__(self, *_): return False
        app = Assistant(self.catalog, self.store, audio_open=lambda request, **kwargs: (captured.append((request, kwargs)) or Response()))
        with patch.dict(os.environ, {'OPENAI_API_KEY': 'test-only-not-real'}):
            text = app.transcribe('voice.webm', b'voice-bytes')
        request, kwargs = captured[0]
        self.assertEqual(text, 'Нужны автоматы на щиток')
        self.assertEqual(request.full_url, 'https://api.openai.com/v1/audio/transcriptions')
        self.assertIn(b'gpt-transcribe', request.data)
        self.assertIn(b'voice-bytes', request.data)
        self.assertEqual(kwargs['timeout'], 45)
        self.assertEqual(self.store.load(self.sid)['uploads'], [])

    def test_photo_uses_private_jpeg_only_after_explicit_request(self):
        self.app.attach(self.sid, 'label.jpg', b'jpeg-bytes')
        captured = []
        def fake(url, **kw):
            captured.append(kw['payload'])
            return {'output':[{'content':[{'type':'output_text','text':json.dumps({'answer':'На фото читается 027228','search_query':'027228'})}]}]}
        self.app.ai_fetch = fake
        with patch.dict(os.environ, {'OPENAI_API_KEY':'test-only-not-real'}):
            result = self.app.photo(self.sid, self.store.load(self.sid), 'Найди товар по фото', 'ru')
        self.assertEqual(result['search_query'], '027228')
        image = captured[0]['input'][0]['content'][1]
        self.assertTrue(image['image_url'].startswith('data:image/jpeg;base64,'))
        self.assertEqual(image['detail'], 'low')

    def test_minimum_batch_and_real_ekt_shape(self):
        p = normalize({'id':515291, 'name':'027228', 'price':64920, 'quantity':23,
                       'stores':[{'name':'Алматы','quantity':5}], 'properties':{'KRATNOST_MIN':'2'}})
        self.assertEqual(p['stock'],23)
        self.assertEqual(p['stores'][0]['quantity'],5)
        self.catalog.products[0] = p
        self.assertIsNone(self.act(action='propose',id=515291,qty=3)['pending'])
        self.assertEqual(self.act(action='propose',id=515291,qty=2)['pending']['qty'],2)

    def test_cart_link_and_demo_conditions(self):
        r = self.act(message='Добавь 2 шт 027228')
        r = self.act(action='confirm',token=r['pending']['token'])
        self.assertEqual(r['basketUrl'],'/basket#cart')
        self.assertTrue(r['added'])
        r = self.act(message='Какие условия оплаты и доставки?')
        self.assertIn('ДЕМОНСТРАЦИОННЫЕ',r['answer'])
        self.assertIn('Минимальная партия',r['answer'])

    def test_unknown_fields_not_zero(self):
        product = normalize({'id':1, 'name':'Test'})
        self.assertIsNone(product['stock']); self.assertIsNone(product['price'])
        self.assertEqual(rows_and_pages({'products':[{'id':1}], 'pagination':{'total_pages':2}})[1], 2)

    def test_unavailable_api_and_explicit_demo(self):
        with patch.dict(os.environ, {'EKT_USER':'test', 'EKT_PASSWORD':'test'}):
            def fail(*a, **kw): raise TimeoutError()
            live = Catalog('live', fetch=fail); live.refresh()
            self.assertEqual(live.source, 'unavailable'); self.assertEqual(live.all(), [])
            auto = Catalog('auto', fetch=fail); auto.refresh()
            self.assertEqual(auto.source, 'demo'); self.assertIn('недоступен', auto.error)

    def test_pagination_and_detail(self):
        calls = []
        def fetch(url, **kw):
            calls.append(url)
            if 'detail' in url: return {'id':2,'name':'Two','stock':9,'price':12}
            page = 2 if '?page=2' in url else 1
            return {'products':[{'id':page, 'name':str(page),'stock':page,'price':10}], 'pagination':{'total_pages':2}}
        with patch.dict(os.environ, {'EKT_USER':'test','EKT_PASSWORD':'test'}):
            live = Catalog('live', fetch=fetch); live.refresh()
            self.assertEqual(len(live.all()),2); self.assertTrue(live.complete)
            self.assertEqual(live.detail(2)['stock'],9)
            self.assertEqual(len(calls),3)

    def test_ai_request_and_outage(self):
        captured = []
        def fake(url, **kw):
            captured.append(kw['payload'])
            return {'output':[{'content':[{'type':'output_text','text':json.dumps({'answer':'Проверенное объяснение','search_query':'027228'})}]}]}
        self.app.ai_fetch = fake
        with patch.dict(os.environ, {'OPENAI_API_KEY':'test-only-not-real'}):
            result = self.act(message='027228')
            self.assertEqual(result['answer'],'Проверенное объяснение')
            self.assertFalse(captured[0]['store'])
            self.assertIn('products', json.loads(captured[0]['input']))
            self.app.ai_fetch = lambda *a, **kw: (_ for _ in ()).throw(TimeoutError())
            result = self.act(message='027228')
            self.assertTrue(result['products']); self.assertEqual(result['status']['ai'],'unavailable')

    def test_http_secrets_blocked_and_origin_checked(self):
        http = ThreadingHTTPServer(('127.0.0.1',0),make_handler(self.app))
        thread = threading.Thread(target=http.serve_forever,daemon=True); thread.start()
        self.addCleanup(http.server_close); self.addCleanup(http.shutdown)
        base = f'http://127.0.0.1:{http.server_port}'
        for path in ('/.env','/server.py','/.runtime/cart.sqlite3','/../.env'):
            with self.assertRaises(urllib.error.HTTPError) as e: urllib.request.urlopen(base + path)
            self.assertEqual(e.exception.code,404)
        req = urllib.request.Request(base+'/api/chat',data=b'{"action":"state"}',headers={'Content-Type':'application/json','Origin':'https://evil.invalid'})
        with self.assertRaises(urllib.error.HTTPError) as e: urllib.request.urlopen(req)
        self.assertEqual(e.exception.code,403)
        req = urllib.request.Request(base+'/api/chat',data=b'{"action":"state"}',headers={'Content-Type':'application/json'})
        with urllib.request.urlopen(req) as r:
            self.assertIn('HttpOnly',r.headers['Set-Cookie']); self.assertIn("script-src 'self'",r.headers['Content-Security-Policy'])
            self.assertEqual(json.load(r)['cart'], [])

if __name__ == '__main__': unittest.main()
