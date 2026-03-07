import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type PostType = "launch" | "supplier_experience" | "growth" | "lesson" | "feedback" | "market_signal" | "case_study" | "match_request";

export interface CommunityPost {
  id: string;
  user_id: string;
  post_type: string;
  title: string;
  content: string;
  tags: string[];
  category: string | null;
  upvote_count: number;
  reply_count: number;
  pinned: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  reputation?: { display_name: string | null; level: string };
}

export interface CommunityReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  upvote_count: number;
  created_at: string;
  reputation?: { display_name: string | null; level: string };
}

export interface SupplierReview {
  id: string;
  user_id: string;
  supplier_name: string;
  country: string | null;
  product_type: string | null;
  moq: string | null;
  quality_rating: number;
  communication_rating: number;
  delivery_rating: number;
  notes: string | null;
  verified: boolean;
  created_at: string;
}

export function useCommunityPosts(postType?: string, category?: string) {
  return useQuery({
    queryKey: ["community-posts", postType, category],
    queryFn: async () => {
      let query = supabase
        .from("community_posts")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);
      if (postType) query = query.eq("post_type", postType);
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CommunityPost[];
    },
  });
}

export function useCommunityPost(postId: string) {
  return useQuery({
    queryKey: ["community-post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("id", postId)
        .single();
      if (error) throw error;
      return data as CommunityPost;
    },
    enabled: !!postId,
  });
}

export function usePostReplies(postId: string) {
  return useQuery({
    queryKey: ["community-replies", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_replies")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as CommunityReply[];
    },
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (post: { title: string; content: string; post_type: string; tags?: string[]; category?: string; metadata?: Record<string, any> }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("community_posts").insert({
        ...post,
        user_id: user.id,
        tags: post.tags || [],
        metadata: post.metadata || {},
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Beitrag veröffentlicht!");
    },
    onError: () => toast.error("Fehler beim Veröffentlichen"),
  });
}

export function useCreateReply() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("community_replies").insert({
        post_id: postId,
        user_id: user.id,
        content,
      });
      if (error) throw error;
      // Increment reply count on the post
      await supabase
        .from("community_posts")
        .update({ reply_count: 0 } as any)
        .eq("id", postId)
        .then(() => {});  // best-effort
    },
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ["community-replies", postId] });
      qc.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
}

export function useToggleUpvote() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data: existing } = await supabase
        .from("community_upvotes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .maybeSingle();
      if (existing) {
        await supabase.from("community_upvotes").delete().eq("id", existing.id);
      } else {
        await supabase.from("community_upvotes").insert({ user_id: user.id, post_id: postId });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
}

export function useSupplierReviews(filters?: { country?: string; product_type?: string }) {
  return useQuery({
    queryKey: ["supplier-reviews", filters],
    queryFn: async () => {
      let query = supabase
        .from("community_supplier_reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (filters?.country) query = query.eq("country", filters.country);
      if (filters?.product_type) query = query.eq("product_type", filters.product_type);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SupplierReview[];
    },
  });
}

export function useCreateSupplierReview() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (review: Omit<SupplierReview, "id" | "user_id" | "verified" | "created_at">) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("community_supplier_reviews").insert({
        ...review,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supplier-reviews"] });
      toast.success("Bewertung veröffentlicht!");
    },
    onError: () => toast.error("Fehler beim Speichern"),
  });
}

export function useMyReputation() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-reputation", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("community_reputation")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });
}

export function useCommunityCircles() {
  return useQuery({
    queryKey: ["community-circles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_circles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useTrendingPosts() {
  return useQuery({
    queryKey: ["community-trending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("upvote_count", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data || []) as CommunityPost[];
    },
  });
}
