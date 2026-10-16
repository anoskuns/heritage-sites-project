-- ==============================================================================
-- 0003_rpc_and_triggers.sql
-- Digital Heritage Passport - RPC Functions & Business Logic Triggers
-- Implements: FR-05 (QR/Pin Items), FR-06 (QR Unlock Flow), FR-10 (Memories limit)
-- ==============================================================================

-- =============================================================================
-- 1. RPC: preview_qr_token(raw_token TEXT)
--    SECURITY DEFINER — bypasses RLS on pin_items (which has no client policies).
--    Returns JSON with site info + optional unlock status for the current user.
--    Does NOT require authentication (guests can preview heritage stories).
-- =============================================================================
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
    v_is_unlocked BOOLEAN := false;
    v_current_user UUID;
BEGIN
    -- 1. Hash the raw token with SHA-256 (casting raw_token to bytea for digest)
    v_token_hash := encode(extensions.digest(raw_token::bytea, 'sha256'), 'hex');

    -- 2. Look up pin_item by hash
    SELECT pi.id, pi.status, pi.design_id
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

    -- 3. Check if revoked
    IF v_pin_item.status = 'revoked' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'REVOKED_TOKEN',
            'message', 'This QR code has been revoked'
        );
    END IF;

    -- 4. Get the linked heritage site via pin_designs
    SELECT hs.id, hs.slug, hs.name_vi, hs.name_en,
           hs.story_vi, hs.story_en,
           hs.description_vi, hs.description_en,
           hs.latitude, hs.longitude,
           hs.cover_image_url, hs.audio_url,
           hs.is_published
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

    -- 5. Check unlock status for the current user (if authenticated)
    v_current_user := auth.uid();
    IF v_current_user IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM public.passport_entries pe
            WHERE pe.user_id = v_current_user
              AND pe.site_id = v_site.id
        ) INTO v_is_unlocked;
    END IF;

    -- 6. Return site preview data
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
        'pin_item_id', v_pin_item.id
    );
END;
$$;

-- Grant execute to both anon (guest preview) and authenticated
GRANT EXECUTE ON FUNCTION public.preview_qr_token(TEXT) TO anon, authenticated;


-- =============================================================================
-- 2. RPC: unlock_heritage_site(raw_token TEXT)
--    SECURITY DEFINER — bypasses RLS on pin_items & passport_entries.
--    REQUIRES authentication. Creates passport entry idempotently.
-- =============================================================================
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

    -- 2. Hash the raw token (casting raw_token to bytea for digest)
    v_token_hash := encode(extensions.digest(raw_token::bytea, 'sha256'), 'hex');

    -- 3. Look up and validate pin_item
    SELECT pi.id, pi.status, pi.design_id
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

    -- 4. Get the linked site and check publication status
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

    -- 5. Idempotent insert: ON CONFLICT DO NOTHING
    --    We attempt the INSERT and check if a row was actually created.
    INSERT INTO public.passport_entries (user_id, site_id, first_pin_item_id)
    VALUES (v_current_user, v_site_id, v_pin_item.id)
    ON CONFLICT (user_id, site_id) DO NOTHING
    RETURNING id INTO v_entry_id;

    -- If v_entry_id is NULL, the entry already existed (conflict hit DO NOTHING)
    v_newly_unlocked := (v_entry_id IS NOT NULL);

    -- 6. Return result
    RETURN jsonb_build_object(
        'success', true,
        'newly_unlocked', v_newly_unlocked,
        'site_id', v_site_id,
        'pin_item_id', v_pin_item.id
    );
END;
$$;

-- Only authenticated users can call unlock
GRANT EXECUTE ON FUNCTION public.unlock_heritage_site(TEXT) TO authenticated;


-- =============================================================================
-- 3. Trigger: enforce_max_three_memories
--    BEFORE INSERT ON memories — prevents more than 3 photos per (user, site).
--    Uses pg_advisory_xact_lock to prevent race conditions from concurrent
--    requests inserting at the same time.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.enforce_max_three_memories()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
    v_lock_key BIGINT;
BEGIN
    -- Generate a deterministic lock key from (user_id, site_id)
    -- hashtext returns int4; we combine two hashtext calls into a bigint for uniqueness
    v_lock_key := (hashtext(NEW.user_id::text)::bigint << 32)
                | (hashtext(NEW.site_id::text)::bigint & x'FFFFFFFF'::bigint);

    -- Acquire transaction-scoped advisory lock (released on COMMIT/ROLLBACK)
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- Count existing memories for this (user_id, site_id) with a locked read
    SELECT COUNT(*)
    INTO v_count
    FROM public.memories
    WHERE user_id = NEW.user_id
      AND site_id = NEW.site_id;

    IF v_count >= 3 THEN
        RAISE EXCEPTION 'MAX_MEMORIES_REACHED'
            USING HINT = 'You can save a maximum of 3 photos per heritage site',
                  ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_max_three_memories
    BEFORE INSERT ON public.memories
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_max_three_memories();

