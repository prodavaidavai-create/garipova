(() => {
  /* ============ Квиз «Подбор за 1 минуту»: 5 вопросов → контакты → результат ============ */
  const quiz = document.getElementById('quiz');
  if (quiz && window.initQuiz) window.initQuiz(quiz); // логика квиза – в modals.js, общая с окном подбора

  /* ============ «Подбор или обучение»: сцена как «Форматы и стоимость» на главной ============
     Линия раздваивается, заголовок расходится по сторонам, карточки форматов
     сменяются поворотом кубика по скроллу. */
  // сцен-кубиков на странице может быть несколько (на курсе: «Выберите тариф» и «Следующий шаг»)
  document.querySelectorAll('.scene--choose').forEach((choose) => {
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const seg = (p, from, len) => clamp((p - from) / len);
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const lerp = (a, b, t) => a + (b - a) * t;
    const smooth = (t) => t * t * (3 - 2 * t);
    const stage = choose.querySelector('.scene__stage');
    const q = (s) => stage.querySelector(s);
    const lineC = q('.scene__line--c'), lineL = q('.scene__line--l'), lineR = q('.scene__line--r');
    const titleL = q('.scene__title--l'), titleR = q('.scene__title--r'), note = q('.scene__note') || document.createElement('p');
    const box = q('.tariffs');
    const cards = [...box.querySelectorAll('.tariff')];
    let s = 1, mobile = false, vh = 0, wl = 0, wr = 0;

    // телефон (макет 887:2529): три карточки столбиком, без кубика
    const stackMQ = matchMedia('(max-width: 760px)');
    // телефон: тарифы – кубик со стрелками и счётчиком 1 / N, как на главной; один тариф – без слайдера
    let cubeIdx = 0, cubePos = 0, cubeNav = null;
    const cube = cards.length > 1;
    const sticky = choose.querySelector('.scene__sticky');
    const cubeRender = () => {
      const half = box.offsetWidth / 2;
      cubeIdx = Math.round(cubePos);
      cards.forEach((t, j) => {
        const d = cubePos - j, o = clamp(d, -1, 1);
        t.style.opacity = Math.abs(d) <= 1 ? 1 : 0;
        t.style.transform = `translateZ(${-half}px) rotateY(${-o * 90}deg) translateZ(${half}px)`;
        t.style.filter = `brightness(${1 - Math.abs(o) * 0.35})`;
        t.style.zIndex = Math.round((1 - Math.abs(o)) * 10);
        t.style.pointerEvents = Math.abs(d) < 0.5 ? 'auto' : 'none';
      });
      cubeNav.querySelector('b').textContent = cubeIdx + 1;
      cubeNav.querySelector('[data-d="-1"]').disabled = cubeIdx === 0;
      cubeNav.querySelector('[data-d="1"]').disabled = cubeIdx === cards.length - 1;
    };
    // телефон: кубик поворачивается по скроллу – блок прилипает под шапкой, пока карточки не сменятся
    const HEADER = 62, PER = 0.6;
    let geom = null;
    const scrollGeom = () => geom || (geom = calcGeom());
    const calcGeom = () => {
      const stH = sticky.offsetHeight, vhh = window.innerHeight;
      const T = Math.min(HEADER, vhh - stH);
      const span = (cards.length - 1) * vhh * PER;
      const cs = getComputedStyle(choose), pt = parseFloat(cs.paddingTop) || 0, pb = parseFloat(cs.paddingBottom) || 0;
      return { stH, T, span, pt, pb };
    };
    const scrollSetup = () => {
      if (!cube) return;
      geom = null;
      sticky.style.position = 'sticky';
      const { stH, T, span, pt, pb } = scrollGeom();
      sticky.style.top = T + 'px';
      choose.style.boxSizing = 'border-box';
      choose.style.height = (pt + stH + span + pb) + 'px';
    };
    const scrollCube = () => {
      if (!cube || !stackMQ.matches) return;
      const { T, span, pt } = scrollGeom();
      const p = clamp((T - choose.getBoundingClientRect().top - pt) / span);
      const x = p * (cards.length - 1), i = Math.min(Math.floor(x), cards.length - 2), f = x - i;
      cubePos = i + smooth(clamp((f - 0.2) / 0.6));
      cubeRender();
    };
    const goFace = (n) => {
      n = clamp(n, 0, cards.length - 1);
      const { T, span, pt } = scrollGeom();
      const top = window.scrollY + choose.getBoundingClientRect().top + pt - T + (n / (cards.length - 1)) * span;
      window.scrollTo({ top, behavior: 'smooth' });
    };
    const cubeHeight = () => {
      cards.forEach((t) => { t.style.position = 'relative'; t.style.inset = 'auto'; t.querySelector('.tariff__top').style.flex = 'none'; });
      const h = Math.max(...cards.map((t) => t.offsetHeight));
      cards.forEach((t) => { t.style.position = ''; t.style.inset = ''; t.querySelector('.tariff__top').style.flex = ''; });
      box.style.height = h + 'px';
    };
    const cubeOn = () => {
      if (!cube) return;
      if (!cubeNav) {
        cubeNav = document.createElement('div');
        cubeNav.className = 'tariff-nav';
        cubeNav.innerHTML = `<button type="button" class="tariff-nav__btn" data-d="-1" aria-label="Предыдущий вариант">←</button><span class="tariff-nav__count"><b>1</b> / ${cards.length}</span><button type="button" class="tariff-nav__btn" data-d="1" aria-label="Следующий вариант">→</button>`;
        box.after(cubeNav);
        cubeNav.addEventListener('click', (e) => {
          const b = e.target.closest('[data-d]');
          if (!b) return;
          goFace(cubeIdx + Number(b.dataset.d));
        });
        let sx = null;
        box.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
        box.addEventListener('touchend', (e) => {
          if (sx === null || !stackMQ.matches) return;
          const dx = e.changedTouches[0].clientX - sx; sx = null;
          if (Math.abs(dx) < 40) return;
          goFace(cubeIdx + (dx < 0 ? 1 : -1));
        });
      }
      choose.classList.add('is-cube');
      cubeHeight();
      scrollSetup();
      scrollCube();
      // иконки грузятся позже – пересчитываем высоту кубика
      cards.forEach((t) => t.querySelectorAll('img').forEach((im) => { if (!im.complete) im.addEventListener('load', () => { if (stackMQ.matches) { cubeHeight(); scrollSetup(); } }, { once: true }); }));
      window.addEventListener('load', () => { if (stackMQ.matches) { cubeHeight(); scrollSetup(); } }, { once: true });
    };
    const stacked = () => {
      const on = stackMQ.matches;
      if (on !== choose.classList.contains('scene--stack')) {
        choose.classList.toggle('scene--stack', on);
        [titleL, titleR, note, box, lineL, lineR, lineC, ...cards].forEach((el) => el.removeAttribute('style'));
        if (on) cubeOn(); else { choose.classList.remove('is-cube'); choose.style.height = ''; choose.style.boxSizing = ''; sticky.style.position = ''; sticky.style.top = ''; }
      }
      return on;
    };

    function layout() {
      if (stacked()) return;
      const vw = window.innerWidth;
      vh = window.SVH ? window.SVH() : window.innerHeight;
      mobile = vw < 900;
      s = mobile ? Math.min(vw / 780, vh / 900) : Math.min(vw / 1440, vh / 900);
      stage.style.setProperty('--s', s);
      wl = titleL.offsetWidth;
      wr = titleR.offsetWidth;
      // на телефоне карточка крупнее, подпись – под ней
      const k = mobile ? Math.min(1.5, (vw - 32) / (431 * s)) : 1;
      box.style.transform = `scale(${k})`;
      note.style.top = mobile ? `${450 + (box.offsetHeight / 2) * k + 40}px` : '';
    }

    function update() {
      if (stacked()) return;
      const r = choose.getBoundingClientRect();
      const p = clamp(-r.top / (choose.offsetHeight - vh));
      const a = ease(seg(p, 0.02, 0.14));
      const appear = ease(seg(p, 0.13, 0.12));

      const off = 369.5 * a;
      lineL.style.opacity = lineR.style.opacity = a > 0.001 ? 1 : 0;
      lineL.style.transform = `translateX(${-off}px)`;
      lineR.style.transform = `translateX(${off}px)`;
      lineL.style.height = lineR.style.height = `${600 + lerp(1500, 760, appear)}px`;
      lineC.style.opacity = 1 - appear;

      const initL = 706 - wl / 2, initR = 734 + wr / 2;
      let dxL, dxR, dyL = 0, dyR = 0, k = 1;
      if (mobile) {
        dxL = 720 - initL; dxR = 720 - initR;
        dyL = 450 - vh / (2 * s) + 100 / s - 450; // ниже шапки телефона (72 px)
        dyR = dyL + 34 / s;
        k = lerp(1, Math.max(1, 0.62 / s), a);
      } else {
        // заголовок длиннее, чем на главной, – центрируем его в боковых полосах
        dxL = 175 - initL; dxR = 1265 - initR;
      }
      titleL.style.transform = `translate(${dxL * a}px, calc(-50% + ${dyL * a}px)) scale(${k})`;
      titleR.style.transform = `translate(${dxR * a}px, calc(-50% + ${dyR * a}px)) scale(${k})`;
      note.style.opacity = appear;

      // две карточки – один поворот посередине, три – два поворота
      const step = cards.length > 3
        ? 1 + smooth(seg(p, 0.34, 0.13)) + smooth(seg(p, 0.55, 0.13)) + smooth(seg(p, 0.76, 0.13))
        : cards.length > 2
        ? 1 + smooth(seg(p, 0.38, 0.16)) + smooth(seg(p, 0.66, 0.16))
        : cards.length > 1 ? 1 + smooth(seg(p, 0.42, 0.22)) : 1;   // одна карточка – без поворота
      const half = box.offsetWidth / 2;
      cards.forEach((c, j) => {
        const o = clamp(step - (j + 1), -1, 1);
        const shown = Math.abs(o) < 1;
        const lift = j === 0 ? (1 - appear) * 24 : 0;
        c.style.opacity = shown ? (j === 0 ? appear : 1) : 0;
        c.style.transform = `translateY(${lift}px) translateZ(${-half}px) rotateY(${-o * 90}deg) translateZ(${half}px)`;
        c.style.filter = `brightness(${1 - Math.abs(o) * 0.35})`;
        c.style.zIndex = shown ? Math.round((1 - Math.abs(o)) * 10) : 0;
        c.style.pointerEvents = Math.abs(o) < 0.5 && appear > 0.6 ? 'auto' : 'none';
      });
    }

    // десктоп: клик по пустому полю справа – кубик поворачивается на следующую грань, слева – на предыдущую
    const FACES = cards.length > 3 ? [0.29, 0.5, 0.71, 0.93] : cards.length > 2 ? [0.31, 0.6, 0.9] : [0.33, 0.8];
    stage.addEventListener('click', (e) => {
      // на телефоне и по стрелкам «1 / N» страница не прокручивается — поворачивается только кубик
      if (mobile || stackMQ.matches || cards.length < 2 || e.target.closest('.tariff, .tariff-nav')) return;
      const r = choose.getBoundingClientRect();
      const span = choose.offsetHeight - vh;
      const p = clamp(-r.top / span);
      let i = FACES.reduce((b, f, j) => (Math.abs(f - p) < Math.abs(FACES[b] - p) ? j : b), 0);
      i = clamp(i + (e.clientX > window.innerWidth / 2 ? 1 : -1), 0, FACES.length - 1);
      window.scrollTo({ top: window.scrollY + r.top + FACES[i] * span, behavior: 'smooth' });
    });
    stage.addEventListener('mousemove', (e) => {
      stage.style.cursor = mobile || cards.length < 2 || e.target.closest('.tariff') ? '' : (e.clientX > window.innerWidth / 2 ? 'e-resize' : 'w-resize');
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); scrollCube(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', () => { layout(); update(); if (stackMQ.matches && cube) { cubeHeight(); scrollSetup(); scrollCube(); } });
    document.fonts && document.fonts.ready.then(() => { layout(); update(); if (stackMQ.matches && cube) { cubeHeight(); scrollSetup(); scrollCube(); } });
    layout();
    update();
  });

  /* ============ Аккордеон шагов (как «6 шагов» на главной) – на внутренних страницах ============ */
  const stepsList = document.getElementById('stepsList');
  if (stepsList && !document.getElementById('logosTrack')) {
    const stepEls = [...stepsList.querySelectorAll('.step')];
    const photos = [...document.querySelectorAll('#stepsMedia img')];
    const thumbs = [...document.querySelectorAll('#stepsThumb img')];
    const open = (st) => {
      stepEls.forEach((x) => x.classList.remove('is-open'));
      void st.offsetWidth;
      st.classList.add('is-open');
      const i = stepEls.indexOf(st);
      photos.forEach((img, j) => img.classList.toggle('is-active', j === i));
      thumbs.forEach((img, j) => img.classList.toggle('is-active', j === (i + 1) % stepEls.length));
    };
    stepsList.addEventListener('click', (e) => { const h = e.target.closest('.step__head'); if (h) open(h.parentElement); });
    stepEls.forEach((st, i) => st.querySelector('.step__bar').addEventListener('animationend', () => {
      if (st.classList.contains('is-open')) open(stepEls[(i + 1) % stepEls.length]);
    }));
    stepsList.classList.add('is-paused');
    new IntersectionObserver(([e]) => stepsList.classList.toggle('is-paused', !e.isIntersecting), { threshold: 0.35 }).observe(stepsList);
  }

  /* ============ Вопросы и ответы: поиск по вопросам и ответам ============ */
  const qaForm = document.getElementById('qaSearch');
  if (qaForm) {
    const input = document.getElementById('qaInput');
    const status = document.getElementById('qaStatus');
    const empty = document.getElementById('qaEmpty');
    const top = document.getElementById('q-top');
    const sections = [...document.querySelectorAll('[data-qa]')];
    const norm = (s) => s.toLowerCase().replace(/ё/g, 'е');
    const items = sections.flatMap((sec) => [...sec.querySelectorAll('details')].map((el) => ({
      el, sec, wasOpen: el.open, text: norm(`${sec.querySelector('h2').textContent} ${el.textContent}`),
    })));
    // отбрасываем окончание, чтобы «гарантия» находила и «гарантией»
    const stem = (w) => (w.length > 5 ? w.slice(0, -2) : w);

    const jump = () => {
      const first = sections.find((s) => !s.hidden) || empty;
      first.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    function filter() {
      const words = norm(input.value).split(/[^а-яa-z0-9]+/).filter((w) => w.length > 1).map(stem);
      const active = words.length > 0;
      let found = 0;
      items.forEach((it) => {
        const hit = !active || words.every((w) => it.text.includes(w));
        it.el.hidden = !hit;
        if (hit) found += 1;
        it.el.open = active ? hit : it.wasOpen;
      });
      sections.forEach((sec) => { sec.hidden = !sec.querySelector('details:not([hidden])'); });
      if (top) top.hidden = active;
      empty.hidden = !active || found > 0;
      status.hidden = !active;
      if (active) {
        status.textContent = found ? `Найдено ответов: ${found}` : 'Ответа не нашли';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = found ? 'Показать' : 'Задать вопрос';
        btn.addEventListener('click', found ? jump : () => document.getElementById('lead').scrollIntoView({ behavior: 'smooth' }));
        status.append(btn);
      }
    }

    input.addEventListener('input', filter);
    qaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      filter();
      if (input.value.trim()) jump();
    });
  }

  /* ============ Результаты: фильтр по направлениям ============ */
  const filters = document.getElementById('resultFilters');
  if (filters) {
    const cards = [...filters.parentElement.querySelectorAll('.case')];
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter');
      if (!btn) return;
      filters.querySelectorAll('.filter').forEach((b) => b.classList.toggle('is-active', b === btn));
      cards.forEach((c) => c.classList.toggle('is-hidden', btn.dataset.f !== 'all' && c.dataset.cat !== btn.dataset.f));
    });
  }
  /* ============ Колода на внутренних страницах: экран закреплён, карточки по скроллу
     налетают друг на друга (как «три части работы» на главной) ============ */
  const deck = document.querySelector('.deck');
  if (deck && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const seg = (p, from, len) => clamp((p - from) / len);
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const cards = [...deck.querySelectorAll('.dcardx')];
    const step = 0.78 / Math.max(1, cards.length - 1); // остальные карточки делят оставшийся путь поровну
    function update() {
      const r = deck.getBoundingClientRect();
      const p = clamp(-r.top / (deck.offsetHeight - window.SVH()));
      const land = cards.map((_, i) => (i === 0 ? 1 : ease(seg(p, 0.06 + (i - 1) * step, step * 0.8))));   // первая карточка видна сразу
      cards.forEach((c, i) => {
        const v = land[i];
        const above = land.slice(i + 1).reduce((s, x) => s + x, 0);
        const y = (1 - v) * window.SVH() * 0.9 + i * 14 - above * 10;
        c.style.transform = `translate(-50%, calc(-50% + ${y}px)) rotate(calc(var(--r) * var(--rk, 1) + ${(1 - v) * 14}deg)) scale(${1 - above * 0.04})`;
        c.style.opacity = i === 0 ? 1 : clamp(v * 3);
        c.style.filter = `brightness(${1 - above * 0.18})`;
        const ic = c.querySelector('.dcardx__3d'); // иконка видна только у верхней карточки
        if (ic) ic.style.opacity = clamp(1 - above);
      });
    }
    let ticking = false;
    window.addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();

/* ============ Фильтры-чипы: книги и выпуски подкаста ============ */
document.querySelectorAll('.chips[data-filter]').forEach((bar) => bar.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  bar.querySelectorAll('button').forEach((x) => x.classList.toggle('is-active', x === b));
  const f = b.dataset.f;
  bar.parentElement.querySelectorAll('[data-cat]').forEach((el) => el.classList.toggle('is-hidden', f !== 'all' && !el.dataset.cat.split(' ').includes(f)));
}));

