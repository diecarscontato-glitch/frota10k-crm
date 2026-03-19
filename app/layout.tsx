import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FROTA10K | Sistema de Gestão de Ativos Financiados",
  description: "Plataforma operacional para gestão de carros e motos financiados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("dark", "font-sans", geist.variable)} suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased")}>
        {children}
      </body>
    </html>
  );
}
