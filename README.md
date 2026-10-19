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

I pulsanti "Scarica" (`data-scarica="..."`) scaricano l'installer dalle [release di questo
repository](https://github.com/andsnf-cpu/web-present-programs-client/releases), che è pubblico (le release dei
programmi sono private). Ogni programma ha la sua release, con il tag uguale al `data-scarica` e il file sempre con
lo stesso nome, per esempio `releases/download/pro-launcher/PRO-Launcher-Setup.exe`: il link non cambia mai.
`scarica.js` legge la versione dalle release e la scrive accanto al pulsante.

**PRO Launcher legge da qui, senza token.** La release `catalogo` contiene `programmi.json`: per ogni programma
l'ultima versione, le note, il link dell'installer su questo sito e il suo SHA-256
(`releases/download/catalogo/programmi.json`). PRO Launcher 1.1.0 e successivi lo leggono per sapere cosa c'è di
nuovo e scaricano gli installer da qui; il launcher stesso si aggiorna con `releases/download/pro-launcher/latest.yml`
(copiato dalla release privata con il nome fisso del file). Sono download normali, non domande alle API di GitHub:
nessun token sui PC e nessun limite di 60 richieste all'ora.

A ogni nuova versione di un programma `strumenti/aggiorna-download.js` copia il suo Setup dalla release privata
(verificato con lo SHA-256 di GitHub) al posto di quello vecchio, poi riscrive `programmi.json`; i file già uguali
non li tocca. Se un programma non si riesce a leggere, nel catalogo resta la sua voce di prima.

**Dopo ogni pubblicazione** conviene lanciarlo subito (da qui sotto, "Subito, a mano"): il giro periodico è solo una
riserva, perché GitHub può ritardare o saltare i workflow pianificati.

- **Da solo**: `.github/workflows/aggiorna-download.yml` lo lancia ogni 10 minuti (ai minuti 4, 14, 24…). Serve il secret
  `RELEASES_TOKEN` (Settings › Secrets and variables › Actions): lo stesso token di sola lettura delle release che
  usa PRO Launcher. GitHub sospende i workflow pianificati dopo 60 giorni senza commit nel repository: se succede,
  si riattiva da Actions › Aggiorna i download › Enable workflow.
- **Subito, a mano**: `node strumenti/aggiorna-download.js` (usa il token di `gh auth login`), oppure
  `gh workflow run aggiorna-download.yml -R andsnf-cpu/web-present-programs-client`.

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
