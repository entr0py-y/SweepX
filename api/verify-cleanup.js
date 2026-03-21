/* api/verify-cleanup.js
   Vercel serverless function — AI-based cleanup verification via Together AI LLaMA Vision
   POST /api/verify-cleanup
   Body: { mission_id, before_image_url, after_image_url }
*/

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { validateImageUrl, fetchImageAsBase64 } = require('../lib/imageUtils');
const { analyzeCleanupImages, parseVerificationResponse, VISION_MODEL } = require('../lib/verifyCleanup');

// Supabase client (server-side)
function getSupabase() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fallback: Read directly from the frontend config.js specifically for this static setup
  if (!url || !key) {
    try {
      const configPath = path.join(process.cwd(), 'config.js');
      const configText = fs.readFileSync(configPath, 'utf8');
      
      const urlMatch = configText.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/);
      const keyMatch = configText.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*['"]([^'"]+)['"]/);
      
      if (urlMatch) url = urlMatch[1];
      if (keyMatch && !process.env.SUPABASE_SERVICE_ROLE_KEY) key = keyMatch[1];
    } catch (err) {
      console.warn('Could not read config.js fallback:', err.message);
    }
  }

  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key);
}

module.exports = async function handler(req, res) {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const { mission_id, before_image_url, after_image_url } = req.body || {};

  // ── Input validation ──────────────────────────────────
  if (!mission_id || !before_image_url || !after_image_url) {
    return res.status(400).json({
      error: 'Required: mission_id, before_image_url, after_image_url'
    });
  }

  let validBefore, validAfter;
  try {
    validBefore = validateImageUrl(before_image_url);
    validAfter = validateImageUrl(after_image_url);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  let supabase;
  try { supabase = getSupabase(); } catch (err) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // ── Mission guard ─────────────────────────────────────
  const { data: mission, error: mErr } = await supabase
    .from('missions')
    .select('id, status, verification_status, report_id, accepted_by, points_reward, before_image')
    .eq('id', mission_id)
    .single();

  if (mErr || !mission) return res.status(404).json({ error: 'Mission not found' });

  if (mission.status !== 'pending') {
    return res.status(409).json({
      error: `Mission status is "${mission.status}", expected "pending"`,
      current_status: mission.status
    });
  }
  if (['approved', 'rejected'].includes(mission.verification_status)) {
    return res.status(409).json({ error: 'Mission already verified' });
  }

  // ── Mark verification in-progress ────────────────────
  await supabase.from('missions').update({
    verification_status: 'pending',
    verification_attempted_at: new Date().toISOString()
  }).eq('id', mission_id);

  // ── Fetch images as base64 ────────────────────────────
  let beforeImg, afterImg;
  try {
    [beforeImg, afterImg] = await Promise.all([
      fetchImageAsBase64(validBefore),
      fetchImageAsBase64(validAfter)
    ]);
  } catch (err) {
    await _applyVerdict(supabase, {
      mission, verdict: 'manual_review',
      reason: `Could not fetch images: ${err.message}`,
      confidence: null, details: null,
      modelUsed: VISION_MODEL, tokensUsed: null,
      latencyMs: Date.now() - startTime, rawText: null, error: err.message,
      beforeUrl: validBefore, afterUrl: validAfter
    });
    return res.status(200).json({
      verdict: 'manual_review',
      reason: 'Could not access images for analysis. Submitted for manual review.',
      fallback: true
    });
  }

  // ── Call LLaMA Vision ─────────────────────────────────
  let parsedResult, rawText, tokensUsed, modelUsed;

  try {
    const result = await analyzeCleanupImages(
      beforeImg.base64, beforeImg.mediaType,
      afterImg.base64, afterImg.mediaType
    );
    rawText = result.rawText;
    tokensUsed = result.tokensUsed;
    modelUsed = result.modelUsed;
    parsedResult = parseVerificationResponse(rawText);

  } catch (primaryErr) {
    // Model failed — manual review
    await _applyVerdict(supabase, {
      mission, verdict: 'manual_review',
      reason: 'AI analysis unavailable. Submitted for manual review.',
      confidence: null, details: null,
      modelUsed: VISION_MODEL, tokensUsed: null,
      latencyMs: Date.now() - startTime, rawText: null,
      error: `API Error: ${primaryErr.message}`,
      beforeUrl: validBefore, afterUrl: validAfter
    });
    return res.status(200).json({
      verdict: 'manual_review',
      reason: 'Verification service unavailable. Your cleanup has been saved for review.',
      fallback: true
    });
  }

  // ── Apply final verdict ───────────────────────────────
  const latencyMs = Date.now() - startTime;
  await _applyVerdict(supabase, {
    mission,
    verdict: parsedResult.verdict,
    confidence: parsedResult.confidence,
    reason: parsedResult.reason,
    details: parsedResult.details,
    modelUsed, tokensUsed, latencyMs, rawText,
    error: null,
    beforeUrl: validBefore, afterUrl: validAfter
  });

  return res.status(200).json({
    verdict: parsedResult.verdict,
    confidence: parsedResult.confidence,
    reason: parsedResult.reason,
    details: parsedResult.details,
    points_awarded: parsedResult.verdict === 'approved' ? (mission.points_reward || 150) : 0,
    model_used: modelUsed,
    latency_ms: latencyMs
  });
};

// ── Apply verdict to Supabase ─────────────────────────────
async function _applyVerdict(supabase, {
  mission, verdict, confidence, reason, details,
  modelUsed, tokensUsed, latencyMs, rawText, error,
  beforeUrl, afterUrl
}) {
  const now = new Date().toISOString();

  const missionUpdate = {
    verification_status: verdict,
    verification_confidence: confidence,
    verification_reason: reason,
    verification_details: details,
    verification_model: modelUsed,
    reviewed_at: now
  };

  if (verdict === 'approved') {
    missionUpdate.status = 'approved';
  } else if (verdict === 'rejected') {
    missionUpdate.status = 'rejected';
    missionUpdate.rejection_reason = reason;
  }
  // manual_review: status stays 'pending'

  await supabase.from('missions').update(missionUpdate).eq('id', mission.id);

  if (verdict === 'approved') {
    // Mark report completed — completed_by is set from the client via services.js
    await supabase.from('reports').update({
      status: 'completed'
    }).eq('id', mission.report_id).catch(() => {});

    // Award points
    if (mission.accepted_by) {
      await supabase.rpc('award_points', {
        p_user_id: mission.accepted_by,
        p_amount: mission.points_reward || 150,
        p_reason: 'mission_completed',
        p_mission_id: mission.id
      }).catch(e => console.warn('Points award failed:', e.message));
    }
  }

  // Log every attempt to verification_log
  await supabase.from('verification_log').insert({
    mission_id: mission.id,
    before_image_url: beforeUrl || '',
    after_image_url: afterUrl || '',
    verdict,
    confidence,
    reason,
    details,
    model_used: modelUsed,
    tokens_used: tokensUsed,
    latency_ms: latencyMs,
    raw_response: rawText,
    error
  }).catch(e => console.warn('Log insert failed:', e.message));
}
