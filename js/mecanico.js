function initMecDash(sess) {
  const h      = new Date();
  const diaStr = dias[h.getDay()] + ' ' + h.getDate() + ' de ' + meses[h.getMonth()];
  document.getElementById('mecSubtitle').textContent = 'Hola, ' + sess.nombre + ' · ' + diaStr;
  mecServChange();
  renderMecToday(sess.nombre);
}

function mecServChange() {
  const s = document.getElementById('mServ').value;
  document.getElementById('mModeloField').style.display = s === 'Bat' ? '' : 'none';
}

function mecSubmit() {
  const sess = getSession();
  if (!sess) return;
  const veh = (document.getElementById('mVeh').value || '').trim();
  if (!veh) { document.getElementById('mVeh').focus(); return; }

  const h     = new Date();
  const fecha = String(h.getDate()).padStart(2, '0') + '/' + String(h.getMonth() + 1).padStart(2, '0');
  const rec   = {
    id:          Date.now(),
    timestamp:   h.toISOString(),
    fecha,
    expediente:  (document.getElementById('mExp').value  || '').trim(),
    vehiculo:    veh,
    direccion:   (document.getElementById('mDir').value  || '').trim(),
    servicio:    document.getElementById('mServ').value,
    modelo:      (document.getElementById('mMod').value  || '').trim(),
    pago:        document.getElementById('mPago').value,
    importe:     parseFloat(document.getElementById('mImp').value) || 0,
    mecanico:    sess.nombre,
    obs:         (document.getElementById('mObs').value  || '').trim(),
    nuevo:       true,
  };
  addPendingRec(rec);

  ['mExp','mVeh','mDir','mMod','mObs'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('mImp').value  = '0';
  document.getElementById('mPago').value = '';

  const ok = document.getElementById('mecOk');
  ok.style.display = 'block';
  setTimeout(() => { ok.style.display = 'none'; }, 2500);
  renderMecToday(sess.nombre);
}

function renderMecToday(mecNombre) {
  const h     = new Date();
  const fecha = String(h.getDate()).padStart(2, '0') + '/' + String(h.getMonth() + 1).padStart(2, '0');
  const list  = getPendingRecs().filter(r => r.mecanico === mecNombre && r.fecha === fecha);
  const el    = document.getElementById('mecTodayList');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:13px;padding:16px 0">Sin registros aun</div>';
    return;
  }
  el.innerHTML = [...list].reverse().map(r => `
    <div style="padding:10px 0;border-top:0.5px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:13px;font-weight:600">${r.vehiculo} · <span style="font-weight:400">${r.servicio === 'Bat' && r.modelo ? r.modelo : r.servicio}</span></div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">${r.direccion || '—'} · ${r.pago || 'Sin cobro'}</div>
        ${r.obs ? `<div style="font-size:11px;color:var(--text-secondary)">${r.obs}</div>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:10px">
        <div style="font-size:14px;font-weight:600;color:var(--text-success)">${r.importe > 0 ? fmt$(r.importe) : '—'}</div>
        <div style="font-size:10px;color:var(--text-secondary)">${new Date(r.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  `).join('');
}

function updatePendingBadge() {
  const n        = getPendingRecs().filter(r => r.nuevo).length;
  const ventasTab = document.querySelector('#adminDash .ntab[onclick*="ventas"]');
  if (!ventasTab) return;
  if (n > 0) {
    ventasTab.innerHTML = `Ventas <span style="background:#e24b4a;color:white;border-radius:999px;padding:1px 6px;font-size:10px;margin-left:2px;font-weight:700">${n}</span>`;
  } else {
    ventasTab.textContent = 'Ventas';
  }
}

function mecExpCheck() {
  const cb  = document.getElementById('mExpCheck');
  const inp = document.getElementById('mExp');
  if (cb.checked) { inp.value = 'Particular'; inp.disabled = true;  inp.style.opacity = '0.5'; }
  else            { inp.value = '';           inp.disabled = false; inp.style.opacity = '';    }
}
