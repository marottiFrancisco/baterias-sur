// Registro global de instancias Chart.js para evitar duplicados
const charts = {};

const fmt$ = v => '$' + Math.round(v).toLocaleString('es-AR');

function mecColor(m) {
  return { Cristian:'bg', Tomas:'bb', Santi:'bp', 'Juan Manuel':'bgr' }[m] || 'bgr';
}

function servBadge(s) {
  const map = {
    Bat:  '<span class="badge bg">Bat</span>',
    PM:   '<span class="badge bb">PM</span>',
    Neu:  '<span class="badge ba">Neu</span>',
    Otro: '<span class="badge bgr">Otro</span>',
  };
  return map[s] || s;
}

function pagoBadge(p) {
  if (!p) return '<span class="badge bgr">—</span>';
  if (p === 'Efectivo')     return '<span class="badge bg">Efectivo</span>';
  if (p === 'Transferencia') return '<span class="badge bb">Transfer.</span>';
  if (p === 'Debito')       return '<span class="badge bb">Debito</span>';
  if (p.includes('Cuota'))  return '<span class="badge ba">' + p + '</span>';
  if (p === 'Cta. cte.')    return '<span class="badge ba">Cta. cte.</span>';
  return '<span class="badge bgr">' + p + '</span>';
}

function getChartDefaults() {
  const dark = matchMedia('(prefers-color-scheme:dark)').matches;
  return {
    tc: dark ? '#c2c0b6' : '#888780',
    gc: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
  };
}
