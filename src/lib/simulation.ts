import { findClosestPrice } from "./prices";
import type {
  DcaFrequency,
  InvestmentMode,
  PricePoint,
  SimulationInput,
  SimulationResult,
  ValuePoint,
} from "./types";

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addPeriod(date: Date, frequency: DcaFrequency): Date {
  const next = new Date(date);
  switch (frequency) {
    case "daily":
      next.setUTCDate(next.getUTCDate() + 1);
      break;
    case "weekly":
      next.setUTCDate(next.getUTCDate() + 7);
      break;
    case "monthly":
      next.setUTCMonth(next.getUTCMonth() + 1);
      break;
  }
  return next;
}

/**
 * Génère les dates d'investissement entre startDate et endDate (inclus).
 * En lump sum, une seule date : le début de la période.
 */
export function generateInvestmentDates(
  startDate: string,
  endDate: string,
  mode: InvestmentMode,
  frequency?: DcaFrequency
): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (mode === "lump_sum") {
    return [toISODate(start)];
  }

  if (!frequency) {
    throw new Error("La fréquence est requise en mode DCA");
  }

  const dates: string[] = [];
  let current = start;
  while (current.getTime() <= end.getTime()) {
    dates.push(toISODate(current));
    current = addPeriod(current, frequency);
  }
  return dates;
}

/**
 * Simule un investissement (lump sum ou DCA) à partir d'une série de prix
 * historiques et renvoie les montants agrégés ainsi que la série de valeur
 * du portefeuille dans le temps.
 */
export function runSimulation(
  input: SimulationInput,
  priceSeries: PricePoint[]
): SimulationResult {
  const { mode, frequency, amount, startDate, endDate } = input;

  if (amount <= 0) {
    throw new Error("Le montant doit être strictement positif");
  }
  if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
    throw new Error("La date de début doit précéder la date de fin");
  }

  const investmentDates = generateInvestmentDates(
    startDate,
    endDate,
    mode,
    frequency
  );

  const transactions = investmentDates.map((date) => {
    const { price } = findClosestPrice(priceSeries, date);
    return { date, price, units: amount / price };
  });

  const totalInvested = transactions.length * amount;
  const totalUnits = transactions.reduce((sum, t) => sum + t.units, 0);

  const finalPrice = findClosestPrice(priceSeries, endDate).price;
  const finalValue = totalUnits * finalPrice;
  const performancePct =
    totalInvested > 0 ? ((finalValue - totalInvested) / totalInvested) * 100 : 0;

  const series: ValuePoint[] = priceSeries
    .filter((point) => point.date >= startDate && point.date <= endDate)
    .map((point) => {
      const cumulativeUnits = transactions
        .filter((t) => t.date <= point.date)
        .reduce((sum, t) => sum + t.units, 0);
      return { date: point.date, value: cumulativeUnits * point.price };
    });

  return { totalInvested, totalUnits, finalValue, performancePct, series };
}
