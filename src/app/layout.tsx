import type { Metadata } from "next";
import { Big_Shoulders, Quicksand } from "next/font/google";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Zigyzoo — Tu mundo infantil",
  description:
    "Ropa infantil con calidez y estilo. Descubrí nuestra tienda y vestí a los más chicos con Zigyzoo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${quicksand.variable} ${bigShoulders.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-24 font-sans sm:pb-20">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
