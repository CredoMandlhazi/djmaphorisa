import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  trackId: string;
  rating?: number;
  productionQuality?: number;
  originality?: number;
  commercialPotential?: number;
  notes?: string;
  isPublic?: boolean;
}

Deno.serve(async (req) => {
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

    // Only curators can submit feedback
    const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: userId });
    
    if (!roleData || !["curator", "super_curator", "admin"].includes(roleData)) {
      return new Response(
        JSON.stringify({ error: "Only curators can submit feedback" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: FeedbackRequest = await req.json();
    console.log(`Feedback submission for track: ${body.trackId} by user: ${userId}`);

    if (!body.trackId) {
      return new Response(
        JSON.stringify({ error: "trackId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if track exists
    const { data: track } = await supabase
      .from("tracks")
      .select("id")
      .eq("id", body.trackId)
      .single();

    if (!track) {
      return new Response(
        JSON.stringify({ error: "Track not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing feedback
    const { data: existingFeedback } = await supabase
      .from("feedback")
      .select("id")
      .eq("track_id", body.trackId)
      .eq("reviewer_id", userId)
      .single();

    if (existingFeedback) {
      // Update existing feedback
      const { error } = await supabase
        .from("feedback")
        .update({
          rating: body.rating,
          production_quality: body.productionQuality,
          originality: body.originality,
          commercial_potential: body.commercialPotential,
          notes: body.notes,
          is_public: body.isPublic ?? false,
        })
        .eq("id", existingFeedback.id);

      if (error) {
        console.error("Update feedback error:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, action: "updated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Create new feedback
      const { error } = await supabase
        .from("feedback")
        .insert({
          track_id: body.trackId,
          reviewer_id: userId,
          rating: body.rating,
          production_quality: body.productionQuality,
          originality: body.originality,
          commercial_potential: body.commercialPotential,
          notes: body.notes,
          is_public: body.isPublic ?? false,
        });

      if (error) {
        console.error("Create feedback error:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, action: "created" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Submit feedback error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});