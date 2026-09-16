const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Tamagotchi State
let intel = parseInt(localStorage.getItem('debit_intel')) || 0;
let food = parseFloat(localStorage.getItem('debit_food')) || 100;
let water = parseFloat(localStorage.getItem('debit_water')) || 100;
let health = parseFloat(localStorage.getItem('debit_health')) || 100;
let lastTime = parseFloat(localStorage.getItem('debit_last_time')) || Date.now();

let selectedMeter = null; // 'food', 'water', or null

let comboPitch = 0;
let particles = [];
let floaters = [];
let shakeTimer = 0;

// Robot Face State
let eyeOffsetX = 0;
let eyeOffsetY = 0;
let targetEyeX = 0;
let targetEyeY = 0;
let mouthState = 'neutral';
let hurtTimer = 0;
let nextEyeLookTimer = 0;

function updateHUD() {
  const statEl = document.getElementById('stat-amount');
  if (statEl) statEl.textContent = `${intel} Intel`;

  document.getElementById('food-fill').style.width = `${food}%`;
  document.getElementById('water-fill').style.width = `${water}%`;
  document.getElementById('health-fill').style.width = `${health}%`;

  // Toggle flashing animations when below 50%
  document.getElementById('food-container').classList.toggle('flashing', food <= 50);
  document.getElementById('water-container').classList.toggle('flashing', water <= 50);

  // Active target selection border
  document.getElementById('food-container').classList.toggle('active-target', selectedMeter === 'food');
  document.getElementById('water-container').classList.toggle('active-target', selectedMeter === 'water');
}

function selectMeter(meter) {
  if (selectedMeter === meter) {
    selectedMeter = null; // Deselect on second tap
  } else {
    selectedMeter = meter;
  }
  updateHUD();
}

function resetPet() {
  if (confirm("Reset your pet back to 0 Intel and full health?")) {
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

// Canvas Helpers
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

    osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + (isCrit ? 0.2 : 0.08));

    gain.gain.setValueAtTime(isCrit ? 0.4 : 0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (isCrit ? 0.2 : 0.08));

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + (isCrit ? 0.2 : 0.08));
  } catch (e) {}
}

function handleTap(x, y) {
  const isCrit = Math.random() < 0.05;

  if (selectedMeter === 'food') {
    food = Math.min(100, food + (isCrit ? 25 : 8));
    if (food >= 100) selectedMeter = null; // Auto deselect when full
    floaters.push({ text: isCrit ? '+25 FOOD!' : '+8 FOOD', color: '#4ade80', x, y, vy: -2, alpha: 1.0 });
    playTapSound(isCrit, 'food');
  } else if (selectedMeter === 'water') {
    water = Math.min(100, water + (isCrit ? 30 : 10));
    if (water >= 100) selectedMeter = null;
    floaters.push({ text: isCrit ? '+30 WATER!' : '+10 WATER', color: '#38bdf8', x, y, vy: -2, alpha: 1.0 });
    playTapSound(isCrit, 'water');
  } else {
    // Standard Intel Tapping
    const inc = isCrit ? 25 : 5;
    intel += inc;
    floaters.push({ text: isCrit ? '+25 INTEL!' : '+5 INTEL', color: isCrit ? '#fbbf24' : '#38bdf8', x, y, vy: -2, alpha: 1.0 });
    playTapSound(isCrit, 'intel');
  }

  // Save State
  localStorage.setItem('debit_intel', intel);
  localStorage.setItem('debit_food', food);
  localStorage.setItem('debit_water', water);
  localStorage.setItem('debit_health', health);

  updateHUD();

  shakeTimer = isCrit ? 14 : 4;
  comboPitch++;

  mouthState = isCrit ? 'crit' : 'hurt';
  hurtTimer = isCrit ? 22 : 10;

  // Eye tracking tap point
  const centerX = width / 2;
  const centerY = height / 2;
  targetEyeX = Math.max(-12, Math.min(12, (x - centerX) / 15));
  targetEyeY = Math.max(-12, Math.min(12, (y - centerY) / 15));

  // Particles
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
  // Prevent canvas taps when clicking bottom HUD controls
  if (e.clientY > window.innerHeight - 100) return;
  handleTap(e.clientX, e.clientY);
});

// Decaying Loop Mechanics
function updateDecay() {
  const now = Date.now();
  const dt = (now - lastTime) / 1000; // Time delta in seconds
  lastTime = now;

  // Water decays faster than Food
  water = Math.max(0, water - dt * 0.35); 
  food = Math.max(0, food - dt * 0.2);

  // Health drops over 7 days if Food or Water is 0
  // 100 Health / (7 days * 86400 sec) = ~0.000165% per second
  if (food === 0 || water === 0) {
    health = Math.max(0, health - dt * 0.000165 * 100);
  } else if (health < 100 && food > 20 && water > 20) {
    // Slow health recovery when fed & hydrated
    health = Math.min(100, health + dt * 0.05);
  }

  localStorage.setItem('debit_food', food);
  localStorage.setItem('debit_water', water);
  localStorage.setItem('debit_health', health);
  localStorage.setItem('debit_last_time', lastTime);

  updateHUD();
}

setInterval(updateDecay, 1000);

function renderRobotFace(centerX, centerY, size) {
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

  // Outer Frame
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = mouthState === 'crit' ? '#fbbf24' : (isHealthDeclining ? '#f87171' : '#38bdf8');
  ctx.lineWidth = 4;
  drawRoundedRect(centerX - size / 2, centerY - size / 2, size, size, 24);

  // Eyes
  const eyeRadius = size * 0.12;
  const leftEyeX = centerX - size * 0.22;
  const rightEyeX = centerX + size * 0.22;
  const eyeY = centerY - size * 0.12;

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

  // Eye Catchlight Sparks
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(leftEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.arc(rightEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // --- Mouth Expressions ---
  const mouthY = centerY + size * 0.2;
  ctx.strokeStyle = mouthState === 'crit' ? '#fbbf24' : (isHealthDeclining ? '#f87171' : '#38bdf8');
  ctx.lineWidth = 3;
  ctx.fillStyle = '#38bdf8';

  if (isHealthDeclining && mouthState === 'neutral') {
    // Always show Sad Mouth when health is declining
    ctx.beginPath();
    ctx.arc(centerX, mouthY + 10, 16, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
  } else if (mouthState === 'neutral') {
    // Normal happy smile
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
