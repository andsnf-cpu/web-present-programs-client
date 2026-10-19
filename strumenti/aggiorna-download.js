'use strict';
// Copia l'ultimo installer (Setup) di ogni programma dalle release private alle release pubbliche di questo
// repository, dove lo scaricano i pulsanti "Scarica" del sito. Ogni programma ha la sua release, con il tag uguale
// al nome della pagina (pro-launcher, editor-pro, ...) e il file sempre con lo stesso nome: il link non cambia
// mai, quindi le pagine non vanno toccate. Se il file è già quello giusto (stesso SHA-256) non fa niente.
// Scrive anche il catalogo programmi.json (release "catalogo"), da cui PRO Launcher legge versioni e installer
// senza token, e copia latest.yml (con il nome fisso del file) per l'aggiornamento automatico del launcher.
// Uso:  node strumenti/aggiorna-download.js
// Token: RELEASES_TOKEN legge le release private, GITHUB_TOKEN scrive in questo repository; se mancano si usa
// quello di `gh auth login`. Su GitHub lo lancia da solo .github/workflows/aggiorna-download.yml.

const crypto = require('crypto');
const { execFileSync } = require('child_process');

const OWNER = 'andsnf-cpu';
const SITO = 'web-present-programs-client';
// tag della release (data-scarica nelle pagine) -> repository privato, nome, file scaricato dal sito
const PROGRAMMI = [
  { tag: 'pro-launcher', repo: 'pro-launcher-releases', nome: 'PRO Launcher', file: 'PRO-Launcher-Setup.exe' },
  { tag: 'editor-pro', repo: 'editor-pro-releases', nome: 'Editor PRO', file: 'Editor-PRO-Setup.exe' },
  { tag: 'provision-tour-editor', repo: 'provision-tour-editor-releases', nome: 'Provision Tour Editor', file: 'Provision-Tour-Editor-Setup.exe' },
  { tag: 'qr-studio', repo: 'qr-studio-releases', nome: 'QR Studio', file: 'QR-Studio-Setup.exe' },
  { tag: 'borin-client-finder', repo: 'borin-client-finder-releases', nome: 'Borin Client Finder', file: 'Borin-Client-Finder-Setup.exe' }
];

let ghToken;
const tokenGh = () => ghToken ??= execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
const LEGGE = process.env.RELEASES_TOKEN || tokenGh();
const SCRIVE = process.env.GITHUB_TOKEN || tokenGh();

async function api(token, url, { method = 'GET', body, headers = {}, ok404 = false } = {}) {
  const res = await fetch(url.startsWith('http') ? url : `https://api.github.com${url}`, {
    method,
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'User-Agent': SITO, ...headers },
    body
  });
  if (ok404 && res.status === 404) return null;
  if (!res.ok) throw new Error(`${method} ${url}: GitHub ha risposto ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

// Il file di una release privata: GitHub rimanda a un link firmato, dove il token non va mandato.
async function scarica(asset) {
  const res = await fetch(asset.url, {
    headers: { Accept: 'application/octet-stream', Authorization: `Bearer ${LEGGE}`, 'User-Agent': SITO },
    redirect: 'manual'
  });
  const dove = res.headers.get('location');
  const file = dove ? await fetch(dove) : res;
  if (!file.ok) throw new Error(`download di ${asset.name}: ${file.status}`);
  return Buffer.from(await file.arrayBuffer());
}

const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');
const data = iso => new Date(iso).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' });

/** Carica un file nella release del sito: prima con un nome provvisorio, poi lo rinomina al posto del vecchio */
async function carica(sito, nome, buf, hash) {
  const vecchio = sito.assets.find(a => a.name === nome);
  const nuovo = await api(SCRIVE, `https://uploads.github.com/repos/${OWNER}/${SITO}/releases/${sito.id}/assets?name=${encodeURIComponent(nome + '.nuovo')}`, {
    method: 'POST', body: buf, headers: { 'Content-Type': 'application/octet-stream' }
  });
  if (nuovo.digest && nuovo.digest !== `sha256:${hash}`) throw new Error(`${nome}: il file caricato non corrisponde`);
  if (vecchio) await api(SCRIVE, `/repos/${OWNER}/${SITO}/releases/assets/${vecchio.id}`, { method: 'DELETE' });
  await api(SCRIVE, `/repos/${OWNER}/${SITO}/releases/assets/${nuovo.id}`, { method: 'PATCH', body: JSON.stringify({ name: nome }) });
}

const releaseDelSito = tag => api(SCRIVE, `/repos/${OWNER}/${SITO}/releases/tags/${tag}`, { ok404: true });
const urlDelSito = (tag, nome) => `https://github.com/${OWNER}/${SITO}/releases/download/${tag}/${nome}`;

