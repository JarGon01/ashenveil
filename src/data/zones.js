import { TILE_TYPES } from '../core/constants.js'
import { CARTOGRAPHER_NPC } from './npcs.js'
import { WAYSTONES } from './waystones.js'

const G = TILE_TYPES.GRASS
const R = TILE_TYPES.ROAD
const S = TILE_TYPES.STONE
const W = TILE_TYPES.WATER

function makeTiles(width, height, baseTile, decorate) {
  const tiles = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        return S
      }

      return baseTile
    }),
  )

  decorate?.(tiles)
  return tiles
}

function fillRect(tiles, tile, x, y, width, height) {
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      if (tiles[row]?.[column] !== undefined) {
        tiles[row][column] = tile
      }
    }
  }
}

function hRoad(tiles, y, fromX = 1, toX = tiles[0].length - 2) {
  for (let x = fromX; x <= toX; x += 1) {
    tiles[y][x] = R
  }
}

function vRoad(tiles, x, fromY = 1, toY = tiles.length - 2) {
  for (let y = fromY; y <= toY; y += 1) {
    tiles[y][x] = R
  }
}

function waystoneObject(zoneId, fallback = { x: 2, y: 2 }) {
  const waystone = WAYSTONES.find((entry) => entry.zone === zoneId) ?? fallback

  return {
    id: waystone.id,
    type: 'waystone',
    name: waystone.name,
    x: waystone.x,
    y: waystone.y,
    solid: false,
    inspectText: `${waystone.name} hums beneath your palm. The stone remembers you.`,
  }
}

function makeNpc(id, name, x, y, dialogue, facing = 'down') {
  return {
    id,
    type: 'npc',
    name,
    x,
    y,
    facing,
    dialogue,
  }
}

const cinderRoadTiles = [
  [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S],
  [S, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, S],
  [S, G, G, G, G, G, G, G, G, G, G, W, W, W, W, W, G, G, G, G, G, G, G, G, G, G, G, G, G, S],
  [S, G, G, G, G, G, G, G, G, G, G, W, W, W, W, W, G, G, G, S, S, S, S, G, G, G, G, G, G, S],
  [S, G, G, S, S, S, G, G, G, G, G, W, W, W, W, W, G, G, G, S, G, G, S, G, G, G, G, G, G, S],
  [S, G, G, S, G, S, G, G, G, G, G, G, G, G, W, W, G, G, G, S, G, G, S, G, G, G, G, G, G, S],
  [S, G, G, S, G, S, G, G, G, R, R, R, R, G, G, G, G, G, G, S, G, G, S, G, G, G, G, G, G, S],
  [S, G, G, G, G, G, G, G, R, R, R, R, R, R, R, G, G, G, G, S, G, G, S, G, G, G, G, G, G, S],
  [S, G, G, G, G, G, G, R, R, R, G, G, G, R, R, R, G, G, G, S, G, G, S, G, G, G, G, G, G, S],
  [S, G, G, G, G, G, R, R, R, G, G, G, G, G, R, R, R, R, R, R, R, R, R, R, R, R, G, G, G, S],
  [S, G, G, G, G, G, G, R, R, R, G, G, G, G, G, G, G, G, G, S, G, G, S, G, G, R, R, G, G, S],
  [S, G, G, G, G, G, G, G, R, R, R, G, G, G, G, G, G, G, G, S, G, G, S, G, G, G, R, R, G, S],
  [S, G, G, S, S, S, G, G, G, R, R, R, R, G, G, G, G, G, G, S, S, S, S, G, G, G, G, R, G, S],
  [S, G, G, S, G, S, G, G, G, G, G, G, R, R, R, R, G, G, G, G, G, G, G, G, G, G, G, R, G, S],
  [S, G, G, S, G, S, G, G, G, G, G, G, G, G, G, R, R, R, R, R, G, G, G, G, G, G, G, G, G, S],
  [S, G, G, G, G, G, G, G, G, G, G, W, W, W, G, G, G, G, G, R, R, R, G, G, G, G, G, G, G, S],
  [S, G, G, G, G, G, G, G, G, G, G, W, W, W, W, W, G, G, G, G, G, R, R, R, G, G, G, G, G, S],
  [S, G, G, G, G, G, G, G, G, G, G, W, W, W, W, W, G, G, G, G, G, G, G, R, R, R, G, G, G, S],
  [S, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, S],
  [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S],
]

