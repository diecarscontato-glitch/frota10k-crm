const PERMISSIONS: Record<string, string[]> = {
  account_admin: ["*"],
  ANALISTA: ["analysis.write", "lead.decide", "lead.write", "lead.read", "asset.read"],
  SDR: ["lead.write", "lead.read", "asset.read"],
  viewer: ["lead.read", "asset.read"],
};

export function hasPermission(role: string, permission: string): boolean {
  const perms = PERMISSIONS[role] ?? PERMISSIONS["viewer"];
  return perms.includes("*") || perms.includes(permission);
}

export function requirePermission(role: string, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Sem permissão: ação '${permission}' requer perfil adequado.`);
  }
}
