"use server";

const BRASIL_API = "https://brasilapi.com.br/api/fipe";

export async function getFipeMarcas() {
  const res = await fetch(`${BRASIL_API}/marcas/v1/carros`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Erro ao buscar marcas FIPE");
  const data = await res.json();
  return data as { nome: string; valor: string }[];
}

export async function getFipeModelos(codigoMarca: string) {
  const res = await fetch(`${BRASIL_API}/marcas/v1/carros/${codigoMarca}/modelos`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Erro ao buscar modelos FIPE");
  const data = await res.json();
  return data as { nome: string; valor: number }[];
}

export async function getFipeAnos(codigoMarca: string, codigoModelo: string) {
  const res = await fetch(
    `${BRASIL_API}/marcas/v1/carros/${codigoMarca}/modelos/${codigoModelo}/anos`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error("Erro ao buscar anos FIPE");
  const data = await res.json();
  return data as { nome: string; valor: string }[];
}

export async function getFipeValor(
  codigoMarca: string,
  codigoModelo: string,
  codigoAno: string
) {
  const res = await fetch(
    `${BRASIL_API}/marcas/v1/carros/${codigoMarca}/modelos/${codigoModelo}/anos/${codigoAno}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error("Erro ao buscar valor FIPE");
  const data = await res.json();
  // BrasilAPI retorna valor como "R$ 45.000,00" — converter para number
  const valorStr: string = (data as any).valor || "R$ 0,00";
  const valorNum = parseFloat(
    valorStr.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
  );
  return {
    valor: valorNum,
    marca: (data as any).marca as string,
    modelo: (data as any).modelo as string,
    anoModelo: (data as any).anoModelo as number,
    mesReferencia: (data as any).mesReferencia as string,
    valorRaw: valorStr,
  };
}
