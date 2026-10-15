/**
 * Validates whether a candidate redirect URL is a safe internal application path.
 * Strictly prevents open-redirect vulnerabilities to external domains.
 */
export function getSafeRedirectUrl(
  candidate: string | null | undefined,
  fallback = '/passport'
): string {
  if (!candidate || typeof candidate !== 'string') {
    return fallback
  }

  const trimmed = candidate.trim()

  // Must begin with a single slash
  if (!trimmed.startsWith('/')) {
    return fallback
  }

  // Reject protocol-relative URLs (e.g., //evil.com)
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback
  }

  // Reject internal protocols or embedded schemas
  if (
    trimmed.includes('://') ||
    trimmed.toLowerCase().startsWith('/javascript:') ||
    trimmed.toLowerCase().startsWith('/data:')
  ) {
    return fallback
  }

  // Prevent redirect loop to auth page itself
  if (trimmed === '/auth' || trimmed.startsWith('/auth?')) {
    return fallback
  }

  return trimmed
}

