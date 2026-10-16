import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  CheckCircle2,
  EyeOff,
  Crown,
  Landmark,
  Sparkles,
} from 'lucide-react'
import type { HeritageSite } from '../../../types/database.types'
import {
  toggleSitePublishStatus,
  deleteHeritageSite,
  getLocalBatchesRegistry,
} from '../../../features/admin'
import { saveLocalUnlockedStamp } from '../../../features/passport/passportStorageService'
import { useAuth } from '../../../features/authentication'

interface AdminHeritageTabProps {
  sites: HeritageSite[]
  onOpenCreate: () => void
  onOpenEdit: (site: HeritageSite) => void
  onRefresh: () => void
}

export function AdminHeritageTab({
  sites,
  onOpenCreate,
  onOpenEdit,
  onRefresh,
}: AdminHeritageTabProps) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'limited' | 'standard' | 'published' | 'draft'>('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Get active collection batches to determine which sites have limited collections
  const batches = useMemo(() => getLocalBatchesRegistry(), [])

  // Create mapping of siteId/siteSlug to limited batches
  const siteBatchMap = useMemo(() => {
    const map = new Map<string, typeof batches[0]>()
    for (const b of batches) {
      if (b.siteId) map.set(b.siteId, b)
      if (b.siteSlug) map.set(b.siteSlug, b)
    }
    return map
  }, [batches])

  const limitedCount = useMemo(() => {
    return sites.filter((s) => siteBatchMap.has(s.id) || siteBatchMap.has(s.slug)).length
  }, [sites, siteBatchMap])

  const standardCount = sites.length - limitedCount
  const publishedCount = sites.filter((s) => s.is_published).length
  const draftCount = sites.length - publishedCount

  const filteredSites = sites.filter((s) => {
    const matchesSearch =
      s.name_vi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    const hasBatch = siteBatchMap.has(s.id) || siteBatchMap.has(s.slug)

    if (filterType === 'limited') return hasBatch
    if (filterType === 'standard') return !hasBatch
    if (filterType === 'published') return s.is_published
    if (filterType === 'draft') return !s.is_published
    return true
  })

  const handleTogglePublish = async (site: HeritageSite) => {
    try {
      await toggleSitePublishStatus(site.id, site.is_published)
      onRefresh()
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
    }
  }

  const handleQuickUnlock = (site: HeritageSite) => {
    saveLocalUnlockedStamp(site.id, site.slug, user?.id)
    window.dispatchEvent(
      new CustomEvent('heritage_site_unlocked', {
        detail: { siteId: site.id, siteSlug: site.slug, userId: user?.id },
      })
    )
    setToastMessage(`Đã mở khóa thử nghiệm di sản "${site.name_vi}"! Bạn có thể xem trang và thử đăng ảnh kỷ niệm ngay.`)
    setTimeout(() => setToastMessage(null), 5000)
  }

  const handleDelete = async (site: HeritageSite) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa di tích "${site.name_vi}" (${site.slug}) không?\n\nThao tác này sẽ gỡ bỏ địa danh khỏi bản đồ di sản.`
    )
    if (!confirmed) return

    try {
      await deleteHeritageSite(site.id)
      onRefresh()
    } catch (err) {
      console.error('Failed to delete site:', err)
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Top Bar: Search, Filters & Create Button */}
      <div className="bg-white border border-[#E8DECB] rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên di tích hoặc slug..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-[#FAF6EE]/50 text-xs sm:text-sm text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E] focus:outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={onOpenCreate}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] hover:from-[#732619] hover:to-[#571910] text-[#F7F0E2] font-serif font-bold text-xs sm:text-sm border border-[#D6AD60] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#F4E1BA]" />
            <span>Thêm Di Sản Mới</span>
          </button>
        </div>

        {/* Filter Pills with Clear Categorization */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-gray-100 p-1 rounded-xl w-full">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Tất cả ({sites.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('limited')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterType === 'limited'
                ? 'bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] text-[#FAF6EE] shadow-2xs'
                : 'text-amber-900 hover:text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-[#D6AD60]" />
            <span>BST Giới Hạn ({limitedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('standard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterType === 'standard'
                ? 'bg-white text-blue-900 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-blue-600" />
            <span>Phổ Biến / Tiêu Chuẩn ({standardCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'published'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Đã xuất bản ({publishedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'draft'
                ? 'bg-white text-amber-800 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Bản nháp ({draftCount})
          </button>
        </div>
      </div>

      {/* Heritage Sites Table */}
      <div className="bg-white border border-[#E8DECB] rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EE] text-[#5D5246] border-b border-[#E8DECB] uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Di sản / Địa danh</th>
                <th className="py-3 px-4">Phân loại & Bộ Sưu Tập</th>
                <th className="py-3 px-4">Tọa độ GPS</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Không tìm thấy di tích nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredSites.map((site) => {
                  const associatedBatch = siteBatchMap.get(site.id) || siteBatchMap.get(site.slug)

                  return (
                    <tr key={site.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                      {/* Site Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={site.cover_image_url}
                            alt={site.name_vi}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0 bg-gray-100"
                          />
                          <div className="space-y-0.5">
                            <span className="font-bold text-sm text-[#2D2723] hover:text-[#8B2E1E] transition-colors block">
                              {site.name_vi}
                            </span>
                            <span className="text-[11px] text-gray-500 font-mono block">
                              /heritage/{site.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Limited Collection vs Standard Categorization */}
                      <td className="py-3 px-4">
                        {associatedBatch ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100/60 border border-[#D6AD60] text-[#8B2E1E] font-bold text-[11px] shadow-2xs">
                              <Crown className="w-3.5 h-3.5 text-[#D6AD60] shrink-0" />
                              <span>BST Giới Hạn: {associatedBatch.batchCode}</span>
                            </span>
                            <p className="text-[10px] text-gray-500 line-clamp-1 max-w-[200px]" title={associatedBatch.nameVi}>
                              {associatedBatch.nameVi} ({associatedBatch.totalQuantity} bản)
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 font-medium text-[11px]">
                            <Landmark className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>Địa danh Phổ Biến</span>
                          </span>
                        )}
                      </td>

                      {/* Coordinates */}
                      <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                        <a
                          href={`https://www.google.com/maps?q=${site.latitude},${site.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-[#8B2E1E] hover:underline"
                          title="Mở trên Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#D6AD60] shrink-0" />
                          <span>
                            {Number(site.latitude).toFixed(4)}, {Number(site.longitude).toFixed(4)}
                          </span>
                        </a>
                      </td>

                      {/* Publish Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(site)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            site.is_published
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title="Bấm để bật/tắt xuất bản di tích này"
                        >
                          {site.is_published ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Đã xuất bản</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-gray-500" />
                              <span>Bản nháp (Ẩn)</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickUnlock(site)}
                            title="Mở khóa thử nghiệm con dấu này vào Hộ chiếu để kiểm tra đăng ảnh kỷ niệm"
                            className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          </button>

                          <Link
                            to={`/heritage/${site.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Xem trang chi tiết công khai"
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => onOpenEdit(site)}
                            title="Chỉnh sửa thông tin"
                            className="p-1.5 rounded-lg border border-[#D6AD60]/60 bg-amber-50 hover:bg-amber-100 text-[#8B2E1E] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(site)}
                            title="Xóa di tích"
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
