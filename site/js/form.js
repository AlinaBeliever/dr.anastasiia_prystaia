/* form.js — форма запису (Formspree). Мінімум полів, згода, чесний статус.
   Поки в action стоїть заглушка YOUR_FORM_ID, форма НЕ вдає успішну відправку. */
(() => {
  "use strict";
  const form = document.querySelector("[data-form]");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");
  const fields = {
    name: { el: form.elements.name, err: "#f-name-err", msg: "Вкажіть, як до вас звертатись." },
    contact: { el: form.elements.contact, err: "#f-contact-err", msg: "Залиште телефон або Telegram, щоб ми могли відповісти." },
    consent: { el: form.elements.consent, err: "#f-consent-err", msg: "Потрібна згода на обробку даних, інакше ми не зможемо зв'язатись." },
  };
  const show = (state, text) => { status.hidden = false; status.dataset.state = state; status.textContent = text; };
  const setErr = (f, on) => {
    const e = form.querySelector(f.err);
    f.el.setAttribute("aria-invalid", on ? "true" : "false");
    e.textContent = on ? f.msg : "";
  };

  Object.values(fields).forEach((f) => f.el.addEventListener("input", () => setErr(f, false)));

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    let first = null;
    Object.values(fields).forEach((f) => {
      const bad = f.el.type === "checkbox" ? !f.el.checked : !f.el.value.trim();
      setErr(f, bad);
      if (bad && !first) first = f.el;
    });
    if (first) { first.focus(); show("err", "Перевірте, будь ласка, підсвічені поля."); return; }
    if (form.elements._gotcha && form.elements._gotcha.value) return; // бот

    if (/YOUR_FORM_ID/.test(form.action)) {
      show("info", "Це демонстраційна версія: форму ще не підключено до Formspree, тому заявку не надіслано. Для запису скористайтесь телефонами OLYMED або Instagram.");
      return;
    }
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    show("info", "Надсилаю…");
    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      show("ok", "Дякую! Контакт отримано. Вам відповідуть, щойно буде вільне місце або ми уточнимо деталі.");
    } catch (e) {
      show("err", "Не вдалось надіслати. Спробуйте ще раз або зателефонуйте в OLYMED.");
    } finally { btn.disabled = false; }
  });
})();
