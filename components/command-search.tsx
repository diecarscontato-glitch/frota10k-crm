"use client";

import * as React from "react";
import {
  Search,
  Users,
  Car,
  Store,
  Loader2,
  ArrowRight,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { globalSearch } from "@/app/actions/search";
import { useRouter } from "next/navigation";

export function CommandSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Awaited<ReturnType<typeof globalSearch>>>({ leads: [], assets: [], publications: [] });
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        setLoading(true);
        try {
          const res = await globalSearch(query);
          setResults(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ leads: [], assets: [], publications: [] });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm text-slate-400 transition hover:border-slate-700 hover:bg-slate-800/80 group"
      >
        <Search className="h-4 w-4 group-hover:text-blue-500 transition-colors" />
        <span className="hidden sm:inline-block">Buscar na plataforma...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-slate-800 bg-slate-950 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b border-slate-800 px-3">
           <Search className="mr-2 h-4 w-4 shrink-0 text-slate-500" />
           <CommandInput 
             placeholder="Digite para buscar leads, ativos ou ofertas..." 
             onValueChange={setQuery}
             className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
           />
           {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />}
        </div>
        <CommandList className="max-h-[450px] overflow-y-auto overflow-x-hidden">
          <CommandEmpty className="py-6 text-center text-sm text-slate-500">
             Nenhum resultado encontrado para &quot;{query}&quot;.
          </CommandEmpty>
          
          {results.leads.length > 0 && (
            <CommandGroup heading="Leads">
              {results.leads.map((lead: any) => (
                <CommandItem
                  key={lead.id}
                  onSelect={() => runCommand(() => router.push(`/leads/${lead.id}`))}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Users className="h-4 w-4 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-200">{lead.name}</span>
                    <span className="text-[10px] text-slate-500">{lead.phone}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.assets.length > 0 && (
            <CommandGroup heading="Ativos">
              {results.assets.map((asset: any) => (
                <CommandItem
                  key={asset.id}
                  onSelect={() => runCommand(() => router.push(`/assets/${asset.id}`))}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Car className="h-4 w-4 text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-200">{asset.brand} {asset.model}</span>
                    <span className="text-[10px] text-slate-500">{asset.plate} • {asset.year}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.publications.length > 0 && (
            <CommandGroup heading="Marketplace">
              {results.publications.map((item: any) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => runCommand(() => router.push(`/marketplace/${item.id}`))}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Store className="h-4 w-4 text-purple-500" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-200">{item.title}</span>
                    <span className="text-[10px] text-slate-500">R$ {item.asking_price?.toLocaleString() ?? "---"}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator className="bg-slate-800" />
          
          <CommandGroup heading="Ações Rápidas">
             <CommandItem onSelect={() => runCommand(() => router.push("/leads/new"))} className="gap-3 p-3">
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span>Captar novo Lead</span>
             </CommandItem>
             <CommandItem onSelect={() => runCommand(() => router.push("/marketplace"))} className="gap-3 p-3">
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span>Explorar Marketplace</span>
             </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
