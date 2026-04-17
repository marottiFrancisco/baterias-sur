// Simulador de impacto de precio en Competencia ML
function simular() {
  const precioNuevo  = +document.getElementById('simPrecio').value;
  const ventas       = +document.getElementById('simVentas').value;
  const precioActual = 43000;

  document.getElementById('simPOut').textContent = '$' + Math.round(precioNuevo).toLocaleString('es-AR');
  document.getElementById('simVOut').textContent = ventas;

  const actual = precioActual * ventas;
  const nuevo  = precioNuevo  * ventas;
  const dif    = nuevo - actual;

  document.getElementById('simActual').textContent = '$' + Math.round(actual).toLocaleString('es-AR');
  document.getElementById('simNuevo').textContent  = '$' + Math.round(nuevo).toLocaleString('es-AR');
  document.getElementById('simDif').textContent    = (dif >= 0 ? '+' : '') + '$' + Math.round(dif).toLocaleString('es-AR');
  document.getElementById('simDif').style.color    = dif >= 0 ? 'var(--text-success)' : 'var(--text-danger)';
  document.getElementById('simAnual').textContent  = (dif >= 0 ? '+' : '') + '$' + Math.round(dif * 12).toLocaleString('es-AR');
  document.getElementById('simAnual').style.color  = dif >= 0 ? 'var(--text-success)' : 'var(--text-danger)';
}
