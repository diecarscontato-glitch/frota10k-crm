"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle, FileText, AlertTriangle } from "lucide-react";
import { getWalletBalance, getAssetServiceOrders } from "@/app/actions/m12";
import { cn } from "@/lib/utils";

export function M12Marketplace({ assetId }: { assetId: string }) {
  const [balance, setBalance] = useState<number>(0);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchDashboard = React.useCallback(async () => {
    try {
      const bal = await getWalletBalance();
      setBalance(bal);
      if (assetId) {
        const ordrs = await getAssetServiceOrders(assetId);
        setOrders(ordrs);
      }
    } catch (err) {
      console.error(err);
    }
  }, [assetId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (!assetId) {
    return (
      <div className="p-4 border border-slate-800 rounded-lg bg-slate-900/50 text-slate-400 text-sm">
        Cadastre um ativo neste Lead para habilitar o Motor de Buscas M12.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aviso: integração em desenvolvimento */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-amber-300">Integração M12 em desenvolvimento</p>
          <p className="text-amber-200/80 mt-1">
            As ordens de serviço automáticas estão temporariamente desativadas. Solicite dossiês manualmente pelo contato{" "}
            <span className="font-mono">contato@m12.com.br</span>. Esta área volta a operar assim que a integração oficial for liberada.
          </p>
        </div>
      </div>

      {/* Wallet (read-only) */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center border border-blue-500/30">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400">Saldo histórico (M12 Wallet)</p>
          <h3 className="text-2xl font-bold text-white tracking-widest">
            R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60 pointer-events-none">
        {/* Card Dossiê Jurídico — desabilitado */}
        <Card className="bg-slate-900 border-slate-800 flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white text-lg">Dossiê Jurídico Cível/Trabalhista</CardTitle>
                <CardDescription>Temporariamente indisponível — pedir manualmente.</CardDescription>
              </div>
              <span className="bg-slate-800 text-white font-mono px-3 py-1 rounded-full text-sm font-bold border border-slate-700">
                R$ 60,00
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex-grow">
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> SCPC/Serasa</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Processos TJ / Jusbrasil</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Certidão Trabalhista</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Bloqueios Judiciais</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Button disabled className="w-full bg-slate-700 cursor-not-allowed">
              Em breve
            </Button>
          </CardFooter>
        </Card>

        {/* Card Dossiê Veicular — desabilitado */}
        <Card className="bg-slate-900 border-slate-800 flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white text-lg">Dossiê Veicular Completo</CardTitle>
                <CardDescription>Temporariamente indisponível — pedir manualmente.</CardDescription>
              </div>
              <span className="bg-slate-800 text-white font-mono px-3 py-1 rounded-full text-sm font-bold border border-slate-700">
                R$ 80,00
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex-grow">
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Restrições Detran (BIN)</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Histórico de Leilão/Sinistro</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Risco de Aceitação de Seguro</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Decodificador de Chassi</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Button disabled className="w-full bg-slate-700 cursor-not-allowed">
              Em breve
            </Button>
          </CardFooter>
        </Card>
      </div>

      {orders.length > 0 && (
        <div className="mt-8 border-t border-slate-800 pt-6">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Ordens de Serviço (Relatórios)
          </h4>
          <div className="space-y-3">
            {orders.map((os) => (
              <div key={os.id} className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{os.type.replace("DOSSIE_", "Dossiê ")}</p>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Protocolo: {os.id.split('-')[0]} • {new Date(os.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-bold",
                    os.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" : os.status === "PROCESSING" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"
                  )}>
                    {os.status === "PROCESSING" ? "EM ANÁLISE NA M12" : os.status}
                  </span>
                  {os.pdf_url && (
                    <a href={os.pdf_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                      <FileText className="w-4 h-4" /> Ver PDF (Mock)
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
