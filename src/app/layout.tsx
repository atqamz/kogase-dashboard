import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { ApiMonitor } from "@/components/api-monitor";
import { ErrorHandler } from "@/components/error-handler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kogase Dashboard",
  description: "Dashboard for Kogase Engine - Game Backend as a Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            <ApiMonitor />
            <ErrorHandler />
          </AuthProvider>
        </ThemeProvider>
        <ApiMonitor />
      </body>
    </html>
  );
}