function showLoanForm() {
  const f = document.getElementById('loanFormArea');
  f.style.display = f.style.display === 'none' ? '' : 'none';
  document.getElementById('lFecha').value = new Date().toISOString().split('T')[0];
}

function addLoan() {
  const cliente = (document.getElementById('lCliente').value    || '').trim();
  const bat     = (document.getElementById('lBat').value        || '').trim();
  if (!cliente || !bat) { alert('Cliente y bateria son obligatorios'); return; }

  const loan = {
    id:         Date.now(),
    cliente,
    bateria:    bat,
    fecha:      document.getElementById('lFecha').value,
    devolucion: document.getElementById('lDevolucion').value,
    ref:        (document.getElementById('lRef').value    || '').trim(),
    motivo:     (document.getElementById('lMotivo').value || '').trim(),
    estado:     'prestada',
  };
  const loans = getLoans();
  loans.push(loan);
  saveLoans(loans);

  ['lCliente','lBat','lRef','lMotivo'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('loanFormArea').style.display = 'none';
  renderLoans();
}

function returnLoan(id) {
  const loans = getLoans().map(l =>
    l.id === id ? { ...l, estado: 'devuelta', fechaDevReal: new Date().toISOString().split('T')[0] } : l
  );
  saveLoans(loans);
  renderLoans();
}

function renderLoans() {
  const el = document.getElementById('loanList');
  if (!el) return;

  const loans = getLoans();
  if (!loans.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:13px;padding:14px 0">Sin baterias en prestamo registradas</div>';
    return;
  }

  const activas   = loans.filter(l => l.estado === 'prestada');
  const devueltas = loans.filter(l => l.estado === 'devuelta');
  const today     = new Date().toISOString().split('T')[0];

  let html = '';
  if (activas.length) {
    html += `<div style="overflow-x:auto"><table>
      <tr><th>Cliente</th><th>Bateria prestada</th><th>Fecha prestamo</th><th>Dev. estimada</th><th>Garantia ref.</th><th>Motivo</th><th>Estado</th><th></th></tr>`;
    activas.forEach(l => {
      const vencida     = l.devolucion && l.devolucion < today;
      const estadoBadge = vencida ? '<span class="badge br">Vencida</span>' : '<span class="badge ba">En prestamo</span>';
      html += `<tr>
        <td style="font-weight:500">${l.cliente}</td>
        <td>${l.bateria}</td>
        <td style="font-size:12px;color:var(--text-secondary)">${l.fecha || '—'}</td>
        <td style="font-size:12px;color:${vencida ? 'var(--text-danger)' : 'var(--text-secondary)'};font-weight:${vencida ? '600' : '400'}">${l.devolucion || '—'}</td>
        <td style="font-size:12px;color:var(--text-secondary)">${l.ref    || '—'}</td>
        <td style="font-size:12px;color:var(--text-secondary)">${l.motivo || '—'}</td>
        <td>${estadoBadge}</td>
        <td><button onclick="returnLoan(${l.id})" style="font-size:11px;padding:3px 8px;border-radius:6px;border:0.5px solid var(--border-md);background:var(--bg-secondary);color:var(--text-secondary);cursor:pointer">Devuelta</button></td>
      </tr>`;
    });
    html += '</table></div>';
  }

  if (devueltas.length) {
    html += `<div style="margin-top:14px">
      <div style="font-size:11px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Historial devueltas (${devueltas.length})</div>`;
    devueltas.slice(-5).reverse().forEach(l => {
      html += `<div style="font-size:12px;color:var(--text-secondary);padding:5px 0;border-bottom:0.5px solid var(--border)">${l.cliente} — ${l.bateria} — devuelta ${l.fechaDevReal || '—'} <span class="badge bg" style="font-size:10px">Devuelta</span></div>`;
    });
    html += '</div>';
  }

  el.innerHTML = html;
}
