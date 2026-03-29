import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Source_Serif_4, Outfit, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PointsAware - Find the Best Award Flights",
    template: "%s | PointsAware",
  },
  description:
    "Search, track, and find the cheapest business & first class flights using your credit card reward points. Optimize Chase UR and Amex MR transfers. PointsAware helps you maximize every point.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#d4a853",
          colorBackground: "#0f1729",
          colorInputBackground: "#162036",
          colorInputText: "#e8dcc8",
        },
      }}
    >
      <html
        lang="en"
        className={`${outfit.variable} ${sourceSerif.variable} ${jetbrains.variable} dark h-full antialiased`}
      >
        <body className="min-h-full flex flex-col font-sans bg-pj-midnight text-pj-cream">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
