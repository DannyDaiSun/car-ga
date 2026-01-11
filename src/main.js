

import { App } from './ui/app.js'
import { initPartsPanel } from './ui/partsPanel.js'

const canvas = document.getElementById('world');

// Read initial slider values
const mutationSlider = document.getElementById('mutation-slider');
const popSlider = document.getElementById('pop-slider');
const dnaSlider = document.getElementById('dna-slider');
const initialMutRate = parseInt(mutationSlider.value) / 100;
const initialPopSize = parseInt(popSlider.value);
const initialMaxParts = parseInt(dnaSlider.value);

const app = new App(canvas, { popSize: initialPopSize, mutRate: initialMutRate, maxParts: initialMaxParts });

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
  document.getElementById('stat-mut').textContent = (app.mutRate * 100).toFixed(0) + '%';
  document.getElementById('stat-pop').textContent = app.popSize;
  document.getElementById('stat-dna').textContent = app.maxParts;
});

app.start();

// Init Parts Panel
initPartsPanel(app);

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

// Mutation Rate Slider
const mutationVal = document.getElementById('mutation-val');
mutationSlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  app.setSettings({ mutRate: val / 100 });
  mutationVal.textContent = val + '%';
  document.getElementById('stat-mut').textContent = val + '%';
});

// Population Slider
const popVal = document.getElementById('pop-val');
popSlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  app.setSettings({ popSize: val });
  popVal.textContent = val;
  document.getElementById('stat-pop').textContent = val;
});

// DNA Length Slider
const dnaVal = document.getElementById('dna-val');
dnaSlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  app.setSettings({ maxParts: val });
  dnaVal.textContent = val;
  document.getElementById('stat-dna').textContent = val;
});
