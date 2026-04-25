# LLM Knowledge Base Starter (mobile-first)

Deze app is een **eenvoudige startpagina voor leken** om een LLM-gedreven kennisbank op te zetten en te gebruiken vanaf desktop en iPhone 14 Pro Max.

## Wat je krijgt

- Een webpagina met duidelijke stappen (zonder veel jargon).
- Een iPhone-checklist en kopieerbare mappenstructuur.
- Een Node.js backend met `/api/chat` relay.
- Optionele **private mode** met Basic Auth.

---

## 1) Lokaal draaien (stap voor stap)

1. Installeer **Node.js 18+**.
2. Clone deze repo.
3. Maak een `.env` bestand (zie voorbeeld hieronder).
4. Start de app:

   ```bash
   npm start
   ```

5. Open in je browser: <http://localhost:3000>

Voor iPhone in je thuisnetwerk: open `http://<jouw-laptop-ip>:3000` op je iPhone.

---

## 2) .env voorbeeld

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
PORT=3000

# Private mode (optioneel, sterk aanbevolen zodra je extern publiceert)
PRIVATE_MODE=true
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=kies-een-sterk-wachtwoord
```

> Als `PRIVATE_MODE=true` staat, vraagt de app om gebruikersnaam/wachtwoord voordat pagina/API bereikbaar zijn.

---

## 3) Private zetten i.p.v. public

Minimaal advies (simpel en effectief):

1. Zet `PRIVATE_MODE=true` + Basic Auth variabelen in `.env`.
2. Gebruik HTTPS reverse proxy (bijv. Caddy/Tailscale/Cloudflare Tunnel).
3. Deel alleen je beveiligde URL.
4. Houd je API key altijd server-side (nooit in frontend code).

---

## 4) Scripts

- `npm start` – start de HTTP-server.
- `npm run lint` – syntaxischeck van de server (`node --check src/server.js`).

