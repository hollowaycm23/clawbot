// Stargate Simulator - Main JavaScript
// =====================================

// Known destinations database
const DESTINATIONS = [
    {
        name: "Abydos",
        designation: "P8X-873",
        address: [27, 7, 15, 32, 12, 30, 1],
        description: "Primeira missão SG-1. Pirâmides e deserto.",
        distance: "2,000 anos-luz"
    },
    {
        name: "Chulak",
        designation: "P3X-513",
        address: [9, 2, 23, 15, 37, 20, 1],
        description: "Mundo natal de Teal'c. Base Jaffa.",
        distance: "12,000 anos-luz"
    },
    {
        name: "Tollana",
        designation: "P3X-7763",
        address: [11, 26, 5, 38, 14, 19, 1],
        description: "Civilização avançada dos Tollan.",
        distance: "8,500 anos-luz"
    },
    {
        name: "Atlantis",
        designation: "Pegasus",
        address: [18, 20, 1, 15, 14, 7, 19, 8],
        description: "Cidade dos Antigos na galáxia Pegasus.",
        distance: "3 milhões de anos-luz",
        chevrons: 8
    },
    {
        name: "P3X-888",
        designation: "P3X-888",
        address: [6, 16, 8, 3, 26, 33, 1],
        description: "Mundo de Apophis. Perigo extremo!",
        distance: "15,000 anos-luz"
    },
    {
        name: "Othala",
        designation: "P5S-381",
        address: [28, 13, 35, 22, 4, 25, 1],
        description: "Mundo natal dos Asgard.",
        distance: "45,000 anos-luz"
    },
    {
        name: "Langara",
        designation: "P2S-4C3",
        address: [14, 25, 1, 32, 18, 5, 1],
        description: "Mundo natal de Jonas Quinn. Rico em Naquadria.",
        distance: "5,000 anos-luz"
    },
    {
        name: "Destiny",
        designation: "Deep Space",
        address: [6, 17, 21, 5, 30, 12, 38, 9, 1],
        description: "Nave Antiga exploradora. Requer 9 chevrons.",
        distance: "Bilhões de anos-luz",
        chevrons: 9
    },
    {
        name: "P3X-666",
        designation: "Antidread",
        address: [11, 2, 3, 4, 5, 6, 1],
        description: "Local de uma das batalhas mais trágicas do SG-1.",
        distance: "8,000 anos-luz"
    }
];

// DHD Symbols (39 total) mapping to asset filenames
const DHD_SYMBOLS = [
    "001glyph-earth.jpg", "002glyph-crater.jpg", "003glyph-virgo.jpg", "004glyph-bootes.jpg",
    "005glyph-centarus.jpg", "006glyph-libra.jpg", "007glyph-serpenscaput.jpg", "008glyph-norma.jpg",
    "009glyph-scorpio.jpg", "010glyph-cra.jpg", "011glyph-scutum.jpg", "012glyph-sagittarius.jpg",
    "013glyph-aquila.jpg", "014glyph-mic.jpg", "015glyph-capricorn.jpg", "016glyph-piscesaustrinus.jpg",
    "017glyph-equuleus.jpg", "018glyph-aquarius.jpg", "019glyph-pegasus.jpg", "020glyph-sculptor.jpg",
    "021glyph-pisces.jpg", "022glyph-andromeda.jpg", "023glyph-triangulum.jpg", "024glyph-aries.jpg",
    "025glyph-perseus.jpg", "026glyph-cetus.jpg", "027glyph-taurus.jpg", "028glyph-auriga.jpg",
    "029glyph-eridanus.jpg", "030glyph-orion.jpg", "031glyph-canisminor.jpg", "032glyph-monoceros.jpg",
    "033glyph-gemini.jpg", "034glyph-hydra.jpg", "035glyph-lynx.jpg", "036glyph-cancer.jpg",
    "037glyph-sextans.jpg", "038glyph-leominor.jpg", "039glyph-leo.jpg"
];

// DHD Symbols (39 total) - ASCII/Unicode representation for Canvas drawing
const UNICODE_SYMBOLS = [
    '⊕', '⊗', '⊙', '⊚', '⊛', '⊜',
    '⊝', '⊞', '⊟', '⊠', '⊡', '⊢',
    '⊣', '⊤', '⊥', '⊦', '⊧', '⊨',
    '⊩', '⊪', '⊫', '⊬', '⊭', '⊮',
    '⊯', '⊰', '⊱', '⊲', '⊳', '⊴',
    '⊵', '⊶', '⊷', '⊸', '⊹', '⊺',
    '⊻', '⊼', '⊽'
];

