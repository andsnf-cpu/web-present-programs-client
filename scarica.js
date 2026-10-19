// Scrive accanto ai pulsanti "Scarica" la versione dell'installer, letta dalle release pubbliche di questo sito
// (le tiene aggiornate strumenti/aggiorna-download.js). Se GitHub non risponde, i pulsanti funzionano lo stesso.
(async () => {
  const CHIAVE = 'versioni-download';
  let versioni;
  try {
    const c = JSON.parse(sessionStorage.getItem(CHIAVE));
    if (c && Date.now() - c.quando < 10 * 60 * 1000) versioni = c.versioni;
  } catch { /* senza sessionStorage si rilegge da GitHub */ }
  if (!versioni) {
    try {
      const res = await fetch('https://api.github.com/repos/andsnf-cpu/web-present-programs-client/releases?per_page=50');
      if (!res.ok) return;
      versioni = {};
      for (const r of await res.json()) {
        const v = /(\d+(?:\.\d+)+)\s*$/.exec(r.name || '');
        if (v) versioni[r.tag_name] = v[1];
      }
      try { sessionStorage.setItem(CHIAVE, JSON.stringify({ quando: Date.now(), versioni })); } catch { /* niente */ }
    } catch { return; }
  }
  for (const el of document.querySelectorAll('[data-versione]')) {
    if (versioni[el.dataset.versione]) el.textContent = ` (${versioni[el.dataset.versione]})`;
  }
  for (const a of document.querySelectorAll('[data-scarica]')) {
    if (versioni[a.dataset.scarica]) a.title = `Versione ${versioni[a.dataset.scarica]}`;
  }
})();
