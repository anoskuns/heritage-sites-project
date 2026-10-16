import React, { useState, useMemo, useEffect } from 'react'
import {
  QrCode,
  Plus,
  Copy,
  Check,
  RotateCcw,
  Ban,
  Printer,
  Sparkles,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Crown,
  Search,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Landmark,
  Eye,
} from 'lucide-react'
import type {
  AdminQrItem,
  CollectionBatchItem,
} from '../../../features/admin'
import {
  fetchAllCollectionBatches,
  createCollectionBatch,
  updateBatchStatus,
  adminResetOrRevokeQrItem,
  exportQrItemsToCsv,
} from '../../../features/admin'
import type { HeritageSite } from '../../../types/database.types'

interface AdminQrTabProps {
  qrItems: AdminQrItem[]
  sites: HeritageSite[]
  onRefresh: () => void
}

export function AdminQrTab({ qrItems, sites, onRefresh }: AdminQrTabProps) {
  // Navigation & Drill-Down State
  // selectedBatchId: null = Batches overview; string = Focused batch drill-down; 'all' = Global UID lookup
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)

  // Batches list state
  const [batches, setBatches] = useState<CollectionBatchItem[]>([])
  const [batchSearchTerm, setBatchSearchTerm] = useState('')
  const [batchStatusFilter, setBatchStatusFilter] = useState<string>('all')

  // Items search & filter state
  const [itemSearchTerm, setItemSearchTerm] = useState('')
  const [itemStatusFilter, setItemStatusFilter] = useState<string>('all')

  // Create Batch Modal state
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false)
  const [batchSiteId, setBatchSiteId] = useState(sites[0]?.id || '')
  const [batchNameVi, setBatchNameVi] = useState('')
  const [batchNameEn, setBatchNameEn] = useState('')
  const [batchPrefix, setBatchPrefix] = useState('HTTL26')
  const [batchQuantity, setBatchQuantity] = useState(200)
  const [batchInitialStatus, setBatchInitialStatus] = useState<'draft' | 'printing' | 'active'>('printing')
  const [batchDescription, setBatchDescription] = useState('')
  const [batchBaseUrl, setBatchBaseUrl] = useState(
    typeof window !== 'undefined' ? window.location.origin : 'https://heritagedmst.vn'
  )
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false)

  // QR Preview Modal state
  const [previewQrItem, setPreviewQrItem] = useState<AdminQrItem | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  // Reset / Revoke Action Modal state
  const [actionItem, setActionItem] = useState<AdminQrItem | null>(null)
  const [actionMode, setActionMode] = useState<'reset_available' | 'revoke_void'>('reset_available')
  const [actionReason, setActionReason] = useState('')
  const [isExecutingAction, setIsExecutingAction] = useState(false)

  // Load batches on mount
  const loadBatches = async () => {
    const data = await fetchAllCollectionBatches()
    setBatches(data)
  }

  useEffect(() => {
    loadBatches()
  }, [])

  // Auto-sync batch site selection if empty
  useEffect(() => {
    if (!batchSiteId && sites.length > 0) {
      setBatchSiteId(sites[0].id)
    }
  }, [sites, batchSiteId])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToken(id)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  // Active batch object if drilling down into a batch
  const currentBatch = useMemo(() => {
    if (!selectedBatchId || selectedBatchId === 'all') return null
    return batches.find((b) => b.id === selectedBatchId) || null
  }, [batches, selectedBatchId])

  // Filtered Batches for View 1
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      if (batchStatusFilter !== 'all' && b.status !== batchStatusFilter) return false
      if (batchSearchTerm.trim()) {
        const query = batchSearchTerm.toLowerCase().trim()
        const matchesName = b.nameVi.toLowerCase().includes(query) || (b.nameEn && b.nameEn.toLowerCase().includes(query))
        const matchesCode = b.batchCode.toLowerCase().includes(query)
        const matchesSite = b.siteNameVi.toLowerCase().includes(query)
        if (!matchesName && !matchesCode && !matchesSite) return false
      }
      return true
    })
  }, [batches, batchStatusFilter, batchSearchTerm])

  // Filtered Items for View 2 & Global
  const filteredItems = useMemo(() => {
    return qrItems.filter((item) => {
      // If drilling down into a batch, only include that batch's items
      if (selectedBatchId && selectedBatchId !== 'all' && item.batchId !== selectedBatchId) {
        return false
      }

      // Filter by Status
      if (itemStatusFilter !== 'all' && item.status !== itemStatusFilter) {
        return false
      }

      // Search term
      if (itemSearchTerm.trim()) {
        const query = itemSearchTerm.toLowerCase().trim()
        const matchesSerial = item.serialCode.toLowerCase().includes(query)
        const matchesToken = item.rawToken.toLowerCase().includes(query)
        const matchesSite = item.siteNameVi.toLowerCase().includes(query)
        const matchesUser = item.claimedByUserName?.toLowerCase().includes(query)
        const matchesUid = item.claimedByUserId?.toLowerCase().includes(query)
        if (!matchesSerial && !matchesToken && !matchesSite && !matchesUser && !matchesUid) {
          return false
        }
      }

      return true
    })
  }, [qrItems, selectedBatchId, itemStatusFilter, itemSearchTerm])

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const totalBatches = batches.length
    const totalItems = qrItems.length
    const printingItems = qrItems.filter((i) => i.status === 'printing').length
    const availableItems = qrItems.filter((i) => i.status === 'available').length
    const claimedItems = qrItems.filter((i) => i.status === 'claimed').length
    const revokedItems = qrItems.filter((i) => i.status === 'revoked').length
    return {
      totalBatches,
      totalItems,
      printingItems,
      availableItems,
      claimedItems,
      revokedItems,
    }
  }, [batches, qrItems])

  // Submit new batch creation
  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingBatch(true)

    try {
      const selectedSite = sites.find((s) => s.id === batchSiteId) || sites[0]
      if (!selectedSite) {
        alert('Vui lòng chọn di tích liên kết.')
        return
      }

      const generated = await createCollectionBatch({
        siteId: selectedSite.id,
        siteSlug: selectedSite.slug,
        siteNameVi: selectedSite.name_vi,
        nameVi: batchNameVi.trim() || `Bộ Sưu Tập ${selectedSite.name_vi}`,
        nameEn: batchNameEn.trim() || selectedSite.name_en,
        batchCodePrefix: batchPrefix.trim().toUpperCase() || 'HERITAGE',
        totalQuantity: Math.min(Math.max(Number(batchQuantity) || 1, 1), 1000),
        initialStatus: batchInitialStatus,
        description: batchDescription.trim(),
        baseUrl: batchBaseUrl.trim(),
      })

      await loadBatches()
      onRefresh()
      setIsCreateBatchModalOpen(false)

      // Drill down immediately into the newly generated batch
      setSelectedBatchId(generated.batch.id)

      // Reset form
      setBatchNameVi('')
      setBatchNameEn('')
      setBatchDescription('')
    } catch (err) {
      console.error('Failed to create batch:', err)
      alert('Có lỗi xảy ra khi tạo đợt phát hành mới.')
    } finally {
      setIsSubmittingBatch(false)
    }
  }

  // Export CSV
  const handleExportCsv = (itemsToExport: AdminQrItem[], batchTitle?: string) => {
    const csvContent = exportQrItemsToCsv(itemsToExport)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `heritage_qr_${batchTitle ? batchTitle.replace(/\s+/g, '_') : 'batch'}_${Date.now()}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Batch status change
  const handleBatchStatusChange = (
    batchId: string,
    newStatus: 'draft' | 'printing' | 'active' | 'archived'
  ) => {
    updateBatchStatus(batchId, newStatus)
    loadBatches()
    onRefresh()
  }

  // Confirm Reset / Revoke
  const handleExecuteAction = async () => {
    if (!actionItem) return

    setIsExecutingAction(true)
    try {
      await adminResetOrRevokeQrItem(actionItem.id, actionMode, actionReason)
      onRefresh()
      await loadBatches()
      setActionItem(null)
      setActionReason('')
    } catch (err) {
      console.error('Failed to execute reset/revoke:', err)
      alert('Không thể thực hiện thao tác.')
    } finally {
      setIsExecutingAction(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. TOP EXECUTIVE KPI PIPELINE SUMMARY (ui-ux-pro-max standard)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Batches */}
        <div className="bg-white border border-[#E8DECB] rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900/60 block">
              Đợt In & BST
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#2D2723]">
              {kpiStats.totalBatches} <span className="text-xs font-normal text-gray-500 font-sans">đợt</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Printing in Workshop */}
        <div className="bg-white border border-[#E8DECB] rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100/80 border border-blue-300 text-blue-800 flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900/60 block">
              Đang In Xưởng
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-blue-900">
              {kpiStats.printingItems} <span className="text-xs font-normal text-gray-500 font-sans">mã</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Ready to Market */}
        <div className="bg-white border border-[#E8DECB] rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/60 block">
              Sẵn Sàng Bán
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-800">
              {kpiStats.availableItems} <span className="text-xs font-normal text-gray-500 font-sans">mã</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Claimed by Customers */}
        <div className="bg-white border border-[#E8DECB] rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 text-[#8B2E1E] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900/60 block">
              Đã Kích Hoạt
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#8B2E1E]">
              {kpiStats.claimedItems} <span className="text-xs font-normal text-gray-500 font-sans">khách</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKFLOW: DRILL-DOWN MODE OR BATCHES LIST                         */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* MODE A: BATCHES OVERVIEW (selectedBatchId === null)                       */}
      {/* ------------------------------------------------------------------------- */}
      {selectedBatchId === null && (
        <div className="space-y-4">
          {/* Action Header */}
          <div className="bg-white border border-[#E8DECB] rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={batchSearchTerm}
                  onChange={(e) => setBatchSearchTerm(e.target.value)}
                  placeholder="Tìm đợt in, mã lô, di tích..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm bg-gray-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B2E1E]"
                />
              </div>

              <select
                value={batchStatusFilter}
                onChange={(e) => setBatchStatusFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-700 focus:outline-hidden"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Bản nháp</option>
                <option value="printing">Đang in ấn</option>
                <option value="active">Đang phát hành</option>
                <option value="archived">Đã lưu trữ</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => setSelectedBatchId('all')}
                className="py-2 px-3.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Tra cứu nhanh toàn bộ mã UID và mã seri độc bản"
              >
                <QrCode className="w-4 h-4 text-gray-600" />
                <span>Tra cứu kho UID</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportCsv(qrItems, 'Toan_Bo_Ma_Vat_Ly')}
                className="py-2 px-3.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Xuất file CSV tổng hợp tất cả các mã"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Xuất CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreateBatchModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] hover:from-[#732619] hover:to-[#571910] text-[#F7F0E2] font-serif font-bold text-xs sm:text-sm border border-[#D6AD60] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-[#F4E1BA]" />
                <span>+ Tạo Đợt In Mới</span>
              </button>
            </div>
          </div>

          {/* Batches Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBatches.map((batch) => {
              const batchItems = qrItems.filter((it) => it.batchId === batch.id)
              const claimedCount = batchItems.filter((it) => it.status === 'claimed').length
              const availableCount = batchItems.filter((it) => it.status === 'available').length
              const printingCount = batchItems.filter((it) => it.status === 'printing').length
              const percentage = Math.round((claimedCount / (batch.totalQuantity || 1)) * 100)

              return (
                <div
                  key={batch.id}
                  className="bg-white border border-[#E8DECB] hover:border-[#D6AD60] rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#8B2E1E] text-[#FAF6EE] shadow-2xs">
                            #{batch.batchCode}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/60">
                            Giới Hạn {batch.totalQuantity} Bản
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#2D2723] mt-1.5 hover:text-[#8B2E1E] transition-colors">
                          {batch.nameVi}
                        </h4>
                      </div>

                      {/* Status Selector Dropdown */}
                      <select
                        value={batch.status}
                        onChange={(e) =>
                          handleBatchStatusChange(
                            batch.id,
                            e.target.value as 'draft' | 'printing' | 'active' | 'archived'
                          )
                        }
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer border ${
                          batch.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : batch.status === 'printing'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : batch.status === 'draft'
                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                      >
                        <option value="draft">Bản nháp</option>
                        <option value="printing">Đang in ấn</option>
                        <option value="active">Đang phát hành</option>
                        <option value="archived">Lưu trữ</option>
                      </select>
                    </div>

                    {/* Site relation */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <Landmark className="w-4 h-4 text-[#8B2E1E] shrink-0" />
                      <span className="font-semibold text-gray-900">{batch.siteNameVi}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500 truncate">{batch.description || 'Chế tác lưu niệm độc bản'}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã kích hoạt: <strong className="text-gray-900">{claimedCount}</strong>/{batch.totalQuantity}</span>
                        </span>
                        <span className="font-bold text-[#8B2E1E]">{percentage}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-[#8B2E1E] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Chờ in: <strong>{printingCount}</strong></span>
                        <span>Sẵn sàng: <strong>{availableCount}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#E8DECB] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportCsv(batchItems, batch.batchCode)}
                      className="py-1.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Xuất CSV xưởng</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedBatchId(batch.id)}
                      className="py-1.5 px-3.5 rounded-lg bg-[#8B2E1E] hover:bg-[#732619] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Quản lý mã đợt này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredBatches.length === 0 && (
            <div className="bg-white border border-[#E8DECB] rounded-2xl p-12 text-center space-y-3">
              <Crown className="w-8 h-8 text-amber-700/50 mx-auto" />
              <h4 className="font-serif font-bold text-gray-800">Không tìm thấy đợt phát hành nào</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Chưa có đợt phát hành nào khớp với từ khóa tìm kiếm hoặc bạn chưa tạo đợt nào.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateBatchModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B2E1E] text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo đợt phát hành đầu tiên</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODE B: FOCUSED BATCH DRILL-DOWN OR GLOBAL LOOKUP (selectedBatchId !== null) */}
      {/* ------------------------------------------------------------------------- */}
      {selectedBatchId !== null && (
        <div className="space-y-4">
          {/* Breadcrumb Navigation Bar */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedBatchId(null)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#8B2E1E]" />
              <span>Quay lại danh sách các đợt phát hành</span>
            </button>

            {currentBatch && (
              <button
                type="button"
                onClick={() => handleExportCsv(filteredItems, currentBatch.batchCode)}
                className="py-1.5 px-3.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Xuất CSV đợt này ({filteredItems.length} mã)</span>
              </button>
            )}
          </div>

          {/* Batch Hero Card (when viewing a specific batch) */}
          {currentBatch && (
            <div className="bg-[#FAF6EE] border border-[#D6AD60] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#8B2E1E] text-[#FAF6EE]">
                    #{currentBatch.batchCode}
                  </span>
                  <span className="text-xs font-bold text-amber-900/80 uppercase tracking-wider">
                    Đợt Phát Hành Giới Hạn {currentBatch.totalQuantity} Bản
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#2D2723]">
                  {currentBatch.nameVi}
                </h3>
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-[#8B2E1E]" />
                  <span>Di tích: <strong className="text-gray-900">{currentBatch.siteNameVi}</strong></span>
                  <span className="text-gray-400">·</span>
                  <span>{currentBatch.description || 'Chế tác lưu niệm độc bản'}</span>
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-500 font-medium">Trạng thái đợt:</span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    currentBatch.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentBatch.status === 'printing'
                      ? 'bg-blue-100 text-blue-800'
                      : currentBatch.status === 'draft'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {currentBatch.status === 'active'
                    ? 'Đang phát hành'
                    : currentBatch.status === 'printing'
                    ? 'Đang in ấn xưởng'
                    : currentBatch.status === 'draft'
                    ? 'Bản nháp'
                    : 'Đã lưu trữ'}
                </span>
              </div>
            </div>
          )}

          {/* Search & Filter Bar for Items */}
          <div className="bg-white border border-[#E8DECB] rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={itemSearchTerm}
                  onChange={(e) => setItemSearchTerm(e.target.value)}
                  placeholder="Tra cứu số seri (VD: HTTL26-001/500), token, hoặc UID khách..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm bg-gray-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B2E1E]"
                />
              </div>

              <select
                value={itemStatusFilter}
                onChange={(e) => setItemStatusFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-700 focus:outline-hidden"
              >
                <option value="all">Tất cả trạng thái tem</option>
                <option value="available">Sẵn sàng (Available)</option>
                <option value="claimed">Đã kích hoạt (Claimed)</option>
                <option value="printing">Chờ in (Printing)</option>
                <option value="draft">Bản nháp (Draft)</option>
                <option value="revoked">Đã thu hồi (Revoked)</option>
              </select>
            </div>

            <div className="text-xs text-gray-500 font-medium">
              Hiển thị <strong className="text-gray-900">{filteredItems.length}</strong> mã vật phẩm
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white border border-[#E8DECB] rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF6EE] border-b border-[#E8DECB] text-[11px] font-bold uppercase tracking-wider text-[#5D5246]">
                    <th className="py-3 px-4">Mã Seri Độc Bản</th>
                    <th className="py-3 px-4">Mã Token & URL Mở Khóa</th>
                    <th className="py-3 px-4">Di Tích / BST</th>
                    <th className="py-3 px-4">Trạng Thái Tem</th>
                    <th className="py-3 px-4">Chủ Sở Hữu / Khách</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                      {/* Serial Code */}
                      <td className="py-3 px-4 font-mono font-bold text-[#8B2E1E]">
                        {item.serialCode}
                      </td>

                      {/* Raw Token */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="px-2 py-0.5 rounded bg-gray-100 font-semibold text-gray-800">
                            {item.rawToken}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.fullUrl, item.id)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 cursor-pointer"
                            title="Sao chép URL mở khóa"
                          >
                            {copiedToken === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Heritage Site */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 block truncate max-w-[160px]">
                          {item.siteNameVi}
                        </span>
                        {item.batchName && (
                          <span className="text-[10px] text-gray-500 truncate max-w-[160px] block">
                            {item.batchName}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            item.status === 'claimed'
                              ? 'bg-amber-100 text-amber-900'
                              : item.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'printing'
                              ? 'bg-blue-100 text-blue-800'
                              : item.status === 'revoked'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.status === 'claimed'
                            ? 'Đã kích hoạt'
                            : item.status === 'available'
                            ? 'Sẵn sàng'
                            : item.status === 'printing'
                            ? 'Chờ in'
                            : item.status === 'revoked'
                            ? 'Đã thu hồi'
                            : 'Bản nháp'}
                        </span>
                      </td>

                      {/* Owner / Buyer UID */}
                      <td className="py-3 px-4">
                        {item.claimedByUserId ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-gray-900 block">
                              {item.claimedByUserName || 'Người dùng'}
                            </span>
                            <span className="text-[10px] font-mono text-gray-500 block truncate max-w-[120px]">
                              UID: {item.claimedByUserId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Chưa liên kết</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewQrItem(item)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer"
                            title="Xem mã QR và in tem"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {item.status === 'claimed' && (
                            <button
                              type="button"
                              onClick={() => {
                                setActionItem(item)
                                setActionMode('reset_available')
                                setActionReason('Hỗ trợ khách hàng đổi trả sản phẩm')
                              }}
                              className="p-1.5 rounded-lg border border-amber-300 hover:bg-amber-50 text-amber-800 cursor-pointer"
                              title="Thu hồi & Đặt lại trạng thái sẵn sàng"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {item.status !== 'revoked' && (
                            <button
                              type="button"
                              onClick={() => {
                                setActionItem(item)
                                setActionMode('revoke_void')
                                setActionReason('Sản phẩm bị lỗi in hoặc hư hỏng')
                              }}
                              className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer"
                              title="Hủy hiệu lực mã vĩnh viễn"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredItems.length === 0 && (
              <div className="p-12 text-center space-y-2">
                <QrCode className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-500">
                  Không tìm thấy mã sản phẩm nào trong điều kiện lọc hiện tại.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: TẠO ĐỢT PHÁT HÀNH / BST MỚI                                     */}
      {/* ========================================================================= */}
      {isCreateBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF6EE] border border-[#D6AD60] rounded-3xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setIsCreateBatchModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/60 block">
                Phát Hành Bộ Sưu Tập Giới Hạn
              </span>
              <h3 className="font-serif font-bold text-xl text-[#8B2E1E] mt-0.5">
                Tạo Đợt Phát Hành & Sinh Mã QR Độc Bản
              </h3>
            </div>

            <form onSubmit={handleCreateBatchSubmit} className="space-y-4">
              {/* Select Heritage Site */}
              <div>
                <label className="block text-xs font-bold text-[#5D5246] mb-1">
                  Di tích liên kết con dấu *
                </label>
                <select
                  value={batchSiteId}
                  onChange={(e) => setBatchSiteId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6AD60] bg-white text-xs sm:text-sm font-semibold text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E]"
                >
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name_vi} ({site.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5D5246] mb-1">
                    Tên Đợt / BST (Tiếng Việt) *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchNameVi}
                    onChange={(e) => setBatchNameVi(e.target.value)}
                    placeholder="VD: BST Mùa Thu 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6AD60]/70 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5D5246] mb-1">
                    Tên Đợt (English)
                  </label>
                  <input
                    type="text"
                    value={batchNameEn}
                    onChange={(e) => setBatchNameEn(e.target.value)}
                    placeholder="e.g. Autumn 2026 Edition"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6AD60]/70 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Prefix & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5D5246] mb-1">
                    Tiền tố mã seri (Batch Code) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={batchPrefix}
                    onChange={(e) => setBatchPrefix(e.target.value.toUpperCase())}
                    placeholder="VD: HTTL26"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6AD60]/70 bg-white font-mono text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5D5246] mb-1">
                    Số lượng ấn bản độc bản *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    required
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6AD60]/70 bg-white text-xs font-bold text-[#8B2E1E]"
                  />
                </div>
              </div>

              {/* Initial Status */}
              <div>
                <label className="block text-xs font-bold text-[#5D5246] mb-1">
                  Trạng thái khởi tạo của mã
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchInitialStatus('draft')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      batchInitialStatus === 'draft'
                        ? 'border-gray-800 bg-gray-800 text-white shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Bản nháp
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchInitialStatus('printing')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      batchInitialStatus === 'printing'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Chờ In (Xưởng)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchInitialStatus('active')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      batchInitialStatus === 'active'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Mở Bán (Active)
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#5D5246] mb-1">
                  Mô tả / Ghi chú sản xuất
                </label>
                <textarea
                  value={batchDescription}
                  onChange={(e) => setBatchDescription(e.target.value)}
                  placeholder="Ghi chú về chất liệu, thông điệp giới hạn hoặc đơn vị chế tác..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#D6AD60]/60 bg-white text-xs"
                />
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-xs font-bold text-[#5D5246] mb-1">
                  Tên miền mở khóa (Base URL)
                </label>
                <input
                  type="url"
                  value={batchBaseUrl}
                  onChange={(e) => setBatchBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D6AD60]/60 bg-white font-mono text-xs"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E8DECB]">
                <button
                  type="button"
                  onClick={() => setIsCreateBatchModalOpen(false)}
                  disabled={isSubmittingBatch}
                  className="py-2 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBatch}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] hover:from-[#732619] hover:to-[#571910] text-[#F7F0E2] font-serif font-bold text-xs sm:text-sm border border-[#D6AD60] shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4 text-[#F4E1BA]" />
                  <span>{isSubmittingBatch ? 'Đang tạo...' : 'Sinh Lô & Hoàn Tất'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: XEM MÃ QR & IN TEM                                              */}
      {/* ========================================================================= */}
      {previewQrItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF6EE] border border-[#D6AD60] rounded-3xl w-full max-w-sm shadow-2xl p-6 relative text-center space-y-4 animate-scaleUp">
            <button
              type="button"
              onClick={() => setPreviewQrItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/60 block">
                Mã Vật Phẩm Độc Bản
              </span>
              <h3 className="font-serif font-bold text-lg text-[#8B2E1E] mt-0.5">
                #{previewQrItem.serialCode}
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                {previewQrItem.siteNameVi}
              </p>
            </div>

            {/* QR Code Canvas Representation */}
            <div className="bg-white p-4 rounded-2xl border-2 border-[#D6AD60] shadow-inner inline-block mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  previewQrItem.fullUrl
                )}`}
                alt={previewQrItem.serialCode}
                className="w-48 h-48 rounded-lg mx-auto"
              />
            </div>

            <div className="space-y-1 font-mono text-[11px] text-gray-600">
              <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">
                {previewQrItem.rawToken}
              </span>
              <p className="text-[10px] text-gray-400 truncate max-w-xs mx-auto">
                {previewQrItem.fullUrl}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(previewQrItem.fullUrl, 'modal')}
                className="py-2 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedToken === 'modal' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-2 px-3 rounded-xl bg-[#8B2E1E] text-white hover:bg-[#732619] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Tem Mã</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: XÁC NHẬN THU HỒI / ĐẶT LẠI MÃ                                   */}
      {/* ========================================================================= */}
      {actionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-gray-300 rounded-3xl w-full max-w-md shadow-2xl p-6 relative space-y-4 animate-scaleUp">
            <button
              type="button"
              onClick={() => setActionItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  actionMode === 'reset_available'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {actionMode === 'reset_available' ? (
                  <RotateCcw className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-gray-900">
                  {actionMode === 'reset_available'
                    ? 'Thu Hồi & Đặt Lại Trạng Thái Sẵn Sàng'
                    : 'Hủy Hiệu Lực Mã Vĩnh Viễn'}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  Mã seri: #{actionItem.serialCode}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5 text-gray-700">
              <p>
                <strong>Di tích:</strong> {actionItem.siteNameVi}
              </p>
              {actionItem.claimedByUserName && (
                <p>
                  <strong>Người đang sở hữu:</strong> {actionItem.claimedByUserName} (
                  <span className="font-mono text-[11px]">{actionItem.claimedByUserId}</span>)
                </p>
              )}
              <p className="text-[11px] text-amber-800 pt-1 border-t border-gray-200">
                {actionMode === 'reset_available'
                  ? 'Khi thực hiện, con dấu trong Hộ chiếu của người mua sẽ bị thu hồi. Mã này sẽ chuyển về trạng thái Sẵn Sàng (Available) để khách hàng khác có thể quét.'
                  : 'Mã này sẽ bị vô hiệu hóa hoàn toàn (Revoked). Bất kỳ ai quét mã này sẽ nhận thông báo mã không còn giá trị.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Lý do thực hiện *
              </label>
              <input
                type="text"
                required
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="VD: Đổi trả hàng / Quét nhầm / Lỗi in ấn xưởng..."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#8B2E1E]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActionItem(null)}
                disabled={isExecutingAction}
                className="py-2 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={isExecutingAction || !actionReason.trim()}
                className={`py-2 px-4 rounded-xl text-white text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 ${
                  actionMode === 'reset_available'
                    ? 'bg-amber-800 hover:bg-amber-900'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isExecutingAction ? 'Đang xử lý...' : 'Xác nhận thực hiện'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
