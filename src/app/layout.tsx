import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { MobileErrorBoundary } from "@/components/ui/mobile-error-boundary";

import { MobilePerformanceInitializer } from "@/components/ui/mobile-performance-initializer";
import { ServiceWorkerRegister } from "@/components/ui/service-worker-register";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Triton Tory Media - UC San Diego's Premier Student Media",
  description: "The comprehensive voice of UC San Diego featuring news, videos, research, and legal analysis",
  keywords: ["UCSD", "UC San Diego", "student media", "campus news", "triton"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

export const manifest = "/manifest.json";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        <MobileErrorBoundary>
          <AuthProvider>
            <MobilePerformanceInitializer />
            <ServiceWorkerRegister />
            <Navigation />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </MobileErrorBoundary>
      </body>
    </html>
  );
}
