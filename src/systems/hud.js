// src/systems/hud.js

export function drawHUD(ctx, state) {
  const { player } = state;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  ctx.save();

  // === TOP LEFT: HP / MP / XP bars ===
  const bars = [
    { label: 'HP', current: player.hp,    max: player.maxHp,    color: '#E24B4A' },
    { label: 'MP', current: player.mp,    max: player.maxMp,    color: '#378ADD' },
    { label: 'XP', current: player.xp,    max: player.xpToNext, color: '#639922' },
  ];

  bars.forEach((bar, i) => {
    const x = 8;
    const y = 10 + i * 14;
    const bw = 80;
    const bh = 8;

    // label
    ctx.font = '8px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText(bar.label, x, y + 7);

    // bg
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x + 18, y, bw, bh);

    // fill
    const pct = Math.max(0, Math.min(1, bar.current / bar.max));
    ctx.fillStyle = bar.color;
    ctx.fillRect(x + 18, y, Math.floor(bw * pct), bh);

    // border
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 18, y, bw, bh);

    // value text
    ctx.fillStyle = '#aaa';
    ctx.font = '8px monospace';
    ctx.fillText(`${bar.current}/${bar.max}`, x + 102, y + 7);
  });

  // === TOP RIGHT: Level + Gold ===
  ctx.font = '9px monospace';
  ctx.fillStyle = '#ccc';
  ctx.textAlign = 'right';
  ctx.fillText(`LVL ${player.level}`, W - 8, 18);
  ctx.fillStyle = '#FAC775';
  ctx.fillText(`${player.gold}g`, W - 8, 32);
  ctx.textAlign = 'left';

  // === BOTTOM RIGHT: Zone name ===
  ctx.font = '9px monospace';
  ctx.fillStyle = '#9FE1CB';
  ctx.textAlign = 'right';
  ctx.fillText(state.currentZone || 'UNKNOWN', W - 8, H - 8);
  ctx.textAlign = 'left';

  // === BOTTOM LEFT: Hotbar ===
  const hotbar = player.hotbar || [];
  hotbar.forEach((slot, i) => {
    const sx = 8 + i * 26;
    const sy = H - 30;
    const isActive = i === player.activeSlot;

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(sx, sy, 22, 22);

    if (isActive) {
      ctx.strokeStyle = '#AFA9EC';
      ctx.lineWidth = 1.5;
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
    }
    ctx.strokeRect(sx, sy, 22, 22);

    // slot key hint
    ctx.font = '6px monospace';
    ctx.fillStyle = '#555';
    ctx.fillText(`${i + 1}`, sx + 15, sy + 20);
  });

  ctx.restore();
}

// === LEVEL UP BANNER ===
let levelUpTimer = 0;
export function triggerLevelUpBanner() {
  levelUpTimer = 180; // 3 seconds at 60fps
}

export function drawLevelUpBanner(ctx, state) {
  if (levelUpTimer <= 0) return;
  levelUpTimer--;

  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  ctx.save();
  ctx.globalAlpha = Math.min(1, levelUpTimer / 30); // fade out in last 0.5s
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#C0DD97';
  ctx.textAlign = 'center';

  // blink every 20 frames
  if (Math.floor(levelUpTimer / 10) % 2 === 0) {
    ctx.fillText(`✦ LEVEL UP — LVL ${state.player.level} ✦`, W / 2, H / 2 - 20);
  }
  ctx.textAlign = 'left';
  ctx.restore();
}
