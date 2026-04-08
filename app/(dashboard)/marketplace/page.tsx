import React from "react";
import { getMarketplaceFeed } from "@/app/actions/marketplace";
import {
  Car,
  Bike,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  Building2,
  Info,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarketplaceTabs } from "@/components/marketplace-tabs";
import { MyPublicationsTab } from "@/components/my-publications-tab";
import { MarketplaceFilters } from "@/components/marketplace-filters";

export const dynamic = "force-dynamic";

const fmt = (v: number | null | undefined) =>
  v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v) : "R$ --";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams?: { search?: string; type?: string; destination?: string; minPrice?: string; maxPrice?: string; page?: string };
}) {
  const { publications, total, page, totalPages } = await getMarketplaceFeed({
    search: searchParams?.search,
    type: searchParams?.type,
    destination: searchParams?.destination,
    minPrice: searchParams?.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams?.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    page: searchParams?.page ? parseInt(searchParams.page) : 1,
  });

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set("page", String(p));
    return `/marketplace?${params.toString()}`;
  };

  const feedContent = (
    <>
      <MarketplaceFilters />

      {total > 0 && (
        <p className="text-xs text-slate-500">
          {total} oportunidade{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
          {totalPages > 1 && ` — página ${page} de ${totalPages}`}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {publications.length === 0 ? (
          <div className="col-span-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
            <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">Nenhuma oferta encontrada.</p>
            <p className="text-sm">Tente ajustar os filtros.</p>
          </div>
        ) : (
          publications.map((pub: any) => {
            const analysis = pub.asset?.analyses?.[0];
            const fipeValue = pub.asset?.fipe_value || analysis?.fipe_value;
            const interestCount = pub._count?.interests ?? 0;

            return (
              <Card key={pub.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row overflow-hidden group">
                <div className="w-full md:w-64 h-48 md:h-auto bg-slate-800 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 relative">
                  {pub.asset?.type === "CAR" ? (
                    <Car className="w-16 h-16 text-slate-700 group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <Bike className="w-16 h-16 text-slate-700 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    {pub.asset?.type === "CAR" ? "Carro" : pub.asset?.type ?? "Veículo"}
                  </div>
                  {interestCount > 0 && (
                    <div className="absolute top-4 right-4 bg-amber-500/90 px-2 py-1 rounded text-[10px] font-bold text-amber-950">
                      {interestCount} interesse{interestCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <CardHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {pub.account?.name || "Empresa"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">#{pub.id?.slice(-6).toUpperCase()}</p>
                    </div>
                    <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">
                      {pub.title || "Oferta"}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 pt-2 flex-1 space-y-4">
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">
                      &quot;{pub.description}&quot;
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">{pub.asset?.year || "---"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">--</span>
                      </div>
                    </div>

                    {fipeValue && (
                      <div className="text-[11px] text-slate-400 flex justify-between">
                        <span>FIPE: <span className="text-slate-300 font-semibold">{fmt(fipeValue)}</span></span>
                        {analysis?.verdict && (
                          <span className={
                            analysis.verdict === "APROVADO" ? "text-emerald-400 font-bold" :
                            analysis.verdict === "NEGOCIAR" ? "text-amber-400 font-bold" :
                            "text-red-400 font-bold"
                          }>{analysis.verdict}</span>
                        )}
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-800 flex items-end justify-between">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tight mb-0.5">Valor do Ágio</p>
                        <p className="text-2xl font-black text-white">{fmt(pub.asking_price)}</p>
                      </div>
                      {pub.asset?.financing && (
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight mb-0.5">Saldo para Quitação</p>
                          <p className="text-xs font-bold text-slate-300">{fmt(pub.asset.financing.outstanding_balance)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-0 border-t border-slate-800">
                    <Link href={`/marketplace/${pub.id}`} className="w-full">
                      <Button variant="ghost" className="w-full flex items-center justify-center gap-2 py-6 text-xs font-bold text-blue-400 hover:text-white hover:bg-blue-600 transition-all uppercase tracking-widest rounded-none">
                        Analisar Oportunidade
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          {page > 1 && (
            <Link href={buildPageUrl(page - 1)}>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 gap-1">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>
            </Link>
          )}
          <span className="text-sm text-slate-400">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={buildPageUrl(page + 1)}>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 gap-1">
                Próxima <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
        <Info className="w-5 h-5 text-blue-500" />
        <p className="text-xs text-blue-200/60">
          Todas as oportunidades listadas passam pelo comitê de triagem da plataforma para garantir a saúde técnica e financeira do ativo.
        </p>
      </div>
    </>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Marketplace Privado</h1>
          <p className="text-slate-400 mt-1">
            Explore oportunidades qualificadas de ágio e repasse na rede FROTA10K.
          </p>
        </div>
      </div>

      <MarketplaceTabs
        feedContent={feedContent}
        myPublicationsContent={<MyPublicationsTab />}
      />
    </div>
  );
}
