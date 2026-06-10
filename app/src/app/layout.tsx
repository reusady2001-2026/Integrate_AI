import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Heebo, David_Libre } from "next/font/google";
import { FontLoader } from "@/components/FontLoader";
import "./globals.css";

const body = David_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

const ui = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ui",
  display: "swap",
});

const display = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Integrate AI",
  description: "Organizational analysis & restructuring — fill, edit, export.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${body.variable} ${ui.variable} ${display.variable}`}>
      <body>
        <FontLoader />
        {children}
      </body>
    </html>
  );
}
