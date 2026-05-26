// Waystone Shrine definitions — one per biome zone
export const WAYSTONES = [
  { id: 'waystone_keep',     zone: 'keep',     name: 'Ashenveil Keep',    x: 7,  y: 5  },
  { id: 'waystone_forest',   zone: 'forest',   name: 'Whisperwood',       x: 12, y: 8  },
  { id: 'waystone_cave',     zone: 'cave',     name: 'The Hollow Deep',   x: 5,  y: 14 },
  { id: 'waystone_mountain', zone: 'mountain', name: 'Peak of Ashenveil', x: 9,  y: 3  },
  { id: 'waystone_ruins',    zone: 'ruins',    name: 'The Broken Court',  x: 4,  y: 6  },
  { id: 'waystone_sanctum',  zone: 'sanctum',  name: 'The Ember Sanctum', x: 10, y: 10 },
  { id: 'waystone_desert',   zone: 'desert',   name: 'The Ashen Flats',   x: 15, y: 10 },
  { id: 'waystone_jungle',   zone: 'jungle',   name: 'Verdant Depths',    x: 6,  y: 11 },
  { id: 'waystone_swamp',    zone: 'swamp',    name: 'The Mirelands',     x: 10, y: 13 },
];

// Fast travel unlock methods
export const FAST_TRAVEL_UNLOCK = {
  WANDERER_ZONES_REQUIRED: 7,   // All 7 zones explored
  SEEKER_LEVEL_REQUIRED: 10,    // Min level to access Cartographer
  VETERAN_LEVEL_REQUIRED: 20,   // Auto-unlock at level 20
};
