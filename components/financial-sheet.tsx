"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wallet, TrendingUp, TrendingDown, Trash2, PlusCircle, DollarSign } from "lucide-react";
import { addFinancialRecord, deleteFinancialRecord } from "@/app/actions/financial";
import { cn } from "@/lib/utils";

export function FinancialSheet({ lead, financialRecords }: { lead: any, financialRecords: any[] }) {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const assetId = lead?.assets?.[0]?.id;

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!assetId) return alert("Não há veículo vinculado a este Lead.");

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const amountStr = formData.get("amount") as string;
    const amountRaw = parseFloat(amountStr.replace(/[^\d.,]/g, "").replace(",", "."));

    const payload = {
      asset_id: assetId,
      type: formData.get("type") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount: amountRaw,
      date: new Date(formData.get("date") as string)
    };

    try {
      await addFinancialRecord(payload);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert(err.message || "Erro ao adicionar lançamento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm("Remover este lançamento permanentemente?")) return;
    setIsDeleting(recordId);
    try {
      await deleteFinancialRecord(recordId, lead.id);
    } catch (err: any) {
      alert(err.message || "Erro ao deletar");
    } finally {
      setIsDeleting(null);
    }
  };

  const totalIncomes = financialRecords.filter(r => r.type === "INCOME").reduce((acc, val) => acc + val.amount, 0);
  const totalExpenses = financialRecords.filter(r => r.type === "EXPENSE").reduce((acc, val) => acc + val.amount, 0);
  
  const currentROI = totalIncomes - totalExpenses;
  const isProfit = currentROI >= 0;

  if (!assetId) {
    return (
      <div className="p-8 text-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50">
        Nenhum veículo vinculado a este lead. Vincule um ativo na aba &quot;Resumo&quot; para abrir o fluxo de caixa.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">Custo Total (Despesas)</p>
                <h3 className="text-3xl font-bold text-red-500">
                  R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">Receitas Obtidas</p>
                <h3 className="text-3xl font-bold text-emerald-500">
                  R$ {totalIncomes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">Margem Operacional Atual</p>
                <h3 className={cn("text-3xl font-bold", isProfit ? "text-blue-500" : "text-red-500")}>
                  R$ {currentROI.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border",
                isProfit ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
              )}>
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Add Lançamento */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900 border-slate-800 sticky top-6">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-500" />
                Novo Lançamento
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <label className="cursor-pointer">
                    <input type="radio" name="type" value="EXPENSE" defaultChecked className="peer hidden" />
                    <div className="p-2 rounded border border-slate-700 bg-slate-800 text-center peer-checked:bg-red-500/20 peer-checked:border-red-500 peer-checked:text-red-400 transition-colors">
                      <span className="text-sm font-bold">Despesa</span>
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="type" value="INCOME" className="peer hidden" />
                    <div className="p-2 rounded border border-slate-700 bg-slate-800 text-center peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-emerald-400 transition-colors">
                      <span className="text-sm font-bold">Receita</span>
                    </div>
                  </label>
                </div>

                <div>
                  <Label className="text-slate-400 mb-1 block">Categoria da Movimentação</Label>
                  <select name="category" aria-label="Categoria" required className="w-full text-sm bg-slate-800/50 border border-slate-700 text-white rounded-md p-2 focus:ring-blue-500">
                    <option value="AQUISICAO">Aquisição do Veículo</option>
                    <option value="MECANICA">Manutenção / Oficina</option>
                    <option value="DOCUMENTACAO">IPVA / Multas / Despachante</option>
                    <option value="ESTETICA">Estética / Higienização</option>
                    <option value="LOCACAO">Faturamento de Locação</option>
                    <option value="REVENDA">Venda do Veículo</option>
                    <option value="OUTROS">Taxas Diversas (API, etc)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-slate-400 mb-1 block">Descrição do Lançamento</Label>
                  <input type="text" name="description" required placeholder="Ex: Polimento cristalizado" className="w-full text-sm bg-slate-800/50 border border-slate-700 text-white rounded-md p-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400 mb-1 block">Valor (R$)</Label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-2 top-2.5 text-slate-500" />
                      <input type="number" step="0.01" name="amount" aria-label="Valor" required placeholder="0.00" className="w-full text-sm bg-slate-800/50 border border-slate-700 text-white rounded-md p-2 pl-8 font-mono" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-400 mb-1 block">Data</Label>
                    <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full text-sm bg-slate-800/50 border border-slate-700 text-slate-300 rounded-md p-2" />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
                  {loading ? "Registrando..." : "Registrar Lançamento"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Extrato */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">Extrato do Veículo</CardTitle>
                <CardDescription>Histórico de injeção de capital e custos deste ativo ativo.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-0">
               {financialRecords.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">
                   Nenhuma movimentação financeira registrada para este veículo ainda.
                 </div>
               ) : (
                 <div className="divide-y divide-slate-800">
                    {financialRecords.map((record) => (
                      <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border",
                            record.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                          )}>
                             {record.type === "INCOME" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{record.description}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="uppercase tracking-widest font-bold">{record.category}</span>
                              <span>•</span>
                              <span>{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className={cn("font-bold font-mono tracking-wider", record.type === "INCOME" ? "text-emerald-500" : "text-red-500")}>
                             {record.type === "INCOME" ? "+" : "-"} R$ {record.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <button 
                            disabled={isDeleting === record.id}
                            onClick={() => handleDelete(record.id)}
                            aria-label="Deletar Lançamento"
                            className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
