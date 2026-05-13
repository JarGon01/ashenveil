import { DIRECTIONS, TILE_SIZE } from '../core/constants.js'

export function createInteractionController(zone, player, inventory, initialClaimedRewards = []) {
  let activeInteraction = null
  const claimedRewardIds = new Set(initialClaimedRewards)

  return {
    get active() {
      return activeInteraction
    },
    get claimedRewards() {
      return claimedRewardIds
    },
    beginOrAdvance() {
      if (activeInteraction) {
        activeInteraction = advanceInteraction(activeInteraction)
        return activeInteraction
      }

      const targetTile = getFacingTile(player)
      const target = findInteractionTarget(zone, targetTile)

      if (!target) {
        return null
      }

      activeInteraction = createDialogueState(target, inventory, claimedRewardIds)
      return activeInteraction
    },
  }
}

export function isOccupiedBySolidEntity(zone, tile) {
  return getSolidEntities(zone).some((entity) => entity.x === tile.x && entity.y === tile.y)
}

export function getFacingTile(player) {
  const currentTile = getPlayerTile(player)

  if (player.facing === DIRECTIONS.UP) {
    return { x: currentTile.x, y: currentTile.y - 1 }
  }

  if (player.facing === DIRECTIONS.DOWN) {
    return { x: currentTile.x, y: currentTile.y + 1 }
  }

  if (player.facing === DIRECTIONS.LEFT) {
    return { x: currentTile.x - 1, y: currentTile.y }
  }

  return { x: currentTile.x + 1, y: currentTile.y }
}

export function getPlayerTile(player) {
  return {
    x: Math.floor((player.x + player.width / 2) / TILE_SIZE),
    y: Math.floor((player.y + player.height - 2) / TILE_SIZE),
  }
}

function findInteractionTarget(zone, tile) {
  return getInteractionTargets(zone).find((target) => target.x === tile.x && target.y === tile.y)
}

function getInteractionTargets(zone) {
  return [...(zone.npcs ?? []), ...(zone.objects ?? [])]
}

function getSolidEntities(zone) {
  return getInteractionTargets(zone).filter((entity) => entity.solid !== false)
}

function createDialogueState(target, inventory, claimedRewardIds) {
  const lines = [...(target.dialogue ?? [target.inspectText])]
  const rewardLine = claimReward(target, inventory, claimedRewardIds)

  if (rewardLine) {
    lines.push(rewardLine)
  }

  return {
    target,
    speaker: target.name,
    lineIndex: 0,
    line: lines[0],
    lines,
  }
}

function claimReward(target, inventory, claimedRewardIds) {
  if (!target.reward || !inventory) {
    return null
  }

  if (target.reward.once && claimedRewardIds.has(target.id)) {
    return null
  }

  inventory.addItem(target.reward.itemId, target.reward.quantity ?? 1)
  claimedRewardIds.add(target.id)

  return target.reward.message
}

function advanceInteraction(interaction) {
  const nextLineIndex = interaction.lineIndex + 1

  if (nextLineIndex >= interaction.lines.length) {
    return null
  }

  return {
    ...interaction,
    lineIndex: nextLineIndex,
    line: interaction.lines[nextLineIndex],
  }
}
