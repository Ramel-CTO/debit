const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// State Variables
let intel = parseInt(localStorage.getItem('debit_intel')) || 0;
let food = parseFloat(localStorage.getItem('debit_food')) || 100;
let water = parseFloat(localStorage.getItem('debit_water')) || 100;
let health = parseFloat(localStorage.getItem('debit_health')) || 100;
let lastTime = parseFloat(localStorage.getItem('debit_last_time')) || Date.now();

let selectedMeter = null;

let comboPitch = 0;
let particles = [];
let floaters = [];
let shakeTimer = 0;

// Brain Pulse Animation State
let pulseScale = 0;
let pulseGlow = 0;

// Robot Face State
let eyeOffsetX = 0;
let eyeOffsetY = 0;
let targetEyeX = 0;
let targetEyeY = 0;
let mouthState = 'neutral';
let hurtTimer = 0;
let nextEyeLookTimer = 0;

// Dynamic Level Titles
const levelTitles = [
  "Baby Bot", "Smart Bot", "Genius Bot", "Cyber Mind", 
  "Quantum AI", "Mega Brain", "Cosmic Oracle", "Omniscient Bot"
];

function getLevelInfo() {
  const level = Math.floor(intel / 100) + 1;
  const currentProgress = intel % 100;
  const titleIndex = Math.min(level - 1, levelTitles.length - 1);
  return {
    level,
    currentProgress,
    title: `Lvl ${level}: ${levelTitles[titleIndex]}`
  };
}

function updateHUD() {
  const info = getLevelInfo();

  document.getElementById('level-title').textContent = info.title;
  document.getElementById('stat-amount').textContent = `${info.currentProgress} / 100 Intel`;
  document.getElementById('intel-bar-fill').style.width = `${info.currentProgress}%`;

  document.getElementById('food-fill').style.width = `${food}%`;
  document.getElementById('water-fill').style.width = `${water}%`;
  document.getElementById('health-fill').style.width = `${health}%`;

  document.getElementById('food-container').classList.toggle('flashing', food <= 50);
  document.getElementById('water-container').classList.toggle('flashing', water <= 50);

  document.getElementById('food-container').classList.toggle('active-target', selectedMeter === 'food');
  document.getElementById('water-container').classList.toggle('active-target', selectedMeter === 'water');
}

function selectMeter(meter) {
  selectedMeter = (selectedMeter === meter) ? null : meter;
  updateHUD();
}

function resetPet() {
  if (confirm("Reset your pet back to Lvl 1 and 0 Intel?")) {
    intel = 0;
    food = 100;
    water = 100;
    health = 100;
    selectedMeter = null;
    localStorage.clear();
    updateHUD();
    
    mouthState = 'crit';
    hurtTimer = 30;
    shakeTimer = 8;
  }
}

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
}

// Web Audio Synthesizer
let audioCtx = null;

function playTapSound(isCrit, toneType) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = isCrit ? 'sawtooth' : 'triangle';
    let baseFreq = isCrit ? 700 : 220 + Math.min(comboPitch * 15, 400);

    if (toneType === 'food') baseFreq = 300 + Math.min(comboPitch * 10, 200);
    if (toneType === 'water') baseFreq = 500 + Math.min(comboPitch * 10, 200);
    if (toneType === 'levelup') baseFreq = 880;

    osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + (isCrit ? 0.3 : 0.08));

    gain.gain.setValueAtTime(isCrit ? 0.4 : 0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (isCrit ? 0.3 : 0.08));

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + (isCrit ? 0.3 : 0.08));
  } catch (e) {}
}

