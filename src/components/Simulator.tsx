"use client";

import { useState, type SubmitEvent } from "react";
import { getPriceSeries } from "@/lib/dataset";
import { runSimulation } from "@/lib/simulation";
import type {
  CryptoSymbol,
  DcaFrequency,
  InvestmentMode,
  SimulationResult,
} from "@/lib/types";
import { SimpleLineChart } from "./SimpleLineChart";

const CRYPTOS: CryptoSymbol[] = ["BTC", "ETH", "SOL"];

const FREQUENCY_LABELS: Record<DcaFrequency, string> = {
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
};

/**
 * UI volontairement non stylée : sert uniquement à tester le moteur de
 * simulation à la main, avant l'habillage au design S'investir.
 */
export function Simulator() {
  const [crypto, setCrypto] = useState<CryptoSymbol>("BTC");
  const [mode, setMode] = useState<InvestmentMode>("dca");
  const [frequency, setFrequency] = useState<DcaFrequency>("monthly");
  const [amount, setAmount] = useState(100);
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState("2023-12-01");

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const priceSeries = getPriceSeries(crypto);
      const simulationResult = runSimulation(
        {
          crypto,
          mode,
          frequency: mode === "dca" ? frequency : undefined,
          amount,
          startDate,
          endDate,
        },
        priceSeries
      );
      setResult(simulationResult);
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="crypto">Crypto</label>
          <select
            id="crypto"
            value={crypto}
            onChange={(e) => setCrypto(e.target.value as CryptoSymbol)}
          >
            {CRYPTOS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mode">Mode</label>
          <select
            id="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as InvestmentMode)}
          >
            <option value="lump_sum">Une fois (lump sum)</option>
            <option value="dca">Récurrent (DCA)</option>
          </select>
        </div>

        {mode === "dca" && (
          <div>
            <label htmlFor="frequency">Fréquence</label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as DcaFrequency)}
            >
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="amount">
            Montant {mode === "dca" ? "par période" : "total"} (€)
          </label>
          <input
            id="amount"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div>
          <label htmlFor="startDate">Date de début</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="endDate">Date de fin</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button type="submit">Simuler</button>
      </form>

      {error && <p>Erreur : {error}</p>}

      {result && (
        <div>
          <h2>Résultats</h2>
          <ul>
            <li>Montant total investi : {result.totalInvested.toFixed(2)} €</li>
            <li>Unités accumulées : {result.totalUnits.toFixed(6)}</li>
            <li>Valeur finale du portefeuille : {result.finalValue.toFixed(2)} €</li>
            <li>Performance : {result.performancePct.toFixed(2)} %</li>
          </ul>
          <h3>Évolution de la valeur</h3>
          <SimpleLineChart points={result.series} />
        </div>
      )}
    </div>
  );
}
