import React from "react";
import { getMyPublications } from "@/app/actions/marketplace";
import { 
  Megaphone, 
  Filter, 
  Car, 
  Bike, 
  Users, 
  BadgeDollarSign,
  PauseCircle,
  PlayCircle,
  Eye
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyPublicationsPage() {
  const publications = await getMyPublications();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Minhas Publicações</h1>
          <p className="text-slate-400 mt-1">
            Gerencie seus ativos que estão expostos no marketplace.
          </p>
        </div>
        <Link href="/assets">
          <Button className="bg-slate-800 hover:bg-slate-700 text-white gap-2 border border-slate-700">
            <Filter className="w-4 h-4" />
            Filtrar Ativos Pronto/Qualificados
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card className="bg-slate-900/40 border-slate-800 p-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Publicações Ativas</p>
            <p className="text-2xl font-bold text-emerald-500">{publications.filter((p: any) => p.status === 'ACTIVE').length}</p>
         </Card>
         <Card className="bg-slate-900/40 border-slate-800 p-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total de Ofertas</p>
            <p className="text-2xl font-bold text-blue-500">0</p>
         </Card>
         <Card className="bg-slate-900/40 border-slate-800 p-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Interessados ( Leads )</p>
            <p className="text-2xl font-bold text-white">
              {publications.reduce((acc: any, p: any) => acc + (p._count?.interests || 0), 0)}
            </p>
         </Card>
         <Card className="bg-slate-900/40 border-slate-800 p-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Conversão ( % )</p>
            <p className="text-2xl font-bold text-slate-400">--</p>
         </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {publications.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
             <Megaphone className="w-12 h-12 mb-4 opacity-20" />
             <p className="text-lg">Você ainda não publicou nenhum ativo.</p>
             <p className="text-sm">Vá até o menu de Ativos, selecione um veículo qualificado e publique-o.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {publications.map((pub: any) => (
              <Card key={pub.id} className={cn(
                "bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all overflow-hidden",
                pub.status === "PAUSED" && "opacity-75"
              )}>
                <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                  <div className="w-full md:w-48 h-32 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 relative">
                     {pub.asset.type === "CAR" ? <Car className="w-12 h-12 text-slate-600" /> : <Bike className="w-12 h-12 text-slate-600" />}
                     <div className={cn(
                       "absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                       pub.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                     )}>
                        {pub.status === "ACTIVE" ? "No Ar" : "Pausado"}
                     </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                     <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{pub.title}</h3>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{pub.asset.brand} {pub.asset.model}</span>
                     </div>
                     <p className="text-sm text-slate-400 line-clamp-2">{pub.description}</p>
                     
                     <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                           <BadgeDollarSign className="w-4 h-4 text-emerald-500" />
                           Pedida: <span className="text-white font-bold">R$ {pub.asking_price?.toLocaleString() || "---"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                           <Users className="w-4 h-4 text-blue-500" />
                           <span className="text-white font-bold">{pub._count?.interests || 0}</span> interessados
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs text-uppercase font-bold tracking-tight">
                           Visualização: <span className="text-white">{pub.visibility === 'PUBLIC' ? 'Marketplace' : 'Privada'}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto">
                     <Link href={`/marketplace/${pub.id}`}>
                        <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 gap-2">
                           <Eye className="w-4 h-4" />
                           Ver Online
                        </Button>
                     </Link>
                     <Button 
                       variant="ghost" 
                       className="w-full text-slate-500 hover:text-white gap-2"
                     >
                        {pub.status === "ACTIVE" ? (
                          <>
                            <PauseCircle className="w-4 h-4 text-amber-500" />
                            Pausar Anúncio
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4 text-emerald-500" />
                            Reativar
                          </>
                        )}
                     </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
