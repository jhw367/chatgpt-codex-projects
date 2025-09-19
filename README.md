# ChatGPT op afstand

Een compacte Node.js-toepassing waarmee je via een eigen OpenAI API-sleutel een privé webinterface voor ChatGPT kunt hosten. De webapp bestaat uit een eenvoudige backend (zonder externe afhankelijkheden) die verzoeken doorstuurt naar de OpenAI Chat Completions API en een moderne frontend waar je het gesprek beheert.

## Functies

- 📡 **Eigen proxy** – verstuur gesprekken naar OpenAI via jouw server, zonder dat de sleutel in de browser terechtkomt.
- 💬 **Intuïtieve chatinterface** – gespreksoverzicht, systeembericht, temperatuurregeling en statusfeedback.
- 🔒 **Lokale opslag** – het volledige gesprek en je instellingen blijven in de browser (localStorage).
- ⚙️ **Aanpasbaar model** – kies optioneel een ander model via de omgeving (`OPENAI_MODEL`).

## Aan de slag

### Vereisten

- Node.js 18 of hoger
- Een geldige OpenAI API-sleutel met toegang tot het gewenste chatmodel

### Installatie

1. Kopieer `.env.example` naar `.env` en vul je API-sleutel in:

   ```bash
   cp .env.example .env
   # Bewerk .env en voeg je sleutel toe
   ```

2. Start de server:

   ```bash
   npm start
   ```

3. Open je browser en ga naar <http://localhost:3000> om te beginnen met chatten.

### Beschikbare scripts

- `npm start` – start de HTTP-server.
- `npm run lint` – controleert de server op syntaxisfouten (`node --check`).

## Omgevingsvariabelen

| Variabele        | Beschrijving                                                                 | Standaard         |
| ---------------- | ----------------------------------------------------------------------------- | ----------------- |
| `OPENAI_API_KEY` | Vereist. Je persoonlijke OpenAI sleutel.                                      | –                 |
| `OPENAI_MODEL`   | Optioneel. Het model dat je wilt gebruiken (bijv. `gpt-4o-mini`).             | `gpt-3.5-turbo`   |
| `PORT`           | Optioneel. Poort waarop de server luistert.                                   | `3000`            |

> De server laadt automatisch variabelen uit een `.env`-bestand in de hoofdmap als dat aanwezig is.

## Hoe het werkt

- De backend accepteert POST-verzoeken op `/api/chat` met een `messages`-array in het OpenAI formaat.
- Het verzoek wordt doorgestuurd naar `https://api.openai.com/v1/chat/completions`.
- De frontend bewaart het gesprek lokaal, zodat je pagina verversen zonder historie te verliezen.

## Veiligheidsnotities

- Houd je `.env`-bestand privé. Deel je API-sleutel nooit client-side.
- Overweeg extra authenticatie wanneer je de server publiekelijk toegankelijk maakt.

Veel chatplezier!
