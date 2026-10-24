/**
 * LA GUATOCA - Motor Web Fiel al Original (Unity / IL2CPP)
 * Incluye:
 * - Tableros: Clásico, Etílico, Hot, Pareja (62 casillas), Flash (35 casillas), XXL (85 casillas).
 * - Casillas coloreadas: Tomar (Amarillo), Yo Nunca (Azul), Verdad (Verde), Reto (Rosa), Evento (Morado), Hot (Naranja).
 * - Carta 3D con volteo suave para revelar y deslizamiento lateral para descartar.
 * - Modo Dado de Colores con dado interactivo de 6 colores.
 * - Modal "¿CÓMO SE JUEGA?" idéntico al original.
 * - Sistema de baraja sin repetición para todas las categorías.
 */

// --- ESTADO GLOBAL ---
let gameData = null;
let labelsData = null;
let currentLanguage = 'es_ES';
let soundEnabled = true;

let players = [];
let avatarList = [
  'smiley', 'copa', 'corona', 'vaso', 'diamante', 'bola',
  'sombrero', 'balon', 'cerveza', 'billar', 'labios', 'disco',
  'alien', 'pizza', 'arcoiris', 'llama'
];
let modalAvatarIndex = 0;

let selectedLevelForExplanation = null;
let currentExampleIndex = 0;

let currentMode = null; // Nivel o modo activo
let activePlayerIndex = 0;
let isRolling = false;

// Audio sintetizado Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (!soundEnabled) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === 'dice') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === 'card') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.24);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.24);
    osc.start(now);
    osc.stop(now + 0.24);
  } else if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.06);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
    osc.start(now);
    osc.stop(now + 0.06);
  } else if (type === 'win') {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.25, now + i * 0.12);
      g.gain.linearRampToValueAtTime(0.01, now + i * 0.12 + 0.3);
      o.start(now + i * 0.12);
      o.stop(now + i * 0.12 + 0.3);
    });
  }
}

// --- ETIQUETAS Y TEXTOS VISIBLES ---
function getModeLabel(modeId) {
  if (labelsData && labelsData.modes && labelsData.modes[modeId]) {
    return labelsData.modes[modeId];
  }
  return modeId;
}

function getCategoryLabel(catId) {
  if (labelsData && labelsData.categories && labelsData.categories[catId]) {
    return labelsData.categories[catId];
  }
  if (labelsData && labelsData.modes && labelsData.modes[catId]) {
    return labelsData.modes[catId];
  }
  return catId;
}

// --- BARAJA SIN REPETICIÓN (DECK SYSTEM) ---
const cardDecks = {};

function drawCardWithoutRepeat(category, levelId, playerName) {
  let catKey = category;
  if (category === 'tomar') catKey = 'drink';
  else if (category === 'reto') catKey = 'dare';
  else if (category === 'verdad') catKey = 'truth';
  else if (category === 'evento') catKey = 'event';
  else if (category === 'hot') {
    const hotKeys = ['hot1', 'hot2', 'hot3'];
    catKey = hotKeys[Math.floor(Math.random() * hotKeys.length)];
  }

  // Si la baraja está vacía, clonar y barajar
  if (!cardDecks[catKey] || cardDecks[catKey].length === 0) {
    let pool = (gameData.cards[catKey] || gameData.cards['drink'] || []).slice();
    if (levelId && pool.some(c => c.games && c.games.toLowerCase().includes(levelId.toLowerCase()))) {
      pool = pool.filter(c => !c.games || c.games.toLowerCase().includes(levelId.toLowerCase()));
    }
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    cardDecks[catKey] = pool;
  }

  const item = cardDecks[catKey].pop() || { text: '¡Pagan todos un trago!' };
  let text = item.text || '¡Pagan todos un trago!';

  text = text.replace(/{turn}/g, playerName);
  if (text.includes('{otherPlayer}')) {
    const others = players.filter(p => p.name !== playerName);
    const other = others.length > 0 ? others[Math.floor(Math.random() * others.length)].name : 'tu compañero';
    text = text.replace(/{otherPlayer}/g, other);
  }
  return text;
}

