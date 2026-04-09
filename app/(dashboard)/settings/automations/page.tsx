import React from "react";
import { getAutomationRules } from "@/app/actions/automations";
import { 
  Plus, 
  Settings2, 
  Zap, 
  Play, 
  Pause, 
  Trash2, 
  ChevronRight,
  ShieldCheck,
  Bot,
  RefreshCw,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function AutomationsPage() {
  const rules = await getAutomationRules();

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case "ASSET_CREATED": return "Novo Ativo Criado";
      case "LEAD_CREATED": return "Novo Lead Recebido";
      case "NEGOTIATION_ACCEPTED": return "Acordo Fechado";
      default: return type;
    }
  };

  const getActionLabel = (action: any) => {
    if (action?.type === "UPDATE_STATUS") {
      return `Mudar status para: ${action.value}`;
    }
    if (action?.type === "SEND_NOTIFICATION") {
      return "Enviar Notificação";
    }
    return "Ação personalizada";
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-500" />
            Automações & Inteligência
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Configure gatilhos automáticos para acelerar sua esteira operacional.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
          <Plus className="w-4 h-4" />
          Nova Regra
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/40 border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Regras Ativas</p>
          </div>
          <p className="text-3xl font-black text-white">{rules.filter(r => r.status === "ACTIVE").length}</p>
        </Card>
        
        <Card className="bg-slate-900/40 border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Execuções (24h)</p>
          </div>
          <p className="text-3xl font-black text-white">128</p>
          <p className="text-[10px] text-emerald-500 font-bold mt-1">+12% vs ontem</p>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Eficiência</p>
          </div>
          <p className="text-3xl font-black text-white">99.8%</p>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Minhas Regras</h2>
          <div className="h-px flex-1 bg-slate-800 ml-2" />
        </div>

        {rules.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 text-slate-600">
            <Bot className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhuma regra configurada.</p>
            <p className="text-sm">Clique em "Nova Regra" para automatizar sua operação.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {rules.map((rule) => (
              <Card key={rule.id} className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all overflow-hidden group">
                <div className="flex items-center p-6 gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                    rule.status === "ACTIVE" ? "bg-yellow-500/10 text-yellow-500" : "bg-slate-800 text-slate-500"
                  )}>
                    <Zap className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white truncate">{rule.name}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                        rule.status === "ACTIVE" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" : "text-slate-500 border-slate-700 bg-slate-800"
                      )}>
                        {rule.status === "ACTIVE" ? "Ativa" : "Pausada"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Play className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-bold">Gatilho:</span> {getTriggerLabel(rule.trigger_type)}
                       </div>
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                       <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Settings2 className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-bold">Ação:</span> {getActionLabel(rule.action_payload)}
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                      {rule.status === "ACTIVE" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-slate-400 transition-colors" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 shrink-0">
             <Bot className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Assistente de Eficiência</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
              Nossa inteligência identificou que 65% dos seus leads demoram mais de 4 horas para serem atendidos. 
              <strong> Ative a regra de Escalonamento Automático</strong> para reduzir esse tempo para menos de 30 minutos.
            </p>
          </div>
          <Button className="md:ml-auto bg-white text-slate-950 hover:bg-slate-200 font-bold px-6 shrink-0">
            Otimizar Agora
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] -ml-32 -mb-32" />
      </div>
    </div>
  );
}
