-- ==============================================================================
-- 0004_admin_roles_and_crud.sql
-- Digital Heritage Passport - Admin Roles, Unique Claimable Pin Items & RLS
-- ==============================================================================

-- 1. Add role to profiles if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- 2. Upgrade pin_items to support serialized physical items & single-claim lifecycle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pin_items'
          AND column_name = 'serial_code'
    ) THEN
        ALTER TABLE public.pin_items
        ADD COLUMN serial_code TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pin_items'
          AND column_name = 'claimed_by_user_id'
    ) THEN
        ALTER TABLE public.pin_items
        ADD COLUMN claimed_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pin_items'
          AND column_name = 'claimed_at'
    ) THEN
        ALTER TABLE public.pin_items
        ADD COLUMN claimed_at TIMESTAMPTZ;
    END IF;

    -- Update status check constraint to include 'available' and 'claimed'
    ALTER TABLE public.pin_items DROP CONSTRAINT IF EXISTS pin_items_status_check;
    ALTER TABLE public.pin_items
    ADD CONSTRAINT pin_items_status_check
    CHECK (status IN ('available', 'active', 'claimed', 'revoked'));
END $$;

-- 3. Helper function: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    );
$$;

-- Grant execute on is_admin()
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- 4. Admin RLS Policies for Heritage Sites CRUD
CREATE POLICY "Admins have full access to heritage sites"
ON public.heritage_sites
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Admin RLS Policies for Pin Designs CRUD
CREATE POLICY "Admins have full access to pin designs"
ON public.pin_designs
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Admin RLS Policies for Pin Items (QR codes)
CREATE POLICY "Admins have full access to pin items"
ON public.pin_items
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. Admin RLS Policies for Managing User Profiles
CREATE POLICY "Admins can view and update all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 8. Admin RLS Policies for Moderating Community Posts
CREATE POLICY "Admins can update and delete any post"
ON public.posts
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 9. Update preview_qr_token RPC to include serial_code and claim info
CREATE OR REPLACE FUNCTION public.preview_qr_token(raw_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_token_hash TEXT;
    v_pin_item RECORD;
    v_site RECORD;
    v_current_user UUID;
    v_is_unlocked BOOLEAN := false;
    v_claimed_by_other BOOLEAN := false;
    v_claimer_name TEXT := NULL;
BEGIN
    IF raw_token IS NULL OR trim(raw_token) = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_TOKEN',
            'message', 'Token cannot be empty'
        );
    END IF;

    -- Hash the raw token
    v_token_hash := encode(extensions.digest(raw_token::bytea, 'sha256'), 'hex');

    -- Look up pin_item
    SELECT pi.id, pi.status, pi.design_id, pi.serial_code, pi.claimed_by_user_id, pi.claimed_at
    INTO v_pin_item
    FROM public.pin_items pi
    WHERE pi.qr_token_hash = v_token_hash;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_TOKEN',
            'message', 'QR token does not exist'
        );
    END IF;

    IF v_pin_item.status = 'revoked' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'REVOKED_TOKEN',
            'message', 'This QR code has been revoked'
        );
    END IF;

    -- Look up site
    SELECT hs.*
    INTO v_site
    FROM public.pin_designs pd
    JOIN public.heritage_sites hs ON hs.id = pd.site_id
    WHERE pd.id = v_pin_item.design_id;

    IF NOT FOUND OR v_site.is_published = false THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'SITE_UNPUBLISHED',
            'message', 'The linked heritage site is not published'
        );
    END IF;

    -- Check if claimed by another user
    v_current_user := auth.uid();
    IF v_pin_item.claimed_by_user_id IS NOT NULL AND (v_current_user IS NULL OR v_pin_item.claimed_by_user_id != v_current_user) THEN
        v_claimed_by_other := true;
        SELECT display_name INTO v_claimer_name
        FROM public.profiles
        WHERE id = v_pin_item.claimed_by_user_id;
    END IF;

    -- Check unlock status for current user
    IF v_current_user IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM public.passport_entries pe
            WHERE pe.user_id = v_current_user
              AND pe.site_id = v_site.id
        ) INTO v_is_unlocked;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'site', jsonb_build_object(
            'id', v_site.id,
            'slug', v_site.slug,
            'name_vi', v_site.name_vi,
            'name_en', v_site.name_en,
            'story_vi', v_site.story_vi,
            'story_en', v_site.story_en,
            'description_vi', v_site.description_vi,
            'description_en', v_site.description_en,
            'latitude', v_site.latitude,
            'longitude', v_site.longitude,
            'cover_image_url', v_site.cover_image_url,
            'audio_url', v_site.audio_url
        ),
        'is_unlocked', v_is_unlocked,
        'pin_item_id', v_pin_item.id,
        'serial_code', v_pin_item.serial_code,
        'status', v_pin_item.status,
        'claimed_by_other', v_claimed_by_other,
        'claimer_name', v_claimer_name,
        'claimed_at', v_pin_item.claimed_at
    );
