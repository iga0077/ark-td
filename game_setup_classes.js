// game_setup_classes.js (Часть 1: Настройки, Классы, Утилиты)

// --- Константы и Настройки ---

const GRID_ROWS = 8;
const GRID_COLS = 6;
const REFRESH_COST = 50;
const LEFT_DECK_ROLES_BASE = ["Supporter", "Caster", "Caster AOE", "Sniper"];
const RIGHT_DECK_ROLES_BASE = ["Guard", "Defender"];
const ICON_BORDER_RADIUS = 3;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const ZOOM_FACTOR = 1.2;
const MAX_OPERATORS_ON_FIELD = 9;
const TOTAL_BATTLES = 5;
const INITIAL_BASE_HP = 10;
const BATTLE_MODIFIERS = [2, 4, 6, 7, 9];
const BREAK_ROUNDS_BETWEEN_BATTLES = [1, 2, 3, 3];
const ENEMY_CELL_Y_OFFSET_PERCENT = 0.20;
const MAX_ENEMIES_PER_CELL = 2;
const ENEMY_HP_FONT_SIZE_RATIO = 0.22;
const ENEMY_HP_BG_PADDING_RATIO = 0.05;
const ENEMY_SPRITE_CORNER_RADIUS = 6;
const OPERATOR_SPRITE_CORNER_RADIUS = 6;
const ENEMY_HP_BG_CORNER_RADIUS = 4;
const STUN_ICON_SRC = 'img/stun.png';
const SLOW_ICON_SRC = 'img/slow.png';
const SPECIALIST_MOVE_SPEED_FACTOR = 2.5;


// --- Данные Волн Врагов ---
const ENEMY_WAVE_DATA = {
    1: { enemies: [ ...Array(5).fill("regular_inmate"), ...Array(5).fill("sicilian"), ...Array(5).fill("marksman"), ...Array(5).fill("second_inmate"), ...Array(5).fill("caster") ], boss: "crownslayer_boss" },
    2: { enemies: [ ...Array(3).fill("regular_inmate"), ...Array(3).fill("sicilian"), ...Array(3).fill("marksman"), ...Array(3).fill("second_inmate"), ...Array(3).fill("caster"), ...Array(3).fill("caster_elite"), ...Array(3).fill("soldier"), ...Array(3).fill("soldier_2"), ...Array(3).fill("leithanien_rebel"), ...Array(3).fill("crownslayer") ], boss: "skullshatterer_boss" },
    3: { enemies: [ "marksman", ...Array(2).fill("second_inmate"), ...Array(2).fill("caster"), ...Array(3).fill("caster_elite"), ...Array(3).fill("soldier"), ...Array(3).fill("soldier_2"), ...Array(3).fill("leithanien_rebel"), ...Array(3).fill("crownslayer"), ...Array(3).fill("tiakau_warrior"), ...Array(3).fill("tiakau_warlock"), ...Array(3).fill("infected_picket"), ...Array(3).fill("sarkaz_swordsman"), ...Array(3).fill("junkman") ], boss: "defiled_knight_boss" },
    4: { enemies: [ ...Array(2).fill("second_inmate"), ...Array(3).fill("caster"), "caster_elite", "soldier", "soldier_2", ...Array(2).fill("leithanien_rebel"), ...Array(2).fill("crownslayer"), ...Array(2).fill("tiakau_warrior"), ...Array(2).fill("tiakau_warlock"), ...Array(2).fill("sarkaz_swordsman"), ...Array(2).fill("junkman"), ...Array(4).fill("yeti_caster"), ...Array(4).fill("plastic_knight"), ...Array(4).fill("great_swordsman"), ...Array(4).fill("rusted_bronze_knight"), ...Array(4).fill("skullshatterer") ], boss: "patriot_boss" },
    5: { enemies: [ ...Array(2).fill("caster"), "soldier", "leithanien_rebel", ...Array(2).fill("crownslayer"), "tiakau_warlock", "tiakau_warrior", "infected_picket", ...Array(2).fill("sarkaz_swordsman"), ...Array(3).fill("junkman"), ...Array(2).fill("yeti_caster"), ...Array(2).fill("plastic_knight"), ...Array(2).fill("great_swordsman"), ...Array(2).fill("rusted_bronze_knight"), ...Array(3).fill("skullshatterer"), ...Array(4).fill("talulah"), ...Array(4).fill("left_handed_titus_bayer"), ...Array(4).fill("big_bob"), ...Array(4).fill("frostnova"), ...Array(4).fill("defiled_knight") ], boss: "mudrock_boss" }
};

// --- Динамические переменные и Состояние Игры ---

let MAP_IMAGE_SRC = 'img/map/easy.png';
let CELL_SIZE = 64;
let zoomLevel = 1.0;
let gameLMD = 480;
let gameBaseHp = INITIAL_BASE_HP;
let gameRound = 1;
let gameBattle = 1;
const placedOperators = [];
const activeEnemies = [];
let mapImage = null;
let mapLoaded = false;
let selectedOperator = null;
let targetingMode = false;
let heldOperatorId = null;
let placementMode = false;
let animationFrameId = null;
let hoveredOperatorInfo = null;
let hoveredShopOperatorInfoId = null;
let hoveredUpgradeButtonOp = null;
let hoveredEnemyInfo = null;

let gameEnded = false;
let currentPhase = 'purchase';

let aoeMainTarget = null;
let aoeSplashTargets = [];
let specialistHoverTarget = null;
let specialistSwapTarget = null;
let ifritAttackLine = null;
let ifritLineTargets = [];
let currentWaveDeck = [];
let currentBossId = null;
let bossSpawnedThisBattle = false;
let bossesDefeatedCount = 0;
let isBreakPeriodActive = false;
let breakRoundsLeft = 0;
let battleToLoadAfterBreak = 0;
let nextWaveEnemiesCanSpawn = false;

