/* ============================================
   NAVIGAZIONE SPA
   ============================================ */
const SECTIONS = ['home', 'natura', 'arte', 'guerra', 'disciplina', 'religioni', 'musica'];
let current = 'home';

function toggleMenu() {
    const links = document.getElementById('navLinks');
    const toggle = document.getElementById('navToggle');
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function closeMenu() {
    const links = document.getElementById('navLinks');
    const toggle = document.getElementById('navToggle');
    if (links) links.classList.remove('open');
    if (toggle) { toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
}

function navigateTo(id) {
    closeMenu();
    if (id === current) return;

    const prev = document.getElementById(current);
    prev.classList.remove('visible');
    setTimeout(() => {
        prev.classList.remove('active');
        const next = document.getElementById(id);
        next.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => next.classList.add('visible'), 40);
        current = id;
        updateNav(id);
        document.querySelector('footer').style.display = id === 'musica' ? 'block' : 'none';
        if (id === 'religioni') { resetReligionStats(); setTimeout(animateReligionStats, 380); }
    }, 300);
}

function updateNav(id) {
    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(a => {
        if (a.getAttribute('onclick') && a.getAttribute('onclick').includes("'" + id + "'")) {
            a.classList.add('active');
        }
    });
    const idx = SECTIONS.indexOf(id);
    document.getElementById('progressFill').style.width = (idx / (SECTIONS.length - 1) * 100) + '%';
}

// Avvio
window.addEventListener('load', () => {
    const home = document.getElementById('home');
    home.classList.add('active');
    setTimeout(() => home.classList.add('visible'), 80);
    updateNav('home');

    // Carica le immagini personalizzate
    loadCustomImages();
    // Carica posizioni marker salvate
    loadMarkerPositions();
    // Inizializza vista default religioni
    showReligion('shinto', document.getElementById('tab-shinto'));
});


/* ============================================
   CARICAMENTO DINAMICO IMMAGINI
   ============================================ */
const CUSTOM_IMAGES = {
    'fuji-svg': 'assets/monte-fuji.jpg',
    'japan-svg': 'assets/mappa-giappone.jpg',
    'wave-svg': 'assets/hokusai-onda.jpg',
    'war-svg': 'assets/guerra.jpg',
    'discipline-svg': 'assets/disciplina.jpg'
};

function loadCustomImages() {
    Object.keys(CUSTOM_IMAGES).forEach(imgId => {
        const imgElement = document.getElementById(imgId);
        if (imgElement) {
            const imgPath = CUSTOM_IMAGES[imgId];

            // Crea una nuova immagine per testare se esiste
            const testImg = new Image();
            testImg.onload = function() {
                // Se l'immagine esiste, sostituisci l'SVG con l'immagine
                imgElement.src = imgPath;
                imgElement.style.display = 'block';
                console.log(`Immagine caricata: ${imgPath}`);

                // Mostra gli overlay interattivi se esistono
                const overlayId = imgId.replace('-svg', '-overlay');
                const overlay = document.getElementById(overlayId);
                if (overlay) {
                    overlay.style.display = 'block';
                }
            };
            testImg.onerror = function() {
                // Se l'immagine non esiste, mantieni l'SVG originale
                console.log(`Immagine non trovata: ${imgPath} - mantengo SVG`);
            };
            testImg.src = imgPath;
        }
    });
}

/* ============================================
   CALIBRAZIONE MARKER – DRAG & DROP
   ============================================ */
const MARKER_DEFAULTS = {
    'mjp-hokkaido':  { left: '74.07%', top: '16.32%' },
    'mjp-honshu':    { left: '59.79%', top: '59.08%' },
    'mjp-shikoku':   { left: '42.00%', top: '72.00%' },
    'mjp-kyushu':    { left: '35.00%', top: '78.00%' },
    'mjp-tokyo':     { left: '65.00%', top: '42.00%' },
    'mjp-fuji':      { left: '58.00%', top: '52.00%' },
    'mjp-hiroshima': { left: '45.00%', top: '58.00%' },
    'mwv-onda':      { left: '40.00%', top: '55.00%' },
    'mwv-barche':    { left: '25.00%', top: '75.00%' },
    'mwv-fuji':      { left: '64.80%', top: '68.63%' }
};

const CALIBRATION_GROUPS = {
    japan: {
        overlayId: 'japan-overlay',
        imageId:   'japan-svg',
        markerIds: ['mjp-hokkaido','mjp-honshu','mjp-shikoku','mjp-kyushu','mjp-tokyo','mjp-fuji','mjp-hiroshima'],
        labels:    { 'mjp-hokkaido':'Hokkaido','mjp-honshu':'Honshu','mjp-shikoku':'Shikoku',
                     'mjp-kyushu':'Kyushu','mjp-tokyo':'Tokyo','mjp-fuji':'M. Fuji','mjp-hiroshima':'Hiroshima' }
    },
    wave: {
        overlayId: 'wave-overlay',
        imageId:   'wave-svg',
        markerIds: ['mwv-onda','mwv-barche','mwv-fuji'],
        labels:    { 'mwv-onda':'L\'Onda','mwv-barche':'Le Barche','mwv-fuji':'M. Fuji' }
    }
};

let activeCalibration = null;

function loadMarkerPositions() {
    try {
        const saved = localStorage.getItem('jp-marker-positions');
        if (!saved) return;
        const positions = JSON.parse(saved);
        Object.entries(positions).forEach(([id, pos]) => {
            const el = document.getElementById(id);
            if (el && pos.left && pos.top) { el.style.left = pos.left; el.style.top = pos.top; }
        });
    } catch(e) {}
}

function startCalibration(group) {
    if (activeCalibration) stopCalibration();
    const cfg = CALIBRATION_GROUPS[group];
    const img = document.getElementById(cfg.imageId);

    if (!img || img.style.display === 'none') {
        _showCalPanel(group, true);
        return;
    }

    activeCalibration = group;

    const overlay = document.getElementById(cfg.overlayId);
    if (overlay) overlay.style.display = 'block';

    const imgContainer = overlay ? overlay.parentElement : null;
    if (imgContainer) imgContainer.classList.add('calibration-active');

    cfg.markerIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && imgContainer) _makeMarkerDraggable(el, imgContainer);
    });

    _showCalPanel(group, false);
}