export const zones = {
  cinderRoad: {
    id: 'cinderRoad',
    name: 'The Cinder Road',
    width: 30,
    height: 20,
    start: { x: 7, y: 9, facing: 'right' },
    npcs: [
      makeNpc('ember-watch', 'Mara', 8, 9, [
        'Keep your lantern low. The ash hears careless footsteps.',
        'North of the road, the old stones still remember a gate.',
      ], 'left'),
      makeNpc('road-pilgrim', 'Tovin', 21, 10, [
        'The Keep lies west. Whisperwood waits east. Choose your road with care.',
      ], 'down'),
    ],
    objects: [
      {
        id: 'north-gate-marker',
        type: 'sign',
        name: 'Weathered Sign',
        x: 10,
        y: 6,
        inspectText: 'The sign points north: Old Gate. The carved arrow is nearly lost under ash.',
      },
      {
        id: 'dead-campfire',
        type: 'campfire',
        name: 'Cold Campfire',
        x: 13,
        y: 12,
        inspectText: 'The coals are cold, but someone arranged them recently.',
        reward: {
          itemId: 'ashKindling',
          quantity: 1,
          once: true,
          message: 'You collect Ash Kindling from the ring of stones.',
        },
      },
    ],
    enemies: [
      { id: 'shadeling-road-1', type: 'shadeling', x: 15, y: 9 },
      { id: 'wraith-road-1', type: 'ashenWraith', x: 23, y: 14 },
      { id: 'beast-road-1', type: 'cursedBeast', x: 26, y: 17 },
    ],
    transitions: [
      { id: 'to-keep', x: 1, y: 9, width: 1, height: 3, targetZone: 'keep', targetX: 17, targetY: 10 },
      { id: 'to-forest', x: 28, y: 9, width: 1, height: 3, targetZone: 'forest', targetX: 2, targetY: 10 },
    ],
    tiles: cinderRoadTiles,
  },

  keep: {
    id: 'keep',
    name: 'Ashenveil Keep',
    width: 20,
    height: 20,
    start: { x: 18, y: 10, facing: 'left' },
    npcs: [
      makeNpc('keep-warden', 'Warden Elric', 8, 8, ['The Keep still stands because someone remembers its oaths.']),
      makeNpc('keep-smith', 'Nessa the Smith', 12, 12, ['Bring me ember ore and I can wake old steel.']),
    ],
    objects: [waystoneObject('keep')],
    enemies: [
      { id: 'keep-shadeling-1', type: 'shadeling', x: 5, y: 5 },
      { id: 'keep-wraith-1', type: 'ashenWraith', x: 14, y: 6 },
      { id: 'keep-beast-1', type: 'cursedBeast', x: 10, y: 15 },
    ],
    transitions: [
      { id: 'to-cinderRoad', x: 18, y: 9, width: 1, height: 3, targetZone: 'cinderRoad', targetX: 2, targetY: 10 },
      { id: 'to-ruins', x: 9, y: 1, width: 3, height: 1, targetZone: 'ruins', targetX: 10, targetY: 18 },
    ],
    tiles: makeTiles(20, 20, G, (tiles) => {
      hRoad(tiles, 10)
      vRoad(tiles, 10)
      fillRect(tiles, S, 4, 4, 3, 3)
      fillRect(tiles, S, 13, 4, 3, 5)
      fillRect(tiles, R, 6, 13, 8, 2)
    }),
  },

  forest: {
    id: 'forest',
    name: 'Whisperwood',
    width: 20,
    height: 20,
    start: { x: 2, y: 10, facing: 'right' },
    npcs: [
      makeNpc('forest-herbalist', 'Ilyra', 6, 8, ['The trees speak slowly. Listen longer than fear allows.']),
      makeNpc('forest-scout', 'Bran', 14, 12, ['The mountain path climbs north. The swamp sinks south.']),
    ],
    objects: [waystoneObject('forest')],
    enemies: [
      { id: 'forest-shadeling-1', type: 'shadeling', x: 9, y: 7 },
      { id: 'forest-shadeling-2', type: 'shadeling', x: 15, y: 15 },
      { id: 'forest-beast-1', type: 'cursedBeast', x: 12, y: 10 },
    ],
    transitions: [
      { id: 'to-cinderRoad', x: 1, y: 9, width: 1, height: 3, targetZone: 'cinderRoad', targetX: 27, targetY: 10 },
      { id: 'to-mountain', x: 9, y: 1, width: 3, height: 1, targetZone: 'mountain', targetX: 10, targetY: 17 },
      { id: 'to-swamp', x: 9, y: 18, width: 3, height: 1, targetZone: 'swamp', targetX: 10, targetY: 2 },
    ],
    tiles: makeTiles(20, 20, G, (tiles) => {
      hRoad(tiles, 10)
      vRoad(tiles, 10)
      fillRect(tiles, W, 3, 14, 4, 3)
      fillRect(tiles, S, 15, 3, 2, 5)
      fillRect(tiles, G, 2, 2, 16, 16)
      hRoad(tiles, 10)
      vRoad(tiles, 10)
    }),
  },

  mountain: {
    id: 'mountain',
    name: 'Peak of Ashenveil',
    width: 20,
    height: 20,
    start: { x: 10, y: 18, facing: 'up' },
    npcs: [
      {
        ...CARTOGRAPHER_NPC,
        dialogue: CARTOGRAPHER_NPC.dialogue.map((entry) => entry.text),
      },
      makeNpc('mountain-monk', 'Sera of the Peak', 7, 7, ['Breathe thin air. Strike with a clear mind.']),
    ],
    objects: [waystoneObject('mountain')],
    enemies: [
      { id: 'mountain-wraith-1', type: 'ashenWraith', x: 6, y: 12 },
      { id: 'mountain-wraith-2', type: 'ashenWraith', x: 14, y: 8 },
      { id: 'mountain-beast-1', type: 'cursedBeast', x: 12, y: 14 },
    ],
    transitions: [
      { id: 'to-forest', x: 9, y: 18, width: 3, height: 1, targetZone: 'forest', targetX: 10, targetY: 2 },
      { id: 'to-sanctum', x: 9, y: 1, width: 3, height: 1, targetZone: 'sanctum', targetX: 10, targetY: 17 },
    ],
    tiles: makeTiles(20, 20, S, (tiles) => {
      fillRect(tiles, G, 2, 2, 16, 16)
      vRoad(tiles, 10)
      fillRect(tiles, S, 3, 4, 4, 8)
      fillRect(tiles, S, 14, 8, 3, 7)
      fillRect(tiles, W, 5, 15, 3, 2)
      hRoad(tiles, 1, 9, 11)
      hRoad(tiles, 18, 9, 11)
    }),
  },

  swamp: {
    id: 'swamp',
    name: 'The Mirelands',
    width: 20,
    height: 20,
    start: { x: 10, y: 2, facing: 'down' },
    npcs: [
      makeNpc('swamp-witch', 'Mire Mother', 6, 12, ['Do not drink the green water unless you want old dreams.']),
      makeNpc('bog-runner', 'Pell', 14, 8, ['The mud remembers every boot. Step lightly.']),
    ],
    objects: [waystoneObject('swamp')],
    enemies: [
      { id: 'swamp-shadeling-1', type: 'shadeling', x: 5, y: 15 },
      { id: 'swamp-beast-1', type: 'cursedBeast', x: 12, y: 13 },
      { id: 'swamp-wraith-1', type: 'ashenWraith', x: 15, y: 6 },
    ],
    transitions: [
      { id: 'to-forest', x: 9, y: 1, width: 3, height: 1, targetZone: 'forest', targetX: 10, targetY: 17 },
    ],
    tiles: makeTiles(20, 20, G, (tiles) => {
      fillRect(tiles, W, 2, 5, 6, 3)
      fillRect(tiles, W, 11, 10, 6, 4)
      fillRect(tiles, W, 4, 15, 5, 2)
      vRoad(tiles, 10)
      hRoad(tiles, 13, 8, 16)
    }),
  },

  ruins: {
    id: 'ruins',
    name: 'The Broken Court',
    width: 20,
    height: 20,
    start: { x: 10, y: 18, facing: 'up' },
    npcs: [
      makeNpc('ruin-scholar', 'Archivist Renn', 7, 6, ['Every fallen wall is a sentence with half the words missing.']),
      makeNpc('ruin-guard', 'Hale', 13, 13, ['Something below the court still knocks at night.']),
    ],
    objects: [waystoneObject('ruins')],
    enemies: [
      { id: 'ruins-wraith-1', type: 'ashenWraith', x: 6, y: 10 },
      { id: 'ruins-wraith-2', type: 'ashenWraith', x: 14, y: 5 },
      { id: 'ruins-shadeling-1', type: 'shadeling', x: 12, y: 15 },
    ],
    transitions: [
      { id: 'to-keep', x: 9, y: 18, width: 3, height: 1, targetZone: 'keep', targetX: 10, targetY: 2 },
    ],
    tiles: makeTiles(20, 20, G, (tiles) => {
      fillRect(tiles, S, 3, 3, 5, 2)
      fillRect(tiles, S, 12, 4, 4, 3)
      fillRect(tiles, S, 4, 13, 4, 3)
      hRoad(tiles, 10)
      vRoad(tiles, 10)
    }),
  },

  sanctum: {
    id: 'sanctum',
    name: 'The Ember Sanctum',
    width: 20,
    height: 20,
    start: { x: 10, y: 18, facing: 'up' },
    npcs: [
      makeNpc('sanctum-oracle', 'Ember Oracle', 9, 8, ['The last flame does not burn. It remembers.']),
      makeNpc('sanctum-knight', 'Veyr', 12, 12, ['Only those who carry ash without fear may pass.']),
    ],
    objects: [waystoneObject('sanctum')],
    enemies: [
      { id: 'sanctum-wraith-1', type: 'ashenWraith', x: 5, y: 8 },
      { id: 'sanctum-beast-1', type: 'cursedBeast', x: 14, y: 8 },
      { id: 'sanctum-beast-2', type: 'cursedBeast', x: 10, y: 14 },
    ],
    transitions: [
      { id: 'to-mountain', x: 9, y: 18, width: 3, height: 1, targetZone: 'mountain', targetX: 10, targetY: 2 },
    ],
    tiles: makeTiles(20, 20, S, (tiles) => {
      fillRect(tiles, G, 2, 2, 16, 16)
      fillRect(tiles, R, 6, 6, 8, 8)
      fillRect(tiles, W, 3, 14, 3, 3)
      vRoad(tiles, 10)
      hRoad(tiles, 10)
      hRoad(tiles, 18, 9, 11)
    }),
  },
}

export const startingZone = zones.cinderRoad
