import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AdminLayout,
  type AdminActiveTab,
} from './AdminLayout'
import { AdminOverviewTab } from './tabs/AdminOverviewTab'
import { AdminHeritageTab } from './tabs/AdminHeritageTab'
import { AdminUsersTab } from './tabs/AdminUsersTab'
import { AdminPostsTab } from './tabs/AdminPostsTab'
import { AdminQrTab } from './tabs/AdminQrTab'
import { AdminHeritageModal } from './components/AdminHeritageModal'
import {
  getAdminDashboardStats,
  fetchAllAdminSites,
  fetchAllAdminUsers,
  fetchAllAdminPosts,
  fetchAllAdminQrItems,
  type AdminDashboardStats,
  type AdminUserSummary,
  type AdminPostItem,
  type AdminQrItem,
} from '../../features/admin'
import type { HeritageSite } from '../../types/database.types'

export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as AdminActiveTab) || 'overview'
  const [activeTab, setActiveTab] = useState<AdminActiveTab>(initialTab)

  // Data states
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalSites: 0,
    publishedSites: 0,
    totalUsers: 0,
    totalAdminUsers: 0,
    totalQrTokens: 0,
    claimedQrTokens: 0,
    totalPosts: 0,
    publishedPosts: 0,
  })
  const [sites, setSites] = useState<HeritageSite[]>([])
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [posts, setPosts] = useState<AdminPostItem[]>([])
  const [qrItems, setQrItems] = useState<AdminQrItem[]>([])

  // Modal states
  const [isHeritageModalOpen, setIsHeritageModalOpen] = useState(false)
  const [siteToEdit, setSiteToEdit] = useState<HeritageSite | null>(null)

  // Data loader
  const loadAllData = useCallback(async () => {
    try {
      const [sData, sitesData, uData, pData, qrData] = await Promise.all([
        getAdminDashboardStats(),
        fetchAllAdminSites(),
        fetchAllAdminUsers(),
        fetchAllAdminPosts(),
        fetchAllAdminQrItems(),
      ])

      setStats(sData)
      setSites(sitesData)
      setUsers(uData)
      setPosts(pData)
      setQrItems(qrData)
    } catch (err) {
      console.warn('[AdminPage] Error loading admin dashboard data:', err)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Real-time synchronization event listeners
  useEffect(() => {
    const handleUpdate = () => {
      loadAllData()
    }
    window.addEventListener('heritage_sites_updated', handleUpdate)
    window.addEventListener('heritage_admin_users_updated', handleUpdate)
    window.addEventListener('heritage_admin_posts_updated', handleUpdate)
    window.addEventListener('heritage_admin_qr_updated', handleUpdate)
    return () => {
      window.removeEventListener('heritage_sites_updated', handleUpdate)
      window.removeEventListener('heritage_admin_users_updated', handleUpdate)
      window.removeEventListener('heritage_admin_posts_updated', handleUpdate)
      window.removeEventListener('heritage_admin_qr_updated', handleUpdate)
    }
  }, [loadAllData])

  const handleTabChange = (tab: AdminActiveTab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const handleOpenCreateSite = () => {
    setSiteToEdit(null)
    setIsHeritageModalOpen(true)
  }

  const handleOpenEditSite = (site: HeritageSite) => {
    setSiteToEdit(site)
    setIsHeritageModalOpen(true)
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onOpenCreateSite={handleOpenCreateSite}
    >
      {activeTab === 'overview' && (
        <AdminOverviewTab
          stats={stats}
          onNavigateTab={handleTabChange}
          onOpenCreateSite={handleOpenCreateSite}
          onOpenBatchQr={() => handleTabChange('qr')}
        />
      )}

      {activeTab === 'sites' && (
        <AdminHeritageTab
          sites={sites}
          onOpenCreate={handleOpenCreateSite}
          onOpenEdit={handleOpenEditSite}
          onRefresh={loadAllData}
        />
      )}

      {activeTab === 'users' && (
        <AdminUsersTab users={users} onRefresh={loadAllData} />
      )}

      {activeTab === 'posts' && (
        <AdminPostsTab posts={posts} onRefresh={loadAllData} />
      )}

      {activeTab === 'qr' && (
        <AdminQrTab
          qrItems={qrItems}
          sites={sites}
          onRefresh={loadAllData}
        />
      )}

      {/* Heritage Creation & Editing Modal */}
      <AdminHeritageModal
        isOpen={isHeritageModalOpen}
        onClose={() => setIsHeritageModalOpen(false)}
        siteToEdit={siteToEdit}
        onSuccess={loadAllData}
      />
    </AdminLayout>
  )
}

