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

  // --- Water Droplet Body Path ---
  const topY = centerY - size * 0.65;
  const bottomY = centerY + size * 0.55;
  const halfW = size * 0.55;

  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = mouthState === 'crit' ? '#fbbf24' : '#38bdf8';
  ctx.lineWidth = 4;

  ctx.beginPath();
  // Start at top sharp tip
  ctx.moveTo(centerX, topY);
  // Curve down along the right side to the bottom
  ctx.bezierCurveTo(centerX + halfW, centerY - size * 0.1, centerX + halfW, bottomY, centerX, bottomY);
  // Curve back up along the left side to the top tip
  ctx.bezierCurveTo(centerX - halfW, bottomY, centerX - halfW, centerY - size * 0.1, centerX, topY);
  ctx.closePath();
  
  ctx.fill();
  ctx.stroke();

  // --- Droplet Highlight Sparkle (Top Right) ---
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(centerX + size * 0.2, centerY - size * 0.25, 12, 0, Math.PI * 2);
  ctx.fill();

  // --- Eyes (Positioned inside the droplet) ---
  const eyeRadius = size * 0.11;
  const leftEyeX = centerX - size * 0.18;
  const rightEyeX = centerX + size * 0.18;
  const eyeY = centerY + size * 0.02;

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

  // Eye Catchlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(leftEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.arc(rightEyeX + eyeOffsetX - 2, eyeY + eyeOffsetY - 2, pupilRadius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // --- Mouth Expressions ---
  const mouthY = centerY + size * 0.28;
  ctx.strokeStyle = mouthState === 'crit' ? '#fbbf24' : '#38bdf8';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#38bdf8';

  if (mouthState === 'neutral') {
    ctx.beginPath();
    ctx.arc(centerX, mouthY - 5, 16, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else if (mouthState === 'hurt') {
    ctx.beginPath();
    ctx.arc(centerX, mouthY, 9, 0, Math.PI * 2);
    ctx.stroke();
  } else if (mouthState === 'crit') {
    ctx.beginPath();
    ctx.arc(centerX, mouthY, 14, 0, Math.PI * 2);
    ctx.fill();
  }
}