// --- COORDENADAS DEL TABLERO CLÁSICO 9x8 (62 CASILLAS + START + END) ---
const SPIRAL_COORDS = [
  // 0: START
  { col: 1, row: 8, spanCol: 3, spanRow: 1, isStart: true },
  // 1..6: fila inferior 8 (col 4..9)
  { col: 4, row: 8 }, { col: 5, row: 8 }, { col: 6, row: 8 }, { col: 7, row: 8 }, { col: 8, row: 8 }, { col: 9, row: 8 },
  // 7..13: columna derecha 9 hacia arriba (filas 7..1)
  { col: 9, row: 7 }, { col: 9, row: 6 }, { col: 9, row: 5 }, { col: 9, row: 4 }, { col: 9, row: 3 }, { col: 9, row: 2 }, { col: 9, row: 1 },
  // 14..21: fila superior 1 hacia la izquierda (cols 8..1)
  { col: 8, row: 1 }, { col: 7, row: 1 }, { col: 6, row: 1 }, { col: 5, row: 1 }, { col: 4, row: 1 }, { col: 3, row: 1 }, { col: 2, row: 1 }, { col: 1, row: 1 },
  // 22..27: columna izquierda 1 hacia abajo (filas 2..7)
  { col: 1, row: 2 }, { col: 1, row: 3 }, { col: 1, row: 4 }, { col: 1, row: 5 }, { col: 1, row: 6 }, { col: 1, row: 7 },
  // 28..34: vuelta 2 fila 7 hacia la derecha (cols 2..8)
  { col: 2, row: 7 }, { col: 3, row: 7 }, { col: 4, row: 7 }, { col: 5, row: 7 }, { col: 6, row: 7 }, { col: 7, row: 7 }, { col: 8, row: 7 },
  // 35..39: vuelta 2 columna 8 hacia arriba (filas 6..2)
  { col: 8, row: 6 }, { col: 8, row: 5 }, { col: 8, row: 4 }, { col: 8, row: 3 }, { col: 8, row: 2 },
  // 40..45: vuelta 2 fila 2 hacia la izquierda (cols 7..2)
  { col: 7, row: 2 }, { col: 6, row: 2 }, { col: 5, row: 2 }, { col: 4, row: 2 }, { col: 3, row: 2 }, { col: 2, row: 2 },
  // 46..49: vuelta 2 columna 2 hacia abajo (filas 3..6)
  { col: 2, row: 3 }, { col: 2, row: 4 }, { col: 2, row: 5 }, { col: 2, row: 6 },
  // 50..54: vuelta 3 fila 6 hacia la derecha (cols 3..7)
  { col: 3, row: 6 }, { col: 4, row: 6 }, { col: 5, row: 6 }, { col: 6, row: 6 }, { col: 7, row: 6 },
  // 55..56: vuelta 3 columna 7 hacia arriba (filas 5..4)
  { col: 7, row: 5 }, { col: 7, row: 4 },
  // 57..61: vuelta 3 fila 3 hacia la izquierda (cols 7..3)
  { col: 7, row: 3 }, { col: 6, row: 3 }, { col: 5, row: 3 }, { col: 4, row: 3 }, { col: 3, row: 3 },
  // 62: celda vertical hacia el centro
  { col: 3, row: 4 },
  // 63: END
  { col: 4, row: 4, spanCol: 3, spanRow: 2, isEnd: true }
];

// --- COORDENADAS DEL TABLERO FLASH 7x6 (35 CASILLAS + START + END) ---
const FLASH_COORDS = [
  // 0: START (col 1 span 2, row 6)
  { col: 1, row: 6, spanCol: 2, spanRow: 1, isStart: true },
  // 1..5: fila inferior 6 (col 3..7)
  { col: 3, row: 6 }, { col: 4, row: 6 }, { col: 5, row: 6 }, { col: 6, row: 6 }, { col: 7, row: 6 },
  // 6..9: columna derecha 7 hacia arriba (filas 5..2)
  { col: 7, row: 5 }, { col: 7, row: 4 }, { col: 7, row: 3 }, { col: 7, row: 2 },
  // 10..16: fila superior 1 hacia la izquierda (cols 7..1)
  { col: 7, row: 1 }, { col: 6, row: 1 }, { col: 5, row: 1 }, { col: 4, row: 1 }, { col: 3, row: 1 }, { col: 2, row: 1 }, { col: 1, row: 1 },
  // 17..20: columna izquierda 1 hacia abajo (filas 2..5)
  { col: 1, row: 2 }, { col: 1, row: 3 }, { col: 1, row: 4 }, { col: 1, row: 5 },
  // 21..25: vuelta 2 fila 5 hacia la derecha (cols 2..6)
  { col: 2, row: 5 }, { col: 3, row: 5 }, { col: 4, row: 5 }, { col: 5, row: 5 }, { col: 6, row: 5 },
  // 26..28: vuelta 2 columna 6 hacia arriba (filas 4..2)
  { col: 6, row: 4 }, { col: 6, row: 3 }, { col: 6, row: 2 },
  // 29..32: vuelta 2 fila 2 hacia la izquierda (cols 5..2)
  { col: 5, row: 2 }, { col: 4, row: 2 }, { col: 3, row: 2 }, { col: 2, row: 2 },
  // 33..34: vuelta 2 columna 2 hacia abajo (filas 3..4)
  { col: 2, row: 3 }, { col: 2, row: 4 },
  // 35: celda previa a la meta
  { col: 3, row: 4 },
  // 36: END (filas 3..4, cols 4..5)
  { col: 4, row: 3, spanCol: 2, spanRow: 2, isEnd: true }
];

