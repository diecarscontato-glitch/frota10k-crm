import React from "react";
import { cn } from "@/lib/utils";
import { getTemplates } from "@/app/actions/templates";
import { 
  Plus, 
  FileText, 
  MessageSquare, 
  Mail, 
  ChevronRight,
  Search,
  BookOpen,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  const categories = [
    { id: "MESSAGES", label: "Mensagens (WhatsApp/Chat)", icon: MessageSquare, color: "text-emerald-500 bg-emerald-500/10" },
    { id: "EMAILS", label: "E-mails", icon: Mail, color: "text-blue-500 bg-blue-500/10" },
    { id: "DOCUMENTS", label: "Contratos & Propostas", icon: FileText, color: "text-purple-500 bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-500" />
            Templates & Padrões
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Configure modelos de comunicação e documentos para ganhar produtividade.
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
          <Plus className="w-4 h-4" />
          Novo Template
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Buscar templates por nome ou categoria..." 
            className="pl-10 bg-transparent border-none focus-visible:ring-0 text-white"
          />
        </div>
        <div className="flex gap-2 pr-2">
          {categories.map((cat) => (
            <Button key={cat.id} variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-xs text-white h-8 px-3">
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum template disponível.</p>
            <p className="text-sm">Clique em "Novo Template" para criar o primeiro modelo.</p>
          </div>
        ) : (
          templates.map((template) => {
            const category = categories.find(c => c.id === template.category) || categories[0];
            const Icon = category.icon;

            return (
              <Card key={template.id} className="bg-slate-900/40 border-slate-800 hover:border-emerald-500/30 transition-all group overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-2 rounded-xl", category.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Button variant="ghost" size="icon" className="text-slate-600 hover:text-white hover:bg-slate-800">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 h-8">
                      {template.description || "Sem descrição disponível."}
                    </p>
                  </div>

                  <div className="px-5 py-3 bg-slate-800/50 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                      {category.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {templates.length > 0 && (
        <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex items-center gap-4">
           <div className="p-3 bg-emerald-500/20 rounded-2xl">
              <MessageSquare className="w-6 h-6 text-emerald-500" />
           </div>
           <div>
              <h4 className="font-bold text-white">Dica de Produtividade</h4>
              <p className="text-sm text-slate-400">
                Você pode usar variáveis como <code>{"{cliente_nome}"}</code> e <code>{"{veiculo_modelo}"}</code> em seus templates para personalização automática.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
