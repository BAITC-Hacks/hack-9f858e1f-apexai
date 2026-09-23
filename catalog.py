"""EKT read-only adapter, explicit offline fixtures and conservative matching."""
import base64
import json
import os
import re
import ssl
import threading
import time
import urllib.request
from pathlib import Path
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parent
SYSTEM_CA_FILE = Path('/etc/ssl/cert.pem')
TLS_CONTEXT = ssl.create_default_context(cafile=str(SYSTEM_CA_FILE)) if SYSTEM_CA_FILE.exists() else ssl.create_default_context()


def request_json(url, headers=None, payload=None, timeout=8):
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout, context=TLS_CONTEXT) as response:
        return json.loads(response.read(12_000_000))


def number(value):
    if isinstance(value, dict):
        value = value.get('value', value.get('amount'))
    try:
        value = float(str(value).replace(' ', '').replace('\u00a0', '').replace(',', '.'))
        return value if value >= 0 and value < 1e12 else None
    except (ValueError, TypeError):
        return None


def safe_url(value):
    if not isinstance(value, str) or not value:
        return None
    url = urljoin('https://ekt.kz/', value)
    parsed = urlparse(url)
    return url if parsed.scheme == 'https' and parsed.hostname in ('ekt.kz', 'www.ekt.kz') else None


def plain(value):
    if isinstance(value, (dict, list)):
        value = json.dumps(value, ensure_ascii=False)
    return re.sub('<[^>]*>', '', str(value or ''))[:5000]


def normalize(raw):
    lower = {str(k).lower(): v for k, v in raw.items()}
    def get(*keys):
        return next((lower[k] for k in keys if lower.get(k) is not None), None)
    pid = get('id', 'product_id')
    if not str(pid).isdigit() or not get('name', 'title'):
        raise ValueError('Invalid product schema')
    stock = number(get('stock', 'quantity', 'available_quantity', 'count'))
    props = get('properties') or {}
    minimum = number(props.get('KRATNOST_MIN')) if isinstance(props, dict) else None
    certificate = safe_url(get('certificate', 'certificate_url'))
    if isinstance(props, dict) and not certificate:
        certificate = next((safe_url(v) for k, v in props.items() if re.search('cert|sert|серти', k, re.I) and safe_url(v)), None)
    return {
        'id': int(pid), 'name': plain(get('name', 'title')),
        'article': plain(get('article', 'sku', 'code')),
        'price': number(get('price', 'base_price')),
        'stock': int(stock) if stock is not None else None,
        'description': plain(get('description', 'spec', 'properties', 'characteristics')),
        'category': plain(get('category', 'section', 'category_name')),
        'minQty': max(1, int(minimum or 1)),
        'stores': [{'name': plain(s.get('name')), 'quantity': number(s.get('quantity'))} for s in (get('stores') or []) if isinstance(s, dict) and number(s.get('quantity'))],
        'url': safe_url(get('url', 'detail_page_url', 'link')),
        'certificate': certificate,
    }


def rows_and_pages(data):
    if isinstance(data, list):
        return data, None
    if not isinstance(data, dict):
        raise ValueError('Invalid catalog schema')
    rows = next((data[k] for k in ('products', 'items', 'data', 'results') if k in data), None)
    if isinstance(rows, dict):
        return rows_and_pages(rows)
    if not isinstance(rows, list):
        raise ValueError('No product list in API response')
    meta = data.get('pagination', data.get('meta', data))
    pages = meta.get('total_pages', meta.get('last_page', meta.get('pages'))) if isinstance(meta, dict) else None
    return rows, int(pages) if str(pages).isdigit() else None


def tokens(text):
    text = text.lower().replace('ё', 'е')
    for src, dst in [('вт', 'w'), ('лм', 'lm'), ('кa', 'ka'), ('а', 'a'), ('к', 'k')]:
        text = re.sub(r'(?<=\d)' + src + r'\b', dst, text)
    return re.findall(r'[\w]+', text)


STOP = set('есть ли мне нужен нужна нужно надо покажи найди товар товары пожалуйста аналог аналоги подбери добавь добавить корзину в на и можно штуки штук шт дана бар ма керек тауар себетке қос'.split())
STOP.update('какие какая сколько стоит цена наличие характеристики характеристика технические техническая информация информация описание параметры сертификат сертификаты про по у есть'.split())


STOP.update('add to cart please find show me the a an is in stock available product products pcs pieces units'.split())

def search(products, query):
    terms = [t for t in tokens(re.sub(r'[-+]?\d+(?:[.,]\d+)?\s*(?:штук\w*|шт\.?|дана|pcs|pieces|units)\b', '', query, flags=re.I)) if t not in STOP]
    if not terms:
        return []
    ranked = []
    for p in products:
        pt = tokens(p['name'] + ' ' + p['article'] + ' ' + p['description'])
        exact = p['article'].lower() in query.lower() if p['article'] else False
        matches = []
        for t in terms:
            matches.append(any(t == v or (len(t) >= 4 and not any(c.isdigit() for c in t) and v.startswith(t)) for v in pt))
        # Every requested technical number must match; 125A must not select 160A.
        numeric_ok = all(m for t, m in zip(terms, matches) if any(c.isdigit() for c in t))
        if exact or (numeric_ok and all(matches)):
            ranked.append((1000 if exact else sum(matches), p))
    return [p for _, p in sorted(ranked, key=lambda x: -x[0])][:8]


