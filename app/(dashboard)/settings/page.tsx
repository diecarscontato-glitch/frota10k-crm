import React from "react";
import { getUserProfile, getAccountSettings } from "@/app/actions/settings";
import { SettingsForms } from "@/components/settings-forms";
import { Shield, Key, History } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [user, account] = await Promise.all([
    getUserProfile(),
    getAccountSettings()
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Configurações</h1>
          <p className="text-slate-400 mt-1">
            Gerencie sua conta, perfil e preferências de notificação.
          </p>
        </div>
        <Link href="/admin/audit">
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700">
              <History className="w-4 h-4" />
              Logs de Auditoria
           </button>
        </Link>
      </div>

      <SettingsForms user={user} account={account} />

      {/* Security Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-start gap-4 hover:border-blue-500/30 transition-all cursor-pointer group">
          <div className="p-3 bg-blue-600/10 rounded-xl group-hover:bg-blue-600/20 transition-colors">
            <Key className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Segurança e Senha</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Alterar sua senha de acesso e configurar autenticação em duas etapas.</p>
          </div>
        </div>

        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-start gap-4 hover:border-amber-500/30 transition-all cursor-pointer group">
          <div className="p-3 bg-amber-600/10 rounded-xl group-hover:bg-amber-600/20 transition-colors">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Permissões de Acesso</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Visualizar quais módulos seu usuário tem permissão para acessar na plataforma.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
