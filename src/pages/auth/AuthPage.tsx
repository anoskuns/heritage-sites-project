import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Landmark, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth, getSafeRedirectUrl } from '../../features/authentication'
import { useTranslation } from '../../i18n'
import { useDemoMode } from '../../services/demoModeService'
import { purgeThangLongStrayCache } from '../../features/passport'

export function AuthPage() {
  const { user, signIn, signUp, isLoading: isAuthLoading } = useAuth()
  const { t, language } = useTranslation()
  const { isDemoMode, toggleDemoMode } = useDemoMode()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const redirectTo = searchParams.get('redirectTo')
  const safeRedirectDestination = getSafeRedirectUrl(redirectTo, '/passport')

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate(safeRedirectDestination, { replace: true })
    }
  }, [user, isAuthLoading, navigate, safeRedirectDestination])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setInfoMessage(null)

    // Form validation
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setErrorMessage(t.auth.emailLabel)
      return
    }

    if (password.length < 6) {
      setErrorMessage(t.auth.passwordPlaceholder)
      return
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setErrorMessage(t.auth.passwordMismatch)
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (isSignUp) {
        const result = await signUp(
          trimmedEmail,
          password,
          displayName.trim() || undefined,
          language
        )

        if (!result.success) {
          if (result.error?.toLowerCase().includes('already registered')) {
            setErrorMessage(t.auth.userAlreadyExists)
          } else {
            setErrorMessage(result.error || t.auth.authErrorGeneric)
          }
          return
        }

        if (result.needsEmailConfirmation) {
          setInfoMessage(t.auth.emailConfirmationSent)
          setIsSignUp(false)
          setPassword('')
          setConfirmPassword('')
          return
        }

        // Direct session creation on signup -> redirect
        navigate(safeRedirectDestination, { replace: true })
      } else {
        const result = await signIn(trimmedEmail, password)

        if (!result.success) {
          if (
            result.error?.toLowerCase().includes('invalid login credentials') ||
            result.error?.toLowerCase().includes('invalid credentials')
          ) {
            setErrorMessage(t.auth.invalidCredentials)
          } else {
            setErrorMessage(result.error || t.auth.authErrorGeneric)
          }
          return
        }

        // Clean up stray demo cache if signing into demo account
        if (trimmedEmail.toLowerCase() === 'demo@heritage.vn') {
          try {
            await purgeThangLongStrayCache()
          } catch {
            // ignore
          }
        }

        // Successful sign-in -> navigate to safe destination
        navigate(safeRedirectDestination, { replace: true })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 sm:py-12">
      <div className="w-full max-w-md bg-white border border-gray-200/90 rounded-2xl shadow-xl shadow-amber-900/5 p-6 sm:p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-red-700 items-center justify-center text-white shadow-md shadow-amber-900/20 mb-1">
            <Landmark className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isSignUp ? t.auth.signupTitle : t.auth.loginTitle}
          </h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            {isSignUp ? t.auth.signupSubtitle : t.auth.loginSubtitle}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false)
              setErrorMessage(null)
              setInfoMessage(null)
            }}
            disabled={isSubmitting}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              !isSignUp
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.auth.loginButton}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true)
              setErrorMessage(null)
              setInfoMessage(null)
            }}
            disabled={isSubmitting}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              isSignUp
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.auth.signupButton}
          </button>
        </div>

        {/* Info or error feedback banners */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="flex-1">{infoMessage}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name (Only in SignUp) */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label
                htmlFor="displayName"
                className="block text-xs font-semibold text-gray-700"
              >
                {t.auth.displayNameLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t.auth.displayNamePlaceholder}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors disabled:bg-gray-50 disabled:opacity-70"
                />
              </div>
            </div>
          )}

          {/* Quick Demo Credentials Panel (Only visible in Demo/QA Mode) */}
          {!isSignUp && isDemoMode && (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs space-y-2 animate-fadeIn shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t.auth.demoAccountTitle}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('demo@heritage.vn')
                      setPassword('DemoPassword123!')
                      setErrorMessage(null)
                      setInfoMessage(null)
                      void purgeThangLongStrayCache()
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-800 hover:bg-amber-900 active:scale-95 text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    {t.auth.fillDemoCta}
                  </button>
                  <button
                    type="button"
                    onClick={toggleDemoMode}
                    className="text-[10px] text-amber-700 hover:text-red-700 underline cursor-pointer"
                    title="Ẩn thông tin tài khoản mẫu"
                  >
                    Ẩn
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-amber-900/90 font-mono space-y-0.5">
                <p>Email: <span className="font-semibold">demo@heritage.vn</span></p>
                <p>Mật khẩu: <span className="font-semibold">DemoPassword123!</span></p>
              </div>
              <p className="text-[10px] text-amber-700 italic">
                {t.auth.demoNote}
              </p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700"
            >
              {t.auth.emailLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                disabled={isSubmitting}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors disabled:bg-gray-50 disabled:opacity-70"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-700"
            >
              {t.auth.passwordLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                disabled={isSubmitting}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors disabled:bg-gray-50 disabled:opacity-70"
              />
            </div>
          </div>

          {/* Confirm Password (Only in SignUp) */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-gray-700"
              >
                {t.auth.confirmPasswordLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors disabled:bg-gray-50 disabled:opacity-70"
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-sm shadow-md shadow-amber-900/10 flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>
                  {isSignUp ? t.auth.signingUp : t.auth.loggingIn}
                </span>
              </>
            ) : (
              <>
                <span>
                  {isSignUp ? t.auth.signupButton : t.auth.loginButton}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="text-center pt-2 border-t border-gray-100 text-xs sm:text-sm text-gray-500">
          {isSignUp ? (
            <p>
              {t.auth.haveAccount}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false)
                  setErrorMessage(null)
                  setInfoMessage(null)
                }}
                disabled={isSubmitting}
                className="font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2 ml-1"
              >
                {t.auth.loginPrompt}
              </button>
            </p>
          ) : (
            <p>
              {t.auth.noAccount}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true)
                  setErrorMessage(null)
                  setInfoMessage(null)
                }}
                disabled={isSubmitting}
                className="font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2 ml-1"
              >
                {t.auth.signupPrompt}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
