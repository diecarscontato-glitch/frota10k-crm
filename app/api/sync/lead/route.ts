import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMetaLeadEvent } from "@/lib/meta-capi";

// Chave de autenticação compartilhada com os agentes Node.js
const SYNC_KEY = process.env.FROTA10K_SYNC_KEY || "diecar-sync-2026";

/**
 * POST /api/sync/lead
 *
 * Recebe dados de um lead qualificado pelo Agente Analista (Node.js)
 * e sincroniza com o banco FROTA10K.
 *
 * Body esperado:
 * {
 *   nome, telefone, cidade, estado, marca, modelo, ano, placa,
 *   banco, valor_parcela, parcelas_totais, parcelas_pagas,
 *   parcelas_atraso, valor_esperado, titularidade, urgencia,
 *   temperatura, destino_sugerido, risco_financeiro,
 *   valor_fipe, margem_agio_estimada, margem_repasse_estimada,
 *   observacoes, status_agente
 * }
 */
export async function POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const apiKey = req.headers.get("x-sync-key");
  if (apiKey !== SYNC_KEY) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: Record<string, string | number | undefined>;
  try {
    body = await req.json() as Record<string, string | number | undefined>;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { nome, telefone } = body;
  if (!nome || !telefone) {
    return NextResponse.json(
      { error: "nome e telefone são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    // ── Buscar conta DIECAR ───────────────────────────────────────────────────
    const account = await db.account.findFirst({
      where: { name: "DIECAR" },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Conta DIECAR não encontrada no banco FROTA10K" },
        { status: 404 }
      );
    }

    // ── Buscar usuário SDR IA ─────────────────────────────────────────────────
    const userSDR = await db.user.findFirst({
      where: { account_id: account.id, email: "sdr@diecar.com.br" },
      select: { id: true },
    });

    // ── Mapear temperatura → urgência ─────────────────────────────────────────
    const urgencyMap: Record<string, string> = {
      HOT: "HIGH",
      WARM: "MEDIUM",
      COLD: "LOW",
    };
    const urgencia = urgencyMap[body.temperatura?.toUpperCase() || ""] || "LOW";

    // ── Mapear status dos agentes → status FROTA10K ───────────────────────────
    const statusMap: Record<string, string> = {
      qualificado: "QUALIFICATION",
      em_analise: "QUALIFICATION",
      aguardando_decisao: "NEGOTIATION",
    };
    const statusFrota = statusMap[body.status_agente || ""] || "QUALIFICATION";

    // ── Upsert lead (por telefone — evita duplicatas) ─────────────────────────
    const leadExistente = await db.lead.findFirst({
      where: {
        account_id: account.id,
        phone: telefone,
      },
      select: { id: true },
    });

    let lead;

    const leadData = {
      name: nome,
      phone: telefone,
      city: body.cidade || null,
      state: body.estado || "SP",
      source: "WhatsApp SDR",
      vehicle_model: body.marca && body.modelo
        ? `${body.marca} ${body.modelo}`
        : body.modelo || null,
      vehicle_year: body.ano ? parseInt(body.ano) : null,
      vehicle_plate: body.placa || null,
      finance_bank: body.banco || null,
      finance_installment_value: body.valor_parcela ? parseFloat(body.valor_parcela) : null,
      finance_total_installments: body.parcelas_totais ? parseInt(body.parcelas_totais) : null,
      finance_paid_installments: body.parcelas_pagas ? parseInt(body.parcelas_pagas) : null,
      finance_overdue_installments: body.parcelas_atraso ? parseInt(body.parcelas_atraso) : null,
      finance_outstanding_balance: body.valor_fipe ? parseFloat(body.valor_fipe) * 0.5 : null,
      owner_expectation: body.valor_esperado ? parseFloat(body.valor_esperado) : null,
      urgency: urgencia,
      status: statusFrota,
    };

    if (leadExistente) {
      // Atualizar lead existente
      lead = await db.lead.update({
        where: { id: leadExistente.id },
        data: leadData as Parameters<typeof db.lead.update>[0]['data'],
      });
      console.log(`[SYNC] Lead atualizado: #${lead.id} — ${nome}`);
    } else {
      // Criar novo lead
      lead = await db.lead.create({
        data: {
          account_id: account.id,
          owner_user_id: userSDR?.id || null,
          ...leadData,
        },
      });
      console.log(`[SYNC] Novo lead criado: #${lead.id} — ${nome}`);

      // Conversions API (Meta) — fire-and-forget, só para leads vindos do WhatsApp
      const veioDoWhatsApp = String(leadData.source ?? "").toLowerCase().includes("whatsapp");
      if (veioDoWhatsApp) {
        const ctwaClid = typeof body.ctwa_clid === "string" ? body.ctwa_clid : null;
        sendMetaLeadEvent({
          phone: String(telefone),
          city: typeof body.cidade === "string" ? body.cidade : null,
          state: typeof body.estado === "string" ? body.estado : null,
          leadId: lead.id,
          ctwaClid,
        }).catch((err) => console.log(`[SYNC] CAPI falhou (silencioso): ${err.message}`));
      }
    }

    // ── Criar/atualizar ativo se tiver dados de veículo ───────────────────────
    if (body.marca && body.modelo) {
      const ativoExistente = await db.asset.findFirst({
        where: { lead_id: lead.id },
        select: { id: true },
      });

      // Mapear destino dos agentes → status do ativo no FROTA10K
      const destinoStatus: Record<string, string> = {
        AGIO: "COMMITTEE",
        REPASSE: "COMMITTEE",
        LOCACAO: "COMMITTEE",
        DESCARTE: "SCREENING",
      };
      const statusAtivo = destinoStatus[body.destino_sugerido || ""] || "SCREENING";

      const ativoData = {
        type: "CAR" as const,
        brand: body.marca || null,
        model: body.modelo || null,
        year: body.ano ? parseInt(body.ano) : null,
        plate: body.placa || null,
        city: body.cidade || null,
        state: body.estado || "SP",
        fipe_value: body.valor_fipe ? parseFloat(body.valor_fipe) : null,
        estimated_value: body.valor_fipe
          ? parseFloat(body.valor_fipe) * 0.45
          : null,
        rental_eligible: body.destino_sugerido === "LOCACAO",
        status: statusAtivo,
      };

      if (ativoExistente) {
        await db.asset.update({
          where: { id: ativoExistente.id },
          data: ativoData,
        });
      } else {
        const ativo = await db.asset.create({
          data: {
            account_id: account.id,
            lead_id: lead.id,
            ...ativoData,
          },
        });

        // Criar financiamento vinculado ao ativo
        if (body.banco && body.valor_parcela) {
          await db.financing.create({
            data: {
              asset_id: ativo.id,
              bank: body.banco,
              installment_value: parseFloat(body.valor_parcela),
              total_installments: body.parcelas_totais ? parseInt(body.parcelas_totais) : null,
              paid_installments: body.parcelas_pagas ? parseInt(body.parcelas_pagas) : null,
              overdue_installments: body.parcelas_atraso ? parseInt(body.parcelas_atraso) : 0,
              outstanding_balance: body.valor_fipe ? parseFloat(body.valor_fipe) * 0.5 : null,
            },
          });
        }
      }
    }

    // ── Criar/atualizar Analysis quando vem do Analista ──────────────────────
    if (body.destino_sugerido && body.valor_fipe) {
      const verdictMap: Record<string, string> = {
        AGIO: "APROVADO",
        REPASSE: "APROVADO",
        LOCACAO: "APROVADO",
        DESCARTE: "RECUSADO",
      };
      const verdict = verdictMap[body.destino_sugerido as string] || "NEGOCIAR";

      const fipe = body.valor_fipe ? parseFloat(body.valor_fipe as string) : 0;
      const parcelas_restantes = (body.parcelas_totais ? parseInt(body.parcelas_totais as string) : 0)
        - (body.parcelas_pagas ? parseInt(body.parcelas_pagas as string) : 0);
      const saldo_devedor = fipe > 0 ? fipe * 0.35 : 0; // estimativa conservadora

      const ativoParaAnalise = await db.asset.findFirst({
        where: { lead_id: lead.id },
        select: { id: true },
      });
      const userAnalista = await db.user.findFirst({
        where: { account_id: account.id, email: "analista@diecar.com.br" },
        select: { id: true },
      });

      const analysisExistente = await db.analysis.findFirst({
        where: { lead_id: lead.id },
        select: { id: true },
      });

      const analysisData = {
        lead_id: lead.id,
        asset_id: ativoParaAnalise?.id || null,
        analyst_user_id: userAnalista?.id || null,
        fipe_value: fipe,
        total_debt_estimated: saldo_devedor,
        market_value: fipe * 0.9,
        difference_fipe: fipe - saldo_devedor,
        bank_profile: body.parcelas_atraso && parseInt(body.parcelas_atraso as string) > 0 ? "NEGOCIAVEL" : "RUIM",
        recommendation: body.destino_sugerido as string,
        verdict,
        ready_for_committee: true,
        general_notes: body.observacoes as string || null,
      };

      if (analysisExistente) {
        await db.analysis.update({
          where: { id: analysisExistente.id },
          data: analysisData,
        });
      } else {
        await db.analysis.create({ data: analysisData });
      }
      console.log(`[SYNC] Analysis criada/atualizada — Lead ${lead.id} → ${verdict} (${body.destino_sugerido})`);
    }

    // ── Criar tarefa urgente para HOT ─────────────────────────────────────────
    if (body.temperatura === "HOT" && userSDR) {
      const tarefaExistente = await db.task.findFirst({
        where: {
          lead_id: lead.id,
          title: { contains: "SDR HOT" },
        },
      });

      if (!tarefaExistente) {
        const atrasoNum = parseInt(body.parcelas_atraso || "0");
        await db.task.create({
          data: {
            account_id: account.id,
            user_id: userSDR.id,
            lead_id: lead.id,
            title: `[SDR HOT] Contato urgente — ${nome}`,
            description: `Lead HOT via WhatsApp. ${atrasoNum || 0} parcela(s) em atraso no ${body.banco || "banco"}. ${body.observacoes || ""}`,
            priority: "HIGH",
            status: "PENDING",
            due_date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      lead_id: lead.id,
      status: lead.status,
      temperatura: body.temperatura,
      acao: leadExistente ? "atualizado" : "criado",
    });
  } catch (err: any) {
    console.error("[SYNC ERRO]", err.message);
    return NextResponse.json(
      { error: err.message || "Erro interno" },
      { status: 500 }
    );
  }
}

// GET /api/sync/lead — health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "diecar-sync",
    endpoint: "POST /api/sync/lead",
    auth: "x-sync-key header",
  });
}
