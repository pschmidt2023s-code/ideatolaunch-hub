
-- Trading accounts table for storing exchange connections
CREATE TABLE public.trading_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exchange TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  label TEXT,
  status TEXT NOT NULL DEFAULT 'connected',
  read_only BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  account_data JSONB DEFAULT '{}'::jsonb,
  balances JSONB DEFAULT '[]'::jsonb,
  positions JSONB DEFAULT '[]'::jsonb,
  trade_history JSONB DEFAULT '[]'::jsonb,
  risk_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own trading_accounts"
  ON public.trading_accounts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Updated at trigger
CREATE TRIGGER update_trading_accounts_updated_at
  BEFORE UPDATE ON public.trading_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index
CREATE INDEX idx_trading_accounts_user_id ON public.trading_accounts(user_id);
