const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME   as string | undefined
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined

export const CLOUDINARY_ENABLED = !!(CLOUD_NAME && UPLOAD_PRESET)

if (!CLOUDINARY_ENABLED) {
  console.warn('[SweepX] Cloudinary env vars not set – images will use local object URLs.')
}

/**
 * Upload a Blob to Cloudinary using an unsigned upload preset.
 * Returns the secure_url from Cloudinary, or a local object URL in dev mode.
 */
export async function uploadToCloudinary(blob: Blob, folder = 'sweepx'): Promise<string> {
  if (!CLOUDINARY_ENABLED) {
    // Dev mode: return object URL as stand-in
    return URL.createObjectURL(blob)
  }

  const form = new FormData()
  form.append('file', blob, `sweepx_${Date.now()}.jpg`)
  form.append('upload_preset', UPLOAD_PRESET!)
  form.append('folder', folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cloudinary upload failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  if (!data.secure_url) throw new Error('Cloudinary response missing secure_url')
  return data.secure_url as string
}
