// Збірник сторінок: node tools/build/build.mjs  (перезаписує HTML у site/). Тексти — у data.mjs.
import fs from "node:fs";
import path from "node:path";
import * as D from "./data.mjs";

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../site");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const PHONE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>`;
const STAR_DIVIDER = `<svg class="divider" viewBox="0 0 320 40" aria-hidden="true" focusable="false"><line x1="20" y1="26" x2="80" y2="12"/><line x1="80" y1="12" x2="150" y2="28"/><line x1="150" y1="28" x2="220" y2="10"/><line x1="220" y1="10" x2="300" y2="24"/><circle cx="20" cy="26" r="3"/><circle cx="80" cy="12" r="2.5"/><circle cx="150" cy="28" r="3.5"/><circle cx="220" cy="10" r="2.5"/><circle cx="300" cy="24" r="3"/></svg>`;
const PAGE_STARS = `<svg class="page-hero__stars" viewBox="0 0 300 200" aria-hidden="true" focusable="false"><g stroke="#dfbea6" stroke-width="1" opacity=".5"><line x1="30" y1="150" x2="90" y2="70"/><line x1="90" y1="70" x2="170" y2="100"/><line x1="170" y1="100" x2="230" y2="30"/><line x1="170" y1="100" x2="270" y2="150"/></g><g fill="#b6d94c"><circle cx="30" cy="150" r="3.5"/><circle cx="90" cy="70" r="4.5"/><circle cx="170" cy="100" r="3"/><circle cx="230" cy="30" r="3.5"/><circle cx="270" cy="150" r="4"/></g></svg>`;

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
<meta name="theme-color" content="#14183a">
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
<link rel="icon" href="${root}assets/icons/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${root}assets/fonts/manrope-normal-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/playfair-display-normal-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}css/tokens.css">
<link rel="stylesheet" href="${root}css/base.css">
<link rel="stylesheet" href="${root}css/sections.css">
<link rel="stylesheet" href="${root}css/motion.css">
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
    <a class="logo" href="${root || "./"}" aria-label="Dr. Prystaia — proctology, на головну"><span class="logo__name">Dr. Prystaia</span><span class="logo__sub">proctology</span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Меню"><span></span></button>
    <nav class="nav" id="site-nav" aria-label="Основна навігація">
      <ul class="nav__list">
        ${a(root + "pryyom/", "Як проходить прийом", "pryyom")}
        ${a(root + "#symptoms", "З чим до мене", "")}
        ${a(root + "#about", "Про мене", "")}
        ${a(root + "#ceny", "Ціни", "")}
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
  <a class="btn btn--ghost" href="tel:${D.PHONES[0].tel}">${PHONE}Подзвонити</a>
</div>
`;
}

function footer(root) {
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="logo" href="${root || "./"}" aria-label="На головну"><span class="logo__name">Dr. Prystaia</span><span class="logo__sub">proctology</span></a>
        <p style="margin-top:1rem;max-width:26rem;color:var(--muted-on-dark)">Анастасія Пристая — лікар-хірург, колопроктолог. Очні консультації в Києві, онлайн-бесіди в Telegram.</p>
        <p style="margin-top:.75rem"><a href="${D.IG}" rel="noopener" target="_blank">Instagram @dr.anastasiia_prystaia</a></p>
      </div>
      <div>
        <h2>Сайт</h2>
        <ul class="footer-list">
          <li><a href="${root}pryyom/">Як проходить прийом</a></li>
          <li><a href="${root}#symptoms">З чим до мене прийти</a></li>
          <li><a href="${root}#prepare">Як підготуватись</a></li>
          <li><a href="${root}#ceny">Послуги й вартість</a></li>
          <li><a href="${root}online/">Онлайн-бесіда</a></li>
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
      <span>© 2026 Анастасія Пристая. Прототип: <a href="https://alinabeliever.com" rel="noopener" target="_blank">alinabeliever.com</a></span>
      <button class="motion-toggle" type="button" data-motion-toggle aria-pressed="false">Вимкнути анімації</button>
    </div>
  </div>
</footer>
`;
}

