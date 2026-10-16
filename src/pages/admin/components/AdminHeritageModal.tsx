import React, { useState, useEffect } from 'react'
import {
  X,
  MapPin,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Volume2,
  FileText,
  Save,
  Compass,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Layers,
  ArrowUp,
  ArrowDown,
  BookOpen,
} from 'lucide-react'
import type { HeritageSite } from '../../../types/database.types'
import {
  createHeritageSite,
  updateHeritageSite,
  resolveGoogleMapsCoordinates,
  detectNearestArea,
} from '../../../features/admin'
import { OFFICIAL_REGIONS } from '../../../features/heritage/mapService'
import {
  getSiteSections,
  type HeritageSectionItem,
} from '../../../features/heritage'
import { ChimLac } from '../../../components/decorative/DongSonMotifs'

interface AdminHeritageModalProps {
  isOpen: boolean
  onClose: () => void
  siteToEdit?: HeritageSite | null
  onSuccess: () => void
}

export function AdminHeritageModal({
  isOpen,
  onClose,
  siteToEdit,
  onSuccess,
}: AdminHeritageModalProps) {
  const isEditing = Boolean(siteToEdit)

  // Form states
  const [nameVi, setNameVi] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [slug, setSlug] = useState('')
  const [googleMapsUrl, setGoogleMapsUrl] = useState('')
  const [latitude, setLatitude] = useState<number>(10.7769)
  const [longitude, setLongitude] = useState<number>(106.7009)
  const [areaId, setAreaId] = useState<string>('p79')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [storyVi, setStoryVi] = useState('')
  const [storyEn, setStoryEn] = useState('')
  const [descriptionVi, setDescriptionVi] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [sourceReference, setSourceReference] = useState('')
  const [isPublished, setIsPublished] = useState(true)

  // Rich content sections state
  const [sections, setSections] = useState<HeritageSectionItem[]>([])

  const [mapsParseSuccess, setMapsParseSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Pre-fill when editing
  useEffect(() => {
    if (siteToEdit) {
      setNameVi(siteToEdit.name_vi)
      setNameEn(siteToEdit.name_en)
      setSlug(siteToEdit.slug)
      setLatitude(Number(siteToEdit.latitude))
      setLongitude(Number(siteToEdit.longitude))
      setAreaId(siteToEdit.area_id || 'p79')
      setCoverImageUrl(siteToEdit.cover_image_url)
      setStoryVi(siteToEdit.story_vi)
      setStoryEn(siteToEdit.story_en)
      setDescriptionVi(siteToEdit.description_vi || '')
      setDescriptionEn(siteToEdit.description_en || '')
      setAudioUrl(siteToEdit.audio_url || '')
      setSourceReference(siteToEdit.source_reference || '')
      setIsPublished(siteToEdit.is_published)

      const loadedSections = getSiteSections(siteToEdit.id).length > 0
        ? getSiteSections(siteToEdit.id)
        : getSiteSections(siteToEdit.slug)
      setSections(loadedSections)
    } else {
      // Reset
      setNameVi('')
      setNameEn('')
      setSlug('')
      setGoogleMapsUrl('')
      setLatitude(10.7769)
      setLongitude(106.7009)
      setAreaId('p79')
      setCoverImageUrl('https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80')
      setStoryVi('')
      setStoryEn('')
      setDescriptionVi('')
      setDescriptionEn('')
      setAudioUrl('')
      setSourceReference('Cục Di sản Văn hóa Việt Nam')
      setIsPublished(true)
      setSections([])
    }
    setMapsParseSuccess(null)
    setErrorMessage(null)
  }, [siteToEdit, isOpen])

  const handleAddSection = (presetTitleVi = '', presetTitleEn = '') => {
    const newSec: HeritageSectionItem = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      titleVi: presetTitleVi,
      titleEn: presetTitleEn,
      bodyVi: '',
      bodyEn: '',
    }
    setSections((prev) => [...prev, newSec])
  }

  const handleRemoveSection = (secId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== secId))
  }

  const handleUpdateSection = (
    secId: string,
    field: 'titleVi' | 'titleEn' | 'bodyVi' | 'bodyEn',
    val: string
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, [field]: val } : s))
    )
  }

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return
    }
    const nextIndex = direction === 'up' ? index - 1 : index + 1
    const next = [...sections]
    const temp = next[index]
    next[index] = next[nextIndex]
    next[nextIndex] = temp
    setSections(next)
  }

  if (!isOpen) return null

  // Auto-generate slug from name if not editing
  const handleNameViChange = (val: string) => {
    setNameVi(val)
    if (!isEditing) {
      const autoSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      setSlug(autoSlug)
    }
  }

  // Google Maps URL parser handler (supports short links, DMS, queries, and auto-area detection)
  const handleParseMapsUrl = async () => {
    setMapsParseSuccess(null)
    setErrorMessage(null)

    if (!googleMapsUrl.trim()) return

    setIsSubmitting(true)
    try {
      const coords = await resolveGoogleMapsCoordinates(googleMapsUrl)
      if (coords) {
        setLatitude(coords.latitude)
        setLongitude(coords.longitude)

        const detected = detectNearestArea(coords.latitude, coords.longitude)
        setAreaId(detected.areaId)

        const placeNote = coords.resolvedPlaceName ? ` "${coords.resolvedPlaceName}"` : ''
        setMapsParseSuccess(
          `Đã trích xuất thành công: ${coords.latitude}, ${coords.longitude}${placeNote} ➔ Tự động gán vào ${detected.areaNameVi} (${detected.regionSlug === 'bac' ? 'Miền Bắc' : detected.regionSlug === 'trung' ? 'Miền Trung' : 'Miền Nam'})`
        )
      } else {
        setErrorMessage(
          'Không thể tìm thấy tọa độ từ liên kết này. Bạn có thể dán tọa độ trực tiếp (Ví dụ: 10.776944, 106.7009 hoặc 10°46\'37"N 106°41\'43"E) hoặc chọn Tỉnh thành từ danh sách bên dưới.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      if (!nameVi.trim() || !storyVi.trim() || !coverImageUrl.trim()) {
        throw new Error('Vui lòng điền đầy đủ Tên tiếng Việt, Câu chuyện di sản và Ảnh bìa.')
      }

      const validSections = sections.filter((s) => s.titleVi.trim() || s.bodyVi.trim())

      if (isEditing && siteToEdit) {
        await updateHeritageSite(siteToEdit.id, {
          nameVi,
          nameEn: nameEn.trim() || nameVi.trim(),
          storyVi,
          storyEn: storyEn.trim() || storyVi.trim(),
          descriptionVi,
          descriptionEn,
          latitude,
          longitude,
          areaId,
          coverImageUrl,
          audioUrl,
          sourceReference,
          isPublished,
          sections: validSections,
        })
      } else {
        await createHeritageSite({
          slug: slug.trim() || `site-${Date.now()}`,
          nameVi,
          nameEn: nameEn.trim() || nameVi.trim(),
          storyVi,
          storyEn: storyEn.trim() || storyVi.trim(),
          descriptionVi,
          descriptionEn,
          latitude,
          longitude,
          areaId,
          coverImageUrl,
          audioUrl,
          sourceReference,
          isPublished,
          sections: validSections,
        })
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu di tích'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FAF6EE] border-2 border-[#D6AD60] rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DECB] bg-[#F7F0E2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B2E1E] to-[#6A1E14] text-[#F4E1BA] flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black text-[#2D2723]">
                {isEditing ? 'Chỉnh Sửa Thông Tin Di Tích' : 'Đăng Tải Di Sản / Địa Danh Mới'}
              </h2>
              <p className="text-[11px] text-[#7A6E60]">
                Cập nhật thông tin vào cơ sở dữ liệu và bản đồ di sản số
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B2E1E] flex items-center gap-1.5 border-b border-[#E8DECB] pb-1">
              <ChimLac className="w-3.5 h-3.5 text-[#8B2E1E]" />
              <span>1. Thông tin cơ bản</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#5D5246] mb-1">
                  Tên Di Tích (Tiếng Việt) *
                </label>
                <input
                  type="text"
                  required
                  value={nameVi}
                  onChange={(e) => handleNameViChange(e.target.value)}
                  placeholder="Ví dụ: Nhà thờ Đức Bà Sài Gòn"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6AD60]/60 bg-white text-xs sm:text-sm text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5D5246] mb-1">
                  Tên Di Tích (English)
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Notre Dame Cathedral Saigon"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6AD60]/60 bg-white text-xs sm:text-sm text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D5246] mb-1">
                Đường dẫn định danh (Slug URL) *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-2 rounded-xl border border-gray-200">
                  /heritage/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={isEditing}
                  placeholder="nha-tho-duc-ba-sai-gon"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#D6AD60]/60 bg-white text-xs sm:text-sm font-mono text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E] focus:outline-hidden disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Google Maps URL Auto-Extraction */}
          <div className="space-y-3 p-4 rounded-2xl bg-amber-50/70 border border-[#D6AD60]/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#8B2E1E]" />
                <span>2. Tọa độ thực tế từ Google Maps</span>
              </h3>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Tự động bóc tách
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] text-[#5D5246]">
                Dán đường link Google Maps (URL từ trình duyệt hoặc link chia sẻ) để tự động trích xuất tọa độ:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://www.google.com/maps/place/.../@10.7798,106.6990..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D6AD60] bg-white text-xs font-mono text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleParseMapsUrl}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] text-[#F7F0E2] font-serif font-bold text-xs border border-[#D6AD60] shadow-xs flex items-center gap-1.5 cursor-pointer hover:from-[#732619] shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F4E1BA]" />
                  <span>Trích xuất</span>
                </button>
              </div>

              {mapsParseSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{mapsParseSuccess}</span>
                </div>
              )}

              {/* Exact Lat / Lng inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[#5D5246] mb-1">
                    Vĩ độ (Latitude) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D6AD60]/60 bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5D5246] mb-1">
                    Kinh độ (Longitude) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D6AD60]/60 bg-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <a
                  href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B2E1E] hover:underline"
                >
                  <span>Mở kiểm tra vị trí trên Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Province / Area on Map */}
              <div className="pt-2 border-t border-[#D6AD60]/30 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-[#5D5246]">
                    Tỉnh / Thành phố hiển thị trên Bản đồ *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const detected = detectNearestArea(latitude, longitude)
                      setAreaId(detected.areaId)
                      setMapsParseSuccess(
                        `Đã nhận diện: ${detected.areaNameVi} (${detected.regionSlug === 'bac' ? 'Miền Bắc' : detected.regionSlug === 'trung' ? 'Miền Trung' : 'Miền Nam'})`
                      )
                    }}
                    className="text-[10px] text-[#8B2E1E] font-semibold hover:underline cursor-pointer"
                  >
                    Tự nhận diện theo tọa độ
                  </button>
                </div>
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D6AD60]/80 bg-white text-xs font-semibold text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E]"
                >
                  {OFFICIAL_REGIONS.map((region) => (
                    <optgroup key={region.id} label={`${region.nameVi} — ${region.nameEn}`}>
                      {region.areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.nameVi} ({region.nameVi})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500">
                  Địa danh sẽ xuất hiện ngay trên bản đồ của Tỉnh/Thành này và cập nhật số lượng di tích theo vùng.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Media & Assets */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B2E1E] flex items-center gap-1.5 border-b border-[#E8DECB] pb-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#8B2E1E]" />
              <span>3. Hình ảnh & Thuyết minh âm thanh</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#5D5246] mb-1">
                Đường dẫn Ảnh bìa (Cover Image URL) *
              </label>
              <input
                type="url"
                required
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6AD60]/60 bg-white text-xs sm:text-sm text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E] focus:outline-hidden"
              />
              {coverImageUrl && (
                <div className="mt-2 relative h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={coverImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px]">
                    Xem trước ảnh bìa
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D5246] mb-1 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-800" />
                <span>Đường dẫn Audio Thuyết minh (Tùy chọn)</span>
              </label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://.../audio.mp3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6AD60]/60 bg-white text-xs text-[#2D2723]"
              />
            </div>
          </div>

          {/* Section 4: Cultural Story Narrative */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B2E1E] flex items-center gap-1.5 border-b border-[#E8DECB] pb-1">
              <FileText className="w-3.5 h-3.5 text-[#8B2E1E]" />
              <span>4. Câu chuyện văn hóa & Lịch sử</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#5D5246] mb-1">
                Câu chuyện di sản (Tiếng Việt) *
              </label>
              <textarea
                required
                rows={4}
                value={storyVi}
                onChange={(e) => setStoryVi(e.target.value)}
                placeholder="Mô tả giá trị lịch sử, kiến trúc và câu chuyện văn hóa của địa danh..."
                className="w-full p-3.5 rounded-xl border border-[#D6AD60]/60 bg-white text-xs sm:text-sm text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D5246] mb-1">
                Câu chuyện di sản (English)
              </label>
              <textarea
                rows={3}
                value={storyEn}
                onChange={(e) => setStoryEn(e.target.value)}
                placeholder="Heritage narrative and cultural background in English..."
                className="w-full p-3.5 rounded-xl border border-[#D6AD60]/60 bg-white text-xs sm:text-sm text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#5D5246] mb-1">
                  Đoạn trích tóm tắt (Mô tả ngắn)
                </label>
                <input
                  type="text"
                  value={descriptionVi}
                  onChange={(e) => setDescriptionVi(e.target.value)}
                  placeholder="Hiện trên thẻ bản đồ tóm tắt"
                  className="w-full px-3 py-2 rounded-xl border border-[#D6AD60]/60 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5D5246] mb-1">
                  Nguồn trích dẫn tài liệu
                </label>
                <input
                  type="text"
                  value={sourceReference}
                  onChange={(e) => setSourceReference(e.target.value)}
                  placeholder="Cục Di sản Văn hóa Việt Nam"
                  className="w-full px-3 py-2 rounded-xl border border-[#D6AD60]/60 bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Rich Content Blocks (Bilingual) */}
          <div className="space-y-4 p-4 rounded-2xl bg-[#FAF6EE] border border-[#D6AD60]/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DECB] pb-2.5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B2E1E] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#8B2E1E]" />
                  <span>5. Khối nội dung chi tiết di sản (Song ngữ tự do)</span>
                </h3>
                <p className="text-[11px] text-[#5D5246] mt-0.5">
                  Thêm các đề mục như Kiến trúc, Hiện vật, Ý nghĩa tâm linh... hiển thị chi tiết trên trang di sản.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddSection('', '')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] text-[#F7F0E2] text-xs font-serif font-bold shadow-xs hover:from-[#732619] cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-[#F4E1BA]" />
                <span>Thêm đề mục</span>
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-700" />
                <span>Gợi ý mẫu:</span>
              </span>
              <button
                type="button"
                onClick={() => handleAddSection('Kiến trúc & Hoa văn đặc sắc', 'Distinctive Architecture & Motifs')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-[10px] font-medium text-amber-900 transition-colors cursor-pointer"
              >
                + Kiến trúc & Hoa văn
              </button>
              <button
                type="button"
                onClick={() => handleAddSection('Lịch sử & Niên đại hình thành', 'History & Chronology')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-[10px] font-medium text-amber-900 transition-colors cursor-pointer"
              >
                + Lịch sử & Niên đại
              </button>
              <button
                type="button"
                onClick={() => handleAddSection('Hiện vật & Điểm tham quan nổi bật', 'Prominent Relics & Highlights')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-[10px] font-medium text-amber-900 transition-colors cursor-pointer"
              >
                + Hiện vật & Điểm nhấn
              </button>
              <button
                type="button"
                onClick={() => handleAddSection('Kinh nghiệm & Lưu ý tham quan', 'Visitor Tips & Etiquette')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-[10px] font-medium text-amber-900 transition-colors cursor-pointer"
              >
                + Lưu ý tham quan
              </button>
            </div>

            {/* Sections List */}
            {sections.length === 0 ? (
              <div className="py-6 px-4 text-center rounded-xl border border-dashed border-[#D6AD60]/60 bg-white/60 space-y-2">
                <p className="text-xs text-gray-500">
                  Chưa có khối đề mục chi tiết nào. Bấm nút <strong>"Thêm đề mục"</strong> hoặc chọn từ gợi ý mẫu ở trên.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="p-3.5 rounded-xl bg-white border border-[#D6AD60]/70 shadow-2xs space-y-3"
                  >
                    {/* Block Toolbar */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#8B2E1E] to-[#6A1E14] text-[#F7F0E2] text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[#2D2723] line-clamp-1">
                          {sec.titleVi.trim() ? sec.titleVi : `Đề mục #${idx + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, 'up')}
                          title="Di chuyển lên"
                          className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sections.length - 1}
                          onClick={() => handleMoveSection(idx, 'down')}
                          title="Di chuyển xuống"
                          className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(sec.id)}
                          title="Xóa đề mục này"
                          className="p-1 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bilingual Titles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5D5246] mb-1">
                          Tiêu đề mục (Tiếng Việt) *
                        </label>
                        <input
                          type="text"
                          value={sec.titleVi}
                          onChange={(e) => handleUpdateSection(sec.id, 'titleVi', e.target.value)}
                          placeholder="Ví dụ: Kiến trúc mái vòm và họa tiết"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-[#FAF6EE]/40 text-xs text-[#2D2723] focus:ring-1 focus:ring-[#8B2E1E] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#5D5246] mb-1">
                          Tiêu đề mục (English)
                        </label>
                        <input
                          type="text"
                          value={sec.titleEn}
                          onChange={(e) => handleUpdateSection(sec.id, 'titleEn', e.target.value)}
                          placeholder="e.g. Dome architecture and decorative motifs"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-[#FAF6EE]/40 text-xs text-[#2D2723] focus:ring-1 focus:ring-[#8B2E1E] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Bilingual Body Texts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5D5246] mb-1">
                          Nội dung chi tiết (Tiếng Việt) *
                        </label>
                        <textarea
                          rows={3}
                          value={sec.bodyVi}
                          onChange={(e) => handleUpdateSection(sec.id, 'bodyVi', e.target.value)}
                          placeholder="Điền nội dung chi tiết của đề mục này..."
                          className="w-full p-2.5 rounded-lg border border-gray-200 bg-[#FAF6EE]/40 text-xs text-[#2D2723] focus:ring-1 focus:ring-[#8B2E1E] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#5D5246] mb-1">
                          Nội dung chi tiết (English)
                        </label>
                        <textarea
                          rows={3}
                          value={sec.bodyEn}
                          onChange={(e) => handleUpdateSection(sec.id, 'bodyEn', e.target.value)}
                          placeholder="Detailed narrative for this section in English..."
                          className="w-full p-2.5 rounded-lg border border-gray-200 bg-[#FAF6EE]/40 text-xs text-[#2D2723] focus:ring-1 focus:ring-[#8B2E1E] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Heritage Category Guide */}
          <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#D6AD60]/40 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-[#8B2E1E] mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#8B2E1E]">
                6. Phân loại & Bộ sưu tập giới hạn (Limited Edition)
              </p>
              <p className="text-[11px] text-[#5D5246] leading-relaxed">
                Sau khi tạo địa danh, bạn có thể chuyển sang tab <span className="font-bold text-[#8B2E1E]">"Mã QR & Quà Tặng"</span> để phát hành Bộ sưu tập quà tặng vật lý độc bản (Single-Claim Edition) với số lượng giới hạn gắn liền với địa danh này.
              </p>
            </div>
          </div>

          {/* Section 7: Publish Status Toggle */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E8DECB] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900">
                7. Xuất bản địa danh lên Bản đồ di sản
              </p>
              <p className="text-[11px] text-gray-500">
                Khi kích hoạt, người dùng có thể tìm thấy và mở khóa con dấu này trên bản đồ.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E8DECB]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2.5 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] hover:from-[#732619] hover:to-[#571910] text-[#F7F0E2] font-serif font-bold text-xs sm:text-sm border border-[#D6AD60] shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              <Save className="w-4 h-4 text-[#F4E1BA]" />
              <span>{isSubmitting ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi' : 'Đăng Tải Di Sản'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