function handleTap(x, y) {
  const isCrit = Math.random() < 0.05;
  const prevLevel = Math.floor(intel / 100);

  if (selectedMeter === 'food') {
    food = Math.min(100, food + (isCrit ? 25 : 8));
    if (food >= 100) selectedMeter = null;
    floaters.push({ text: isCrit ? '+25 FOOD!' : '+8 FOOD', color: '#4ade80', x, y, vy: -2, alpha: 1.0 });
    playTapSound(isCrit, 'food');
  } else if (selectedMeter === 'water') {
    water = Math.min(100, water + (isCrit ? 30 : 10));
    if (water >= 100) selectedMeter = null;
    floaters.push({ text: isCrit ? '+30 WATER!' : '+10 WATER', color: '#38bdf8', x, y, vy: -2, alpha: 1.0 });
    playTapSound(isCrit, 'water');
  } else {
    // Intel Gain
    const inc = isCrit ? 25 : 5;
    intel += inc;
    floaters.push({ text: isCrit ? '+25 INTEL!' : '+5 INTEL', color: isCrit ? '#fbbf24' : '#38bdf8', x, y, vy: -2, alpha: 1.0 });
    
    // Trigger Brain Pulse FX
    pulseScale = 14;
    pulseGlow = 1.0;

    playTapSound(isCrit, 'intel');

    // Check Level Up
    const newLevel = Math.floor(intel / 100);
    if (newLevel > prevLevel) {
      // Massive Level-Up Particle Explosion & Shake
      shakeTimer = 25;
      playTapSound(true, 'levelup');
      floaters.push({ text: 'LEVEL UP! 🎉', color: '#fbbf24', x: width / 2, y: height / 2 - 120, vy: -3, alpha: 1.0 });

      for (let i = 0; i < 60; i++) {
        particles.push({
          x: width / 2, y: height / 2,
          vx: (Math.random() - 0.5) * 22,
          vy: (Math.random() - 0.5) * 22,
          size: Math.random() * 8 + 3,
          life: 1.0,
          color: Math.random() < 0.5 ? '#fbbf24' : '#38bdf8'
        });
      }
    }
  }

  localStorage.setItem('debit_intel', intel);
  localStorage.setItem('debit_food', food);
  localStorage.setItem('debit_water', water);
  localStorage.setItem('debit_health', health);

  updateHUD();

  shakeTimer = Math.max(shakeTimer, isCrit ? 14 : 4);
  comboPitch++;

  mouthState = isCrit ? 'crit' : 'hurt';
  hurtTimer = isCrit ? 22 : 10;

  const centerX = width / 2;
  const centerY = height / 2;
  targetEyeX = Math.max(-12, Math.min(12, (x - centerX) / 15));
  targetEyeY = Math.max(-12, Math.min(12, (y - centerY) / 15));

  const count = isCrit ? 30 : 10;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * (isCrit ? 16 : 8),
      vy: (Math.random() - 0.5) * (isCrit ? 16 : 8),
      size: Math.random() * (isCrit ? 7 : 4) + 2,
      life: 1.0,
      color: isCrit ? '#fbbf24' : '#38bdf8'
    });
  }
}

window.addEventListener('pointerdown', (e) => {
  if (e.clientY > window.innerHeight - 100) return;
  handleTap(e.clientX, e.clientY);
});

function updateDecay() {
  const now = Date.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  water = Math.max(0, water - dt * 0.35); 
  food = Math.max(0, food - dt * 0.2);

  if (food === 0 || water === 0) {
    health = Math.max(0, health - dt * 0.000165 * 100);
  } else if (health < 100 && food > 20 && water > 20) {
    health = Math.min(100, health + dt * 0.05);
  }

  localStorage.setItem('debit_food', food);
  localStorage.setItem('debit_water', water);
  localStorage.setItem('debit_health', health);
  localStorage.setItem('debit_last_time', lastTime);

  updateHUD();
}

setInterval(updateDecay, 1000);

