import React from "react";
import { BookOpen, FileText, Clock } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-emerald-500" />
          Templates & Padrões
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Modelos reutilizáveis de mensagens, e-mails e contratos.
        </p>
      </div>

      <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 bg-slate-900/30">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase tracking-widest font-bold text-amber-400">Em breve</span>
        </div>
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg font-medium text-slate-300">Sistema de Templates em desenvolvimento</p>
        <p className="text-sm mt-1 max-w-md text-center">
          Por enquanto, use mensagens e contratos de fora do CRM. Essa área será liberada na próxima entrega.
        </p>
      </div>
    </div>
  );
}
