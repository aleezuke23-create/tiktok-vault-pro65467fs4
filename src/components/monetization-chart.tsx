import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { Account } from "@/hooks/use-accounts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

type Props = { accounts: Account[] };

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function MonetizationChart({ accounts }: Props) {
  const { data, totalYear, currentMonth } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const buckets = new Map<string, { key: string; label: string; count: number; date: Date }>();

    // últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = `${MONTHS_PT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
      buckets.set(key, { key, label, count: 0, date: d });
    }

    let totalYear = 0;
    let currentMonth = 0;
    for (const a of accounts) {
      if (!a.monetized_at) continue;
      const d = new Date(a.monetized_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = buckets.get(key);
      if (b) b.count += 1;
      if (d.getFullYear() === year) totalYear += 1;
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) currentMonth += 1;
    }

    return { data: Array.from(buckets.values()), totalYear, currentMonth };
  }, [accounts]);

  const hasAny = data.some((d) => d.count > 0);

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-success/15 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-tight">Monetizações por mês</h3>
            <p className="text-[11px] text-muted-foreground">Histórico salvo automaticamente</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-success leading-none">{currentMonth}</div>
          <div className="text-[10px] text-muted-foreground">este mês · {totalYear} no ano</div>
        </div>
      </div>
      <div className="h-48 sm:h-56 w-full">
        {hasAny ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={28} />
              <Tooltip
                cursor={{ fill: "color-mix(in oklab, var(--muted) 40%, transparent)" }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v} conta${v === 1 ? "" : "s"}`, "Monetizadas"]}
              />
              <Bar dataKey="count" fill="var(--success)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center px-4">
            Ainda nenhuma conta monetizada registrada. Quando uma conta atingir 10k seguidores, a data ficará salva aqui.
          </div>
        )}
      </div>
    </Card>
  );
}