// --- COORDENADAS DEL TABLERO XXL 10x9 (85 CASILLAS + START + END) ---
const XXL_COORDS = [
  // 0: START
  { col: 1, row: 9, spanCol: 3, spanRow: 1, isStart: true },
  // 1..7: fila inferior 9 (col 4..10)
  { col: 4, row: 9 }, { col: 5, row: 9 }, { col: 6, row: 9 }, { col: 7, row: 9 }, { col: 8, row: 9 }, { col: 9, row: 9 }, { col: 10, row: 9 },
  // 8..15: columna derecha 10 hacia arriba (filas 8..1)
  { col: 10, row: 8 }, { col: 10, row: 7 }, { col: 10, row: 6 }, { col: 10, row: 5 }, { col: 10, row: 4 }, { col: 10, row: 3 }, { col: 10, row: 2 }, { col: 10, row: 1 },
  // 16..24: fila superior 1 hacia la izquierda (cols 9..1)
  { col: 9, row: 1 }, { col: 8, row: 1 }, { col: 7, row: 1 }, { col: 6, row: 1 }, { col: 5, row: 1 }, { col: 4, row: 1 }, { col: 3, row: 1 }, { col: 2, row: 1 }, { col: 1, row: 1 },
  // 25..31: columna izquierda 1 hacia abajo (filas 2..8)
  { col: 1, row: 2 }, { col: 1, row: 3 }, { col: 1, row: 4 }, { col: 1, row: 5 }, { col: 1, row: 6 }, { col: 1, row: 7 }, { col: 1, row: 8 },
  // 32..39: vuelta 2 fila 8 hacia la derecha (cols 2..9)
  { col: 2, row: 8 }, { col: 3, row: 8 }, { col: 4, row: 8 }, { col: 5, row: 8 }, { col: 6, row: 8 }, { col: 7, row: 8 }, { col: 8, row: 8 }, { col: 9, row: 8 },
  // 40..45: vuelta 2 columna 9 hacia arriba (filas 7..2)
  { col: 9, row: 7 }, { col: 9, row: 6 }, { col: 9, row: 5 }, { col: 9, row: 4 }, { col: 9, row: 3 }, { col: 9, row: 2 },
  // 46..52: vuelta 2 fila 2 hacia la izquierda (cols 8..2)
  { col: 8, row: 2 }, { col: 7, row: 2 }, { col: 6, row: 2 }, { col: 5, row: 2 }, { col: 4, row: 2 }, { col: 3, row: 2 }, { col: 2, row: 2 },
  // 53..57: vuelta 2 columna 2 hacia abajo (filas 3..7)
  { col: 2, row: 3 }, { col: 2, row: 4 }, { col: 2, row: 5 }, { col: 2, row: 6 }, { col: 2, row: 7 },
  // 58..63: vuelta 3 fila 7 hacia la derecha (cols 3..8)
  { col: 3, row: 7 }, { col: 4, row: 7 }, { col: 5, row: 7 }, { col: 6, row: 7 }, { col: 7, row: 7 }, { col: 8, row: 7 },
  // 64..67: vuelta 3 columna 8 hacia arriba (filas 6..3)
  { col: 8, row: 6 }, { col: 8, row: 5 }, { col: 8, row: 4 }, { col: 8, row: 3 },
  // 68..72: vuelta 3 fila 3 hacia la izquierda (cols 7..3)
  { col: 7, row: 3 }, { col: 6, row: 3 }, { col: 5, row: 3 }, { col: 4, row: 3 }, { col: 3, row: 3 },
  // 73..75: vuelta 3 columna 3 hacia abajo (filas 4..6)
  { col: 3, row: 4 }, { col: 3, row: 5 }, { col: 3, row: 6 },
  // 76..79: vuelta 4 fila 6 hacia la derecha (cols 4..7)
  { col: 4, row: 6 }, { col: 5, row: 6 }, { col: 6, row: 6 }, { col: 7, row: 6 },
  // 80..81: vuelta 4 columna 7 hacia arriba (filas 5..4)
  { col: 7, row: 5 }, { col: 7, row: 4 },
  // 82..84: vuelta 4 fila 4 hacia la izquierda (cols 6..4)
  { col: 6, row: 4 }, { col: 5, row: 4 }, { col: 4, row: 4 },
  // 85: última celda antes de la meta
  { col: 4, row: 5 },
  // 86: END (filas 4..5, cols 5..6)
  { col: 5, row: 4, spanCol: 2, spanRow: 2, isEnd: true }
];

// --- CONFIGURACIÓN DE TABLEROS ---
const BOARD_CONFIGS = {
  classic: {
    coords: SPIRAL_COORDS,
    cols: 9,
    rows: 8,
    className: 'board-classic',
    categories: ['reto', 'tomar', 'nhie', 'evento', 'verdad', 'tomar', 'reto', 'nhie', 'evento', 'verdad', 'tomar']
  },
  hammered: {
    coords: SPIRAL_COORDS,
    cols: 9,
    rows: 8,
    className: 'board-classic',
    categories: ['tomar', 'reto', 'tomar', 'evento', 'tomar', 'nhie', 'tomar', 'verdad', 'tomar']
  },
  hot: {
    coords: SPIRAL_COORDS,
    cols: 9,
    rows: 8,
    className: 'board-classic',
    categories: ['reto', 'hot', 'tomar', 'verdad', 'hot', 'nhie', 'evento', 'hot', 'tomar']
  },
  couple: {
    coords: SPIRAL_COORDS,
    cols: 9,
    rows: 8,
    className: 'board-classic',
    categories: ['verdad', 'reto', 'tomar', 'evento', 'nhie', 'verdad', 'reto', 'hot']
  },
  flash: {
    coords: FLASH_COORDS,
    cols: 7,
    rows: 6,
    className: 'board-flash',
    categories: ['flash', 'nhie', 'tomar', 'flash', 'nhie', 'reto', 'flash', 'nhie', 'tomar']
  },
  xxl: {
    coords: XXL_COORDS,
    cols: 10,
    rows: 9,
    className: 'board-xxl',
    categories: ['reto', 'tomar', 'nhie', 'evento', 'verdad', 'hot', 'tomar', 'reto', 'nhie', 'evento', 'verdad', 'tomar']
  }
};

let activeBoardConfig = BOARD_CONFIGS.classic;

// --- DADO DE COLORES (6 CARAS) ---
const COLOR_DICE_FACES = [
  { name: 'TOMAR', cat: 'tomar', color: '#EFC03F' },
  { name: 'YO NUNCA', cat: 'nhie', color: '#0098C9' },
  { name: 'VERDAD', cat: 'verdad', color: '#4E7A30' },
  { name: 'RETO', cat: 'reto', color: '#D75993' },
  { name: 'EVENTO', cat: 'evento', color: '#592B84' },
  { name: 'HOT', cat: 'hot', color: '#E17554' }
];

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [gameRes, labelsRes] = await Promise.all([
      fetch('data/game_data.json'),
      fetch('data/labels.json')
    ]);

    gameData = await gameRes.json();
    labelsData = await labelsRes.json();

    runLabelsAuditCheck();

    setupAppEvents();
    updateModalAvatar();
    renderAddedPlayers();

    // 2 jugadores por defecto para partidas inmediatas
    addPlayer('Jugador 1', 'cerveza');
    addPlayer('Jugador 2', 'copa');
  } catch (err) {
    console.error('Error al inicializar la aplicación:', err);
  }
});