// Forehead Brain Icon Renderer
function drawBrainIcon(cx, cy, size, fillRatio) {
  ctx.save();
  ctx.translate(cx, cy);

  // Brain Outline / Base
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-size * 0.3, 0, size * 0.4, 0.5 * Math.PI, 1.5 * Math.PI);
  ctx.arc(size * 0.3, 0, size * 0.4, 1.5 * Math.PI, 0.5 * Math.PI);
  ctx.closePath();
  ctx.stroke();

  // Glowing Fill according to current Level Progress
  if (fillRatio > 0) {
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-size * 0.3, 0, size * 0.4 * fillRatio, 0, Math.PI * 2);
    ctx.arc(size * 0.3, 0, size * 0.4 * fillRatio, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function renderRobotFace(centerX, centerY, baseSize) {
  // Apply Brain Pulse FX sizing swell
  const size = baseSize + pulseScale;
  if (pulseScale > 0) pulseScale *= 0.85;
  if (pulseGlow > 0) pulseGlow -= 0.05;

  eyeOffsetX += (targetEyeX - eyeOffsetX) * 0.15;
  eyeOffsetY += (targetEyeY - eyeOffsetY) * 0.15;

  const isHealthDeclining = (food === 0 || water === 0);

  if (hurtTimer <= 0) {
    nextEyeLookTimer--;
    if (nextEyeLookTimer <= 0) {
      targetEyeX = (Math.random() - 0.5) * 16;
      targetEyeY = (Math.random() - 0.5) * 12;
      nextEyeLookTimer = Math.floor(Math.random() * 90) + 40;
    }
  } else {
    hurtTimer--;
    if (hurtTimer <= 0) mouthState = 'neutral';
  }

  // --- Brain Pulse Glow Shockwave ---
  if (pulseGlow > 0) {
    ctx.save();
    ctx.strokeStyle = `rgba(56, 189, 248, ${pulseGlow})`;
    ctx.lineWidth = 6;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 20;
    drawRoundedRect(centerX - (size + 16) / 2, centerY - (size + 16) / 2, size + 16, size + 16, 28);
    ctx.restore();
  }

  // --- Main Robot Frame ---
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = mouthState === 'crit' ? '#fbbf24' : (isHealthDeclining ? '#f87171' : '#38bdf8');
  ctx.lineWidth = 4;
  drawRoundedRect(centerX - size / 2, centerY - size / 2, size, size, 24);

  // --- Forehead Brain Icon ---
  const levelInfo = getLevelInfo();
  const fillRatio = levelInfo.currentProgress / 100;
  drawBrainIcon(centerX, centerY - size * 0.32, 18, fillRatio);

  // --- Eyes ---
  const eyeRadius = size * 0.12;
  const leftEyeX = centerX - size * 0.22;
  const rightEyeX = centerX + size * 0.22;
  const eyeY = centerY - size * 0.05;

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(leftEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.arc(rightEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = mouthState === 'crit' ? '#fbbf24' : (isHealthDeclining ? '#f87171' : '#38bdf8');
  const pupilRadius = mouthState === 'hurt' ? eyeRadius * 0.4 : eyeRadius * 0.55;

  ctx.beginPath();
  ctx.arc(leftEyeX + eyeOffsetX, eyeY + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
  ctx.arc(rightEyeX + eyeOffsetX, eyeY + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
  ctx.fill();

  // Eye Catchlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(leftEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.arc(rightEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // --- Mouth ---
  const mouthY = centerY + size * 0.24;
  ctx.strokeStyle = mouthState === 'crit' ? '#fbbf24' : (isHealthDeclining ? '#f87171' : '#38bdf8');
  ctx.lineWidth = 3;
  ctx.fillStyle = '#38bdf8';

  if (isHealthDeclining && mouthState === 'neutral') {
    ctx.beginPath();
    ctx.arc(centerX, mouthY + 10, 16, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
  } else if (mouthState === 'neutral') {
    ctx.beginPath();
    ctx.arc(centerX, mouthY - 5, 18, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else if (mouthState === 'hurt') {
    ctx.beginPath();
    ctx.arc(centerX, mouthY, 10, 0, Math.PI * 2);
    ctx.stroke();
  } else if (mouthState === 'crit') {
    ctx.beginPath();
    ctx.arc(centerX, mouthY, 15, 0, Math.PI * 2);
    ctx.fill();
  }
}

function render() {
  ctx.save();
  if (shakeTimer > 0) {
    ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    shakeTimer--;
  } else {
    comboPitch = Math.max(0, comboPitch - 0.05);
  }

  ctx.clearRect(0, 0, width, height);

  // Render Robot Head
  renderRobotFace(width / 2, height / 2 - 20, 190);

  // Render particles
  particles.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy; p.life -= 0.03;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    if (p.life <= 0) particles.splice(i, 1);
  });

  // Render floating text
  floaters.forEach((f, i) => {
    f.y += f.vy; f.alpha -= 0.02;
    ctx.globalAlpha = Math.max(0, f.alpha);
    ctx.fillStyle = f.color;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(f.text, f.x, f.y);
    if (f.alpha <= 0) floaters.splice(i, 1);
  });

  ctx.restore();
  requestAnimationFrame(render);
}

window.addEventListener('DOMContentLoaded', () => {
  updateHUD();
});

render();
