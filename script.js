const currentYear = new Date().getFullYear();
document.querySelector("#year")?.replaceChildren(String(currentYear));
document.querySelector("#footer-year")?.replaceChildren(String(currentYear));

const updateKey = "davidkalu:last-seen-write-up";
const reloadKey = "davidkalu:write-up-reload-at";
const pollEvery = 30000;

function scheduleRefresh(deadline, countdown) {
  const tick = () => {
    const secondsLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    if (countdown) countdown.textContent = String(secondsLeft);
    if (secondsLeft === 0) {
      try { sessionStorage.removeItem(reloadKey); } catch {}
      window.location.reload();
    }
  };
  tick();
  window.setInterval(tick, 250);
}

function showNewWriteUp(update) {
  const deadline = Date.now() + 10000;
  try {
    if (localStorage.getItem(updateKey) === update.id) return;
    localStorage.setItem(updateKey, update.id);
    sessionStorage.setItem(reloadKey, String(deadline));
  } catch {
    return;
  }

  const notice = document.createElement("aside");
  notice.className = "new-writeup-notice";
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
  const mark = document.createElement("span");
  mark.className = "notice-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = "✳";
  const copy = document.createElement("div");
  copy.className = "notice-copy";
  const kicker = document.createElement("span");
  kicker.className = "notice-kicker";
  kicker.textContent = "FRESH FROM THE NOTEBOOK";
  const title = document.createElement("strong");
  title.className = "notice-title";
  title.textContent = update.title;
  const refresh = document.createElement("span");
  refresh.className = "notice-refresh";
  refresh.append("Page refreshes in ");
  const countdown = document.createElement("b");
  countdown.textContent = "10";
  refresh.append(countdown, " seconds");
  copy.append(kicker, title, refresh);
  const link = document.createElement("a");
  link.className = "notice-link";
  link.href = update.url;
  link.append("Read it now ");
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  link.append(arrow);
  const progress = document.createElement("span");
  progress.className = "notice-progress";
  progress.setAttribute("aria-hidden", "true");
  notice.append(mark, copy, link, progress);
  document.body.append(notice);
  scheduleRefresh(deadline, countdown);
}

