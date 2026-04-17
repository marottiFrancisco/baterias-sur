let RENT_PRODS = [];
let rentInited = false;

const rentMargen   = p => Math.round((p.precio - p.costo) / p.costo * 100);
const rentGanancia = p => p.precio - p.costo;

function buildRentProds() {
  const batsSold = DB.filter(r => r[4] === 'Bat' && r[5] && r[7] > 0);
  const byMod = {};
  batsSold.forEach(r => {
    const m = r[5].trim();
    if (!byMod[m]) byMod[m] = { count: 0, total: 0 };
    byMod[m].count++;
    byMod[m].total += r[7];
  });
  RENT_PRODS = Object.entries(byMod)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([nombre, d]) => {
      const precio = Math.round(d.total / d.count);
      const costo  = Math.round(precio * RENT_COST_FACTOR);
      const short  = nombre.length > 9 ? nombre.slice(0, 9) : nombre;
      return { nombre, short, costo, precio, unidades: d.count };
    });
}

function initRent() {
  if (!rentInited) { buildRentProds(); rentInited = true; }

  const batsAll  = DB.filter(r => r[4] === 'Bat');
  const batsCon  = batsAll.filter(r => r[7] > 0);
  const totalBat = batsCon.reduce((s, r) => s + r[7], 0);
  const promBat  = batsCon.length ? totalBat / batsCon.length : 0;
  const topMod   = RENT_PRODS[0];
  const modCount = Object.keys((() => {
    const m = {};
    DB.filter(r => r[4] === 'Bat' && r[5]).forEach(r => { m[r[5].trim()] = 1; });
    return m;
  })()).length;

  const el = id => document.getElementById(id);
  if (el('rentTopMod'))     el('rentTopMod').textContent     = topMod ? topMod.nombre : '—';
  if (el('rentTopModSub'))  el('rentTopModSub').textContent  = topMod ? topMod.unidades + ' colocaciones en Abril' : '';
  if (el('rentTotalBat'))   el('rentTotalBat').textContent   = fmt$(totalBat);
  if (el('rentPrecioProm')) el('rentPrecioProm').textContent = fmt$(promBat);
  if (el('rentModelos'))    el('rentModelos').textContent    = modCount;

  drawRentMargen();
}

function showRent(id, btn) {
  document.querySelectorAll('.rent-sp').forEach(p => p.style.display = 'none');
  document.querySelectorAll('#p-roi .btn-rent').forEach(b => b.classList.remove('active'));
  document.getElementById('rent-' + id).style.display = '';
  btn.classList.add('active');
  if (id === 'margen')   drawRentMargen();
  if (id === 'canal')    drawRentCanal();
  if (id === 'comparar') drawRentComparar();
}

