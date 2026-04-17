// ── Render tabla de ventas ────────────────────────────────────────
function renderVentas() {
  const buscar = (document.getElementById('vFiltBuscar') || {}).value?.toLowerCase() || '';
  const mec    = (document.getElementById('vFiltMec')    || {}).value || '';
  const serv   = (document.getElementById('vFiltServ')   || {}).value || '';
  const fecha  = (document.getElementById('vFiltFecha')  || {}).value || '';

  const allData   = getAllDB();
  const filtrados = allData.filter(r =>
    (!buscar || r[2].toLowerCase().includes(buscar) || r[5].toLowerCase().includes(buscar) || (r[3] || '').toLowerCase().includes(buscar)) &&
    (!mec    || r[8] === mec) &&
    (!serv   || r[4] === serv) &&
    (!fecha  || r[0] === fecha)
  );

  const total    = filtrados.reduce((s, r) => s + r[7], 0);
  const canEdit  = currentRole === 'admin' || currentRole === 'admin_ventas';
  let html = '';

  [...filtrados].reverse().forEach(r => {
    const [f, exp, v, dir, s, mod, p, i, mec2, obs, nuevo, rowId] = r;
    const imp        = i > 0 ? '<strong>$' + i.toLocaleString('es-AR') + '</strong>' : '<span style="color:var(--text-secondary)">—</span>';
    const rowStyle   = nuevo ? 'background:rgba(29,158,117,0.06);border-left:2px solid #1d9e75;' : '';
    const nuevoBadge = nuevo ? ' <span class="badge bg" style="font-size:10px;padding:1px 6px">Nuevo</span>' : '';
    const editBtn    = canEdit
      ? `<button onclick="openEditModal('${rowId}',${JSON.stringify([f, exp, v, dir, s, mod, p, i, mec2, obs]).replace(/'/g, "&#39;")})" style="font-size:11px;padding:3px 8px;border-radius:6px;border:0.5px solid var(--border-md);background:var(--bg-secondary);color:var(--text-secondary);cursor:pointer;white-space:nowrap">Editar</button>`
      : '';
    html += `<tr style="${rowStyle}">
      <td style="color:var(--text-secondary);white-space:nowrap">${f}${nuevoBadge}</td>
      <td style="font-size:11px;color:var(--text-secondary);white-space:nowrap">${exp || '—'}</td>
      <td style="font-weight:500">${v || '—'}</td>
      <td style="font-size:12px;color:var(--text-secondary);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${dir || ''}">${dir || '—'}</td>
      <td>${servBadge(s)}</td>
      <td style="font-size:12px;color:var(--text-secondary)">${mod || '—'}</td>
      <td>${imp}</td>
      <td><span class="badge ${mecColor(mec2)}">${mec2}</span></td>
      <td>${pagoBadge(p)}</td>
      <td style="font-size:11px;color:var(--text-secondary);max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${obs || ''}">${obs || ''}</td>
      <td>${editBtn}</td>
    </tr>`;
  });

  const tbody   = document.getElementById('ventasTbody');
  if (tbody) tbody.innerHTML = html;

  const countEl = document.getElementById('ventasCount');
  if (countEl) countEl.textContent = filtrados.length + ' registros' + (filtrados.length < allData.length ? ' (filtrados de ' + allData.length + ')' : '');

  const totalEl = document.getElementById('ventasTotal');
  if (totalEl) totalEl.textContent = '$' + total.toLocaleString('es-AR');
}

// ── KPIs resumen ─────────────────────────────────────────────────
function initDemoData() {
  const allData    = getAllDB();
  const totalPeriodo = allData.reduce((s, r) => s + r[7], 0);
  const bats       = allData.filter(r => r[4] === 'Bat');
  const pms        = allData.filter(r => r[4] === 'PM');
  const ticketBats = bats.filter(r => r[7] > 0);
  const ticket     = ticketBats.length ? Math.round(ticketBats.reduce((s, r) => s + r[7], 0) / ticketBats.length) : 0;

  const byMec = {};
  allData.forEach(r => { byMec[r[8]] = (byMec[r[8]] || 0) + r[7]; });
  const leader = Object.entries(byMec).filter(([m]) => m).sort((a, b) => b[1] - a[1])[0];

  const el = id => document.getElementById(id);
  if (el('kpiPeriodo'))  el('kpiPeriodo').textContent  = '$' + totalPeriodo.toLocaleString('es-AR');
  if (el('kpiBat'))      el('kpiBat').textContent      = bats.length;
  if (el('kpiPM'))       el('kpiPM').textContent       = pms.length;
  if (el('kpiLider'))    el('kpiLider').textContent    = leader[0];
  if (el('kpiLiderSub')) el('kpiLiderSub').textContent = '$' + leader[1].toLocaleString('es-AR') + ' periodo';
  if (el('kpiTicket'))   el('kpiTicket').textContent   = '$' + ticket.toLocaleString('es-AR');
}

// ── Modal de edicion ─────────────────────────────────────────────
function openEditModal(rowId, data) {
  const [f, exp, v, dir, s, mod, p, i, mec2, obs] = data;
  document.getElementById('editRowId').value = rowId;
  document.getElementById('editFecha').value = f || '';
  document.getElementById('editExp').value   = exp || '';
  document.getElementById('editVeh').value   = v || '';
  document.getElementById('editDir').value   = dir || '';
  document.getElementById('editServ').value  = s || 'Bat';
  document.getElementById('editMod').value   = mod || '';
  document.getElementById('editPago').value  = p || '';
  document.getElementById('editImp').value   = i || 0;
  document.getElementById('editMec').value   = mec2 || 'Cristian';
  document.getElementById('editObs').value   = obs || '';

  const isParticular = exp === 'Particular' || exp === 'No aplica';
  document.getElementById('editExpCheck').checked = isParticular;
  if (isParticular) {
    document.getElementById('editExp').disabled    = true;
    document.getElementById('editExp').style.opacity = '0.5';
  }
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  document.getElementById('editExpCheck').checked    = false;
  document.getElementById('editExp').disabled        = false;
  document.getElementById('editExp').style.opacity   = '';
}

function saveEditModal() {
  const rowId = document.getElementById('editRowId').value;
  const e = {
    fecha:      document.getElementById('editFecha').value.trim(),
    expediente: document.getElementById('editExp').value.trim(),
    vehiculo:   document.getElementById('editVeh').value.trim(),
    direccion:  document.getElementById('editDir').value.trim(),
    servicio:   document.getElementById('editServ').value,
    modelo:     document.getElementById('editMod').value.trim(),
    pago:       document.getElementById('editPago').value,
    importe:    parseFloat(document.getElementById('editImp').value) || 0,
    mecanico:   document.getElementById('editMec').value,
    obs:        document.getElementById('editObs').value.trim(),
  };
  saveRowEdit(rowId, e);
  closeEditModal();
  renderVentas();
}

function editExpCheck() {
  const cb  = document.getElementById('editExpCheck');
  const inp = document.getElementById('editExp');
  if (cb.checked) { inp.value = 'Particular'; inp.disabled = true;  inp.style.opacity = '0.5'; }
  else            { inp.value = '';           inp.disabled = false; inp.style.opacity = '';    }
}
