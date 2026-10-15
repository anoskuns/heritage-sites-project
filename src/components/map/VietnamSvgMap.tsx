import { useState } from 'react'
import { Compass } from 'lucide-react'
import { useTranslation } from '../../i18n'
import type { RegionItem } from '../../features/heritage'

interface VietnamSvgMapProps {
  regions: RegionItem[]
  selectedRegionSlug: string
  onSelectRegion: (slug: string) => void
  onSelectArea: (areaSlug: string, regionSlug: string) => void
  /** Đường dẫn tới bức ảnh Bản Đồ Việt Nam Màu Nước (1086x1448) */
  mapImageUrl?: string
}

/**
 * Tọa độ SVG Path (viewBox: 0 0 1086 1448) được trích xuất khớp 100%
 * với đường viền thực tế trên bức tranh "Bản Đồ Việt Nam Màu Nước Thanh Nhã.png"
 */
const REGION_SVG_CONFIG: Record<
  string,
  {
    id: string
    nameVi: string
    nameEn: string
    strokeColor: string
    fillColor: string
    glowColor: string
    badgeBg: string
    labelPos: { x: number; y: number }
    mainlandPath: string
    islandsPath?: string
  }
> = {
  bac: {
    id: 'bac',
    nameVi: 'Miền Bắc',
    nameEn: 'Northern Vietnam',
    strokeColor: '#16a34a', // green-600
    fillColor: 'rgba(34, 197, 94, 0.45)', // Richer green overlay
    glowColor: 'rgba(34, 197, 94, 0.85)',
    badgeBg: 'from-emerald-700 to-green-900',
    labelPos: { x: 435, y: 265 },
    mainlandPath:
      'M 426,114 L 444,122 L 463,144 L 485,152 L 502,168 L 538,162 L 552,186 L 548,214 L 580,242 L 605,248 L 622,262 L 650,271 L 635,286 L 604,302 L 582,328 L 548,354 L 518,388 L 496,422 L 482,456 L 456,472 L 428,472 L 398,465 L 368,450 L 348,430 L 352,412 L 385,402 L 404,386 L 396,368 L 368,360 L 336,348 L 306,332 L 284,312 L 274,282 L 245,252 L 236,222 L 204,195 L 200,174 L 222,168 L 265,188 L 310,178 L 325,152 L 362,164 L 385,135 L 408,128 Z',
    islandsPath:
      'M 588,342 C 598,340 602,352 592,358 C 582,360 580,346 588,342 Z M 695,355 C 712,350 720,368 702,378 C 685,382 682,362 695,355 Z',
  },
  trung: {
    id: 'trung',
    nameVi: 'Miền Trung',
    nameEn: 'Central Vietnam',
    strokeColor: '#ea580c', // orange-600
    fillColor: 'rgba(249, 115, 22, 0.45)', // Richer orange/amber overlay
    glowColor: 'rgba(234, 88, 12, 0.85)',
    badgeBg: 'from-amber-600 to-orange-800',
    labelPos: { x: 575, y: 745 },
    mainlandPath:
      'M 428,472 L 456,472 L 482,456 L 495,486 L 516,522 L 544,565 L 575,606 L 610,645 L 652,695 L 684,748 L 705,815 L 716,890 L 722,955 L 706,1022 L 672,1035 L 635,1020 L 585,1012 L 546,1008 L 538,975 L 545,925 L 536,872 L 520,825 L 512,778 L 522,728 L 502,682 L 472,632 L 452,585 L 426,535 L 412,498 Z',
    islandsPath:
      'M 586,614 C 594,614 594,624 586,624 C 580,624 580,614 586,614 Z M 708,802 C 718,802 718,818 708,818 C 700,818 700,802 708,802 Z M 880,610 C 945,595 985,645 940,705 C 895,755 835,735 825,685 C 818,645 845,618 880,610 Z',
  },
  nam: {
    id: 'nam',
    nameVi: 'Miền Nam',
    nameEn: 'Southern Vietnam',
    strokeColor: '#0284c7', // sky-600
    fillColor: 'rgba(14, 165, 233, 0.45)', // Richer azure overlay
    glowColor: 'rgba(2, 132, 199, 0.85)',
    badgeBg: 'from-sky-700 to-indigo-900',
    labelPos: { x: 485, y: 1155 },
    mainlandPath:
      'M 546,1008 L 585,1012 L 635,1020 L 672,1035 L 706,1022 L 702,1065 L 682,1112 L 642,1152 L 592,1180 L 545,1218 L 502,1262 L 448,1295 L 385,1332 L 352,1342 L 346,1305 L 355,1255 L 348,1215 L 322,1185 L 345,1165 L 365,1132 L 398,1122 L 432,1105 L 420,1072 L 438,1050 L 478,1055 L 495,1028 L 525,1022 Z',
    islandsPath:
      'M 272,1150 C 286,1150 288,1185 272,1192 C 258,1188 260,1155 272,1150 Z M 512,1302 C 535,1295 542,1325 518,1338 C 495,1342 492,1312 512,1302 Z M 860,1185 C 945,1165 980,1225 915,1285 C 845,1335 745,1335 735,1285 C 728,1235 795,1200 860,1185 Z',
  },
}