//таймер
let gameStartTime = null;
let gameTimerInterval = null;
let gameTimerElement = null;

//переменные для отслеживания статистики
let totalLmdSpent = 0;
let totalOperatorsBought = 0;
let operatorDamageStats = {}; // { operatorId: { name: string, damage: number } }

// --- DOM элементы ---

let canvas, ctx, gameArea, errorMessageDiv,
    baseHpBarFill, baseHpBarText,
    roundCounterSpan, battleCounterSpan, totalBattlesSpan, heldOperatorInfo, logEntriesDiv,
    shopDecksContainer, refreshShopBtn, shopAvailabilityInfo, shopLmdCounterSpan,
    tooltipElement, zoomInBtn, zoomOutBtn, endPurchaseBtn, endAttackBtn,
    currentPhaseDisplay, gameStatusMessage;

// --- Загрузка иконок статусов ---

const stunIcon = new Image();
stunIcon.src = STUN_ICON_SRC;
let stunIconLoaded = false;
stunIcon.onload = () => { stunIconLoaded = true; if (mapLoaded && !gameEnded && typeof drawGame === 'function') drawGame(); };
stunIcon.onerror = () => { console.error(`Ошибка загрузки иконки оглушения: ${STUN_ICON_SRC}`); if(typeof addLogEntry === 'function') addLogEntry(`Ошибка загрузки иконки оглушения: ${STUN_ICON_SRC}`, "error");};

const slowIcon = new Image();
slowIcon.src = SLOW_ICON_SRC;
let slowIconLoaded = false;
slowIcon.onload = () => { slowIconLoaded = true; if (mapLoaded && !gameEnded && typeof drawGame === 'function') drawGame(); };
slowIcon.onerror = () => { console.error(`Ошибка загрузки иконки замедления: ${SLOW_ICON_SRC}`); if(typeof addLogEntry === 'function') addLogEntry(`Ошибка загрузки иконки замедления: ${SLOW_ICON_SRC}`, "error");};

window.customMapImages = {
    enemy_path: new Image(),
    placement: new Image(),
    wall: new Image()
};

// Загрузка изображений для кастомных карт
window.customMapImages.enemy_path.src = 'img/map/enemy_square.png';
window.customMapImages.placement.src = 'img/map/deploy_square.png';
window.customMapImages.wall.src = 'img/map/obstacle.png';

window.customMapImagesLoaded = false;
let loadedImagesCount = 0;

Object.values(window.customMapImages).forEach(img => {
    img.onload = () => {
        loadedImagesCount++;
        if (loadedImagesCount === Object.keys(window.customMapImages).length) {
            window.customMapImagesLoaded = true;
            console.log("Все изображения для кастомных карт загружены");
            // Перерисовываем если уже играем на кастомной карте
            if (currentMapData && currentMapData.isCustom && typeof drawGame === 'function') {
                drawGame();
            }
        }
    };
    img.onerror = (e) => {
        console.error("Ошибка загрузки изображения:", img.src, e);
    };
});

// --- Функции Карты ---

function getCurrentEnemyPath() { 
    return currentMapData ? currentMapData.enemyPath : []; 
}

function isPlacementCell(row, col) { 
    return currentMapData ? currentMapData.placementCells.some(cell => cell[0] === row && cell[1] === col) : false;
}

function isEnemyPathCell(row, col) { 
    return currentMapData ? currentMapData.enemyPath.some(cell => cell[0] === row && cell[1] === col) : false;
}

function isObstacleCell(row, col) { 
    return currentMapData ? currentMapData.obstacleCells.some(cell => cell[0] === row && cell[1] === col) : false;
}

function isWallCell(row, col) {
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return true;
    return !isPlacementCell(row, col) && !isEnemyPathCell(row, col) && !isObstacleCell(row, col);
}


function isCellOccupied(row, col, checkAgainstOperator = false) {
    if (placedOperators.some(op => op.row === row && op.col === col)) return true;
    return false;
}
function isObstacleCell(row, col) { 
    return currentMapData ? currentMapData.obstacleCells.some(cell => cell[0] === row && cell[1] === col) : false;
}
function getSpawnCell() { const path = getCurrentEnemyPath(); return path.length > 0 ? path[0] : null; }
function getEnemiesOnCell(row, col) {
    return activeEnemies.filter(enemy =>
        !enemy.isDefeated && !enemy.reachedEnd &&
        enemy.pathIndex < enemy.path.length &&
        enemy.path[enemy.pathIndex][0] === row &&
        enemy.path[enemy.pathIndex][1] === col
    );
}

// --- Вспомогательные Функции ---

