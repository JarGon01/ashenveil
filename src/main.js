import './style.css'
import { CANVAS_HEIGHT, CANVAS_WIDTH, DIRECTIONS, PLAYER_SPEED, SOLID_TILES, TILE_SIZE } from './core/constants.js'
import { createInput } from './core/input.js'
import { loadGame, saveGame } from './core/save.js'
import { WAYSTONES } from './data/waystones.js'
import { startingZone, zones } from './data/zones.js'
import { playerAttack, spawnEnemies, updateEnemies } from './systems/combat.js'
import { FastTravelSystem } from './systems/fastTravel.js'
import { updateFX, drawFX } from './systems/fx.js'
import { drawHUD, drawLevelUpBanner, triggerLevelUpBanner } from './systems/hud.js'
import { createInteractionController, isOccupiedBySolidEntity } from './systems/interactions.js'
import { createInventory } from './systems/inventory.js'
import { drawNotifications, showNotification, updateNotifications } from './systems/notifications.js'
import { createRenderer, drawDialogueBox } from './systems/renderer.js'
import { WaystoneUI } from './systems/waystoneUI.js'

const canvas = document.querySelector('#game-canvas')
const zoneName = document.querySelector('#zone-name')

canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT
zoneName.textContent = startingZone.name

const input = createInput()
const renderer = createRenderer(canvas)
const ctx = renderer.context
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
  maxMp: savedGame?.player?.maxMp ?? 5,
  atk: savedGame?.player?.atk ?? 3,
  xpToNext: (savedGame?.player?.level ?? 1) * 20,
  hotbar: [null, null, null, null],
  activeSlot: 0,
}

const camera = {
  x: 0,
  y: 0,
}

const inventory = createInventory(savedGame?.inventory ?? [])
const fastTravelSystem = new FastTravelSystem(savedGame?.fastTravel || {})
const waystoneUI = new WaystoneUI(canvas, fastTravelSystem)
const savedZoneId = savedGame?.player?.zone
let currentZone = zones[savedZoneId] ?? startingZone
let currentZoneId = currentZone.id
let interactions = createInteractionController(currentZone, player, inventory, savedGame?.claimedRewards ?? [])
let enemies = spawnEnemies(currentZone)

let previousTime = performance.now()

fastTravelSystem.exploreZone(currentZoneId)
player.zone = currentZoneId
zoneName.textContent = currentZone.name
updateCamera()
setInterval(persistGame, 30000)
requestAnimationFrame(tick)

function tick(currentTime) {
  const deltaSeconds = Math.min((currentTime - previousTime) / 1000, 0.05)
  previousTime = currentTime

  update(deltaSeconds, currentTime)

  const gameState = {
    player,
    inventory,
    enemies,
    zone: currentZone,
    currentZone: currentZoneId === currentZone.id ? currentZone.name : currentZoneId,
  }

  // 1. Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 2. Draw world tiles
  renderer.drawWorld(ctx, camera, currentZone)

  // 3. Draw entities (NPCs, enemies, player)
  renderer.drawEntities(ctx, camera, gameState)

  // 4. Draw FX (floats, particles) — above entities, below HUD
  drawFX(ctx, camera)

  if (interactions.active) {
    drawDialogueBox(canvas, interactions.active.speaker, interactions.active.line)
  }

  waystoneUI.render()

  // 5. Draw HUD — always on top
  drawHUD(ctx, gameState)
  drawLevelUpBanner(ctx, gameState)
  drawNotifications(ctx)
  input.endFrame()
  requestAnimationFrame(tick)
}

function update(deltaSeconds, currentTime) {
  handleWaystoneInput()

  if (waystoneUI.visible) {
    updateFX()
    updateNotifications(deltaSeconds)
    return
  }

  if (input.consumeActionPress()) {
    handleAction()
  }

  if (input.consumeAttackPress()) {
    handleAttack()
  }

  updateFX()
  updateNotifications(deltaSeconds)

  if (interactions.active) {
    return
  }

  checkWaystoneContact()
  checkZoneTransitions()
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

  return isOccupiedBySolidEntity(currentZone, destinationTile, player)
}

