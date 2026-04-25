const checklistItems = [
  'Host je wiki-viewer met HTTPS (Cloudflare Tunnel, Tailscale Funnel of VPS + Caddy).',
  'Gebruik een subdomein zoals kb.jouwdomein.nl en activeer basic auth of SSO.',
  'Maak de site responsive en stel viewport-fit=cover in voor de iPhone notch.',
  'Voeg een /api/ask endpoint toe dat alleen server-side met je LLM provider praat.',
  'Laat batch-jobs (ingest/compile/lint) als background worker draaien op je server.',
  'Sla output op als markdown in git; toon changelog en backlinks in de webviewer.',
  'Zet de webapp op homescreen via Safari (delen → Zet op beginscherm).',
  'Gebruik dagelijkse snapshots/backups zodat je knowledge base herstelbaar blijft.',
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

const listElement = document.querySelector('#iphone-checklist');
const treeElement = document.querySelector('#tree-output');
const statusElement = document.querySelector('#status');
const copyChecklistButton = document.querySelector('#copy-checklist');
const copyTreeButton = document.querySelector('#copy-tree');

init();

function init() {
  renderChecklist();
  treeElement.textContent = folderTree;

  copyChecklistButton?.addEventListener('click', async () => {
    const text = checklistItems.map((item, index) => `${index + 1}. ${item}`).join('\n');
    await copyText(text, 'Checklist gekopieerd.');
  });

  copyTreeButton?.addEventListener('click', async () => {
    await copyText(folderTree, 'Mappenstructuur gekopieerd.');
  });
}

function renderChecklist() {
  checklistItems.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    listElement?.appendChild(li);
  });
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
