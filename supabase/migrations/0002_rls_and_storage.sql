-- ==============================================================================
-- 0002_rls_and_storage.sql
-- Digital Heritage Passport - Row Level Security (RLS) & Supabase Storage Policies
-- ==============================================================================

-- ==============================================================================
-- 1. Enable Row Level Security (RLS) on all 9 tables
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. Table-level RLS Policies
-- ==============================================================================

-- 2.1. profiles
-- Everyone can read basic profile info (display name, avatar) to show post authors/profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2.2. heritage_sites
-- Only published heritage sites are viewable by everyone; no client write allowed
CREATE POLICY "Published heritage sites are viewable by everyone"
ON public.heritage_sites
FOR SELECT
USING (is_published = true);

-- 2.3. collections
-- Only published collections are viewable by everyone; no client write allowed
CREATE POLICY "Published collections are viewable by everyone"
ON public.collections
FOR SELECT
USING (is_published = true);

-- 2.4. pin_designs
-- Only pin designs linked to published sites are viewable; no client write allowed
CREATE POLICY "Pin designs for published sites are viewable by everyone"
ON public.pin_designs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.heritage_sites
        WHERE heritage_sites.id = pin_designs.site_id
          AND heritage_sites.is_published = true
    )
);

-- 2.5. pin_items
-- No policies defined for client roles (anon/authenticated).
-- Direct client SELECT, INSERT, UPDATE, DELETE are denied by default under RLS.
-- Access is strictly limited to backend / SECURITY DEFINER RPC functions.

-- 2.6. passport_entries
-- Authenticated users can only view their own passport entries
CREATE POLICY "Users can view their own passport entries"
ON public.passport_entries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Direct client INSERT/UPDATE/DELETE are intentionally NOT granted.
-- Passport unlocking must be performed via a SECURITY DEFINER RPC function.

-- 2.7. memories
-- Authenticated users can only view their own memories
CREATE POLICY "Users can view their own memories"
ON public.memories
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can only insert their own memories
CREATE POLICY "Users can insert their own memories"
ON public.memories
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own memories
CREATE POLICY "Users can update their own memories"
ON public.memories
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can only delete their own memories
CREATE POLICY "Users can delete their own memories"
ON public.memories
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2.8. posts
-- Anyone can view published & public posts, or author can view their own posts
CREATE POLICY "Public published posts or own posts are viewable"
ON public.posts
FOR SELECT
USING (
    (visibility = 'public' AND status = 'published')
    OR
    (auth.uid() = user_id)
);

-- Authenticated users can create their own posts
CREATE POLICY "Users can create their own posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own posts
CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own posts
CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2.9. post_likes
-- Post likes are viewable by everyone
CREATE POLICY "Post likes are viewable by everyone"
ON public.post_likes
FOR SELECT
USING (true);

-- Authenticated users can like a post on their own behalf
CREATE POLICY "Users can like posts"
ON public.post_likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can remove their own likes
CREATE POLICY "Users can remove their own likes"
ON public.post_likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==============================================================================
-- 3. Supabase Storage Buckets & Policies
-- ==============================================================================

-- 3.1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('memories', 'memories', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('community-posts', 'community-posts', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3.2. Storage Policies for 'memories' Bucket (Private: {user_id}/{filename})
CREATE POLICY "Users can view their own memory files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'memories'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload their own memory files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'memories'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own memory files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'memories'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'memories'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own memory files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'memories'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3.3. Storage Policies for 'community-posts' Bucket (Public: {user_id}/{filename})
CREATE POLICY "Public access to community post images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'community-posts');

CREATE POLICY "Authenticated users can upload community post images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'community-posts'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own community post images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'community-posts'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'community-posts'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own community post images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'community-posts'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

