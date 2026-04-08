"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/permissions";

export async function getTeamMembers() {
  const session = await auth();
  const userData = session?.user as { accountId: string } | undefined;

  if (!userData?.accountId) throw new Error("Não autorizado");

  const users = await db.user.findMany({
    where: { account_id: userData.accountId },
    orderBy: { created_at: "asc" }
  });

  const invites = await db.invite.findMany({
    where: { 
      account_id: userData.accountId,
      status: "PENDING"
    },
    orderBy: { sent_at: "desc" }
  });

  return { users, invites };
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string; role?: string } | undefined;

  if (!userData?.accountId) throw new Error("Não autorizado");
  requirePermission(userData.role ?? "viewer", "*");

  const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  const user = await db.user.update({
    where: { id: userId, account_id: userData.accountId },
    data: { status: newStatus }
  });

  await createAuditLog({
    accountId: userData.accountId,
    actorUserId: userData.id,
    eventType: "USER_STATUS_UPDATE",
    targetEntityType: "USER",
    targetEntityId: userId,
    summary: `Status do usuário ${user.email} alterado para ${newStatus}`,
    severity: "WARNING"
  });

  revalidatePath("/team");
  return user;
}

export async function inviteMember(data: { name: string; email: string; role: string }) {
  const session = await auth();
  const userData = session?.user as { id: string; accountId: string; role?: string } | undefined;

  if (!userData?.accountId) throw new Error("Não autorizado");
  requirePermission(userData.role ?? "viewer", "*");

  const invite = await db.invite.create({
    data: {
      account_id: userData.accountId,
      invited_name: data.name,
      invited_email: data.email,
      role: data.role,
      invited_by_user_id: userData.id,
      status: "PENDING",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  await createAuditLog({
    accountId: userData.accountId,
    actorUserId: userData.id,
    eventType: "MEMBER_INVITED",
    targetEntityType: "USER",
    targetEntityId: invite.id,
    summary: `Convite enviado para ${data.email} (${data.role})`,
    severity: "INFO"
  });

  revalidatePath("/team");
  return invite;
}
