/* core.js — меню, поява елементів, «маска» заголовків, липка панель запису */
(() => {
  "use strict";
  const d = document;
  const root = d.documentElement;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

  /** Анімації увімкнені завжди; вимикаються лише системним налаштуванням «Зменшити рух» */
  const motionOK = () => !mq.matches;
  window.motionOK = motionOK;
  const announce = () => window.dispatchEvent(new CustomEvent("motionchange"));
  (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(announce);

  // ---------- Мобільне меню ----------
  const menuBtn = d.querySelector(".menu-btn");
  const nav = d.getElementById("site-nav");
  if (menuBtn && nav) {
    const setOpen = (open, focusBtn) => {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Закрити меню" : "Меню");
      if (!open && focusBtn) menuBtn.focus();
    };
    menuBtn.addEventListener("click", () => setOpen(menuBtn.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    d.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) setOpen(false, true); });
    window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  // ---------- «Маска»: слова заголовків виїжджають знизу ----------
  const split = (el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(" "); return; }
            const w = d.createElement("span"); w.className = "w";
            const s = d.createElement("span"); s.textContent = part; s.style.setProperty("--i", i++);
            w.append(s); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  };
  d.querySelectorAll("[data-mask]").forEach(split);

  // ---------- Поява при скролі ----------
  const targets = d.querySelectorAll("[data-reveal], [data-mask]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach((t) => io.observe(t));
  } else targets.forEach((t) => t.classList.add("in-view"));

  // ---------- Липка панель запису: ховаємо біля блоку запису й підвалу ----------
  const bar = d.querySelector("[data-bookbar]");
  const zapys = d.getElementById("zapys");
  if (bar && "IntersectionObserver" in window) {
    const hide = new Set();
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? hide.add(e.target) : hide.delete(e.target)));
      bar.classList.toggle("is-hidden", hide.size > 0);
    }, { threshold: 0.15 });
    [zapys, d.querySelector(".site-footer")].filter(Boolean).forEach((t) => io2.observe(t));
    // На головній панель з'являється лише після блоку «крок за кроком»
    const scene = d.getElementById("pryyom");
    if (scene && scene.hasAttribute("data-scene")) {
      let passed = false;
      const upd = () => {
        passed = scene.getBoundingClientRect().bottom <= window.innerHeight * 0.5;
        bar.classList.toggle("is-early", !passed);
      };
      upd();
      addEventListener("scroll", upd, { passive: true });
      addEventListener("resize", upd);
    }
  }
})();
