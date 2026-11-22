/* ============ Видео Танзили: ролик запускается по нажатию, остальные ставятся на паузу ============ */
document.querySelectorAll('.tvr__card').forEach((card) => {
  const v = card.querySelector('video'), b = card.querySelector('.tvr__play');
  if (!v || !b) return;
  b.addEventListener('click', () => {
    document.querySelectorAll('.tvr video').forEach((o) => { if (o !== v) o.pause(); });
    v.controls = true; card.classList.add('is-playing');
    const p = v.play(); if (p && p.catch) p.catch(() => {});
  });
  v.addEventListener('play', () => document.querySelectorAll('.tvr video').forEach((o) => { if (o !== v) o.pause(); }));
});

/* ============ Кнопки data-vid: вертикальное видео в окне поверх страницы, закрывается крестиком ============ */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-vid]');
  if (!b) return;
  e.preventDefault();
  document.querySelectorAll('.tvr video').forEach((o) => o.pause());
  const pop = document.createElement('div');
  pop.className = 'yt-pop vid-pop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-modal', 'true');
  pop.innerHTML = '<button class="yt-pop__x" type="button" aria-label="Закрыть"><img src="assets/img/close.svg" alt=""></button>'
    + '<div class="vid-pop__frame"><video src="' + b.dataset.vid + '"' + (b.dataset.poster ? ' poster="' + b.dataset.poster + '"' : '') + ' controls autoplay playsinline></video></div>';
  document.body.appendChild(pop);
  document.documentElement.classList.add('mdl-lock');
  requestAnimationFrame(() => pop.classList.add('is-open'));
  const close = () => {
    pop.querySelector('video').pause();
    pop.classList.remove('is-open');
    document.documentElement.classList.remove('mdl-lock');
    setTimeout(() => pop.remove(), 300);
    b.focus({ preventScroll: true });
  };
  pop.querySelector('.yt-pop__x').addEventListener('click', close);
  pop.addEventListener('click', (ev) => { if (ev.target === pop) close(); });
});
