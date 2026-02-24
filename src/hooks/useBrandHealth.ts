import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/hooks/useBrand";
import { analyzeBrandHealth, type BrandHealthResult } from "@/lib/brand-health-engine";

export function useBrandHealth(): { health: BrandHealthResult | null; loading: boolean } {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;

  const { data: profile } = useQuery({
    queryKey: ["brand_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_profiles").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: identity } = useQuery({
    queryKey: ["brand_identity", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_identities").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: financial } = useQuery({
    queryKey: ["financial_model", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("financial_models").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: production } = useQuery({
    queryKey: ["production_plan", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("production_plans").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: compliance } = useQuery({
    queryKey: ["compliance_plan", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("compliance_plans").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: launch } = useQuery({
    queryKey: ["launch_plan", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("launch_plans").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const health = useMemo(() => {
    if (!brandId) return null;
    return analyzeBrandHealth({
      brand: activeBrand,
      profile: profile ?? null,
      identity: identity ?? null,
      financial: financial ?? null,
      production: production ?? null,
      compliance: compliance ?? null,
      launch: launch ?? null,
    });
  }, [brandId, activeBrand, profile, identity, financial, production, compliance, launch]);

  return { health, loading: !brandId };
}