function runLabelsAuditCheck() {
  let missing = [];
  if (gameData && gameData.levels) {
    gameData.levels.forEach(lvl => {
      if (!labelsData.modes[lvl.id]) missing.push(`Modo: ${lvl.id}`);
    });
  }
  if (gameData && gameData.cards) {
    Object.keys(gameData.cards).forEach(cat => {
      if (!labelsData.categories[cat] && !labelsData.modes[cat]) missing.push(`Categoría: ${cat}`);
    });
  }
  if (missing.length === 0) {
    console.log('Comprobación de etiquetas: 0 sin etiqueta');
  } else {
    console.warn(`Comprobación de etiquetas: ${missing.length} sin etiqueta`, missing);
  }
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

// --- CONFIGURACIÓN DE EVENTOS ---
function setupAppEvents() {
  // Modal de añadir jugador
  const addPlayerModal = document.getElementById('add-player-modal');
  const btnOpenAdd = document.getElementById('btn-open-add-player');
  const btnCloseAdd = document.getElementById('btn-close-add-modal');
  const inputName = document.getElementById('modal-player-name');

  btnOpenAdd.addEventListener('click', () => {
    playSound('click');
    inputName.value = '';
    addPlayerModal.classList.remove('hidden');
    inputName.focus();
  });

  btnCloseAdd.addEventListener('click', () => {
    playSound('click');
    addPlayerModal.classList.add('hidden');
  });

  // Carrusel de avatares
  document.getElementById('btn-prev-avatar').addEventListener('click', () => {
    playSound('click');
    modalAvatarIndex = (modalAvatarIndex - 1 + avatarList.length) % avatarList.length;
    updateModalAvatar();
  });

  document.getElementById('btn-next-avatar').addEventListener('click', () => {
    playSound('click');
    modalAvatarIndex = (modalAvatarIndex + 1) % avatarList.length;
    updateModalAvatar();
  });

  document.getElementById('btn-confirm-add-player').addEventListener('click', handleAddPlayerSubmit);
  inputName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAddPlayerSubmit();
  });

  // Botón EMPEZAR -> ¿QUÉ VAMOS A JUGAR?
  document.getElementById('btn-start-game').addEventListener('click', () => {
    playSound('click');
    showScreen('screen-modes');
  });

  // Volver a ¿QUIÉN TOMA HOY?
  document.getElementById('btn-back-to-players').addEventListener('click', () => {
    playSound('click');
    showScreen('screen-players');
  });

  // Pestañas TABLEROS / MODOS
  document.querySelectorAll('.game-tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      playSound('click');
      document.querySelectorAll('.game-tab-item').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.modes-scroll-view').forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      const targetView = document.getElementById(`tab-${tabName}-view`);
      if (targetView) targetView.classList.add('active');
    });
  });

  // Clic en cualquier botón de modo/tablero -> Abre modal de explicación
  document.querySelectorAll('.mode-image-button').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const modeId = btn.dataset.mode;
      const level = gameData.levels.find(l => l.id === modeId);
      if (level) {
        openExplanationModal(level);
      }
    });
  });

  // Botones dentro del Modal de Explicación
  document.getElementById('btn-close-explanation').addEventListener('click', () => {
    playSound('click');
    document.getElementById('explanation-modal').classList.add('hidden');
  });

  document.getElementById('btn-explanation-play').addEventListener('click', () => {
    playSound('click');
    document.getElementById('explanation-modal').classList.add('hidden');
    if (selectedLevelForExplanation) {
      startLevel(selectedLevelForExplanation);
    }
  });

  // Puntos del carrusel de ejemplos en la explicación
  document.querySelectorAll('#example-dots .dot').forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      playSound('click');
      currentExampleIndex = idx;
      updateExplanationExample();
    });
  });

  // Salir de partida
  document.getElementById('btn-exit-board').addEventListener('click', confirmExitToModes);
  document.getElementById('btn-exit-cards-mode').addEventListener('click', confirmExitToModes);
  const btnExitDice = document.getElementById('btn-exit-colordice');
  if (btnExitDice) {
    btnExitDice.addEventListener('click', confirmExitToModes);
  }

  // Ayuda del Tablero "¿CÓMO SE JUEGA?"
  const btnHelp = document.getElementById('btn-help-board');
  const instructionsModal = document.getElementById('instructions-modal');
  const btnCloseInstructions = document.getElementById('btn-close-instructions');

  if (btnHelp && instructionsModal) {
    btnHelp.addEventListener('click', () => {
      playSound('click');
      instructionsModal.classList.remove('hidden');
    });
  }
  if (btnCloseInstructions && instructionsModal) {
    btnCloseInstructions.addEventListener('click', () => {
      playSound('click');
      instructionsModal.classList.add('hidden');
    });
  }
  if (instructionsModal) {
    instructionsModal.addEventListener('click', (e) => {
      if (e.target.id === 'instructions-modal') {
        playSound('click');
        instructionsModal.classList.add('hidden');
      }
    });
  }

  // Dado interactivo en Tablero
  document.getElementById('dice-button').addEventListener('click', rollDice);

  // Dado 3D en Modo Dado de Colores
  const colordiceCube = document.getElementById('colordice-cube-btn');
  if (colordiceCube) {
    colordiceCube.addEventListener('click', rollColorDice);
  }

  // Interacción Carta 3D (Click en la carta para voltear y luego deslizar)
  const cardFlipper = document.getElementById('card-3d-flipper');
  const cardScene = document.getElementById('card-3d-scene');
  if (cardScene) {
    cardScene.addEventListener('click', handleCard3DClick);
  }

  // Modos de fiesta
  document.getElementById('btn-next-phrase').addEventListener('click', () => nextPartyPhrase());
  document.getElementById('btn-choose-truth').addEventListener('click', () => nextPartyPhrase('truth'));
  document.getElementById('btn-choose-dare').addEventListener('click', () => nextPartyPhrase('dare'));

  // Fin de partida
  document.getElementById('btn-play-again').addEventListener('click', () => {
    document.getElementById('gameover-modal').classList.add('hidden');
    startLevel(currentMode);
  });
  document.getElementById('btn-return-home').addEventListener('click', () => {
    document.getElementById('gameover-modal').classList.add('hidden');
    showScreen('screen-modes');
  });

  // Ajustes e Idioma
  const settingsModal = document.getElementById('settings-modal');
  const openSettings = () => {
    playSound('click');
    settingsModal.classList.remove('hidden');
  };

  document.getElementById('btn-lang-toggle').addEventListener('click', openSettings);
  document.getElementById('btn-settings').addEventListener('click', openSettings);
  document.getElementById('btn-settings-modes').addEventListener('click', openSettings);
  document.getElementById('btn-close-settings').addEventListener('click', () => settingsModal.classList.add('hidden'));
  document.getElementById('btn-save-settings').addEventListener('click', () => settingsModal.classList.add('hidden'));

  // Selector de idioma
  document.querySelectorAll('.lang-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      playSound('click');
      document.querySelectorAll('.lang-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentLanguage = pill.dataset.lang;
      document.getElementById('current-lang-flag').src = `assets/ui/${currentLanguage}.png`;
    });
  });

  // Alternar sonido
  const btnSound = document.getElementById('btn-toggle-sound');
  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnSound.textContent = soundEnabled ? 'Activado 🔊' : 'Desactivado 🔇';
    playSound('click');
  });
}

