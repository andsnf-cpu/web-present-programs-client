'use strict';
// Aggiorna i pulsanti "Scarica" del sito con il link di download diretto di ogni installer su Google Drive.
// Legge la cartella condivisa (pubblica, senza accesso), trova per ogni programma il Setup con la versione
// più alta e riscrive l'href dei link con data-scarica="<programma>". Se un programma non è ancora nella
// cartella, il suo pulsante apre la cartella intera.
// Uso:  node strumenti/link-drive.js        (poi commit e push: GitHub Pages pubblica da solo)

const fs = require('fs');
const path = require('path');

const FOLDER_ID = '1cBe6afaZZszlhJMnpYO0ydkjK_T5n5dj';
const FOLDER = `https://drive.google.com/drive/folders/${FOLDER_ID}?usp=sharing`;
// programma (data-scarica) -> nome del file su Drive
const PROGRAMMI = {
  'pro-launcher': /^PRO-Launcher-Setup-(\d+(?:\.\d+)*)\.exe$/i,
  'editor-pro': /^Editor-PRO-Setup-(\d+(?:\.\d+)*)\.exe$/i,
  'provision-tour-editor': /^Provision-Tour-Editor-Setup-(\d+(?:\.\d+)*)\.exe$/i,
  'qr-studio': /^QR-Studio-Setup-(\d+(?:\.\d+)*)\.exe$/i,
  'borin-client-finder': /^Borin-Client-Finder-Setup-(\d+(?:\.\d+)*)\.exe$/i
};
const ROOT = path.join(__dirname, '..');
// download diretto: confirm=t salta la pagina di Google sui file troppo grandi per l'antivirus
const directLink = id => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;

const compare = (a, b) => {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
};

(async () => {
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}`);
  if (!res.ok) throw new Error(`Google Drive ha risposto ${res.status}: la cartella è ancora condivisa con chiunque abbia il link?`);
  const html = await res.text();
  const files = [...html.matchAll(/id="entry-([^"]+)"[\s\S]*?class="flip-entry-title">([^<]*)/g)].map(m => ({ id: m[1], name: m[2].trim() }));

  const links = {};
  for (const [slug, re] of Object.entries(PROGRAMMI)) {
    const best = files.map(f => ({ ...f, m: re.exec(f.name) })).filter(f => f.m).sort((a, b) => compare(b.m[1], a.m[1]))[0];
    links[slug] = best ? directLink(best.id) : FOLDER;
    console.log(`${slug.padEnd(24)} ${best ? best.name : '(non ancora nella cartella: il pulsante apre la cartella)'}`);
  }

  let changed = 0;
  for (const file of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
    const p = path.join(ROOT, file);
    const before = fs.readFileSync(p, 'utf8');
    const after = before.replace(/data-scarica="([a-z-]+)" href="[^"]*"/g, (all, slug) => links[slug] ? `data-scarica="${slug}" href="${links[slug]}"` : all);
    if (after !== before) { fs.writeFileSync(p, after); changed++; }
  }
  console.log(changed ? `Link aggiornati in ${changed} pagine: fai commit e push.` : 'I link erano già aggiornati.');
})().catch(e => { console.error(e.message); process.exit(1); });
