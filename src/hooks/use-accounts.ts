import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchTikTokProfile } from "@/server/tiktok.functions";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Account = Tables<"accounts">;
export type Category = Tables<"categories">;

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Account[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useUpsertAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (acc: TablesInsert<"accounts"> & { id?: string }) => {
      if (acc.id) {
        const { id, ...rest } = acc;
        const { error } = await supabase
          .from("accounts")
          .update({ ...rest, updated_at: new Date().toISOString() } as TablesUpdate<"accounts">)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("accounts").insert(acc);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
