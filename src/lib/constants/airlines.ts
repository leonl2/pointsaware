export interface AirlineInfo {
  code: string;
  name: string;
  logo: string; // path to SVG in /public/airlines/
  color: string; // brand color for UI accents
}

export const AIRLINES: Record<string, AirlineInfo> = {
  UA: { code: "UA", name: "United Airlines", logo: "/airlines/ua.svg", color: "#0032A0" },
  DL: { code: "DL", name: "Delta Air Lines", logo: "/airlines/dl.svg", color: "#003366" },
  AA: { code: "AA", name: "American Airlines", logo: "/airlines/aa.svg", color: "#B31942" },
  BA: { code: "BA", name: "British Airways", logo: "/airlines/ba.svg", color: "#075AAA" },
  AF: { code: "AF", name: "Air France", logo: "/airlines/af.svg", color: "#002157" },
  KL: { code: "KL", name: "KLM Royal Dutch", logo: "/airlines/kl.svg", color: "#00A1DE" },
  SQ: { code: "SQ", name: "Singapore Airlines", logo: "/airlines/sq.svg", color: "#F0AB00" },
  NH: { code: "NH", name: "ANA", logo: "/airlines/nh.svg", color: "#1A2B6D" },
  AC: { code: "AC", name: "Air Canada", logo: "/airlines/ac.svg", color: "#F01428" },
  CX: { code: "CX", name: "Cathay Pacific", logo: "/airlines/cx.svg", color: "#006564" },
  EK: { code: "EK", name: "Emirates", logo: "/airlines/ek.svg", color: "#D71921" },
  EY: { code: "EY", name: "Etihad Airways", logo: "/airlines/ey.svg", color: "#BD8B13" },
  VS: { code: "VS", name: "Virgin Atlantic", logo: "/airlines/vs.svg", color: "#E60000" },
  LH: { code: "LH", name: "Lufthansa", logo: "/airlines/lh.svg", color: "#05164D" },
  QF: { code: "QF", name: "Qantas", logo: "/airlines/qf.svg", color: "#E0001B" },
  JL: { code: "JL", name: "Japan Airlines", logo: "/airlines/jl.svg", color: "#C7000B" },
  TK: { code: "TK", name: "Turkish Airlines", logo: "/airlines/tk.svg", color: "#C80815" },
  AV: { code: "AV", name: "Avianca", logo: "/airlines/av.svg", color: "#E31837" },
  IB: { code: "IB", name: "Iberia", logo: "/airlines/ib.svg", color: "#D71921" },
  WN: { code: "WN", name: "Southwest Airlines", logo: "/airlines/wn.svg", color: "#304CB2" },
  B6: { code: "B6", name: "JetBlue", logo: "/airlines/b6.svg", color: "#003876" },
  HA: { code: "HA", name: "Hawaiian Airlines", logo: "/airlines/ha.svg", color: "#4B0082" },
  EI: { code: "EI", name: "Aer Lingus", logo: "/airlines/ei.svg", color: "#006272" },
};

export function getAirline(code: string): AirlineInfo {
  return (
    AIRLINES[code] ?? {
      code,
      name: code,
      logo: "/airlines/default.svg",
      color: "#6B7280",
    }
  );
}

export interface AirportData {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const POPULAR_AIRPORTS: AirportData[] = [
  { code: "SFO", name: "San Francisco International", city: "San Francisco", country: "US" },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "US" },
  { code: "JFK", name: "John F. Kennedy International", city: "New York", country: "US" },
  { code: "EWR", name: "Newark Liberty International", city: "Newark", country: "US" },
  { code: "ORD", name: "O'Hare International", city: "Chicago", country: "US" },
  { code: "ATL", name: "Hartsfield-Jackson International", city: "Atlanta", country: "US" },
  { code: "DFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "US" },
  { code: "MIA", name: "Miami International", city: "Miami", country: "US" },
  { code: "SEA", name: "Seattle-Tacoma International", city: "Seattle", country: "US" },
  { code: "BOS", name: "Boston Logan International", city: "Boston", country: "US" },
  { code: "IAD", name: "Washington Dulles International", city: "Washington, D.C.", country: "US" },
  { code: "LHR", name: "London Heathrow", city: "London", country: "UK" },
  { code: "CDG", name: "Paris Charles de Gaulle", city: "Paris", country: "FR" },
  { code: "NRT", name: "Narita International", city: "Tokyo", country: "JP" },
  { code: "HND", name: "Tokyo Haneda", city: "Tokyo", country: "JP" },
  { code: "SIN", name: "Singapore Changi", city: "Singapore", country: "SG" },
  { code: "HKG", name: "Hong Kong International", city: "Hong Kong", country: "HK" },
  { code: "DXB", name: "Dubai International", city: "Dubai", country: "AE" },
  { code: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "AU" },
  { code: "ICN", name: "Incheon International", city: "Seoul", country: "KR" },
  { code: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "TH" },
  { code: "FCO", name: "Leonardo da Vinci–Fiumicino", city: "Rome", country: "IT" },
  { code: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam", country: "NL" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "DE" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "TR" },
  { code: "DOH", name: "Hamad International", city: "Doha", country: "QA" },
  { code: "MLE", name: "Velana International", city: "Malé", country: "MV" },
  { code: "PPT", name: "Faa'a International", city: "Papeete", country: "PF" },
];
