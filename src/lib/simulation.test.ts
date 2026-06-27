import { describe, expect, it } from "vitest";
import { runSimulation } from "./simulation";
import type { PricePoint } from "./types";

describe("runSimulation", () => {
  it("lump sum : 1000 € investis une fois, prix 100 -> 200", () => {
    const priceSeries: PricePoint[] = [
      { date: "2024-01-01", price: 100 },
      { date: "2024-02-01", price: 200 },
    ];

    const result = runSimulation(
      {
        crypto: "BTC",
        mode: "lump_sum",
        amount: 1000,
        startDate: "2024-01-01",
        endDate: "2024-02-01",
      },
      priceSeries
    );

    expect(result.totalInvested).toBe(1000);
    expect(result.totalUnits).toBeCloseTo(10);
    expect(result.finalValue).toBeCloseTo(2000);
    expect(result.performancePct).toBeCloseTo(100);
  });

  it("DCA mensuel : 100 €/mois sur 3 mois, prix [100, 50, 200]", () => {
    const priceSeries: PricePoint[] = [
      { date: "2024-01-01", price: 100 },
      { date: "2024-02-01", price: 50 },
      { date: "2024-03-01", price: 200 },
    ];

    const result = runSimulation(
      {
        crypto: "BTC",
        mode: "dca",
        frequency: "monthly",
        amount: 100,
        startDate: "2024-01-01",
        endDate: "2024-03-01",
      },
      priceSeries
    );

    expect(result.totalInvested).toBe(300);
    expect(result.totalUnits).toBeCloseTo(3.5);
    expect(result.finalValue).toBeCloseTo(700);
    expect(result.performancePct).toBeCloseTo(133.33, 1);
  });

  it("la série couvre les points de prix de la période et finit sur la valeur finale", () => {
    const priceSeries: PricePoint[] = [
      { date: "2024-01-01", price: 100 },
      { date: "2024-02-01", price: 50 },
      { date: "2024-03-01", price: 200 },
    ];

    const result = runSimulation(
      {
        crypto: "BTC",
        mode: "dca",
        frequency: "monthly",
        amount: 100,
        startDate: "2024-01-01",
        endDate: "2024-03-01",
      },
      priceSeries
    );

    expect(result.series).toHaveLength(3);
    expect(result.series[0]).toEqual({ date: "2024-01-01", value: 100 });
    expect(result.series.at(-1)?.value).toBeCloseTo(result.finalValue);
  });

  it("rejette une date de fin antérieure à la date de début", () => {
    const priceSeries: PricePoint[] = [{ date: "2024-01-01", price: 100 }];

    expect(() =>
      runSimulation(
        {
          crypto: "BTC",
          mode: "lump_sum",
          amount: 1000,
          startDate: "2024-02-01",
          endDate: "2024-01-01",
        },
        priceSeries
      )
    ).toThrow();
  });
});
