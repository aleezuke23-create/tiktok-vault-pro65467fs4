import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchTikTokProfile } from "@/lib/tiktok.functions";
import { loadFromPantry, saveToPantry } from "@/lib/pantry.functions";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Account = Tables<"accounts">;
export type Category = Tables<"categories">;

type PantryRow = Record<string, string | number | boolean | null>;

/** Espelha o estado atual (banco ou cache) no Pantry como segunda fonte. */
async function mirrorToPantry(qc: ReturnType<typeof useQueryClient>) {
  try {
    const accounts = (qc.getQueryData<Account[]>(["accounts"]) ?? []) as unknown as PantryRow[];
    const categories = (qc.getQueryData<Category[]>(["categories"]) ?? []) as unknown as PantryRow[];
    await saveToPantry({ data: { accounts, categories } });
  } catch (e) {
    console.warn("pantry mirror falhou", e);
  }
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("accounts")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data as Account[];
      } catch (e) {
        console.warn("Banco indisponível, carregando do Pantry", e);
        const snap = await loadFromPantry({});
        return snap.accounts as unknown as Account[];
      }
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");
        if (error) throw error;
        return data as Category[];
      } catch (e) {
        console.warn("Banco indisponível, carregando categorias do Pantry", e);
        const snap = await loadFromPantry({});
        return snap.categories as unknown as Category[];
      }
    },
  });
}


export function useUpsertAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (acc: TablesInsert<"accounts"> & { id?: string }) => {
      const nowIso = new Date().toISOString();
      let dbOk = true;
      try {
        if (acc.id) {
          const { id, ...rest } = acc;
          const { error } = await supabase
            .from("accounts")
            .update({ ...rest, updated_at: nowIso } as TablesUpdate<"accounts">)
            .eq("id", id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("accounts").insert(acc);
          if (error) throw error;
        }
      } catch (e) {
        console.warn("Banco indisponível, salvando no Pantry", e);
        dbOk = false;
        const current = qc.getQueryData<Account[]>(["accounts"]) ?? [];
        const next = acc.id
          ? current.map((a) => (a.id === acc.id ? ({ ...a, ...acc, updated_at: nowIso } as Account) : a))
          : ([
              {
                ...(acc as unknown as Account),
                id: acc.id ?? crypto.randomUUID(),
                created_at: nowIso,
                updated_at: nowIso,
              },
              ...current,
            ] as Account[]);
        qc.setQueryData(["accounts"], next);
      }
      return dbOk;
    },
    onSuccess: async (dbOk) => {
      if (dbOk) await qc.invalidateQueries({ queryKey: ["accounts"] });
      await mirrorToPantry(qc);
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase.from("accounts").delete().eq("id", id);
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn("Banco indisponível, removendo no Pantry", e);
        const current = qc.getQueryData<Account[]>(["accounts"]) ?? [];
        qc.setQueryData(["accounts"], current.filter((a) => a.id !== id));
        return false;
      }
    },
    onSuccess: async (dbOk) => {
      if (dbOk) await qc.invalidateQueries({ queryKey: ["accounts"] });
      await mirrorToPantry(qc);
    },
  });
}

export function useMoveAccountCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, categoryId }: { id: string; categoryId: string | null }) => {
      const nowIso = new Date().toISOString();
      try {
        const { error } = await supabase
          .from("accounts")
          .update({ category_id: categoryId, updated_at: nowIso } as TablesUpdate<"accounts">)
          .eq("id", id);
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn("Banco indisponível, movendo no Pantry", e);
        const current = qc.getQueryData<Account[]>(["accounts"]) ?? [];
        qc.setQueryData(
          ["accounts"],
          current.map((a) => (a.id === id ? { ...a, category_id: categoryId, updated_at: nowIso } : a)),
        );
        return false;
      }
    },
    onSuccess: async (dbOk) => {
      if (dbOk) await qc.invalidateQueries({ queryKey: ["accounts"] });
      await mirrorToPantry(qc);
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .insert({ name })
          .select()
          .single();
        if (error) throw error;
        return { cat: data as Category, dbOk: true };
      } catch (e) {
        console.warn("Banco indisponível, criando categoria no Pantry", e);
        const nowIso = new Date().toISOString();
        const cat = { id: crypto.randomUUID(), name, created_at: nowIso } as unknown as Category;
        const current = qc.getQueryData<Category[]>(["categories"]) ?? [];
        qc.setQueryData(["categories"], [...current, cat]);
        return { cat, dbOk: false };
      }
    },
    onSuccess: async ({ dbOk }) => {
      if (dbOk) await qc.invalidateQueries({ queryKey: ["categories"] });
      await mirrorToPantry(qc);
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn("Banco indisponível, removendo categoria no Pantry", e);
        const cats = qc.getQueryData<Category[]>(["categories"]) ?? [];
        qc.setQueryData(["categories"], cats.filter((c) => c.id !== id));
        const accs = qc.getQueryData<Account[]>(["accounts"]) ?? [];
        qc.setQueryData(
          ["accounts"],
          accs.map((a) => (a.category_id === id ? { ...a, category_id: null } : a)),
        );
        return false;
      }
    },
    onSuccess: async (dbOk) => {
      if (dbOk) {
        await qc.invalidateQueries({ queryKey: ["categories"] });
        await qc.invalidateQueries({ queryKey: ["accounts"] });
      }
      await mirrorToPantry(qc);
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
