/* ============ При обновлении страница всегда открывается с первого блока ============ */
(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const reload = nav ? nav.type === 'reload' || nav.type === 'back_forward' : false;
  const toTop = () => {
    // переход по ссылке на блок (page.html#lead) оставляем; при обновлении – всегда наверх
    let el = null; try { el = location.hash && document.querySelector(decodeURIComponent(location.hash)); } catch (e) {}
    if (!reload && el && !/^#modal-/.test(location.hash)) return;
    window.scrollTo(0, 0);
  };
  toTop();
  addEventListener('DOMContentLoaded', toTop);
  addEventListener('load', () => { toTop(); setTimeout(toTop, 50); });
  addEventListener('pageshow', (e) => { if (e.persisted) window.scrollTo(0, 0); });
})();

/* ============ Стабильная высота экрана: во встроенном браузере Telegram/Instagram высота окна
   скачет, когда прячется панель, – из-за этого дёргались кубики и колоды. Берём высоту один раз
   и обновляем только при смене ширины/повороте (на компьютере – при любом ресайзе). ============ */
(() => {
  const coarse = matchMedia('(pointer: coarse)').matches;
  let w = innerWidth, h = innerHeight;
  const set = () => document.documentElement.style.setProperty('--svh', h + 'px');
  set();
  addEventListener('resize', () => {
    if (!coarse || innerWidth !== w) { w = innerWidth; h = innerHeight; set(); }
  });
  addEventListener('orientationchange', () => setTimeout(() => { w = innerWidth; h = innerHeight; set(); }, 350));
  window.SVH = () => h;
})();

/* ============ Телефон с кодом страны, как в WhatsApp: код можно стереть и набрать свой (+374, +1, +49 …) –
   флаг меняется, номер проверяется по длине для этой страны. Неверный номер – подсказка, отправить нельзя ============ */
