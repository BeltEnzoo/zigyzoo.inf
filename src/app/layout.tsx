import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
      <body className="flex min-h-full min-w-0 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] font-sans antialiased sm:pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
