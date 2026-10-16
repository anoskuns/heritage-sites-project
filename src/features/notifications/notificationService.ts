/**
 * Notification & Activity Log Service
 * Tracks user activity, QR scans, unlocks, and revocations with persistent logs.
 */

export type NotificationType =
  | 'unlock_success'
  | 'stamp_revoked'
  | 'scan_error'
  | 'auth'
  | 'system'

export interface ActivityNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  siteId?: string
  siteSlug?: string
  siteName?: string
  rawToken?: string
}

const STORAGE_KEY = 'heritage_activity_logs_v2'
const NOTIFICATION_EVENT = 'heritage_notification_updated'

export function getNotifications(): ActivityNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[NotificationService] Failed to parse notifications:', err)
    return []
  }
}

export function addNotification(
  item: Omit<ActivityNotification, 'id' | 'timestamp' | 'read'>
): ActivityNotification {
  const current = getNotifications()
  const newNotif: ActivityNotification = {
    ...item,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    read: false,
  }

  // Keep max 50 recent notifications
  const updated = [newNotif, ...current].slice(0, 50)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('[NotificationService] Failed to save notification:', err)
  }

  // Dispatch event so bell counter and dropdown update reactively
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: newNotif }))
  return newNotif
}

export function markAllAsRead(): void {
  const current = getNotifications()
  const updated = current.map((n) => ({ ...n, read: true }))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('[NotificationService] Failed to mark read:', err)
  }
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT))
}

export function clearNotifications(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('[NotificationService] Failed to clear notifications:', err)
  }
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT))
}

export function deleteNotification(id: string): void {
  const current = getNotifications()
  const updated = current.filter((n) => n.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('[NotificationService] Failed to delete notification:', err)
  }
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT))
}

export function getUnreadCount(): number {
  const current = getNotifications()
  return current.filter((n) => !n.read).length
}

