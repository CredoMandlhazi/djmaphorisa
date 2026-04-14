import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SnippetRequest {
  trackId: string;
  startTime?: number; // seconds, default 0
  duration?: number; // seconds, default 45
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create client with user's token for auth check
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabaseUser.auth.getClaims(token);
    
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = claims.claims.sub as string;

    // Service client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { trackId, startTime = 0, duration = 45 }: SnippetRequest = await req.json();

    if (!trackId) {
      return new Response(JSON.stringify({ error: 'Track ID required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get track info
    const { data: track, error: trackError } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single();

    if (trackError || !track) {
      return new Response(JSON.stringify({ error: 'Track not found' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Verify user owns the track or is admin/curator
    const { data: userRole } = await supabaseAdmin.rpc('get_user_role', { _user_id: userId });
    const isPrivileged = ['admin', 'super_curator', 'curator'].includes(userRole);

    if (track.user_id !== userId && !isPrivileged) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (!track.file_url) {
      return new Response(JSON.stringify({ error: 'No audio file available' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Generate snippet path
    const snippetPath = `snippets/${trackId}_${startTime}_${duration}.mp3`;

    // For now, we'll store snippet metadata
    // In production, you'd use FFmpeg or similar for actual audio processing
    // This creates a reference that the frontend can use with time-based playback
    
    const snippetMetadata = {
      trackId,
      originalFile: track.file_url,
      startTime,
      duration,
      generatedAt: new Date().toISOString()
    };

    // Update track with snippet info
    const { error: updateError } = await supabaseAdmin
      .from('tracks')
      .update({ 
        snippet_url: JSON.stringify(snippetMetadata),
        duration_seconds: track.duration_seconds || duration
      })
      .eq('id', trackId);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to save snippet info' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Create notification for track owner
    await supabaseAdmin.from('notifications').insert({
      user_id: track.user_id,
      type: 'snippet_generated',
      title: 'Preview Ready',
      message: `Your track "${track.title}" preview snippet has been generated.`,
      data: { trackId, duration }
    });

    console.log('Snippet generated for track:', trackId);

    return new Response(JSON.stringify({ 
      success: true, 
      snippet: snippetMetadata 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Snippet generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