function stopCalibration() {
    if (!activeCalibration) return;
    const cfg = CALIBRATION_GROUPS[activeCalibration];

    cfg.markerIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) _removeMarkerDraggable(el);
    });

    const overlay    = document.getElementById(cfg.overlayId);
    const img        = document.getElementById(cfg.imageId);
    const imgContainer = overlay ? overlay.parentElement : null;
    if (imgContainer) imgContainer.classList.remove('calibration-active');
    if (overlay && img && img.style.display === 'none') overlay.style.display = 'none';

    const panel = document.getElementById('calibration-panel');
    if (panel) panel.style.display = 'none';
    activeCalibration = null;
}

function _showCalPanel(group, noImage) {
    let panel = document.getElementById('calibration-panel');
    if (!panel) { panel = document.createElement('div'); panel.id = 'calibration-panel'; document.body.appendChild(panel); }

    const cfg   = CALIBRATION_GROUPS[group];
    const label = group === 'japan' ? '🗾 Mappa Giappone' : '🌊 Onda Hokusai';

    if (noImage) {
        panel.innerHTML = `
            <div class="cal-header"><span class="cal-title">⚙️ Calibrazione</span><span class="cal-group">${label}</span></div>
            <p class="cal-desc" style="color:var(--gold)">⚠️ Aggiungi prima l'immagine nella cartella <code style="font-size:0.72rem;background:rgba(255,255,255,0.06);padding:1px 4px;border-radius:3px">assets/</code> per poter calibrare i marker.</p>
            <div class="cal-actions"><button class="cal-btn cal-exit" style="flex:none;width:100%" onclick="stopCalibration()">✕ Chiudi</button></div>`;
    } else {
        panel.innerHTML = `
            <div class="cal-header"><span class="cal-title">⚙️ Calibrazione</span><span class="cal-group">${label}</span></div>
            <p class="cal-desc">Trascina i puntini <strong style="color:var(--gold)">dorati</strong> nella posizione corretta.</p>
            <div class="cal-markers" id="calMarkerList">
                ${cfg.markerIds.map(id => `
                <div class="cal-marker-row">
                    <span class="cal-dot"></span>
                    <span class="cal-name">${cfg.labels[id]}</span>
                    <span class="cal-pos" id="cal-pos-${id}">—</span>
                </div>`).join('')}
            </div>
            <div class="cal-actions">
                <button class="cal-btn cal-save"  onclick="saveCalibration()">💾 Salva</button>
                <button class="cal-btn cal-reset" onclick="resetCalibration('${group}')">↺ Default</button>
                <button class="cal-btn cal-exit"  onclick="stopCalibration()">✕</button>
            </div>
            <div class="cal-feedback" id="calFeedback"></div>`;
    }

    panel.style.display = 'block';
    _updateCalPositions();
}

function _updateCalPositions() {
    if (!activeCalibration) return;
    CALIBRATION_GROUPS[activeCalibration].markerIds.forEach(id => {
        const el    = document.getElementById(id);
        const posEl = document.getElementById('cal-pos-' + id);
        if (el && posEl) {
            const l = parseFloat(el.style.left || 0).toFixed(1);
            const t = parseFloat(el.style.top  || 0).toFixed(1);
            posEl.textContent = `${l}% ${t}%`;
        }
    });
}

function saveCalibration() {
    try {
        const positions = {};
        Object.keys(MARKER_DEFAULTS).forEach(id => {
            const el = document.getElementById(id);
            if (el) positions[id] = { left: el.style.left, top: el.style.top };
        });
        localStorage.setItem('jp-marker-positions', JSON.stringify(positions));
        const fb = document.getElementById('calFeedback');
        if (fb) { fb.textContent = '✅ Posizioni salvate!'; fb.style.color = '#80ffaa'; setTimeout(() => { if(fb) fb.textContent = ''; }, 2500); }
    } catch(e) {
        const fb = document.getElementById('calFeedback');
        if (fb) { fb.textContent = '❌ Errore nel salvataggio.'; fb.style.color = '#ffaaaa'; }
    }
}

function resetCalibration(group) {
    if (!group) return;
    CALIBRATION_GROUPS[group].markerIds.forEach(id => {
        const el = document.getElementById(id);
        const d  = MARKER_DEFAULTS[id];
        if (el && d) { el.style.left = d.left; el.style.top = d.top; }
    });
    _updateCalPositions();
}

