import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  url: z.string().min(1).max(500),
});

export type TikTokProfile = {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  likes: number;
  following: number;
  videos: number;
};

function extractUsername(input: string): string | null {
  const trimmed = input.trim();
  // Already a handle
  const handleMatch = trimmed.match(/^@?([a-zA-Z0-9._]{2,30})$/);
  if (handleMatch) return handleMatch[1];
  const urlMatch = trimmed.match(/tiktok\.com\/@([a-zA-Z0-9._]{2,30})/i);
  if (urlMatch) return urlMatch[1];
  return null;
}

export const fetchTikTokProfile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; profile: TikTokProfile } | { ok: false; error: string }> => {
    const username = extractUsername(data.url);
    if (!username) {
      return { ok: false, error: "Link ou @ inválido. Use https://tiktok.com/@usuario" };
    }

    const profileUrl = `https://www.tiktok.com/@${username}`;

    const userAgents = [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    ];

    const tryFetchHtml = async (): Promise<string | null> => {
      // 1) Direct attempts with rotating UAs
      for (const ua of userAgents) {
        try {
          const res = await fetch(profileUrl, {
            headers: {
              "User-Agent": ua,
              "Accept-Language": "en-US,en;q=0.9",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Cache-Control": "no-cache",
            },
          });
          if (res.ok) {
            const html = await res.text();
            if (html.includes("__UNIVERSAL_DATA_FOR_REHYDRATION__")) return html;
          }
        } catch (e) {
          console.warn("direct fetch failed", e);
        }
      }

      // 2) Proxies públicos como fallback
      const proxies = [
        `https://r.jina.ai/${profileUrl}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(profileUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(profileUrl)}`,
      ];
      for (const proxyUrl of proxies) {
        try {
          const res = await fetch(proxyUrl, {
            headers: {
              "User-Agent": userAgents[0],
              Accept: "text/html,*/*",
            },
          });
          if (res.ok) {
            const html = await res.text();
            if (html.includes("__UNIVERSAL_DATA_FOR_REHYDRATION__")) return html;
          }
        } catch (e) {
          console.warn("proxy fetch failed:", proxyUrl, e);
        }
      }

      return null;
    };

    try {
      const html = await tryFetchHtml();
      if (!html) {
        return { ok: false, error: "TikTok bloqueou todas as tentativas (direto + proxies). Preencha manualmente." };
      }

      const match = html.match(
        /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/
      );
      if (!match) {
        return { ok: false, error: "Não foi possível ler o perfil. Preencha manualmente." };
      }

      const json = JSON.parse(match[1]);
      const userDetail =
        json?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo;
      if (!userDetail) {
        return { ok: false, error: "Perfil não encontrado ou privado." };
      }

      const user = userDetail.user ?? {};
      const stats = userDetail.stats ?? userDetail.statsV2 ?? {};

      const toNum = (v: unknown) => {
        const n = typeof v === "string" ? parseInt(v, 10) : Number(v);
        return Number.isFinite(n) ? n : 0;
      };

      return {
        ok: true,
        profile: {
          username: user.uniqueId ?? username,
          displayName: user.nickname ?? username,
          avatarUrl: user.avatarLarger ?? user.avatarMedium ?? user.avatarThumb ?? "",
          bio: user.signature ?? "",
          followers: toNum(stats.followerCount),
          likes: toNum(stats.heartCount ?? stats.heart),
          following: toNum(stats.followingCount),
          videos: toNum(stats.videoCount),
        },
      };
    } catch (err) {
      console.error("TikTok fetch error:", err);
      return { ok: false, error: "Erro ao buscar o perfil. Verifique sua conexão ou preencha manualmente." };
    }
  });
