const quickstartSteps = [
  'Installeer Node.js 18+ en maak een lege map voor je kennisbank.',
  'Zet je bronbestanden in raw/ (artikelen, papers, screenshots, datasets).',
  'Start deze app met npm start en controleer http://localhost:3000.',
  'Laat een LLM script markdown-pagina\'s schrijven in wiki/ (met backlinks).',
  'Gebruik ask/lint scripts om antwoorden en verbeteringen terug te schrijven.',
];

const privateSteps = [
  'Maak een .env bestand met PRIVATE_MODE=true.',
  'Voeg BASIC_AUTH_USER en BASIC_AUTH_PASSWORD toe (sterk wachtwoord).',
  'Start opnieuw: npm start. Daarna vraagt de browser om in te loggen.',
  'Zet er HTTPS voor (bijv. Caddy, Cloudflare Tunnel of Tailscale).',
  'Deel alleen met jezelf of je team; houd je API key server-side.',
];

const checklistItems = [
  'Voeg de site toe aan iPhone homescreen (Safari → Deel → Zet op beginscherm).',
  'Gebruik een duidelijk domein, bijvoorbeeld kb.jouwdomein.nl.',
  'Houd tekstblokken kort en gebruik grote klikbare knoppen.',
  'Sla output op in markdown zodat alles doorzoekbaar blijft.',
  'Maak dagelijks een backup/snapshot van je knowledge base.',
];

const folderTree = `knowledge-base/
├─ raw/
│  ├─ articles/
│  ├─ papers/
│  ├─ datasets/
│  └─ images/
├─ wiki/
│  ├─ concepts/
│  ├─ entities/
│  ├─ timelines/
│  └─ index.md
├─ outputs/
│  ├─ answers/
│  ├─ slides/
│  └─ plots/
├─ tools/
│  ├─ ingest.js
│  ├─ compile.js
│  ├─ ask.js
│  └─ lint.js
└─ logs/`;

const quickstartListElement = document.querySelector('#quickstart-list');
const privateListElement = document.querySelector('#private-list');
const checklistElement = document.querySelector('#iphone-checklist');
const treeElement = document.querySelector('#tree-output');
const privatePillElement = document.querySelector('#private-pill');
const statusElement = document.querySelector('#status');
const copyChecklistButton = document.querySelector('#copy-checklist');
const copyTreeButton = document.querySelector('#copy-tree');

init();

async function init() {
  renderList(quickstartListElement, quickstartSteps, 'ol');
  renderList(privateListElement, privateSteps, 'ol');
  renderList(checklistElement, checklistItems, 'ul');
  treeElement.textContent = folderTree;

  copyChecklistButton?.addEventListener('click', async () => {
    const text = checklistItems.map((item, index) => `${index + 1}. ${item}`).join('\n');
    await copyText(text, 'Checklist gekopieerd.');
  });

  copyTreeButton?.addEventListener('click', async () => {
    await copyText(folderTree, 'Mappenstructuur gekopieerd.');
  });

  await updatePrivateModePill();
}

function renderList(element, items) {
  if (!element) return;
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    element.appendChild(li);
  });
}

async function updatePrivateModePill() {
  if (!privatePillElement) return;

  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error('config laden mislukt');
    }

    const data = await response.json();
    if (data.privateMode) {
      privatePillElement.textContent = 'PRIVATE MODE: aan';
      privatePillElement.dataset.mode = 'on';
    } else {
      privatePillElement.textContent = 'PRIVATE MODE: uit';
      privatePillElement.dataset.mode = 'off';
    }
  } catch (error) {
    privatePillElement.textContent = 'Private mode onbekend';
    privatePillElement.dataset.mode = 'unknown';
  }
}

async function copyText(text, successMessage) {
  if (!navigator.clipboard) {
    setStatus('Clipboard API niet beschikbaar op dit apparaat/browser.', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus(successMessage, 'success');
  } catch (error) {
    console.error('Kopiëren mislukt', error);
    setStatus('Kopiëren mislukt. Geef toestemming voor klembordtoegang.', 'error');
  }
}

function setStatus(message, type) {
  statusElement.textContent = message;
  statusElement.dataset.type = type;
}
