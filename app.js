const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Load persisted state or defaults
let debtTotal = parseFloat(localStorage.getItem('debit_total')) || 1200.00;
let dailyShredded = parseFloat(localStorage.getItem('debit_daily')) || 0.00;
let dailyGoal = 10.00;

let comboPitch = 0;
let particles = [];
let floaters = [];
let shakeTimer = 0;

// Robot Face State
let eyeOffsetX = 0;
let eyeOffsetY = 0;
let targetEyeX = 0;
let targetEyeY = 0;
let mouthState = 'neutral'; // 'neutral', 'hurt', 'crit'
let hurtTimer = 0;
let nextEyeLookTimer = 0;

document.getElementById('debt-amount').textContent = `$${debtTotal.toFixed(2)}`;
updateProgressBar();

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// Sound Generator
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTapSound(isCrit) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = isCrit ? 'sawtooth' : 'triangle';
  const baseFreq = isCrit ? 650 : 160 + Math.min(comboPitch * 15, 380);
  
  osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + (isCrit ? 0.25 : 0.08));

  gain.gain.setValueAtTime(isCrit ? 0.5 : 0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (isCrit ? 0.25 : 0.08));

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + (isCrit ? 0.25 : 0.08));
}

function updateProgressBar() {
  const progressPercent = Math.min(100, (dailyShredded / dailyGoal) * 100);
  document.getElementById('progress-bar').style.width = `${progressPercent}%`;
  document.getElementById('progress-text').textContent = `Daily Shred: $${dailyShredded.toFixed(2)} / $${dailyGoal.toFixed(2)}`;
}

function handleTap(x, y) {
  // 5% chance of CRIT hit ($5.00 vs $0.25)
  const isCrit = Math.random() < 0.05;
  const amount = isCrit ? 5.00 : 0.25;

  debtTotal = Math.max(0, debtTotal - amount);
  dailyShredded += amount;

  // Save progress
  localStorage.setItem('debit_total', debtTotal);
  localStorage.setItem('debit_daily', dailyShredded);

  document.getElementById('debt-amount').textContent = `$${debtTotal.toFixed(2)}`;
  updateProgressBar();

  shakeTimer = isCrit ? 16 : 4;
  comboPitch++;
  playTapSound(isCrit);

  // Set Robot Expression on Tap
  mouthState = isCrit ? 'crit' : 'hurt';
  hurtTimer = isCrit ? 25 : 12;

  // Make eyes track tap point
  const centerX = width / 2;
  const centerY = height / 2;
  targetEyeX = Math.max(-10, Math.min(10, (x - centerX) / 15));
  targetEyeY = Math.max(-10, Math.min(10, (y - centerY) / 15));

  // Particles
  const count = isCrit ? 35 : 10;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * (isCrit ? 18 : 8),
      vy: (Math.random() - 0.5) * (isCrit ? 18 : 8),
      size: Math.random() * (isCrit ? 8 : 4) + 2,
      life: 1.0,
      color: isCrit ? '#fbbf24' : '#38bdf8'
    });
  }

  // Floating text
  floaters.push({
    text: isCrit ? '-$5.00 CRIT!' : '-$0.25',
    color: isCrit ? '#fbbf24' : '#4ade80',
    x: x, y: y, vy: -2, alpha: 1.0
  });

  if (dailyShredded >= dailyGoal && (dailyShredded - amount) < dailyGoal) {
    document.getElementById('modal').classList.remove('hidden');
    if (typeof gtag !== 'undefined') {
      gtag('event', 'daily_goal_cleared', { amount: dailyGoal });
    }
  }
}

window.addEventListener('pointerdown', (e) => handleTap(e.clientX, e.clientY));

function renderRobotFace(centerX, centerY, size) {
  // Smooth Eye Movement (Ease towards target position)
  eyeOffsetX += (targetEyeX - eyeOffsetX) * 0.15;
  eyeOffsetY += (targetEyeY - eyeOffsetY) * 0.15;

  // Idle Looking Around Routine
  if (hurtTimer <= 0) {
    nextEyeLookTimer--;
    if (nextEyeLookTimer <= 0) {
      targetEyeX = (Math.random() - 0.5) * 16;
      targetEyeY = (Math.random() - 0.5) * 12;
      nextEyeLookTimer = Math.floor(Math.random() * 90) + 40; // Look around every 1-3 seconds
    }
  } else {
    hurtTimer--;
    if (hurtTimer <= 0) mouthState = 'neutral';
  }

  // --- Draw Robot Body / Screen Frame ---
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = mouthState === 'crit' ? '#fbbf24' : '#38bdf8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(centerX - size/2, centerY - size/2, size, size, 24);
  ctx.fill();
  ctx.stroke();

  // --- Robot Eyes ---
  const eyeRadius = size * 0.12;
  const leftEyeX = centerX - size * 0.22;
  const rightEyeX = centerX + size * 0.22;
  const eyeY = centerY - size * 0.12;

  // Outer Eye Glowing Screens
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(leftEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.arc(rightEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Cyan Neon Pupils (Move around inside eyes)
  ctx.fillStyle = mouthState === 'crit' ? '#fbbf24' : '#38bdf8';
  const pupilRadius = mouthState === 'hurt' ? eyeRadius * 0.4 : eyeRadius * 0.55;

  ctx.beginPath();
  ctx.arc(leftEyeX + eyeOffsetX, eyeY + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
  ctx.arc(rightEyeX + eyeOffsetX, eyeY + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
  ctx.fill();

  // Pupil Reflection Sparks (Gives life to the eyes)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(leftEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.arc(rightEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // --- Robot Mouth Expressions ---
  const mouthY = centerY + size * 0.2;
  ctx.strokeStyle = mouthState === 'crit' ? '#fbbf24' : '#38bdf8';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#38bdf8';

  if (mouthState === 'neutral') {
    // Slight happy curve
    ctx.beginPath();
    ctx.arc(centerX, mouthY - 5, 18, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else if (mouthState === 'hurt') {
    // Surprised / O-shape mouth
    ctx.beginPath();
    ctx.ellipse(centerX, mouthY, 8, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (mouthState === 'crit') {
    // Open shocked wide mouth (Crit Hit!)
    ctx.beginPath();
    ctx.ellipse(centerX, mouthY, 16, 14, 0, 0, Math.PI * 2);
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

  // Draw Robot Mascot
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

function redirectBank(appName, url) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'payment_redirect', { app: appName });
  }
  window.location.href = url;
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

render();
