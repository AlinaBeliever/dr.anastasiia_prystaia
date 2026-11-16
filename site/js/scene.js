/* scene.js — липка сцена «Прийом без сюрпризів»: прогрес скролу → номер кроку.
   Без GSAP: достатньо одного обчислення на кадр. Без руху — звичайний список із 6 кроків. */
(() => {
  "use strict";
  const scene = document.querySelector("[data-scene]");
  if (!scene) return;
  const pin = scene.querySelector(".scene__pin");
  const stage = scene.querySelector(".stage");
  const steps = [...scene.querySelectorAll(".step")];
  const nodes = [...scene.querySelectorAll(".strip__node")];
  const lines = [...scene.querySelectorAll(".strip line")];
  const n = steps.length;
  const header = () => document.querySelector(".site-header")?.offsetHeight || 0;
  let live = false, cur = -1, ticking = false;

  const setStep = (i) => {
    if (i === cur) return;
    cur = i;
    steps.forEach((s, k) => {
      s.classList.toggle("is-active", k === i);
      s.setAttribute("aria-hidden", String(k !== i));
    });
    nodes.forEach((nd, k) => {
      nd.classList.toggle("is-on", k <= i);
      nd.classList.toggle("is-current", k === i);
      if (k === i) nd.setAttribute("aria-current", "step"); else nd.removeAttribute("aria-current");
    });
    lines.forEach((l, k) => l.classList.toggle("is-on", k < i));
  };

  const range = () => scene.offsetHeight - pin.offsetHeight;
  const progress = () => Math.min(1, Math.max(0, (header() - scene.getBoundingClientRect().top) / range()));
  const onScroll = () => {
    if (!live || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      setStep(Math.min(n - 1, Math.floor(progress() * n)));
    });
  };

  const enable = () => {
    if (live) return;
    live = true; cur = -1;
    scene.classList.add("is-live");
    stage.setAttribute("aria-live", "polite");
    setStep(Math.min(n - 1, Math.floor(progress() * n)));
  };
  const disable = () => {
    live = false; cur = -1;
    scene.classList.remove("is-live");
    stage.removeAttribute("aria-live");
    steps.forEach((s) => { s.classList.remove("is-active"); s.removeAttribute("aria-hidden"); });
    nodes.forEach((nd) => nd.classList.remove("is-on", "is-current"));
    lines.forEach((l) => l.classList.remove("is-on"));
  };
  const evaluate = () => {
    const ok = window.motionOK && window.motionOK() && window.innerHeight >= 520;
    if (ok) enable(); else disable();
  };

  nodes.forEach((nd) => nd.addEventListener("click", () => {
    if (!live) return;
    const i = Number(nd.dataset.goto);
    const top = window.scrollY + scene.getBoundingClientRect().top - header() + ((i + 0.5) / n) * range();
    window.scrollTo({ top, behavior: window.motionOK() ? "smooth" : "auto" });
  }));

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { evaluate(); onScroll(); });
  window.addEventListener("motionchange", evaluate);
  evaluate();
})();
