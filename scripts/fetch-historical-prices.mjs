/**
 * Récupère les cours mensuels réels de BTC, ETH et SOL (en EUR) via l'API
 * publique gratuite de Binance, et régénère src/data/historical-prices.json.
 *
 * Source : endpoint `klines` (chandeliers), interval=1M, paires BTCEUR /
 * ETHEUR / SOLEUR. Pas de clé requise, et l'historique mensuel remonte
 * directement à plusieurs années (contrairement à l'API gratuite CoinGecko,
 * plafonnée à 365 jours sur le tier public). Chaque bougie mensuelle donne
 * déjà un point par mois civil : pas de ré-échantillonnage nécessaire.
 *
 * Si une paire EUR est absente ou trop courte (< MIN_ACCEPTABLE_MONTHS
 * mois), le script se replie automatiquement sur la paire USDT équivalente
 * (même source, même endpoint) et le signale dans le résumé affiché. Une
 * alternative plus lourde (CryptoCompare `histoday` agrégé en mensuel)
 * existe si Binance devenait indisponible, mais n'a pas été nécessaire ici :
 * les trois paires EUR couvrent largement les besoins du simulateur.
 *
 * Usage : node scripts/fetch-historical-prices.mjs
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "historical-prices.json");

const BINANCE_KLINES_URL = "https://api.binance.com/api/v3/klines";
const INTERVAL = "1M";
const MIN_ACCEPTABLE_MONTHS = 6;

const COINS = [
  { symbol: "BTC", primaryPair: "BTCEUR", fallbackPair: "BTCUSDT" },
  { symbol: "ETH", primaryPair: "ETHEUR", fallbackPair: "ETHUSDT" },
  { symbol: "SOL", primaryPair: "SOLEUR", fallbackPair: "SOLUSDT" },
];

async function fetchMonthlyKlines(pair) {
  const url = new URL(BINANCE_KLINES_URL);
  url.searchParams.set("symbol", pair);
  url.searchParams.set("interval", INTERVAL);
  url.searchParams.set("startTime", "0"); // dès la première bougie disponible
  url.searchParams.set("limit", "1000"); // largement suffisant pour un historique mensuel

  const response = await fetch(url);
  const body = await response.json();

  if (!response.ok || body?.code) {
    const message = body?.msg ?? response.statusText;
    throw new Error(`Binance a refusé la requête pour ${pair} : ${message}`);
  }

  return body; // [[openTime, open, high, low, close, volume, closeTime, ...], ...]
}

/** Convertit les bougies mensuelles Binance en PricePoint, en excluant le
 * mois en cours s'il n'est pas encore clôturé (closeTime futur). */
function klinesToPricePoints(klines) {
  const now = Date.now();
  return klines
    .filter(([, , , , , , closeTime]) => closeTime < now)
    .map(([openTime, open]) => ({
      date: new Date(openTime).toISOString().slice(0, 10),
      price: Math.round(parseFloat(open) * 100) / 100,
    }));
}

async function fetchSeriesForCoin(coin) {
  try {
    const klines = await fetchMonthlyKlines(coin.primaryPair);
    const points = klinesToPricePoints(klines);
    if (points.length >= MIN_ACCEPTABLE_MONTHS) {
      return { points, pairUsed: coin.primaryPair };
    }
    console.warn(
      `  -> ${coin.primaryPair} ne renvoie que ${points.length} mois, repli sur ${coin.fallbackPair}.`
    );
  } catch (error) {
    console.warn(`  -> ${coin.primaryPair} indisponible (${error.message}), repli sur ${coin.fallbackPair}.`);
  }

  const klines = await fetchMonthlyKlines(coin.fallbackPair);
  const points = klinesToPricePoints(klines);
  if (points.length === 0) {
    throw new Error(
      `Aucune donnée disponible pour ${coin.symbol} (ni ${coin.primaryPair} ni ${coin.fallbackPair}).`
    );
  }
  return { points, pairUsed: coin.fallbackPair };
}

async function main() {
  const dataset = {};
  const summary = [];

  for (const coin of COINS) {
    console.log(`Récupération de ${coin.symbol} (${coin.primaryPair})...`);
    const { points, pairUsed } = await fetchSeriesForCoin(coin);
    dataset[coin.symbol] = points;
    summary.push({
      symbol: coin.symbol,
      pair: pairUsed,
      points: points.length,
      from: points[0].date,
      to: points[points.length - 1].date,
    });
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(dataset, null, 2) + "\n", "utf-8");

  console.log("\nDataset régénéré :", OUTPUT_PATH);
  console.log("Source : Binance API publique (klines, interval=1M)");
  console.log("Récupéré le :", new Date().toISOString());
  console.table(summary);
}

main().catch((error) => {
  console.error("\nÉchec de la récupération des données Binance.");
  console.error(error.message);
  console.error(
    "\nLe fichier src/data/historical-prices.json n'a pas été modifié (écriture atomique : tout ou rien)."
  );
  process.exit(1);
});