// State
let selectedAddress = [];
let gateActive = false;
let chevronStates = new Array(9).fill(false); // Replaces DOM state
let wormholeStable = false; // Controls the "puddle" animation
let irisOpen = true;
let powerLevel = 0;
let connectionTimer = null;

// Animation State
let ringRotation = 0; // Current rotation in degrees
let targetRotation = 0; // Target rotation in degrees
let isRotating = false;
let currentRotationDir = 1; // 1 for CW, -1 for CCW
let chevronOffsets = new Array(9).fill(0); // 0 (up) to 1 (down) for each chevron
let animationFrameId = null;
let loadedGlyphs = []; // Array of Image objects for the ring

// Sound System - Procedural Sci-Fi Sounds & Asset Loader
class SoundSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
        this.mode = 'synthetic'; // 'synthetic' or 'original'
        this.assets = {};
        this.loadAssets();
    }

    async loadAssets() {
        const soundFiles = {
            dial: 'sounds/dial.mp3',
            chevron: 'sounds/chevron.mp3',
            kawoosh: 'sounds/kawoosh.mp3',
            hum: 'sounds/hum.mp3',
            fail: 'sounds/fail.mp3',
            irisOpen: 'sounds/iris_open.mp3',
            irisClose: 'sounds/iris_close.mp3',
            spin: 'sounds/gate_spin.mp3'
        };

        for (const [key, url] of Object.entries(soundFiles)) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    this.assets[key] = await this.ctx.decodeAudioData(arrayBuffer);
                    this.mode = 'original';
                    console.log(`Sound asset loaded: ${key}`);
                } else {
                    console.warn(`Failed to load sound asset: ${key} (${response.status})`);
                }
            } catch (e) {
                console.warn(`Error loading sound asset ${key}:`, e);
            }
        }

        // Notify user about sound mode
        if (this.assets.spin) {
            log('Áudio: Som original de giro carregado.', 'success');
        } else {
            log('Áudio: Usando som sintético (Arquivo não encontrado).', 'warning');
        }
    }

    async resumeContext() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
            console.log('AudioContext resumed');
        }
    }

    playAsset(key, loop = false) {
        if (!this.enabled || !this.assets[key]) return null;
        this.resumeContext(); // Ensure context is running
        const source = this.ctx.createBufferSource();
        source.buffer = this.assets[key];
        source.loop = loop;
        source.connect(this.ctx.destination);
        source.start();
        return source;
    }

    // Short click for DHD symbols
    playDialClick() {
        if (!this.enabled) return;
        if (this.assets.dial) {
            this.playAsset('dial');
            return;
        }
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Heavy metallic clunk for chevrons (Enhanced FM Synthesis)
    playChevronLock() {
        if (!this.enabled) return;
        if (this.assets.chevron) {
            this.playAsset('chevron');
            return;
        }

        // Carrier
        const osc1 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Modulator for metallic "bite"
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(60, this.ctx.currentTime);

        mod.type = 'triangle';
        mod.frequency.setValueAtTime(120, this.ctx.currentTime);
        modGain.gain.setValueAtTime(50, this.ctx.currentTime);

        mod.connect(modGain);
        modGain.connect(osc1.frequency);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

        osc1.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        mod.start();
        osc1.stop(this.ctx.currentTime + 0.4);
        mod.stop(this.ctx.currentTime + 0.4);
    }

    // Powerful "Kawoosh" effect (Enhanced Noise Layers)
    playKawoosh() {
        if (!this.enabled) return;
        if (this.assets.kawoosh) {
            this.playAsset('kawoosh');
            return;
        }

        const bufferSize = this.ctx.sampleRate * 2.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(20, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
        filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 2.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    }

    // Steady hum for event horizon
    playEventHorizonHum() {
        if (!this.enabled) return;
        if (this.assets.hum) {
            this.activeHum = this.playAsset('hum', true);
            return;
        }
        this.humOsc = this.ctx.createOscillator();
        this.humGain = this.ctx.createGain();
        this.humOsc.type = 'triangle';
        this.humOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
        this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.humGain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 1);
        this.humOsc.connect(this.humGain);
        this.humGain.connect(this.ctx.destination);
        this.humOsc.start();
    }

    stopEventHorizonHum() {
        if (this.activeHum) {
            this.activeHum.stop();
            this.activeHum = null;
        }
        if (this.humGain) {
            this.humGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
            setTimeout(() => {
                if (this.humOsc) this.humOsc.stop();
            }, 500);
        }
    }

    playIrisOpen() {
        if (this.assets.irisOpen) this.playAsset('irisOpen');
    }

    playIrisClose() {
        if (this.assets.irisClose) this.playAsset('irisClose');
    }

    // Gate Spin Sound (Clean Sci-Fi Turbine)
    async playGateSpin() {
        if (!this.enabled) return;
        await this.resumeContext();

        // Try authentic asset first
        if (this.assets.spin) {
            console.log('Playing loaded spin asset');
            if (!this.activeSpin) this.activeSpin = this.playAsset('spin', true);
            return;
        }

        // FALLBACK: Procedural "Clean Turbine" (Matches video reference)
        if (!this.spinNodes) {
            console.log('Generating procedural turbine sound...');
            const now = this.ctx.currentTime;

            // 1. Base Motor Hum (Sine Wave - smooth)
            const motor1 = this.ctx.createOscillator();
            motor1.type = 'sine';
            motor1.frequency.value = 140; // Low hum

            const motor2 = this.ctx.createOscillator();
            motor2.type = 'sine';
            motor2.frequency.value = 400; // Whine harmonic

            // 2. Air Movement (Pink Noise approximation)
            const bufferSize = this.ctx.sampleRate * 2.0;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                data[i] *= 0.11; // Normalize roughly
                b6 = white * 0.115926;
            }
            const noiseSrc = this.ctx.createBufferSource();
            noiseSrc.buffer = buffer;
            noiseSrc.loop = true;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.value = 600;

            // Gains
            const motor1Gain = this.ctx.createGain();
            motor1Gain.gain.value = 0.6;

            const motor2Gain = this.ctx.createGain();
            motor2Gain.gain.value = 0.1;

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.value = 0.4;

            const masterGain = this.ctx.createGain();
            masterGain.gain.setValueAtTime(0, now);
            masterGain.gain.linearRampToValueAtTime(0.5, now + 1.5); // Slow inertia spin-up

            // Graph
            motor1.connect(motor1Gain);
            motor2.connect(motor2Gain);
            noiseSrc.connect(noiseFilter);
            noiseFilter.connect(noiseGain);

            motor1Gain.connect(masterGain);
            motor2Gain.connect(masterGain);
            noiseGain.connect(masterGain);

            masterGain.connect(this.ctx.destination);

            motor1.start();
            motor2.start();
            noiseSrc.start();

            this.spinNodes = { motor1, motor2, noiseSrc, masterGain };
        }
    }

    stopGateSpin() {
        if (this.activeSpin) {
            this.activeSpin.stop();
            this.activeSpin = null;
        }

        if (this.spinNodes) {
            const now = this.ctx.currentTime;
            const { motor1, motor2, noiseSrc, masterGain } = this.spinNodes;

            // Spin down effect
            masterGain.gain.cancelScheduledValues(now);
            masterGain.gain.setValueAtTime(masterGain.gain.value, now);
            masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0); // 1s spin down

            // Motor frequency drop for realism
            motor1.frequency.exponentialRampToValueAtTime(40, now + 1.0);
            motor2.frequency.exponentialRampToValueAtTime(100, now + 1.0);

            setTimeout(() => {
                motor1.stop();
                motor2.stop();
                noiseSrc.stop();
                this.spinNodes = null;
            }, 1100);
        }
    }
}

