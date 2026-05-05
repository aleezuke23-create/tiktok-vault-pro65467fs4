import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAccounts, useAutoSyncStaleAccounts, useCategories, type Account } from "@/hooks/use-accounts";
import { AccountCard } from "@/components/account-card";
import { AccountDialog } from "@/components/account-dialog";
import { CategoriesDialog } from "@/components/categories-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, formatCount } from "@/lib/countries";
import { Plus, Search, Tags, Users, DollarSign, ShoppingBag, Sparkles, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: categories = [] } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created");
  const [blurMode, setBlurMode] = useState(false);

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  useAutoSyncStaleAccounts(accounts);

  const filtered = useMemo(() => {
    let rows = [...accounts];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((a) =>
        (a.display_name ?? "").toLowerCase().includes(q) ||
        (a.username ?? "").toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    }
    if (filterCat !== "all") rows = rows.filter((a) => a.category_id === filterCat);
    if (filterCountry !== "all") rows = rows.filter((a) => a.country_code === filterCountry);
    if (filterStatus === "monetized") rows = rows.filter((a) => a.followers >= 10000);
    if (filterStatus === "pending") rows = rows.filter((a) => a.followers < 10000);
    if (filterStatus === "shop") rows = rows.filter((a) => a.followers >= 2000);

    if (sortBy === "followers") rows.sort((a, b) => b.followers - a.followers);
    else if (sortBy === "likes") rows.sort((a, b) => b.likes - a.likes);
    else rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return rows;
  }, [accounts, search, filterCat, filterCountry, filterStatus, sortBy]);

  const stats = useMemo(() => {
    const total = accounts.length;
    const monetized = accounts.filter((a) => a.followers >= 10000).length;
    const shop = accounts.filter((a) => a.followers >= 2000).length;
    const followers = accounts.reduce((s, a) => s + a.followers, 0);
    return { total, monetized, shop, followers };
  }, [accounts]);

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (a: Account) => { setEditing(a); setDialogOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/30 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold leading-tight truncate">TikTok Accounts</h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Gerenciador para venda</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              variant={blurMode ? "default" : "outline"}
              size="sm"
              onClick={() => setBlurMode((v) => !v)}
              className="px-2 sm:px-3"
              title={blurMode ? "Mostrar dados" : "Borrar dados sensíveis"}
            >
              {blurMode ? <EyeOff className="h-4 w-4 sm:mr-2" /> : <Eye className="h-4 w-4 sm:mr-2" />}
              <span className="hidden sm:inline">{blurMode ? "Mostrando" : "Borrar"}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCatDialogOpen(true)} className="px-2 sm:px-3">
              <Tags className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Categorias</span>
            </Button>
            <Button size="sm" onClick={openNew} className="px-2 sm:px-3">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nova conta</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 sm:pb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatCard icon={<Users className="h-4 w-4" />} label="Contas" value={String(stats.total)} />
          <StatCard icon={<DollarSign className="h-4 w-4 text-success" />} label="Monetizadas" value={String(stats.monetized)} />
          <StatCard icon={<ShoppingBag className="h-4 w-4 text-success" />} label="Com Shop" value={String(stats.shop)} />
          <StatCard icon={<Users className="h-4 w-4 text-primary" />} label="Total seguidores" value={formatCount(stats.followers)} />
        </div>

        <Card className="p-3 flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar nome, @ ou email..." className="pl-9" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger><SelectValue placeholder="País" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos países</SelectItem>
                {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="monetized">Monetizadas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="shop">Com Shop</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Mais recentes</SelectItem>
                <SelectItem value="followers">Mais seguidores</SelectItem>
                <SelectItem value="likes">Mais likes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold">Nenhuma conta {accounts.length > 0 && "encontrada"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {accounts.length === 0 ? "Adicione sua primeira conta TikTok para começar." : "Ajuste os filtros."}
            </p>
            {accounts.length === 0 && (
              <Button className="mt-4" onClick={openNew}><Plus className="h-4 w-4 mr-2" />Adicionar conta</Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <AccountCard key={a.id} account={a} category={a.category_id ? catMap.get(a.category_id) ?? null : null} onEdit={openEdit} blurSensitive={blurMode} />
            ))}
          </div>
        )}
      </main>

      <AccountDialog open={dialogOpen} onOpenChange={setDialogOpen} account={editing} />
      <CategoriesDialog open={catDialogOpen} onOpenChange={setCatDialogOpen} />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground">{icon}<span className="truncate">{label}</span></div>
      <div className="text-xl sm:text-2xl font-bold mt-1">{value}</div>
    </Card>
  );
}
