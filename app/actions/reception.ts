"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveReceptionControl(data: any) {
  const session = await auth();
  const userData = session?.user as { id: string, accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const lead = await db.lead.findUnique({
    where: { id: data.lead_id, account_id: userData.accountId },
    include: { assets: true }
  });

  if (!lead) {
    throw new Error("Lead não encontrado");
  }

  // If the Lead has no Asset linked yet, we should ideally have one from Phase 1.
  // Assuming `lead.assets[0]` exists (because Captação forces Asset creation).
  const assetIdToBind = data.asset_id || lead.assets?.[0]?.id;

  if (!assetIdToBind) {
     throw new Error("Nenhum Ativo físico vinculado a este Lead para receber.");
  }

  const receptionRecord = await db.receptionControl.findFirst({
    where: { lead_id: data.lead_id }
  });

  const payload = {
    lead_id: data.lead_id,
    asset_id: assetIdToBind,
    receiver_user_id: userData.id,
    has_manual: data.has_manual,
    has_reserve_key: data.has_reserve_key,
    has_stepe: data.has_stepe,
    has_jack: data.has_jack,
    paint_condition: data.paint_condition,
    tires_condition: data.tires_condition,
    structural_damage: data.structural_damage,
    reception_km: data.reception_km,
    tracker_installed: data.tracker_installed,
    hygiene_done: data.hygiene_done,
    reception_notes: data.reception_notes,
    verdict: data.verdict,
    received_at: new Date()
  };

  let reception;
  if (receptionRecord) {
    reception = await db.receptionControl.update({
      where: { id: receptionRecord.id },
      data: payload,
    });
  } else {
    reception = await db.receptionControl.create({
      data: payload,
    });
  }

  // Automate Pipeline
  let newLeadStatus = lead.status;
  let newAssetStatus = lead.assets[0].status;

  if (data.verdict === "APROVADO") {
    newLeadStatus = "PREP_DONE"; // Ready for Marketplace / Fleet
    newAssetStatus = "READY_FOR_MARKETPLACE";
  } else if (data.verdict === "PENDENCIAS") {
    newLeadStatus = "IN_PREPARATION"; // Going to mechanic or detailer
    newAssetStatus = "IN_MAINTENANCE";
  } else if (data.verdict === "RECUSADO") {
    newLeadStatus = "DISCARDED";
    newAssetStatus = "DISCARDED";
  }

  if (newLeadStatus !== lead.status) {
    await db.lead.update({
      where: { id: data.lead_id },
      data: { status: newLeadStatus }
    });
  }

  if (newAssetStatus !== lead.assets[0].status) {
    await db.asset.update({
      where: { id: assetIdToBind },
      data: { status: newAssetStatus, km: data.reception_km }
    });
  }

  revalidatePath(`/leads/${data.lead_id}`);
  revalidatePath("/leads");
  
  return reception;
}
