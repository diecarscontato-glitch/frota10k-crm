import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SYNC_KEY = process.env.FROTA10K_SYNC_KEY || "diecar-sync-2026";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-sync-key");
  if (apiKey !== SYNC_KEY) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const telefones: string[] = body.telefones || [];

  if (!telefones.length) {
    return NextResponse.json({ error: "telefones obrigatório" }, { status: 400 });
  }

  const results: { phone: string; deleted: boolean; error?: string }[] = [];

  for (const phone of telefones) {
    try {
      const leads = await db.lead.findMany({
        where: { phone },
        select: { id: true },
      });

      if (!leads.length) {
        results.push({ phone, deleted: false, error: "não encontrado" });
        continue;
      }

      for (const lead of leads) {
        await db.task.deleteMany({ where: { lead_id: lead.id } });
        await db.analysis.deleteMany({ where: { lead_id: lead.id } });
        await db.legalAnalysis.deleteMany({ where: { lead_id: lead.id } });
        await db.receptionControl.deleteMany({ where: { lead_id: lead.id } });
        await db.asset.deleteMany({ where: { lead_id: lead.id } });
        await db.lead.delete({ where: { id: lead.id } });
      }

      results.push({ phone, deleted: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ phone, deleted: false, error: msg });
    }
  }

  return NextResponse.json({ results });
}
