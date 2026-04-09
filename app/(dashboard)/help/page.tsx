"use client";

import React from "react";
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  PlayCircle, 
  ChevronRight,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  CreditCard,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  { id: "getting-started", label: "Começando", icon: <PlayCircle className="w-4 h-4" /> },
  { id: "leads", label: "Leads & Ativos", icon: <Target className="w-4 h-4" /> },
  { id: "marketplace", label: "Marketplace", icon: <Zap className="w-4 h-4" /> },
  { id: "billing", label: "Faturamento", icon: <CreditCard className="w-4 h-4" /> },
  { id: "security", label: "Segurança", icon: <ShieldCheck className="w-4 h-4" /> },
];

const faqs = [
  {
    category: "getting-started",
    question: "Como configurar meu primeiro tenant?",
    answer: "Ao acessar a plataforma pela primeira vez, utilize o assistente de onboarding para configurar o nome da sua empresa, perfil operacional e convidar os primeiros membros da equipe."
  },
  {
    category: "leads",
    question: "Como funciona a distribuição Round Robin?",
    answer: "O sistema distribui novos leads automaticamente entre os vendedores ativos da equipe, seguindo uma fila cíclica para garantir equidade na carga de trabalho."
  },
  {
    category: "marketplace",
    question: "Quais ativos podem ser publicados?",
    answer: "Qualquer ativo que tenha passado pelo Comitê de Destino e tenha sido aprovado para 'Venda de Ágio' ou 'Repasse' pode ser publicado no Marketplace."
  },
  {
    category: "billing",
    question: "Como funciona o sistema BYOK?",
    answer: "Bring Your Own Key: Você insere sua própria chave de API do Stripe/Pagar.me nas configurações de faturamento, e todos os pagamentos dos seus clientes caem diretamente na sua conta."
  }
];

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16 md:pb-0">
      {/* Search Header */}
      <div className="text-center space-y-4 py-12 bg-slate-900/40 rounded-3xl border border-slate-800 border-dashed">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-widest">
           <HelpCircle className="w-3 h-3" /> Central de Atendimento
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter text-white">Como podemos <span className="text-blue-500 underline decoration-blue-500/30">ajudar você</span>?</h1>
        <p className="text-slate-400 max-w-xl mx-auto">Busque por guias, tutoriais e respostas rápidas para gerir sua frota com eficiência.</p>
        
        <div className="max-w-2xl mx-auto relative px-4">
           <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
           <Input 
             placeholder="Ex: Como importar leads, Configurar Stripe..." 
             className="h-14 pl-12 bg-slate-950 border-slate-800 rounded-2xl text-lg focus:ring-blue-500 transition-all font-medium"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Categories Sidebar */}
         <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 font-mono">Categorias</h3>
            <div className="space-y-1">
               {categories.map((cat) => (
                 <button 
                   key={cat.id}
                   className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white transition-all group border border-transparent hover:border-slate-800"
                 >
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-colors">
                          {cat.icon}
                       </div>
                       <span className="text-sm font-bold">{cat.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                 </button>
               ))}
            </div>

            <Card className="bg-blue-600/5 border-blue-500/20 rounded-2xl mt-8">
               <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                     <MessageCircle className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="space-y-1">
                     <p className="font-bold text-white italic">Suporte Especializado</p>
                     <p className="text-xs text-slate-400">Fale com um consultor agora via WhatsApp.</p>
                  </div>
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black italic rounded-lg transition-colors tracking-tighter uppercase">
                     ABRIR CHAT AGORA
                  </button>
               </CardContent>
            </Card>
         </div>

         {/* Main Help Content */}
         <div className="md:col-span-2 space-y-8">
            <Tabs defaultValue="faqs">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black italic tracking-tighter text-white">RECURSOS <span className="text-blue-500">ÚTEIS</span></h3>
                  <TabsList className="bg-slate-900 border border-slate-800">
                     <TabsTrigger value="faqs">FAQs</TabsTrigger>
                     <TabsTrigger value="guides">Guias</TabsTrigger>
                     <TabsTrigger value="api">API</TabsTrigger>
                  </TabsList>
               </div>

               <TabsContent value="faqs" className="space-y-4 mt-0">
                  {faqs.map((faq, i) => (
                    <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors group">
                       <CardHeader className="p-6 cursor-pointer">
                          <div className="flex items-start justify-between">
                             <div className="space-y-2">
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{faq.category}</span>
                                <CardTitle className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{faq.question}</CardTitle>
                             </div>
                             <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-all rotate-0 group-hover:rotate-90 mt-1" />
                          </div>
                       </CardHeader>
                       <CardContent className="p-6 pt-0 hidden group-hover:block animate-in slide-in-from-top-2 duration-300">
                          <p className="text-sm text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
                             {faq.answer}
                          </p>
                          <div className="mt-4 flex gap-4">
                             <button className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline">
                                Ler Mais <ExternalLink className="w-3 h-3" />
                             </button>
                             <button className="text-xs font-bold text-slate-500">Isso foi útil?</button>
                          </div>
                       </CardContent>
                    </Card>
                  ))}
               </TabsContent>

               <TabsContent value="guides">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[1,2].map(i => (
                        <Card key={i} className="bg-slate-900 border-slate-800 overflow-hidden group">
                           <div className="aspect-video bg-slate-950 flex items-center justify-center relative overflow-hidden">
                              <BookOpen className="w-12 h-12 text-slate-800 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                           </div>
                           <CardContent className="p-4 space-y-2">
                              <h4 className="font-bold text-white italic tracking-tighter">Guia Completo #{i}</h4>
                              <p className="text-xs text-slate-500">Tutorial passo a passo sobre fluxos de análise financeira.</p>
                           </CardContent>
                        </Card>
                     ))}
                  </div>
               </TabsContent>
            </Tabs>
         </div>
      </div>
    </div>
  );
}
