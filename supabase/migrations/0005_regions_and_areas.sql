-- ==============================================================================
-- 0005_regions_and_areas.sql
-- Digital Heritage Passport - Regions and Areas for Hierarchical Interactive Map
-- ==============================================================================

-- 1. Table: regions (Bắc, Trung, Nam)
CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE, -- 'bac', 'trung', 'nam'
    name_vi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_vi TEXT,
    description_en TEXT,
    order_index INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table: areas (Tỉnh / Thành phố / Khu vực trực thuộc miền)
CREATE TABLE IF NOT EXISTS public.areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE, -- 'tp-ho-chi-minh', 'ha-noi', 'quang-nam', etc.
    name_vi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    center_lat NUMERIC(10, 7) NOT NULL,
    center_lng NUMERIC(10, 7) NOT NULL,
    default_zoom INT NOT NULL DEFAULT 13,
    is_active BOOLEAN NOT NULL DEFAULT false, -- true for active focus areas (e.g. TP.HCM)
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Add area_id foreign key to heritage_sites
ALTER TABLE public.heritage_sites 
ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL;

-- 4. Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_regions_slug ON public.regions(slug);
CREATE INDEX IF NOT EXISTS idx_areas_region_id ON public.areas(region_id);
CREATE INDEX IF NOT EXISTS idx_areas_slug ON public.areas(slug);
CREATE INDEX IF NOT EXISTS idx_heritage_sites_area_id ON public.heritage_sites(area_id);

-- 5. Updated_at Triggers
DROP TRIGGER IF EXISTS trigger_set_updated_at_regions ON public.regions;
CREATE TRIGGER trigger_set_updated_at_regions
    BEFORE UPDATE ON public.regions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_set_updated_at_areas ON public.areas;
CREATE TRIGGER trigger_set_updated_at_areas
    BEFORE UPDATE ON public.areas
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Row Level Security (RLS)
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

-- 6.1. Public read-only access for published regions
DROP POLICY IF EXISTS "Public can view published regions" ON public.regions;
CREATE POLICY "Public can view published regions"
ON public.regions
FOR SELECT
USING (is_published = true);

-- 6.2. Public read-only access for areas belonging to published regions
DROP POLICY IF EXISTS "Public can view areas of published regions" ON public.areas;
CREATE POLICY "Public can view areas of published regions"
ON public.areas
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.regions r
        WHERE r.id = areas.region_id AND r.is_published = true
    )
);

