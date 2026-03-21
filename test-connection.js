/* DB connection indicator — desktop only, read-only */
(async function checkConnection() {
  if (window.innerWidth <= 768) return; // skip on mobile
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'fixed', bottom: '20px', right: '20px',
    padding: '6px 10px', borderRadius: '8px',
    fontFamily: 'sans-serif', fontSize: '11px', fontWeight: '700',
    zIndex: '999999', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    background: '#333', color: '#fff', pointerEvents: 'none'
  });
  el.textContent = 'DB…';
  document.body.appendChild(el);

  try {
    if (typeof _sb === 'undefined') throw new Error('No client');
    // Read-only ping — fetch one row, no inserts
    const { error } = await _sb.from('profiles').select('id').limit(1);
    if (error) throw error;
    el.textContent = 'DB ✅';
    el.style.background = '#111F15';
    el.style.color = '#B4FF00';
    el.style.border = '1px solid #4D7A58';
  } catch (e) {
    el.textContent = 'DB ❌';
    el.style.background = '#1F0A0A';
    el.style.color = '#FF4D4D';
    el.style.border = '1px solid #FF4D4D';
    console.warn('DB check failed:', e.message);
  }

  // Auto-hide after 4s
  setTimeout(() => el.remove(), 4000);
})();
