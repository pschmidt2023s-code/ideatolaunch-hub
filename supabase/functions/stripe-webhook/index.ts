import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  sendEmail,
  paymentSuccessEmail,
  cancellationEmail,
  upgradeEmail,
} from "../_shared/email.ts";

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Determine plan from Stripe subscription items */
function determinePlan(subscription: Stripe.Subscription): string {
  for (const item of subscription.items.data) {
    const product = item.price.product;
    if (typeof product === "object" && product.metadata?.plan) {
      return product.metadata.plan;
    }
  }
  for (const item of subscription.items.data) {
    if (item.price.unit_amount === 7900) return "pro";
    if (item.price.unit_amount === 2900) return "builder";
  }
  return "builder";
}

/** Map plan rank for upgrade detection */
const PLAN_RANK: Record<string, number> = { free: 0, builder: 1, pro: 2 };

serve(async (req) => {
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      return jsonResponse({ error: "Payment service not configured" }, 500);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return jsonResponse({ error: "Invalid signature" }, 400);
      }
    } else {
      try {
        event = JSON.parse(body) as Stripe.Event;
      } catch {
        return jsonResponse({ error: "Invalid JSON body" }, 400);
      }
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not configured");
      return jsonResponse({ error: "Backend configuration error" }, 500);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceRoleKey
    );

    switch (event.type) {
      // ── Checkout completed ──────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.customer && session.subscription) {
          const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;

          const customer = await stripe.customers.retrieve(customerId);
          const email = (customer as Stripe.Customer).email;
          if (!email) {
            console.error("No email found for customer:", customerId);
            break;
          }

          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const user = users?.users?.find((u) => u.email === email);
          if (!user) {
            console.error("No user found for email:", email);
            break;
          }

          const sub = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ["items.data.price.product"],
          });

          let plan = session.metadata?.plan || determinePlan(sub);
          if (plan !== "builder" && plan !== "pro") plan = "builder";

          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: plan,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", user.id);

          if (error) {
            console.error("Failed to update subscription:", error);
          } else {
            console.log(`Updated user ${user.id} to plan: ${plan}`);

            // 📧 Payment success email (non-blocking)
            try {
              const tpl = paymentSuccessEmail(plan);
              await sendEmail({ to: email, ...tpl });
            } catch (e) {
              console.error("[email] payment success email failed:", e);
            }
          }
        }
        break;
      }

      // ── Subscription updated (upgrade detection) ────────────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        const { data } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id, status")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (data) {
          const previousPlan = data.status || "free";
          let newStatus: string;

          if (subscription.status === "active") {
            const fullSub = await stripe.subscriptions.retrieve(subscription.id, {
              expand: ["items.data.price.product"],
            });
            newStatus = determinePlan(fullSub);
          } else {
            newStatus = "free";
          }

          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: newStatus,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", data.user_id);

          console.log(`Subscription updated for user ${data.user_id}: ${previousPlan} → ${newStatus}`);

          // 📧 Upgrade email (non-blocking)
          if (
            (PLAN_RANK[newStatus] ?? 0) > (PLAN_RANK[previousPlan] ?? 0) &&
            newStatus !== "free"
          ) {
            try {
              const customer = await stripe.customers.retrieve(customerId);
              const email = (customer as Stripe.Customer).email;
              if (email) {
                const tpl = upgradeEmail(previousPlan, newStatus);
                await sendEmail({ to: email, ...tpl });
              }
            } catch (e) {
              console.error("[email] upgrade email failed:", e);
            }
          }
        }
        break;
      }

      // ── Subscription deleted ────────────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        // Get current plan before downgrading
        const { data: subData } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id, status, current_period_end")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        const previousPlan = subData?.status || "builder";
        const accessUntil = subData?.current_period_end
          ? new Date(subData.current_period_end).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : new Date(subscription.current_period_end * 1000).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "free",
            stripe_subscription_id: null,
            current_period_end: null,
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Subscription deleted for customer ${customerId}, downgraded to free`);

        // 📧 Cancellation email (non-blocking)
        try {
          const customer = await stripe.customers.retrieve(customerId);
          const email = (customer as Stripe.Customer).email;
          if (email) {
            const tpl = cancellationEmail(previousPlan, accessUntil);
            await sendEmail({ to: email, ...tpl });
          }
        } catch (e) {
          console.error("[email] cancellation email failed:", e);
        }
        break;
      }
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return jsonResponse({ error: error.message || "Internal server error" }, 400);
  }
});
