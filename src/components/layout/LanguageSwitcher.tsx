import { useTranslation, type Language } from '../../i18n'

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation()

  const handleToggle = (lang: Language) => {
    if (lang !== language) {
      setLanguage(lang)
    }
  }

  return (
    <div
      role="group"
      aria-label="Language selection"
      className="inline-flex items-center rounded-full bg-amber-50 p-1 border border-amber-200/80 shadow-xs"
    >
      <button
        type="button"
        onClick={() => handleToggle('vi')}
        aria-pressed={language === 'vi'}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-150 ${
          language === 'vi'
            ? 'bg-amber-700 text-white shadow-xs'
            : 'text-amber-900/70 hover:text-amber-950'
        }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => handleToggle('en')}
        aria-pressed={language === 'en'}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-150 ${
          language === 'en'
            ? 'bg-amber-700 text-white shadow-xs'
            : 'text-amber-900/70 hover:text-amber-950'
        }`}
      >
        EN
      </button>
    </div>
  )
}

