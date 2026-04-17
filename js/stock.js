function showStock(brand, btn) {
  document.querySelectorAll('#p-stock .btn-rent').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderStock(brand);
}

function renderStock(brand) {
  const allBrands = Object.keys(STOCK_DB);
  const rows = brand === 'Todos'
    ? allBrands.flatMap(b => STOCK_DB[b].map(r => [b, ...r]))
    : (STOCK_DB[brand] || []).map(r => [brand, ...r]);

  let html = '';
  rows.forEach(([marca, modelo, ini, vend]) => {
    const actual = ini - vend;
    let estado, cls;
    if (actual === 0)     { estado = 'Sin stock'; cls = 'br'; }
    else if (actual === 1){ estado = 'Critico';   cls = 'ba'; }
    else if (actual <= 3) { estado = 'Bajo';      cls = 'ba'; }
    else                  { estado = 'Normal';    cls = 'bg'; }
    html += `<tr>
      <td style="font-size:12px;color:var(--text-secondary)">${marca}</td>
      <td style="font-weight:500">${modelo}</td>
      <td style="text-align:center">${ini}</td>
      <td style="text-align:center;color:${vend > 0 ? 'var(--text-danger)' : 'var(--text-secondary)'}">${vend > 0 ? vend : '—'}</td>
      <td style="text-align:center;font-weight:600">${actual}</td>
      <td style="text-align:center;font-size:12px;color:${vend > 0 ? 'var(--text-danger)' : 'var(--text-secondary)'}">${vend > 0 ? '-' + vend : '—'}</td>
      <td><span class="badge ${cls}">${estado}</span></td>
    </tr>`;
  });

  const tbody = document.getElementById('stockTbody');
  if (tbody) tbody.innerHTML = html;

  // KPIs globales
  const allRows   = allBrands.flatMap(b => STOCK_DB[b]);
  const totalIni  = allRows.reduce((s, [, ini])    => s + ini,       0);
  const totalAct  = allRows.reduce((s, [, ini, v]) => s + (ini - v), 0);
  const criticos  = allRows.filter(([, ini, v]) => (ini - v) <= 1).length;

  const kpisEl = document.getElementById('stockKpis');
  if (kpisEl) kpisEl.innerHTML = `
    <div class="met"><div class="ml">Stock inicio Abr</div><div class="mv">${totalIni} uds</div><div class="md">todas las marcas</div></div>
    <div class="met"><div class="ml">Stock actual</div><div class="mv up">${totalAct} uds</div><div class="md">${totalIni - totalAct} vendidas en el mes</div></div>
    <div class="met"><div class="ml">Modelos criticos</div><div class="mv ${criticos > 0 ? 'dn' : 'up'}">${criticos}</div><div class="md">stock ≤ 1 unidad</div></div>
    <div class="met"><div class="ml">Marcas activas</div><div class="mv">5</div><div class="md">Willard · Moura · Heliar · Bari · Mateo</div></div>
  `;
}
