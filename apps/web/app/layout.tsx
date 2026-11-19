import { Geist_Mono, Inter } from "next/font/google";

import "./globals.css";
import { AnchoredToastProvider, ToastProvider } from "theoui/components/toast";
import { AppAuthProvider } from "@/components/auth-provider";
import { MotionProvider } from "@/components/motion-provider";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "theoui/lib/utils";

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
        className="relative min-h-screen bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        <div className="relative isolate flex min-h-svh flex-col">
          <MotionProvider>
            <ThemeProvider>
              <QueryProvider>
                <ToastProvider>
                  <AnchoredToastProvider>
                    <AppAuthProvider>{children}</AppAuthProvider>
                  </AnchoredToastProvider>
                </ToastProvider>
              </QueryProvider>
            </ThemeProvider>
          </MotionProvider>
        </div>
      </body>
    </html>
  );
}