const sounds = new SoundSystem();

// DOM Elements
const dhdGrid = document.getElementById('dhdGrid');
const addressSymbols = document.getElementById('addressSymbols');
const activateButton = document.getElementById('activateButton');
const resetButton = document.getElementById('resetButton');
const irisButton = document.getElementById('irisButton');
const emergencyButton = document.getElementById('emergencyButton');
const destinationsList = document.getElementById('destinationsList');
const consoleOutput = document.getElementById('consoleOutput');
const eventHorizon = document.getElementById('eventHorizon');
const gateStatus = document.getElementById('gateStatus');
const powerLevelDisplay = document.getElementById('powerLevel');
const chevronCount = document.getElementById('chevronCount');
const destinationDisplay = document.getElementById('destination');
const soundModeDisplay = document.getElementById('soundMode');
const canvas = document.getElementById('stargateCanvas');
const ctx = canvas.getContext('2d');
const irisProtection = document.getElementById('irisProtection');

// Initialize
async function init() {
    createDHD();
    renderDestinations();
    initIris();

    // Preload glyphs for the ring
    log('Carregando glifos do anel...', 'info');
    await preloadGlyphs();
    log('Glifos carregados.', 'success');

    // Start animation loop
    animationFrameId = requestAnimationFrame(updateFrame);

    // Update sound mode display after a short delay to allow assets to load
    setTimeout(() => {
        soundModeDisplay.textContent = sounds.mode.toUpperCase();
        soundModeDisplay.style.color = sounds.mode === 'original' ? '#00eeff' : '#00aa66';
    }, 1000);

    log('Sistema inicializado. Stargate em STANDBY.', 'info');
    log('Aguardando comandos...', 'info');
}

