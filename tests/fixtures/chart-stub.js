// Stands in for Chart.js in the browser test: records what each chart was asked to draw.
window.__charts = [];
window.Chart = function Chart(canvas, config) { window.__charts.push({ id: canvas.closest("[data-chart]").id, config }); };
window.Chart.defaults = {};
