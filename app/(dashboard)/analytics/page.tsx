import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Car, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Target,
  PieChart,
  Zap
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-16 md:pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-500" />
          Inteligência & Analytics
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Monitore o ROI, conversão e a performance da sua esteira operacional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Taxa de Conversão", value: "18.4%", icon: Target, trend: "+2.1%", color: "text-blue-500" },
          { label: "Tempo Médio Venda", value: "12 dias", icon: Clock, trend: "-3 dias", color: "text-emerald-500" },
          { label: "ROI Médio/Ativo", value: "R$ 4.200", icon: TrendingUp, trend: "+12%", color: "text-purple-500" },
          { label: "LTV Projetado", value: "R$ 15k", icon: BarChart3, trend: "+5%", color: "text-yellow-500" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] font-bold text-emerald-500 px-1.5 py-0.5 bg-emerald-500/10 rounded">{stat.trend}</span>
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Origem dos Leads vs Conversão
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t border-slate-800/50">
             <div className="text-center space-y-4">
                <div className="flex justify-center gap-4">
                   <div className="w-32 h-32 rounded-full border-[12px] border-blue-600 border-t-transparent animate-spin-slow" />
                </div>
                <p className="text-sm text-slate-500">Processando dados volumétricos...</p>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Impacto das Automações
            </CardTitle>
            <CardDescription className="text-slate-500">Horas economizadas por categoria de regra.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Distribuição de Leads", hours: 42 },
              { label: "Status de Ativos", hours: 28 },
              { label: "Follow-ups", hours: 124 },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">{item.label}</span>
                  <span className="text-white font-bold">{item.hours}h</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${(item.hours / 150) * 100}%` }}
                   />
                </div>
              </div>
            ))}
            <div className="pt-4 mt-6 border-t border-slate-800 flex items-center justify-between">
               <div>
                  <p className="text-xl font-black text-white">194 horas / mês</p>
                  <p className="text-[10px] text-slate-500">Economia operacional estimada</p>
               </div>
               <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold">
                 HISTÓRICO COMPLETO
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-blue-600/10 to-transparent p-6 rounded-3xl border border-blue-500/10 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
               <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
               <h4 className="font-bold text-white uppercase tracking-tighter">Projeção de ROI</h4>
               <p className="text-sm text-slate-400 max-w-md">Com base no inventário atual e taxa de giro, sua projeção de faturamento para os próximos 30 dias é de <strong>R$ 145.000</strong>.</p>
            </div>
         </div>
         <Button className="bg-white text-black font-black hover:bg-slate-200">
            EXPORTAR PDF
         </Button>
      </div>
    </div>
  );
}
