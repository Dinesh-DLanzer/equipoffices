document.documentElement.classList.add('js');

(() => {
  const grid = document.getElementById('product-grid');
  const products = [...grid.querySelectorAll('.product')];
  const chips = [...document.querySelectorAll('[data-chip]')];
  const results = document.getElementById('results');
  const empty = document.getElementById('empty');
  const search = document.getElementById('search');
  const toastEl = document.getElementById('toast');

  const labels = {
    all: 'all', laptops: 'Laptops', desktops: 'Desktops', processors: 'Processors',
    graphics: 'Graphics Cards', monitors: 'Monitors', storage: 'Storage & Memory',
    networking: 'Networking', accessories: 'Accessories',
  };
  const state = { cat: 'all', q: '' };

  /* ---------- Filtering & search ---------- */
  function apply() {
    const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    products.forEach((p) => {
      const inCat = state.cat === 'all' || p.dataset.cat === state.cat;
      const hay = p.dataset.search + ' ' + p.textContent.toLowerCase();
      const ok = inCat && terms.every((t) => hay.includes(t));
      p.hidden = !ok;
      if (ok) shown++;
    });
    const filtered = state.cat !== 'all' || terms.length > 0;
    grid.classList.toggle('is-filtered', filtered);
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.chip === state.cat)));
    document.querySelectorAll('.catnav [data-filter]').forEach((a) =>
      a.classList.toggle('is-active', a.dataset.filter === state.cat));
    empty.hidden = shown > 0;

    const where = state.cat === 'all' ? '' : ` in ${labels[state.cat]}`;
    const match = terms.length ? ` matching “${state.q.trim()}”` : '';
    results.textContent = filtered
      ? `${shown} featured product${shown === 1 ? '' : 's'}${where}${match}`
      : 'Showing all 9 featured products';
  }

  chips.forEach((c) => c.addEventListener('click', () => { state.cat = c.dataset.chip; apply(); }));

  // Category tiles, header nav, footer links and promo CTA all set the filter, then the anchor scrolls.
  document.querySelectorAll('[data-filter]').forEach((el) =>
    el.addEventListener('click', () => {
      state.cat = el.dataset.filter;
      state.q = '';
      search.value = '';
      apply();
    }));

  search.addEventListener('input', () => { state.q = search.value; apply(); });
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.q = search.value;
    apply();
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }
  document.querySelectorAll('[data-toast]').forEach((el) =>
    el.addEventListener('click', () => toast(el.dataset.toast)));

  /* ---------- Cart (demo) ---------- */
  const cart = { count: 0, total: 0 };
  const countEl = document.getElementById('cart-count');
  const aed = (n) => 'AED ' + n.toLocaleString('en-US');
  const plus = '<svg aria-hidden="true"><use href="#i-plus"/></svg>';
  const check = '<svg aria-hidden="true"><use href="#i-check"/></svg>';

  document.querySelectorAll('.add').forEach((btn) =>
    btn.addEventListener('click', () => {
      cart.count++;
      cart.total += Number(btn.dataset.price);
      countEl.hidden = false;
      countEl.textContent = cart.count;
      countEl.classList.remove('bump');
      void countEl.offsetWidth;
      countEl.classList.add('bump');
      btn.classList.add('is-added');
      btn.innerHTML = check;
      setTimeout(() => { btn.classList.remove('is-added'); btn.innerHTML = plus; }, 1400);
      toast(`Added to cart: ${btn.dataset.name}`);
    }));

  document.getElementById('cart-btn').addEventListener('click', () => {
    toast(cart.count
      ? `${cart.count} item${cart.count === 1 ? '' : 's'} in your cart, ${aed(cart.total)}. Checkout is off in this demo.`
      : 'Your cart is empty.');
  });

  /* ---------- Sticky header lifts once scrolled ---------- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 48);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Entrances: heading, then text, then picture ---------- */
  document.querySelectorAll('section, .hero').forEach((sec) =>
    sec.querySelectorAll('[data-reveal]').forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8))));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

    const promo = document.querySelector('.promo');
    new IntersectionObserver(([e]) => promo.classList.toggle('in-view', e.isIntersecting), { threshold: 0.25 }).observe(promo);
  } else {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in'));
  }
})();
