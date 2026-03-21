/* ── SweepX UI Layer ── */

/* SVG Icons */
const IC = {
  coin: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><text x="12" y="16.5" text-anchor="middle" fill="#0D0D0D" font-size="9" font-weight="800" font-family="Syne,sans-serif">P</text></svg>`,
  cog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  ok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  img: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  clk: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  usr: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="#22FF88" stroke-width="2" stroke-linecap="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.34L2 22"/><path d="M17 8c1 2.5.5 6-2 9"/><path d="M17 8c0 0 4-2 4-6-4 0-8 2.5-8 8"/></svg>`,
  trphy: `<svg viewBox="0 0 24 24" fill="none" stroke="#22FF88" stroke-width="2" stroke-linecap="round"><path d="M6 9H4a2 2 0 000 4h2M18 9h2a2 2 0 010 4h-2M6 9V5h12v4M6 9c0 5.523 2.686 8 6 8s6-2.477 6-8M9 21h6M12 17v4"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  sliders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="16" y2="18"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  arrowUR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
};

/* ─── Toast System ─── */
let _toastTimer = null;
function showToast(title, subtitle, type) {
  let el = document.getElementById('sx-toast');
  if (el) el.remove();
  clearTimeout(_toastTimer);
  const colors = { success: '#22FF88', error: '#FF4D4D', info: '#4D8EFF' };
  const icons = { success: IC.ok, error: IC.x, info: IC.info };
  el = document.createElement('div');
  el.id = 'sx-toast';
  el.className = 'sx-toast sx-toast-enter';
  el.innerHTML = `<div class="sx-toast-bar" style="background:${colors[type] || colors.info}"></div>
    <div class="sx-toast-icon" style="color:${colors[type] || colors.info}">${icons[type] || icons.info}</div>
    <div class="sx-toast-body"><div class="sx-toast-title">${title}</div>${subtitle ? `<div class="sx-toast-sub">${subtitle}</div>` : ''}</div>`;
  el.onclick = () => dismissToast();
  document.getElementById('phone-frame').appendChild(el);
  requestAnimationFrame(() => { requestAnimationFrame(() => { el.classList.remove('sx-toast-enter'); el.classList.add('sx-toast-visible'); }); });
  const dur = type === 'error' ? 4500 : 3000;
  _toastTimer = setTimeout(() => dismissToast(), dur);
}
function dismissToast() {
  const el = document.getElementById('sx-toast');
  if (!el) return;
  el.classList.remove('sx-toast-visible');
  el.classList.add('sx-toast-exit');
  setTimeout(() => el.remove(), 200);
  clearTimeout(_toastTimer);
}

/* ─── Skeleton Helpers ─── */
function skeletonMissionRow() {
  return `<div class="skel-mission-row">
    <div class="skel-thumb skel-shimmer"></div>
    <div style="flex:1;display:flex;flex-direction:column;gap:6px">
      <div class="skel-line" style="width:65%;height:12px"></div>
      <div class="skel-line" style="width:40%;height:10px"></div>
    </div>
    <div class="skel-pill"></div>
  </div>`;
}
function skeletonLBRow() {
  return `<div class="lb-row skel-lb-row">
    <div class="skel-circle"></div>
    <div style="flex:1;display:flex;flex-direction:column;gap:4px">
      <div class="skel-line" style="width:45%;height:12px"></div>
      <div class="skel-line" style="width:30%;height:10px"></div>
    </div>
  </div>`;
}

/* ─── Routing ─── */
let _reportImg = null, _reportImgFile = null, _proofImg = null, _proofImgFile = null;
let _reportLat = null, _reportLng = null;

function navigate(screen, data) {
  S.prev = S.screen; S.screen = screen;
  if (data?.id) S.detailId = data.id;
  const scr = document.querySelector('.screen');
  if (scr) scr.scrollTop = 0;
  renderApp();
}

function renderApp() {
  const root = document.getElementById('app-root');
  const nav = document.getElementById('bottom-nav');
  if (!S.user || S.screen === 'auth') {
    nav.classList.add('hidden');
    root.innerHTML = `<div class="screen screen-enter">${authHTML()}</div>`;
    initAuth(); return;
  }
  nav.classList.remove('hidden');
  updateNav(S.screen);
  const html = { home: homeHTML, report: reportHTML, missions: missionsListHTML, 'mission-detail': detailHTML, leaderboard: leaderboardHTML, profile: profileHTML }[S.screen] || homeHTML;
  root.innerHTML = `<div class="screen screen-enter">${html()}</div>`;
  ({ home: initHome, report: initReport, missions: initMissions, 'mission-detail': initDetail, leaderboard: initLB, profile: initProfile }[S.screen] || initHome)();
}

function updateNav(s) {
  document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
  const map = { home: 'nav-home', missions: 'nav-missions', report: 'nav-report', leaderboard: 'nav-leaderboard', profile: 'nav-profile', 'mission-detail': 'nav-missions' };
  if (map[s]) document.getElementById(map[s])?.classList.add('active');
}

/* ─── Shared renderers ─── */
function statusBadge(st) {
  const map = { open: 'b-open', 'in-progress': 'b-ip', pending: 'b-pend', approved: 'b-ok', rejected: 'b-rej' };
  const lbl = { open: 'Open', 'in-progress': 'In Progress', pending: 'Verifying…', approved: 'Approved', rejected: 'Rejected' };
  return `<span class="badge ${map[st] || 'b-open'}">${lbl[st] || st}</span>`;
}

function dashHeader(opts = {}) {
  const u = S.user || {};
  if (opts.back) {
    return `<div class="screen-hd">
      <div class="screen-hd-left">
        <button class="back-btn" onclick="navigate('${opts.backTo || 'home'}')">${IC.back}</button>
        <span class="screen-title">${opts.title || ''}</span>
      </div>
      ${opts.badge ? opts.badge : ''}
    </div>`;
  }
  const av = `<div class="dash-avatar" style="background:${acColor(u.username || 'U')}">${initials(u.username || 'US')}</div>`;
  return `<div class="dash-header">
    <div class="dash-header-left">
      ${av}
      <div class="dash-greeting">
        <span class="dash-greeting-top">Ready to sweep!</span>
        <span class="dash-greeting-name">${u.username || 'Cleaner'}</span>
      </div>
    </div>
    <div class="dash-header-right">
      <button class="dash-icon-btn">${IC.help}</button>
      <button class="dash-icon-btn">${IC.bell}<span class="dash-notif-dot"></span></button>
    </div>
  </div>`;
}

function searchBar() {
  return `<div class="dash-search">
    ${IC.search}
    <input type="text" placeholder="Search missions, locations..." readonly/>
    <button class="dash-search-filter">${IC.sliders}</button>
  </div>`;
}

function statCard(icon, label, valueId, featured) {
  return `<div class="stat-card${featured ? ' featured' : ''}">
    <div class="stat-card-top">
      <div class="stat-card-icon">${icon}</div>
      <button class="stat-card-arrow">${IC.arrowUR}</button>
    </div>
    <div class="stat-card-bottom">
      <div class="stat-card-label">${label}</div>
      <div class="stat-card-value" id="${valueId}">—</div>
    </div>
  </div>`;
}

function statusStrip(cols) {
  return `<div class="status-strip">${cols.map(c => `
    <div class="status-col">
      <div class="status-dot" style="background:${c.color}"></div>
      <span class="status-label">${c.label}</span>
      <span class="status-value">${c.value}</span>
    </div>`).join('')}</div>`;
}

function missionRowHTML(m) {
  const img = m.report?.imageUrl
    ? `<img src="${m.report.imageUrl}" alt=""/>`
    : IC.pin;
  const dist = m.report?.distance || '';
  const meta = [timeAgo(m.createdAt), dist].filter(Boolean).join(' · ');
  return `<div class="mission-row" onclick="navigate('mission-detail',{id:'${m.id}'})">
    <div class="mission-thumb">${img}</div>
    <div class="mission-row-body">
      <div class="mission-row-loc">${m.report?.location || 'Unknown location'}</div>
      <div class="mission-row-meta">${meta}</div>
    </div>
    ${statusBadge(m.status)}
  </div>`;
}

/* ─── Auth Screen ─── */
function authHTML() {
  return `<div class="auth-wrap">
    <div class="auth-logo">Sweep<span class="x">X</span></div>
    <div class="auth-tag">Clean it. Earn it.</div>
    <div class="auth-tabs">
      <button class="auth-tab on" id="tab-login" onclick="switchTab('login')">Login</button>
      <button class="auth-tab" id="tab-signup" onclick="switchTab('signup')">Sign Up</button>
    </div>
    <div id="auth-err" class="auth-err"></div>
    <div class="auth-form" id="auth-form">
      <div class="field-g" id="fg-user" style="display:none">
        <label class="field-lbl">Username</label>
        <div class="field-wrap"><input class="field-in" id="f-user" type="text" placeholder="your_username" autocomplete="username" onblur="vFieldBlur(this,'user')" oninput="vFieldClear(this,'user')"/></div>
        <span class="field-err" id="e-user"></span>
      </div>
      <div class="field-g">
        <label class="field-lbl">Email</label>
        <div class="field-wrap"><input class="field-in" id="f-email" type="email" placeholder="you@email.com" autocomplete="email" onblur="vFieldBlur(this,'email')" oninput="vFieldClear(this,'email')"/></div>
        <span class="field-err" id="e-email"></span>
      </div>
      <div class="field-g">
        <label class="field-lbl">Password</label>
        <div class="field-wrap">
          <input class="field-in" id="f-pass" type="password" placeholder="••••••••" autocomplete="current-password" onblur="vFieldBlur(this,'pass')" oninput="vFieldClear(this,'pass')"/>
          <button class="field-eye" type="button" onclick="toggleEye()" id="eye-btn">${IC.ok}</button>
        </div>
        <span class="field-err" id="e-pass"></span>
      </div>
      <button class="btn btn-g" id="auth-btn" onclick="submitAuth()" disabled>Login</button>
    </div>
  </div>`;
}

let _mode = 'login';
function switchTab(m) {
  _mode = m;
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('on'));
  document.getElementById('tab-' + m).classList.add('on');
  document.getElementById('fg-user').style.display = m === 'signup' ? '' : 'none';
  document.getElementById('auth-btn').textContent = m === 'signup' ? 'Create Account' : 'Login';
  document.getElementById('auth-err').classList.remove('show');
  ['user', 'email', 'pass'].forEach(k => { const e = document.getElementById('e-' + k); if (e) e.textContent = ''; const f = document.getElementById('f-' + k); if (f) { f.classList.remove('err', 'ok'); } });
  checkAuthBtn();
}
function vFieldBlur(el, key) {
  const v = el.value.trim();
  const eEl = document.getElementById('e-' + key);
  let msg = '';
  if (key === 'user' && _mode === 'signup') { if (!v) msg = ''; else msg = V.username(v); }
  if (key === 'email') { if (v && !V.email(v)) msg = 'Enter a valid email address'; }
  if (key === 'pass') { if (_mode === 'signup' && v) msg = V.password(v); }
  eEl.textContent = msg;
  el.classList.toggle('err', !!msg);
  el.classList.toggle('ok', !msg && !!v);
  checkAuthBtn();
}
function vFieldClear(el, key) {
  const eEl = document.getElementById('e-' + key);
  if (eEl.textContent) { eEl.textContent = ''; el.classList.remove('err'); }
  checkAuthBtn();
}
function checkAuthBtn() {
  const email = document.getElementById('f-email')?.value.trim() || '';
  const pass = document.getElementById('f-pass')?.value.trim() || '';
  const user = document.getElementById('f-user')?.value.trim() || '';
  let valid = V.email(email) && pass.length >= 8;
  if (_mode === 'signup') valid = valid && V.username(user) === '' && user.length >= 3;
  if (_mode === 'login') valid = email.includes('@') && pass.length >= 1;
  document.getElementById('auth-btn').disabled = !valid;
}
function toggleEye() {
  const f = document.getElementById('f-pass');
  f.type = f.type === 'password' ? 'text' : 'password';
}
function initAuth() { }

async function submitAuth() {
  const btn = document.getElementById('auth-btn');
  const errEl = document.getElementById('auth-err');
  btn.disabled = true;
  btn.innerHTML = `<span class="spin"></span> ${_mode === 'signup' ? 'Creating account…' : 'Signing in…'}`;
  errEl.classList.remove('show');
  if (_mode === 'signup') {
    const user = document.getElementById('f-user').value.trim();
    const uErr = V.username(user);
    if (uErr) { document.getElementById('e-user').textContent = uErr; document.getElementById('f-user').classList.add('err'); btn.disabled = false; btn.textContent = 'Create Account'; return; }
    const pass = document.getElementById('f-pass').value.trim();
    const pErr = V.password(pass);
    if (pErr) { document.getElementById('e-pass').textContent = pErr; document.getElementById('f-pass').classList.add('err'); btn.disabled = false; btn.textContent = 'Create Account'; return; }
  }
  try {
    if (_mode === 'signup') {
      await Auth.signup(document.getElementById('f-user').value.trim(), document.getElementById('f-email').value.trim(), document.getElementById('f-pass').value.trim());
    } else {
      await Auth.login(document.getElementById('f-email').value.trim(), document.getElementById('f-pass').value.trim());
    }
    navigate('home');
  } catch (e) {
    errEl.textContent = e.message; errEl.classList.add('show');
    btn.disabled = false; btn.textContent = _mode === 'signup' ? 'Create Account' : 'Login';
  }
}

/* ─── Home Screen ─── */
function homeHTML() {
  const u = S.user || {};
  // We'll populate stat card values after data loads
  return `
    ${dashHeader()}
    ${searchBar()}
    <div class="stat-grid" id="stat-grid">
      ${statCard(IC.pin, 'Reports', 'sc-reports', true)}
      ${statCard(IC.checkCircle, 'Missions Done', 'sc-missions', false)}
      ${statCard(IC.users, 'Active Cleaners', 'sc-cleaners', false)}
      ${statCard(IC.star, 'Your Rank', 'sc-rank', false)}
    </div>
    <div id="status-strip-wrap"></div>
    <div class="section-header">
      <span class="section-title">Recent Missions</span>
      <button class="section-see-all" onclick="navigate('missions')">See all</button>
    </div>
    <div class="missions-list" id="missions-feed">
      ${skeletonMissionRow().repeat(3)}
    </div>
    <div class="pb-nav"></div>`;
}

function initHome() {
  const u = S.user || {};
  // Populate stat cards from user data immediately
  el('sc-reports').textContent = u.reportsSubmitted || 0;
  el('sc-missions').textContent = u.missionsCompleted || 0;
  el('sc-rank').textContent = '#' + (getRank() || '—');

  // Load missions to populate remaining stats
  Missions.getAll().then(ms => {
    const openCount = ms.filter(m => m.status === 'open').length;
    const ipCount = ms.filter(m => m.status === 'in-progress').length;
    const doneCount = ms.filter(m => m.status === 'approved').length;
    const cleaners = new Set(ms.filter(m => m.acceptedBy).map(m => m.acceptedBy)).size;

    el('sc-cleaners').textContent = cleaners || S.users.length;

    const stripWrap = document.getElementById('status-strip-wrap');
    if (stripWrap) {
      stripWrap.innerHTML = statusStrip([
        { color: '#22FF88', label: 'Open', value: openCount },
        { color: '#4D8EFF', label: 'In Progress', value: ipCount },
        { color: '#FF8C42', label: 'Completed', value: doneCount },
      ]);
    }

    const feed = document.getElementById('missions-feed');
    if (!feed) return;
    const visible = ms.filter(m => m.status === 'open' || m.status === 'in-progress').slice(0, 6);
    if (visible.length) {
      feed.innerHTML = visible.map(missionRowHTML).join('');
    } else {
      feed.innerHTML = `<div class="empty">${IC.pin}<div class="empty-t">No missions nearby</div><div class="empty-s">Be first — report a garbage location.</div><button class="btn btn-s" style="width:auto;margin-top:8px" onclick="navigate('report')">Report Garbage</button></div>`;
    }
  }).catch(() => {
    const feed = document.getElementById('missions-feed');
    if (feed) feed.innerHTML = `<div class="empty">${IC.x}<div class="empty-t">Something went wrong</div><button class="btn btn-s" style="width:auto;margin-top:8px" onclick="initHome()">Retry</button></div>`;
  });
}

function el(id) { return document.getElementById(id) || { textContent: '' }; }

function getRank() {
  if (!S.user) return null;
  const sorted = [...S.users].sort((a, b) => b.points - a.points);
  const idx = sorted.findIndex(u => u.id === S.user.id);
  return idx >= 0 ? idx + 1 : null;
}

/* ─── Report Screen ─── */
function reportHTML() {
  return `
    ${dashHeader({ back: true, backTo: 'home', title: 'New Report' })}
    <div id="report-content">
      <div class="input-card">
        <div class="input-card-label">Photo</div>
        <div class="upload-zone" id="upload-zone">
          <input type="file" id="img-input" accept="image/jpeg,image/png,image/webp" onchange="handleReportImg(this)"/>
          ${IC.up}<span class="upload-t">Tap to add photo</span><span class="upload-s">JPG, PNG, or WebP — max 10MB</span>
        </div>
        <div id="img-err" class="field-err"></div>
      </div>
      <div class="input-card">
        <div class="input-card-label">Location</div>
        <input class="field-in" id="f-loc" type="text" placeholder="Enter address…" onblur="vLocBlur()" oninput="vLocClear()"/>
        <span class="field-err" id="e-loc"></span>
        <button class="btn btn-s" style="margin-top:10px" onclick="getLocation()" id="loc-btn">${IC.pin} Use My Location</button>
      </div>
      <div class="input-card">
        <div class="input-card-label">Description <span style="color:var(--t3);font-weight:400;text-transform:none">(optional)</span></div>
        <textarea class="textarea-in" id="f-desc" placeholder="Describe the garbage…" maxlength="120" oninput="updateCharCount()"></textarea>
        <span class="char-c" id="desc-count">0 / 120</span>
      </div>
      <div style="padding:0 var(--px)">
        <div id="report-err" class="auth-err"></div>
        <button class="btn btn-g" id="report-btn" onclick="submitReport()" disabled>${IC.trash} Submit Report</button>
      </div>
    </div>
    <div class="pb-nav"></div>`;
}

function updateCharCount() {
  const desc = document.getElementById('f-desc');
  const count = document.getElementById('desc-count');
  if (desc && count) count.textContent = desc.value.length + ' / 120';
}
function vLocBlur() {
  const v = (document.getElementById('f-loc')?.value || '').trim();
  const eEl = document.getElementById('e-loc');
  if (v && v.length < 5) eEl.textContent = 'Please enter or capture a location';
  else eEl.textContent = '';
  checkReportBtn();
}
function vLocClear() { document.getElementById('e-loc').textContent = ''; checkReportBtn(); }
function validateImageFile(file) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) return 'Please upload a JPG, PNG, or WebP image';
  if (file.size > 10 * 1024 * 1024) return 'Image must be under 10MB';
  return '';
}
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
function handleReportImg(inp) {
  const f = inp.files[0]; if (!f) return;
  const errEl = document.getElementById('img-err');
  const vErr = validateImageFile(f);
  if (vErr) { errEl.textContent = vErr; _reportImg = null; _reportImgFile = null; checkReportBtn(); return; }
  errEl.textContent = '';
  _reportImgFile = f;
  const r = new FileReader();
  r.onload = e => {
    _reportImg = e.target.result;
    const zone = document.getElementById('upload-zone');
    zone.innerHTML = `<input type="file" id="img-input" accept="image/jpeg,image/png,image/webp" onchange="handleReportImg(this)"/>
      <img class="upload-prev" src="${_reportImg}" alt=""/>
      <span class="upload-badge">Tap to change</span>`;
    checkReportBtn();
  };
  r.readAsDataURL(f);
}
async function getLocation() {
  const btn = document.getElementById('loc-btn');
  const errEl = document.getElementById('e-loc');
  btn.disabled = true; btn.innerHTML = `<span class="spin spin-w"></span> Getting location…`;
  errEl.textContent = '';
  if (!navigator.geolocation) {
    errEl.textContent = 'Location not supported. Enter your address manually.';
    btn.innerHTML = `${IC.pin} Use My Location`; btn.disabled = false; return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      _reportLat = lat; _reportLng = lng;
      const addr = reverseGeocode(lat, lng);
      const locIn = document.getElementById('f-loc');
      locIn.value = addr; locIn.classList.add('ok');
      btn.innerHTML = `${IC.ok} <span style="color:var(--accent)">Location captured ✓</span>`;
      btn.disabled = true; errEl.textContent = '';
      checkReportBtn();
    },
    err => {
      if (err.code === 1) errEl.textContent = 'Location access was denied. Enter your address manually.';
      else if (err.code === 3) errEl.textContent = 'Location took too long. Please enter manually.';
      else errEl.textContent = 'Could not get location. Please enter manually.';
      btn.innerHTML = `${IC.pin} Use My Location`; btn.disabled = false;
    },
    { timeout: 10000, maximumAge: 60000 }
  );
}
function checkReportBtn() {
  const hasImg = !!_reportImg, hasLoc = (document.getElementById('f-loc')?.value || '').trim().length >= 5;
  document.getElementById('report-btn').disabled = !(hasImg && hasLoc);
}
function initReport() { _reportImg = null; _reportImgFile = null; _reportLat = null; _reportLng = null; }

async function submitReport() {
  const btn = document.getElementById('report-btn'), errEl = document.getElementById('report-err');
  if (!_reportImg) { document.getElementById('img-err').textContent = 'Please add a photo of the garbage'; return; }
  const loc = document.getElementById('f-loc').value.trim();
  if (!loc || loc.length < 5) { document.getElementById('e-loc').textContent = 'Please enter or capture a location'; return; }
  btn.disabled = true; btn.innerHTML = `<span class="spin"></span> Submitting…`;
  errEl.classList.remove('show');
  const progWrap = document.createElement('div');
  progWrap.style.cssText = 'width:100%;height:2px;background:#1A1A1A;border-radius:1px;margin-top:8px;overflow:hidden';
  const progBar = document.createElement('div');
  progBar.style.cssText = 'width:0%;height:100%;background:var(--accent);border-radius:1px;transition:width 50ms linear';
  progWrap.appendChild(progBar);
  btn.parentNode.insertBefore(progWrap, btn.nextSibling);
  let prog = 0;
  const progInterval = setInterval(() => { prog += Math.random() * 8 + 2; if (prog > 90) prog = 90; progBar.style.width = prog + '%'; }, 100);
  try {
    const desc = document.getElementById('f-desc')?.value || '';
    await Reports.create(_reportImg, loc, desc, _reportLat, _reportLng);
    clearInterval(progInterval); progBar.style.width = '100%';
    _reportImg = null; _reportImgFile = null;
    setTimeout(() => {
      document.getElementById('report-content').innerHTML = `<div class="success-card">
        <div class="success-ring">${IC.ok}</div>
        <div class="success-t">Report Submitted!</div>
        <div style="color:var(--accent);font-weight:700;font-family:'DM Mono',monospace;font-size:20px">+50 pts</div>
        <div class="success-s">Your report is now a mission for the community.</div>
      </div>`;
      setTimeout(() => navigate('home'), 1800);
    }, 300);
  } catch (e) {
    clearInterval(progInterval); progWrap.remove();
    errEl.textContent = e.message || 'Something went wrong. Please try again.'; errEl.classList.add('show');
    btn.disabled = false; btn.innerHTML = `${IC.trash} Submit Report`;
    checkReportBtn();
  }
}

/* ─── Missions List Screen ─── */
function missionsListHTML() {
  return `
    <div class="screen-topbar">
      <span class="screen-topbar-title">Missions</span>
    </div>
    <div class="filter-row">
      <div class="chip on" data-f="all" onclick="filterMissions(this,'all')">All</div>
      <div class="chip" data-f="open" onclick="filterMissions(this,'open')">Open</div>
      <div class="chip" data-f="in-progress" onclick="filterMissions(this,'in-progress')">In Progress</div>
      <div class="chip" data-f="approved" onclick="filterMissions(this,'approved')">Approved</div>
      <div class="chip" data-f="rejected" onclick="filterMissions(this,'rejected')">Rejected</div>
    </div>
    <div class="missions-list" id="m-list">${skeletonMissionRow().repeat(3)}</div>
    <div class="pb-nav"></div>`;
}

let _allMissions = [];
function filterMissions(elBtn, f) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); elBtn.classList.add('on');
  const filtered = f === 'all' ? _allMissions : _allMissions.filter(m => m.status === f);
  renderMList(filtered);
}
function renderMList(ms) {
  const elList = document.getElementById('m-list'); if (!elList) return;
  elList.innerHTML = ms.length ? ms.map(missionRowHTML).join('') : `<div class="empty">${IC.clk}<div class="empty-t">No missions here</div><div class="empty-s">Try a different filter.</div></div>`;
}
function initMissions() {
  Missions.getAll().then(ms => { _allMissions = ms; renderMList(ms); }).catch(() => {
    const elList = document.getElementById('m-list'); if (!elList) return;
    elList.innerHTML = `<div class="empty">${IC.x}<div class="empty-t">Something went wrong</div><button class="btn btn-s" style="width:auto;margin-top:8px" onclick="initMissions()">Retry</button></div>`;
  });
}

/* ─── Mission Detail Screen ─── */
function detailHTML() {
  return `
    ${dashHeader({ back: true, backTo: S.prev || 'missions', title: 'Mission Detail' })}
    <div id="detail-body">
      <div class="detail-hero skel-shimmer" style="height:200px"></div>
      <div class="info-card"><div class="skel-line" style="width:70%;height:16px;margin-bottom:10px"></div><div class="skel-line" style="width:50%;height:12px;margin-bottom:10px"></div><div class="skel-line" style="width:100%;height:60px;border-radius:10px"></div></div>
    </div>
    <div class="pb-nav"></div>`;
}

function initDetail() {
  _proofImg = null; _proofImgFile = null;
  if (!S.detailId) { document.getElementById('detail-body').innerHTML = `<div class="empty">${IC.x}<div class="empty-t">Mission not found</div></div>`; return; }
  Missions.getById(S.detailId).then(m => renderDetail(m)).catch(e => {
    document.getElementById('detail-body').innerHTML = `<div class="empty">${IC.x}<div class="empty-t">${e.message || 'Something went wrong'}</div><button class="btn btn-s" style="width:auto;margin-top:8px" onclick="initDetail()">Retry</button></div>`;
  });
}

function renderDetail(m) {
  const body = document.getElementById('detail-body'); if (!body) return;
  const imgEl = m.report?.imageUrl ? `<img src="${m.report.imageUrl}" alt=""/>` : `<div class="detail-ph">${IC.img}<span style="font-size:12px">No image uploaded</span></div>`;
  const isMe = S.user && m.acceptedBy === S.user.id;
  const isMine = S.user && m.report?.createdBy === S.user.id;
  const isOpen = m.status === 'open';
  const canProof = m.status === 'in-progress' && isMe;
  const miniAv = `<div class="info-mini-av" style="background:${acColor(m.creator?.username || 'U')}">${initials(m.creator?.username || 'US')}</div>`;
  let actionHTML = '';
  if (isOpen && !isMine) { actionHTML = `<div class="pts-reward-row">${IC.trphy} +150 pts on completion</div><button class="btn btn-g" id="accept-btn" onclick="acceptMission('${m.id}')">${IC.ok} Accept Mission</button>`; }
  else if (isOpen && isMine) { actionHTML = `<div style="text-align:center;font-size:13px;color:var(--t2);padding:12px 0">Waiting for a volunteer to accept this mission.</div>`; }
  else if (canProof) { actionHTML = proofUploaderHTML(m.id); }
  else if (m.status === 'pending') { actionHTML = `<div class="verify-card"><div class="spin spin-w"></div><div class="verify-t">Verifying cleanup…</div><div style="font-size:12px;color:var(--t2)">Our AI is reviewing your proof image</div></div>`; }
  else if (m.status === 'approved') { actionHTML = `<div class="result-card ok"><div class="result-ico ok">${IC.ok}</div><div class="result-t ok">Cleanup Verified!</div><div class="pts-pop">+150 pts</div><div class="result-s">Great work! Points have been awarded.</div></div>`; }
  else if (m.status === 'rejected') { actionHTML = `<div class="result-card fail"><div class="result-ico fail">${IC.x}</div><div class="result-t fail">Proof Rejected</div><div class="result-s">Try submitting clearer photos.</div></div>`; }
  else if (!isMe && m.status === 'in-progress') { actionHTML = `<div style="text-align:center;font-size:13px;color:var(--t2);padding:12px 0">Being cleaned by ${m.acceptor?.username || 'someone'}.</div>`; }
  body.innerHTML = `
    <div class="detail-hero">${imgEl}</div>
    <div class="info-card">
      <div class="info-card-title">${m.report?.location || 'Unknown location'}</div>
      <div class="info-card-reporter">
        ${miniAv}
        <span class="info-card-reporter-name">${m.creator?.username || 'Anonymous'}</span>
        <span class="info-card-reporter-time">${timeAgo(m.createdAt)}</span>
      </div>
      ${statusBadge(m.status)}
      ${m.report?.description ? `<div class="info-card-desc" style="margin-top:10px">${m.report.description}</div>` : ''}
    </div>
    <div class="action-card" id="proof-area">${actionHTML}</div>`;
}

function proofUploaderHTML(mId) {
  return `<div class="proof-section">
    <div class="pts-reward-row">${IC.trphy} +150 pts reward</div>
    <div class="upload-zone" id="proof-zone">
      <input type="file" id="proof-input" accept="image/jpeg,image/png,image/webp" onchange="handleProofImg(this,'${mId}')"/>
      ${IC.up}<span class="upload-t">Upload proof photo</span><span class="upload-s">Show the cleaned area</span>
    </div>
    <div id="proof-err" class="field-err"></div>
    <button class="btn btn-g" id="proof-btn" onclick="submitProof('${mId}')" disabled>Submit Proof</button>
  </div>`;
}

function handleProofImg(inp, mId) {
  const f = inp.files[0]; if (!f) return;
  const errEl = document.getElementById('proof-err');
  const vErr = validateImageFile(f);
  if (vErr) { errEl.textContent = vErr; _proofImg = null; _proofImgFile = null; return; }
  errEl.textContent = '';
  _proofImgFile = f;
  const r = new FileReader();
  r.onload = e => {
    _proofImg = e.target.result;
    const zone = document.getElementById('proof-zone');
    zone.innerHTML = `<input type="file" id="proof-input" accept="image/jpeg,image/png,image/webp" onchange="handleProofImg(this,'${mId}')"/><img class="upload-prev" src="${_proofImg}" alt=""/><span class="upload-badge">Tap to change</span>`;
    document.getElementById('proof-btn').disabled = false;
  };
  r.readAsDataURL(f);
}

async function acceptMission(mId) {
  const btn = document.getElementById('accept-btn'); if (!btn) return;
  btn.disabled = true; btn.innerHTML = `<span class="spin"></span> Accepting…`;
  try {
    await Missions.accept(mId);
    btn.innerHTML = `<span style="color:var(--accent)">${IC.ok}</span> <span style="color:var(--accent)">Mission Accepted ✓</span>`;
    btn.disabled = true;
    showToast('Mission accepted!', 'Go complete the cleanup.', 'success');
    setTimeout(() => {
      const area = document.getElementById('proof-area');
      if (area) {
        area.innerHTML = proofUploaderHTML(mId);
        area.style.opacity = '0'; area.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => { area.style.transition = 'all 200ms ease'; area.style.opacity = '1'; area.style.transform = 'translateY(0)'; });
      }
    }, 400);
  } catch (e) {
    btn.disabled = false; btn.innerHTML = `${IC.ok} Accept Mission`;
    showToast(e.message || 'Something went wrong. Please try again.', null, 'error');
  }
}

async function submitProof(mId) {
  const btn = document.getElementById('proof-btn'), errEl = document.getElementById('proof-err');
  if (!_proofImg) { errEl.textContent = 'Please upload a photo showing the cleanup'; return; }
  btn.disabled = true; btn.innerHTML = `<span class="spin"></span> Verifying cleanup…`;
  if (errEl) errEl.textContent = '';
  const area = document.getElementById('proof-area');
  if (area) area.innerHTML = `<div class="verify-card"><div class="spin spin-w"></div><div class="verify-t">Verifying cleanup…</div><div style="font-size:12px;color:var(--t2)">Our AI is reviewing your proof image</div></div>`;
  try {
    const res = await Missions.submitProof(mId, _proofImg);
    _proofImg = null; _proofImgFile = null;
    if (area) {
      if (res.ok) {
        area.innerHTML = `<div class="result-card ok"><div class="result-ico ok">${IC.ok}</div><div class="result-t ok">Cleanup Verified!</div><div class="pts-pop">+150 pts</div><div class="result-s">Amazing work! Points added to your balance.</div></div>`;
      } else {
        area.innerHTML = `<div class="result-card fail"><div class="result-ico fail">${IC.x}</div><div class="result-t fail">Proof Rejected</div><div class="result-s">${res.reason}</div></div>`;
      }
    }
  } catch (e) {
    if (area) area.innerHTML = proofUploaderHTML(mId);
    const errEl2 = document.getElementById('proof-err');
    if (errEl2) errEl2.textContent = e.message || 'Something went wrong. Please try again.';
    showToast("Couldn't upload your photo. Please try again.", null, 'error');
  }
}

/* ─── Leaderboard Screen ─── */
function leaderboardHTML() {
  return `
    <div class="lb-header">
      <div class="lb-head-title">Top Cleaners</div>
    </div>
    <div id="lb-content">${skeletonLBRow().repeat(5)}</div>
    <div class="pb-nav"></div>`;
}

function initLB() {
  Leaderboard.get().then(users => {
    const cont = document.getElementById('lb-content'); if (!cont) return;
    if (!users.length) { cont.innerHTML = `<div class="empty">${IC.trphy}<div class="empty-t">No cleaners ranked yet</div><div class="empty-s">Complete your first mission to appear here.</div></div>`; return; }
    const top3 = users.slice(0, 3), rest = users.slice(3);
    const rankClass = ['rank1', 'rank2', 'rank3'];
    const podiumHTML = `<div class="lb-podium">${top3.map((u, i) => `
      <div class="lb-pod-card ${rankClass[i]}${S.user && u.id === S.user.id ? ' me' : ''}">
        <div class="lb-pod-rank">${i + 1}</div>
        <div class="lb-pod-av" style="background:${acColor(u.username)}">${initials(u.username)}</div>
        <div class="lb-pod-name">${u.username}</div>
        <div class="lb-pod-pts">${u.points} pts</div>
      </div>`).join('')}</div>`;
    const listHTML = rest.length ? `<div class="lb-list">${rest.map((u, i) => {
      const me = S.user && u.id === S.user.id;
      return `<div class="lb-row${me ? ' me' : ''}">
        <span class="lb-rank-num">${i + 4}</span>
        <div class="lb-row-av" style="background:${acColor(u.username)}">${initials(u.username)}</div>
        <div class="lb-row-info">
          <div class="lb-row-name">${u.username}${me ? ` <span class="you-tag">You</span>` : ''}</div>
        </div>
        <span class="lb-row-pts">${u.points}</span>
      </div>`;
    }).join('')}</div>` : '';
    cont.innerHTML = podiumHTML + listHTML;
  }).catch(() => {
    const cont = document.getElementById('lb-content'); if (!cont) return;
    cont.innerHTML = `<div class="empty">${IC.x}<div class="empty-t">Something went wrong</div><button class="btn btn-s" style="width:auto;margin-top:8px" onclick="initLB()">Retry</button></div>`;
  });
}

/* ─── Profile Screen ─── */
function profileHTML() {
  const u = S.user || {};
  const daysActive = Math.max(1, Math.ceil((Date.now() - new Date(u.createdAt || Date.now()).getTime()) / 864e5));
  const total = (u.missionsCompleted || 0) + (u.reportsSubmitted || 0);
  const approvalRate = total > 0 ? Math.round(((u.missionsCompleted || 0) / total) * 100) : 0;
  const rank = getRank();
  return `
    ${dashHeader()}
    <div class="prof-hd">
      <div class="dash-avatar" style="background:${acColor(u.username || 'U')};width:72px;height:72px;font-size:24px">${initials(u.username || 'US')}</div>
      <div class="prof-name">${u.username || 'User'}</div>
      <div class="prof-handle">@${(u.username || 'user').toLowerCase().replace(/\s+/g, '_')}</div>
    </div>
    <div class="prof-stat-grid">
      <div class="stat-card featured">
        <div class="stat-card-top"><div class="stat-card-icon">${IC.coin}</div><button class="stat-card-arrow">${IC.arrowUR}</button></div>
        <div class="stat-card-bottom"><div class="stat-card-label">Points</div><div class="stat-card-value">${u.points || 0}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-top"><div class="stat-card-icon">${IC.checkCircle}</div><button class="stat-card-arrow">${IC.arrowUR}</button></div>
        <div class="stat-card-bottom"><div class="stat-card-label">Missions</div><div class="stat-card-value">${u.missionsCompleted || 0}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-top"><div class="stat-card-icon">${IC.pin}</div><button class="stat-card-arrow">${IC.arrowUR}</button></div>
        <div class="stat-card-bottom"><div class="stat-card-label">Reports</div><div class="stat-card-value">${u.reportsSubmitted || 0}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-top"><div class="stat-card-icon">${IC.star}</div><button class="stat-card-arrow">${IC.arrowUR}</button></div>
        <div class="stat-card-bottom"><div class="stat-card-label">Level</div><div class="stat-card-value">Lv ${u.level || 1}</div></div>
      </div>
    </div>
    <div class="prof-strip">
      <div class="prof-strip-col"><span class="prof-strip-label">Approval</span><span class="prof-strip-value">${approvalRate}%</span></div>
      <div class="prof-strip-col"><span class="prof-strip-label">Streak</span><span class="prof-strip-value">${u.streak || 0}d</span></div>
      <div class="prof-strip-col"><span class="prof-strip-label">Rank</span><span class="prof-strip-value">#${rank || '—'}</span></div>
    </div>
    <div class="section-header" style="margin-top:20px">
      <span class="section-title">My Missions</span>
      <button class="section-see-all" onclick="navigate('missions')">See all</button>
    </div>
    <div class="filter-tabs" id="prof-filter-tabs">
      <button class="filter-tab on" onclick="filterProfTab(this,'all')">All</button>
      <button class="filter-tab" onclick="filterProfTab(this,'approved')">Completed</button>
      <button class="filter-tab" onclick="filterProfTab(this,'open')">Pending</button>
    </div>
    <div class="missions-list" id="hist-list-wrap">${skeletonMissionRow()}</div>
    <div style="padding:16px var(--px);text-align:center">
      <button class="btn btn-d" onclick="Auth.logout()">Log Out</button>
    </div>
    <div class="pb-nav"></div>`;
}

let _profMissions = [];
function filterProfTab(btn, filter) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  const ms = filter === 'all' ? _profMissions : _profMissions.filter(m => m.status === filter);
  const wrap = document.getElementById('hist-list-wrap');
  if (!wrap) return;
  if (!ms.length) {
    wrap.innerHTML = `<div class="empty">${IC.ok}<div class="empty-t">No missions here</div></div>`;
  } else {
    wrap.innerHTML = ms.slice(0, 8).map(missionRowHTML).join('');
  }
}

function initProfile() {
  Missions.getAll().then(ms => {
    _profMissions = ms.filter(m => m.acceptedBy === S.user?.id || m.report?.createdBy === S.user?.id);
    filterProfTab(document.querySelector('.filter-tab.on'), 'all');
  });
}

/* ─── Bootstrap ─── */
loadData();
seedDemo();
S.user = loadSession();
navigate(S.user ? 'home' : 'auth');
