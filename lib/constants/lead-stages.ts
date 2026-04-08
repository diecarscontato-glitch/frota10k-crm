export const LEAD_STAGES = [
  { value: "NEW", label: "Lead Novo", color: "blue" },
  { value: "CONTACTED", label: "Contato Iniciado", color: "sky" },
  { value: "QUALIFICATION", label: "Em Qualificação", color: "indigo" },
  { value: "NEGOTIATION", label: "Mesa de Decisão", color: "amber" },
  { value: "WON", label: "Aprovado", color: "emerald" },
  { value: "LOST", label: "Recusado", color: "red" },
  { value: "READY_FOR_ANALYSIS", label: "Pronto para Análise", color: "indigo" },
  { value: "FINANCIAL_ANALYSIS", label: "Em Análise Financeira", color: "purple" },
  { value: "PENDING_DOCS", label: "Doc. Pendente", color: "yellow" },
  { value: "DOCS_DONE", label: "Doc. Concluída", color: "teal" },
  { value: "VEHICLE_RECEIVED", label: "Veículo Recebido", color: "cyan" },
  { value: "IN_FLEET", label: "Na Frota", color: "green" },
  { value: "CLOSED", label: "Encerrado", color: "slate" }
];

export function getStatusLabel(status: string) {
  return LEAD_STAGES.find(s => s.value === status)?.label || status;
}

export function getStatusColorClass(status: string) {
  const color = LEAD_STAGES.find(s => s.value === status)?.color || "slate";
  
  // Tailwind required static class names or a safelist for dynamic ones. 
  // We'll map them explicitly to ensure they always work.
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    sky: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    fuchsia: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    teal: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    violet: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    slate: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20"
  };
  
  return colorMap[color] || colorMap["slate"];
}

export const ASSET_STATUS = [
  { value: "SCREENING", label: "Triagem", color: "blue" },
  { value: "COMMITTEE", label: "Em Comitê", color: "amber" },
  { value: "IN_STOCK", label: "No Estoque", color: "emerald" },
  { value: "MARKETPLACE", label: "No Marketplace", color: "sky" },
  { value: "REJECTED", label: "Recusado", color: "red" },
  { value: "SOLD", label: "Vendido", color: "slate" },
];

export function getAssetStatusLabel(status: string) {
  return ASSET_STATUS.find(s => s.value === status)?.label || status;
}
