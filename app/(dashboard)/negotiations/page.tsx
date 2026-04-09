import React from "react";
import { getNegotiations } from "@/app/actions/negotiations";
import { auth } from "@/lib/auth";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Car,
  Bike,
  ChevronRight,
  BadgeDollarSign,
  Building2,
  ArrowLeftRight
} from "lucide-react";
import Link from "next/link";
import { 
  Card,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
interface NegotiationWithPublication {
  id: string;
  status: string;
  current_value: number | null;
  updated_at: Date;
  publication: {
    account_id: string;
    asking_price: number;
    account: { name: string | null };
    asset: {
      type: string;
      brand: string;
      model: string;
    }
  };
  proponent_account: { name: string | null };
  proponent_account_id: string;
  messages: any[];
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case "OPEN": return { label: "Em Andamento", icon: Clock, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    case "ACCEPTED": return { label: "Acordo Fechado", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    case "REJECTED": return { label: "Recusada", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20" };
    case "CLOSED": return { label: "Encerrada", icon: XCircle, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
    default: return { label: status, icon: Clock, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
  }
};

const NegotiationList = ({ items, type, myAccountId }: { items: NegotiationWithPublication[], type: "purchase" | "sale", myAccountId?: string }) => (
  <div className="space-y-4">
    {items.length === 0 ? (
      <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
         <ArrowLeftRight className="w-8 h-8 mb-2 opacity-20" />
         <p className="text-xs font-medium">Nenhuma negociação.</p>
      </div>
    ) : (
      items.map((neg) => {
        const statusInfo = getStatusInfo(neg.status);
        const isProponent = neg.proponent_account_id === myAccountId;
        const counterpartyName = isProponent 
          ? neg.publication.account?.name || "Vendedor" 
          : neg.proponent_account.name;

        return (
          <Link key={neg.id} href={`/negotiations/${neg.id}`}>
            <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-500/30 transition-all cursor-pointer group hover:shadow-lg hover:shadow-blue-500/5">
              <div className="flex items-center p-4 md:p-5 gap-3 md:gap-5">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0 group-hover:scale-110 transition-transform">
                    {neg.publication.asset.type === "CAR" ? <Car className="w-5 h-5 md:w-6 md:h-6" /> : <Bike className="w-5 h-5 md:w-6 md:h-6" />}
                 </div>

                 <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                       <h3 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                          {neg.publication.asset.brand} {neg.publication.asset.model}
                       </h3>
                       <span className={cn(
                         "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border shrink-0",
                         statusInfo.color
                       )}>
                          {statusInfo.label}
                       </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
                       <span className="flex items-center gap-1.5 font-bold uppercase tracking-tight">
                          <Building2 className="w-3 h-3 text-slate-600" />
                          {type === "purchase" ? `Para: ${counterpartyName}` : `De: ${counterpartyName}`}
                       </span>
                       <span className="flex items-center gap-1.5 font-bold text-emerald-500/80">
                          <BadgeDollarSign className="w-3 h-3" />
                          R$ {(neg.current_value || neg.publication.asking_price)?.toLocaleString()}
                       </span>
                       <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {new Date(neg.updated_at).toLocaleDateString('pt-BR')}
                       </span>
                    </div>
                 </div>

                 <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </Card>
          </Link>
        );
      })
    )}
  </div>
);

export default async function NegotiationsPage() {
  const session = await auth();
  const rawNegotiations = await getNegotiations();
  const negotiations = rawNegotiations as unknown as NegotiationWithPublication[];
  const myAccountId = (session?.user as { accountId: string })?.accountId;

  const purchases = negotiations.filter((n) => n.proponent_account_id === myAccountId);
  const sales = negotiations.filter((n) => n.publication.account_id === myAccountId);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Mesa de Acordos</h1>
          <p className="text-slate-400 mt-1 text-xs md:text-sm">
            Gerencie suas propostas de compra e acompanhe as ofertas recebidas em seus ativos.
          </p>
        </div>
        <div className="flex gap-3 md:gap-4">
           <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Abertas</p>
              <p className="text-xl font-black text-blue-500 leading-none">{negotiations.filter((n) => n.status === 'OPEN').length}</p>
           </div>
           <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Fechadas</p>
              <p className="text-xl font-black text-emerald-500 leading-none">{negotiations.filter((n) => n.status === 'ACCEPTED').length}</p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                     <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                  </div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Minhas Compras</h2>
                  <span className="ml-auto bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                     {purchases.length}
                  </span>
               </div>
               <NegotiationList items={purchases} type="purchase" myAccountId={myAccountId} />
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                     <BadgeDollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Minhas Vendas</h2>
                  <span className="ml-auto bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                     {sales.length}
                  </span>
               </div>
               <NegotiationList items={sales} type="sale" myAccountId={myAccountId} />
            </div>
         </div>
      </div>

      <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-center gap-3">
         <MessageSquare className="w-5 h-5 text-blue-500/50" />
         <p className="text-[11px] text-blue-200/40 leading-relaxed italic">
            Dica: Utilize o chat interno para documentar todos os passos da negociação. Isso garante segurança jurídica para ambas as partes na rede FROTA10K.
         </p>
      </div>
    </div>
  );
}