async function checkForNewWriteUp() {
  try {
    const response = await fetch(`/updates.json?check=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return;
    const update = await response.json();
    if (update && update.id && update.title && update.url) showNewWriteUp(update);
  } catch {
    // Keep the page usable if the update file is unavailable.
  }
}

try {
  const deadline = Number(sessionStorage.getItem(reloadKey));
  if (deadline > Date.now()) scheduleRefresh(deadline, null);
  else sessionStorage.removeItem(reloadKey);
} catch {}
checkForNewWriteUp();
window.setInterval(checkForNewWriteUp, pollEvery);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".post-card, .about-card, .about-note, .hero-art").forEach((item, index) => {
    item.classList.add("reveal-on-scroll");
    item.style.setProperty("--reveal-delay", `${Math.min(index, 4) * 75}ms`);
    revealObserver.observe(item);
  });
}

function startDualShockFrenzy() {
  const cycle = ["triangle", "circle", "cross", "square"];
  const glyphs = { triangle: "△", circle: "○", cross: "×", square: "□" };
  const names = { triangle: "triangle", circle: "circle", cross: "cross", square: "square" };
  const combinationResults = {
    "circle|circle": "cross", "cross|cross": "square", "square|square": "triangle", "triangle|triangle": "circle",
    "circle|cross": "square", "circle|square": "cross", "circle|triangle": "cross",
    "cross|square": "triangle", "cross|triangle": "circle", "square|triangle": "circle"
  };
  const pieces = [];
  const caught = [];
  let welcomeShown = false;
  let won = false;
  let audioContext = null;
  let lastFrame = performance.now();
  const isLaptop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const welcome = document.createElement("aside");
  welcome.className = "frenzy-welcome";
  welcome.setAttribute("role", "status");
  welcome.setAttribute("aria-live", "polite");
  welcome.innerHTML = '<span class="frenzy-popup-mark" aria-hidden="true">✳</span><div><span class="frenzy-label">A LITTLE SIDE QUEST</span><p>One thing gaming teaches you: notice the pattern, adapt when it changes, and keep going. In <strong>DualShock Frenzy</strong>, catch the four symbols in the controller’s clockwise order to uncover a hidden write-up.</p></div><button class="frenzy-dismiss" type="button" aria-label="Dismiss game message">×</button>';
  document.body.append(welcome);
  welcome.querySelector(".frenzy-dismiss").addEventListener("click", () => welcome.classList.remove("is-visible"));

  const success = document.createElement("dialog");
  success.className = "frenzy-secret";
  success.setAttribute("aria-labelledby", "frenzy-secret-title");
  success.innerHTML = '<form method="dialog"><button class="frenzy-close" aria-label="Close hidden write-up">×</button></form><p class="eyebrow">A NOTE YOU FOUND</p><h2 id="frenzy-secret-title"></h2><div class="frenzy-secret-copy"></div><p class="frenzy-signoff">THANKS FOR PLAYING <span aria-hidden="true">✳</span></p>';
  document.body.append(success);

  const bonusWriteups = [
    { title: "A resource in motion", paragraphs: ["We talk about being smart as if it were a fixed thing: something a person either has or doesn’t. But ability changes with the room we are in, the tools we can reach, and the time someone gives us to try.", "A book can open a door. A patient teacher can turn a mistake into a method. A chance to practise can make an unfamiliar thing feel possible. The person did not suddenly become worthy of learning; they finally got the conditions to show what they could do.", "Maybe that is why I think of smarts as a resource. Resources grow when they are shared, supported, and put to use."] },
    { title: "The useful mistake", paragraphs: ["A mistake is an answer to a question you did not know you were asking. It tells you where your current idea stops working.", "That can feel like failure for a moment. Then you adjust, try again, and leave with a better map than the one you started with.", "I want to get better at treating mistakes as information, without pretending they never sting."] },
    { title: "Start before you feel ready", paragraphs: ["There is a version of me that waits until every detail is right before beginning. That version is very organised and has made absolutely nothing.", "Starting gives an idea something real to push against. It lets other people respond, lets the rough edges show, and gives the next attempt a direction.", "So this is a small reminder to begin imperfectly. The next step gets easier to see once you are moving."] },
    { title: "Borrowed light", paragraphs: ["Most of what I know began with something someone else shared: a lesson, a generous explanation, a book, or a question that would not leave me alone.", "Learning can feel personal, but it is rarely solitary. We carry pieces of other people’s patience and curiosity into the things we make.", "If I can pass even one useful piece along, that feels like a good use of what I have learned."] }
  ];

  function showBonusWriteup() {
    let previous = -1;
    try { const stored = window.localStorage.getItem("dk-frenzy-last-writeup"); previous = stored === null ? -1 : Number(stored); } catch { /* Storage may be unavailable. */ }
    const choices = bonusWriteups.map((_, index) => index).filter((index) => index !== previous);
    const selectedIndex = choices[Math.floor(Math.random() * choices.length)];
    const selected = bonusWriteups[selectedIndex];
    success.querySelector("#frenzy-secret-title").textContent = selected.title;
    const copy = success.querySelector(".frenzy-secret-copy");
    copy.replaceChildren(...selected.paragraphs.map((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      return element;
    }));
    try { window.localStorage.setItem("dk-frenzy-last-writeup", String(selectedIndex)); } catch { /* Storage may be unavailable. */ }
  }

  function unlockSound() {
    if (audioContext) {
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
      return;
    }
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return;
    try {
      audioContext = new AudioEngine();
      audioContext.resume().catch(() => {});
    } catch {
      audioContext = null;
    }
  }
  document.addEventListener("pointerdown", unlockSound, { once: true });
  document.addEventListener("keydown", unlockSound, { once: true });

  function playCollisionSound(shape) {
    if (!audioContext || audioContext.state !== "running") return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    const notes = { triangle: 520, circle: 610, cross: 700, square: 780 };
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(notes[shape] || 600, now);
    oscillator.frequency.exponentialRampToValueAtTime((notes[shape] || 600) * 1.35, now + 0.12);
    volume.gain.setValueAtTime(0.001, now);
    volume.gain.exponentialRampToValueAtTime(0.055, now + 0.018);
    volume.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    oscillator.connect(volume);
    volume.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.21);
  }

  function showRipple(x, y) {
    const ripple = document.createElement("span");
    ripple.className = "frenzy-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.setAttribute("aria-hidden", "true");
    document.body.append(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  }

  function updateShape(piece, shape) {
    piece.shape = shape;
    piece.el.dataset.shape = shape;
    piece.el.textContent = glyphs[shape];
    piece.el.setAttribute("aria-label", `Catch the floating ${names[shape]}`);
    piece.el.classList.remove("fusion-flash");
    void piece.el.offsetWidth;
    piece.el.classList.add("fusion-flash");
    piece.el.addEventListener("animationend", () => piece.el.classList.remove("fusion-flash"), { once: true });
  }

  function catchPiece(piece, x, y) {
    if (!piece.active || won) return;
    piece.active = false;
    piece.el.classList.add("is-caught");
    showRipple(x, y);
    if (!welcomeShown) {
      welcomeShown = true;
      welcome.style.left = `${Math.max(12, Math.min(x + 20, window.innerWidth - 340))}px`;
      welcome.style.top = `${Math.max(12, Math.min(y - 42, window.innerHeight - 180))}px`;
      requestAnimationFrame(() => welcome.classList.add("is-visible"));
    }

    const shape = piece.shape;
    if (caught.length === 0 || shape === cycle[(cycle.indexOf(caught[caught.length - 1]) + 1) % cycle.length]) {
      caught.push(shape);
    } else {
      caught.splice(0, caught.length, shape);
    }
    if (caught.length === 4) {
      won = true;
      showBonusWriteup();
      window.setTimeout(() => {
        if (typeof success.showModal === "function") success.showModal();
        else success.setAttribute("open", "");
      }, 500);
      return;
    }
    window.setTimeout(() => {
      if (won) return;
      piece.x = Math.max(8, Math.min(window.innerWidth - symbolSize - 8, Math.random() * (window.innerWidth - 70)));
      piece.y = Math.max(88, Math.min(window.innerHeight - 64, Math.random() * (window.innerHeight - 110)));
      piece.vx = (Math.random() - 0.5) * 0.7;
      piece.vy = (Math.random() - 0.5) * 0.55;
      piece.active = true;
      piece.cooldownUntil = performance.now() + 700;
      piece.el.style.left = `${piece.x}px`;
      piece.el.style.top = `${piece.y}px`;
      piece.el.classList.remove("is-caught");
    }, 900);
  }

  function fuse(first, second, now, distance, dx, dy) {
    const pair = [first.shape, second.shape].sort().join("|");
    const result = combinationResults[pair] || "circle";
    updateShape(first, result);
    updateShape(second, result);
    first.cooldownUntil = second.cooldownUntil = now + 900;
    const safeDistance = Math.max(distance, 0.01);
    const nx = dx / safeDistance;
    const ny = dy / safeDistance;
    const separation = Math.max(2, (52 - distance) / 2);
    first.x -= nx * separation;
    first.y -= ny * separation;
    second.x += nx * separation;
    second.y += ny * separation;
    first.vx = -first.vx;
    first.vy = -first.vy;
    second.vx = -second.vx;
    second.vy = -second.vy;
    first.el.style.left = `${first.x}px`;
    first.el.style.top = `${first.y}px`;
    second.el.style.left = `${second.x}px`;
    second.el.style.top = `${second.y}px`;
    playCollisionSound(result);
    showRipple((first.x + second.x) / 2 + symbolHalf, (first.y + second.y) / 2 + symbolHalf);
  }

  function animate(now) {
    const delta = Math.min(2, (now - lastFrame) / 16.67);
    lastFrame = now;
    const edge = 8;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const maxTop = Math.max(88, height - 60);
    for (const piece of pieces) {
      if (!piece.active) continue;
      piece.x += piece.vx * delta;
      piece.y += piece.vy * delta;
      if (piece.x < edge || piece.x > width - 54) piece.vx *= -1;
      if (piece.y < 82 || piece.y > maxTop) piece.vy *= -1;
      piece.x = Math.max(edge, Math.min(width - 54, piece.x));
      piece.y = Math.max(82, Math.min(maxTop, piece.y));
      piece.el.style.left = `${piece.x}px`;
      piece.el.style.top = `${piece.y}px`;
    }
    for (let first = 0; first < pieces.length; first += 1) {
      const a = pieces[first];
      if (!a.active || a.cooldownUntil > now) continue;
      for (let second = first + 1; second < pieces.length; second += 1) {
        const b = pieces[second];
        if (!a.active || a.cooldownUntil > now || !b.active || b.cooldownUntil > now) continue;
        const dx = (b.x + symbolHalf) - (a.x + symbolHalf);
        const dy = (b.y + symbolHalf) - (a.y + symbolHalf);
        const distance = Math.hypot(dx, dy);
        if (distance < symbolSize + 2) fuse(a, b, now, distance, dx, dy);
      }
    }
    requestAnimationFrame(animate);
  }

  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const symbolSize = isMobile ? 44 : 46;
  const symbolHalf = symbolSize / 2;
  const columns = isMobile ? [0.08, 0.84] : [0.06, 0.32, 0.62, 0.86];
  const rows = isMobile ? [0.18, 0.30, 0.42, 0.54] : [0.22, 0.48];
  const spawnSlots = rows.flatMap((y, row) => columns.map((x, column) => ({ x, y, row, column })));
  for (let index = spawnSlots.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [spawnSlots[index], spawnSlots[otherIndex]] = [spawnSlots[otherIndex], spawnSlots[index]];
  }
  const horizontalPhase = Math.random() < 0.5 ? 1 : -1;
  const verticalPhase = Math.random() < 0.5 ? 1 : -1;
  for (let index = 0; index < spawnSlots.length; index += 1) {
    const { row, column } = spawnSlots[index];
    const shape = cycle[index % cycle.length];
    const element = document.createElement("button");
    element.type = "button";
    element.className = "frenzy-symbol";
    element.dataset.shape = shape;
    element.textContent = glyphs[shape];
    element.setAttribute("aria-label", `Catch the floating ${names[shape]}`);
    const x = Math.max(8, Math.min(window.innerWidth - symbolSize - 8, window.innerWidth * spawnSlots[index].x + (Math.random() - 0.5) * 14));
    const y = Math.max(82, Math.min(window.innerHeight - symbolSize - 14, window.innerHeight * spawnSlots[index].y + (Math.random() - 0.5) * 8));
    const piece = {
      el: element,
      shape,
      x,
      y,
      vx: (column % 2 === 0 ? horizontalPhase : -horizontalPhase) * (0.3 + Math.random() * 0.18),
      vy: (row % 2 === 0 ? verticalPhase : -verticalPhase) * (0.36 + Math.random() * 0.18),
      active: true,
      cooldownUntil: 0
    };
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.addEventListener("click", (event) => {
      const rect = element.getBoundingClientRect();
      catchPiece(piece, event.clientX || rect.left + rect.width / 2, event.clientY || rect.top + rect.height / 2);
    });
    document.body.append(element);
    pieces.push(piece);
  }

  if (isLaptop) {
    document.addEventListener("pointermove", (event) => {
      for (const piece of pieces) {
        if (!piece.active || won) continue;
        const centerX = piece.x + symbolHalf;
        const centerY = piece.y + symbolHalf;
        const dx = centerX - event.clientX;
        const dy = centerY - event.clientY;
        const distance = Math.hypot(dx, dy);
        if (distance < 19) {
          catchPiece(piece, centerX, centerY);
        } else if (distance < 118) {
          const magnitude = Math.max(distance, 0.01);
          piece.vx = Math.max(-1.15, Math.min(1.15, piece.vx + (dx / magnitude) * 0.28));
          piece.vy = Math.max(-1.15, Math.min(1.15, piece.vy + (dy / magnitude) * 0.28));
        }
      }
    }, { passive: true });
  }

  window.addEventListener("resize", () => {
    for (const piece of pieces) {
      piece.x = Math.max(8, Math.min(window.innerWidth - symbolSize - 8, piece.x));
      piece.y = Math.max(82, Math.min(window.innerHeight - 60, piece.y));
    }
  });
  requestAnimationFrame(animate);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startDualShockFrenzy, { once: true });
} else {
  startDualShockFrenzy();
}