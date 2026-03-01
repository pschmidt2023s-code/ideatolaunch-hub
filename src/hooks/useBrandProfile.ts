// ─── Hook: Build BrandProfile from DB data ─────────────────────
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/hooks/useBrand";
import { useAuth } from "@/hooks/useAuth";
import { buildBrandProfile, type BrandProfile } from "@/lib/brand-profile";

export function useBrandProfile() {
  const { activeBrand } = useBrand();
  const { user } = useAuth();
  const brandId = activeBrand?.id;

  const { data: brandProfile } = useQuery({
    queryKey: ["brand_profile_bp", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: financialModel } = useQuery({
    queryKey: ["financial_model_bp", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("financial_models")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: launchPlan } = useQuery({
    queryKey: ["launch_plan_bp", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("launch_plans")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile_bp", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const bp: BrandProfile | null = useMemo(() => {
    if (!brandId) return null;
    return buildBrandProfile(brandProfile ?? null, financialModel ?? null, launchPlan ?? null, profile ?? null);
  }, [brandId, brandProfile, financialModel, launchPlan, profile]);

  return { brandProfile: bp, loading: !brandId };
}