(() => {
  // код, ISO (имя файла флага), допустимые длины номера без кода
  const C = [
    ['7', 'ru', [10]], ['374', 'am', [8]], ['375', 'by', [9]], ['380', 'ua', [9]], ['998', 'uz', [9]], ['996', 'kg', [9]],
    ['994', 'az', [9]], ['995', 'ge', [9]], ['992', 'tj', [9]], ['993', 'tm', [8]], ['373', 'md', [8]], ['1', 'us', [10]],
    ['44', 'gb', [10]], ['49', 'de', [10, 11]], ['33', 'fr', [9]], ['39', 'it', [9, 10]], ['34', 'es', [9]], ['351', 'pt', [9]],
    ['31', 'nl', [9]], ['32', 'be', [8, 9]], ['41', 'ch', [9]], ['43', 'at', [10, 11, 12, 13]], ['48', 'pl', [9]], ['420', 'cz', [9]],
    ['371', 'lv', [8]], ['370', 'lt', [8]], ['372', 'ee', [7, 8]], ['358', 'fi', [9, 10]], ['46', 'se', [9]], ['47', 'no', [8]],
    ['45', 'dk', [8]], ['90', 'tr', [10]], ['971', 'ae', [9]], ['972', 'il', [9]], ['357', 'cy', [8]], ['30', 'gr', [10]],
    ['66', 'th', [9]], ['62', 'id', [9, 10, 11, 12]], ['84', 'vn', [9]], ['86', 'cn', [11]], ['91', 'in', [10]], ['82', 'kr', [9, 10]],
    ['81', 'jp', [10]], ['65', 'sg', [8]], ['976', 'mn', [8]], ['381', 'rs', [8, 9]], ['382', 'me', [8]], ['359', 'bg', [8, 9]],
    ['36', 'hu', [9]], ['40', 'ro', [9]], ['966', 'sa', [9]], ['974', 'qa', [8]], ['20', 'eg', [10]], ['212', 'ma', [9]],
    ['61', 'au', [9]], ['52', 'mx', [10]], ['55', 'br', [10, 11]], ['54', 'ar', [10]],
  ].sort((x, y) => y[0].length - x[0].length);
  const FL = 'assets/img/flags/';
  const ccOf = (inp) => { const l = inp.closest('.form__phone'); const c = l && l.querySelector('.form__cc'); return c ? c.value.replace(/\D/g, '') : '7'; };
  const country = (cc, d) => {
    const m = C.find((x) => cc === x[0]);
    if (!m) return null;
    if (cc === '7') return d && /^[67]/.test(d) ? ['7', 'kz', [10]] : m;   // +7 6xx / 7xx – Казахстан
    return m;
  };
  const digits = (inp) => {
    let d = inp.value.replace(/\D/g, '');
    if (ccOf(inp) === '7' && d.length === 11 && /^[78]/.test(d)) d = d.slice(1);   // вставили номер с 8 или 7 в начале
    return d;
  };
  const fmt = (d, cc) => {
    if (cc === '7' && d.length <= 10) {
      let r = '';
      if (d.length) r = '(' + d.slice(0, 3);
      if (d.length > 3) r += ') ' + d.slice(3, 6);
      if (d.length > 6) r += '-' + d.slice(6, 8);
      if (d.length > 8) r += '-' + d.slice(8, 10);
      return r;
    }
    return d.replace(/(\d{3})(?=\d)/g, '$1 ');
  };
  const maxLen = (inp) => { const c = country(ccOf(inp), digits(inp)); return c ? Math.max(...c[2]) : 12; };
  const ok = (inp) => {
    const cc = ccOf(inp), d = digits(inp), c = country(cc, d);
    if (!cc) return false;
    if (!c) return d.length >= 6 && d.length <= 12;          // страна не из списка – разумная длина
    if (cc === '7' && c[1] === 'ru' && !/^[3489]/.test(d)) return false;
    return c[2].includes(d.length);
  };
  window.gpPhoneOk = ok;
  const box = (inp) => inp.closest('.form__phone') || inp;
  const hint = (inp, show) => {
    const b = box(inp);
    let h = b.nextElementSibling && b.nextElementSibling.classList.contains('form__err') ? b.nextElementSibling : null;
    b.classList.toggle('is-error', show);
    if (show && !h) { h = document.createElement('p'); h.className = 'form__err'; h.setAttribute('role', 'alert'); h.textContent = 'Введите верный номер телефона'; b.after(h); }
    if (!show && h) h.remove();
  };
  window.gpPhoneHint = hint;
  const setFlag = (label) => {
    const inp = label.querySelector('input[name="phone"]'), cc = ccOf(inp), c = country(cc, digits(inp));
    const img = label.querySelector('.flag img');
    if (img) { if (c) img.src = FL + c[1] + '.svg'; img.hidden = !c; }
    label.querySelector('.flag').classList.toggle('flag--none', !c);
  };
  const enhance = (label) => {
    if (label.dataset.cc) return;
    label.dataset.cc = '1';
    const inp = label.querySelector('input[name="phone"]');
    if (!inp) return;
    const flag = label.querySelector('.flag'), code = flag && flag.nextElementSibling;
    if (flag) { flag.classList.add('flag--img'); flag.innerHTML = '<img src="' + FL + 'ru.svg" alt="">'; }
    const cc = document.createElement('input');
    cc.className = 'form__cc'; cc.type = 'tel'; cc.name = 'phone_cc'; cc.value = '+7'; cc.setAttribute('aria-label', 'Код страны'); cc.autocomplete = 'tel-country-code'; cc.maxLength = 5;
    if (code && code.tagName === 'SPAN') code.replaceWith(cc); else inp.before(cc);
    inp.autocomplete = 'tel-national';
    fitCc(cc);
    cc.addEventListener('input', () => fitCc(cc));
  };
  // поле кода страны по ширине цифр: «Телефон» начинается в 2 px от последней цифры
  const ccCanvas = document.createElement('canvas').getContext('2d');
  const fitCc = (cc) => {
    const st = getComputedStyle(cc);
    ccCanvas.font = `${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
    cc.style.width = Math.ceil(ccCanvas.measureText(cc.value || '+').width) + 1 + 'px';
  };
  if (document.fonts) document.fonts.ready.then(() => document.querySelectorAll('.form__cc').forEach(fitCc));
  const check = (inp, live) => {
    const d = digits(inp);
    const f = fmt(d, ccOf(inp));
    if (inp.value !== f) inp.value = f;
    setFlag(box(inp));
    if (live) hint(inp, d.length > maxLen(inp) || (d.length === maxLen(inp) && !ok(inp)));   // лишние цифры – ошибка сразу
    else hint(inp, inp.value.trim() !== '' && !ok(inp));
  };
  const all = () => document.querySelectorAll('.form__phone').forEach(enhance);
  all();
  new MutationObserver(all).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.classList.contains('form__cc')) {
      t.value = '+' + t.value.replace(/\D/g, '').slice(0, 4);
      fitCc(t);
      const inp = box(t).querySelector('input[name="phone"]');
      if (inp) check(inp, true);
      t.closest('form') && t.closest('form').dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    if (t.name === 'phone') check(t, true);
  }, true);
  document.addEventListener('blur', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.name === 'phone') check(t, false);
    if (t.classList.contains('form__cc')) { if (t.value === '+') t.value = '+7'; fitCc(t); const inp = box(t).querySelector('input[name="phone"]'); if (inp && inp.value) check(inp, false); else if (inp) setFlag(box(t)); }
  }, true);
})();

(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, from, len) => clamp((p - from) / len);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ Лоадер ============
     1) логотип + имя  2) логотип исчезает  3) имя, а следом фамилия переворачиваются кубиком вверх
     4) шторка: левая половина уезжает вверх, следом правая */
  const loader = document.getElementById('loader');
  // на внутренних страницах лоадера нет
  // быстрая заставка на всех страницах: логотип сразу, шторка уходит, как только загрузились шрифты и картинки
  // (не раньше 0,5 с и не позже 2 с) — сайт за это время успевает подгрузиться
  if (loader) {
    const add = (cls) => loader.classList.add(...cls.split(' '));
    loader.classList.add('loader--fast');
    requestAnimationFrame(() => add('s-logo'));
    let opened = false;
    const open = () => {
      if (opened) return; opened = true;
      add('s-name s-flip');
      setTimeout(() => { add('s-open'); setTimeout(() => document.body.classList.remove('is-loading'), 150); }, reduced ? 0 : 300);
      setTimeout(() => add('is-done'), reduced ? 400 : 1200);
    };
    const t0 = performance.now();
    const ready = Promise.all([
      new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true }))),
      document.fonts ? document.fonts.ready : Promise.resolve(),
    ]);
    ready.then(() => setTimeout(open, Math.max(0, 500 - (performance.now() - t0))));
    setTimeout(open, 2000);
  }

  /* ============ Кнопки-шторки: два слоя с одинаковым содержимым ============ */
  function wipify(btn) {
    const html = btn.innerHTML;
    btn.innerHTML = `<span class="btn__wipe"><span class="btn__face btn__face--front">${html}</span>` +
      `<span class="btn__face btn__face--back" aria-hidden="true">${html}</span></span>`;
    btn.classList.add('is-wipe');
    // обратная анимация (слой возвращается снизу) включается только после первого наведения
    btn.addEventListener('mouseenter', () => btn.classList.add('was-hovered'));
    btn.addEventListener('focus', () => btn.classList.add('was-hovered'));
  }
  const setBtnText = (btn, text) => btn.querySelectorAll('.btn__face').forEach((f) => { f.textContent = text; });
  document.querySelectorAll('.btn').forEach(wipify);

  /* ============ Шапка: закреплена, при скролле получает фон ============ */
  const header = document.getElementById('header');
  const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 20);

  /* ============ Меню ============ */
  const menu = document.getElementById('menu');
  const menuOpenBtn = document.getElementById('menuOpen');
  menu.querySelectorAll('.mm__label, .mm__tab, .menu__foot').forEach((el, i) => el.style.setProperty('--i', i));
  const mmItems = [...menu.querySelectorAll('.mm__item')];
  const isMobileMenu = () => matchMedia('(max-width: 760px)').matches;
  // десктоп: активный пункт слева показывает своё подменю и карточку
  function mmActivate(item) {
    mmItems.forEach((it) => {
      it.classList.toggle('is-active', it === item);
      it.querySelector('button.mm__tab')?.setAttribute('aria-expanded', it === item);
    });
  }
  // мобилка: аккордеон, раскрыт максимум один пункт
  function mmToggle(item) {
    const open = !item.classList.contains('is-open');
    mmItems.forEach((it) => {
      it.classList.toggle('is-open', open && it === item);
      it.querySelector('button.mm__tab')?.setAttribute('aria-expanded', open && it === item);
    });
  }
  let mmTimer;
  mmItems.forEach((item) => {
    const tab = item.querySelector('.mm__tab');
    // небольшая задержка, чтобы меню не мигало, когда курсор проходит мимо пунктов
    tab.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || isMobileMenu()) return;
      clearTimeout(mmTimer);
      mmTimer = setTimeout(() => mmActivate(item), 120);
    });
    tab.addEventListener('pointerleave', () => clearTimeout(mmTimer));
    tab.addEventListener('focus', () => { if (!isMobileMenu()) mmActivate(item); });
    if (tab.tagName === 'BUTTON') tab.addEventListener('click', () => (isMobileMenu() ? mmToggle(item) : mmActivate(item)));
  });
  function setMenu(open) {
    if (open) { mmActivate(mmItems[0]); mmItems.forEach((it) => it.classList.remove('is-open')); }
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', !open);
    menuOpenBtn.setAttribute('aria-expanded', open);
    document.body.classList.toggle('menu-open', open);
  }
  menuOpenBtn.addEventListener('click', () => setMenu(true));
  document.getElementById('menuClose').addEventListener('click', () => setMenu(false));
  document.getElementById('menuX').addEventListener('click', () => setMenu(false));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ============ Появление блоков ============ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 0.08}s`;
    io.observe(el);
  });

  /* ============ Заявки: кнопка неактивна, пока не заполнены имя, телефон и не стоит галочка;
     после отправки вместо формы – экран «Спасибо» (макет 867:14835) ============ */
  const formReady = (form) => {
    const name = form.querySelector('[name="name"]');
    const phone = form.querySelector('[name="phone"]');
    const consent = form.querySelector('.consent input');
    const nameOk = !name || name.value.trim().length > 1;
    const phoneOk = !phone || window.gpPhoneOk(phone);
    const consentOk = !consent || consent.checked;
    return nameOk && phoneOk && consentOk;
  };
  document.querySelectorAll('form.form').forEach((form) => {
    const btn = form.querySelector('.form__submit');
    if (!btn) return;
    const sync = () => { btn.disabled = !formReady(form); };
    form.addEventListener('input', sync);
    form.addEventListener('change', sync);
    sync();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!formReady(form)) return;
      const h = form.offsetHeight;
      form.style.minHeight = h + 'px';
      const done = document.createElement('div');
      done.className = 'form__done';
      done.setAttribute('role', 'status');
      done.innerHTML = '<img class="form__done-ic" src="assets/img/3d/success.png" alt=""><h3 class="form__done-title">Спасибо! Заявка отправлена</h3><p class="form__done-text">Свяжемся в рабочее время: Пн–Пт, 9:00–18:00. Если удобнее, напишите нам сами, ответим за 15 минут.</p>';
      form.appendChild(done);
      form.classList.add('is-done');
    });
  });

  /* ============ Подвал: старт анимации надписи и падающих иконок, когда подвал виден ============ */
  document.querySelectorAll('.fx__big--v3').forEach((big) => {
    const items = [...big.querySelectorAll('.fx__ic')];
    const order = items.map((_, i) => i).sort(() => Math.random() - 0.5);
    items.forEach((ic, i) => {
      const d = (order[i] * 0.14).toFixed(2) + 's';
      const dx = ((i % 2 ? 1 : -1) * (1 + i * 0.4)).toFixed(2) + 'vw';
      const spin = ((i % 2 ? 1 : -1) * (200 + i * 70)) + 'deg';
      [ic, ic.nextElementSibling].forEach((el) => {
        if (!el) return;
        el.style.setProperty('--d', d);
        el.style.setProperty('--dx', dx);
        el.style.setProperty('--spin', el === ic ? spin : '0deg');
      });
    });
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) big.classList.add('is-in');
      else if (e.boundingClientRect.top > 0) big.classList.remove('is-in');
    }, { threshold: 0.25 }).observe(big);
  });

  // блоки ниже есть только на главной; на внутренних страницах шапке нужен только фон при скролле
  if (!document.getElementById('logosTrack')) {
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();
  } else (() => {
  /* ============ Бегущая строка: дублируем набор логотипов ============ */
  const track = document.getElementById('logosTrack');
  const set = track.querySelector('.logos__set');
  const logosBox = track.parentElement;
  const MARQUEE_SPEED = 40; // px в секунду
  let setW = 0, shift = 0, speed = 1, target = 1, lastT = 0;
  // копий столько, чтобы лента всегда перекрывала экран с запасом на одну копию
  function fillMarquee() {
    setW = set.getBoundingClientRect().width;
    if (!setW) return;
    const need = Math.ceil(logosBox.offsetWidth / setW) + 1;
    while (track.children.length < need) track.appendChild(set.cloneNode(true)).setAttribute('aria-hidden', 'true');
  }
  function marqueeLoop(t) {
    const dt = lastT ? Math.min(t - lastT, 64) : 0;
    lastT = t;
    speed += (target - speed) * Math.min(dt / 250, 1); // плавная остановка и разгон при наведении
    if (setW) {
      shift = (shift + MARQUEE_SPEED * speed * dt / 1000) % setW;
      track.style.transform = `translate3d(${-shift}px, 0, 0)`;
    }
    requestAnimationFrame(marqueeLoop);
  }
  set.querySelectorAll('img').forEach((img) => img.complete || img.addEventListener('load', fillMarquee));
  fillMarquee();
  window.addEventListener('resize', fillMarquee);
  logosBox.addEventListener('mouseenter', () => { target = 0; });
  logosBox.addEventListener('mouseleave', () => { target = 1; });
  if (!reduced) requestAnimationFrame(marqueeLoop);

  /* ============ Скролл-сцены ============ */
  const DESIGN_W = 1440, DESIGN_H = 900, LINE_GAP = 369.5;

  function makeScene(section) {
    const stage = section.querySelector('.scene__stage');
    return {
      section, stage,
      lineC: stage.querySelector('.scene__line--c'),
      lineL: stage.querySelector('.scene__line--l'),
      lineR: stage.querySelector('.scene__line--r'),
      titleL: stage.querySelector('.scene__title--l'),
      titleR: stage.querySelector('.scene__title--r'),
      note: stage.querySelector('.scene__note') || document.createElement('p'),   // подписи под кубиком может не быть
      s: 1, mobile: false,
    };
  }
  const trust = makeScene(document.getElementById('trust'));
  const pricing = makeScene(document.getElementById('pricing'));
  const scenes = [trust, pricing];

  const phoneMQ = matchMedia('(max-width: 760px)');
  let phone = phoneMQ.matches;
  function layoutScenes() {
    const vw = window.innerWidth, vh = window.SVH();
    phone = phoneMQ.matches;
    scenes.forEach((sc) => {
      sc.mobile = vw < 900;
      sc.s = sc.mobile ? Math.min(vw / 780, vh / DESIGN_H) : Math.min(vw / DESIGN_W, vh / DESIGN_H);
      sc.stage.style.setProperty('--s', sc.s);
      sc.vh = vh;
      sc.wl = sc.titleL.offsetWidth;
      sc.wr = sc.titleR.offsetWidth;
    });
    // На телефоне тариф крупнее (внутри линий), подпись – ниже карточки
    const tf = pricing.stage.querySelector('.tariffs');
    if (phone) {
      // телефон: глобус статичный по ширине экрана, тарифы – кубик со стрелками
      trust.s = vw / 720;
      trust.stage.style.setProperty('--s', trust.s);
      tf.style.transform = '';
      pricing.note.style.top = '';
      // мерим естественную высоту карточек (без растяжения на всю высоту кубика)
      const cards = [...tf.querySelectorAll('.tariff')];
      cards.forEach((t) => { t.style.position = 'relative'; t.style.inset = 'auto'; t.querySelector('.tariff__top').style.flex = 'none'; });
      const hMax = Math.max(...cards.map((t) => t.offsetHeight));
      cards.forEach((t) => { t.style.position = ''; t.style.inset = ''; t.querySelector('.tariff__top').style.flex = ''; });
      tf.style.height = hMax + 'px';
      return;
    }
    tf.style.height = '';
    const k = pricing.mobile ? Math.min(1.5, (vw - 32) / (431 * pricing.s)) : 1;
    tf.style.transform = `scale(${k})`;
    pricing.note.style.top = pricing.mobile ? `${450 + 249 * k + 40}px` : '';
  }

  function progressOf(section) {
    const r = section.getBoundingClientRect();
    const total = section.offsetHeight - window.SVH();
    return clamp(-r.top / total);
  }

  // Общая часть: одна линия раздваивается, заголовки уезжают в стороны
  function applySplit(sc, a, lineBottom) {
    const off = LINE_GAP * a;
    sc.lineL.style.opacity = sc.lineR.style.opacity = a > 0.001 ? 1 : 0;
    sc.lineL.style.transform = `translateX(${-off}px)`;
    sc.lineR.style.transform = `translateX(${off}px)`;
    const h = 600 + lineBottom;
    sc.lineL.style.height = sc.lineR.style.height = `${h}px`;

    const initL = 706 - sc.wl / 2, initR = 734 + sc.wr / 2;
    let dxL, dxR, dyL = 0, dyR = 0, k = 1;
    if (sc.mobile) {
      const topVis = 450 - sc.vh / (2 * sc.s);
      dxL = 720 - initL; dxR = 720 - initR;
      dyL = topVis + 70 / sc.s - 450;
      dyR = dyL + 34 / sc.s;
      k = lerp(1, Math.max(1, 0.62 / sc.s), a);
    } else {
      dxL = 175 - initL; dxR = 1265 - initR;
    }
    sc.titleL.style.transform = `translate(${dxL * a}px, calc(-50% + ${dyL * a}px)) scale(${k})`;
    sc.titleR.style.transform = `translate(${dxR * a}px, calc(-50% + ${dyR * a}px)) scale(${k})`;
  }

  /* --- Сцена «Нам доверяют»: глобус ---
     По ТЗ: сетка проявляется 0,8 с → лучи прорисовываются от Москвы по очереди (шаг 0,06 с)
     → город появляется вслед за своим лучом (fade + сдвиг 8 px) → точка Москвы пульсирует 2 с.
     Дополнительно города медленно вращаются вокруг Москвы по эллипсу глобуса, лучи – за ними. */
  const HUB = { x: 369.16, y: 430.1 };       // координаты Москвы в системе карты 738×900
  const ORBIT = { a: 341, b: 170.5 };         // полуоси эллипса глобуса
  // [город, конец луча x, y, подпись x, y, крупный?, яркость луча]
  const CITIES = [
    ['Париж', 163.74, 361.9, 89.58, 349.8, 1, 0.32],
    ['Санкт-Петербург', 341.06, 290.29, 164.9, 278.19, 1, 0.32],
    ['Кипр', 252.4, 498.3, 195.24, 486.2, 1, 0.32],
    ['Берлин', 210, 345.6, 139.68, 336.25, 0, 0.18],
    ['Тбилиси', 451.82, 484.66, 457.66, 476.06, 0, 0.18],
    ['Махачкала', 485.92, 406.23, 491.76, 397.63, 0, 0.18],
    ['Дубай', 513.2, 535.81, 519.04, 523.71, 1, 0.32],
    ['Абу-Даби', 397.26, 559.68, 403.1, 551.08, 0, 0.18],
    ['Астана', 554.12, 358.49, 559.96, 349.89, 0, 0.18],
    ['Алматы', 601.86, 440.33, 607.7, 428.23, 1, 0.32],
    ['Улан-Удэ', 629.14, 344.85, 634.98, 336.25, 0, 0.18],
    ['Бали', 635.96, 501.71, 641.8, 489.61, 1, 0.32],
  ];
  const SVGNS = 'http://www.w3.org/2000/svg';
  const raysG = document.getElementById('globeRays');
  const citiesBox = document.getElementById('globeCities');
  const globe = {
    grid: trust.stage.querySelector('.globe__grid'),
    glow: trust.stage.querySelector('.globe__glow'),
    hub: trust.stage.querySelector('.globe__hub'),
    moscow: trust.stage.querySelector('.globe__moscow'),
    meridians: document.getElementById('globeMeridians'),
    started: null,
  };
  const cities = CITIES.map(([name, ex, ey, lx, ly, big, rayOp]) => {
    const u = (ex - HUB.x) / ORBIT.a, v = (ey - HUB.y) / ORBIT.b;
    const line = document.createElementNS(SVGNS, 'line');
    line.setAttribute('x1', HUB.x); line.setAttribute('y1', HUB.y);
    line.setAttribute('stroke-opacity', rayOp);
    raysG.appendChild(line);
    const label = document.createElement('span');
    label.className = 'city' + (big ? ' city--big' : '');
    label.textContent = name;
    citiesBox.appendChild(label);
    return { line, label, r: Math.hypot(u, v), ang: Math.atan2(v, u), offX: lx - ex, offY: ly - ey };
  });

  // Меридианы: эллипсы, ширина которых меняется по синусу – выглядит как вращение сферы
  const MERIDIANS = 6;
  const merEls = Array.from({ length: MERIDIANS }, () => {
    const e = document.createElementNS(SVGNS, 'ellipse');
    e.setAttribute('cx', 350); e.setAttribute('cy', 175.5); e.setAttribute('ry', 170.5);
    globe.meridians.appendChild(e);
    return e;
  });
  let trustP = 0, globeVisible = false;
  const GRID_T = 800, RAY_STEP = 60, RAY_T = 550, CITY_T = 450, ORBIT_SPEED = 0.00006; // мс и рад/мс

  function drawGlobe(time) {
    const phase = time * 0.00018 + trustP * 1.6;
    merEls.forEach((e, i) => {
      const ang = phase + (i * Math.PI) / MERIDIANS;
      e.setAttribute('rx', Math.abs(Math.sin(ang)) * 341);
      e.setAttribute('stroke-opacity', (Math.cos(ang) > 0 ? 0.13 : 0.05).toFixed(3));
    });

    const t = globe.started === null ? -1 : time - globe.started;
    globe.grid.style.opacity = t < 0 ? 0 : ease(clamp(t / GRID_T));
    const hub = t < 0 ? 0 : clamp(t / 400);
    globe.glow.style.opacity = globe.hub.style.opacity = globe.moscow.style.opacity = hub;

    const turn = time * ORBIT_SPEED;
    cities.forEach((c, i) => {
      const ang = c.ang + turn;
      const ex = HUB.x + ORBIT.a * c.r * Math.cos(ang);
      const ey = HUB.y + ORBIT.b * c.r * Math.sin(ang);
      const start = GRID_T * 0.6 + i * RAY_STEP;
      const ray = t < 0 ? 0 : ease(clamp((t - start) / RAY_T));
      c.line.setAttribute('x2', HUB.x + (ex - HUB.x) * ray);
      c.line.setAttribute('y2', HUB.y + (ey - HUB.y) * ray);
      const show = t < 0 ? 0 : ease(clamp((t - start - RAY_T * 0.7) / CITY_T));
      // дальняя (верхняя) часть орбиты – чуть бледнее, так читается объём
      const depth = 0.75 + 0.25 * clamp((Math.sin(ang) + 1) / 1.2);
      c.label.style.opacity = show * depth;
      c.label.style.transform = `translate(${ex + c.offX}px, ${ey + c.offY + (1 - show) * 8}px)`;
    });
  }
  function globeLoop(time) {
    if (globeVisible) drawGlobe(time);
    requestAnimationFrame(globeLoop);
  }
  requestAnimationFrame(globeLoop);

  function updateTrust() {
    const r = trust.section.getBoundingClientRect();
    globeVisible = r.bottom > 0 && r.top < window.innerHeight;
    if (phone) {
      // без раскрытия по скроллу: глобус проигрывается, когда блок попал в экран
      trustP = 0;
      if (globeVisible && globe.started === null && r.top < window.innerHeight * 0.7) globe.started = performance.now();
      return;
    }
    const p = progressOf(trust.section);
    trustP = p;

    const a = ease(seg(p, 0.02, 0.22));
    const note = ease(seg(p, 0.72, 0.14));
    applySplit(trust, a, lerp(1500, 760, note));

    // запуск анимации глобуса, когда линии разошлись; при прокрутке назад – сброс, чтобы проиграть заново
    if (p > 0.18 && globe.started === null) globe.started = performance.now();
    if (p < 0.06) globe.started = null;

    trust.note.style.opacity = note;
    trust.note.style.transform = `translateY(${(1 - note) * 16}px)`;
  }

  /* --- Сцена «Форматы и стоимость»: тарифы по очереди ---
     Белая подложка общая, меняется только содержимое: старое мягко гаснет и уходит вверх,
     новое проявляется снизу; переходы растянуты по скроллу и сглажены CSS-transition. */
  const tariffsBox = pricing.stage.querySelector('.tariffs');
  const tariffs = [...tariffsBox.querySelectorAll('.tariff')];
  const smooth = (t) => t * t * (3 - 2 * t);
  let tariffIdx = 0;
  const tariffNav = document.getElementById('tariffNav');
  function renderTariffsPhone() {
    const half = tariffsBox.offsetWidth / 2;
    tariffs.forEach((t, j) => {
      const o = clamp(tariffIdx - j, -1, 1);
      t.style.opacity = Math.abs(tariffIdx - j) <= 1 ? 1 : 0;
      t.style.transform = `translateZ(${-half}px) rotateY(${-o * 90}deg) translateZ(${half}px)`;
      t.style.filter = `brightness(${1 - Math.abs(o) * 0.35})`;
      t.style.zIndex = j === tariffIdx ? 10 : 0;
      t.style.pointerEvents = j === tariffIdx ? 'auto' : 'none';
    });
    tariffNav.querySelector('b').textContent = tariffIdx + 1;
    tariffNav.querySelectorAll('.tariff-nav__dots i').forEach((d, j) => d.classList.toggle('is-on', j === tariffIdx));
    tariffNav.querySelector('[data-d="-1"]').disabled = tariffIdx === 0;
    tariffNav.querySelector('[data-d="1"]').disabled = tariffIdx === tariffs.length - 1;
  }
  tariffNav.addEventListener('click', (e) => {
    const b = e.target.closest('[data-d]');
    if (!b) return;
    tariffIdx = clamp(tariffIdx + Number(b.dataset.d), 0, tariffs.length - 1);
    renderTariffsPhone();
  });
  // свайп по кубику
  let sx = null;
  tariffsBox.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  tariffsBox.addEventListener('touchend', (e) => {
    if (sx === null || !phone) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) < 40) return;
    tariffIdx = clamp(tariffIdx + (dx < 0 ? 1 : -1), 0, tariffs.length - 1);
    renderTariffsPhone();
  });
  function updatePricing() {
    if (phone) { renderTariffsPhone(); return; }
    const p = progressOf(pricing.section);
    const a = ease(seg(p, 0.02, 0.14));
    const appear = ease(seg(p, 0.13, 0.12));
    applySplit(pricing, a, lerp(1500, 760, appear));
    pricing.note.style.opacity = appear;
    pricing.lineC.style.opacity = 1 - appear; // центральная линия уходит, когда появляется тариф

    // k: 1 – первый тариф, 2 – второй, 3 – третий; дробная часть – момент поворота кубика
    const k = 1 + smooth(seg(p, 0.38, 0.16)) + smooth(seg(p, 0.66, 0.16));
    const half = tariffsBox.offsetWidth / 2;
    tariffs.forEach((t, j) => {
      const o = clamp(k - (j + 1), -1, 1); // -1 грань справа, 0 смотрит на нас, 1 ушла влево
      const shown = Math.abs(o) < 1;
      const lift = j === 0 ? (1 - appear) * 24 : 0;
      t.style.opacity = shown ? (j === 0 ? appear : 1) : 0;
      t.style.transform = `translateY(${lift}px) translateZ(${-half}px) rotateY(${-o * 90}deg) translateZ(${half}px)`;
      t.style.filter = `brightness(${1 - Math.abs(o) * 0.35})`;
      t.style.zIndex = shown ? Math.round((1 - Math.abs(o)) * 10) : 0;
      t.style.pointerEvents = Math.abs(o) < 0.5 && appear > 0.6 ? 'auto' : 'none';
    });
  }

  /* --- Три части работы: экран закреплён, карточки по очереди прилетают снизу
     и ложатся сверху на предыдущую, нижние чуть уменьшаются и темнеют --- */
  const deck = document.getElementById('process');
  const deckCards = [...deck.querySelectorAll('.dcardx')];
  function updateDeck() {
    if (deck.classList.contains('deck--static')) {
      // статичная колода: каждая следующая карточка при скролле наезжает на предыдущую примерно на 20 px
      if (reduced || window.innerWidth <= 1100) return;
      const vh = window.innerHeight;
      deckCards.forEach((c, i) => {
        if (!i) return;
        const r = c.getBoundingClientRect();
        const p = clamp((vh - (r.top - c._dy || 0)) / (vh * 0.7));
        const dy = 60 - 80 * ease(p); // от +60 до -20
        c._dy = dy;
        c.style.translate = `0 ${dy}px`;
        const ic = c.nextElementSibling;
        if (ic && ic.classList.contains('deck__3d')) ic.style.translate = `0 ${dy}px`;
      });
      return;
    }
    if (reduced) return;
    const p = progressOf(deck);
    const land = deckCards.map((_, i) => (i === 0 ? 1 : ease(seg(p, 0.06 + (i - 1) * 0.36, 0.26))));   // первая карточка видна сразу вместе с заголовком
    deckCards.forEach((c, i) => {
      const v = land[i];
      const above = land.slice(i + 1).reduce((s, x) => s + x, 0); // сколько карточек уже легло сверху
      const y = (1 - v) * window.SVH() * 0.9 + i * 14 - above * 10;
      const rot = `calc(var(--r) * var(--rk, 1) + ${(1 - v) * 14}deg)`;
      c.style.transform = `translate(-50%, calc(-50% + ${y}px)) rotate(${rot}) scale(${1 - above * 0.04})`;
      c.style.opacity = i === 0 ? 1 : clamp(v * 3);
      c.style.filter = `brightness(${1 - above * 0.18})`;
      const ic = c.querySelector('.dcardx__3d'); // 3D-иконка видна только у верхней карточки
      if (ic) ic.style.opacity = clamp(1 - above);
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      syncHeader();
      updateTrust();
      updateDeck();
      updatePricing();
      ticking = false;
    });
  }
  function onResize() { layoutScenes(); onScroll(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  document.fonts && document.fonts.ready.then(onResize);
  onResize();
  drawGlobe(0);

  /* ============ 6 шагов подбора ============
     У открытого шага сверху бежит полоска-прогресс; дошла до конца – открывается следующий.
     Клик по шагу открывает его и запускает прогресс заново. Пока блок не на экране – пауза. */
  const stepsList = document.getElementById('stepsList');
  const stepEls = [...stepsList.querySelectorAll('.step')];
  const stepPhotos = [...document.querySelectorAll('#stepsMedia img')];
  const stepThumbs = [...document.querySelectorAll('#stepsThumb img')];
  function openStep(step) {
    stepEls.forEach((s) => s.classList.remove('is-open'));
    void step.offsetWidth; // перезапуск CSS-анимации полоски
    step.classList.add('is-open');
    const i = stepEls.indexOf(step);
    stepPhotos.forEach((img, j) => img.classList.toggle('is-active', j === i));
    stepThumbs.forEach((img, j) => img.classList.toggle('is-active', j === (i + 1) % stepEls.length));
  }
  stepsList.addEventListener('click', (e) => {
    const head = e.target.closest('.step__head');
    if (head) openStep(head.parentElement);
  });
  stepEls.forEach((step, i) => step.querySelector('.step__bar').addEventListener('animationend', () => {
    if (step.classList.contains('is-open')) openStep(stepEls[(i + 1) % stepEls.length]);
  }));
  // на телефоне высота списка шагов фиксируется по самому высокому шагу – при авто-переключении
  // страница под блоком больше не прыгает (рывки при прокрутке, особенно в Telegram)
  const lockSteps = () => {
    stepsList.style.minHeight = '';
    if (!matchMedia('(max-width: 760px)').matches) return;
    const cur = stepEls.find((s) => s.classList.contains('is-open'));
    stepsList.classList.add('is-measure');
    let max = 0;
    stepEls.forEach((s) => { stepEls.forEach((x) => x.classList.toggle('is-open', x === s)); max = Math.max(max, stepsList.offsetHeight); });
    stepEls.forEach((x) => x.classList.toggle('is-open', x === cur));
    void stepsList.offsetHeight;
    stepsList.classList.remove('is-measure');
    stepsList.style.minHeight = max + 'px';
  };
  lockSteps();
  let lw = innerWidth;
  addEventListener('resize', () => { if (innerWidth !== lw) { lw = innerWidth; lockSteps(); } });
  document.fonts && document.fonts.ready.then(lockSteps);
  stepsList.classList.add('is-paused');
  new IntersectionObserver(([e]) => stepsList.classList.toggle('is-paused', !e.isIntersecting), { threshold: 0.35 })
    .observe(stepsList);

  /* ============ Кейсы: фильтр ============ */
  const filters = document.getElementById('caseFilters');
  if (filters) filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter');
    if (!btn) return;
    filters.querySelectorAll('.filter').forEach((b) => b.classList.toggle('is-active', b === btn));
    const f = btn.dataset.f;
    document.querySelectorAll('#casesGrid .case').forEach((c) => {
      c.classList.toggle('is-hidden', f !== 'all' && c.dataset.cat !== f);
    });
  });

  /* ============ Вопросы: фильтр по направлениям ============ */
  const faqFilters = document.getElementById('faqFilters');
  faqFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    faqFilters.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === btn));
    const f = btn.dataset.f;
    document.querySelectorAll('#faq .qa').forEach((q) => { q.hidden = f !== 'all' && q.dataset.cat !== f; });
    // на телефоне выбранный таб переезжает в начало ленты
    if (window.matchMedia('(max-width: 760px)').matches) {
      faqFilters.prepend(btn);
      faqFilters.scrollTo({ left: 0, behavior: 'smooth' });
    }
  });

  })();

  /* ============ Футер: картинка баннера едет медленнее страницы и выезжает из-под блока выше ============ */
  const footerBg = document.getElementById('footerBg');
  if (footerBg && !reduced) {
    const box = footerBg.parentElement;
    let queued = false;
    const moveBg = () => {
      queued = false;
      const r = box.getBoundingClientRect();
      if (r.top > innerHeight || r.bottom < 0) return;
      const p = clamp((innerHeight - r.top) / r.height);
      footerBg.style.transform = `translate3d(0, ${-(34 - 11.3 * p)}%, 0)`;
    };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(moveBg); } }, { passive: true });
    window.addEventListener('resize', moveBg);
    moveBg();
  }

  /* ============ Формы ============ */
  document.querySelectorAll('.seg').forEach((g) => g.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    g.querySelectorAll('button').forEach((x) => x.classList.toggle('is-active', x === b));
  }));
  // согласие отмечено – подсветка ошибки снимается
  document.addEventListener('change', (e) => {
    if (e.target.matches('.consent input')) e.target.closest('.consent').classList.remove('is-error');
  });
})();

