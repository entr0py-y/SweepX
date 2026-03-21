/* lib/verifyCleanup.js
   Together AI LLaMA Vision caller + JSON response parser */

const Together = require('together-ai');
const { SYSTEM_PROMPT, USER_PROMPT } = require('./verificationPrompt');

const VISION_MODEL = 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo';
const FALLBACK_MODEL = 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo';

let _client = null;
function getClient() {
  if (!_client) {
    if (!process.env.TOGETHER_API_KEY) {
      throw new Error('TOGETHER_API_KEY environment variable is not set');
    }
    _client = new Together({ apiKey: process.env.TOGETHER_API_KEY });
  }
  return _client;
}

async function analyzeCleanupImages(
  beforeBase64, beforeMediaType,
  afterBase64, afterMediaType,
  useFallback = false
) {
  const client = getClient();
  const model = useFallback ? FALLBACK_MODEL : VISION_MODEL;

  const response = await client.chat.completions.create({
    model,
    max_tokens: 512,
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${beforeMediaType};base64,${beforeBase64}` }
          },
          {
            type: 'image_url',
            image_url: { url: `data:${afterMediaType};base64,${afterBase64}` }
          },
          {
            type: 'text',
            text: USER_PROMPT
          }
        ]
      }
    ]
  });

  const rawText = response.choices?.[0]?.message?.content?.trim();
  const tokensUsed =
    (response.usage?.prompt_tokens || 0) +
    (response.usage?.completion_tokens || 0);

  if (!rawText) throw new Error('Empty response from vision model');

  return { rawText, tokensUsed, modelUsed: model };
}

function parseVerificationResponse(rawText) {
  // Strip accidental markdown code fences
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
  if (parsed.confidence < 0.55 && parsed.verdict !== 'manual_review') {
    parsed.verdict = 'manual_review';
    parsed.reason = `Low confidence (${Math.round(parsed.confidence * 100)}%). Sent for manual review.`;
  }
  if (parsed.confidence >= 0.55 && parsed.confidence < 0.70 && parsed.verdict === 'approved') {
    parsed.verdict = 'manual_review';
    parsed.reason = 'Moderate confidence. Sent for review.';
  }

  return {
    isValid: parsed.is_valid,
    confidence: Math.round(parsed.confidence * 1000) / 1000,
    verdict: parsed.verdict,
    reason: (parsed.reason || 'No reason provided').slice(0, 200),
    details: parsed.details || null
  };
}

module.exports = { analyzeCleanupImages, parseVerificationResponse, VISION_MODEL, FALLBACK_MODEL };
