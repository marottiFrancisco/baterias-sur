let currentRole = null;

const ADMIN_VENTAS_TABS = ['ventas','garantias','clientes','logistica','afip'];

// ── Login / logout ────────────────────────────────────────────────
function doLogin() {
  const u    = (document.getElementById('loginUser').value || '').toLowerCase().trim();
  const p    = document.getElementById('loginPass').value || '';
  const user = USERS[u];
  if (!user || user.pass !== p) {
    document.getElementById('loginErr').textContent = 'Usuario o contraseña incorrectos';
    return;
  }
  document.getElementById('loginErr').textContent = '';
  const sess = { user: u, role: user.role, nombre: user.nombre };
  saveSession(sess);
  applySession(sess);
}

function logout() {
  clearSession();
  currentRole = null;
  document.querySelectorAll('#adminDash .ntab').forEach(btn => btn.style.display = '');
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminDash').style.display   = 'none';
  document.getElementById('mecDash').style.display     = 'none';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginErr').textContent = '';
}

function applySession(sess) {
  currentRole = sess.role;
  document.getElementById('loginScreen').style.display = 'none';
  if (sess.role === 'admin') {
    document.getElementById('adminDash').style.display = 'block';
    document.getElementById('mecDash').style.display   = 'none';
    document.getElementById('topUser').textContent = sess.nombre;
    initAdminDash();
  } else if (sess.role === 'admin_ventas') {
    document.getElementById('adminDash').style.display = 'block';
    document.getElementById('mecDash').style.display   = 'none';
    document.getElementById('topUser').textContent = sess.nombre;
    initAdminVentas();
  } else {
    document.getElementById('adminDash').style.display = 'none';
    document.getElementById('mecDash').style.display   = 'block';
    initMecDash(sess);
  }
}

// ── Admin completo ────────────────────────────────────────────────
function initAdminDash() {
  document.querySelectorAll('#adminDash .ntab').forEach(btn => btn.style.display = '');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#adminDash .ntab').forEach(b => b.classList.remove('active'));
  document.getElementById('p-resumen').classList.add('active');
  const resBtn = document.querySelector('#adminDash .ntab[onclick*="resumen"]');
  if (resBtn) resBtn.classList.add('active');

  const _h = new Date();
  const fechaEl = document.getElementById('fechaHoy');
  if (fechaEl) fechaEl.textContent = `${dias[_h.getDay()]} ${_h.getDate()} de ${meses[_h.getMonth()]} ${_h.getFullYear()}`;

  applyRoleRestrictions();
  renderCotizaciones();
  initDemoData();
  renderStock('Willard');
  updatePendingBadge();
  renderLoans();
  setTimeout(drawVentas, 100);
  setTimeout(() => { initCaja(''); initReportes(); initProveedores(); initRent(); }, 200);
}

// ── Admin ventas (rol restringido) ────────────────────────────────
function initAdminVentas() {
  document.querySelectorAll('#adminDash .ntab').forEach(btn => btn.style.display = '');
  document.querySelectorAll('#adminDash .ntab').forEach(btn => {
    const m = (btn.getAttribute('onclick') || '').match(/show\('(\w+)'/);
    if (!m || !ADMIN_VENTAS_TABS.includes(m[1])) btn.style.display = 'none';
  });

  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#adminDash .ntab').forEach(b => b.classList.remove('active'));
  document.getElementById('p-ventas').classList.add('active');
  const ventasBtn = document.querySelector('#adminDash .ntab[onclick*="ventas"]');
  if (ventasBtn) ventasBtn.classList.add('active');

  const _h = new Date();
  const fechaEl = document.getElementById('fechaHoy');
  if (fechaEl) fechaEl.textContent = `${dias[_h.getDay()]} ${_h.getDate()} de ${meses[_h.getMonth()]} ${_h.getFullYear()}`;

  applyRoleRestrictions();
  updatePendingBadge();
  renderVentas();
  renderLoans();
}

function applyRoleRestrictions() {
  const isFullAdmin = currentRole === 'admin';
  document.querySelectorAll('.admin-only-vis').forEach(el => {
    el.style.display = isFullAdmin ? '' : 'none';
  });
}
