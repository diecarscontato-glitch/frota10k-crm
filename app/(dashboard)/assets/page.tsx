import React from "react";
import { getAssets } from "@/app/actions/assets";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
  Car,
  Bike,
  Gauge,
  BadgeDollarSign,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const assets = await getAssets();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCREENING": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "ANALYSIS": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "COMMITTEE": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "MARKETPLACE": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "NEGOTIATION": return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
      case "SOLD": return "text-slate-400 bg-slate-400/10 border-slate-400/20";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const statusLabel: Record<string, string> = {
    SCREENING: "Triagem",
    ANALYSIS: "Em Análise",
    COMMITTEE: "Comitê",
    MARKETPLACE: "Marketplace",
    NEGOTIATION: "Negociação",
    SOLD: "Vendido",
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Gestão de Ativos</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Controle técnico e comercial de veículos e motocicletas.
          </p>
        </div>
        <Link href="/assets/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Cadastrar Veículo
          </Button>
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
         <Card className="bg-slate-900/40 border-slate-800 flex items-center p-4 gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
               <Car className="w-6 h-6 text-blue-500" />
            </div>
            <div>
               <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total de Ativos</p>
               <p className="text-xl font-bold text-white">{assets.length}</p>
            </div>
         </Card>
         <Card className="bg-slate-900/40 border-slate-800 flex items-center p-4 gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl">
               <TrendingUp className="w-6 h-6 text-amber-500" />
            </div>
            <div>
               <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Em Triagem/Análise</p>
               <p className="text-xl font-bold text-white">
                 {assets.filter((a: any) => ["SCREENING", "ANALYSIS"].includes(a.status)).length}
               </p>
            </div>
         </Card>
         <Card className="bg-slate-900/40 border-slate-800 flex items-center p-4 gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
               <BadgeDollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
               <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">No Marketplace</p>
               <p className="text-xl font-bold text-white">
                 {assets.filter((a: any) => a.status === "MARKETPLACE").length}
               </p>
            </div>
         </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:gap-4 bg-slate-900/50 p-3 md:p-4 rounded-xl border border-slate-800">
        <div className="flex-1 min-w-0 sm:min-w-[300px] relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            placeholder="Buscar por placa, modelo ou CPF..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-800/50 border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="border-slate-800 bg-slate-800/40 text-slate-300">
             <Filter className="w-3.5 h-3.5 mr-2" />
             Tipo
           </Button>
           <Button variant="outline" size="sm" className="border-slate-800 bg-slate-800/40 text-slate-300">
             Status
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {assets.length === 0 ? (
          <div className="col-span-full h-60 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
             <Car className="w-12 h-12 mb-4 opacity-20" />
             <p className="text-lg">Nenhum ativo registrado ainda.</p>
             <Link href="/assets/new" className="mt-4 text-blue-500 hover:text-blue-400 font-medium">
               Clique aqui para começar o primeiro registro
             </Link>
          </div>
        ) : (
          assets.map((asset: any) => (
            <Card key={asset.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all group overflow-hidden flex flex-col">
              <div className="h-40 bg-slate-800 relative flex items-center justify-center border-b border-slate-800">
                {asset.type === "CAR" ? (
                  <Car className="w-16 h-16 text-slate-700 group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Bike className="w-16 h-16 text-slate-700 group-hover:scale-110 transition-transform duration-500" />
                )}
                <div className={cn(
                  "absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  getStatusColor(asset.status)
                )}>
                  {statusLabel[asset.status] || asset.status}
                </div>
                {asset.plate && (
                  <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white border border-white/20 uppercase tracking-widest">
                    {asset.plate}
                  </div>
                )}
              </div>
              <CardHeader className="p-5">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{asset.brand}</p>
                   <p className="text-[10px] text-slate-500 font-medium">{asset.year}</p>
                </div>
                <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors">
                  {asset.model}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4 flex-1">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                       <Gauge className="w-3.5 h-3.5" />
                       <span className="text-xs">{asset.km?.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                       <BadgeDollarSign className="w-3.5 h-3.5" />
                       <span className="text-xs">R$ {asset.estimated_value?.toLocaleString()}</span>
                    </div>
                 </div>
                 {asset.financing && (
                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                       <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tight mb-1">Saldo Devedor</p>
                       <p className="text-sm font-semibold text-white">R$ {asset.financing.outstanding_balance?.toLocaleString() || "---"}</p>
                    </div>
                 )}
              </CardContent>
              <CardFooter className="p-0 border-t border-slate-800">
                 <Link 
                   href={`/assets/${asset.id}`} 
                   className="w-full flex items-center justify-center gap-2 py-4 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest"
                 >
                    Ver Ficha Completa
                    <ChevronRight className="w-4 h-4" />
                 </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
