function cajaLineRow(label, val, tipo) {
  const color  = tipo === 'cuota' ? 'var(--text-warning)' : 'var(--text-success)';
  const prefix = tipo === 'cuota' ? '' : '+';
  return `<div style="display:flex;justify-content:space-between;margin-bottom:6px">
    <span style="font-size:13px;color:var(--text-secondary)">${label}</span>
    <span style="font-size:13px;font-weight:600;color:${color}">${prefix}${val}</span>
  </div>`;
}

function initCaja(dia) {
  const rows  = dia ? DB.filter(r => r[0] === dia) : DB;
  const label = dia ? (DIAS_LABEL[dia] || dia) : 'Periodo 1 al 13 de Abril 2026';

  const ef  = rows.filter(r => r[6] === 'Efectivo').reduce((s, r) => s + r[7], 0);
  const tr  = rows.filter(r => r[6] === 'Transferencia').reduce((s, r) => s + r[7], 0);
  const deb = rows.filter(r => r[6] === 'Debito').reduce((s, r) => s + r[7], 0);
  const c1  = rows.filter(r => r[6] === '1 Cuota').reduce((s, r) => s + r[7], 0);
  const c3  = rows.filter(r => r[6] === '3 Cuotas').reduce((s, r) => s + r[7], 0);
  const c6  = rows.filter(r => r[6] === '6 Cuotas').reduce((s, r) => s + r[7], 0);
  const cta = rows.filter(r => r[6] === 'Cta. cte.').reduce((s, r) => s + r[7], 0);
  const total = rows.reduce((s, r) => s + r[7], 0);
  const batC  = rows.filter(r => r[4] === 'Bat').length;
  const pmC   = rows.filter(r => r[4] === 'PM').length;

  const byMec = {};
  rows.forEach(r => {
    if (!r[8]) return;
    if (!byMec[r[8]]) byMec[r[8]] = { total: 0, count: 0 };
    byMec[r[8]].total += r[7];
    byMec[r[8]].count++;
  });
  const mecList = Object.entries(byMec).sort((a, b) => b[1].total - a[1].total);

  let desglHtml = '';
  if (ef  > 0) desglHtml += cajaLineRow('Efectivo cobrado',        fmt$(ef),  'ok');
  if (tr  > 0) desglHtml += cajaLineRow('Transferencias',          fmt$(tr),  'ok');
  if (deb > 0) desglHtml += cajaLineRow('Debito',                  fmt$(deb), 'ok');
  if (c1  > 0) desglHtml += cajaLineRow('1 Cuota',                 fmt$(c1),  'cuota');
  if (c3  > 0) desglHtml += cajaLineRow('3 Cuotas (pend. acred.)', fmt$(c3),  'cuota');
  if (c6  > 0) desglHtml += cajaLineRow('6 Cuotas (pend. acred.)', fmt$(c6),  'cuota');
  if (cta > 0) desglHtml += cajaLineRow('Cta. corriente',          fmt$(cta), 'cuota');

  let mecHtml = '';
  mecList.forEach(([m, d], i) => {
    const pct = total > 0 ? Math.round(d.total / total * 100) : 0;
    const brd = i < mecList.length - 1 ? 'border-bottom:0.5px solid var(--border);' : '';
    mecHtml += `<div style="padding:10px 0;${brd}display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:13px;font-weight:600">${m}</div>
        <div style="font-size:12px;color:var(--text-secondary)">${d.count} servicios</div>
        <div class="pbar" style="width:140px;margin-top:4px"><div class="pbf" style="width:${pct}%;background:${MEC_COLORS[m] || '#888'}"></div></div>
      </div>
      <div style="text-align:right">
        <div style="font-size:14px;font-weight:600">${fmt$(d.total)}</div>
        <div style="font-size:11px;color:var(--text-secondary)">${pct}%</div>
      </div>
    </div>`;
  });

  const el = id => document.getElementById(id);
  if (el('cajaLabel'))   el('cajaLabel').textContent   = label.toUpperCase() + ' — CIERRE DEL DIA';
  if (el('cajaTotalSv')) el('cajaTotalSv').textContent = rows.length + ' servicios · ' + batC + ' bat · ' + pmC + ' PM';
  if (el('cajaEf'))      el('cajaEf').textContent      = fmt$(ef);
  if (el('cajaTr'))      el('cajaTr').textContent      = fmt$(tr);
  if (el('cajaDeb'))     el('cajaDeb').textContent     = fmt$(deb);
  if (el('cajaCta'))     el('cajaCta').textContent     = fmt$(cta);
  if (el('cajaTotal'))   el('cajaTotal').textContent   = fmt$(total);
  if (el('cajaCuotas'))  el('cajaCuotas').innerHTML    =
    (c3 > 0 || c6 > 0 || c1 > 0)
      ? `3 Cuotas: <strong>${fmt$(c3)}</strong> &nbsp;·&nbsp; 6 Cuotas: <strong>${fmt$(c6)}</strong>${c1 > 0 ? ' &nbsp;·&nbsp; 1 Cuota: <strong>' + fmt$(c1) + '</strong>' : ''}`
      : '<span style="color:var(--text-secondary)">Sin cuotas este dia</span>';
  if (el('cajaDesglose')) el('cajaDesglose').innerHTML = desglHtml;
  if (el('cajaMecs'))    el('cajaMecs').innerHTML      = mecHtml;
}
