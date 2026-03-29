import { DealsFeed } from "@/components/dashboard/deals-feed";

export const metadata = { title: "Top Deals" };

const regions = ["All Destinations", "Asia", "Europe", "Middle East", "Oceania"];

export default function DealsPage() {
  return (
    <div className="space-y-10">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-pj-cream">
          Top Deals
        </h1>
        <p className="text-pj-silver mt-1">
          The best business & first class award availability right now.
        </p>
      </div>
      <div className="animate-fade-up stagger-1 flex gap-2 flex-wrap">
        {regions.map((region, i) => (
          <button
            key={region}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              i === 0
                ? "bg-pj-gold/15 text-pj-gold border-pj-gold/30"
                : "bg-pj-navy text-pj-silver border-pj-slate hover:border-pj-steel hover:text-pj-cream"
            }`}
          >
            {region}
          </button>
        ))}
      </div>
      <div className="animate-fade-up stagger-2">
        <DealsFeed />
      </div>
    </div>
  );
}
