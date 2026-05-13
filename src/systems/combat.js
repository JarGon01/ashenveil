// src/systems/combat.js

export const ENEMY_TYPES = {
  shadeling: {
    name: 'Shadeling',
    hp: 12, maxHp: 12,
    atk: 2, def: 0,
    xp: 8, gold: 3,
    color: '#aa44ff',
    range: 5,
    speed: 0.04,
  },
  ashenWraith: {
    name: 'Ashen Wraith',
    hp: 22, maxHp: 22,
    atk: 4, def: 1,
    xp: 18, gold: 7,
    color: '#ff6644',
    range: 6,
    speed: 0.03,
  },
  cursedBeast: {
    name: 'Cursed Beast',
    hp: 35, maxHp: 35,
    atk: 6, def: 2,
    xp: 30, gold: 12,
    color: '#44ffaa',
    range: 4,
    speed: 0.05,
  }
};

export function spawnEnemies(zone) {
  return (zone.enemies ?? []).map(def => ({
    ...ENEMY_TYPES[def.type],
    id: def.id,
    x: def.x,
    y: def.y,
    state: 'wander',
    wanderTimer: 0,
    wanderDx: 0,
    wanderDy: 0,
    dead: false,
  }));
}

export function updateEnemies(enemies, player, now) {
  for (const e of enemies) {
    if (e.dead) continue;

    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < e.range) {
      e.state = 'chase';
      const len = Math.max(dist, 0.001);
      e.x += (dx / len) * e.speed;
      e.y += (dy / len) * e.speed;

      if (dist < 0.9) {
        player.hp = Math.max(0, player.hp - e.atk);
      }
    } else {
      e.state = 'wander';
      e.wanderTimer -= 1;
      if (e.wanderTimer <= 0) {
        const angle = Math.random() * Math.PI * 2;
        e.wanderDx = Math.cos(angle) * e.speed * 0.5;
        e.wanderDy = Math.sin(angle) * e.speed * 0.5;
        e.wanderTimer = 60 + Math.floor(Math.random() * 60);
      }
      e.x += e.wanderDx;
      e.y += e.wanderDy;
    }
  }
}

export function playerAttack(player, enemies) {
  const ATTACK_RANGE = 1.5;
  let hit = false;

  for (const e of enemies) {
    if (e.dead) continue;
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= ATTACK_RANGE) {
      const dmg = Math.max(1, (player.atk ?? 3) - e.def);
      e.hp -= dmg;
      hit = true;
      if (e.hp <= 0) {
        e.dead = true;
        player.xp = (player.xp ?? 0) + e.xp;
        player.gold = (player.gold ?? 0) + e.gold;
        checkLevelUp(player);
      }
    }
  }
  return hit;
}

export function checkLevelUp(player) {
  const xpThreshold = player.level * 20;
  if (player.xp >= xpThreshold) {
    player.level += 1;
    player.xp -= xpThreshold;
    player.maxHp = (player.maxHp ?? 20) + 5;
    player.hp = player.maxHp;
    player.atk = (player.atk ?? 3) + 1;
    return true;
  }
  return false;
}
