import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const PLAN_CONFIG: Record<string, { name: string; description: string; amount: number; metaPlan: string }> = {
  builder: {
    name: "BrandOS Builder",
    description: "Unlimited brands, full insights, PDF exports",
    amount: 2900,
    metaPlan: "builder",
  },
  pro: {
    name: "BrandOS Pro",
    description: "Everything in Builder + Guided Founder Mode, Supplier Matching, Scenario Simulator",
    amount: 7900,
    metaPlan: "pro",
  },
  execution: {
    name: "BrandOS Execution OS",
    description: "Everything in Pro + Weekly KPI Control, Capital Protection Alerts, Strategic Benchmark Intelligence",
    amount: 15900,
    metaPlan: "execution",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return jsonResponse({ error: "Not authenticated" }, 401);

    // Input validation
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    const return_url = typeof body.return_url === "string" ? body.return_url : req.headers.get("origin") || "http://localhost:3000";
    const tier = typeof body.tier === "string" && body.tier in PLAN_CONFIG ? body.tier : "builder";
    const planConfig = PLAN_CONFIG[tier];

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      return jsonResponse({ error: "Payment service not configured" }, 500);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    // Find or create product
    const products = await stripe.products.list({ active: true, limit: 100 });
    let product = products.data.find((p) => p.metadata?.plan === planConfig.metaPlan);
    if (!product) {
      product = await stripe.products.create({
        name: planConfig.name,
        description: planConfig.description,
        metadata: { plan: planConfig.metaPlan },
      });
    }

    // Find or create price
    const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
    let price = prices.data.find(
      (p) => p.unit_amount === planConfig.amount && p.currency === "eur" && p.recurring?.interval === "month"
    );
    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: planConfig.amount,
        currency: "eur",
        recurring: { interval: "month" },
      });
    }

    // Check existing subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    if (subscriptions.data.length > 0) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url,
      });
      return jsonResponse({ url: portalSession.url });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "subscription",
      success_url: `${return_url}/dashboard?upgraded=true`,
      cancel_url: `${return_url}/dashboard`,
      metadata: { plan: planConfig.metaPlan },
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return jsonResponse({ error: error.message || "Internal server error" }, 500);
  }
});