/* ============ Услуги: блоки выезжают снизу при скролле и ложатся поверх предыдущего ============ */
(() => {
  const els = [...document.querySelectorAll('[data-rise]')];
  if (!els.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  let tick = false;
  function upd() {
    tick = false;
    const vh = window.innerHeight, on = window.innerWidth > 1100;
    els.forEach((el) => {
      if (!on) { el.style.translate = ''; return; }
      const top = el.getBoundingClientRect().top - (el._dy || 0);
      const p = ease(clamp((vh - top) / (vh * 0.85)));
      el._dy = (1 - p) * 140;
      el.style.translate = `0 ${el._dy.toFixed(1)}px`;
    });
  }
  const req = () => { if (!tick) { tick = true; requestAnimationFrame(upd); } };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  upd();
})();

/* ============ «Контакты»: живая Яндекс.Карта с фирменной меткой офиса (грузится, когда блок близко к экрану) ============ */
(() => {
  const box = document.getElementById('officeMap');
  if (!box) return;
  const lat = +box.dataset.lat, lng = +box.dataset.lng;
  const touch = matchMedia('(hover: none)').matches;
  function init() {
    window.ymaps.ready(() => {
      const map = new window.ymaps.Map(box, { center: [lat, lng], zoom: 16, controls: ['zoomControl'] }, { suppressMapOpenBlock: true });
      map.behaviors.disable('scrollZoom'); // колесо мыши листает страницу, а не карту
      if (touch) map.behaviors.disable('drag'); // на телефоне карта двигается двумя пальцами, страница листается одним
      const Pin = window.ymaps.templateLayoutFactory.createClass(
        '<div class="kpin"><span class="kpin__pulse"></span><span class="kpin__drop"></span><img class="kpin__logo" src="assets/img/logo.png" alt="" width="38" height="41" style="position:absolute;left:13px;top:11px;width:38px;height:41px;max-width:none;object-fit:contain"><span class="kpin__label">Кочновский проезд, 4к2</span></div>');
      map.geoObjects.add(new window.ymaps.Placemark([lat, lng], {
        balloonContentHeader: 'Академия ассистентов Танзили Гариповой',
        balloonContentBody: 'Москва, Кочновский проезд, 4к2<br>Пн–Пт 9:00–18:00, по предварительной записи',
      }, {
        iconLayout: Pin,
        iconShape: { type: 'Rectangle', coordinates: [[-32, -76], [32, 0]] },
        hideIconOnBalloonOpen: false,
        balloonOffset: [0, -80],
      }));
      box.classList.add('is-live');
    });
  }
  function load() {
    if (window.ymaps) return init();
    const s = document.createElement('script');
    s.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
    s.onload = init; // если карта не загрузилась – остаётся статичная картинка и кнопка маршрута
    document.head.appendChild(s);
  }
  new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '400px' }).observe(box);
})();

