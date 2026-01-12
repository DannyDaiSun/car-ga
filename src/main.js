

import { App } from './ui/app.js'
import { initPartsPanel } from './ui/partsPanel.js'
import { applyMobileLayout } from './ui/layout.js';
import { initControls } from './ui/controls.js';

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
document.getElementById('btn-start').textContent = 'PAUSE'; // Reflect running state

// Controls
initControls(app);

// Init Parts Panel
initPartsPanel(app);
applyMobileLayout();
window.addEventListener('resize', () => applyMobileLayout());
window.addEventListener('orientationchange', () => applyMobileLayout());
