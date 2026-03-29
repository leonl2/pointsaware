export interface TransferPartner {
  sourceProgram: "chase_ur" | "amex_mr";
  airlineProgram: string;
  airlineName: string;
  airlineCode: string;
  transferRatio: number; // 1.0 = 1:1
  transferTime: string;
}

export const PROGRAM_NAMES: Record<string, string> = {
  chase_ur: "Chase Ultimate Rewards",
  amex_mr: "Amex Membership Rewards",
};

// Chase Ultimate Rewards Transfer Partners
export const CHASE_UR_PARTNERS: TransferPartner[] = [
  {
    sourceProgram: "chase_ur",
    airlineProgram: "united_mileageplus",
    airlineName: "United MileagePlus",
    airlineCode: "UA",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "chase_ur",
    airlineProgram: "southwest_rapid_rewards",
    airlineName: "Southwest Rapid Rewards",
    airlineCode: "WN",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "chase_ur",
    airlineProgram: "british_airways_avios",
    airlineName: "British Airways Avios",
    airlineCode: "BA",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "chase_ur",
    airlineProgram: "air_france_klm_flying_blue",
    airlineName: "Air France/KLM Flying Blue",
    airlineCode: "AF",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "chase_ur",
    airlineProgram: "singapore_krisflyer",
    airlineName: "Singapore KrisFlyer",
    airlineCode: "SQ",
    transferRatio: 1.0,
    transferTime: "1-2 days",
  },
  {
    sourceProgram: "chase_ur",
    airlineProgram: "aer_lingus_avios",
    airlineName: "Aer Lingus AerClub",
    airlineCode: "EI",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "chase_ur",
    airlineProgram: "iberia_avios",
    airlineName: "Iberia Plus Avios",
    airlineCode: "IB",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "chase_ur",
    airlineProgram: "virgin_atlantic_flying_club",
    airlineName: "Virgin Atlantic Flying Club",
    airlineCode: "VS",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "chase_ur",
    airlineProgram: "emirates_skywards",
    airlineName: "Emirates Skywards",
    airlineCode: "EK",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "chase_ur",
    airlineProgram: "air_canada_aeroplan",
    airlineName: "Air Canada Aeroplan",
    airlineCode: "AC",
    transferRatio: 1.0,
    transferTime: "instant",
  },
];

// Amex Membership Rewards Transfer Partners
export const AMEX_MR_PARTNERS: TransferPartner[] = [
  {
    sourceProgram: "amex_mr",
    airlineProgram: "delta_skymiles",
    airlineName: "Delta SkyMiles",
    airlineCode: "DL",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "british_airways_avios",
    airlineName: "British Airways Avios",
    airlineCode: "BA",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "air_france_klm_flying_blue",
    airlineName: "Air France/KLM Flying Blue",
    airlineCode: "AF",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "singapore_krisflyer",
    airlineName: "Singapore KrisFlyer",
    airlineCode: "SQ",
    transferRatio: 1.0,
    transferTime: "1-2 days",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "ana_mileage_club",
    airlineName: "ANA Mileage Club",
    airlineCode: "NH",
    transferRatio: 1.0,
    transferTime: "2-3 days",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "air_canada_aeroplan",
    airlineName: "Air Canada Aeroplan",
    airlineCode: "AC",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "cathay_pacific_asia_miles",
    airlineName: "Cathay Pacific Asia Miles",
    airlineCode: "CX",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "emirates_skywards",
    airlineName: "Emirates Skywards",
    airlineCode: "EK",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "etihad_guest",
    airlineName: "Etihad Guest",
    airlineCode: "EY",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "hawaiian_miles",
    airlineName: "Hawaiian Miles",
    airlineCode: "HA",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "jetblue_trueblue",
    airlineName: "JetBlue TrueBlue",
    airlineCode: "B6",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "virgin_atlantic_flying_club",
    airlineName: "Virgin Atlantic Flying Club",
    airlineCode: "VS",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "avianca_lifemiles",
    airlineName: "Avianca LifeMiles",
    airlineCode: "AV",
    transferRatio: 1.0,
    transferTime: "instant",
  },
  {
    sourceProgram: "amex_mr",
    airlineProgram: "iberia_avios",
    airlineName: "Iberia Plus Avios",
    airlineCode: "IB",
    transferRatio: 1.0,
    transferTime: "instant",
  },
];

export const ALL_TRANSFER_PARTNERS = [
  ...CHASE_UR_PARTNERS,
  ...AMEX_MR_PARTNERS,
];

// Get all airline programs reachable from a source program
export function getPartnersForProgram(
  sourceProgram: string
): TransferPartner[] {
  return ALL_TRANSFER_PARTNERS.filter(
    (p) => p.sourceProgram === sourceProgram
  );
}

// Get all source programs that can transfer to a given airline program
export function getSourcesForAirlineProgram(
  airlineProgram: string
): TransferPartner[] {
  return ALL_TRANSFER_PARTNERS.filter(
    (p) => p.airlineProgram === airlineProgram
  );
}

// Get all unique airline programs
export function getAllAirlinePrograms(): string[] {
  return [
    ...new Set(ALL_TRANSFER_PARTNERS.map((p) => p.airlineProgram)),
  ];
}