/* ============ Вопросы и ответы: табы разделов – переход к разделу и подсветка активного таба ============ */
(() => {
  const nav = document.querySelector('.qhero .pnav, .pnav[aria-label="Разделы вопросов"]');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const head = () => (document.getElementById('header') || {}).offsetHeight || 80;
  const setActive = (a) => links.forEach((x) => x.classList.toggle('is-active', x === a));
  links.forEach((a) => a.addEventListener('click', (e) => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.hidden = false;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - head() + 1, behavior: 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
    setActive(a);
  }));
})();

/* ============ Якорные кнопки к блокам с подъёмом по скроллу (data-rise): мягкий переход ровно к началу блока.
   Считаем место блока без его временного сдвига, иначе страница пролетает дальше ============ */
(() => {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-modal')) return;
    const id = a.getAttribute('href').slice(1);
    const t = id && document.getElementById(id);
    if (!t || !t.hasAttribute('data-rise')) return;
    e.preventDefault();
    e.stopPropagation();
    const head = (document.getElementById('header') || {}).offsetHeight || 0;
    const top = t.getBoundingClientRect().top + window.scrollY - (t._dy || 0);   // место блока без сдвига
    const free = window.innerHeight - head;
    const pad = t.offsetHeight < free ? (free - t.offsetHeight) / 2 : 0;          // невысокий блок – по центру экрана
    window.scrollTo({ top: Math.max(0, top - head - pad), behavior: 'smooth' });
    history.replaceState(null, '', '#' + id);
  }, true);
})();

/* ============ Кнопки data-yt: видео YouTube в окне поверх страницы, закрывается крестиком ============ */
(() => {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-yt]');
    if (!b) return;
    e.preventDefault();
    const pop = document.createElement('div');
    pop.className = 'yt-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');
    pop.innerHTML = '<button class="yt-pop__x" type="button" aria-label="Закрыть"><img src="assets/img/close.svg" alt=""></button>'
      + '<div class="yt-pop__frame"><iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(b.dataset.yt) + '?autoplay=1&rel=0" title="Видео" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
    document.body.appendChild(pop);
    document.documentElement.classList.add('mdl-lock');
    requestAnimationFrame(() => pop.classList.add('is-open'));
    pop.querySelector('.yt-pop__x').addEventListener('click', () => {
      pop.classList.remove('is-open');
      document.documentElement.classList.remove('mdl-lock');
      setTimeout(() => pop.remove(), 300);
      b.focus({ preventScroll: true });
    });
  });
})();

