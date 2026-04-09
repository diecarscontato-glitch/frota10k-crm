import { DashboardShell } from "@/components/dashboard-shell";
import { UserCircle } from "lucide-react";
import { NotificationsCenter } from "@/components/notifications-center";
import { CommandSearch } from "@/components/command-search";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      {/* Top Header */}
      <header className="h-14 md:h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-20 shrink-0">
        <CommandSearch />

        <div className="flex items-center gap-2 md:gap-4">
          <NotificationsCenter />
          <div className="hidden sm:block h-8 w-[1px] bg-slate-800 mx-1 md:mx-2" />
          <div className="hidden sm:flex items-center gap-3 pl-1 md:pl-2">
            <div className="text-right flex flex-col">
              <span className="text-sm font-medium text-white">Administrador</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Conta Master</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8 custom-scrollbar">
        {children}
      </main>
    </DashboardShell>
  );
}
