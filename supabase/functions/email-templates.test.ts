import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  paymentSuccessEmail,
  upgradeEmail,
  cancellationEmail,
} from "./_shared/email-templates.ts";

// ─── Payment Success ─────────────────────────────────────────────────

Deno.test("paymentSuccessEmail DE – contains plan and CTA", () => {
  const result = paymentSuccessEmail({ plan: "builder", locale: "de", firstName: "Max" });
  assertEquals(result.subject, "Dein Builder Plan ist aktiv");
  assertEquals(result.html.includes("Hallo Max,"), true);
  assertEquals(result.html.includes("29 €/Monat"), true);
  assertEquals(result.html.includes("Zum Dashboard"), true);
  assertEquals(result.html.includes("Impressum"), true);
  assertEquals(result.text.includes("Hallo Max,"), true);
  assertEquals(result.text.includes("Builder"), true);
});

Deno.test("paymentSuccessEmail EN – contains plan and CTA", () => {
  const result = paymentSuccessEmail({ plan: "pro", locale: "en" });
  assertEquals(result.subject, "Your Pro plan is now active");
  assertEquals(result.html.includes("Hi!"), true);
  assertEquals(result.html.includes("€79/month"), true);
  assertEquals(result.html.includes("Go to Dashboard"), true);
  assertEquals(result.text.includes("Hi!"), true);
});

Deno.test("paymentSuccessEmail – includes next billing date when provided", () => {
  const result = paymentSuccessEmail({ plan: "builder", locale: "de", nextBillingDate: "15.04.2026" });
  assertEquals(result.html.includes("15.04.2026"), true);
  assertEquals(result.text.includes("15.04.2026"), true);
});

// ─── Upgrade ─────────────────────────────────────────────────────────

Deno.test("upgradeEmail DE – contains old/new plan and features", () => {
  const result = upgradeEmail({ oldPlan: "builder", newPlan: "pro", locale: "de", firstName: "Anna" });
  assertEquals(result.subject, "Upgrade bestätigt: Builder → Pro");
  assertEquals(result.html.includes("Hallo Anna,"), true);
  assertEquals(result.html.includes("Szenario-Simulator"), true);
  assertEquals(result.html.includes("Supplier Matching"), true);
  assertEquals(result.html.includes("Neue Features ansehen"), true);
});

Deno.test("upgradeEmail EN – correct subject and features", () => {
  const result = upgradeEmail({ oldPlan: "free", newPlan: "builder", locale: "en" });
  assertEquals(result.subject, "Upgrade confirmed: Free → Builder");
  assertEquals(result.html.includes("Insights unlocked"), true);
  assertEquals(result.html.includes("Explore what's new"), true);
});

// ─── Cancellation ────────────────────────────────────────────────────

Deno.test("cancellationEmail DE – contains access date and reactivation CTA", () => {
  const result = cancellationEmail({ plan: "pro", accessUntil: "31.03.2026", locale: "de", firstName: "Tom" });
  assertEquals(result.subject, "Dein Abo wurde gekündigt");
  assertEquals(result.html.includes("Hallo Tom,"), true);
  assertEquals(result.html.includes("31.03.2026"), true);
  assertEquals(result.html.includes("Plan reaktivieren"), true);
  assertEquals(result.text.includes("31.03.2026"), true);
});

Deno.test("cancellationEmail EN – correct subject and CTA", () => {
  const result = cancellationEmail({ plan: "builder", locale: "en" });
  assertEquals(result.subject, "Your subscription has been cancelled");
  assertEquals(result.html.includes("Reactivate plan"), true);
  assertEquals(result.text.includes("Reactivate plan"), true);
});

// ─── Layout checks ───────────────────────────────────────────────────

Deno.test("all emails include legal footer links", () => {
  const emails = [
    paymentSuccessEmail({ plan: "builder" }),
    upgradeEmail({ oldPlan: "free", newPlan: "builder" }),
    cancellationEmail({ plan: "pro" }),
  ];
  for (const e of emails) {
    assertEquals(e.html.includes("/impressum"), true);
    assertEquals(e.html.includes("/datenschutz"), true);
    assertEquals(e.html.includes("/agb"), true);
  }
});

Deno.test("all emails have plain text fallback", () => {
  const emails = [
    paymentSuccessEmail({ plan: "builder" }),
    upgradeEmail({ oldPlan: "free", newPlan: "builder" }),
    cancellationEmail({ plan: "pro" }),
  ];
  for (const e of emails) {
    assertEquals(typeof e.text, "string");
    assertEquals(e.text.length > 50, true);
    assertEquals(e.text.includes("Support:"), true);
  }
});
