import './style.css'

const canvas = document.getElementById('canvas')
const statusElement = document.getElementById('status')

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
