# Red Tetris

Tetris multijoueur en temps réel (projet 42). Monorepo npm workspaces.

## Structure

```
shared/   moteur de jeu pur (fonctions sans état : board, collisions, rotation, clear de lignes)
server/   Node.js + Express + socket.io, OOP (classes Game / Player / Piece)
client/   React + TypeScript + Redux Toolkit, composants fonctionnels purs
```

## Démarrage

```bash
npm install
npm run dev:server   # terminal 1 — API + socket.io sur :3000
npm run dev:client   # terminal 2 — Vite dev server (proxy /socket.io vers :3000)
```

## Tests & couverture

```bash
npm run test
npm run coverage      # objectif sujet : 70% statements/functions/lines, 50% branches
```

## État d'avancement

Squelette posé : types, classes OOP serveur, store Redux, routing SPA,
composants d'affichage. Les fonctions marquées `TODO` dans `shared/src/`
et `server/src/models/` sont le cœur de la logique de jeu à implémenter.

## Répartition

- Moteur de jeu, classes serveur, câblage socket.io : Baidy
- `computeSpectrum` (`shared/src/board.ts`) + thème CSS (`client/src/styles/`) : coéquipier
