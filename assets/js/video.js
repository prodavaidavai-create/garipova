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
