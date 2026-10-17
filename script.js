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
  const symbolInfo = [
    { id: "triangle", glyph: "△", label: "triangle", x: 12, y: 42 },
    { id: "circle", glyph: "○", label: "circle", x: 83, y: 36 },
    { id: "cross", glyph: "×", label: "cross", x: 18, y: 76 },
    { id: "square", glyph: "□", label: "square", x: 87, y: 73 }
  ];
  const cycle = ["triangle", "circle", "cross", "square"];
  const caught = [];
  const pieces = new Map();
  let welcomeShown = false;
  let won = false;
  const isLaptop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const welcome = document.createElement("aside");
  welcome.className = "frenzy-welcome";
  welcome.setAttribute("role", "status");
  welcome.setAttribute("aria-live", "polite");
  welcome.innerHTML = '<span class="frenzy-popup-mark" aria-hidden="true">✳</span><div><span class="frenzy-label">A LITTLE SIDE QUEST</span><p>Welcome to my mini game — <strong>DualShock Frenzy</strong> — catch the 4 symbols in the clockwise order of a controller to get a hidden write-up.</p></div><button class="frenzy-dismiss" type="button" aria-label="Dismiss game message">×</button>';
  document.body.append(welcome);
  welcome.querySelector(".frenzy-dismiss").addEventListener("click", () => welcome.classList.remove("is-visible"));

  const success = document.createElement("dialog");
  success.className = "frenzy-secret";
  success.setAttribute("aria-labelledby", "frenzy-secret-title");
  success.innerHTML = '<form method="dialog"><button class="frenzy-close" aria-label="Close hidden write-up">×</button></form><p class="eyebrow">A NOTE YOU FOUND</p><h2 id="frenzy-secret-title">A resource in motion</h2><p>We talk about being smart as if it were a fixed thing: something a person either has or doesn’t. But ability changes with the room we are in, the tools we can reach, and the time someone gives us to try.</p><p>A book can open a door. A patient teacher can turn a mistake into a method. A chance to practise can make an unfamiliar thing feel possible. The person did not suddenly become worthy of learning; they finally got the conditions to show what they could do.</p><p>Maybe that is why I think of smarts as a resource. Resources grow when they are shared, supported, and put to use.</p><p class="frenzy-signoff">THANKS FOR PLAYING <span aria-hidden="true">✳</span></p>';
  document.body.append(success);

  function showRipple(x, y) {
    const ripple = document.createElement("span");
    ripple.className = "frenzy-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.setAttribute("aria-hidden", "true");
    document.body.append(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  }

  function catchPiece(piece, x, y) {
    if (piece.dataset.caught === "true" || won) return;
    piece.dataset.caught = "true";
    const id = piece.dataset.symbol;
    const info = symbolInfo.find((symbol) => symbol.id === id);
    piece.classList.add("is-caught");
    showRipple(x, y);
    if (!welcomeShown) {
      welcomeShown = true;
      welcome.style.left = `${Math.max(12, Math.min(x + 20, window.innerWidth - 340))}px`;
      welcome.style.top = `${Math.max(12, Math.min(y - 42, window.innerHeight - 180))}px`;
      requestAnimationFrame(() => welcome.classList.add("is-visible"));
    }

    if (caught.length === 0 || id === cycle[(cycle.indexOf(caught[caught.length - 1]) + 1) % cycle.length]) {
      caught.push(id);
    } else {
      caught.splice(0, caught.length, id);
    }
    piece.setAttribute("aria-label", `${info.label}, caught ${caught.length} of 4 in your current sequence`);
    if (caught.length === 4) {
      won = true;
      window.setTimeout(() => {
        if (typeof success.showModal === "function") success.showModal();
        else success.setAttribute("open", "");
      }, 500);
      return;
    }
    window.setTimeout(() => {
      if (won) return;
      piece.dataset.caught = "false";
      piece.classList.remove("is-caught");
      piece.setAttribute("aria-label", `Catch the floating ${info.label}`);
    }, 1000);
  }

  symbolInfo.forEach((info, index) => {
    const piece = document.createElement("button");
    piece.type = "button";
    piece.className = `frenzy-symbol frenzy-${info.id}`;
    piece.textContent = info.glyph;
    piece.dataset.symbol = info.id;
    piece.dataset.caught = "false";
    piece.setAttribute("aria-label", `Catch the floating ${info.label}`);
    piece.style.left = `${info.x}vw`;
    piece.style.top = `${info.y}vh`;
    piece.style.setProperty("--float-delay", `${index * -1.4}s`);
    piece.addEventListener("click", (event) => catchPiece(piece, event.clientX || piece.getBoundingClientRect().left + 20, event.clientY || piece.getBoundingClientRect().top + 20));
    document.body.append(piece);
    pieces.set(info.id, piece);
  });

  if (isLaptop) {
    document.addEventListener("pointermove", (event) => {
      for (const piece of pieces.values()) {
        if (piece.dataset.caught === "true" || won) continue;
        const rect = piece.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = centerX - event.clientX;
        const dy = centerY - event.clientY;
        const distance = Math.hypot(dx, dy);
        if (distance < 19) {
          catchPiece(piece, centerX, centerY);
        } else if (distance < 118) {
          const shove = (118 - distance) * 0.19;
          const left = Math.max(8, Math.min(window.innerWidth - rect.width - 8, rect.left + (dx / distance) * shove));
          const top = Math.max(80, Math.min(window.innerHeight - rect.height - 18, rect.top + (dy / distance) * shove));
          piece.style.left = `${left}px`;
          piece.style.top = `${top}px`;
        }
      }
    }, { passive: true });
  }
}

startDualShockFrenzy();
