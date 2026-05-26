// src/systems/fx.js
// Visual effects pool: floating damage numbers, hit flashes, defeat bursts

const effects = [];

export function spawnDamageNumber(x, y, amount, isCrit = false) {
  effects.push({
    type: 'damageNumber',
    x, y,
    text: isCrit ? `${amount}!` : `${amount}`,
    isCrit,
    alpha: 1,
    lifetime: 0,
    maxLifetime: 60, // frames
  });
}

export function spawnHitFlash(entity) {
  entity._hitFlash = 8; // frames remaining
}

export function spawnDefeatBurst(x, y) {
  for (let i = 0; i < 6; i++) {
    effects.push({
      type: 'particle',
      x, y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      alpha: 1,
      lifetime: 0,
      maxLifetime: 30,
    });
  }
}

export function updateFX() {
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i];
    e.lifetime++;
    e.alpha = 1 - e.lifetime / e.maxLifetime;
    if (e.type === 'particle') {
      e.x += e.vx;
      e.y += e.vy;
    }
    if (e.lifetime >= e.maxLifetime) effects.splice(i, 1);
  }
}

export function drawFX(ctx, camera) {
  for (const e of effects) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, e.alpha);
    if (e.type === 'damageNumber') {
      const rise = (e.lifetime / e.maxLifetime) * 24;
      ctx.font = e.isCrit ? 'bold 13px monospace' : 'bold 10px monospace';
      ctx.fillStyle = e.isCrit ? '#F0997B' : '#FAC775';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      const sx = e.x - camera.x;
      const sy = e.y - camera.y - rise;
      ctx.strokeText(e.text, sx, sy);
      ctx.fillText(e.text, sx, sy);
    } else if (e.type === 'particle') {
      ctx.fillStyle = '#D85A30';
      ctx.fillRect(e.x - camera.x - 2, e.y - camera.y - 2, 4, 4);
    }
    ctx.restore();
  }
}
