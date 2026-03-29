export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface FlightDeal {
  id: string;
  source: string;
  origin: string;
  destination: string;
  airline: string;
  operatingAirline: string | null;
  flightNumber: string | null;
  cabinClass: CabinClass;
  rawCabinClass: string | null;
  departureAt: Date;
  arrivalAt: Date;
  pointsPrice: number;
  cashCopay: number | null;
  program: string;
  sourcePrograms: string[] | null;
  seatsRemaining: number | null;
  equipment: string | null;
  isDirect: boolean;
  duration: number | null;
  fetchedAt: Date;
}

export interface FlightSearchParams {
  origin: string;
  destination?: string;
  departureStart: string; // YYYY-MM-DD
  departureEnd: string;
  cabinClasses: CabinClass[];
  passengers?: number;
  maxPoints?: number;
  programs?: string[];
}

export interface TransferOption {
  sourceProgram: string;
  sourceProgramName: string;
  targetProgram: string;
  targetProgramName: string;
  pointsNeeded: number;
  transferRatio: number;
  transferTime: string | null;
  userBalance: number;
  remainingAfterTransfer: number;
  canAfford: boolean;
}

export interface FlightDealWithTransfers extends FlightDeal {
  transferOptions: TransferOption[];
  bestOption: TransferOption | null;
}

export interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
}
