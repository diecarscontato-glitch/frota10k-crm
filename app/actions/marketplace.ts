"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function publishAsset(data: {
  asset_id: string;
  title: string;
  description: string;
  asking_price: number;
  highlight_details?: string;
  visibility?: "PUBLIC" | "PRIVATE";
}) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const publication = await db.publication.create({
    data: {
      account_id: userData.accountId,
      asset_id: data.asset_id,
      published_by_user_id: userData.id,
      title: data.title,
      description: data.description,
      asking_price: data.asking_price,
      highlight_details: data.highlight_details,
      visibility: data.visibility || "PUBLIC",
      status: "ACTIVE",
    },
  });

  await db.asset.update({
    where: { id: data.asset_id },
    data: { status: "MARKETPLACE" },
  });

  revalidatePath(`/assets/${data.asset_id}`);
  revalidatePath("/marketplace");
  revalidatePath("/publications");
  return publication;
}

export async function getMarketplaceFeed(filters?: {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  destination?: string;
  page?: number;
}) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const PAGE_SIZE = 12;
  const page = Math.max(1, filters?.page || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: any = {
    status: "ACTIVE",
    visibility: "PUBLIC",
    ...(filters?.type && { asset: { type: filters.type } }),
    ...(filters?.minPrice !== undefined || filters?.maxPrice !== undefined
      ? {
          asking_price: {
            ...(filters?.minPrice !== undefined && { gte: filters.minPrice }),
            ...(filters?.maxPrice !== undefined && { lte: filters.maxPrice }),
          },
        }
      : {}),
    ...(filters?.search && {
      title: { contains: filters.search, mode: "insensitive" },
    }),
  };

  const [publications, total] = await Promise.all([
    db.publication.findMany({
      where,
      include: {
        asset: {
          include: {
            financing: true,
            analyses: {
              orderBy: { created_at: "desc" },
              take: 1,
            },
          },
        },
        account: {
          select: { name: true },
        },
        _count: {
          select: { interests: true },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.publication.count({ where }),
  ]);

  return { publications, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getMyPublications() {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const publications = await db.publication.findMany({
    where: { account_id: userData.accountId },
    include: {
      asset: true,
      _count: { select: { interests: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return publications;
}

export async function togglePublicationStatus(id: string, currentStatus: string) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

  const publication = await db.publication.update({
    where: { id, account_id: userData.accountId },
    data: { status: newStatus },
  });

  revalidatePath("/publications");
  return publication;
}

export async function getPublicationById(id: string) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const publication = await db.publication.findUnique({
    where: { id },
    include: {
      asset: {
        include: {
          financing: true,
          analyses: {
            orderBy: { created_at: "desc" },
            take: 1,
          },
        },
      },
      account: { select: { name: true } },
      _count: { select: { interests: true } },
    },
  });

  return publication;
}

export async function manifestInterest(publicationId: string) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string } | undefined;

  if (!userData?.accountId) {
    throw new Error("Não autorizado");
  }

  const accountId = userData.accountId;
  const userId = userData.id;

  const existingInterest = await db.interest.findFirst({
    where: { publication_id: publicationId, account_id: accountId },
  });

  if (existingInterest) {
    const negotiation = await db.negotiation.findFirst({
      where: { publication_id: publicationId, proponent_account_id: accountId },
    });
    return { interest: existingInterest, negotiation };
  }

  const interest = await db.interest.create({
    data: {
      publication_id: publicationId,
      account_id: accountId,
      user_id: userId,
      status: "PENDING",
    },
  });

  const negotiation = await db.negotiation.create({
    data: {
      publication_id: publicationId,
      proponent_account_id: accountId,
      proponent_user_id: userId,
      status: "OPEN",
    },
  });

  const publication = await db.publication.findUnique({
    where: { id: publicationId },
    select: { account_id: true, title: true },
  });

  if (publication) {
    const ownerAdmin = await db.user.findFirst({
      where: { account_id: publication.account_id, role: "account_admin" },
    });

    if (ownerAdmin) {
      await db.notification.create({
        data: {
          account_id: publication.account_id,
          user_id: ownerAdmin.id,
          type: "INTEREST",
          title: "Novo Interesse!",
          message: `Alguém manifestou interesse em seu anúncio: ${publication.title}`,
          link: `/negotiations/${negotiation.id}`,
        },
      });
    }
  }

  revalidatePath(`/marketplace/${publicationId}`);
  revalidatePath("/negotiations");
  revalidatePath("/notifications");
  return { interest, negotiation };
}
