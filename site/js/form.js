/* form.js — форма «лист очікування»: без серверів і сторонніх сервісів.
   З полів складається повідомлення, яке відкривається в Telegram асистенту: користувач сам натискає «Надіслати». */
(() => {
  "use strict";
  const form = document.querySelector("[data-form]");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");
  const fields = {
    name: { el: form.elements.name, err: "#f-name-err", msg: "Вкажіть, як до вас звертатись." },
    contact: { el: form.elements.contact, err: "#f-contact-err", msg: "Залиште телефон або Telegram, щоб вам могли відповісти." },
    consent: { el: form.elements.consent, err: "#f-consent-err", msg: "Потрібна згода передати дані асистенту." },
  };
  const show = (state, text) => { status.hidden = false; status.dataset.state = state; status.textContent = text; };
  const setErr = (f, on) => {
    const e = form.querySelector(f.err);
    f.el.setAttribute("aria-invalid", on ? "true" : "false");
    e.textContent = on ? f.msg : "";
  };
  Object.values(fields).forEach((f) => f.el.addEventListener("input", () => setErr(f, false)));

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    let first = null;
    Object.values(fields).forEach((f) => {
      const bad = f.el.type === "checkbox" ? !f.el.checked : !f.el.value.trim();
      setErr(f, bad);
      if (bad && !first) first = f.el;
    });
    if (first) { first.focus(); show("err", "Перевірте, будь ласка, підсвічені поля."); return; }
    const handle = atob(form.dataset.tg);
    const msg = `Добрий день! Мене звати ${form.elements.name.value.trim()}. Мене цікавить: ${form.elements.kind.value.toLowerCase()}. Мій контакт: ${form.elements.contact.value.trim()}. Підкажіть, будь ласка, вільні дати.`;
    window.open("https://t.me/" + handle + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    show("ok", "Відкрився Telegram із готовим повідомленням: натисніть там «Надіслати». Якщо нічого не відкрилось — напишіть асистенту напряму.");
  });
})();
