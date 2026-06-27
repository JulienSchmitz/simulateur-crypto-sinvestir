import type { Metadata } from "next";
import { Lexend, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: "variable",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "Simulateur DCA Crypto — S'investir",
  description:
    "Simulez un investissement programmé (DCA) ou unique (lump sum) en crypto à partir de données historiques.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${lexend.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
