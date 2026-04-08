"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";

export async function saveAnalysis(data: any) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string; role?: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  requirePermission(userData.role ?? "viewer", "analysis.write");

  // 1. Save or Update Analysis
  const existingAnalysis = await db.analysis.findFirst({
    where: { lead_id: data.lead_id, asset: { account_id: userData.accountId } } // We check asset account or just use lead owner
  });
  
  // Actually, we linked analysis to lead_id now, so we can just look up by lead_id
  const lead = await db.lead.findUnique({
    where: { id: data.lead_id, account_id: userData.accountId }
  });

  if (!lead) {
    throw new Error("Lead não encontrado");
  }

  const analysisRecord = await db.analysis.findFirst({
    where: { lead_id: data.lead_id }
  });

  const payload = {
    lead_id: data.lead_id,
    analyst_user_id: userData.id,
    fipe_value: data.fipe_value,
    market_value: data.market_value,
    difference_fipe: data.difference_fipe,
    difference_market: data.difference_market,
    estimated_rent: data.estimated_rent,
    bank_profile: data.bank_profile,
    recommendation: data.recommendation,
    verdict: data.verdict,
    ready_for_committee: true, // Auto-flag
  };

  let analysis;
  if (analysisRecord) {
    analysis = await db.analysis.update({
      where: { id: analysisRecord.id },
      data: payload,
    });
  } else {
    analysis = await db.analysis.create({
      data: payload,
    });
  }

  // 2. Automate Lead Status based on Verdict
  let newStatus = lead.status;
  if (data.verdict === "APROVADO") {
    newStatus = "APPROVED";
  } else if (data.verdict === "NEGOCIAR") {
    newStatus = "NEGOTIATING";
  } else if (data.verdict === "RECUSADO") {
    newStatus = "DISCARDED";
  }

  if (newStatus !== lead.status) {
    await db.lead.update({
      where: { id: data.lead_id },
      data: { status: newStatus }
    });
  }

  revalidatePath(`/leads/${data.lead_id}`);
  revalidatePath("/leads");
  
  return analysis;
}
