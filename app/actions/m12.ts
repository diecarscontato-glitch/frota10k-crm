"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

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

    // Buscar detalhes do Ativo e do Lead para enviar no e-mail
    const asset = await tx.asset.findUnique({
      where: { id: assetId },
      include: { lead: true }
    });

    if (!asset) throw new Error("Ativo não encontrado.");

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

    // 2. Enviar a Ordem de Serviço via e-mail (Gmail + Nodemailer)
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      throw new Error("Credenciais do e-mail (GMAIL_USER e GMAIL_PASS) não configuradas no servidor.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: "contato@m12.com.br", // Substituto do e-mail da M12
      subject: `Nova Ordem de Serviço: ${pricing.name} - Placa ${asset.plate || 'N/A'}`,
      text: `Olá equipe M12,

Foi solicitada uma nova Ordem de Serviço pelo sistema FROTA10K.

Serviço Solicitado: ${pricing.name}
Empresa (Tenant): ${account.name}

DADOS DO VEÍCULO E PROPRIETÁRIO:
Marca/Modelo: ${asset.brand || ''} ${asset.model || ''}
Placa: ${asset.plate || 'Não informada'}
Renavam: ${asset.renavam || 'Não informado'}
Nome do Proprietário: ${asset.lead?.name || 'Não informado'}
CPF do Proprietário: ${asset.lead?.cpf || 'Não informado'}

Por favor, executem o serviço e enviem o Dossiê para a plataforma ou de volta por e-mail.

Atenciosamente,
Sistema FROTA10K`
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Erro ao enviar email M12:", error);
      throw new Error("Falha de envio: A configuração do e-mail falhou. Contate o suporte.");
    }

    // 3. Registrar a Ordem de Serviço (O.S) no banco como PENDENTE/PROCESSANDO
    const os = await tx.serviceOrder.create({
      data: {
        account_id: account.id,
        asset_id: assetId,
        requested_by_id: userData.id,
        type: type,
        status: "PROCESSING",
        cost_to_tenant: pricing.tenant_cost,
        cost_to_platform: pricing.platform_cost,
        result_data: { message: "Aguardando retorno manual da M12 por e-mail." },
        pdf_url: null // Retirado o mock estático do PDF
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