// подвал: подпись Encase – оранжевое «перо» слева направо, затем яркий бордовый, затем перелив раз в 4 секунды
(() => {
  const svg = document.querySelector('.fx__encase');
  if (!svg) return;
  const W = 1086, SHEEN = 190, PASS = 840;
  const ink = svg.querySelector('[data-ink]'), wine = svg.querySelector('[data-wine]'), sheen = svg.querySelector('[data-sheen]');
  const st = { write: 0, sweep: 0, shine: 0 };
  const paint = () => {
    ink.setAttribute('x', st.sweep * W);
    ink.setAttribute('width', Math.max(0, (st.write - st.sweep) * W));
    wine.setAttribute('width', st.sweep * W);
    const p = st.sweep < 1 ? st.sweep : st.shine;
    sheen.setAttribute('x', p * (W + SHEEN) - SHEEN);
    sheen.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0);
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { st.write = st.sweep = 1; paint(); return; }
  paint();
  const ease = (x) => (x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const tween = (key, ms, done) => {
    const t0 = performance.now();
    const step = (now) => { const k = Math.min(1, (now - t0) / ms); st[key] = ease(k); paint(); k < 1 ? requestAnimationFrame(step) : done && done(); };
    requestAnimationFrame(step);
  };
  let onScreen = false, started = false;
  const loop = () => setTimeout(() => { if (onScreen) tween('shine', PASS, () => { st.shine = 0; loop(); }); else loop(); }, 4000 - PASS);
  new IntersectionObserver((es) => {
    onScreen = es[0].isIntersecting;
    if (!onScreen || started) return;
    started = true;
    tween('write', 1560);
    setTimeout(() => tween('sweep', PASS, loop), 1800);
  }, { rootMargin: '0px 0px -5% 0px' }).observe(svg);
})();

/* ============ Хлебные крошки по пути посетителя: «Главная › Отзывы › Наши проекты».
   Путь хранится в sessionStorage этой вкладки; заход с другого сайта или на главную начинает путь заново,
   возврат на уже пройденную страницу обрезает путь до неё ============ */
(() => {
  const KEY = 'gpTrail';
  const file = (u) => { try { const p = new URL(u, location.href); return (p.pathname.split('/').pop() || 'index.html'); } catch (e) { return ''; } };
  const cur = file(location.href);
  const nav = document.querySelector('nav.crumbs');
  const curTitle = nav && nav.querySelector('[aria-current]') ? nav.querySelector('[aria-current]').textContent.trim()
    : (document.title.split(/\s[–—-]\s/)[0] || '').trim();
  let trail = [];
  try { trail = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { trail = []; }
  let fromSite = false;
  try { fromSite = !!document.referrer && new URL(document.referrer).host === location.host; } catch (e) { fromSite = false; }
  if (!fromSite || cur === 'index.html') trail = [];
  const i = trail.findIndex((x) => x.u === cur);
  if (i >= 0) trail = trail.slice(0, i);
  if (cur !== 'index.html') trail.push({ u: cur, t: curTitle });
  trail = trail.slice(-5);
  try { sessionStorage.setItem(KEY, JSON.stringify(trail)); } catch (e) { /* приватный режим – без пути */ }
  if (!nav || trail.length < 2) return;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sep = '<span aria-hidden="true">›</span>';
  const prev = trail.slice(0, -1).map((x) => `<a href="${esc(x.u)}">${esc(x.t)}</a>`).join(sep);
  nav.innerHTML = `<a href="index.html">Главная</a>${sep}${prev}${sep}<span aria-current="page">${esc(curTitle)}</span>`;
})();

/* ============ Карточки с 3D-иконкой и чипсами: на телефоне чипсы крупнее и прижаты к иконке слева ============ */
(() => {
  const arts = [...document.querySelectorAll('.career--v2:not(.pways) .ccard__art')].filter((a) => a.querySelector('.cst'));
  if (!arts.length) return;
  const mq = window.matchMedia('(max-width: 760px)');
  arts.forEach((a) => a.querySelectorAll('.cst').forEach((c) => { c.dataset.l = c.style.left; c.dataset.t = c.style.top; }));
  const place = () => arts.forEach((a) => {
    const img = a.querySelector('img'), w = a.querySelector('.cst--w'), b = a.querySelector('.cst--b');
    [w, b].forEach((c) => { if (c) { c.style.left = c.dataset.l; c.style.top = c.dataset.t; } });
    a.style.left = '';
    if (!mq.matches || !img) return;
    // главная: иконка прижата к правому краю карточки с зазором 18 px
    if (a.closest('#career')) {
      const card = a.closest('.ccard').getBoundingClientRect(), ir = img.getBoundingClientRect();
      a.style.left = `${parseFloat(getComputedStyle(a).left) + (card.right - 18 - ir.right)}px`;
    }
    const edge = img.offsetLeft + 6; // правый край чипсов – у левого края иконки
    if (w) { w.style.left = `${edge - w.offsetWidth}px`; w.style.top = '30px'; }
    if (b) { b.style.left = `${edge - b.offsetWidth + 24}px`; b.style.top = '104px'; }
    // если чипс задевает заголовок карточки – сдвигаем его вправо на половину ширины
    const h = a.closest('.ccard')?.querySelector('h3');
    if (h) [w, b].forEach((c) => {
      if (!c) return;
      const r1 = c.getBoundingClientRect(), r2 = h.getBoundingClientRect();
      const hit = r1.left < r2.right && r1.right > r2.left && r1.top < r2.bottom && r1.bottom > r2.top;
      if (hit) c.style.left = `${parseFloat(c.style.left) + c.offsetWidth / 2}px`;
    });
  });
  place();
  mq.addEventListener('change', place);
  if (document.fonts) document.fonts.ready.then(place);
})();

/* ============ Поле «Прикрепить резюме»: имя файла, проверка размера (до 5 МБ),
   показ только для тем «Трудоустройство» и «Отправить резюме». Делегирование – работает и в окнах ============ */
const gpFile = (box) => {
  const t = box.querySelector('.form__file-t'), hint = box.querySelector('small');
  if (!box.dataset.t0) { box.dataset.t0 = t.textContent; box.dataset.h0 = hint.textContent; }
  return { t, hint, T0: box.dataset.t0, H0: box.dataset.h0 };
};
const gpFileSync = (form) => {
  const box = form && form.querySelector('.form__file'), sel = form && form.querySelector('select[name="topic"]');
  if (!box || !sel) return;
  const o = sel.options[sel.selectedIndex];
  const on = !!o && !o.disabled && /трудоустройство|резюме/i.test(o.text);
  box.hidden = !on;
  const inp = box.querySelector('input[type=file]');
  if (!on && inp && inp.value) { inp.value = ''; inp.dispatchEvent(new Event('change', { bubbles: true })); }
};
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.matches && el.matches('select[name="topic"]')) { gpFileSync(el.closest('form')); return; }
  if (!(el.matches && el.matches('.form__file input[type=file]'))) return;
  const box = el.closest('.form__file'), { t, hint, T0, H0 } = gpFile(box), MAX = 5 * 1024 * 1024;
  const f = el.files && el.files[0];
  box.classList.remove('is-error', 'is-set');
  if (!f) { t.textContent = T0; hint.textContent = H0; return; }
  if (f.size > MAX) { el.value = ''; t.textContent = T0; hint.textContent = 'Файл больше 5 МБ — выберите поменьше'; box.classList.add('is-error'); return; }
  t.textContent = f.name; hint.textContent = f.size < 1048576 ? Math.max(1, Math.round(f.size / 1024)) + ' КБ' : (f.size / 1048576).toFixed(1).replace('.', ',') + ' МБ'; box.classList.add('is-set');
});
document.querySelectorAll('form').forEach(gpFileSync);
new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) n.querySelectorAll('form').forEach(gpFileSync); }))).observe(document.body, { childList: true, subtree: true });
/* «Отправить резюме» на «О компании»: в форме сразу выбирается тема «Отправить резюме» */
document.querySelectorAll('a[href="#lead"]').forEach((a) => {
  if (!/резюме/i.test(a.textContent)) return;
  a.addEventListener('click', () => {
    const sel = document.querySelector('#lead select[name="topic"]');
    if (!sel) return;
    const o = [...sel.options].find((x) => /резюме/i.test(x.text));
    if (o) { sel.value = o.value || o.text; sel.dispatchEvent(new Event('change', { bubbles: true })); }
  });
});

