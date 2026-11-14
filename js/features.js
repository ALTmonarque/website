/* =====================================================================
   features.js — 5 дополнительных функций сайта
   1. Светлая / тёмная тема   2. Поиск по сайту   3. Виджет-чат
   4. Окно «Заявка отправлена»   5. Анимации
   Подключается в <head> каждой страницы.
   ===================================================================== */

/* ---------- 1. ТЕМА: применяем сохранённую сразу, чтобы страница не мигала ---------- */
(function () {
  try {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch (e) { /* localStorage может быть недоступен */ }
})();

const ICON = {
  sun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  chat: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>'
};

document.addEventListener('DOMContentLoaded', () => {
  initNavTools();
  initChat();
  initSuccessModal();
  initAnimations();
});

/* ---------- Кнопки «тема» и «поиск» в шапке ---------- */
function initNavTools() {
  const menu = document.querySelector('.navbar-collapse');
  if (!menu) return;

  const tools = document.createElement('div');
  tools.className = 'nav-tools d-flex gap-2 ms-lg-3 mt-3 mt-lg-0';
  tools.innerHTML =
    '<button type="button" class="nav-btn" id="searchBtn" aria-label="Поиск по сайту">' + ICON.search + '</button>' +
    '<button type="button" class="nav-btn" id="themeBtn" aria-label="Переключить тему"></button>';
  menu.appendChild(tools);

  /* Тема */
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeBtn');
  const paint = () => {
    // в тёмной теме показываем солнце (нажмёшь — станет светло), в светлой — луну
    themeBtn.innerHTML = root.getAttribute('data-theme') === 'light' ? ICON.moon : ICON.sun;
  };
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    paint();
  });
  paint();

  initSearch();
}

/* ---------- 2. ПОИСК ПО САЙТУ ---------- */
const SEARCH_INDEX = [
  { t: 'Главная страница', u: 'index.html', k: 'главная баннер преимущества статистика отзывы', type: 'Страница' },
  { t: 'Каталог услуг', u: 'catalog.html', k: 'каталог услуги фильтр сортировка цена формат', type: 'Страница' },
  { t: 'О нас', u: 'about.html', k: 'о нас сервис принципы как мы работаем сомелье команда', type: 'Страница' },
  { t: 'Контакты', u: 'contacts.html', k: 'контакты телефон почта адрес карта вопросы faq обратная связь', type: 'Страница' },
  { t: 'Частная дегустация', u: 'service.html', k: 'дегустация дома выезд заявка', type: 'Услуга' },
  { t: 'Подбор вина к ужину', u: 'catalog.html', k: 'подбор вино ужин онлайн', type: 'Услуга' },
  { t: 'Дегустация для команды', u: 'catalog.html', k: 'компания корпоратив команда выезд', type: 'Услуга' },
  { t: 'Мастер-класс для пар', u: 'catalog.html', k: 'мастер-класс пара студия', type: 'Услуга' },
  { t: 'Онлайн-дегустация', u: 'catalog.html', k: 'онлайн дегустация набор образцов видеосвязь', type: 'Услуга' },
  { t: 'Консультация по коллекции', u: 'catalog.html', k: 'консультация коллекция домашняя', type: 'Услуга' },
  { t: 'Оставить заявку', u: 'service.html', k: 'заявка форма записаться заказать', type: 'Действие' },
  { t: 'Андрей Волков', u: 'about.html', k: 'сомелье андрей волков частные дегустации', type: 'Сомелье' },
  { t: 'Михаил Орлов', u: 'about.html', k: 'сомелье михаил орлов компании мероприятия', type: 'Сомелье' },
  { t: 'Игорь Беляев', u: 'about.html', k: 'сомелье игорь беляев коллекции винные карты', type: 'Сомелье' },
  { t: 'Как нас найти: карта и адрес', u: 'contacts.html', k: 'карта адрес вернадского мирэа проезд', type: 'Контакты' },
  { t: 'Частые вопросы', u: 'contacts.html', k: 'вопросы ответы faq вы продаёте вино', type: 'Контакты' }
];
const norm = (s) => s.toLowerCase().replace(/ё/g, 'е');

function initSearch() {
  const modalEl = document.createElement('div');
  modalEl.className = 'modal fade';
  modalEl.id = 'searchModal';
  modalEl.tabIndex = -1;
  modalEl.innerHTML =
    '<div class="modal-dialog modal-dialog-scrollable"><div class="modal-content">' +
    '<div class="modal-header"><input id="searchInput" class="form-control" type="search" placeholder="Поиск: услуги, сомелье, контакты" autocomplete="off">' +
    '<button type="button" class="btn-close ms-2" data-bs-dismiss="modal" aria-label="Закрыть"></button></div>' +
    '<div class="modal-body"><ul id="searchResults" class="list-unstyled mb-0"></ul></div></div></div>';
  document.body.appendChild(modalEl);

  const input = modalEl.querySelector('#searchInput');
  const list = modalEl.querySelector('#searchResults');

  function render() {
    const q = norm(input.value.trim());
    if (!q) { list.innerHTML = '<li class="search-empty">Начните вводить запрос</li>'; return; }
    const found = SEARCH_INDEX.filter((i) => norm(i.t + ' ' + i.k).includes(q));
    list.innerHTML = found.length
      ? found.map((i) => '<li><a class="search-item" href="' + i.u + '"><strong>' + i.t + '</strong><span>' + i.type + '</span></a></li>').join('')
      : '<li class="search-empty">Ничего не найдено</li>';
  }
  input.addEventListener('input', render);
  modalEl.addEventListener('shown.bs.modal', () => { input.focus(); render(); });

  document.getElementById('searchBtn').addEventListener('click', () => {
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  });
}

