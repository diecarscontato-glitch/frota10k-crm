"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getDashboardMetrics() {
  const session = await auth();

  if (!(session?.user as { accountId?: string })?.accountId) {
    throw new Error("Não autorizado");
  }

  const accountId = (session?.user as { accountId?: string }).accountId as string;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    leadsHot,
    aguardandoDecisao,
    analisesHoje,
    frotaAtiva,
    recentAssets,
    alertasVermelhos,
    leadsRecentes,
  ] = await Promise.all([
    db.lead.count({ where: { account_id: accountId, urgency: "HIGH" } }),
    db.lead.count({ where: { account_id: accountId, status: "NEGOTIATION" } }),
    db.analysis.count({ where: { lead: { account_id: accountId }, created_at: { gte: startOfToday } } }),
    db.asset.count({ where: { account_id: accountId, rental_eligible: true } }),
    db.asset.findMany({
      where: { account_id: accountId },
      orderBy: { updated_at: "desc" },
      take: 5,
    }),
    db.task.findMany({
      where: { account_id: accountId, priority: "HIGH", status: "PENDING" },
      orderBy: { due_date: "asc" },
      include: { lead: true },
    }),
    // Últimos leads enviados pelo SDR (últimas 48h)
    db.lead.findMany({
      where: {
        account_id: accountId,
        created_at: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      },
      orderBy: [
        { urgency: "desc" }, // HIGH primeiro
        { created_at: "desc" },
      ],
      take: 8,
      select: {
        id: true,
        name: true,
        phone: true,
        urgency: true,
        status: true,
        source: true,
        vehicle_model: true,
        created_at: true,
      },
    }),
  ]);

  return {
    leadsHot,
    aguardandoDecisao,
    analisesHoje,
    frotaAtiva,
    recentAssets,
    alertasVermelhos,
    leadsRecentes,
  };
}
