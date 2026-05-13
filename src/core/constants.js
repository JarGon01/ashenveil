export const TILE_SIZE = 16

export const CANVAS_WIDTH = 320
export const CANVAS_HEIGHT = 240

export const VIEWPORT_TILES_X = CANVAS_WIDTH / TILE_SIZE
export const VIEWPORT_TILES_Y = CANVAS_HEIGHT / TILE_SIZE

export const PLAYER_SPEED = 86

export const DIRECTIONS = {
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
}

export const COLORS = {
  void: '#050608',
  grass: '#405c38',
  grassDark: '#2c3f2b',
  road: '#826243',
  roadDark: '#5f4934',
  stone: '#444a54',
  stoneDark: '#2d323a',
  water: '#2c5575',
  waterDark: '#1b354e',
  ember: '#d77432',
  playerSkin: '#f1c27d',
  playerCloak: '#7f2e2e',
  playerShadow: 'rgba(0, 0, 0, 0.35)',
  npcCloak: '#3f5d78',
  npcHair: '#d7b36a',
  dialogueBackground: '#120f0d',
  dialogueBorder: '#d7b36a',
  uiText: '#f8eecf',
}

export const TILE_TYPES = {
  GRASS: 0,
  ROAD: 1,
  STONE: 2,
  WATER: 3,
}

export const SOLID_TILES = new Set([TILE_TYPES.WATER, TILE_TYPES.STONE])
