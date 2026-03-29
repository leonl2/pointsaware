"use client";

import { AvailabilityCalendar } from "./availability-calendar";
import { useRouter } from "next/navigation";
import type { CabinClass } from "@/lib/types/flight";

export function CalendarSection({
  origin,
  destination,
  cabin,
}: {
  origin: string;
  destination: string;
  cabin: CabinClass;
}) {
  const router = useRouter();

  const handleSelectDate = (date: string) => {
    const params = new URLSearchParams({
      origin,
      destination,
      departureStart: date,
      departureEnd: date,
      cabins: cabin,
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="animate-fade-up stagger-3">
      <h2 className="text-xl font-serif font-semibold text-pj-cream mb-4">
        Availability Calendar
      </h2>
      <AvailabilityCalendar
        origin={origin}
        destination={destination}
        cabin={cabin}
        onSelectDate={handleSelectDate}
      />
    </div>
  );
}