/** Copia l'ultimo Setup di un programma (se è cambiato) e restituisce la sua voce del catalogo */
async function aggiorna(p) {
  const rel = await api(LEGGE, `/repos/${OWNER}/${p.repo}/releases/latest`);
  const asset = rel.assets.find(a => /setup.*\.exe$/i.test(a.name));
  if (!asset) throw new Error(`${p.repo} ${rel.tag_name}: nessun Setup .exe nella release`);
  const voluto = (asset.digest || '').replace(/^sha256:/, '');
  const versione = rel.tag_name.replace(/^v/, '');

  let sito = await releaseDelSito(p.tag);
  const presente = sito && sito.assets.find(a => a.name === p.file);
  let hash = voluto, size = asset.size;
  if (presente && voluto && presente.digest === `sha256:${voluto}`) {
    console.log(`= ${p.nome.padEnd(22)} ${versione} già sul sito`);
  } else {
    const buf = await scarica(asset);
    hash = sha256(buf);
    size = buf.length;
    if (voluto && hash !== voluto) throw new Error(`${asset.name}: SHA-256 diverso da quello di GitHub, non lo pubblico`);
    const info = {
      name: `${p.nome} ${versione}`,
      body: `Ultima versione di **${p.nome}**: ${versione}, pubblicata il ${data(rel.published_at)}.\n\n` +
        `Il file si chiama sempre \`${p.file}\`, così il link del sito non cambia; a ogni nuova versione viene ` +
        `sostituito da solo.\n\nSHA-256: \`${hash}\``,
      make_latest: 'false'
    };
    if (!sito) {
      sito = await api(SCRIVE, `/repos/${OWNER}/${SITO}/releases`, {
        method: 'POST', body: JSON.stringify({ tag_name: p.tag, target_commitish: 'main', ...info })
      });
    }
    // restano solo il Setup e latest.yml; il resto (per esempio un .nuovo rimasto da un errore) si toglie
    for (const a of sito.assets) if (![p.file, 'latest.yml'].includes(a.name)) await api(SCRIVE, `/repos/${OWNER}/${SITO}/releases/assets/${a.id}`, { method: 'DELETE' });
    await carica(sito, p.file, buf, hash);
    await api(SCRIVE, `/repos/${OWNER}/${SITO}/releases/${sito.id}`, { method: 'PATCH', body: JSON.stringify(info) });
    sito = await releaseDelSito(p.tag);
    console.log(`+ ${p.nome.padEnd(22)} ${versione} pubblicata (${(buf.length / 1e6).toFixed(0)} MB, SHA-256 verificato)`);
  }

  // latest.yml (per l'aggiornamento automatico di chi lo usa, come PRO Launcher) con il nome fisso del file
  const yml = rel.assets.find(a => a.name === 'latest.yml');
  if (yml) {
    const buf = Buffer.from((await scarica(yml)).toString('utf8').split(asset.name).join(p.file));
    const h = sha256(buf);
    const ora = sito.assets.find(a => a.name === 'latest.yml');
    if (!ora || ora.digest !== `sha256:${h}`) {
      await carica(sito, 'latest.yml', buf, h);
      console.log(`+ ${p.nome.padEnd(22)} latest.yml per l'aggiornamento automatico`);
    }
  }

  // la descrizione dei repository -releases ("Solo gli installer di…") non dice cosa fa il programma: si lascia vuota
  const descr = ((await api(LEGGE, `/repos/${OWNER}/${p.repo}`)).description || '').trim();
  return {
    id: p.tag, name: p.nome, repo: `${OWNER}/${p.repo}`, description: /^solo gli installer/i.test(descr) ? '' : descr,
    version: versione, tag: rel.tag_name, publishedAt: rel.published_at, notes: rel.body || '',
    file: { name: asset.name, url: urlDelSito(p.tag, p.file), size, sha256: hash }
  };
}

/**
 * Il catalogo che legge PRO Launcher (senza token): per ogni programma versione, note e installer sul sito.
 * Sta nella release "catalogo" di questo repository, sempre con lo stesso nome. Si riscrive solo se cambia.
 */
async function scriviCatalogo(voci) {
  const CATALOGO = 'catalogo', FILE = 'programmi.json';
  let rel = await releaseDelSito(CATALOGO);
  const vecchio = rel && rel.assets.find(a => a.name === FILE);
  let prima = null;
  if (vecchio) {
    try { prima = await (await fetch(urlDelSito(CATALOGO, FILE))).json(); } catch { /* catalogo illeggibile: si riscrive */ }
  }
  // un programma che stavolta non si è potuto leggere tiene la voce di prima, che punta ancora a un file valido
  const tutte = PROGRAMMI.map(p => voci[p.tag] || (prima && (prima.programs || []).find(x => x.id === p.tag))).filter(Boolean);
  if (prima && JSON.stringify(prima.programs) === JSON.stringify(tutte)) {
    console.log(`= catalogo ${FILE} già aggiornato`);
    return;
  }
  const buf = Buffer.from(JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), programs: tutte }, null, 2) + '\n');
  if (!rel) {
    rel = await api(SCRIVE, `/repos/${OWNER}/${SITO}/releases`, {
      method: 'POST', body: JSON.stringify({
        tag_name: CATALOGO, target_commitish: 'main', name: 'Catalogo dei programmi', make_latest: 'false',
        body: `\`${FILE}\`: per ogni programma l'ultima versione, le note e l'installer su questo sito, con lo SHA-256. ` +
          'Lo legge PRO Launcher per sapere cosa c\'è di nuovo, senza token. Si aggiorna da solo insieme agli installer.'
      })
    });
  }
  await carica(rel, FILE, buf, sha256(buf));
  console.log(`+ catalogo ${FILE} aggiornato (${tutte.map(v => `${v.name} ${v.version}`).join(', ')})`);
}

(async () => {
  let errori = 0;
  const voci = {};
  for (const p of PROGRAMMI) {
    try { voci[p.tag] = await aggiorna(p); } catch (e) { errori++; console.error(`! ${p.nome}: ${e.message}`); }
  }
  try { await scriviCatalogo(voci); } catch (e) { errori++; console.error(`! catalogo: ${e.message}`); }
  if (errori) process.exit(1);
})();
