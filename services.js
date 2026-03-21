/* ── SweepX Services Layer ──
   All Supabase calls go here. app.js never calls _sb directly.
──────────────────────────────────────────────────────── */

/* ─── Human-friendly error map ─── */
function _friendlyError(err, fallback) {
  if (!err) return fallback;
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('network') || msg.includes('fetch')) return 'No connection. Check your internet and try again.';
  if (msg.includes('upload') || msg.includes('storage')) return "Couldn't upload your photo. Check your connection and try again.";
  if (msg.includes('already accepted') || msg.includes('in_progress')) return 'This mission was just claimed by someone else.';
  if (msg.includes('duplicate') || msg.includes('unique')) return 'That username is already taken.';
  return fallback || 'Something went wrong. Please try again.';
}

/* ─── Storage: upload file, return public URL ─── */
async function uploadImage(file, bucket) {
  bucket = bucket || 'report-images';
  const ext = (file.name || 'img').split('.').pop();
  const filename = Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext;
  const { error } = await _sb.storage.from(bucket).upload(filename, file, {
    cacheControl: '3600', upsert: false, contentType: file.type
  });
  if (error) throw new Error('upload_failed: ' + error.message);
  const { data } = _sb.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

/* ─── Profiles ─── */
async function getOrCreateProfile(username) {
  username = username.trim();
  const { data: existing } = await _sb.from('profiles')
    .select('*').eq('username', username).maybeSingle();
  if (existing) return existing;
  const { data, error } = await _sb.from('profiles')
    .insert({ username, display_name: username })
    .select().single();
  if (error) throw new Error(_friendlyError(error, "Couldn't create profile."));
  return data;
}

async function getProfile(userId) {
  const { data, error } = await _sb.from('profiles')
    .select('*, missions:missions(id, status, created_at, report:reports(location, image_url))')
    .eq('id', userId).single();
  if (error) throw new Error(_friendlyError(error, "Couldn't load profile."));
  return data;
}

async function updateProfileLastActive(userId) {
  await _sb.from('profiles').update({ last_active: new Date().toISOString() }).eq('id', userId);
}

/* ─── Reports ─── */
async function createReport({ imageFile, description, location, lat, lng, userId }) {
  // 1. Upload image
  let imageUrl;
  try { imageUrl = await uploadImage(imageFile, 'report-images'); }
  catch (e) { throw new Error("Couldn't upload your photo. Check your connection and try again."); }

  // 2. Insert report (DB trigger auto-creates mission)
  const { data, error } = await _sb.from('reports')
    .insert({
      user_id: userId || null,
      image_url: imageUrl,
      description: (description || '').trim() || null,
      location: location.trim(),
      lat: lat || null,
      lng: lng || null,
      status: 'open'
    })
    .select('id, image_url, location, description, created_at, user_id')
    .single();
  if (error) throw new Error("Couldn't submit your report. Please try again.");

  // 3. Award 50 pts for reporting + increment reports_submitted counter
  if (userId) {
    await _sb.rpc('award_points', { p_user_id: userId, p_amount: 50, p_reason: 'report_submitted' });
    const { data: prof } = await _sb.from('profiles').select('reports_submitted').eq('id', userId).single();
    if (prof) {
      await _sb.from('profiles')
        .update({ reports_submitted: (prof.reports_submitted || 0) + 1 })
        .eq('id', userId);
    }
  }

  return data;
}

/* ─── Missions ─── */
async function getMissions(statusFilter) {
  let q = _sb.from('missions')
    .select(`
      id, status, created_at, points_reward, accepted_by, before_image, after_image,
      report:reports(id, image_url, location, description, created_at,
        reporter:profiles(id, username, display_name)),
      acceptor:profiles(id, username, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  // Map UI filter names to DB values
  const dbStatus = { 'in-progress': 'in_progress', 'approved': 'approved', 'open': 'open', 'rejected': 'rejected', 'pending': 'pending' };
  if (statusFilter && statusFilter !== 'all') {
    q = q.eq('status', dbStatus[statusFilter] || statusFilter);
  }
  const { data, error } = await q;
  if (error) throw new Error('Failed to fetch missions.');
  return (data || []).map(_normalizeMission);
}

async function getMissionById(missionId) {
  const { data, error } = await _sb.from('missions')
    .select(`
      id, status, created_at, points_reward, accepted_by, before_image, after_image,
      report:reports(id, image_url, location, description, created_at,
        reporter:profiles(id, username, display_name)),
      acceptor:profiles(id, username, display_name)
    `)
    .eq('id', missionId).single();
  if (error) throw new Error('Mission not found.');
  return _normalizeMission(data);
}

/* Map Supabase shape → existing app shape (m.st, m.rpt, m.ab, m.at, m.creator) */
function _normalizeMission(m) {
  if (!m) return null;
  const statusMap = { in_progress: 'in-progress' };
  return {
    id: m.id,
    st: statusMap[m.status] || m.status,
    ab: m.accepted_by,
    at: m.created_at,
    ct: m.completed_at || null,
    points_reward: m.points_reward || 150,
    rpt: m.report ? {
      id: m.report.id,
      img: m.report.image_url,
      loc: m.report.location,
      desc: m.report.description,
      by: m.report.reporter?.id,
      dist: null
    } : {},
    creator: m.report?.reporter || {},
    acceptor: m.acceptor || null
  };
}

async function acceptMission(missionId, userId) {
  // Check it's still open
  const { data: current } = await _sb.from('missions')
    .select('status').eq('id', missionId).single();
  if (!current || current.status !== 'open') throw new Error('already_accepted');

  const { data, error } = await _sb.from('missions')
    .update({ status: 'in_progress', accepted_by: userId, accepted_at: new Date().toISOString() })
    .eq('id', missionId).eq('status', 'open')
    .select().single();
  if (error || !data) throw new Error('already_accepted');
  return _normalizeMission(data);
}

async function submitProof(missionId, afterImageFile, userId) {
  // Upload proof image
  let afterImageUrl;
  try { afterImageUrl = await uploadImage(afterImageFile, 'proof-images'); }
  catch (e) { throw new Error("Couldn't upload your photo. Check your connection and try again."); }

  // Mark pending
  const { data, error } = await _sb.from('missions')
    .update({ after_image: afterImageUrl, status: 'pending', completed_at: new Date().toISOString() })
    .eq('id', missionId).eq('accepted_by', userId)
    .select('id, report_id, points_reward').single();
  if (error) throw new Error("Couldn't submit your proof. Please try again.");

  // Simulate verification (800ms, 80% pass rate)
  return await _simulateVerification(data, userId);
}

async function _simulateVerification(mission, userId) {
  await new Promise(r => setTimeout(r, 800));
  const approved = Math.random() < 0.8;
  const status = approved ? 'approved' : 'rejected';

  await _sb.from('missions')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', mission.id);

  if (approved && userId) {
    await _sb.rpc('award_points', {
      p_user_id: userId,
      p_amount: mission.points_reward || 150,
      p_reason: 'mission_completed',
      p_mission_id: mission.id
    });
    await _sb.from('reports').update({ status: 'completed' }).eq('id', mission.report_id);
  }

  return { ok: approved, status, pts: approved ? (mission.points_reward || 150) : 0 };
}

/* ─── Leaderboard ─── */
async function getLeaderboard() {
  const { data, error } = await _sb.from('profiles')
    .select('id, username, display_name, points, level, missions_completed, streak')
    .order('points', { ascending: false })
    .limit(20);
  if (error) throw new Error('Leaderboard unavailable.');
  return data || [];
}

/* ─── Realtime subscriptions ─── */
let _channels = {};

function subscribeReports(onInsert) {
  const ch = _sb.channel('reports-feed')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, onInsert)
    .subscribe();
  _channels['reports-feed'] = ch;
  return ch;
}

function subscribeMission(missionId, onChange) {
  const key = 'mission-' + missionId;
  const ch = _sb.channel(key)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'missions', filter: 'id=eq.' + missionId }, onChange)
    .subscribe();
  _channels[key] = ch;
  return ch;
}

function subscribeLeaderboard(onChange) {
  const ch = _sb.channel('leaderboard-live')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, onChange)
    .subscribe();
  _channels['leaderboard-live'] = ch;
  return ch;
}

function unsubscribe(channelOrKey) {
  if (!channelOrKey) return;
  if (typeof channelOrKey === 'string') {
    const ch = _channels[channelOrKey];
    if (ch) { _sb.removeChannel(ch); delete _channels[channelOrKey]; }
  } else {
    _sb.removeChannel(channelOrKey);
  }
}

function unsubscribeAll() {
  Object.values(_channels).forEach(ch => _sb.removeChannel(ch));
  _channels = {};
}
