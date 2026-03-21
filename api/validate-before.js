const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const HF_MODEL = 'meta-llama/Llama-3.2-11B-Vision-Instruct'
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}/v1/chat/completions`

function getSupabase() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    try {
      const configPath = path.join(process.cwd(), 'config.js');
      const configText = fs.readFileSync(configPath, 'utf8');
      const urlMatch = configText.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/);
      const keyMatch = configText.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*['"]([^'"]+)['"]/);
      if (urlMatch) url = urlMatch[1];
      if (keyMatch && !process.env.SUPABASE_SERVICE_ROLE_KEY) key = keyMatch[1];
    } catch (err) {}
  }

  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key);
}

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { image_base64, media_type = 'image/jpeg' } = req.body

  if (!image_base64) {
    return res.status(400).json({ error: 'image_base64 is required' })
  }

  // Basic size check — base64 of 10MB = ~13.3MB string
  if (image_base64.length > 14000000) {
    return res.status(400).json({ error: 'Image too large. Please use a smaller photo.' })
  }

  if (!process.env.HF_API_KEY) {
    // No key configured — skip validation, allow through
    console.warn('HF_API_KEY not set — pre-validation skipped')
    return res.status(200).json({
      passed:     true,
      confidence: null,
      reason:     'Validation skipped — API not configured.',
      skipped:    true
    })
  }

  const startTime = Date.now()

  const SYSTEM_PROMPT =
`You are a garbage detection system for an environmental cleanup platform.
Your job is to determine if an image contains visible garbage, trash, litter, or waste.

You must respond ONLY with a valid JSON object. No markdown. No explanation. Just JSON.

Respond with exactly:
{
  "has_garbage": boolean,
  "confidence": number between 0.0 and 1.0,
  "garbage_type": "description of what garbage is visible, or null if none",
  "reason": "one sentence under 100 characters"
}

Be strict: street litter, dumped waste, overflowing bins, construction debris,
scattered packaging — all count as garbage.
Empty streets, clean parks, building facades without waste — do NOT count.`

  const USER_PROMPT = `Analyze this image. Is there visible garbage, trash, litter, or waste present? Return the JSON verdict.`

  let supabase;
  try { supabase = getSupabase(); } catch (e) { supabase = null; }

  try {
    const response = await fetch(HF_API_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        model:       HF_MODEL,
        max_tokens:  256,
        temperature: 0.1,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${media_type};base64,${image_base64}` } },
              { type: 'text', text: USER_PROMPT }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      // HF free tier rate limit
      if (response.status === 429) return res.status(200).json({ passed: true, reason: 'Validation rate limited — allowed through.', skipped: true })
      // Model loading (cold start on free tier)
      if (response.status === 503) return res.status(200).json({ passed: true, reason: 'Model loading — validation skipped.', skipped: true })
      throw new Error(`HF API error ${response.status}: ${errText.slice(0, 200)}`)
    }

    const data = await response.json()
    const rawText = data.choices?.[0]?.message?.content?.trim()
    if (!rawText) throw new Error('Empty response from model')

    // Parse JSON safely
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    let parsed
    try { parsed = JSON.parse(cleaned) }
    catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse model response as JSON')
      parsed = JSON.parse(match[0])
    }

    if (typeof parsed.has_garbage !== 'boolean') throw new Error('Invalid response structure from model')

    // Confidence threshold — require 60%+ certainty to reject
    const confidence = typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5
    const passed = parsed.has_garbage === true || confidence < 0.60
    const latencyMs = Date.now() - startTime

    // Log attempt
    if (supabase) {
      supabase.from('pre_validation_log').insert({
        verdict: passed ? 'passed' : 'failed',
        confidence,
        reason: parsed.reason || null,
        model_used: HF_MODEL,
        latency_ms: latencyMs,
        raw_response: rawText.slice(0, 1000)
      }).catch(e => console.warn('Pre-val log failed:', e.message))
    }

    return res.status(200).json({
      passed,
      has_garbage: parsed.has_garbage,
      confidence,
      garbage_type: parsed.garbage_type || null,
      reason: parsed.reason || null,
      latency_ms: latencyMs
    })

  } catch (err) {
    const latencyMs = Date.now() - startTime
    if (supabase) {
      supabase.from('pre_validation_log').insert({
        verdict: 'error', model_used: HF_MODEL, latency_ms: latencyMs, error: err.message
      }).catch(() => {})
    }
    return res.status(200).json({ passed: true, reason: 'Validation unavailable — allowed through.', skipped: true, error: err.message })
  }
}
