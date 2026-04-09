import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  Car,
  ClipboardCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
  Flame,
  Thermometer,
  Wind,
} from "lucide-react";
import { getDashboardMetrics } from "@/app/actions/dashboard";
import { AlertCircle } from "lucide-react";
import { getAssetStatusLabel } from "@/lib/constants/lead-stages";
import Link from "next/link";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const stats = [
    {
      title: "Leads HOT",
      value: metrics.leadsHot.toString(),
      description: "Urgência alta (atrasos)",
      icon: Activity,
      trend: "up",
      color: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)] border",
    },
    {
      title: "Aguardando Decisão",
      value: metrics.aguardandoDecisao.toString(),
      description: "Fichas no Comitê",
      icon: ClipboardCheck,
      trend: "neutral",
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Análises Hoje",
      value: metrics.analisesHoje.toString(),
      description: "SDR + Analista (24h)",
      icon: Clock,
      trend: "up",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Ativos em Frota",
      value: metrics.frotaAtiva.toString(),
      description: "Disponíveis locação",
      icon: Car,
      trend: "neutral",
      color: "bg-emerald-500/10 text-emerald-500",
    },
  ];

// 

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Bem-vindo ao Centro de Comando</h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base">Aqui está o que está acontecendo na sua operação hoje.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 md:p-2 rounded-lg transition-colors ${stat.color}`}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                  {stat.trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                  {stat.trend === "neutral" && <Clock className="w-3 h-3 text-slate-500" />}
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Recent Activity / Agenda */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">Ativos Recentes</CardTitle>
            <CardDescription className="text-slate-500">Últimos veículos cadastrados na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentAssets.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Nenhum ativo recente encontrado.</p>
              ) : (
                metrics.recentAssets.map((asset) => (
                  <div key={asset.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group gap-2 sm:gap-4">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {asset.brand?.slice(0, 2).toUpperCase() || "VE"}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                          {asset.brand} {asset.model} - {asset.year}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">Placa: {asset.plate || "N/A"} • {getAssetStatusLabel(asset.status)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 ml-12 sm:ml-0 shrink-0">
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {getAssetStatusLabel(asset.status)}
                      </span>
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-6 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Ver todos os ativos
            </button>
          </CardContent>
        </Card>

        {/* Alertas Vermelhos */}
        <Card className="bg-slate-900/50 border-red-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl text-red-500 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Alertas Vermelhos
              </CardTitle>
              <CardDescription className="text-slate-500">Ações críticas e risco de busca.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-4">
              {metrics.alertasVermelhos.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Nenhum alerta crítico ativo.</p>
              ) : (
                metrics.alertasVermelhos.map(alerta => (
                  <div key={alerta.id} className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 hover:bg-red-900/20 transition-colors cursor-pointer group">
                    <h5 className="text-sm font-semibold text-red-400 group-hover:text-red-300">
                      {alerta.title}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {alerta.description}
                    </p>
                    {alerta.lead && (
                      <div className="text-[10px] text-slate-500 mt-2 font-medium uppercase">
                        Lead: {alerta.lead.name}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimos Leads do SDR */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Últimos Leads do SDR
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs md:text-sm">Leads qualificados pelo WhatsApp nas últimas 48h.</CardDescription>
          </div>
          <Link href="/leads" className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
            Ver todos <ArrowUpRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {metrics.leadsRecentes.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Nenhum lead nas últimas 48h.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
              {metrics.leadsRecentes.map((lead) => {
                const urgencyColor =
                  lead.urgency === "HIGH" ? "border-red-500/40 bg-red-950/10" :
                  lead.urgency === "MEDIUM" ? "border-amber-500/40 bg-amber-950/10" :
                  "border-slate-700 bg-slate-800/30";
                const UrgIcon = lead.urgency === "HIGH" ? Flame : lead.urgency === "MEDIUM" ? Thermometer : Wind;
                const urgLabel = lead.urgency === "HIGH" ? "HOT" : lead.urgency === "MEDIUM" ? "WARM" : "COLD";
                const urgTextColor = lead.urgency === "HIGH" ? "text-red-400" : lead.urgency === "MEDIUM" ? "text-amber-400" : "text-slate-400";
                const horaEntrada = new Date(lead.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                return (
                  <Link href={`/leads/${lead.id}`} key={lead.id}>
                    <div className={`p-4 rounded-xl border ${urgencyColor} hover:border-opacity-80 transition-all cursor-pointer group`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${urgTextColor}`}>
                          <UrgIcon className="w-3 h-3" /> {urgLabel}
                        </span>
                        <span className="text-[10px] text-slate-500">{horaEntrada}</span>
                      </div>
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate">{lead.name}</p>
                      <p className="text-xs text-slate-400 mt-1 truncate">{lead.vehicle_model || "Veículo não informado"}</p>
                      <p className="text-[10px] text-slate-500 mt-2 uppercase font-medium">{lead.source || "WhatsApp SDR"}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
