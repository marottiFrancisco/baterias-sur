function drawReportes() {
  const c = document.getElementById('cReportes');
  if (!c || charts.reportes) return;
  const { tc, gc } = getChartDefaults();
  charts.reportes = new Chart(c, {
    type: 'line',
    data: {
      labels: ['Nov','Dic','Ene','Feb','Mar','Abr'],
      datasets: [
        { label: 'Ventas',   data: [2100000,2650000,1980000,2430000,2750000,3240000], borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,0.08)', borderWidth: 1.5, tension: .4, pointRadius: 3, pointBackgroundColor: '#1D9E75' },
        { label: 'Ganancia', data: [1220000,1540000,1148000,1409000,1595000,1882000], borderColor: '#7F77DD', backgroundColor: 'rgba(127,119,221,0.08)', borderWidth: 1.5, tension: .4, pointRadius: 3, pointBackgroundColor: '#7F77DD' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: tc, font: { size: 11 }, boxWidth: 10, padding: 8 } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: tc, font: { size: 11 } } },
        y: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 }, callback: v => '$' + Math.round(v / 1000) + 'k' } },
      },
    },
  });
}

function initReportes() {
  const total     = DB.reduce((s, r) => s + r[7], 0);
  const bats      = DB.filter(r => r[4] === 'Bat');
  const pms       = DB.filter(r => r[4] === 'PM');
  const neus      = DB.filter(r => r[4] === 'Neu');
  const otros     = DB.filter(r => r[4] === 'Otro');
  const batCon    = bats.filter(r => r[7] > 0);
  const avgTicket = batCon.length ? batCon.reduce((s, r) => s + r[7], 0) / batCon.length : 0;

  const byMec = {};
  DB.forEach(r => {
    if (!r[8]) return;
    if (!byMec[r[8]]) byMec[r[8]] = { total: 0, count: 0 };
    byMec[r[8]].total += r[7];
    byMec[r[8]].count++;
  });
  const mecList = Object.entries(byMec).sort((a, b) => b[1].total - a[1].total);

  const byPago = {};
  DB.forEach(r => {
    const p = r[6] || 'Sin pago';
    if (!byPago[p]) byPago[p] = 0;
    byPago[p] += r[7];
  });
  const pagoList   = Object.entries(byPago).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const pagoColor  = p => p === 'Efectivo' ? '#1d9e75' : p === 'Transferencia' ? '#185fa5' : p === 'Debito' ? '#639922' : p.includes('Cuota') || p === 'Cta. cte.' ? '#ef9f27' : '#888780';

  const el = id => document.getElementById(id);
  if (el('repTotal'))  el('repTotal').textContent  = fmt$(total);
  if (el('repBat'))    el('repBat').textContent    = bats.length + ' colocaciones';
  if (el('repPM'))     el('repPM').textContent     = pms.length + ' puestas en marcha';
  if (el('repTicket')) el('repTicket').textContent = fmt$(avgTicket);

  const servData = [
    ['Colocacion Bateria', bats.length,  bats.reduce((s, r)  => s + r[7], 0)],
    ['Puesta en Marcha',   pms.length,   pms.reduce((s, r)   => s + r[7], 0)],
    ['Neumatico',          neus.length,  neus.reduce((s, r)  => s + r[7], 0)],
    ['Otro',               otros.length, otros.reduce((s, r) => s + r[7], 0)],
  ];
  let servHtml = '';
  servData.forEach(([nombre, cnt, imp]) => {
    const pctC = Math.round(cnt / DB.length * 100);
    const pctI = total > 0 && imp > 0 ? Math.round(imp / total * 100) : 0;
    servHtml += `<tr>
      <td>${nombre}</td>
      <td>${cnt} <span style="font-size:11px;color:var(--text-secondary)">(${pctC}%)</span></td>
      <td>${imp > 0 ? fmt$(imp) : '<span style="color:var(--text-secondary)">—</span>'}</td>
      <td>${imp > 0 ? `<span class="up">${pctI}%</span>` : '<span style="color:var(--text-secondary)">—</span>'}</td>
    </tr>`;
  });
  if (el('repServTbody')) el('repServTbody').innerHTML = servHtml;

  let mecHtml = '';
  mecList.forEach(([m, d]) => {
    const pct = Math.round(d.total / total * 100);
    mecHtml += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <span class="badge ${mecColor(m)}" style="min-width:90px;text-align:center">${m}</span>
      <div class="pbar" style="flex:1"><div class="pbf" style="width:${pct}%;background:${MEC_COLORS[m] || '#888'}"></div></div>
      <span style="font-size:13px;font-weight:600;min-width:90px;text-align:right">${fmt$(d.total)}</span>
      <span style="font-size:12px;color:var(--text-secondary);min-width:30px">${pct}%</span>
    </div>`;
  });
  if (el('repMecBars')) el('repMecBars').innerHTML = mecHtml;

  let pagoHtml = '';
  pagoList.forEach(([p, v]) => {
    const pct = Math.round(v / total * 100);
    pagoHtml += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <span style="font-size:12px;min-width:125px">${p}</span>
      <div class="pbar" style="flex:1"><div class="pbf" style="width:${pct}%;background:${pagoColor(p)}"></div></div>
      <span style="font-size:12px;font-weight:600;min-width:90px;text-align:right">${fmt$(v)}</span>
      <span style="font-size:12px;color:var(--text-secondary);min-width:32px">${pct}%</span>
    </div>`;
  });
  if (el('repPagoBars')) el('repPagoBars').innerHTML = pagoHtml;

  drawReportes();
}
