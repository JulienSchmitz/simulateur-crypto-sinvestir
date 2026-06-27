# Projet — Simulateur S'investir (test technique)

## Contexte

Test technique pour une candidature freelance chez S'investir (média/conseil en
investissement). Objectif : démontrer un niveau technique et une manière de
travailler propre. On ne cherche pas un produit fini, mais du code propre + une
démo en ligne qui marche.

## Mission

Reprendre la LOGIQUE FONCTIONNELLE de leur simulateur crypto (backtest DCA) et
l'HABILLER au design de leur suite d'outils (simulateurs.sinvestir.fr), comme
s'il rejoignait cette suite.

## Spécification fonctionnelle

Entrées :

- Choix de la crypto (BTC, ETH, SOL pour la démo)
- Mode d'investissement : une fois (lump sum) OU récurrent (quotidien/hebdo/mensuel) (DCA)
- Montant
- Date de début et date de fin
  Sorties :
- Montant total investi
- Valeur finale du portefeuille
- Performance en %
- Graphique d'évolution de la valeur dans le temps
  Calcul basé sur des prix historiques.

## Décision données (importante)

Pour la démo : dataset historique STATIQUE (prix mensuels en JSON local pour
BTC/ETH/SOL). Avantages : déterministe, rapide, zéro dépendance externe, rien ne
casse le jour de l'évaluation.
À documenter dans le README : en production, ces prix viendraient d'une API
(CoinGecko) cachée dans Supabase et rafraîchie via un cron n8n.
(Stretch goal optionnel : couche CoinGecko en revalidation Next.js avec le JSON
statique en secours.)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Déploiement sur Vercel
- PAS de Supabase pour ce périmètre (simulateur = calcul sans persistance) — à
  justifier dans le README ; Supabase s'intégrerait si on capturait des leads.

## Architecture & contraintes

- Composant <Simulator /> AUTONOME, réutilisable, peu de dépendances, pensé pour
  être embeddable (iframe-ready). Pas besoin de réaliser l'intégration réelle.
- Responsive : propre en desktop ET mobile.
- Code lisible : structure claire, nommage cohérent.

## Fidélité au design (cible : simulateurs.sinvestir.fr)

### Couleurs

- Fond principal : bleu nuit #000031, en DÉGRADÉ vers un bleu un peu plus clair,
  avec un halo lumineux bleu en haut/centre. Ambiance sombre.
- Bleu primaire (boutons CTA, éléments actifs) : #0049C6
- Bleu accent (liens, surbrillances, sous-titres) : #1098F7
- Texte sur fond sombre : blanc #FFFFFF ; contraste clair : #F7F9FA
- Texte secondaire : blanc atténué (~60-70% d'opacité)
- Accent OR (logo + barre de gains) : doré ≈ #D4A017, à utiliser avec parcimonie

### Typographie

- Police principale : Lexend (titres + corps), via next/font
- Police secondaire : Plus Jakarta Sans, via next/font
- Titres : gros, gras, blancs

### Formes & esprit

- Boutons : pilule (très arrondis, ~rounded-full)
- Cartes : coins arrondis (~16-20px), surface sombre un peu plus claire que le
  fond, fine bordure blanche à faible opacité, léger glow
- Style épuré, aéré, beaucoup d'espace négatif

### Pattern de résultats à reproduire (IMPORTANT)

Calquer le bloc "Vos résultats" de leur simulateur intérêts composés :

- Grande carte "Valeur finale" (montant en gros)
- Carte "Performance" (% en gros)
- Barre de répartition BLEU/OR : "Montant investi" (bleu) vs "Plus-value" (or)
- Titre de section encadré de tirets décoratifs : — SIMULATEUR … —
- En-tête : logo/wordmark à gauche, lien discret à droite

## Hors périmètre

Intégration réelle dans leurs systèmes, 7000+ cryptos, authentification.

## Disclaimers à afficher

Outil pédagogique/informatif, basé sur données historiques. Les performances
passées ne préjugent pas des performances futures. Pas un conseil en investissement.
