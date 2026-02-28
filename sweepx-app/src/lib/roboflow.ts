const API_KEY  = import.meta.env.VITE_ROBOFLOW_API_KEY   as string | undefined
// e.g. "garbage-detection-3/1"  – model ID and version
const MODEL_ID = (import.meta.env.VITE_ROBOFLOW_MODEL ?? 'garbage-detection-3/1') as string

export const ROBOFLOW_ENABLED = !!API_KEY

if (!ROBOFLOW_ENABLED) {
  console.warn('[SweepX] VITE_ROBOFLOW_API_KEY not set – using mock trash detection.')
}

// Classes that count as "trash" in common Roboflow garbage models
const TRASH_CLASSES = new Set([
  'trash', 'garbage', 'litter', 'waste', 'plastic', 'bottle', 'can', 'bag', 'paper',
  'cup', 'straw', 'wrapper', 'carton', 'tire', 'cigarette',
  // capitalised variants
  'Trash', 'Garbage', 'Litter', 'Waste', 'Plastic', 'Bottle', 'Can', 'Bag', 'Paper',
  'Cup', 'Straw', 'Wrapper', 'Carton', 'Cigarette',
])

export interface RoboflowPrediction {
  class: string
  confidence: number
  x: number
  y: number
  width: number
  height: number
}

export interface TrashDetectionResult {
  trashCount: number
  confidence: number  // average confidence of trash detections
  detections: RoboflowPrediction[]
  classSummary: Record<string, number>  // class → count
}

// ── Seeded random for deterministic mock data ─────────────────────────────────
function seededMock(seed: string): TrashDetectionResult {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = (h * 31 + seed.charCodeAt(i)) >>> 0 }
  const count = (h % 8) + 1
  const conf  = 0.55 + (h % 30) / 100
  const classes = ['plastic', 'bottle', 'can', 'wrapper', 'bag']
  const chosen = classes[h % classes.length]
  const detections: RoboflowPrediction[] = Array.from({ length: count }, (_, i) => ({
    class: chosen, confidence: conf + i * 0.01, x: 100 + i * 20, y: 150, width: 60, height: 40,
  }))
  return { trashCount: count, confidence: conf, detections, classSummary: { [chosen]: count } }
}

/**
 * Send an image URL to Roboflow for trash/garbage object detection.
 * Falls back to seeded mock data when API key is not configured.
 */
export async function detectTrash(imageUrl: string): Promise<TrashDetectionResult> {
  if (!ROBOFLOW_ENABLED) {
    return seededMock(imageUrl.slice(-12))
  }

  // Roboflow REST inference: GET with ?image= encodes the URL
  const endpoint = `https://detect.roboflow.com/${MODEL_ID}?api_key=${API_KEY}&image=${encodeURIComponent(imageUrl)}`

  const res = await fetch(endpoint)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Roboflow API error (${res.status}): ${text}`)
  }

  const data = await res.json()
  const predictions: RoboflowPrediction[] = data.predictions ?? []

  const trashPreds = predictions.filter(p => TRASH_CLASSES.has(p.class))

  const avgConf = trashPreds.length > 0
    ? trashPreds.reduce((s, p) => s + p.confidence, 0) / trashPreds.length
    : 0

  const classSummary: Record<string, number> = {}
  trashPreds.forEach(p => { classSummary[p.class] = (classSummary[p.class] ?? 0) + 1 })

  return {
    trashCount: trashPreds.length,
    confidence: avgConf,
    detections: trashPreds,
    classSummary,
  }
}
