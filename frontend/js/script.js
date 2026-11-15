// ===== AstroWell demo script (all data below is sample data) =====

// ---------- Sample data (replace with backend data later) ----------
const sampleData = {
  sleepDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  sleepHours: [6.5, 7.0, 5.8, 7.5, 6.9, 8.0, 7.2],
  sleepGoal: 7.5,
  activityMinutes: [90, 110, 75, 120, 100, 60, 85],
  activityGoal: 120,
  stress: 42,
  water: 5,
  waterGoal: 8,
  mood: "Calm",
  moodHistory: [
    { mood: "Happy", when: "Yesterday, 18:00" },
    { mood: "Tired", when: "Yesterday, 08:00" },
    { mood: "Calm", when: "2 days ago, 18:00" }
  ]
};

const moodMessages = {
  Happy: "Great to hear! Keep doing what is working for you.",
  Calm: "A calm mind is a good place to be. Keep it up.",
  Tired: "Try a short rest and drink some water. Check your sleep page too.",
  Stressed: "Try the breathing exercise on the Stress page.",
  Sad: "It is okay to feel this way. Consider talking to a crewmate or family."
};

// ---------- Page navigation ----------
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("nav a");
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuBtn");

function showPage() {
  let id = location.hash.replace("#", "");
  if (!document.getElementById(id)) id = "home";
  pages.forEach(p => p.classList.toggle("active", p.id === id));
  navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
  if (id !== "stress") stopBreathing();
}
window.addEventListener("hashchange", showPage);

// Buttons that jump to another page (data-go="pageId")
document.querySelectorAll("[data-go]").forEach(btn => {
  btn.addEventListener("click", () => { location.hash = btn.dataset.go; });
});

menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});

// ---------- Bar chart helper ----------
function drawBars(containerId, values, labels, max, goal) {
  const box = document.getElementById(containerId);
  box.innerHTML = "";
  values.forEach((v, i) => {
    const col = document.createElement("div");
    col.className = "bar-col";
    col.innerHTML = `<div class="bar" style="height:0"><span class="bar-val">${v}</span></div><span class="bar-label">${labels[i]}</span>`;
    box.appendChild(col);
    // set height after adding so the CSS transition plays
    setTimeout(() => { col.querySelector(".bar").style.height = (v / max) * 100 + "%"; }, 50);
  });
  if (goal) {
    // chart area excludes 22px label space at the bottom
    const line = document.createElement("div");
    line.className = "goal-line";
    line.style.bottom = `calc(22px + (100% - 22px) * ${goal / max})`;
    line.title = "Goal: " + goal;
    box.appendChild(line);
  }
}

// ---------- Stress ----------
function updateStress(value) {
  let level = "low", text = "Low stress. You are doing well.";
  if (value >= 65) { level = "high"; text = "High stress. Try the breathing exercise below and take a break."; }
  else if (value >= 35) { level = "mod"; text = "Moderate stress. A short relaxation break could help."; }
  const label = level === "low" ? "Low" : level === "mod" ? "Moderate" : "High";

  [["stressBar", "stressValue"], ["dashStressBar", "dashStress"]].forEach(([barId, valId]) => {
    const bar = document.getElementById(barId);
    bar.className = "meter-fill " + level;
    bar.style.width = value + "%";
    document.getElementById(valId).textContent = value;
  });
  document.getElementById("stressText").textContent = text;
  document.getElementById("dashStressLabel").textContent = label;
}

document.getElementById("newReading").addEventListener("click", () => {
  updateStress(Math.floor(Math.random() * 81) + 10); // random 10-90
});

// ---------- Breathing exercise ----------
const circle = document.getElementById("breathCircle");
const breathText = document.getElementById("breathText");
const startBtn = document.getElementById("startBreath");
const stopBtn = document.getElementById("stopBreath");
let breathTimer = null;
let breathing = false;

// phase: label, seconds, circle scale
const phases = [
  { label: "Breathe in", secs: 4, scale: 1.3 },
  { label: "Hold", secs: 4, scale: 1.3 },
  { label: "Breathe out", secs: 6, scale: 0.8 }
];

function runPhase(i) {
  if (!breathing) return;
  const p = phases[i % phases.length];
  breathText.textContent = p.label;
  circle.style.transition = `transform ${p.secs}s ease-in-out`;
  circle.style.transform = `scale(${p.scale})`;
  breathTimer = setTimeout(() => runPhase(i + 1), p.secs * 1000);
}

function startBreathing() {
  if (breathing) return;
  breathing = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  runPhase(0);
}

function stopBreathing() {
  breathing = false;
  clearTimeout(breathTimer);
  circle.style.transition = "transform 0.6s ease";
  circle.style.transform = "scale(0.8)";
  breathText.textContent = "Ready";
  startBtn.disabled = false;
  stopBtn.disabled = true;
}
startBtn.addEventListener("click", startBreathing);
stopBtn.addEventListener("click", stopBreathing);

// ---------- Mood ----------
const moodButtons = document.querySelectorAll("#moodButtons button");

function renderMood() {
  document.getElementById("moodSelected").textContent = sampleData.mood;
  document.getElementById("dashMood").textContent = sampleData.mood;
  document.getElementById("moodMessage").textContent = moodMessages[sampleData.mood];
  moodButtons.forEach(b => b.classList.toggle("selected", b.dataset.mood === sampleData.mood));

  const list = document.getElementById("moodHistory");
  list.innerHTML = "";
  sampleData.moodHistory.slice(0, 7).forEach(entry => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${entry.mood}</strong><span>${entry.when}</span>`;
    list.appendChild(li);
  });
}

moodButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    sampleData.mood = btn.dataset.mood;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    sampleData.moodHistory.unshift({ mood: btn.dataset.mood, when: "Today, " + time });
    renderMood();
  });
});

// ---------- Water ----------
function renderWater() {
  const box = document.getElementById("glasses");
  box.innerHTML = "";
  for (let i = 0; i < sampleData.waterGoal; i++) {
    const g = document.createElement("div");
    g.className = "glass" + (i < sampleData.water ? " full" : "");
    box.appendChild(g);
  }
  document.getElementById("waterCount").textContent = sampleData.water;
  document.getElementById("addWater").disabled = sampleData.water >= sampleData.waterGoal;
}
document.getElementById("addWater").addEventListener("click", () => {
  if (sampleData.water < sampleData.waterGoal) { sampleData.water++; renderWater(); }
});
document.getElementById("resetWater").addEventListener("click", () => {
  sampleData.water = 0;
  renderWater();
});

// ---------- Start everything ----------
drawBars("dashSleepChart", sampleData.sleepHours, sampleData.sleepDays, 10);
drawBars("sleepChart", sampleData.sleepHours, sampleData.sleepDays, 10, sampleData.sleepGoal);
drawBars("activityChart", sampleData.activityMinutes, sampleData.sleepDays, 150, sampleData.activityGoal);
updateStress(sampleData.stress);
renderMood();
renderWater();
showPage();