/* ============ Картинка крупно по нажатию (публикации в прессе и др.: data-full) ============ */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-full]');
  if (!b) return;
  const box = document.createElement('div');
  box.className = 'lbox';
  box.setAttribute('role', 'dialog');
  box.innerHTML = `<button class="lbox__x" type="button" aria-label="Закрыть"><img src="assets/img/close.svg" alt=""></button><img src="${b.dataset.full}" alt="${b.querySelector('img').alt}">`;
  const close = () => { box.remove(); document.documentElement.classList.remove('mdl-lock'); removeEventListener('keydown', esc); };
  const esc = (ev) => { if (ev.key === 'Escape') close(); };
  box.addEventListener('click', close);
  addEventListener('keydown', esc);
  document.documentElement.classList.add('mdl-lock');
  document.body.appendChild(box);
});

/* ============ Статус-бар телефона (meta theme-color) в цвет шапки над текущим блоком.
   Лёгкий вариант: цвет каждого блока считается один раз, смена – через IntersectionObserver,
   без расчётов на каждом кадре прокрутки (иначе на телефоне тормозили анимации) ============ */
(() => {
  const header = document.querySelector('.header'); if (!header || !('IntersectionObserver' in window)) return;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
  const parse = (c) => { const m = c && c.match(/[\d.]+/g); return m ? { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] } : null; };
  const bgOf = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0.5) return c; }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 28, g: 8, b: 16, a: 1 };
  };
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const H = { r: 28, g: 8, b: 16, a: 0.9 }; // фон шапки после прокрутки
  const mix = (c) => ({ r: H.r * H.a + c.r * (1 - H.a), g: H.g * H.a + c.g * (1 - H.a), b: H.b * H.a + c.b * (1 - H.a) });
  const blocks = [...document.querySelectorAll('main > section, main > div, .page > section, body > section, footer')];
  const cache = new Map();
  let cur = null;
  const set = (el) => {
    if (!cache.has(el)) cache.set(el, bgOf(el));
    const c = cache.get(el);
    const v = hex(window.scrollY > 10 ? mix(c) : c);
    if (v !== cur) { meta.content = v; cur = v; }
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) set(e.target); }), { rootMargin: '-60px 0px -92% 0px' });
  blocks.forEach((b) => io.observe(b));
  meta.content = hex(bgOf(blocks[0] || document.body));
})();

