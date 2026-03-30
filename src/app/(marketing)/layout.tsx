import { MarketingHeader } from "@/components/layout/marketing-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grain min-h-screen flex flex-col bg-pj-midnight">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-pj-slate/30 py-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center text-sm text-pj-silver/50">
          <p>&copy; {new Date().getFullYear()} PointsAware. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
