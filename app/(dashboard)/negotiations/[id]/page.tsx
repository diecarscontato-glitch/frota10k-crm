import React from "react";
import { getNegotiationById } from "@/app/actions/negotiations";
import { auth } from "@/lib/auth";
import {
  ChevronLeft,
  Car,
  Bike,
  Building2,
  ShieldCheck,
  ArrowLeftRight
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { NegotiationChat } from "@/components/negotiation-chat";

export const dynamic = "force-dynamic";

interface SessionUser {
  id: string;
  accountId: string;
}

export default async function NegotiationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const negotiation = await getNegotiationById(id);

  if (!negotiation) {
    notFound();
  }

  const userData = session?.user as SessionUser | undefined;
  const myAccountId = userData?.accountId;
  const currentUserId = userData?.id || "";
  const asset = negotiation.publication.asset;
  const isOpen = negotiation.status === "OPEN";

  const sellerName = negotiation.publication.account?.name || "Vendedor";
  const buyerName = negotiation.proponent_account.name;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
         <Link href="/negotiations" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Mesa de Acordos
         </Link>
         <div className={cn(
           "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
           isOpen ? "text-blue-400 bg-blue-500/10 border-blue-500/20" : "text-slate-400 bg-slate-500/10 border-slate-500/20"
         )}>
            {isOpen ? "Em Negociação" : negotiation.status}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden shadow-2xl">
            <CardHeader className="border-b border-slate-800 p-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                     {asset.type === "CAR" ? <Car className="w-6 h-6 text-slate-500" /> : <Bike className="w-6 h-6 text-slate-500" />}
                  </div>
                  <div>
                     <CardTitle className="text-lg text-white">
                        {asset.brand} {asset.model} {asset.year}
                     </CardTitle>
                     <p className="text-xs text-slate-500 mt-0.5">
                        <ArrowLeftRight className="w-3 h-3 inline mr-1" />
                        {sellerName} ↔ {buyerName}
                     </p>
                  </div>
               </div>
            </CardHeader>
            <NegotiationChat 
              negotiationId={negotiation.id}
              messages={negotiation.messages}
              currentUserId={currentUserId}
              isOpen={isOpen}
              isSeller={negotiation.publication.account_id === myAccountId}
            />
          </Card>
        </div>

        {/* Right Sidebar: Deal Summary */}
        <div className="space-y-6">
          {/* Asset Summary Card */}
          <Card className="bg-slate-900 border-slate-800">
             <CardHeader className="border-b border-slate-800 pb-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Resumo do Ativo</p>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Marca / Modelo</span>
                      <span className="text-white font-bold">{asset.brand} {asset.model}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Ano</span>
                      <span className="text-white font-bold">{asset.year}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Placa</span>
                      <span className="text-white font-bold">{asset.plate || "---"}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Cor</span>
                      <span className="text-white font-bold capitalize">{asset.color || "---"}</span>
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Price Card */}
          <Card className="bg-slate-900 border-emerald-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 blur-[50px] rounded-full -mr-8 -mt-8" />
             <CardContent className="pt-6 space-y-4">
                <div>
                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Valor Pedido (Ágio)</p>
                   <p className="text-3xl font-black text-white">R$ {negotiation.publication.asking_price?.toLocaleString() || "---"}</p>
                </div>
                {asset.financing && (
                  <div className="pt-4 border-t border-slate-800">
                     <p className="text-[10px] text-amber-500 uppercase font-bold tracking-widest mb-1">Saldo Devedor</p>
                     <p className="text-lg font-bold text-white">R$ {asset.financing.outstanding_balance?.toLocaleString() || "---"}</p>
                     <p className="text-[10px] text-slate-500 mt-1">
                        {asset.financing.bank} • {asset.financing.paid_installments}/{asset.financing.total_installments} parcelas
                     </p>
                  </div>
                )}
             </CardContent>
          </Card>

          {/* Parties */}
          <Card className="bg-slate-900/50 border-slate-800">
             <CardHeader className="border-b border-slate-800 pb-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Partes Envolvidas</p>
             </CardHeader>
             <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                   <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-500">
                      <Building2 className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Vendedor</p>
                      <p className="text-sm text-white font-bold">{sellerName}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                   <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500">
                      <Building2 className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Comprador</p>
                      <p className="text-sm text-white font-bold">{buyerName}</p>
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
             <div className="flex items-center gap-2 text-amber-500">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Aviso</span>
             </div>
             <p className="text-xs text-amber-200/50 leading-relaxed">
                Nunca compartilhe dados bancários diretamente pelo chat. Use a mesa de acordos apenas para alinhar termos comerciais.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
