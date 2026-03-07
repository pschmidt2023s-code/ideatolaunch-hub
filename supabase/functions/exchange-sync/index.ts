import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, accountId, exchange, apiKey, apiSecret, label } = await req.json();

    // ── CONNECT ──
    if (action === "connect") {
      if (!exchange || !apiKey || !apiSecret) {
        return new Response(JSON.stringify({ error: "Missing exchange credentials" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Hash API key for storage (never store raw)
      const keyHash = await hashString(apiKey);
      // In production, encrypt with a KMS. For now, base64 encode.
      const secretEncrypted = btoa(apiSecret.slice(0, 4) + "****");

      const { data, error } = await supabase.from("trading_accounts").insert({
        user_id: user.id,
        exchange,
        api_key_hash: keyHash,
        api_secret_encrypted: secretEncrypted,
        label: label || `${exchange} Account`,
        status: "pending_sync",
        read_only: true,
        last_synced_at: null,
        account_data: null,
        balances: null,
        positions: null,
        trade_history: null,
        risk_metrics: null,
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        account: data,
        message: "Account connected. Real-time sync will be available when exchange API integration is live."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── SYNC ──
    if (action === "sync") {
      if (!accountId) {
        return new Response(JSON.stringify({ error: "Missing accountId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: account, error: fetchErr } = await supabase
        .from("trading_accounts")
        .select("*")
        .eq("id", accountId)
        .eq("user_id", user.id)
        .single();

      if (fetchErr || !account) {
        return new Response(JSON.stringify({ error: "Account not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // TODO: Implement real exchange API calls here
      // For now, return current data without changes
      return new Response(JSON.stringify({ 
        success: true,
        message: "Real-time exchange sync will be available in a future update. Your account data will be synced automatically once the integration is live."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DISCONNECT ──
    if (action === "disconnect") {
      if (!accountId) {
        return new Response(JSON.stringify({ error: "Missing accountId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("trading_accounts")
        .delete()
        .eq("id", accountId)
        .eq("user_id", user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("exchange-sync error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
