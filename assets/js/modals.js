/* Всплывающие окна по кнопкам: квиз подбора (макет 858:2567), консультация, курс, обучение, франшиза.
   Ссылка с data-modal="quiz|consult|kurs|obuch|franchise" открывает окно. Файл подключается до main.js,
   чтобы формы в окнах получили ту же проверку полей, сегменты и экран «Спасибо». */
(() => {
  const M = {
    // пример договора: пока белая заглушка – когда будет файл, сюда встанет PDF с кнопкой «Скачать PDF»
    // общая форма обратной связи (как в конце главной); тема подставляется из data-topic кнопки
    lead: `<div class="leadform leadform--final mdl__lead"><div class="container leadform__inner"><div class="leadform__left"><h2 class="sec-title">Расскажите о задаче –<br>подскажем, с чего начать</h2><ol class="form__steps"><li><span class="num">(01)</span>Свяжемся в рабочее время: Пн–Пт, 9:00–18:00</li><li><span class="num">(02)</span>Бесплатно составим критерии подбора</li><li><span class="num">(03)</span>Расскажем условия и стоимость выбранного направления</li></ol><div class="contact-card"><img class="contact-card__ava" src="assets/img/contact-ava.jpg" alt=""><div><b>Танзиля Гарипова</b><a href="tel:+79689488888"><span class="flag"></span>+7 968 948 8888</a></div><i></i><span>Пн–Пт<br>9:00–18:00</span></div></div><form class="form" novalidate><input class="form__input" type="text" name="name" placeholder="Имя" autocomplete="name"><input class="form__input" type="email" name="email" placeholder="Email" autocomplete="email"><label class="form__phone"><span class="flag"></span><span>+7</span><input type="tel" name="phone" placeholder="Телефон" autocomplete="tel-national"></label><label class="form__select"><select name="topic" required aria-label="Что вас интересует?"><option value="" selected disabled>Что вас интересует?</option><option>Подбор ассистента</option><option>Шеринг ассистента</option><option>Подбор любого персонала</option><option>Курс для руководителей</option><option>Обучение ассистентов</option><option>Трудоустройство</option><option>Консультация с Танзилей</option><option>Франшиза</option><option>Сотрудничество</option><option>Отправить резюме</option><option>Другое</option></select></label><label class="form__file" hidden><input type="file" name="resume" accept=".pdf,.doc,.docx,.rtf,.txt,.jpg,.jpeg,.png"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21.4 11.1l-8.5 8.5a5.5 5.5 0 01-7.8-7.8l8.5-8.5a3.7 3.7 0 015.2 5.2l-8.5 8.5a1.8 1.8 0 01-2.6-2.6l7.8-7.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="form__file-t">Прикрепить резюме</span><small>PDF, DOC, JPG&nbsp;– до&nbsp;5&nbsp;МБ</small></label><div class="form__via"><span>Как удобнее связаться?</span><div class="seg"><button type="button" class="is-active"><img src="assets/img/whatsapp.svg" alt="">Whats App</button><button type="button"><img src="assets/img/telegram.svg" alt="">Telegram</button><button type="button">Звонок</button></div></div><button class="btn btn--white form__submit" type="submit">Отправить заявку</button><label class="consent"><input type="checkbox" name="consent"><span class="consent__box" aria-hidden="true"></span><span class="form__policy">Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных</span></label></form></div></div>`,
    dogovor: `<div class="dogph"><p class="dogph__load">Загружаем договор…</p></div>`,
    quiz: `<section class="quiz quiz--wine is-first mdl__quiz">  <div class="container quiz__inner">
    <div class="quiz__left">
      <p class="sec-head__label">Подбор за 1 минуту <span class="tsticker" style="--r:-4deg">по&nbsp;телефону или в&nbsp;мессенджере</span></p>
      <h2 class="quiz__title">Ответьте на 5 вопросов, подскажем, кто вам нужен</h2>
      <p class="quiz__lead">Покажем подходящий формат, сроки и ориентир по стоимости. Результат сразу после ответов.</p>
      <ol class="quiz__perks"><li><span class="num">(01)</span>5 вопросов – меньше минуты</li><li><span class="num">(02)</span>Формат, сроки и бюджет под вашу задачу</li><li><span class="num">(03)</span>Персональная подборка от Академии</li></ol>
          </div>
    <form class="quiz__card" novalidate>
      <div class="quiz__progress" aria-hidden="true">
        <div class="quiz__meta"><span>Шаг 1 из 6</span><span class="hand">(Тип сотрудника)</span></div>
        <div class="quiz__bar"><i></i></div>
      </div>
      <fieldset class="quiz__step is-active" data-hand="(Тип сотрудника)" data-key="who">
        <legend class="quiz__q">Кого вы ищете?</legend>
        <div class="quiz__opts">
          <label class="qopt"><input type="radio" name="who" value="бизнес-ассистента"><span><b>Бизнес-ассистента</b><small>задачи бизнеса и руководителя</small></span></label>
          <label class="qopt"><input type="radio" name="who" value="личного ассистента"><span><b>Личного ассистента</b><small>быт, семья, поездки</small></span></label>
          <label class="qopt"><input type="radio" name="who" value="ассистента в компанию"><span><b>Ассистента в компанию</b><small>в команду или отдел</small></span></label>
          <label class="qopt"><input type="radio" name="who" value="сотрудника"><span><b>Другого сотрудника</b><small>менеджер, HR, бухгалтер, дом</small></span></label>
        </div>
      </fieldset>
      <fieldset class="quiz__step" data-hand="(Формат)" data-key="where">
        <legend class="quiz__q">Какой формат работы?</legend>
        <div class="quiz__opts">
          <label class="qopt"><input type="radio" name="where" value="удалённо"><span><b>Удалённо</b></span></label>
          <label class="qopt"><input type="radio" name="where" value="в офисе"><span><b>В офисе</b></span></label>
          <label class="qopt"><input type="radio" name="where" value="гибрид"><span><b>Гибрид</b></span></label>
          <label class="qopt"><input type="radio" name="where" value="с разъездами"><span><b>С разъездами</b></span></label>
        </div>
      </fieldset>
      <fieldset class="quiz__step" data-hand="(Занятость)" data-key="load">
        <legend class="quiz__q">Какая занятость?</legend>
        <div class="quiz__opts">
          <label class="qopt"><input type="radio" name="load" value="полный день"><span><b>Полный день</b></span></label>
          <label class="qopt"><input type="radio" name="load" value="частичная занятость"><span><b>Частичная</b></span></label>
          <label class="qopt"><input type="radio" name="load" value="на часы"><span><b>На часы – шеринг</b><small>ассистент Академии без найма</small></span></label>
        </div>
      </fieldset>
      <fieldset class="quiz__step" data-hand="(Бюджет)" data-key="pay">
        <legend class="quiz__q">Какая зарплатная вилка?</legend>
        <div class="quiz__opts">
          <label class="qopt"><input type="radio" name="pay" value="до 60 тыс. ₽"><span><b>До 60 тыс. ₽</b></span></label>
          <label class="qopt"><input type="radio" name="pay" value="60–100 тыс. ₽"><span><b>60–100 тыс. ₽</b></span></label>
          <label class="qopt"><input type="radio" name="pay" value="100–150 тыс. ₽"><span><b>100–150 тыс. ₽</b></span></label>
          <label class="qopt"><input type="radio" name="pay" value="от 150 тыс. ₽"><span><b>От 150 тыс. ₽</b></span></label>
          <label class="qopt"><input type="radio" name="pay" value="пока не знаю"><span><b>Пока не знаю</b><small>подскажем по рынку</small></span></label>
        </div>
      </fieldset>
      <fieldset class="quiz__step" data-hand="(Сроки)" data-key="when">
        <legend class="quiz__q">Когда нужен сотрудник?</legend>
        <div class="quiz__opts">
          <label class="qopt"><input type="radio" name="when" value="срочно"><span><b>Срочно</b><small>за 1–2 недели</small></span></label>
          <label class="qopt"><input type="radio" name="when" value="в течение месяца"><span><b>В течение месяца</b></span></label>
          <label class="qopt"><input type="radio" name="when" value="присматриваюсь"><span><b>Пока присматриваюсь</b></span></label>
        </div>
      </fieldset>
      <fieldset class="quiz__step quiz__step--form" data-hand="(Ваши данные)">
        <legend class="quiz__q">Куда прислать подборку?</legend>
        <p class="quiz__note">Пришлём формат, сроки и ориентир по стоимости. Свяжемся в рабочее время: Пн–Пт, 9:00–18:00.</p>
        <input class="form__input" type="text" name="name" placeholder="Имя" autocomplete="name">
        <label class="form__phone"><span class="flag"></span><span>+7</span><input type="tel" name="phone" placeholder="Телефон" autocomplete="tel-national"></label>
        <div class="form__via"><span>Как удобнее связаться?</span>
          <div class="seg"><button type="button" class="is-active">WhatsApp</button><button type="button">Telegram</button><button type="button">Звонок</button></div>
        </div>
        <button class="btn btn--white quiz__send" type="submit">Получить подборку</button>
        <label class="consent"><input type="checkbox" name="consent"><span class="consent__box" aria-hidden="true"></span><span class="form__policy">Вы соглашаетесь с политикой обработки персональных данных</span></label>
      </fieldset>
      <div class="quiz__step quiz__done" data-hand="">
        <img class="quiz__ok3d" src="assets/img/3d/success.png" alt="">
        <h3 class="quiz__q">Благодарю! Ваша заявка принята</h3>
        <p class="quiz__note">Мы свяжемся с&nbsp;вами в&nbsp;рабочее время: Пн–Пт, 9:00–18:00.<br>Если хотите быстрее&nbsp;– напишите нам сами в&nbsp;<a href="https://wa.me/79688888707" target="_blank" rel="noopener">WhatsApp</a> или&nbsp;<a href="https://t.me/TanzilyaGaripova" target="_blank" rel="noopener">Telegram</a>.<br>Ответим в&nbsp;течение 15&nbsp;минут.</p>
      </div>
      <div class="quiz__nav">
        <button class="quiz__back" type="button" hidden>← Назад</button>
        <span class="quiz__hint"></span>
        <button class="btn btn--champ quiz__next" type="button">Далее</button>
      </div>
    </form>
  </div></section>`,
    consult: `<div class="leadform leadform--final mdl__lead"><div class="container leadform__inner"><div class="leadform__left"><h2 class="sec-title">Личная консультация с Танзилей</h2><div class="contact-card"><img class="contact-card__ava" src="assets/img/contact-ava.jpg" alt=""><div><b>Танзиля Гарипова</b><a href="tel:+79689488888"><span class="flag"></span>+7 968 948 8888</a></div><i></i><span>Пн–Пт<br>9:00–18:00</span></div></div><form class="form" novalidate><input class="form__input" type="text" name="name" placeholder="Имя" autocomplete="name"><label class="form__phone"><span class="flag"></span><span>+7</span><input type="tel" name="phone" placeholder="Телефон" autocomplete="tel-national"></label><label class="form__select"><select name="topic" required aria-label="Что вас интересует?"><option value="" disabled>Что вас интересует?</option><option>Подбор ассистента</option><option>Шеринг ассистента</option><option>Подбор любого персонала</option><option>Курс для руководителей</option><option>Обучение ассистентов</option><option>Трудоустройство</option><option selected>Консультация с Танзилей</option><option>Франшиза</option><option>Сотрудничество</option><option>Отправить резюме</option><option>Другое</option></select></label><label class="form__file" hidden><input type="file" name="resume" accept=".pdf,.doc,.docx,.rtf,.txt,.jpg,.jpeg,.png"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21.4 11.1l-8.5 8.5a5.5 5.5 0 01-7.8-7.8l8.5-8.5a3.7 3.7 0 015.2 5.2l-8.5 8.5a1.8 1.8 0 01-2.6-2.6l7.8-7.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="form__file-t">Прикрепить резюме</span><small>PDF, DOC, JPG&nbsp;– до&nbsp;5&nbsp;МБ</small></label><div class="form__via"><span>Как удобнее связаться?</span><div class="seg"><button type="button" class="is-active"><img src="assets/img/whatsapp.svg" alt="">Whats App</button><button type="button"><img src="assets/img/telegram.svg" alt="">Telegram</button><button type="button">Звонок</button></div></div><textarea class="form__input form__textarea" name="topic" rows="4" placeholder="Кратко опишите задачу"></textarea><button class="btn btn--white form__submit" type="submit">Записаться на консультацию</button><label class="consent"><input type="checkbox" name="consent"><span class="consent__box" aria-hidden="true"></span><span class="form__policy">Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных</span></label></form></div></div>`,
    ask: `<div class="leadform leadform--final mdl__lead"><div class="container leadform__inner"><div class="leadform__left"><h2 class="sec-title">Задай вопрос<br class="br-d"> Танзиле Гариповой</h2><div class="contact-card"><img class="contact-card__ava" src="assets/img/contact-ava.jpg" alt=""><div><b>Танзиля Гарипова</b><a href="tel:+79689488888"><span class="flag"></span>+7 968 948 8888</a></div><i></i><span>Пн–Пт<br>9:00–18:00</span></div></div><form class="form" novalidate><input class="form__input" type="text" name="name" placeholder="Имя" autocomplete="name"><label class="form__phone"><span class="flag"></span><span>+7</span><input type="tel" name="phone" placeholder="Телефон" autocomplete="tel-national"></label><div class="form__via"><span>Как удобнее связаться?</span><div class="seg"><button type="button" class="is-active"><img src="assets/img/whatsapp.svg" alt="">Whats App</button><button type="button"><img src="assets/img/telegram.svg" alt="">Telegram</button><button type="button">Звонок</button></div></div><textarea class="form__input form__textarea" name="question" rows="4" placeholder="Какой у вас вопрос?"></textarea><button class="btn btn--white form__submit" type="submit">Отправить вопрос</button><label class="consent"><input type="checkbox" name="consent"><span class="consent__box" aria-hidden="true"></span><span class="form__policy">Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных</span></label></form></div></div>`,
    kurs: `<div class="leadform leadform--final mdl__lead"><div class="container leadform__inner"><div class="leadform__left"><h2 class="sec-title">Курс для руководителей</h2><ol class="form__steps"><li><span class="num">(01)</span>Тарифы: 50 000 · 80 000 · 120 000 ₽</li><li><span class="num">(02)</span>Рассрочка – от 5 000 ₽ в месяц</li><li><span class="num">(03)</span>1-й урок – бесплатно</li></ol><div class="contact-card"><img class="contact-card__ava" src="assets/img/contact-ava.jpg" alt=""><div><b>Танзиля Гарипова</b><a href="tel:+79689488888"><span class="flag"></span>+7 968 948 8888</a></div><i></i><span>Пн–Пт<br>9:00–18:00</span></div></div><form class="form" novalidate><input class="form__input" type="text" name="name" placeholder="Имя" autocomplete="name"><label class="form__phone"><span class="flag"></span><span>+7</span><input type="tel" name="phone" placeholder="Телефон" autocomplete="tel-national"></label><label class="form__select"><select name="topic" required aria-label="Что вас интересует?"><option value="" disabled>Что вас интересует?</option><option>Подбор ассистента</option><option>Шеринг ассистента</option><option>Подбор любого персонала</option><option selected>Курс для руководителей</option><option>Обучение ассистентов</option><option>Трудоустройство</option><option>Консультация с Танзилей</option><option>Франшиза</option><option>Сотрудничество</option><option>Отправить резюме</option><option>Другое</option></select></label><label class="form__file" hidden><input type="file" name="resume" accept=".pdf,.doc,.docx,.rtf,.txt,.jpg,.jpeg,.png"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21.4 11.1l-8.5 8.5a5.5 5.5 0 01-7.8-7.8l8.5-8.5a3.7 3.7 0 015.2 5.2l-8.5 8.5a1.8 1.8 0 01-2.6-2.6l7.8-7.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="form__file-t">Прикрепить резюме</span><small>PDF, DOC, JPG&nbsp;– до&nbsp;5&nbsp;МБ</small></label><div class="form__via"><span>Тариф</span><div class="seg seg--text"><button type="button" class="is-active">50 000 ₽</button><button type="button">80 000 ₽</button><button type="button">120 000 ₽</button></div></div><div class="form__via"><span>Как удобнее связаться?</span><div class="seg"><button type="button" class="is-active"><img src="assets/img/whatsapp.svg" alt="">Whats App</button><button type="button"><img src="assets/img/telegram.svg" alt="">Telegram</button><button type="button">Звонок</button></div></div><button class="btn btn--white form__submit" type="submit">Выбрать тариф курса</button><label class="consent"><input type="checkbox" name="consent"><span class="consent__box" aria-hidden="true"></span><span class="form__policy">Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных</span></label></form></div></div>`,
    obuch: `<div class="leadform leadform--final mdl__lead"><div class="container leadform__inner"><div class="leadform__left"><h2 class="sec-title">Обучение бизнес-ассистентов</h2><ol class="form__steps"><li><span class="num">(01)</span>Тарифы: Базовый (от 25 000 ₽), Business, VIP, Exclusive</li><li><span class="num">(02)</span>Проверка заданий – с тарифа Business</li><li><span class="num">(03)</span>Трудоустройство – в тарифах VIP и Exclusive</li></ol><div class="contact-card"><img class="contact-card__ava" src="assets/img/contact-ava.jpg" alt=""><div><b>Танзиля Гарипова</b><a href="tel:+79689488888"><span class="flag"></span>+7 968 948 8888</a></div><i></i><span>Пн–Пт<br>9:00–18:00</span></div></div><form class="form" novalidate><input class="form__input" type="text" name="name" placeholder="Имя" autocomplete="name"><label class="form__phone"><span class="flag"></span><span>+7</span><input type="tel" name="phone" placeholder="Телефон" autocomplete="tel-national"></label><label class="form__select"><select name="topic" required aria-label="Что вас интересует?"><option value="" disabled>Что вас интересует?</option><option>Подбор ассистента</option><option>Шеринг ассистента</option><option>Подбор любого персонала</option><option>Курс для руководителей</option><option selected>Обучение ассистентов</option><option>Трудоустройство</option><option>Консультация с Танзилей</option><option>Франшиза</option><option>Сотрудничество</option><option>Отправить резюме</option><option>Другое</option></select></label><label class="form__file" hidden><input type="file" name="resume" accept=".pdf,.doc,.docx,.rtf,.txt,.jpg,.jpeg,.png"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21.4 11.1l-8.5 8.5a5.5 5.5 0 01-7.8-7.8l8.5-8.5a3.7 3.7 0 015.2 5.2l-8.5 8.5a1.8 1.8 0 01-2.6-2.6l7.8-7.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="form__file-t">Прикрепить резюме</span><small>PDF, DOC, JPG&nbsp;– до&nbsp;5&nbsp;МБ</small></label><div class="form__via"><span>Ваш опыт</span><div class="seg seg--text"><button type="button" class="is-active">Я новичок</button><button type="button">Уже ассистент</button></div></div><div class="form__via"><span>Как удобнее связаться?</span><div class="seg"><button type="button" class="is-active"><img src="assets/img/whatsapp.svg" alt="">Whats App</button><button type="button"><img src="assets/img/telegram.svg" alt="">Telegram</button><button type="button">Звонок</button></div></div><button class="btn btn--white form__submit" type="submit">Выбрать ступень обучения</button><label class="consent"><input type="checkbox" name="consent"><span class="consent__box" aria-hidden="true"></span><span class="form__policy">Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных</span></label></form></div></div>`,
    franchise: `<div class="leadform leadform--final mdl__lead"><div class="container leadform__inner"><div class="leadform__left"><h2 class="sec-title">Свободен ли ваш город?</h2><ol class="form__steps"><li><span class="num">(01)</span>Окупаемость – до 4 месяцев</li><li><span class="num">(02)</span>Личный куратор на время запуска</li><li><span class="num">(03)</span>Обучение, стандарты и макеты рекламы</li></ol><div class="contact-card"><img class="contact-card__ava" src="assets/img/contact-ava.jpg" alt=""><div><b>Танзиля Гарипова</b><a href="tel:+79689488888"><span class="flag"></span>+7 968 948 8888</a></div><i></i><span>Пн–Пт<br>9:00–18:00</span></div></div><form class="form" novalidate><input class="form__input" type="text" name="name" placeholder="Имя" autocomplete="name"><input class="form__input" type="text" name="city" placeholder="Ваш город"><label class="form__phone"><span class="flag"></span><span>+7</span><input type="tel" name="phone" placeholder="Телефон" autocomplete="tel-national"></label><button class="btn btn--white form__submit" type="submit">Проверить город</button><label class="consent"><input type="checkbox" name="consent"><span class="consent__box" aria-hidden="true"></span><span class="form__policy">Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных</span></label></form></div></div>`
  };
  // секция страницы с data-as-modal="имя" уезжает в модальное окно: на странице её нет, открывается по кнопке data-modal="имя"
  document.querySelectorAll('section[data-as-modal]').forEach((sec) => {
    const inner = sec.querySelector('.leadform__inner');
    if (!inner) return;
    M[sec.dataset.asModal] = '<div class="leadform leadform--final mdl__lead"><div class="container leadform__inner">' + inner.innerHTML + '</div></div>';
    sec.remove();
  });
  const close = '<button class="mdl__x" type="button" data-close aria-label="Закрыть"><img src="assets/img/close.svg" alt=""></button>';
  Object.entries(M).forEach(([k, html]) => {
    const m = document.createElement('div');
    m.className = 'mdl mdl--' + k;
    m.id = 'mdl-' + k;
    m.hidden = true;
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.innerHTML = close + '<div class="mdl__body">' + html + '</div>';
    document.body.appendChild(m);
    // окно «1-й урок»: на телефоне – шторка снизу (bottom sheet), крестик внутри шторки
    if (k === 'lesson') { m.classList.add('mdl--sheet'); m.querySelector('.mdl__body > *').prepend(m.querySelector('.mdl__x')); }
  });

  let opened = null, lastFocus = null;
  const reset = (m) => {
    m.querySelectorAll('form.form.is-done').forEach((f) => { f.querySelector('.form__done')?.remove(); f.classList.remove('is-done'); f.style.minHeight = ''; f.reset(); f.dispatchEvent(new Event('input')); });
    const q = m.querySelector('.quiz');
    if (q && q.classList.contains('is-done') && q.quizReset) q.quizReset();
  };
  function open(k) {
    const m = document.getElementById('mdl-' + k);
    if (!m) return false;
    if (opened) shut(true);
    const menu = document.getElementById('menu');
    if (menu && menu.classList.contains('is-open')) document.getElementById('menuClose')?.click();
    lastFocus = document.activeElement;
    m.hidden = false;
    m.scrollTop = 0;
    // «Пример договора»: текст договора подгружается из assets/docs/dogovor.html при первом открытии
    const dph = k === 'dogovor' && m.querySelector('.dogph:not([data-ok])');
    if (dph) { dph.dataset.ok = '1'; fetch('assets/docs/dogovor.html?v=20261119a').then((r) => r.ok ? r.text() : Promise.reject()).then((h) => { dph.innerHTML = h; dph.classList.add('is-doc'); }).catch(() => { delete dph.dataset.ok; dph.innerHTML = '<p class="dogph__load">Не удалось загрузить договор. Попробуйте ещё раз.</p>'; }); }
    document.documentElement.classList.add('mdl-lock');
    requestAnimationFrame(() => m.classList.add('is-open'));
    opened = m;
    return true;
  }
  function shut(now) {
    const m = opened;
    if (!m) return;
    opened = null;
    m.classList.remove('is-open');
    document.documentElement.classList.remove('mdl-lock');
    const fin = () => { m.hidden = true; reset(m); };
    now ? fin() : setTimeout(fin, 350);
    lastFocus?.focus?.({ preventScroll: true });
  }
  // захват на window: срабатывает раньше плавной прокрутки по якорям
  window.addEventListener('click', (e) => {
    const t = e.target.closest('[data-modal]');
    if (t && open(t.dataset.modal)) {
      e.preventDefault(); e.stopPropagation();
      const sel = t.dataset.topic && document.querySelector('#mdl-' + t.dataset.modal + ' select[name="topic"]');
      const o = sel && [...sel.options].find((x) => x.text.replace(/\u00a0/g, ' ') === t.dataset.topic);
      if (o) { o.selected = true; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      return;
    }
    if (opened && e.target.closest('[data-close]')) shut();   // окно закрывается только крестиком: клик мимо формы его не закрывает
  }, true);
  // Esc окно не закрывает: Esc закрывает только открытый список селекта внутри формы
  // ссылка вида page.html#modal-quiz открывает окно после загрузки
  const h = location.hash.match(/^#modal-(\w+)/);
  if (h) setTimeout(() => open(h[1]), 600);

  /* ============ Квиз «Подбор за 1 минуту»: общий для страницы «Услуги», «Контакты» и окна ============ */
  window.initQuiz = (quiz) => {
    const form = quiz.querySelector('.quiz__card');
    const steps = [...form.querySelectorAll('.quiz__step')];
    const TOTAL = steps.filter((s) => s.dataset.key).length + 1; // + шаг с контактами
    const elStep = quiz.querySelector('.quiz__meta span:first-child');
    const elHand = quiz.querySelector('.quiz__meta .hand');
    const elBar = quiz.querySelector('.quiz__bar i');
    const elHint = quiz.querySelector('.quiz__hint');
    const btnBack = quiz.querySelector('.quiz__back');
    const btnNext = quiz.querySelector('.quiz__next');
    const HINT = elHint.textContent;
    const box = quiz.closest('.mdl');
    let cur = 0;
    const answer = (key) => form.querySelector(`input[name="${key}"]:checked`)?.value;
    function show(i) {
      steps[cur].classList.remove('is-active');
      cur = i;
      steps[cur].classList.add('is-active');
      const isForm = steps[cur].classList.contains('quiz__step--form');
      const isDone = steps[cur].classList.contains('quiz__done');
      quiz.classList.toggle('is-form', isForm);
      quiz.classList.toggle('is-done', isDone);
      quiz.classList.toggle('is-first', cur === 0); // на первом шаге выбор сам переводит дальше
      elStep.textContent = `Шаг ${Math.min(cur + 1, TOTAL)} из ${TOTAL}`;
      elHand.textContent = steps[cur].dataset.hand || '';
      elBar.style.width = `${(Math.min(cur + 1, TOTAL) / TOTAL) * 100}%`;
      btnBack.hidden = cur === 0 || isDone;
      elHint.textContent = HINT;
      elHint.classList.remove('is-error');
      // на телефоне возвращаем к началу карточки, чтобы новый вопрос был виден
      const top = form.getBoundingClientRect().top;
      if (top < 0) (box || window).scrollBy({ top: top - 90, behavior: 'smooth' });
    }
    function next() {
      // со шага контактов и с «Спасибо» дальше только через отправку формы
      if (!steps[cur].dataset.key) return;
      const key = steps[cur].dataset.key;
      if (key && !answer(key)) {
        elHint.textContent = 'Выберите вариант, чтобы продолжить';
        elHint.classList.add('is-error');
        return;
      }
      show(cur + 1);
    }
    btnNext.addEventListener('click', next);
    btnBack.addEventListener('click', () => show(cur - 1));
    // выбор варианта сразу переводит на следующий вопрос
    form.addEventListener('change', (e) => { if (e.target.type === 'radio') setTimeout(next, 280); });
    // повторный клик по уже выбранному варианту (после «Назад») тоже ведёт дальше — кнопки «Далее» больше нет
    // (вариант должен быть выбран ещё до клика, иначе переход сработал бы дважды и проскочил шаг с контактами)
    let wasChecked = null;
    form.addEventListener('pointerdown', (e) => { wasChecked = e.target.closest('label')?.querySelector('input[type=radio]')?.checked ? e.target.closest('label').querySelector('input[type=radio]') : null; });
    form.addEventListener('click', (e) => { const inp = e.target.closest('label')?.querySelector('input[type=radio]'); if (inp && inp === wasChecked && e.target === inp) { wasChecked = null; setTimeout(next, 280); } });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = form.querySelector('[name="phone"]');
      if (window.gpPhoneOk ? !window.gpPhoneOk(phone) : !phone.value.trim()) { if (window.gpPhoneHint) window.gpPhoneHint(phone, true); phone.focus(); return; }
      const consent = form.querySelector('.consent');
      if (consent && !consent.querySelector('input').checked) { consent.classList.add('is-error'); return; }
      if (window.gpLead) window.gpLead(form, 'Квиз подбора');
      show(steps.length - 1);
    });
    quiz.quizReset = () => { form.reset(); show(0); };
  };
  document.querySelectorAll('.mdl .quiz').forEach((q) => window.initQuiz(q));
})();

