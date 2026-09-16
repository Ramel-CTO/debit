const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Allowance State
let allowance = parseFloat(localStorage.getItem('debit_allowance')) || 0.00;

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


function resetAllowance() {
  if (confirm("Are you sure you want to reset your allowance back to $0.00?")) {
    allowance = 0.00;
    localStorage.removeItem('debit_allowance');
    updateAllowanceUI();
    
    // Trigger robot shocked expression on reset
    mouthState = 'crit';
    hurtTimer = 30;
    shakeTimer = 8;
  }
}

// Web Audio Synthesizer
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

function handleTap(x, y) {
  const isCrit = Math.random() < 0.05;
  const inc = isCrit ? 0.25 : 0.05;

  allowance += inc;
  localStorage.setItem('debit_allowance', allowance);
  updateAllowanceUI();

  shakeTimer = isCrit ? 14 : 4;
  comboPitch++;
  playTapSound(isCrit);

  // Expression updates
  mouthState = isCrit ? 'crit' : 'hurt';
  hurtTimer = isCrit ? 22 : 10;

  // Make robot eyes look directly at tap position
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

  // Floating Allowance Text
  floaters.push({
    text: isCrit ? '+$0.25 CRIT!' : '+$0.05',
    color: isCrit ? '#fbbf24' : '#4ade80',
    x: x, y: y, vy: -2, alpha: 1.0
  });
}

window.addEventListener('pointerdown', (e) => handleTap(e.clientX, e.clientY));

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

  // Outer Frame
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

  // Eye Catchlight Sparks
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(leftEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.arc(rightEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Mouth Expressions
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

  // Render Robot Head
  renderRobotFace(width / 2, height / 2, 200);

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
  updateAllowanceUI();
});

render();