function addLogEntry(message, type = 'info') {
    if (!logEntriesDiv) {
        console.log(`[Log (logEntriesDiv not ready)] ${type.toUpperCase()}: ${message}`);
        return;
    }
    const p = document.createElement('p');
    const time = new Date().toLocaleTimeString('ru-RU', { hour12: false });
    p.textContent = `[${time}] ${message}`;
    switch(type) {
        case 'error': p.className = 'text-red-400'; break;
        case 'success': p.className = 'text-green-400'; break;
        case 'warning': p.className = 'text-yellow-400'; break;
        case 'action': p.className = 'text-cyan-300'; break;
        case 'attack': p.className = 'text-orange-400'; break;
        case 'enemy_action': p.className = 'text-purple-400'; break;
        case 'game_state': p.className = 'text-gray-100'; break;
        case 'info': default: p.className = 'text-blue-300'; break;
    }
    logEntriesDiv.appendChild(p);
    logEntriesDiv.scrollTop = logEntriesDiv.scrollHeight;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function parseAttackValue(attackValue) {
    if (typeof attackValue === 'number') return { type: 'single', damage: attackValue };
    if (typeof attackValue === 'string') {
        const casterMatch = attackValue.match(/^(\d+)x(\d+)$/);
        if (casterMatch) return { type: 'caster', damagePerTarget: parseInt(casterMatch[1], 10), targets: parseInt(casterMatch[2], 10) };
        const aoeMatch = attackValue.match(/^(\d+)\((\d+)\)$/);
        if (aoeMatch) return { type: 'aoe', mainDamage: parseInt(aoeMatch[1], 10), splashDamage: parseInt(aoeMatch[2], 10) };
        if (attackValue.toLowerCase() === 'all line') return { type: 'line' };
    }
    console.error(`Не удалось распознать значение атаки: ${attackValue}`);
    return null;
}

function hasLineOfSight(operator, enemy) {
    if (!operator || !enemy) return false;
    const startX = operator.col * CELL_SIZE + CELL_SIZE / 2;
    const startY = operator.row * CELL_SIZE + CELL_SIZE / 2;
    const targetCell = enemy.path[enemy.pathIndex];
    if (!targetCell) return false;
    const endX = targetCell[1] * CELL_SIZE + CELL_SIZE / 2;
    const endY = targetCell[0] * CELL_SIZE + CELL_SIZE / 2;
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(distance / (CELL_SIZE * 0.33)));
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const checkX = startX + dx * t;
        const checkY = startY + dy * t;
        const checkCol = Math.floor(checkX / CELL_SIZE);
        const checkRow = Math.floor(checkY / CELL_SIZE);
        if (checkRow !== operator.row || checkCol !== operator.col) {
             if (checkRow !== targetCell[0] || checkCol !== targetCell[1]) {
                if (isWallCell(checkRow, checkCol) || isObstacleCell(checkRow, checkCol)) return false;
             }
        }
    }
    return true;
}

function findAdjacentEnemies(targetEnemy, allEnemies) {
    const neighbors = [];
    if (!targetEnemy || targetEnemy.isDefeated) return neighbors;
    
    // Сначала проверяем врагов на той же клетке
    const targetCell = targetEnemy.path[targetEnemy.pathIndex];
    const enemiesOnSameCell = allEnemies.filter(e => 
        !e.isDefeated && !e.reachedEnd && e !== targetEnemy &&
        e.pathIndex < e.path.length &&
        e.path[e.pathIndex][0] === targetCell[0] && 
        e.path[e.pathIndex][1] === targetCell[1]
    );
    
    // Добавляем врага с той же клетки (если есть)
    if (enemiesOnSameCell.length > 0) {
        neighbors.push(enemiesOnSameCell[0]);
    }
    
    // Определяем позицию targetEnemy на клетке
    const isTargetUpperOnCell = targetEnemy.drawSlot === 'first_in_cell' || 
                                 (targetEnemy.drawSlot === null && enemiesOnSameCell.length === 0);
    
    // Теперь ищем врага на соседней клетке
    if (isTargetUpperOnCell) {
        // Если цель - верхний враг, ищем на следующей клетке по пути
        const nextPathIndex = targetEnemy.pathIndex + 1;
        if (nextPathIndex < targetEnemy.path.length) {
            const nextCell = targetEnemy.path[nextPathIndex];
            const enemiesOnNextCell = allEnemies.filter(e =>
                !e.isDefeated && !e.reachedEnd &&
                e.pathIndex < e.path.length &&
                e.path[e.pathIndex][0] === nextCell[0] &&
                e.path[e.pathIndex][1] === nextCell[1]
            );
            
            if (enemiesOnNextCell.length > 0) {
                // Приоритет нижнему врагу на следующей клетке
                const lowerEnemy = enemiesOnNextCell.find(e => e.drawSlot === 'second_in_cell');
                neighbors.push(lowerEnemy || enemiesOnNextCell[0]);
            }
        }
    } else {
        // Если цель - нижний враг, ищем на предыдущей клетке по пути
        const prevPathIndex = targetEnemy.pathIndex - 1;
        if (prevPathIndex >= 0) {
            const prevCell = targetEnemy.path[prevPathIndex];
            const enemiesOnPrevCell = allEnemies.filter(e =>
                !e.isDefeated && !e.reachedEnd &&
                e.pathIndex < e.path.length &&
                e.path[e.pathIndex][0] === prevCell[0] &&
                e.path[e.pathIndex][1] === prevCell[1]
            );
            
            if (enemiesOnPrevCell.length > 0) {
                // Приоритет верхнему врагу на предыдущей клетке
                const upperEnemy = enemiesOnPrevCell.find(e => e.drawSlot === 'first_in_cell');
                neighbors.push(upperEnemy || enemiesOnPrevCell[0]);
            }
        }
    }
    
    return neighbors.slice(0, 2); // Максимум 2 соседа
}

