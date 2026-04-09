import React from "react";
import { getTeamMembers } from "@/app/actions/team";
import { 
  Users, 
  UserPlus, 
  Mail, 
  User as UserIcon, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ShieldCheck,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function TeamPage() {
  const { users, invites } = await getTeamMembers();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "account_admin": return { label: "Admin", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", icon: ShieldAlert };
      case "SDR": return { label: "SDR", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Users };
      case "VENDEDOR": return { label: "Vendedor", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Users };
      default: return { label: role, color: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: UserIcon };
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            Minha Equipe
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Gerencie acessos, convites e a performance individual dos seus colaboradores.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
          <UserPlus className="w-4 h-4" />
          Convidar Membro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center gap-2 mb-2">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Colaboradores Ativos</h2>
              <div className="h-px flex-1 bg-slate-800 ml-2" />
              <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{users.length} TOTAL</span>
           </div>

           <div className="grid grid-cols-1 gap-3">
             {users.map((user) => {
               const roleInfo = getRoleBadge(user.role);
               const RoleIcon = roleInfo.icon;

               return (
                 <Card key={user.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all group overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="relative">
                             <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-slate-500" />
                             </div>
                             {user.status === "ACTIVE" && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
                             )}
                          </div>
                          <div>
                             <h3 className="text-white font-bold text-lg leading-tight">{user.name}</h3>
                             <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-6">
                          <div className={cn("hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider", roleInfo.color)}>
                             <RoleIcon className="w-3 h-3" />
                             {roleInfo.label}
                          </div>

                          <div className="text-right hidden sm:block">
                             <p className="text-[10px] text-slate-500 font-bold uppercase">Último Acesso</p>
                             <p className="text-xs text-slate-400 font-medium">
                                {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : "Nunca"}
                             </p>
                          </div>

                          <Button variant="ghost" size="icon" className="text-slate-600 hover:text-white">
                             <MoreVertical className="w-4 h-4" />
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
               );
             })}
           </div>
        </div>

        <div className="space-y-6">
           <div>
              <div className="flex items-center gap-2 mb-4">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest text-emerald-500">Convites Pendentes</h2>
                 <div className="h-px flex-1 bg-emerald-500/20 ml-2" />
              </div>

              {invites.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-600 text-xs">
                   Nenhum convite pendente.
                </div>
              ) : (
                <div className="space-y-3">
                   {invites.map((invite) => (
                      <div key={invite.id} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                               <Mail className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                               <p className="text-emerald-400 font-bold text-sm tracking-tight truncate w-32">{invite.invited_email}</p>
                               <p className="text-[10px] text-emerald-500 font-black uppercase">{invite.role}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:text-white">
                               <Clock className="w-3.5 h-3.5" />
                            </Button>
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </div>

           <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-slate-800 p-6 space-y-4">
              <div className="p-3 bg-white/5 w-fit rounded-xl backdrop-blur-md">
                 <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                 <h4 className="text-white font-bold mb-1">Dica de Segurança</h4>
                 <p className="text-[11px] text-slate-400 leading-relaxed">
                    Utilize o perfil de <strong>Visualizador</strong> para membros que apenas precisam monitorar o estoque sem alterar dados operacionais.
                 </p>
              </div>
              <Button variant="link" className="text-blue-500 text-[10px] font-black p-0 h-auto uppercase tracking-widest">
                 Ver todas as permissões
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
