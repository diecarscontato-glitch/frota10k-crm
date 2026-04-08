import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const STUCK_HOURS = 48;
const EXCLUDED_STATUSES = ["WON", "LOST", "CLOSED", "NEW", "DISCARDED"];

export async function GET(req: NextRequest) {
  // Validate cron secret
  const cronKey = req.headers.get("x-cron-key");
  if (cronKey !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const cutoffDate = new Date(Date.now() - STUCK_HOURS * 60 * 60 * 1000);
  const taskCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find stuck leads: not in terminal statuses, not updated in 48h, no recent follow-up task
  const stuckLeads = await db.lead.findMany({
    where: {
      status: { notIn: EXCLUDED_STATUSES },
      updated_at: { lt: cutoffDate },
      phone: { not: null },
      tasks: {
        none: {
          title: { contains: "Follow-up" },
          created_at: { gte: taskCutoff },
        },
      },
    },
    select: {
      id: true,
      name: true,
      phone: true,
      status: true,
      account_id: true,
      updated_at: true,
    },
    take: 50, // safety limit
  });

  const evolutionUrl = process.env.EVOLUTION_API_URL || "http://localhost:8080";
  const evolutionKey = process.env.EVOLUTION_API_KEY || "diecar2026";
  const instance = process.env.EVOLUTION_INSTANCE || "diecar-sdr";

  const contacted: string[] = [];
  const errors: string[] = [];

  for (const lead of stuckLeads) {
    if (!lead.phone) continue;

    const daysSinceUpdate = Math.floor((Date.now() - lead.updated_at.getTime()) / (1000 * 60 * 60 * 24));
    const message = `Olá ${lead.name}! 👋 Tudo bem? Estamos aqui para retomar nossa conversa sobre seu veículo. Faz ${daysSinceUpdate} dia(s) que não conversamos. Podemos falar agora? 😊`;

    try {
      const res = await fetch(`${evolutionUrl}/message/sendText/${instance}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: evolutionKey,
        },
        body: JSON.stringify({
          number: lead.phone.replace(/\D/g, ""),
          text: message,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Evolution API ${res.status}: ${txt}`);
      }

      // Create follow-up task
      await db.task.create({
        data: {
          account_id: lead.account_id,
          lead_id: lead.id,
          title: "Follow-up automático enviado via WhatsApp",
          description: `Mensagem de reativação enviada após ${daysSinceUpdate} dias sem atualização.`,
          priority: "MEDIUM",
          status: "PENDING",
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Audit log
      await db.auditLog.create({
        data: {
          account_id: lead.account_id,
          event_type: "AUTOMATION_EXECUTED",
          target_entity_type: "LEAD",
          target_entity_id: lead.id,
          summary: `Follow-up automático enviado para ${lead.name} (${lead.phone}) — lead parado há ${daysSinceUpdate} dias.`,
          severity: "INFO",
        },
      });

      contacted.push(lead.id);
    } catch (err: any) {
      console.error(`[CRON] Erro ao enviar follow-up para lead ${lead.id}:`, err.message);
      errors.push(`${lead.id}: ${err.message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    total_stuck: stuckLeads.length,
    contacted: contacted.length,
    errors: errors.length,
    contacted_ids: contacted,
    error_details: errors,
    timestamp: new Date().toISOString(),
  });
}
