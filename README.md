# Simulateur DCA Crypto - S'investir

Simulateur de plue-value sur cryptomonnaies, adaptant la logique fonctionnelle du simulateur crypto de S'investir aux standards visuels de la suite [simulateurs.sinvestir.fr](https://simulateurs.sinvestir.fr).

**Démo en ligne :** https://simulateur-crypto-sinvestir-swart.vercel.app

---

## Aperçu

L'outil permet de comparer deux stratégies d'investissement sur Bitcoin, Ethereum
ou Solana, à partir de prix historiques :

- **Investissement unique (lump sum)** : un placement en une fois ;
- **Investissement programmé (DCA)** : des versements récurrents (quotidien,
  hebdomadaire ou mensuel) sur une période.

Pour chaque scénario, il calcule le montant total investi, la valeur finale du
portefeuille, la performance en pourcentage, et affiche l'évolution de la valeur
dans le temps.

---

## Stack technique

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** pour le style
- **Vitest** pour les tests unitaires
- Déploiement sur **Vercel**

Stack alignée sur l'infrastructure interne de S'investir (Next.js, Vercel).

---

## Démarrage rapide

### Prérequis

- Node.js 18+ (développé et testé sur Node.js 24.18)

### Installation et lancement

```bash
npm install            # installe les dépendances
npm run dev            # serveur de développement -> http://localhost:3000
npm test               # lance les tests unitaires (Vitest)
npm run build          # build de production
npm run fetch:prices   # (optionnel) régénère les données via l'API Binance
```

**Aucune variable d'environnement requise** : l'application est autonome et
fonctionne avec un jeu de données historiques embarqué.

---

## Structure du projet

```
src/
  app/           # App Router (layout, page d'accueil, métadonnées SEO)
  components/    # Simulator (composant principal), SimpleLineChart (graphique)
  lib/           # simulation.ts (moteur de calcul) + dataset.ts (accès données,
                 #   getDateRange) + tests (simulation.test.ts, dataset.test.ts)
  data/          # historical-prices.json (prix mensuels réels BTC/ETH/SOL)
scripts/
  fetch-historical-prices.mjs   # récupération des prix via l'API Binance
CLAUDE.md        # Contexte et instructions pour l'agent Claude Code
```

---

## Partis pris techniques

### Séparation moteur / interface

La logique de calcul est isolée dans des **fonctions pures** (`src/lib`),
indépendantes de l'interface. Avantages : testabilité directe, réutilisabilité,
et possibilité de brancher une autre source de données sans toucher à l'UI.

### Périmètre des données : 3 cryptos plutôt que le catalogue complet

La démo couvre **3 crypto-actifs représentatifs** (BTC, ETH, SOL), là où le
simulateur d'origine en propose plusieurs milliers. C'est un choix de périmètre
assumé : l'objectif du test est de démontrer la **mécanique de calcul et son
intégration**, pas l'exhaustivité du catalogue. Le moteur est **indépendant du
nombre d'actifs**. Passer de 3 à plusieurs milliers est une question de **source
de données**, pas de logique : il suffirait de brancher une API à la place du
fichier local, sans toucher au calcul.

### Provenance des prix : données réelles figées

Les prix de BTC/ETH/SOL (`src/data/historical-prices.json`) sont des **données
réelles** récupérées via l'API publique gratuite de **Binance** (endpoint
`klines`, `interval=1M`, paires BTCEUR / ETHEUR / SOLEUR, aucune clé requise), par
le script `scripts/fetch-historical-prices.mjs`. Chaque "bougie" mensuelle fournit un
point par mois. Les données sont ensuite **figées en instantané statique** : le
rendu reste **déterministe et sans dépendance externe** à l'exécution (la démo ne
peut pas être cassée par une API indisponible), tout en s'appuyant sur de vrais
cours.

Pourquoi pas CoinGecko ? L'API gratuite plafonne
l'historique à 365 jours sur le tier public, c'est trop court pour être représentatif de plusieurs
cycles de marché.

