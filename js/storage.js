const SESS_KEY  = 'bds_session';
const RECS_KEY  = 'bds_records';
const EDITS_KEY = 'bds_edits';
const LOANS_KEY = 'bds_loans';

// ── Sesion ────────────────────────────────────────────────────────
function getSession()    { try { return JSON.parse(localStorage.getItem(SESS_KEY)); } catch { return null; } }
function saveSession(s)  { localStorage.setItem(SESS_KEY, JSON.stringify(s)); }
function clearSession()  { localStorage.removeItem(SESS_KEY); }

// ── Registros pendientes (mecanico) ──────────────────────────────
function getPendingRecs()    { try { return JSON.parse(localStorage.getItem(RECS_KEY)) || []; } catch { return []; } }
function addPendingRec(rec)  { const a = getPendingRecs(); a.push(rec); localStorage.setItem(RECS_KEY, JSON.stringify(a)); }

// ── Ediciones de filas ────────────────────────────────────────────
function getEdits()              { try { return JSON.parse(localStorage.getItem(EDITS_KEY)) || {}; } catch { return {}; } }
function saveRowEdit(rowId, e)   { const edits = getEdits(); edits[rowId] = e; localStorage.setItem(EDITS_KEY, JSON.stringify(edits)); }

function mergeEdit(base, e) {
  return [
    e.fecha       !== undefined ? e.fecha       : base[0],
    e.expediente  !== undefined ? e.expediente  : base[1],
    e.vehiculo    !== undefined ? e.vehiculo    : base[2],
    e.direccion   !== undefined ? e.direccion   : base[3],
    e.servicio    !== undefined ? e.servicio    : base[4],
    e.modelo      !== undefined ? e.modelo      : base[5],
    e.pago        !== undefined ? e.pago        : base[6],
    e.importe     !== undefined ? parseFloat(e.importe) || 0 : base[7],
    e.mecanico    !== undefined ? e.mecanico    : base[8],
    e.obs         !== undefined ? e.obs         : base[9],
  ];
}

// ── Vista unificada DB + pendientes + ediciones ───────────────────
function getAllDB() {
  const pending = getPendingRecs();
  const edits   = getEdits();

  const staticRows = DB.map((r, i) => {
    const rowId = 'db_' + i;
    const base  = edits[rowId] ? mergeEdit(r, edits[rowId]) : [...r];
    return [...base, false, rowId]; // [10]=nuevo, [11]=rowId
  });

  const pendingRows = pending.map(r => {
    const rowId = 'pend_' + r.id;
    const base  = [r.fecha, r.expediente || '', r.vehiculo, r.direccion || '', r.servicio, r.modelo || '', r.pago || '', r.importe || 0, r.mecanico, r.obs || ''];
    const final = edits[rowId] ? mergeEdit(base, edits[rowId]) : base;
    return [...final, true, rowId];
  });

  return [...staticRows, ...pendingRows];
}

// ── Prestamos de bateria ─────────────────────────────────────────
function getLoans()      { try { return JSON.parse(localStorage.getItem(LOANS_KEY)) || []; } catch { return []; } }
function saveLoans(arr)  { localStorage.setItem(LOANS_KEY, JSON.stringify(arr)); }