function _makeMarkerDraggable(markerEl, imgContainer) {
    markerEl.classList.add('marker-calibrating');

    const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const r    = imgContainer.getBoundingClientRect();
        const cx0  = e.touches ? e.touches[0].clientX : e.clientX;
        const cy0  = e.touches ? e.touches[0].clientY : e.clientY;

        const curPxLeft = (parseFloat(markerEl.style.left) / 100) * r.width;
        const curPxTop  = (parseFloat(markerEl.style.top)  / 100) * r.height;
        const offX = (cx0 - r.left) - curPxLeft;
        const offY = (cy0 - r.top)  - curPxTop;

        markerEl.classList.add('marker-dragging');

        const onMove = (ev) => {
            const r2 = imgContainer.getBoundingClientRect();
            const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
            const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
            const pctX = Math.max(1, Math.min(99, ((cx - r2.left - offX) / r2.width)  * 100));
            const pctY = Math.max(1, Math.min(99, ((cy - r2.top  - offY) / r2.height) * 100));
            markerEl.style.left = pctX.toFixed(2) + '%';
            markerEl.style.top  = pctY.toFixed(2) + '%';
            _updateCalPositions();
        };

        const onUp = () => {
            markerEl.classList.remove('marker-dragging');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup',   onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend',  onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup',   onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend',  onUp);
    };

    markerEl._dragHandler = handler;
    markerEl.addEventListener('mousedown',  handler);
    markerEl.addEventListener('touchstart', handler, { passive: false });
}

function _removeMarkerDraggable(markerEl) {
    markerEl.classList.remove('marker-calibrating', 'marker-dragging');
    if (markerEl._dragHandler) {
        markerEl.removeEventListener('mousedown',  markerEl._dragHandler);
        markerEl.removeEventListener('touchstart', markerEl._dragHandler);
        delete markerEl._dragHandler;
    }
}


/* ============================================
   SIMULATORE DI TERREMOTO
   ============================================ */
const EQ_DATA = {
    1: { icon:'😌', text:'Scossa impercettibile',   detail:'Le persone non avvertono nulla',              color:'#2d9a4f' },
    2: { icon:'🙂', text:'Scossa molto leggera',    detail:'Solo chi è fermo riesce a sentirla',          color:'#5a9a3f' },
    3: { icon:'😐', text:'Scossa leggera',           detail:'La gente la sente, gli oggetti oscillano',    color:'#8a9a2f' },
    4: { icon:'😟', text:'Scossa moderata',          detail:'Oggetti cadono, finestre si rompono',         color:'#aa7a1f' },
    5: { icon:'😨', text:'Danni leggeri',            detail:'Edifici vecchi danneggiati, crepe nei muri',  color:'#bb5a1f' },
    6: { icon:'😰', text:'Danni moderati',           detail:'Edifici danneggiati, possibili crolli',       color:'#cc3a1f' },
    7: { icon:'😱', text:'Danni gravi + Tsunami!',  detail:'Crolli di edifici, tsunami probabile!',       color:'#cc2222' },
    8: { icon:'🆘', text:'Distruzione diffusa',      detail:'Catastrofe totale, tsunami devastante!',      color:'#bb1111' },
    9: { icon:'☠️', text:'Distruzione totale',       detail:'Tutto raso al suolo, tsunami gigantesco!',   color:'#990000' }
};

function updateEarthquake() {
    const val = parseInt(document.getElementById('earthquakeSlider').value);
    const d = EQ_DATA[val];

    document.getElementById('magnitudeValue').textContent = val + '.0';
    document.getElementById('magnitudeValue').style.color = d.color;

    document.getElementById('quakeIcon').textContent   = d.icon;
    document.getElementById('quakeText').textContent   = d.text;
    document.getElementById('quakeDetail').textContent = d.detail;
    document.getElementById('earthquakeResult').style.borderLeftColor = d.color;

    const b1 = document.getElementById('b1');
    const b2 = document.getElementById('b2');
    const b3 = document.getElementById('b3');

    [b1, b2, b3].forEach(b => b.classList.remove('shake-mild', 'shake-strong'));

    if (val >= 9) {
        b1.textContent = '💥'; b2.textContent = '💥'; b3.textContent = '💥';
    } else if (val >= 7) {
        b1.textContent = '🏚️'; b2.textContent = '🏢'; b3.textContent = '🏯';
        [b1, b2, b3].forEach(b => b.classList.add('shake-strong'));
    } else if (val >= 4) {
        b1.textContent = '🏠'; b2.textContent = '🏢'; b3.textContent = '🏯';
        [b1, b2, b3].forEach(b => b.classList.add('shake-mild'));
    } else {
        b1.textContent = '🏠'; b2.textContent = '🏢'; b3.textContent = '🏯';
    }
}

updateEarthquake();


/* ============================================
   TSUNAMI STEPS
   ============================================ */
