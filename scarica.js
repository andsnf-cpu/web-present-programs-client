// I pulsanti "Scarica" di PRO Launcher puntano alla pagina dell'ultima release di pro-launcher-releases (l'unico
// repository di release pubblico). Qui si chiede a GitHub l'ultima versione: il pulsante diventa il link diretto
// all'installer e la versione si scrive accanto. Se GitHub non risponde, il pulsante apre la pagina della release.
(async () => {
  const CHIAVE = 'pro-launcher-ultima';
  let ultima;
  try {
    const c = JSON.parse(sessionStorage.getItem(CHIAVE));
    if (c && Date.now() - c.quando < 10 * 60 * 1000) ultima = c.ultima;
  } catch { /* senza sessionStorage si rilegge da GitHub */ }
  if (!ultima) {
    try {
      const res = await fetch('https://api.github.com/repos/andsnf-cpu/pro-launcher-releases/releases/latest');
      if (!res.ok) return;
      const r = await res.json();
      const setup = (r.assets || []).find(a => /setup.*\.exe$/i.test(a.name));
      if (!setup) return;
      ultima = { versione: String(r.tag_name || '').replace(/^v/i, ''), url: setup.browser_download_url };
      try { sessionStorage.setItem(CHIAVE, JSON.stringify({ quando: Date.now(), ultima })); } catch { /* niente */ }
    } catch { return; }
  }
  for (const a of document.querySelectorAll('[data-scarica="pro-launcher"]')) {
    a.href = ultima.url;
    a.title = `Versione ${ultima.versione}`;
  }
  for (const el of document.querySelectorAll('[data-versione="pro-launcher"]')) el.textContent = ` (${ultima.versione})`;
})();