export function VietnamSvgMap({
  regions,
  selectedRegionSlug,
  onSelectRegion,
  onSelectArea,
  mapImageUrl = '/images/vietnam-watercolor-map.png',
}: VietnamSvgMapProps) {
  const { language } = useTranslation()
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-amber-900/15 bg-[#f5efe2] select-none group/map">
      {/* Top Floating Badge: Hướng dẫn tương tác */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-100 backdrop-blur-md shadow-md border border-amber-400/20">
          <Compass className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
          <span>
            {language === 'vi'
              ? 'Rê chuột hoặc chạm vào từng miền'
              : 'Hover or tap on a region'}
          </span>
        </div>

        {/* Bộ chọn nhanh 3 miền */}
        <div className="flex items-center gap-1 bg-white/85 backdrop-blur-md p-1 rounded-full shadow-md border border-amber-900/10 pointer-events-auto">
          {(['bac', 'trung', 'nam'] as const).map((slug) => {
            const isSelected = selectedRegionSlug === slug
            const label =
              slug === 'bac' ? 'Bắc' : slug === 'trung' ? 'Trung' : 'Nam'
            return (
              <button
                key={slug}
                type="button"
                onClick={() => onSelectRegion(slug)}
                onMouseEnter={() => setHoveredRegion(slug)}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-amber-950 hover:bg-amber-100/80'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Container giữ đúng tỷ lệ gốc 1086 x 1448 (3:4) của bức ảnh */}
      <div className="relative w-full aspect-[1086/1448]">
        {/* 1. Lớp ảnh nền màu nước gốc */}
        <img
          src={mapImageUrl}
          alt={
            language === 'vi'
              ? 'Bản đồ Việt Nam Màu Nước Thanh Nhã'
              : 'Vietnam Watercolor Heritage Map'
          }
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* 2. Lớp SVG định vị chính xác từng miền (viewBox 0 0 1086 1448) */}
        <svg
          viewBox="0 0 1086 1448"
          className="absolute inset-0 w-full h-full z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Hiệu ứng phát sáng viền khi hover/chọn */}
            <filter id="region-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="8"
                floodColor="#fef08a"
                floodOpacity="0.85"
              />
            </filter>
          </defs>

          {(['bac', 'trung', 'nam'] as const).map((slug) => {
            const cfg = REGION_SVG_CONFIG[slug]
            const regionInfo = regions.find((r) => r.slug === slug)
            const isHovered = hoveredRegion === slug
            const isSelected = selectedRegionSlug === slug
            const isActive = isHovered || isSelected
            const isDimmed =
              (hoveredRegion !== null && !isHovered) ||
              (hoveredRegion === null &&
                selectedRegionSlug !== '' &&
                !isSelected)

            return (
              <g
                key={slug}
                onClick={() => onSelectRegion(slug)}
                onMouseEnter={() => setHoveredRegion(slug)}
                onMouseLeave={() => setHoveredRegion(null)}
                className="cursor-pointer transition-all duration-200"
              >
                {/* Vùng đất liền */}
                <path
                  d={cfg.mainlandPath}
                  fill={
                    isActive
                      ? cfg.fillColor
                      : isDimmed
                        ? 'rgba(15, 10, 5, 0.22)'
                        : 'rgba(255, 255, 255, 0.05)'
                  }
                  stroke={isActive ? '#fde047' : cfg.strokeColor}
                  strokeWidth={isActive ? 6 : 2.5}
                  strokeLinejoin="round"
                  strokeDasharray={isActive ? 'none' : '8 6'}
                  strokeOpacity={isActive ? 1 : 0.55}
                  filter={isActive ? 'url(#region-glow)' : undefined}
                  style={{ pointerEvents: 'all' }}
                  className="transition-all duration-200"
                />

                {/* Vùng Hải đảo thuộc miền (Bạch Long Vĩ, Cô Tô, Hoàng Sa, Trường Sa, Phú Quốc, Côn Đảo) */}
                {cfg.islandsPath && (
                  <path
                    d={cfg.islandsPath}
                    fill={
                      isActive
                        ? cfg.fillColor
                        : 'rgba(255, 255, 255, 0.05)'
                    }
                    stroke={isActive ? '#fde047' : cfg.strokeColor}
                    strokeWidth={isActive ? 4 : 2}
                    strokeDasharray={isActive ? 'none' : '5 5'}
                    strokeOpacity={isActive ? 1 : 0.55}
                    filter={isActive ? 'url(#region-glow)' : undefined}
                    style={{ pointerEvents: 'all' }}
                    className="transition-all duration-200"
                  />
                )}

                {/* Nhãn tên Miền nổi bật trên bản đồ - bấm trực tiếp */}
                <g
                  transform={`translate(${cfg.labelPos.x}, ${cfg.labelPos.y})`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectRegion(slug)
                  }}
                  style={{ pointerEvents: 'all' }}
                  className={`cursor-pointer transition-transform duration-200 ${
                    isActive ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <rect
                    x="-78"
                    y="-24"
                    width="156"
                    height="48"
                    rx="24"
                    fill={isActive ? '#78350f' : 'rgba(255, 251, 235, 0.95)'}
                    stroke={isActive ? '#fde047' : '#b45309'}
                    strokeWidth={isActive ? 3.5 : 2}
                  />
                  <text
                    x="0"
                    y="-2"
                    textAnchor="middle"
                    fill={isActive ? '#ffffff' : '#78350f'}
                    fontSize="19"
                    fontWeight="800"
                    fontFamily="sans-serif"
                  >
                    {language === 'vi' ? cfg.nameVi : cfg.nameEn}
                  </text>
                  {regionInfo && (
                    <text
                      x="0"
                      y="16"
                      textAnchor="middle"
                      fill={isActive ? '#fde68a' : '#92400e'}
                      fontSize="13"
                      fontWeight="600"
                      fontFamily="sans-serif"
                    >
                      {regionInfo.unlockedCount}/{regionInfo.siteCount}{' '}
                      {language === 'vi' ? 'di tích' : 'sites'}
                    </text>
                  )}
                </g>
              </g>
            )
          })}

          {/* Đường ranh giới phân tách Bắc - Trung và Trung - Nam rõ nét */}
          <path
            d="M 398,465 L 428,472 L 456,472 L 482,456"
            fill="none"
            stroke="#fffbeb"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="pointer-events-none opacity-80"
          />
          <path
            d="M 546,1008 L 585,1012 L 635,1020 L 672,1035 L 706,1022"
            fill="none"
            stroke="#fffbeb"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="pointer-events-none opacity-80"
          />

          {/* Điểm ghim nổi bật (Hotspot Pin) cho TP. Hồ Chí Minh (x: 560, y: 1125) */}
          <g
            transform="translate(560, 1125)"
            onClick={(e) => {
              e.stopPropagation()
              onSelectArea('tp-ho-chi-minh', 'nam')
            }}
            className="cursor-pointer group/hcm"
          >
            {/* Vòng tròn lan tỏa (Pulse) */}
            <circle
              r="26"
              fill="rgba(220, 38, 38, 0.28)"
              className="animate-ping"
            />
            <circle
              r="14"
              fill="#dc2626"
              stroke="#fef08a"
              strokeWidth="3.5"
            />
            <circle r="5" fill="#fef08a" />

            {/* Nhãn TP.HCM */}
            <g transform="translate(22, -16)">
              <rect
                x="0"
                y="0"
                width="145"
                height="34"
                rx="10"
                fill="#991b1b"
                stroke="#fef08a"
                strokeWidth="2"
              />
              <text
                x="72"
                y="22"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="16"
                fontWeight="800"
                fontFamily="sans-serif"
              >
                ★ TP. Hồ Chí Minh
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}