def family(p):
    text = (p['name'] + ' ' + p['description'] + ' ' + p['category']).lower()
    if re.search(r'светильник|led|light', text):
        return 'light'
    if re.search(r'выключатель|drx|breaker', text):
        return 'breaker'
    return p['category'] or None


def specs(p):
    return set(re.findall(r'\d+(?:[.,]\d+)?(?:w|lm|k|a|ka|в|v)|ip\d+', ' '.join(tokens(p['name'] + ' ' + p['description'])), re.I))


def alternatives(products, original, allow_unknown=False):
    result = []
    for p in products:
        if p['id'] == original['id'] or (not p['stock'] and not (allow_unknown and p['stock'] is None)) or not family(original) or family(p) != family(original):
            continue
        a = specs({**original, 'description': ''}) if allow_unknown else specs(original)
        b = specs(p)
        # Never present an incompatible electrical rating as a replacement.
        if not a or not a.issubset(b):
            continue
        result.append({**p, 'reason': 'Совпадают параметры: ' + ', '.join(sorted(a)) + '. Проверьте размеры, монтаж и совместимость; это кандидат, не гарантированная замена.'})
    return result[:12 if allow_unknown else 3]


class Catalog:
    def __init__(self, mode=None, fetch=request_json):
        self.mode = mode or os.getenv('EKT_MODE', 'auto')
        self.fetch = fetch
        self.products = []
        self.source = 'loading'
        self.error = None
        self.complete = False
        self.updated = None
        self.lock = threading.RLock()
        self.refresh_lock = threading.Lock()

    def api(self, path):
        user, password = os.getenv('EKT_USER', ''), os.getenv('EKT_PASSWORD', '')
        if not user or not password:
            raise ValueError('EKT credentials missing')
        token = base64.b64encode((user + ':' + password).encode()).decode()
        return self.fetch('https://ekt.kz/api/' + path, headers={'Authorization': 'Basic ' + token, 'Accept': 'application/json'})

    def refresh(self):
        if not self.refresh_lock.acquire(blocking=False):
            return
        try:
            if self.mode == 'demo':
                raise RuntimeError('Demo mode selected')
            collected = {}
            complete = False
            for page in range(1, 101):
                rows, total = rows_and_pages(self.api('products' + (f'?page={page}' if page > 1 else '')))
                if not rows:
                    complete = True
                    break
                normalized = [normalize(row) for row in rows]
                new = [p for p in normalized if p['id'] not in collected]
                if not new:
                    break
                collected.update((p['id'], p) for p in new)
                with self.lock:
                    self.products = list(collected.values())
                    self.source, self.error = 'live', None
                    self.updated = int(time.time())
                if total is not None and page >= total:
                    complete = True
                    break
            if not collected:
                raise ValueError('Empty catalog')
            with self.lock:
                self.products = list(collected.values())
                self.source, self.error, self.complete = 'live', None, complete
                self.updated = int(time.time())
        except Exception:
            with self.lock:
                if self.source == 'live':
                    self.error = 'Обновление недоступно; каталог может быть устаревшим.'
                elif self.mode in ('auto', 'demo'):
                    self.products = [normalize(p) for p in json.loads((ROOT / 'data/demo.json').read_text())]
                    self.source, self.complete = 'demo', False
                    self.error = 'Демонстрационные данные. API ekt.kz недоступен.' if self.mode != 'demo' else 'Демонстрационные данные, не текущие цены и остатки ekt.kz.'
                else:
                    self.source, self.error = 'unavailable', 'Каталог ekt.kz недоступен. Повторите позже.'
        finally:
            self.refresh_lock.release()

    def status(self):
        with self.lock:
            return {'source': self.source, 'count': len(self.products), 'complete': self.complete, 'updated': self.updated, 'updating': self.refresh_lock.locked(), 'warning': self.error}

    def all(self):
        with self.lock:
            return list(self.products)

    def detail(self, pid):
        if self.source == 'live':
            raw = self.api(f'products/detail?id={int(pid)}')
            if isinstance(raw, dict) and 'data' in raw:
                raw = raw['data']
            product = normalize(raw)
            if product['id'] != int(pid):
                raise ValueError('Wrong product from API')
            with self.lock:
                self.products = [product if p['id'] == product['id'] else p for p in self.products]
            return product
        if self.source != 'demo':
            raise ValueError('Catalog unavailable')
        return next(p for p in self.all() if p['id'] == int(pid))

