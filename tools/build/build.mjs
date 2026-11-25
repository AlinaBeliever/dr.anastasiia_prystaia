// Збірник сторінок: node tools/build/build.mjs  (перезаписує HTML у site/). Тексти — у data.mjs.
import fs from "node:fs";
import path from "node:path";
import * as D from "./data.mjs";

const BUILD_V = Date.now().toString(36);
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../site");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
// Текст з адмінки: екрануємо HTML і дозволяємо просту розмітку:
// **жирний**, [текст](https://посилання), [ПЛЕЙСХОЛДЕР] -> жовта позначка, новий рядок -> <br>
const rich = (s = "") =>
  esc(String(s).trim())
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>')
    .replace(/\[([^\]]+)\](?!\()/g, '<span class="ph">[$1]</span>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\r?\n/g, "<br>");
const txt = (s = "") => esc(String(s).trim());
// Шлях до картинки з адмінки ("/assets/img/uploads/x.webp") -> відносно сторінки
const asset = (root, p) => (/^https?:/.test(p) ? p : root + p.replace(/^\//, ""));
// Якщо поруч лежить менша копія (-480.webp), даємо браузеру вибір
const posterSrcset = (root, p) => {
  const small = p.replace(/-720\.webp$/, "-480.webp");
  return small !== p && fs.existsSync(path.join(OUT, small.replace(/^\//, ""))) ? `${asset(root, small)} 480w, ${asset(root, p)} 720w` : "";
};
const ytId = (u = "") => (u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/) || [])[1];
const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const PHONE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>`;
const IG_ICON = `<svg class="ico-ig" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Instagram"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>`;
const TG_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 4L3 11l6 2.2L11 20l3-4 4.5 3.5z"/><path d="M9 13.2L21 4"/></svg>`;
const STAR_DIVIDER = `<svg class="divider" viewBox="0 0 320 40" aria-hidden="true" focusable="false"><line x1="20" y1="26" x2="80" y2="12"/><line x1="80" y1="12" x2="150" y2="28"/><line x1="150" y1="28" x2="220" y2="10"/><line x1="220" y1="10" x2="300" y2="24"/><circle cx="20" cy="26" r="3"/><circle cx="80" cy="12" r="2.5"/><circle cx="150" cy="28" r="3.5"/><circle cx="220" cy="10" r="2.5"/><circle cx="300" cy="24" r="3"/></svg>`;
const PAGE_STARS = `<svg class="page-hero__stars" viewBox="0 0 300 200" aria-hidden="true" focusable="false"><g stroke="#e0cca9" stroke-width="1" opacity=".5"><line x1="30" y1="150" x2="90" y2="70"/><line x1="90" y1="70" x2="170" y2="100"/><line x1="170" y1="100" x2="230" y2="30"/><line x1="170" y1="100" x2="270" y2="150"/></g><g fill="#d4b574"><circle cx="30" cy="150" r="3.5"/><circle cx="90" cy="70" r="4.5"/><circle cx="170" cy="100" r="3"/><circle cx="230" cy="30" r="3.5"/><circle cx="270" cy="150" r="4"/></g></svg>`;

// ---------------- Спільні шматки ----------------
function head({ root, title, desc, path: p, ld = [], noindexNote = false, ogType = "website", extraHead = "" }) {
  const url = D.SITE + p;
  return `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#071f3b">
<meta name="color-scheme" content="light">
<meta property="og:type" content="${ogType}">
<meta property="og:locale" content="uk_UA">
<meta property="og:site_name" content="Анастасія Пристая — проктолог, Київ">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${D.SITE}/assets/img/og-cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Анастасія Пристая, лікар-колопроктолог, у лаймовій шапочці">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}assets/icons/favicon-sign-96.png" type="image/png" sizes="96x96">
<link rel="apple-touch-icon" href="${root}assets/icons/touch-icon-sign-180.png">
<link rel="preload" href="${root}assets/fonts/manrope-normal-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/playfair-display-normal-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}css/tokens.css?v=${BUILD_V}">
<link rel="stylesheet" href="${root}css/base.css?v=${BUILD_V}">
<link rel="stylesheet" href="${root}css/sections.css?v=${BUILD_V}">
<link rel="stylesheet" href="${root}css/motion.css?v=${BUILD_V}">
${extraHead}${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
<script>document.documentElement.classList.add("js")</script>
</head>
<body>
<a class="skip-link" href="#main">Перейти до змісту</a>
`;
}

function header(root, cur) {
  const a = (href, text, key) => `<li><a class="nav__link" href="${href}"${cur === key ? ' aria-current="page"' : ""}>${text}</a></li>`;
  return `<header class="site-header">
  <div class="container">
    <a class="logo" href="${root || "./"}" aria-label="Dr. Prystaia — proctology, на головну"><img class="logo__img" src="${root}assets/img/logo-bone.png" width="800" height="341" alt="Dr. Prystaia — proctology"></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Меню"><span></span></button>
    <nav class="nav" id="site-nav" aria-label="Основна навігація">
      <ul class="nav__list">
        ${a(root + "pryyom/", "Як проходить прийом", "pryyom")}
        ${a(root + "#prepare", "Підготовка", "prepare")}
        ${a(root + "#learn", "Вебінари", "learn")}
        ${a(root + "interviu/", "Інтерв'ю", "interviu")}
        ${a(root + "online/", "Онлайн-бесіда", "online")}
      </ul>
      <a class="btn btn--sm nav__cta" href="${root}#zapys">Записатись</a>
    </nav>
    <a class="btn btn--sm header-cta" href="${root}#zapys">Записатись</a>
  </div>
</header>
`;
}

function bookbar(root) {
  return `<div class="book-bar" data-bookbar>
  <a class="btn" href="${root}#zapys">Записатись</a>
</div>
`;
}

function footer(root) {
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="logo" href="${root || "./"}" aria-label="На головну"><img class="logo__img" src="${root}assets/img/logo-bone.png" width="800" height="341" alt="Dr. Prystaia — proctology"></a>
        <p style="margin-top:1rem;max-width:26rem;color:var(--muted-on-dark)">Анастасія Пристая — лікар-хірург, колопроктолог. Очні консультації в Києві, онлайн-бесіди в Telegram.</p>
        <p style="margin-top:.75rem"><a class="ig-link" href="${D.IG}" rel="noopener" target="_blank">${IG_ICON}<span class="ig-nick">@dr.anastasiia_prystaia</span></a></p>
        <p style="margin-top:.75rem;max-width:26rem">${D.DIARY_URL ? `<a class="ig-link" href="${D.DIARY_URL}" rel="noopener" target="_blank">${TG_ICON}<span class="ig-nick">Telegram: «Щоденник проктолога»</span></a>` : `<span class="ph">[ПОСИЛАННЯ НА TELEGRAM-КАНАЛ]</span> Telegram: «Щоденник проктолога»`}<br><small style="color:var(--muted-on-dark)">Не для слабкодухих.</small></p>
      </div>
      <div>
        <h2>Сайт</h2>
        <ul class="footer-list">
          <li><a href="${root}pryyom/">Як проходить прийом</a></li>
          <li><a href="${root}#about">Про мене</a></li>
          <li><a href="${root}#ceny">Послуги й вартість</a></li>
          <li><a href="${root}online/">Онлайн-бесіда</a></li>
          <li><a href="${root}#learn">Вебінари</a></li>
          <li><a href="${root}#zapys">Запис</a></li>
        </ul>
      </div>
      <div>
        <h2>Документи</h2>
        <ul class="footer-list">
          <li><a href="${root}dokumenty/#oferta">Договір публічної оферти</a></li>
          <li><a href="${root}dokumenty/#privacy">Політика конфіденційності</a></li>
          <li><a href="${root}dokumenty/#disclaimer">Застереження</a></li>
          <li><a href="${root}dokumenty/#requisites">Реквізити ФОП</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-note">
      <p><strong>Важливо.</strong> Матеріали сайту мають освітній характер і не замінюють консультацію лікаря. Точний діагноз без огляду неможливий. Не займайтесь самолікуванням. Результат лікування залежить від індивідуальних особливостей. У невідкладній ситуації телефонуйте 103 або 112.</p>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Анастасія Пристая</span>
    </div>
  </div>
</footer>
`;
}

const scripts = (root, list) => list.map((s) => `<script src="${root}js/${s}.js?v=${BUILD_V}" defer></script>`).join("\n");
const tail = (root, list) => `${scripts(root, list)}
</body>
</html>
`;

const crumbs = (root, name) => `<nav class="crumbs" aria-label="Навігація"><ol><li><a href="${root || "./"}">Головна</a></li><li><span aria-current="page">${name}</span></li></ol></nav>`;

const faqHtml = D.FAQ.map(([q, a]) => `<details><summary>${q}</summary><div class="faq__a">${a}</div></details>`).join("\n");

// ---------------- JSON-LD ----------------
const physician = {
  "@context": "https://schema.org",
  "@type": "Physician",
  "@id": D.SITE + "/#physician",
  name: "Анастасія Пристая",
  alternateName: "Dr. Prystaia",
  jobTitle: "Лікар-хірург, колопроктолог",
  description: "Лікар-хірург, колопроктолог (друга спеціальність — онкохірургія). Очні консультації в Києві та онлайн-бесіди.",
  url: D.SITE + "/",
  image: D.SITE + "/assets/img/og-cover.jpg",
  telephone: D.PHONES.map((p) => p.tel),
  medicalSpecialty: "Surgical",
  knowsAbout: ["Проктологія", "Колопроктологія", "Геморой", "Анальна тріщина", "Парапроктит", "Пологові травми анального сфінктера"],
  sameAs: [D.IG],
  areaServed: { "@type": "City", name: "Київ" },
  hospitalAffiliation: { "@type": "Hospital", name: "Клінічна лікарня «Феофанія» ДУС" },
  workLocation: {
    "@type": "MedicalClinic",
    name: D.BOOKING.inperson.clinic,
    address: { "@type": "PostalAddress", streetAddress: D.BOOKING.inperson.address.replace(/,\s*Київ\s*$/, ""), addressLocality: "Київ", addressCountry: "UA" },
    telephone: D.PHONES.map((p) => p.tel),
  },
};
const website = { "@context": "https://schema.org", "@type": "WebSite", name: "Анастасія Пристая — проктолог, Київ", url: D.SITE + "/", inLanguage: "uk" };
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: D.FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: D.stripTags(a) } })),
};
const bc = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: D.SITE + u })),
});

const ONLINE = D.BOOKING.online;
const MSG_BIRTH = "Добрий день! Я після пологів, хочу записатися на прийом до Анастасії Пристаї (пацієнток із пологовими травмами вона приймає без черги). Підкажіть, будь ласка, найближчий час.";
const MSG_ONLINE = `Добрий день! Хочу записатися на онлайн-бесіду з Анастасією Пристаєю (${ONLINE.price}, ${ONLINE.duration}). Підкажіть, будь ласка, вільні дати та як оплатити.`;

// ---------------- ГОЛОВНА ----------------
function home() {
  const R = "";
  const steps = D.STEPS;
  const nodeX = [8, 24.8, 41.6, 58.4, 75.2, 92];
  const nodeY = [62, 28, 66, 24, 58, 30];
  const strip = `<div class="strip" aria-label="Кроки прийому">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${nodeX
          .slice(0, -1)
          .map((x, i) => `<line x1="${x}" y1="${nodeY[i]}" x2="${nodeX[i + 1]}" y2="${nodeY[i + 1]}"/>`)
          .join("")}</svg>
        ${steps.map((s, i) => `<button class="strip__node" type="button" style="left:${nodeX[i]}%;top:${nodeY[i]}%" data-goto="${i}" aria-label="Крок ${i + 1}: ${s.short}"><i></i></button>`).join("")}
      </div>`;
  const stepHtml = steps
    .map(
      (s, i) => `<article class="step" data-step="${i}" aria-labelledby="step-t-${i}">
          <div class="step__body">
            <span class="step__num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
            <h3 id="step-t-${i}">${s.t}</h3>
            <p>${s.p}</p>
            <p class="step__quip">${s.q}</p>
          </div>
          <div class="step__art" aria-hidden="true"><svg viewBox="0 0 64 64" focusable="false">${D.ICONS[s.icon]}</svg></div>
        </article>`
    )
    .join("\n        ");

  const sym = D.SYMPTOMS.map(([k, t, p, extra]) => `<li class="sym-card" data-reveal><div><h3>${t}</h3><p>${p}</p>${extra === "tg" ? `<a class="link-arrow" ${D.tgAttrs(MSG_BIRTH)} rel="noopener" target="_blank">Написати асистентці ${ARROW}</a>` : ""}</div></li>`).join("\n");
  const symCta = `<li class="sym-card sym-card--cta" data-reveal><div><h3>Не знаєте, як назвати?</h3><p>І не треба. Опишіть, як є — це нормальний початок розмови. Просто телефонуйте в ${txt(D.BOOKING.inperson.clinic)} або запишіться онлайн.</p></div></li>`;
  const myths = D.MYTHS.map(
    ([q, a], i) => `<li data-reveal style="--d:${i * 0.08}s"><button class="flip" type="button" aria-pressed="false"><span class="flip__inner">
          <span class="flip__face flip__front"><span class="flip__top"><span class="flip__tag">Міф?</span><span class="flip__mark" aria-hidden="true">?</span></span><span class="flip__q">${q}</span><span class="flip__hint">Перевернути ${ARROW}</span></span>
          <span class="flip__face flip__back"><span class="flip__tag">Факт</span><span class="flip__a">${a}</span><span class="flip__hint">Назад</span></span>
        </span></button></li>`
  ).join("\n");
  const prep = D.PREP.map(
    ([t, s]) => `<li><label class="check"><input type="checkbox" data-prep><span class="check__box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span><strong>${t}</strong><span class="small">${s}</span></span></label></li>`
  ).join("\n");
  const prices = D.SERVICES.items.map(({ title, note, price }) => `<tr><th scope="row">${rich(title)}${note ? `<span class="note">${rich(note)}</span>` : ""}</th><td>${rich(price)}</td></tr>`).join("\n");
  const A = D.ACHIEVEMENTS;
  const stats = A.stats.length ? `
        <ul class="stats">
${A.stats.map((x) => `          <li><b>${txt(x.value)}</b><span>${rich(x.text)}</span></li>`).join("\n")}
        </ul>` : "";
  const facts = A.facts.length ? `
        <dl class="facts">
${A.facts.map((x) => `          <div><dt>${txt(x.title)}</dt><dd>${rich(x.text)}</dd></div>`).join("\n")}
        </dl>` : "";
  const book = `
        <div class="book" data-reveal>${fs.existsSync(path.join(OUT, "assets/img/book-cover.webp")) ? `<img class="book__cover" src="assets/img/book-cover.webp" alt="Обкладинка книги «Треба трошки потерпіти»" loading="lazy" decoding="async">` : ""}<div><p class="kicker">Книга</p><h3>«Треба трошки потерпіти»</h3><p>Я — авторка цієї книги.</p>${D.BOOK_URL ? `<p><a class="btn btn--sm" href="${D.BOOK_URL}" target="_blank" rel="noopener">Купити у «Віхолі» ${ARROW}</a></p>` : `<p><span class="ph">[ПОСИЛАННЯ НА КНИГУ У «ВІХОЛІ»]</span></p>`}</div></div>`;
  const B = D.BOOKING;
  const IP = B.inperson;

  const body = `${header(R, "")}
<main id="main">

<!-- 1. HERO: лист від лікарки -->
<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="container hero__grid">
    <div class="hero__copy">
      <h1 id="hero-title" data-mask>Вітаю! Я Анастасія Пристая, амбасадорка нестрашної проктології</h1>
      <p class="hero__lede" data-reveal style="--d:.3s">Консультую без сорому, без болю, комфортно та приватно.<br>Чоловіків та жінок 18 – 100+ років.</p>
      <p class="hero__more" data-reveal style="--d:.38s"><span>Оперую весь обсяг проктологічних втручань останні 15 років,</span> <span>виконую 300+ операцій на рік, але <strong>ЗАВЖДИ ПО ПОКАЗАХ</strong>.</span></p>
      <p class="hero__quote" data-reveal style="--d:.42s">Краща операція це та, яку вдалось не зробити.</p>
      <div class="hero__meta">
        <p class="hero__where" data-reveal style="--d:.46s">Приймаю в Києві, очно та онлайн.</p>
        <p class="hero__ig" data-reveal style="--d:.5s"><a class="ig-link" href="${D.IG}" rel="noopener" target="_blank">${IG_ICON}<span class="ig-nick">@dr.anastasiia_prystaia</span></a></p>
      </div>
      <div class="hero__cta" data-reveal style="--d:.45s">
        <a class="btn" href="#zapys">Записатись на консультацію</a>
        <a class="btn btn--ghost" href="#learn">Придбати вебінари</a>
      </div>
    </div>
    <figure class="hero__figure" data-reveal style="--d:.2s">
      <picture>
        <source type="image/webp" srcset="assets/img/hero-cap-640.webp 640w, assets/img/hero-cap-1080.webp 1080w" sizes="(min-width: 900px) 520px, 100vw">
        <img src="assets/img/hero-cap-1080.webp" width="1080" height="1080" alt="Анастасія Пристая в лайм-зеленій хірургічній шапочці, синій формі та лаймових рукавичках" fetchpriority="high" decoding="async">
      </picture>
      <figcaption>15 років у проктології. 300+ операцій на рік — завжди за показами</figcaption>
    </figure>
  </div>
</section>

<!-- 2. НАСКІЛЬКИ ВАМ СТРАШНО -->
<section class="section" id="strakh" aria-labelledby="strakh-title">
  <div class="container">
    <div class="section-head">
      <p class="kicker"><b>01</b>Перед візитом</p>
      <h2 id="strakh-title" data-mask>Наскільки вам зараз <em>страшно?</em></h2>
      <p>Пересуньте повзунок і відпустіть. Нічого не зберігається й нікуди не надсилається — це лише для вас.</p>
    </div>
    <div class="sky theme-dark" data-sky>
      <div class="sky__layer sky__storm"></div>
      <div class="sky__layer sky__calm"></div>
      <div class="sky__stars"></div>
      <div class="sky__cloud sky__cloud--1"></div><div class="sky__cloud sky__cloud--2"></div><div class="sky__cloud sky__cloud--3"></div>
      <div class="sky__flash"></div>
      <div class="sky__ui">
        <label class="sky__q" for="fear">Наскільки страшно перед візитом до проктолога?</label>
        <div class="sky__value" aria-hidden="true"><output id="fear-out" for="fear">5</output><span>/10</span></div>
        <input id="fear" type="range" min="0" max="10" step="1" value="5" aria-describedby="fear-answer" aria-valuetext="5 з 10">
        <div class="sky__scale" aria-hidden="true"><span>Зовсім ні</span><span>Дуже</span></div>
        <div class="sky__answer" id="fear-answer" aria-live="polite">
          <h3 data-fear-title>Це нормально</h3>
          <p data-fear-text>Хвилюватись перед таким візитом — звична річ. Найкраще від цього допомагає знати, що саме буде. Тому нижче — весь прийом, крок за кроком.</p>
          <div class="sky__actions">
            <a class="btn btn--sm" href="#zapys">Записатись</a>
            <a class="link-arrow" href="#pryyom">Подивитись кроки ${ARROW}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 3. СЦЕНА ПРИЙОМУ -->
<section class="scene theme-dark" id="pryyom" data-scene style="--n:${steps.length}" aria-labelledby="scene-title">
  <div class="scene__pin">
    <div class="container scene__inner">
      <header class="scene__head">
        <p class="kicker"><b>02</b>Прийом</p>
        <h2 id="scene-title">Що відбуватиметься: <em>крок за кроком</em></h2>
        <p>Шість кроків від порога до виходу з кабінету.</p>
      </header>
      ${strip}
      <div class="stage">
        ${stepHtml}
      </div>
      <div class="scene__foot">
        <a class="btn" href="#zapys">Записатись</a>
        <a class="link-arrow" href="pryyom/">Докладніше про прийом ${ARROW}</a>
      </div>
    </div>
  </div>
</section>

<!-- 4. З ЧИМ ДО МЕНЕ -->
<section class="section" id="symptoms" aria-labelledby="sym-title">
  <div class="container">
    <div class="section-head">
      <p class="kicker"><b>03</b>Симптоми</p>
      <h2 id="sym-title" data-mask>З чим до мене <em>приходять</em></h2>
      <p>Достатньо відчути, що щось не так. Якщо тут є щось про вас — це до мене.</p>
    </div>
    <ul class="sym-grid">${sym}${symCta}</ul>
    <div class="sym-more">
      <h3>Які хвороби я лікую</h3>
      <ul class="tags">${D.DISEASES.map((d) => `<li>${d}</li>`).join("")}</ul>
      <p class="sym-note">Будь-яку проблему легше, дешевше і приємніше попередити, ніж лікувати!</p>
      <p style="color:var(--text-muted);font-size:var(--fs-sm);max-width:40rem">Здуття живота, закрепи й подібне — це до гастроентеролога, а не до мене.</p>
    </div>

  </div>
</section>

<!-- 5. МІФИ -->
<section class="section theme-sand" id="myths" aria-labelledby="myths-title">
  <div class="container">
    <div class="section-head">
      <p class="kicker"><b>04</b>Міфи</p>
      <h2 id="myths-title" data-mask>Чотири страхи, які ми <em>розберемо</em></h2>
      <p>Торкніться картки — вона перевернеться й покаже, як насправді.</p>
    </div>
    <ul class="flip-grid">${myths}</ul>
  </div>
</section>

<!-- 6. ПІДГОТОВКА -->
<section class="section" id="prepare" aria-labelledby="prep-title">
  <div class="container">
    <div class="section-head">
      <p class="kicker"><b>05</b>Підготовка</p>
      <h2 id="prep-title" data-mask>Як підготуватись <em>до візиту</em></h2>
      <p>Відмічайте пункти — і ви готові. Жодних дієт і голодування.</p>
    </div>
    <div class="prep">
      <div>
        <p class="prep__progress" aria-live="polite"><span data-prep-count>Готово: 0 з ${D.PREP.length}</span><span class="prep__meter" aria-hidden="true"><i data-prep-meter></i></span></p>
        <ul class="checklist" style="margin-top:1rem">${prep}</ul>
        <div class="skip-prep">
          <h3>Коли готуватись не потрібно</h3>
          <ul>
            <li><span><strong>Ситуація ургентна.</strong> Але тоді пацієнт приїздить каретою швидкої, а не читає цей текст.</span></li>
            <li><span><strong>Консультація післяопераційна.</strong> Такий огляд переслідує зовсім інші цілі.</span></li>
            <li><span><strong>Консультація повторна,</strong> і я сказала, що до неї готуватись не потрібно.</span></li>
            <li><span><strong>Ви боїтесь через біль чи кров'янисті виділення.</strong> Якщо складно — не потрібно. Розберемось в будь-якому випадку.</span></li>
          </ul>
        </div>
        <div class="callout" style="margin-top:2rem">
          <h3>А якщо не підготувались?</h3>
          <p>Я нікуди не дінусь — проконсультую. Але є певна ймовірність, що щось пропущу, і якість такого огляду помітно падає. Тому краще встигнути.</p>
        </div>
      </div>
      <aside class="calc theme-dark" aria-labelledby="calc-title">
        <h3 id="calc-title">О котрій мікроклізма?</h3>
        <div class="calc__time" data-time role="group" aria-labelledby="visit-time-l">
          <p id="visit-time-l" class="calc__label">Час вашого візиту</p>
          <div class="calc__spin">
            <button class="calc__arrow" type="button" data-step="h" data-dir="-1" aria-label="Година: менше"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></button>
            <span class="calc__val" role="spinbutton" tabindex="0" aria-label="Година" aria-valuemin="0" aria-valuemax="23" aria-valuenow="10" data-val="h">10</span>
            <button class="calc__arrow" type="button" data-step="h" data-dir="1" aria-label="Година: більше"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg></button>
          </div>
          <span class="calc__colon" aria-hidden="true">:</span>
          <div class="calc__spin">
            <button class="calc__arrow" type="button" data-step="m" data-dir="-1" aria-label="Хвилини: менше"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></button>
            <span class="calc__val" role="spinbutton" tabindex="0" aria-label="Хвилини" aria-valuemin="0" aria-valuemax="45" aria-valuenow="0" data-val="m">00</span>
            <button class="calc__arrow" type="button" data-step="m" data-dir="1" aria-label="Хвилини: більше"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg></button>
          </div>
        </div>
        <div class="calc__out" aria-live="polite" data-calc-out><strong>07:00 – 08:00</strong>Мікроклізма — у цьому проміжку.</div>
        <small>Крок — 15 хвилин. Орієнтир: за 2–3 години до візиту.</small>
      </aside>
    </div>
  </div>
</section>

<!-- 7. ПРО МЕНЕ -->
<section class="section theme-dark" id="about" aria-labelledby="about-title">
  <div class="container">
    <div class="about">
      <div class="about__photo" data-reveal>
        <picture>
          <source type="image/webp" srcset="assets/img/about-560.webp 560w, assets/img/about-853.webp 853w" sizes="(min-width: 900px) 420px, 90vw">
          <img src="assets/img/about-853.webp" width="853" height="1137" loading="lazy" decoding="async" alt="Анастасія Пристая в темно-синій медичній формі, схрестивши руки на грудях">
        </picture>
      </div>
      <div class="about__copy">
        <p class="kicker"><b>06</b>Про мене</p>
        <h2 id="about-title" class="sr-only">Про мене</h2>
        <p>Мене звати Анастасія Володимирівна Пристая, і я не люблю, коли мене називають «Настя» (тільки близькі друзі). Я проктологиня. Це якщо коротко! Бо в трудовій написано лікар-хірург-проктолог, а по факту — колопроктолог; друга моя спеціалізація — онкохірургія.</p>
        <p>Я лікую хірургічні хвороби товстої кишки, анального каналу та періанальної ділянки. Моя місія — довести, що проктологія не соромна, а важлива, а огляд у проктолога — не покарання, а процедура, яку можна зробити комфортною.</p>
        <p>Дупця — такий самий орган, як і всі інші: вона заслуговує на увагу й турботу без сорому.</p>${stats}${facts}${book}
      </div>
    </div>

    <div class="honest">
      <h3 data-mask>Чесно — про те, чого я <em>не роблю</em></h3>
      <ul class="honest-grid">
        <li class="honest-card" data-reveal><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 7l18 18M25 7L7 25"/></svg><strong>Не призначаю непотрібних операцій і бездоказових препаратів</strong><p>Категорично. Принципово.</p></li>
        <li class="honest-card" data-reveal style="--d:.08s"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 7l18 18M25 7L7 25"/></svg><strong>Не лікую дітей</strong><p>Не тому, що не хочу: моя освіта не дає на це права. З дітьми — до педіатрів і дитячих хірургів.</p></li>
        <li class="honest-card" data-reveal style="--d:.16s"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 7l18 18M25 7L7 25"/></svg><strong>Не роблю лазером «бо красиво описано в інтернеті»</strong><p>Я виконую всі методи оперативних втручань у проктології, але призначаю їх індивідуально, згідно з вашою ситуацією, а не через розпіареність окремого інструменту.</p></li>
      </ul>
    </div>
  </div>
</section>

<!-- 7б. ОПЕРАЦІЇ -->
<section class="section theme-sand" id="operations" aria-labelledby="ops-title">
  <div class="container">
    <div class="section-head">
      <p class="kicker">Операції</p>
      <h2 id="ops-title" data-mask>Операції та процедури, які я <em>виконую</em></h2>
      <p>Оперую весь обсяг проктологічних втручань, але завжди по показах: метод я обираю індивідуально, під вашу ситуацію.</p>
    </div>
    <p class="ops-lead"><strong>Маю один з найбільших досвідів лікування ректовагінальних нориць та OASIS</strong> (акушерської травми анального сфінктера).</p>
    <div class="ops-grid">
${D.OPS.map(([t, l], i) => `      <details class="ops"><summary>${t}</summary><ul>${l.map((x) => `<li>${x}</li>`).join("")}</ul></details>`).join("\n")}
    </div>
  </div>
</section>

<!-- 8. ЦІНИ -->
<section class="section" id="ceny" aria-labelledby="ceny-title">
  <div class="container">
    <div class="section-head">
      <p class="kicker"><b>07</b>Ціни</p>
      <h2 id="ceny-title" data-mask>Послуги й вартість</h2>
    </div>
    <div class="price-wrap" data-reveal>
      <table class="price-table">
        <caption>${rich(D.SERVICES.caption)}</caption>
        <thead><tr><th scope="col">Послуга</th><th scope="col">Вартість</th></tr></thead>
        <tbody>${prices}</tbody>
      </table>
    </div>
    <div class="price-foot">
      <p>${rich(D.SERVICES.footnote)}</p>
    </div>
  </div>
</section>

<!-- 9. ПОГЛИБИТИ -->
<section class="section theme-sand" id="learn" aria-labelledby="learn-title">
  <div class="container">
    <div class="section-head">
      <p class="kicker"><b>08</b>Поглибити</p>
      <h2 id="learn-title" data-mask>Вебінари: якщо хочеться розібратись <em>глибше</em></h2>
    </div>

    <div class="webinar-grid" aria-label="Вебінари">
      ${D.WEBINARS.map((w, i) => {
        const id = "w-" + (w.id || i + 1);
        const facts = [["Вартість", w.price], ["Тривалість", w.dur], ["Доступ", w.access]].filter(([, v]) => v);
        const msg = `Добрий день! Хочу придбати: ${(w.kind || "вебінар").toLowerCase()} «${w.title}» (${w.price}). Підкажіть, будь ласка, як оплатити та отримати доступ. Моя пошта gmail: `;
        const buy = `<a class="btn" ${w.buy_url ? `href="${esc(w.buy_url)}"` : D.tgAttrs(msg)} rel="noopener" target="_blank">${w.buy_url ? "" : TG_ICON}${txt(w.buy_label || "Придбати")}</a>`;
        const srcset = w.poster ? posterSrcset(R, w.poster) : "";
        const poster = w.poster
          ? `<picture class="wcard__poster">${srcset ? `
          <source type="image/webp" srcset="${srcset}" sizes="(min-width: 1000px) 380px, (min-width: 640px) 45vw, 90vw">` : ""}
          <img src="${asset(R, w.poster)}" width="720" height="720" loading="lazy" decoding="async" alt="${txt(w.alt || w.title)}">
        </picture>`
          : "";
        const list = (arr) => `<ul class="webinar__list">${arr.map((x) => `<li>${rich(x)}</li>`).join("")}</ul>`;
        return `<article class="wcard" data-reveal style="--d:${(i % 3) * 0.08}s">
        ${poster}
        <div class="wcard__body">
          <h3>${txt(w.title)}</h3>
          <p class="wcard__meta">${txt(w.price)}${w.dur ? " · " + txt(w.dur) : ""}</p>
          <div class="wcard__actions">
            <button type="button" class="btn btn--ghost" data-wopen="${id}">Детальніше</button>
            ${buy}
          </div>
        </div>
        <dialog class="wdialog" id="${id}" aria-labelledby="${id}-t">
          <button type="button" class="wdialog__close" data-wclose aria-label="Закрити">×</button>
          <span class="learn-card__kind">${txt(w.kind || "Вебінар")}</span>
          <h3 id="${id}-t">${txt(w.title)}</h3>
          ${w.sub ? `<p class="wcard__sub">${rich(w.sub)}</p>` : ""}
          ${w.lead ? `<p class="wcard__lead">${rich(w.lead)}</p>` : ""}
          ${w.items && w.items.length ? `<h4>Про що</h4>
          ${list(w.items)}` : ""}
          ${w.aud && w.aud.length ? `<h4>Для кого</h4>${list(w.aud)}` : ""}
          ${w.note ? `<p class="webinar__note">${rich(w.note)}</p>` : ""}
          <dl class="wcard__facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${txt(v)}</dd></div>`).join("")}</dl>
          ${buy}
        </dialog>
      </article>`;
      }).join("\n      ")}
    </div>

    <div class="cards3 learn-media">
      ${D.MEDIA.map((m, i) => {
        const yt = ytId(m.url);
        const frame = yt
          ? `<div class="video-card__frame"><iframe src="https://www.youtube-nocookie.com/embed/${yt}" title="${txt(m.title)}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`
          : m.image
            ? `<div class="video-card__frame video-card__frame--img"><img src="${asset(R, m.image)}" alt="" loading="lazy" decoding="async"></div>`
            : "";
        const btn = m.url ? `<a class="btn btn--sm video-card__watch" href="${esc(m.url)}" rel="noopener" target="_blank">${txt(m.button || (yt ? "Дивитись" : "Читати"))}</a>` : "";
        return `<figure class="video-card" data-reveal${i ? ` style="--d:${(i % 3) * 0.1}s"` : ""}>
        ${frame}
        <figcaption><span class="learn-card__kind">${txt(m.kind || "Медіа")}</span><strong>${txt(m.title)}</strong>${m.source ? `<span class="small">${txt(m.source)}</span>` : ""}${btn}</figcaption>
      </figure>`;
      }).join("\n      ")}
      <article class="learn-card learn-card--ig" data-reveal style="--d:${(D.MEDIA.length % 3) * 0.1}s"><div class="learn-card__top"><img class="learn-card__avatar" src="assets/img/portrait-constellation-520.webp" width="520" height="520" loading="lazy" decoding="async" alt="Анастасія Пристая в шапочці із сузір'ями"><span class="learn-card__kind learn-card__kind--ig">${IG_ICON}</span></div><h3>Говорю так само, як тут</h3><p>Сторіс, хайлайти, Reels.<br>Більше тут <svg class="arrow-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18" style="display:inline-block;vertical-align:-0.2em;margin-left:0.25em"><path d="M12 5v14M6 13l6 6 6-6"/></svg></p><a class="link-arrow ig-link" href="${D.IG}" rel="noopener" target="_blank"><span class="ig-nick">@dr.anastasiia_prystaia</span> ${ARROW}</a></article>
    </div>
    <p class="learn-more" data-reveal><a class="btn" href="interviu/">Переглянути більше інтерв'ю та подкастів ${ARROW}</a></p>
  </div>
</section>

<!-- 10. FAQ -->
<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="container">
    <div class="section-head">
      <p class="kicker"><b>09</b>Питання</p>
      <h2 id="faq-title" data-mask>Що люди питають <em>найчастіше</em></h2>
    </div>
    <div class="faq">${faqHtml}</div>
  </div>
</section>

<!-- 11. ЗАПИС -->
<section class="section booking theme-dark" id="zapys" aria-labelledby="zapys-title">
  <div class="container">
    <div class="section-head">
      <p class="kicker"><b>10</b>Запис</p>
      <h2 id="zapys-title" data-mask>Запис <em>на прийом</em></h2>
      <p>Проктолог у Києві: ${[IP.enabled !== false && `очно в клініці ${txt(IP.clinic)}`, ONLINE.enabled !== false && "онлайн-бесіда в Telegram"].filter(Boolean).join(" або ")}. Оберіть зручний шлях.</p>
    </div>${B.announcement && B.announcement.enabled && B.announcement.text ? `
    <div class="booking-notice" role="note" data-reveal>${rich(B.announcement.text)}</div>` : ""}
    <div class="paths">${IP.enabled !== false ? `
      <article class="path" data-reveal>
        <span class="path__kicker">Очно</span>
        <h3>Клініка «${txt(IP.clinic)}»</h3>
        <address>${IP.map_url ? `<a href="${esc(IP.map_url)}" target="_blank" rel="noopener">${txt(IP.address)}</a>` : txt(IP.address)}</address>
        <div class="path__phones">
          ${D.PHONES.map((p) => `<a class="tel" href="tel:${p.tel}">${PHONE}<span>${p.label}</span></a>`).join("\n          ")}
        </div>
        <p class="note"><strong>Під час запису уточніть, що вам саме до Анастасії Пристаї.</strong> Клініка працює: ${txt(D.CLINIC_HOURS)}.</p>${IP.schedule.length ? `
        <dl class="schedule">
${IP.schedule.map((r) => `          <div><dt>${txt(r.day)}</dt><dd>${txt(r.time)}${r.place ? `<span>${txt(r.place)}</span>` : ""}</dd></div>`).join("\n")}
        </dl>` : ""}
        <ul class="mini-list">
          <li>Є страховка? Після візиту на рецепції видадуть документи на відшкодування.</li>
        </ul>
      </article>` : ""}${ONLINE.enabled !== false ? `
      <article class="path" data-reveal style="--d:.1s">
        <span class="path__kicker">Онлайн</span>
        <h3>Бесіда в Telegram</h3>
        <p class="path__price">Планово — ${txt(ONLINE.price)} · ${txt(ONLINE.duration)}<br>Екстрено — ${txt(ONLINE.price_urgent)}</p>
        <p>Письмова розмова в Telegram. Запис — через мого асистента в Telegram: там пояснять усі деталі, надішлють реквізити ФОП і анкету.</p>
        <div><a class="btn" ${D.tgAttrs(MSG_ONLINE)} rel="noopener" target="_blank">${TG_ICON}Написати асистенту ${ARROW}</a></div>
        <p class="note note--lg"><strong>Це освітній формат, а не повноцінна консультація:</strong> точний діагноз без огляду неможливий.<br>Уточнювальні питання — протягом 7 днів, потім я видаляю бесіду для себе. <a href="online/">Прочитати правила</a>.</p>
        <p class="note"><strong>Перед записом обов'язково прочитайте <a href="dokumenty/#oferta">договір публічної оферти</a>.</strong></p>
      </article>` : ""}
    </div>
${B.waitlist.enabled !== false ? `
    <div class="waitlist" data-reveal>
      <div>
        <h3>Немає вільного місця? <em>Лист очікування</em></h3>
        <p>Я розумію, що записатись важко: черга велика. Але понад 6 днів на тиждень фізично працювати не можу. Тому є лист очікування: асистент запише ваші дані й зв'яжеться з вами, щойно звільниться місце або відкриється новий консультативний день.</p>
        <p style="margin-top:.75rem">Прооперовані пацієнти приходять безкоштовно і без черги. Дякую, що чекаєте!</p>
        <p style="margin-top:.75rem;font-size:var(--fs-sm)">Я іноді хворію — і тоді консультація може відмінитись. Але я обов'язково виділю додатковий день, щоб вам допомогти.</p>
      </div>
      <form class="form" data-form data-tg="${Buffer.from(D.TG_HANDLE).toString("base64")}" novalidate>
        <div class="field"><label for="f-name">Ім'я</label><input id="f-name" name="name" type="text" autocomplete="given-name" required aria-describedby="f-name-err"><span class="err" id="f-name-err" aria-live="polite"></span></div>
        <div class="field"><label for="f-contact">Телефон або Telegram <span class="hint">— як вам зручніше відповісти</span></label><input id="f-contact" name="contact" type="text" autocomplete="tel" required aria-describedby="f-contact-err"><span class="err" id="f-contact-err" aria-live="polite"></span></div>
        <div class="field"><label for="f-kind">Що вас цікавить</label><select id="f-kind" name="kind"><option>Очна консультація</option><option>Онлайн-бесіда</option><option>Лист очікування</option><option>Поки не знаю</option></select></div>
        <p class="small">Будь ласка, не пишіть тут діагнози й подробиці симптомів — це для особистої розмови. Після натискання відкриється Telegram із готовим повідомленням асистенту — вам лишиться натиснути «Надіслати».</p>
        <div class="field"><label class="consent"><input type="checkbox" name="consent" value="yes" required aria-describedby="f-consent-err"><span>Я погоджуюсь передати ці дані асистенту в Telegram для зворотного зв'язку. <a href="dokumenty/#privacy">Політика конфіденційності</a></span></label><span class="err" id="f-consent-err" aria-live="polite"></span></div>
        <button class="btn" type="submit">Написати асистенту в Telegram</button>
        <div class="form__status" data-form-status role="status" hidden></div>
      </form>
    </div>` : ""}
  </div>
</section>

<!-- 12. ЗБІР -->
<section class="zbir" id="zbir" aria-labelledby="zbir-title">
  <div class="container">
    <div class="zbir__card" data-reveal>
      <svg class="zbir__heart" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M24 41C24 41 6 30 6 18C6 12 10.500 8.500 15.500 8.500C19.500 8.500 22.500 10.500 24 13.500C25.500 10.500 28.500 8.500 32.500 8.500C37.500 8.500 42 12 42 18C42 30 24 41 24 41Z"/></svg>
      <div class="zbir__copy">
        <p class="kicker">Допомога</p>
        <h2 id="zbir-title">Збір для військових</h2>
        <p>Долучитись до збору можна за посиланням на банку Monobank.</p>
      </div>
      <a class="btn zbir__btn" href="${D.JAR_URL}" rel="noopener" target="_blank">Долучитись до збору ${ARROW}</a>
    </div>
  </div>
</section>

</main>
${footer(R)}
${bookbar(R)}${tail(R, ["core", "scene", "interactive", "form"])}`;

  return (
    head({
      root: R,
      title: "Проктолог у Києві — Анастасія Пристая | Нестрашна проктологія",
      desc: "Лікар-колопроктолог Анастасія Пристая, Київ. Прийом без сорому й без сюрпризів: як проходить огляд, підготовка, ціни, запис очно в OLYMED або онлайн-бесіда.",
      path: "/",
      ld: [physician, website, faqLd],
    }) + body
  );
}

// ---------------- /pryyom/ ----------------
function pryyom() {
  const R = "../";
  const longSteps = [
    ["Бесіда: усе починається з розмови", "Ви приходите — ми сідаємо й говоримо. Консультація проходить без медсестри: ми з вами вдвох. У «Феофанії» може бути присутній інтерн чи практикант — це чудово, бо ми вчимо наступне покоління проктологів, і це в ваших інтересах.", "Поки що ніхто нікого не оглядає."],
    ["Шортики для огляду", "Для огляду я видаю оглядові шортики, тож ви не залишаєтесь без одягу.", "Так, це не вечірній дрес-код."],
    ["Огляд починається лише після бесіди", "Огляд починається тоді, коли ми все обговорили і вам зрозуміло, що буде далі. Під час огляду використовуються лише одноразові інструменти, якісні лубриканти та мазі з місцевим знеболенням, якщо у пацієнта є больовий синдром.", "Жодного «давайте швиденько, поки ви не встигли злякатись»."],
    ["Про кожен рух — заздалегідь", "Зненацька нічого не робиться. Про кожен свій рух я повідомляю наперед.", "Ви весь час знаєте, що буде наступної секунди."],
    ["Без осуду й сорому", "Огляд — звичайна медична процедура, а не покарання. Моя робота — знайти причину й допомогти, а не присоромити.", "Я бачила всяке — здивувати мене важко."],
    ["Швидко — і зрозуміло", "Огляд проводиться швидко — налякатись не встигнете. Після нього ми знову сідаємо й обговорюємо, що далі (докладніше — нижче).", "Із кабінету ви виходите, знаючи, що буде далі."],
  ];
  const prep = D.PREP.map(([t, s]) => `<li><strong>${t}.</strong> ${s}</li>`).join("");
  const body = `${header(R, "pryyom")}
<main id="main">
<section class="page-hero theme-dark">
  ${PAGE_STARS}
  <div class="container">
    ${crumbs(R, "Як проходить прийом")}
    <h1 data-mask>Як проходить прийом у проктолога: крок за кроком</h1>
    <p class="lede">Страх живе там, де невідомість. Тому — все по порядку: що відбувається з моменту, коли ви заходите в кабінет, і до моменту, коли виходите.</p>
    <a class="btn" href="${R}#zapys">Записатись</a>
  </div>
</section>

<section class="section" aria-labelledby="six">
  <div class="container">
    <div class="section-head"><h2 id="six">Шість кроків прийому</h2></div>
    <ol class="steps-long">
      ${longSteps.map(([t, p, q]) => `<li data-reveal><div><h3>${t}</h3><p>${p}</p><p class="quip">${q}</p></div></li>`).join("\n      ")}
    </ol>
  </div>
</section>

<section class="section theme-sand" aria-labelledby="prep-h">
  <div class="container container--narrow">
    <div class="prose">
      <h2 id="prep-h" style="margin-top:0">Підготовка до огляду проктолога</h2>
      <ul class="bullets">${prep}</ul>
      <p><a class="link-arrow" href="${R}#prepare">Чек-ліст, калькулятор часу для мікроклізми і коли готуватись не потрібно ${ARROW}</a></p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="after-h">
  <div class="container container--narrow">
    <div class="prose">
      <h2 id="after-h" style="margin-top:0">А що після огляду?</h2>
      <p>Якщо після огляду та бесіди я рекомендую втручання, то одразу все пояснюю: що саме, чому і як. Тільки ту інформацію, що стосується саме вашої проблеми. Підготовку до операції та всі дрібні моменти видаю текстовим документом. Операції я виконую сама, у клініці «Феофанія»; запис на операцію — після консультації (очної чи онлайн).</p>
      <p>Операція — велика відповідальність. Тому оперую лише після особистого огляду, і лише тоді, коли для цього є показання.</p>
      <div class="callout callout--warn"><h3>Якщо ситуація невідкладна</h3><p>Сильний різкий біль, висока температура чи кровотеча, що не вщухає — не чекайте запису. Телефонуйте 103 або 112, або їдьте до приймального відділення.</p></div>
    </div>
  </div>
</section>

<section class="cta-band theme-dark">
  <div class="container">
    <h2>Тепер ви знаєте, що буде. Лишилось обрати день.</h2>
    <p>Очно в клініці OLYMED або онлайн-бесідою в Telegram.</p>
    <a class="btn" href="${R}#zapys">Записатись</a>
  </div>
</section>
</main>
${footer(R)}
${bookbar(R)}${tail(R, ["core"])}`;
  return (
    head({
      root: R,
      title: "Як проходить прийом проктолога: крок за кроком — Анастасія Пристая",
      desc: "Що відбувається на прийомі у проктолога: бесіда без медсестри, шортики для огляду, попередження про кожен рух. Підготовка до візиту й відповіді на страхи. Київ.",
      path: "/pryyom/",
      ld: [bc([["Головна", "/"], ["Як проходить прийом", "/pryyom/"]])],
    }) + body
  );
}

// ---------------- /online/ ----------------
function online() {
  const R = "../";
  const body = `${header(R, "online")}
<main id="main">
<section class="page-hero theme-dark">
  ${PAGE_STARS}
  <div class="container">
    ${crumbs(R, "Онлайн-бесіда")}
    <h1 data-mask>Онлайн-бесіда з проктологом</h1>
    <p class="lede">Я можу поговорити з вами про вашу проблему та висловити свою думку, спираючись на проктологічний досвід. Такий собі проктологічний лікбез.</p>
    <a class="btn" ${D.tgAttrs(MSG_ONLINE)} rel="noopener" target="_blank">${TG_ICON}Написати асистенту в Telegram ${ARROW}</a>
    <p class="lede" style="margin-top:1.25rem;font-size:var(--fs-sm)"><strong>Перед записом обов'язково прочитайте <a href="${R}dokumenty/#oferta">договір публічної оферти</a>.</strong></p>
  </div>
</section>

<section class="section" aria-labelledby="warn-h">
  <div class="container container--narrow">
    <div class="callout callout--warn">
      <h2 id="warn-h">Важливо знати до запису</h2>
      <ul class="bullets prose" style="gap:.75rem">
        <li>Онлайн-зустріч має освітній характер і не є повноцінною консультацією лікаря. Ви отримаєте інформацію щодо ваших питань, але гарантувати точність діагнозу без огляду неможливо.</li>
        <li>Під час такої зустрічі можуть бути рекомендовані безрецептурні (на території України) ліки. Якщо ви перебуваєте за межами України, вам не будуть надані рецепти на придбання препаратів.</li>
        <li>Онлайн-бесіда — це буквально бесіда з лікарем, але вона не є повноцінним джерелом інформації й не може гарантувати результат.</li>
        <li><strong>При першій можливості зверніться на очний огляд.</strong></li>
      </ul>
    </div>
  </div>
</section>

<section class="section theme-sand" aria-labelledby="how-h">
  <div class="container">
    <div class="section-head"><h2 id="how-h">Як це відбувається</h2></div>
    <ol class="steps-long">
      <li data-reveal><div><h3>Напишіть асистенту в Telegram</h3><p><a ${D.tgAttrs(MSG_ONLINE)} rel="noopener" target="_blank">Чат з асистентом</a>: там вам пояснять усі деталі.</p></div></li>
      <li data-reveal><div><h3>Оплата й анкета</h3><p>Асистент надасть рахунок ФОП (усі податки сплачуються) і посилання на анкету. Потім — посилання на Telegram.</p></div></li>
      <li data-reveal><div><h3>Спілкуємось у Telegram письмово</h3><p>Зустрічі відбуваються у форматі вільного листування. Тривалість — ${txt(ONLINE.duration)}. Я можу відповідати із затримкою — не ображайтесь, робота :)</p></div></li>
      <li data-reveal><div><h3>Після бесіди</h3><p>Уточнювальні питання можна поставити протягом 7 днів після консультації. Потім я для себе видаляю бесіду. При необхідності вас запишуть на очний огляд або операцію.</p></div></li>
      <li data-reveal><div><h3>Складний випадок</h3><p>Якщо ваш випадок складний і потребує ретельнішого обговорення, можливий Zoom-формат. Його запропонують після анкетування.</p></div></li>
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="facts-h">
  <div class="container">
    <div class="two-col">
      <div class="prose">
        <h2 id="facts-h" style="margin-top:0">Формат коротко</h2>
        <ul class="bullets">
          <li><span><strong>Платформа:</strong> Telegram, письмова розмова.</span></li>
          <li><span><strong>Тривалість:</strong> ${txt(ONLINE.duration)}.</span></li>
          <li><span><strong>Вартість:</strong> планово — ${txt(ONLINE.price)} (${txt(ONLINE.duration)}), екстрено — ${txt(ONLINE.price_urgent)}. Оплата — безготівково, на умовах передоплати, після узгодження дати й часу (рахунок ФОП).</span></li>
          <li><span><strong>Скасування (за офертою):</strong> якщо ви скасували не пізніше ніж за 24 години до початку — повертається повна сума. Якщо пізніше — кошти не повертаються, але час можна перенести на інший день.</span></li>
          <li><span><strong>Запис:</strong> через асистента в Telegram.</span></li>
        </ul>
      </div>
      <div class="prose">
        <h2 style="margin-top:0">Кому підходить, а кому ні</h2>
        <p><strong>Підходить, якщо ви:</strong></p>
        <ul class="bullets"><li>бажаєте отримати другу думку;</li><li>перебуваєте за кордоном;</li><li>вже маєте діагноз, але хочете знати про нього більше;</li><li>хочете обговорити призначене лікування.</li></ul>
        <p><strong>Не підходить:</strong></p>
        <ul class="bullets"><li>пацієнтам, які перебувають на стаціонарному лікуванні;</li><li>якщо ситуація невідкладна (сильний різкий біль, висока температура, кровотеча, що не вщухає): тоді — 103 або 112, або приймальне відділення;</li><li>якщо вам потрібен огляд: його онлайн не замінити.</li></ul>
      </div>
    </div>
  </div>
</section>

<section class="cta-band theme-dark">
  <div class="container">
    <h2>Хочете очно? Тут теж усе без сюрпризів.</h2>
    <p>Подивіться, як проходить прийом, і запишіться в OLYMED.</p>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center"><a class="btn" href="${R}#zapys">Записатись очно</a><a class="btn btn--ghost" href="${R}pryyom/">Як проходить прийом</a></div>
  </div>
</section>
</main>
${footer(R)}
${bookbar(R)}${tail(R, ["core"])}`;
  return (
    head({
      root: R,
      title: "Онлайн-консультація проктолога в Telegram — Анастасія Пристая",
      desc: `Онлайн-бесіда з лікарем-проктологом Анастасією Пристаєю: формат, вартість ${ONLINE.price}, правила й застереження. Освітній формат, не заміна очного огляду.`,
      path: "/online/",
      ld: [bc([["Головна", "/"], ["Онлайн-бесіда", "/online/"]])],
    }) + body
  );
}

// ---------------- /interviu/ ----------------
function interviu() {
  const R = "../";
  const cards = D.INTERVIEWS.map((m, i) => {
    const yt = ytId(m.url);
    return `<figure class="video-card" data-reveal${i ? ` style="--d:${(i % 3) * 0.08}s"` : ""}>
        ${yt ? `<div class="video-card__frame"><iframe src="https://www.youtube-nocookie.com/embed/${yt}" title="${txt(m.title)}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>` : ""}
        <figcaption><strong>${txt(m.title)}</strong>${m.source ? `<span class="small">${txt(m.source)}</span>` : ""}<a class="btn btn--sm video-card__watch" href="${esc(m.url)}" rel="noopener" target="_blank">Дивитись на YouTube</a></figcaption>
      </figure>`;
  }).join("\n      ");
  const body = `${header(R, "interviu")}
<main id="main">
<section class="page-hero theme-dark">
  ${PAGE_STARS}
  <div class="container">
    ${crumbs(R, "Інтерв'ю")}
    <h1 data-mask>Інтерв'ю та ефіри</h1>
    <p class="lede">Усі розмови з Анастасією Пристаєю: про проктологію без сорому, пологові травми, хірургію й життя лікарки.</p>
  </div>
</section>
<section class="section" aria-labelledby="int-h">
  <div class="container">
    <h2 id="int-h" class="sr-only">Відео</h2>
    <div class="cards3 learn-media">
      ${cards}
    </div>
  </div>
</section>
<section class="section theme-sand" aria-labelledby="pod-h">
  <div class="container container--narrow">
    <div class="prose">
      <h2 id="pod-h" style="margin-top:0">Подкаст, який я веду</h2>
      <a class="podcast-cover" href="${esc(D.PODCAST_URL)}" rel="noopener" target="_blank"><img src="${R}assets/img/gmka-podcast.webp" width="402" height="300" loading="lazy" decoding="async" alt="GMKA Подкасти"></a>
      <p><strong>GMKA Podcast</strong> — подкаст міжнародної неприбуткової організації Global Medical Knowledge Alliance: пояснюємо про здоров'я просто, про профілактику, діагностику й лікування. Ведуча — я.</p>
      <p>${D.PODCAST_URL ? `<a class="btn" href="${esc(D.PODCAST_URL)}" rel="noopener" target="_blank">Слухати й дивитись подкаст ${ARROW}</a>` : `<span class="ph">[ПОСИЛАННЯ НА ПЛЕЙЛИСТ GMKA PODCAST]</span>`}</p>
    </div>
  </div>
</section>
<section class="cta-band theme-dark">
  <div class="container">
    <h2>Хочете розібратись глибше?</h2>
    <p>Вебінари й консультації: очно та онлайн.</p>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center"><a class="btn" href="${R}#learn">Вебінари</a><a class="btn btn--ghost" href="${R}#zapys">Записатись</a></div>
  </div>
</section>
</main>
${footer(R)}
${bookbar(R)}${tail(R, ["core"])}`;
  return (
    head({
      root: R,
      title: "Інтерв'ю та ефіри — Анастасія Пристая",
      desc: "Інтерв'ю, подкасти й ефіри з лікаркою-проктологинею Анастасією Пристаєю.",
      path: "/interviu/",
      ld: [bc([["Головна", "/"], ["Інтерв'ю", "/interviu/"]])],
    }) + body
  );
}

// ---------------- /dokumenty/ ----------------
function dokumenty() {
  const R = "../";
  const body = `${header(R, "")}
<main id="main">
<section class="page-hero theme-dark">
  ${PAGE_STARS}
  <div class="container">
    ${crumbs(R, "Документи")}
    <h1 data-mask>Документи й застереження</h1>
    <p class="lede">Оферта, конфіденційність, застереження та реквізити. Сторінка в прототипі — із плейсхолдерами: фінальні тексти потрібні від Анастасії та юриста.</p>
  </div>
</section>
<section class="section">
  <div class="container container--narrow">
    <div class="prose">
      <h2 id="oferta" style="margin-top:0">Договір публічної оферти</h2>
      <p>За інформацією з Instagram лікарки, чинна редакція оновлена 30 липня 2025 року. Текст не змінюється без відома лікарки.</p>
      <p>Оферта стосується інформаційно-консультаційних та освітніх послуг, вебінарів, відеокурсів, чек-листів і гайдів. Умови скасування онлайн-бесіди: див. <a href="${R}online/">сторінку онлайн-бесіди</a>.</p>
      <p><span class="ph">[ВСТАВИТИ ПОВНИЙ ТЕКСТ ОФЕРТИ або посилання на PDF — отримати в Анастасії]</span></p>

      <h2 id="privacy">Політика конфіденційності</h2>
      <p>Форма на сайті використовує лише ім'я, контакт (телефон або Telegram) і вибір формату консультації, щоб скласти повідомлення асистенту. Дані з форми нікуди не надсилаються самим сайтом: з них формується повідомлення, яке ви самі відправляєте асистенту в Telegram. Не пишіть у формі діагнози й подробиці симптомів. Сайт не використовує cookie й аналітику.</p>
      <p>Повзунок страху працює у вашому браузері: нічого не зберігається й не надсилається.</p>
      <p><span class="ph">[ПОВНА ПОЛІТИКА КОНФІДЕНЦІЙНОСТІ: текст від юриста]</span></p>

      <h2 id="disclaimer">Застереження</h2>
      <ul class="bullets">
        <li>Матеріали сайту мають освітній характер і не замінюють консультацію лікаря.</li>
        <li>Точний діагноз без огляду неможливий. Не займайтесь самолікуванням.</li>
        <li>Результат лікування залежить від індивідуальних особливостей; гарантій результату немає.</li>
        <li>Онлайн-бесіда — освітній формат, а не повноцінна консультація (<a href="${R}online/">докладніше</a>).</li>
        <li>Ціни орієнтовні; остаточну вартість підтверджує адміністратор клініки.</li>
        <li>У невідкладній ситуації телефонуйте 103 або 112.</li>
      </ul>

      <h2 id="requisites">Реквізити ФОП</h2>
      <ul class="bullets">
        <li>ФОП Пристая Анастасія Володимирівна (виконавець за офертою; платник єдиного податку)</li>
        <li>Питання щодо оферти: <a href="mailto:proctology.team@gmail.com">proctology.team@gmail.com</a>, 5 днів на тиждень з 9:00 до 17:00 (як в оферті)</li>
        <li><span class="ph">[РНОКПП]</span></li>
        <li><span class="ph">[ЮРИДИЧНА АДРЕСА]</span></li>
        <li><span class="ph">[ЛІЦЕНЗІЯ НА МЕДИЧНУ ПРАКТИКУ №: уточнити, чи потрібна для онлайн]</span></li>
      </ul>
    </div>
  </div>
</section>
</main>
${footer(R)}
${bookbar(R)}${tail(R, ["core"])}`;
  return (
    head({
      root: R,
      title: "Документи та застереження — Анастасія Пристая",
      desc: "Договір публічної оферти, політика конфіденційності, застереження та реквізити ФОП.",
      path: "/dokumenty/",
      ld: [bc([["Головна", "/"], ["Документи", "/dokumenty/"]])],
    }) + body
  );
}

// ---------------- 404 ----------------
function notFound() {
  const R = "/";
  // 404 може відкриватись із будь-якого рівня URL — шляхи абсолютні
  const body = `${header(R, "")}
<main id="main" class="notfound theme-dark" style="background:var(--ink-800);color:var(--cream-50)">
  <div class="container" style="display:grid;gap:1.25rem;justify-items:center">
    <p class="notfound__code" aria-hidden="true">404</p>
    <h1 style="font-size:var(--fs-h2)">Тут нічого немає. І це — без сюрпризів.</h1>
    <p class="lede" style="color:#ece6d8">Сторінку не знайдено. Можливо, посилання застаріло. Повернімось туди, де все є.</p>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center"><a class="btn" href="/">На головну</a><a class="btn btn--ghost" href="/#zapys">Записатись</a></div>
  </div>
</main>
${footer(R)}
${tail(R, ["core"])}`;
  return (
    head({
      root: R,
      title: "Сторінку не знайдено — Анастасія Пристая",
      desc: "Сторінку не знайдено.",
      path: "/404.html",
      extraHead: `<meta name="robots" content="noindex">\n`,
    }) + body
  );
}

// ---------------- запис ----------------
const write = (rel, content) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
};
write("index.html", home());
write("pryyom/index.html", pryyom());
write("online/index.html", online());
write("interviu/index.html", interviu());
write("dokumenty/index.html", dokumenty());
write("404.html", notFound());
console.log("built");
