/* lib/verifyCleanup.js
   LLaMA Vision caller via NVIDIA NIM OpenAI-compatible API (no SDK needed)
   Model: llama-3.2-11b-vision-instruct
   Endpoint: https://integrate.api.nvidia.com/v1/chat/completions
*/

const { SYSTEM_PROMPT, USER_PROMPT, BEFORE_SYSTEM_PROMPT, BEFORE_USER_PROMPT } = require('./verificationPrompt');

const VISION_MODEL   = 'meta/llama-3.2-11b-vision-instruct';
const FALLBACK_MODEL = 'meta/llama-3.2-11b-vision-instruct';
const API_BASE       = 'https://integrate.api.nvidia.com/v1/chat/completions';

function getApiKey() {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) throw new Error('NVIDIA_API_KEY environment variable is not set');
  return key;
}

async function analyzeCleanupImages(
  beforeBase64, beforeMediaType,
  afterBase64,  afterMediaType,
  useFallback = false
) {
  const model  = useFallback ? FALLBACK_MODEL : VISION_MODEL;
  const apiKey = getApiKey();

  const body = {
    model,
    max_tokens:  512,
    temperature: 0.1,
    messages: [
      {
        role:    'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: [
          {
            type:      'image_url',
            image_url: { url: `data:${beforeMediaType};base64,${beforeBase64}` }
          },
          {
            type:      'image_url',
            image_url: { url: `data:${afterMediaType};base64,${afterBase64}` }
          },
          {
            type: 'text',
            text: USER_PROMPT
          }
        ]
      }
    ]
  };

  const response = await fetch(API_BASE, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(`Vision API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data     = await response.json();
  const rawText  = data.choices?.[0]?.message?.content?.trim();
  const tokensUsed =
    (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

  if (!rawText) throw new Error('Empty response from vision model');

  return { rawText, tokensUsed, modelUsed: model };
}

function parseVerificationResponse(rawText) {
  // Strip accidental markdown fences
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(`Could not parse JSON from model response: ${cleaned.slice(0, 200)}`);
    }
    parsed = JSON.parse(match[0]);
  }

  // Validate required fields
  if (typeof parsed.is_valid !== 'boolean') {
    throw new Error('Missing required field: is_valid');
  }
  if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
    throw new Error('Invalid confidence value');
  }
  if (!['approved', 'rejected', 'manual_review'].includes(parsed.verdict)) {
    parsed.verdict = parsed.is_valid ? 'approved' : 'rejected';
  }

  // Enforce confidence thresholds
  if (parsed.confidence < 0.40 && parsed.verdict !== 'manual_review') {
    parsed.verdict = 'manual_review';
    parsed.reason  = `Low confidence (${Math.round(parsed.confidence * 100)}%). Sent for manual review.`;
  }
  if (parsed.confidence >= 0.40 && parsed.confidence < 0.55 && parsed.verdict === 'approved') {
    parsed.verdict = 'manual_review';
    parsed.reason  = 'Moderate confidence. Sent for review.';
  }

  return {
    isValid:    parsed.is_valid,
    confidence: Math.round(parsed.confidence * 1000) / 1000,
    verdict:    parsed.verdict,
    reason:     (parsed.reason || 'No reason provided').slice(0, 200),
    details:    parsed.checks || null
  };
}

async function analyzeBeforeImage(beforeBase64, beforeMediaType) {
  const apiKey = getApiKey();
  const body = {
    model: VISION_MODEL,
    max_tokens: 256,
    temperature: 0.1,
    messages: [
      { role: 'system', content: BEFORE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${beforeMediaType};base64,${beforeBase64}` } },
          { type: 'text', text: BEFORE_USER_PROMPT }
        ]
      }
    ]
  };

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(`Vision API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content?.trim();
  const tokensUsed = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

  if (!rawText) throw new Error('Empty response from vision model');
  return { rawText, tokensUsed, modelUsed: VISION_MODEL };
}

function parseBeforeResponse(rawText) {
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`Could not parse JSON from model response: ${cleaned.slice(0, 200)}`);
    parsed = JSON.parse(match[match.length - 1] || match[0]);
  }

  if (typeof parsed.has_garbage !== 'boolean') {
    throw new Error('Missing or invalid required field: has_garbage');
  }

  const confidence = typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5;

  return {
    has_garbage: parsed.has_garbage,
    confidence: Math.round(confidence * 1000) / 1000,
    reason: (parsed.reason || 'No reason provided').slice(0, 100)
  };
}

module.exports = { analyzeCleanupImages, parseVerificationResponse, analyzeBeforeImage, parseBeforeResponse, VISION_MODEL };
