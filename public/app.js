const STORAGE_KEY = 'remote-chatgpt-state-v1';
const DEFAULT_SYSTEM_PROMPT =
  'Je bent ChatGPT, een behulpzame assistent. Beantwoord vragen duidelijk en in het Nederlands tenzij anders gevraagd.';

const chatLog = document.querySelector('#chat-log');
const chatForm = document.querySelector('#chat-form');
const messageInput = document.querySelector('#user-message');
const statusLine = document.querySelector('#status');
const systemInput = document.querySelector('#system-message');
const homeDescriptionInput = document.querySelector('#home-description');
const usageDetailsInput = document.querySelector('#usage-details');
const locationInput = document.querySelector('#location-climate');
const dataSourcesInput = document.querySelector('#data-sources');
const buildPromptButton = document.querySelector('#build-gasfree-prompt');
const temperatureInput = document.querySelector('#temperature');
const temperatureValue = document.querySelector('#temperature-value');
const clearButton = document.querySelector('#clear-chat');
const submitButton = chatForm.querySelector('button[type="submit"]');

const state = {
  conversation: [],
  loading: false,
};

init();

function init() {
  restoreState();
  renderConversation();
  updateTemperatureLabel();
  setStatus('Klaar om te chatten.');
}

function restoreState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      systemInput.value = DEFAULT_SYSTEM_PROMPT;
      syncSystemMessage();
      return;
    }

    const parsed = JSON.parse(raw);
    const systemMessage = typeof parsed.system === 'string' ? parsed.system : DEFAULT_SYSTEM_PROMPT;
    systemInput.value = systemMessage;

    const savedConversation = Array.isArray(parsed.conversation) ? parsed.conversation : [];
    state.conversation = savedConversation
      .filter((message) => isValidMessage(message))
      .map((message) => ({ role: message.role, content: message.content }));

    if (!state.conversation.some((message) => message.role === 'system') && systemMessage.trim()) {
      state.conversation.unshift({ role: 'system', content: systemMessage.trim() });
    } else {
      syncSystemMessage();
    }

    if (typeof parsed.temperature === 'string' || typeof parsed.temperature === 'number') {
      const tempValue = Number(parsed.temperature);
      if (!Number.isNaN(tempValue)) {
        temperatureInput.value = String(Math.min(Math.max(tempValue, 0), 1));
      }
    }
  } catch (error) {
    console.warn('Kon opgeslagen gesprek niet laden:', error);
    systemInput.value = DEFAULT_SYSTEM_PROMPT;
    syncSystemMessage();
  }
}

function isValidMessage(message) {
  return message && typeof message.role === 'string' && typeof message.content === 'string';
}

function persistState() {
  try {
    const data = {
      system: systemInput.value,
      temperature: temperatureInput.value,
      conversation: state.conversation.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Kon gesprek niet opslaan:', error);
  }
}

function renderConversation() {
  chatLog.innerHTML = '';
  if (state.conversation.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'chat__placeholder';
    emptyMessage.textContent = 'Nog geen berichten. Stel een vraag om te beginnen.';
    chatLog.append(emptyMessage);
    persistState();
    return;
  }

  const fragment = document.createDocumentFragment();
  state.conversation.forEach((message) => {
    fragment.append(createMessageElement(message));
  });

  chatLog.append(fragment);
  chatLog.scrollTop = chatLog.scrollHeight;
  persistState();
}

function createMessageElement(message) {
  const article = document.createElement('article');
  article.className = `message message--${message.role}`;

  const heading = document.createElement('header');
  heading.className = 'message__role';
  heading.textContent = roleLabel(message.role);
  article.append(heading);

  const content = document.createElement('div');
  content.className = 'message__content';

  const blocks = message.content.split(/\n{2,}/);
  blocks.forEach((block) => {
    const paragraph = document.createElement('p');
    block.split(/\n/).forEach((line, index) => {
      if (index > 0) {
        paragraph.append(document.createElement('br'));
      }
      paragraph.append(document.createTextNode(line));
    });
    content.append(paragraph);
  });

  article.append(content);
  return article;
}

function roleLabel(role) {
  switch (role) {
    case 'system':
      return 'Systeem';
    case 'assistant':
      return 'ChatGPT';
    case 'user':
      return 'Jij';
    default:
      return role;
  }
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (state.loading) {
    return;
  }

  const userText = messageInput.value.trim();
  if (!userText) {
    setStatus('Typ eerst een bericht.', 'warning');
    return;
  }

  syncSystemMessage();
  const userMessage = { role: 'user', content: userText };
  state.conversation.push(userMessage);
  messageInput.value = '';
  renderConversation();
  await requestCompletion(userMessage);
});

clearButton.addEventListener('click', () => {
  if (!state.conversation.length) {
    return;
  }

  const systemText = systemInput.value.trim();
  state.conversation = systemText ? [{ role: 'system', content: systemText }] : [];
  renderConversation();
  setStatus('Gesprek geleegd.');
});