// --- Классы Оператора и Врага ---
class Operator { 
    constructor(row, col, operatorId) {
        const data = getOperatorData(operatorId);
        if (!data) throw new Error(`Operator data not found for ID: ${operatorId}`);
        this.id = operatorId; this.row = row; this.col = col;
        this.name = data.name; this.currentCost = data.cost;
        this.atk = data.attack;
        this.range = typeof data.range === 'number' ? data.range : 99;
        this.parsedAttack = parseAttackValue(this.atk);
        if (data.role === "Ifrit" && typeof data.range === 'string' && data.range.toLowerCase() === 'all line') {
            this.attackType = 'line';
            this.parsedAttack = { type: 'line', damage: typeof data.attack === 'number' ? data.attack : 0 };
        } else {
            this.attackType = this.parsedAttack ? this.parsedAttack.type : 'unknown';
        }
        this.attackTokensMax = data.attackTokens; this.attackTokensCurrent = data.attackTokens;
        this.role = data.role;
        this.ability = data.ability ? {...data.ability} : null;
        if (this.role === "Supporter" && data.slow) {
            this.ability = { type: "slow", power: data.slow, duration: 1 };
        }
        this.isElite = data.isElite || false; this.eliteVersionId = data.eliteVersion || null;
        this.image = new Image();
        if (data.imageSrc && typeof data.imageSrc.split === 'function') {
            this.image.src = data.imageSrc.split('\\').join('/');
        } else {
            console.error(`Некорректный imageSrc для оператора ID ${operatorId}:`, data.imageSrc);
            this.image.src = '';
        }
        this.imageLoaded = false; this.image.onload = () => { this.imageLoaded = true; };
        this.image.onerror = () => { console.error(`Ошибка загрузки ${this.name}: ${this.image.src}`); if(typeof addLogEntry === 'function') addLogEntry(`Ошибка загрузки ${this.name}`, 'error');};
        this.isSelected = false;
        this.updatePosition();
        this.upgradeButtonRect = { x: 0, y: 0, width: 0, height: 0, active: false };
        this.infoButtonRect = { x: 0, y: 0, width: 0, height: 0 };
    }

    setData(operatorId) {
        const data = getOperatorData(operatorId);
        if (!data) throw new Error(`Operator data not found for ID: ${operatorId}`);
        this.id = operatorId;
        this.name = data.name;
        this.atk = data.attack;
        this.parsedAttack = parseAttackValue(this.atk);
        if (data.role === "Ifrit" && typeof data.range === 'string' && data.range.toLowerCase() === 'all line') {
            this.attackType = 'line';
            this.parsedAttack = { type: 'line', damage: typeof data.attack === 'number' ? data.attack : 0 };
        } else {
            this.attackType = this.parsedAttack ? this.parsedAttack.type : 'unknown';
        }
        this.range = typeof data.range === 'number' ? data.range : 99;
        this.attackTokensMax = data.attackTokens;
        this.attackTokensCurrent = data.attackTokens;
        this.role = data.role;
        this.ability = data.ability ? {...data.ability} : null;
         if (this.role === "Supporter" && data.slow) {
            this.ability = { type: "slow", power: data.slow, duration: 1 };
        }
        this.isElite = data.isElite || false;
        this.eliteVersionId = data.eliteVersion || null;

        if (data.imageSrc && typeof data.imageSrc.split === 'function') {
            this.imageSrc = data.imageSrc.split('\\').join('/');
        } else {
            console.error(`Некорректный imageSrc для оператора ID ${operatorId} при setData:`, data.imageSrc);
            this.imageSrc = '';
        }

        if (!this.image || this.image.src !== this.imageSrc) {
            this.image = new Image();
            this.image.src = this.imageSrc;
            this.imageLoaded = false;
            this.image.onload = () => { this.imageLoaded = true; };
            this.image.onerror = () => { console.error(`Ошибка загрузки ${this.name}: ${this.imageSrc}`); if(typeof addLogEntry === 'function') addLogEntry(`Ошибка загрузки ${this.name}`, 'error');};
        }
    }
    updatePosition() {
        this.centerX = this.col * CELL_SIZE + CELL_SIZE / 2;
        this.centerY = this.row * CELL_SIZE + CELL_SIZE / 2;
        this.drawX = this.col * CELL_SIZE;
        this.drawY = this.row * CELL_SIZE;
    }

