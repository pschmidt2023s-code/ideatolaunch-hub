import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FraudCheckInput {
  referral_id: string;
  referred_user_id: string;
  referred_email: string;
  ip_hash?: string;
  device_fingerprint?: string;
  stripe_card_fingerprint?: string;
}

interface FraudResult {
  fraud_score: number;
  status: "valid" | "suspicious" | "flagged";
  risk_factors: string[];
}

function emailDomainSimilarity(email1: string, email2: string): number {
  const [local1, domain1] = email1.toLowerCase().split("@");
  const [local2, domain2] = email2.toLowerCase().split("@");
  if (domain1 === domain2) {
    // Same domain - check local part similarity
    const shorter = Math.min(local1.length, local2.length);
    let matches = 0;
    for (let i = 0; i < shorter; i++) {
      if (local1[i] === local2[i]) matches++;
    }
    return matches / Math.max(local1.length, local2.length);
  }
  return 0;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return dp[m][n];
}

async function computeFraudScore(
  input: FraudCheckInput,
  supabase: ReturnType<typeof createClient>
): Promise<FraudResult> {
  const riskFactors: string[] = [];
  let score = 0;

  // 1. Get referrer info
  const { data: referral } = await supabase
    .from("referrals")
    .select("user_id, referral_code")
    .eq("id", input.referral_id)
    .maybeSingle();

  if (!referral) {
    return { fraud_score: 0, status: "valid", risk_factors: ["referral_not_found"] };
  }

  // 2. Get referrer email
  const { data: referrerProfile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", referral.user_id)
    .maybeSingle();

  // 3. Email similarity check
  const { data: authData } = await supabase.auth.admin.getUserById(referral.user_id);
  const referrerEmail = authData?.user?.email || "";
  
  if (referrerEmail && input.referred_email) {
    const similarity = emailDomainSimilarity(referrerEmail, input.referred_email);
    if (similarity > 0.7) {
      score += 25;
      riskFactors.push(`email_similarity_high: ${(similarity * 100).toFixed(0)}%`);
    } else if (similarity > 0.4) {
      score += 10;
      riskFactors.push(`email_similarity_medium: ${(similarity * 100).toFixed(0)}%`);
    }

    // Levenshtein distance check
    const localReferred = input.referred_email.split("@")[0];
    const localReferrer = referrerEmail.split("@")[0];
    const dist = levenshtein(localReferred.toLowerCase(), localReferrer.toLowerCase());
    if (dist <= 2 && dist > 0) {
      score += 15;
      riskFactors.push(`email_levenshtein_close: distance=${dist}`);
    }
  }

  // 4. Signup velocity - check recent referral validations
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: recentValidations, count } = await supabase
    .from("referral_validations")
    .select("id", { count: "exact" })
    .eq("referral_id", input.referral_id)
    .gte("created_at", fiveMinAgo);

  if ((count || 0) >= 3) {
    score += 30;
    riskFactors.push(`signup_velocity_high: ${count} in 5min`);
  } else if ((count || 0) >= 2) {
    score += 15;
    riskFactors.push(`signup_velocity_medium: ${count} in 5min`);
  }

  // 5. IP similarity
  if (input.ip_hash) {
    const { data: sameIp, count: ipCount } = await supabase
      .from("referral_validations")
      .select("id", { count: "exact" })
      .eq("referral_id", input.referral_id)
      .eq("ip_hash", input.ip_hash);

    if ((ipCount || 0) >= 1) {
      score += 20;
      riskFactors.push(`shared_ip: ${ipCount} previous from same IP`);
    }
  }

  // 6. Device fingerprint
  if (input.device_fingerprint) {
    const { data: sameDevice, count: deviceCount } = await supabase
      .from("referral_validations")
      .select("id", { count: "exact" })
      .eq("referral_id", input.referral_id)
      .eq("device_fingerprint", input.device_fingerprint);

    if ((deviceCount || 0) >= 1) {
      score += 25;
      riskFactors.push(`shared_device: ${deviceCount} previous from same device`);
    }
  }

  // 7. Stripe card fingerprint
  if (input.stripe_card_fingerprint) {
    const { data: sameCard, count: cardCount } = await supabase
      .from("referral_validations")
      .select("id", { count: "exact" })
      .eq("stripe_card_fingerprint", input.stripe_card_fingerprint);

    if ((cardCount || 0) >= 1) {
      score += 30;
      riskFactors.push(`shared_stripe_card: ${cardCount} uses of same card`);
    }
  }

  // Cap score at 100
  score = Math.min(score, 100);

  const status: FraudResult["status"] =
    score > 85 ? "flagged" : score > 70 ? "suspicious" : "valid";

  return { fraud_score: score, status, risk_factors: riskFactors };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!serviceKey || !supabaseUrl) {
      return new Response(JSON.stringify({ error: "Server config error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const input: FraudCheckInput = await req.json();

    const result = await computeFraudScore(input, supabase);

    // Store validation record
    await supabase.from("referral_validations").insert({
      referral_id: input.referral_id,
      referred_user_id: input.referred_user_id,
      fraud_score: result.fraud_score,
      status: result.status,
      ip_hash: input.ip_hash || null,
      device_fingerprint: input.device_fingerprint || null,
      email_similarity_score: 0,
      signup_velocity_flag: result.risk_factors.some((r) => r.includes("velocity")),
      shared_payment_flag: result.risk_factors.some((r) => r.includes("stripe_card")),
      stripe_card_fingerprint: input.stripe_card_fingerprint || null,
      risk_factors: result.risk_factors,
    });

    // If flagged, don't count the referral
    if (result.status === "valid") {
      await supabase.rpc("increment_referral_count", { _referral_id: input.referral_id });
    }

    console.log(`[fraud] Score: ${result.fraud_score}, Status: ${result.status}, Factors: ${result.risk_factors.join(", ")}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[fraud] Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
