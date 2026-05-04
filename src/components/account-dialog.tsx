import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { fetchTikTokProfile, type TikTokProfile } from "@/server/tiktok.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES } from "@/lib/countries";
import { useCategories, useCreateCategory, useUpsertAccount, type Account } from "@/hooks/use-accounts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Download, Plus } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  account?: Account | null;
};

export function AccountDialog({ open, onOpenChange, account }: Props) {
  const fetchProfile = useServerFn(fetchTikTokProfile);
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const upsert = useUpsertAccount();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [profile, setProfile] = useState<TikTokProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (account) {
        setEmail(account.email);
        setPassword(account.password);
        setTiktokUrl(account.tiktok_url);
        setCategoryId(account.category_id);
        setCountry(account.country_code);
        setNotes(account.notes ?? "");
        setProfile({
          username: account.username ?? "",
          displayName: account.display_name ?? "",
          avatarUrl: account.avatar_url ?? "",
          bio: account.bio ?? "",
          followers: account.followers,
          likes: account.likes,
          following: account.following,
          videos: account.videos,
        });
      } else {
        setEmail(""); setPassword(""); setTiktokUrl(""); setCategoryId(null);
        setCountry(null); setNotes(""); setProfile(null);
      }
      setShowNewCat(false); setNewCat("");
    }
  }, [open, account]);

  const handleLoad = async () => {
    if (!tiktokUrl) { toast.error("Cole o link do perfil"); return; }
    setLoading(true);
    setScrapeError(null);
    try {
      const res = await fetchProfile({ data: { url: tiktokUrl } });
      if (res.ok) {
        setProfile(res.profile);
        toast.success("Perfil carregado");
      } else {
        setScrapeError(res.error);
        toast.error(res.error);
      }
    } catch {
      const msg = "Erro ao buscar perfil. Verifique sua conexão.";
      setScrapeError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    try {
      const c = await createCategory.mutateAsync(newCat.trim());
      setCategoryId(c.id);
      setNewCat(""); setShowNewCat(false);
      toast.success("Categoria criada");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro";
      toast.error(msg);
    }
  };

  const handleSave = async () => {
    if (!email || !password || !tiktokUrl) {
      toast.error("Preencha email, senha e link"); return;
    }
    try {
      await upsert.mutateAsync({
        id: account?.id,
        email, password, tiktok_url: tiktokUrl,
        category_id: categoryId, country_code: country,
        notes: notes || null,
        username: profile?.username ?? null,
        display_name: profile?.displayName ?? null,
        avatar_url: profile?.avatarUrl ?? null,
        bio: profile?.bio ?? null,
        followers: profile?.followers ?? 0,
        likes: profile?.likes ?? 0,
        following: profile?.following ?? 0,
        videos: profile?.videos ?? 0,
        last_synced_at: profile ? new Date().toISOString() : null,
      });
      toast.success(account ? "Conta atualizada" : "Conta adicionada");
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{account ? "Editar conta" : "Nova conta TikTok"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email da conta</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="conta@exemplo.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Senha</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Link do TikTok</Label>
            <div className="flex gap-2">
              <Input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://tiktok.com/@usuario" />
              <Button type="button" onClick={handleLoad} disabled={loading} variant="secondary">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Carregar</span>
              </Button>
            </div>
          </div>

          {scrapeError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex gap-2">
              <span>⚠️</span>
              <div className="flex-1">
                <div className="font-medium">Não foi possível carregar o perfil</div>
                <div className="text-xs mt-0.5 opacity-90">{scrapeError}</div>
                <div className="text-xs mt-1 opacity-75">Você pode salvar mesmo assim e preencher os dados manualmente depois.</div>
              </div>
            </div>
          )}

          {profile && (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
              <Avatar className="h-14 w-14">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback>{profile.displayName?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{profile.displayName}</div>
                <div className="text-sm text-muted-foreground truncate">@{profile.username}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {profile.followers.toLocaleString()} seguidores · {profile.likes.toLocaleString()} likes
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              {showNewCat ? (
                <div className="flex gap-2">
                  <Input autoFocus value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Nova categoria" />
                  <Button type="button" size="sm" onClick={handleAddCategory}>OK</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowNewCat(false)}>X</Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select value={categoryId ?? undefined} onValueChange={setCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button type="button" size="icon" variant="outline" onClick={() => setShowNewCat(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>País</Label>
              <Select value={country ?? undefined} onValueChange={setCountry}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="mr-2">{c.flag}</span>{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notas (opcional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Preço de venda, observações..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={upsert.isPending}>
            {upsert.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
