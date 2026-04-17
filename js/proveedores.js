// ── Comparador de cotizaciones ────────────────────────────────────
let cotizaciones = [
  { producto: 'Bat. 12V 75Ah', proveedor: 'DistribaBat', precio: 28200, plazo: '3-5 dias',  condicion: '30 dias' },
  { producto: 'Bat. 12V 75Ah', proveedor: 'BaterPro',    precio: 27500, plazo: '5-7 dias',  condicion: '15 dias' },
  { producto: 'Bat. 12V 75Ah', proveedor: 'GelPower',    precio: 29000, plazo: '10 dias',   condicion: 'Contado' },
  { producto: 'Bat. 12V 65Ah', proveedor: 'DistribaBat', precio: 22400, plazo: '3-5 dias',  condicion: '30 dias' },
  { producto: 'Bat. 12V 65Ah', proveedor: 'BaterPro',    precio: 21800, plazo: '5-7 dias',  condicion: '15 dias' },
];

function renderCotizaciones() {
  const productos = [...new Set(cotizaciones.map(c => c.producto))];
  let html = '';

  productos.forEach(prod => {
    const filas     = cotizaciones.filter(c => c.producto === prod);
    const minPrecio = Math.min(...filas.map(f => f.precio));
    const winner    = filas.find(f => f.precio === minPrecio);

    html += `<div style="margin-bottom:18px">
      <div class="winner-badge">
        <span style="font-size:18px">★</span>
        <div>
          <div style="font-size:13px;font-weight:600">${prod} — Mejor opcion: ${winner.proveedor}</div>
          <div style="font-size:12px;color:#3b6d11">Precio mas bajo: $${minPrecio.toLocaleString('es-AR')} · ${winner.condicion} · ${winner.plazo}</div>
        </div>
      </div>
      <table>
        <tr><th>Proveedor</th><th>Precio unit.</th><th>Plazo entrega</th><th>Condicion pago</th><th>vs mejor</th></tr>`;

    filas.sort((a, b) => a.precio - b.precio).forEach(f => {
      const diff   = f.precio - minPrecio;
      const isBest = diff === 0;
      html += `<tr>
        <td style="font-weight:${isBest ? '600' : '400'}">${f.proveedor}${isBest ? ' ★' : ''}</td>
        <td style="color:${isBest ? 'var(--text-success)' : 'var(--text-danger)'}">$${f.precio.toLocaleString('es-AR')}</td>
        <td>${f.plazo}</td>
        <td>${f.condicion}</td>
        <td style="color:${isBest ? 'var(--text-success)' : 'var(--text-danger)'}">${isBest ? '—' : '+$' + diff.toLocaleString('es-AR')}</td>
      </tr>`;
    });
    html += `</table></div>`;
  });

  document.getElementById('comparadorResult').innerHTML = html;
}

function agregarCotizacion() {
  const p      = document.getElementById('prodNombre').value.trim();
  const pr     = document.getElementById('provNombre').value.trim();
  const precio = parseFloat(document.getElementById('precio').value);
  const plazo  = document.getElementById('plazo').value.trim() || 'A convenir';
  const cond   = document.getElementById('cond').value.trim()  || 'A convenir';

  if (!p || !pr || isNaN(precio)) { alert('Completa al menos: Producto, Proveedor y Precio.'); return; }
  cotizaciones.push({ producto: p, proveedor: pr, precio, plazo, condicion: cond });
  ['prodNombre','provNombre','precio','plazo','cond'].forEach(id => { document.getElementById(id).value = ''; });
  renderCotizaciones();
}