const TSUNAMI_INFO = {
    1: { title:'1 – Terremoto Sottomarino',     text:'Un forte terremoto (magnitudo ≥ 6.5) avviene sul fondale marino, dove le placche tettoniche si scontrano. La roccia si sposta bruscamente liberando una quantità enorme di energia.' },
    2: { title:'2 – Spostamento del Fondale',   text:'Il sisma sposta improvvisamente una grande colonna d\'acqua. Il disturbo si propaga in tutte le direzioni, proprio come quando lanci un sasso in uno stagno. In profondità l\'onda è quasi invisibile.' },
    3: { title:'3 – Onda in Mare Aperto',        text:'In alto mare le onde del tsunami sono lunghe centinaia di km ma alte meno di 1 metro. Viaggiano a circa 800 km/h – la velocità di un aereo di linea! Quasi impossibili da avvistare.' },
    4: { title:'4 – Impatto sulla Costa',        text:'Avvicinandosi alla riva l\'onda rallenta ma la sua altezza cresce enormemente, fino a 30-40 metri! Il mare prima si ritira (segnale di pericolo!), poi arriva il muro d\'acqua devastante.' }
};

function showTsunamiStep(n) {
    document.querySelectorAll('.tsunami-step').forEach((el, i) => el.classList.toggle('active', i + 1 === n));
    const info = TSUNAMI_INFO[n];
    const el = document.getElementById('tsunamiDesc');
    el.innerHTML = '<strong style="color:#fff">' + info.title + '</strong><br><br>' + info.text;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'fadeIn 0.3s ease';
}

/* ============================================
   FUKUSHIMA (2011)
   ============================================ */
const FUKUSHIMA_DATA = {
    cosa: {
        title: '☢️ Cosa è successo',
        text: 'L\'11 marzo 2011 un terremoto molto forte creò un grande tsunami. Le onde arrivarono fino alla centrale nucleare di Fukushima e la allagarono. Così si ruppero le macchine che tenevano freddi i reattori. Senza acqua fredda, dentro i reattori si formò troppo calore e ci furono delle esplosioni. Nell\'aria uscì del materiale <strong>radioattivo</strong>, cioè pericoloso. Tantissime persone (più di 150.000) dovettero scappare di casa.'
    },
    vittime: {
        title: '🌊 Chi è morto davvero',
        text: 'Una cosa importante: quasi tutte le persone morte quel giorno (circa <strong>18.000</strong>) sono morte per lo <strong>tsunami</strong>, non per le radiazioni. È stata l\'acqua a distruggere le città. Le radiazioni, invece, <strong>non hanno ucciso nessuno sul momento</strong>. Purtroppo molti anziani sono morti dopo, per la paura e la fatica di dover lasciare la loro casa.'
    },
    tumori: {
        title: '🧬 Le radiazioni e i tumori',
        text: 'Le radiazioni possono rovinare le cellule del corpo e, dopo molti anni, far venire dei <strong>tumori</strong> (il cancro). A Fukushima, però, le persone hanno preso poche radiazioni. I medici dicono che i nuovi tumori saranno pochissimi, forse impossibili da contare. Fino ad oggi c\'è stato <strong>un solo</strong> lavoratore della centrale morto di tumore per le radiazioni.'
    },
    mutazioni: {
        title: '🧬 Le mutazioni nel DNA',
        text: 'Dentro ogni nostra cellula c\'è il <strong>DNA</strong>, una specie di "manuale di istruzioni" che dice alla cellula come funzionare. Le radiazioni possono colpire il DNA e cambiare qualche piccola lettera di questo manuale: questi piccoli errori si chiamano <strong>mutazioni</strong>. Di solito il corpo riesce a riparare questi errori da solo. Se però un errore non viene riparato, con gli anni può far nascere un tumore (per questo le mutazioni e i tumori sono collegati). A Fukushima le radiazioni erano poche, quindi i danni al DNA sono stati pochi. La cosa più importante: queste mutazioni <strong>non sono passate ai figli</strong>, e i bambini nati dopo il disastro sono sani.'
    }
};

function showFukushima(key, el) {
    document.querySelectorAll('#natura .martial-art').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
    const data = FUKUSHIMA_DATA[key];
    const panel = document.getElementById('fukushimaInfo');
    panel.innerHTML = '<strong style="color:#fff">' + data.title + '</strong><br><br>' + data.text;
    panel.style.animation = 'none';
    void panel.offsetWidth;
    panel.style.animation = 'fadeIn 0.3s ease';
}


/* ============================================
   MAPPA GIAPPONE
   ============================================ */
const MAP_INFO = {
    hokkaido: { title:'🗾 Hokkaido',   text:'La seconda isola più grande del Giappone. Famosa per paesaggi innevati, foreste e orsi bruni. Ospita circa 5,5 milioni di abitanti. La città principale è Sapporo.' },
    honshu:   { title:'🗾 Honshu',    text:'La più grande isola del Giappone (la settima nel mondo). Qui si trovano Tokyo, Kyoto, Osaka e Hiroshima. Ospita circa 104 milioni di persone.' },
    shikoku:  { title:'🗾 Shikoku',   text:'La più piccola delle quattro isole principali. Famosa per il pellegrinaggio dei 88 templi e la produzione di yuzu. Ospita circa 3,8 milioni di persone.' },
    kyushu:   { title:'🗾 Kyushu',    text:'La terza isola per dimensioni. Ricca di vulcani attivi, tra cui il Monte Aso – il più grande caldera del mondo. La città principale è Fukuoka.' },
    fuji:     { title:'🗻 Monte Fuji', text:'Simbolo del Giappone! Vulcano di 3.776 m – il più alto della nazione. Ultima eruzione nel 1707. Ogni anno oltre 200.000 persone cercano di scalarlo. È un sito UNESCO dal 2013.' },
    tokyo:    { title:'★ Tokyo',      text:'Capitale del Giappone e la città più popolata del mondo: circa 37 milioni di abitanti nell\'area metropolitana! Era chiamata "Edo" fino al 1868. Centro tecnologico e culturale globale.' },
    hiroshima:{ title:'☢️ Hiroshima', text:'Il 6 agosto 1945 la prima bomba atomica della storia esplose qui. Circa 80.000 morti immediati. Oggi è un simbolo mondiale della pace: il Parco del Memoriale accoglie milioni di visitatori ogni anno.' }
};

