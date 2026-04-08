import React from "react";
import { getAssetById } from "@/app/actions/assets";
import { 
  Car, 
  Bike, 
  ChevronLeft, 
  ExternalLink, 
  BadgeDollarSign, 
  Calendar, 
  Gauge, 
  Palette, 
  Hash,
  ShieldCheck,
  FileText,
  History,
  AlertCircle,
  ChevronRight,
  PackageCheck,
  ShieldAlert,
  Radio,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { AssetActionManager } from "@/components/asset-action-manager";

 
export const dynamic = "force-dynamic";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) {
    notFound();
  }

  const getStatusColor = (status: string) => {
     switch (status) {
       case "SCREENING": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
       case "ANALYSIS": case "FINANCIAL_ANALYSIS": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
       case "LEGAL_ANALYSIS": return "text-violet-500 bg-violet-500/10 border-violet-500/20";
       case "COMMITTEE": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
       case "APPROVED": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
       case "IN_OPERATION": return "text-teal-500 bg-teal-500/10 border-teal-500/20";
       case "MARKETPLACE": return "text-green-500 bg-green-500/10 border-green-500/20";
       case "NEGOTIATION": return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
       case "REJECTED": return "text-red-500 bg-red-500/10 border-red-500/20";
       default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
     }
   };

  const statusLabel: Record<string, string> = {
    SCREENING: "Triagem",
    ANALYSIS: "Em Análise",
    FINANCIAL_ANALYSIS: "Análise Financeira",
    LEGAL_ANALYSIS: "Análise Jurídica",
    COMMITTEE: "Comitê",
    APPROVED: "Aprovado",
    IN_OPERATION: "Em Operação",
    MARKETPLACE: "Marketplace",
    NEGOTIATION: "Negociação",
    REJECTED: "Rejeitado",
    SOLD: "Vendido",
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
         <Link href="/assets" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Ativos
         </Link>
         <div className="flex gap-3">
            <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-300">
               Editar Dados
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Asset Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                     {asset.type === "CAR" ? <Car className="w-8 h-8" /> : <Bike className="w-8 h-8" />}
                  </div>
                  <div>
                     <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-white">{asset.model}</h1>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          getStatusColor(asset.status)
                        )}>
                          {statusLabel[asset.status] || asset.status}
                        </span>
                     </div>
                     <p className="text-slate-400 mt-1 uppercase font-semibold tracking-widest text-xs">
                        {asset.brand} • {asset.year} • {asset.plate || "PLACA N/A"}
                     </p>
                  </div>
               </div>
               <div className="text-left md:text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Valor Estimado</p>
                  <p className="text-3xl font-bold text-emerald-500">
                     R$ {asset.estimated_value?.toLocaleString() || "---"}
                  </p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-800">
               <div className="p-6 border-r border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                     <Gauge className="w-4 h-4" />
                     <span className="text-[10px] uppercase font-bold tracking-tight">Quilometragem</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{asset.km?.toLocaleString() || "---"} km</p>
               </div>
               <div className="p-6 border-r border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                     <Calendar className="w-4 h-4" />
                     <span className="text-[10px] uppercase font-bold tracking-tight">Ano/Mod</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{asset.year}</p>
               </div>
               <div className="p-6 border-r border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                     <Palette className="w-4 h-4" />
                     <span className="text-[10px] uppercase font-bold tracking-tight">Cor</span>
                  </div>
                  <p className="text-lg font-semibold text-white capitalize">{asset.color || "---"}</p>
               </div>
               <div className="p-6">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                     <ShieldCheck className="w-4 h-4" />
                     <span className="text-[10px] uppercase font-bold tracking-tight">Condição</span>
                  </div>
                  <p className="text-lg font-semibold text-white uppercase">{asset.condition || "N/A"}</p>
               </div>
            </div>

            <CardContent className="p-8">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <FileText className="w-5 h-5 text-blue-500" />
                     Laudos Técnicos
                  </h3>
               </div>
               {asset.analyses?.length === 0 ? (
                  <div className="bg-slate-800/30 rounded-xl p-12 text-center border border-slate-800 border-dashed">
                     <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                     <p className="text-slate-500">Nenhuma análise técnica registrada para este veículo.</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {asset.analyses.map((analysis: any) => (
                       <div key={analysis.id} className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                         <div className="flex items-center justify-between mb-3">
                           <div className="flex gap-2 flex-wrap">
                              <span className="text-[9px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase font-bold">Estrutura: {analysis.structural_score}/10</span>
                              <span className="text-[9px] bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">Motor: {analysis.engine_score}/10</span>
                              <span className="text-[9px] bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 uppercase font-bold">Pintura: {analysis.paint_score}/10</span>
                              <span className="text-[9px] bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 uppercase font-bold">Interior: {analysis.interior_score}/10</span>
                           </div>
                           <p className="text-[10px] text-slate-500">{new Date(analysis.created_at).toLocaleDateString('pt-BR')}</p>
                         </div>
                         {analysis.verdict && (
                           <div className={cn("mb-2 px-2 py-1 rounded text-[9px] uppercase font-bold w-fit",
                             analysis.verdict === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                             analysis.verdict === "NEGOTIATE" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                             "bg-red-500/10 text-red-400 border border-red-500/20"
                           )}>
                             Veredito: {analysis.verdict === "APPROVED" ? "Aprovado" : analysis.verdict === "NEGOTIATE" ? "Negociar" : "Recusado"}
                           </div>
                         )}
                         <p className="text-sm text-slate-300 italic">&quot;{analysis.recommendation || analysis.general_notes || 'Sem observações.'}&quot;</p>
                       </div>
                     ))}
                  </div>
               )}
            </CardContent>
          </Card>

          {/* Legal Analysis Card */}
          {asset.legal_analysis && (
            <Card className="bg-slate-900/50 border-violet-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-violet-500" />
                  Parecer Jurídico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Antecedentes", checked: asset.legal_analysis.criminal_records_checked },
                    { label: "Processos Cíveis", checked: asset.legal_analysis.civil_lawsuits_checked },
                    { label: "Restrições Veic.", checked: asset.legal_analysis.vehicle_restrictions_checked },
                    { label: "Status CNH", checked: asset.legal_analysis.cnh_status_checked },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                      <ShieldCheck className={cn("w-4 h-4", item.checked ? "text-emerald-500" : "text-red-400")} />
                      <span className="text-[10px] text-slate-300 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                    asset.legal_analysis.risk_level === "LOW" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                    asset.legal_analysis.risk_level === "MEDIUM" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                    asset.legal_analysis.risk_level === "HIGH" ? "text-orange-400 bg-orange-500/10 border-orange-500/20" :
                    "text-red-400 bg-red-500/10 border-red-500/20"
                  )}>
                    Risco: {asset.legal_analysis.risk_level}
                  </div>
                  <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                    asset.legal_analysis.recommendation === "PROCEED" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                    asset.legal_analysis.recommendation === "PROCEED_WITH_RESERVATIONS" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                    "text-red-400 bg-red-500/10 border-red-500/20"
                  )}>
                    {asset.legal_analysis.recommendation === "PROCEED" ? "Aprovado" :
                     asset.legal_analysis.recommendation === "PROCEED_WITH_RESERVATIONS" ? "Com Ressalvas" : "Vetado"}
                  </div>
                </div>
                {asset.legal_analysis.legal_notes && (
                  <p className="text-sm text-slate-400 italic">&quot;{asset.legal_analysis.legal_notes}&quot;</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reception Data Card */}
          {asset.reception_control?.received_at && (
            <Card className="bg-slate-900/50 border-teal-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-teal-500" />
                  Dados de Recepção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Recebido em</p>
                    <p className="text-sm text-white font-medium">{new Date(asset.reception_control.received_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">KM Recepção</p>
                    <p className="text-sm text-white font-medium font-mono">{asset.reception_control.reception_km?.toLocaleString() || "---"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio className={cn("w-4 h-4", asset.reception_control.tracker_installed ? "text-emerald-500" : "text-red-400")} />
                    <span className="text-xs text-slate-300">Rastreador</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={cn("w-4 h-4", asset.reception_control.insurance_active ? "text-emerald-500" : "text-red-400")} />
                    <span className="text-xs text-slate-300">Seguro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className={cn("w-4 h-4", asset.reception_control.hygiene_done ? "text-emerald-500" : "text-red-400")} />
                    <span className="text-xs text-slate-300">Higienizado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Decisions, Financing & Lead */}
        <div className="space-y-6">
          {/* Action Manager Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
               <CardTitle className="text-sm text-slate-400 uppercase tracking-widest">Ações do Processo</CardTitle>
            </CardHeader>
            <CardContent>
              <AssetActionManager asset={asset} />
            </CardContent>
          </Card>

          {/* Financing Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
               <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BadgeDollarSign className="w-5 h-5 text-amber-500" />
                  Dados do Financiamento
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {asset.financing ? (
                 <>
                   <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Banco / Instituição</p>
                      <p className="text-white font-medium">{asset.financing.bank}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Parcelas</p>
                         <p className="text-white font-medium">{asset.financing.paid_installments} / {asset.financing.total_installments}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Valor Parcela</p>
                         <p className="text-white font-medium">R$ {asset.financing.installment_value?.toLocaleString() || "---"}</p>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Saldo Devedor Atual</p>
                       <p className="text-2xl font-bold text-white">R$ {asset.financing.outstanding_balance?.toLocaleString() || "---"}</p>
                   </div>
                    {(asset.financing.overdue_installments ?? 0) > 0 && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                         <AlertCircle className="w-5 h-5 text-red-500" />
                         <div>
                            <p className="text-[10px] text-red-400 uppercase font-bold tracking-tight">Atraso</p>
                            <p className="text-xs text-red-300 font-medium">{asset.financing.overdue_installments} parcelas em aberto</p>
                         </div>
                      </div>
                   )}
                 </>
               ) : (
                 <div className="py-4 text-center text-slate-500 italic text-sm">
                    Nenhum financiamento vinculado.
                 </div>
               )}
            </CardContent>
          </Card>

          {/* Lead Card */}
          {asset.lead && (
            <Card className="bg-slate-900/50 border-slate-800">
               <CardHeader className="pb-4">
                  <CardTitle className="text-sm text-slate-400 uppercase tracking-widest">Lead Proprietário</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                           <Hash className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white leading-tight">{asset.lead.name}</p>
                           <p className="text-xs text-slate-500">{asset.lead.phone}</p>
                        </div>
                     </div>
                     <Link href={`/leads/${asset.lead.id}`}>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                           <ExternalLink className="w-4 h-4" />
                        </Button>
                     </Link>
                  </div>
               </CardContent>
            </Card>
          )}

          {/* Audit Log / History Shortcut */}
          <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-800/50 flex items-center justify-between group cursor-pointer hover:bg-slate-800/40 transition-all">
             <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-400">Histórico de Alterações</span>
             </div>
             <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
