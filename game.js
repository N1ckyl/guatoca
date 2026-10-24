/**
 * LA GUATOCA - Motor Web Fiel al Original (Unity / IL2CPP)
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

// Audio sintetizado
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
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.22);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
    osc.start(now);
    osc.stop(now + 0.22);
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
  // Modal de añadir jugador (Imagen 1 -> Imagen 2)
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

  // Carrusel de avatares (Imagen 2)
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

  // Pestañas TABLEROS / MODOS (Imágenes 3 y 4)
  document.querySelectorAll('.game-tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      playSound('click');
      document.querySelectorAll('.game-tab-item').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.modes-scroll-view').forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.getElementById(`tab-${tabName}-view`).classList.add('active');
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

  // Dado interactivo
  document.getElementById('dice-button').addEventListener('click', rollDice);

  // Cerrar carta del tablero
  document.getElementById('btn-close-card').addEventListener('click', closeCardModal);

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

// --- MODAL DE EXPLICACIÓN (IMÁGENES 1 Y 2) ---
function openExplanationModal(level) {
  selectedLevelForExplanation = level;
  currentExampleIndex = 0;

  const card = document.getElementById('explanation-card-element');
  const title = document.getElementById('explanation-title');
  const desc = document.getElementById('explanation-desc');

  // Gradiente dinámico según colores originales de Unity
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

  if (level.type === 'BOARD') {
    initSpiralBoard(level);
    showScreen('screen-board');
  } else {
    initPartyMode(level);
    showScreen('screen-cards-mode');
  }
}

// --- COORDENADAS DEL TABLERO ESPIRAL 9x8 EXACTO (IMAGEN 3) ---
const SPIRAL_COORDS = [
  // 0: START (fila 8, col 1..3)
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
  // 62: celda vertical hacia el centro (col 3, fila 4)
  { col: 3, row: 4 },
  // 63: END (filas 4..5, cols 4..6)
  { col: 4, row: 4, spanCol: 3, spanRow: 2, isEnd: true }
];

const PASTEL_PALETTE = ['tile-pink', 'tile-blue', 'tile-green', 'tile-yellow', 'tile-purple', 'tile-orange'];

function initSpiralBoard(level) {
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

  SPIRAL_COORDS.forEach((coord, idx) => {
    const tile = document.createElement('div');
    tile.id = `spiral-tile-${idx}`;

    if (coord.isStart) {
      tile.className = 'spiral-tile tile-start';
      tile.textContent = 'START';
      tile.style.gridColumn = '1 / span 3';
      tile.style.gridRow = '8';
    } else if (coord.isEnd) {
      tile.className = 'spiral-tile tile-end';
      tile.textContent = 'END';
      tile.style.gridColumn = '4 / span 3';
      tile.style.gridRow = '4 / span 2';
    } else {
      const colorClass = PASTEL_PALETTE[idx % PASTEL_PALETTE.length];
      tile.className = `spiral-tile ${colorClass}`;
      tile.textContent = idx;
      tile.style.gridColumn = `${coord.col}`;
      tile.style.gridRow = `${coord.row}`;
    }

    grid.appendChild(tile);
  });

  // Extensión decorativa de la casilla END (col 3, fila 5) para la forma continua L
  const endExt = document.createElement('div');
  endExt.className = 'spiral-tile tile-end-ext';
  grid.appendChild(endExt);

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
  const maxPos = SPIRAL_COORDS.length - 1;
  players.forEach((p, idx) => {
    const token = document.getElementById(`player-token-${idx}`);
    const pos = Math.min(p.position, maxPos);
    const tile = SPIRAL_COORDS[pos];

    if (token && tile) {
      const spanC = tile.spanCol || 1;
      const spanR = tile.spanRow || 1;
      const xPercent = ((tile.col - 1 + spanC / 2) / 9) * 100;
      const yPercent = ((tile.row - 1 + spanR / 2) / 8) * 100;
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

// --- LANZAMIENTO DEL DADO ---
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

  const maxPos = SPIRAL_COORDS.length - 1;
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
  playSound('card');
  const activePlayer = players[activePlayerIndex];

  // Determinar categoría según posición
  const categories = ['drink', 'event', 'dare', 'truth', 'nhie'];
  if (currentMode.id === 'hot') {
    categories.push('hot1', 'hot2', 'hot3');
  }
  const chosenCat = categories[cellIndex % categories.length];
  const phrase = getPhraseForCategory(chosenCat, currentMode.id, activePlayer.name);

  document.getElementById('card-type-tag').textContent = getCategoryLabel(chosenCat).toUpperCase();
  document.getElementById('card-phrase-text').textContent = phrase;
  document.getElementById('card-target-player').textContent = activePlayer.name;
  document.getElementById('card-player-avatar-img').src = `assets/avatars/${activePlayer.avatar}.png`;

  document.getElementById('card-modal').classList.remove('hidden');
}

function closeCardModal() {
  playSound('click');
  document.getElementById('card-modal').classList.add('hidden');
  isRolling = false;

  activePlayerIndex = (activePlayerIndex + 1) % players.length;
  updatePlayerTokensPosition();
}

function getPhraseForCategory(category, levelId, playerName) {
  let catList = gameData.cards[category];

  if (!catList || catList.length === 0) {
    catList = gameData.cards['drink'] || [];
  }

  let filtered = catList.filter(item => {
    if (!item.games) return true;
    return item.games.toLowerCase().includes(levelId.toLowerCase());
  });

  if (filtered.length === 0) {
    filtered = catList;
  }

  const selected = filtered[Math.floor(Math.random() * filtered.length)];
  let rawText = selected ? selected.text : '¡Pagan todos un trago!';

  let result = rawText.replace(/{turn}/g, playerName);
  if (result.includes('{otherPlayer}')) {
    const others = players.filter(p => p.name !== playerName);
    const other = others.length > 0 ? others[Math.floor(Math.random() * others.length)].name : 'tu compañero';
    result = result.replace(/{otherPlayer}/g, other);
  }

  return result;
}

// --- MODO FIESTA / CARDS MODE (IMAGEN 1 - YO NUNCA) ---
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

  const phrase = getPhraseForCategory(cat, currentMode.id, activePlayer.name);
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
