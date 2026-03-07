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

      // Simulate initial sync
      const mockData = generateMockAccountData(exchange);

      const { data, error } = await supabase.from("trading_accounts").insert({
        user_id: user.id,
        exchange,
        api_key_hash: keyHash,
        api_secret_encrypted: secretEncrypted,
        label: label || `${exchange} Account`,
        status: "connected",
        read_only: true,
        last_synced_at: new Date().toISOString(),
        account_data: mockData.account,
        balances: mockData.balances,
        positions: mockData.positions,
        trade_history: mockData.tradeHistory,
        risk_metrics: mockData.riskMetrics,
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, account: data }), {
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

      const mockData = generateMockAccountData(account.exchange);

      const { error: updateErr } = await supabase
        .from("trading_accounts")
        .update({
          last_synced_at: new Date().toISOString(),
          account_data: mockData.account,
          balances: mockData.balances,
          positions: mockData.positions,
          trade_history: mockData.tradeHistory,
          risk_metrics: mockData.riskMetrics,
        })
        .eq("id", accountId);

      if (updateErr) throw updateErr;

      return new Response(JSON.stringify({ success: true }), {
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

function generateMockAccountData(exchange: string) {
  const r = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

  const balances = [
    { asset: "USDT", free: r(5000, 50000), locked: r(0, 5000) },
    { asset: "BTC", free: r(0.01, 2), locked: r(0, 0.5) },
    { asset: "ETH", free: r(0.5, 20), locked: r(0, 5) },
    { asset: "SOL", free: r(10, 500), locked: r(0, 50) },
  ];

  const totalUsd = balances[0].free + balances[1].free * 67000 + balances[2].free * 3500 + balances[3].free * 180;

  const positions = [
    { symbol: "BTCUSDT", side: "LONG", size: r(0.01, 0.5), entryPrice: r(60000, 70000), markPrice: r(62000, 72000), leverage: Math.floor(r(2, 20)), unrealizedPnl: r(-2000, 5000), marginType: "cross" },
    { symbol: "ETHUSDT", side: "LONG", size: r(1, 10), entryPrice: r(3000, 3800), markPrice: r(3200, 4000), leverage: Math.floor(r(2, 10)), unrealizedPnl: r(-500, 2000), marginType: "isolated" },
    { symbol: "SOLUSDT", side: "SHORT", size: r(10, 100), entryPrice: r(150, 200), markPrice: r(140, 210), leverage: Math.floor(r(3, 15)), unrealizedPnl: r(-1000, 1500), marginType: "cross" },
  ];

  const tradeHistory = Array.from({ length: 20 }, (_, i) => ({
    id: `trade-${i}`,
    symbol: ["BTCUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT"][Math.floor(Math.random() * 4)],
    side: Math.random() > 0.5 ? "BUY" : "SELL",
    price: r(100, 70000),
    qty: r(0.001, 100),
    realizedPnl: r(-500, 1000),
    fee: r(0.5, 50),
    time: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
  }));

  const totalPnl = positions.reduce((s, p) => s + p.unrealizedPnl, 0);
  const maxLeverage = Math.max(...positions.map((p) => p.leverage));

  return {
    account: { exchange, totalEquity: totalUsd, totalPnl, marginLevel: r(100, 500) },
    balances,
    positions,
    tradeHistory,
    riskMetrics: {
      riskScore: maxLeverage > 10 ? r(60, 90) : r(20, 50),
      survivalProbability: maxLeverage > 10 ? r(40, 70) : r(75, 95),
      maxDrawdownRisk: r(5, 35),
      avgRiskPerTrade: r(0.5, 5),
      disciplineScore: r(40, 95),
      liquidationRisk: maxLeverage > 10 ? "high" : maxLeverage > 5 ? "medium" : "low",
    },
  };
}
