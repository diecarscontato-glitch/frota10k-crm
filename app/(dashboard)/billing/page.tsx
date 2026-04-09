import React from "react";
import { CreditCard, Mail, ShieldCheck, Clock } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-blue-500" />
          Faturamento
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Status da sua conta e contatos financeiros.
        </p>
      </div>

      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-white">Conta ativa</h2>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          Sua conta DIECAR está ativa e sem pendências. O gerenciamento de pagamentos
          e assinatura é feito diretamente com o time financeiro.
        </p>
      </div>

      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-start gap-4">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <Mail className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Contato financeiro</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Para dúvidas sobre cobrança, upgrade de plano ou emissão de nota fiscal, entre em contato pelo e-mail{" "}
            <a href="mailto:diecars.contato@gmail.com" className="font-mono text-blue-400 hover:underline">
              diecars.contato@gmail.com
            </a>.
          </p>
        </div>
      </div>

      <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
        <div className="p-3 bg-amber-500/10 rounded-xl">
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Painel self-service em desenvolvimento</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            O self-service de plano, histórico de faturas e BYOK (Stripe/Pagar.me) está em construção
            e será liberado em uma próxima entrega.
          </p>
        </div>
      </div>
    </div>
  );
}