systemInput.addEventListener('change', () => {
  syncSystemMessage();
  renderConversation();
  setStatus('Systeembericht bijgewerkt.');
});

temperatureInput.addEventListener('input', () => {
  updateTemperatureLabel();
  persistState();
});

if (buildPromptButton) {
  buildPromptButton.addEventListener('click', () => {
    const prompt = buildGasFreePrompt();
    messageInput.value = prompt;
    messageInput.focus();
    setStatus('Adviesprompt gegenereerd. Pas gerust aan en verstuur.', 'info');
  });
}

async function requestCompletion(lastUserMessage) {
  setLoading(true);
  setStatus('Antwoord opvragen...');

  const payload = {
    messages: state.conversation.map((message) => ({ role: message.role, content: message.content })),
  };

  const temperature = Number(temperatureInput.value);
  if (!Number.isNaN(temperature)) {
    payload.temperature = temperature;
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Onbekende fout van de server.');
    }

    const answer = typeof data.message === 'string' && data.message.trim() ? data.message.trim() : '(Geen inhoud in antwoord)';
    state.conversation.push({ role: 'assistant', content: answer });
    renderConversation();

    if (data.usage) {
      const { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: totalTokens } = data.usage;
      const parts = [
        typeof promptTokens === 'number' ? `prompt: ${promptTokens}` : null,
        typeof completionTokens === 'number' ? `antwoord: ${completionTokens}` : null,
        typeof totalTokens === 'number' ? `totaal: ${totalTokens}` : null,
      ].filter(Boolean);
      setStatus(`Antwoord ontvangen (${parts.join(', ')}).`);
    } else {
      setStatus('Antwoord ontvangen.');
    }
  } catch (error) {
    console.error('Fout bij het ophalen van antwoord:', error);
    const index = state.conversation.lastIndexOf(lastUserMessage);
    if (index !== -1) {
      state.conversation.splice(index, 1);
    }
    renderConversation();
    messageInput.value = lastUserMessage.content;
    messageInput.focus();
    setStatus(error.message, 'error');
  } finally {
    setLoading(false);
  }
}

function syncSystemMessage() {
  const systemText = systemInput.value.trim();
  const index = state.conversation.findIndex((message) => message.role === 'system');
  if (!systemText && index !== -1) {
    state.conversation.splice(index, 1);
    return;
  }

  if (systemText && index === -1) {
    state.conversation.unshift({ role: 'system', content: systemText });
  } else if (systemText) {
    state.conversation[index].content = systemText;
  }
}

function updateTemperatureLabel() {
  const value = Number(temperatureInput.value);
  temperatureValue.textContent = value.toFixed(1);
}

function setLoading(isLoading) {
  state.loading = isLoading;
  submitButton.disabled = isLoading;
  messageInput.disabled = isLoading;
  chatForm.classList.toggle('chat__form--loading', isLoading);
}

function setStatus(message, type = 'info') {
  statusLine.textContent = message;
  statusLine.dataset.type = type;
}

function buildGasFreePrompt() {
  const description = normalizeInput(homeDescriptionInput?.value, '');
  const usage = normalizeInput(usageDetailsInput?.value, '');
  const location = normalizeInput(
    locationInput?.value,
    'Geen locatie opgegeven; gebruik een typisch Nederlands klimaatprofiel en netbelasting.'
  );
  const dataSources = normalizeInput(
    dataSourcesInput?.value,
    'Geen online data meegeleverd; baseer je op generieke aannames en benoem welke data nog nodig is.'
  );

  const bulletLines = [
    `- Woning: ${description || 'Niet opgegeven; vraag naar bouwjaar, woningtype, isolatie en oppervlak.'}`,
    `- Verbruik/installaties: ${usage || 'Niet opgegeven; vraag naar jaarverbruik gas/elektra en huidige installaties.'}`,
    `- Locatie/klimaat: ${location}`,
    `- Data/voorkeuren: ${dataSources}`,
  ].join('\n');

  return [
    'Je bent een Nederlandse energie-adviseur gespecialiseerd in aardgasvrij wonen.',
    'Stel een geoptimaliseerde routekaart op met concrete maatregelen, volgorde, investeringsindicaties en verwachte besparing.',
    'Gebruik publieke weerdata, netbelasting en typische woningprofielen om hiaten op te vullen en stel gerichte vervolgvragen waar nodig.',
    'Beschikbare input:',
    bulletLines,
    "Lever drie scenario's: (1) snelle winst/laag budget, (2) gebalanceerd, (3) maximaal toekomstbestendig.",
    'Per scenario: isolatie, ventilatie, verwarming (all-electric of hybride warmtepomp), opwek (PV), opslag/regeling, subsidies (ISDE e.d.), terugverdientijd, CO₂-reductie, comfortimpact en aandachtspunten rond netcongestie.',
    'Sluit af met benodigde onderzoeken/vergunningen, volgorde van stappen, checklist voor aannemer/installateur en meetpunten om voortgang te bewaken.',
  ].join('\n');
}

function normalizeInput(value, fallback = '') {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || fallback;
}
