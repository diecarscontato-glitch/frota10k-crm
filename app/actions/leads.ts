"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { routeLeadRoundRobin } from "@/lib/automations/lead-router";

export async function getLeads(filters?: { status?: string }) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const leads = await db.lead.findMany({
    where: {
      account_id: userData.accountId,
      ...(filters?.status && { status: filters.status }),
    },
    orderBy: {
      created_at: "desc",
    },
    include: {
      owner: true,
      assigned_to: true,
      assets: true,
    },
  });

  return leads;
}

export async function createLead(data: {
  name: string;
  phone?: string;
  city?: string;
  state?: string;
  profession?: string;
  source?: string;

  // Vehicle Data
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_plate?: string;
  has_reserve_key?: boolean;
  has_manual?: boolean;
  auction_history?: string;
  damages?: string;

  // Financial Data
  finance_bank?: string;
  finance_installment_value?: number;
  finance_total_installments?: number;
  finance_paid_installments?: number;
  finance_remaining_installments?: number;
  finance_overdue_installments?: number;
  finance_outstanding_balance?: number;
  owner_expectation?: number;
  urgency?: string;
}) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string; role?: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  requirePermission(userData.role ?? "viewer", "lead.write");

  if (!data.name) {
    throw new Error("O nome do lead é obrigatório.");
  }

  const lead = await db.lead.create({
    data: {
      account_id: userData.accountId,
      owner_user_id: userData.id,
      ...data,
      status: "NEW",
    },
  });

  // Tries to route lead via Round Robin
  try {
    await routeLeadRoundRobin(userData.accountId, lead.id);
  } catch (error) {
    console.error("Erro na distribuição Round Robin:", error);
  }

  revalidatePath("/leads");
  return lead;
}

export async function updateLeadStatus(leadId: string, status: string) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const lead = await db.lead.update({
    where: {
      id: leadId,
      account_id: userData.accountId,
    },
    data: { status },
  });

  revalidatePath("/leads");
  return lead;
}

export async function getLeadById(id: string) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const lead = await db.lead.findUnique({
    where: {
      id,
      account_id: userData.accountId,
    },
    include: {
      assets: {
        include: {
          financing: true,
        },
      },
      tasks: true,
    },
  });

  return lead;
}

export async function updateLead(leadId: string, data: Record<string, unknown>) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string; role?: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  requirePermission(userData.role ?? "viewer", "lead.write");

  if (!data.name) {
    throw new Error("O nome do lead é obrigatório.");
  }

  const lead = await db.lead.update({
    where: {
      id: leadId,
      account_id: userData.accountId,
    },
    data: { ...data },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return lead;
}

export async function decideLead(leadId: string, decision: "APPROVE" | "REJECT") {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string; role?: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  requirePermission(userData.role ?? "viewer", "lead.decide");

  const status = decision === "APPROVE" ? "WON" : "LOST";
  const assetStatus = decision === "APPROVE" ? "IN_STOCK" : "REJECTED";

  try {
    // Atualizar Lead
    await db.lead.update({
      where: { id: leadId, account_id: userData.accountId },
      data: { status },
    });

    // Atualizar Ativo vinculado
    const asset = await db.asset.findFirst({
      where: { lead_id: leadId, account_id: userData.accountId },
    });

    if (asset) {
      await db.asset.update({
        where: { id: asset.id },
        data: { status: assetStatus },
      });
    }

    // --- APPROVE: Docs + Marketplace automático ---
    if (decision === "APPROVE") {
      const lead = await db.lead.findUnique({
        where: { id: leadId },
        select: { phone: true, name: true, vehicle_model: true },
      });

      const assetFull = await db.asset.findFirst({
        where: { lead_id: leadId },
        include: { financing: true },
      });

      if (assetFull) {
        // 1. Disparar Agente Docs em background (falha silenciosa)
        if (lead?.phone) {
          fetch(`${process.env.DOCS_AGENT_URL || "http://localhost:3002"}/gerar-docs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ telefone: lead.phone }),
          }).catch((err: Error) => console.error("[DOCS SYNC ERROR]", err.message));
        }

        // 2. Publicar no Marketplace diretamente via db (evita double-auth)
        try {
          const fipe = Number(assetFull.fipe_value) || 0;
          const askingPrice = fipe > 0 ? fipe * 0.85 : Number(assetFull.estimated_value) || 0;
          const titulo = `OPORTUNIDADE DIECAR: ${assetFull.brand ?? ""} ${assetFull.model ?? lead?.vehicle_model ?? ""}`.trim();

          // Verifica se já existe publicação ativa pra esse asset
          const pubExistente = await db.publication.findFirst({
            where: { asset_id: assetFull.id, status: "ACTIVE" },
            select: { id: true },
          });

          if (!pubExistente) {
            await db.publication.create({
              data: {
                account_id: userData.accountId,
                asset_id: assetFull.id,
                published_by_user_id: userData.id,
                title: titulo,
                description: "Veículo aprovado pelo comitê DIECAR. Excelente oportunidade de repasse ou locação.",
                asking_price: askingPrice,
                visibility: "PUBLIC",
                status: "ACTIVE",
              },
            });

            // Atualizar status do asset para MARKETPLACE
            await db.asset.update({
              where: { id: assetFull.id },
              data: { status: "MARKETPLACE" },
            });

            console.log(`[MARKETPLACE] Ativo ${assetFull.id} publicado automaticamente — R$ ${askingPrice.toLocaleString("pt-BR")}`);
          } else {
            console.log(`[MARKETPLACE] Publicação já existe para asset ${assetFull.id} — pulando.`);
          }
        } catch (mktErr) {
          console.error("[MARKETPLACE SYNC ERROR]", mktErr);
        }
      }
    }

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    revalidatePath("/marketplace");
    revalidatePath("/publications");
    revalidatePath("/assets");
    return { success: true };
  } catch {
    throw new Error("Falha ao registrar a decisão do Comitê");
  }
}
