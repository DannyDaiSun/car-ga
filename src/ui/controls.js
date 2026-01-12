export function initControls(app, doc = document) {
    const startButton = doc.getElementById('btn-start');
    if (startButton) {
        startButton.addEventListener('click', () => {
            app.togglePause();
            startButton.textContent = app.running ? 'PAUSE' : 'RESUME';
            console.log('Pause Toggled. Running:', app.running);
        });
    }

    const resetButton = doc.getElementById('btn-reset');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            app.reset();
        });
    }

    const speedSlider = doc.getElementById('speed-slider');
    const speedVal = doc.getElementById('speed-val');
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            app.setSpeed(val);
            if (speedVal) speedVal.textContent = `${val}x`;
        });
    }

    const mutationSlider = doc.getElementById('mutation-slider');
    const mutationVal = doc.getElementById('mutation-val');
    if (mutationSlider) {
        mutationSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            app.setSettings({ mutRate: val / 100 });
            if (mutationVal) mutationVal.textContent = `${val}%`;
            const statMut = doc.getElementById('stat-mut');
            if (statMut) statMut.textContent = `${val}%`;
        });
    }

    const popSlider = doc.getElementById('pop-slider');
    const popVal = doc.getElementById('pop-val');
    if (popSlider) {
        popSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            app.setSettings({ popSize: val });
            if (popVal) popVal.textContent = `${val}`;
            const statPop = doc.getElementById('stat-pop');
            if (statPop) statPop.textContent = `${val}`;
        });
    }

    const dnaSlider = doc.getElementById('dna-slider');
    const dnaVal = doc.getElementById('dna-val');
    if (dnaSlider) {
        dnaSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            app.setSettings({ maxParts: val });
            if (dnaVal) dnaVal.textContent = `${val}`;
            const statDna = doc.getElementById('stat-dna');
            if (statDna) statDna.textContent = `${val}`;
        });
    }
}