function confirmExitToModes() {
  if (confirm('¿Quieres salir al menú de modos?')) {
    playSound('click');
    showScreen('screen-modes');
  }
}

// --- MODAL DE EXPLICACIÓN ---
function openExplanationModal(level) {
  selectedLevelForExplanation = level;
  currentExampleIndex = 0;

  const card = document.getElementById('explanation-card-element');
  const title = document.getElementById('explanation-title');
  const desc = document.getElementById('explanation-desc');

  const color1 = level.popupColor ? level.popupColor.slice(0, 7) : '#e1448e';
  const color2 = level.gradientColor ? level.gradientColor.slice(0, 7) : '#f5dd08';
  card.style.background = `linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`;

  title.textContent = (level.title || getModeLabel(level.id)).toUpperCase();
  desc.textContent = level.description || (labelsData.descriptions && labelsData.descriptions[level.id]) || '';

  updateExplanationExample();
  document.getElementById('explanation-modal').classList.remove('hidden');
}

function updateExplanationExample() {
  const exampleTextEl = document.getElementById('explanation-example-text');
  const dots = document.querySelectorAll('#example-dots .dot');

  let examples = (selectedLevelForExplanation && selectedLevelForExplanation.examples) || [];
  if (examples.length === 0) {
    const pool = gameData.cards[selectedLevelForExplanation.id] || gameData.cards['drink'] || [];
    examples = pool.slice(0, 3).map(p => p.text.replace(/{turn}/g, 'Jugador').replace(/{otherPlayer}/g, 'amigo'));
  }

  const currentText = examples[currentExampleIndex % examples.length] || '¡Pagan todos un trago!';
  exampleTextEl.textContent = currentText;

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === (currentExampleIndex % examples.length));
  });
}

// --- CARRUSEL Y JUGADORES ---
function updateModalAvatar() {
  const av = avatarList[modalAvatarIndex];
  document.getElementById('modal-avatar-img').src = `assets/avatars/${av}.png`;
}

function handleAddPlayerSubmit() {
  const input = document.getElementById('modal-player-name');
  const name = input.value.trim();
  if (!name) return;

  const avatar = avatarList[modalAvatarIndex];
  addPlayer(name, avatar);

  playSound('click');
  document.getElementById('add-player-modal').classList.add('hidden');

  modalAvatarIndex = (modalAvatarIndex + 1) % avatarList.length;
  updateModalAvatar();
}

function addPlayer(name, avatar) {
  players.push({
    id: Date.now() + Math.random(),
    name: name,
    avatar: avatar,
    position: 0
  });

  renderAddedPlayers();
}

function removePlayer(idx) {
  playSound('click');
  players.splice(idx, 1);
  renderAddedPlayers();
}

function renderAddedPlayers() {
  const container = document.getElementById('added-players-container');
  const btnStart = document.getElementById('btn-start-game');
  container.innerHTML = '';

  players.forEach((p, idx) => {
    const item = document.createElement('div');
    item.className = 'player-bubble-item';
    item.innerHTML = `
      <div class="player-avatar-circle">
        <img src="assets/avatars/${p.avatar}.png" alt="${p.avatar}">
      </div>
      <span class="player-bubble-name">${escapeHtml(p.name)}</span>
      <button class="btn-remove-bubble" data-idx="${idx}">&times;</button>
    `;
    item.querySelector('.btn-remove-bubble').addEventListener('click', (e) => {
      e.stopPropagation();
      removePlayer(idx);
    });
    container.appendChild(item);
  });

  btnStart.disabled = players.length < 2;
}

// --- INICIAR PARTIDA ---
function startLevel(level) {
  currentMode = level;
  activePlayerIndex = 0;
  players.forEach(p => p.position = 0);

  if (level.id === 'colordice') {
    initColorDiceMode();
    showScreen('screen-colordice-mode');
  } else if (level.type === 'BOARD') {
    initSpiralBoard(level);
    showScreen('screen-board');
  } else {
    initPartyMode(level);
    showScreen('screen-cards-mode');
  }
}

