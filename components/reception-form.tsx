"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { ClipboardList, CheckCircle2, Factory } from "lucide-react";
import { saveReceptionControl } from "@/app/actions/reception";

export function ReceptionForm({ lead, initialData }: { lead: any, initialData?: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      lead_id: lead.id,
      asset_id: lead.assets?.[0]?.id, // Auto-bind if Asset already exists
      has_manual: formData.get("has_manual") === "on",
      has_reserve_key: formData.get("has_reserve_key") === "on",
      has_stepe: formData.get("has_stepe") === "on",
      has_jack: formData.get("has_jack") === "on",
      
      paint_condition: formData.get("paint_condition") as string,
      tires_condition: formData.get("tires_condition") as string,
      structural_damage: formData.get("structural_damage") === "on",
      
      reception_km: formData.get("reception_km") ? parseInt(formData.get("reception_km") as string) : null,
      tracker_installed: formData.get("tracker_installed") === "on",
      hygiene_done: formData.get("hygiene_done") === "on",
      
      reception_notes: formData.get("reception_notes") as string,
      verdict: formData.get("verdict") as string,
    };

    try {
      await saveReceptionControl(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar checklist de recebimento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bloco: Itens do Veículo */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              Conferência de Itens
            </CardTitle>
            <CardDescription>O que veio exatamente junto com o carro no momento da entrega?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-md border border-slate-800 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                <input type="checkbox" name="has_manual" defaultChecked={initialData?.has_manual} className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900 bg-slate-900" />
                <span className="text-sm text-slate-300 font-medium">Manual</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-md border border-slate-800 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                <input type="checkbox" name="has_reserve_key" defaultChecked={initialData?.has_reserve_key} className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900 bg-slate-900" />
                <span className="text-sm text-slate-300 font-medium">Chave Reserva</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-md border border-slate-800 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                <input type="checkbox" name="has_stepe" defaultChecked={initialData?.has_stepe} className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900 bg-slate-900" />
                <span className="text-sm text-slate-300 font-medium">Estepe Original</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-md border border-slate-800 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                <input type="checkbox" name="has_jack" defaultChecked={initialData?.has_jack} className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900 bg-slate-900" />
                <span className="text-sm text-slate-300 font-medium">Macaco / Triângulo</span>
              </label>
            </div>
            
            <div className="mt-6 space-y-4 pt-6 border-t border-slate-800">
               <div>
                 <Label className="text-slate-400 mb-2 block">Estado da Pintura / Lataria</Label>
                 <select name="paint_condition" defaultValue={initialData?.paint_condition || ""} className="w-full text-sm bg-slate-800/50 border border-slate-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                   <option value="" disabled>Selecione...</option>
                   <option value="EXCELENTE">Excelente (Sem riscos/amassados)</option>
                   <option value="BOM">Bom (Leves marcas de uso)</option>
                   <option value="RUIM">Ruim (Necessita funilaria/repintura)</option>
                 </select>
               </div>
               <div>
                 <Label className="text-slate-400 mb-2 block">Estado dos Pneus</Label>
                 <select name="tires_condition" defaultValue={initialData?.tires_condition || ""} className="w-full text-sm bg-slate-800/50 border border-slate-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                   <option value="" disabled>Selecione...</option>
                   <option value="NOVOS">Novos (Rodou menos de 5.000km)</option>
                   <option value="MEIA-VIDA">Meia-vida (Roda mais uns 15.000km)</option>
                   <option value="TROCAR">Urgente (Abaixo do TWI - Trocar)</option>
                 </select>
               </div>
               <label className="flex items-center gap-3 p-3 rounded-md border border-red-500/30 bg-red-500/10 cursor-pointer hover:bg-red-500/20 transition-colors mt-2">
                <input type="checkbox" name="structural_damage" defaultChecked={initialData?.structural_damage} className="w-4 h-4 rounded border-red-700 text-red-600 focus:ring-red-600 focus:ring-offset-slate-900 bg-slate-900" />
                <span className="text-sm text-red-500 font-medium">Apresenta Dano Estrutural Grave (Longarina, Coluna, Teto)</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Bloco: Dados Operacionais */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Factory className="w-5 h-5 text-purple-500" />
              Operação de Pátio
            </CardTitle>
            <CardDescription>Ações finais para liberação do veículo para a rua.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
               <Label className="text-slate-400 mb-2 block">Quilometragem Exata de Entrada (KM)</Label>
               <input 
                 type="number" 
                 name="reception_km" 
                 defaultValue={initialData?.reception_km || ""}
                 className="w-full text-sm bg-slate-800/50 border border-slate-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xl tracking-widest"
                 placeholder="000000"
               />
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
               <label className="flex items-center gap-3 p-3 rounded-md border border-slate-800 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                <input type="checkbox" name="hygiene_done" defaultChecked={initialData?.hygiene_done} className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900 bg-slate-900" />
                <div className="flex flex-col">
                  <span className="text-sm text-slate-300 font-medium">Lavagem / Higienização</span>
                  <span className="text-xs text-slate-500">O carro já está limpo e pronto para rodar/fotos?</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-md border border-slate-800 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                <input type="checkbox" name="tracker_installed" defaultChecked={initialData?.tracker_installed} className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900 bg-slate-900" />
                <div className="flex flex-col">
                  <span className="text-sm text-slate-300 font-medium">Rastreador Telemetria Instalado</span>
                  <span className="text-xs text-slate-500">Equipamento validado testando GPS?</span>
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reception_notes" className="text-slate-300">Observações Extras do Recebedor</Label>
              <textarea
                id="reception_notes"
                name="reception_notes"
                rows={3}
                defaultValue={initialData?.reception_notes || ""}
                placeholder="Exemplo: Faltou tapete do motorista, rádio com defeito..."
                className="w-full min-h-[80px] p-3 rounded-lg border border-slate-700 bg-slate-800/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Bloco: Veredito Final Recebimento */}
      <Card className="bg-slate-900 border-slate-800 mb-8">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-300 uppercase text-xs font-bold tracking-widest">Diagnóstico de Pátio Final</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="cursor-pointer group">
                <input type="radio" name="verdict" value="APROVADO" className="peer hidden" defaultChecked={initialData?.verdict === "APROVADO"} />
                <div className="p-4 rounded-xl border-2 border-slate-800 bg-slate-900 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 transition-all text-center">
                  <span className="block text-lg font-bold text-slate-300 peer-checked:text-emerald-500 mb-1">✅ 100% PRONTO</span>
                  <span className="text-xs text-slate-500">Pronto p/ rodar ou marketplace</span>
                </div>
              </label>

              <label className="cursor-pointer group">
                <input type="radio" name="verdict" value="PENDENCIAS" className="peer hidden" defaultChecked={initialData?.verdict === "PENDENCIAS"} />
                <div className="p-4 rounded-xl border-2 border-slate-800 bg-slate-900 peer-checked:border-amber-500 peer-checked:bg-amber-500/10 transition-all text-center">
                  <span className="block text-lg font-bold text-slate-300 peer-checked:text-amber-500 mb-1">🛠 OFICINA / PREPARO</span>
                  <span className="text-xs text-slate-500">Exige ajustes antes de faturar</span>
                </div>
              </label>

              <label className="cursor-pointer group">
                <input type="radio" name="verdict" value="RECUSADO" className="peer hidden" defaultChecked={initialData?.verdict === "RECUSADO"} />
                <div className="p-4 rounded-xl border-2 border-slate-800 bg-slate-900 peer-checked:border-red-500 peer-checked:bg-red-500/10 transition-all text-center">
                  <span className="block text-lg font-bold text-slate-300 peer-checked:text-red-500 mb-1">⛔ DEVOLVER CARRO</span>
                  <span className="text-xs text-slate-500">Danos graves ou desacordo comercial</span>
                </div>
              </label>
            </div>
          </div>

          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm">{error}</div>}
          {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Recebimento concluído. O carro deu entrada oficial no pátio da FROTA10K.</div>}

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]">
              {loading ? "Registrando Inspeção..." : "Registrar Recebimento"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
