// game_logic.js (Часть 2: Логика игры, Фазы, Отрисовка)



function drawCustomMap() {
    console.log("drawCustomMap вызван, customMapImagesLoaded:", window.customMapImagesLoaded);
    
    // Фон
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);
    
    if (window.customMapImagesLoaded && window.customMapImages) {
        console.log("Рисуем с изображениями");
        
        // Путь врагов с изображением
        if (currentMapData && currentMapData.enemyPath) {
            currentMapData.enemyPath.forEach(cell => {
                ctx.drawImage(window.customMapImages.enemy_path, 
                    cell[1] * CELL_SIZE, 
                    cell[0] * CELL_SIZE, 
                    CELL_SIZE, 
                    CELL_SIZE
                );
            });
        }
        
        // Места размещения с изображением
        if (currentMapData && currentMapData.placementCells) {
            currentMapData.placementCells.forEach(cell => {
                ctx.drawImage(window.customMapImages.placement, 
                    cell[1] * CELL_SIZE, 
                    cell[0] * CELL_SIZE, 
                    CELL_SIZE, 
                    CELL_SIZE
                );
            });
        }
        
        // Препятствия с изображением
        if (currentMapData && currentMapData.obstacleCells) {
            currentMapData.obstacleCells.forEach(cell => {
                ctx.drawImage(window.customMapImages.wall, 
                    cell[1] * CELL_SIZE, 
                    cell[0] * CELL_SIZE, 
                    CELL_SIZE, 
                    CELL_SIZE
                );
            });
        }
    } else {
        console.log("Рисуем цветами (изображения не загружены)");
        
        // Резервная отрисовка цветами 
        // Путь врагов
        ctx.fillStyle = '#4a5568';
        if (currentMapData && currentMapData.enemyPath) {
            currentMapData.enemyPath.forEach(cell => {
                ctx.fillRect(cell[1] * CELL_SIZE, cell[0] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            });
        }
        
        // Места размещения
        ctx.fillStyle = '#2b6cb0';
        if (currentMapData && currentMapData.placementCells) {
            currentMapData.placementCells.forEach(cell => {
                ctx.fillRect(cell[1] * CELL_SIZE, cell[0] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            });
        }
        
        // Препятствия
        ctx.fillStyle = '#1a202c';
        if (currentMapData && currentMapData.obstacleCells) {
            currentMapData.obstacleCells.forEach(cell => {
                ctx.fillRect(cell[1] * CELL_SIZE, cell[0] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            });
        }
    }
    
    // Метки старта и конца
    if (currentMapData && currentMapData.enemyPath && currentMapData.enemyPath.length > 0) {
        ctx.save();
        
        // Старт
        const startCell = currentMapData.enemyPath[0];
        ctx.fillStyle = '#4ade80';
        ctx.font = `bold ${Math.floor(CELL_SIZE/3)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText('', 
            startCell[1] * CELL_SIZE + CELL_SIZE/2, 
            startCell[0] * CELL_SIZE + CELL_SIZE/2
        );
        ctx.fillText('', 
            startCell[1] * CELL_SIZE + CELL_SIZE/2, 
            startCell[0] * CELL_SIZE + CELL_SIZE/2
        );
        
        // Конец
        const endCell = currentMapData.enemyPath[currentMapData.enemyPath.length - 1];
        ctx.fillStyle = '#ef4444';
        ctx.strokeText('', 
            endCell[1] * CELL_SIZE + CELL_SIZE/2, 
            endCell[0] * CELL_SIZE + CELL_SIZE/2
        );
        ctx.fillText('', 
            endCell[1] * CELL_SIZE + CELL_SIZE/2, 
            endCell[0] * CELL_SIZE + CELL_SIZE/2
        );
        
        ctx.restore();
    }
}

// --- Менеджер Фазы Врагов ---
const enemyPhaseManager = {
    isInitializedForTurn: false,
    state: 'idle',
    existingEnemiesToProcess: [],
    currentExistingEnemyIndex: -1,
    currentMovingEnemy: null,
    numNewEnemiesToSpawnThisTurn: 0,
    newEnemiesSpawnedCount: 0,

    initialize: function() {
        this.state = 'moving_existing';
        this.existingEnemiesToProcess = activeEnemies
            .filter(e => !e.isDefeated && !e.reachedEnd)
            .sort((a, b) => {
                if (b.pathIndex !== a.pathIndex) return b.pathIndex - a.pathIndex;
                if (a.drawSlot === 'first_in_cell' && b.drawSlot !== 'first_in_cell') return -1;
                if (b.drawSlot === 'first_in_cell' && a.drawSlot !== 'first_in_cell') return 1;
                return activeEnemies.indexOf(a) - activeEnemies.indexOf(b);
            });

        this.currentExistingEnemyIndex = -1;
        this.currentMovingEnemy = null;
        this.newEnemiesSpawnedCount = 0;

        if (isBreakPeriodActive) {
            this.numNewEnemiesToSpawnThisTurn = 0;
            if (typeof addLogEntry === 'function') addLogEntry(`Фаза врагов: Перерыв активен. ${this.existingEnemiesToProcess.length} существующих врагов двигаются.`, 'enemy_action');
        } else {
            const roll = Math.floor(Math.random() * 6) + 1;
            const modifier = BATTLE_MODIFIERS[gameBattle - 1] || BATTLE_MODIFIERS[BATTLE_MODIFIERS.length -1];
            this.numNewEnemiesToSpawnThisTurn = roll + modifier;
            if (typeof addLogEntry === 'function') addLogEntry(`Фаза врагов (Бой ${gameBattle}): ${this.existingEnemiesToProcess.length} существующих. Бросок D6: ${roll} + Мод ${modifier} = ${this.numNewEnemiesToSpawnThisTurn} новых.`, 'enemy_action');
        }
        this.isInitializedForTurn = true;
    },

    processNextAction: function() {
        let actionTakenThisTick = false;
        do {
            actionTakenThisTick = false;
            if (this.state === 'moving_existing') {
                if (this.currentMovingEnemy) {
                    if (!this.currentMovingEnemy.isDefeated && !this.currentMovingEnemy.reachedEnd && this.currentMovingEnemy.movesLeftThisTurn > 0 && !this.currentMovingEnemy.isStunned && !this.currentMovingEnemy.isBeingMoved) {
                        if (!this.currentMovingEnemy.isMoving) {
                            if (this.currentMovingEnemy.prepareNextStep(activeEnemies)) { actionTakenThisTick = true; }
                            else { this.currentMovingEnemy.movesLeftThisTurn = 0; }
                        }
                        if (this.currentMovingEnemy.isMoving) { if (this.currentMovingEnemy.animateMove()) { actionTakenThisTick = true; } }
                    } else if (this.currentMovingEnemy.isStunned || this.currentMovingEnemy.isBeingMoved) {
                        this.currentMovingEnemy.movesLeftThisTurn = 0;
                    }
                    if (this.currentMovingEnemy.movesLeftThisTurn === 0 || this.currentMovingEnemy.reachedEnd || this.currentMovingEnemy.isDefeated) {
                        this.currentMovingEnemy = null;
                    }
                }
                if (!this.currentMovingEnemy) {
                    this.currentExistingEnemyIndex++;
                    if (this.currentExistingEnemyIndex < this.existingEnemiesToProcess.length) {
                        let candidateEnemy = this.existingEnemiesToProcess[this.currentExistingEnemyIndex];
                        if (candidateEnemy && !candidateEnemy.isDefeated && !candidateEnemy.reachedEnd) {
                            this.currentMovingEnemy = candidateEnemy;
                            this.currentMovingEnemy.movesLeftThisTurn = this.currentMovingEnemy.speed;
                            this.currentMovingEnemy.isMoving = false;
                            if (this.currentMovingEnemy.isStunned && typeof addLogEntry === 'function') addLogEntry(`${this.currentMovingEnemy.name} оглушен.`, 'enemy_action');
                            actionTakenThisTick = true;
                        } else { continue; }
                    } else {
                        this.state = 'spawning_new'; this.currentMovingEnemy = null; actionTakenThisTick = true;
                    }
                }
            }
            else if (this.state === 'spawning_new') {
                if (isBreakPeriodActive) {
                    this.state = 'finishing_enemy_phase'; 
                    actionTakenThisTick = true;
                    continue;
                }
                 if (this.currentMovingEnemy) {
                    if (!this.currentMovingEnemy.isDefeated && !this.currentMovingEnemy.reachedEnd && this.currentMovingEnemy.movesLeftThisTurn > 0 && !this.currentMovingEnemy.isStunned && !this.currentMovingEnemy.isBeingMoved) {
                       if (!this.currentMovingEnemy.isMoving) {
                            if (this.currentMovingEnemy.prepareNextStep(activeEnemies)) { actionTakenThisTick = true;}
                            else { this.currentMovingEnemy.movesLeftThisTurn = 0;}
                        }
                        if (this.currentMovingEnemy.isMoving) { if (this.currentMovingEnemy.animateMove()) { actionTakenThisTick = true; } }
                    }
                    if (this.currentMovingEnemy.movesLeftThisTurn === 0 || this.currentMovingEnemy.reachedEnd || this.currentMovingEnemy.isDefeated) {
                        this.currentMovingEnemy = null;
                    }
                }
                if (!this.currentMovingEnemy) {
                    if (this.newEnemiesSpawnedCount < this.numNewEnemiesToSpawnThisTurn && currentWaveDeck.length > 0) {
                        const spawnCellCoords = getSpawnCell();
                        if (spawnCellCoords) {
                            const enemiesOnSpawnCell = activeEnemies.filter(e => e.pathIndex === 0 && e.path[0][0] === spawnCellCoords[0] && e.path[0][1] === spawnCellCoords[1] && !e.isMoving && !e.isBeingMoved);
                            const enemyIdToSpawn = currentWaveDeck[0];
                            const enemyData = getEnemyData(enemyIdToSpawn);
                            if (enemyData) {
                                const maxOnCell = enemyData.isBoss ? 1 : MAX_ENEMIES_PER_CELL;
                                let canSpawn = enemyData.isBoss ? enemiesOnSpawnCell.length === 0 : (enemiesOnSpawnCell.filter(e => e.isBoss).length === 0 && enemiesOnSpawnCell.filter(e => !e.isBoss).length < maxOnCell);
                                if (canSpawn) {
                                    currentWaveDeck.shift();
                                    const newEnemy = new Enemy(enemyIdToSpawn);
                                    newEnemy.movesLeftThisTurn = Math.max(0, newEnemy.speed - 1);
                                    activeEnemies.push(newEnemy);
                                    this.currentMovingEnemy = newEnemy;
                                    this.newEnemiesSpawnedCount++;
                                    if (typeof addLogEntry === 'function') addLogEntry(`(Бой ${gameBattle}) Заспавнен ${newEnemy.name}. Осталось в колоде: ${currentWaveDeck.length}. Ходов: ${newEnemy.movesLeftThisTurn + 1}`, 'enemy_action');
                                    actionTakenThisTick = true;
                                } else {
                                    if (typeof addLogEntry === 'function') addLogEntry(`Клетка спавна занята, ${enemyData.name} не может выйти.`, 'warning');
                                    this.numNewEnemiesToSpawnThisTurn = this.newEnemiesSpawnedCount; 
                                    this.state = 'finishing_enemy_phase'; actionTakenThisTick = true;
                                }
                            } else { if (typeof addLogEntry === 'function') addLogEntry(`Ошибка данных для врага ID: ${enemyIdToSpawn}`, 'error'); currentWaveDeck.shift(); actionTakenThisTick = true; }
                        }
                    } else { 
                        this.state = 'finishing_enemy_phase'; actionTakenThisTick = true;
                    }
                }
            }
            else if (this.state === 'finishing_enemy_phase' || this.state === 'moving_spawned_boss') {
                if (this.state === 'moving_spawned_boss') {
                     if (this.currentMovingEnemy) { 
                         if (!this.currentMovingEnemy.isDefeated && !this.currentMovingEnemy.reachedEnd && this.currentMovingEnemy.movesLeftThisTurn > 0 && !this.currentMovingEnemy.isStunned && !this.currentMovingEnemy.isBeingMoved) {
                            if (!this.currentMovingEnemy.isMoving) {
                                if (this.currentMovingEnemy.prepareNextStep(activeEnemies)) { actionTakenThisTick = true; }
                                else { this.currentMovingEnemy.movesLeftThisTurn = 0; }
                            }
                            if (this.currentMovingEnemy.isMoving) { if (this.currentMovingEnemy.animateMove()) { actionTakenThisTick = true; } }
                         }
                         if (this.currentMovingEnemy.movesLeftThisTurn === 0 || this.currentMovingEnemy.reachedEnd || this.currentMovingEnemy.isDefeated) {
                            this.currentMovingEnemy = null;
                         }
                     }
                     if (!this.currentMovingEnemy) { this.state = 'finishing_enemy_phase'; }
                }

                if (this.state === 'finishing_enemy_phase') {
                    if (currentWaveDeck.length === 0 && !bossSpawnedThisBattle && currentBossId && !isBreakPeriodActive) {
                        const spawnCellCoords = getSpawnCell();
                        if (spawnCellCoords) {
                            const enemiesOnSpawnCell = activeEnemies.filter(e => e.pathIndex === 0 && e.path[0][0] === spawnCellCoords[0] && e.path[0][1] === spawnCellCoords[1] && !e.isMoving && !e.isBeingMoved);
                            if (enemiesOnSpawnCell.length === 0) {
                                const boss = new Enemy(currentBossId);
                                boss.movesLeftThisTurn = Math.max(0, boss.speed - 1);
                                activeEnemies.push(boss);
                                bossSpawnedThisBattle = true; 
                                if (typeof addLogEntry === 'function') addLogEntry(`Босс Боя ${gameBattle} (${boss.name}) вышел на поле! Ходов: ${boss.movesLeftThisTurn + 1}`, 'warning');
                                this.currentMovingEnemy = boss;
                                this.state = 'moving_spawned_boss';
                                actionTakenThisTick = true;

                                if (gameBattle < TOTAL_BATTLES && !isBreakPeriodActive) { 
                                    isBreakPeriodActive = true;
                                    breakRoundsLeft = BREAK_ROUNDS_BETWEEN_BATTLES[gameBattle - 1];
                                    battleToLoadAfterBreak = gameBattle + 1;
                                    nextWaveEnemiesCanSpawn = false; 
                                    if (typeof addLogEntry === 'function') addLogEntry(`Начинается отсчет перерыва (${breakRoundsLeft} раунд(ов)) перед активацией волны Боя ${battleToLoadAfterBreak}.`, 'game_state');
                                }
                            } else {
                                if (typeof addLogEntry === 'function') addLogEntry(`Клетка спавна занята, босс ${getEnemyData(currentBossId)?.name} не может выйти.`, 'warning');
                                if (!this.currentMovingEnemy) { this.isInitializedForTurn = false; return false; } 
                            }
                        }
                    } else if (!this.currentMovingEnemy) { 
                        this.isInitializedForTurn = false; return false;
                    }
                }
            }
        } while (!actionTakenThisTick && this.currentMovingEnemy === null && (this.state === 'moving_existing' || this.state === 'spawning_new'));
        return actionTakenThisTick || this.currentMovingEnemy != null;
    }
};

function setPhase(newPhase) {
    if (gameEnded) return;
    currentPhase = newPhase;
    let phaseDisplayName = getPhaseName(newPhase);
    if (newPhase === 'purchase' && isBreakPeriodActive && battleToLoadAfterBreak > 0) {
        phaseDisplayName = `Перерыв (${breakRoundsLeft} р. до Боя ${battleToLoadAfterBreak})`;
    } else if (isBreakPeriodActive && breakRoundsLeft > 0) {
         phaseDisplayName = `Перерыв (${breakRoundsLeft} р.)`;
    }
    if (typeof addLogEntry === 'function') addLogEntry(`Начало фазы: ${phaseDisplayName}`, 'game_state');
    if (typeof updateUIForPhase === 'function') updateUIForPhase();
}

function getPhaseName(phase) {
    switch(phase) {
        case 'purchase': return 'Покупка/Размещение';
        case 'enemy': return 'Движение врагов';
        case 'player': return 'Атака игрока';
        default: return 'Неизвестно';
    }
}

function nextPhase() {
    if (gameEnded) return;

    if (currentPhase === 'purchase') {
        setPhase('enemy');
    } else if (currentPhase === 'enemy') {
        activeEnemies.forEach(enemy => {
            if (enemy.isStunned) {
                enemy.stunDuration--;
                if (enemy.stunDuration <= 0) enemy.removeStun();
            }
            if (enemy.isSlowed) {
                enemy.slowDuration--;
                if (enemy.slowDuration <= 0) enemy.removeSlow();
            }
        });
        setPhase('player');
    } else if (currentPhase === 'player') {
        gameRound++; // Раунд инкрементируется здесь
        if (typeof addLogEntry === 'function') addLogEntry(`Начало раунда ${gameRound}`, 'game_state');
        if (typeof placedOperators !== 'undefined') placedOperators.forEach(op => op.attackTokensCurrent = op.attackTokensMax);
        
        // Обновляем флаг hadStunLastRound для всех врагов
        if (typeof activeEnemies !== 'undefined') {
            activeEnemies.forEach(enemy => {
                enemy.justSpawnedThisTurn = false; // Сбрасываем флаг первого хода
                if (enemy.stunAppliedRound === gameRound - 1) { // Стан был в только что прошедшем раунде
                    enemy.hadStunLastRound = true;
                } else {
                    enemy.hadStunLastRound = false;
                }
            });
        }


        if (isBreakPeriodActive) {
            breakRoundsLeft--;
            if (typeof addLogEntry === 'function') addLogEntry(`Осталось раундов перерыва: ${breakRoundsLeft} (перед Боем ${battleToLoadAfterBreak})`, 'game_state');
            if (breakRoundsLeft <= 0) {
                isBreakPeriodActive = false;
                nextWaveEnemiesCanSpawn = true;
                const oldGameBattle = gameBattle;
                gameBattle = battleToLoadAfterBreak;
                if (typeof addLogEntry === 'function') addLogEntry(`Перерыв окончен. Активен Бой ${gameBattle}. Враги предыдущего боя (${oldGameBattle}) еще могут быть на поле.`, "game_state");
                startBattle(gameBattle);
                bossSpawnedThisBattle = false;
            }
        }
        setPhase('purchase');
    }
}

function handleBossDefeated(defeatedBossId) {
    if (gameEnded) return;
    if (typeof addLogEntry === 'function') addLogEntry(`Босс ${getEnemyData(defeatedBossId)?.name} ПОБЕЖДЕН!`, 'success');
    bossesDefeatedCount++;

    if (bossesDefeatedCount === 1 && typeof unlockedTier3Count !== 'undefined') unlockedTier3Count = 3;
    else if (bossesDefeatedCount === 2 && typeof unlockedTier3Count !== 'undefined') unlockedTier3Count = 6;
    else if (bossesDefeatedCount === 3 && typeof unlockedTier4Count !== 'undefined') unlockedTier4Count = 3;
    else if (bossesDefeatedCount === 4 && typeof unlockedTier4Count !== 'undefined') unlockedTier4Count = 6;
    if (typeof renderShop === 'function') renderShop();

    if (bossesDefeatedCount >= TOTAL_BATTLES) {
        const regularEnemiesStillOnField = activeEnemies.some(e => !e.isDefeated && !e.reachedEnd);
        if (!regularEnemiesStillOnField) {
            if (typeof endGame === 'function') endGame(true);
        } else {
            if (typeof addLogEntry === 'function') addLogEntry("Последний босс побежден, но остались враги. Зачистите поле для победы!", "game_state");
        }
    }
}

function startBattle(battleNum) {
    if (gameEnded || battleNum > TOTAL_BATTLES + 1) {
        if (battleNum > TOTAL_BATTLES && typeof addLogEntry === 'function') addLogEntry("Все бои завершены.", "game_state");
        return;
    }
    currentWaveDeck = [];
    bossSpawnedThisBattle = false;
    const waveData = ENEMY_WAVE_DATA[battleNum];
    if (waveData) {
        currentWaveDeck = [...waveData.enemies];
        if (typeof shuffleArray === 'function') shuffleArray(currentWaveDeck);
        currentBossId = waveData.boss;
        if (typeof addLogEntry === 'function') addLogEntry(`Подготовка к Бою ${battleNum}. Врагов в колоде: ${currentWaveDeck.length}, Босс: ${getEnemyData(currentBossId)?.name || 'Неизвестно'}.`, 'game_state_minor');
    } else {
        if (typeof addLogEntry === 'function') addLogEntry(`Данные для Боя ${battleNum} не найдены!`, 'warning');
        currentWaveDeck = [];
        currentBossId = null;
    }
     if (typeof updateUIForPhase === 'function') updateUIForPhase();
}

function gameLoop(timestamp) {
	// Защита от множественных циклов
    if (gameEnded) { 
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        return;
    }
	
    if (gameEnded) { if (animationFrameId) cancelAnimationFrame(animationFrameId); animationFrameId = null; return; }

    let enemyPhaseManagerIsDoneForThisTurn = false;
    let specialistMoveInProgress = false;

    activeEnemies.forEach(enemy => { if (enemy.isBeingMoved) { if (enemy.animateSpecialistMove()) { specialistMoveInProgress = true; } } });

    if (!specialistMoveInProgress && currentPhase === 'enemy') {
        if (!enemyPhaseManager.isInitializedForTurn) {
            enemyPhaseManager.initialize();
        }
        if (!enemyPhaseManager.processNextAction()) {
            enemyPhaseManagerIsDoneForThisTurn = true;
        }
    }

    let defeatedBossThatTriggeredEvent = null;
    for (let i = activeEnemies.length - 1; i >= 0; i--) {
        if (activeEnemies[i].isDefeated) {
            if (activeEnemies[i].isBoss) {
                defeatedBossThatTriggeredEvent = activeEnemies[i].id;
            }
            activeEnemies.splice(i, 1);
        } else if (activeEnemies[i].reachedEnd) {
             activeEnemies.splice(i, 1);
        }
    }

    if (defeatedBossThatTriggeredEvent) {
        handleBossDefeated(defeatedBossThatTriggeredEvent);
    }

    if (typeof drawGame === "function") drawGame();

    if (!specialistMoveInProgress && currentPhase === 'enemy') {
        if (enemyPhaseManagerIsDoneForThisTurn) {
            if (bossesDefeatedCount >= TOTAL_BATTLES) {
                const regularEnemiesStillOnField = activeEnemies.some(e => !e.isDefeated && !e.reachedEnd);
                if (!regularEnemiesStillOnField) {
                    if (!gameEnded && typeof endGame === 'function') endGame(true);
                }
            }
            if (!gameEnded) nextPhase();
        }
    }

    if (!gameEnded) {
        // Отменяем предыдущий кадр если он есть
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function endGame(isVictory) {
    if (gameEnded) return;
    gameEnded = true;
    
    console.log("endGame вызван, isVictory:", isVictory);
    
    // Останавливаем таймер
    if (typeof stopGameTimer === 'function') stopGameTimer();
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    if (typeof addLogEntry === 'function') {
        addLogEntry(isVictory ? "Игра завершена. ПОБЕДА!" : "Игра завершена. ПОРАЖЕНИЕ", isVictory ? 'success' : 'error');
    }
    
    if (endPurchaseBtn) endPurchaseBtn.disabled = true;
    if (endAttackBtn) endAttackBtn.disabled = true;
    if (refreshShopBtn) refreshShopBtn.disabled = true;
    if (canvas) canvas.style.pointerEvents = 'none';
    
    // Показываем статистику
    console.log("Вызываем showGameStats");
    if (typeof showGameStats === 'function') {
        setTimeout(() => {
            showGameStats(isVictory);
        }, 100);
    } else {
        console.error("showGameStats не найдена!");
    }
}

// --- Функции Отрисовки ---
function drawGrid() {
    if (!ctx) return;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1 / zoomLevel;
    for (let i = 0; i <= GRID_ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(GRID_COLS * CELL_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }
    for (let j = 0; j <= GRID_COLS; j++) {
        ctx.beginPath();
        ctx.moveTo(j * CELL_SIZE, 0);
        ctx.lineTo(j * CELL_SIZE, GRID_ROWS * CELL_SIZE);
        ctx.stroke();
    }
}

function drawAttackRange(operator) {
    if (!ctx || !operator || operator.role === "Ifrit") return;
    const rangePixels = operator.range * CELL_SIZE;
    ctx.fillStyle = 'rgba(100, 180, 255, 0.15)';
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.5)';
    ctx.lineWidth = 1 / zoomLevel;
    const startCol = Math.max(0, operator.col - operator.range);
    const startRow = Math.max(0, operator.row - operator.range);
    const endCol = Math.min(GRID_COLS, operator.col + operator.range + 1);
    const endRow = Math.min(GRID_ROWS, operator.row + operator.range + 1);
    const startX = startCol * CELL_SIZE;
    const startY = startRow * CELL_SIZE;
    const width = (endCol - startCol) * CELL_SIZE;
    const height = (endRow - startRow) * CELL_SIZE;
    ctx.fillRect(startX, startY, width, height);
    ctx.strokeRect(startX, startY, width, height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(operator.drawX, operator.drawY, CELL_SIZE, CELL_SIZE);
}

function drawIfritAttackLine() {
    if (!ctx || !ifritAttackLine || !selectedOperator || selectedOperator.role !== "Ifrit") return;
    ctx.strokeStyle = 'rgba(255, 100, 0, 0.7)';
    ctx.lineWidth = 4 / zoomLevel;
    ctx.beginPath();
    const opCenterX = selectedOperator.col * CELL_SIZE + CELL_SIZE / 2;
    const opCenterY = selectedOperator.row * CELL_SIZE + CELL_SIZE / 2;
    switch (ifritAttackLine.type) {
        case 'horizontal': ctx.moveTo(0, opCenterY); ctx.lineTo(GRID_COLS * CELL_SIZE, opCenterY); break;
        case 'vertical': ctx.moveTo(opCenterX, 0); ctx.lineTo(opCenterX, GRID_ROWS * CELL_SIZE); break;
        case 'diag1': let sX1 = opCenterX - opCenterY; let eX1 = opCenterX + (GRID_ROWS*CELL_SIZE - opCenterY); ctx.moveTo(sX1,0); ctx.lineTo(eX1,GRID_ROWS*CELL_SIZE); break;
        case 'diag2': let sX2 = opCenterX + opCenterY; let eX2 = opCenterX - (GRID_ROWS*CELL_SIZE - opCenterY); ctx.moveTo(sX2,0); ctx.lineTo(eX2,GRID_ROWS*CELL_SIZE); break;
    }
    ctx.stroke();
}

function drawGame() {
    if (!ctx || (gameEnded && !animationFrameId)) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);
	
	if (mapLoaded && mapImage) {
		try { 
			ctx.drawImage(mapImage, 0, 0, GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE); 
		} catch (e) { 
			console.error("Error drawing map image:", e); 
			// Для кастомных карт рисуем клетки
			if (currentMapData && currentMapData.isCustom) {
				drawCustomMap();
			}
		}
	} else if (currentMapData && currentMapData.isCustom) {
		// Рисуем кастомную карту
		drawCustomMap();
	} else { 
		// Стандартная заглушка
		ctx.fillStyle='#1a1d23'; 
		ctx.fillRect(0,0,GRID_COLS*CELL_SIZE,GRID_ROWS*CELL_SIZE); 
	}


	
    activeEnemies.forEach(e => e.drawSlot = null);
    const cellOccupation = new Map();
    activeEnemies.forEach(enemy => {
        if (enemy.isDefeated || enemy.reachedEnd) return;
        const pathIdx = enemy.isBeingMoved ? enemy.moveTargetIndex : enemy.pathIndex;
        if (pathIdx >= 0 && pathIdx < enemy.path.length) {
            const currentCell = enemy.path[pathIdx];
            const cellKey = `${currentCell[0]},${currentCell[1]}`;
            if (!cellOccupation.has(cellKey)) cellOccupation.set(cellKey, []);
            cellOccupation.get(cellKey).push(enemy);
        }
    });
    cellOccupation.forEach(enemiesInCell => {
        const nonBossesInCell = enemiesInCell.filter(e => !e.isBoss);
        if (nonBossesInCell.length === 2) {
            nonBossesInCell.sort((a,b) => activeEnemies.indexOf(a) - activeEnemies.indexOf(b));
            nonBossesInCell[0].drawSlot = 'first_in_cell';
            nonBossesInCell[1].drawSlot = 'second_in_cell';
        } else if (nonBossesInCell.length === 1) nonBossesInCell[0].drawSlot = null;
    });

    // Отрисовка карты
	if (currentMapData && currentMapData.isCustom) {
		// Рисуем кастомную карту
		drawCustomMap();
	} else if (mapLoaded && mapImage) {
		try { 
			ctx.drawImage(mapImage, 0, 0, GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE); 
		} catch (e) { 
			console.error("Error drawing map image:", e); 
			if(typeof addLogEntry === 'function') addLogEntry("Ошибка отрисовки карты!", "error"); 
			ctx.fillStyle='rgba(128,0,0,0.5)'; 
			ctx.fillRect(0,0,GRID_COLS*CELL_SIZE,GRID_ROWS*CELL_SIZE); 
		}
	} else { 
		ctx.fillStyle='#1a1d23'; 
		ctx.fillRect(0,0,GRID_COLS*CELL_SIZE,GRID_ROWS*CELL_SIZE); 
		ctx.fillStyle='rgba(255,255,255,0.5)'; 
		ctx.font='16px sans-serif'; 
		ctx.textAlign='center'; 
		ctx.fillText(mapLoaded?'Ошибка карты!':'Загрузка карты...', (GRID_COLS*CELL_SIZE)/2, (GRID_ROWS*CELL_SIZE)/2); 
	}    
	
	if(typeof drawGrid === 'function') drawGrid();
    if (targetingMode && selectedOperator) {
        if (selectedOperator.role === "Ifrit" && typeof drawIfritAttackLine === 'function') drawIfritAttackLine();
        else if (typeof drawAttackRange === 'function') drawAttackRange(selectedOperator);
    }
    activeEnemies.filter(e=>!e.isDefeated && !e.reachedEnd).sort((a,b)=>{if(a.isBoss && !b.isBoss)return 1; if(!a.isBoss && b.isBoss)return -1; if(a.drawSlot==='second_in_cell' && b.drawSlot!=='second_in_cell')return 1; if(a.drawSlot!=='second_in_cell' && b.drawSlot==='second_in_cell')return -1; return a.lastVisualY - b.lastVisualY;}).forEach(enemy=>drawEnemy(enemy));
    placedOperators.forEach(operator => operator.draw());
    ctx.restore();
}

function drawEnemy(enemy) {
    if (!ctx) return;
    let displayWidth, displayHeight;
    if (!enemy.isBoss) {
        const targetBaseHeight = CELL_SIZE * 0.45;
        if (enemy.imageLoaded && enemy.image.naturalWidth > 0 && enemy.image.naturalHeight > 0) {
            const aspectRatio = enemy.image.naturalWidth / enemy.image.naturalHeight;
            displayHeight = targetBaseHeight; displayWidth = displayHeight * aspectRatio;
            displayWidth = Math.min(displayWidth, CELL_SIZE * 0.9);
        } else { displayWidth = CELL_SIZE * 0.7; displayHeight = targetBaseHeight; }
    } else {
        const targetBaseWidth = CELL_SIZE * 0.9;
        if (enemy.imageLoaded && enemy.image.naturalWidth > 0 && enemy.image.naturalHeight > 0) {
            const aspectRatio = enemy.image.naturalWidth / enemy.image.naturalHeight;
            displayWidth = targetBaseWidth; displayHeight = displayWidth / aspectRatio;
        } else { displayWidth = targetBaseWidth; displayHeight = targetBaseWidth; }
    }
    const drawCenterX = enemy.pixelX;
    let visualDrawCenterY = enemy.pixelY;
    if (!enemy.isBoss && enemy.drawSlot === 'first_in_cell') visualDrawCenterY -= CELL_SIZE * ENEMY_CELL_Y_OFFSET_PERCENT;
    else if (!enemy.isBoss && enemy.drawSlot === 'second_in_cell') visualDrawCenterY += CELL_SIZE * ENEMY_CELL_Y_OFFSET_PERCENT;
    enemy.lastVisualY = visualDrawCenterY;
    const spriteTopY = visualDrawCenterY - displayHeight / 2;
    const spriteLeftX = drawCenterX - displayWidth / 2;
    const spriteBottomY = visualDrawCenterY + displayHeight / 2;

    if (enemy.imageLoaded) {
        ctx.save(); ctx.beginPath(); ctx.roundRect(spriteLeftX, spriteTopY, displayWidth, displayHeight, ENEMY_SPRITE_CORNER_RADIUS / zoomLevel); ctx.clip();
        ctx.drawImage(enemy.image, spriteLeftX, spriteTopY, displayWidth, displayHeight);
        ctx.restore();
    } else {
        ctx.fillStyle='rgba(255,0,0,0.8)'; ctx.beginPath(); ctx.roundRect(spriteLeftX,spriteTopY,displayWidth,displayHeight,ENEMY_SPRITE_CORNER_RADIUS/zoomLevel); ctx.fill();
    }

    const iconSize = getStatusIconSize();
    const iconSpacing = iconSize * 0.1; 
    const uiPadding = Math.max(1, CELL_SIZE * 0.03) / zoomLevel; 

    let activeStatusIconsData = [];
    if (enemy.isStunned && stunIconLoaded) activeStatusIconsData.push({ type: 'stun', alpha: 1.0 });
    else if (enemy.hadStunLastRound && stunIconLoaded) activeStatusIconsData.push({ type: 'stun', alpha: 0.5 }); // Полупрозрачная для иммунитета

    if (enemy.isSlowed && slowIconLoaded) activeStatusIconsData.push({ type: 'slow', power: enemy.slowPower });
    
    let statusIconsActualHeight = 0;
    if (activeStatusIconsData.length > 0) {
        statusIconsActualHeight = activeStatusIconsData.length * iconSize + Math.max(0, activeStatusIconsData.length - 1) * iconSpacing;
    }

    let hpBarActualHeight = 0;
    let hpTextValue = "";
    let hpTextFontSize = 0;
    if (enemy.hp > 0) {
        const fontSizeMultiplier = activeStatusIconsData.length > 0 ? 0.75 : 0.9; 
        hpTextFontSize = Math.max(7, CELL_SIZE * ENEMY_HP_FONT_SIZE_RATIO * fontSizeMultiplier); 
        const textHeight = hpTextFontSize;
        const bgPadding = hpTextFontSize * ENEMY_HP_BG_PADDING_RATIO;
        hpBarActualHeight = textHeight + bgPadding * 2;
        hpTextValue = enemy.hp.toString();
    }

    let currentUiY = spriteTopY + uiPadding; 

    activeStatusIconsData.forEach(iconData => {
        const iconX = drawCenterX - iconSize / 2;
        if (currentUiY + iconSize <= spriteBottomY - uiPadding) { 
            ctx.save();
            if (iconData.alpha < 1.0) {
                ctx.globalAlpha = iconData.alpha;
            }
            if (iconData.type === 'stun') {
                ctx.drawImage(stunIcon, iconX, currentUiY, iconSize, iconSize);
            } else if (iconData.type === 'slow') {
                ctx.drawImage(slowIcon, iconX, currentUiY, iconSize, iconSize);
                const textX = iconX + iconSize / 2;
                const textY = currentUiY + iconSize / 2 + 1;
                const slowPowerText = iconData.power.toString();
                ctx.font = `bold ${Math.floor(iconSize * 0.6)}px Inter, sans-serif`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.strokeStyle = 'white'; ctx.lineWidth = 2 / zoomLevel; ctx.strokeText(slowPowerText, textX, textY);
                ctx.fillStyle = 'black'; ctx.fillText(slowPowerText, textX, textY);
            }
            ctx.restore(); // Восстанавливаем alpha
            currentUiY += iconSize + iconSpacing; 
        }
    });
    
    if (enemy.hp > 0) {
        let hpBarStartY = currentUiY;
        if (activeStatusIconsData.length > 0 && hpBarActualHeight > 0 && (currentUiY > spriteTopY + uiPadding + iconSpacing /*проверяем, были ли нарисованы статусы*/)) { 
             hpBarStartY += iconSpacing * 0.5; 
        } else if (activeStatusIconsData.length === 0 && hpBarActualHeight > 0) { 
            hpBarStartY = visualDrawCenterY - hpBarActualHeight / 2;
            hpBarStartY = Math.max(hpBarStartY, spriteTopY + uiPadding);
            if (hpBarStartY + hpBarActualHeight > spriteBottomY - uiPadding) {
                hpBarStartY = spriteBottomY - uiPadding - hpBarActualHeight;
            }
            hpBarStartY = Math.max(hpBarStartY, spriteTopY + uiPadding); 
        }

        if (hpBarStartY + hpBarActualHeight <= spriteBottomY - uiPadding && hpBarActualHeight > 0) {
            ctx.font = `bold ${hpTextFontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const textMetrics = ctx.measureText(hpTextValue);
            const textWidth = textMetrics.width;
            const bgPadding = hpTextFontSize * ENEMY_HP_BG_PADDING_RATIO; 
            const bgWidth = textWidth + bgPadding * 2;
            const bgX = drawCenterX - bgWidth / 2;
            const hpBgRadius = ENEMY_HP_BG_CORNER_RADIUS / zoomLevel;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath(); ctx.roundRect(bgX, hpBarStartY, bgWidth, hpBarActualHeight, hpBgRadius); ctx.fill();
            ctx.fillStyle = '#f87171';
            ctx.fillText(hpTextValue, drawCenterX, hpBarStartY + hpBarActualHeight / 2 + 1);
        } else if (hpBarActualHeight > 0) { 
            hpBarStartY = spriteBottomY - uiPadding - hpBarActualHeight;
            hpBarStartY = Math.max(hpBarStartY, spriteTopY + uiPadding); 
            if (hpBarStartY < spriteBottomY - uiPadding && hpBarStartY + hpBarActualHeight > spriteTopY + uiPadding) {
                ctx.font = `bold ${hpTextFontSize}px Inter, sans-serif`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                const textMetrics = ctx.measureText(hpTextValue);
                const textWidth = textMetrics.width;
                const bgPadding = hpTextFontSize * ENEMY_HP_BG_PADDING_RATIO;
                const bgWidth = textWidth + bgPadding * 2;
                const bgX = drawCenterX - bgWidth / 2;
                const hpBgRadius = ENEMY_HP_BG_CORNER_RADIUS / zoomLevel;
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.beginPath(); ctx.roundRect(bgX, hpBarStartY, bgWidth, hpBarActualHeight, hpBgRadius); ctx.fill();
                ctx.fillStyle = '#f87171';
                ctx.fillText(hpTextValue, drawCenterX, hpBarStartY + hpBarActualHeight / 2 + 1);
            }
        }
    }

    const iconSizeInfo = getIconSize();
    const paddingInfo = getIconPadding();
    const infoBtnRadius = ICON_BORDER_RADIUS / zoomLevel;
    const infoBtnX = spriteLeftX + displayWidth - iconSizeInfo - paddingInfo;
    const infoBtnY = visualDrawCenterY - (iconSizeInfo / 2);
    ctx.fillStyle='rgba(96,165,250,0.8)'; ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=1/zoomLevel;
    ctx.beginPath(); ctx.roundRect(infoBtnX,infoBtnY,iconSizeInfo,iconSizeInfo,infoBtnRadius); ctx.fill(); ctx.stroke();
    ctx.fillStyle='white'; ctx.font=`bold ${Math.floor(iconSizeInfo*0.6)}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('?', infoBtnX+iconSizeInfo/2, infoBtnY+iconSizeInfo/2 + 1);

    if(enemy.isTargeted){ctx.strokeStyle='#a3e635';ctx.lineWidth=3/zoomLevel;ctx.beginPath();ctx.roundRect(spriteLeftX-2,spriteTopY-2,displayWidth+4,displayHeight+4,(ENEMY_SPRITE_CORNER_RADIUS+2)/zoomLevel);ctx.stroke();}
    if(enemy.isAoeMainTarget){ctx.strokeStyle='#ef4444';ctx.lineWidth=4/zoomLevel;ctx.beginPath();ctx.roundRect(spriteLeftX-4,spriteTopY-4,displayWidth+8,displayHeight+8,(ENEMY_SPRITE_CORNER_RADIUS+4)/zoomLevel);ctx.stroke();}
    if(enemy.isAoeSplashTarget){ctx.strokeStyle='#f97316';ctx.lineWidth=2/zoomLevel;ctx.beginPath();ctx.roundRect(spriteLeftX-1,spriteTopY-1,displayWidth+2,displayHeight+2,(ENEMY_SPRITE_CORNER_RADIUS+1)/zoomLevel);ctx.stroke();}
    if(enemy.isSpecialistTarget){ctx.strokeStyle='#a855f7';ctx.lineWidth=4/zoomLevel;ctx.beginPath();ctx.roundRect(spriteLeftX-4,spriteTopY-4,displayWidth+8,displayHeight+8,(ENEMY_SPRITE_CORNER_RADIUS+4)/zoomLevel);ctx.stroke();}
    if(enemy.isSpecialistSwapTarget){ctx.strokeStyle='#0ea5e9';ctx.lineWidth=3/zoomLevel;ctx.setLineDash([5/zoomLevel,3/zoomLevel]);ctx.beginPath();ctx.roundRect(spriteLeftX-2,spriteTopY-2,displayWidth+4,displayHeight+4,(ENEMY_SPRITE_CORNER_RADIUS+2)/zoomLevel);ctx.stroke();ctx.setLineDash([]);}
    if(enemy.isIfritTarget){ctx.strokeStyle='#eab308';ctx.lineWidth=3/zoomLevel;ctx.globalAlpha=0.7;ctx.beginPath();ctx.roundRect(spriteLeftX-2,spriteTopY-2,displayWidth+4,displayHeight+4,(ENEMY_SPRITE_CORNER_RADIUS+2)/zoomLevel);ctx.stroke();ctx.globalAlpha=1.0;}
	// В конце функции drawEnemy, после отрисовки isIfritTarget
	if(enemy.isDefenderStunTarget){
		ctx.strokeStyle='#ffb628'; // Желтый для возможного стана
		ctx.lineWidth=3/zoomLevel;
		//ctx.setLineDash([4/zoomLevel,4/zoomLevel]); // Пунктир
		ctx.beginPath();
		ctx.roundRect(spriteLeftX-2,spriteTopY-2,displayWidth+4,displayHeight+4,(ENEMY_SPRITE_CORNER_RADIUS+2)/zoomLevel);
		ctx.stroke();
		ctx.setLineDash([]);
	}
	if(enemy.isSupporterSlowTarget){
		ctx.strokeStyle='#3b82f6'; // Синий для возможного замедления  
		ctx.lineWidth=3/zoomLevel;
		//ctx.setLineDash([4/zoomLevel,4/zoomLevel]); // Пунктир
		ctx.beginPath();
		ctx.roundRect(spriteLeftX-2,spriteTopY-2,displayWidth+4,displayHeight+4,(ENEMY_SPRITE_CORNER_RADIUS+2)/zoomLevel);
		ctx.stroke();
		ctx.setLineDash([]);
	}
	if(enemy.isMainAttackTarget){
		ctx.strokeStyle='#ef4444'; // Красный для основной цели атаки
		ctx.lineWidth=3/zoomLevel;
		ctx.beginPath();
		ctx.roundRect(spriteLeftX-2,spriteTopY-2,displayWidth+4,displayHeight+4,(ENEMY_SPRITE_CORNER_RADIUS+2)/zoomLevel);
		ctx.stroke();
	}
}