/* ============ Выступления, мобилка: подпись масштабируется вместе с картинкой (макет 1102:3462 при ширине 390) ============ */
(() => {
  const art = document.querySelector('.sphero__art');
  if (!art) return;
  const fit = () => art.style.setProperty('--k', (art.clientWidth / 390).toFixed(4));
  fit();
  addEventListener('resize', fit);
})();

/* ============ Контакты: вкладки «Куда обратиться» ============ */
(() => {
  document.querySelectorAll('.kdeps').forEach((box) => {
    const tabs = [...box.querySelectorAll('.kdeps__tab')];
    const panels = [...box.querySelectorAll('.kdeps__panel')];
    const dots = [...box.querySelectorAll('.kdeps__dots span')];
    const show = (i) => {
      tabs.forEach((t, k) => { t.classList.toggle('is-active', k === i); t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
      const row = tabs[i].parentElement;
      if (row.scrollWidth > row.clientWidth) row.scrollTo({ left: tabs[i].offsetLeft - parseFloat(getComputedStyle(row).paddingLeft), behavior: 'smooth' });
    };
    tabs.forEach((t, k) => t.addEventListener('click', () => show(k)));
    // свайп по фото на мобилке
    const stage = box.querySelector('.kdeps__stage');
    let x0 = null;
    stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) < 40) return;
      const cur = tabs.findIndex((t) => t.classList.contains('is-active'));
      show(Math.min(tabs.length - 1, Math.max(0, cur + (dx < 0 ? 1 : -1))));
    }, { passive: true });
  });
})();

/* ============ Обучение: тест «Подберём ступень» и чек-лист «Для кого» ============ */
(() => {
  document.querySelectorAll('[data-obquiz]').forEach((card) => {
    const qs = [...card.querySelectorAll('.obq__q')];
    const step = card.querySelector('.obq__step'), bar = card.querySelector('.obq__bar i'), back = card.querySelector('.obq__back');
    let i = 0, score = [];
    const render = () => {
      qs.forEach((q, k) => q.classList.toggle('is-active', k === i && i < qs.length));
      const done = i >= qs.length;
      card.classList.toggle('is-done', done);
      step.textContent = done ? 'Готово' : `Вопрос ${i + 1} из ${qs.length}`;
      bar.style.width = `${Math.round(Math.min(i + 1, qs.length) / qs.length * 100)}%`;
      back.hidden = i === 0;
      if (done) {
        const s = score.filter((v) => v === 2).length >= 2 ? '2' : '1';
        card.querySelectorAll('.obq__resbox').forEach((b) => b.classList.toggle('is-on', b.dataset.s === s));
      }
    };
    qs.forEach((q) => q.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { score[i] = +b.dataset.v; i += 1; render(); })));
    back.addEventListener('click', () => { i = Math.max(0, i - 1); render(); });
    card.querySelector('.obq__again').addEventListener('click', () => { i = 0; score = []; render(); });
    render();
  });
  document.querySelectorAll('[data-obfit]').forEach((box) => {
    const n = box.querySelector('[data-obfit-n]'), t = box.querySelector('[data-obfit-t]');
    const upd = () => {
      const items = [...box.querySelectorAll('.obfit__item')];
      const c = items.filter((it) => it.querySelector('input').checked).length;
      items.forEach((it) => it.classList.toggle('is-on', it.querySelector('input').checked));
      n.textContent = `${c} из ${items.length}`;
      t.textContent = c >= 2 ? 'профессия вам подойдёт' : 'отметьте, что про вас';
    };
    box.addEventListener('change', upd);
    upd();
  });
})();

/* ============ Бегущая строка логотипов на внутренних страницах (как на главной) ============ */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-marquee]').forEach((track) => {
    const set = track.querySelector('.logos__set');
    const box = track.parentElement;
    let setW = 0, shift = 0, speed = 1, target = 1, lastT = 0;
    const fill = () => {
      setW = set.getBoundingClientRect().width;
      if (!setW) return;
      const need = Math.ceil(box.offsetWidth / setW) + 1;
      while (track.children.length < need) track.appendChild(set.cloneNode(true)).setAttribute('aria-hidden', 'true');
    };
    const loop = (t) => {
      const dt = lastT ? Math.min(t - lastT, 64) : 0;
      lastT = t;
      speed += (target - speed) * Math.min(dt / 250, 1);
      if (setW) { shift = (shift + 40 * speed * dt / 1000) % setW; track.style.transform = `translate3d(${-shift}px, 0, 0)`; }
      requestAnimationFrame(loop);
    };
    fill();
    addEventListener('resize', fill);
    set.querySelectorAll('img').forEach((img) => img.complete || img.addEventListener('load', fill));
    box.addEventListener('mouseenter', () => { target = 0; });
    box.addEventListener('mouseleave', () => { target = 1; });
    if (!reduced) requestAnimationFrame(loop);
  });
})();

/* ============ Ступени: мини-тест «Подойдёт ли профессия» – 3 вопроса, результат прямо в карточке ============ */
(() => {
  const NB = (t) => t.replace(/ (и|в|с|на|за|до|от|по|для|не|а|к|о) /g, ' $1\u00a0');
  const QUIZ = {
    s1: {
      q: [
        ['Есть ли у вас опыт работы ассистентом?', ['Нет, начинаю с нуля', 'Меньше года', 'Больше года']],
        ['Сколько времени готовы уделять учёбе?', ['2–3 часа в неделю', '3 вечера в неделю', 'Каждый день понемногу']],
        ['Как хотите работать после курса?', ['Удалённо', 'В офисе', 'Пока не знаю']],
      ],
      res: (a) => a[0] === 2
        ? ['Вам подойдёт 2 ступень', 'У вас уже есть опыт – на 2 ступени освоите задачи уровня первого лица и выйдете на доход до 250 000 ₽.', 'stupen-2.html', 'Смотреть 2 ступень']
        : ['Профессия вам подходит', 'Начните с 1 ступени: за 1,5 месяца освоите профессию с нуля и выйдете на доход от 50 000 ₽. ' + (a[2] === 0 ? 'Работать можно удалённо из любой точки мира.' : 'Поможем с резюме и собеседованием.'), '#tariffs', 'Выбрать тариф'],
    },
    s2: {
      q: [
        ['Сколько вы уже работаете ассистентом?', ['Пока не работаю', 'До года', '1–3 года', 'Больше 3 лет']],
        ['Какие задачи уже ведёте?', ['Календарь и поручения', 'Документы и CRM', 'Финансы, команду и проекты']],
        ['К какому доходу хотите прийти?', ['До 80 000 ₽', '80–150 000 ₽', 'До 250 000 ₽']],
      ],
      res: (a) => a[0] === 0
        ? ['Начните с 1 ступени', 'Сначала освойте базу профессии за 1,5 месяца – а потом переходите на 2 ступень.', 'stupen-1.html', 'Смотреть 1 ступень']
        : ['Вы готовы ко 2 ступени', 'Освоите финансы, команду и проекты – задачи уровня первого лица с доходом до 250 000 ₽.', '#tariffs', 'Выбрать тариф'],
    },
  };
  document.querySelectorAll('[data-chips]').forEach((quiz) => {
    const cfg = QUIZ[quiz.dataset.chips]; const box = quiz.querySelector('.stwho__qbox');
    if (!cfg || !box) return;
    let i = 0, ans = [];
    const render = () => {
      const bar = `<i class="stwho__bar"><b style="width:${Math.round(((i < 3 ? i : 3) + (i < 3 ? 1 : 0)) / 3 * 100)}%"></b></i>`;
      if (i < cfg.q.length) {
        const [q, opts] = cfg.q[i];
        box.classList.remove('is-done');
        box.innerHTML = `<span class="hand">Вопрос ${i + 1}\u00a0из\u00a03</span><p>${NB(q)}</p><div class="stwho__opts">${opts.map((o, k) => `<button type="button" data-v="${k}">${NB(o)}</button>`).join('')}</div>${bar}`
          + (i ? '<button type="button" class="stwho__back">← назад</button>' : '');
      } else {
        const [t, d, href, cta] = cfg.res(ans);
        box.classList.add('is-done');
        box.innerHTML = `<span class="hand">Результат</span><p class="stwho__res-t">${NB(t)}</p><p class="stwho__res-d">${NB(d)}</p>${bar}<div class="stwho__res-btns"><a class="btn btn--white" href="${href}">${cta}</a><button type="button" class="stwho__again">пройти заново</button></div>`;
      }
    };
    box.addEventListener('click', (e) => {
      const o = e.target.closest('[data-v]');
      if (o) { ans[i] = +o.dataset.v; o.classList.add('is-on'); i += 1; setTimeout(render, 180); return; }
      if (e.target.closest('.stwho__back')) { i = Math.max(0, i - 1); render(); return; }
      if (e.target.closest('.stwho__again')) { i = 0; ans = []; render(); }
    });
    render();
  });
})();

