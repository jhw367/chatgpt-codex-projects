# LLM Knowledge Base Starter (mobile-first)

Deze app is een **eenvoudige startpagina voor leken** om een LLM-gedreven kennisbank op te zetten en te gebruiken vanaf desktop en iPhone 14 Pro Max.

## Wat je krijgt

- Een webpagina met duidelijke stappen (zonder veel jargon).
- Een iPhone-checklist en kopieerbare mappenstructuur.
- Een Node.js backend met `/api/chat` relay.
- Optionele **private mode** met Basic Auth.

---

## Van Codex → GitHub → zelf uitproberen (stap voor stap)

> Doel: je wil precies weten hoe je de code uit Codex op GitHub krijgt, lokaal draait en op iPhone test.

### Stap 1 — Laat Codex wijzigingen maken

**Wat je doet:** vraag Codex om aanpassingen.

**Waarom:** Codex werkt in een git-repo en kan commits voor je maken.

**Resultaat:** er komt een commit op je huidige branch.

---

### Stap 2 — Controleer lokaal of alles syntactisch klopt

```bash
npm run lint
```

**Waarom:** hiermee check je snel of de server-code geen syntaxfouten heeft.

**Resultaat:** je ziet of `src/server.js` geldig is.

---

### Stap 3 — Push je branch naar GitHub

```bash
git push origin <jouw-branch-naam>
```

**Waarom:** zonder push staat je commit alleen lokaal/in Codex-omgeving.

**Resultaat:** je branch + commit staan op GitHub.

---

### Stap 4 — Open een Pull Request op GitHub

**Wat je doet:** ga naar GitHub, kies je branch en klik **Compare & pull request**.

**Waarom:** zo kun je de wijzigingen reviewen voor je merge.

**Resultaat:** een PR met diff, comments en CI checks.

---

### Stap 5 — Merge de PR

**Wat je doet:** klik **Merge pull request** (als checks groen zijn).

**Waarom:** hiermee komt de wijziging op je hoofdbranch (`main` of `master`).

**Resultaat:** je project bevat de nieuwe versie.

---

### Stap 6 — Clone (of pull) op je eigen laptop

Als je nog niet gecloned hebt:

```bash
git clone <jouw-github-repo-url>
cd <repo-map>
```

Als je al een clone hebt:

```bash
git checkout main
git pull
```

**Waarom:** je wil de nieuwste code lokaal draaien.

---

### Stap 7 — Installeer afhankelijkheden

```bash
npm install
```

**Waarom:** Node heeft packages nodig uit `package.json`.

---

### Stap 8 — Maak een `.env` bestand

Maak in de projectroot een `.env` met:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
PORT=3000

# Optioneel maar aanbevolen voor private toegang
PRIVATE_MODE=true
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=kies-een-sterk-wachtwoord
```

**Waarom:** zonder API key werkt `/api/chat` niet; private mode beschermt je app.

---

### Stap 9 — Start de app

```bash
npm start
```

Open daarna: <http://localhost:3000>

**Waarom:** nu draait de webapp lokaal.

---

### Stap 10 — Test op iPhone 14 Pro Max

1. Zorg dat iPhone en laptop op hetzelfde wifi-netwerk zitten.
2. Zoek je lokale IP van je laptop (bijv. `192.168.1.23`).
3. Open op iPhone: `http://192.168.1.23:3000`
4. Als `PRIVATE_MODE=true`: log in met je Basic Auth gegevens.

**Waarom:** zo check je de echte mobiele ervaring.

---

## 1) Lokaal draaien (korte versie)

1. Installeer **Node.js 18+**.
2. Clone deze repo.
3. Maak een `.env` bestand.
4. Start de app:

   ```bash
   npm start
   ```

5. Open in je browser: <http://localhost:3000>

Voor iPhone in je thuisnetwerk: open `http://<jouw-laptop-ip>:3000` op je iPhone.

---

## 2) Private zetten i.p.v. public

Minimaal advies (simpel en effectief):

1. Zet `PRIVATE_MODE=true` + Basic Auth variabelen in `.env`.
2. Gebruik HTTPS reverse proxy (bijv. Caddy/Tailscale/Cloudflare Tunnel).
3. Deel alleen je beveiligde URL.
4. Houd je API key altijd server-side (nooit in frontend code).

---

## 3) Scripts

- `npm start` – start de HTTP-server.
- `npm run lint` – syntaxischeck van de server (`node --check src/server.js`).
