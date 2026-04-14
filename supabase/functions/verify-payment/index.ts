import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Beat file URLs mapping
const beatFiles: Record<string, string> = {
  "Chikatetsu": "/audio/Chikatetsu.mp3",
  "D R O W N I N N O T W A V I N": "/audio/D_R_O_W_N_I_N_N_O_T_W_A_V_I_N.mp3",
  "Dr Doctor": "/audio/Dr_Doctor.mp3",
  "Fallin": "/audio/Fallin.mp3",
  "See You Go": "/audio/See_You_Go.mp3",
  "TKYOSKY": "/audio/TKYOSKY.mp3",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error("No session ID provided");
    }

    console.log("[VERIFY-PAYMENT] Verifying session:", session_id);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    console.log("[VERIFY-PAYMENT] Payment verified for:", session.customer_details?.email);

    // Get beat names from metadata
    const beatNames = session.metadata?.beat_names 
      ? JSON.parse(session.metadata.beat_names) 
      : [];

    // Map beat names to download URLs
    const downloads = beatNames.map((name: string) => ({
      name,
      url: beatFiles[name] || null,
    })).filter((d: { name: string; url: string | null }) => d.url !== null);

    return new Response(JSON.stringify({
      success: true,
      email: session.customer_details?.email,
      downloads,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[VERIFY-PAYMENT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
