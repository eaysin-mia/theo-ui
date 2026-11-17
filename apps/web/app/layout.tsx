import { Geist_Mono, Inter } from "next/font/google";

import "@workspace/ui/globals.css";
import {
  AnchoredToastProvider,
  ToastProvider,
} from "@workspace/ui/components/toast";
import { AppAuthProvider } from "@/components/auth-provider";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@workspace/ui/lib/utils";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontMono.variable)}
    >
      <body
        className="min-h-screen bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              <AnchoredToastProvider>
                <AppAuthProvider>{children}</AppAuthProvider>
              </AnchoredToastProvider>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
