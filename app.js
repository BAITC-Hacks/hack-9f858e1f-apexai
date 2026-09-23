const el = id => document.getElementById(id);
const talk = el('conversation');
const languageNames = {ru:'Русский', kk:'Қазақша', en:'English'};
let language = Object.hasOwn(languageNames, localStorage.getItem('ekt-language')) ? localStorage.getItem('ekt-language') : 'ru';
const english = {"\nРеальные условия уточняются у ekt.kz перед покупкой.": "\nActual conditions should be confirmed with ekt.kz before purchase.", " шт.": " pcs.", " шт. Укажите кратное количество.": " pcs. Please specify a multiple quantity.", " шт. по ": " pcs. at ", " шт., в корзине ": " pcs., in cart ", " ₸ в локальную корзину? Подтвердите кнопкой или фразой «Да, добавь».": " ₸ to local cart? Confirm with button or phrase “Yes, add”.", ". Можно добавить ещё ": ". You can add ", "AI-консультант": "AI assistant", "API не сообщил цену или остаток. Добавление недоступно до уточнения.": "API did not provide price or stock. Adding unavailable until clarified.", "GPT временно недоступен: работает поиск.": "GPT temporarily unavailable: searching now.", "GPT не подключён: работает поиск по каталогу.": "GPT not connected: searching catalog.", "OpenAI настроен.": "OpenAI configured.", "OpenAI-ключ не настроен. Голосовой запрос пока недоступен.": "OpenAI key not set. Voice requests unavailable for now.", "Браузер не поддерживает запись голоса.": "Browser does not support voice recording.", "В загруженной части каталога пока нет точного совпадения. Расскажите, для какой задачи нужен товар и какие характеристики важны. Если есть название или код, их тоже можно прислать.": "No exact match in loaded catalog part yet. Tell us your task and important specs. If you have a name or code, you can send them too.", "В наличии": "In stock", "В предоставленном API нет условий доставки, оплаты и минимального заказа. Уточните их у ekt.kz; сроки и стоимость не подтверждены.": "Provided API lacks delivery, payment, and minimum order terms. Confirm with ekt.kz; timing and cost unconfirmed.", "ВАШ ЛИЧНЫЙ КОНСУЛЬТАНТ": "YOUR PERSONAL ASSISTANT", "Всё начинается с выбора.": "Everything starts with selection.", "Вы можете смотреть каталог Казахстана. Доставку в другую страну нужно уточнить у EKT.": "You can browse Kazakhstan catalog. For delivery abroad please check with EKT.", "Выберите страну и удобный язык общения.": "Select country and preferred language.", "Выбрать": "Select", "Голосовая запись должна быть от 1 байта до 10 МБ.": "Voice recording must be between 1 byte and 10 MB.", "Голосовой запрос": "Voice request", "ДЕМО-КАТАЛОГ": "DEMO CATALOG", "ДЕМОНСТРАЦИОННЫЕ УСЛОВИЯ — не правила ekt.kz.\n": "DEMONSTRATION TERMS — not ekt.kz rules.\n", "Да, добавь": "Yes, add", "Демо-товар": "Demo product", "Для ваших больших идей.": "For your big ideas.", "Добавить «": "Add «", "Добавление отменено.": "Addition cancelled.", "Добавление отменено. Корзина не изменена.": "Addition cancelled. Cart unchanged.", "Добавлено в корзину прототипа. Список сохранён. На ekt.kz заказ ещё не создан.": "Added to prototype cart. List saved. Order not yet created on ekt.kz.", "Добро пожаловать": "Welcome", "Доступно ": "Available: ", "Другая страна": "Other country", "Загружена часть каталога.": "Catalog part loaded.", "Запись не получилась. Попробуйте ещё раз.": "Recording failed. Please try again.", "Запрос не выполнен. Проверьте соединение и повторите.": "Request failed. Check connection and retry.", "Здравствуйте! Я ваш консультант EKT. Что подбираем сегодня — освещение, кабель, розетки? Расскажите о своей задаче, и я помогу с выбором.": "Hello! I’m your EKT assistant. What are we selecting today—lighting, cable, sockets? Tell me your task, I’ll help choose.", "Идёт запись — нажмите квадрат, когда закончите.": "Recording — press stop square when finished.", "Исходный товар: ": "Original product: ", "Итого: ": "Total: ", "КАЖДАЯ ДЕТАЛЬ ВАЖНА": "EVERY DETAIL MATTERS", "Казахстан": "Kazakhstan", "Карточка на ekt.kz": "Card on ekt.kz", "Карточка сейчас недоступна. Ниже данные списка; цену и остаток перепроверим перед добавлением.": "Card currently unavailable. Below is list data; price and stock will be rechecked before adding.", "Каталог ekt.kz": "ekt.kz Catalog", "Каталог Казахстана. Цены указаны в тенге.": "Kazakhstan catalog. Prices shown in tenge.", "Каталог загружается или недоступен. Повторите запрос после обновления статуса.": "Catalog loading or unavailable. Retry after status update.", "Каталог загружается…": "Loading catalog…", "Каталог недоступен": "Catalog unavailable", "Количество: ": "Quantity: ", "Консультант": "Consultant", "Контакты": "Contacts", "Кыргызстан": "Kyrgyzstan", "МЫ НА СВЯЗИ": "WE'RE ONLINE", "Минимальная кратность товара — ": "Minimum order multiple — ", "Минимальная кратность: ": "Minimum order multiple: ", "Можно прикрепить не больше 5 файлов за одну сессию.": "You can attach up to 5 files per session.", "Можно прикрепить только PDF, Word, Excel или JPEG.": "Only PDF, Word, Excel, or JPEG allowed.", "Можно приложить PDF, Word, Excel или JPEG до 6 МБ. Не загружайте платёжные данные. Товар добавляется только после подтверждения.": "Attach PDF, Word, Excel, or JPEG up to 6 MB. Don’t upload payment info. Product adds only after confirmation.", "Моя корзина": "My cart", "Найди товар по прикреплённому фото": "Find product by attached photo", "Найдём то, что нужно.": "Let’s find what you need.", "Найти аналог": "Find analog", "Найти своё решение.": "Find your solution.", "Найти товар по фото": "Find product by photo", "Написать в WhatsApp": "Write in WhatsApp", "Нашлось несколько товаров. Выберите конкретный товар кнопкой.": "Multiple products found. Please select one with a button.", "Не удалось перепроверить остаток. Корзина не изменена.": "Failed to recheck stock. Cart unchanged.", "Не удалось подготовить файл. Проверьте OpenAI-ключ и прикрепите файл заново.": "Failed to prepare file. Check OpenAI key and reattach file.", "Не удалось получить текущий остаток. Попробуйте позже.": "Failed to get current stock. Try later.", "Не удалось проанализировать файл. Попробуйте ещё раз или укажите артикул текстом.": "Failed to analyze file. Try again or provide article number in text.", "Не удалось проверить товар и остаток. Корзина не изменена.": "Failed to check product and stock. Cart unchanged.", "Не удалось распознать голос.": "Voice not recognized.", "Не удалось распознать голос. Попробуйте ещё раз или напишите запрос.": "Voice not recognized. Try again or type your request.", "Не удалось распознать фото. Проверьте, что OpenAI-ключ добавлен, или напишите артикул с фотографии.": "Photo unrecognized. Check OpenAI key is added or type article from photo.", "Нет актуального предложения для подтверждения.": "No current offer for confirmation.", "Ниже кандидаты по совпадающим параметрам; совместимость нужно проверить.": "Below are candidates matching parameters; compatibility must be verified.", "Нужен доступ к микрофону. Разрешите его в браузере и повторите.": "Microphone access needed. Allow it in browser and try again.", "Остались вопросы?": "Any questions?", "Остаток изменился или недостаточен. Корзина не изменена; выберите товар заново.": "Stock changed or insufficient. Cart unchanged; please reselect product.", "Остаток неизвестен": "Stock unknown", "Открыть ekt.kz ↗": "Open ekt.kz ↗", "Отмена": "Cancel", "Отправить": "Send", "Официальные контакты и все филиалы ↗": "Official contacts and branches ↗", "Оқасы жоқ! Таңдауға көмек керек болса, осындамын.": "No problem! Here if you need help choosing.", "Перейти в корзину →": "Go to cart →", "Пн–Пт 09:00–18:00 · Сб 09:00–13:00": "Mon–Fri 09:00–18:00 · Sat 09:00–13:00", "Пн–Пт 09:00–18:00 · Сб 09:00–13:00. Обед 13:00–14:00.": "Mon–Fri 09:00–18:00 · Sat 09:00–13:00. Lunch 13:00–14:00.", "Подбор товаров": "Product selection", "Подбор электротехники": "Electrical selection", "Поддерживаются WebM, MP3, M4A, WAV или MP4.": "Supports WebM, MP3, M4A, WAV or MP4.", "Подобрать электротехнику": "Select electrical products", "Подтверждённых аналогов в загруженном каталоге нет.": "No confirmed analogs in loaded catalog.", "Пожалуйста! Если понадобится помощь с выбором, я рядом.": "You’re welcome! If you need help choosing, I'm here.", "Пока пусто": "Empty for now", "Помогу подобрать электротехнику": "I’ll help select electrical products", "Предложение устарело. Выберите товар заново.": "Offer expired. Please select product again.", "Прикрепите один файл.": "Attach one file.", "Прикрепите одну голосовую запись.": "Attach one voice recording.", "Прикрепить PDF, Word, Excel или JPEG": "Attach PDF, Word, Excel, or JPEG", "Прикрепляю файл…": "Attaching file…", "Проанализировать документ": "Analyze document", "Проверить наличие": "Check availability", "Проверьте распознанный текст и нажмите «Отправить».": "Check recognized text and click “Send”.", "Проверяю…": "Checking…", "Продолжить": "Continue", "Разделы": "Sections", "Размер файла должен быть от 1 байта до 6 МБ.": "File size must be 1 byte to 6 MB.", "Распознаю голос…": "Recognizing voice…", "Расскажите, что хотите подобрать…": "Tell me what you want to select…", "СВЕТ И ФОРМА": "LIGHT AND FORM", "Свяжитесь с командой EKT по вопросам товаров, заказа и доставки.": "Contact EKT team for product, order, and delivery questions.", "Сертификат": "Certificate", "Скачать список CSV": "Download CSV list", "Сначала прикрепите PDF, Word или Excel-файл.": "Attach PDF, Word, or Excel file first.", "Сообщение": "Message", "Страна": "Country", "Таджикистан": "Tajikistan", "Товар удалён из локальной корзины.": "Product removed from local cart.", "Туркменистан": "Turkmenistan", "Удалить": "Delete", "Узбекистан": "Uzbekistan", "Укажите положительное целое количество.": "Enter a positive whole number.", "Условия покупки": "Purchase terms", "Файл больше 6 МБ.": "File exceeds 6 MB.", "Файл не удалось прикрепить.": "File attachment failed.", "Характеристики, наличие и сравнение товаров": "Product specs, availability and comparison", "Цена не указана": "Price not specified", "Чат с помощником": "Chat with assistant", "Чтобы ничего не забыть:": "To remember everything:", "ЭНЕРГИЯ В ДЕТАЛЯХ": "ENERGY IN DETAILS", "Это локальный список покупок. Он сохраняется в этом браузере, но не передаётся в корзину ekt.kz и не создаёт заказ.": "This is a local shopping list. It’s saved in this browser but not sent to ekt.kz cart and does not create an order.", "Это только вопросы-подсказки. В корзину ничего не добавится.": "These are just prompt questions. Nothing will be added to the cart.", "Язык": "Language", "Язык / Тіл": "Language", "товаров": "products", "ул. Жетиген, 28": "Zhetigen St., 28", "ул. Кудерина, 47Б": "Kuderina St., 47B", "шт.": "pcs", "Здравствуйте! Я помогу подобрать электротехнику. Расскажите, что хотите сделать: например, выбрать освещение для комнаты или розетки для ремонта. Для какого помещения или задачи ищете товар?": "Hello! I can help you choose electrical supplies. What are you working on — lighting a room or choosing sockets for a renovation? Tell me about your project.", "Найдены товары. Укажите количество в карточке и нажмите «Выбрать».": "Products found. Enter a quantity on the product card and click Select."};
let latestState = null;
let busy = false;
const tr = (ru, kk) => language === 'en' ? (english[ru] ?? ru) : language === 'kk' ? kk : ru;
const money = n => n === null ? tr('Цена не указана', 'Бағасы көрсетілмеген') : new Intl.NumberFormat(language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU').format(n) + ' ₸';
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
  card.querySelector('.product-meta').textContent = (p.reason ? p.reason + '\n' : '') + p.description + (p.stores?.length ? '\n' + p.stores.map(s => `${s.name}: ${s.quantity}`).join(' · ') : '') + (p.minQty > 1 ? `\n${tr('Минимальная кратность: ','Ең аз еселік: ')}${p.minQty}` : '');
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
function renderCompanions(items) {
  if (!items?.length) return;
  const card = node('div', undefined, 'companion-card');
  card.append(node('b', tr('Чтобы ничего не забыть:', 'Ештеңені ұмытпау үшін:')));
  card.append(node('p', tr('Это только вопросы-подсказки. В корзину ничего не добавится.', 'Бұл тек сұрақ-кеңестер. Себетке ештеңе қосылмайды.')));
  const actions = node('div', undefined, 'companion-actions');
  items.forEach(item => actions.append(button(item.label, () => submit(item.message))));
  card.append(actions); talk.append(card);
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
    latestState = data;
    say(data.answer);
    if (data.added) {const link = node('a', tr('Перейти в корзину →','Себетке өту →'), 'source-link');link.href = '/basket#cart';talk.append(link)}
    data.products.forEach(productCard); renderCompanions(data.companions); renderCart(data.cart); renderPending(data.pending); renderStatus(data.status); talk.scrollTop = talk.scrollHeight;
  } catch (error) { say(tr('Запрос не выполнен. Проверьте соединение и повторите.','Сұрау орындалмады. Байланысты тексеріп, қайталаңыз.'));
  } finally { busy = false; el('send').disabled = false; el('activity').textContent = ''; }
}
async function upload() {
  const input = el('attachment'); const file = input.files[0];
  if (!file) return null;
  if (file.size > 6 * 1024 * 1024) throw new Error(tr('Файл больше 6 МБ.','Файл 6 МБ-тан үлкен.'));
  const form = new FormData(); form.append('file', file, file.name);
  const response = await fetch('/api/upload', {method:'POST', body:form});
  const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Не удалось прикрепить файл.');
  input.value = ''; el('attachmentStatus').textContent = `✓ ${data.file.name} (${Math.ceil(data.file.size / 1024)} КБ)`;
  el('analyzePhoto').hidden = data.file.type !== 'image/jpeg';
  el('analyzeDocument').hidden = data.file.type === 'image/jpeg';
  return data.file;
}
async function submit(text) {
  if (busy || !text.trim()) return;
  busy = true; el('send').disabled = true; el('activity').textContent = tr('Прикрепляю файл…','Файл тіркелуде…');
  try { await upload(); say(text, 'user'); el('message').value = ''; busy = false; await request({action:'chat',message:text}); }
  catch (error) { say(error.message || tr('Файл не удалось прикрепить.','Файл тіркелмеді.')); busy = false; el('send').disabled = false; el('activity').textContent = ''; }
}
el('chatForm').addEventListener('submit', event => {event.preventDefault();submit(el('message').value)});
el('analyzePhoto').addEventListener('click', () => {el('analyzePhoto').hidden = true; submit(tr('Найди товар по прикреплённому фото','Тіркелген фотодан тауарды тап'))});
el('analyzeDocument').addEventListener('click', () => {el('analyzeDocument').hidden = true; request({action:'analyze_document'})});
let recorder;
async function recordVoice() {
  const control = el('record'); const status = el('voiceStatus');
  if (recorder?.state === 'recording') { recorder.stop(); return; }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { status.textContent = tr('Браузер не поддерживает запись голоса.', 'Браузер дауыстық жазбаны қолдамайды.'); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:true}); const chunks = [];
    const options = MediaRecorder.isTypeSupported('audio/webm') ? {mimeType:'audio/webm'} : undefined;
    recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop()); control.classList.remove('recording'); control.textContent = '🎙'; control.disabled = true;
      const audio = new Blob(chunks, {type:recorder.mimeType || 'audio/webm'});
      if (!audio.size) { status.textContent = tr('Запись не получилась. Попробуйте ещё раз.', 'Жазба шықпады. Қайталап көріңіз.'); control.disabled = false; return; }
      status.textContent = tr('Распознаю голос…', 'Дауысты тануда…');
      try {
        const form = new FormData(); form.append('audio', audio, 'voice.webm');
        const response = await fetch('/api/transcribe', {method:'POST', body:form}); const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Не удалось распознать голос.');
        el('message').value = data.text; status.textContent = tr('Проверьте распознанный текст и нажмите «Отправить».', 'Танылған мәтінді тексеріп, «Жіберу» түймесін басыңыз.'); el('message').focus();
      } catch (error) { status.textContent = error.message || tr('Не удалось распознать голос.', 'Дауысты тану мүмкін болмады.'); }
      finally { control.disabled = false; }
    };
    recorder.start(); control.classList.add('recording'); control.textContent = '■'; status.textContent = tr('Идёт запись — нажмите квадрат, когда закончите.', 'Жазба жүріп жатыр — аяқтағанда шаршыны басыңыз.');
  } catch { status.textContent = tr('Нужен доступ к микрофону. Разрешите его в браузере и повторите.', 'Микрофонға рұқсат беріп, қайталап көріңіз.'); }
}
el('record').addEventListener('click', recordVoice);
document.querySelectorAll('[data-query]').forEach(b => b.addEventListener('click', () => submit(b.dataset.query)));
function translate() {
  document.documentElement.lang = language; document.querySelectorAll('[data-ru]').forEach(n => n.textContent = n.dataset[language] || n.dataset.ru);
  updateRegionLabel();
  for (const [id, ru, kk] of [['message','Сообщение','Хабарлама'],['send','Отправить','Жіберу'],['record','Голосовой запрос','Дауыстық сұрау']]) el(id).setAttribute('aria-label',tr(ru,kk));
  if (latestState) { renderCart(latestState.cart); renderPending(latestState.pending); renderStatus(latestState.status); }
  el('language').textContent = languageNames[language]; el('message').placeholder = tr('Расскажите, что хотите подобрать…','Не таңдағыңыз келетінін айтыңыз…');
}
el('language').addEventListener('click', () => { if (!busy) openPreferences(); });
function updateRegionLabel() {
  const country = localStorage.getItem('ekt-country') || 'KZ';
  el('regionSettings').textContent = (Array.from(el('countryChoice').options).find(option => option.value === country)?.textContent || tr('Другая страна','Басқа ел')) + ' · ' + languageNames[language];
}
function regionNote() {
  el('regionNote').textContent = el('countryChoice').value === 'KZ'
    ? tr('Каталог Казахстана. Цены указаны в тенге.','Қазақстан каталогы. Бағалар теңгемен көрсетілген.')
    : tr('Вы можете смотреть каталог Казахстана. Доставку в другую страну нужно уточнить у EKT.','Қазақстан каталогын қарай аласыз. Басқа елге жеткізуді EKT компаниясынан нақтылау қажет.');
}
function greetVisitor() { say(tr('Здравствуйте! Я ваш консультант EKT. Что подбираем сегодня — освещение, кабель, розетки? Расскажите о своей задаче, и я помогу с выбором.','Сәлеметсіз бе! Мен EKT кеңесшісімін. Бүгін не таңдаймыз — жарық, кабель немесе розетка? Қандай жұмысқа керек екенін айтыңыз, таңдауға көмектесемін.')); }
function openPreferences() {
  el('countryChoice').value = localStorage.getItem('ekt-country') || 'KZ';
  el('languageChoice').value = language;
  regionNote(); el('welcomeDialog').showModal();
}
el('regionSettings').addEventListener('click',openPreferences);
el('countryChoice').addEventListener('change',regionNote);
el('languageChoice').addEventListener('change',()=>{ language=el('languageChoice').value; translate(); regionNote(); });
el('welcomeForm').addEventListener('submit',event=>{
  event.preventDefault();
  localStorage.setItem('ekt-country',el('countryChoice').value);
  localStorage.setItem('ekt-language',language);
  localStorage.setItem('ekt-welcome-done','1');
  translate(); el('welcomeDialog').close();
  if (!talk.children.length) greetVisitor();
  request({action:'state'});
});
el('welcomeDialog').addEventListener('cancel',()=>{if (!talk.children.length) greetVisitor();});
translate();
if (localStorage.getItem('ekt-welcome-done') === '1') greetVisitor(); else openPreferences();
request({action:'state'});
const statusTimer = setInterval(async () => {
  try { const r = await fetch('/api/status'); if (r.ok) {const s = await r.json();renderStatus(s);if (s.source !== 'loading' && !s.updating) clearInterval(statusTimer)}} catch {}
}, 2000);



