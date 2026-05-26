import { COLORS, TILE_SIZE, TILE_TYPES } from '../core/constants.js'

export function createRenderer(canvas) {
  const context = canvas.getContext('2d')
  context.imageSmoothingEnabled = false

  return {
    context,
    render({ zone, player, camera, inventory, enemies }) {
      context.clearRect(0, 0, canvas.width, canvas.height)
      this.drawWorld(context, camera, zone)
      this.drawEntities(context, camera, { currentZone: zone, player, enemies })
      drawVignette(context, canvas)
      drawInventorySummary(context, canvas, inventory)
    },
    drawWorld(contextArg, cameraArg, zoneArg) {
      const { drawContext, camera, zone } = resolveWorldArgs(context, contextArg, cameraArg, zoneArg)
      drawMap(drawContext, zone, camera, canvas)
      drawObjects(drawContext, zone.objects ?? [], camera)
    },
    drawEntities(contextArg, cameraArg, stateArg) {
      const { drawContext, camera, zone, player, enemies } = resolveEntityArgs(context, contextArg, cameraArg, stateArg)
      drawNpcs(drawContext, zone.npcs, camera, player)
      drawEnemies(drawContext, enemies ?? [], camera)
      drawPlayer(drawContext, player, camera)
      drawVignette(drawContext, canvas)
    },
  }
}

function resolveWorldArgs(defaultContext, contextArg, cameraArg, zoneArg) {
  if (zoneArg) {
    return {
      drawContext: contextArg,
      camera: cameraArg,
      zone: zoneArg,
    }
  }

  return {
    drawContext: defaultContext,
    camera: contextArg.camera,
    zone: contextArg.zone,
  }
}

function resolveEntityArgs(defaultContext, contextArg, cameraArg, stateArg) {
  if (stateArg) {
    return {
      drawContext: contextArg,
      camera: cameraArg,
      zone: stateArg.zone ?? stateArg.currentZone,
      player: stateArg.player,
      enemies: stateArg.enemies,
    }
  }

  return {
    drawContext: defaultContext,
    camera: contextArg.camera,
    zone: contextArg.zone,
    player: contextArg.player,
    enemies: contextArg.enemies,
  }
}

function drawMap(context, zone, camera, canvas) {
  const firstColumn = Math.max(0, Math.floor(camera.x / TILE_SIZE))
  const firstRow = Math.max(0, Math.floor(camera.y / TILE_SIZE))
  const lastColumn = Math.min(zone.width - 1, Math.ceil((camera.x + canvas.width) / TILE_SIZE))
  const lastRow = Math.min(zone.height - 1, Math.ceil((camera.y + canvas.height) / TILE_SIZE))

  context.fillStyle = COLORS.void
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const tile = zone.tiles[row]?.[column]
      const screenX = Math.floor(column * TILE_SIZE - camera.x)
      const screenY = Math.floor(row * TILE_SIZE - camera.y)

      drawTile(context, tile, screenX, screenY, column, row)
    }
  }
}

function drawTile(context, tile, x, y, column, row) {
  const isOdd = (column + row) % 2 === 1

  if (tile === TILE_TYPES.ROAD) {
    context.fillStyle = isOdd ? COLORS.road : COLORS.roadDark
    context.fillRect(x, y, TILE_SIZE, TILE_SIZE)
    context.fillStyle = 'rgba(255, 221, 146, 0.12)'
    context.fillRect(x + 2, y + 8, 3, 2)
    return
  }

  if (tile === TILE_TYPES.STONE) {
    context.fillStyle = isOdd ? COLORS.stone : COLORS.stoneDark
    context.fillRect(x, y, TILE_SIZE, TILE_SIZE)
    context.fillStyle = 'rgba(255, 255, 255, 0.08)'
    context.fillRect(x + 2, y + 2, 6, 2)
    return
  }

  if (tile === TILE_TYPES.WATER) {
    context.fillStyle = isOdd ? COLORS.water : COLORS.waterDark
    context.fillRect(x, y, TILE_SIZE, TILE_SIZE)
    context.fillStyle = 'rgba(190, 226, 255, 0.2)'
    context.fillRect(x + 3, y + 5, 8, 1)
    context.fillRect(x + 7, y + 11, 6, 1)
    return
  }

  context.fillStyle = isOdd ? COLORS.grass : COLORS.grassDark
  context.fillRect(x, y, TILE_SIZE, TILE_SIZE)

  if ((column * 7 + row * 3) % 11 === 0) {
    context.fillStyle = 'rgba(221, 177, 85, 0.22)'
    context.fillRect(x + 10, y + 5, 2, 2)
  }
}

