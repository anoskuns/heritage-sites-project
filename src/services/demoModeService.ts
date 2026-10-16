import { useState, useEffect } from 'react'

const DEMO_MODE_STORAGE_KEY = 'heritage_demo_mode_active'

/**
 * Checks if Demo / QA Testing Mode is currently active.
 *
 * Priority:
 * 1. URL search param: ?demo=true | ?demo=1 | ?dev=true (saves to localStorage)
 * 2. URL search param: ?demo=false | ?demo=0 (removes from localStorage)
 * 3. localStorage preference: 'true'
 * 4. Default: FALSE (hidden for production/standard UI)
 */
export function isDemoModeActive(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const params = new URLSearchParams(window.location.search)
    const demoParam = params.get('demo') || params.get('dev')

    if (demoParam === 'true' || demoParam === '1') {
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true')
      return true
    }

    if (demoParam === 'false' || demoParam === '0') {
      localStorage.removeItem(DEMO_MODE_STORAGE_KEY)
      return false
    }

    return localStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Programmatically enables or disables Demo Mode and dispatches a global update event.
 */
export function setDemoMode(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true')
    } else {
      localStorage.removeItem(DEMO_MODE_STORAGE_KEY)
    }

    window.dispatchEvent(
      new CustomEvent('heritage_demo_mode_changed', {
        detail: { enabled },
      })
    )
  } catch (err) {
    console.warn('[DemoModeService] Failed to update localStorage:', err)
  }
}

/**
 * React hook to reactively subscribe to Demo Mode state changes.
 */
export function useDemoMode(): {
  isDemoMode: boolean
  toggleDemoMode: () => void
  enableDemoMode: () => void
  disableDemoMode: () => void
} {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => isDemoModeActive())

  useEffect(() => {
    const handleUpdate = () => {
      setIsDemoMode(isDemoModeActive())
    }

    window.addEventListener('heritage_demo_mode_changed', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('heritage_demo_mode_changed', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const toggleDemoMode = () => {
    setDemoMode(!isDemoMode)
  }

  const enableDemoMode = () => {
    setDemoMode(true)
  }

  const disableDemoMode = () => {
    setDemoMode(false)
  }

  return {
    isDemoMode,
    toggleDemoMode,
    enableDemoMode,
    disableDemoMode,
  }
}

