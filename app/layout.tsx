import "./globals.css";
import { Cormorant_Garamond } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "@/lib/store";
import { LangProvider } from "@/lib/lang";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata = {
  title: "MERCI – Thời trang & Làm đẹp cao cấp",
  description: "Sneaker, thời trang, nước hoa, mỹ phẩm và trang sức chính hãng",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={cormorant.variable}>
      <body className="bg-black antialiased">
        <SessionProvider>
          <LangProvider>
            <StoreProvider>{children}</StoreProvider>
          </LangProvider>
        </SessionProvider>
      </body>
    </html>
  );
}