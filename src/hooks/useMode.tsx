import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppMode } from "@/lib/mode-types";

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => Promise<void>;
  loading: boolean;
  needsSelection: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [needsSelection, setNeedsSelection] = useState(false);

  const { data: profileMode, isLoading } = useQuery({
    queryKey: ["profile-mode", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("selected_mode")
        .eq("user_id", user!.id)
        .maybeSingle();
      return (data?.selected_mode as AppMode) ?? "founder";
    },
    enabled: !!user,
  });

  const [localMode, setLocalMode] = useState<AppMode>("founder");

  useEffect(() => {
    if (profileMode) {
      setLocalMode(profileMode);
      setNeedsSelection(false);
    }
  }, [profileMode]);

  // Detect first login (no mode explicitly chosen yet)
  useEffect(() => {
    if (!isLoading && user && !profileMode) {
      setNeedsSelection(true);
    }
  }, [isLoading, user, profileMode]);

  const setMode = async (newMode: AppMode) => {
    setLocalMode(newMode);
    setNeedsSelection(false);
    if (user) {
      await supabase
        .from("profiles")
        .update({ selected_mode: newMode })
        .eq("user_id", user.id);
      queryClient.invalidateQueries({ queryKey: ["profile-mode", user.id] });
    }
  };

  return (
    <ModeContext.Provider value={{ mode: localMode, setMode, loading: isLoading, needsSelection }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
}
