"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calculator, AlertTriangle, Scale, CheckCircle2, TrendingUp, Lock } from "lucide-react";
import { saveAnalysis } from "@/app/actions/analysis";
import { cn } from "@/lib/utils";
import { FipeLookup } from "@/components/fipe-lookup";
import { hasPermission } from "@/lib/permissions";

export function AnalysisForm({ lead, initialAnalysis, userRole }: { lead: any; initialAnalysis?: any; userRole?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fipeInfo, setFipeInfo] = useState<{ marca: string; modelo: string; anoModelo: number; mesReferencia: string } | null>(null);

  // Auto-calculation states
  const [fipe, setFipe] = useState<number>(initialAnalysis?.fipe_value || 0);
  const [market, setMarket] = useState<number>(initialAnalysis?.market_value || 0);
  const totalDebt = (lead.finance_installment_value || 0) * (lead.finance_remaining_installments || 0) + (lead.finance_overdue_installments || 0) * (lead.finance_installment_value || 0);

  const diffFipe = fipe > 0 ? fipe - totalDebt : 0;
  const diffMarket = market > 0 ? market - totalDebt : 0;

  // Taxa mensal semáforo (parcela / saldo_devedor × 100)
  const saldoDevedor = lead.finance_outstanding_balance || totalDebt;
  const taxaMensal = saldoDevedor > 0 && lead.finance_installment_value > 0
    ? (lead.finance_installment_value / saldoDevedor) * 100
    : null;

  const canWrite = !userRole || hasPermission(userRole, "analysis.write");

  function handleFipeFound(valor: number, info: { marca: string; modelo: string; anoModelo: number; mesReferencia: string }) {
    setFipe(valor);
    setFipeInfo(info);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canWrite) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      fipe_value: parseFloat(formData.get("fipe_value") as string) || 0,
      market_value: parseFloat(formData.get("market_value") as string) || 0,
      difference_fipe: diffFipe,
      difference_market: diffMarket,
      estimated_rent: parseFloat(formData.get("estimated_rent") as string) || 0,
      bank_profile: formData.get("bank_profile") as string,
      verdict: formData.get("verdict") as string,
      recommendation: formData.get("recommendation") as string,
      lead_id: lead.id,
    };

    try {
      await saveAnalysis(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar análise");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!canWrite && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 text-sm">
          <Lock className="w-4 h-4" />
          Somente leitura — seu perfil não tem permissão para salvar análises.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bloco: Dívida vs FIPE */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-500" />
              Cálculo da Dívida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Taxa semáforo */}
            {taxaMensal !== null && (
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg border text-sm font-semibold",
                taxaMensal > 2.2
                  ? "bg-red-950/40 border-red-700/50 text-red-400"
                  : taxaMensal > 1.6
                  ? "bg-yellow-950/40 border-yellow-700/50 text-yellow-400"
                  : "bg-green-950/40 border-green-700/50 text-green-400"
              )}>
                <span>
                  {taxaMensal > 2.2 ? "⚠️ TAXA ABUSIVA" : taxaMensal > 1.6 ? "⚡ TAXA ELEVADA" : "✅ TAXA JUSTA"}
                </span>
                <span className="text-lg font-bold">{taxaMensal.toFixed(2)}% a.m.</span>
              </div>
            )}

            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Dívida Total Estimada</p>
                <p className="text-2xl font-bold text-red-500">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalDebt)}
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>{lead.finance_remaining_installments || 0} parcelas restantes</p>
                <p>{lead.finance_overdue_installments || 0} em atraso</p>
              </div>
            </div>

            {/* FIPE Lookup */}
            <FipeLookup onFipeFound={handleFipeFound} />
            {fipeInfo && (
              <p className="text-xs text-slate-500">
                Preenchido automaticamente: {fipeInfo.marca} {fipeInfo.modelo} {fipeInfo.anoModelo}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fipe_value" className="text-slate-300">FIPE Estimada</Label>
                <Input
                  id="fipe_value"
                  name="fipe_value"
                  type="number"
                  value={fipe || ""}
                  onChange={(e) => setFipe(parseFloat(e.target.value) || 0)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  placeholder="R$ 0,00"
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="market_value" className="text-slate-300">Mercado Real</Label>
                <Input
                  id="market_value"
                  name="market_value"
                  type="number"
                  value={market || ""}
                  onChange={(e) => setMarket(parseFloat(e.target.value) || 0)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  placeholder="R$ 0,00"
                  disabled={!canWrite}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Diferença p/ FIPE</p>
                <p className={cn("font-bold", diffFipe >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {diffFipe >= 0 ? "+" : ""}{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(diffFipe)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Diferença p/ Mercado</p>
                <p className={cn("font-bold", diffMarket >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {diffMarket >= 0 ? "+" : ""}{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(diffMarket)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloco: Potencial e Risco */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Potencial & Risco
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_rent" className="text-slate-300">Faixa de Aluguel Estimada / Receita</Label>
              <Input
                id="estimated_rent"
                name="estimated_rent"
                type="number"
                defaultValue={initialAnalysis?.estimated_rent || ""}
                className="bg-slate-800/50 border-slate-700 text-white"
                placeholder="Ex: 2500"
                disabled={!canWrite}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_profile" className="text-slate-300">Perfil do Banco</Label>
              <select
                id="bank_profile"
                name="bank_profile"
                defaultValue={initialAnalysis?.bank_profile || ""}
                disabled={!canWrite}
                className="w-full h-10 px-3 rounded-md border border-input bg-slate-800/50 border-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Selecione o perfil do credor</option>
                <option value="NEGOCIAVEL">Bom para negociar (Ex: PAN)</option>
                <option value="MEDIO">Médio (Bancos Tradicionais)</option>
                <option value="RUIM">Ruim / Agressivo (Busca rápida)</option>
                <option value="COOPERATIVA">Cooperativa (Mais travado)</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 p-3 rounded-md border border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-xs text-amber-200">
                  <span className="font-bold">Atenção ao Risco:</span>{" "}
                  {(lead.finance_overdue_installments || 0) >= 3
                    ? "3+ parcelas em atraso. Risco ALTO de busca e apreensão."
                    : "Atraso controlado momentaneamente."}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bloco: Veredito Final */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-500" />
            Veredito da Mesa de Análise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-300 uppercase text-xs font-bold tracking-widest">Carimbo Decisório</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["APROVADO", "NEGOCIAR", "RECUSADO"].map((v) => (
                <label key={v} className={cn("cursor-pointer group", !canWrite && "pointer-events-none opacity-60")}>
                  <input type="radio" name="verdict" value={v} className="peer hidden" defaultChecked={initialAnalysis?.verdict === v} disabled={!canWrite} />
                  <div className={cn(
                    "p-4 rounded-xl border-2 border-slate-800 bg-slate-900 transition-all text-center",
                    v === "APROVADO" && "peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10",
                    v === "NEGOCIAR" && "peer-checked:border-amber-500 peer-checked:bg-amber-500/10",
                    v === "RECUSADO" && "peer-checked:border-red-500 peer-checked:bg-red-500/10",
                  )}>
                    <span className={cn(
                      "block text-lg font-bold text-slate-300 mb-1",
                      v === "APROVADO" && "peer-checked:text-emerald-500",
                      v === "NEGOCIAR" && "peer-checked:text-amber-500",
                      v === "RECUSADO" && "peer-checked:text-red-500",
                    )}>
                      {v === "APROVADO" ? "🟢" : v === "NEGOCIAR" ? "🟡" : "🔴"} {v}
                    </span>
                    <span className="text-xs text-slate-500">
                      {v === "APROVADO" ? "Entra no padrão da esteira" : v === "NEGOCIAR" ? "Ajustar preço ou condição" : "Risco ou dívida inviável"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendation" className="text-slate-300">Tese de Saída e Plano de Ação</Label>
            <textarea
              id="recommendation"
              name="recommendation"
              rows={3}
              defaultValue={initialAnalysis?.recommendation || ""}
              disabled={!canWrite}
              placeholder="Ex: Assunção com R$ 2.000 de entrada e destino direto para locação de app..."
              className="w-full p-3 rounded-lg border border-slate-700 bg-slate-800/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm">{error}</div>}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Veredito salvo com sucesso! Lead pode avançar jurídico.
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button type="submit" disabled={loading || !canWrite} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] disabled:opacity-50">
              {loading ? "Salvando..." : canWrite ? "Salvar Parecer da Análise" : "Sem Permissão"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
