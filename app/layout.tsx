import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Bagel_Fat_One, Caveat, Pacifico, Quicksand } from "next/font/google";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pacifico",
});

const bagel = Bagel_Fat_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bagel-fat-one",
});

const quicksand = Quicksand({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "optional",
  variable: "--font-quicksand",
});

const caveat = Caveat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Manabooks",
  description: "Tu registro de lectura personal",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#FBD3E9",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${pacifico.variable} ${bagel.variable} ${quicksand.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
