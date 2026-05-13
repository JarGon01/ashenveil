import './style.css'
import { CANVAS_HEIGHT, CANVAS_WIDTH, DIRECTIONS, PLAYER_SPEED, SOLID_TILES, TILE_SIZE } from './core/constants.js'
import { createInput } from './core/input.js'
import { loadGame, saveGame } from './core/save.js'
import { startingZone } from './data/zones.js'
import { playerAttack, spawnEnemies, updateEnemies } from './systems/combat.js'
import { createInteractionController, isOccupiedBySolidEntity } from './systems/interactions.js'
import { createInventory } from './systems/inventory.js'
import { createRenderer, drawDialogueBox } from './systems/renderer.js'

const canvas = document.querySelector('#game-canvas')
const zoneName = document.querySelector('#zone-name')

canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT
zoneName.textContent = startingZone.name

const input = createInput()
const renderer = createRenderer(canvas)
const savedGame = loadGame()

const player = {
  x: savedGame?.player?.x ?? startingZone.start.x * TILE_SIZE,
  y: savedGame?.player?.y ?? startingZone.start.y * TILE_SIZE,
  width: 12,
  height: 14,
  facing: startingZone.start.facing ?? DIRECTIONS.DOWN,
  zone: savedGame?.player?.zone ?? startingZone.id,
  hp: savedGame?.player?.hp ?? 20,
  mp: savedGame?.player?.mp ?? 5,
  xp: savedGame?.player?.xp ?? 0,
  level: savedGame?.player?.level ?? 1,
  gold: savedGame?.player?.gold ?? 0,
  maxHp: savedGame?.player?.maxHp ?? 20,
  atk: savedGame?.player?.atk ?? 3,
}

const camera = {
  x: 0,
  y: 0,
}

const inventory = createInventory(savedGame?.inventory ?? [])
const interactions = createInteractionController(startingZone, player, inventory, savedGame?.claimedRewards ?? [])
const enemies = spawnEnemies(startingZone)

let previousTime = performance.now()

updateCamera()
setInterval(persistGame, 30000)
requestAnimationFrame(tick)

function tick(currentTime) {
  const deltaSeconds = Math.min((currentTime - previousTime) / 1000, 0.05)
  previousTime = currentTime

  update(deltaSeconds, currentTime)
  renderer.render({ zone: startingZone, player, camera, inventory, enemies })

  if (interactions.active) {
    drawDialogueBox(canvas, interactions.active.speaker, interactions.active.line)
  }

  requestAnimationFrame(tick)
}

function update(deltaSeconds, currentTime) {
  if (input.consumeActionPress()) {
    handleAction()
  }

  if (input.consumeAttackPress()) {
    handleAttack()
  }

  if (interactions.active) {
    return
  }

  updateCombat(currentTime)

  const movement = input.getMovementVector()
  updateFacing(movement)

  const nextX = player.x + movement.x * PLAYER_SPEED * deltaSeconds
  const nextY = player.y + movement.y * PLAYER_SPEED * deltaSeconds

  if (!wouldCollide(nextX, player.y)) {
    player.x = nextX
  }

  if (!wouldCollide(player.x, nextY)) {
    player.y = nextY
  }

  updateCamera()
}

function wouldCollide(x, y) {
  const hitbox = {
    left: x + 3,
    right: x + player.width - 3,
    top: y + 7,
    bottom: y + player.height - 1,
  }

  const samplePoints = [
    { x: hitbox.left, y: hitbox.top },
    { x: hitbox.right, y: hitbox.top },
    { x: hitbox.left, y: hitbox.bottom },
    { x: hitbox.right, y: hitbox.bottom },
  ]

  if (samplePoints.some((point) => isSolidAtPoint(point.x, point.y))) {
    return true
  }

  const destinationTile = {
    x: Math.floor((x + player.width / 2) / TILE_SIZE),
    y: Math.floor((y + player.height - 2) / TILE_SIZE),
  }

  return isOccupiedBySolidEntity(startingZone, destinationTile)
}

function isSolidAtPoint(x, y) {
  const tileX = Math.floor(x / TILE_SIZE)
  const tileY = Math.floor(y / TILE_SIZE)
  const tile = startingZone.tiles[tileY]?.[tileX]

  return tile === undefined || SOLID_TILES.has(tile)
}

function updateFacing(movement) {
  if (Math.abs(movement.x) > Math.abs(movement.y)) {
    player.facing = movement.x > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT
  } else if (movement.y !== 0) {
    player.facing = movement.y > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP
  }
}

function handleAction() {
  interactions.beginOrAdvance()
  persistGame()
}

function handleAttack() {
  const combatPlayer = getCombatPlayer()
  const didHit = playerAttack(combatPlayer, enemies)
  syncPlayerFromCombat(combatPlayer)

  if (didHit) {
    persistGame()
  }
}

function updateCombat(now) {
  const combatPlayer = getCombatPlayer()
  updateEnemies(enemies, combatPlayer, now)
  syncPlayerFromCombat(combatPlayer)
}

function getCombatPlayer() {
  return {
    ...player,
    x: (player.x + player.width / 2) / TILE_SIZE,
    y: (player.y + player.height - 2) / TILE_SIZE,
  }
}

function syncPlayerFromCombat(combatPlayer) {
  player.hp = combatPlayer.hp
  player.xp = combatPlayer.xp
  player.gold = combatPlayer.gold
  player.level = combatPlayer.level
  player.maxHp = combatPlayer.maxHp
  player.atk = combatPlayer.atk
}

function persistGame() {
  saveGame(player, inventory, interactions.claimedRewards)
}

function updateCamera() {
  const mapWidth = startingZone.width * TILE_SIZE
  const mapHeight = startingZone.height * TILE_SIZE

  camera.x = clamp(player.x + player.width / 2 - CANVAS_WIDTH / 2, 0, mapWidth - CANVAS_WIDTH)
  camera.y = clamp(player.y + player.height / 2 - CANVAS_HEIGHT / 2, 0, mapHeight - CANVAS_HEIGHT)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}
