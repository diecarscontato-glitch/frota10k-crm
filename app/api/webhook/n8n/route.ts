import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SYNC_KEY = process.env.FROTA10K_SYNC_KEY || "diecar-sync-2026";

/**
 * POST /api/webhook/n8n
 *
 * SDR conversacional: recebe mensagem do WhatsApp via n8n,
 * identifica estágio do lead, extrai dados, retorna resposta.
 *
 * Body: { nome, telefone, mensagem }
 * Response: { resposta, lead_id, status, novo }
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-sync-key");
  if (apiKey !== SYNC_KEY) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: Record<string, string>;
  try {
    body = (await req.json()) as Record<string, string>;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { nome, telefone, mensagem } = body;
  if (!telefone) {
    return NextResponse.json({ error: "telefone obrigatório" }, { status: 400 });
  }

  try {
    const account = await db.account.findFirst({
      where: { name: "DIECAR" },
      select: { id: true },
    });
    if (!account) {
      return NextResponse.json({ error: "Conta DIECAR não encontrada" }, { status: 404 });
    }

    // Buscar lead
    let lead = await db.lead.findFirst({
      where: { account_id: account.id, phone: telefone },
    });

    const isNew = !lead;
    const msg = (mensagem || "").trim().toLowerCase();

    if (!lead) {
      // ── NOVO LEAD ─────────────────────────────────────────────
      lead = await db.lead.create({
        data: {
          account_id: account.id,
          name: nome || "Desconhecido",
          phone: telefone,
          source: "WhatsApp SDR",
          status: "NEW",
        },
      });

      return NextResponse.json({
        resposta: montarResposta("WELCOME", nome || ""),
        lead_id: lead.id,
        status: lead.status,
        novo: true,
        etapa: "WELCOME",
      });
    }

    // ── LEAD EXISTENTE — identificar etapa e processar ──────────
    const etapa = identificarEtapa(lead);
    let resposta = "";
    const updates: Record<string, unknown> = { updated_at: new Date() };

    switch (etapa) {
      case "AGUARDANDO_VEICULO": {
        const veiculo = extrairVeiculo(mensagem || "");
        if (veiculo.modelo) {
          updates.vehicle_model = veiculo.modelo;
          if (veiculo.ano) updates.vehicle_year = veiculo.ano;
          if (veiculo.cidade) updates.city = veiculo.cidade;
          updates.status = "CONTACTED";
          resposta = montarResposta("PEDIR_FINANCIAMENTO", lead.name, veiculo);
        } else {
          resposta = montarResposta("VEICULO_INVALIDO", lead.name);
        }
        break;
      }

      case "AGUARDANDO_FINANCIAMENTO": {
        const fin = extrairFinanciamento(mensagem || "");
        if (fin.banco || fin.parcela) {
          if (fin.banco) updates.finance_bank = fin.banco;
          if (fin.parcela) updates.finance_installment_value = fin.parcela;
          if (fin.totalParcelas) updates.finance_total_installments = fin.totalParcelas;
          if (fin.parcelasPagas) updates.finance_paid_installments = fin.parcelasPagas;
          updates.status = "QUALIFICATION";
          resposta = montarResposta("PEDIR_ATRASO", lead.name);
        } else {
          resposta = montarResposta("FINANCIAMENTO_INVALIDO", lead.name);
        }
        break;
      }

      case "AGUARDANDO_ATRASO": {
        const atraso = extrairAtraso(mensagem || "");
        updates.finance_overdue_installments = atraso.parcelas;
        updates.urgency = atraso.parcelas > 0 ? "HIGH" : "MEDIUM";
        updates.status = "QUALIFICATION";
        resposta = montarResposta("PEDIR_EXPECTATIVA", lead.name);
        break;
      }

      case "AGUARDANDO_EXPECTATIVA": {
        const expectativa = extrairValor(mensagem || "");
        if (expectativa) {
          updates.owner_expectation = expectativa;
        }
        updates.status = "QUALIFIED";
        resposta = montarResposta("QUALIFICADO", lead.name);
        break;
      }

      case "QUALIFICADO": {
        resposta = montarResposta("JA_QUALIFICADO", lead.name);
        break;
      }

      default: {
        resposta = montarResposta("WELCOME", lead.name);
        updates.status = "NEW";
        break;
      }
    }

    // Atualizar lead
    await db.lead.update({
      where: { id: lead.id },
      data: updates as Parameters<typeof db.lead.update>[0]["data"],
    });

    return NextResponse.json({
      resposta,
      lead_id: lead.id,
      status: updates.status || lead.status,
      novo: isNew,
      etapa,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    console.error("[SDR WEBHOOK]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── Identificar etapa do lead ────────────────────────────────────────────────
function identificarEtapa(lead: {
  status: string;
  vehicle_model?: string | null;
  finance_bank?: string | null;
  finance_installment_value?: number | null;
  finance_overdue_installments?: number | null;
  owner_expectation?: number | null;
}): string {
  if (lead.status === "QUALIFIED" || lead.status === "NEGOTIATION" || lead.status === "COMMITTEE") {
    return "QUALIFICADO";
  }
  if (!lead.vehicle_model) return "AGUARDANDO_VEICULO";
  if (!lead.finance_bank && !lead.finance_installment_value) return "AGUARDANDO_FINANCIAMENTO";
  if (lead.finance_overdue_installments === null || lead.finance_overdue_installments === undefined) return "AGUARDANDO_ATRASO";
  if (lead.owner_expectation === null || lead.owner_expectation === undefined) return "AGUARDANDO_EXPECTATIVA";
  return "QUALIFICADO";
}

// ── Montar respostas ─────────────────────────────────────────────────────────
function montarResposta(
  tipo: string,
  nome: string,
  dados?: { modelo?: string; ano?: number; cidade?: string }
): string {
  const saudacao = nome ? nome.split(" ")[0] : "você";

  switch (tipo) {
    case "WELCOME":
      return (
        `Olá ${saudacao}! Aqui é o *DIECAR* — Departamento de Inteligência de Carros em Risco.\n\n` +
        `Ajudamos proprietários de veículos financiados a sair do contrato com o *menor prejuízo possível* — sem precisar pagar tudo de uma vez.\n\n` +
        `Para começar sua *análise gratuita*, me diz:\n` +
        `📋 Qual o *modelo*, *ano* e *cidade* do seu veículo?`
      );

    case "VEICULO_INVALIDO":
      return (
        `${saudacao}, não consegui entender os dados do veículo.\n\n` +
        `Pode me informar por favor:\n` +
        `🚗 *Modelo* (ex: Fiat Cronos)\n` +
        `📅 *Ano* (ex: 2021)\n` +
        `📍 *Cidade* (ex: São Paulo)`
      );

    case "PEDIR_FINANCIAMENTO":
      return (
        `Ótimo, ${saudacao}! ` +
        (dados?.modelo ? `Registrei seu *${dados.modelo}${dados.ano ? ` ${dados.ano}` : ""}*` : "Registrei seu veículo") +
        (dados?.cidade ? ` em *${dados.cidade}*` : "") +
        `.\n\n` +
        `Agora preciso dos dados do financiamento:\n` +
        `🏦 Qual o *banco* do financiamento?\n` +
        `💰 Qual o *valor da parcela*?\n` +
        `📊 *Quantas parcelas* no total e quantas já pagou?\n\n` +
        `_Pode mandar tudo junto, ex: "Banco Itaú, parcela R$1.200, 48x total, paguei 20"_`
      );

    case "FINANCIAMENTO_INVALIDO":
      return (
        `${saudacao}, preciso dos dados do financiamento:\n\n` +
        `🏦 *Banco* (ex: Itaú, Bradesco, BV)\n` +
        `💰 *Valor da parcela* (ex: R$ 1.200)\n` +
        `📊 *Total de parcelas* e *parcelas já pagas*\n\n` +
        `_Ex: "Santander, R$980, 60 parcelas, paguei 15"_`
      );

    case "PEDIR_ATRASO":
      return (
        `Perfeito, ${saudacao}! Registrei os dados do financiamento.\n\n` +
        `Uma pergunta importante:\n` +
        `⚠️ Tem *parcelas em atraso*? Se sim, *quantas*?\n\n` +
        `_Se estiver em dia, é só dizer "nenhuma" ou "0"_`
      );

    case "PEDIR_EXPECTATIVA":
      return (
        `Entendi, ${saudacao}.\n\n` +
        `Última pergunta:\n` +
        `💵 Qual *valor* você espera receber pelo veículo? Ou quanto consegue investir para quitar?\n\n` +
        `_Pode ser um valor aproximado, ex: "uns 30 mil" ou "quero receber pelo menos 25 mil"_`
      );

    case "QUALIFICADO":
      return (
        `Excelente, ${saudacao}! 🎉\n\n` +
        `Coletei todas as informações necessárias. Sua ficha já está com nosso *Comitê de Análise*.\n\n` +
        `📊 Em breve um consultor DIECAR vai entrar em contato com a *proposta de quitação* e as opções disponíveis.\n\n` +
        `_Fique tranquilo — vamos encontrar a melhor saída para o seu caso!_`
      );

    case "JA_QUALIFICADO":
      return (
        `${saudacao}, sua ficha já está sendo analisada pelo nosso time! 📋\n\n` +
        `Um consultor DIECAR vai entrar em contato em breve. Se precisar de algo urgente, é só falar aqui.`
      );

    default:
      return `Olá! Estamos analisando sua mensagem. Em breve retornamos.`;
  }
}

// ── Extratores de dados ──────────────────────────────────────────────────────

function extrairVeiculo(msg: string): { modelo?: string; ano?: number; cidade?: string } {
  const result: { modelo?: string; ano?: number; cidade?: string } = {};

  // Extrair ano (4 dígitos entre 2000 e 2030)
  const anoMatch = msg.match(/\b(20[0-3]\d)\b/);
  if (anoMatch) result.ano = parseInt(anoMatch[1]);

  // Remover ano da string para facilitar parse
  let clean = msg.replace(/\b20[0-3]\d\b/, "").trim();

  // Cidades conhecidas
  const cidades = [
    "são paulo", "sao paulo", "sp", "rio de janeiro", "rj", "belo horizonte", "bh",
    "curitiba", "porto alegre", "salvador", "brasília", "brasilia", "fortaleza",
    "recife", "manaus", "goiânia", "goiania", "campinas", "guarulhos", "osasco",
    "santo andré", "santo andre", "são bernardo", "sao bernardo", "niterói", "niteroi",
    "florianópolis", "florianopolis", "vitória", "vitoria", "belém", "belem",
    "natal", "maceió", "maceio", "joão pessoa", "joao pessoa", "teresina",
    "campo grande", "cuiabá", "cuiaba", "aracaju", "londrina", "joinville",
    "ribeirão preto", "ribeirao preto", "sorocaba", "uberlândia", "uberlandia",
    "contagem", "juiz de fora", "feira de santana", "santos", "maringá", "maringa",
  ];

  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const lowerNorm = normalize(clean);
  for (const cidade of cidades) {
    const cidadeNorm = normalize(cidade);
    if (lowerNorm.includes(cidadeNorm)) {
      result.cidade = cidade.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      // Remove cidade from clean string (accent-insensitive)
      const idx = lowerNorm.indexOf(cidadeNorm);
      clean = (clean.substring(0, idx) + clean.substring(idx + cidade.length)).trim();
      break;
    }
  }

  // O que sobrou é provavelmente o modelo
  const modelo = clean
    .replace(/[,.\-/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (modelo.length >= 3) {
    result.modelo = modelo.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }

  return result;
}

function extrairFinanciamento(msg: string): {
  banco?: string;
  parcela?: number;
  totalParcelas?: number;
  parcelasPagas?: number;
} {
  const result: { banco?: string; parcela?: number; totalParcelas?: number; parcelasPagas?: number } = {};

  // Bancos conhecidos
  const bancos = [
    "itaú", "itau", "bradesco", "santander", "bv", "banco bv", "pan", "banco pan",
    "caixa", "bb", "banco do brasil", "safra", "votorantim", "bmw", "mercedes",
    "toyota", "honda bank", "fiat", "gm financial", "volkswagen", "hyundai",
    "renault", "porto seguro", "losango", "omni", "daycoval", "abc", "fibra",
    "original", "inter", "c6", "nubank", "btg",
  ];

  const lower = msg.toLowerCase();
  for (const banco of bancos) {
    if (lower.includes(banco)) {
      result.banco = banco.charAt(0).toUpperCase() + banco.slice(1);
      break;
    }
  }

  // Valor da parcela (R$ XXX ou XXXX reais)
  const parcelaMatch = msg.match(/r\$\s*([\d.,]+)/i) || msg.match(/([\d.,]+)\s*(?:reais|por\s*m[eê]s)/i);
  if (parcelaMatch) {
    result.parcela = parseFloat(parcelaMatch[1].replace(/\./g, "").replace(",", "."));
  }

  // Total de parcelas (48x, 60 parcelas, etc.)
  const totalMatch = msg.match(/(\d+)\s*(?:x|parcelas?\s*(?:no\s*)?total|vezes)/i);
  if (totalMatch) result.totalParcelas = parseInt(totalMatch[1]);

  // Parcelas pagas
  const pagasMatch = msg.match(/(?:pagu?(?:ei|ou)|j[aá]\s*pag(?:uei|ou|as))\s*(\d+)/i)
    || msg.match(/(\d+)\s*(?:pagas?|j[aá]\s*pag)/i);
  if (pagasMatch) result.parcelasPagas = parseInt(pagasMatch[1]);

  return result;
}

function extrairAtraso(msg: string): { parcelas: number } {
  const lower = msg.toLowerCase();

  // Sem atraso
  if (
    lower.includes("nenhuma") || lower.includes("nenhum") ||
    lower.includes("em dia") || lower.includes("0 parcela") ||
    lower.includes("não") || lower.includes("nao") ||
    lower.includes("tudo em dia") || lower.includes("zero") ||
    lower === "0" || lower === "não" || lower === "nao"
  ) {
    return { parcelas: 0 };
  }

  // Número de parcelas em atraso
  const match = msg.match(/(\d+)/);
  return { parcelas: match ? parseInt(match[1]) : 1 };
}

function extrairValor(msg: string): number | null {
  // R$ XXX.XXX ou XXX mil ou XXXK
  const realMatch = msg.match(/r\$\s*([\d.,]+)/i);
  if (realMatch) {
    return parseFloat(realMatch[1].replace(/\./g, "").replace(",", "."));
  }

  const milMatch = msg.match(/([\d.,]+)\s*mil/i);
  if (milMatch) {
    return parseFloat(milMatch[1].replace(",", ".")) * 1000;
  }

  const kMatch = msg.match(/([\d.,]+)\s*k/i);
  if (kMatch) {
    return parseFloat(kMatch[1].replace(",", ".")) * 1000;
  }

  const numMatch = msg.match(/(\d[\d.,]*)/);
  if (numMatch) {
    const val = parseFloat(numMatch[1].replace(/\./g, "").replace(",", "."));
    return val > 100 ? val : val * 1000; // assume mil se < 100
  }

  return null;
}
