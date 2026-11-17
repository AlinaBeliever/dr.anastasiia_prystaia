/* interactive.js — повзунок «Наскільки страшно?», флип-картки, чек-ліст + калькулятор, тест «Мені до проктолога?».
   Жодних даних не зберігається й не надсилається. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const motion = () => (window.motionOK ? window.motionOK() : true);

  /* ================= Повзунок страху ================= */
  const sky = $("[data-sky]");
  if (sky) {
    const input = $("#fear"), out = $("#fear-out"), answer = $("#fear-answer");
    const title = $("[data-fear-title]", sky), text = $("[data-fear-text]", sky);
    const bands = [
      { max: 2, t: "Чудово — тоді просто знайте наперед", p: "Страху майже немає, і це добре. Усе одно гляньте нижче, як проходить прийом — щоб нічого не було несподіванкою." },
      { max: 5, t: "Це нормально", p: "Хвилюватись перед таким візитом — звична річ. Найкраще від цього допомагає знати, що саме буде. Тому нижче — весь прийом, крок за кроком." },
      { max: 8, t: "Страшно — і це теж нормально", p: "Багато хто відкладає візит саме через страх і сором. Почніть із малого — просто прочитайте нижче, що буде." },
      { max: 10, t: "Дуже страшно? Саме для вас я це пишу", p: "Не обіцяю, що хвилювання зникне повністю. Але обіцяю, що ви весь час знатимете, що відбувається і навіщо. А ще можна почати з онлайн-бесіди — без огляду, просто поговорити." },
    ];
    let bandIdx = 1, calmTimer = 0, swapTimer = 0;
    const bandOf = (v) => bands.findIndex((b) => v <= b.max);

    const render = (v) => {
      const idx = bandOf(v);
      if (idx === bandIdx) return;
      bandIdx = idx;
      clearTimeout(swapTimer);
      const apply = () => { title.textContent = bands[idx].t; text.textContent = bands[idx].p; answer.classList.remove("is-swapping"); };
      if (motion()) { answer.classList.add("is-swapping"); swapTimer = setTimeout(apply, 180); } else apply();
    };

    input.addEventListener("input", () => {
      const v = Number(input.value);
      out.textContent = v;
      input.setAttribute("aria-valuetext", v + " з 10");
      sky.style.setProperty("--storm", v / 10);
      sky.style.setProperty("--calm", 0);
      sky.classList.toggle("is-stormy", v >= 6 && motion());
      clearTimeout(calmTimer);
      render(v);
    });
    // Відпустили — небо заспокоюється
    const settle = () => {
      clearTimeout(calmTimer);
      calmTimer = setTimeout(() => { sky.style.setProperty("--calm", 1); sky.classList.remove("is-stormy"); }, motion() ? 450 : 0);
    };
    input.addEventListener("change", settle);
    input.addEventListener("pointerup", settle);
    sky.style.setProperty("--storm", 0.5);
  }

  /* ================= Флип-картки ================= */
  $$(".flip").forEach((card) => {
    const front = $(".flip__front", card), back = $(".flip__back", card);
    back.setAttribute("aria-hidden", "true");
    card.addEventListener("click", () => {
      const on = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(on));
      front.setAttribute("aria-hidden", String(on));
      back.setAttribute("aria-hidden", String(!on));
    });
  });

  /* ================= FAQ: відкрита лише одна картка ================= */
  const faqs = $$(".faq details");
  faqs.forEach((d) => d.addEventListener("toggle", () => { if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; }); }));

  /* ================= Чек-ліст і калькулятор ================= */
  const checks = $$("[data-prep]");
  if (checks.length) {
    const count = $("[data-prep-count]"), meter = $("[data-prep-meter]");
    const upd = () => {
      const k = checks.filter((c) => c.checked).length;
      count.textContent = `Готово: ${k} з ${checks.length}`;
      meter.style.transform = `scaleX(${k / checks.length})`;
    };
    checks.forEach((c) => c.addEventListener("change", upd));
    upd();
  }
  const timeBox = $("[data-time]"), calcOut = $("[data-calc-out]");
  if (timeBox && calcOut) {
    const fmt = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
    const hEl = $('[data-val="h"]', timeBox), mEl = $('[data-val="m"]', timeBox);
    let t = 10 * 60; // хвилини від півночі
    const render = () => {
      const h = Math.floor(t / 60), m = t % 60;
      hEl.textContent = String(h).padStart(2, "0"); mEl.textContent = String(m).padStart(2, "0");
      hEl.setAttribute("aria-valuenow", h); mEl.setAttribute("aria-valuenow", m);
      hEl.setAttribute("aria-valuetext", h + " год"); mEl.setAttribute("aria-valuetext", m + " хв");
      calcOut.textContent = "";
      const s = document.createElement("strong"); s.textContent = `${fmt(t - 180)} – ${fmt(t - 120)}`;
      calcOut.append(s, `Мікроклізма — у цьому проміжку, якщо візит о ${fmt(t)}.`);
    };
    const step = (unit, dir) => {
      if (unit === "h") t = (t + dir * 60 + 1440) % 1440;
      else { const h = Math.floor(t / 60), m = ((t % 60) + dir * 15 + 60) % 60; t = h * 60 + m; }
      render();
    };
    // утримання стрілки — швидка прокрутка
    let holdT = 0, holdI = 0;
    const stopHold = () => { clearTimeout(holdT); clearInterval(holdI); };
    $$(".calc__arrow", timeBox).forEach((btn) => {
      const u = btn.dataset.step, d = Number(btn.dataset.dir);
      btn.addEventListener("click", (e) => { if (e.detail === 0) step(u, d); }); // Enter/пробіл з клавіатури
      btn.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        step(u, d); stopHold();
        holdT = setTimeout(() => { holdI = setInterval(() => step(u, d), 110); }, 420);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, stopHold));
    });
    [hEl, mEl].forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); step(el.dataset.val, 1); }
        else if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); step(el.dataset.val, -1); }
      });
      el.addEventListener("wheel", (e) => { e.preventDefault(); step(el.dataset.val, e.deltaY < 0 ? 1 : -1); }, { passive: false });
    });
    render();
  }

  /* ================= Тест «Мені до проктолога?» ================= */
  const finder = $("[data-finder-body]");
  if (finder) {
    const Q = {
      q1: ["Що вас найбільше турбує?", [["pain", "Біль"], ["lump", "Щось «зайве»"], ["blood", "Кров, слиз, гній"], ["stool", "Зміна стільця"], ["woman", "Кал/гази з піхви"], ["tail", "Біль біля куприка"], ["birth", "Після пологів"], ["unknown", "Не знаю, як назвати"]]],
      q2: ["Як довго це триває?", [["days", "Кілька днів"], ["weeks", "Кілька тижнів"], ["months", "Місяці чи роки"]]],
      q3: ["Чи є у вас зараз сильний різкий біль, висока температура або кровотеча, що не вщухає?", [["urgent", "Так, є"], ["none", "Ні, такого немає"]]],
    };
    const RES = {
      pain: ["Біль", "Біль — після дефекації чи постійний — це те, з чим до мене приходять. Причин буває кілька, і без огляду їх не розрізнити."],
      lump: ["Щось «зайве» чи набряк", "Що саме це, покаже огляд, а не пошук картинок в інтернеті."],
      blood: ["Кров, слиз чи гній", "Це привід не відкладати візит, але й не панікувати: причини бувають різні, і з'ясовує їх огляд."],
      stool: ["Зміна стільця", "Зміна форми чи характеру стільця — привід розповісти про це лікарю, особливо якщо вона триває тижнями."],
      woman: ["Кал чи гази з піхви", "Про таке часто мовчать роками — і дарма. Саме з цим я працюю, і ніхто в кабінеті не здивується."],
      tail: ["Біля куприка", "Теж моя територія. На огляді з'ясуємо, що саме там відбувається, і чи потрібне лікування."],
      birth: ["Після пологів", "Про наслідки пологів не треба мовчати з сорому чи чекати, що «само мине». Приходьте — розберемось разом."],
      unknown: ["Не знаєте, як назвати", "Нічого страшного — на прийомі опишете своїми словами. Цього достатньо, щоб почати."],
    };
    const DUR = {
      days: "Кілька днів — ще не привід панікувати, але й терпіти без потреби не варто.",
      weeks: "Кілька тижнів — цього вже достатньо, щоб показатись лікарю.",
      months: "Місяці чи роки — якраз той випадок, коли «обійдеться» вже не працює. Приходьте, без повчань.",
    };
    const TG = "https://t.me/prystaia_online";
    const SYM = { pain: "біль", lump: "щось «зайве» чи набряк", blood: "кров, слиз чи гній", stool: "зміна стільця", woman: "кал чи гази з піхви", tail: "біль біля куприка", birth: "стан після пологів", unknown: "не знаю, як це назвати" };
    const LONG = { days: "кілька днів", weeks: "кілька тижнів", months: "місяці чи роки" };
    const buildMsg = () => `Добрий день! Хочу записатися на консультацію до Анастасії Пристаї. Мене турбує: ${SYM[ans.q1]}. Це триває ${LONG[ans.q2]}. Підкажіть, будь ласка, вільні дати та формат (очно чи онлайн).`;
    let ans = {};
    const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };
    const clear = () => { finder.textContent = ""; };
    let interacted = false;
    const focusFirst = () => { if (!interacted) return; const f = finder.querySelector("h4, .finder__q"); if (f) { f.tabIndex = -1; f.focus({ preventScroll: true }); } };

    const ask = (key, n, next, back) => {
      clear();
      const [q, opts] = Q[key];
      finder.append(el("p", "finder__progress", `Крок ${n} з 3`), el("p", "finder__q", q));
      const row = el("div", "finder__opts");
      row.setAttribute("role", "group"); row.setAttribute("aria-label", q);
      opts.forEach(([v, label]) => {
        const b = el("button", "pill", label); b.type = "button";
        b.addEventListener("click", () => { interacted = true; ans[key] = v; next(); });
        row.append(b);
      });
      finder.append(row);
      if (back) { const bb = el("button", "finder__back", "← Назад"); bb.type = "button"; bb.addEventListener("click", () => { interacted = true; back(); }); finder.append(bb); }
      focusFirst();
    };
    const result = () => {
      clear();
      const box = el("div", "finder__result");
      if (ans.q3 === "urgent") {
        const w = el("div", "finder__warn");
        const s = el("strong", "", "Тоді не чекайте запису.");
        w.append(s, document.createTextNode(" Сильний різкий біль, висока температура чи кровотеча, що не вщухає, — це привід звернутись по невідкладну допомогу: телефонуйте 103 або 112, або їдьте до приймального відділення. Онлайн-бесіда й плановий запис для таких ситуацій не підходять."));
        const h = el("h4", "", "Це не про «записатись на тиждень»"); box.append(h, w);
      } else {
        const [t, p] = RES[ans.q1];
        box.append(el("h4", "", t), el("p", "", p), el("p", "", DUR[ans.q2]));
        const act = el("div", "finder__actions");
        const a = el("a", "btn", "Надіслати асистенту"); a.target = "_blank"; a.rel = "noopener";
        a.href = TG + "?text=" + encodeURIComponent(buildMsg());
        const l = el("a", "link-arrow", "Як проходить прийом →"); l.href = "pryyom/";
        act.append(a, l); box.append(act);
      }
      box.append(el("p", "finder__small", "Це не діагноз і не заміна огляду: лише орієнтир, з чого почати розмову з лікарем."));
      const again = el("button", "finder__back", "Почати спочатку"); again.type = "button"; again.addEventListener("click", () => { interacted = true; step1(); });
      box.append(again);
      finder.append(box);
      focusFirst();
    };
    function step1() { ans = {}; ask("q1", 1, step2); }
    function step2() { ask("q2", 2, step3, step1); }
    function step3() { ask("q3", 3, result, step2); }
    step1();
  }
})();

// Вебінари: «Детальніше» відкриває діалог
(function () {
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-wopen]");
    if (o) {
      var d = document.getElementById(o.getAttribute("data-wopen"));
      if (d && d.showModal) d.showModal();
      return;
    }
    if (e.target.closest("[data-wclose]")) { e.target.closest("dialog").close(); return; }
    if (e.target.classList && e.target.classList.contains("wdialog")) {
      var r = e.target.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
    }
  });
})();
