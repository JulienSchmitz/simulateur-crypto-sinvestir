import historicalPrices from "@/data/historical-prices.json";
import type { CryptoSymbol, PricePoint } from "./types";

const dataset = historicalPrices as Record<CryptoSymbol, PricePoint[]>;

/** Série de prix mensuels statique pour une crypto donnée (BTC/ETH/SOL). */
export function getPriceSeries(crypto: CryptoSymbol): PricePoint[] {
  return dataset[crypto];
}

/** Plage de dates réellement couverte par les données d'une crypto. */
export function getDateRange(crypto: CryptoSymbol): { min: string; max: string } {
  const series = getPriceSeries(crypto);
  return { min: series[0].date, max: series[series.length - 1].date };
}