const scripts = (root, list) => list.map((s) => `<script src="${root}js/${s}.js" defer></script>`).join("\n");
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
    name: "OLYMED",
    address: { "@type": "PostalAddress", streetAddress: "вул. Метрологічна, 17/1", addressLocality: "Київ", addressCountry: "UA" },
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

  const sym = D.SYMPTOMS.map(([k, t, p]) => `<li class="sym-card" data-reveal><span class="sym-card__icon">${D.constSvg(k)}</span><div><h3>${t}</h3><p>${p}</p></div></li>`).join("\n");
  const symCta = `<li class="sym-card sym-card--cta" data-reveal><span class="sym-card__icon" style="background:var(--ink-700)">${D.constSvg("unknown")}</span><div><h3>Не знаєте, як назвати?</h3><p>І не треба. Опишіть, як є — це нормальний початок розмови.</p><a class="link-arrow" href="#finder">Спробувати «Це моє?» ${ARROW}</a></div></li>`;
  const myths = D.MYTHS.map(
    ([q, a], i) => `<li data-reveal style="--d:${i * 0.08}s"><button class="flip" type="button" aria-pressed="false">
          <span class="flip__face flip__front"><span class="flip__tag">Міф?</span><span class="flip__q">${q}</span><span class="flip__hint">Перевернути ${ARROW}</span></span>
          <span class="flip__face flip__back"><span class="flip__tag">Факт</span><span class="flip__a">${a}</span><span class="flip__hint">Назад</span></span>
        </button></li>`
  ).join("\n");
  const prep = D.PREP.map(
    ([t, s]) => `<li><label class="check"><input type="checkbox" data-prep><span class="check__box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span><strong>${t}</strong><span class="small">${s}</span></span></label></li>`
  ).join("\n");
  const prices = D.PRICES.map(([t, n, p]) => `<tr><th scope="row">${t}${n ? `<span class="note">${n}</span>` : ""}</th><td>${p}</td></tr>`).join("\n");

  const body = `${header(R, "")}
<main id="main">

<!-- 1. HERO -->
<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="container hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">Анастасія Пристая · лікар-колопроктолог · Київ</p>
      <h1 id="hero-title" data-mask>Проктологія без сорому <em>і без сюрпризів</em></h1>
      <p class="lede">Я — Анастасія Пристая, лікар-хірург і колопроктолог. Мені важливо, щоб ви знали наперед, що з вами відбуватиметься: страх живе там, де невідомість. Тому тут я розповідаю все — від першої бесіди до виходу з кабінету.</p>
      <div class="hero__cta" data-reveal style="--d:.35s">
        <a class="btn" href="#zapys">Записатись</a>
        <a class="link-arrow" href="#pryyom">Дивитись, як проходить прийом ${ARROW}</a>
      </div>
      <ul class="hero__facts" data-reveal style="--d:.45s">
        <li><b>11</b>років у хірургії</li>
        <li><b>+1</b>друга спеціальність — онкохірургія</li>
        <li><b>Сама</b>оперую власноруч</li>
      </ul>
    </div>
    <figure class="hero__figure" data-reveal style="--d:.2s">
      <div class="hero__arch">
        <picture>
          <source type="image/webp" srcset="assets/img/hero-cap-640.webp 640w, assets/img/hero-cap-1080.webp 1080w" sizes="(min-width: 900px) 430px, 80vw">
          <img src="assets/img/hero-cap-1080.webp" width="1080" height="1080" alt="Анастасія Пристая в лайм-зеленій хірургічній шапочці, синій формі та лаймових рукавичках" fetchpriority="high" decoding="async">
        </picture>
      </div>
      <svg class="hero__constellation" viewBox="0 0 400 500" aria-hidden="true" focusable="false">
        <g><line x1="-34" y1="130" x2="24" y2="36"/><line x1="24" y1="36" x2="120" y2="-26"/><line x1="120" y1="-26" x2="250" y2="-30"/><line x1="250" y1="-30" x2="346" y2="20"/><line x1="346" y1="20" x2="420" y2="96"/><line x1="420" y1="96" x2="438" y2="230"/><line x1="-40" y1="330" x2="-6" y2="420"/><line x1="-6" y1="420" x2="70" y2="500"/><line x1="330" y1="520" x2="440" y2="420"/></g>
        <g><circle cx="-34" cy="130" r="4" style="--td:0s"/><circle cx="24" cy="36" r="5" style="--td:.6s"/><circle cx="120" cy="-26" r="3.5" style="--td:1.2s"/><circle cx="250" cy="-30" r="4.5" style="--td:1.8s"/><circle cx="346" cy="20" r="3.5" style="--td:.3s"/><circle cx="420" cy="96" r="5" style="--td:.9s"/><circle cx="438" cy="230" r="3.5" style="--td:1.5s"/><circle cx="-40" cy="330" r="4" style="--td:2.1s"/><circle cx="-6" cy="420" r="3.5" style="--td:.4s"/><circle cx="70" cy="500" r="4.5" style="--td:1s"/><circle cx="330" cy="520" r="4" style="--td:1.6s"/><circle cx="440" cy="420" r="3.5" style="--td:2.4s"/></g>
      </svg>
    </figure>
  </div>
</section>

<!-- 2. НАСКІЛЬКИ ВАМ СТРАШНО -->
<section class="section" id="strakh" aria-labelledby="strakh-title">
  <div class="container">
    <div class="section-head">
      <h2 id="strakh-title" data-mask>Наскільки вам зараз страшно?</h2>
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
          <p data-fear-text>Хвилюватись перед таким візитом — звична річ. Ось що я роблю, щоб було спокійніше:</p>
          <ul class="sky__facts">${D.SKY_FACTS.map((f) => `<li>${f}</li>`).join("")}</ul>
          <div class="sky__actions">
            <a class="btn btn--sm" href="#zapys">Записатись</a>
            <a class="link-arrow" href="pryyom/">Прочитати, що буде ${ARROW}</a>
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
        <h2 id="scene-title">Що з вами відбуватиметься — крок за кроком</h2>
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
      <h2 id="sym-title" data-mask>З чим до проктолога приходять</h2>
      <p>Не обов'язково знати назву. Достатньо відчути, що щось не так. Якщо тут є щось про вас — це до мене.</p>
    </div>
    <ul class="sym-grid">${sym}${symCta}</ul>
    <div class="sym-more">
      <h3>Які хвороби лікує проктолог</h3>
      <ul class="tags">${D.DISEASES.map((d) => `<li>${d}</li>`).join("")}</ul>
      <p class="sym-note">Будь-яку проблему легше, дешевше і приємніше попередити, ніж лікувати!</p>
      <p style="color:var(--text-muted);font-size:var(--fs-sm);max-width:40rem">Здуття живота, закрепи й подібне — це до гастроентеролога, а не до мене.</p>
    </div>

    <div class="finder" data-finder id="finder" aria-labelledby="finder-title">
      <div>
        <h3 id="finder-title">Це моє?</h3>
        <p class="finder__intro">Три короткі запитання, щоб зрозуміти, з чого почати. Нічого не зберігається й нікуди не надсилається.</p>
      </div>
      <div data-finder-body aria-live="polite">
        <noscript><p>Для цього блоку потрібен JavaScript. Без нього просто перегляньте перелік вище — і запишіться на консультацію.</p></noscript>
      </div>
    </div>
  </div>
</section>

<!-- 5. МІФИ -->
<section class="section theme-sand" id="myths" aria-labelledby="myths-title">
  <div class="container">
    <div class="section-head">
      <h2 id="myths-title" data-mask>Чотири страхи, які ми розберемо</h2>
      <p>Торкніться картки, щоб перевернути.</p>
    </div>
    <ul class="flip-grid">${myths}</ul>
  </div>
</section>

<!-- 6. ПІДГОТОВКА -->
<section class="section" id="prepare" aria-labelledby="prep-title">
  <div class="container">
    <div class="section-head">
      <h2 id="prep-title" data-mask>Як підготуватись до візиту</h2>
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
          </ul>
        </div>
        <div class="callout" style="margin-top:2rem">
          <h3>А якщо не підготувались?</h3>
          <p>Я нікуди не дінусь — проконсультую. Але є певна ймовірність, що щось пропущу, і якість такого огляду помітно падає. Тому краще встигнути.</p>
        </div>
      </div>
      <aside class="calc theme-dark" aria-labelledby="calc-title">
        <h3 id="calc-title">О котрій мікроклізма?</h3>
        <div>
          <label for="visit-time">Час вашого візиту</label>
          <input id="visit-time" type="time" data-visit-time>
        </div>
        <div class="calc__out" aria-live="polite" data-calc-out>Введіть час — і я підкажу вікно.</div>
        <small>Орієнтир із мого правила: за 2–3 години до візиту.</small>
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
        <div class="about__stamp"><img src="assets/img/portrait-constellation-520.webp" width="520" height="520" loading="lazy" decoding="async" alt="Анастасія Пристая в шапочці із сузір'ями"></div>
      </div>
      <div class="about__copy">
        <h2 id="about-title" data-mask>Просто Анастасія, дякую</h2>
        <p>Мене звати Анастасія Володимирівна Пристая, і я не люблю, коли мене називають «Настя» (хіба що близькі друзі). Я лікар-хірург, колопроктолог; друга моя спеціалізація — онкохірургія.</p>
        <p>Я лікую хірургічні хвороби товстої кишки, анального каналу та періанальної ділянки. Моя місія — довести, що проктологія не соромна, а важлива, а огляд у проктолога — не покарання, а процедура, яку можна зробити комфортною.</p>
        <ul class="facts">
          <li><b>11</b><span>років у хірургії. Оперую сама, а не кличу «дорослих».</span></li>
          <li><b>300+</b><span>втручань на рік: промежинних і черевної порожнини (за моїми даними 2023 року).</span></li>
          <li><b>Де</b><span>Клінічна лікарня «Феофанія» ДУС (Київ): тут оперую. Консультую також у The Beauty clinic; очний запис — в OLYMED.</span></li>
          <li><b>Ще</b><span>Директорка з питань міжнародного партнерства та зв'язків із громадськістю в GMKA; частина команди @sviy.doc.</span></li>
          <li><b>Освіта</b><span><span class="ph">[ОСВІТА І ПІДВИЩЕННЯ КВАЛІФІКАЦІЇ: уточнити]</span></span></li>
        </ul>
        <div><a class="btn" href="#zapys">Записатись</a></div>
      </div>
    </div>

    <div class="honest">
      <h3 data-mask>Чесно — про те, чого я не роблю</h3>
      <ul class="honest-grid">
        <li class="honest-card" data-reveal><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 7l18 18M25 7L7 25"/></svg><strong>Не призначаю непотрібних операцій і бездоказових препаратів</strong><p>Категорично. Принципово.</p></li>
        <li class="honest-card" data-reveal style="--d:.08s"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 7l18 18M25 7L7 25"/></svg><strong>Не оперую без особистого огляду</strong><p>Операція — велика відповідальність, і я беру її лише свідомо.</p></li>
        <li class="honest-card" data-reveal style="--d:.16s"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 7l18 18M25 7L7 25"/></svg><strong>Не роблю лазером «бо красиво описано в інтернеті»</strong><p>Лазер — лише коли є залізні показання.</p></li>
        <li class="honest-card" data-reveal style="--d:.24s"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 7l18 18M25 7L7 25"/></svg><strong>Не телефоную страховим під час прийому</strong><p>Після візиту на рецепції видадуть акт виконаних робіт — подасте на відшкодування самостійно.</p></li>
      </ul>
    </div>
  </div>
</section>

<!-- 8. ЦІНИ -->
<section class="section" id="ceny" aria-labelledby="ceny-title">
  <div class="container">
    <div class="section-head">
      <h2 id="ceny-title" data-mask>Послуги й вартість</h2>
    </div>
    <div class="price-wrap" data-reveal>
      <table class="price-table">
        <caption>Консультації та додаткові процедури</caption>
        <thead><tr><th scope="col">Послуга</th><th scope="col">Вартість</th></tr></thead>
        <tbody>${prices}</tbody>
      </table>
    </div>
    <div class="price-foot">
      <p><strong>Ціни орієнтовні</strong> (за інформацією лікарки, листопад 2026). Остаточну вартість підтверджує адміністратор клініки. Обсяг і метод лікування визначає лікар під час консультації.</p>
    </div>
  </div>
</section>

<!-- 9. ПОГЛИБИТИ -->
<section class="section theme-sand" id="learn" aria-labelledby="learn-title">
  <div class="container">
    <div class="section-head">
      <h2 id="learn-title" data-mask>Якщо хочеться розібратись глибше</h2>
    </div>
    <article class="webinar" data-reveal>
      <picture class="webinar__poster">
        <source type="image/webp" srcset="assets/img/webinar-480.webp 480w, assets/img/webinar-720.webp 720w" sizes="(min-width: 820px) 360px, 90vw">
        <img src="assets/img/webinar-720.webp" width="720" height="892" loading="lazy" decoding="async" alt="Афіша вебінару Анастасії Пристаї «Знеболення дупці. Як не поїхати дахом від болю після операції? Практичний гайд»">
      </picture>
      <div class="webinar__body">
        <span class="learn-card__kind">Вебінар</span>
        <h3>Знеболення дупці</h3>
        <p class="webinar__lead">Як не поїхати дахом від болю після операції? Практичний гайд.</p>
        <h4>Про що</h4>
        <ul class="webinar__list">
          <li>як знеболитись і які ліки приймати;</li>
          <li>як ходити в туалет і підмиватись;</li>
          <li>як доглядати за ранками;</li>
          <li>що можна їсти й які обмеження;</li>
          <li>коли можна починати спроби завагітніти;</li>
          <li>на що звертати увагу, чого «боятись», що нормально після операції і коли зберігати спокій.</li>
        </ul>
        <h4>Для кого</h4>
        <ul class="webinar__list">
          <li>кому потрібна операція, але страшно через невідомість «а що потім?»;</li>
          <li>в кого заплановане втручання і хочеться підготуватись;</li>
          <li>хто вже прооперувався, але чомусь не має нормальної комунікації зі своїм хірургом.</li>
        </ul>
        <p class="webinar__note">Підготує до реабілітації після видалення геморою (будь-яким методом), анальної тріщини, поліпів та інших доброякісних утворень, операцій з приводу нориць. Загалом допоможе зорієнтуватись після будь-якої операції в ділянці анального каналу.</p>
        <dl class="webinar__facts">
          <div><dt>Вартість</dt><dd>1000 грн</dd></div>
          <div><dt>Доступ</dt><dd>6 місяців <small>(обов'язкова пошта gmail)</small></dd></div>
          <div><dt>Бонус</dt><dd>цей вебінар + вебінар «Геморой» або «Анальна тріщина» — 2000 грн замість 2600 грн</dd></div>
        </dl>
        <a class="btn" href="${D.IG_ONLINE}" rel="noopener" target="_blank">Придбати: написати в директ @prystaia.online ${ARROW}</a>
      </div>
    </article>

    <div class="cards3 learn-media">
      <figure class="video-card" data-reveal>
        <div class="video-card__frame"><iframe src="https://www.youtube-nocookie.com/embed/zvl4JwCSOd4" title="Як правильно ходити в туалет? Відверта розмова з проктологом" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
        <figcaption><span class="learn-card__kind">Відео</span><strong>Як правильно ходити в туалет? Відверта розмова з проктологом</strong><span class="small">«Між Нами Лікарями»</span></figcaption>
      </figure>
      <figure class="video-card" data-reveal style="--d:.1s">
        <div class="video-card__frame"><iframe src="https://www.youtube-nocookie.com/embed/ZgUXv8izj_o" title="Анастасія Пристая: про хірургію, великі гроші, три роботи, приватну медицину та принципи" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
        <figcaption><span class="learn-card__kind">Подкаст</span><strong>Про хірургію, великі гроші, три роботи, приватну медицину та принципи</strong><span class="small">«Заплати собі сама» з Оксаною Железко</span></figcaption>
      </figure>
      <article class="learn-card" data-reveal style="--d:.2s"><span class="learn-card__kind">Instagram</span><h3>Говорю так само, як тут</h3><p>Сторіс, хайлайти («Псиліум», «Мамське», «Пологова травма»), Reels. Мене читають 78,3 тис. людей.</p><a class="link-arrow" href="${D.IG}" rel="noopener" target="_blank">@dr.anastasiia_prystaia ${ARROW}</a></article>
    </div>
  </div>
</section>

<!-- 10. FAQ -->
<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="container">
    <div class="section-head">
      <h2 id="faq-title" data-mask>Що люди питають найчастіше</h2>
    </div>
    <div class="faq">${faqHtml}</div>
    <div class="faq-cta"><a class="btn" href="#zapys">Записатись</a><a class="link-arrow" href="pryyom/">Усе про прийом ${ARROW}</a></div>
  </div>
</section>

<!-- 11. ЗАПИС -->
<section class="section booking theme-dark" id="zapys" aria-labelledby="zapys-title">
  <div class="container">
    <div class="section-head">
      <h2 id="zapys-title" data-mask>Записатись до проктолога в Києві: оберіть зручний шлях</h2>
    </div>
    <div class="paths">
      <article class="path" data-reveal>
        <span class="path__kicker">Очно</span>
        <h3>Клініка «OLYMED»</h3>
        <address>вул. Метрологічна, 17/1, Київ</address>
        <div class="path__phones">
          ${D.PHONES.map((p) => `<a class="btn" href="tel:${p.tel}">${PHONE}${p.label}</a>`).join("\n          ")}
        </div>
        <p class="note"><strong>Під час запису уточніть, що вам саме до Анастасії Пристаї.</strong> Години прийому: <span class="ph">[УТОЧНИТИ]</span></p>
        <ul class="mini-list">
          <li>Операції — в клініці «Феофанія»; запис після консультації, очної чи онлайн.</li>
          <li>Є страховка? Після візиту на рецепції видадуть акт виконаних робіт — подасте на відшкодування самостійно.</li>
        </ul>
      </article>
      <article class="path" data-reveal style="--d:.1s">
        <span class="path__kicker">Онлайн</span>
        <h3>Бесіда в Telegram</h3>
        <p class="path__price">1500 грн · до 30 хвилин</p>
        <p>Письмова розмова в Telegram. Запис — через мого асистента в Instagram: там пояснять усі деталі, надішлють реквізити ФОП і анкету.</p>
        <div><a class="btn" href="${D.IG_ONLINE}" rel="noopener" target="_blank">Написати асистенту ${ARROW}</a></div>
        <p class="note"><strong>Це освітній формат, а не повноцінна консультація:</strong> точний діагноз без огляду неможливий. <a href="online/">Прочитати правила</a>. Прямий Telegram-лінк: <span class="ph">[TELEGRAM: уточнити]</span></p>
      </article>
    </div>

    <div class="waitlist" data-reveal>
      <div>
        <h3>Немає вільного місця? Лист очікування</h3>
        <p>Я розумію, що записатись важко: черга велика. Але понад 6 днів на тиждень фізично працювати не можу. Тому є лист очікування: адміністратор запише ваші дані й передзвонить, щойно звільниться місце або відкриється новий консультативний день.</p>
        <p style="margin-top:.75rem">Прооперовані пацієнти приходять безкоштовно і без черги. Дякую, що чекаєте!</p>
        <p style="margin-top:.75rem;font-size:var(--fs-sm)">Я іноді хворію — і тоді консультація може відмінитись. Але я обов'язково виділю додатковий день, щоб вам допомогти.</p>
      </div>
      <form class="form" data-form action="${D.FORM_ACTION}" method="POST" novalidate>
        <div class="field"><label for="f-name">Ім'я</label><input id="f-name" name="name" type="text" autocomplete="given-name" required aria-describedby="f-name-err"><span class="err" id="f-name-err" aria-live="polite"></span></div>
        <div class="field"><label for="f-contact">Телефон або Telegram <span class="hint">— як вам зручніше відповісти</span></label><input id="f-contact" name="contact" type="text" autocomplete="tel" required aria-describedby="f-contact-err"><span class="err" id="f-contact-err" aria-live="polite"></span></div>
        <div class="field"><label for="f-kind">Що вас цікавить</label><select id="f-kind" name="kind"><option>Очна консультація</option><option>Онлайн-бесіда</option><option>Лист очікування</option><option>Поки не знаю</option></select></div>
        <p class="small">Будь ласка, не пишіть тут діагнози й подробиці симптомів — це для особистої розмови.</p>
        <div class="field"><label class="consent"><input type="checkbox" name="consent" value="yes" required aria-describedby="f-consent-err"><span>Я погоджуюсь на обробку моїх персональних даних для зворотного зв'язку. <a href="dokumenty/#privacy">Політика конфіденційності</a></span></label><span class="err" id="f-consent-err" aria-live="polite"></span></div>
        <input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
        <input type="hidden" name="_subject" value="Заявка з сайту (лист очікування / зворотний зв'язок)">
        <button class="btn" type="submit">Залишити контакт</button>
        <div class="form__status" data-form-status role="status" hidden></div>
      </form>
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
    ["Огляд починається лише після бесіди", "Огляд починається тоді, коли ми все обговорили і вам зрозуміло, що буде далі.", "Жодного «давайте швиденько, поки ви не встигли злякатись»."],
    ["Про кожен рух — заздалегідь", "Зненацька нічого не робиться. Про кожен свій рух я повідомляю наперед.", "Сюрпризи — на день народження, а не в кабінеті."],
    ["Максимально комфортно", "Я роблю все, щоб огляд був комфортним. Це звичайна медична процедура, а не покарання.", "Дупця — такий самий орган, як і всі інші."],
    ["Швидко — і зрозуміло", "Огляд проводиться швидко — налякатись не встигнете. Після нього ми знову розмовляємо. Якщо потрібне втручання, я одразу пояснюю все популярно — тільки те, що стосується саме вашої проблеми. Підготовку до операції та всі дрібні моменти видаю у вигляді текстового документа.", "Із кабінету ви виходите, знаючи, що буде далі."],
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
  <div class="container">
    <div class="two-col">
      <div class="prose">
        <h2 id="prep-h" style="margin-top:0">Підготовка до огляду проктолога</h2>
        <ul class="bullets">${prep}</ul>
        <p><a class="link-arrow" href="${R}#prepare">Інтерактивний чек-ліст і калькулятор часу ${ARROW}</a></p>
      </div>
      <div class="prose">
        <h2 style="margin-top:0">Коли готуватись не потрібно</h2>
        <ul class="bullets">
          <li><span><strong>Ситуація ургентна.</strong> Але тоді пацієнт приїздить каретою швидкої, а не читає цей текст.</span></li>
          <li><span><strong>Консультація післяопераційна.</strong> Такий огляд переслідує зовсім інші цілі.</span></li>
          <li><span><strong>Консультація повторна,</strong> і я сказала, що до неї готуватись не потрібно.</span></li>
        </ul>
        <div class="callout"><h3>А якщо не підготувались?</h3><p>Я нікуди не дінусь — проконсультую. Але є певна ймовірність, що щось пропущу, і якість такого огляду помітно падає.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="after-h">
  <div class="container container--narrow">
    <div class="prose">
      <h2 id="after-h" style="margin-top:0">А що після огляду?</h2>
      <p>Якщо після огляду та бесіди я рекомендую втручання, то одразу все пояснюю: що саме, чому і як. Тільки ту інформацію, що стосується саме вашої проблеми. Усе обговорюється на консультації. Операції я виконую сама, у клініці «Феофанія»; запис на операцію — після консультації (очної чи онлайн).</p>
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
    <a class="btn" href="${D.IG_ONLINE}" rel="noopener" target="_blank">Написати асистенту в Instagram ${ARROW}</a>
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
      <li data-reveal><div><h3>Напишіть асистенту в Instagram</h3><p>Акаунт <a href="${D.IG_ONLINE}" rel="noopener" target="_blank">@prystaia.online</a>: там вам пояснять усі деталі.</p></div></li>
      <li data-reveal><div><h3>Оплата й анкета</h3><p>Асистент надасть рахунок ФОП (усі податки сплачуються) і посилання на анкету. Потім — посилання на Telegram.</p></div></li>
      <li data-reveal><div><h3>Спілкуємось у Telegram письмово</h3><p>Зустрічі відбуваються у форматі вільного листування. Тривалість — до 30 хвилин. Я можу відповідати із затримкою — не ображайтесь, робота :)</p></div></li>
      <li data-reveal><div><h3>Після бесіди</h3><p>Протягом тижня після консультації дозволяються три уточнювальні запитання. При необхідності вас запишуть на очний огляд або операцію.</p></div></li>
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
          <li><span><strong>Тривалість:</strong> до 30 хвилин.</span></li>
          <li><span><strong>Вартість:</strong> 1500 грн. Оплата — безготівково, на умовах передоплати, після узгодження дати й часу (рахунок ФОП).</span></li>
          <li><span><strong>Скасування (за офертою):</strong> якщо ви скасували не пізніше ніж за 24 години до початку — повертається повна сума. Якщо пізніше — кошти не повертаються, але час можна перенести на інший день.</span></li>
          <li><span><strong>Запис:</strong> через асистента в Instagram.</span></li>
          <li><span><strong>Прямий Telegram-лінк:</strong> <span class="ph">[TELEGRAM: уточнити]</span></span></li>
        </ul>
      </div>
      <div class="prose">
        <h2 style="margin-top:0">Кому підходить, а кому ні</h2>
        <p><strong>Підходить,</strong> якщо хочете розібратись із питанням до візиту, обговорити підготовку чи те, що незрозуміло.</p>
        <p><strong>Не підходить,</strong> якщо ситуація невідкладна (сильний різкий біль, висока температура, кровотеча, що не вщухає): тоді — 103 або 112, або приймальне відділення. І якщо вам потрібен огляд: його онлайн не замінити.</p>
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
      desc: "Онлайн-бесіда з лікарем-проктологом Анастасією Пристаєю: формат, вартість 1500 грн, правила й застереження. Освітній формат, не заміна очного огляду.",
      path: "/online/",
      ld: [bc([["Головна", "/"], ["Онлайн-бесіда", "/online/"]])],
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
      <p>Форма на сайті збирає лише ім'я, контакт (телефон або Telegram) і вибір формату консультації, щоб зв'язатись із вами. Дані передаються через сервіс обробки форм Formspree. Не пишіть у формі діагнози й подробиці симптомів. Сайт не використовує cookie й аналітику.</p>
      <p>Навігатор «Це моє?» та повзунок страху працюють у вашому браузері: нічого не зберігається й не надсилається.</p>
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
    <p class="lede" style="color:#e6e1ea">Сторінку не знайдено. Можливо, посилання застаріло. Повернімось туди, де все є.</p>
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
write("dokumenty/index.html", dokumenty());
write("404.html", notFound());
console.log("built");
