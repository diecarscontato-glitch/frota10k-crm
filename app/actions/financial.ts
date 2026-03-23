"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addFinancialRecord(data: {
  asset_id: string;
  type: string; // "INCOME" or "EXPENSE"
  category: string;
  description: string;
  amount: number;
  date: Date;
}) {
  const session = await auth();
  const userData = session?.user as { id: string, accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  // Verify asset ownership
  const asset = await db.asset.findUnique({
    where: { 
      id: data.asset_id,
      account_id: userData.accountId 
    }
  });

  if (!asset) {
    throw new Error("Ativo não encontrado ou não pertence a esta conta.");
  }

  const record = await db.financialRecord.create({
    data: {
      account_id: userData.accountId,
      asset_id: data.asset_id,
      type: data.type,
      category: data.category,
      description: data.description,
      amount: data.amount,
      date: data.date
    }
  });

  if (asset.lead_id) {
    revalidatePath(`/leads/${asset.lead_id}`);
  }
  revalidatePath(`/assets/${asset.id}`);

  return record;
}

export async function deleteFinancialRecord(recordId: string, leadId?: string) {
  const session = await auth();
  const userData = session?.user as { id: string, accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const record = await db.financialRecord.findUnique({
    where: { id: recordId, account_id: userData.accountId }
  });

  if (!record) {
    throw new Error("Registro financeiro não encontrado.");
  }

  await db.financialRecord.delete({
    where: { id: record.id }
  });

  if (leadId) revalidatePath(`/leads/${leadId}`);
  if (record.asset_id) revalidatePath(`/assets/${record.asset_id}`);

  return true;
}