// --- TABLERO ESPIRAL ---
function initSpiralBoard(level) {
  activeBoardConfig = BOARD_CONFIGS[level.id] || BOARD_CONFIGS.classic;

  renderBoardPlayersBar();
  renderSpiralBoardGrid();
  updatePlayerTokensPosition();

  // Resetear dado cara 1
  const dicePrefix = getDiceFolderPrefix(level.id);
  document.getElementById('dice-img').src = `assets/dice/1_Dice${dicePrefix}.png`;
}

function getDiceFolderPrefix(levelId) {
  switch (levelId) {
    case 'hot': return 'Hot';
    case 'hammered': return 'Hammered';
    case 'couple': return 'Couple';
    case 'flash': return 'Flash';
    case 'xxl': return 'XXL';
    case 'classic':
    default: return 'Classic';
  }
}

function renderBoardPlayersBar() {
  const bar = document.getElementById('board-players-bar');
  if (!bar) return;
  bar.innerHTML = '';

  players.forEach((p, idx) => {
    const chip = document.createElement('div');
    chip.className = 'board-player-status-chip';
    chip.innerHTML = `
      <div class="board-player-avatar-ring ${idx === activePlayerIndex ? 'active-turn' : ''}" id="player-ring-${idx}">
        <img src="assets/avatars/${p.avatar}.png" alt="${p.name}">
      </div>
      <span class="board-player-name-label ${idx === activePlayerIndex ? 'active-turn-name' : ''}" id="player-name-label-${idx}">${escapeHtml(p.name)}</span>
      <div class="board-player-dashes">
        <span class="board-player-dash"></span>
        <span class="board-player-dash"></span>
        <span class="board-player-dash"></span>
        <span class="board-player-dash"></span>
        <span class="board-player-dash"></span>
      </div>
    `;
    bar.appendChild(chip);
  });
}

function renderSpiralBoardGrid() {
  const grid = document.getElementById('spiral-board-grid');
  grid.innerHTML = '';

  grid.className = 'spiral-board-container ' + activeBoardConfig.className;

  const coords = activeBoardConfig.coords;
  const categories = activeBoardConfig.categories;

  coords.forEach((coord, idx) => {
    const tile = document.createElement('div');
    tile.id = `spiral-tile-${idx}`;

    if (coord.isStart) {
      tile.className = 'spiral-tile tile-start';
      tile.textContent = 'START';
      tile.style.gridColumn = `${coord.col} / span ${coord.spanCol || 2}`;
      tile.style.gridRow = `${coord.row}`;
    } else if (coord.isEnd) {
      tile.className = 'spiral-tile tile-end';
      tile.textContent = 'END';
      tile.style.gridColumn = `${coord.col} / span ${coord.spanCol || 2}`;
      tile.style.gridRow = `${coord.row} / span ${coord.spanRow || 2}`;
    } else {
      const cat = categories[(idx - 1) % categories.length];
      const colorClass = `tile-${cat}`;
      tile.className = `spiral-tile ${colorClass}`;
      tile.textContent = idx;
      tile.style.gridColumn = `${coord.col}`;
      tile.style.gridRow = `${coord.row}`;
      tile.dataset.category = cat;
    }

    grid.appendChild(tile);
  });

  // Tokens de jugadores
  players.forEach((p, idx) => {
    const token = document.createElement('div');
    token.className = 'spiral-player-token';
    token.id = `player-token-${idx}`;
    token.innerHTML = `<img src="assets/avatars/${p.avatar}.png" alt="${p.name}">`;
    grid.appendChild(token);
  });
}

function updatePlayerTokensPosition() {
  const coords = activeBoardConfig.coords;
  const maxPos = coords.length - 1;
  const numCols = activeBoardConfig.cols;
  const numRows = activeBoardConfig.rows;

  players.forEach((p, idx) => {
    const token = document.getElementById(`player-token-${idx}`);
    const pos = Math.min(p.position, maxPos);
    const tile = coords[pos];

    if (token && tile) {
      const spanC = tile.spanCol || 1;
      const spanR = tile.spanRow || 1;
      const xPercent = ((tile.col - 1 + spanC / 2) / numCols) * 100;
      const yPercent = ((tile.row - 1 + spanR / 2) / numRows) * 100;
      const spread = (idx - (players.length - 1) / 2) * 5;

      token.style.left = `calc(${xPercent}% + ${spread}px)`;
      token.style.top = `${yPercent}%`;
    }
  });

  // Actualizar turno activo en la barra superior
  players.forEach((_, idx) => {
    const ring = document.getElementById(`player-ring-${idx}`);
    if (ring) {
      ring.classList.toggle('active-turn', idx === activePlayerIndex);
    }
    const nameLabel = document.getElementById(`player-name-label-${idx}`);
    if (nameLabel) {
      nameLabel.classList.toggle('active-turn-name', idx === activePlayerIndex);
    }
  });
}

// --- LANZAMIENTO DEL DADO EN TABLERO ---
function rollDice() {
  if (isRolling) return;
  isRolling = true;

  const diceImg = document.getElementById('dice-img');
  const dicePrefix = getDiceFolderPrefix(currentMode.id);

  let ticks = 0;
  const interval = setInterval(() => {
    ticks++;
    const tempValue = Math.floor(Math.random() * 6) + 1;
    diceImg.src = `assets/dice/${tempValue}_Dice${dicePrefix}.png`;
    playSound('dice');

    if (ticks > 7) {
      clearInterval(interval);
      const finalRoll = Math.floor(Math.random() * 6) + 1;
      diceImg.src = `assets/dice/${finalRoll}_Dice${dicePrefix}.png`;

      setTimeout(() => {
        advanceSpiralPlayer(finalRoll);
      }, 250);
    }
  }, 75);
}

