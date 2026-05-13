// src/core/save.js
const SAVE_KEY = 'ashenveil_save';

export function saveGame(player, inventory, claimedRewards) {
  const state = {
    player: {
      x: player.x,
      y: player.y,
      zone: player.zone ?? 'start',
      hp: player.hp,
      mp: player.mp,
      xp: player.xp,
      level: player.level,
      gold: player.gold,
    },
    inventory: inventory.getAll(),
    claimedRewards: Array.from(claimedRewards),
    savedAt: Date.now()
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  return true;
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}
