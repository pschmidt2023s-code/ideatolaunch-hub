import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { WebsiteData, WebsiteProject } from "@/components/website-builder/types";
import { toast } from "sonner";

export function useWebsiteProjects() {
  const { user } = useAuth();
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["website_projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_projects" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as WebsiteProject[];
    },
    enabled: !!user?.id,
  });

  const saveProject = useMutation({
    mutationFn: async (project: {
      id?: string;
      name: string;
      website_data: WebsiteData;
      color_scheme: string;
      selected_pages: string[];
      status?: string;
    }) => {
      const payload = {
        user_id: user!.id,
        brand_id: activeBrand?.id || null,
        name: project.name,
        website_data: project.website_data as any,
        color_scheme: project.color_scheme,
        selected_pages: project.selected_pages,
        status: project.status || "draft",
      };

      if (project.id) {
        const { data, error } = await supabase
          .from("website_projects" as any)
          .update(payload)
          .eq("id", project.id)
          .select()
          .single();
        if (error) throw error;
        return data as unknown as WebsiteProject;
      } else {
        const { data, error } = await supabase
          .from("website_projects" as any)
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data as unknown as WebsiteProject;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website_projects"] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("website_projects" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website_projects"] });
      toast.success("Projekt gelöscht");
    },
  });

  return { projects, isLoading, saveProject, deleteProject };
}
