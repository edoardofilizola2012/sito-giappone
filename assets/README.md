# Immagini Personalizzate per il Sito

Questo sistema permette di sostituire automaticamente gli SVG del sito con le tue immagini personalizzate, mantenendo l'interattività con **marker visibili**!

## 🎯 Nuovo Sistema: Marker con Puntini e Scritte

Ora invece di zone trasparenti, le immagini hanno **puntini rossi cliccabili** con **etichette** che appaiono al passaggio del mouse!

### 🔴 Come Funzionano i Marker:
- **Puntini rossi** posizionati strategicamente sulle immagini
- **Etichette** che appaiono quando passi il mouse sopra
- **Clicca sui puntini** per vedere le informazioni
- **Sempre visibili** (non più nascosti come le vecchie zone)

### 🐛 Debug Mode:
- **Pulsante "Debug Zone"** in basso a destra (rosso)
- Mostra/nasconde le etichette dei marker
- Utile per vedere tutte le posizioni cliccabili

## ⚠️ Importante: Calibrazione dei Marker

I marker sono posizionati basandosi sulle proporzioni degli SVG originali. Se le tue immagini hanno dimensioni diverse, potresti dover regolare le posizioni.

### 🔧 Come Calibrare (Ancora Più Facile!):
1. **Aggiungi le tue immagini** nella cartella `assets/`
2. **Apri il sito** nel browser
3. **Clicca "🎯 Calibra"** (pulsante verde in basso a destra)
4. **Clicca sul punto** dell'immagine dove vuoi il marker
5. **Scrivi il nome** del marker quando te lo chiede (es: "Tokyo", "Onda")
6. **Mandami le coordinate** che appaiono - io aggiorno automaticamente!

**🎯 NOVITÀ:** Ora specifichi anche il nome del marker che vuoi posizionare!

**✅ MARKER CALIBRATI:** Hokkaido (74.07%, 16.32%), Honshu (59.79%, 59.08%), Fuji nell'Onda (64.80%, 68.63%)

**Le coordinate sono percentuali - funzionano con qualsiasi dimensione!**

## Nomi dei File Richiesti

Per attivare le immagini personalizzate, aggiungi questi file nella cartella `assets/`:

- `monte-fuji.jpg` → Sostituisce l'SVG del Monte Fuji nella homepage
- `mappa-giappone.jpg` → Sostituisce la mappa SVG del Giappone nella sezione Natura (**marker interattivi!**)
- `hokusai-onda.jpg` → Sostituisce l'SVG dell'onda di Hokusai nella sezione Arte (**marker interattivi!**)
- `guerra.jpg` → Sostituisce eventuali SVG nella sezione Guerra
- `disciplina.jpg` → Sostituisce eventuali SVG nella sezione Disciplina

## Interattività Mantenuta

Quando sostituisci le immagini originali:
- **Cartina Giappone**: Marker su Hokkaido, Honshu, Shikoku, Kyushu, Tokyo, Fuji, Hiroshima
- **Onda Hokusai**: Marker su L'Onda, Le Barche, Monte Fuji
- **Altre immagini**: Diventano automaticamente interattive se necessario

## Caratteristiche

- **Fallback automatico**: Se un'immagine non esiste, rimane visibile l'SVG originale
- **Nessuna modifica al codice**: Basta aggiungere i file immagine, il resto è automatico
- **Responsive**: Le immagini si adattano automaticamente alle dimensioni del sito
- **Console logging**: Il sistema mostra nella console quali immagini vengono caricate

## Suggerimenti per le Immagini

- **Formato**: JPG, PNG o WebP
- **Dimensioni**: Circa 400-600px di larghezza per le immagini principali
- **Qualità**: Buona risoluzione ma non eccessiva per velocità di caricamento
- **Contenuto**: Mantieni uno stile coerente con il tema del Giappone

## Esempio di Utilizzo

1. Scarica o crea le tue immagini
2. Rinominale secondo i nomi sopra indicati
3. Copiale nella cartella `assets/`
4. Ricarica la pagina del sito

Le immagini appariranno automaticamente al posto degli SVG!</content>
<parameter name="filePath">c:\Users\edoar\Desktop\MioSito\assets\README.md