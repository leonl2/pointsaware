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
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#d4a853",
          colorBackground: "#0f1729",
          colorInputBackground: "#162036",
          colorInputText: "#e8dcc8",
          colorText: "#e8dcc8",
          colorTextSecondary: "#94a3b8",
          colorNeutral: "#ffffff",
          colorDanger: "#e8586d",
          borderRadius: "0.625rem",
        },
        elements: {
          // Card / popover containers
          card: {
            backgroundColor: "#0f1729",
            border: "1px solid #1e2d4a",
          },
          // Sign-in / sign-up form elements
          headerTitle: { color: "#e8dcc8" },
          headerSubtitle: { color: "#94a3b8" },
          socialButtonsBlockButtonText: { color: "#e8dcc8" },
          dividerText: { color: "#94a3b8" },
          dividerLine: { borderColor: "#1e2d4a" },
          formFieldLabel: { color: "#c8d4e6" },
          footerActionText: { color: "#94a3b8" },
          footerActionLink: { color: "#d4a853" },
          // UserButton popover
          userButtonPopoverCard: {
            backgroundColor: "#0f1729",
            border: "1px solid #1e2d4a",
          },
          userButtonPopoverActionButton: { color: "#e8dcc8" },
          userButtonPopoverActionButtonText: { color: "#e8dcc8" },
          userButtonPopoverActionButtonIcon: { color: "#94a3b8" },
          userButtonPopoverFooter: { color: "#94a3b8" },
          userPreviewMainIdentifier: { color: "#e8dcc8" },
          userPreviewSecondaryIdentifier: { color: "#94a3b8" },
          // User profile modal
          navbar: { backgroundColor: "#0a1020", borderColor: "#1e2d4a" },
          navbarButton: { color: "#e8dcc8" },
          navbarButtonIcon: { color: "#94a3b8" },
          pageScrollBox: { backgroundColor: "#0f1729" },
          profileSection: { borderColor: "#1e2d4a" },
          profileSectionTitle: { color: "#e8dcc8", borderColor: "#1e2d4a" },
          profileSectionTitleText: { color: "#e8dcc8" },
          profileSectionContent: { color: "#c8d4e6" },
          profileSectionPrimaryButton: { color: "#d4a853" },
          accordionTriggerButton: { color: "#e8dcc8" },
          accordionContent: { color: "#c8d4e6" },
          // Modals / generic
          modalCloseButton: { color: "#94a3b8" },
          formButtonPrimary: {
            backgroundColor: "#d4a853",
            color: "#080e1e",
          },
          badge: { color: "#e8dcc8", backgroundColor: "#1e2d4a" },
          menuButton: { color: "#e8dcc8" },
          menuList: { backgroundColor: "#0f1729", borderColor: "#1e2d4a" },
          menuItem: { color: "#e8dcc8" },
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
