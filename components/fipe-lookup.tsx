"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { getFipeMarcas, getFipeModelos, getFipeAnos, getFipeValor } from "@/app/actions/fipe";

interface FipeLookupProps {
  onFipeFound: (valor: number, info: { marca: string; modelo: string; anoModelo: number; mesReferencia: string }) => void;
}

export function FipeLookup({ onFipeFound }: FipeLookupProps) {
  const [marcas, setMarcas] = useState<{ nome: string; valor: string }[]>([]);
  const [modelos, setModelos] = useState<{ nome: string; valor: number }[]>([]);
  const [anos, setAnos] = useState<{ nome: string; valor: string }[]>([]);

  const [selectedMarca, setSelectedMarca] = useState("");
  const [selectedModelo, setSelectedModelo] = useState("");
  const [selectedAno, setSelectedAno] = useState("");

  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingAnos, setLoadingAnos] = useState(false);
  const [loadingValor, setLoadingValor] = useState(false);

  const [resultado, setResultado] = useState<{ valor: number; valorRaw: string; marca: string; modelo: string; anoModelo: number; mesReferencia: string } | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setLoadingMarcas(true);
    getFipeMarcas()
      .then(setMarcas)
      .catch(() => setErro("Falha ao carregar marcas"))
      .finally(() => setLoadingMarcas(false));
  }, []);

  async function handleMarcaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const codigo = e.target.value;
    setSelectedMarca(codigo);
    setSelectedModelo("");
    setSelectedAno("");
    setModelos([]);
    setAnos([]);
    setResultado(null);
    if (!codigo) return;
    setLoadingModelos(true);
    try {
      const data = await getFipeModelos(codigo);
      setModelos(data);
    } catch {
      setErro("Falha ao carregar modelos");
    } finally {
      setLoadingModelos(false);
    }
  }

  async function handleModeloChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const codigo = e.target.value;
    setSelectedModelo(codigo);
    setSelectedAno("");
    setAnos([]);
    setResultado(null);
    if (!codigo) return;
    setLoadingAnos(true);
    try {
      const data = await getFipeAnos(selectedMarca, codigo);
      setAnos(data);
    } catch {
      setErro("Falha ao carregar anos");
    } finally {
      setLoadingAnos(false);
    }
  }

  async function handleBuscar() {
    if (!selectedMarca || !selectedModelo || !selectedAno) return;
    setLoadingValor(true);
    setErro("");
    try {
      const data = await getFipeValor(selectedMarca, selectedModelo, selectedAno);
      setResultado(data);
      onFipeFound(data.valor, { marca: data.marca, modelo: data.modelo, anoModelo: data.anoModelo, mesReferencia: data.mesReferencia });
    } catch {
      setErro("Falha ao buscar valor FIPE. Tente novamente.");
    } finally {
      setLoadingValor(false);
    }
  }

  return (
    <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-800/50 space-y-3">
      <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Consulta Tabela FIPE</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Marca */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-400">Marca</Label>
          <div className="relative">
            <select
              value={selectedMarca}
              onChange={handleMarcaChange}
              disabled={loadingMarcas}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white appearance-none disabled:opacity-50"
            >
              <option value="">{loadingMarcas ? "Carregando..." : "Selecione"}</option>
              {marcas.map((m) => (
                <option key={m.valor} value={m.valor}>{m.nome}</option>
              ))}
            </select>
            {loadingMarcas && <Loader2 className="absolute right-2 top-2.5 w-4 h-4 animate-spin text-blue-400" />}
          </div>
        </div>

        {/* Modelo */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-400">Modelo</Label>
          <div className="relative">
            <select
              value={selectedModelo}
              onChange={handleModeloChange}
              disabled={!selectedMarca || loadingModelos}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white appearance-none disabled:opacity-50"
            >
              <option value="">{loadingModelos ? "Carregando..." : "Selecione"}</option>
              {modelos.map((m) => (
                <option key={m.valor} value={String(m.valor)}>{m.nome}</option>
              ))}
            </select>
            {loadingModelos && <Loader2 className="absolute right-2 top-2.5 w-4 h-4 animate-spin text-blue-400" />}
          </div>
        </div>

        {/* Ano */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-400">Ano</Label>
          <div className="relative">
            <select
              value={selectedAno}
              onChange={(e) => { setSelectedAno(e.target.value); setResultado(null); }}
              disabled={!selectedModelo || loadingAnos}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white appearance-none disabled:opacity-50"
            >
              <option value="">{loadingAnos ? "Carregando..." : "Selecione"}</option>
              {anos.map((a) => (
                <option key={a.valor} value={a.valor}>{a.nome}</option>
              ))}
            </select>
            {loadingAnos && <Loader2 className="absolute right-2 top-2.5 w-4 h-4 animate-spin text-blue-400" />}
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleBuscar}
        disabled={!selectedAno || loadingValor}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loadingValor ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
        Buscar FIPE
      </Button>

      {erro && <p className="text-xs text-red-400">{erro}</p>}

      {resultado && (
        <div className="flex items-center justify-between p-3 rounded bg-green-950/40 border border-green-700/50">
          <div>
            <p className="text-xs text-green-400 font-bold uppercase">FIPE Encontrado</p>
            <p className="text-sm text-slate-300">{resultado.marca} {resultado.modelo} ({resultado.anoModelo})</p>
            <p className="text-xs text-slate-500">Ref: {resultado.mesReferencia}</p>
          </div>
          <p className="text-xl font-bold text-green-400">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(resultado.valor)}
          </p>
        </div>
      )}
    </div>
  );
}
