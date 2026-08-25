import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASKET = "tiktok-manager";

export const loadFromPantry = createServerFn({ method: "GET" }).handler(async () => {
  const { readBasket } = await import("@/lib/pantry.server");
  return readBasket(BASKET);
});

export const saveToPantry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        accounts: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))),
        categories: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { writeBasket } = await import("@/lib/pantry.server");
    const ok = await writeBasket(BASKET, {
      accounts: data.accounts,
      categories: data.categories,
      updated_at: new Date().toISOString(),
    });
    return { ok };
  });