/* ============ «Пресса о Танзиле» на мобилке: листаем только стрелками, счётчик 1 / 3 ============ */
(() => {
  const grid = document.querySelector('.ppress__grid'); if (!grid) return;
  const cards = [...grid.querySelectorAll('.ppress__card')]; if (cards.length < 2) return;
  const mq = matchMedia('(max-width: 760px)');
  const nav = document.createElement('div');
  nav.className = 'tariff-nav ppress-nav';
  nav.innerHTML = `<button type="button" class="tariff-nav__btn" data-d="-1" aria-label="Предыдущая публикация">←</button><span class="tariff-nav__count"><b>1</b> / ${cards.length}</span><button type="button" class="tariff-nav__btn" data-d="1" aria-label="Следующая публикация">→</button>`;
  grid.after(nav);
  let i = 0;
  const go = (n, smooth = true) => {
    i = Math.max(0, Math.min(cards.length - 1, n));
    grid.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
    nav.querySelector('b').textContent = i + 1;
    nav.querySelector('[data-d="-1"]').disabled = i === 0;
    nav.querySelector('[data-d="1"]').disabled = i === cards.length - 1;
  };
  nav.addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b) go(i + Number(b.dataset.d)); });
  mq.addEventListener('change', () => go(0, false));
  go(0, false);
})();

