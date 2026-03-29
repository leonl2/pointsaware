import { SearchForm } from "@/components/flights/search-form";
import { SearchResults } from "@/components/flights/search-results";
import { CalendarSection } from "@/components/flights/calendar-section";
import { Suspense } from "react";

export const metadata = { title: "Search Flights" };

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="space-y-10">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-pj-cream">
          Search Award Flights
        </h1>
        <p className="text-pj-silver mt-1">
          Find the best business & first class redemptions for your points.
        </p>
      </div>

      <div className="animate-fade-up stagger-1">
        <SearchForm />
      </div>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResultsWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchResultsWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  if (!params.origin) return null;
  return (
    <>
      <SearchResults params={params} />
      {params.destination && (
        <CalendarSection
          origin={params.origin}
          destination={params.destination}
          cabin={(params.cabins?.split(",")[0] as "business" | "first") ?? "business"}
        />
      )}
    </>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 rounded-xl bg-pj-navy border border-pj-slate/40 animate-pulse"
        />
      ))}
    </div>
  );
}