/* ============ Кастомный выпадающий список «Что вас интересует?» (во всех формах) ============ */
(() => {
  const CHECK = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  let opened = null;
  const close = () => { if (!opened) return; opened.classList.remove('is-open'); opened.querySelector('.csel__btn').setAttribute('aria-expanded', 'false'); opened = null; };
  const enhance = (label) => {
    if (label.dataset.csel) return;
    const sel = label.querySelector('select'); if (!sel) return;
    label.dataset.csel = '1';
    const box = document.createElement('div');
    box.className = label.className + ' csel'; box.dataset.csel = '1';
    label.replaceWith(box); box.appendChild(sel);
    sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'csel__btn'; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    const list = document.createElement('ul'); list.className = 'csel__list'; list.setAttribute('role', 'listbox');
    const opts = [...sel.options].filter((o) => !o.disabled);
    const ph = sel.getAttribute('aria-label') || 'Выберите';
    const sync = () => {
      const cur = sel.options[sel.selectedIndex];
      const has = cur && !cur.disabled && cur.value !== '';
      btn.innerHTML = `<span>${has ? cur.text : ph}</span><i aria-hidden="true"></i>`;
      btn.classList.toggle('is-empty', !has);
      list.querySelectorAll('li').forEach((li) => { const on = has && li.dataset.v === cur.text; li.classList.toggle('is-sel', on); li.setAttribute('aria-selected', on ? 'true' : 'false'); });
    };
    opts.forEach((o) => {
      const li = document.createElement('li'); li.setAttribute('role', 'option'); li.tabIndex = -1; li.dataset.v = o.text;
      li.innerHTML = `<span>${o.text}</span>${CHECK}`;
      li.addEventListener('click', (e) => { e.stopPropagation(); sel.value = o.value || o.text; o.selected = true; sel.dispatchEvent(new Event('change', { bubbles: true })); sync(); close(); btn.focus(); });
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); (li.nextElementSibling || li).focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); (li.previousElementSibling || li).focus(); }
        if (e.key === 'Escape') { close(); btn.focus(); }
      });
      list.appendChild(li);
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (opened === box) { close(); return; }
      close(); box.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); opened = box;
      (list.querySelector('.is-sel') || list.firstElementChild).focus({ preventScroll: true });
    });
    btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); btn.click(); } });
    box.append(btn, list);
    sel.addEventListener('change', sync);
    sel.form && sel.form.addEventListener('reset', () => setTimeout(sync));
    sync();
  };
  const scan = (root) => root.querySelectorAll && root.querySelectorAll('.form__select:not([data-csel])').forEach(enhance);
  scan(document);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && scan(n)))).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();
