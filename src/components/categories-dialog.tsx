import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/use-accounts";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CategoriesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: categories = [] } = useCategories();
  const create = useCreateCategory();
  const del = useDeleteCategory();
  const [name, setName] = useState("");

  const add = async () => {
    if (!name.trim()) return;
    try {
      await create.mutateAsync(name.trim());
      setName("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Gerenciar categorias</DialogTitle></DialogHeader>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da categoria"
            onKeyDown={(e) => e.key === "Enter" && add()} />
          <Button onClick={add}>Adicionar</Button>
        </div>
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {categories.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma categoria ainda</p>}
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
              <span className="text-sm">{c.name}</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del.mutate(c.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
