-- Create tracks table for submitted tracks
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  file_url TEXT,
  external_link TEXT,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('upload', 'link')),
  platform TEXT,
  duration_seconds INTEGER,
  genre TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_pools table for curated review pools
CREATE TABLE public.test_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  curator_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_tracks INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pool_tracks junction table
CREATE TABLE public.pool_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.test_pools(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  added_by UUID NOT NULL,
  position INTEGER,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pool_id, track_id)
);

-- Create feedback table for track reviews
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  production_quality INTEGER CHECK (production_quality >= 1 AND production_quality <= 10),
  originality INTEGER CHECK (originality >= 1 AND originality <= 10),
  commercial_potential INTEGER CHECK (commercial_potential >= 1 AND commercial_potential <= 10),
  notes TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create track_likes table
CREATE TABLE public.track_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(track_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_likes ENABLE ROW LEVEL SECURITY;

-- Tracks policies
CREATE POLICY "Users can view all tracks" ON public.tracks
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own tracks" ON public.tracks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks" ON public.tracks
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Curators can update any track status" ON public.tracks
FOR UPDATE USING (
  has_role(auth.uid(), 'curator') OR 
  has_role(auth.uid(), 'super_curator') OR 
  has_role(auth.uid(), 'admin')
);

-- Test pools policies
CREATE POLICY "Anyone can view active pools" ON public.test_pools
FOR SELECT USING (is_active = true);

CREATE POLICY "Curators can manage pools" ON public.test_pools
FOR ALL USING (
  has_role(auth.uid(), 'curator') OR 
  has_role(auth.uid(), 'super_curator') OR 
  has_role(auth.uid(), 'admin')
);

-- Pool tracks policies
CREATE POLICY "Anyone can view pool tracks" ON public.pool_tracks
FOR SELECT USING (true);

CREATE POLICY "Curators can manage pool tracks" ON public.pool_tracks
FOR ALL USING (
  has_role(auth.uid(), 'curator') OR 
  has_role(auth.uid(), 'super_curator') OR 
  has_role(auth.uid(), 'admin')
);

-- Feedback policies
CREATE POLICY "Users can view public feedback" ON public.feedback
FOR SELECT USING (is_public = true);

CREATE POLICY "Track owners can view their feedback" ON public.feedback
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tracks WHERE tracks.id = feedback.track_id AND tracks.user_id = auth.uid())
);

CREATE POLICY "Curators can manage feedback" ON public.feedback
FOR ALL USING (
  has_role(auth.uid(), 'curator') OR 
  has_role(auth.uid(), 'super_curator') OR 
  has_role(auth.uid(), 'admin')
);

-- Track likes policies
CREATE POLICY "Anyone can view likes" ON public.track_likes
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like tracks" ON public.track_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" ON public.track_likes
FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for tracks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tracks', 
  'tracks', 
  false,
  52428800,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/aiff', 'audio/x-aiff', 'audio/flac']
);

-- Storage policies for tracks bucket
CREATE POLICY "Authenticated users can upload tracks" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'tracks' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own tracks" ON storage.objects
FOR SELECT USING (
  bucket_id = 'tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Curators can view all tracks" ON storage.objects
FOR SELECT USING (
  bucket_id = 'tracks' AND (
    has_role(auth.uid(), 'curator') OR 
    has_role(auth.uid(), 'super_curator') OR 
    has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users can delete their own tracks" ON storage.objects
FOR DELETE USING (
  bucket_id = 'tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add updated_at triggers
CREATE TRIGGER update_tracks_updated_at
BEFORE UPDATE ON public.tracks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_pools_updated_at
BEFORE UPDATE ON public.test_pools
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();