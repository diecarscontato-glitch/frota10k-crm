import React from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { 
  History, 
  User, 
  Activity, 
  Shield 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const session = await auth();

  const userData = session?.user as { accountId: string } | undefined;

  if (!userData?.accountId) {
    return <div>Não autorizado</div>;
  }

  const logs = await db.auditLog.findMany({
    where: {
      account_id: userData.accountId,
    },
    include: {
      actor: {
        select: { name: true }
      }
    },
    orderBy: {
      created_at: "desc",
    },
    take: 50,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "WARNING": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16 md:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <History className="w-8 h-8 text-blue-500" />
          Logs de Auditoria
        </h1>
        <p className="text-slate-400 mt-2">Transparência total sobre todas as ações realizadas no sistema.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
           <CardTitle className="text-white text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Atividade Recente
           </CardTitle>
           <CardDescription>As últimas 50 ações registradas na sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Evento / Ação</th>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4 text-center">Severidade</th>
                  <th className="px-6 py-4 text-right">Data / Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                      Nenhum registro de auditoria encontrado.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: { id: string, event_type: string, summary: string | null, actor: { name: string } | null, severity: string, created_at: Date }) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                            {log.event_type}
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5">{log.summary}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                           <User className="w-3.5 h-3.5 text-slate-600" />
                           <span className="text-xs">{log.actor?.name || "Sistema"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                          getSeverityColor(log.severity)
                        )}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                           <span className="text-xs text-slate-300">
                              {new Date(log.created_at).toLocaleDateString('pt-BR')}
                           </span>
                           <span className="text-[10px] text-slate-600">
                              {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="p-6 rounded-2xl bg-blue-600/5 border border-blue-500/10 flex items-start gap-4">
         <Shield className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
         <div>
            <h4 className="text-sm font-bold text-white mb-1">Governança de Dados</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
               Estes registros são imutáveis e servem para auditorias externas e internas, garantindo que todas as modificações em Ativos, Leads e Negociações sejam rastreáveis.
            </p>
         </div>
      </div>
    </div>
  );
}
