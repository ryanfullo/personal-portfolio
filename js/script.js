// ---------- Mobile menu ----------
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");

function setMenu(open) {
  nav.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// ---------- Light / dark mode ----------
const root = document.documentElement;
const themeBtn = document.querySelector(".theme-toggle");

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  try { localStorage.setItem("theme", theme); } catch (e) {}
}

themeBtn.addEventListener("click", () => applyTheme(root.dataset.theme === "light" ? "dark" : "light"));
themeBtn.setAttribute("aria-label", root.dataset.theme === "light" ? "Switch to dark mode" : "Switch to light mode");

// ---------- Night sky: moving, twinkling stars ----------
const canvas = document.querySelector(".stars");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

let w = 0, h = 0, stars = [], shooting = [], nextShot = 0;

function makeStars() {
  const count = Math.max(60, Math.min(240, Math.round((w * h) / 5000)));
  stars = Array.from({ length: count }, () => {
    const r = Math.random() * 1.5 + 0.3;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r,
      speed: r * 0.14 + 0.03,                 // bigger stars are "closer", so they move faster
      phase: Math.random() * Math.PI * 2,     // twinkle
      twinkle: Math.random() * 0.03 + 0.01
    };
  });
}

function resize() {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  makeStars();
}

function starColor(alpha) {
  return root.dataset.theme === "light"
    ? `rgba(20, 50, 190, ${alpha * 0.55})`
    : `rgba(255, 255, 255, ${alpha})`;
}

function spawnShootingStar() {
  shooting.push({ x: Math.random() * w * 0.8, y: Math.random() * h * 0.35, vx: 7 + Math.random() * 4, vy: 3 + Math.random() * 2, life: 0 });
}

function draw(time) {
  ctx.clearRect(0, 0, w, h);

  stars.forEach((s) => {
    if (!reduceMotion) {
      s.x -= s.speed;                         // drift left
      s.y -= s.speed * 0.35;                  // and slightly up
      s.phase += s.twinkle;
      if (s.x < -2) s.x = w + 2;
      if (s.y < -2) s.y = h + 2;
    }
    const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.phase));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = starColor(alpha);
    ctx.fill();
  });

  if (!reduceMotion) {
    if (time > nextShot) { spawnShootingStar(); nextShot = time + 4000 + Math.random() * 5000; }
    shooting = shooting.filter((m) => m.life < 70);
    shooting.forEach((m) => {
      m.x += m.vx; m.y += m.vy; m.life++;
      const fade = 1 - m.life / 70;
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
      g.addColorStop(0, starColor(fade));
      g.addColorStop(1, starColor(0));
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9);
      ctx.stroke();
    });
    requestAnimationFrame(draw);
  }
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { resize(); if (reduceMotion) draw(0); }, 150);
});

resize();
requestAnimationFrame(draw);