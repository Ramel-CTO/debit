const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Allowance State
let allowance = parseFloat(localStorage.getItem('debit_allowance')) || 0.00;

let comboPitch = 0;
let particles = [];
let floaters = [];
let bugs = [];
let shakeTimer = 0;

// Robot Face State
let eyeOffsetX = 0;
let eyeOffsetY = 0;
let targetEyeX = 0;
let targetEyeY = 0;
let mouthState = 'neutral';
let hurtTimer = 0;
let nextEyeLookTimer = 0;

// Kids Allowance & Financial Advice List
const tips = [
  "💡 Saving even $1 a week adds up fast over time!",
  "💰 Wants vs. Needs: Needs are things you must have; wants are extra fun!",
  "🐷 Try putting half of your allowance into a savings jar!",
  "🏷️ Smart shoppers compare prices before spending their coins.",
  "🚀 Setting a savings goal makes earning money feel like a quest!",
  "⚡ Patience pays off—waiting for sales gets you more for less!",
  "🤖 Every computer bug squished earns real digital progress!",
  "🌟 Earning money feels awesome when you put in the hard work!"
];

let currentTipIndex = 0;
let tipTimer = 0;

function rotateTip() {
  currentTipIndex = (currentTipIndex + 1) % tips.length;
  const tipEl = document.getElementById('tip-text');
  if (tipEl) tipEl.textContent = tips[currentTipIndex];
}

function updateAllowanceUI() {
  const allowEl = document.getElementById('allowance-amount');
  if (allowEl) allowEl.textContent = `$${allowance.toFixed(2)}`;
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

// Audio Engine
let audioCtx = null;

function playTapSound(isCrit) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = isCrit ? 'sawtooth' : 'triangle';
    const baseFreq = isCrit ? 700 : 220 + Math.min(comboPitch * 15, 400);

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

// Spawn Microchip Bugs
function spawnBug() {
  if (bugs.length >= 5) return;
  const size = 32;
  const margin = 80;
  bugs.push({
    x: margin + Math.random() * (width - margin * 2),
    y: margin + Math.random() * (height - margin * 2),
    size: size,
    angle: Math.random() * Math.PI * 2,
    speed: 0.8 + Math.random() * 1.2
  });
}

// Spawn initial bugs
for (let i = 0; i < 4; i++) spawnBug();

function handleTap(x, y) {
  let bugHit = false;

  // Safe iteration for squishing microchip bugs
  for (let i = bugs.length - 1; i >= 0; i--) {
    const b = bugs[i];
    const dist = Math.hypot(x - b.x, y - b.y);
    if (dist < b.size * 1.5) {
      bugs.splice(i, 1);
      bugHit = true;
      spawnBug();
      break;
    }
  }

  const isCrit = Math.random() < 0.05;
  const inc = isCrit ? 0.25 : 0.05;

  allowance += inc;
  localStorage.setItem('debit_allowance', allowance);
  updateAllowanceUI();

  shakeTimer = isCrit ? 12 : 3;
  comboPitch++;
  playTapSound(isCrit);

  mouthState = isCrit ? 'crit' : 'hurt';
  hurtTimer = isCrit ? 20 : 10;

  // Make robot eyes track tap location
  const centerX = width / 2;
  const centerY = height / 2;
  targetEyeX = Math.max(-10, Math.min(10, (x - centerX) / 15));
  targetEyeY = Math.max(-10, Math.min(10, (y - centerY) / 15));

  // Sparks & Particle Explosions
  const count = isCrit ? 30 : 12;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * (isCrit ? 16 : 8),
      vy: (Math.random() - 0.5) * (isCrit ? 16 : 8),
      size: Math.random() * (isCrit ? 7 : 4) + 2,
      life: 1.0,
      color: isCrit ? '#fbbf24' : '#4ade80'
    });
  }

  // Floating Allowance Text
  floaters.push({
    text: isCrit ? '+$0.25 BONUS!' : '+$0.05',
    color: isCrit ? '#fbbf24' : '#4ade80',
    x: x, y: y, vy: -2, alpha: 1.0
  });

  if (Math.random() < 0.2) rotateTip();
}

window.addEventListener('pointerdown', (e) => handleTap(e.clientX, e.clientY));

// Draw Microchip Bug
function renderBug(b) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle);

  // Ridged Microchip Pins / Legs
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(-b.size / 2, i * 8);
    ctx.lineTo(-b.size / 2 - 8, i * 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(b.size / 2, i * 8);
    ctx.lineTo(b.size / 2 + 8, i * 8);
    ctx.stroke();
  }

  // Main Microchip Body
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  drawRoundedRect(-b.size / 2, -b.size / 2, b.size, b.size, 6);

  // Gold Core Notch
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderRobotFace(centerX, centerY, size) {
  eyeOffsetX += (targetEyeX - eyeOffsetX) * 0.15;
  eyeOffsetY += (targetEyeY - eyeOffsetY) * 0.15;

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

  // Robot Outer Frame
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = mouthState === 'crit' ? '#fbbf24' : '#38bdf8';
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
  ctx.fillStyle = mouthState === 'crit' ? '#fbbf24' : '#38bdf8';
  const pupilRadius = mouthState === 'hurt' ? eyeRadius * 0.4 : eyeRadius * 0.55;

  ctx.beginPath();
  ctx.arc(leftEyeX + eyeOffsetX, eyeY + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
  ctx.arc(rightEyeX + eyeOffsetX, eyeY + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
  ctx.fill();

  // Eye catchlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(leftEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.arc(rightEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  const mouthY = centerY + size * 0.2;
  ctx.strokeStyle = mouthState === 'crit' ? '#fbbf24' : '#38bdf8';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#38bdf8';

  if (mouthState === 'neutral') {
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

  // Render Robot
  renderRobotFace(width / 2, height / 2 - 20, 190);

  // Move & Render Microchip Bugs
  bugs.forEach((b) => {
    b.x += Math.cos(b.angle) * b.speed;
    b.y += Math.sin(b.angle) * b.speed;

    // Bounce off screen edges
    if (b.x < 40 || b.x > width - 40) b.angle = Math.PI - b.angle;
    if (b.y < 40 || b.y > height - 40) b.angle = -b.angle;

    renderBug(b);
  });

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

  // Periodic advice rotation
  tipTimer++;
  if (tipTimer > 360) {
    rotateTip();
    tipTimer = 0;
  }

  ctx.restore();
  requestAnimationFrame(render);
}

// Ensure DOM elements are ready before initial UI update
window.addEventListener('DOMContentLoaded', () => {
  updateAllowanceUI();
});

render();
