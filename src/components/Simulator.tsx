"use client";

import { useState, type ReactNode, type SubmitEvent } from "react";
import { getDateRange, getPriceSeries } from "@/lib/dataset";
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

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/40 [color-scheme:dark]";

const labelClassName =
  "mb-1.5 block font-jakarta text-xs font-medium uppercase tracking-wide text-white/60";

/** Ramène une date ISO dans une plage [min, max] (comparaison lexicographique valide en ISO 8601). */
function clampDate(date: string, min: string, max: string): string {
  if (date < min) return min;
  if (date > max) return max;
  return date;
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClassName}>
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Composant autonome et embeddable : ne dépend que de src/lib (moteur pur)
 * et gère son propre style. Le fond en dégradé / la police globale viennent
 * du layout de l'app hôte ; ce composant reste utilisable seul (iframe).
 */
export function Simulator() {
  const [crypto, setCrypto] = useState<CryptoSymbol>("BTC");
  const [mode, setMode] = useState<InvestmentMode>("dca");
  const [frequency, setFrequency] = useState<DcaFrequency>("monthly");
  const [amount, setAmount] = useState(100);

  // Plage par défaut choisie pour montrer un cycle complet (bull/bear) plutôt
  // que la toute première date disponible ; clampée si les données changent.
  const DEFAULT_START_DATE = "2021-01-01";
  const initialRange = getDateRange("BTC");
  const [startDate, setStartDate] = useState(
    clampDate(DEFAULT_START_DATE, initialRange.min, initialRange.max)
  );
  const [endDate, setEndDate] = useState(initialRange.max);

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dateRange = getDateRange(crypto);

  function handleCryptoChange(next: CryptoSymbol) {
    setCrypto(next);
    const nextRange = getDateRange(next);
    setStartDate((prev) => clampDate(prev, nextRange.min, nextRange.max));
    setEndDate((prev) => clampDate(prev, nextRange.min, nextRange.max));
  }

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

  const gain = result ? result.finalValue - result.totalInvested : 0;
  const isGain = gain >= 0;
  // Les deux parts de la barre sont toujours rapportées à la valeur finale :
  // investi/valeur finale (bleu) et plus-value/valeur finale (or). En cas de
  // moins-value, la part "or" n'a pas de sens : elle est clampée à 0 et la
  // part bleue à 100 (le ratio investi/valeur finale dépasserait 100 %).
  const investedSharePct = result
    ? Math.min(100, (result.totalInvested / (result.finalValue || 1)) * 100)
    : 0;
  const gainSharePct = result
    ? Math.max(0, (gain / (result.finalValue || 1)) * 100)
    : 0;

  return (
    <div className="w-full rounded-card border border-white/10 bg-surface/80 p-6 shadow-glow sm:p-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-8 bg-white/20 sm:w-14" />
          <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-white sm:text-2xl">
            Simulateur DCA Crypto
          </h2>
          <span className="h-px w-8 bg-white/20 sm:w-14" />
        </div>
        <p className="font-jakarta text-sm font-semibold text-accent sm:text-base">
          Mesurez l&apos;impact du DCA face à un investissement unique
        </p>
        <p className="max-w-2xl text-sm text-white/70">
          Comparez un placement unique (lump sum) à un investissement programmé
          (DCA) sur Bitcoin, Ethereum ou Solana, à partir de prix historiques
          mensuels.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <div className="space-y-5">
          <Field label="Crypto" htmlFor="crypto">
            <select
              id="crypto"
              value={crypto}
              onChange={(e) => handleCryptoChange(e.target.value as CryptoSymbol)}
              className={fieldClassName}
            >
              {CRYPTOS.map((c) => (
                <option key={c} value={c} className="bg-midnight">
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Mode d'investissement" htmlFor="mode">
            <select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as InvestmentMode)}
              className={fieldClassName}
            >
              <option value="lump_sum" className="bg-midnight">
                Une fois (lump sum)
              </option>
              <option value="dca" className="bg-midnight">
                Récurrent (DCA)
              </option>
            </select>
          </Field>

          {mode === "dca" && (
            <Field label="Fréquence" htmlFor="frequency">
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as DcaFrequency)}
                className={fieldClassName}
              >
                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-midnight">
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field
            label={`Montant ${mode === "dca" ? "par période" : "total"} (€)`}
            htmlFor="amount"
          >
            <input
              id="amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className={fieldClassName}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date de début" htmlFor="startDate">
              <input
                id="startDate"
                type="date"
                value={startDate}
                min={dateRange.min}
                max={dateRange.max}
                onChange={(e) =>
                  setStartDate(clampDate(e.target.value, dateRange.min, dateRange.max))
                }
                className={fieldClassName}
              />
            </Field>

            <Field label="Date de fin" htmlFor="endDate">
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={dateRange.min}
                max={dateRange.max}
                onChange={(e) =>
                  setEndDate(clampDate(e.target.value, dateRange.min, dateRange.max))
                }
                className={fieldClassName}
              />
            </Field>
          </div>
          <p className="text-xs text-white/50">
            Données disponibles du {dateRange.min} au {dateRange.max}.
          </p>

          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent/60"
          >
            Simuler
          </button>

          {error && (
            <p className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              Erreur : {error}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-4 w-0.5 rounded-full bg-accent" />
            <h3 className="font-jakarta text-sm font-semibold uppercase tracking-wide text-white">
              Vos résultats
            </h3>
          </div>

          {result ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
                <div className="rounded-card border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-wide text-white/60">
                    Valeur finale du portefeuille
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                    {currencyFormatter.format(result.finalValue)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-xs text-white/60">
                    <span>
                      Montant investi{" "}
                      <span className="font-semibold text-white">
                        {currencyFormatter.format(result.totalInvested)}
                      </span>
                    </span>
                    <span>
                      {isGain ? "Plus-value" : "Moins-value"}{" "}
                      <span
                        className={
                          isGain
                            ? "font-semibold text-gold"
                            : "font-semibold text-white"
                        }
                      >
                        {currencyFormatter.format(Math.abs(gain))}
                      </span>
                    </span>
                  </div>
                  <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${investedSharePct}%` }}
                    />
                    <div
                      className="h-full bg-gold"
                      style={{ width: `${gainSharePct}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-card border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-wide text-white/60">
                    Performance
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-3xl xl:text-4xl">
                    {result.performancePct >= 0 ? "+" : ""}
                    {result.performancePct.toFixed(2)} %
                  </p>
                </div>
              </div>

              <div className="rounded-card border border-white/10 bg-white/5 p-5">
                <p className="mb-3 text-xs uppercase tracking-wide text-white/60">
                  Évolution de la valeur
                </p>
                <SimpleLineChart points={result.series} />
              </div>
            </>
          ) : (
            <div className="rounded-card border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm text-white/60">
              Renseignez vos paramètres et cliquez sur « Simuler » pour voir
              vos résultats.
            </div>
          )}
        </div>
      </form>

      <p className="mt-10 text-center text-xs text-white/50">
        Outil pédagogique et informatif, basé sur des données historiques. Les
        performances passées ne préjugent pas des performances futures. Ceci
        n&apos;est pas un conseil en investissement.
      </p>
    </div>
  );
}
