export type CryptoSymbol = "BTC" | "ETH" | "SOL";

export type InvestmentMode = "lump_sum" | "dca";

export type DcaFrequency = "daily" | "weekly" | "monthly";

export interface PricePoint {
  date: string; // ISO "YYYY-MM-DD"
  price: number;
}

export interface SimulationInput {
  crypto: CryptoSymbol;
  mode: InvestmentMode;
  /** Requis si mode === "dca". Ignoré en lump sum. */
  frequency?: DcaFrequency;
  /** Lump sum : montant total investi une fois. DCA : montant investi à chaque période. */
  amount: number;
  startDate: string; // ISO "YYYY-MM-DD"
  endDate: string; // ISO "YYYY-MM-DD"
}

export interface ValuePoint {
  date: string;
  value: number;
}

export interface SimulationResult {
  totalInvested: number;
  totalUnits: number;
  finalValue: number;
  performancePct: number;
  series: ValuePoint[];
}
