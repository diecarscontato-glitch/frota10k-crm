import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== SEED DIECAR — Sprint 2.1 ===\n");

  // ── Limpa o banco ───────────────────────────────────────────────────────────
  console.log("Limpando banco...");
  await prisma.negotiationMessage.deleteMany();
  await prisma.negotiation.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.publication.deleteMany();
  await prisma.document.deleteMany();
  await prisma.receptionControl.deleteMany();
  await prisma.legalAnalysis.deleteMany();
  await prisma.destinationDecision.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.financing.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.task.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();
  await prisma.account.deleteMany();

  // ── Passwords ───────────────────────────────────────────────────────────────
  const senhaAdmin = await bcrypt.hash("@admin123", 10);
  const senhaDefault = await bcrypt.hash("diecar2026", 10);

  // ── 1. Conta DIECAR ─────────────────────────────────────────────────────────
  console.log("Criando conta DIECAR...");
  const diecar = await prisma.account.create({
    data: {
      name: "DIECAR",
      public_name: "DIECAR — Depto. Inteligência de Carros em Risco",
      email: "contato@diecar.com.br",
      phone: "11981205759",
      city: "São Paulo",
      state: "SP",
      status: "ACTIVE",
      plan_type: "PRO",
      operational_profile: "Captação e cessão de direitos fiduciários de veículos financiados",
    },
  });

  // ── 2. Usuários ─────────────────────────────────────────────────────────────
  console.log("Criando usuários...");

  const mizza = await prisma.user.create({
    data: {
      account_id: diecar.id,
      name: "Emysael Mizza",
      display_name: "Mizza",
      email: "mizza@diecar.com.br",
      password: senhaAdmin,
      role: "admin",
      status: "ACTIVE",
    },
  });

  const agenteSDR = await prisma.user.create({
    data: {
      account_id: diecar.id,
      name: "Agente SDR",
      display_name: "SDR IA",
      email: "sdr@diecar.com.br",
      password: senhaDefault,
      role: "member",
      status: "ACTIVE",
    },
  });

  const agenteAnalista = await prisma.user.create({
    data: {
      account_id: diecar.id,
      name: "Agente Analista",
      display_name: "Analista IA",
      email: "analista@diecar.com.br",
      password: senhaDefault,
      role: "member",
      status: "ACTIVE",
    },
  });

  // ── 3. Leads reais da DIECAR (baseados no Mapa Operacional) ────────────────
  console.log("Criando leads...");

  // Lead HOT — 3+ atrasos, urgência crítica
  const leadHot1 = await prisma.lead.create({
    data: {
      account_id: diecar.id,
      name: "Ricardo Tavares",
      phone: "11987654321",
      city: "São Paulo",
      state: "SP",
      source: "Facebook Ads",
      vehicle_model: "Hyundai Creta",
      vehicle_year: 2021,
      vehicle_plate: "GHT3F45",
      finance_bank: "Santander",
      finance_installment_value: 1580,
      finance_total_installments: 60,
      finance_paid_installments: 14,
      finance_overdue_installments: 4,
      finance_outstanding_balance: 72800,
      owner_expectation: 8000,
      urgency: "HIGH",
      status: "NEGOTIATION",
      owner_user_id: agenteSDR.id,
      assigned_to_user_id: mizza.id,
    },
  });

  // Lead HOT — busca e apreensão iminente
  const leadHot2 = await prisma.lead.create({
    data: {
      account_id: diecar.id,
      name: "Fernanda Rocha",
      phone: "11976543210",
      city: "Guarulhos",
      state: "SP",
      source: "Instagram Ads",
      vehicle_model: "VW Polo",
      vehicle_year: 2020,
      vehicle_plate: "FKL2D31",
      finance_bank: "Itaú",
      finance_installment_value: 980,
      finance_total_installments: 48,
      finance_paid_installments: 9,
      finance_overdue_installments: 3,
      finance_outstanding_balance: 38500,
      owner_expectation: 5000,
      urgency: "HIGH",
      status: "NEGOTIATION",
      owner_user_id: agenteSDR.id,
      assigned_to_user_id: mizza.id,
    },
  });

  // Lead WARM — 1 atraso, quer quitar
  const leadWarm1 = await prisma.lead.create({
    data: {
      account_id: diecar.id,
      name: "Carlos Eduardo Lima",
      phone: "11965432109",
      city: "Osasco",
      state: "SP",
      source: "Facebook Ads",
      vehicle_model: "Jeep Compass",
      vehicle_year: 2022,
      vehicle_plate: "BQR7H22",
      finance_bank: "BV",
      finance_installment_value: 2340,
      finance_total_installments: 60,
      finance_paid_installments: 22,
      finance_overdue_installments: 1,
      finance_outstanding_balance: 89200,
      owner_expectation: 25000,
      urgency: "MEDIUM",
      status: "QUALIFICATION",
      owner_user_id: agenteSDR.id,
    },
  });

  // Lead WARM — sem atraso mas valor alto
  const leadWarm2 = await prisma.lead.create({
    data: {
      account_id: diecar.id,
      name: "Ana Paula Mendes",
      phone: "11954321098",
      city: "Santo André",
      state: "SP",
      source: "WhatsApp Orgânico",
      vehicle_model: "Toyota Corolla",
      vehicle_year: 2020,
      vehicle_plate: "CMV5A19",
      finance_bank: "Bradesco",
      finance_installment_value: 1890,
      finance_total_installments: 60,
      finance_paid_installments: 30,
      finance_overdue_installments: 0,
      finance_outstanding_balance: 56400,
      owner_expectation: 15000,
      urgency: "MEDIUM",
      status: "QUALIFICATION",
      owner_user_id: agenteSDR.id,
    },
  });

  // Lead COLD — só pesquisando
  const leadCold1 = await prisma.lead.create({
    data: {
      account_id: diecar.id,
      name: "Marcos Vinícius",
      phone: "11943210987",
      city: "Campinas",
      state: "SP",
      source: "Facebook Ads",
      vehicle_model: "Chevrolet Onix Plus",
      vehicle_year: 2021,
      vehicle_plate: "DRT4G88",
      finance_bank: "Pan",
      finance_installment_value: 1120,
      finance_total_installments: 48,
      finance_paid_installments: 20,
      finance_overdue_installments: 0,
      finance_outstanding_balance: 31200,
      owner_expectation: 5000,
      urgency: "LOW",
      status: "CONTACTED",
      owner_user_id: agenteSDR.id,
    },
  });

  // Lead COLD — novos
  const leadNew1 = await prisma.lead.create({
    data: {
      account_id: diecar.id,
      name: "Juliana Ferreira",
      phone: "11932109876",
      city: "São Bernardo do Campo",
      state: "SP",
      source: "Instagram Ads",
      vehicle_model: "Honda HR-V",
      vehicle_year: 2022,
      status: "NEW",
      owner_user_id: agenteSDR.id,
    },
  });

  const leadNew2 = await prisma.lead.create({
    data: {
      account_id: diecar.id,
      name: "Pedro Augusto",
      phone: "11921098765",
      city: "Barueri",
      state: "SP",
      source: "Facebook Ads",
      vehicle_model: "Fiat Pulse",
      vehicle_year: 2023,
      status: "NEW",
      owner_user_id: agenteSDR.id,
    },
  });

  // Lead ganho — operação fechada
  const leadWon = await prisma.lead.create({
    data: {
      account_id: diecar.id,
      name: "Roberto Alves",
      phone: "11910987654",
      city: "São Paulo",
      state: "SP",
      source: "Indicação",
      vehicle_model: "Nissan Kicks",
      vehicle_year: 2021,
      vehicle_plate: "EVN9J55",
      finance_bank: "Itaú",
      finance_installment_value: 1450,
      finance_total_installments: 60,
      finance_paid_installments: 36,
      finance_overdue_installments: 0,
      finance_outstanding_balance: 34800,
      owner_expectation: 12000,
      urgency: "LOW",
      status: "WON",
      owner_user_id: mizza.id,
    },
  });

  // ── 4. Ativos (veículos captados/em análise) ─────────────────────────────────
  console.log("Criando ativos...");

  // Ativo HOT1 — em análise de comitê
  const ativoHot1 = await prisma.asset.create({
    data: {
      account_id: diecar.id,
      lead_id: leadHot1.id,
      type: "CAR",
      brand: "Hyundai",
      model: "Creta",
      year: 2021,
      plate: "GHT3F45",
      km: 48000,
      color: "Branco",
      city: "São Paulo",
      state: "SP",
      condition: "BOM",
      estimated_value: 42000,
      fipe_value: 78500,
      status: "COMMITTEE",
      rental_eligible: false,
      financing: {
        create: {
          bank: "Santander",
          total_installments: 60,
          paid_installments: 14,
          installment_value: 1580,
          overdue_installments: 4,
          outstanding_balance: 72800,
        },
      },
    },
  });

  // Ativo HOT2 — triagem urgente
  const ativoHot2 = await prisma.asset.create({
    data: {
      account_id: diecar.id,
      lead_id: leadHot2.id,
      type: "CAR",
      brand: "VW",
      model: "Polo",
      year: 2020,
      plate: "FKL2D31",
      km: 62000,
      color: "Prata",
      city: "Guarulhos",
      state: "SP",
      condition: "REGULAR",
      estimated_value: 28000,
      fipe_value: 52000,
      status: "SCREENING",
      rental_eligible: false,
      financing: {
        create: {
          bank: "Itaú",
          total_installments: 48,
          paid_installments: 9,
          installment_value: 980,
          overdue_installments: 3,
          outstanding_balance: 38500,
        },
      },
    },
  });

  // Ativo WARM — aguardando decisão de destino
  const ativoWarm1 = await prisma.asset.create({
    data: {
      account_id: diecar.id,
      lead_id: leadWarm1.id,
      type: "CAR",
      brand: "Jeep",
      model: "Compass",
      year: 2022,
      plate: "BQR7H22",
      km: 38000,
      color: "Cinza",
      city: "Osasco",
      state: "SP",
      condition: "BOM",
      estimated_value: 65000,
      fipe_value: 118000,
      status: "COMMITTEE",
      rental_eligible: true,
      financing: {
        create: {
          bank: "BV",
          total_installments: 60,
          paid_installments: 22,
          installment_value: 2340,
          overdue_installments: 1,
          outstanding_balance: 89200,
        },
      },
    },
  });

  // Ativo no Marketplace (operação fechada, à venda)
  const ativoMarket = await prisma.asset.create({
    data: {
      account_id: diecar.id,
      lead_id: leadWon.id,
      type: "CAR",
      brand: "Nissan",
      model: "Kicks",
      year: 2021,
      plate: "EVN9J55",
      km: 45000,
      color: "Preto",
      city: "São Paulo",
      state: "SP",
      condition: "BOM",
      estimated_value: 52000,
      fipe_value: 71000,
      status: "MARKETPLACE",
      rental_eligible: true,
      financing: {
        create: {
          bank: "Itaú",
          total_installments: 60,
          paid_installments: 36,
          installment_value: 1450,
          overdue_installments: 0,
          outstanding_balance: 34800,
        },
      },
    },
  });

  // ── 5. Análises ──────────────────────────────────────────────────────────────
  console.log("Criando análises...");

  await prisma.analysis.create({
    data: {
      asset_id: ativoHot1.id,
      lead_id: leadHot1.id,
      analyst_user_id: agenteAnalista.id,
      structural_score: 8,
      engine_score: 9,
      paint_score: 7,
      interior_score: 8,
      general_notes: "Veículo em boas condições gerais. Pequenas marcas na lataria lateral esquerda. Motor sem ruídos anormais. Recomenda-se vistoria cautelar antes de receber.",
      fipe_value: 78500,
      market_value: 70000,
      difference_fipe: 8500,
      total_debt_estimated: 72800,
      bank_profile: "NEGOCIÁVEL",
      recommendation: "Proposta realista 50% OFF = R$ 36.400. Aquisição abaixo de 55% FIPE. Destino sugerido: ÁGIO.",
      verdict: "APROVADO",
      ready_for_committee: true,
    },
  });

  await prisma.legalAnalysis.create({
    data: {
      asset_id: ativoHot1.id,
      lead_id: leadHot1.id,
      analyst_user_id: agenteAnalista.id,
      criminal_records_checked: true,
      civil_lawsuits_checked: true,
      vehicle_restrictions_checked: true,
      cnh_status_checked: true,
      renajud_checked: true,
      risk_level: "MEDIO",
      legal_notes: "4 parcelas em atraso. Risco de busca e apreensão é real. Verificar se há notificação judicial em andamento antes de prosseguir. Exigir comprovante de quitação dos atrasos ou trabalhar com urgência.",
      recommendation: "PROSSEGUIR",
    },
  });

  await prisma.analysis.create({
    data: {
      asset_id: ativoMarket.id,
      lead_id: leadWon.id,
      analyst_user_id: agenteAnalista.id,
      structural_score: 9,
      engine_score: 9,
      paint_score: 8,
      interior_score: 9,
      general_notes: "Veículo em ótimas condições. Manutenção em dia comprovada. FIPE R$ 71.000. Proposta realista aceita em R$ 34.800 (49% FIPE). Margem ampla.",
      fipe_value: 71000,
      market_value: 65000,
      difference_fipe: 6000,
      total_debt_estimated: 34800,
      bank_profile: "NEGOCIÁVEL",
      recommendation: "Operação aprovada. Captado por R$ 34.800. Destino ÁGIO — venda estimada em R$ 55.000.",
      verdict: "APROVADO",
      ready_for_committee: true,
    },
  });

  // ── 6. Decisões de destino ──────────────────────────────────────────────────
  await prisma.destinationDecision.create({
    data: {
      asset_id: ativoMarket.id,
      decided_by_user_id: mizza.id,
      decision: "AGIO",
      justification: "Captado abaixo de 50% FIPE. Margem de saída estimada de 20%+ no ágio.",
      target_value: 55000,
      decided_at: new Date(),
      next_action: "Publicar no marketplace interno e acionar rede de compradores.",
    },
  });

  // ── 7. Publicação no Marketplace ─────────────────────────────────────────────
  console.log("Criando publicações...");

  const pubKicks = await prisma.publication.create({
    data: {
      account_id: diecar.id,
      asset_id: ativoMarket.id,
      published_by_user_id: mizza.id,
      title: "Nissan Kicks 2021 — Repasse Direto DIECAR",
      description: "Kicks 2021 preto, 45.000 km, cautelar 100% aprovado, documentação ok. Captado abaixo da FIPE. Ideal para lojistas ou repassadores. Aceita proposta.",
      asking_price: 54900,
      highlight_details: "FIPE R$71k | Km baixo | Cautelar ok | Pronto pra transferir",
      visibility: "PUBLIC",
      status: "ACTIVE",
      published_at: new Date(),
    },
  });

  // ── 8. Tarefas operacionais ──────────────────────────────────────────────────
  console.log("Criando tarefas...");

  await prisma.task.create({
    data: {
      account_id: diecar.id,
      title: "URGENTE: Verificar busca e apreensão — Ricardo Tavares (Creta)",
      description: "Lead com 4 parcelas em atraso. Confirmar se há processo judicial em andamento. Contatar Santander.",
      priority: "HIGH",
      status: "PENDING",
      user_id: mizza.id,
      lead_id: leadHot1.id,
      asset_id: ativoHot1.id,
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.create({
    data: {
      account_id: diecar.id,
      title: "URGENTE: Contato imediato — Fernanda Rocha (Polo)",
      description: "3 parcelas em atraso no Itaú. Risco alto de busca. Ligar agora.",
      priority: "HIGH",
      status: "PENDING",
      user_id: mizza.id,
      lead_id: leadHot2.id,
      asset_id: ativoHot2.id,
      due_date: new Date(Date.now() + 4 * 60 * 60 * 1000),
    },
  });

  await prisma.task.create({
    data: {
      account_id: diecar.id,
      title: "Agendar vistoria cautelar — Creta GHT3F45",
      description: "Análise aprovada em comitê. Acionar parceiro de vistoria antes de receber o veículo.",
      priority: "MEDIUM",
      status: "PENDING",
      user_id: mizza.id,
      lead_id: leadHot1.id,
      asset_id: ativoHot1.id,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.create({
    data: {
      account_id: diecar.id,
      title: "Follow-up 48h — Carlos Eduardo Lima (Compass)",
      description: "Lead WARM não respondeu ontem. Segundo contato.",
      priority: "MEDIUM",
      status: "PENDING",
      user_id: agenteSDR.id,
      lead_id: leadWarm1.id,
      due_date: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  });

  // ── 9. Conta compradora para negociação ─────────────────────────────────────
  console.log("Criando negociação de demonstração...");

  const contaComprador = await prisma.account.create({
    data: {
      name: "Loja Central Seminovos",
      status: "ACTIVE",
      plan_type: "STARTER",
      city: "São Paulo",
      state: "SP",
    },
  });

  const userComprador = await prisma.user.create({
    data: {
      account_id: contaComprador.id,
      name: "João Comprador",
      email: "joao@lojacentral.com.br",
      password: senhaDefault,
      role: "admin",
    },
  });

  const negociacao = await prisma.negotiation.create({
    data: {
      publication_id: pubKicks.id,
      proponent_account_id: contaComprador.id,
      proponent_user_id: userComprador.id,
      current_value: 52000,
      status: "OPEN",
    },
  });

  await prisma.negotiationMessage.createMany({
    data: [
      {
        negotiation_id: negociacao.id,
        user_id: userComprador.id,
        content: "Olá! Vi o Kicks no marketplace. Aceita R$ 52.000 à vista? Posso buscar amanhã.",
        message_type: "PROPOSAL",
        proposal_value: 52000,
      },
      {
        negotiation_id: negociacao.id,
        user_id: mizza.id,
        content: "Oi! O mínimo que consigo fazer é R$ 54.500 à vista. Veículo está impecável, cautelar aprovado. O que acha?",
        message_type: "TEXT",
      },
    ],
  });

  // ── 10. Registros financeiros ─────────────────────────────────────────────
  console.log("Criando registros financeiros...");

  await prisma.financialRecord.createMany({
    data: [
      {
        account_id: diecar.id,
        asset_id: ativoMarket.id,
        type: "EXPENSE",
        category: "AQUISICAO",
        description: "Pagamento ao cedente — Nissan Kicks EVN9J55",
        amount: 12000,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        account_id: diecar.id,
        asset_id: ativoMarket.id,
        type: "EXPENSE",
        category: "QUITACAO",
        description: "Quitação financiamento Itaú — Nissan Kicks",
        amount: 32000,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        account_id: diecar.id,
        asset_id: ativoMarket.id,
        type: "EXPENSE",
        category: "OPERACAO",
        description: "Vistoria cautelar + rastreador — Kicks",
        amount: 850,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // ── Resultado final ──────────────────────────────────────────────────────────
  console.log("\n=== SEED CONCLUÍDO COM SUCESSO ===");
  console.log("\nACESSO AO SISTEMA:");
  console.log("  URL:   http://localhost:3000");
  console.log("  Email: mizza@diecar.com.br");
  console.log("  Senha: @admin123");
  console.log("\nDADOS CRIADOS:");
  console.log("  • 1 conta DIECAR");
  console.log("  • 3 usuários (Mizza admin, SDR IA, Analista IA)");
  console.log("  • 8 leads (2 HOT, 2 WARM, 2 COLD/NEW, 1 WON)");
  console.log("  • 4 ativos (COMMITTEE x2, MARKETPLACE x1, SCREENING x1)");
  console.log("  • 2 análises completas com scores");
  console.log("  • 1 análise jurídica");
  console.log("  • 1 decisão de destino (ÁGIO)");
  console.log("  • 1 publicação no marketplace");
  console.log("  • 1 negociação em andamento com 2 mensagens");
  console.log("  • 4 tarefas (2 urgentes, 2 médias)");
  console.log("  • 3 registros financeiros");
  console.log("=====================================\n");
}

main()
  .catch((e) => {
    console.error("ERRO NO SEED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
