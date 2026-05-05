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

const STALE_MS = 15 * 60 * 1000; // 15 minutos

export function useRefreshAccountStats() {
  const qc = useQueryClient();
  const fetchProfile = useServerFn(fetchTikTokProfile);
  return useMutation({
    mutationFn: async (account: Account) => {
      const res = await fetchProfile({ data: { url: account.tiktok_url } });
      if (!res.ok) throw new Error(res.error);
      const p = res.profile;
      const nowIso = new Date().toISOString();
      const monetizedAt =
        !account.monetized_at && p.followers >= 10000 ? nowIso : account.monetized_at ?? null;
      const { error } = await supabase
        .from("accounts")
        .update({
          username: p.username,
          display_name: p.displayName,
          avatar_url: p.avatarUrl,
          bio: p.bio,
          followers: p.followers,
          likes: p.likes,
          following: p.following,
          videos: p.videos,
          monetized_at: monetizedAt,
          last_synced_at: nowIso,
          updated_at: nowIso,
        } as TablesUpdate<"accounts">)
        .eq("id", account.id);
      if (error) throw error;
      return p;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

/**
 * Atualiza automaticamente em background as contas com dados antigos
 * (nunca sincronizadas ou last_synced_at > 15min). Throttle entre requests.
 */
export function useAutoSyncStaleAccounts(accounts: Account[]) {
  const fetchProfile = useServerFn(fetchTikTokProfile);
  const qc = useQueryClient();
  const runningRef = useRef(false);

  useEffect(() => {
    if (!accounts.length) return;

    const tick = async () => {
      if (runningRef.current) return;
      const now = Date.now();
      const stale = accounts.filter((a) => {
        if (!a.tiktok_url) return false;
        if (!a.last_synced_at) return true;
        return now - new Date(a.last_synced_at).getTime() > STALE_MS;
      });
      if (!stale.length) return;
      runningRef.current = true;
      try {
        for (const a of stale) {
          try {
            const res = await fetchProfile({ data: { url: a.tiktok_url } });
            if (res.ok) {
              const p = res.profile;
              await supabase
                .from("accounts")
                .update({
                  username: p.username,
                  display_name: p.displayName,
                  avatar_url: p.avatarUrl,
                  bio: p.bio,
                  followers: p.followers,
                  likes: p.likes,
                  following: p.following,
                  videos: p.videos,
                  last_synced_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                } as TablesUpdate<"accounts">)
                .eq("id", a.id);
            }
          } catch (err) {
            console.warn("auto-sync falhou para", a.username ?? a.email, err);
          }
          // throttle entre requests para evitar bloqueio
          await new Promise((r) => setTimeout(r, 1500));
        }
        qc.invalidateQueries({ queryKey: ["accounts"] });
      } finally {
        runningRef.current = false;
      }
    };

    tick();
    const id = setInterval(tick, 5 * 60 * 1000); // checa a cada 5min
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.length]);
}
