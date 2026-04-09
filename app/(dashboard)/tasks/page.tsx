import React from "react";
import { getTasks } from "@/app/actions/tasks";
import { getTeamMembers } from "@/app/actions/team";
import { getAssets } from "@/app/actions/assets";
import { getLeads } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Plus, 
  Clock, 
  Filter
} from "lucide-react";
import { TaskList } from "@/components/task-list";
import { CreateTaskModal } from "@/components/create-task-modal";

export default async function TasksPage() {
  const tasks = await getTasks();
  const { users: members } = await getTeamMembers();
  const assets = await getAssets();
  const leads = await getLeads();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Agenda Operacional</h1>
          <p className="text-slate-400 mt-1">
            Gestão de atividades, follow-ups e prazos da equipe.
          </p>
        </div>
        <CreateTaskModal members={members} assets={assets} leads={leads} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-4">
                 <CardTitle className="text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Status</p>
                    <div className="flex flex-col gap-1">
                       <button className="text-left px-3 py-2 rounded-lg bg-blue-600/10 text-blue-400 text-sm font-medium">Todas as Tarefas</button>
                       <button className="text-left px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-all">Pendentes</button>
                       <button className="text-left px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-all">Concluídas</button>
                    </div>
                 </div>
                 <div className="space-y-2 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Responsável</p>
                    <div className="flex flex-col gap-1">
                       {members.map((member: any) => (
                          <button key={member.id} className="text-left px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm truncate">
                             {member.name}
                          </button>
                       ))}
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-slate-900/50 border-slate-800 p-6">
              <div className="flex items-center gap-3 text-amber-500 mb-2">
                 <Clock className="w-5 h-5" />
                 <p className="text-sm font-bold uppercase tracking-tight">Prazos Curtos</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                 Você tem {tasks.filter((t: any) => t.status === 'PENDING').length} tarefas pendentes para esta semana.
              </p>
           </Card>
        </div>

        <div className="lg:col-span-3">
           <TaskList tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
