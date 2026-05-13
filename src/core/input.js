const KEY_BINDINGS = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
}

const ACTION_KEYS = new Set(['Enter', 'KeyE', 'KeyZ'])
const ATTACK_KEYS = new Set(['Space'])

export function createInput() {
  const heldDirections = new Set()
  let actionPressed = false
  let attackPressed = false
  let wasGamepadActionPressed = false
  let wasGamepadAttackPressed = false

  function setKey(event, isPressed) {
    const direction = KEY_BINDINGS[event.code]

    if (ATTACK_KEYS.has(event.code)) {
      event.preventDefault()

      if (isPressed && !event.repeat) {
        attackPressed = true
      }

      return
    }

    if (ACTION_KEYS.has(event.code)) {
      event.preventDefault()

      if (isPressed && !event.repeat) {
        actionPressed = true
      }

      return
    }

    if (!direction) {
      return
    }

    event.preventDefault()

    if (isPressed) {
      heldDirections.add(direction)
    } else {
      heldDirections.delete(direction)
    }
  }

  window.addEventListener('keydown', (event) => setKey(event, true))
  window.addEventListener('keyup', (event) => setKey(event, false))
  window.addEventListener('blur', () => heldDirections.clear())

  return {
    getMovementVector() {
      const keyboardVector = directionsToVector(heldDirections)
      const gamepadVector = readGamepadVector()

      return normalizeVector({
        x: keyboardVector.x + gamepadVector.x,
        y: keyboardVector.y + gamepadVector.y,
      })
    },
    consumeActionPress() {
      const gamepadActionPressed = readGamepadActionPressed()
      const isNewGamepadPress = gamepadActionPressed && !wasGamepadActionPressed
      wasGamepadActionPressed = gamepadActionPressed

      if (actionPressed || isNewGamepadPress) {
        actionPressed = false
        return true
      }

      return false
    },
    consumeAttackPress() {
      const gamepadAttackPressed = readGamepadAttackPressed()
      const isNewGamepadPress = gamepadAttackPressed && !wasGamepadAttackPressed
      wasGamepadAttackPressed = gamepadAttackPressed

      if (attackPressed || isNewGamepadPress) {
        attackPressed = false
        return true
      }

      return false
    },
  }
}

function directionsToVector(directions) {
  return {
    x: Number(directions.has('right')) - Number(directions.has('left')),
    y: Number(directions.has('down')) - Number(directions.has('up')),
  }
}

function readGamepadVector() {
  const [gamepad] = navigator.getGamepads ? navigator.getGamepads() : []

  if (!gamepad) {
    return { x: 0, y: 0 }
  }

  const axisX = applyDeadzone(gamepad.axes[0] ?? 0)
  const axisY = applyDeadzone(gamepad.axes[1] ?? 0)
  const dpadX = Number(gamepad.buttons[15]?.pressed) - Number(gamepad.buttons[14]?.pressed)
  const dpadY = Number(gamepad.buttons[13]?.pressed) - Number(gamepad.buttons[12]?.pressed)

  return normalizeVector({
    x: axisX + dpadX,
    y: axisY + dpadY,
  })
}

function applyDeadzone(value) {
  return Math.abs(value) < 0.22 ? 0 : value
}

function readGamepadActionPressed() {
  const [gamepad] = navigator.getGamepads ? navigator.getGamepads() : []

  if (!gamepad) {
    return false
  }

  return Boolean(gamepad.buttons[0]?.pressed || gamepad.buttons[1]?.pressed)
}

function readGamepadAttackPressed() {
  const [gamepad] = navigator.getGamepads ? navigator.getGamepads() : []

  if (!gamepad) {
    return false
  }

  return Boolean(gamepad.buttons[2]?.pressed)
}

function normalizeVector(vector) {
  const magnitude = Math.hypot(vector.x, vector.y)

  if (magnitude <= 0) {
    return { x: 0, y: 0 }
  }

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  }
}
