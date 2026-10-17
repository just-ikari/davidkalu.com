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
  let deadline = Date.now() + 10000;
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
    // If the update file is unavailable, keep the page usable without the notice.
  }
}

try {
  const deadline = Number(sessionStorage.getItem(reloadKey));
  if (deadline > Date.now()) scheduleRefresh(deadline, null);
  else sessionStorage.removeItem(reloadKey);
} catch {}

checkForNewWriteUp();
window.setInterval(checkForNewWriteUp, pollEvery);
