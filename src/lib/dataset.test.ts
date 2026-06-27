import { describe, expect, it } from "vitest";
import { getDateRange, getPriceSeries } from "./dataset";
import type { CryptoSymbol } from "./types";

const CRYPTOS: CryptoSymbol[] = ["BTC", "ETH", "SOL"];

describe("getDateRange", () => {
  it.each(CRYPTOS)("renvoie le min/max réel de la série pour %s", (crypto) => {
    const series = getPriceSeries(crypto);
    const range = getDateRange(crypto);

    expect(range.min).toBe(series[0].date);
    expect(range.max).toBe(series[series.length - 1].date);
  });

  it.each(CRYPTOS)("renvoie une plage cohérente (min <= max) pour %s", (crypto) => {
    const { min, max } = getDateRange(crypto);
    expect(min <= max).toBe(true);
  });
});
