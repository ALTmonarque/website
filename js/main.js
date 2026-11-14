/*  1. Кнопка «Наверх» */
const toTop = document.getElementById('toTop');
if (toTop) {
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('show', window.scrollY > 400);
  });
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
 
/*Проверка форм */
document.querySelectorAll('form[data-validate]').forEach((form) => {
  const dateInput = form.querySelector('[name="date"]');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0]; // нельзя выбрать прошлое
  }
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
 
    form.querySelectorAll('[required]').forEach((field) => {
      let valid = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
 
      if (valid && field.name === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      }
      if (valid && field.name === 'phone') {
        valid = field.value.replace(/\D/g, '').length >= 10;
      }
      if (valid && field.name === 'date') {
        valid = field.value >= field.min;
      }
      if (valid && field.name === 'guests') {
        valid = field.value >= 1 && field.value <= 50;
      }
 
      field.classList.toggle('is-invalid', !valid);
      if (!valid) ok = false;
    });
 
    const alertBox = form.querySelector('#formAlert');
    if (ok && alertBox) {
      alertBox.classList.remove('d-none');
      const nameField = form.querySelector('[name="name"]');
      if (window.showSuccessModal) window.showSuccessModal(nameField ? nameField.value.trim() : '');
      form.reset();
      calcPrice();
    }
  });
});
 
/* Расчёт стоимости: + 1500 ₽ за каждого */
function calcPrice() {
  const service = document.getElementById('service');
  const guests = document.getElementById('guests');
  const total = document.getElementById('totalPrice');
  if (!service || !guests || !total) return;
 
  const base = Number(service.value);
  const count = Math.max(Number(guests.value) || 1, 1);
  const extra = Math.max(count - 2, 0) * 1500;
  total.textContent = (base + extra).toLocaleString('ru-RU');
}
['service', 'guests'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', calcPrice);
});
 
/*  Каталог: фильтры и сортировка  */
const grid = document.getElementById('catalogGrid');
if (grid) {
  const cards = Array.from(grid.children);
  const ids = ['fFormat', 'fPrice', 'fDuration', 'fSort'];
 
  const inPrice = (p, r) => r === 'all' || (r === 'low' && p < 5000) ||
    (r === 'mid' && p >= 5000 && p <= 15000) || (r === 'high' && p > 15000);
  const inDuration = (d, r) => r === 'all' || (r === 'short' && d <= 60) ||
    (r === 'medium' && d > 60 && d <= 120) || (r === 'long' && d > 120);
 
  function updateCatalog() {
    const [format, price, duration, sort] = ids.map((id) => document.getElementById(id).value);
    let shown = cards.filter((c) =>
      (format === 'all' || c.dataset.format === format) &&
      inPrice(Number(c.dataset.price), price) &&
      inDuration(Number(c.dataset.duration), duration)
    );
 
    if (sort === 'priceAsc') shown.sort((a, b) => a.dataset.price - b.dataset.price);
    if (sort === 'priceDesc') shown.sort((a, b) => b.dataset.price - a.dataset.price);
    if (sort === 'durAsc') shown.sort((a, b) => a.dataset.duration - b.dataset.duration);
 
    cards.forEach((c) => c.classList.add('d-none'));
    shown.forEach((c) => { c.classList.remove('d-none'); grid.appendChild(c); });
    document.getElementById('emptyMsg').classList.toggle('d-none', shown.length > 0);
  }
  ids.forEach((id) => document.getElementById(id).addEventListener('change', updateCatalog));
}
 
/*  Модальное окно: */
const modal = document.getElementById('serviceModal');
if (modal) {
  modal.addEventListener('show.bs.modal', (e) => {
    const btn = e.relatedTarget;
    document.getElementById('modalTitle').textContent = btn.dataset.title;
    document.getElementById('modalDesc').textContent = btn.dataset.desc;
  });
}
 