/* ---------- 3. ВИДЖЕТ-ЧАТ (бот отвечает по ключевым словам) ---------- */
const CHAT_RULES = [
  { k: ['привет', 'здравств', 'добрый'], a: 'Здравствуйте! Я помощник Sommelier. Спросите про услуги, цены или заявку.' },
  { k: ['услуг', 'каталог', 'что вы'], a: 'Мы проводим дегустации, подбор вина, мастер-классы и консультации. Полный список в разделе «Услуги».' },
  { k: ['цен', 'стоим', 'сколько'], a: 'Онлайн-подбор вина к ужину от 2 000 ₽, частная дегустация от 12 000 ₽, дегустация для команды от 30 000 ₽.' },
  { k: ['заяв', 'запис', 'заказ'], a: 'Оставьте заявку на странице услуги: сомелье свяжется с вами и согласует дату.' },
  { k: ['онлайн', 'видео'], a: 'Онлайн проходят подбор вина к ужину, онлайн-дегустация и консультация по коллекции.' },
  { k: ['адрес', 'где', 'находит', 'карта'], a: 'Мы находимся по адресу г. Москва, пр. Вернадского 78. Карта есть на странице «Контакты».' },
  { k: ['врем', 'работ', 'график'], a: 'Режим работы указан на странице «Контакты» и в подвале сайта.' },
  { k: ['вино продаёт', 'магазин', 'купить'], a: 'Мы не продаём вино, а оказываем услуги сомелье: консультации, дегустации и подбор.' }
];
const CHAT_QUICK = ['Какие услуги есть?', 'Сколько это стоит?', 'Как оставить заявку?', 'Где вы находитесь?'];

function initChat() {
  const wrap = document.createElement('div');
  wrap.className = 'chat';
  wrap.innerHTML =
    '<div class="chat__panel" id="chatPanel" hidden>' +
      '<div class="chat__head"><strong>Помощник Sommelier</strong><button type="button" class="chat__close" aria-label="Закрыть чат">×</button></div>' +
      '<div class="chat__body" id="chatBody"></div>' +
      '<div class="chat__quick" id="chatQuick"></div>' +
      '<form class="chat__form" id="chatForm"><input class="form-control" id="chatInput" placeholder="Ваш вопрос" autocomplete="off"><button class="btn btn-gold" type="submit">→</button></form>' +
    '</div>' +
    '<button type="button" class="chat__btn" id="chatBtn" aria-label="Открыть чат">' + ICON.chat + '</button>';
  document.body.appendChild(wrap);

  const panel = wrap.querySelector('#chatPanel');
  const body = wrap.querySelector('#chatBody');
  const input = wrap.querySelector('#chatInput');

  const add = (text, who) => {
    const m = document.createElement('div');
    m.className = 'chat__msg chat__msg--' + who;
    m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  };
  const answer = (q) => {
    const s = norm(q);
    const rule = CHAT_RULES.find((r) => r.k.some((w) => s.includes(w)));
    return rule ? rule.a : 'Пока не знаю ответа. Оставьте заявку или напишите через форму на странице «Контакты».';
  };
  const ask = (q) => {
    add(q, 'user');
    const typing = add('…', 'bot');
    typing.classList.add('chat__typing');
    setTimeout(() => { typing.classList.remove('chat__typing'); typing.textContent = answer(q); body.scrollTop = body.scrollHeight; }, 700);
  };

  CHAT_QUICK.forEach((q) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chat__chip';
    b.textContent = q;
    b.addEventListener('click', () => ask(q));
    wrap.querySelector('#chatQuick').appendChild(b);
  });

  wrap.querySelector('#chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    ask(q);
  });

  const toggle = () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      if (!body.children.length) add('Здравствуйте! Чем могу помочь?', 'bot');
      input.focus();
    }
  };
  wrap.querySelector('#chatBtn').addEventListener('click', toggle);
  wrap.querySelector('.chat__close').addEventListener('click', toggle);
}

/* ---------- 4. ОКНО «ЗАЯВКА ОТПРАВЛЕНА» ---------- */
function initSuccessModal() {
  const el = document.createElement('div');
  el.className = 'modal fade';
  el.id = 'successModal';
  el.tabIndex = -1;
  el.innerHTML =
    '<div class="modal-dialog modal-dialog-centered"><div class="modal-content text-center p-4">' +
    '<svg class="success__icon" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-17"/></svg>' +
    '<h2 class="mt-3">Заявка отправлена</h2>' +
    '<p id="successText"></p>' +
    '<button type="button" class="btn btn-gold mx-auto" data-bs-dismiss="modal">Хорошо</button>' +
    '</div></div>';
  document.body.appendChild(el);

  // эту функцию вызывает main.js после успешной проверки формы
  window.showSuccessModal = (name) => {
    document.getElementById('successText').textContent =
      (name ? 'Спасибо, ' + name + '! ' : 'Спасибо! ') + 'Сомелье свяжется с вами в ближайшее время.';
    bootstrap.Modal.getOrCreateInstance(el).show();
  };
}

/* ---------- 5. АНИМАЦИИ ---------- */
function initAnimations() {
  // (а) Появление блоков при прокрутке. Если пользователь отключил анимации в системе — пропускаем.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll(
    '.service-card, .advantage, .step, .direction, .stats .col-6, .section__title, .accordion-item, .map-frame, .review__text'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('reveal-in');
      // после показа убираем служебные классы, чтобы не мешали hover-анимации карточек
      setTimeout(() => el.classList.remove('reveal', 'reveal-in'), 700);
      io.unobserve(el);
    });
  }, { threshold: 0.12 });

  targets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}
