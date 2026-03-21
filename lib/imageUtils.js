/* lib/imageUtils.js
   Server-side image URL validation and base64 fetching */

const ALLOWED_DOMAINS = [
  'supabase.co',
  'supabase.in',
  'supabase.com',
  'amazonaws.com',
  'cloudinary.com'
];

function validateImageUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Image URL is required');
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid image URL format');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Image URL must use HTTPS');
  }

  const allowed = ALLOWED_DOMAINS.some(d => parsed.hostname.endsWith(d));
  if (!allowed) {
    throw new Error(`Image domain not permitted: ${parsed.hostname}`);
  }

  return parsed.href;
}

async function fetchImageAsBase64(imageUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s

  try {
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { Accept: 'image/jpeg,image/png,image/webp,image/*' }
    });

    if (!response.ok) {
      throw new Error(`Image fetch failed: HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowed.some(t => contentType.includes(t))) {
      throw new Error(`Unsupported image type: ${contentType}`);
    }

    const buffer = await response.arrayBuffer();

    if (buffer.byteLength > 20 * 1024 * 1024) {
      throw new Error('Image too large for analysis (max 20MB)');
    }

    const base64 = Buffer.from(buffer).toString('base64');
    const mediaType = contentType.split(';')[0].trim();

    return { base64, mediaType, sizeBytes: buffer.byteLength };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { validateImageUrl, fetchImageAsBase64 };
