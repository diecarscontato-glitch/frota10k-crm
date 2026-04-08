import React from "react";
import { getPublicationById } from "@/app/actions/marketplace";
import { auth } from "@/lib/auth";
import {
  Car,
  Bike,
  ChevronLeft,
  BadgeDollarSign,
  Calendar,
  Gauge,
  Palette,
  ShieldCheck,
  FileText,
  Building2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { InterestButton } from "@/components/interest-button";
 
export const dynamic = "force-dynamic";

export default async function MarketplaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const publication = await getPublicationById(id);

  if (!publication) {
    notFound();
  }

  const isOwner = (session?.user as any)?.accountId === publication.account_id;
  const asset = publication.asset;
  const analysis = asset.analyses?.[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
         <Link href="/marketplace" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para o Feed
         </Link>
         <div className="flex gap-3 text-xs text-slate-500 font-medium uppercase tracking-widest">
            ID: {publication.id.toUpperCase()}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Commercial Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800 flex flex-col gap-6">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                     {asset.type === "CAR" ? <Car className="w-8 h-8" /> : <Bike className="w-8 h-8" />}
                  </div>
                  <div>
                     <h1 className="text-3xl font-bold text-white">{publication.title}</h1>
                     <p className="text-slate-400 mt-1 uppercase font-semibold tracking-widest text-xs">
                        {asset.brand} • {asset.model} • {asset.year}
                     </p>
                  </div>
               </div>
               
               <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                   <p className="text-sm text-slate-300 leading-relaxed italic">
                      &quot;{publication.description}&quot;
                   </p>
               </div>

               {publication.highlight_details && (
                  <div className="flex flex-wrap gap-2">
                     {publication.highlight_details.split(',').map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase rounded-lg">
                           {tag.trim()}
                        </span>
                     ))}
                  </div>
               )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-800">
               <div className="p-6 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                     <Gauge className="w-4 h-4" />
                     <span className="text-[10px] uppercase font-bold tracking-tight">KM</span>
                  </div>
                  <p className="text-lg font-bold text-white">{asset.km?.toLocaleString() || "---"}</p>
               </div>
               <div className="p-6 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                     <Palette className="w-4 h-4" />
                     <span className="text-[10px] uppercase font-bold tracking-tight">Cor</span>
                  </div>
                  <p className="text-lg font-bold text-white capitalize">{asset.color || "---"}</p>
               </div>
               <div className="p-6 border-r border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                     <ShieldCheck className="w-4 h-4" />
                     <span className="text-[10px] uppercase font-bold tracking-tight">Estado</span>
                  </div>
                  <p className="text-lg font-bold text-white uppercase">{asset.condition || "---"}</p>
               </div>
               <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                     <Info className="w-4 h-4" />
                     <span className="text-[10px] uppercase font-bold tracking-tight">Análise</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-500">QUALIFICADO</p>
               </div>
            </div>

            <CardContent className="p-8 space-y-8">
               {/* Analysis Summary */}
               {analysis && (
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <FileText className="w-5 h-5 text-blue-500" />
                       Laudo de Triagem Técnica
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                          <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Estrutura</p>
                          <p className="text-lg font-black text-white">{analysis.structural_score}/10</p>
                       </div>
                       <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                          <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Motor</p>
                          <p className="text-lg font-black text-white">{analysis.engine_score}/10</p>
                       </div>
                       <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                          <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Pintura</p>
                          <p className="text-lg font-black text-white">{analysis.paint_score}/10</p>
                       </div>
                       <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                          <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Interior</p>
                          <p className="text-lg font-black text-white">{analysis.interior_score}/10</p>
                       </div>
                    </div>
                    {analysis.general_notes && (
                       <div className="p-4 rounded-xl bg-blue-600/5 border border-blue-500/10 text-slate-400 text-sm italic">
                          &quot;{analysis.general_notes}&quot;
                       </div>
                    )}
                 </div>
               )}

               {/* Financial Analysis from DIECAR committee */}
               {analysis && (analysis.fipe_value || analysis.total_debt_estimated || analysis.verdict) && (
                 <div className="space-y-4">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <TrendingUp className="w-5 h-5 text-emerald-500" />
                     Análise Financeira do Comitê
                   </h3>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     {analysis.fipe_value && (
                       <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                         <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">FIPE</p>
                         <p className="text-lg font-black text-white">
                           {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(analysis.fipe_value)}
                         </p>
                       </div>
                     )}
                     {analysis.total_debt_estimated && (
                       <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                         <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Saldo Devedor Est.</p>
                         <p className="text-lg font-black text-red-400">
                           {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(analysis.total_debt_estimated)}
                         </p>
                       </div>
                     )}
                     {analysis.fipe_value && analysis.total_debt_estimated && (
                       <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                         <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Margem Bruta</p>
                         <p className={`text-lg font-black ${(analysis.fipe_value - analysis.total_debt_estimated) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                           {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(analysis.fipe_value - analysis.total_debt_estimated)}
                         </p>
                       </div>
                     )}
                   </div>
                   {(analysis.verdict || analysis.bank_profile) && (
                     <div className="flex items-center gap-3 flex-wrap">
                       {analysis.verdict && (
                         <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${
                           analysis.verdict === "APROVADO"
                             ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                             : analysis.verdict === "NEGOCIAR"
                             ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                             : "bg-red-500/10 border-red-500/30 text-red-400"
                         }`}>
                           {analysis.verdict === "APROVADO" ? "🟢" : analysis.verdict === "NEGOCIAR" ? "🟡" : "🔴"} {analysis.verdict}
                         </span>
                       )}
                       {analysis.bank_profile && (
                         <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-blue-500/10 border border-blue-500/30 text-blue-400">
                           Banco: {analysis.bank_profile}
                         </span>
                       )}
                       {analysis.ready_for_committee && (
                         <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-purple-500/10 border border-purple-500/30 text-purple-400">
                           ✓ Aprovado pelo Comitê
                         </span>
                       )}
                     </div>
                   )}
                   {analysis.recommendation && (
                     <div className="p-4 rounded-xl bg-blue-600/5 border border-blue-500/10 text-slate-400 text-sm italic">
                       &quot;{analysis.recommendation}&quot;
                     </div>
                   )}
                 </div>
               )}

               {/* Financing Summary for the buyer */}
               {asset.financing && (
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <BadgeDollarSign className="w-5 h-5 text-amber-500" />
                       Dados Financeiros do Ativo
                    </h3>
                    <div className="bg-slate-800/30 rounded-2xl border border-slate-800 overflow-hidden">
                       <div className="grid grid-cols-1 md:grid-cols-3">
                          <div className="p-6 border-b md:border-b-0 md:border-r border-slate-800">
                             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Instituição</p>
                             <p className="text-white font-bold">{asset.financing.bank}</p>
                          </div>
                          <div className="p-6 border-b md:border-b-0 md:border-r border-slate-800">
                             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Parcelas</p>
                             <p className="text-white font-bold">{asset.financing.paid_installments} de {asset.financing.total_installments}</p>
                          </div>
                          <div className="p-6">
                             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Valor Parcela</p>
                             <p className="text-white font-bold">R$ {asset.financing.installment_value?.toLocaleString() || "---"}</p>
                          </div>
                       </div>
                       <div className="p-6 bg-slate-800/50 border-t border-slate-800 flex items-center justify-between">
                          <div>
                             <p className="text-[10px] text-amber-500 uppercase font-bold tracking-widest mb-1">Saldo para Quitação</p>
                             <p className="text-2xl font-black text-white">R$ {asset.financing.outstanding_balance?.toLocaleString() || "---"}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Valor Parcela</p>
                             <p className="text-xs text-slate-400">Vencimento aproximado: --/--</p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Transaction & Owner */}
        <div className="space-y-6">
          {/* Sale Card */}
          <Card className="bg-slate-900 border-slate-700 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full -mr-10 -mt-10" />
             <CardHeader className="pb-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Valor Solicitado (Ágio)</p>
                <div className="flex items-baseline gap-2">
                   <CardTitle className="text-4xl font-black text-white">R$ {publication.asking_price?.toLocaleString() || "---"}</CardTitle>
                </div>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Pronto para Transferência
                   </div>
                   <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Users className="w-4 h-4" />
                      Sem Reservas / Bloqueios
                   </div>
                </div>
                
                <div className="pt-4">
                   <InterestButton publicationId={publication.id} isOwner={isOwner} />
                </div>
                
                <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
                   Ao clicar em negociar, uma nova mesa de acordos será aberta entre você e o proprietário do ativo.
                </p>
             </CardContent>
          </Card>

          {/* Owner Info */}
          <Card className="bg-slate-900/50 border-slate-800">
             <CardHeader className="pb-3 text-center border-b border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Publicado por</p>
             </CardHeader>
             <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 shadow-inner">
                      <Building2 className="w-8 h-8" />
                   </div>
                   <div className="text-center">
                      <p className="text-lg font-bold text-white">{publication.account.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Membro qualificado FROTA10K</p>
                   </div>
                   <div className="flex gap-1 w-full mt-2">
                      {[1,2,3,4,5].map(i => <div key={i} className="flex-1 h-1 bg-emerald-500/40 rounded-full" />)}
                   </div>
                   <p className="text-[9px] text-emerald-500/60 uppercase font-bold tracking-tight">Vendedor de Confiança</p>
                </div>
             </CardContent>
          </Card>

          {/* Security Banner */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
             <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Segurança</span>
             </div>
             <p className="text-xs text-amber-200/50 leading-relaxed">
                Todas as transações devem ser documentadas na plataforma. Não realize pagamentos fora da mesa de acordos sem conferência técnica.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