- **Dernière récupération : 2026-06-27.**
- **Couverture réelle :** BTC et ETH du 01/2020 au 05/2026 (77 points) ; SOL du
  05/2021 au 05/2026 (61 points, la paire SOLEUR n'existe sur Binance que depuis
  mai 2021). Le simulateur **borne dynamiquement ses sélecteurs de dates** sur la
  plage réelle de chaque crypto (`getDateRange`, dans `src/lib/dataset.ts`, testé
  dans `src/lib/dataset.test.ts`). La plage par défaut à l'ouverture (2021 →
  dernier mois) est choisie pour être le plus réprésentatif possible, en considérant un **cycle complet bull/bear**.
- **Repli automatique :** si une paire EUR est absente ou trop courte (< 6 mois),
  le script bascule sur la paire USDT équivalente et le signale (non déclenché lors
  de la dernière récupération).
- **Régénérer le dataset** (écriture atomique : tout ou rien si une crypto échoue) :
  ```bash
  npm run fetch:prices
  ```

_Remarque :_ avec une granularité mensuelle, les fréquences quotidienne et
hebdomadaire s'appuient sur le prix mensuel disponible le plus proche ce qui est suffisant
pour illustrer la mécanique du DCA.

### En production : mise à l'échelle

Le fichier figé serait remplacé par une **API mise en cache dans Supabase et rafraîchie via un workflow n8n déclenché par cron** (plutôt qu'un JSON régénéré à la main). Pour couvrir
l'ensemble du catalogue (plusieurs milliers d'actifs) et alimenter des agents IA,
un fournisseur à plus large couverture comme **CoinStats API** serait pertinent :
catalogue très étendu, historique long, et **serveur MCP** exploitable directement
par des agents IA (Claude Code, Cursor).

### Graphique : SVG maison, sans librairie

Le graphique d'évolution est un **SVG construit à la main** (`SimpleLineChart`),
sans dépendance de bibliothèques de graphiques (Recharts, Chart.js, amCharts…). Pour une simple
courbe de valeur, cela évite d'alourdir le code envoyé au navigateur d'un composant pensé pour être
**embarquable proprement (iframe-ready)**. Une version interactive (axes gradués,
tooltips au survol, multi-séries) justifierait l'ajout d'une librairie comme Recharts.

### Pas de persistance pour ce périmètre

Le simulateur est volontairement **stateless** : il calcule mais n'enregistre rien.
Les fonctions de sauvegarde et de partage présentes sur la plateforme S'investir
relèvent d'une couche **plateforme** (comptes utilisateurs) distincte du
simulateur lui-même, et hors du périmètre de ce test. Elles nécessiteraient une
persistance (Supabase : authentification + table des simulations), une simulation
devenant alors une ligne partageable via un identifiant unique.

### Intégrabilité

Le composant `<Simulator />` est **autonome, réutilisable et avec peu de dépendances**, conçu pour pouvoir remplacer le simulateur actuel ou être affiché en aperçu intégré (embedding) depuis sinvestir.fr.

---

## Tests

10 tests unitaires (Vitest), tous au vert. Le moteur de calcul (`simulation.ts`)
est couvert par deux cas de contrôle vérifiables à la main, et l'accès aux données
(`getDateRange`) par 6 tests vérifiant les bornes réelles de chaque crypto.

- **Lump sum** : 1000 € investis en une fois le 01/01/2024 (prix 100) et
  valorisés le 01/02/2024 (prix 200) → 10 unités, valeur finale 2000 €,
  performance +100 %.
- **DCA mensuel** : 100 €/mois du 01/01/2024 au 01/03/2024, aux prix
  [100, 50, 200] → 3,5 unités accumulées, 300 € investis, valeur finale 700 €,
  performance +133,33 %.

Les tests du moteur utilisent des séries de prix en dur, **indépendantes du jeu de
données** : ils restent valides quelle que soit la source des prix réels.

```bash
npm test
```

---

## Évolutions possibles

- Graphiques enrichis : vues _Historique_ et _Gains / Pertes_, tooltips au survol,
  superposition « Montant investi » vs « Valeur ».
- Rafraîchissement automatique des données en production (API + cache Supabase +
  cron n8n) et élargissement au catalogue complet via une API à large couverture.
- Partage de simulation par lien (encodage des paramètres dans l'URL, sans base).
- Capture de lead à l'affichage des résultats (vers un CRM via n8n).
- Élargissement à davantage de crypto-actifs et à une granularité quotidienne.

---

_Outil pédagogique et informatif, basé sur des données historiques. Les
performances passées ne préjugent pas des performances futures. Ceci n'est pas un
conseil en investissement._
