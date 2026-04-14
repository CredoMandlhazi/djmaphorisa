-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

-- Create a proper policy that allows authenticated system operations
-- Notifications are inserted via service role in edge functions, which bypasses RLS
-- So we don't need an INSERT policy for regular users