    draw() {
        this.updatePosition();
        const radius = OPERATOR_SPRITE_CORNER_RADIUS / zoomLevel;

        if (this.imageLoaded) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(this.drawX, this.drawY, CELL_SIZE, CELL_SIZE, radius);
            ctx.clip();
            ctx.drawImage(this.image, this.drawX, this.drawY, CELL_SIZE, CELL_SIZE);
            ctx.restore();
        } else {
            ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
            ctx.beginPath();
            ctx.roundRect(this.drawX + 5, this.drawY + 5, CELL_SIZE - 10, CELL_SIZE - 10, radius);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = `${Math.max(8, CELL_SIZE / 8)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(this.name, this.centerX, this.centerY);
        }
        const tokenRadius = getTokenRadius(); const tokenSpacing = Math.max(1, Math.floor(tokenRadius / 2)); const padding = getIconPadding(); const startXTokens = this.drawX + padding + tokenRadius; const startYTokens = this.drawY + CELL_SIZE - padding - tokenRadius; for (let i = 0; i < this.attackTokensMax; i++) { ctx.beginPath(); ctx.arc(startXTokens, startYTokens - i * (tokenRadius * 2 + tokenSpacing), tokenRadius, 0, Math.PI * 2); ctx.fillStyle = (i < this.attackTokensCurrent) ? '#facc15' : '#4b5563'; ctx.fill(); ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1 / zoomLevel; ctx.stroke(); } const iconSize = getIconSize(); const borderRadiusVal = ICON_BORDER_RADIUS / zoomLevel;

        this.infoButtonRect.x = this.drawX + padding;
        this.infoButtonRect.y = this.drawY + padding;
        this.infoButtonRect.width = iconSize;
        this.infoButtonRect.height = iconSize;

        ctx.fillStyle = 'rgba(96, 165, 250, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1 / zoomLevel;
        ctx.beginPath();
        ctx.roundRect(this.infoButtonRect.x, this.infoButtonRect.y, iconSize, iconSize, borderRadiusVal);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.floor(iconSize * 0.6)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', this.infoButtonRect.x + iconSize / 2, this.infoButtonRect.y + iconSize / 2 + 1);

        if (!this.isElite && this.eliteVersionId) {
            const eliteData = getOperatorData(this.eliteVersionId);
            const upgradeCost = eliteData ? eliteData.cost : Infinity;
            const canUpgrade = eliteData && currentPhase === 'purchase' && gameLMD >= upgradeCost;

            this.upgradeButtonRect.x = this.drawX + CELL_SIZE - iconSize - padding;
            this.upgradeButtonRect.y = this.drawY + padding; // Справа СВЕРХУ
            this.upgradeButtonRect.width = iconSize;
            this.upgradeButtonRect.height = iconSize;
            this.upgradeButtonRect.active = canUpgrade;

            ctx.save();
            if (!canUpgrade) {
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = 'rgba(107, 114, 128, 0.7)';
            } else {
                ctx.fillStyle = 'rgba(74, 222, 128, 0.8)';
            }

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1 / zoomLevel;
            ctx.beginPath();
            ctx.roundRect(this.upgradeButtonRect.x, this.upgradeButtonRect.y, iconSize, iconSize, borderRadiusVal);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = canUpgrade ? 'black' : 'white'; // ИЗМЕНЕНО: белый для неактивной
            ctx.font = `bold ${Math.floor(iconSize * 0.7)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('↑', this.upgradeButtonRect.x + iconSize / 2, this.upgradeButtonRect.y + iconSize / 2 + 1);
            ctx.restore();
        } else {
             this.upgradeButtonRect = { x: 0, y: 0, width: 0, height: 0, active: false };
        }

        if (this.isSelected) {
            ctx.strokeStyle = '#67e8f9';
            ctx.lineWidth = 3 / zoomLevel;
            ctx.strokeRect(this.drawX + 1, this.drawY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }
    }

    isInRange(targetX, targetY) {
        const targetCol = Math.floor(targetX / CELL_SIZE);
        const targetRow = Math.floor(targetY / CELL_SIZE);
        if (this.role === "Ifrit") return true;

        const distance = Math.max(Math.abs(this.col - targetCol), Math.abs(this.row - targetRow));
        return distance <= this.range;
    }

    attackTarget(enemy) {
        if (this.attackTokensCurrent <= 0) {
             if(typeof addLogEntry === 'function') addLogEntry(`${this.name} не имеет жетонов атаки.`, 'warning');
             return false;
        }
        return true;
    }

    upgrade() {
        if (this.isElite || !this.eliteVersionId) {
            if(typeof addLogEntry === 'function') addLogEntry(`${this.name} не может быть улучшен.`, 'warning');
            return false;
        }
        const eliteData = getOperatorData(this.eliteVersionId);
        if (!eliteData) {
            if(typeof addLogEntry === 'function') addLogEntry(`Данные для Elite версии ${this.name} не найдены!`, 'error');
            return false;
        }
        const upgradeCost = eliteData.cost;
        if (gameLMD >= upgradeCost) {
            gameLMD -= upgradeCost;
			totalLmdSpent += upgradeCost;
            if(shopLmdCounterSpan) shopLmdCounterSpan.textContent = gameLMD;

            const oldName = this.name;
            this.setData(this.eliteVersionId);
            this.currentCost += upgradeCost;

            if(typeof addLogEntry === 'function') addLogEntry(`${oldName} улучшен до ${this.name}! (-${upgradeCost} LMD)`, 'action');
            if (typeof renderShop === 'function') renderShop();
            return true;
        } else {
            if(typeof addLogEntry === 'function') addLogEntry(`Недостаточно LMD для улучшения до ${eliteData.name} (нужно ${upgradeCost}).`, 'warning');
            return false;
        }
    }

    getTooltipHTML() {
        let html = `<strong>${this.name}</strong> (${this.role})<br>`;
        const currentData = getOperatorData(this.id);
        html += `Уровень: ${currentData.tier}${this.isElite ? ' (Elite)' : ''}<br>`;
        let attackDisplay = this.atk;
        html += `Атака: ${attackDisplay} | Дальность: ${this.range === 99 ? 'Линия' : this.range}<br>`;
        html += `Жетоны: ${this.attackTokensCurrent}/${this.attackTokensMax}<br>`;
        if (this.ability) {
            if (this.ability.type === 'slow' && (this.ability.power || currentData.slow) ) { html += `Замедление: ${this.ability.power || currentData.slow}<br>`; }
            else if (this.ability.type === 'stun') { html += `Оглушение: ${this.ability.duration} раунд<br>`; }
            else if (this.ability.type === 'pull') { html += `Притягивание: ${this.ability.power} кл.<br>`; }
            else if (this.ability.type === 'push') { html += `Отталкивание: ${this.ability.power} кл.<br>`; }
        }
        html += `Общая вложенная стоимость: ${this.currentCost} LMD<br>`;
        const sellValue = (typeof getOperatorSellValue === 'function') ? getOperatorSellValue(this) : 0;
        html += `Стоимость продажи: ${sellValue} LMD<br>`;
        if (!this.isElite && this.eliteVersionId) {
            const eliteData = getOperatorData(this.eliteVersionId);
            if(eliteData) {
                html += `Улучшение до Elite: ${eliteData.cost} LMD`;
            }
        }
        return html;
    }
}

class Enemy {
    constructor(enemyId) {
        const data = getEnemyData(enemyId);
        if (!data) { console.error(`Данные для врага с ID "${enemyId}" не найдены!`); throw new Error(`Enemy data not found for ID: ${enemyId}`); }
        this.id = enemyId; this.name = data.name; this.hp = data.hp; this.maxHp = data.hp;
        this.baseSpeed = data.speed;
        this.speed = data.speed;
        this.attack = data.attack; this.reward = data.reward;
        this.path = getCurrentEnemyPath(); this.pathIndex = 0;

        if (data.imageSrc && typeof data.imageSrc.split === 'function') {
            this.imageSrc = data.imageSrc.split('\\').join('/');
        } else {
            console.error(`Некорректный imageSrc для врага ID ${enemyId}:`, data.imageSrc);
            this.imageSrc = '';
        }
        this.isBoss = data.isBoss || false;
        this.image = new Image(); this.image.src = this.imageSrc;
        this.imageLoaded = false; this.image.onload = () => { this.imageLoaded = true; };
        this.image.onerror = () => { console.error(`Ошибка загрузки ${this.name}: ${this.imageSrc}`); if(typeof addLogEntry === 'function') addLogEntry(`Ошибка загрузки ${this.name}`, 'error');};
        this.reachedEnd = false; this.isDefeated = false; this.isTargeted = false;
        this.isAoeMainTarget = false;
        this.isAoeSplashTarget = false;
        this.isSpecialistTarget = false;
        this.isSpecialistSwapTarget = false;
        this.isIfritTarget = false;
		this.isDefenderStunTarget = false;
        this.isSupporterSlowTarget = false;	
		this.isMainAttackTarget = false;
        this.justSpawnedThisTurn = true;
        this.movesLeftThisTurn = 0;
        this.drawSlot = null;
        this.lastVisualY = 0;
        this.isStunned = false;
        this.stunDuration = 0;
        this.stunAppliedRound = -1;
        this.isSlowed = false;
        this.slowPower = 0;
        this.slowDuration = 0;
        this.slowAppliedRound = -1;
        this.isBeingMoved = false;
        this.moveTargetX = null;
        this.moveTargetY = null;
        this.moveTargetIndex = -1;
        this.swapTarget = null;
        this.hadStunLastRound = false; // <<<< НОВОЕ СВОЙСТВО
        if (this.path.length > 0) {
            const startCell = this.path[this.pathIndex];
            this.pixelX = startCell[1] * CELL_SIZE + CELL_SIZE / 2;
            this.pixelY = startCell[0] * CELL_SIZE + CELL_SIZE / 2;
            this.lastVisualY = this.pixelY;
        } else { this.pixelX = 0; this.pixelY = 0; this.lastVisualY = 0;}
        this.targetPixelX = this.pixelX;
        this.targetPixelY = this.pixelY;
        this.isMoving = false;
        this.pixelsPerFrame = Math.max(1, CELL_SIZE / 20);
    }
    updatePixelCoordinatesToCurrentPathIndex() {
        if (this.pathIndex < this.path.length) {
            const currentCell = this.path[this.pathIndex];
            this.pixelX = currentCell[1] * CELL_SIZE + CELL_SIZE / 2;
            this.pixelY = currentCell[0] * CELL_SIZE + CELL_SIZE / 2;
            this.targetPixelX = this.pixelX;
            this.targetPixelY = this.pixelY;
            if (!this.drawSlot) {
                this.lastVisualY = this.pixelY;
            }
        }
    }

