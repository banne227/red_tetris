# Red Tetris

Tetris multijoueur en temps réel — projet 42.
Real-time multiplayer Tetris — 42 school project.

---

## 🇫🇷 Français

### Stack

- **shared/** — moteur de jeu pur (fonctions sans état : collisions, rotation, clear de lignes, spectre, distribution des pièces)
- **server/** — Node.js + Express + socket.io, en OOP (classes `Game`, `Player`, `Piece`)
- **client/** — React + TypeScript + Redux Toolkit, composants fonctionnels purs (aucun `this`)

Monorepo avec npm workspaces.

### Prérequis

- Node.js 20+
- npm 10+

### Installation

```bash
git clone <url-du-repo>
cd red-tetris
npm install
```

### Lancer en local (développement)

Deux terminaux séparés, à la racine du projet :

```bash
# Terminal 1 — serveur (API + socket.io sur le port 3000)
npm run dev:server

# Terminal 2 — client (Vite, avec proxy vers le serveur)
npm run dev:client
```

Ouvre l'URL donnée par Vite (en général `http://localhost:5173`).

Pour tester le multijoueur **sur ta propre machine**, ouvre simplement un second onglet (ou une fenêtre de navigation privée) sur la même URL, avec un pseudo différent, et rejoins la même room.

### Lancer en réseau local (LAN — plusieurs machines)

Pour que d'autres appareils du même réseau (Wi-Fi/Ethernet) puissent rejoindre la partie, le serveur doit servir directement le client buildé — pas le serveur de dev Vite, qui n'est accessible que depuis ta machine.

```bash
# 1. Build du client et du moteur partagé
npm run build -w shared
npm run build -w client

# 2. Build et lancement du serveur (sert aussi le bundle client)
npm run build -w server
npm run start -w server
```

Le serveur écoute alors sur le port `3000` et sert à la fois le jeu et l'API socket.io.

**Trouve l'adresse IP locale de ta machine** (celle qui héberge le serveur) :

- macOS/Linux : `ifconfig` ou `ip a` (cherche une adresse du type `192.168.x.x` ou `10.x.x.x`)
- Windows : `ipconfig` (champ "Adresse IPv4")

Les autres joueurs, connectés au **même réseau**, ouvrent alors dans leur navigateur :

```
http://<IP-du-serveur>:3000
```

Par exemple : `http://192.168.1.42:3000`

⚠️ Si ça ne fonctionne pas : vérifie que le pare-feu de la machine hôte autorise les connexions entrantes sur le port 3000 (sur macOS : Réglages Système → Réseau → Coupe-feu ; sur Windows : Pare-feu Windows Defender → autoriser une application).

### Tests et couverture

```bash
npm run test           # tous les workspaces
npm run coverage       # avec rapport de couverture (objectif sujet : 70% statements/functions/lines, 50% branches)
```

Pour un workspace précis : `npm run test -w shared`, `npm run coverage -w server`, etc.

### Règles du jeu

- Chaque joueur a son propre plateau, tous reçoivent la même séquence de pièces.
- Quand un joueur efface `n` lignes, les adversaires reçoivent `n - 1` lignes de pénalité (indestructibles) en bas de leur plateau.
- Le dernier joueur en vie gagne. Une partie peut se jouer en solo.
- Contrôles : flèches gauche/droite (déplacement), flèche haut (rotation), flèche bas (chute).
- Le premier arrivé dans une room est désigné leader : lui seul peut lancer la partie (le rôle peut être transféré à un autre joueur, ou passe automatiquement s'il quitte).
- Un joueur ne peut pas rejoindre une partie déjà en cours — il doit attendre la fin.
- Deux modes de vitesse au lancement : normal (1 pièce/seconde) et hard (1 pièce/0.25 seconde).

---

## 🇬🇧 English

### Stack

- **shared/** — pure game engine (stateless functions: collisions, rotation, line clearing, spectrum, piece distribution)
- **server/** — Node.js + Express + socket.io, OOP (`Game`, `Player`, `Piece` classes)
- **client/** — React + TypeScript + Redux Toolkit, pure functional components (no `this`)

Monorepo using npm workspaces.

### Requirements

- Node.js 20+
- npm 10+

### Install

```bash
git clone <repo-url>
cd red-tetris
npm install
```

### Run locally (development)

Two separate terminals, from the project root:

```bash
# Terminal 1 — server (API + socket.io on port 3000)
npm run dev:server

# Terminal 2 — client (Vite, proxied to the server)
npm run dev:client
```

Open the URL Vite gives you (usually `http://localhost:5173`).

To test multiplayer **on your own machine**, just open a second tab (or a private browsing window) on the same URL, with a different username, and join the same room.

### Run on a local network (LAN — multiple machines)

For other devices on the same network (Wi-Fi/Ethernet) to join the game, the server needs to serve the built client directly — not the Vite dev server, which is only reachable from your own machine.

```bash
# 1. Build the shared engine and the client
npm run build -w shared
npm run build -w client

# 2. Build and start the server (also serves the client bundle)
npm run build -w server
npm run start -w server
```

The server then listens on port `3000` and serves both the game and the socket.io API.

**Find your machine's local IP address** (the one hosting the server):

- macOS/Linux: `ifconfig` or `ip a` (look for something like `192.168.x.x` or `10.x.x.x`)
- Windows: `ipconfig` (look at "IPv4 Address")

Other players, connected to the **same network**, then open in their browser:

```
http://<server-IP>:3000
```

For example: `http://192.168.1.42:3000`

⚠️ If it doesn't work: check that the host machine's firewall allows incoming connections on port 3000 (macOS: System Settings → Network → Firewall; Windows: Windows Defender Firewall → allow an app).

### Tests and coverage

```bash
npm run test           # all workspaces
npm run coverage       # with a coverage report (subject target: 70% statements/functions/lines, 50% branches)
```

For a single workspace: `npm run test -w shared`, `npm run coverage -w server`, etc.

### Game rules

- Each player has their own board; everyone receives the same piece sequence.
- When a player clears `n` lines, opponents receive `n - 1` penalty lines (indestructible) at the bottom of their board.
- The last player standing wins. The game can be played solo.
- Controls: left/right arrows (move), up arrow (rotate), down arrow (soft drop).
- The first player to join a room becomes the leader: only they can start the game (the role can be transferred to another player, or passes automatically if they leave).
- A player can't join a game already in progress — they must wait until it ends.
- Two speed modes at launch: classic (1 piece/second) and hard (1 piece/0.25 second).