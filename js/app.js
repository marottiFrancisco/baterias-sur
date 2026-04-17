// ── Navegacion de tabs ────────────────────────────────────────────
function show(id, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ntab').forEach(b => b.classList.remove('active'));
  document.getElementById('p-' + id).classList.add('active');
  btn.classList.add('active');
  if (id === 'resumen')     drawVentas();
  if (id === 'ventas')      renderVentas();
  if (id === 'caja')        initCaja('');
  if (id === 'reportes')    initReportes();
  if (id === 'proveedores') initProveedores();
  if (id === 'roi')         initRent();
}

// ── Grafico de ventas (resumen) ───────────────────────────────────
function drawVentas() {
  const c = document.getElementById('cVentas');
  if (!c || charts.ventas) return;
  const { tc, gc } = getChartDefaults();
  charts.ventas = new Chart(c, {
    type: 'bar',
    data: {
      labels: ['6 Abr','7 Abr','8 Abr','9 Abr','10 Abr','11 Abr','12 Abr'],
      datasets: [{
        data: [1801400,1821000,1522850,1605500,1830300,1796650,1668700],
        backgroundColor: ['#9FE1CB','#9FE1CB','#9FE1CB','#9FE1CB','#9FE1CB','#9FE1CB','#1D9E75'],
        borderRadius: 4, borderSkipped: false,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => '$' + Math.round(ctx.raw).toLocaleString('es-AR') } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: tc, font: { size: 11 } } },
        y: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 }, callback: v => '$' + Math.round(v / 1000) + 'k' } },
      },
    },
  });
}

// ── Escuchar registros nuevos desde la ventana del mecanico ───────
window.addEventListener('storage', e => {
  if (e.key === RECS_KEY) {
    const sess = getSession();
    if (sess && sess.role === 'admin') {
      updatePendingBadge();
      const vp = document.getElementById('p-ventas');
      if (vp && vp.classList.contains('active')) renderVentas();
    }
  }
});

// ── Arranque de la aplicacion ─────────────────────────────────────
const _initSess = getSession();
if (_initSess) applySession(_initSess);
