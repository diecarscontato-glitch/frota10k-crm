"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X, Loader2 } from "lucide-react";

export function MarketplaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [destination, setDestination] = useState(searchParams.get("destination") ?? "");

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      search,
      minPrice,
      maxPrice,
      type,
      destination,
      ...overrides,
    };
    for (const [k, v] of Object.entries(values)) {
      if (v) params.set(k, v);
    }
    return `/marketplace?${params.toString()}`;
  }

  function handleApply() {
    startTransition(() => {
      router.push(buildUrl({ page: "1" }));
    });
  }

  function handleClear() {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setType("");
    setDestination("");
    startTransition(() => {
      router.push("/marketplace");
    });
  }

  const hasFilters = !!(search || minPrice || maxPrice || type || destination);

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Busca */}
        <div className="flex-1 min-w-[180px] space-y-1">
          <Label className="text-xs text-slate-400">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              placeholder="Título ou veículo..."
              className="bg-slate-800/50 border-slate-700 text-white pl-9"
            />
          </div>
        </div>

        {/* Tipo */}
        <div className="w-36 space-y-1">
          <Label className="text-xs text-slate-400">Tipo</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-slate-700 bg-slate-800/50 text-white text-sm"
          >
            <option value="">Todos</option>
            <option value="CAR">Carro</option>
            <option value="MOTO">Moto</option>
            <option value="TRUCK">Caminhão</option>
          </select>
        </div>

        {/* Destino */}
        <div className="w-40 space-y-1">
          <Label className="text-xs text-slate-400">Destino</Label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-slate-700 bg-slate-800/50 text-white text-sm"
          >
            <option value="">Todos</option>
            <option value="AGIO">Ágio</option>
            <option value="REPASSE">Repasse</option>
            <option value="LOCACAO">Locação</option>
          </select>
        </div>

        {/* Preço Mín */}
        <div className="w-32 space-y-1">
          <Label className="text-xs text-slate-400">Preço Mín</Label>
          <Input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="R$ 0"
            className="bg-slate-800/50 border-slate-700 text-white"
          />
        </div>

        {/* Preço Máx */}
        <div className="w-32 space-y-1">
          <Label className="text-xs text-slate-400">Preço Máx</Label>
          <Input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="R$ 999.999"
            className="bg-slate-800/50 border-slate-700 text-white"
          />
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button onClick={handleApply} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white h-10">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
          {hasFilters && (
            <Button onClick={handleClear} variant="outline" size="icon" className="h-10 border-slate-700 text-slate-400 hover:text-white" title="Limpar filtros">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
