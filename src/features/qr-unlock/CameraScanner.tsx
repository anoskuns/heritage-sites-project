import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats, type CameraDevice } from 'html5-qrcode'
import {
  Camera,
  AlertCircle,
  RefreshCw,
  Upload,
  SwitchCamera,
  Keyboard,
  ShieldCheck,
} from 'lucide-react'
import { useTranslation } from '../../i18n'
import { HeritageCorner } from '../../components/decorative/DongSonMotifs'
import { extractTokenFromQrString } from './qrService'

interface CameraScannerProps {
  onScan: (token: string) => void
  onError?: (err: string) => void
  onFallbackToManual: () => void
}

const SCANNER_CONTAINER_ID = 'heritage-qr-reader-viewport'

export function CameraScanner({ onScan, onFallbackToManual }: CameraScannerProps) {
  const { t } = useTranslation()

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const isScanningRef = useRef<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState<boolean>(true)
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0)
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false)

  // Clean stop scanner helper
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (isScanningRef.current) {
          isScanningRef.current = false
          await html5QrCodeRef.current.stop()
        }
        await html5QrCodeRef.current.clear()
      } catch {
        // ignore stop/clear error on unmount
      }
    }
  }, [])

  // Start live camera scanning
  const startCamera = useCallback(
    async (cameraIdOrFacing?: string | { facingMode: string }) => {
      setIsInitializing(true)
      setErrorMessage(null)

      try {
        await stopScanner()

        // Create or reuse Html5Qrcode instance
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(SCANNER_CONTAINER_ID, {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
          })
        }

        // Get list of cameras if not populated
        try {
          const devices = await Html5Qrcode.getCameras()
          if (devices && devices.length > 0) {
            setAvailableCameras(devices)
          }
        } catch {
          // Camera enumeration may fail or be restricted before permission
        }

        const cameraConfig = cameraIdOrFacing || { facingMode: 'environment' }

        await html5QrCodeRef.current.start(
          cameraConfig,
          {
            fps: 12,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
              const edge = Math.floor(minEdge * 0.72)
              return { width: edge, height: edge }
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (decodedText) {
              const extractedToken = extractTokenFromQrString(decodedText)
              if (extractedToken) {
                // Stop scanner before notifying parent
                stopScanner().then(() => {
                  onScan(extractedToken)
                })
              }
            }
          },
          () => {
            // Frame parse error - ordinary during ongoing camera scan
          }
        )

        isScanningRef.current = true
        setHasPermission(true)
        setIsInitializing(false)
      } catch (err: unknown) {
        isScanningRef.current = false
        setHasPermission(false)
        setIsInitializing(false)

        let msg = t.qrUnlock.cameraError
        if (err instanceof Error) {
          if (
            err.name === 'NotAllowedError' ||
            err.message.includes('Permission') ||
            err.message.includes('denied')
          ) {
            msg = 'Trình duyệt chưa được cấp quyền truy cập Camera. Vui lòng bật quyền hoặc dùng tính năng Tải ảnh QR / Nhập mã bên dưới.'
          } else if (err.name === 'NotFoundError' || err.message.includes('not found')) {
            msg = 'Không tìm thấy thiết bị Camera trên thiết bị này. Vui lòng tải ảnh QR hoặc nhập mã thủ công.'
          } else {
            msg = err.message || t.qrUnlock.cameraError
          }
        }
        setErrorMessage(msg)
      }
    },
    [onScan, stopScanner, t]
  )

  // Initial startup
  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      if (active) {
        startCamera()
      }
    }, 150)

    return () => {
      active = false
      clearTimeout(timer)
      stopScanner()
    }
  }, [startCamera, stopScanner])

  // Switch camera handler (e.g. between rear & front on mobile, or external webcams)
  const handleSwitchCamera = async () => {
    if (availableCameras.length <= 1) return
    const nextIndex = (currentCameraIndex + 1) % availableCameras.length
    setCurrentCameraIndex(nextIndex)
    const nextCamera = availableCameras[nextIndex]
    if (nextCamera) {
      await startCamera(nextCamera.id)
    }
  }

  // Handle uploading and scanning an image file containing a QR code
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingFile(true)
    setErrorMessage(null)

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(SCANNER_CONTAINER_ID, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        })
      }

      // If currently scanning camera, stop first
      if (isScanningRef.current) {
        await stopScanner()
      }

      const decodedResult = await html5QrCodeRef.current.scanFileV2(file, false)
      if (decodedResult?.decodedText) {
        const extractedToken = extractTokenFromQrString(decodedResult.decodedText)
        if (extractedToken) {
          onScan(extractedToken)
          return
        }
      }
      setErrorMessage('Không nhận diện được mã QR hợp lệ từ bức ảnh này. Vui lòng chọn ảnh khác rõ nét hơn.')
    } catch {
      setErrorMessage('Không thể đọc mã QR từ tệp ảnh này. Vui lòng thử ảnh khác hoặc chuyển sang nhập mã thủ công.')
    } finally {
      setIsProcessingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Hidden File Input for QR Image Upload fallback */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileScan}
        accept="image/*"
        className="hidden"
      />

      {/* Main Scanner Card: Khung gốm đỏ & góc triện cung đình */}
      <div className="relative rounded-3xl bg-[#2A0904] border-2 border-[#D6AD60]/60 p-3 sm:p-4 shadow-2xl overflow-hidden text-white">
        
        {/* 4 Góc Triện Hoàng Gia */}
        <div className="absolute top-2 left-2 text-[#D6AD60] opacity-80 z-20 pointer-events-none">
          <HeritageCorner className="w-5 h-5" />
        </div>
        <div className="absolute top-2 right-2 text-[#D6AD60] opacity-80 transform rotate-90 z-20 pointer-events-none">
          <HeritageCorner className="w-5 h-5" />
        </div>
        <div className="absolute bottom-2 left-2 text-[#D6AD60] opacity-80 transform -rotate-90 z-20 pointer-events-none">
          <HeritageCorner className="w-5 h-5" />
        </div>
        <div className="absolute bottom-2 right-2 text-[#D6AD60] opacity-80 transform rotate-180 z-20 pointer-events-none">
          <HeritageCorner className="w-5 h-5" />
        </div>

        {/* Viewport Scanner Container */}
        <div className="relative w-full aspect-square rounded-2xl bg-black overflow-hidden flex items-center justify-center">
          
          {/* HTML5-QRCode Render Target */}
          <div id={SCANNER_CONTAINER_ID} className="w-full h-full object-cover" />

          {/* Loading Indicator */}
          {(isInitializing || isProcessingFile) && (
            <div className="absolute inset-0 bg-[#2A0904]/90 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-30 text-center px-4">
              <RefreshCw className="w-9 h-9 animate-spin text-[#D6AD60]" />
              <p className="font-serif text-sm font-semibold text-[#FFF9F0]">
                {isProcessingFile ? 'Đang trích xuất mã QR từ ảnh...' : 'Đang khởi tạo máy quét Camera...'}
              </p>
              <span className="text-[11px] text-[#F7F0E2]/75 font-sans">
                Giữ điện thoại ổn định trước mã QR trên pin
              </span>
            </div>
          )}

          {/* Error / Fallback State */}
          {!isInitializing && (hasPermission === false || errorMessage) && (
            <div className="absolute inset-0 bg-[#2A0904]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3.5 z-30">
              <div className="w-12 h-12 rounded-full bg-[#8B2E1E] border border-[#D6AD60]/60 flex items-center justify-center text-[#D6AD60]">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="font-serif font-bold text-sm text-[#FFF9F0]">
                  Không thể mở Camera
                </h4>
                <p className="text-xs text-[#F7F0E2]/80 leading-relaxed font-sans">
                  {errorMessage}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D6AD60] to-[#C89B3C] text-[#4A1505] font-serif font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Thử lại Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-serif font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#D6AD60]" />
                  <span>Tải ảnh QR</span>
                </button>
              </div>
            </div>
          )}

          {/* Custom Viewfinder Laser Target (Visible when live) */}
          {!isInitializing && hasPermission && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
              <div className="w-56 h-56 border-2 border-[#D6AD60] rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                {/* 4 Corner highlights */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#D6AD60] rounded-tl-md" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#D6AD60] rounded-tr-md" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#D6AD60] rounded-bl-md" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#D6AD60] rounded-br-md" />

                {/* Animated scanning line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#D6AD60] to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-[0_0_8px_#D6AD60]" />
              </div>

              <div className="mt-4 px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#D6AD60]/60 flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-[#D6AD60] animate-pulse" />
                <span className="text-[11px] font-serif text-[#FFF9F0]">
                  Đặt mã QR vào giữa khung ngắm
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Action Controls Bar below scanner viewport */}
        <div className="mt-3.5 flex items-center justify-between gap-2 px-1 text-xs">
          {/* Switch Camera Button (if multiple cameras available) */}
          {availableCameras.length > 1 ? (
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#FFF9F0] text-[11px] font-serif transition-colors cursor-pointer"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-[#D6AD60]" />
              <span>Đổi Camera</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-[#F7F0E2]/70">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D6AD60]" />
              <span>Mã hóa bảo mật</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Upload QR image button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B2E1E]/80 hover:bg-[#8B2E1E] border border-[#D6AD60]/50 text-[#FFF9F0] text-[11px] font-serif font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#D6AD60]" />
              <span>Tải ảnh QR</span>
            </button>

            {/* Switch to manual PIN tab button */}
            <button
              type="button"
              onClick={onFallbackToManual}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-[#FFF9F0] text-[11px] font-serif transition-colors cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#D6AD60]" />
              <span>Nhập mã PIN</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
