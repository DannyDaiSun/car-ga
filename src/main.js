
import './style.css'
import { App } from './ui/app.js'

const canvas = document.getElementById('world');
const app = new App(canvas);

// Resize handling
function resize() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  app.width = canvas.width;
  app.height = canvas.height;
}
window.addEventListener('resize', resize);
resize();

// Start

app.setStatsCallback((stats) => {
  document.getElementById('stat-gen').textContent = stats.generation;
  document.getElementById('stat-best').textContent = stats.bestFitness.toFixed(2);
});

app.start();

// Controls
document.getElementById('btn-start').addEventListener('click', () => {
  app.togglePause();
});

document.getElementById('btn-reset').addEventListener('click', () => {
  app.reset();
});

const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
speedSlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  app.setSpeed(val);
  speedVal.textContent = val + 'x';
});
