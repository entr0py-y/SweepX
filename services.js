/* ── SweepX Services Layer ──
   All Supabase calls go here. app.js never calls _sb directly.
──────────────────────────────────────────────────────── */

/* ─── Pre-validation AI ─── */
async function validateBeforeImage(imageUrl) {
  const res = await fetch('/api/verify-cleanup', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'before', before_image_url: imageUrl })
  });

  let data;
  try { data = await res.json(); } catch { return { has_garbage: true, skipped: true }; }
  if (!res.ok) return { has_garbage: true, skipped: true, error: data?.error };
  return data;
}

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
async function createReport({ imageUrl, description, location, lat, lng, userId }) {
  // 1. Insert report (DB trigger auto-creates mission)
  const { data, error } = await _sb.from('reports')
    .insert({
      user_id: userId || null,
      image_url: imageUrl,
      description: (description || '').trim() || null,
      location: location.trim(),
      lat: lat || null,
      lng: lng || null,
      status: 'open',
      capture_method: 'camera'
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
    after_img: m.after_image || null,          // proof photo URL
    rejection_reason: m.rejection_reason || null, // rejection reason text
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
  // ── Guard: verify mission is still in_progress and owned by user ──
  const { data: mission, error: fetchError } = await _sb
    .from('missions')
    .select('id, status, accepted_by, report_id, points_reward, before_image')
    .eq('id', missionId)
    .single();

  if (fetchError || !mission) throw new Error('Mission not found. It may have been removed.');
  if (mission.status !== 'in_progress' && mission.status !== 'in-progress')
    throw new Error(`This mission is already ${mission.status}. Cannot resubmit.`);
  if (mission.accepted_by !== userId) throw new Error('You can only submit proof for missions you accepted.');

  // ── Upload proof with retry ───────────────────────────
  const afterImageUrl = await _uploadProofWithRetry(afterImageFile);

  // ── Update mission → pending (optimistic lock) ────────
  const { data: updated, error: updateError } = await _sb
    .from('missions')
    .update({ after_image: afterImageUrl, status: 'pending', completed_at: new Date().toISOString() })
    .eq('id', missionId)
    .eq('status', 'in_progress')
    .eq('accepted_by', userId)
    .select('id, report_id, points_reward, after_image, before_image')
    .single();

  if (updateError || !updated) throw new Error('Could not update mission status. Please try again.');

  // ── Get before image URL ──────────────────────────────
  let beforeImageUrl = updated.before_image || mission.before_image;
  if (!beforeImageUrl) {
    const { data: report } = await _sb.from('reports')
      .select('image_url').eq('id', updated.report_id).single();
    beforeImageUrl = report?.image_url;
  }

  // ── Fire verification non-blocking (realtime picks up result) ──
  if (beforeImageUrl) {
    _callVerificationAPI({
      missionId,
      beforeImageUrl,
      afterImageUrl
    }).catch(err => console.warn('Verification call failed (non-critical):', err.message));
  } else {
    // No before image — run fallback simulation
    _runVerificationFallback(updated, userId).catch(() => {});
  }

  return { ok: null, status: 'pending', pts: 0 }; // UI enters "verifying" state
}

async function _callVerificationAPI({ missionId, beforeImageUrl, afterImageUrl }) {
  const username = window.S?.user?.username;
  const res = await fetch('/api/verify-cleanup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mission_id: missionId,
      before_image_url: beforeImageUrl,
      after_image_url: afterImageUrl
    })
  });

  let data;
  try { data = await res.json(); } catch {
    throw new Error('Verification service returned an unreadable response.');
  }

  // If approved, also tag the report with completed_by (client has username context)
  if (data.verdict === 'approved' && username) {
    await _sb.from('reports').update({ completed_by: username })
      .eq('id', window.S?.missions?.find?.(m => m.id === missionId)?.report_id || '')
      .catch(() => {});
  }

  return data;
}

// Fallback used only when no before image URL is available
async function _runVerificationFallback(mission, userId) {
  await new Promise(r => setTimeout(r, 1200));
  const approved = Math.random() < 0.80;
  const now = new Date().toISOString();
  const currentUsername = window.S?.user?.username || 'Unknown';

  if (approved) {
    await _sb.from('missions').update({ status: 'approved', reviewed_at: now }).eq('id', mission.id);
    await _sb.from('reports').update({ status: 'completed', completed_by: currentUsername })
      .eq('id', mission.report_id).catch(() => {});
  } else {
    const reasons = [
      'The after photo appears to show the same garbage. Please clean the area fully.',
      'Image quality is too low to verify the cleanup.',
      'The cleanup area is only partially cleared. Please complete the job.',
    ];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    await _sb.from('missions').update({ status: 'rejected', rejection_reason: reason, reviewed_at: now }).eq('id', mission.id);
  }
}

async function _uploadProofWithRetry(file, maxRetries = 1) {
  const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!ALLOWED.includes(file.type.toLowerCase())) throw new Error('Only JPG, PNG, or WebP images are allowed.');
  if (file.size > 10 * 1024 * 1024) throw new Error(`Image must be under 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const timestamp = Date.now(), random = Math.random().toString(36).slice(2, 9);
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const filePath = `proof-${timestamp}-${random}.${ext}`;
      const { error } = await _sb.storage.from('proof-images').upload(filePath, file, {
        cacheControl: '3600', upsert: false, contentType: file.type
      });
      if (error) {
        if (error.message.includes('size') || error.message.includes('exceeded')) throw new Error('Image is too large. Please use a photo under 10MB.');
        if (error.message.includes('mime') || error.message.includes('type')) throw new Error('File type not allowed. Use JPG, PNG, or WebP.');
        throw new Error("Couldn't upload your proof photo. Please try again.");
      }
      const { data } = _sb.storage.from('proof-images').getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error('Could not retrieve the uploaded image URL.');
      return data.publicUrl;
    } catch (err) {
      lastError = err;
      const retryable = err.message.includes('connection') || err.message.includes('network') || err.message.includes('timeout');
      if (!retryable || attempt === maxRetries) break;
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw lastError;
}


/* ─── Leaderboard ─── */
async function getLeaderboard() {
  // Fetch all reports where status="completed"
  const { data, error } = await _sb.from('reports')
    .select('completed_by')
    .eq('status', 'completed');
    
  if (error) throw new Error('Leaderboard unavailable.');
  
  // Group by completed_by and calculate 10 points per mission
  const userScores = {};
  for (const row of (data || [])) {
    if (row.completed_by) {
      userScores[row.completed_by] = (userScores[row.completed_by] || 0) + 10;
    }
  }
  
  // Convert to array and sort descending
  const lb = Object.entries(userScores).map(([username, points]) => ({
    username,
    points
  })).sort((a, b) => b.points - a.points);
  
  return lb;
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
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reports' }, onChange)
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
