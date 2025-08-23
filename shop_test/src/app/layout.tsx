import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { ThemeProvider } from "@/components/provider/theme-provider";
import { Chat } from "@/components/shared/Chat";
import { Footer } from "@/components/shared/footer";
import ManageToolsAction from "@/components/shared/ManageToolsAction";
import { Navigation } from "@/components/shared/navigation";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/cart-context";
import { TRPCReactProvider } from "@/trpc/react";
import SendContextToAi from "@/components/shared/SendContextToAi";

export const metadata: Metadata = {
  title: "YupStore - Premium E-commerce Experience",
  description:
    "Discover amazing products with our curated selection of premium items.",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      suppressHydrationWarning
      suppressContentEditableWarning
      lang="en"
      className={`${geist.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Navigation />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Chat />
              <Toaster />
              <ManageToolsAction />
              <SendContextToAi />
            </CartProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
