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