    applyStun(duration, round) {
        this.isStunned = true;
        this.stunDuration = duration;
        this.stunAppliedRound = round;
        this.isSlowed = false;
        this.slowDuration = 0;
        this.slowPower = 0;
        this.speed = this.baseSpeed;
    }

    applySlow(power, duration, round) {
        if (this.isStunned) {
            if(typeof addLogEntry === 'function') addLogEntry(`${this.name} оглушен, замедление не применяется.`, 'info');
            return;
        }
        if (!this.isSlowed || power > this.slowPower || this.slowDuration <= 0 || this.slowAppliedRound !== round) {
            this.isSlowed = true;
            this.slowPower = power;
            this.slowDuration = duration;
            this.slowAppliedRound = round;
            this.speed = Math.max(1, this.baseSpeed - this.slowPower);
            if(typeof addLogEntry === 'function') addLogEntry(`${this.name} замедлен на ${this.slowPower}. Скорость: ${this.speed}.`, 'action');
        } else {
             if(typeof addLogEntry === 'function') addLogEntry(`${this.name} уже замедлен с силой ${this.slowPower}, новое замедление (${power}) не сильнее.`, 'info');
        }
    }

    removeSlow() {
        if (this.isSlowed) {
            this.isSlowed = false;
            this.slowDuration = 0;
            this.slowPower = 0;
            this.speed = this.baseSpeed;
            if(typeof addLogEntry === 'function') addLogEntry(`${this.name} больше не замедлен. Скорость восстановлена до ${this.speed}.`, 'enemy_action');
        }
    }

    removeStun() {
         if (this.isStunned) {
            this.isStunned = false;
            this.stunDuration = 0;
            this.speed = this.isSlowed ? Math.max(0, this.baseSpeed - this.slowPower) : this.baseSpeed;
            if(typeof addLogEntry === 'function') addLogEntry(`${this.name} больше не оглушен.`, 'enemy_action');
         }
    }

