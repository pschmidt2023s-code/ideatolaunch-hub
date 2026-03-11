
-- BrandOS 4.0 License Management Schema

-- Create licenses table
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    license_key VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    email VARCHAR(255),
    tier VARCHAR(50) DEFAULT 'pro' CHECK (tier IN ('starter', 'pro', 'enterprise')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    max_devices INTEGER DEFAULT 3,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON public.licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON public.licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses(status);

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies (hardened)
CREATE POLICY "Users can view own license"
    ON public.licenses FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can CRUD all licenses"
    ON public.licenses FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can update own license"
    ON public.licenses FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- License key generator function
CREATE OR REPLACE FUNCTION public.generate_license_key(tier_param VARCHAR DEFAULT 'pro')
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    key_part1 VARCHAR(4);
    key_part2 VARCHAR(4);
    key_part3 VARCHAR(4);
BEGIN
    key_part1 := upper(substring(md5(random()::text) from 1 for 4));
    key_part2 := upper(substring(md5(random()::text) from 1 for 4));
    key_part3 := upper(substring(md5(random()::text) from 1 for 4));
    RETURN 'BRAND-' || key_part1 || '-' || key_part2 || '-' || key_part3;
END;
$$;

-- Create license function
CREATE OR REPLACE FUNCTION public.create_license(
    tier_param VARCHAR DEFAULT 'pro',
    days_valid INTEGER DEFAULT 365
)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_key VARCHAR;
    expiry_date TIMESTAMP WITH TIME ZONE;
BEGIN
    LOOP
        new_key := generate_license_key(tier_param);
        BEGIN
            IF days_valid > 0 THEN
                expiry_date := NOW() + (days_valid || ' days')::interval;
            ELSE
                expiry_date := NULL;
            END IF;
            INSERT INTO licenses (license_key, tier, expires_at, user_id)
            VALUES (new_key, tier_param, expiry_date, auth.uid());
            EXIT;
        EXCEPTION WHEN unique_violation THEN
            CONTINUE;
        END;
    END LOOP;
    RETURN new_key;
END;
$$;

-- License usage log table
CREATE TABLE IF NOT EXISTS public.license_usage_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_license_usage_license_id ON public.license_usage_log(license_id);
CREATE INDEX IF NOT EXISTS idx_license_usage_created_at ON public.license_usage_log(created_at);

-- RLS for usage log
ALTER TABLE public.license_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage log"
    ON public.license_usage_log FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage log"
    ON public.license_usage_log FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all usage logs"
    ON public.license_usage_log FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));
