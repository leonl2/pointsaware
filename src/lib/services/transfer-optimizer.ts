import {
  ALL_TRANSFER_PARTNERS,
  PROGRAM_NAMES,
  type TransferPartner,
} from "@/lib/constants/transfer-partners";
import type { TransferOption } from "@/lib/types/flight";
import type { ParsedAwardFlight } from "./seats-aero";

interface UserBalance {
  program: string; // 'chase_ur' | 'amex_mr'
  balance: number;
}

// Map seats.aero source names to our internal airline program IDs
const SOURCE_TO_PROGRAM: Record<string, string> = {
  united: "united_mileageplus",
  aeroplan: "air_canada_aeroplan",
  delta: "delta_skymiles",
  american: "american_aadvantage",
  alaska: "alaska_mileageplan",
  "british airways": "british_airways_avios",
  "air france": "air_france_klm_flying_blue",
  "flying blue": "air_france_klm_flying_blue",
  singapore: "singapore_krisflyer",
  ana: "ana_mileage_club",
  cathay: "cathay_pacific_asia_miles",
  emirates: "emirates_skywards",
  etihad: "etihad_guest",
  "virgin atlantic": "virgin_atlantic_flying_club",
  avianca: "avianca_lifemiles",
  lifemiles: "avianca_lifemiles",
  iberia: "iberia_avios",
  jetblue: "jetblue_trueblue",
  southwest: "southwest_rapid_rewards",
};

function normalizeProgram(source: string): string {
  const lower = source.toLowerCase().trim();
  return SOURCE_TO_PROGRAM[lower] ?? lower;
}

function findTransferPartners(airlineProgram: string): TransferPartner[] {
  return ALL_TRANSFER_PARTNERS.filter(
    (p) => p.airlineProgram === airlineProgram
  );
}

export function computeTransferOptions(
  flight: ParsedAwardFlight,
  userBalances: UserBalance[]
): TransferOption[] {
  const airlineProgram = normalizeProgram(flight.program);
  const partners = findTransferPartners(airlineProgram);

  const options: TransferOption[] = [];

  for (const partner of partners) {
    const balance = userBalances.find(
      (b) => b.program === partner.sourceProgram
    );
    if (!balance) continue;

    const pointsNeeded = Math.ceil(flight.pointsPrice / partner.transferRatio);
    const canAfford = pointsNeeded <= balance.balance;

    options.push({
      sourceProgram: partner.sourceProgram,
      sourceProgramName:
        PROGRAM_NAMES[partner.sourceProgram] ?? partner.sourceProgram,
      targetProgram: airlineProgram,
      targetProgramName: partner.airlineName,
      pointsNeeded,
      transferRatio: partner.transferRatio,
      transferTime: partner.transferTime,
      userBalance: balance.balance,
      remainingAfterTransfer: balance.balance - pointsNeeded,
      canAfford,
    });
  }

  // Sort: affordable first, then by points needed ascending
  options.sort((a, b) => {
    if (a.canAfford !== b.canAfford) return a.canAfford ? -1 : 1;
    return a.pointsNeeded - b.pointsNeeded;
  });

  return options;
}

export function getBestTransferOption(
  flight: ParsedAwardFlight,
  userBalances: UserBalance[]
): TransferOption | null {
  const options = computeTransferOptions(flight, userBalances);
  // Return cheapest affordable option, or cheapest overall if none affordable
  return options[0] ?? null;
}

export function enrichFlightsWithTransfers(
  flights: ParsedAwardFlight[],
  userBalances: UserBalance[]
): Array<ParsedAwardFlight & { transferOptions: TransferOption[]; bestOption: TransferOption | null }> {
  return flights.map((flight) => {
    const transferOptions = computeTransferOptions(flight, userBalances);
    return {
      ...flight,
      transferOptions,
      bestOption: transferOptions[0] ?? null,
    };
  });
}
