import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  product_type: "full" | "demo";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_type } = await req.json() as CheckoutRequest;
    
    console.log("[CREATE-XLR8-CHECKOUT] Processing checkout for:", product_type);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // XLR8 Plugin product details
    const productData = {
      name: "XLR8 Plugin - Full License",
      description: "DJ Maphorisa Signature Plugin - Compress. Plate. Delay. Accelerated.",
      price: 9900, // $99.00 in cents
    };

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productData.name,
              description: productData.description,
              metadata: {
                product_type: "xlr8_plugin",
              },
            },
            unit_amount: productData.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_creation: "always",
      billing_address_collection: "required",
      success_url: `${origin}/xlr8-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
      metadata: {
        product_type: "xlr8_plugin",
      },
    });

    console.log("[CREATE-XLR8-CHECKOUT] Session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-XLR8-CHECKOUT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
