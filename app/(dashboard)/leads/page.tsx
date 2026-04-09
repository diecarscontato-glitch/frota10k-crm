import React from "react";
import { getLeads } from "@/app/actions/leads";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Filter, Search, Phone, MapPin, User as UserIcon, ChevronRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadIntakeModal } from "@/components/lead-intake-modal";
import { ImportLeadsModal } from "@/components/import-leads-modal";
import { EditLeadModal } from "@/components/edit-lead-modal";
import { DecideLeadModal } from "@/components/decide-lead-modal";
import Link from "next/link";

import { getStatusColorClass, getStatusLabel } from "@/lib/constants/lead-stages";

const getUrgencyBadge = (urgency: string | null) => {
  if (urgency === 'HIGH') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_-3px_rgba(239,68,68,0.4)] flex w-fit gap-1 items-center"><Activity className="w-3 h-3" /> HOT</span>;
  if (urgency === 'MEDIUM') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">WARM</span>;
  if (urgency === 'LOW') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">COLD</span>;
  return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">--</span>;
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Esteira de Leads</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Gestão operacional de entrada e triagem de oportunidades.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ImportLeadsModal />
          <LeadIntakeModal />
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 bg-slate-900/50 p-3 md:p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div className="flex-1 min-w-0 sm:min-w-[240px] relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            placeholder="Filtrar por nome ou celular..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-800/50 border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="border-slate-800 bg-slate-800/40 text-slate-300">
             <Filter className="w-3.5 h-3.5 mr-2" />
             Status
           </Button>
           <Button variant="outline" size="sm" className="border-slate-800 bg-slate-800/40 text-slate-300">
             Origem
           </Button>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white">Fila de Entrada</CardTitle>
            <CardDescription className="text-slate-500">
              Listagem de potenciais ativos para aquisição ou repasse.
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white leading-none">{leads.length}</span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Leads no total</p>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="hover:bg-transparent border-slate-800">
                <TableHead className="text-slate-400">Lead</TableHead>
                <TableHead className="text-slate-400">Contato</TableHead>
                <TableHead className="text-slate-400">Localização</TableHead>
                <TableHead className="text-slate-400">Responsável</TableHead>
                <TableHead className="text-slate-400">Temp.</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={7} className="h-40 text-center text-slate-500">
                      Nenhum lead encontrado. Comece captando um novo ativo.
                   </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                             {lead.name}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase">
                             Criado em {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="text-xs">{lead.phone || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs">{lead.city ? `${lead.city}/${lead.state}` : "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                           <UserIcon className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className="text-xs text-slate-300 font-medium">
                          {lead.assigned_to?.name || "Não atribuído"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getUrgencyBadge(lead.urgency)}
                    </TableCell>
                    <TableCell>
                       <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        getStatusColorClass(lead.status)
                      )}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.status === 'NEGOTIATION' && (
                          <DecideLeadModal lead={lead} />
                        )}
                        <EditLeadModal lead={lead} isIcon />
                        <Link href={`/leads/${lead.id}`}>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800" title="Ver Detalhes">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