function drawPlayer(context, player, camera) {
  const x = Math.floor(player.x - camera.x)
  const y = Math.floor(player.y - camera.y)

  context.fillStyle = COLORS.playerShadow
  context.fillRect(x + 3, y + 13, 10, 3)

  context.fillStyle = COLORS.playerCloak
  context.fillRect(x + 4, y + 6, 8, 8)

  context.fillStyle = COLORS.playerSkin
  context.fillRect(x + 5, y + 2, 6, 5)

  context.fillStyle = '#23170f'
  context.fillRect(x + 4, y + 1, 8, 2)
  context.fillRect(x + 3, y + 3, 2, 3)

  context.fillStyle = COLORS.ember
  context.fillRect(x + 10, y + 8, 2, 2)

  drawFacingPip(context, x, y, player.facing, COLORS.ember)
}

function drawNpcs(context, npcs, camera, player) {
  for (const npc of npcs) {
    if (npc.hidden && (player?.level ?? 1) < (npc.levelRequired ?? 1)) {
      continue
    }

    const x = Math.floor(npc.x * TILE_SIZE + 2 - camera.x)
    const y = Math.floor(npc.y * TILE_SIZE + 1 - camera.y)

    context.fillStyle = COLORS.playerShadow
    context.fillRect(x + 2, y + 13, 10, 3)

    context.fillStyle = COLORS.npcCloak
    context.fillRect(x + 3, y + 6, 9, 8)

    context.fillStyle = COLORS.playerSkin
    context.fillRect(x + 5, y + 2, 6, 5)

    context.fillStyle = COLORS.npcHair
    context.fillRect(x + 4, y + 1, 8, 2)
    context.fillRect(x + 9, y + 3, 2, 3)

    drawFacingPip(context, x, y, npc.facing, '#b9d4e8')
  }
}

function drawObjects(context, objects, camera) {
  for (const object of objects) {
    const x = Math.floor(object.x * TILE_SIZE - camera.x)
    const y = Math.floor(object.y * TILE_SIZE - camera.y)

    if (object.type === 'sign') {
      drawSign(context, x, y)
    } else if (object.type === 'campfire') {
      drawCampfire(context, x, y)
    } else if (object.type === 'waystone') {
      drawWaystone(context, x, y)
    }
  }
}

function drawWaystone(context, x, y) {
  context.fillStyle = COLORS.playerShadow
  context.fillRect(x + 3, y + 13, 10, 3)

  context.fillStyle = '#35485f'
  context.fillRect(x + 5, y + 4, 6, 10)

  context.fillStyle = '#88d8c0'
  context.fillRect(x + 7, y + 2, 2, 3)
  context.fillRect(x + 6, y + 7, 4, 1)

  context.fillStyle = '#d7b36a'
  context.fillRect(x + 4, y + 14, 8, 1)
}

function drawEnemies(context, enemies, camera) {
  for (const enemy of enemies) {
    if (enemy.dead) {
      continue
    }

    const x = Math.floor(enemy.x * TILE_SIZE - camera.x)
    const y = Math.floor(enemy.y * TILE_SIZE - camera.y)

    context.fillStyle = COLORS.playerShadow
    context.fillRect(x + 3, y + 12, 10, 3)

    context.fillStyle = enemy.color
    context.fillRect(x + 4, y + 4, 8, 9)

    if (enemy._hitFlash > 0) {
      context.fillStyle = 'rgba(255, 255, 255, 0.75)'
      context.fillRect(x + 3, y + 3, 10, 11)
    }

    context.fillStyle = '#160e1c'
    context.fillRect(x + 5, y + 6, 2, 2)
    context.fillRect(x + 9, y + 6, 2, 2)

    context.fillStyle = '#101010'
    context.fillRect(x + 2, y + 1, 12, 2)

    context.fillStyle = '#4d1d1d'
    context.fillRect(x + 2, y + 1, 12, 1)

    context.fillStyle = '#d76464'
    context.fillRect(x + 2, y + 1, Math.max(0, Math.ceil(12 * (enemy.hp / enemy.maxHp))), 1)
  }
}