    prepareNextStep(allActiveEnemies) {
        if (this.isDefeated || this.reachedEnd || this.isStunned || this.isBeingMoved) {
             this.isMoving = false; return false;
        }
        const lastCellIndex = this.path.length - 1;
        if (this.pathIndex === lastCellIndex && this.movesLeftThisTurn > 0) {
            if (!this.reachedEnd) {
                this.reachedEnd = true;
                if(typeof addLogEntry === 'function') addLogEntry(`${this.name} достиг базы! (-${this.attack} HP базы)`, 'enemy_action');
                gameBaseHp -= this.attack;
                if (gameBaseHp <= 0 && !gameEnded && typeof endGame === 'function') endGame(false);
            }
            this.movesLeftThisTurn = 0;
            this.isMoving = false;
            return false;
        }
        if (this.pathIndex >= lastCellIndex) {
             this.isMoving = false; return false;
        }
        const nextCellIndex = this.pathIndex + 1;
        const nextCell = this.path[nextCellIndex];
        const nextRow = nextCell[0];
        const nextCol = nextCell[1];
        if (typeof isCellOccupied === 'function' && isCellOccupied(nextRow, nextCol)) {
            this.isMoving = false;
            return false;
        }
        let nonBossesInNextCell = 0;
        let bossInNextCell = false;
        for (const otherEnemy of allActiveEnemies) {
            if (otherEnemy === this || otherEnemy.isDefeated || otherEnemy.reachedEnd || otherEnemy.isMoving || otherEnemy.isBeingMoved) continue;
            if (otherEnemy.pathIndex < otherEnemy.path.length && otherEnemy.path[otherEnemy.pathIndex][0] === nextRow && otherEnemy.path[otherEnemy.pathIndex][1] === nextCol) {
                if (otherEnemy.isBoss) {
                    bossInNextCell = true;
                    break;
                } else {
                    nonBossesInNextCell++;
                }
            }
        }
        let canMove = false;
        if (this.isBoss) {
            canMove = !bossInNextCell && nonBossesInNextCell === 0;
        } else {
            canMove = !bossInNextCell && nonBossesInNextCell < MAX_ENEMIES_PER_CELL;
        }
        if (!canMove) {
            this.isMoving = false;
            return false;
        }
        this.targetPixelX = nextCol * CELL_SIZE + CELL_SIZE / 2;
        this.targetPixelY = nextRow * CELL_SIZE + CELL_SIZE / 2;
        this.isMoving = true;
        return true;
    }

    animateMove() {
        if (this.isDefeated || this.reachedEnd || this.isStunned || !this.isMoving || this.isBeingMoved) {
            this.isMoving = false;
            return false;
        }
        const dx = this.targetPixelX - this.pixelX;
        const dy = this.targetPixelY - this.pixelY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.pixelsPerFrame) {
            this.pixelX = this.targetPixelX;
            this.pixelY = this.targetPixelY;
            this.isMoving = false;
            this.pathIndex++;
            this.movesLeftThisTurn--;
            if (this.pathIndex < this.path.length && !this.drawSlot) {
                this.lastVisualY = this.pixelY;
            }
            return false;
        } else {
            this.pixelX += (dx / distance) * this.pixelsPerFrame;
            this.pixelY += (dy / distance) * this.pixelsPerFrame;
            if (!this.drawSlot) this.lastVisualY = this.pixelY;
            return true;
        }
    }

    animateSpecialistMove() {
        if (this.isDefeated || !this.isBeingMoved || this.moveTargetX === null || this.moveTargetY === null) {
            this.isBeingMoved = false;
            this.swapTarget = null;
            return false;
        }
        const dx = this.moveTargetX - this.pixelX;
        const dy = this.moveTargetY - this.pixelY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const moveSpeed = this.pixelsPerFrame * SPECIALIST_MOVE_SPEED_FACTOR;
        if (distance < moveSpeed) {
            this.pixelX = this.moveTargetX;
            this.pixelY = this.moveTargetY;
            this.isBeingMoved = false;
            const oldPathIndex = this.pathIndex;
            this.pathIndex = this.moveTargetIndex;
            if (this.swapTarget && !this.swapTarget.isDefeated) {
                if(typeof addLogEntry === 'function') addLogEntry(`${this.name} меняется местами с ${this.swapTarget.name}.`, 'action');
                const oldCell = this.path[oldPathIndex];
                if (!this.swapTarget.isBeingMoved && !this.swapTarget.isMoving && !this.swapTarget.isStunned) {
                    this.swapTarget.startSpecialistMove(oldPathIndex, oldCell[1] * CELL_SIZE + CELL_SIZE / 2, oldCell[0] * CELL_SIZE + CELL_SIZE / 2);
                } else {
                    if(typeof addLogEntry === 'function') addLogEntry(`Не удалось инициировать обратное перемещение для ${this.swapTarget.name}, т.к. он уже в движении или оглушен.`, 'warning');
                }
            }
            this.swapTarget = null;
            this.moveTargetX = null;
            this.moveTargetY = null;
            this.moveTargetIndex = -1;
            return false;
        } else {
            this.pixelX += (dx / distance) * moveSpeed;
            this.pixelY += (dy / distance) * moveSpeed;
            if (!this.drawSlot) this.lastVisualY = this.pixelY;
            return true;
        }
    }

    startSpecialistMove(targetIndex, targetX, targetY, swapTarget = null) {
        if (this.isDefeated || this.isBeingMoved || this.isMoving || this.isStunned) {
             if(typeof addLogEntry === 'function') addLogEntry(`Не удалось начать перемещение ${this.name} специалистом: он уже двигается, оглушен или перемещается.`, 'warning');
             return;
        }
        this.isBeingMoved = true;
        this.moveTargetIndex = targetIndex;
        this.moveTargetX = targetX;
        this.moveTargetY = targetY;
        this.swapTarget = swapTarget;
        this.isMoving = false;
        this.movesLeftThisTurn = 0;
    }

