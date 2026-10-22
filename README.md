# web-present-programs-client

Il sito che presenta i programmi: una pagina per ognuno (a cosa serve, cosa fa, dove si scarica) più l'indice
con tutti.

**Online:** https://andsnf-cpu.github.io/web-present-programs-client/

Lo pubblica GitHub Pages dal ramo `main` (Settings › Pages › Deploy from a branch, `main`, `/ (root)`): ogni
modifica inviata a GitHub (push) va online da sola dopo circa un minuto. Con il piano gratuito Pages funziona solo
se il repository è pubblico: se diventa privato il sito si spegne, e quando torna pubblico Pages va riattivato a
mano. Sul computer le pagine si aprono anche con un doppio clic su `index.html`, senza server.

| File | Contenuto |
|---|---|
| `index.html` | Tutti i programmi, con il consiglio di installare Borin Ecosystem |
| `editor-pro.html`, `provision-tour-editor.html`, `qr-studio.html`, `borin-client-finder.html`, `borin-dub.html`, `checklist-ordini.html`, `borin-ecosystem.html` | La scheda di ogni programma |
| `pro-launcher.html` | Rimanda a `borin-ecosystem.html` (PRO Launcher si chiama Borin Ecosystem dalla 1.3.0): i vecchi link continuano a funzionare |
| `stile.css` | Lo stile comune, con tema chiaro e scuro automatico |
| `img/` | Le icone dei programmi, prese dai loro repository (Borin DUB e Checklist Ordini, dell'account WiiZexx, hanno la sigla e il colore che usano in Borin Ecosystem) |

Il nome della scheda è quello del repository delle release senza `-releases` (per esempio `qr-studio.html` per
`qr-studio-releases`, `borin-dub.html` per `WiiZexx/borin-dub`): così Borin Ecosystem la trova da solo e mostra
**Apri pagina prodotto** nel menu ⋯ del programma.

Il colore di ogni scheda è quello dell'icona del programma: sta nel `<body>`, come
`style="--accent-l:#2F6E96; --accent-d:#6FB2DE"` (tema chiaro e tema scuro).

## Download

Gli installer dei programmi **non sono pubblici**: stanno nelle release private (`<programma>-releases`) e li
scarica Borin Ecosystem con il token di sola lettura delle release. Dalla 1.1.3 nei PC dell'ufficio il token arriva da
solo dalla cartella di rete, dove l'amministratore lo condivide una volta dal launcher; altrimenti lo inserisce lui
la prima volta. Sulle schede dei programmi il pulsante porta a Borin Ecosystem.

Sul sito si scarica direttamente **solo Borin Ecosystem**, da [`pro-launcher-releases`](https://github.com/andsnf-cpu/pro-launcher-releases/releases/latest),
l'unico repository di release pubblico (da solo, senza token, il launcher non mostra nessun programma). I pulsanti
puntano alla pagina dell'ultima release; `scarica.js` chiede a GitHub l'ultima versione e li trasforma nel link
diretto all'installer, con la versione accanto. Dopo una nuova versione del launcher non c'è niente da fare qui.

La release `pro-launcher` di questo repository resta ferma alla 1.1.2: serviva ai launcher 1.1.0 e 1.1.1, che si
aggiornavano da lì, per arrivare alla 1.1.2, che si aggiorna da `pro-launcher-releases`. Funziona solo finché il
repository è pubblico; non va cancellata.

## Aggiungere un tutorial

In fondo a ogni scheda c'è la sezione **Tutorial**. Dentro c'è un commento con il modello da copiare:

```html
<li><a href="tutorial/editor-pro-primo-documento.html">
  <span class="t-title">Il primo documento</span>
  <span class="t-desc">Dal layout alla prima pagina con foto e testo.</span>
  <span class="t-meta">5 minuti</span>
</a></li>
```

1. Copia il blocco dentro `<ol class="tutorial-list"></ol>` e cambia titolo, descrizione e durata.
2. Metti la pagina del tutorial nella cartella `tutorial/` (da creare la prima volta), oppure fai puntare
   `href` a un video o a un PDF.
3. Appena l'elenco ha il primo tutorial, l'avviso "I tutorial arriveranno qui" sparisce da solo.

Programmi non ancora inclusi: tZn Jungle (personale, le sue release sono private) ed ECU Viewer & Tuner
(in sviluppo).
