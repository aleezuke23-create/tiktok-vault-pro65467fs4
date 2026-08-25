const PANTRY_ID = "233721d4-2b4d-4fff-9577-f98dbfc6fedb";
const BASE = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket`;

export type PantrySnapshot = {
  accounts: unknown[];
  categories: unknown[];
  updated_at: string;
};

const EMPTY: PantrySnapshot = { accounts: [], categories: [], updated_at: "" };

export async function readBasket(basket: string): Promise<PantrySnapshot> {
  try {
    const res = await fetch(`${BASE}/${basket}`, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) return EMPTY;
    const json = (await res.json()) as Partial<PantrySnapshot>;
    return {
      accounts: Array.isArray(json.accounts) ? json.accounts : [],
      categories: Array.isArray(json.categories) ? json.categories : [],
      updated_at: typeof json.updated_at === "string" ? json.updated_at : "",
    };
  } catch {
    return EMPTY;
  }
}

export async function writeBasket(basket: string, snapshot: PantrySnapshot): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/${basket}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    return res.ok;
  } catch {
    return false;
  }
}
