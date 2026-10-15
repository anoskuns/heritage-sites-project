import { useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles, AlertTriangle, CheckCircle2, QrCode } from 'lucide-react'
import { DEMO_TOKENS } from './qrService'
import { useTranslation } from '../../i18n'

interface DemoTokenPickerProps {
  onSelectToken: (token: string) => void
  activeToken?: string
}

export function DemoTokenPicker({ onSelectToken, activeToken }: DemoTokenPickerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { t, language } = useTranslation()

  return (
    <div className="border border-amber-200/90 bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-2xl p-4 transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-600/10 text-amber-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
              {t.qrUnlock.demoSectionTitle}
            </h3>
            <p className="text-[11px] text-gray-500">
              {t.qrUnlock.demoSectionSubtitle}
            </p>
          </div>
        </div>
        <div className="p-1 text-gray-400 group-hover:text-gray-700 transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-amber-200/60 space-y-2 animate-fadeIn">
          <p className="text-[11px] text-amber-900/70 italic mb-2">
            {language === 'vi'
              ? 'Nhấn vào một mã bên dưới để điền tự động và kiểm tra luồng mở khóa:'
              : 'Click any token below to auto-fill and test the unlock flow:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_TOKENS.map((item) => {
              const isSelected = activeToken === item.rawToken
              const isRevoked = item.status === 'revoked'

              return (
                <button
                  key={item.rawToken}
                  type="button"
                  onClick={() => onSelectToken(item.rawToken)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'border-amber-600 bg-amber-100/70 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-gray-900 leading-tight">
                      {language === 'vi' ? item.siteNameVi : item.siteNameEn}
                    </span>
                    {isRevoked ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        Revoked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono mt-1">
                    <span className="truncate max-w-[190px]">{item.rawToken}</span>
                    <QrCode className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

