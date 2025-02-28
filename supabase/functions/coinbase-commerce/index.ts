
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const COINBASE_COMMERCE_API_KEY = Deno.env.get("COINBASE_COMMERCE_API_KEY");
const COINBASE_COMMERCE_WEBHOOK_SECRET = Deno.env.get("COINBASE_COMMERCE_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

async function createCharge(req: Request) {
  try {
    const { experienceId, bookingId, amount, currency, description, redirectUrl } = await req.json();
    
    const response = await fetch("https://api.commerce.coinbase.com/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": COINBASE_COMMERCE_API_KEY!,
        "X-CC-Version": "2018-03-22"
      },
      body: JSON.stringify({
        name: "Experience Booking",
        description: description,
        pricing_type: "fixed_price",
        local_price: {
          amount: amount.toString(),
          currency: currency
        },
        metadata: {
          experienceId: experienceId,
          bookingId: bookingId
        },
        redirect_url: redirectUrl || `${req.headers.get("origin")}/bookings`,
        cancel_url: `${req.headers.get("origin")}/experience/${experienceId}`
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Coinbase Commerce API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Update the booking with charge information
    await supabase
      .from("payments")
      .update({
        transaction_hash: data.data.code,
        status: "pending"
      })
      .eq("booking_id", bookingId);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating charge:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function handleWebhook(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("X-CC-Webhook-Signature");
    
    if (!signature) {
      throw new Error("No signature provided");
    }
    
    // Here you would verify the webhook signature with crypto
    // This is a simplified example - you should implement proper signature verification
    
    const payload = JSON.parse(body);
    const event = payload.event;
    
    if (event.type === "charge:confirmed") {
      const chargeCode = event.data.code;
      
      // Look up the booking associated with this charge
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .select("booking_id")
        .eq("transaction_hash", chargeCode)
        .single();
      
      if (paymentError || !payment) {
        throw new Error(`Payment not found for charge: ${chargeCode}`);
      }
      
      // Update payment status
      await supabase
        .from("payments")
        .update({
          status: "completed"
        })
        .eq("transaction_hash", chargeCode);
      
      // Update booking status
      await supabase
        .from("bookings")
        .update({
          status: "confirmed"
        })
        .eq("id", payment.booking_id);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

serve(async (req) => {
  const url = new URL(req.url);
  
  // Handle different endpoints
  if (req.method === "POST" && url.pathname === "/create-charge") {
    return await createCharge(req);
  } else if (req.method === "POST" && url.pathname === "/webhook") {
    return await handleWebhook(req);
  }
  
  // Default response for unhandled routes
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
});
