import { WAYSTONES, FAST_TRAVEL_UNLOCK } from '../data/waystones.js';

export class FastTravelSystem {
  constructor(saveData) {
    this.unlockedWaystones = saveData?.unlockedWaystones || [];
    this.fastTravelUnlocked = saveData?.fastTravelUnlocked || false;
    this.zonesExplored = saveData?.zonesExplored || [];
    this.cartographerQuestComplete = saveData?.cartographerQuestComplete || false;
  }

  // Called when player steps on a waystone shrine
  discoverWaystone(waystoneId, player) {
    if (!this.unlockedWaystones.includes(waystoneId)) {
      this.unlockedWaystones.push(waystoneId);
      this.checkUnlockConditions(player);
      return { discovered: true, waystoneId };
    }
    return { discovered: false, waystoneId };
  }

  // Called when player enters a new zone
  exploreZone(zoneId) {
    if (!this.zonesExplored.includes(zoneId)) {
      this.zonesExplored.push(zoneId);
    }
  }

  // Check all 3 unlock paths
  checkUnlockConditions(player) {
    if (this.fastTravelUnlocked) return;

    // Path 1 — The Wanderer: explored all 7 zones
    if (this.zonesExplored.length >= FAST_TRAVEL_UNLOCK.WANDERER_ZONES_REQUIRED) {
      this.unlock('wanderer');
      return;
    }

    // Path 2 — The Seeker: Cartographer quest complete
    if (this.cartographerQuestComplete) {
      this.unlock('seeker');
      return;
    }

    // Path 3 — The Veteran: reached level 20
    if (player?.level >= FAST_TRAVEL_UNLOCK.VETERAN_LEVEL_REQUIRED) {
      this.unlock('veteran');
      return;
    }
  }

  unlock(method) {
    this.fastTravelUnlocked = true;
    console.log(`[FastTravel] Unlocked via: ${method}`);
    return method;
  }

  // Travel to a discovered waystone
  travelTo(waystoneId) {
    if (!this.fastTravelUnlocked) return { success: false, reason: 'locked' };
    if (!this.unlockedWaystones.includes(waystoneId)) {
      return { success: false, reason: 'undiscovered' };
    }
    const waystone = WAYSTONES.find(w => w.id === waystoneId);
    if (!waystone) return { success: false, reason: 'invalid' };
    return { success: true, zone: waystone.zone, x: waystone.x, y: waystone.y };
  }

  // Complete the Cartographer quest
  completeCartographerQuest(player) {
    this.cartographerQuestComplete = true;
    this.checkUnlockConditions(player);
  }

  // Serialize for save system
  serialize() {
    return {
      unlockedWaystones: this.unlockedWaystones,
      fastTravelUnlocked: this.fastTravelUnlocked,
      zonesExplored: this.zonesExplored,
      cartographerQuestComplete: this.cartographerQuestComplete,
    };
  }

  isWaystoneDiscovered(id) {
    return this.unlockedWaystones.includes(id);
  }

  canAccessCartographer(player) {
    return player?.level >= FAST_TRAVEL_UNLOCK.SEEKER_LEVEL_REQUIRED;
  }
}