/* ============ «Написать нам»: шторка снизу с затемнением – Telegram, WhatsApp, почта ============ */
(() => {
  const btns = document.querySelectorAll('[data-sheet="write"]'); if (!btns.length) return;
  const sh = document.createElement('div');
  sh.className = 'wsheet'; sh.hidden = true;
  sh.innerHTML = '<div class="wsheet__shade" data-wclose></div>'
    + '<div class="wsheet__win" role="dialog" aria-modal="true" aria-labelledby="wsheetT">'
    + '<p class="wsheet__t" id="wsheetT">Напишите нам</p><p class="wsheet__s">Выберите, где удобнее, – ответим за&nbsp;15&nbsp;минут в&nbsp;рабочее время</p>'
    + '<div class="wsheet__apps">'
    + '<a class="wsheet__app" href="https://t.me/academy_of_assistantsTG" target="_blank" rel="noopener"><span class="wsheet__ic wsheet__ic--tg"><img src="assets/img/telegram.svg" alt=""></span>Telegram</a>'
    + '<a class="wsheet__app" href="https://wa.me/79688888707" target="_blank" rel="noopener"><span class="wsheet__ic wsheet__ic--wa"><img src="assets/img/whatsapp.svg" alt=""></span>WhatsApp</a>'
    + '<a class="wsheet__app" href="mailto:info@garipova.biz"><span class="wsheet__ic wsheet__ic--em"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg></span>Почта</a>'
    + '</div></div>';
  document.body.appendChild(sh);
  let last = null;
  const open = () => { last = document.activeElement; sh.hidden = false; document.documentElement.classList.add('mdl-lock'); requestAnimationFrame(() => sh.classList.add('is-open')); };
  const close = () => { sh.classList.remove('is-open'); document.documentElement.classList.remove('mdl-lock'); setTimeout(() => { sh.hidden = true; }, 350); last?.focus?.({ preventScroll: true }); };
  btns.forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); open(); }));
  sh.addEventListener('click', (e) => { if (e.target.closest('[data-wclose]')) close(); else if (e.target.closest('.wsheet__app')) setTimeout(close, 300); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sh.hidden) close(); });
  // закрытие свайпом шторки вниз
  const win = sh.querySelector('.wsheet__win');
  let y0 = null, dy = 0;
  win.addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; dy = 0; win.style.transition = 'none'; }, { passive: true });
  win.addEventListener('touchmove', (e) => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); win.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
  win.addEventListener('touchend', () => { if (y0 === null) return; y0 = null; win.style.transition = ''; win.style.transform = ''; if (dy > 60) close(); });
})();