function loadFile(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('fileName').textContent      = file.name;
  document.getElementById('dropMsg').style.display     = 'none';
  document.getElementById('dropDone').style.display    = 'block';
  document.getElementById('dropZone').classList.add('has-data');

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb   = XLSX.read(e.target.result, { type: 'binary' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      let added  = 0;

      rows.forEach(row => {
        const get = aliases => {
          for (const a of aliases) {
            const k = Object.keys(row).find(k2 => k2.toLowerCase().includes(a));
            if (k) return row[k];
          }
          return '';
        };
        const prod   = get(['producto','product','descripcion','item','articulo']);
        const prov   = get(['proveedor','supplier','empresa','vendedor']);
        const precio = parseFloat(String(get(['precio','price','costo','cost','unit'])).replace(/[^\d.]/g, ''));
        const plazo  = get(['plazo','entrega','dias','lead']);
        const cond   = get(['condicion','pago','payment','termino']);
        if (prod && prov && !isNaN(precio) && precio > 0) {
          cotizaciones.push({ producto: String(prod), proveedor: String(prov), precio, plazo: plazo || 'A convenir', condicion: cond || 'A convenir' });
          added++;
        }
      });

      if (added === 0) {
        document.getElementById('comparadorResult').innerHTML = '<div style="padding:12px;color:var(--text-danger);font-size:13px">No se encontraron datos validos. El Excel debe tener columnas: Producto, Proveedor, Precio.</div>';
        return;
      }
      renderCotizaciones();
    } catch {
      document.getElementById('comparadorResult').innerHTML = '<div style="padding:12px;color:var(--text-danger);font-size:13px">Error al leer el archivo. Verificar formato.</div>';
    }
  };
  reader.readAsBinaryString(file);
}

// ── Panel de proveedores ──────────────────────────────────────────
function initProveedores() {
  const batsSold    = DB.filter(r => r[4] === 'Bat' && r[5]);
  const allStockRows = Object.values(STOCK_DB).flat();

  const byModelo = {};
  batsSold.forEach(r => {
    const m = r[5].trim();
    if (!byModelo[m]) byModelo[m] = { count: 0, total: 0 };
    byModelo[m].count++;
    byModelo[m].total += r[7];
  });
  const modeloList = Object.entries(byModelo).sort((a, b) => b[1].count - a[1].count).slice(0, 15);

  const totalMod = allStockRows.length;
  const reponer  = allStockRows.filter(([, ini, v]) => (ini - v) <= 2).length;
  const batMes   = batsSold.length;

  const el = id => document.getElementById(id);
  if (el('provTotalMod')) el('provTotalMod').textContent = totalMod;
  if (el('provReponer'))  el('provReponer').textContent  = reponer;
  if (el('provBatMes'))   el('provBatMes').textContent   = batMes;

  let html = '';
  modeloList.forEach(([m, d]) => {
    const stockRow = allStockRows.find(([mod]) => {
      const a = mod.toLowerCase(), b = m.toLowerCase();
      return a === b || b.includes(a) || a.includes(b);
    });
    const stockAct    = stockRow ? stockRow[1] - stockRow[2] : null;
    const stockBadge  = stockAct === null ? '<span class="badge bgr">—</span>'
      : stockAct === 0 ? '<span class="badge br">Sin stock</span>'
      : stockAct <= 1  ? '<span class="badge ba">Critico</span>'
      : stockAct <= 3  ? '<span class="badge ba">Bajo</span>'
      : '<span class="badge bg">Normal</span>';
    const accion = stockAct !== null && stockAct <= 2
      ? '<span class="badge br">Reponer urgente</span>'
      : stockAct !== null && stockAct <= 3
      ? '<span class="badge ba">Evaluar reposicion</span>'
      : '<span style="color:var(--text-secondary);font-size:12px">—</span>';
    const precioP = d.count > 0 ? fmt$(d.total / d.count) : '—';
    html += `<tr>
      <td style="font-weight:500">${m}</td>
      <td style="text-align:center"><strong>${d.count}</strong></td>
      <td>${precioP}</td>
      <td>${stockBadge}</td>
      <td>${accion}</td>
    </tr>`;
  });

  if (el('provModTbody')) el('provModTbody').innerHTML = html || '<tr><td colspan="5" style="color:var(--text-secondary)">Sin datos</td></tr>';
}
