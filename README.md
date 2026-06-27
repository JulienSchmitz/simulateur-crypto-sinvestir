This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Données

Les prix historiques de BTC/ETH/SOL ([src/data/historical-prices.json](src/data/historical-prices.json))
sont des **données réelles** récupérées via l'API publique gratuite de
[Binance](https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-data)
(endpoint `klines`, `interval=1M`, paires BTCEUR / ETHEUR / SOLEUR), par le
script [scripts/fetch-historical-prices.mjs](scripts/fetch-historical-prices.mjs).
Chaque bougie mensuelle donne directement un point par mois civil (prix
d'ouverture du mois) — aucune API key n'est requise.

- **Dernière récupération : 2026-06-27.**
- **Couverture réelle :**
  - BTC : du 01/01/2020 au 01/05/2026 (77 points)
  - ETH : du 01/01/2020 au 01/05/2026 (77 points)
  - SOL : du 01/05/2021 au 01/05/2026 (61 points — la paire SOLEUR n'existe
    sur Binance que depuis mai 2021, plus tard que le lancement de SOL lui-même)

  Le simulateur borne dynamiquement ses sélecteurs de dates sur la plage
  réelle de chaque crypto (voir `getDateRange` dans
  [src/lib/dataset.ts](src/lib/dataset.ts), testé dans
  [src/lib/dataset.test.ts](src/lib/dataset.test.ts)). La plage par défaut à
  l'ouverture (2021-01-01 → dernier mois) est choisie pour montrer un cycle
  complet bull/bear plutôt que le strict minimum disponible.
- **Repli automatique :** si une paire EUR est absente ou trop courte
  (< 6 mois), le script se rabat sur la paire USDT équivalente (même source,
  même endpoint) et le signale dans son résumé. Non utilisé ici : les trois
  paires EUR couvrent largement les besoins du simulateur. *(Pourquoi pas
  CoinGecko : son API gratuite plafonne l'historique à 365 jours sur le tier
  public — trop court pour couvrir plusieurs cycles de marché.)*
- **Pour régénérer le dataset** avec des données à jour :
  ```bash
  npm run fetch:prices
  ```
  Le script écrit uniquement si les trois cryptos ont été récupérées avec
  succès (pas d'écriture partielle en cas d'erreur réseau).
- **En production**, ces prix viendraient d'une API (Binance ou CoinGecko)
  mise en cache dans Supabase et rafraîchie via un cron n8n, plutôt que d'un
  fichier JSON statique régénéré manuellement.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
