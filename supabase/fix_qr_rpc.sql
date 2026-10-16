-- ==============================================================================
-- Fix for preview_qr_token and unlock_heritage_site in Supabase
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Ensure pgcrypto extension is installed in schema extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Update preview_qr_token function with extensions search_path & bytea cast
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

GRANT EXECUTE ON FUNCTION public.preview_qr_token(TEXT) TO anon, authenticated;

-- 3. Update unlock_heritage_site function with extensions search_path & bytea cast
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
    INSERT INTO public.passport_entries (user_id, site_id, first_pin_item_id)
    VALUES (v_current_user, v_site_id, v_pin_item.id)
    ON CONFLICT (user_id, site_id) DO NOTHING
    RETURNING id INTO v_entry_id;

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

GRANT EXECUTE ON FUNCTION public.unlock_heritage_site(TEXT) TO authenticated;

