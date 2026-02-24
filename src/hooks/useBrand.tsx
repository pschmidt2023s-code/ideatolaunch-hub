import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

interface BrandContextType {
  brands: Tables<"brands">[];
  activeBrand: Tables<"brands"> | null;
  setActiveBrandId: (id: string) => void;
  loading: boolean;
  refetchBrands: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  const { data: brands = [], isLoading, refetch } = useQuery({
    queryKey: ["brands", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (brands.length > 0 && !activeBrandId) {
      setActiveBrandId(brands[0].id);
    }
  }, [brands, activeBrandId]);

  const activeBrand = brands.find((b) => b.id === activeBrandId) ?? null;

  return (
    <BrandContext.Provider
      value={{
        brands,
        activeBrand,
        setActiveBrandId,
        loading: isLoading,
        refetchBrands: refetch,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within BrandProvider");
  return ctx;
}
