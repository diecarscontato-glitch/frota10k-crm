"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// CUSTOS FIXOS BASEADOS NO NOVO MODELO DE NEGÓCIO:
// Dossiê Jurídico - Preço de Venda (Tenant): R$ 60.00 | Custo M12 (OFC API): R$ 34.90
// Dossiê Veicular - Preço de Venda (Tenant): R$ 80.00 | Custo M12 (OFC API): R$ 45.00

const PRICING: Record<string, { tenant_cost: number, platform_cost: number, name: string }> = {
  DOSSIE_JURIDICO: { tenant_cost: 60.0, platform_cost: 34.90, name: "Dossiê Jurídico Completo" },
  DOSSIE_VEICULAR: { tenant_cost: 80.0, platform_cost: 45.00, name: "Dossiê Veicular VIP" },
};

export async function getWalletBalance() {
  const session = await auth();
  const userData = session?.user as { id: string, accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const account = await db.account.findUnique({
    where: { id: userData.accountId },
    select: { wallet_balance: true }
  });

  return account?.wallet_balance || 0;
}

export async function addWalletFunds(amount: number) {
  const session = await auth();
  const userData = session?.user as { id: string, accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  await db.$transaction(async (tx) => {
    await tx.walletTransaction.create({
      data: {
        account_id: userData.accountId,
        type: "DEPOSIT",
        amount: amount,
        description: "Adição de Créditos via PIX/Cartão"
      }
    });

    await tx.account.update({
      where: { id: userData.accountId },
      data: {
        wallet_balance: { increment: amount }
      }
    });
  });

  revalidatePath("/(dashboard)", "layout");
  return { success: true };
}

export async function requestM12Service(assetId: string, type: "DOSSIE_JURIDICO" | "DOSSIE_VEICULAR") {
  const session = await auth();
  const userData = session?.user as { id: string, accountId: string } | undefined;

  if (!userData?.id || !userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const pricing = PRICING[type];
  if (!pricing) throw new Error("Serviço inválido");

  return await db.$transaction(async (tx) => {
    const account = await tx.account.findUnique({ where: { id: userData.accountId } });
    
    if (!account || account.wallet_balance < pricing.tenant_cost) {
      throw new Error("Saldo insuficiente na Wallet. Adicione créditos para continuar.");
    }

    // 1. Debitar saldo da Wallet
    await tx.walletTransaction.create({
      data: {
        account_id: account.id,
        type: "DEDUCTION",
        amount: pricing.tenant_cost,
        description: `Pagamento de Ordem de Serviço: ${pricing.name}`
      }
    });

    await tx.account.update({
      where: { id: account.id },
      data: { wallet_balance: { decrement: pricing.tenant_cost } }
    });

    // 2. Chamar a API M12 (Consultas OFC)
    // Aqui no futuro trocaremos pelo axios/fetch real para `https://wl-platform-backend.consultasofc.com.br/v1/public/`
    const mockApiResult = {
      status: "COMPLETED",
      data: {
        protocol: `M12-${Date.now()}`,
        status: "NADA_CONSTA",
        message: "Simulação: Retorno de dados completos da API Consultas OFC"
      }
    };

    // 3. Registrar a Ordem de Serviço (O.S)
    const os = await tx.serviceOrder.create({
      data: {
        account_id: account.id,
        asset_id: assetId,
        requested_by_id: userData.id,
        type: type,
        status: "COMPLETED",
        cost_to_tenant: pricing.tenant_cost,
        cost_to_platform: pricing.platform_cost,
        result_data: mockApiResult,
        pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      }
    });

    revalidatePath(`/assets/${assetId}`);
    // revalidate leads se acessado pela página de lead

    return os;
  });
}

export async function getAssetServiceOrders(assetId: string) {
  const session = await auth();
  const userData = session?.user as { id: string, accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  return await db.serviceOrder.findMany({
    where: { 
      asset_id: assetId,
      account_id: userData.accountId 
    },
    orderBy: { created_at: "desc" }
  });
}
