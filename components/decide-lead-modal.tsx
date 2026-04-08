"use client";

import React, { useState } from "react";
import { decideLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, CheckCircle2, XCircle, AlertTriangle, Flame, Receipt, TrendingDown, Lock } from "lucide-react";
import { hasPermission } from "@/lib/permissions";

export function DecideLeadModal({ lead, userRole }: { lead: any; userRole?: string }) {
  const canDecide = !userRole || hasPermission(userRole, "lead.decide");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const formatCurrency = (val: number | null | undefined) => {
    if (!val) return "R$ --";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  async function handleDecision(decision: 'APPROVE' | 'REJECT') {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await decideLead(lead.id, decision);
      setSuccessMsg(decision === 'APPROVE' ? "Ativo aprovado com sucesso! Movido para o estoque." : "Negócio recusado e lead arquivado.");
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMsg("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao registrar decisão");
    } finally {
      setLoading(false);
    }
  }

  if (!canDecide) {
    return (
      <Button variant="outline" size="sm" disabled className="h-7 text-xs opacity-50 gap-1">
        <Lock className="w-3 h-3" /> Sem Permissão
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="default"
        size="sm"
        className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold border-none"
      >
        Decidir
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <CardHeader className="relative border-b border-slate-800 pb-6">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-2 text-slate-500 hover:text-white transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
              <CardTitle className="text-xl text-white">Comitê de Decisão</CardTitle>
              <CardDescription className="text-slate-400">
                Avalie o risco e os números da ficha antes de aprovar a entrada do ativo na frota.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
              )}

              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" /> Lead: {lead.name}
                  </h4>
                  <p className="text-slate-400 text-sm mt-1">Veículo: {lead.vehicle_model || 'Não informado'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1 mb-1">
                      <Receipt className="w-3 h-3" /> FIPE (Estimada)
                    </div>
                    <div className="text-sm text-slate-300 font-medium">{formatCurrency((lead.finance_outstanding_balance || 0) * 2)}</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1 mb-1">
                      <TrendingDown className="w-3 h-3" /> Saldo Devedor
                    </div>
                    <div className="text-sm text-slate-300 font-medium">{formatCurrency(lead.finance_outstanding_balance)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 border-t border-slate-800 pt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:flex-1 bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 hover:text-red-400"
                onClick={() => handleDecision('REJECT')}
                disabled={loading || !!successMsg}
              >
                <XCircle className="w-4 h-4 mr-2" /> Recusar Negócio
              </Button>
              <Button
                type="button"
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={() => handleDecision('APPROVE')}
                disabled={loading || !!successMsg}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Aprovar Entrada
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
