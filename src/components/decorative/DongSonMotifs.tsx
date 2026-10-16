import React from 'react'

/**
 * Biểu tượng Chim Hạc / Chim Lạc sải cánh bay theo phong cách Trống đồng Đông Sơn
 */
export function ChimLac({ className = 'w-6 h-6', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Thân & Cánh chim Lạc vút bay cổ truyền */}
      <path
        d="M 5,28 C 18,22 32,15 48,12 C 58,10 70,8 88,4 C 95,2 98,6 94,10 C 86,18 74,24 64,28 C 76,27 86,28 96,30 C 99,31 98,34 94,35 C 84,37 72,36 60,37 C 52,38 42,42 32,48 C 22,54 12,58 4,56 C 1,55 2,50 6,47 C 14,41 24,37 34,34 C 24,34 14,32 5,28 Z"
      />
      {/* Mỏ dài và mắt chim */}
      <path
        d="M 88,4 C 94,3 99,2 100,1 C 98,4 94,7 91,9 Z"
      />
      <circle cx="82" cy="9" r="1.5" fill="#fdfaf3" />
    </svg>
  )
}

/**
 * Mặt trời Trống đồng Đông Sơn 14 tia tinh xảo với các vành hoa văn đồng tâm
 */
export function DongSonSun({ className = 'w-24 h-24', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tâm mặt trời và 14 tia sáng */}
      <circle cx="100" cy="100" r="12" fill="currentColor" opacity="0.3" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="5" fill="currentColor" />
      
      {/* 14 tia sáng tỏa đều */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i * 360) / 14
        return (
          <polygon
            key={i}
            points="97,85 103,85 100,68"
            fill="currentColor"
            transform={`rotate(${angle} 100 100)`}
          />
        )
      })}

      {/* Vành 1: Vòng tròn đồng tâm */}
      <circle cx="100" cy="100" r="34" strokeWidth="1.2" strokeDasharray="2 2" />
      <circle cx="100" cy="100" r="38" strokeWidth="1" />

      {/* Vành 2: Họa tiết răng lược / tia chấm */}
      <circle cx="100" cy="100" r="48" strokeWidth="1.2" strokeDasharray="3 2" />
      <circle cx="100" cy="100" r="54" strokeWidth="1.5" />

      {/* Vành 3: 4 con chim Lạc bay ngược chiều kim đồng hồ quanh tâm */}
      {[0, 90, 180, 270].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 100 100) translate(100, 36) scale(0.22)`}>
          <path
            d="M -30,0 C -15,-6 5,-12 25,-16 C 36,-17 48,-18 60,-20 C 50,-10 38,-4 26,0 C 38,0 48,2 58,5 C 44,7 30,7 18,8 C 8,14 -4,22 -18,26 C -6,18 4,14 14,10 C 2,10 -15,8 -30,0 Z"
            fill="currentColor"
          />
        </g>
      ))}

      {/* Vành 4: Viền ngoài chấm tròn và vòng tròn lớn */}
      <circle cx="100" cy="100" r="76" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx="100" cy="100" r="82" strokeWidth="1.8" />
      <circle cx="100" cy="100" r="88" strokeWidth="1" strokeDasharray="4 2" />
      <circle cx="100" cy="100" r="95" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * Hoa văn góc triện đồng cổ truyền cho thẻ bài di sản
 */
export function HeritageCorner({ className = 'w-6 h-6', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path d="M2 30 V6 C2 3.79 3.79 2 6 2 H30" />
      <path d="M7 26 V10 C7 8.34 8.34 7 10 7 H26" strokeWidth="1" strokeOpacity="0.7" />
      <circle cx="14" cy="14" r="2.5" fill="currentColor" stroke="none" opacity="0.8" />
    </svg>
  )
}

/**
 * Biểu tượng Hoa sen cổ cách điệu (Lotus Emblem)
 */
export function LotusEmblem({ className = 'w-6 h-6', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Cánh sen chính giữa */}
      <path
        d="M 18,4 C 18,4 12,12 12,18 C 12,21.3 14.7,24 18,24 C 21.3,24 24,21.3 24,18 C 24,12 18,4 18,4 Z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      {/* Cánh sen trái */}
      <path
        d="M 12,18 C 8,14 4,18 4,22 C 4,26.4 8.5,28 14,26 C 13,23.5 12.3,20.8 12,18 Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Cánh sen phải */}
      <path
        d="M 24,18 C 28,14 32,18 32,22 C 32,26.4 27.5,28 22,26 C 23,23.5 23.7,20.8 24,18 Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Đế đài sen & nhụy */}
      <path d="M 10,29 C 14,31 22,31 26,29" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 13,32 C 16,33.5 20,33.5 23,32" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
    </svg>
  )
}

/**
 * Dải diềm hoa văn răng cưa sóng nước Đông Sơn
 */
export function DongSonBorderLine({ className = 'w-full h-3', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 600 12"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
      {...props}
    >
      <pattern id="dongson-pattern" width="30" height="12" patternUnits="userSpaceOnUse">
        <path d="M 0,6 L 15,0 L 30,6 L 15,12 Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <circle cx="15" cy="6" r="1.5" fill="currentColor" opacity="0.8" />
      </pattern>
      <rect width="600" height="12" fill="url(#dongson-pattern)" />
    </svg>
  )
}

export { DongSonSun as DongSonIcon, DongSonSun as TrongDongGold }

