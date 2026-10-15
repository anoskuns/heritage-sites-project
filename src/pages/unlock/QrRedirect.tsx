import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../i18n'

export function QrRedirect() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (token) {
      navigate(`/unlock?token=${encodeURIComponent(token)}`, { replace: true })
    } else {
      navigate('/unlock', { replace: true })
    }
  }, [token, navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 space-y-4">
      <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-700 rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-500 animate-pulse">
        {t.common.loading}
      </p>
    </div>
  )
}

