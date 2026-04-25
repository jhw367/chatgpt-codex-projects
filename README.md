# LLM Knowledge Base (mobile-first)

Een compacte Node.js-app die een blueprint toont voor het bouwen van een **LLM-gedreven kennisbank** die goed werkt op desktop én iPhone 14 Pro Max.

## Wat deze app laat zien

- Een praktisch stappenplan voor de workflow: `raw/` → compilatie naar wiki → Q&A → outputs → linting.
- Een mobiele checklist om je stack veilig/publiceerbaar te maken voor iPhone-gebruik.
- Een kopieerbare starter mappenstructuur voor je knowledge-base repository.

## Starten

```bash
npm start
```

Open daarna <http://localhost:3000>.

## Beschikbare scripts

- `npm start` – start de server.
- `npm run lint` – syntaxischeck van de server (`node --check src/server.js`).

## Opmerking

De backend ondersteunt nog steeds `/api/chat` als relay-endpoint voor OpenAI, zodat je deze basis later kunt uitbreiden met echte ingest/compile/ask tooling.
