/* =========================================================
   script.js: how the page BEHAVES (animations).
   Everything is visible without this file; it only adds motion.
   ========================================================= */

// Respect people who turn off animations in their device settings
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  // Tell the CSS that JavaScript is running, so it can prepare the animations
  document.documentElement.classList.add('js');
  typeHeadline();
  revealSections();
  countNumbers();
}

/* 1. TYPING HEADLINE: the pitch under your name types itself out */
function typeHeadline() {
  const pitch = document.querySelector('.pitch');
  if (!pitch) return;
  const text = pitch.textContent;
  pitch.setAttribute('aria-label', text); // screen readers read the full sentence at once
  // "typed" shows the letters so far; "rest" keeps the space so nothing jumps
  pitch.innerHTML = '<span class="typed" aria-hidden="true"></span><span class="caret" aria-hidden="true"></span><span class="rest" aria-hidden="true"></span>';
  const typed = pitch.querySelector('.typed');
  const rest = pitch.querySelector('.rest');
  let i = 0;
  rest.textContent = text;
  setTimeout(function step() {
    i++;
    typed.textContent = text.slice(0, i);
    rest.textContent = text.slice(i);
    if (i < text.length) setTimeout(step, 28);
    else pitch.classList.add('done');
  }, 500);
}

/* 2. SECTIONS SLIDE IN: each section fades and rises when it scrolls into view */
function revealSections() {
  const sections = document.querySelectorAll('main section, .numbers');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // animate once, then stop watching
      }
    });
  }, { threshold: 0.12 });
  sections.forEach((s) => { s.classList.add('reveal'); observer.observe(s); });
  // Safety net: if something goes wrong, show everything after 4 seconds
  setTimeout(() => sections.forEach((s) => s.classList.add('is-visible')), 4000);
}

/* 3. COUNTING NUMBERS: 35,000 / ≈€2M / −20% count up from zero */
function countNumbers() {
  const figs = document.querySelectorAll('.number .fig');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateFigure(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  figs.forEach((f) => observer.observe(f));
}

function animateFigure(el) {
  const original = el.textContent;
  const match = original.match(/[\d,]+/);   // the number part, e.g. "35,000"
  if (!match) return;
  const target = parseInt(match[0].replace(/,/g, ''), 10);
  const before = original.slice(0, match.index);              // e.g. "≈€"
  const after = original.slice(match.index + match[0].length); // e.g. "M"
  const useCommas = match[0].includes(',');
  const duration = 1200;
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // fast start, gentle finish
    // Money under 10 (like €2M) counts with one decimal so the motion is visible
    const decimals = (before.includes('€') && target < 10) ? 1 : 0;
    const value = (target * eased).toFixed(decimals);
    el.textContent = before + (useCommas ? Number(value).toLocaleString('en-US') : value) + after;
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = original; // end exactly on the real text
  }
  requestAnimationFrame(frame);
}
