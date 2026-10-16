import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  QrCode,
  BookOpen,
  Compass,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
} from 'lucide-react'
import { useTranslation } from '../../i18n'
import { useAuth } from '../../features/authentication'
import { supabase } from '../../services/supabase/client'
import {
  DongSonSun,
  ChimLac,
  HeritageCorner,
  LotusEmblem,
} from '../../components/decorative/DongSonMotifs'

interface FeaturedSite {
  id: string
  slug: string
  name_vi: string
  name_en: string
  cover_image_url: string
  description_vi: string | null
  description_en: string | null
}

export function LandingPage() {
  const { t, language } = useTranslation()
  const { user } = useAuth()

  const [featuredSites, setFeaturedSites] = useState<FeaturedSite[]>([])
  const [isLoadingSites, setIsLoadingSites] = useState<boolean>(true)

  useEffect(() => {
    let ignore = false
    async function fetchFeatured() {
      try {
        const { data, error } = await supabase
          .from('heritage_sites')
          .select('id, slug, name_vi, name_en, cover_image_url, description_vi, description_en')
          .eq('is_published', true)
          .limit(4)

        if (!ignore && !error && data) {
          setFeaturedSites(data)
        }
      } catch (err) {
        console.warn('Failed to load featured sites:', err)
      } finally {
        if (!ignore) {
          setIsLoadingSites(false)
        }
      }
    }

    fetchFeatured()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="py-6 sm:py-10 max-w-6xl mx-auto space-y-16 sm:space-y-20 px-4 sm:px-6">
      
      {/* ================= 1. HERO SECTION: TRỐNG ĐỒNG ĐÔNG SƠN NỔI BẬT & SƠN THỦY NON SÔNG ================= */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#D6AD60]/60 bg-gradient-to-br from-[#4A130A] via-[#5C180E] to-[#380D05] p-8 sm:p-14 lg:p-16 min-h-[460px] lg:min-h-[500px] flex items-center">
        
        {/* Nền tranh Sơn Thủy viền vàng trải rộng toàn cảnh chìm nhẹ */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/images/hoatietvanhoa/son-thuy.jpg"
            alt="Sơn thủy non sông"
            className="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity filter contrast-125"
          />
          {/* Lớp gradient gốm đất đỏ trầm ấm */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4A130A]/95 via-[#5C180E]/90 to-[#380D05]/80" />
        </div>

        {/* Trống Đồng Đông Sơn SVG in đè làm Background chính, làm nổi bật sắc nét */}
        <div className="absolute -right-24 sm:-right-16 lg:right-6 top-1/2 -translate-y-1/2 pointer-events-none select-none">
          {/* Quầng sáng vàng kim tỏa ra từ tâm trống đồng */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,173,96,0.3)_0%,rgba(139,46,30,0.15)_50%,transparent_75%)] blur-2xl transform scale-110" />
          
          <img
            src="/images/trongdong-gold.svg"
            alt="Trống Đồng Đông Sơn"
            className="w-[440px] h-[440px] sm:w-[580px] sm:h-[580px] lg:w-[680px] lg:h-[680px] object-contain opacity-45 sm:opacity-55 drop-shadow-[0_0_35px_rgba(214,173,96,0.35)] transition-transform duration-1000 hover:rotate-6"
          />
        </div>

        {/* 4 Góc Hoa Văn Triện Cung Đình mạ vàng */}
        <div className="absolute top-3.5 left-3.5 text-[#D6AD60] opacity-80 z-20">
          <HeritageCorner className="w-8 h-8" />
        </div>
        <div className="absolute top-3.5 right-3.5 text-[#D6AD60] opacity-80 transform rotate-90 z-20">
          <HeritageCorner className="w-8 h-8" />
        </div>
        <div className="absolute bottom-3.5 left-3.5 text-[#D6AD60] opacity-80 transform -rotate-90 z-20">
          <HeritageCorner className="w-8 h-8" />
        </div>
        <div className="absolute bottom-3.5 right-3.5 text-[#D6AD60] opacity-80 transform rotate-180 z-20">
          <HeritageCorner className="w-8 h-8" />
        </div>

        {/* Hero Content: Đã bỏ badge pill và khung chữ nhỏ theo yêu cầu người dùng */}
        <div className="relative z-10 max-w-2xl space-y-6">
          
          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-normal leading-tight sm:leading-snug text-[#FFF9F0] drop-shadow-md">
            Chạm vào hồn cốt non sông,<br />
            <span className="text-[#D6AD60] italic font-normal">mở khóa ngàn năm</span> văn hiến.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#F7F0E2]/90 leading-relaxed font-sans max-w-xl">
            Nền tảng kết nối di tích văn hóa quốc gia với công nghệ định danh số độc bản. Mỗi chuyến đi là một dấu ấn trưởng thành, mỗi bước chân là một trang sử được khắc ghi trọn đời.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
            <Link
              to="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#D6AD60] via-[#E2BE77] to-[#C89B3C] text-[#4A1505] font-serif font-bold text-sm shadow-xl shadow-black/35 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border border-[#FFF0C8]/60"
            >
              <Compass className="w-4 h-4 text-[#4A1505]" />
              <span>Khám Phá Bản Đồ 3 Miền</span>
            </Link>

            <Link
              to="/unlock"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-black/40 hover:bg-black/55 border border-[#D6AD60]/60 text-[#FFF9F0] font-serif font-semibold text-sm backdrop-blur-xs active:scale-[0.98] transition-all cursor-pointer shadow-md"
            >
              <QrCode className="w-4 h-4 text-[#D6AD60]" />
              <span>Quét Mã Pin Lưu Niệm</span>
            </Link>

            {!user && (
              <Link
                to="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-[#FFF9F0] text-xs font-bold border border-white/25 transition-all cursor-pointer"
              >
                <span>{t.nav.login}</span>
              </Link>
            )}
          </div>

          {/* Metrics Stats Banner */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#D6AD60]/30 max-w-lg">
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#D6AD60] block">34</span>
              <span className="text-[11px] text-[#F7F0E2]/80">Tỉnh thành văn hóa</span>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#D6AD60] block">120+</span>
              <span className="text-[11px] text-[#F7F0E2]/80">Di tích tiêu biểu</span>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#D6AD60] block">100%</span>
              <span className="text-[11px] text-[#F7F0E2]/80">Bảo tồn số hóa</span>
            </div>
          </div>

        </div>

      </section>

      {/* ================= 2. PIN LƯU NIỆM & HỘ CHIẾU SỐ (BẢO VẬT SƠN MÀI CỔ TRUYỀN) ================= */}
      <section className="relative rounded-3xl bg-[#FAF6EE] p-8 sm:p-12 overflow-hidden shadow-lg border border-[#E8DECB]">
        
        {/* Subtle lotus watermark in corner */}
        <div className="absolute -bottom-8 -right-8 text-[#D6AD60] opacity-15 pointer-events-none">
          <LotusEmblem className="w-64 h-64" />
        </div>

        {/* Dải mây cuộn phong thủy */}
        <div className="absolute top-4 right-1/3 opacity-20 pointer-events-none hidden md:block">
          <img
            src="/images/hoatietvanhoa/hoa-tiet-may.jpg"
            alt="Mây phong thủy"
            className="w-44 h-auto mix-blend-multiply opacity-30"
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B2E1E]/10 border border-[#8B2E1E]/30 text-[#8B2E1E] text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-[#8B2E1E]" />
              <span>{t.landing.pinFeatureTitle}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#6A1E14] tracking-normal leading-snug">
              Mỗi chiếc Pin lưu niệm — Một trang sử sống động
            </h2>

            <p className="text-xs sm:text-sm text-[#5D5246] leading-relaxed">
              {t.landing.pinFeatureDesc}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-[#8B2E1E]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C89B3C]" />
                <span>Mã QR độc bản bảo chứng nguồn gốc</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#C89B3C]" />
                <span>Khắc ghi Hộ chiếu số & Ảnh kỷ niệm trọn đời</span>
              </div>
            </div>
          </div>

          {/* Showcase Pin Box: Phong cách Hộp Sơn Mài Bảo Vật Cổ */}
          <div className="md:col-span-5 flex items-center justify-center">
            <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#8B2E1E] via-[#6A1E14] to-[#451208] border-2 border-[#D6AD60]/70 shadow-2xl text-center space-y-4 max-w-xs text-white group hover:scale-[1.02] transition-transform duration-300">
              
              {/* Huy hiệu Pin Sơn Mài */}
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#D6AD60] via-[#F4E1BA] to-[#C89B3C] p-1.5 mx-auto shadow-xl ring-2 ring-[#D6AD60]/50">
                <div className="relative w-full h-full rounded-xl bg-[#4A1505] flex flex-col items-center justify-center text-[#D6AD60] space-y-1 overflow-hidden">
                  <img
                    src="/images/hoatietvanhoa/sun-cloud.jpg"
                    alt="Emblem"
                    className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-screen scale-125"
                  />
                  <DongSonSun className="relative z-10 w-11 h-11 text-[#D6AD60] group-hover:rotate-45 transition-transform duration-700" />
                  <span className="relative z-10 text-[9px] font-bold tracking-widest uppercase text-[#F4E1BA]">
                    Pin Di Sản
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-[#FFF9F0]">Hội Trường Thống Nhất</h3>
                <p className="text-[11px] text-[#F4E1BA]/85 font-sans">
                  Quét mã QR độc bản sau pin để kích hoạt
                </p>
              </div>

              <Link
                to="/unlock"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D6AD60] to-[#C89B3C] hover:from-[#e0be77] hover:to-[#D6AD60] text-[#4A1505] font-serif font-bold text-xs shadow-md transition-all block cursor-pointer border border-[#FFF0C8]/50"
              >
                Mở khóa ngay
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 3. HÀNH TRÌNH 3 BƯỚC ĐƠN GIẢN (THẺ LIỄN QUY TRÌNH) ================= */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#8B2E1E] uppercase tracking-widest font-serif">
            <ChimLac className="w-4 h-4 text-[#8B2E1E]" />
            <span>Quy Trình Trải Nghiệm</span>
            <ChimLac className="w-4 h-4 text-[#8B2E1E] transform scale-x-[-1]" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#6A1E14] tracking-normal leading-snug">
            {t.landing.howItWorksTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6E60] leading-relaxed">
            Hành trình 3 bước chuyển hóa kỷ vật lưu niệm thành kho tàng tri thức số cá nhân
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bước 1 */}
          <div className="p-7 rounded-3xl bg-[#FAF6EE] border-2 border-[#E8DECB] hover:border-[#D6AD60] shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-all relative overflow-hidden group">
            {/* Góc triện cổ */}
            <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#D6AD60] pointer-events-none" />
            <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#D6AD60] pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B2E1E]/15 to-[#D6AD60]/20 text-[#8B2E1E] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#8B2E1E]/20 shadow-inner">
              <Compass className="w-8 h-8" />
            </div>
            
            <span className="px-3 py-0.5 rounded-full bg-[#8B2E1E]/10 text-[#8B2E1E] text-[10px] font-bold tracking-widest uppercase font-serif">
              Bước 01
            </span>
            <h3 className="font-serif font-bold text-[#6A1E14] text-base">{t.landing.step1Title}</h3>
            <p className="text-xs text-[#5D5246] leading-relaxed font-sans">{t.landing.step1Desc}</p>
          </div>

          {/* Bước 2 */}
          <div className="p-7 rounded-3xl bg-[#FAF6EE] border-2 border-[#E8DECB] hover:border-[#D6AD60] shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-all relative overflow-hidden group">
            <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#D6AD60] pointer-events-none" />
            <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#D6AD60] pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D6AD60]/25 to-[#C89B3C]/20 text-[#8B2E1E] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#D6AD60]/30 shadow-inner">
              <QrCode className="w-8 h-8" />
            </div>
            
            <span className="px-3 py-0.5 rounded-full bg-[#D6AD60]/20 text-[#8B2E1E] text-[10px] font-bold tracking-widest uppercase font-serif">
              Bước 02
            </span>
            <h3 className="font-serif font-bold text-[#6A1E14] text-base">{t.landing.step2Title}</h3>
            <p className="text-xs text-[#5D5246] leading-relaxed font-sans">{t.landing.step2Desc}</p>
          </div>

          {/* Bước 3 */}
          <div className="p-7 rounded-3xl bg-[#FAF6EE] border-2 border-[#E8DECB] hover:border-[#D6AD60] shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-all relative overflow-hidden group">
            <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#D6AD60] pointer-events-none" />
            <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#D6AD60] pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#174F40]/15 to-[#D6AD60]/20 text-[#174F40] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#174F40]/20 shadow-inner">
              <BookOpen className="w-8 h-8" />
            </div>
            
            <span className="px-3 py-0.5 rounded-full bg-[#174F40]/10 text-[#174F40] text-[10px] font-bold tracking-widest uppercase font-serif">
              Bước 03
            </span>
            <h3 className="font-serif font-bold text-[#6A1E14] text-base">{t.landing.step3Title}</h3>
            <p className="text-xs text-[#5D5246] leading-relaxed font-sans">{t.landing.step3Desc}</p>
          </div>
        </div>
      </section>

      {/* ================= 4. THẺ TRANH KHẮC DI SẢN (HERITAGE WOODCUT CARDS - LIVE SUPABASE) ================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E8DECB] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ChimLac className="w-4 h-4 text-[#8B2E1E]" />
              <span className="text-xs font-bold text-[#8B2E1E] uppercase tracking-widest font-serif">Di Sản Tiêu Biểu</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#6A1E14] tracking-normal leading-snug">
              {t.landing.featuredSitesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6E60]">
              Các di sản văn hóa và kiến trúc nổi bật được nạp trực tiếp từ cơ sở dữ liệu
            </p>
          </div>
          <Link
            to="/map"
            className="text-xs sm:text-sm font-serif font-bold text-[#8B2E1E] hover:text-[#541E0A] inline-flex items-center gap-1.5 group cursor-pointer"
          >
            <span>{t.landing.exploreMore}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoadingSites ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
            <div className="h-64 bg-stone-200 rounded-3xl" />
            <div className="h-64 bg-stone-200 rounded-3xl" />
            <div className="h-64 bg-stone-200 rounded-3xl" />
            <div className="h-64 bg-stone-200 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredSites.map((site) => {
              const name = language === 'vi' ? site.name_vi : site.name_en
              const desc = language === 'vi' ? site.description_vi : site.description_en

              return (
                <Link
                  key={site.id}
                  to={`/heritage/${site.slug}`}
                  className="group rounded-3xl overflow-hidden bg-white border border-[#E8DECB] hover:border-[#D6AD60] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative cursor-pointer"
                >
                  {/* Hoa văn góc triện cổ ở 2 góc trên */}
                  <div className="absolute top-2 left-2 text-[#D6AD60] opacity-80 z-10 pointer-events-none">
                    <HeritageCorner className="w-5 h-5" />
                  </div>
                  <div className="absolute top-2 right-2 text-[#D6AD60] opacity-80 z-10 pointer-events-none transform rotate-90">
                    <HeritageCorner className="w-5 h-5" />
                  </div>

                  <div>
                    {/* Ảnh di sản với tông màu ấm và lớp chuyển nhẹ */}
                    <div className="aspect-4/3 w-full bg-stone-100 overflow-hidden relative">
                      <img
                        src={site.cover_image_url}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <div className="absolute bottom-2 left-3 right-3 text-white">
                        <span className="text-[10px] text-[#F4E1BA] font-semibold flex items-center gap-1 font-serif">
                          <MapPin className="w-3 h-3 text-[#D6AD60]" />
                          <span>Di tích quốc gia</span>
                        </span>
                      </div>
                    </div>

                    {/* Nội dung thẻ */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-serif font-bold text-sm text-[#2D2723] group-hover:text-[#8B2E1E] transition-colors line-clamp-1">
                        {name}
                      </h3>
                      {desc && (
                        <p className="text-xs text-[#7A6E60] line-clamp-2 leading-relaxed font-sans">
                          {desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Chân thẻ */}
                  <div className="px-4 pb-4 pt-2 border-t border-[#E8DECB]/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-serif font-bold text-[#8B2E1E] inline-flex items-center gap-1 group-hover:underline">
                      <span>Khám phá di tích</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[10px] font-bold text-[#C89B3C] bg-[#FAF6EE] px-2 py-0.5 rounded-full border border-[#E8DECB]">
                      ★ Di sản
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ================= 5. BĂNG CHUYỀN CỘNG ĐỒNG VỚI ẤN PHẨM THƯ PHÁP CỔ ================= */}
      <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#FAF6EE] via-[#F4EBD9] to-[#EFE2C9] border-2 border-[#D6AD60]/50 flex flex-col md:flex-row items-center justify-between gap-8 shadow-md relative overflow-hidden">
        
        {/* Nền mây chìm nhẹ nhàng */}
        <div className="absolute -bottom-10 -left-10 opacity-15 pointer-events-none">
          <img
            src="/images/hoatietvanhoa/hoa-tiet-may.jpg"
            alt="Mây"
            className="w-56 h-auto mix-blend-multiply"
          />
        </div>

        {/* Nội dung lời hiệu triệu */}
        <div className="space-y-3 text-center md:text-left max-w-xl relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#8B2E1E] uppercase tracking-wider font-serif">
            <Users className="w-4 h-4 text-[#8B2E1E]" />
            <span>{t.community.title}</span>
            <span className="text-[#D6AD60]">✦</span>
            <span>Đồng Hành Khắc Ghi</span>
          </div>

          <h3 className="font-serif text-xl sm:text-3xl font-bold text-[#6A1E14] leading-snug">
            Cùng cộng đồng lưu giữ ngàn năm di sản
          </h3>

          <p className="text-xs sm:text-sm text-[#5D5246] leading-relaxed font-sans">
            Mỗi bức ảnh, mỗi lời tự sự của bạn là một viên gạch số hóa bồi đắp vào kho tàng di sản chung của cả dân tộc. Kết nối truyền thống và hiện đại trong từng dấu ấn hành trình.
          </p>

          <div className="pt-2">
            <Link
              to="/community"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] hover:from-[#732315] hover:to-[#57170e] text-[#FFF9F0] font-serif font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer border border-[#D6AD60]/50"
            >
              <Users className="w-4 h-4 text-[#D6AD60]" />
              <span>{t.community.createPostCta}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Thẻ Triện Thư Phóng Nghệ Thuật: "Độc Lập Tự Do Hạnh Phúc" */}
        <div className="relative z-10 shrink-0 hidden sm:flex items-center justify-center">
          <div className="relative p-2.5 rounded-2xl bg-white/80 backdrop-blur-xs border-2 border-[#D6AD60]/60 shadow-lg hover:rotate-1 transition-transform duration-300">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#8B2E1E] text-white text-[9px] font-serif font-bold tracking-widest uppercase">
              Ấn Khắc Số
            </span>
            <img
              src="/images/hoatietvanhoa/doc-lap-tu-do.jpg"
              alt="Triện nghệ thuật Độc Lập Tự Do Hạnh Phúc"
              className="w-24 sm:w-28 h-auto object-contain rounded-xl opacity-90 contrast-125"
            />
          </div>
        </div>

      </section>

    </div>
  )
}

