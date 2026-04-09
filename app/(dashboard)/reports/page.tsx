import React from "react";
import { getOperationalReports, getMarketplaceAnalytics } from "@/app/actions/reports";
import { ReportCharts } from "@/components/report-charts";
import { 
  TrendingUp, 
  Users, 
  Car, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [operational, marketplace] = await Promise.all([
    getOperationalReports(),
    getMarketplaceAnalytics()
  ]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Relatórios e Performance</h1>
        <p className="text-slate-400 mt-1">
          Análise detalhada de leads, ativos e transações da sua conta.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                12%
              </span>
            </div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Leads Qualificados</p>
            <h2 className="text-3xl font-black text-white mt-1">
              {operational.leadsByStatus.reduce((acc, curr) => acc + curr._count.status, 0)}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Car className="w-5 h-5 text-purple-500" />
              </div>
              <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                8%
              </span>
            </div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Ativos em Carteira</p>
            <h2 className="text-3xl font-black text-white mt-1">
              {operational.assetsByType.reduce((acc, curr) => acc + curr._count.type, 0)}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded">
                Estável
              </span>
            </div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Taxa de Conversão</p>
            <h2 className="text-3xl font-black text-white mt-1">
              {marketplace.conversionRate.toFixed(1)}%
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-amber-500" />
              </div>
              <span className="flex items-center text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                3%
              </span>
            </div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Negociações Abertas</p>
            <h2 className="text-3xl font-black text-white mt-1">
              {marketplace.activeInterests}
            </h2>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts */}
      <ReportCharts 
        leadsByStatus={operational.leadsByStatus}
        assetsByType={operational.assetsByType}
        assetsByStatus={operational.assetsByStatus}
      />

      {/* Recent Negotiations Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">Negociações Recentes</CardTitle>
          <CardDescription className="text-slate-500">
            Últimas interações do marketplace vinculadas à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Ativo</th>
                  <th className="px-4 py-3">Proponente</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {operational.recentNegotiations.map((neg: any) => (
                  <tr key={neg.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-600">
                          <Car className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-200">{neg.publication.asset.model}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-400 font-medium">{neg.proponent_account.name}</td>
                    <td className="px-4 py-4 text-slate-200 font-black">R$ {neg.current_value?.toLocaleString() || "---"}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/10">
                        {neg.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-500">{new Date(neg.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
                {operational.recentNegotiations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-600 italic">
                      Nenhuma negociação recente encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