// Initialize Iris blades
function initIris() {
    const blades = irisProtection.querySelectorAll('.iris-blade');
    blades.forEach((blade, i) => {
        const rotation = (i * (360 / blades.length));
        blade.style.setProperty('--rotation', `${rotation}deg`);
        blade.style.transform = `rotate(${rotation}deg) scale(0)`;
    });
    irisProtection.classList.add('iris-open');
}

// Preload glyph images for canvas rendering
async function preloadGlyphs() {
    const promises = DHD_SYMBOLS.map(filename => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`Failed to load glyph: ${filename}`);
                resolve(null); // Resolve with null to avoid breaking Promise.all
            };
            img.src = `assets/glyphs/${filename}`;
        });
    });

    loadedGlyphs = await Promise.all(promises);
}

// Create DHD buttons
function createDHD() {
    DHD_SYMBOLS.forEach((filename, index) => {
        const button = document.createElement('div');
        button.className = 'dhd-symbol';

        const img = document.createElement('img');
        img.src = `assets/glyphs/${filename}`;
        img.alt = `Glyph ${index + 1}`;
        button.appendChild(img);

        button.dataset.index = index + 1;
        button.addEventListener('click', () => selectSymbol(index + 1, filename));
        dhdGrid.appendChild(button);
    });
}

// Select symbol from DHD
function selectSymbol(index, symbol) {
    if (gateActive) {
        log('ERRO: Gate já está ativo!', 'error');
        return;
    }

    if (selectedAddress.length >= 9) {
        log('AVISO: Endereço completo (9 chevrons). Pressione ATIVAR.', 'warning');
        return;
    }

    selectedAddress.push(index);
    updateAddressDisplay();
    sounds.playDialClick();

    // Visual feedback
    const button = document.querySelector(`[data-index="${index}"]`);
    button.classList.add('selected');
    setTimeout(() => button.classList.remove('selected'), 500);

    log(`Símbolo ${selectedAddress.length} selecionado: ${symbol} (${index})`, 'info');

    // Predizer comprimento total baseado em destinos ou default 7
    const potentialDest = findPartialDestination(selectedAddress);
    const targetLength = potentialDest ? (potentialDest.chevrons || 7) : 7;

    if (selectedAddress.length === targetLength) {
        log(`Endereço de ${targetLength} chevrons completo. Pronto para ativar.`, 'success');
    }
}

// Find destination starting with current address
function findPartialDestination(address) {
    return DESTINATIONS.find(dest =>
        JSON.stringify(dest.address.slice(0, address.length)) === JSON.stringify(address)
    );
}

// Update address display
function updateAddressDisplay() {
    const slots = addressSymbols.querySelectorAll('.symbol-slot');
    // Descobrir qual o comprimento alvo (default 7, ou o tamanho do endereço se for maior)
    const potentialDest = findPartialDestination(selectedAddress);
    const targetLength = Math.max(7, selectedAddress.length, potentialDest ? (potentialDest.chevrons || 7) : 7);

    slots.forEach((slot, index) => {
        if (index < targetLength) {
            slot.style.display = 'flex';
            if (selectedAddress[index]) {
                const glyphFile = DHD_SYMBOLS[selectedAddress[index] - 1];
                slot.innerHTML = `<img src="assets/glyphs/${glyphFile}" style="width: 100%; height: 100%; object-fit: contain; filter: brightness(1.5) drop-shadow(0 0 5px #00d4ff);">`;
                slot.classList.add('filled');
            } else {
                slot.textContent = '-';
                slot.classList.remove('filled');
            }
        } else {
            slot.style.display = 'none';
        }
    });
    chevronCount.textContent = `${selectedAddress.length}/${targetLength}`;
}

