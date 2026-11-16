/* interactive.js — повзунок «Наскільки страшно?», флип-картки, чек-ліст + калькулятор, навігатор «Це моє?».
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
      { max: 2, t: "Чудово — тоді просто знайте наперед", p: "Страху майже немає, і це добре. Усе одно коротко розкажу, як проходить прийом, щоб нічого не було несподіванкою." },
      { max: 5, t: "Це нормально", p: "Хвилюватись перед таким візитом — звична річ. Ось що я роблю, щоб було спокійніше:" },
      { max: 8, t: "Страшно — і це теж нормально", p: "Багато хто відкладає візит саме через страх і сором. Тому я заздалегідь розповідаю, що буде. Ось головне:" },
      { max: 10, t: "Дуже страшно? Саме для вас я це пишу", p: "Не обіцяю, що хвилювання зникне повністю. Але обіцяю одне: нічого не станеться раптово — про кожен рух я попереджаю заздалегідь." },
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
  const time = $("[data-visit-time]"), calcOut = $("[data-calc-out]");
  if (time && calcOut) {
    const fmt = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
    time.addEventListener("input", () => {
      if (!time.value) { calcOut.textContent = "Введіть час — і я підкажу вікно."; return; }
      const [h, m] = time.value.split(":").map(Number), t = h * 60 + m;
      calcOut.textContent = "";
      const s = document.createElement("strong"); s.textContent = `${fmt(t - 180)} – ${fmt(t - 120)}`;
      calcOut.append(s, "Мікроклізму — в цьому вікні (за 2–3 години до візиту).");
    });
  }

  /* ================= Навігатор «Це моє?» ================= */
  const finder = $("[data-finder-body]");
  if (finder) {
    const Q = {
      q1: ["Що вас найбільше турбує?", [["pain", "Біль"], ["lump", "Щось «зайве» чи набряк"], ["blood", "Кров, слиз чи гній"], ["stool", "Зміна стільця"], ["woman", "Кал чи гази з піхви"], ["tail", "Біль біля куприка"], ["birth", "Стан після пологів"], ["unknown", "Не знаю, як назвати"]]],
      q2: ["Як довго це триває?", [["days", "Кілька днів"], ["weeks", "Кілька тижнів"], ["months", "Місяці чи роки"]]],
      q3: ["Чи є щось із цього просто зараз?", [["urgent", "Сильний різкий біль, висока температура або кровотеча, що не вщухає"], ["none", "Ні, нічого такого"]]],
    };
    const RES = {
      pain: ["Біль", "Біль — після дефекації чи постійний — це те, з чим до мене приходять. Причин буває кілька, і без огляду їх не розрізнити."],
      lump: ["Щось «зайве» чи набряк", "Шишка, гуля чи набряк біля ануса — теж до проктолога. Що саме це, покаже огляд, а не інтернет."],
      blood: ["Кров, слиз чи гній", "Це привід не відкладати візит, але й не панікувати: причини бувають різні, і з'ясовує їх огляд."],
      stool: ["Зміна стільця", "Зміна форми чи характеру стільця — привід розповісти про це лікарю, особливо якщо вона триває тижнями."],
      woman: ["Кал чи гази з піхви", "Так, таке буває. І це до проктолога, а не до гінеколога. Не соромтесь — саме з цим я працюю."],
      tail: ["Біля куприка", "Набряк і біль біля куприка — теж моя територія. Це там, де хвостик не виріс :)"],
      birth: ["Після пологів", "Якщо під час пологів був розрив анального сфінктера — це точно до мене. І про це точно не треба мовчати з сорому."],
      unknown: ["Не знаєте, як назвати", "І не треба. Опишіть, як є — це нормальний початок розмови."],
    };
    const DUR = {
      days: "Кілька днів — ще не привід панікувати, але й терпіти без потреби не варто.",
      weeks: "Кілька тижнів — цього вже достатньо, щоб показатись лікарю.",
      months: "Місяці чи роки — якраз той випадок, коли «обійдеться» вже не працює. Приходьте, без повчань.",
    };
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
        const a = el("a", "btn", "Записатись"); a.href = "#zapys";
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
