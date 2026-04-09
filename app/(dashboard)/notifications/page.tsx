import React from "react";
import { getNotifications, markAllAsRead } from "@/app/actions/notifications";
import { 
  Bell, 
  BellOff,
  CheckCheck,
  MessageSquare, 
  BadgeDollarSign, 
  ClipboardCheck,
  Megaphone,
  Users,
  AlertCircle,
  Clock
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

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEGOTIATION": return MessageSquare;
      case "INTEREST": return BadgeDollarSign;
      case "ANALYSIS": return ClipboardCheck;
      case "PUBLICATION": return Megaphone;
      case "TEAM": return Users;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "NEGOTIATION": return "text-blue-500 bg-blue-500/10";
      case "INTEREST": return "text-emerald-500 bg-emerald-500/10";
      case "ANALYSIS": return "text-amber-500 bg-amber-500/10";
      case "PUBLICATION": return "text-purple-500 bg-purple-500/10";
      case "TEAM": return "text-cyan-500 bg-cyan-500/10";
      default: return "text-slate-500 bg-slate-500/10";
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Central de Notificações</h1>
          <p className="text-slate-400 mt-1">
            {unreadCount > 0 
              ? `Você tem ${unreadCount} notificação(ões) não lida(s).` 
              : "Você está em dia! Sem novas notificações."}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={async () => { "use server"; await markAllAsRead(); }}>
            <Button type="submit" variant="outline" className="border-slate-800 text-slate-400 hover:text-white gap-2">
              <CheckCheck className="w-4 h-4" />
              Marcar Tudo como Lido
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
             <BellOff className="w-12 h-12 mb-4 opacity-20" />
             <p className="text-lg font-medium">Nada por aqui, tudo tranquilo.</p>
             <p className="text-sm">Suas notificações aparecerão aqui quando houver atividade.</p>
          </div>
        ) : (
          notifications.map((notif: any) => {
            const Icon = getNotificationIcon(notif.type);
            const colorClass = getNotificationColor(notif.type);
            
            return (
              <Card key={notif.id} className={cn(
                "bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all",
                !notif.read && "border-l-2 border-l-blue-500"
              )}>
                <div className="flex items-start p-5 gap-4">
                   <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
                      <Icon className="w-5 h-5" />
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <h3 className={cn(
                           "text-sm font-bold",
                           notif.read ? "text-slate-400" : "text-white"
                         )}>
                            {notif.title}
                         </h3>
                         {!notif.read && (
                           <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                         )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-600">
                         <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.created_at).toLocaleString('pt-BR', { 
                              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                            })}
                         </span>
                      </div>
                   </div>

                   {notif.link && (
                     <Link href={notif.link}>
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-white text-xs shrink-0">
                           Ver
                        </Button>
                     </Link>
                   )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