// Activate gate
activateButton.addEventListener('click', async () => {
    if (gateActive) {
        log('ERRO: Gate já está ativo!', 'error');
        return;
    }

    if (selectedAddress.length < 7) {
        log('ERRO: Endereço incompleto. Selecione pelo menos 7 símbolos.', 'error');
        return;
    }

    log('═══════════════════════════════════', 'info');
    log('INICIANDO SEQUÊNCIA DE DISCAGEM...', 'success');
    await dialSequence();
});

// Dial sequence
// Dial sequence
async function dialSequence() {
    gateActive = true;
    gateStatus.textContent = 'DISCANDO';

    const targetLength = selectedAddress.length;
    gateStatus.textContent = 'DISCANDO';

    // Lock chevrons one by one
    for (let i = 0; i < selectedAddress.length; i++) {
        const symbolIndex = selectedAddress[i] - 1;
        const direction = (i % 2 === 0) ? 1 : -1; // Alternate direction

        log(`Girando anel para símbolo ${i + 1}...`, 'info');
        // Rotate ring so the symbol hits the TOP (Chevron 1)
        await rotateToSymbol(symbolIndex, direction);

        log(`Travando Chevron ${i + 1}...`, 'info');
        // Visually lock the specific chevron (User Request)
        await animateChevronLock(i + 1);

        // After lock, light up the corresponding perimeter chevron (Encoding)
        // Update state array instead of DOM
        if (i < 9) chevronStates[i] = true;

        powerLevel += 120;
        powerLevelDisplay.textContent = `${powerLevel} MW`;
        chevronCount.textContent = `${i + 1}/${targetLength}`;
        log(`Chevron ${i + 1} codificado! Energia: ${powerLevel} MW`, 'success');
    }

    await sleep(1000);

    // Check if address is valid
    const destination = findDestination(selectedAddress);
    if (destination) {
        await establishWormhole(destination);
    } else {
        await failedConnection();
    }
}

// Rotate ring to a specific symbol index (0-38)
// Rotate ring so that symbolIndex is at the TOP (12 o'clock)
async function rotateToSymbol(symbolIndex, direction) {
    return new Promise(resolve => {
        // Target: Symbol at -90 degrees (Top)
        // Formula: symbolIndex * (360/39) - 90 + ringRotation = -90
        // => ringRotation = -symbolIndex * (360/39)
        let rawTarget = -symbolIndex * (360 / 39);

        // Adjust for current rotation to ensure we spin in the desired 'direction'
        // Simpler approach for "mechanical feel": 
        // If CW, find next target > current. If CCW, find next target < current.

        // Normalize strict modulo 360
        const currentRot = ringRotation % 360;

        // Find nearest target angle that satisfies rawTarget % 360
        // We want target = ringRotation + delta

        let delta = (rawTarget - ringRotation) % 360;
        // Make delta consistent
        if (delta > 180) delta -= 360;
        if (delta <= -180) delta += 360;

        // Now force direction
        if (direction === 1) { // CW
            if (delta <= 0) delta += 360;
        } else { // CCW
            if (delta >= 0) delta -= 360;
        }

        targetRotation = ringRotation + delta;
        isRotating = true;

        // Start Sound
        sounds.playGateSpin();

        const check = setInterval(() => {
            if (!isRotating) {
                clearInterval(check);
                // Stop Sound
                sounds.stopGateSpin();
                resolve();
            }
        }, 50);
    });
}

// Animate chevron locking
// Animate chevron locking (Only Top Chevron Moves)
// Animate chevron locking
async function animateChevronLock(chevronNumber) {
    // 1. Move Specific Chevron (User Request)
    const index = chevronNumber - 1;
    if (index < 0 || index >= 9) return;

    await moveChevron(index, 1);

    // 2. Play Sound
    sounds.playChevronLock();

    await sleep(300);

    // 3. Move Chevron back up
    await moveChevron(index, 0);

    await sleep(200);
}

// Helper to move a specific chevron
function moveChevron(index, target) {
    return new Promise(resolve => {
        const speed = 0.08;
        const interval = setInterval(() => {
            if (Math.abs(chevronOffsets[index] - target) < speed) {
                chevronOffsets[index] = target;
                clearInterval(interval);
                resolve();
            } else {
                chevronOffsets[index] += (target > chevronOffsets[index] ? 1 : -1) * speed;
            }
        }, 30);
    });
}