function advanceSpiralPlayer(steps) {
  const player = players[activePlayerIndex];
  player.position += steps;

  const maxPos = activeBoardConfig.coords.length - 1;
  if (player.position >= maxPos) {
    player.position = maxPos;
    updatePlayerTokensPosition();
    triggerGameOver(player);
    isRolling = false;
    return;
  }

  updatePlayerTokensPosition();

  setTimeout(() => {
    triggerSpiralCellCard(player.position);
  }, 350);
}

function triggerSpiralCellCard(cellIndex) {
  const activePlayer = players[activePlayerIndex];
  const cats = activeBoardConfig.categories;
  const chosenCat = cats[(cellIndex - 1) % cats.length] || 'tomar';

  showCardModal(chosenCat, currentMode.id, activePlayer, () => {
    activePlayerIndex = (activePlayerIndex + 1) % players.length;
    updatePlayerTokensPosition();
    isRolling = false;
  });
}

// --- CARTA 3D FLIP & SLIDE-OUT INTERACTIVA ---
let isCardFlipped = false;
let isCardSliding = false;
let onCardDismissCallback = null;

function showCardModal(category, levelId, player, onDismiss) {
  isCardFlipped = false;
  isCardSliding = false;
  onCardDismissCallback = onDismiss;

  const flipper = document.getElementById('card-3d-flipper');
  const backFace = document.getElementById('card-back-face');
  const frontFace = document.getElementById('card-front-face');
  const titleEl = document.getElementById('card-back-title');
  const phraseEl = document.getElementById('card-phrase-text');

  flipper.classList.remove('is-flipped', 'slide-out');

  // Quitar clases previas de color
  backFace.className = 'card-3d-face card-3d-back';
  frontFace.className = 'card-3d-face card-3d-front';

  // Configuración de estilo y etiqueta según el tipo
  const catStyles = {
    'tomar': { title: 'TOMAR', backClass: 'card-back-tomar', frontClass: 'card-front-tomar' },
    'drink': { title: 'TOMAR', backClass: 'card-back-tomar', frontClass: 'card-front-tomar' },
    'nhie': { title: 'YO NUNCA', backClass: 'card-back-nhie', frontClass: 'card-front-nhie' },
    'verdad': { title: 'VERDAD', backClass: 'card-back-verdad', frontClass: 'card-front-verdad' },
    'truth': { title: 'VERDAD', backClass: 'card-back-verdad', frontClass: 'card-front-verdad' },
    'reto': { title: 'RETO', backClass: 'card-back-reto', frontClass: 'card-front-reto' },
    'dare': { title: 'RETO', backClass: 'card-back-reto', frontClass: 'card-front-reto' },
    'evento': { title: 'EVENTO', backClass: 'card-back-evento', frontClass: 'card-front-evento' },
    'event': { title: 'EVENTO', backClass: 'card-back-evento', frontClass: 'card-front-evento' },
    'hot': { title: 'HOT', backClass: 'card-back-hot', frontClass: 'card-front-hot' },
    'flash': { title: 'FLASH', backClass: 'card-back-nhie', frontClass: 'card-front-nhie' }
  };

  const meta = catStyles[category] || { title: 'RETO', backClass: 'card-back-reto', frontClass: 'card-front-reto' };
  backFace.classList.add(meta.backClass);
  frontFace.classList.add(meta.frontClass);
  titleEl.textContent = meta.title;

  const phrase = drawCardWithoutRepeat(category, levelId, player.name);
  phraseEl.textContent = phrase;

  document.getElementById('card-modal').classList.remove('hidden');
  playSound('card');
}

function handleCard3DClick() {
  const flipper = document.getElementById('card-3d-flipper');
  if (!flipper) return;

  if (!isCardFlipped) {
    // Primer clic: voltear suavemente para revelar
    isCardFlipped = true;
    flipper.classList.add('is-flipped');
    playSound('card');
  } else if (!isCardSliding) {
    // Segundo clic: deslizar suavemente hacia el lado
    isCardSliding = true;
    flipper.classList.add('slide-out');
    playSound('click');

    setTimeout(() => {
      document.getElementById('card-modal').classList.add('hidden');
      flipper.classList.remove('is-flipped', 'slide-out');
      isCardSliding = false;
      isCardFlipped = false;

      if (typeof onCardDismissCallback === 'function') {
        const cb = onCardDismissCallback;
        onCardDismissCallback = null;
        cb();
      }
    }, 460);
  }
}

// --- MODO DADO DE COLORES ---
function initColorDiceMode() {
  activePlayerIndex = 0;
  renderColorDicePlayersBar();
  updateColorDiceTurnDisplay();
}

function renderColorDicePlayersBar() {
  const bar = document.getElementById('colordice-players-bar');
  if (!bar) return;
  bar.innerHTML = '';
  const ringColors = ['#f87171', '#4ade80', '#38bdf8', '#fbbf24', '#c084fc', '#fb7185'];

  players.forEach((p, idx) => {
    const chip = document.createElement('div');
    chip.className = 'cards-player-status-chip';
    const color = ringColors[idx % ringColors.length];
    chip.innerHTML = `
      <div class="cards-player-avatar-ring ${idx === activePlayerIndex ? 'active-turn' : ''}" style="background: ${color};">
        <img src="assets/avatars/${p.avatar}.png" alt="${p.name}">
      </div>
      <span class="cards-player-name-label ${idx === activePlayerIndex ? 'active-turn-name' : ''}">${escapeHtml(p.name)}</span>
      <div class="cards-player-dashes">
        <span class="cards-player-dash"></span>
        <span class="cards-player-dash"></span>
        <span class="cards-player-dash"></span>
        <span class="cards-player-dash"></span>
        <span class="cards-player-dash"></span>
      </div>
    `;
    bar.appendChild(chip);
  });
}

