import './style.css'
import { PLAYER_1 } from '@rcade/plugin-input-classic'

const canvas = document.getElementById('canvas')
const statusElement = document.getElementById('status')

// RCade control to keyboard mapping
// A -> 'z' (left flipper)
// B -> '/' (right flipper)
// Down -> ' ' (space - launch ball)
// Left -> 'x' (left nudge)
// Right -> '.' (right nudge)
const controlMap = [
  { control: 'A', key: 'z', code: 'KeyZ', keyCode: 90 },
  { control: 'B', key: '/', code: 'Slash', keyCode: 191 },
  { control: 'down', key: ' ', code: 'Space', keyCode: 32 },
  { control: 'left', key: 'x', code: 'KeyX', keyCode: 88 },
  { control: 'right', key: '.', code: 'Period', keyCode: 190 }
]

// Track pressed state to detect changes
const pressedState = {
  A: false,
  B: false,
  down: false,
  left: false,
  right: false
}

function dispatchKey(mapping, type) {
  const event = new KeyboardEvent(type, {
    key: mapping.key,
    code: mapping.code,
    keyCode: mapping.keyCode,
    which: mapping.keyCode,
    bubbles: true,
    cancelable: true
  })
  document.dispatchEvent(event)
}

function getControlState(control) {
  if (control === 'A') return PLAYER_1.A
  if (control === 'B') return PLAYER_1.B
  if (control === 'down') return PLAYER_1.DPAD.down
  if (control === 'left') return PLAYER_1.DPAD.left
  if (control === 'right') return PLAYER_1.DPAD.right
  return false
}

function updateControls() {
  for (const mapping of controlMap) {
    const isPressed = getControlState(mapping.control)
    if (isPressed && !pressedState[mapping.control]) {
      dispatchKey(mapping, 'keydown')
    } else if (!isPressed && pressedState[mapping.control]) {
      dispatchKey(mapping, 'keyup')
    }
    pressedState[mapping.control] = isPressed
  }

  requestAnimationFrame(updateControls)
}

updateControls()

// Set up the Emscripten Module
window.Module = {
  canvas: canvas,
  print: function(text) {
    console.log(text)
  },
  printErr: function(text) {
    console.error(text)
  },
  setStatus: function(text) {
    if (!text) {
      statusElement.style.display = 'none'
      return
    }
    // Parse progress from text like "Downloading... (50/100)"
    const match = text.match(/\((\d+)\/(\d+)\)/)
    if (match) {
      const current = parseInt(match[1])
      const total = parseInt(match[2])
      const percent = Math.round((current / total) * 100)
      statusElement.textContent = `Downloading... ${percent}%`
    } else {
      statusElement.textContent = text
    }
  },
  monitorRunDependencies: function(left) {
    if (left === 0) {
      statusElement.style.display = 'none'
    }
  }
}

// Handle WebGL context loss
canvas.addEventListener('webglcontextlost', function(e) {
  alert('WebGL context lost. Please reload the page.')
  e.preventDefault()
}, false)

// RCade display dimensions
const RCADE_WIDTH = 336
const RCADE_HEIGHT = 262

// Scale canvas to fit RCade display
function scaleCanvas() {
  const gameWidth = canvas.width
  const gameHeight = canvas.height
  if (gameWidth === 0 || gameHeight === 0) return

  const scaleX = RCADE_WIDTH / gameWidth
  const scaleY = RCADE_HEIGHT / gameHeight
  const scale = Math.min(scaleX, scaleY)

  canvas.style.transformOrigin = 'top left'
  canvas.style.transform = `scale(${scale})`
}

// Watch for canvas size changes and rescale
const resizeObserver = new ResizeObserver(() => scaleCanvas())
resizeObserver.observe(canvas)
window.addEventListener('resize', scaleCanvas)

// Load the Space Cadet Pinball script
const script = document.createElement('script')
script.src = '/SpaceCadetPinball.js'
script.async = true
document.body.appendChild(script)
