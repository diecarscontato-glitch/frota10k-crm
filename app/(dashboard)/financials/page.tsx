import React from "react";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  BadgeDollarSign,
  Lock,
  ArrowRight
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function FinancialsPage() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-emerald-600/10 rounded-lg border border-emerald-500/20">
            <BadgeDollarSign className="w-7 h-7 text-emerald-500" />
          </div>
          Hub Financeiro Global
        </h1>
        <p className="text-slate-400 mt-2">
          Visão consolidada do fluxo de caixa da empresa (A receber na Fase 6).
        </p>
      </div>

      <div className="p-12 border border-slate-800 border-dashed rounded-2xl bg-slate-900/30 text-center flex flex-col items-center justify-center">
         <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-blue-500" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-2">Módulo em Desenvolvimento</h2>
         <p className="text-slate-400 max-w-lg mb-8">
            O gerenciamento financeiro de ativos individuais já está disponível na aba "Ficha Financeira" dentro da página de cada Lead/Veículo. Este Hub Global será focado no fechamento de contas da sua Conta/Empresa.
         </p>
         <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            Ver Roadmap de Desenvolvimento <ArrowRight className="w-4 h-4" />
         </Button>
      </div>
      
      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-30 pointer-events-none grayscale">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Saldo Total</p>
            <p className="text-3xl font-black font-mono text-emerald-400">
              R$ 0,00
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Entradas</p>
              <p className="text-xl font-bold text-emerald-400 font-mono">
                R$ 0,00
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-red-500/10">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Saídas</p>
              <p className="text-xl font-bold text-red-400 font-mono">
                R$ 0,00
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