function showMapInfo(place) {
    if (activeCalibration === 'japan') return;
    const info = MAP_INFO[place];
    const panel = document.getElementById('mapInfoPanel');
    panel.innerHTML = '<strong style="color:#fff;font-size:1rem">' + info.title + '</strong><br><br>' + info.text;
    panel.style.animation = 'none';
    void panel.offsetWidth;
    panel.style.animation = 'fadeIn 0.3s ease';
}


/* ============================================
   GRANDE ONDA – ZONE CLICCABILI
   ============================================ */
const WAVE_INFO = {
    onda:   { title:'🌊 La Grande Onda', text:'L\'onda non è solo acqua: rappresenta la forza irresistibile della natura. Le "dita" sembrano artigli che afferrano il cielo. La sua curva perfetta è diventata uno dei simboli dell\'arte mondiale.' },
    barche: { title:'🚣 Le Barche',     text:'Sono <em>oshiokuri-bune</em>, imbarcazioni per trasportare pesce fresco a Tokyo (allora Edo). I rematori si abbassano per resistere all\'onda. Di fronte alla natura sembrano minuscoli e vulnerabili.' },
    fuji:   { title:'🗻 Il Monte Fuji', text:'Fuji appare piccolo in lontananza, ma è il vero soggetto della serie "36 vedute del Monte Fuji". Paradossalmente l\'onda gigante in primo piano lo rende ancora più maestoso nella sua calma immobile.' }
};

function showWaveInfo(zone) {
    if (activeCalibration === 'wave') return;
    const info = WAVE_INFO[zone];
    const panel = document.getElementById('waveInfoPanel');
    panel.innerHTML = '<strong style="color:#fff">' + info.title + '</strong><br><br>' + info.text;
    panel.style.animation = 'none';
    void panel.offsetWidth;
    panel.style.animation = 'fadeIn 0.3s ease';
}


/* ============================================
   MINI QUIZ ARTE
   ============================================ */
function checkArteQuiz(btn, isCorrect) {
    document.querySelectorAll('#arte .quiz-btn').forEach(b => {
        b.disabled = true;
        if (b.textContent.trim() === '1831') b.classList.add('correct');
    });
    if (!isCorrect) btn.classList.add('wrong');

    const fb = document.getElementById('arteQuizFeedback');
    if (isCorrect) {
        fb.innerHTML = '✅ <strong style="color:#80ffaa">Corretto!</strong> La Grande Onda fu creata nel 1831 come parte della serie "36 vedute del Monte Fuji". È una delle opere d\'arte più riprodotte al mondo!';
    } else {
        fb.innerHTML = '❌ <strong style="color:#ffaaaa">Sbagliato.</strong> La risposta esatta è <strong>1831</strong> – Hokusai aveva già 71 anni quando la dipinse!';
    }
}


/* ============================================
   TIMELINE GUERRA
   ============================================ */
const openTimelines = new Set();

function toggleTimeline(id) {
    const content = document.getElementById('tc' + id);
    const item    = document.getElementById('ti' + id);
    const chevron = document.getElementById('ch' + id);

    if (openTimelines.has(id)) {
        openTimelines.delete(id);
        content.classList.remove('open');
        item.classList.remove('open');
    } else {
        openTimelines.add(id);
        content.classList.add('open');
        item.classList.add('open');
    }
}


/* ============================================
   ARTI MARZIALI
   ============================================ */
const MA_DATA = {
    judo:   { title:'🥋 Judo – "La Via Flessibile"', text:'Creato nel 1882 da Jigoro Kano. Si basa sull\'idea di usare la forza dell\'avversario contro di lui. Non si colpisce: si proietta a terra o si immobilizza. È sport olimpico dal 1964.' },
    karate: { title:'✊ Karate – "La Mano Vuota"',   text:'"Kara" = vuoto, "te" = mano. Originario di Okinawa, usa pugni, calci e parate. Lo scopo non è attaccare ma difendersi e crescere interiormente. Olimpico dal 2021.' },
    aikido: { title:'☯️ Aikido – "Via dell\'Armonia"', text:'Fondato da Morihei Ueshiba nel XX secolo. Non si attacca mai: si usa solo la forza dell\'avversario per neutralizzarlo. Insegna che il vero scopo del combattimento è la pace.' },
    kendo:  { title:'⚔️ Kendo – "Via della Spada"',  text:'La forma moderna della scherma giapponese dei samurai. Si usano spade di bambù (shinai) e armature protettive. Allena concentrazione, disciplina e rispetto.' }
};

