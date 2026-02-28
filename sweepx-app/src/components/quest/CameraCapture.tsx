import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, RotateCcw, Check, AlertCircle } from 'lucide-react'
import { cn, GlowBtn } from '../shared/primitives'
import type { GpsCoords } from '../../lib/location'
import { getCurrentPosition } from '../../lib/location'

interface Props {
  label: string
  hint?: string
  onCapture: (blob: Blob, coords: GpsCoords) => void
  disabled?: boolean
}

export const CameraCapture: React.FC<Props> = ({ label, hint, onCapture, disabled }) => {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraReady,  setCameraReady]  = useState(false)
  const [cameraError,  setCameraError]  = useState<string | null>(null)
  const [capturing,    setCapturing]    = useState(false)
  const [previewUrl,   setPreviewUrl]   = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [capturedGps,  setCapturedGps]  = useState<GpsCoords | null>(null)

  // ── Start camera on mount ────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' }, // rear camera on mobile
            width:  { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch (err) {
        if (!cancelled) {
          const e = err as { name?: string }
          if (e.name === 'NotAllowedError') {
            setCameraError('Camera access denied. Please allow camera permission in your browser and reload.')
          } else if (e.name === 'NotFoundError') {
            setCameraError('No camera found on this device.')
          } else {
            setCameraError(`Camera error: ${(err as Error).message}`)
          }
        }
      }
    }

    startCamera()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  // ── Cleanup preview URL when unmounting ─────────────────────────────────

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  // ── Capture ──────────────────────────────────────────────────────────────

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || capturing) return
    setCapturing(true)
    try {
      const video  = videoRef.current
      const canvas = canvasRef.current
      canvas.width  = video.videoWidth  || 1280
      canvas.height = video.videoHeight || 720
      canvas.getContext('2d')!.drawImage(video, 0, 0)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/jpeg', 0.87)
      })

      // Get GPS (best-effort — use 0,0 placeholder if unavailable)
      let gps: GpsCoords = { lat: 0, lng: 0, accuracy: 9999, timestamp: Date.now() }
      try { gps = await getCurrentPosition() } catch { /* GPS optional */ }

      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setCapturedBlob(blob)
      setCapturedGps(gps)
    } catch (err) {
      setCameraError((err as Error).message)
    } finally {
      setCapturing(false)
    }
  }

  const retake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setCapturedBlob(null)
    setCapturedGps(null)
  }

  const confirmPhoto = () => {
    if (capturedBlob && capturedGps) onCapture(capturedBlob, capturedGps)
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (cameraError) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-sm text-red-400 text-center max-w-xs">{cameraError}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-white text-center">{label}</p>
      {hint && <p className="text-2xs text-slate-500 text-center -mt-1">{hint}</p>}

      <div className="relative bg-black rounded-2xl overflow-hidden aspect-video border border-white/10">
        {/* Live video feed — hidden when preview is shown */}
        <video
          ref={videoRef}
          className={cn('w-full h-full object-cover', previewUrl && 'hidden')}
          playsInline
          muted
        />

        {/* Preview of captured image */}
        {previewUrl && (
          <motion.img
            src={previewUrl}
            alt="Captured photo"
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        {/* Camera loading skeleton */}
        {!cameraReady && !previewUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-neo-p border-t-transparent rounded-full animate-spin" />
            <p className="text-2xs text-slate-500">Starting camera…</p>
          </div>
        )}

        {/* Corner viewfinder lines */}
        {cameraReady && !previewUrl && (
          <div className="absolute inset-4 pointer-events-none">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neo-p/70 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neo-p/70 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neo-p/70 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neo-p/70 rounded-br-sm" />
          </div>
        )}
      </div>

      {/* Off-screen canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Buttons */}
      {!previewUrl ? (
        <GlowBtn
          variant="primary"
          onClick={capturePhoto}
          disabled={!cameraReady || capturing || disabled}
          className="w-full gap-2"
        >
          <Camera size={15} />
          {capturing ? 'Capturing…' : '📸 Capture Photo'}
        </GlowBtn>
      ) : (
        <div className="flex gap-3">
          <GlowBtn variant="ghost" onClick={retake} className="flex-1 gap-1.5">
            <RotateCcw size={13} /> Retake
          </GlowBtn>
          <GlowBtn variant="primary" onClick={confirmPhoto} disabled={disabled} className="flex-1 gap-1.5">
            <Check size={13} /> Use This Photo
          </GlowBtn>
        </div>
      )}

      <p className="text-2xs text-slate-600 text-center">
        📍 GPS coordinates will be attached automatically
      </p>
    </div>
  )
}