/* ============ Тарифы ступеней: кнопка тарифа выбирает этот тариф в табах формы ============ */
document.addEventListener('click', (e) => {
  const a = e.target.closest('.sttar__card a[href^="#"]'); if (!a) return;
  const name = (a.closest('.sttar__card').querySelector('h3')?.textContent || '').replace(/ /g, ' ').trim().toLowerCase();
  const target = document.querySelector(a.getAttribute('href')); if (!name || !target) return;
  const btn = [...target.querySelectorAll('.seg button')].find((b) => b.textContent.replace(/ /g, ' ').trim().toLowerCase() === name);
  if (btn && !btn.classList.contains('is-active')) btn.click();
});

/* ============ «Посмотрите 1-й урок бесплатно»: кнопка активна, только когда выбран мессенджер,
   введён корректный телефон и стоит галочка согласия ============ */
document.querySelectorAll('.stlesson__form').forEach((form) => {
  const btn = form.querySelector('.form__submit'), seg = form.querySelector('.seg[data-required]');
  const phone = form.querySelector('[name="phone"]'), consent = form.querySelector('.consent input');
  if (!btn) return;
  const sync = () => {
    const segOk = !seg || !!seg.querySelector('button.is-active');
    const phoneOk = !phone || (window.gpPhoneOk ? window.gpPhoneOk(phone) : phone.value.replace(/\D/g, '').length >= 10);
    btn.disabled = !(segOk && phoneOk && (!consent || consent.checked));
  };
  form.addEventListener('input', sync); form.addEventListener('change', sync);
  form.addEventListener('click', () => setTimeout(sync, 0));
  form.addEventListener('submit', (e) => { if (btn.disabled) e.preventDefault(); });
  sync();
});

/* ============ Книги: «Купить» ведёт на форму и сразу выбирает эту книгу ============ */
document.addEventListener('click', (e) => {
  const a = e.target.closest('.kb a[href="#lead"]'); if (!a) return;
  const norm = (t) => t.replace(/ /g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  const title = norm(a.closest('.kb').querySelector('h3')?.textContent || '');
  const sel = document.querySelector('#lead select[name="book"]'); if (!sel || !title) return;
  const o = [...sel.options].find((x) => x.value !== '' && !x.disabled && title.startsWith(norm(x.text)));
  if (o) { o.selected = true; sel.dispatchEvent(new Event('change', { bubbles: true })); }
});
