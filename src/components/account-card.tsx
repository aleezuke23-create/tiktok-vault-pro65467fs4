import { useState } from "react";
import type { Account, Category } from "@/hooks/use-accounts";
import { useDeleteAccount } from "@/hooks/use-accounts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, EyeOff, Copy, Trash2, Pencil, ExternalLink, Heart, Users, ShoppingBag, DollarSign } from "lucide-react";
import { getCountry, formatCount } from "@/lib/countries";
import { toast } from "sonner";

const MONETIZE_THRESHOLD = 10_000;
const SHOP_THRESHOLD = 2_000;

type Props = {
  account: Account;
  category: Category | null;
  onEdit: (a: Account) => void;
  blurSensitive?: boolean;
};

export function AccountCard({ account, category, onEdit, blurSensitive = false }: Props) {
  const [showPwd, setShowPwd] = useState(false);
  const del = useDeleteAccount();
  const country = getCountry(account.country_code);

  const monetized = account.followers >= MONETIZE_THRESHOLD;
  const shopActive = account.followers >= SHOP_THRESHOLD;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  const handleDelete = () => {
    if (confirm(`Excluir conta @${account.username ?? account.email}?`)) {
      del.mutate(account.id);
    }
  };

  const statusBorder = monetized
    ? "border-success/60 ring-1 ring-success/30"
    : "border-warning/40";

  return (
    <Card className={`relative p-4 flex flex-col gap-3 transition-all hover:-translate-y-0.5 ${statusBorder}`}>
      {monetized && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-success text-success-foreground text-[10px] font-bold shadow-md animate-pulse">
          ✓ MONETIZED
        </div>
      )}
      <div className="flex items-start gap-3">
        <Avatar className={`h-14 w-14 ring-1 ring-border transition ${blurSensitive ? "blur-md" : ""}`}>
          <AvatarImage src={account.avatar_url ?? undefined} />
          <AvatarFallback>{(account.display_name ?? account.email)[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className={`font-semibold truncate transition ${blurSensitive ? "blur-sm select-none" : ""}`}>
            {account.display_name ?? "—"}
          </div>
          <div className={`text-sm text-muted-foreground truncate transition ${blurSensitive ? "blur-sm select-none" : ""}`}>
            {account.username ? `@${account.username}` : "sem perfil carregado"}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {country && <span>{country.flag} {country.name}</span>}
            {category && <Badge variant="secondary" className="text-[10px]">{category.name}</Badge>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatCount(account.followers)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatCount(account.likes)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge
          className={
            monetized
              ? "bg-success text-success-foreground hover:bg-success/90"
              : "bg-warning text-warning-foreground hover:bg-warning/90"
          }
        >
          <DollarSign className="h-3 w-3 mr-1" />
          {monetized ? "Monetized" : "Pendente"}
        </Badge>
        <Badge
          className={
            shopActive
              ? "bg-success text-success-foreground hover:bg-success/90"
              : "bg-muted text-muted-foreground hover:bg-muted/90"
          }
        >
          <ShoppingBag className="h-3 w-3 mr-1" />
          {shopActive ? "Shop ativo" : "Shop bloqueado"}
        </Badge>
      </div>

      <div className="space-y-1.5 text-xs bg-muted/40 rounded-md p-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Email:</span>
          <span className="font-mono truncate flex-1 text-right">{account.email}</span>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copy(account.email, "Email")}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Senha:</span>
          <span className="font-mono truncate flex-1 text-right">
            {showPwd ? account.password : "•".repeat(Math.min(account.password.length, 12))}
          </span>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowPwd((v) => !v)}>
            {showPwd ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copy(account.password, "Senha")}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex gap-1.5 pt-1">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(account)}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
        </Button>
        <Button size="sm" variant="outline" asChild>
          <a href={account.tiktok_url} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
        <Button size="sm" variant="outline" onClick={handleDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
