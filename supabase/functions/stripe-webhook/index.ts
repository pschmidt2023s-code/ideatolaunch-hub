import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // If webhook secret is configured, verify signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.customer && session.subscription) {
          const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;

          // Get customer to find user
          const customer = await stripe.customers.retrieve(customerId);
          const email = (customer as Stripe.Customer).email;
          if (!email) break;

          // Find user by email
          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const user = users?.users?.find((u) => u.email === email);
          if (!user) break;

          // Get subscription details for period end
          const sub = await stripe.subscriptions.retrieve(subscriptionId);

          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "builder",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", user.id);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        const { data } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (data) {
          const status = subscription.status === "active" ? "builder" : "free";
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", data.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "free",
            stripe_subscription_id: null,
            current_period_end: null,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