function showMartialArt(art, el) {
    document.querySelectorAll('.martial-art').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
    const data = MA_DATA[art];
    const panel = document.getElementById('martialArtInfo');
    panel.innerHTML = '<strong style="color:#fff">' + data.title + '</strong><br><br>' + data.text;
    panel.style.animation = 'none';
    void panel.offsetWidth;
    panel.style.animation = 'fadeIn 0.3s ease';
}


/* ============================================
   VENN ANIMATO – RELIGIONI
   ============================================ */
function animateReligionStats() {
    const cells = document.getElementById('vennCells');
    if (!cells) return;
    cells.classList.add('animated');

    // Contatori percentuali
    setTimeout(() => {
        animateCounter('vp-shinto',   0, 12, 1100, v => v + '%');
        animateCounter('vp-both',     0, 57, 1500, v => v + '%');
        animateCounter('vp-buddismo', 0,  9,  950, v => v + '%');
    }, 200);

    // Barra segmentata
    setTimeout(() => {
        const s = document.getElementById('vbs-shinto');
        const b = document.getElementById('vbs-both');
        const d = document.getElementById('vbs-buddismo');
        const n = document.getElementById('vbs-neither');
        if (s) s.style.width = '12%';
        if (b) b.style.width = '57%';
        if (d) d.style.width =  '9%';
        if (n) n.style.width = '22%';
    }, 350);
}

function resetReligionStats() {
    const cells = document.getElementById('vennCells');
    if (cells) cells.classList.remove('animated');
    ['vp-shinto','vp-both','vp-buddismo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0%';
    });
    ['vbs-shinto','vbs-both','vbs-buddismo','vbs-neither'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.transition = 'none'; el.style.width = '0%'; }
    });
    // Riattiva le transizioni al prossimo frame
    requestAnimationFrame(() => {
        ['vbs-shinto','vbs-both','vbs-buddismo','vbs-neither'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.transition = '';
        });
    });
}

function animateCounter(id, from, to, duration, formatter) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = performance.now();
    const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = (formatter || (v => v))(Math.round(from + (to - from) * eased));
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

/* ============================================
   RELIGIONI
   ============================================ */
const RELIGION_DATA = {
    shinto: {
        titolo: '⛩️ Scintoismo',
        intro:  'Lo Scintoismo è la religione originaria del Giappone. I suoi fedeli adorano i "kami", cioè degli spiriti che vivono nelle cose naturali: montagne, fiumi, alberi, vento. Non ha un fondatore e non ha un libro sacro unico. I giapponesi la praticano da migliaia di anni, soprattutto per le nascite, i matrimoni e le grandi feste stagionali.',
        accentColor: 'var(--red)'
    },
    buddismo: {
        titolo: '☸️ Buddismo',
        intro:  'Il Buddismo è arrivato in Giappone nel 552 d.C. dall\'India, passando prima per la Cina e la Corea. Insegna che la sofferenza nasce dal voler troppo, e che si può trovare la pace interiore – chiamata nirvana – meditando e vivendo in modo giusto. In Giappone viene seguito soprattutto per i funerali e le cerimonie in memoria dei defunti.',
        accentColor: 'var(--gold)'
    }
};

