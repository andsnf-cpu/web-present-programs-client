# web-present-programs-client

Il sito che presenta i programmi: una pagina per ognuno (a cosa serve, cosa fa, dove si scarica) più l'indice
con tutti.

**Online:** https://andsnf-cpu.github.io/web-present-programs-client/

Lo pubblica GitHub Pages dal ramo `main`: ogni modifica inviata a GitHub (push) va online da sola dopo circa
un minuto. Sul computer le pagine si aprono anche con un doppio clic su `index.html`, senza server.

| File | Contenuto |
|---|---|
| `index.html` | Tutti i programmi, con il consiglio di installare PRO Launcher |
| `editor-pro.html`, `provision-tour-editor.html`, `qr-studio.html`, `borin-client-finder.html`, `pro-launcher.html` | La scheda di ogni programma |
| `stile.css` | Lo stile comune, con tema chiaro e scuro automatico |
| `img/` | Le icone dei programmi, prese dai loro repository |

Il colore di ogni scheda è quello dell'icona del programma: sta nel `<body>`, come
`style="--accent-l:#2F6E96; --accent-d:#6FB2DE"` (tema chiaro e tema scuro).

## Download

Gli installer dei programmi **non sono pubblici**: stanno nelle release private (`<programma>-releases`) e li
scarica PRO Launcher con il token di sola lettura delle release, che l'amministratore inserisce la prima volta.
Sulle schede dei programmi il pulsante porta a PRO Launcher.

Sul sito si scarica direttamente **solo PRO Launcher**, da [`pro-launcher-releases`](https://github.com/andsnf-cpu/pro-launcher-releases/releases/latest),
l'unico repository di release pubblico (da solo, senza token, il launcher non mostra nessun programma). I pulsanti
puntano alla pagina dell'ultima release; `scarica.js` chiede a GitHub l'ultima versione e li trasforma nel link
diretto all'installer, con la versione accanto. Dopo una nuova versione del launcher non c'è niente da fare qui.

La release `pro-launcher` di questo repository resta ferma alla 1.1.2: serve solo ai launcher 1.1.0 e 1.1.1, che si
aggiornavano da lì, per arrivare alla 1.1.2, che si aggiorna da `pro-launcher-releases`. Non va cancellata.

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
