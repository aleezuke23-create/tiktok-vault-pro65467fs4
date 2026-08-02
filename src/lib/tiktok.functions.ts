import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { TikTokProfileData } from "@/lib/tiktok.server";

export type TikTokProfile = TikTokProfileData;

export const fetchTikTokProfile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ url: z.string().min(1).max(500) }).parse(data))
  .handler(
    async ({ data }): Promise<{ ok: true; profile: TikTokProfile } | { ok: false; error: string }> => {
      const { extractUsername, scrapeTikTokProfile } = await import("@/lib/tiktok.server");
      const username = extractUsername(data.url);
      if (!username) {
        return { ok: false, error: "Link ou @ inválido. Use https://tiktok.com/@usuario" };
      }
      return scrapeTikTokProfile(username);
    },
  );
