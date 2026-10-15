import { useEffect, useRef, useState } from 'react'
import { Camera, AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslation } from '../../i18n'

interface CameraScannerProps {
  onScan: (token: string) => void
  onError?: (err: string) => void
  onFallbackToManual: () => void
}

export function CameraScanner({ onScan, onFallbackToManual }: CameraScannerProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    async function startCamera() {
      setIsInitializing(true)
      setErrorMessage(null)

      if (!navigator?.mediaDevices?.getUserMedia) {
        if (isMounted) {
          setHasPermission(false)
          setErrorMessage(t.qrUnlock.cameraError)
          setIsInitializing(false)
        }
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        setHasPermission(true)
        setIsInitializing(false)

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }

        // Setup BarcodeDetector if natively supported
        if ('BarcodeDetector' in window) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const barcodeDetector = new (window as any).BarcodeDetector({
              formats: ['qr_code'],
            })

            const detectCode = async () => {
              if (!isMounted) return

              if (
                videoRef.current &&
                videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
              ) {
                try {
                  const barcodes = await barcodeDetector.detect(videoRef.current)
                  if (barcodes.length > 0 && barcodes[0]?.rawValue) {
                    const rawValue = barcodes[0].rawValue.trim()
                    // Extract token if raw value is a full URL like https://.../unlock?token=XYZ
                    let token = rawValue
                    if (rawValue.includes('token=')) {
                      try {
                        const parsed = new URL(rawValue)
                        token = parsed.searchParams.get('token') || rawValue
                      } catch {
                        // ignore and use rawValue
                      }
                    } else if (rawValue.includes('/qr/')) {
                      const parts = rawValue.split('/qr/')
                      if (parts.length > 1) {
                        token = parts[1].split('?')[0]
                      }
                    }

                    onScan(token)
                    return // Stop scanning once detected
                  }
                } catch {
                  // Frame detection error, ignore and continue
                }
              }

              animationFrameRef.current = requestAnimationFrame(detectCode)
            }

            animationFrameRef.current = requestAnimationFrame(detectCode)
          } catch (detectorErr) {
            console.warn('BarcodeDetector initialization failed:', detectorErr)
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return
        setHasPermission(false)
        const msg = err instanceof Error ? err.message : t.qrUnlock.cameraError
        setErrorMessage(msg.includes('Permission') ? t.qrUnlock.cameraError : msg)
        setIsInitializing(false)
      }
    }

    startCamera()

    return () => {
      isMounted = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [onScan, t])

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-2xl text-white space-y-3 min-h-[300px]">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">{t.common.loading}</p>
      </div>
    )
  }

  if (hasPermission === false || errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-amber-50/60 border border-amber-200 rounded-2xl text-center space-y-4 min-h-[280px]">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="font-semibold text-gray-900 text-sm">
            {t.qrUnlock.cameraError}
          </h3>
          <p className="text-xs text-gray-500">
            {errorMessage || t.qrUnlock.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onFallbackToManual}
          className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
        >
          {t.qrUnlock.manualTab}
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-2xl bg-black border-2 border-amber-600/30 shadow-inner">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="w-full h-full object-cover"
      />

      {/* Viewfinder overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        <div className="w-48 h-48 border-2 border-amber-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
          {/* Corner highlights */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-amber-400 rounded-tl-md" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-amber-400 rounded-tr-md" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-amber-400 rounded-bl-md" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-amber-400 rounded-br-md" />

          {/* Animated scanning line */}
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2" />
        </div>

        <p className="text-white text-xs font-medium mt-4 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.qrUnlock.subtitle}</span>
        </p>
      </div>
    </div>
  )
}

