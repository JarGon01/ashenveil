const queue = []
let activeNotification = null

const DISPLAY_SECONDS = 3
const FADE_SECONDS = 0.45

const TYPE_STYLES = {
  info: {
    border: '#7fa9c9',
    text: '#d9edf7',
  },
  discovery: {
    border: '#d7b36a',
    text: '#f8d782',
  },
  warning: {
    border: '#d76464',
    text: '#ffd0c8',
  },
}

export function showNotification(message, type = 'info') {
  queue.push({
    message,
    type,
    age: 0,
  })
}

export function updateNotifications(deltaSeconds) {
  if (!activeNotification) {
    activeNotification = queue.shift() ?? null
  }

  if (!activeNotification) {
    return
  }

  activeNotification.age += deltaSeconds

  if (activeNotification.age >= DISPLAY_SECONDS) {
    activeNotification = null
  }
}

export function drawNotifications(ctx) {
  if (!activeNotification) {
    return
  }

  const style = TYPE_STYLES[activeNotification.type] ?? TYPE_STYLES.info
  const alpha = getAlpha(activeNotification.age)
  const width = Math.min(248, ctx.canvas.width - 24)
  const height = 24
  const x = Math.floor((ctx.canvas.width - width) / 2)
  const y = ctx.canvas.height - height - 14

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = 'rgba(12, 10, 8, 0.9)'
  ctx.fillRect(x, y, width, height)

  ctx.strokeStyle = style.border
  ctx.lineWidth = 2
  ctx.strokeRect(x + 1, y + 1, width - 2, height - 2)

  ctx.font = '8px "Courier New", monospace'
  ctx.fillStyle = style.text
  ctx.textAlign = 'center'
  ctx.fillText(activeNotification.message, ctx.canvas.width / 2, y + 15)
  ctx.restore()
}

function getAlpha(age) {
  if (age < FADE_SECONDS) {
    return age / FADE_SECONDS
  }

  if (age > DISPLAY_SECONDS - FADE_SECONDS) {
    return Math.max(0, (DISPLAY_SECONDS - age) / FADE_SECONDS)
  }

  return 1
}
