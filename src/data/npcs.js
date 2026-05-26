export const CARTOGRAPHER_NPC = {
  id: 'cartographer',
  name: 'The Cartographer',
  zone: 'mountain',
  x: 11,
  y: 4,
  hidden: true,           // Only renders if player level >= 10
  levelRequired: 10,
  dialogue: [
    {
      id: 'intro',
      text: "You found me. Few do. The world is larger than you know — and more broken.",
      next: 'offer'
    },
    {
      id: 'offer',
      text: "I once mapped every Waystone in Ashenveil. Bring me a rubbing from each of the 7 shrines and I will teach you to use them.",
      next: 'quest_start'
    },
    {
      id: 'quest_start',
      text: "Find the shrines. Touch them. The stone remembers. Return when all 7 glow in your memory.",
      next: null,
      action: 'START_CARTOGRAPHER_QUEST'
    },
    {
      id: 'quest_complete',
      text: "You've touched all the stones. The Waystones will answer your call now. Go — the world is yours.",
      next: null,
      action: 'COMPLETE_CARTOGRAPHER_QUEST'
    }
  ]
}