// Lock chevron (visual - basic version for non-animated chevrons)
function lockChevron(number) {
    if (number >= 1 && number <= 9) {
        chevronStates[number - 1] = true;
        sounds.playChevronLock();
    }
}

// Unlock all chevrons
function unlockChevrons() {
    // Reset state array
    chevronStates.fill(false);
}

// Establish wormhole
async function establishWormhole(destination) {
    log('═══════════════════════════════════', 'success');
    log(`CONEXÃO ESTABELECIDA!`, 'success');
    log(`Destino: ${destination.name} (${destination.designation})`, 'success');
    log(`Distância: ${destination.distance}`, 'info');
    log('═══════════════════════════════════', 'success');

    gateStatus.textContent = 'ATIVO';
    destinationDisplay.textContent = destination.name;
    powerLevel = 800;
    powerLevelDisplay.textContent = `${powerLevel} MW`;

    // Activate event horizon
    eventHorizon.classList.add('active');
    sounds.playKawoosh();
    sounds.playEventHorizonHum();

    // Kawoosh effect
    await kawooshEffect();

    // Kawoosh effect
    await kawooshEffect();

    // Enable stable puddle animation
    wormholeStable = true;

    log('Horizonte de eventos estável. Travessia segura.', 'success');
    log('Tempo de conexão: 38 minutos.', 'info');

    // Auto-close after 38 seconds (simulating 38 minutes)
    connectionTimer = setTimeout(() => {
        closeGate();
        log('Tempo de conexão expirado. Gate fechado automaticamente.', 'warning');
    }, 38000);
}

// Failed connection
async function failedConnection() {
    log('═══════════════════════════════════', 'error');
    log('FALHA NA CONEXÃO!', 'error');
    log('Endereço inválido ou gate de destino offline.', 'error');
    log('═══════════════════════════════════', 'error');

    await sleep(1000);
    closeGate();
}

// Kawoosh effect (unstable vortex)
async function kawooshEffect() {
    log('VÓRTICE DE EVENTOS INSTÁVEL - PERIGO!', 'warning');
    for (let i = 0; i < 3; i++) {
        eventHorizon.style.transform = 'scale(1.3)';
        await sleep(200);
        eventHorizon.style.transform = 'scale(1)';
        await sleep(200);
    }
    log('Vórtice estabilizado.', 'success');
}

// Close gate
function closeGate() {
    gateActive = false;
    wormholeStable = false; // Stop puddle animation
    gateStatus.textContent = 'STANDBY';
    destinationDisplay.textContent = '---';
    powerLevel = 0;
    powerLevelDisplay.textContent = '0 MW';
    eventHorizon.classList.remove('active');
    unlockChevrons();
    sounds.stopEventHorizonHum();

    if (connectionTimer) {
        clearTimeout(connectionTimer);
        connectionTimer = null;
    }

    log('Gate fechado. Sistema em STANDBY.', 'info');
}

// Reset
resetButton.addEventListener('click', () => {
    if (gateActive) {
        log('AVISO: Fechando gate ativo...', 'warning');
        closeGate();
    }

    // Ensure all states are reset
    wormholeStable = false;
    selectedAddress = [];
    updateAddressDisplay();
    log('Sistema resetado.', 'info');
});

// Iris control
irisButton.addEventListener('click', () => {
    irisOpen = !irisOpen;
    irisButton.textContent = `Iris: ${irisOpen ? 'ABERTO' : 'FECHADO'}`;
    irisButton.style.background = irisOpen
        ? 'linear-gradient(135deg, #0088cc 0%, #006699 100%)'
        : 'linear-gradient(135deg, #cc0033 0%, #990022 100%)';

    if (irisOpen) {
        irisProtection.classList.remove('iris-closed');
        irisProtection.classList.add('iris-open');
        sounds.playIrisOpen();
    } else {
        irisProtection.classList.remove('iris-open');
        irisProtection.classList.add('iris-closed');
        sounds.playIrisClose();
    }

    log(`Iris ${irisOpen ? 'aberto' : 'fechado'}.`, irisOpen ? 'success' : 'warning');
});