function updateColorDiceTurnDisplay() {
  const player = players[activePlayerIndex];
  const nameEl = document.getElementById('colordice-player-name');
  if (nameEl && player) {
    nameEl.textContent = player.name;
  }
  renderColorDicePlayersBar();

  const faceEl = document.getElementById('colordice-face-element');
  const labelEl = document.getElementById('colordice-face-text');
  if (faceEl && labelEl) {
    faceEl.style.background = 'linear-gradient(135deg, #1e1e38 0%, #2a2a4e 100%)';
    labelEl.textContent = 'TIRAR DADO';
    labelEl.style.color = '#ffffff';
  }
}

function rollColorDice() {
  if (isRolling) return;
  isRolling = true;

  const faceEl = document.getElementById('colordice-face-element');
  const labelEl = document.getElementById('colordice-face-text');
  const wrapper = document.getElementById('colordice-cube-btn');

  wrapper.classList.add('rolling');
  let ticks = 0;
  const interval = setInterval(() => {
    ticks++;
    const face = COLOR_DICE_FACES[Math.floor(Math.random() * COLOR_DICE_FACES.length)];
    faceEl.style.background = face.color;
    labelEl.textContent = face.name;
    labelEl.style.color = '#ffffff';
    playSound('dice');

    if (ticks > 9) {
      clearInterval(interval);
      wrapper.classList.remove('rolling');
      const finalFace = COLOR_DICE_FACES[Math.floor(Math.random() * COLOR_DICE_FACES.length)];
      faceEl.style.background = finalFace.color;
      labelEl.textContent = finalFace.name;

      setTimeout(() => {
        const activePlayer = players[activePlayerIndex];
        showCardModal(finalFace.cat, 'colordice', activePlayer, () => {
          activePlayerIndex = (activePlayerIndex + 1) % players.length;
          updateColorDiceTurnDisplay();
          isRolling = false;
        });
      }, 500);
    }
  }, 85);
}

// --- MODO FIESTA / CARDS MODE (YO NUNCA, VERDAD O RETO) ---
function initPartyMode(level) {
  document.getElementById('cards-header-title').textContent = (level.title || getModeLabel(level.id)).toUpperCase();
  renderCardsPlayersBar();

  const isTod = level.id === 'tod';
  document.getElementById('tod-choice-buttons').classList.toggle('hidden', !isTod);
  document.getElementById('btn-next-phrase').classList.toggle('hidden', isTod);

  nextPartyPhrase();
}

function renderCardsPlayersBar() {
  const bar = document.getElementById('cards-players-bar');
  if (!bar) return;
  bar.innerHTML = '';
  const ringColors = ['#f87171', '#4ade80', '#38bdf8', '#fbbf24', '#c084fc', '#fb7185'];

  players.forEach((p, idx) => {
    const chip = document.createElement('div');
    chip.className = 'cards-player-status-chip';
    const color = ringColors[idx % ringColors.length];
    chip.innerHTML = `
      <div class="cards-player-avatar-ring ${idx === activePlayerIndex ? 'active-turn' : ''}" id="cards-player-ring-${idx}" style="background: ${color};">
        <img src="assets/avatars/${p.avatar}.png" alt="${p.name}">
      </div>
      <span class="cards-player-name-label ${idx === activePlayerIndex ? 'active-turn-name' : ''}">${escapeHtml(p.name)}</span>
      <div class="cards-player-dashes">
        <span class="cards-player-dash"></span>
        <span class="cards-player-dash"></span>
        <span class="cards-player-dash"></span>
        <span class="cards-player-dash"></span>
        <span class="cards-player-dash"></span>
      </div>
    `;
    bar.appendChild(chip);
  });
}

function nextPartyPhrase(subCategory) {
  playSound('card');
  const activePlayer = players[activePlayerIndex];
  let cat = currentMode.id;

  if (cat === 'tod') {
    cat = subCategory || (Math.random() < 0.5 ? 'truth' : 'dare');
  }

  const phrase = drawCardWithoutRepeat(cat, currentMode.id, activePlayer.name);
  const cardText = document.getElementById('party-card-text');
  cardText.textContent = phrase;

  activePlayerIndex = (activePlayerIndex + 1) % players.length;
  renderCardsPlayersBar();
}

// --- PODIO Y FIN DE PARTIDA ---
function triggerGameOver(winner) {
  playSound('win');
  document.getElementById('winner-name').textContent = winner.name;

  const sorted = [...players].sort((a, b) => b.position - a.position);
  const podium = document.getElementById('podium-display');
  podium.innerHTML = '';

  const positions = [
    { rank: 2, player: sorted[1], class: 'podium-2', label: '2°' },
    { rank: 1, player: sorted[0], class: 'podium-1', label: '1°' },
    { rank: 3, player: sorted[2], class: 'podium-3', label: '3°' }
  ];

  positions.forEach(slot => {
    if (slot.player) {
      const slotEl = document.createElement('div');
      slotEl.className = 'podium-slot';
      slotEl.innerHTML = `
        <img src="assets/avatars/${slot.player.avatar}.png" alt="${slot.player.name}">
        <span>${escapeHtml(slot.player.name)}</span>
        <div class="podium-block ${slot.class}">${slot.label}</div>
      `;
      podium.appendChild(slotEl);
    }
  });

  document.getElementById('gameover-modal').classList.remove('hidden');
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