function drawSign(context, x, y) {
  context.fillStyle = COLORS.playerShadow
  context.fillRect(x + 3, y + 13, 10, 2)

  context.fillStyle = '#4f3828'
  context.fillRect(x + 7, y + 7, 2, 7)

  context.fillStyle = '#9a7042'
  context.fillRect(x + 3, y + 3, 10, 6)

  context.fillStyle = '#2a1c14'
  context.fillRect(x + 5, y + 5, 6, 1)
  context.fillRect(x + 8, y + 6, 2, 1)
}

function drawCampfire(context, x, y) {
  context.fillStyle = COLORS.playerShadow
  context.fillRect(x + 3, y + 12, 10, 3)

  context.fillStyle = '#3b2a20'
  context.fillRect(x + 4, y + 10, 8, 2)
  context.fillRect(x + 5, y + 8, 2, 2)
  context.fillRect(x + 9, y + 8, 2, 2)

  context.fillStyle = '#5d5f63'
  context.fillRect(x + 6, y + 7, 4, 2)
}

function drawFacingPip(context, x, y, facing, color) {
  context.fillStyle = color

  if (facing === 'up') {
    context.fillRect(x + 7, y, 2, 2)
  } else if (facing === 'down') {
    context.fillRect(x + 7, y + 12, 2, 2)
  } else if (facing === 'left') {
    context.fillRect(x + 3, y + 7, 2, 2)
  } else if (facing === 'right') {
    context.fillRect(x + 11, y + 7, 2, 2)
  }
}

function drawVignette(context, canvas) {
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    40,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 1.25,
  )

  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.38)')

  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
}

function drawInventorySummary(context, canvas, inventory) {
  const itemStacks = inventory?.listItems() ?? []

  if (itemStacks.length === 0) {
    return
  }

  const x = canvas.width - 118
  const y = 16
  const width = 108
  const height = 16 + itemStacks.length * 10

  context.fillStyle = 'rgba(18, 15, 13, 0.88)'
  context.fillRect(x, y, width, height)

  context.strokeStyle = '#5a4632'
  context.lineWidth = 1
  context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1)

  context.font = '8px "Courier New", monospace'
  context.fillStyle = COLORS.dialogueBorder
  context.fillText('Pack', x + 7, y + 10)

  context.fillStyle = COLORS.uiText
  itemStacks.slice(0, 4).forEach((stack, index) => {
    context.fillText(`${stack.item.name} x${stack.quantity}`, x + 7, y + 21 + index * 10)
  })
}

export function drawDialogueBox(canvas, speaker, text) {
  const context = canvas.getContext('2d')
  const margin = 10
  const boxHeight = 58
  const x = margin
  const y = canvas.height - boxHeight - margin
  const width = canvas.width - margin * 2

  context.fillStyle = COLORS.dialogueBackground
  context.fillRect(x, y, width, boxHeight)

  context.strokeStyle = COLORS.dialogueBorder
  context.lineWidth = 2
  context.strokeRect(x + 1, y + 1, width - 2, boxHeight - 2)

  context.fillStyle = COLORS.dialogueBorder
  context.font = '8px "Courier New", monospace'
  context.fillText(speaker, x + 10, y + 14)

  context.fillStyle = COLORS.uiText
  const lines = wrapText(text, 44)
  lines.slice(0, 3).forEach((line, index) => {
    context.fillText(line, x + 10, y + 28 + index * 10)
  })

  context.fillStyle = '#a9b4a0'
  context.fillText('Space/E/Z/A', x + width - 72, y + boxHeight - 8)
}

function wrapText(text, maxCharacters) {
  const words = text.split(' ')
  const lines = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word

    if (candidate.length > maxCharacters) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }

  if (line) {
    lines.push(line)
  }

  return lines
}