// Keyboard support
window.addEventListener('keydown', (e) => {
    // 1-9 for quick symbol entry (simplified mapping)
    if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key);
        selectSymbol(index, DHD_SYMBOLS[index - 1]);
    }
    // Enter to activate
    if (e.key === 'Enter') {
        activateButton.click();
    }
    // Escape to reset
    if (e.key === 'Escape') {
        resetButton.click();
    }
    // 'i' for iris
    if (e.key.toLowerCase() === 'i') {
        irisButton.click();
    }
});

// Emergency shutdown
emergencyButton.addEventListener('click', () => {
    log('═══════════════════════════════════', 'error');
    log('DESLIGAMENTO DE EMERGÊNCIA ATIVADO!', 'error');
    log('═══════════════════════════════════', 'error');

    if (gateActive) {
        closeGate();
    }

    selectedAddress = [];
    updateAddressDisplay();
    irisOpen = false;
    irisButton.textContent = 'Iris: FECHADO';
    irisButton.style.background = 'linear-gradient(135deg, #cc0033 0%, #990022 100%)';

    log('Todos os sistemas desligados.', 'error');
    log('Iris fechado por segurança.', 'error');
});

// Render destinations list
function renderDestinations() {
    DESTINATIONS.forEach(dest => {
        const item = document.createElement('div');
        item.className = 'destination-item';
        item.innerHTML = `
            <h4>${dest.name}</h4>
            <p>${dest.description}</p>
            <p class="address-code">Endereço: ${dest.address.join('-')}</p>
        `;
        item.addEventListener('click', () => quickDial(dest));
        destinationsList.appendChild(item);
    });
}

// Quick dial from destinations list
function quickDial(destination) {
    if (gateActive) {
        log('ERRO: Gate já está ativo!', 'error');
        return;
    }

    selectedAddress = [...destination.address];
    updateAddressDisplay();
    log(`Discagem rápida: ${destination.name}`, 'info');
    log('Pressione ATIVAR para conectar.', 'info');
}

// Find destination by address
function findDestination(address) {
    return DESTINATIONS.find(dest =>
        JSON.stringify(dest.address) === JSON.stringify(address)
    );
}

// Animation loop
function updateFrame() {
    // Handle ring rotation
    if (isRotating) {
        const speed = 1.5; // Degrees per frame
        const diff = targetRotation - ringRotation;

        if (Math.abs(diff) < speed) {
            ringRotation = targetRotation;
            isRotating = false;
        } else {
            ringRotation += Math.sign(diff) * speed;
        }
    }

    drawStargate();
    animationFrameId = requestAnimationFrame(updateFrame);
}

// Draw Stargate on canvas
function drawStargate() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 250;
    const innerRadius = 200;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Inner ring (rotating)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#0088cc';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw symbols around the ring (applying ringRotation)
    for (let i = 0; i < 39; i++) {
        const angle = (i * (360 / 39) - 90 + ringRotation) * (Math.PI / 180);
        const x = centerX + Math.cos(angle) * (innerRadius + 25);
        const y = centerY + Math.sin(angle) * (innerRadius + 25);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2); // Rotate to face outward/inward correctly

        if (loadedGlyphs[i]) {
            // Draw image glyph
            try {
                // Draw image centered at (0,0) with size approx 30x30
                ctx.drawImage(loadedGlyphs[i], -15, -15, 30, 30);

                // Add a faint blue glow to the glyphs
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
                ctx.fillRect(-15, -15, 30, 30);
                ctx.globalCompositeOperation = 'source-over';
            } catch (e) {
                // Fallback to text if drawing fails
                ctx.fillStyle = '#00d4ff';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(UNICODE_SYMBOLS[i], 0, 0);
            }
        } else {
            // Fallback not loaded
            ctx.fillStyle = '#00d4ff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(UNICODE_SYMBOLS[i], 0, 0);
        }
        ctx.restore();
    }

    // Draw chevrons (mechanical look)
    for (let i = 0; i < 9; i++) {
        const angle = (i * 40 - 90) * (Math.PI / 180);
        // Position on the ring + movement offset
        const moveDist = chevronOffsets[i] * 15;
        const x = centerX + Math.cos(angle) * (outerRadius + 5 - moveDist);
        const y = centerY + Math.sin(angle) * (outerRadius + 5 - moveDist);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Triangle pointing towards center
        // At rotate(angle), local -X axis points to center
        // COMPLEX CHEVRON DESIGN (SG-1 Style)
        // 1. Housing (Dark Metallic UI)
        // Main block
        ctx.beginPath();
        ctx.moveTo(18, -15);
        ctx.lineTo(18, 15);
        ctx.lineTo(-5, 10);
        ctx.lineTo(-5, -10);
        ctx.closePath();
        ctx.fillStyle = '#2d3748'; // Dark slate
        ctx.fill();
        ctx.strokeStyle = '#4a5568';
        ctx.stroke();

        // The "V" Shape Wing (The clamp part)
        ctx.beginPath();
        ctx.moveTo(-5, -12);
        ctx.lineTo(-20, 0);  // Tip pointing to center
        ctx.lineTo(-5, 12);
        ctx.lineTo(-2, 8);   // Inner V detail
        ctx.lineTo(-12, 0);  // Inner Tip
        ctx.lineTo(-2, -8);  // Inner V detail
        ctx.closePath();
        ctx.fillStyle = '#4a5568'; // Lighter metal
        ctx.fill();
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 2. The Crystal Light (The glowing part)
        const isActive = chevronStates[i];

        ctx.beginPath();
        // Crystal shape sits inside the housing
        ctx.moveTo(12, -8);
        ctx.lineTo(12, 8);
        ctx.lineTo(2, 5);
        ctx.lineTo(2, -5);
        ctx.closePath();

        if (isActive) {
            // Active Glow
            ctx.shadowColor = '#ff4400';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ff6600';
        } else {
            // Inactive (Dark glass)
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#1a202c';
        }
        ctx.fill();

        // Crystal highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    // Event Horizon (Puddle Effect)
    drawEventHorizon(centerX, centerY, innerRadius - 10);
}

