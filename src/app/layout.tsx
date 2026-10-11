import type { Metadata } from "next";
import { Anuphan } from "next/font/google";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { HealthProvider } from "@/components/health-provider";
import { ThemeRegistry } from "@/components/theme-registry";
import "./globals.css";

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-anuphan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ครอบครัวสุขภาพ",
  description: "บันทึกประวัติสุขภาพคนในครอบครัว",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${anuphan.variable} h-full`}>
      <body className={`${anuphan.className} min-h-full antialiased`}>
        <ThemeRegistry>
          <AppShell>
            <Suspense fallback={null}>
              <HealthProvider>{children}</HealthProvider>
            </Suspense>
          </AppShell>
        </ThemeRegistry>
      </body>
    </html>
  );
}