/* ============ Курс руководителей: калькулятор окупаемости ============ */
(() => {
  document.querySelectorAll('[data-calc]').forEach((box) => {
    const rate = box.querySelector('[data-in="rate"]'), hours = box.querySelector('[data-in="hours"]');
    const fmt = (n) => n.toLocaleString('ru-RU').replace(/ /g, ' ');
    const upd = () => {
      box.querySelector('[data-out="rate"]').textContent = `${fmt(+rate.value)} ₽`;
      box.querySelector('[data-out="hours"]').textContent = hours.value;
      box.querySelector('[data-out="sum"]').textContent = `${fmt(rate.value * hours.value * 4)} ₽`;
    };
    rate.addEventListener('input', upd); hours.addEventListener('input', upd); upd();
  });
})();

/* Шеринг / подбор персонала: клик по карточке справа выводит её в большую карточку */
(() => {
  document.querySelectorAll('.pbento__grid').forEach((grid) => {
    const big = grid.querySelector('.pbento__big');
    const rows = [...grid.querySelectorAll('.pbento__row')];
    if (!big || !rows.length) return;
    const read = (li, isBig) => ({
      src: li.querySelector('img').getAttribute('src'),
      alt: li.querySelector('img').alt,
      title: li.querySelector('h3').textContent,
      text: li.querySelector('p').textContent,
      num: isBig ? '(01)' : li.querySelector('.num').textContent,
      sticker: isBig ? (li.querySelector('.tsticker')?.textContent || '') : (li.dataset.sticker || ''),
    });
    const state = { big: read(big, true) };
    rows.forEach((r) => { r._d = read(r, false); });
    const paintBig = (d) => {
      const img = big.querySelector('img');
      big.classList.add('is-swap');
      setTimeout(() => {
        img.src = d.src; img.alt = d.alt;
        big.querySelector('h3').textContent = d.title;
        big.querySelector('.pbento__cap p').textContent = d.text;
        const st = big.querySelector('.tsticker');
        if (st) { st.textContent = d.sticker; st.hidden = !d.sticker; }
        big.classList.remove('is-swap');
      }, 220);
    };
    const paintRow = (r, d) => {
      r.querySelector('img').src = d.src; r.querySelector('img').alt = d.alt;
      r.querySelector('h3').textContent = d.title;
      r.querySelector('p').textContent = d.text;
      r.querySelector('.num').textContent = d.num;
      r._d = d;
    };
    rows.forEach((r) => {
      r.tabIndex = 0; r.setAttribute('role', 'button');
      const go = () => {
        const prev = state.big; state.big = r._d;
        paintBig(state.big); paintRow(r, prev);
        if (window.innerWidth <= 1024) big.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      r.addEventListener('click', go);
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  });
})();

/* Книги: «Читать отрывок» — окно на светлом фоне. Текст отрывка берётся из BOOK_EXCERPTS (заполнить из рукописей автора). */
(() => {
  const btns = document.querySelectorAll('[data-excerpt]');
  if (!btns.length) return;
  // тексты отрывков по номеру книги на странице (data-excerpt): 0 – «БИЗНЕС-мечты», 1 – «Бизнес-ассистент. Лучшие инвестиции…»
  const BOOK_EXCERPTS = {
  "0": "<h4>Введение</h4><p>Мир быстро меняется. Методы, которые еще вчера приносили успех, сегодня дают сбой. Системы рушатся не&nbsp;из-за&nbsp;ошибок в&nbsp;расчетах, а&nbsp;из-за&nbsp;нехватки глубины, смысла и&nbsp;связи с&nbsp;настоящим. В&nbsp;этих новых условиях логика и&nbsp;стратегия уже не&nbsp;работают в&nbsp;одиночку. Бизнес требует настройки – тонкой, чувственной, энергетической.</p><p>Эта книга – приглашение взглянуть на&nbsp;бизнес как&nbsp;на&nbsp;живое существо. Не&nbsp;как&nbsp;на&nbsp;механизм, где&nbsp;люди – это&nbsp;винтики, а&nbsp;как&nbsp;на&nbsp;сад, где&nbsp;каждый человек – уникальное растение со&nbsp;своим ритмом, природой и&nbsp;силой роста. Задача лидера в&nbsp;таком подходе – не&nbsp;управлять, а&nbsp;взращивать. Не&nbsp;выжимать, а&nbsp;раскрывать. Не&nbsp;оценивать по&nbsp;стандарту, а&nbsp;видеть суть.</p><p>Представьте себе садовника. Он&nbsp;не&nbsp;требует, чтобы дуб расцвел как&nbsp;роза, и&nbsp;не&nbsp;обижается на&nbsp;лилию за&nbsp;то, что&nbsp;она не&nbsp;как&nbsp;подсолнух. Он&nbsp;наблюдает, изучает, создает условия. И&nbsp;в&nbsp;ответ сад расцветает. Так и&nbsp;команда: ее&nbsp;сила – в&nbsp;разнообразии, в&nbsp;тонкой настройке и&nbsp;в&nbsp;умении видеть каждого.</p><p>Современный HR все&nbsp;чаще уходит от&nbsp;шаблонного подхода к&nbsp;людям. Компании начинают нанимать не&nbsp;по&nbsp;резюме, а&nbsp;по&nbsp;сути: по&nbsp;навыкам, гибкости, живой энергии. Они создают условия для&nbsp;настоящей вовлеченности, а&nbsp;не&nbsp;формальной лояльности. В&nbsp;фокусе – эмоциональное и&nbsp;ментальное благополучие, уважение к&nbsp;личному пространству и&nbsp;признание внутренней ценности каждого. Такие компании становятся магнитом для&nbsp;талантов и&nbsp;центрами устойчивого роста.</p><p>Эта книга предлагает необычные, но&nbsp;эффективные инструменты. Цифровая психология – язык чисел, который раскрывает природу человека через код его рождения. Квантовое восприятие – способ видеть не&nbsp;только форму, но&nbsp;и&nbsp;суть, ощущать движение энергии и&nbsp;управлять состояниями.</p><p>Это&nbsp;наука о&nbsp;тонком, об&nbsp;истинном, о&nbsp;человеческом. Это&nbsp;способ быть ближе – к&nbsp;себе, к&nbsp;людям, к&nbsp;делу. Это&nbsp;мост между внешним результатом и&nbsp;внутренней правдой.</p><p>Особую ценность этой книге придает участие эксперта-практика – собственника HR-агентства, который делится практическими советами и&nbsp;примерами внедрения этих подходов в&nbsp;реальных компаниях. Это&nbsp;живые подтверждения: когда человек на&nbsp;своем месте, он&nbsp;работает с&nbsp;душой. Когда его природа учтена – он&nbsp;становится источником, а&nbsp;не&nbsp;тратой ресурса. Когда лидеры начинают видеть глубже – бизнес начинает расти иначе: гармонично, органично, устойчиво.</p><p>Для&nbsp;кого эта книга? Для&nbsp;предпринимателей, которые устали «толкать» и&nbsp;хотят «вести». Для&nbsp;HR-специалистов, стремящихся создавать живые, неформальные команды. Для&nbsp;управленцев, готовых расти как&nbsp;лидеры нового времени. Для&nbsp;всех, кто чувствует: за&nbsp;сухими цифрами кроется живая энергия – и&nbsp;она способна творить гораздо больше.</p><p>Эта книга – не&nbsp;просто руководство. Это&nbsp;навигатор в&nbsp;эпоху осознанного лидерства, в&nbsp;мир, где&nbsp;бизнес – это&nbsp;искусство взаимодействия, понимания и&nbsp;служения.</p><h4>Глава 1.&nbsp;Квантовое управление. Эра созидательного руководства</h4><blockquote>Успешный бизнес в&nbsp;руках целостного и&nbsp;энергичного руководителя, становится достижимой мечтой!</blockquote><p class=\"bex__sign\">Елена Светлая, учредитель и&nbsp;собственник «Издательского дома «Кислород»</p><p>Когда мы&nbsp;с&nbsp;соавторами решили написать эту книгу, нашей главной целью было помочь предпринимателям строить бизнес в&nbsp;гармонии с&nbsp;собой и&nbsp;своей командой, научившись управлять процессом плавно, в&nbsp;потоке, без&nbsp;изнуряющего достигаторства и&nbsp;агрессии.</p><p>Долгое время отношения между руководителем и&nbsp;командой строились по&nbsp;старой модели: начальник сверху – подчиненный снизу. Начальник жесткий, постоянно недоволен. Подчиненный – уставший, выгоревший, работает ради зарплаты. Это&nbsp;больше похоже на&nbsp;насилие, чем&nbsp;на&nbsp;сотрудничество: сверху давление – снизу вымученный отклик.</p><p>Многие по-прежнему путают силу с&nbsp;авторитарностью. Но&nbsp;если задуматься – в&nbsp;этом мало настоящего. Истинная сила – в&nbsp;мудрости и&nbsp;верных действиях, при&nbsp;этом во&nbsp;внутреннем спокойствии, гибкости, внимании и&nbsp;создании творческой атмосферы.</p><p>Сегодня мир меняется, и&nbsp;с&nbsp;ним меняется образ лидера. Сейчас ценятся другие качества: внутренний стержень, целостность, способность вдохновлять и&nbsp;договариваться, интуиция. Вместо жесткого контроля – партнерский подход. Вместо приказов – диалог. Особенно в&nbsp;наше цифровое время важны те качества, которые нельзя передать алгоритмам: эмпатия, интуиция, способность адаптироваться и&nbsp;управлять собой.</p><p>Я&nbsp;называю такой подход квантовым управлением. Это&nbsp;управление без&nbsp;давления, но&nbsp;с&nbsp;высокой осознанностью. Его основа – внимание и&nbsp;внутренняя связь. Куда направлено внимание лидера – туда движется и&nbsp;энергия команды.</p><p>Уже много лет я&nbsp;руковожу компанией и&nbsp;вижу: если внутри тебя порядок – вокруг тоже все&nbsp;выстраивается гармонично. Даже если люди работают из&nbsp;разных стран, как&nbsp;у&nbsp;нас – Болгария, Казахстан, Москва, – команда может быть как&nbsp;единый организм.</p><p>Так было не&nbsp;всегда. Мне тоже пришлось пройти свой путь – научиться быть в&nbsp;балансе, слышать себя и&nbsp;коллектив. Но&nbsp;когда ты создаешь пространство доверия – все&nbsp;начинает работать легче. Без&nbsp;лишнего контроля, без&nbsp;стресса – но&nbsp;с&nbsp;результатом.</p><p>Я&nbsp;научилась управлять из&nbsp;состояния спокойствия. Когда внутри есть ясность и&nbsp;ты точно понимаешь, чего хочешь – половина дела уже сделана. Достаточно поставить задачу с&nbsp;правильным намерением – и&nbsp;все&nbsp;начинает разворачиваться гармонично. Каждый участник команды действует по-своему, по-своему творит, но&nbsp;в&nbsp;рамках общей идеи. Я&nbsp;остаюсь рядом – лишь слегка касаясь процесса, чтобы подчеркнуть красоту картины или&nbsp;задать нужную окраску.</p>",
  "1": "<h4>Введение</h4><p>Мы&nbsp;живем во&nbsp;время больших перемен: компании банкротятся, появляются новые возможности, открываются новые бизнесы. Однако не&nbsp;всем суждено быть предпринимателями. Все&nbsp;больше сообразительных и&nbsp;талантливых людей предпочитают быть помощниками крупных руководителей. Какая профессия остается востребованной в&nbsp;кризис? Кого в&nbsp;смутное время точно не&nbsp;станут сокращать? Кому будут поднимать зарплату за&nbsp;постоянное и&nbsp;быстрое саморазвитие? Речь идет о&nbsp;бизнес-ассистенте. С&nbsp;такой профессией вы&nbsp;будете необходимы как&nbsp;воздух любому предпринимателю, бизнесмену, политику и&nbsp;депутату. А&nbsp;в&nbsp;кризис особенно ощущается нехватка стоящих кадров. Но&nbsp;как&nbsp;же стать действительно востребованным специалистом, вместо того чтобы продолжать работать за&nbsp;копейки секретарем, которого никто не&nbsp;ценит?</p><p>Меня зовут Танзиля Гарипова. Я&nbsp;обучаю и&nbsp;трудоустраиваю бизнес-ассистентов для&nbsp;руководителей по&nbsp;всей России и&nbsp;странам СНГ. Почему я&nbsp;этим занимаюсь? Потому что&nbsp;сама прошла путь от&nbsp;начинающего до&nbsp;высокопоставленного бизнес-ассистента. Я&nbsp;работала со&nbsp;многими руководителями, депутатами в&nbsp;Ижевске и&nbsp;Москве. И&nbsp;со&nbsp;временем стала успевать развивать собственные проекты. Несмотря на&nbsp;то что&nbsp;я&nbsp;с&nbsp;детства участвовала в&nbsp;разных проектах и&nbsp;всегда вела активный образ жизни, когда-то я&nbsp;тоже начинала с&nbsp;нуля. И&nbsp;я&nbsp;четко знала, зачем иду работать бизнес-ассистентом, для&nbsp;чего мне это&nbsp;нужно. За&nbsp;время работы с&nbsp;моими руководителями я&nbsp;получила колоссальный опыт, приобрела нужные знакомства, установила большое количество связей, которые в&nbsp;дальнейшем помогли развить уже мои личные проекты.</p><p>Я&nbsp;начинала с&nbsp;работы с&nbsp;Аязом Шабутдиновым, известным миллионером. Работала в&nbsp;режиме 24/7.&nbsp;Соглашусь, было нелегко: я&nbsp;нервничала, сожалела о&nbsp;принятом решении, думала, что&nbsp;это&nbsp;не&nbsp;мое. Но&nbsp;знаете, на&nbsp;самом деле все&nbsp;оказалось не&nbsp;так сложно. Поставила цель – достигла ее. В&nbsp;результате я&nbsp;серьезно выросла над&nbsp;собой и&nbsp;получила незаменимый опыт, который позволил мне обучать других ассистентов.</p><p>Как&nbsp;все&nbsp;начиналось? Ко&nbsp;мне стали обращаться мои же коллеги, друзья, знакомые, те, кто видел меня на&nbsp;различных конференциях. Люди подходили ко&nbsp;мне с&nbsp;вопросами. Спрашивали, как&nbsp;я&nbsp;все&nbsp;успеваю, где&nbsp;взять время, энергию, ресурсы и&nbsp;многое другое. В&nbsp;2016&nbsp;году я&nbsp;решила, что&nbsp;мои опыт и&nbsp;квалификация позволяют мне начать серьезно обучать бизнес-ассистентов. Коллег и&nbsp;новичков, которые заинтересованы в&nbsp;подобном обучении, с&nbsp;каждым днем становится все&nbsp;больше. А&nbsp;в&nbsp;сутках, к&nbsp;сожалению, всего 24&nbsp;часа. Вот так и&nbsp;появилась Академия бизнес-ассистентов Танзили Гариповой.</p><p>Сегодня востребованный бизнес-ассистент получает от&nbsp;30&nbsp;до&nbsp;150&nbsp;тысяч рублей в&nbsp;месяц (и&nbsp;это&nbsp;не&nbsp;предел). Кроме того, он&nbsp;приобретает колоссальный опыт и&nbsp;большие связи, умение управлять компанией и&nbsp;решать множество задач, выходить из&nbsp;любой конфликтной ситуации. Но&nbsp;как&nbsp;же действующему помощнику достичь таких результатов? И&nbsp;что&nbsp;делать тем, кто только хочет попробовать себя в&nbsp;роли бизнес-ассистента? На&nbsp;эти и&nbsp;другие волнующие вас вопросы я&nbsp;отвечу уже совсем скоро.</p><p>Какие же темы мы&nbsp;разберем?</p><ol><li>Кто такой бизнес-ассистент, и&nbsp;подойдет ли вам эта работа.</li><li>Каким на&nbsp;самом деле должен быть востребованный бизнес-ассистент.</li><li>Какой опыт и&nbsp;образование необходимы.</li></ol><p>В&nbsp;первую очередь вы&nbsp;узнаете, чем&nbsp;занимается бизнес-ассистент в&nbsp;реальной жизни. Сколько на&nbsp;самом деле зарабатывает такой специалист, и&nbsp;сколько способен зарабатывать профи. Что&nbsp;делать для&nbsp;того, чтобы ваш труд ценился не&nbsp;только на&nbsp;словах, но&nbsp;и&nbsp;в&nbsp;денежном эквиваленте. Вы&nbsp;также прочтете истории тех, кто уже успешно работает бизнес-ассистентом, и&nbsp;узнаете, какой путь они до&nbsp;этого прошли. И&nbsp;самое интересное: вы&nbsp;увидите обратную сторону медали – к&nbsp;чему нужно быть готовым и&nbsp;что&nbsp;предстоит делать. А&nbsp;еще вы&nbsp;узнаете, как&nbsp;в&nbsp;наиболее сжатые сроки совершить прорыв в&nbsp;своей карьере.</p><p>Для&nbsp;меня очень важно, чтобы у&nbsp;предпринимателей и&nbsp;крупных бизнесменов были действительно крутые помощники, которые дают результат. Академия бизнес-ассистентов Танзили Гариповой предоставляет эту возможность. Более 100&nbsp;руководителей уже нашли достойных ассистентов. И&nbsp;я&nbsp;очень этому рада.</p>",
  "3": "<h4>Предисловие</h4><p><b>Для кого написана эта книга?</b></p><p>Вторая моя книга полностью посвящена теме: «как&nbsp;стать классным бизнес-помощником и&nbsp;найти руководителя на&nbsp;всю жизнь (если вы&nbsp;понимаете, что&nbsp;быть бизнес-ассистентом&nbsp;– это&nbsp;ваше дело жизни)».</p><p>Прочитав книгу, вы&nbsp;узнаете: какими качествами должен обладать личный помощник, чему обязательно нужно научиться в&nbsp;процессе работы и&nbsp;какие подводные камни есть в&nbsp;профессии. А&nbsp;главное, Вы&nbsp;решите, является ли&nbsp;эта профессия по-настоящему вашей.</p><p>За&nbsp;многолетнюю практику работы в&nbsp;качестве бизнес-ассистента, я&nbsp;убедилась, что&nbsp;быть личным помощником&nbsp;– очень тяжелый и&nbsp;ответственный труд. Однако, если этот труд Вам в&nbsp;кайф и&nbsp;вы&nbsp;не&nbsp;боитесь трудностей, то&nbsp;из&nbsp;профессии бизнес-ассистента можно извлечь массу плюсов, как&nbsp;получилось у&nbsp;меня.</p><p>Проработав помощником у&nbsp;многих известных и&nbsp;состоятельных лиц, я&nbsp;обзавелась своей сетью контактов, приобрела многочисленные навыки, необходимые в&nbsp;бизнесе, и&nbsp;применила их&nbsp;для&nbsp;организации собственной компании.</p><p>Все это&nbsp;можете сделать и&nbsp;Вы! Если у&nbsp;вас достаточно сил и&nbsp;желания, то, как&nbsp;говорится, полный вперед! А&nbsp;я&nbsp;постараюсь помочь Вам на&nbsp;этом нелегком, но&nbsp;очень интересном пути.</p><p>Хочу выразить огромную благодарность Роману Масленникову за&nbsp;помощь в&nbsp;написании данной книги.</p><h4>10 советов, как&nbsp;протестировать себя на&nbsp;наличие задатков бизнес-ассистента</h4><ol><li>Бизнес-ассистент&nbsp;– это&nbsp;Многорук и&nbsp;Многоног. Вы&nbsp;чувствуете в&nbsp;себе потенциал, находясь в&nbsp;такой роли?</li><li>Бизнес-ассистент активен и&nbsp;успешен. Вы&nbsp;готовы быть на&nbsp;связи 24/7, чтобы одновременно решать свои дела и&nbsp;постоянно подстегивать свой личностный рост?</li><li>Бизнес-ассистент всегда должен излучать радость и&nbsp;любовь к&nbsp;жизни. Скажите честно, стакан наполовину пуст или&nbsp;наполовину полон?</li><li>Вы&nbsp;можете быть бизнес-ассистентом, если Ваши цели записаны на&nbsp;1–3 года вперед.</li><li>Вы&nbsp;можете стать бизнес-ассистентом, если точно знаете, чего Вы&nbsp;хотите от&nbsp;жизни.</li><li>Вы&nbsp;можете стать бизнес-ассистентом, если знаете свои сильные и&nbsp;слабые стороны.</li><li>Пропишите Ваши 10 сильных и&nbsp;10 слабых сторон.</li><li>К&nbsp;сильным сторонам бизнес-ассистента можно отнести: коммуникабельность, ответственность, честность, собранность, постоянное стремление учиться и&nbsp;развиваться, легкообучаемость, активность и&nbsp;чувство, когда Вам всегда всего мало. А&nbsp;также желание знакомиться и&nbsp;нарабатывать связи.</li><li>Слабые стороны бизнес-помощника противоположны сильным. Например: безответственность, потерянность, упадок сил и&nbsp;т. п.</li><li>Некоторые черты характера можно отнести как&nbsp;к&nbsp;недостаткам, так и&nbsp;к&nbsp;преимуществам. К&nbsp;примеру&nbsp;– скромность или&nbsp;гибкость. Ваша задача&nbsp;– всегда проявлять Ваши недостатки как&nbsp;достоинства в&nbsp;нужный момент времени.</li></ol><h4>10 обязательных навыков и&nbsp;качеств, которыми надо обладать ещё до&nbsp;начала поиска работы бизнес-ассистентом</h4><ol><li>Идеальное знание русского языка и, желательно, начальные навыки копирайтинга.</li><li>Отличный внешний вид, соответствующий вашему будущему руководителю: гладкая кожа, чистое лицо и&nbsp;волосы, опрятная одежда.</li><li>Приверженность здоровому образу жизни: спорт, правильное питание и&nbsp;полноценный сон. А&nbsp;именно:<ul><li>Минимум 3 раза в&nbsp;неделю необходимо заниматься спортом;</li><li>Вы&nbsp;должны правильно питаться, исключив из&nbsp;рациона газированные напитки, фаст-фуд и&nbsp;другую вредную пищу;</li><li>Нужна привычка высыпаться. Ночью надо спать не&nbsp;менее 7 часов.</li><li>Кстати, сон в&nbsp;промежутке с&nbsp;19:00 до&nbsp;20:00 заменяет 5 часов ночного сна. А&nbsp;короткий сон днём, не&nbsp;более 20 минут, восстанавливает силы в&nbsp;2 раза эффективнее, чем ночью.</li></ul></li><li>Умение сочетать одежду. Бизнес-ассистенту подходит деловой стиль или&nbsp;casual-стиль. Ни&nbsp;в&nbsp;коем случае не&nbsp;подойдет спортивная одежда или&nbsp;просто безвкусица.</li><li>Знание правил математики. Вам нужно уметь считать, работать с&nbsp;цифрами, быть внимательным.</li><li>Знание основ финансовой грамотности.</li><li>Любовь к&nbsp;чтению. Бизнес-ассистент должен читать как&nbsp;минимум одну книгу в&nbsp;неделю.</li><li>Знание себя самого. Важно обязательно пройти тест на&nbsp;уровень IQ. Желательно пройти профайлинг.<br>К&nbsp;примеру, вам надо знать: когда точно вы&nbsp;хотите выйти замуж? Когда планируете родить детей? Если вы&nbsp;хотите сделать это&nbsp;в&nbsp;ближайший год, то&nbsp;не&nbsp;стоит устраиваться на&nbsp;должность бизнес-ассистента.</li><li>Умение вкусно готовить. Этот навык пригодится на&nbsp;днях рождения, корпоративах, деловых home-party и&nbsp;других мероприятиях, где Вы&nbsp;будете находиться вместе с&nbsp;руководителем.</li><li>Умение коммуницировать. Нужно общаться со&nbsp;многими людьми и&nbsp;понимать правила коммуникации, чтобы легко их&nbsp;считывать. Важно «чувствовать» человека в&nbsp;ходе общения.</li></ol>",
  "4": "<h4>Об&nbsp;авторе</h4><p>Танзиля Гарипова&nbsp;– родилась 28 октября, окончила Московский Государственный Университет им. Ломоносова и&nbsp;получила специальное образование при&nbsp;Плехановском университете.</p><ul><li>Экс-ассистент предпринимателя и&nbsp;основателя холдинга «Like» Аяза Шабутдинова.</li><li>Предприниматель.</li><li>Создатель и&nbsp;автор Академии Бизнес-Ассистентов.</li></ul><p>С&nbsp;первым своим руководителем Танзиля Гарипова проработала 2 года и&nbsp;смогла не&nbsp;только утвердиться в&nbsp;должности личного ассистента, но&nbsp;и&nbsp;получить колоссальный опыт и&nbsp;нужные знакомства для&nbsp;создания новых собственных проектов.</p><p>В&nbsp;2014 году Танзиля бросила себе вызов и&nbsp;начала работу с&nbsp;известным молодым миллионером Аязом Шабутдиновым.</p><p>К&nbsp;Танзиле стали обращаться за&nbsp;консультациями не&nbsp;только коллеги, но&nbsp;и&nbsp;начали приезжать из&nbsp;разных стран бизнес-ассистенты с&nbsp;вопросами и&nbsp;просьбами: рассмотреть их&nbsp;рабочие ситуации, подобрать наиболее эффективные «инструменты» для&nbsp;повседневной работы, найти общий язык с&nbsp;директорами, мотивировать руководителей платить больше и&nbsp;многим другим…</p><p>Это привело к&nbsp;открытию Академии Бизнес-Ассистентов.</p><h4>Предисловие</h4><p><b>Для кого написана эта книга?</b></p><p>Ее, в&nbsp;первую очередь, стоит прочесть директорам крупных и&nbsp;средних компаний. Тем, чей день представляет собой один сплошной дедлайн.</p><p>В&nbsp;книге Вы&nbsp;найдете: как&nbsp;правильно выбрать себе помощника, какими качествами должен обладать Ваш идеальный кандидат, какие полномочия можно и&nbsp;нужно делегировать, а&nbsp;какие стоит оставить за&nbsp;собой.</p><p>Сотрудники, которые претендуют на&nbsp;должность личного помощника или&nbsp;ассистента, тоже найдут для&nbsp;себя много интересного и&nbsp;полезного здесь.</p><p>Прочитав книгу, Вы&nbsp;поймете: можете ли&nbsp;вы&nbsp;стать личным ассистентом, достаточно ли&nbsp;у&nbsp;вас знаний и&nbsp;умений, подходите ли&nbsp;Вы&nbsp;для&nbsp;этой должности по&nbsp;складу характера.</p><p>При написании книги я&nbsp;преследовала две цели:</p><p>Во-первых, помочь директорам любого масштаба облегчить свою жизнь, при&nbsp;этом, не&nbsp;навредив бизнесу и&nbsp;освободив время для&nbsp;другой, более продуктивной деятельности.</p><p>Во-вторых, обучить ассистентов таким умениям, благодаря которым они станут настоящими профессионалами своего дела, ведь профессия личного помощника также важна, как&nbsp;профессия юриста или&nbsp;экономиста.</p><p>На&nbsp;этом, введение можно завершить и&nbsp;приступить к&nbsp;практике. Точнее, к&nbsp;самим советам. Приятного Вам чтения!</p>"
};
  const BOOK_AUTHORS = { 0: 'Елена Светлая и соавторы' }; // по умолчанию – Танзиля Гарипова
  const box = document.createElement('div');
  box.className = 'bex'; box.hidden = true;
  box.innerHTML = '<div class="bex__shade" data-close></div><div class="bex__win" role="dialog" aria-modal="true" aria-labelledby="bexTitle">'
    + '<button class="bex__x" type="button" data-close aria-label="Закрыть"></button>'
    + '<p class="bex__lab">Отрывок из книги</p><h3 class="bex__title" id="bexTitle"></h3><p class="bex__author">Танзиля Гарипова</p>'
    + '<div class="bex__text"></div><div class="bex__foot"></div></div>';
  document.body.appendChild(box);
  const close = () => { box.hidden = true; document.documentElement.classList.remove('bex-open'); };
  box.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) close(); });
  btns.forEach((b) => b.addEventListener('click', () => {
    const card = b.closest('.kb');
    const i = b.dataset.excerpt;
    box.querySelector('.bex__title').textContent = card.querySelector('h3').textContent;
    box.querySelector('.bex__author').textContent = BOOK_AUTHORS[i] || 'Танзиля Гарипова';
    const txt = BOOK_EXCERPTS[i];
    box.querySelector('.bex__text').innerHTML = txt || '<p class="bex__stub">[Отрывок — вставить 1–2 страницы из текста книги, который даст Танзиля]</p>';
    const lit = b.dataset.litres;
    box.querySelector('.bex__foot').innerHTML = lit ? '<a class="btn btn--dark" href="' + lit + '" target="_blank" rel="noopener">Читать полностью на Литрес</a>' : '';
    box.hidden = false; document.documentElement.classList.add('bex-open');
    box.querySelector('.bex__win').scrollTop = 0;
  }));
})();
