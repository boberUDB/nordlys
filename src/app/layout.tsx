import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nordlys — Estudio de diseño e ingeniería",
  description:
    "Nordlys es un estudio pequeño de diseño e ingeniería que construye sitios, productos y experiencias tridimensionales para marcas que quieren algo más difícil de copiar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <Nav />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