END;
$$;

-- 10. Update unlock_heritage_site RPC to enforce single-claim physical items
CREATE OR REPLACE FUNCTION public.unlock_heritage_site(raw_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_current_user UUID;
    v_token_hash TEXT;
    v_pin_item RECORD;
    v_site_id UUID;
    v_is_published BOOLEAN;
    v_newly_unlocked BOOLEAN;
    v_entry_id UUID;
BEGIN
    -- 1. Require authentication
    v_current_user := auth.uid();
    IF v_current_user IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'UNAUTHORIZED',
            'message', 'You must be logged in to unlock a heritage site'
        );
    END IF;

    -- 2. Hash raw token
    v_token_hash := encode(extensions.digest(raw_token::bytea, 'sha256'), 'hex');

    -- 3. Validate pin_item
    SELECT pi.id, pi.status, pi.design_id, pi.serial_code, pi.claimed_by_user_id, pi.claimed_at
    INTO v_pin_item
    FROM public.pin_items pi
    WHERE pi.qr_token_hash = v_token_hash;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_TOKEN',
            'message', 'QR token does not exist'
        );
    END IF;

    IF v_pin_item.status = 'revoked' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'REVOKED_TOKEN',
            'message', 'This QR code has been revoked'
        );
    END IF;

    -- 4. Check single-claim ownership: If claimed by another user, reject!
    IF v_pin_item.claimed_by_user_id IS NOT NULL AND v_pin_item.claimed_by_user_id != v_current_user THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'ALREADY_CLAIMED_BY_ANOTHER',
            'message', 'Mã sản phẩm độc bản này đã được kích hoạt bởi tài khoản khác. Mỗi sản phẩm vật lý chỉ cấp quyền mở khóa con dấu cho duy nhất một người mua.',
            'serial_code', v_pin_item.serial_code,
            'claimed_at', v_pin_item.claimed_at
        );
    END IF;

    -- 5. Look up site
    SELECT pd.site_id, hs.is_published
    INTO v_site_id, v_is_published
    FROM public.pin_designs pd
    JOIN public.heritage_sites hs ON hs.id = pd.site_id
    WHERE pd.id = v_pin_item.design_id;

    IF NOT FOUND OR v_is_published = false THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'SITE_UNPUBLISHED',
            'message', 'The linked heritage site is not published'
        );
    END IF;

    -- 6. Claim item if available
    IF v_pin_item.claimed_by_user_id IS NULL THEN
        UPDATE public.pin_items
        SET status = 'claimed',
            claimed_by_user_id = v_current_user,
            claimed_at = now()
        WHERE id = v_pin_item.id;
    END IF;

    -- 7. Insert passport entry
    INSERT INTO public.passport_entries (user_id, site_id, first_pin_item_id)
    VALUES (v_current_user, v_site_id, v_pin_item.id)
    ON CONFLICT (user_id, site_id) DO NOTHING
    RETURNING id INTO v_entry_id;

    v_newly_unlocked := (v_entry_id IS NOT NULL);

    RETURN jsonb_build_object(
        'success', true,
        'newly_unlocked', v_newly_unlocked,
        'site_id', v_site_id,
        'pin_item_id', v_pin_item.id,
        'serial_code', v_pin_item.serial_code
    );
END;
$$;

