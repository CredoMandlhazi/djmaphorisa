import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackControlRequest {
  action: "upload_url" | "status_update" | "add_to_pool" | "remove_from_pool" | "delete";
  trackId?: string;
  poolId?: string;
  status?: string;
  fileName?: string;
  contentType?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub;
    const body: TrackControlRequest = await req.json();
    
    console.log(`Track control action: ${body.action} by user: ${userId}`);

    switch (body.action) {
      case "upload_url": {
        // Generate a signed upload URL for track file
        if (!body.fileName || !body.contentType) {
          return new Response(
            JSON.stringify({ error: "fileName and contentType required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const filePath = `${userId}/${Date.now()}-${body.fileName}`;
        const { data, error } = await supabase.storage
          .from("tracks")
          .createSignedUploadUrl(filePath);

        if (error) {
          console.error("Upload URL error:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ uploadUrl: data.signedUrl, filePath, token: data.token }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "status_update": {
        // Only curators/admins can update status
        const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: userId });
        
        if (!roleData || !["curator", "super_curator", "admin"].includes(roleData)) {
          return new Response(
            JSON.stringify({ error: "Insufficient permissions" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!body.trackId || !body.status) {
          return new Response(
            JSON.stringify({ error: "trackId and status required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("tracks")
          .update({ status: body.status })
          .eq("id", body.trackId);

        if (error) {
          console.error("Status update error:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "add_to_pool": {
        const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: userId });
        
        if (!roleData || !["curator", "super_curator", "admin"].includes(roleData)) {
          return new Response(
            JSON.stringify({ error: "Insufficient permissions" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!body.trackId || !body.poolId) {
          return new Response(
            JSON.stringify({ error: "trackId and poolId required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("pool_tracks")
          .insert({ pool_id: body.poolId, track_id: body.trackId, added_by: userId });

        if (error) {
          console.error("Add to pool error:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "remove_from_pool": {
        const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: userId });
        
        if (!roleData || !["curator", "super_curator", "admin"].includes(roleData)) {
          return new Response(
            JSON.stringify({ error: "Insufficient permissions" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!body.trackId || !body.poolId) {
          return new Response(
            JSON.stringify({ error: "trackId and poolId required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("pool_tracks")
          .delete()
          .eq("pool_id", body.poolId)
          .eq("track_id", body.trackId);

        if (error) {
          console.error("Remove from pool error:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete": {
        if (!body.trackId) {
          return new Response(
            JSON.stringify({ error: "trackId required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if user owns the track or is a curator
        const { data: track } = await supabase
          .from("tracks")
          .select("user_id, file_url")
          .eq("id", body.trackId)
          .single();

        if (!track) {
          return new Response(
            JSON.stringify({ error: "Track not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: userId });
        const isCurator = roleData && ["curator", "super_curator", "admin"].includes(roleData);
        const isOwner = track.user_id === userId;

        if (!isOwner && !isCurator) {
          return new Response(
            JSON.stringify({ error: "Insufficient permissions" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Delete the file from storage if it exists
        if (track.file_url) {
          const filePath = track.file_url.split("/tracks/")[1];
          if (filePath) {
            await supabase.storage.from("tracks").remove([filePath]);
          }
        }

        // Delete the track record
        const { error } = await supabase
          .from("tracks")
          .delete()
          .eq("id", body.trackId);

        if (error) {
          console.error("Delete track error:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Track controls error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});