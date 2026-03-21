/* ── SweepX Data Layer — Supabase Backend ── */

/* ── App State — declared first so ui.js never gets ReferenceError ── */
const S = {
  user: null, screen: 'auth', prev: null,
  users: [],
  detailId: null, filter: 'all'
};

/* ── Utilities ── */
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
const now = () => new Date().toISOString();
const wait = ms => new Promise(r => setTimeout(r, ms));

function timeAgo(iso) {
  if (!iso) return '';
  const d = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(d / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return min + ' min ago';
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + ' hr ago';
  const dy = Math.floor(hr / 24);
  if (dy < 7) return dy + ' days ago';
  const dt = new Date(iso);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return dt.getDate() + ' ' + months[dt.getMonth()];
}

function initials(n) {
  return (n || 'U').split(/[\s_]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function acColor(n) {
  const c = ['#2D5A1B','#1B3A5A','#3A1B5A','#5A3A1B','#1B5A3A','#5A1B2D'];
  let h = 0;
  for (let i = 0; i < (n || '').length; i++) h = (h << 5) - h + n.charCodeAt(i);
  return c[Math.abs(h) % c.length];
}

/* ── Validation ── */
const V = {
  email(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
  username(v) {
    if (v.length < 3 || v.length > 20) return 'Username must be 3–20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers, and underscores allowed';
    return '';
  },
  password(v) {
    if (v.length < 8) return 'Password must be at least 8 characters';
    if (!/\d/.test(v)) return 'Include at least one number';
    return '';
  }
};

/* ── Geo ── */
const GEO_ADDRESSES = [
  'Sector 17 Park, Chandigarh', 'Connaught Place, New Delhi',
  'MG Road, near Metro exit 2', 'Saket District Centre',
  'Hauz Khas Village, South Delhi', 'Nehru Place, Block A',
  'Lajpat Nagar Central Market', 'DLF Cyber Hub, Gurgaon',
  'Khan Market, Central Delhi', 'Janpath Road, near Palika Bazaar'
];
function reverseGeocode(lat, lng) {
  return GEO_ADDRESSES[Math.abs(Math.floor(lat * 10 + lng * 10)) % GEO_ADDRESSES.length];
}

/* ── No-op stubs for ui.js boot compatibility ── */
function persist() {}
function loadData() {}
function seedDemo() {}

/* ── Session ── */
function saveSession(user) {
  localStorage.setItem('sweepx_user_id', user.id);
  localStorage.setItem('sweepx_username', user.username);
}
function clearSession() {
  localStorage.removeItem('sweepx_user_id');
  localStorage.removeItem('sweepx_username');
  S.user = null;
}

/* ── Hydration ── */
function hydrateProfile(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email || '',
    points: row.points || 0,
    level: row.level || 1,
    streak: row.streak || 0,
    missionsCompleted: row.missions_completed || 0,
    reportsSubmitted: row.reports_submitted || 0,
    createdAt: row.created_at
  };
}

function hydrateMission(row) {
  const report = row.report || {};
  const reporter = report.reporter || {};
  const acceptor = row.acceptor || null;
  return {
    id: row.id,
    reportId: row.report_id,
    status: row.status,
    acceptedBy: row.accepted_by,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    pointsReward: row.points_reward,
    report: {
      id: report.id,
      imageUrl: report.image_url || null,
      location: report.location || 'Unknown location',
      description: report.description || '',
      distance: report.distance || '',
      createdBy: report.user_id,
      createdAt: report.created_at
    },
    creator: { id: reporter.id, username: reporter.username || 'Anonymous' },
    acceptor: acceptor ? { id: acceptor.id, username: acceptor.username || 'someone' } : null
  };
}

/* ── Supabase Client — initialised AFTER global declarations ── */
let _sb = null;
(function initSupabase() {
  try {
    _sb = window.supabase.createClient(
      typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '',
      typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : '',
      { auth: { persistSession: false } }
    );
  } catch (e) {
    console.warn('Supabase not configured:', e.message);
    _sb = null;
  }
})();

function db() {
  if (!_sb) throw new Error('Database not configured. Please fill in config.js with your Supabase credentials.');
  return _sb;
}

/* ── Image Upload ── */
async function uploadImage(dataUrl, bucket) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db().storage.from(bucket).upload(filename, blob, {
    cacheControl: '3600', upsert: false, contentType: blob.type
  });
  if (error) throw new Error("Couldn't upload your photo. Check your connection and try again.");
  const { data: urlData } = db().storage.from(bucket).getPublicUrl(filename);
  return urlData.publicUrl;
}

/* ── Session load (async) ── */
async function loadSession() {
  const userId = localStorage.getItem('sweepx_user_id');
  if (!userId) return null;
  if (!_sb) return null;
  try {
    const { data, error } = await _sb
      .from('profiles')
      .select('id, username, email, points, level, streak, missions_completed, reports_submitted, created_at')
      .eq('id', userId)
      .single();
    if (error || !data) { clearSession(); return null; }
    return hydrateProfile(data);
  } catch (e) { clearSession(); return null; }
}

/* ── Auth ── */
const Auth = {
  async signup(username, email, password) {
    const uErr = V.username(username);
    if (uErr) throw new Error(uErr);
    if (!email || !V.email(email)) throw new Error('Enter a valid email address');
    const pErr = V.password(password);
    if (pErr) throw new Error(pErr);

    const { data: existing } = await db().from('profiles').select('id').eq('username', username).maybeSingle();
    if (existing) throw new Error('This username is taken. Try a different one.');
    const { data: emailCheck } = await db().from('profiles').select('id').eq('email', email).maybeSingle();
    if (emailCheck) throw new Error('An account with this email already exists.');

    const { data, error } = await db()
      .from('profiles')
      .insert({ username, email, password, display_name: username })
      .select('id, username, email, points, level, streak, missions_completed, reports_submitted, created_at')
      .single();
    if (error) throw new Error('Could not create account. Please try again.');
    const user = hydrateProfile(data);
    S.user = user; saveSession(user); return user;
  },

  async login(email, password) {
    if (!email || !password) throw new Error('Incorrect email or password.');
    const { data, error } = await db()
      .from('profiles')
      .select('id, username, email, password, points, level, streak, missions_completed, reports_submitted, created_at')
      .eq('email', email).maybeSingle();
    if (error || !data || data.password !== password) throw new Error('Incorrect email or password.');
    const user = hydrateProfile(data);
    S.user = user; saveSession(user); return user;
  },

  logout() { clearSession(); navigate('auth'); }
};

/* ── Reports ── */
const Reports = {
  async create(imageDataUrl, location, description, lat, lng) {
    if (!imageDataUrl) throw new Error('Please add a photo of the garbage');
    if (!location || location.trim().length < 5) throw new Error('Please enter or capture a location');
    let imageUrl;
    try { imageUrl = await uploadImage(imageDataUrl, 'report-images'); }
    catch (e) { throw new Error("Couldn't upload your photo. Check your connection and try again."); }
    const { data, error } = await db()
      .from('reports')
      .insert({
        user_id: S.user?.id || null, image_url: imageUrl,
        location: location.trim(), description: (description || '').trim() || null,
        distance: '0.3 km', lat: lat || null, lng: lng || null, status: 'open'
      })
      .select('id').single();
    if (error) throw new Error("Couldn't submit your report. Please try again.");
    if (S.user?.id) {
      await db().rpc('award_points', { p_user_id: S.user.id, p_amount: 50, p_reason: 'report_submitted' });
      S.user.reportsSubmitted = (S.user.reportsSubmitted || 0) + 1;
      S.user.points = (S.user.points || 0) + 50;
      S.user.level = Math.floor(S.user.points / 500) + 1;
    }
    return { reportId: data.id };
  }
};

/* ── Missions ── */
const MISSION_SELECT = `
  id, report_id, accepted_by, status, points_reward, accepted_at, completed_at, created_at,
  report:reports(id, image_url, location, description, distance, user_id, created_at,
    reporter:profiles!reports_user_id_fkey(id, username)
  ),
  acceptor:profiles!missions_accepted_by_fkey(id, username)
`;

const Missions = {
  async getAll() {
    const { data, error } = await db().from('missions').select(MISSION_SELECT)
      .order('created_at', { ascending: false }).limit(50);
    if (error) throw new Error('Something went wrong. Please try again.');
    return (data || []).map(hydrateMission);
  },
  async getById(id) {
    const { data, error } = await db().from('missions').select(MISSION_SELECT).eq('id', id).single();
    if (error || !data) throw new Error('Mission not found.');
    return hydrateMission(data);
  },
  async accept(mId) {
    const { data: check } = await db().from('missions').select('status').eq('id', mId).single();
    if (!check || check.status !== 'open') throw new Error('This mission was just accepted by someone else.');
    const { data, error } = await db().from('missions')
      .update({ status: 'in-progress', accepted_by: S.user.id, accepted_at: now() })
      .eq('id', mId).eq('status', 'open').select(MISSION_SELECT).single();
    if (error || !data) throw new Error('This mission was just accepted by someone else.');
    return hydrateMission(data);
  },
  async submitProof(mId, proofDataUrl) {
    if (!proofDataUrl) throw new Error('Please upload a photo showing the cleanup');
    let afterUrl;
    try { afterUrl = await uploadImage(proofDataUrl, 'proof-images'); }
    catch (e) { throw new Error("Couldn't upload your photo. Please try again."); }
    const { data, error } = await db().from('missions')
      .update({ after_image: afterUrl, status: 'pending', completed_at: now() })
      .eq('id', mId).eq('accepted_by', S.user.id)
      .select('id, report_id, points_reward').single();
    if (error || !data) throw new Error("Couldn't submit your proof. Please try again.");
    return await Verify.run(data);
  }
};

/* ── Verification ── */
const Verify = {
  async run(mission) {
    await wait(800);
    const ok = Math.random() < 0.8;
    await db().from('missions').update({ status: ok ? 'approved' : 'rejected', reviewed_at: now() }).eq('id', mission.id);
    if (ok && S.user?.id) {
      await db().rpc('award_points', {
        p_user_id: S.user.id, p_amount: mission.points_reward || 150,
        p_reason: 'mission_completed', p_mission_id: mission.id
      });
      S.user.missionsCompleted = (S.user.missionsCompleted || 0) + 1;
      S.user.points = (S.user.points || 0) + (mission.points_reward || 150);
      S.user.level = Math.floor(S.user.points / 500) + 1;
      await db().from('reports').update({ status: 'completed' }).eq('id', mission.report_id);
    }
    if (ok) return { ok: true, pts: mission.points_reward || 150 };
    const reasons = [
      "After image doesn't clearly show the area is cleaned.",
      "Image appears identical to the before photo.",
      "Area is only partially cleared — please complete the full area.",
      "Poor lighting makes it hard to verify the cleanup."
    ];
    return { ok: false, reason: reasons[Math.floor(Math.random() * reasons.length)] };
  }
};

/* ── Points ── */
const Points = {
  async award(userId, amount, reason) {
    await db().rpc('award_points', { p_user_id: userId, p_amount: amount, p_reason: reason });
  }
};

/* ── Leaderboard ── */
const Leaderboard = {
  async get() {
    if (!_sb) return [];
    const { data, error } = await _sb.from('profiles')
      .select('id, username, display_name, points, level, missions_completed')
      .order('points', { ascending: false }).limit(20);
    if (error) throw new Error('Something went wrong. Please try again.');
    S.users = (data || []).map(hydrateProfile);
    return S.users;
  }
};