function isSolidAtPoint(x, y) {
  const tileX = Math.floor(x / TILE_SIZE)
  const tileY = Math.floor(y / TILE_SIZE)
  const tile = currentZone.tiles[tileY]?.[tileX]

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
  const leveledUp = combatPlayer._leveledUp
  syncPlayerFromCombat(combatPlayer)

  if (leveledUp) {
    triggerLevelUpBanner()
    checkFastTravelUnlock()
  }

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
  player.xpToNext = player.level * 20
}

function persistGame() {
  saveGame(player, inventory, interactions.claimedRewards, fastTravelSystem)
}

function handleWaystoneInput() {
  if (input.isJustPressed('select') || input.isJustPressed('KeyM')) {
    if (waystoneUI.visible) {
      waystoneUI.close()
    } else {
      waystoneUI.open()
    }
  }

  if (!waystoneUI.visible) {
    return
  }

  if (input.isJustPressed('up')) {
    waystoneUI.navigate('up')
  }

  if (input.isJustPressed('down')) {
    waystoneUI.navigate('down')
  }

  if (input.isJustPressed('confirm')) {
    const result = waystoneUI.confirm()
    if (result?.success) {
      changeZone(result.zone, result.x, result.y)
    }
  }

  if (input.isJustPressed('cancel')) {
    waystoneUI.close()
  }
}

function checkWaystoneContact() {
  const playerTile = {
    x: Math.floor((player.x + player.width / 2) / TILE_SIZE),
    y: Math.floor((player.y + player.height - 2) / TILE_SIZE),
  }

  for (const waystone of WAYSTONES.filter((candidate) => candidate.zone === currentZoneId)) {
    if (playerTile.x === waystone.x && playerTile.y === waystone.y) {
      const result = fastTravelSystem.discoverWaystone(waystone.id, player)
      if (result.discovered) {
        showNotification(`Waystone discovered: ${waystone.name}`, 'discovery')
        checkFastTravelUnlock()
        persistGame()
      }
    }
  }
}

function changeZone(newZoneId, x, y) {
  const nextZone = zones[newZoneId]

  if (!nextZone) {
    showNotification(`Zone not available yet: ${newZoneId}`, 'warning')
    return
  }

  currentZoneId = newZoneId
  currentZone = nextZone
  player.zone = newZoneId
  player.x = x * TILE_SIZE
  player.y = y * TILE_SIZE
  interactions = createInteractionController(currentZone, player, inventory, interactions.claimedRewards)
  enemies = spawnEnemies(currentZone)
  zoneName.textContent = currentZone.name
  fastTravelSystem.exploreZone(newZoneId)
  checkFastTravelUnlock()
  showNotification(`Entering: ${currentZone.name}`, 'info')
  updateCamera()
  persistGame()
}

function checkZoneTransitions() {
  const playerTile = {
    x: Math.floor((player.x + player.width / 2) / TILE_SIZE),
    y: Math.floor((player.y + player.height - 2) / TILE_SIZE),
  }

  const transition = currentZone.transitions?.find((candidate) => (
    playerTile.x >= candidate.x &&
    playerTile.x < candidate.x + candidate.width &&
    playerTile.y >= candidate.y &&
    playerTile.y < candidate.y + candidate.height
  ))

  if (transition) {
    changeZone(transition.targetZone, transition.targetX, transition.targetY)
  }
}

function checkFastTravelUnlock() {
  const wasUnlocked = fastTravelSystem.fastTravelUnlocked
  fastTravelSystem.checkUnlockConditions(player)

  if (!wasUnlocked && fastTravelSystem.fastTravelUnlocked) {
    showNotification('Fast Travel unlocked!', 'discovery')
  }
}

function updateCamera() {
  const mapWidth = currentZone.width * TILE_SIZE
  const mapHeight = currentZone.height * TILE_SIZE

  camera.x = clamp(player.x + player.width / 2 - CANVAS_WIDTH / 2, 0, mapWidth - CANVAS_WIDTH)
  camera.y = clamp(player.y + player.height / 2 - CANVAS_HEIGHT / 2, 0, mapHeight - CANVAS_HEIGHT)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}