    takeDamage(amount) {
        if (this.isDefeated) return;
        this.hp -= amount;
        if(typeof addLogEntry === 'function') addLogEntry(`${this.name} получил ${amount} урона. Осталось ${Math.max(0, this.hp)} HP.`, 'attack');
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDefeated = true;
            if(typeof addLogEntry === 'function') addLogEntry(`${this.name} уничтожен! +${this.reward} LMD`, 'success');
            gameLMD += this.reward;
            if(shopLmdCounterSpan) shopLmdCounterSpan.textContent = gameLMD;
            if (typeof renderShop === 'function') {
                renderShop();
            }
        }
    }

    getTooltipHTML() {
        let html = `<strong>${this.name}</strong> (${this.isBoss ? 'Босс' : 'Противник'})<br>`;
        html += `HP: ${this.hp} / ${this.maxHp}<br>`;
        html += `Скорость: ${this.speed} (Баз: ${this.baseSpeed})<br>`;
        html += `Атака (базе): ${this.attack}<br>`;
        html += `Награда: ${this.reward} LMD`;
        if (this.isStunned) {
            html += `<br><strong style="color: #fef08a;">ОГЛУШЕН (${this.stunDuration} р.)</strong>`;
        }
        if (this.isSlowed) {
            html += `<br><strong style="color: #60a5fa;">ЗАМЕДЛЕН (-${this.slowPower} скр., ${this.slowDuration} р.)</strong>`;
        }
        return html;
    }
}

// --- Функции расчета размеров иконок ---
function getTokenRadius() { return Math.max(3, Math.floor(CELL_SIZE / 16)); }
function getIconSize() { return getTokenRadius() * 2; }
function getStatusIconSize() { return Math.max(10, CELL_SIZE / 6); }
function getIconPadding() { return Math.max(2, Math.floor(CELL_SIZE / 25)); }

// --- Инициализация ссылок на DOM элементы ---
function initializeDOMElements() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) { console.error("Canvas element with ID 'gameCanvas' not found!"); return false; }
    ctx = canvas.getContext('2d');
    gameArea = document.getElementById('gameArea');
    errorMessageDiv = document.getElementById('errorMessage');
    baseHpBarFill = document.getElementById('baseHpBarFill');
    baseHpBarText = document.getElementById('baseHpBarText');
    roundCounterSpan = document.getElementById('roundCounter');
    battleCounterSpan = document.getElementById('battleCounter');
    totalBattlesSpan = document.getElementById('totalBattles');
    heldOperatorInfo = document.getElementById('heldOperatorInfo');
    logEntriesDiv = document.getElementById('logEntries');
    shopDecksContainer = document.getElementById('shopDecksContainer');
    refreshShopBtn = document.getElementById('refreshShopBtn');
    shopAvailabilityInfo = document.getElementById('shopAvailabilityInfo');
    shopLmdCounterSpan = document.getElementById('shopLmdCounter');
    tooltipElement = document.getElementById('tooltip');
    zoomInBtn = document.getElementById('zoomInBtn');
    zoomOutBtn = document.getElementById('zoomOutBtn');
    endPurchaseBtn = document.getElementById('endPurchaseBtn');
    endAttackBtn = document.getElementById('endAttackBtn');
    currentPhaseDisplay = document.getElementById('currentPhaseDisplay');
    gameStatusMessage = document.getElementById('gameStatusMessage');

    if (!gameArea || !errorMessageDiv ||
        !baseHpBarFill || !baseHpBarText ||
        !roundCounterSpan || !battleCounterSpan || !totalBattlesSpan || !heldOperatorInfo || !logEntriesDiv ||
        !shopDecksContainer || !refreshShopBtn || !shopAvailabilityInfo || !shopLmdCounterSpan || !tooltipElement ||
        !zoomInBtn || !zoomOutBtn || !endPurchaseBtn || !endAttackBtn || !currentPhaseDisplay || !gameStatusMessage) {
        console.error("One or more required HTML elements were not found. Check IDs.");
        return false;
    }
    return true;
}

function determineIfritLineType(operator, targetEnemy) {
    if (!operator || !targetEnemy || operator.role !== "Ifrit") return null;
    
    const targetCell = targetEnemy.path[targetEnemy.pathIndex];
    if (!targetCell) return null;
    
    const opRow = operator.row;
    const opCol = operator.col;
    const targetRow = targetCell[0];
    const targetCol = targetCell[1];
    
    // Проверка горизонтальной линии
    if (opRow === targetRow) return 'horizontal';
    
    // Проверка вертикальной линии
    if (opCol === targetCol) return 'vertical';
    
    // Проверка диагоналей
    const rowDiff = targetRow - opRow;
    const colDiff = targetCol - opCol;
    
    if (Math.abs(rowDiff) === Math.abs(colDiff)) {
        if (rowDiff * colDiff > 0) return 'diag1'; // Диагональ \
        else return 'diag2'; // Диагональ /
    }
    
    return null;
}

function getEnemiesOnIfritLine(operator, lineType, targetEnemy) {
    const enemies = [];
    const opRow = operator.row;
    const opCol = operator.col;
    
    activeEnemies.forEach(enemy => {
        if (enemy.isDefeated || enemy.reachedEnd) return;
        
        const enemyCell = enemy.path[enemy.pathIndex];
        if (!enemyCell) return;
        
        const enemyRow = enemyCell[0];
        const enemyCol = enemyCell[1];
        
        let isOnLine = false;
        
        switch (lineType) {
            case 'horizontal':
                isOnLine = enemyRow === opRow;
                break;
            case 'vertical':
                isOnLine = enemyCol === opCol;
                break;
            case 'diag1': // Диагональ \
                isOnLine = (enemyRow - opRow) === (enemyCol - opCol);
                break;
            case 'diag2': // Диагональ /
                isOnLine = (enemyRow - opRow) === -(enemyCol - opCol);
                break;
        }
        
        if (isOnLine) {
            enemies.push(enemy);
        }
    });
    
    return enemies;
}