import { TILE_TYPES } from '../core/constants.js'

const G = TILE_TYPES.GRASS
const R = TILE_TYPES.ROAD
const S = TILE_TYPES.STONE
const W = TILE_TYPES.WATER

export const zones = {
  cinderRoad: {
    id: 'cinderRoad',
    name: 'The Cinder Road',
    width: 30,
    height: 20,
    start: { x: 7, y: 9, facing: 'right' },
    npcs: [
      {
        id: 'ember-watch',
        type: 'npc',
        name: 'Mara',
        x: 8,
        y: 9,
        facing: 'left',
        dialogue: [
          'Keep your lantern low. The ash hears careless footsteps.',
          'North of the road, the old stones still remember a gate.',
        ],
      },
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
      { id: 'wraith-ruins-1', type: 'ashenWraith', x: 23, y: 14 },
    ],
    tiles: [
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
    ],
  },
}

export const startingZone = zones.cinderRoad
