import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SYNC_KEY = process.env.CRON_SECRET || "diecar-sync-2026";

/**
 * POST /api/webhook/n8n
 * Endpoint simples para o n8n:
 * - Recebe { nome, telefone, mensagem }
 * - Se lead existe → retorna { exists: true, lead }
 * - Se lead não existe → cria e retorna { exists: false, lead }
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

  const { nome, telefone } = body;
  if (!nome || !telefone) {
    return NextResponse.json(
      { error: "nome e telefone são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const account = await db.account.findFirst({
      where: { name: "DIECAR" },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Conta DIECAR não encontrada" },
        { status: 404 }
      );
    }

    // Buscar lead existente por telefone
    const existingLead = await db.lead.findFirst({
      where: { account_id: account.id, phone: telefone },
      select: { id: true, name: true, phone: true, status: true },
    });

    if (existingLead) {
      return NextResponse.json({ exists: true, lead: existingLead });
    }

    // Criar novo lead
    const lead = await db.lead.create({
      data: {
        account_id: account.id,
        name: nome,
        phone: telefone,
        source: "WhatsApp n8n",
        status: "NEW",
      },
    });

    return NextResponse.json({ exists: false, lead });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    console.error("[WEBHOOK N8N]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