function drawRentMargen() {
  const { tc, gc } = getChartDefaults();
  if (!RENT_PRODS.length) return;

  const maxGan = Math.max(...RENT_PRODS.map(p => rentGanancia(p)));
  const minPct = Math.min(...RENT_PRODS.map(p => rentMargen(p)));
  const maxPct = Math.max(...RENT_PRODS.map(p => rentMargen(p)));
  const best   = RENT_PRODS.reduce((a, b) => rentGanancia(a) > rentGanancia(b) ? a : b);

  let html = '';
  RENT_PRODS.forEach(p => {
    const pct  = rentMargen(p);
    const gan  = rentGanancia(p);
    const barW = Math.round(gan / maxGan * 100);
    html += `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:0.5px solid var(--border)">
      <div style="min-width:110px;font-size:13px;font-weight:500">${p.nombre}</div>
      <div style="font-size:11px;color:var(--text-secondary);min-width:26px">${p.unidades}ud</div>
      <div style="flex:1"><div style="background:#1d9e75;height:18px;border-radius:3px;width:${barW}%"></div></div>
      <div style="min-width:34px;text-align:right;font-size:12px;color:var(--text-secondary)">${pct}%</div>
      <div style="min-width:80px;text-align:right;font-size:13px;font-weight:600;color:#1d9e75">${fmt$(gan)}</div>
    </div>`;
  });
  document.getElementById('rentDesglose').innerHTML = html;

  const recTxt = document.getElementById('rentMargenRecTxt');
  if (recTxt) recTxt.textContent =
    `El margen estimado oscila entre ${minPct}% y ${maxPct}% segun el modelo. La mayor ganancia por unidad la genera ${best.nombre} con ${fmt$(rentGanancia(best))} por colocacion. En Abril se colocaron ${best.unidades} unidades de este modelo — generando una ganancia estimada de ${fmt$(rentGanancia(best) * best.unidades)} solo con ese modelo.`;

  if (!charts.margenPct) {
    charts.margenPct = new Chart(document.getElementById('cMargenPct'), {
      type: 'bar',
      data: { labels: RENT_PRODS.map(p => p.short), datasets: [{ data: RENT_PRODS.map(p => rentMargen(p)), backgroundColor: '#1D9E75', borderRadius: 4, borderSkipped: false }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.raw + '%' } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: tc, font: { size: 11 } } },
          y: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 }, callback: v => v + '%' } },
        },
      },
    });
  }
  if (!charts.gananciaPeso) {
    charts.gananciaPeso = new Chart(document.getElementById('cGananciaPeso'), {
      type: 'bar',
      data: { labels: RENT_PRODS.map(p => p.short), datasets: [{ data: RENT_PRODS.map(p => rentGanancia(p)), backgroundColor: '#1D9E75', borderRadius: 4, borderSkipped: false }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '$' + Math.round(ctx.raw).toLocaleString('es-AR') } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: tc, font: { size: 11 } } },
          y: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 }, callback: v => '$' + Math.round(v / 1000) + 'k' } },
        },
      },
    });
  }
}

function drawRentCanal() {
  if (!RENT_PRODS.length) return;
  const { tc, gc } = getChartDefaults();

  let tbl = '';
  RENT_PRODS.forEach(p => {
    const gMostr = rentGanancia(p);
    const gCte   = Math.round(p.precio * 0.87) - p.costo;
    const gML    = Math.round(p.precio * 0.81) - p.costo;
    const diff   = gML - gMostr;
    tbl += `<tr>
      <td style="font-weight:500">${p.nombre}</td>
      <td>${fmt$(p.precio)}</td>
      <td class="up">${fmt$(gMostr)}</td>
      <td>${fmt$(gCte)}</td>
      <td style="color:var(--text-warning)">${fmt$(gML)}</td>
      <td class="dn">${fmt$(diff)}</td>
    </tr>`;
  });
  const tb = document.getElementById('rentCanalTbody');
  if (tb) tb.innerHTML = tbl;

  if (charts.canal) return;
  charts.canal = new Chart(document.getElementById('cCanal'), {
    type: 'bar',
    data: {
      labels: RENT_PRODS.map(p => p.short),
      datasets: [
        { label: 'Mostrador',      data: RENT_PRODS.map(p => rentGanancia(p)),                     backgroundColor: '#1D9E75', borderRadius: 3 },
        { label: 'Cta. corriente', data: RENT_PRODS.map(p => Math.round(p.precio * 0.87) - p.costo), backgroundColor: '#7F77DD', borderRadius: 3 },
        { label: 'Mercado Libre',  data: RENT_PRODS.map(p => Math.round(p.precio * 0.81) - p.costo), backgroundColor: '#EF9F27', borderRadius: 3 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: tc, font: { size: 11 }, boxWidth: 10, padding: 8 } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': $' + Math.round(ctx.raw).toLocaleString('es-AR') } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: tc, font: { size: 11 } } },
        y: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 }, callback: v => '$' + Math.round(v / 1000) + 'k' } },
      },
    },
  });
}