function showReligion(type, btn) {
    if (btn) {
        document.querySelectorAll('.religion-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
    }
    const d = RELIGION_DATA[type];
    if (!d) return;

    const panel = document.getElementById('religionDetail');
    if (!panel) return;

    panel.innerHTML =
        '<div class="religion-detail-title" style="border-left:3px solid ' + d.accentColor + ';padding-left:0.6rem">' + d.titolo + '</div>' +
        '<p class="religion-detail-intro">' + d.intro + '</p>';

    panel.style.animation = 'none';
    void panel.offsetWidth;
    panel.style.animation = 'fadeIn 0.3s ease';
}

const SACRED_DATA = {
    jinja:  {
        title: '⛩️ Il Santuario (Jinja)',
        text:  'Il Jinja è il posto dove si prega nello Scintoismo. Si riconosce subito dal Torii rosso all\'ingresso. Dentro c\'è il sacrario dove "vive" il kami. Per pregare ci si avvicina, si fa una piccola offerta, ci si inchina due volte e si battono le mani due volte.'
    },
    tera:   {
        title: '🏯 Il Tempio (Tera)',
        text:  'Il Tera è il posto dove si prega nel Buddismo. Si riconosce per le statue del Buddha, l\'incenso che brucia e le pagode nel cortile. I monaci buddisti ci vivono, studiano e meditano ogni giorno.'
    },
    torii:  {
        title: '⛩️ Il Torii (鳥居)',
        text:  'Il Torii è il portale tipico dei santuari shintoisti. Indica il confine tra il mondo normale e lo spazio sacro: quando lo attraversi, entri in un posto speciale. Di solito è rosso, perché quel colore allontana il male. Il più famoso è quello di Miyajima, che sembra galleggiare sull\'acqua!'
    },
    pagoda: {
        title: '🗼 La Pagoda',
        text:  'La pagoda è la torre dei templi buddisti. Ha più piani e ognuno rappresenta un elemento: terra, acqua, fuoco, vento e cielo. Dentro si conservano oggetti sacri. Quella del Tempio Hōryū-ji ha più di 1.300 anni ed è una delle costruzioni in legno più vecchie del mondo!'
    }
};

function showSacredInfo(place) {
    const info = SACRED_DATA[place];
    const panel = document.getElementById('sacredInfoPanel');
    panel.innerHTML = '<strong style="color:#fff;font-size:0.95rem">' + info.title + '</strong><br><br>' + info.text;
    panel.style.animation = 'none';
    void panel.offsetWidth;
    panel.style.animation = 'fadeIn 0.3s ease';
}

function checkReligioniQuiz(btn, isCorrect) {
    const fb = document.getElementById('religioniQuizFeedback');
    if (fb) {
        document.querySelectorAll('#religioni .quiz-btn').forEach(b => {
            b.disabled = true;
            if (b.textContent.trim() === 'Kami') b.classList.add('correct');
        });
    }
    if (!isCorrect) btn.classList.add('wrong');

    if (isCorrect) {
        fb.innerHTML = '✅ <strong style="color:#80ffaa">Corretto!</strong> I kami sono gli spiriti della natura nello Scintoismo. Possono essere nelle montagne, nei fiumi, negli alberi, nel vento. I giapponesi li venerano da migliaia di anni.';
    } else {
        fb.innerHTML = '❌ <strong style="color:#ffaaaa">Sbagliato.</strong> La risposta giusta è <strong>Kami</strong>. Sono gli spiriti della natura che lo Scintoismo venera in ogni cosa che esiste.';
    }
}

/* ============================================
   MUSICA – KARAOKE WORD BREAKDOWN
   ============================================ */
const KARA_DATA = {
    kara: {
        kanji: '空 (kara)',
        color: 'var(--red)',
        cls: 'active-kara',
        detail: '空 significa <strong style="color:var(--red)">vuoto / senza contenuto</strong>. Nel karaoke indica che manca il cantante originale: la musica c\'è, ma la voce è vuota — sei tu a riempirla!'
    },
    oke: {
        kanji: 'オーケストラ (ōkesutora)',
        color: 'var(--gold)',
        cls: 'active-oke',
        detail: 'オケ è l\'abbreviazione di <strong style="color:var(--gold)">オーケストラ (orchestra)</strong>. Indica la base musicale che accompagna il cantante. Karaoke = "orchestra vuota" 🎵'
    }
};

function showKaraPart(part, btn) {
    document.querySelectorAll('.kw-part').forEach(p => p.classList.remove('active-kara','active-oke'));
    btn.classList.add(KARA_DATA[part].cls);
    const detail = document.getElementById('kwDetail');
    detail.innerHTML = KARA_DATA[part].detail;
    detail.classList.add('visible');
    detail.style.animation = 'none';
    void detail.offsetWidth;
    detail.style.animation = 'fadeIn 0.3s ease';
}

/* ============================================
   GIOCO DECISIONALE
   ============================================ */
const DECISION_MSG = {
    wrong1:  { cls:'error',   text:'❌ Un vero maestro non attacca mai per primo senza motivo. Nel Budo, attaccare impulsivamente è segno di immaturità. La forza vera sta nel controllo, non nell\'aggressione. Riprova!' },
    correct: { cls:'success', text:'✅ Eccellente! Mantenere la calma è la risposta del vero maestro. Nel Budo si dice: "La vittoria più grande è quella su se stessi." Hai dimostrato saggezza e autocontrollo!' },
    wrong2:  { cls:'error',   text:'❌ La rabbia è il peggior nemico del guerriero. Il maestro impara prima di tutto a controllare le proprie emozioni. Senza controllo mentale la forza fisica diventa pericolosa. Riprova!' }
};

function makeDecision(btn, choice) {
    document.querySelectorAll('.decision-btn').forEach(b => {
        b.disabled = true;
        b.style.opacity = '0.45';
    });
    btn.style.opacity = '1';

    const msg = DECISION_MSG[choice];
    const result = document.getElementById('decisionResult');
    result.textContent = msg.text;
    result.style.borderLeft = '3px solid ' + (msg.cls === 'success' ? '#2d9a4f' : '#cc2222');
    result.style.display = 'block';
    result.style.animation = 'none';
    void result.offsetWidth;
    result.style.animation = 'fadeIn 0.35s ease';

    document.getElementById('resetGameBtn').style.display = 'inline-block';

    if (choice === 'correct') {
        setTimeout(() => {
            const badge = document.getElementById('badgeSection');
            badge.style.display = 'block';
            badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 900);
    }
}

function resetDecisionGame() {
    document.querySelectorAll('.decision-btn').forEach(b => {
        b.disabled = false;
        b.style.opacity = '1';
    });
    document.getElementById('decisionResult').style.display = 'none';
    document.getElementById('resetGameBtn').style.display = 'none';
    document.getElementById('badgeSection').style.display = 'none';
}


/* ============================================
   QUIZ FINALE
   ============================================ */
const QUESTIONS = [
    {
        q: '🌊 Quante isole principali compongono il Giappone?',
        opts: ['2 isole', '3 isole', '4 isole', '6 isole'],
        correct: 2,
        exp: 'Le 4 isole principali sono: Honshu (la più grande), Hokkaido, Kyushu e Shikoku!'
    },
    {
        q: '🎨 Chi ha creato "La Grande Onda di Kanagawa"?',
        opts: ['Hiroshige', 'Hokusai', 'Sesshu', 'Utamaro'],
        correct: 1,
        exp: 'Katsushika Hokusai (1760–1849) la creò nel 1831, a circa 71 anni, come parte della serie "36 vedute del Monte Fuji"!'
    },
    {
        q: '💣 In quale anno il Giappone attaccò Pearl Harbor?',
        opts: ['1939', '1940', '1941', '1942'],
        correct: 2,
        exp: 'Il 7 dicembre 1941, 353 aerei giapponesi attaccarono a sorpresa la base navale americana di Pearl Harbor, alle Hawaii.'
    },
    {
        q: '🥋 Cosa significa la parola "Karate"?',
        opts: ['Mano vuota', 'Via flessibile', 'Vento divino', 'Via della spada'],
        correct: 0,
        exp: '"Karate" significa "mano vuota" in giapponese (空手). È un\'arte marziale tradizionale che si pratica senza armi, usando solo le mani e i piedi.'
    },
    {
        q: '🗻 Qual è il monte più alto del Giappone?',
        opts: ['Monte Aso', 'Monte Kita', 'Monte Fuji', 'Monte Nantai'],
        correct: 2,
        exp: 'Il Monte Fuji è alto 3.776 metri ed è il punto più elevato del Giappone. È un vulcano ed è diventato simbolo della nazione!'
    },
    {
        q: '☸️ Come si chiama la pace interiore che si cerca di raggiungere nel Buddismo?',
        opts: ['Karma', 'Nirvana', 'Matsuri', 'Kami'],
        correct: 1,
        exp: 'Il nirvana è lo stato di pace interiore che si raggiunge nel Buddismo meditando e vivendo in modo giusto. Il Buddismo è arrivato in Giappone nel 552 d.C. dall\'India.'
    }
];

let qIndex = 0;
let score = 0;

function startQuiz() {
    qIndex = 0;
    score = 0;
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizQuestions').style.display = 'block';
    renderQuestion();
}

function renderQuestion() {
    const q = QUESTIONS[qIndex];
    document.getElementById('questionNum').textContent = qIndex + 1;
    document.getElementById('quizProgressFill').style.width = (qIndex / QUESTIONS.length * 100) + '%';

    document.getElementById('questionContainer').innerHTML =
        '<p class="quiz-final-question">' + q.q + '</p>' +
        '<div class="quiz-final-options">' +
            q.opts.map((opt, i) =>
                '<button class="quiz-final-btn" onclick="answerQuestion(' + i + ', this)">' + opt + '</button>'
            ).join('') +
        '</div>' +
        '<div class="quiz-explanation" id="qExp" style="display:none"></div>' +
        '<div style="text-align:right;margin-top:1rem">' +
            '<button id="nextBtn" class="btn btn-next" onclick="nextQuestion()" style="display:none">' +
                (qIndex < QUESTIONS.length - 1 ? 'Prossima domanda →' : 'Vedi i risultati 🎌') +
            '</button>' +
        '</div>';
}

function answerQuestion(idx, btn) {
    const q = QUESTIONS[qIndex];
    document.querySelectorAll('.quiz-final-btn').forEach((b, i) => {
        b.disabled = true;
        if (i === q.correct) b.classList.add('correct');
        else if (b === btn && i !== q.correct) b.classList.add('wrong');
    });

    if (idx === q.correct) score++;

    const exp = document.getElementById('qExp');
    exp.style.display = 'block';
    exp.innerHTML = (idx === q.correct
        ? '✅ <strong>Corretto!</strong> '
        : '❌ <strong>Sbagliato.</strong> ') + q.exp;

    document.getElementById('nextBtn').style.display = 'inline-block';
}

function nextQuestion() {
    qIndex++;
    if (qIndex < QUESTIONS.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quizProgressFill').style.width = '100%';
    document.getElementById('quizQuestions').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';

    let emoji, title, message, badges;

    if (score <= 2) {
        emoji = '📚';
        title = 'Devi ripassare!';
        message = 'Non preoccuparti, il Giappone è affascinante ma complesso. Rileggi le sezioni e riprova – puoi farcela!';
        badges = '';
    } else if (score <= 4) {
        emoji = '🎌';
        title = 'Buona comprensione!';
        message = 'Hai imparato molto! Qualche piccola lacuna, ma sei sulla strada giusta. Ancora un po\' e sarai un esperto!';
        badges = '🥈';
    } else if (score === 5) {
        emoji = '🏆';
        title = 'Quasi perfetto!';
        message = 'Sei quasi un esperto del Giappone! Solo una piccola imprecisione, ma la tua conoscenza è davvero notevole!';
        badges = '🥇 🎌';
    } else {
        emoji = '🏆';
        title = 'Esperto del Giappone!';
        message = 'Perfetto! 6 su 6! Sei un vero esperto del Giappone! Hai esplorato ogni sezione con attenzione massima!';
        badges = '🥇 ⭐ 🎌 ⛩️';
    }

    document.getElementById('resultAnimation').textContent = emoji;
    document.getElementById('resultTitle').textContent     = title;
    document.getElementById('scoreText').textContent       = score;
    document.getElementById('resultMessage').textContent   = message;
    document.getElementById('resultBadges').textContent    = badges;
}

function restartQuiz() {
    document.getElementById('quizStart').style.display = 'block';
    document.getElementById('quizQuestions').style.display = 'none';
    document.getElementById('quizResult').style.display = 'none';
}
