import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function renderPage(prefillCode = "") {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Einladung einlösen – BrandOS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #141414;
      border: 1px solid #262626;
      border-radius: 16px;
      padding: 40px;
      max-width: 420px;
      width: 100%;
      margin: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #D4AF37, #F5D77A);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: #737373; font-size: 14px; margin-bottom: 32px; }
    .step-indicator {
      display: flex; gap: 8px; margin-bottom: 24px;
    }
    .step-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #262626; transition: background 0.3s;
    }
    .step-dot.active { background: #D4AF37; }
    .step-dot.done { background: #22c55e; }
    label {
      display: block; font-size: 13px; font-weight: 500;
      color: #a3a3a3; margin-bottom: 6px; margin-top: 16px;
    }
    input {
      width: 100%; padding: 12px 14px; border-radius: 10px;
      border: 1px solid #262626; background: #0a0a0a;
      color: #e5e5e5; font-size: 15px; outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #D4AF37; }
    input.code-input {
      text-align: center; font-size: 20px; font-weight: 700;
      letter-spacing: 4px; text-transform: uppercase;
    }
    button {
      width: 100%; padding: 14px; border-radius: 10px;
      border: none; font-size: 15px; font-weight: 600;
      cursor: pointer; margin-top: 24px; transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #D4AF37, #B8962E);
      color: #0a0a0a;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-secondary {
      background: #262626; color: #e5e5e5; margin-top: 12px;
    }
    .btn-secondary:hover { background: #333; }
    .error {
      background: #2d1515; border: 1px solid #7f1d1d;
      color: #fca5a5; padding: 12px; border-radius: 10px;
      font-size: 13px; margin-top: 16px; display: none;
    }
    .success {
      text-align: center; display: none;
    }
    .success .icon { font-size: 48px; margin-bottom: 16px; }
    .success h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #22c55e; }
    .success p { color: #737373; font-size: 14px; line-height: 1.5; }
    .success .plan-badge {
      display: inline-block; padding: 6px 16px; border-radius: 20px;
      background: linear-gradient(135deg, #D4AF37, #B8962E);
      color: #0a0a0a; font-weight: 700; font-size: 13px;
      text-transform: uppercase; margin: 16px 0;
    }
    .divider {
      display: flex; align-items: center; gap: 12px;
      margin: 20px 0; color: #525252; font-size: 12px;
    }
    .divider::before, .divider::after {
      content: ''; flex: 1; height: 1px; background: #262626;
    }
    .login-toggle {
      text-align: center; margin-top: 16px; font-size: 13px; color: #737373;
    }
    .login-toggle a {
      color: #D4AF37; cursor: pointer; text-decoration: none;
    }
    .spinner {
      display: inline-block; width: 16px; height: 16px;
      border: 2px solid transparent; border-top-color: #0a0a0a;
      border-radius: 50%; animation: spin 0.6s linear infinite;
      vertical-align: middle; margin-right: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .hidden { display: none !important; }
  </style>
</head>
<body>
  <div class="card">
    <!-- Step indicators -->
    <div class="step-indicator">
      <div class="step-dot active" id="dot1"></div>
      <div class="step-dot" id="dot2"></div>
      <div class="step-dot" id="dot3"></div>
    </div>

    <!-- STEP 1: Code -->
    <div id="step1">
      <div class="logo">BrandOS</div>
      <p class="subtitle">Gib deinen Einladungscode ein, um deinen Plan freizuschalten.</p>
      <label for="code">Einladungscode</label>
      <input type="text" id="code" class="code-input" placeholder="VIP-3F7A" maxlength="8" value="${prefillCode}">
      <button class="btn-primary" onclick="validateCode()">Code prüfen</button>
      <div class="error" id="error1"></div>
    </div>

    <!-- STEP 2: Signup/Login -->
    <div id="step2" class="hidden">
      <div class="logo">Konto erstellen</div>
      <p class="subtitle">Erstelle ein Konto, um deinen <strong id="planLabel"></strong>-Plan zu aktivieren.</p>
      
      <div id="signupForm">
        <label for="email">E-Mail</label>
        <input type="email" id="email" placeholder="deine@email.de">
        <label for="password">Passwort</label>
        <input type="password" id="password" placeholder="Min. 6 Zeichen" minlength="6">
        <button class="btn-primary" id="authBtn" onclick="doSignup()">Konto erstellen & Plan aktivieren</button>
      </div>

      <div id="loginForm" class="hidden">
        <label for="loginEmail">E-Mail</label>
        <input type="email" id="loginEmail" placeholder="deine@email.de">
        <label for="loginPassword">Passwort</label>
        <input type="password" id="loginPassword" placeholder="Passwort">
        <button class="btn-primary" id="loginBtn" onclick="doLogin()">Anmelden & Plan aktivieren</button>
      </div>

      <div class="login-toggle" id="toggleArea">
        <span id="toggleText">Schon ein Konto? <a onclick="toggleAuth()">Anmelden</a></span>
      </div>

      <button class="btn-secondary" onclick="goBack()">← Zurück</button>
      <div class="error" id="error2"></div>
    </div>

    <!-- STEP 3: Success -->
    <div id="step3" class="success">
      <div class="icon">✅</div>
      <h2>Plan aktiviert!</h2>
      <div class="plan-badge" id="successPlan"></div>
      <p>Dein Plan wurde erfolgreich freigeschaltet. Du kannst dich jetzt in der App anmelden.</p>
      <button class="btn-primary" onclick="window.location.href='https://brand.aldenairperfumes.de'" style="margin-top:24px">Zur App →</button>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
  <script>
    const SUPA_URL = "${SUPABASE_URL}";
    const SUPA_KEY = "${SUPABASE_ANON_KEY}";
    const sb = supabase.createClient(SUPA_URL, SUPA_KEY);

    let validatedInvite = null;
    let isLoginMode = false;

    function showError(id, msg) {
      const el = document.getElementById(id);
      el.textContent = msg;
      el.style.display = 'block';
    }
    function hideError(id) {
      document.getElementById(id).style.display = 'none';
    }
    function setLoading(btnId, loading) {
      const btn = document.getElementById(btnId) || document.querySelector('#step1 .btn-primary');
      btn.disabled = loading;
      if (loading) btn.innerHTML = '<span class="spinner"></span>Bitte warten…';
    }

    async function validateCode() {
      hideError('error1');
      const code = document.getElementById('code').value.trim().toUpperCase();
      if (!code || code.length < 5) {
        showError('error1', 'Bitte gib einen gültigen Code ein.');
        return;
      }

      const btn = document.querySelector('#step1 .btn-primary');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>Prüfe…';

      // Check code exists and is active
      const { data, error } = await sb
        .from('license_invitations')
        .select('id, plan, short_code, expires_at, status')
        .eq('short_code', code)
        .eq('status', 'active')
        .maybeSingle();

      btn.disabled = false;
      btn.textContent = 'Code prüfen';

      if (error || !data) {
        showError('error1', 'Code ungültig oder bereits verwendet.');
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        showError('error1', 'Dieser Code ist abgelaufen.');
        return;
      }

      validatedInvite = data;
      document.getElementById('planLabel').textContent = data.plan.toUpperCase();

      // Move to step 2
      document.getElementById('step1').classList.add('hidden');
      document.getElementById('step2').classList.remove('hidden');
      document.getElementById('dot1').classList.remove('active');
      document.getElementById('dot1').classList.add('done');
      document.getElementById('dot2').classList.add('active');
    }

    function toggleAuth() {
      isLoginMode = !isLoginMode;
      document.getElementById('signupForm').classList.toggle('hidden', isLoginMode);
      document.getElementById('loginForm').classList.toggle('hidden', !isLoginMode);
      document.getElementById('toggleText').innerHTML = isLoginMode
        ? 'Noch kein Konto? <a onclick="toggleAuth()">Registrieren</a>'
        : 'Schon ein Konto? <a onclick="toggleAuth()">Anmelden</a>';
      hideError('error2');
    }

    function goBack() {
      document.getElementById('step2').classList.add('hidden');
      document.getElementById('step1').classList.remove('hidden');
      document.getElementById('dot2').classList.remove('active');
      document.getElementById('dot1').classList.remove('done');
      document.getElementById('dot1').classList.add('active');
      hideError('error2');
    }

    async function doSignup() {
      hideError('error2');
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      if (!email || !password) { showError('error2', 'Bitte alle Felder ausfüllen.'); return; }
      if (password.length < 6) { showError('error2', 'Passwort muss mindestens 6 Zeichen haben.'); return; }

      const btn = document.getElementById('authBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>Erstelle Konto…';

      const { data: authData, error: authError } = await sb.auth.signUp({ email, password });
      if (authError) {
        btn.disabled = false;
        btn.textContent = 'Konto erstellen & Plan aktivieren';
        showError('error2', authError.message);
        return;
      }

      // If email confirmation is required but no session
      if (!authData.session) {
        // Try to sign in directly (in case auto-confirm is on)
        const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({ email, password });
        if (signInError || !signInData.session) {
          btn.disabled = false;
          btn.textContent = 'Konto erstellen & Plan aktivieren';
          showError('error2', 'Konto erstellt! Bitte bestätige deine E-Mail und melde dich dann hier an.');
          toggleAuth();
          return;
        }
      }

      await redeemInvite();
    }

    async function doLogin() {
      hideError('error2');
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      if (!email || !password) { showError('error2', 'Bitte alle Felder ausfüllen.'); return; }

      const btn = document.getElementById('loginBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>Anmelden…';

      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        btn.disabled = false;
        btn.textContent = 'Anmelden & Plan aktivieren';
        showError('error2', error.message);
        return;
      }

      await redeemInvite();
    }

    async function redeemInvite() {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { showError('error2', 'Sitzungsfehler. Bitte erneut versuchen.'); return; }

      const resp = await fetch(SUPA_URL + '/functions/v1/redeem-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
          'apikey': SUPA_KEY,
        },
        body: JSON.stringify({ short_code: validatedInvite.short_code }),
      });

      const result = await resp.json();
      if (!resp.ok) {
        showError('error2', result.error || 'Fehler beim Einlösen.');
        return;
      }

      // Success!
      document.getElementById('step2').classList.add('hidden');
      document.getElementById('step3').style.display = 'block';
      document.getElementById('successPlan').textContent = result.plan.toUpperCase();
      document.getElementById('dot2').classList.remove('active');
      document.getElementById('dot2').classList.add('done');
      document.getElementById('dot3').classList.add('done');
    }

    // Auto-validate if code in URL
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode) {
      document.getElementById('code').value = urlCode.toUpperCase();
      validateCode();
    }
  </script>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "";

  return new Response(renderPage(code), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