function drawRentComparar() {
  if (!RENT_PRODS.length) return;
  const { tc, gc } = getChartDefaults();
  const sorted = [...RENT_PRODS].sort((a, b) => (rentGanancia(b) * b.unidades) - (rentGanancia(a) * a.unidades));

  let tbl = '';
  sorted.forEach(p => {
    const gan    = rentGanancia(p);
    const ganMes = gan * p.unidades;
    tbl += `<tr>
      <td style="font-weight:500">${p.nombre}</td>
      <td>${rentMargen(p)}%</td>
      <td>${fmt$(gan)}</td>
      <td style="text-align:center"><strong>${p.unidades}</strong></td>
      <td class="up"><strong>${fmt$(ganMes)}</strong></td>
    </tr>`;
  });
  const tb = document.getElementById('rentCompararTbody');
  if (tb) tb.innerHTML = tbl;

  const top1 = sorted[0], top2 = sorted[1];
  const recT = document.getElementById('rentCompararRecT');
  const recB = document.getElementById('rentCompararRecB');
  if (top1 && recT) recT.textContent = `${top1.nombre} — el producto que mas ganancia genero`;
  if (top1 && recB) recB.textContent = `Con ${top1.unidades} colocaciones en Abril y ${fmt$(rentGanancia(top1))} de ganancia estimada por unidad, ${top1.nombre} genero ${fmt$(rentGanancia(top1) * top1.unidades)} en el mes.${top2 ? ' El segundo lugar es ' + top2.nombre + ' con ' + fmt$(rentGanancia(top2) * top2.unidades) + '.' : ''}`;

  if (charts.comparar) return;
  charts.comparar = new Chart(document.getElementById('cComparar'), {
    type: 'bar',
    data: {
      labels: sorted.map(p => p.short),
      datasets: [{ label: 'Ganancia del mes (est.)', data: sorted.map(p => rentGanancia(p) * p.unidades), backgroundColor: '#1D9E75', borderRadius: 4, borderSkipped: false }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '$' + Math.round(ctx.raw).toLocaleString('es-AR') } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: tc, font: { size: 11 } } },
        y: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 }, callback: v => '$' + Math.round(v / 1000) + 'k' } },
      },
    },
  });
}

function calcRent() {
  const costo    = +document.getElementById('cCosto').value;
  const precio   = +document.getElementById('cPrecio').value;
  const descCte  = +document.getElementById('cDescuento').value / 100;
  const comML    = +document.getElementById('cML').value / 100;
  const nombre   = document.getElementById('cNombre').value || 'Producto';
  if (!costo || !precio) return;

  const ganMostr = precio - costo;
  const ganCte   = Math.round(precio * (1 - descCte)) - costo;
  const ganML    = Math.round(precio * (1 - comML)) - costo;
  const margen   = Math.round((precio - costo) / costo * 100);
  const fmtV     = v => (v >= 0 ? '$' : '-$') + Math.abs(Math.round(v)).toLocaleString('es-AR');
  const col      = v => v >= 0 ? 'var(--text-success)' : 'var(--text-danger)';

  document.getElementById('calcResult').innerHTML = `
    <div style="font-size:13px;font-weight:600;margin-bottom:12px">${nombre}</div>
    <div style="margin-bottom:12px">
      <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px">Margen sobre costo</div>
      <div style="font-size:28px;font-weight:700;color:var(--text-success)">${margen}%</div>
    </div>
    <div class="roi-row"><span>Ganancia mostrador</span><span style="font-weight:600;color:${col(ganMostr)}">${fmtV(ganMostr)}</span></div>
    <div class="roi-row"><span>Ganancia cta. corriente (-${Math.round(descCte * 100)}%)</span><span style="font-weight:600;color:${col(ganCte)}">${fmtV(ganCte)}</span></div>
    <div class="roi-row"><span>Ganancia Mercado Libre (-${Math.round(comML * 100)}%)</span><span style="font-weight:600;color:${col(ganML)}">${fmtV(ganML)}</span></div>
    <div class="roi-row" style="border-top:0.5px solid var(--border);padding-top:10px;margin-top:4px"><span>ML vs mostrador</span><span style="font-weight:600;color:${col(ganML - ganMostr)}">${fmtV(ganML - ganMostr)}</span></div>
  `;
}