// Draw Procedure Event Horizon (Water Ripple)
function drawEventHorizon(cx, cy, radius) {
    if (!wormholeStable) {
        // Standard Dark / Inactive State (or Kawoosh handled by CSS/Transform)
        // Note: During Kawoosh, the CSS .event-horizon is active. 
        // We only draw the canvas puddle when STABLE.

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 5, 20, 0.95)'; // Deep space black/blue
        ctx.fill();
        return;
    }

    // STABLE WHIRLPOOL ANIMATION
    ctx.save();

    // Clip to circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // 1. Deep swirling background
    const time = performance.now() / 1000;

    // Rotating gradient
    const gradAngle = time * 0.5;
    const gx = cx + Math.cos(gradAngle) * radius * 0.5;
    const gy = cy + Math.sin(gradAngle) * radius * 0.5;

    const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(200, 240, 255, 0.8)'); // Bright eye of the storm
    gradient.addColorStop(0.2, 'rgba(0, 100, 200, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 20, 40, 0.9)'); // Dark outer edge

    ctx.fillStyle = gradient;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // 2. Spiral Arms (The Whirlpool)
    const arms = 12;
    ctx.lineWidth = 2;

    for (let i = 0; i < arms; i++) {
        const armAngleOffset = (Math.PI * 2 / arms) * i;
        const speed = 2.0;

        ctx.beginPath();
        for (let r = 0; r <= radius; r += 5) {
            // Logarithmic spiral-ish: angle decreases as radius increases (trailing arms)
            // Plus time rotation that is faster at center
            const theta = armAngleOffset + (r * 0.05) - (time * speed);

            // Add some "watery" sine distortion to the line
            const distortion = Math.sin(r * 0.1 - time * 5) * 5;

            // Polar to Cartesian
            const px = cx + Math.cos(theta) * (r + distortion);
            const py = cy + Math.sin(theta) * (r + distortion);

            if (r === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }

        ctx.strokeStyle = `rgba(0, 180, 255, 0.3)`;
        ctx.stroke();
    }

    // 3. Fast inner vortex rings
    ctx.lineWidth = 1;
    for (let r = 10; r < radius * 0.4; r += 8) {
        const offset = Math.sin(r * 0.5 - time * 8) * 3;
        ctx.beginPath();
        // Elliptical distortion to look like it's flowing in
        const distortX = Math.cos(time * 2) * 2;
        const distortY = Math.sin(time * 2) * 2;

        ctx.ellipse(cx + distortX, cy + distortY, r + offset, r + offset, time, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(150, 220, 255, ${0.4 * (1 - r / (radius * 0.4))})`;
        ctx.stroke();
    }

    ctx.restore();
}

// Console logging
function log(message, type = 'info') {
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Sound effects (simulated)
function playChevronSound() {
    // In a real implementation, you would play an actual sound file
    console.log('*CLUNK* Chevron locked!');
}

// Utility: sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize on load
window.addEventListener('load', init);
