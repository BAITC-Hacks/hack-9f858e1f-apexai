const el = id => document.getElementById(id);
const talk = el('conversation');
let language = localStorage.getItem('ekt-language') === 'kk' ? 'kk' : 'ru';
let busy = false;
const tr = (ru, kk) => language === 'kk' ? kk : ru;
const money = n => n === null ? tr('Цена не указана', 'Бағасы көрсетілмеген') : new Intl.NumberFormat('ru-RU').format(n) + ' ₸';
function node(tag, text, className) {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (className) n.className = className;
  return n;
}
function say(text, who = 'assistant') {
  if (text) talk.append(node('div', text, 'message ' + who));
  talk.scrollTop = talk.scrollHeight;
}
function button(text, handler) {
  const b = node('button', text); b.type = 'button'; b.addEventListener('click', handler); return b;
}
function productCard(p) {
  const card = el('productTemplate').content.cloneNode(true);
  card.querySelector('h3').textContent = p.name;
  card.querySelector('.article').textContent = p.article;
  card.querySelector('.availability').textContent = p.stock === null ? tr('Остаток неизвестен', 'Қалдық белгісіз') : `${tr('В наличии', 'Қоймада')}: ${p.stock}`;
  card.querySelector('.product-meta').textContent = (p.reason ? p.reason + '\n' : '') + p.description + (p.stores?.length ? '\n' + p.stores.map(s => `${s.name}: ${s.quantity}`).join(' · ') : '') + (p.minQty > 1 ? `\nМинимальная кратность: ${p.minQty}` : '');
  card.querySelector('strong').textContent = money(p.price);
  const qty = card.querySelector('input'); qty.setAttribute('aria-label', tr('Количество: ', 'Саны: ') + p.name); qty.max = p.stock || 1; qty.min = p.minQty || 1; qty.step = p.minQty || 1; qty.value = p.minQty || 1;
  const select = card.querySelector('.select-product'); select.textContent = tr('Выбрать', 'Таңдау'); select.disabled = !p.stock || p.price === null;
  select.addEventListener('click', () => {if (qty.reportValidity()) request({action:'propose', id:p.id, qty:Number(qty.value)})});
  for (const [url, label] of [[p.url, tr('Карточка на ekt.kz', 'ekt.kz карточкасы')], [p.certificate, tr('Сертификат', 'Сертификат')]]) {
    if (!url) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || !['ekt.kz','www.ekt.kz'].includes(parsed.hostname)) continue;
      const link = node('a', label, 'source-link'); link.href = parsed.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; card.querySelector('article').append(link);
    } catch {}
  }
  talk.append(card);
}
function renderCart(cart) {
  el('cartItems').replaceChildren();
  el('cartCount').textContent = `${cart.reduce((sum, row) => sum + row.qty, 0)} ${tr('шт.', 'дана')}`;
  if (!cart.length) el('cartItems').append(node('p', tr('Пока пусто', 'Себет бос'), 'empty'));
  for (const row of cart) {
    const div = node('div', undefined, 'cart-row'); div.append(node('b', row.product.name), node('span', `${row.qty} × ${money(row.product.price)} = ${money(row.qty * row.product.price)}`));
    if (row.source === 'demo') div.append(node('span', tr('Демо-товар', 'Демо тауар')));
    div.append(button(tr('Удалить', 'Жою'), () => request({action:'remove', id:row.product.id, source:row.source}))); el('cartItems').append(div);
  }
  el('cartTotal').textContent = tr('Итого: ', 'Барлығы: ') + money(cart.reduce((sum, row) => sum + row.qty * row.product.price, 0));
  el('exportCart').hidden = !cart.length;
}
function renderPending(value) {
  el('confirmation').replaceChildren(); el('confirmation').hidden = !value;
  if (!value) return;
  el('confirmation').append(node('p', `${value.product.name}\n${value.qty} × ${money(value.product.price)}`));
  el('confirmation').append(button(tr('Да, добавь', 'Иә, қос'), () => request({action:'confirm', token:value.token})), button(tr('Отмена', 'Болдырмау'), () => request({action:'cancel'})));
}
function renderStatus(s) {
  const source = {loading:tr('Каталог загружается…','Каталог жүктелуде…'),live:tr('Каталог ekt.kz','ekt.kz каталогы'),demo:tr('ДЕМО-КАТАЛОГ','ДЕМО КАТАЛОГ'),unavailable:tr('Каталог недоступен','Каталог қолжетімсіз')}[s.source];
  el('catalogStatus').textContent = `${source} · ${s.count} ${tr('товаров','тауар')}`; el('catalogStatus').dataset.source = s.source;
  el('serviceNotice').textContent = [s.warning, s.source === 'live' && !s.complete ? tr('Загружена часть каталога.','Каталогтың бір бөлігі жүктелді.') : '', s.ai === 'off' ? tr('GPT не подключён: работает поиск по каталогу.','GPT қосылмаған: каталогтан іздеу жұмыс істейді.') : s.ai === 'unavailable' ? tr('GPT временно недоступен: работает поиск.','GPT уақытша қолжетімсіз.') : tr('OpenAI настроен.','OpenAI бапталған.')].filter(Boolean).join(' ');
}
async function request(body) {
  if (busy) return;
  busy = true; el('send').disabled = true; el('activity').textContent = tr('Проверяю…','Тексерілуде…');
  try {
    const response = await fetch('/api/chat', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body, language})});
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Ошибка сервера');
    say(data.answer);
    if (data.added) {const link = node('a', tr('Перейти в корзину →','Себетке өту →'), 'source-link');link.href = '/basket#cart';talk.append(link)}
    data.products.forEach(productCard); renderCart(data.cart); renderPending(data.pending); renderStatus(data.status); talk.scrollTop = talk.scrollHeight;
  } catch (error) { say(tr('Запрос не выполнен. Проверьте соединение и повторите.','Сұрау орындалмады. Байланысты тексеріп, қайталаңыз.'));
  } finally { busy = false; el('send').disabled = false; el('activity').textContent = ''; }
}
async function upload() {
  const input = el('attachment'); const file = input.files[0];
  if (!file) return null;
  if (file.size > 6 * 1024 * 1024) throw new Error('Файл больше 6 МБ.');
  const form = new FormData(); form.append('file', file, file.name);
  const response = await fetch('/api/upload', {method:'POST', body:form});
  const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Не удалось прикрепить файл.');
  input.value = ''; el('attachmentStatus').textContent = `✓ ${data.file.name} (${Math.ceil(data.file.size / 1024)} КБ)`;
  return data.file;
}
async function submit(text) {
  if (busy || !text.trim()) return;
  busy = true; el('send').disabled = true; el('activity').textContent = tr('Прикрепляю файл…','Файл тіркелуде…');
  try { await upload(); say(text, 'user'); el('message').value = ''; busy = false; await request({action:'chat',message:text}); }
  catch (error) { say(error.message || tr('Файл не удалось прикрепить.','Файл тіркелмеді.')); busy = false; el('send').disabled = false; el('activity').textContent = ''; }
}
el('chatForm').addEventListener('submit', event => {event.preventDefault();submit(el('message').value)});
document.querySelectorAll('[data-query]').forEach(b => b.addEventListener('click', () => submit(b.dataset.query)));
function translate() {
  document.documentElement.lang = language; document.querySelectorAll('[data-ru]').forEach(n => n.textContent = n.dataset[language]);
  el('language').textContent = language === 'ru' ? 'Қазақша' : 'Русский'; el('message').placeholder = tr('Например: добавь 2 шт 027228','Мысалы: DRX250 125А');
}
el('language').addEventListener('click', () => {if (busy) return; language = language === 'ru' ? 'kk' : 'ru';localStorage.setItem('ekt-language',language);translate();request({action:'state'})});
translate();say(tr('Здравствуйте! Найду товары и характеристики, помогу сравнить варианты. Для добавления всегда попрошу подтверждение.','Сәлем! Тауарларды және сипаттамаларын табуға көмектесемін. Себетке қосу үшін растау сұраймын.'));request({action:'state'});
const statusTimer = setInterval(async () => {
  try { const r = await fetch('/api/status'); if (r.ok) {const s = await r.json();renderStatus(s);if (s.source !== 'loading' && !s.updating) clearInterval(statusTimer)}} catch {}
}, 2000);
