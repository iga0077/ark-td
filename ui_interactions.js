// ui_interactions.js (Часть 3: UI, Взаимодействия, Запуск)

// Переменные для модального окна улучшения (оставляем для будущей полной реализации)
let upgradeConfirmModalOverlay, upgradeModalMessage, upgradeModalConfirmBtn, upgradeModalCancelBtn;
let operatorToConfirmUpgrade = null;

// Переменные для модального окна продажи (оставляем для будущей полной реализации)
let sellConfirmModalOverlay, sellModalMessage, sellModalConfirmBtn, sellModalCancelBtn;
let operatorToConfirmSell = null; 

function handleShopCardClick(event) {
    if (gameEnded || currentPhase !== 'purchase' || selectingDeckToRefresh) return;
    const card = event.currentTarget;
    if (card.classList.contains('disabled')) {
        return;
    }
    const operatorId = card.dataset.operatorId;
    const operatorData = getOperatorData(operatorId);
    if (!operatorData) return;

    if (placedOperators.length >= MAX_OPERATORS_ON_FIELD) {
        addLogEntry(`Нельзя разместить больше ${MAX_OPERATORS_ON_FIELD} операторов. Продайте одного.`, "warning");
        return;
    }
    
    // Добавляем обработку выбора карточки
    if (typeof selectedShopOperatorId !== 'undefined') {
        selectedShopOperatorId = operatorId;
    }
    
    heldOperatorId = operatorId;
    placementMode = true;
    if(heldOperatorInfo) {
        heldOperatorInfo.textContent = `Взят: ${operatorData.name} (${operatorData.cost} LMD). Кликните на поле для размещения.`;
        heldOperatorInfo.style.display = 'block'; // Показываем информацию
    }
    if(canvas) canvas.style.cursor = 'copy';
    addLogEntry(`Взят ${operatorData.name} из магазина.`, 'action');
    
    // Обновляем визуализацию магазина для показа выбранной карточки
    if (typeof renderShop === 'function') renderShop();
}


function handleCanvasClick(event) {
    if (gameEnded || !mapLoaded) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / zoomLevel;
    const mouseY = (event.clientY - rect.top) / zoomLevel;
    const clickedCol = Math.floor(mouseX / CELL_SIZE);
    const clickedRow = Math.floor(mouseY / CELL_SIZE);

    let clickedOnOperator = null;
    let opForActionButton = null; 
    let actionButtonType = null;  
    let clickedOnSellArea = false;

    const currentIconSize = getIconSize(); 
    const currentIconPadding = getIconPadding();

    for(const op of placedOperators) {
        if (clickedRow === op.row && clickedCol === op.col) { 
            clickedOnOperator = op; 
            if (mouseX >= op.infoButtonRect.x && mouseX <= op.infoButtonRect.x + op.infoButtonRect.width &&
                mouseY >= op.infoButtonRect.y && mouseY <= op.infoButtonRect.y + op.infoButtonRect.height) {
                actionButtonType = 'info_op';
                opForActionButton = op;
            }
            else if (op.upgradeButtonRect.width > 0 && 
                     mouseX >= op.upgradeButtonRect.x && mouseX <= op.upgradeButtonRect.x + op.upgradeButtonRect.width &&
                     mouseY >= op.upgradeButtonRect.y && mouseY <= op.upgradeButtonRect.y + op.upgradeButtonRect.height) {
                actionButtonType = 'upgrade_op';
                opForActionButton = op;
            }
            else if (currentPhase === 'purchase') { 
                 clickedOnSellArea = true; 
            }
            break; 
        }
    }
    
    let clickedOnEnemyInfoButtonOnly = false;
    if (!clickedOnOperator && !actionButtonType) { 
        for (const enemy of activeEnemies) {
            if (enemy.isDefeated || enemy.reachedEnd) continue;
            let dW, dH; if (!enemy.isBoss) { const tH = CELL_SIZE * 0.45; if (enemy.imageLoaded && enemy.image.naturalWidth > 0) { const ar = enemy.image.naturalWidth / enemy.image.naturalHeight; dH = tH; dW = tH * ar; dW = Math.min(dW, CELL_SIZE * 0.9); } else { dW = CELL_SIZE * 0.7; dH = tH; } } else { const tW = CELL_SIZE * 0.9; if (enemy.imageLoaded && enemy.image.naturalWidth > 0) { const ar_ = enemy.image.naturalWidth / enemy.image.naturalHeight; dW = tW; dH = tW / ar_; } else { dW = tW; dH = tW; } }
            const vCenterY = enemy.lastVisualY !== undefined ? enemy.lastVisualY : enemy.pixelY;
            const sLX = enemy.pixelX - dW / 2;
            const iBtnX = sLX + dW - currentIconSize - currentIconPadding;
            const iBtnY = vCenterY - (currentIconSize / 2);
            if (mouseX >= iBtnX && mouseX <= iBtnX + currentIconSize && mouseY >= iBtnY && mouseY <= iBtnY + currentIconSize) {
                clickedOnEnemyInfoButtonOnly = true; 
                break; 
            }
        }
    }
    
    if (actionButtonType === 'info_op' || clickedOnEnemyInfoButtonOnly) {
        return; 
    }

    if (actionButtonType === 'upgrade_op' && opForActionButton) {
        if (opForActionButton.upgradeButtonRect.active) {
            const eliteData = getOperatorData(opForActionButton.eliteVersionId);
            if (eliteData) { 
                showUpgradeConfirmModal(opForActionButton, eliteData, eliteData.cost); // Используем кастомное окно
            }
        } else {
            addLogEntry("Улучшение недоступно (не та фаза или не хватает LMD).", "warning");
        }
    } 
    else if (clickedOnSellArea && clickedOnOperator) { 
        showSellConfirmModal(clickedOnOperator); // Используем кастомное окно
    }
    else if (clickedOnOperator && currentPhase === 'player' && !actionButtonType) { 
        if (targetingMode && selectedOperator === clickedOnOperator) { 
            selectedOperator.isSelected = false; selectedOperator = null;
            targetingMode = false;
            activeEnemies.forEach(enemy => { 
                enemy.isTargeted = false; 
                enemy.isAoeMainTarget = false; 
                enemy.isAoeSplashTarget = false; 
                enemy.isSpecialistTarget = false; 
                enemy.isSpecialistSwapTarget = false; 
                enemy.isIfritTarget = false;
				enemy.isMainAttackTarget = false; // Новое
				enemy.isDefenderStunTarget = false; // Новое
				enemy.isSupporterSlowTarget = false; // Новое
				
            });
            if(canvas) canvas.style.cursor = 'default'; addLogEntry("Выбор цели отменен.", "info");
        } else if (clickedOnOperator.attackTokensCurrent > 0) { 
            if (selectedOperator) selectedOperator.isSelected = false;
            selectedOperator = clickedOnOperator; selectedOperator.isSelected = true;
            targetingMode = true;
            activeEnemies.forEach(enemy => { 
                enemy.isTargeted = !enemy.isDefeated && !enemy.reachedEnd && selectedOperator.isInRange(enemy.pixelX, enemy.pixelY) && hasLineOfSight(selectedOperator, enemy);
                enemy.isAoeMainTarget = false; 
                enemy.isAoeSplashTarget = false; 
                enemy.isSpecialistTarget = false; 
                enemy.isSpecialistSwapTarget = false; 
                enemy.isIfritTarget = false;
				enemy.isMainAttackTarget = false; // Новое
				enemy.isDefenderStunTarget = false; // Новое
				enemy.isSupporterSlowTarget = false; // Новое
            });
            if(canvas) canvas.style.cursor = 'crosshair';
            addLogEntry(`Выбран ${selectedOperator.name}. Выберите цель для атаки.`, 'info');
        } else { addLogEntry(`${clickedOnOperator.name} не имеет жетонов атаки.`, 'warning'); }
    }
    else if (targetingMode && selectedOperator) { 
        if (currentPhase === 'player') {
            let targetEnemy = null;
            const clickedEnemies = [];
            for (const enemy of activeEnemies) {
                 if (enemy.isDefeated || enemy.reachedEnd) continue;
                 let dW, dH; if (!enemy.isBoss) { const tH = CELL_SIZE * 0.45; if (enemy.imageLoaded && enemy.image.naturalWidth > 0) { const ar = enemy.image.naturalWidth / enemy.image.naturalHeight; dH = tH; dW = tH * ar; dW = Math.min(dW, CELL_SIZE * 0.9); } else { dW = CELL_SIZE * 0.7; dH = tH; } } else { const tW = CELL_SIZE * 0.9; if (enemy.imageLoaded && enemy.image.naturalWidth > 0) { const ar_ = enemy.image.naturalWidth / enemy.image.naturalHeight; dW = tW; dH = tW / ar_; } else { dW = tW; dH = tW; } }
                 const vCenterY = enemy.lastVisualY !== undefined ? enemy.lastVisualY : enemy.pixelY;
                 const eLX = enemy.pixelX - dW / 2; const eTY = vCenterY - dH / 2;
                 if (mouseX >= eLX && mouseX <= eLX + dW && mouseY >= eTY && mouseY <= eTY + dH) {
                     clickedEnemies.push(enemy);
                 }
            }
            if (clickedEnemies.length > 0) {
                clickedEnemies.sort((a,b) => Math.hypot(a.pixelX-selectedOperator.centerX, a.pixelY-selectedOperator.centerY) - Math.hypot(b.pixelX-selectedOperator.centerX, b.pixelY-selectedOperator.centerY));
                targetEnemy = clickedEnemies[0];
            }

            if (targetEnemy && selectedOperator.isInRange(targetEnemy.pixelX, targetEnemy.pixelY) &&
                (selectedOperator.role === "Ifrit" || hasLineOfSight(selectedOperator, targetEnemy))
            ) {
                if (handleOperatorAttack(selectedOperator, targetEnemy)) { 
                    selectedOperator.isSelected = false; selectedOperator = null;
                    targetingMode = false;
                    activeEnemies.forEach(e => { 
                        e.isTargeted = false; 
                        e.isAoeMainTarget = false; 
                        e.isAoeSplashTarget = false; 
                        e.isSpecialistTarget = false; 
                        e.isSpecialistSwapTarget = false; 
                        e.isIfritTarget = false;
						e.isMainAttackTarget = false; // Новое
						e.isDefenderStunTarget = false; // Новое
						e.isSupporterSlowTarget = false; // Новое
                    });
                    if(canvas) canvas.style.cursor = 'default';
                }
            } else {
                addLogEntry("Цель не выбрана, вне радиуса или за препятствием. Выбор отменен.", "warning");
                if (selectedOperator) selectedOperator.isSelected = false; selectedOperator = null;
                targetingMode = false;
                activeEnemies.forEach(e => { 
                    e.isTargeted = false; 
                    e.isAoeMainTarget = false; 
                    e.isAoeSplashTarget = false; 
                    e.isSpecialistTarget = false; 
                    e.isSpecialistSwapTarget = false; 
                    e.isIfritTarget = false;
					e.isMainAttackTarget = false; // Новое
					e.isDefenderStunTarget = false; // Новое
					e.isSupporterSlowTarget = false; // Новое
                });
                if(canvas) canvas.style.cursor = 'default';
            }
        } else { addLogEntry("Атаковать можно только в фазу атаки.", "warning"); }
    }
    else if (placementMode && heldOperatorId) { 
        if (currentPhase === 'purchase') {
            if (isPlacementCell(clickedRow, clickedCol)) {
                if (!isCellOccupied(clickedRow, clickedCol)) {
                    const operatorData = getOperatorData(heldOperatorId);
                    if (operatorData && gameLMD >= operatorData.cost) {
                        gameLMD -= operatorData.cost;
                        if (shopLmdCounterSpan) shopLmdCounterSpan.textContent = gameLMD;
                        const newOperator = new Operator(clickedRow, clickedCol, heldOperatorId);
                        placedOperators.push(newOperator);
						totalOperatorsBought++;
						totalLmdSpent += operatorData.cost;
                        addLogEntry(`Размещен ${newOperator.name} в [${clickedRow + 1}, ${clickedCol + 1}]. (-${operatorData.cost} LMD)`, 'action');
                        const deckIdx = findDeckIndexByOperatorId(heldOperatorId);
                        if (deckIdx !== -1 && shopDecks[deckIdx].length > 0 && shopDecks[deckIdx][0] === heldOperatorId) {
                            shopDecks[deckIdx].shift();
                        }
                        heldOperatorId = null; placementMode = false;
						if (typeof selectedShopOperatorId !== 'undefined') {
							selectedShopOperatorId = null;
						}
                        if(heldOperatorInfo) heldOperatorInfo.textContent = '';
                        if(canvas) canvas.style.cursor = 'default';
                        if (typeof renderShop === 'function') renderShop(); 
                        if (typeof updateShopAvailabilityInfo === 'function') updateShopAvailabilityInfo();
                    } else if (operatorData) {
                        addLogEntry(`Недостаточно LMD для ${operatorData.name}! (Нужно ${operatorData.cost})`, 'warning');
                    } else {
                        addLogEntry(`Данные для оператора ${heldOperatorId} не найдены!`, 'error');
                        heldOperatorId = null; placementMode = false;
                        if(heldOperatorInfo) heldOperatorInfo.textContent = '';
                        if(canvas) canvas.style.cursor = 'default';
                    }
                } else { addLogEntry("Клетка уже занята оператором!", 'warning'); }
            } else { addLogEntry("Здесь нельзя размещать оператора.", 'warning'); }
        } else { addLogEntry("Размещать операторов можно только в фазу покупки.", "warning"); }
    }
    else { 
        if (selectedOperator) selectedOperator.isSelected = false;
        selectedOperator = null; targetingMode = false;
        activeEnemies.forEach(e => { 
            e.isTargeted = false; 
            e.isAoeMainTarget = false; 
            e.isAoeSplashTarget = false; 
            e.isSpecialistTarget = false; 
            e.isSpecialistSwapTarget = false; 
            e.isIfritTarget = false;
			e.isMainAttackTarget = false; // Новое
			e.isDefenderStunTarget = false; // Новое
			e.isSupporterSlowTarget = false; // Новое
        });
        if(canvas) canvas.style.cursor = 'default';
		if (placementMode) {
			placementMode = false;
			heldOperatorId = null;
			if (typeof selectedShopOperatorId !== 'undefined') {
				selectedShopOperatorId = null;
			}
			if(heldOperatorInfo) {
				heldOperatorInfo.textContent = '';
				heldOperatorInfo.style.display = 'none';
			}
			if (typeof renderShop === 'function') renderShop(); // Обновляем магазин
		}
    }
    if (typeof drawGame === 'function') drawGame();
}

function recordOperatorDamage(operatorId, operatorName, damage) {
    if (!operatorDamageStats[operatorId]) {
        operatorDamageStats[operatorId] = {
            name: operatorName,
            damage: 0
        };
    }
    operatorDamageStats[operatorId].damage += damage;
}

function handleOperatorAttack(operator, targetEnemy) {
    if (operator.attackTokensCurrent <= 0) {
        addLogEntry(`${operator.name} не имеет жетонов атаки.`, 'warning');
        return false;
    }
    addLogEntry(`${operator.name} атакует ${targetEnemy.name}.`, 'attack');
    const attackData = operator.parsedAttack;
    let damageDealtThisHit = false;
    let specialistMovedEnemy = false;

    if (!attackData && !(operator.role.startsWith("Specialist") && operator.ability && (operator.ability.type === 'pull' || operator.ability.type === 'push')) && operator.role !== "Ifrit") {
        console.error(`Ошибка: не удалось распознать атаку или способность для ${operator.name}`);
        operator.attackTokensCurrent--;
        return true;
    }

    if (operator.role === "Ifrit" && attackData && attackData.type === 'line') {
        const lineType = ifritAttackLine ? ifritAttackLine.type : determineIfritLineType(operator, targetEnemy);
        if (lineType) {
            ifritAttackLine = { type: lineType, row: operator.row, col: operator.col, targetRow: targetEnemy.path[targetEnemy.pathIndex][0], targetCol: targetEnemy.path[targetEnemy.pathIndex][1] };
            const enemiesOnLine = getEnemiesOnIfritLine(operator, lineType, targetEnemy);
            if (enemiesOnLine.length > 0) {
                addLogEntry(`Ifrit (${operator.name}) атакует по линии (${lineType}) врагов: ${enemiesOnLine.map(e=>e.name).join(', ')}`, 'attack');
                enemiesOnLine.forEach(enemyOnLine => {
                    if (hasLineOfSight(operator, enemyOnLine)) {
                        enemyOnLine.takeDamage(operator.parsedAttack.damage || operator.atk);
						recordOperatorDamage(operator.id, operator.name, operator.parsedAttack.damage || operator.atk);
                        damageDealtThisHit = true;
                    } else {
                        addLogEntry(`Стена блокирует атаку Ifrit на ${enemyOnLine.name}.`, 'info');
                    }
                });
            } else {
                addLogEntry(`Ifrit (${operator.name}) не нашел целей на выбранной линии (${lineType}).`, 'info');
                damageDealtThisHit = true;
            }
        } else {
            addLogEntry(`Не удалось определить линию атаки для Ifrit (${operator.name}). Атака отменена.`, 'warning');
            damageDealtThisHit = true;
        }
    }
    else if (operator.role.startsWith("Specialist") && operator.ability && (operator.ability.type === 'pull' || operator.ability.type === 'push')) {
        const power = operator.ability.power || 1;
        const direction = operator.ability.type === 'pull' ? +power : -power;
        const currentPathIndex = targetEnemy.pathIndex;
        let targetPathIndex = currentPathIndex + direction;

        if (targetPathIndex >= 0 && targetPathIndex < targetEnemy.path.length) {
            const targetCellCoords = targetEnemy.path[targetPathIndex];
            const targetCellRow = targetCellCoords[0];
            const targetCellCol = targetCellCoords[1];

            if (!isWallCell(targetCellRow, targetCellCol) && !isObstacleCell(targetCellRow, targetCellCol) && !isCellOccupied(targetCellRow, targetCellCol, true )) {
                const enemiesOnTargetCell = getEnemiesOnCell(targetCellRow, targetCellCol).filter(e => e !== targetEnemy);
                const bossOnTargetCell = enemiesOnTargetCell.find(e => e.isBoss);
                let nonBossesOnTargetCell = enemiesOnTargetCell.filter(e => !e.isBoss);
                let canMoveToTarget = false;
                let swapTarget = null;
                if (targetEnemy.isBoss) {
                    canMoveToTarget = enemiesOnTargetCell.length === 0;
                } else {
                    if (!bossOnTargetCell) {
                        if (nonBossesOnTargetCell.length < MAX_ENEMIES_PER_CELL) {
                            canMoveToTarget = true;
                        } else if (nonBossesOnTargetCell.length === MAX_ENEMIES_PER_CELL ) {
                            canMoveToTarget = true;
                            swapTarget = nonBossesOnTargetCell[0];
                        }
                    }
                }

                if (canMoveToTarget) {
                    const targetPixelX = targetCellCol * CELL_SIZE + CELL_SIZE / 2;
                    const targetPixelY = targetCellRow * CELL_SIZE + CELL_SIZE / 2;
                    addLogEntry(`(Specialist) ${operator.name} ${operator.ability.type === 'pull' ? 'притягивает' : 'отталкивает'} ${targetEnemy.name} на клетку [${targetCellRow + 1},${targetCellCol + 1}]${swapTarget ? ' (меняется местами с ' + swapTarget.name + ')' : ''}.`, 'action');
                    targetEnemy.startSpecialistMove(targetPathIndex, targetPixelX, targetPixelY, swapTarget);
                    specialistMovedEnemy = true;
                } else {
                    addLogEntry(`(Specialist) ${targetEnemy.name} не может быть ${operator.ability.type === 'pull' ? 'притянут' : 'оттолкнут'}: целевая клетка [${targetCellRow + 1},${targetCellCol + 1}] занята или недоступна.`, 'warning');
                }
            } else {
                addLogEntry(`(Specialist) ${targetEnemy.name} не может быть ${operator.ability.type === 'pull' ? 'притянут' : 'оттолкнут'}: целевая клетка [${targetCellRow + 1},${targetCellCol + 1}] является препятствием/оператором.`, 'warning');
            }
        } else {
             addLogEntry(`(Specialist) ${targetEnemy.name} не может быть ${operator.ability.type === 'pull' ? 'притянут' : 'оттолкнут'} за пределы пути.`, 'warning');
        }
        if (operator.atk) {
            let damage = 0;
            if (typeof operator.atk === 'number') {
                damage = operator.atk;
            } else if (operator.parsedAttack && operator.parsedAttack.type === 'single') {
                damage = operator.parsedAttack.damage;
            }
            if (damage > 0) {
                targetEnemy.takeDamage(damage);
				recordOperatorDamage(operator.id, operator.name, damage);
                damageDealtThisHit = true;
            }
        }
         if (specialistMovedEnemy) damageDealtThisHit = true;

    }
    else if (attackData) {
        if (attackData.type === 'caster') {
            const targetCell = targetEnemy.path[targetEnemy.pathIndex];
            const enemiesOnTargetCell = getEnemiesOnCell(targetCell[0], targetCell[1]);
            let damagePerTarget = attackData.damagePerTarget || 0;
            if (targetEnemy.isBoss) {
                const totalDamage = damagePerTarget * (attackData.targets || 1);
                addLogEntry(`(Caster) ${operator.name} наносит ${totalDamage} урона боссу ${targetEnemy.name}.`, 'attack');
                targetEnemy.takeDamage(totalDamage);
                damageDealtThisHit = true;
            } else {
                let targetsHitCount = 0;
                enemiesOnTargetCell.forEach(enemyInCell => {
                    if (targetsHitCount < (attackData.targets || 1)) {
                        if (!enemyInCell.isDefeated) {
                             addLogEntry(`(Caster) ${operator.name} наносит ${damagePerTarget} урона ${enemyInCell.name}.`, 'attack');
                             enemyInCell.takeDamage(damagePerTarget);
							 recordOperatorDamage(operator.id, operator.name, damagePerTarget);
                             damageDealtThisHit = true;
                             targetsHitCount++;
                        }
                    }
                });
            }
        } else if (attackData.type === 'aoe') {
			const mainDamage = attackData.mainDamage || 0;
			const splashDamage = attackData.splashDamage || 0;
			
			if (targetEnemy.isBoss) {
				const totalDamage = mainDamage + splashDamage;
				addLogEntry(`(AOE) ${operator.name} наносит ${totalDamage} урона боссу ${targetEnemy.name}.`, 'attack');
				targetEnemy.takeDamage(totalDamage);
				damageDealtThisHit = true;
			} else {
				// Определяем соседей ДО нанесения урона основной цели
				const neighbors = findAdjacentEnemies(targetEnemy, activeEnemies);
				
				// Наносим урон основной цели
				addLogEntry(`(AOE) ${operator.name} наносит ${mainDamage} урона основной цели ${targetEnemy.name}.`, 'attack');
				targetEnemy.takeDamage(mainDamage);
				recordOperatorDamage(operator.id, operator.name, mainDamage);
				damageDealtThisHit = true;
				
				// Наносим сплеш-урон соседям
				let splashTargetsHit = 0;
				neighbors.forEach(neighbor => {
					if (splashTargetsHit < 2 && !neighbor.isDefeated && !neighbor.isBoss) {
						addLogEntry(`(AOE) ${operator.name} наносит ${splashDamage} урона соседнему ${neighbor.name}.`, 'attack');
						neighbor.takeDamage(splashDamage);
						recordOperatorDamage(operator.id, operator.name, splashDamage);
						splashTargetsHit++;
					} else if (neighbor.isBoss) {
						addLogEntry(`(AOE) Сплеш не действует на босса ${neighbor.name}.`, 'info');
					}
				});
			}
		}
        else if (attackData.type === 'single') {
            let damage = attackData.damage || 0;
            targetEnemy.takeDamage(damage);
			recordOperatorDamage(operator.id, operator.name, damage);
            damageDealtThisHit = true;
        }
    }

    if (damageDealtThisHit && operator.ability) {
        if (operator.ability.type === 'stun' && operator.role === 'Defender') {
            if (targetEnemy.isBoss) {
                addLogEntry(`Оглушение не действует на босса ${targetEnemy.name}.`, 'info');
            } else if (targetEnemy.stunAppliedRound === gameRound) {
                addLogEntry(`${targetEnemy.name} уже был оглушен в этом раунде.`, 'info');
            } else if (targetEnemy.stunAppliedRound === gameRound -1 && !targetEnemy.isStunned) {
                 addLogEntry(`${targetEnemy.name} был оглушен в прошлом раунде, повторное оглушение невозможно.`, 'info');
            }
            else {
                const enemyCell = targetEnemy.path[targetEnemy.pathIndex];
                const enemiesOnSameCell = getEnemiesOnCell(enemyCell[0], enemyCell[1]);
                const alreadyStunnedOnCellThisRound = enemiesOnSameCell.some(e => e !== targetEnemy && e.isStunned && e.stunAppliedRound === gameRound);
                if (alreadyStunnedOnCellThisRound) {
                    addLogEntry(`Другой враг на клетке [${enemyCell[0]+1},${enemyCell[1]+1}] уже оглушен в этом раунде.`, 'info');
                } else {
                    targetEnemy.applyStun(operator.ability.duration, gameRound);
                    addLogEntry(`${targetEnemy.name} оглушен на ${operator.ability.duration} раунд!`, 'action');
                }
            }
        } else if (operator.ability.type === 'slow' && operator.role === 'Supporter') {
            targetEnemy.applySlow(operator.ability.power || operator.slow || 0, operator.ability.duration, gameRound);
        }
    }

    if (damageDealtThisHit || specialistMovedEnemy) {
        operator.attackTokensCurrent--;
        return true;
    } else {
        operator.attackTokensCurrent--;
        addLogEntry(`Активация ${operator.name} на ${targetEnemy.name} не имела эффекта (урон/смещение), но жетон потрачен.`, 'info');
        return true;
    }
}

function handleCanvasMouseMove(event) {
    if (gameEnded || !mapLoaded || !tooltipElement) {
        if(tooltipElement) tooltipElement.style.display = 'none';
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / zoomLevel;
    const mouseY = (event.clientY - rect.top) / zoomLevel;
    const hoverCol = Math.floor(mouseX / CELL_SIZE);
    const hoverRow = Math.floor(mouseY / CELL_SIZE);

    let newHoverTarget = null; 
    let newTooltipType = null; 

    if (!targetingMode && !placementMode) {
        for (const op of placedOperators) {
            if (hoverRow === op.row && hoverCol === op.col) {
                if (mouseX >= op.infoButtonRect.x && mouseX <= op.infoButtonRect.x + op.infoButtonRect.width &&
                    mouseY >= op.infoButtonRect.y && mouseY <= op.infoButtonRect.y + op.infoButtonRect.height) {
                    newHoverTarget = op;
                    newTooltipType = 'operator_info';
                    break;
                }
                if (op.upgradeButtonRect.width > 0 && op.eliteVersionId &&
                    mouseX >= op.upgradeButtonRect.x && mouseX <= op.upgradeButtonRect.x + op.upgradeButtonRect.width &&
                    mouseY >= op.upgradeButtonRect.y && mouseY <= op.upgradeButtonRect.y + op.upgradeButtonRect.height) {
                    newHoverTarget = op;
                    newTooltipType = 'operator_upgrade';
                    break;
                }
            }
        }

        if (!newHoverTarget) {
            for (let i = activeEnemies.length - 1; i >= 0; i--) {
                const enemy = activeEnemies[i];
                if (enemy.isDefeated || enemy.reachedEnd) continue;
                const currentIconSizeVal = getIconSize(); const currentIconPaddingVal = getIconPadding();
                let dW, dH; if (!enemy.isBoss) { const tH = CELL_SIZE*0.45; if(enemy.imageLoaded && enemy.image.naturalWidth>0){const ar=enemy.image.naturalWidth/enemy.image.naturalHeight;dH=tH;dW=tH*ar;dW=Math.min(dW,CELL_SIZE*0.9);}else{dW=CELL_SIZE*0.7;dH=tH;} }else{ const tW=CELL_SIZE*0.9; if(enemy.imageLoaded && enemy.image.naturalWidth>0){const ar_=enemy.image.naturalWidth/enemy.image.naturalHeight;dW=tW;dH=tW/ar_;}else{dW=tW;dH=tW;} }
                const vCenterY = enemy.lastVisualY !== undefined ? enemy.lastVisualY : enemy.pixelY;
                const sLX = enemy.pixelX - dW / 2;
                const iBtnX = sLX + dW - currentIconSizeVal - currentIconPaddingVal;
                const iBtnY = vCenterY - (currentIconSizeVal / 2);
                if (mouseX >= iBtnX && mouseX <= iBtnX + currentIconSizeVal && mouseY >= iBtnY && mouseY <= iBtnY + currentIconSizeVal) {
                    newHoverTarget = enemy;
                    newTooltipType = 'enemy_info';
                    break;
                }
            }
        }

        // Управление отображением тултипа
        if (newHoverTarget) {
            let htmlContent = "";
            let previousHoverTarget = hoveredOperatorInfo || hoveredEnemyInfo || hoveredUpgradeButtonOp;

            if (newHoverTarget !== previousHoverTarget || tooltipElement.style.display === 'none') {
                if (newTooltipType === 'operator_info') {
                    htmlContent = newHoverTarget.getTooltipHTML();
                    hoveredOperatorInfo = newHoverTarget; hoveredEnemyInfo = null; hoveredUpgradeButtonOp = null;
                } else if (newTooltipType === 'operator_upgrade') {
                    htmlContent = getShopOperatorTooltipHTML(newHoverTarget.eliteVersionId);
                    hoveredUpgradeButtonOp = newHoverTarget; hoveredOperatorInfo = null; hoveredEnemyInfo = null;
                } else if (newTooltipType === 'enemy_info') {
                    htmlContent = newHoverTarget.getTooltipHTML();
                    hoveredEnemyInfo = newHoverTarget; hoveredOperatorInfo = null; hoveredUpgradeButtonOp = null;
                }
                tooltipElement.innerHTML = htmlContent;
                tooltipElement.style.display = 'block';
            }
            
            tooltipElement.style.left = `${event.clientX + 15}px`;
            tooltipElement.style.top = `${event.clientY + 15}px`;
            const tooltipRect = tooltipElement.getBoundingClientRect();
            if (tooltipRect.right > window.innerWidth) tooltipElement.style.left = `${event.clientX - tooltipRect.width - 15}px`;
            if (tooltipRect.bottom > window.innerHeight) tooltipElement.style.top = `${event.clientY - tooltipRect.height - 15}px`;
            if (tooltipRect.top < 0) tooltipElement.style.top = `0px`;

        } else { // Не над интерактивным элементом
            if (tooltipElement.style.display !== 'none') {
                 tooltipElement.style.display = 'none';
            }
            hoveredOperatorInfo = null;
            hoveredEnemyInfo = null;
            hoveredUpgradeButtonOp = null;
        }
    } else if (tooltipElement.style.display !== 'none' && !event.target.closest('.shop-card-info-btn')) {
        tooltipElement.style.display = 'none';
        hoveredOperatorInfo = null; hoveredEnemyInfo = null; hoveredUpgradeButtonOp = null;
    }

		// Подсветка целей при наведении
	if (targetingMode && selectedOperator && currentPhase === 'player') {
		// Сброс всех подсветок
		activeEnemies.forEach(enemy => {
			enemy.isAoeMainTarget = false;
			enemy.isAoeSplashTarget = false;
			enemy.isSpecialistTarget = false;
			enemy.isSpecialistSwapTarget = false;
			enemy.isIfritTarget = false;
			enemy.isMainAttackTarget = false; // Новое
			enemy.isDefenderStunTarget = false; // Новое
			enemy.isSupporterSlowTarget = false; // Новое
		});
		aoeMainTarget = null;
		aoeSplashTargets = [];
		specialistHoverTarget = null;
		specialistSwapTarget = null;
		ifritLineTargets = [];

		// Найти врага под курсором
		let hoverEnemy = null;
		for (const enemy of activeEnemies) {
			if (enemy.isDefeated || enemy.reachedEnd) continue;
			
			let displayWidth, displayHeight;
			if (!enemy.isBoss) {
				const targetBaseHeight = CELL_SIZE * 0.45;
				if (enemy.imageLoaded && enemy.image.naturalWidth > 0) {
					const aspectRatio = enemy.image.naturalWidth / enemy.image.naturalHeight;
					displayHeight = targetBaseHeight;
					displayWidth = displayHeight * aspectRatio;
					displayWidth = Math.min(displayWidth, CELL_SIZE * 0.9);
				} else {
					displayWidth = CELL_SIZE * 0.7;
					displayHeight = targetBaseHeight;
				}
			} else {
				const targetBaseWidth = CELL_SIZE * 0.9;
				if (enemy.imageLoaded && enemy.image.naturalWidth > 0) {
					const aspectRatio = enemy.image.naturalWidth / enemy.image.naturalHeight;
					displayWidth = targetBaseWidth;
					displayHeight = displayWidth / aspectRatio;
				} else {
					displayWidth = targetBaseWidth;
					displayHeight = targetBaseWidth;
				}
			}
			
			const visualCenterY = enemy.lastVisualY !== undefined ? enemy.lastVisualY : enemy.pixelY;
			const enemyLeftX = enemy.pixelX - displayWidth / 2;
			const enemyTopY = visualCenterY - displayHeight / 2;
			
			if (mouseX >= enemyLeftX && mouseX <= enemyLeftX + displayWidth &&
				mouseY >= enemyTopY && mouseY <= enemyTopY + displayHeight) {
				hoverEnemy = enemy;
				break;
			}
		}

		if (hoverEnemy && hoverEnemy.isTargeted) {
			const attackData = selectedOperator.parsedAttack;
			
			// Обработка Caster AOE
			if (attackData && attackData.type === 'aoe') {
				aoeMainTarget = hoverEnemy;
				hoverEnemy.isAoeMainTarget = true;
				
				// Найти соседних врагов для сплеш-урона
				const neighbors = findAdjacentEnemies(hoverEnemy, activeEnemies);
				aoeSplashTargets = [];
				neighbors.forEach(neighbor => {
					if (!neighbor.isDefeated && aoeSplashTargets.length < 2) {
						neighbor.isAoeSplashTarget = true;
						aoeSplashTargets.push(neighbor);
					}
				});
			}
			// Обработка обычного Caster
			else if (attackData && attackData.type === 'caster') {
				// Для обычных кастеров подсвечиваем всех врагов на клетке
				const targetCell = hoverEnemy.path[hoverEnemy.pathIndex];
				const enemiesOnCell = getEnemiesOnCell(targetCell[0], targetCell[1]);
				
				enemiesOnCell.forEach(enemy => {
					if (!enemy.isDefeated) {
						enemy.isAoeMainTarget = true; // Используем ту же подсветку что и для AOE
					}
				});
			}
			// Обработка Specialist
			else if (selectedOperator.role.startsWith("Specialist")) {
				specialistHoverTarget = hoverEnemy;
				hoverEnemy.isSpecialistTarget = true;
				
				// Определить цель для обмена местами
				const power = selectedOperator.ability.power || 1;
				const direction = selectedOperator.ability.type === 'pull' ? +power : -power;
				const targetPathIndex = hoverEnemy.pathIndex + direction;
				
				if (targetPathIndex >= 0 && targetPathIndex < hoverEnemy.path.length) {
					const targetCellCoords = hoverEnemy.path[targetPathIndex];
					const targetCellRow = targetCellCoords[0];
					const targetCellCol = targetCellCoords[1];
					
					if (!isWallCell(targetCellRow, targetCellCol) && !isObstacleCell(targetCellRow, targetCellCol) && !isCellOccupied(targetCellRow, targetCellCol, true)) {
						const enemiesOnTargetCell = getEnemiesOnCell(targetCellRow, targetCellCol);
						if (!hoverEnemy.isBoss && enemiesOnTargetCell.length >= MAX_ENEMIES_PER_CELL) {
							specialistSwapTarget = enemiesOnTargetCell[0];
							specialistSwapTarget.isSpecialistSwapTarget = true;
						}
					}
				}
			}
			// Обработка Ifrit
			else if (selectedOperator.role === "Ifrit") {
				const lineType = determineIfritLineType(selectedOperator, hoverEnemy);
				if (lineType) {
					ifritAttackLine = { type: lineType };
					const enemiesOnLine = getEnemiesOnIfritLine(selectedOperator, lineType, hoverEnemy);
					ifritLineTargets = enemiesOnLine.filter(e => hasLineOfSight(selectedOperator, e));
					ifritLineTargets.forEach(e => { e.isIfritTarget = true; });
				}
			}
			// Обработка Sniper и Guard (обычная одиночная атака)
			else if (selectedOperator.role === "Sniper" || selectedOperator.role === "Guard") {
				// Помечаем как основную цель атаки
				hoverEnemy.isMainAttackTarget = true;
			}
			// Обработка Defender (со станом)
			else if (selectedOperator.role === "Defender") {
				// Подсвечиваем цель, можно добавить индикацию возможности стана
				if (!hoverEnemy.isBoss && hoverEnemy.stunAppliedRound !== gameRound && !hoverEnemy.hadStunLastRound) {
					// Враг может быть оглушен - используем специальную подсветку
					hoverEnemy.isDefenderStunTarget = true;
				}
			}
			// Обработка Supporter (с замедлением)
			else if (selectedOperator.role === "Supporter") {
				// Подсвечиваем цель, можно добавить индикацию возможности замедления
				if (!hoverEnemy.isStunned) {
					// Враг может быть замедлен - используем специальную подсветку
					hoverEnemy.isSupporterSlowTarget = true;
				}
			}
		}
	}
	}

function handleCanvasMouseLeave() {
    if (hoveredOperatorInfo || hoveredEnemyInfo || hoveredUpgradeButtonOp) {
        if(tooltipElement) tooltipElement.style.display = 'none';
        hoveredOperatorInfo = null;
        hoveredEnemyInfo = null;
        hoveredUpgradeButtonOp = null;
    }
    // ... (сброс остальных состояний подсветки) ...
}

function resizeCanvas() {
    if (!gameArea) {
        if (canvas) {
            canvas.width = GRID_COLS * 32 * zoomLevel; 
            canvas.height = GRID_ROWS * 32 * zoomLevel;
            canvas.style.width = `${GRID_COLS * 32 * zoomLevel}px`;
            canvas.style.height = `${GRID_ROWS * 32 * zoomLevel}px`;
            CELL_SIZE = 32; 
            if (mapLoaded && typeof drawGame === 'function') { drawGame(); }
        }
        return;
    }
    
    const containerWidth = gameArea.clientWidth;
    const containerHeight = gameArea.clientHeight;
    
    const computedStyle = getComputedStyle(gameArea);
    const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
    const paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
    const availableWidth = containerWidth - paddingX;
    const availableHeight = containerHeight - paddingY;

    if (availableWidth <= 0 || availableHeight <= 0) {
        console.warn("[resizeCanvas] Invalid available space, using defaults.");
        if (canvas) { 
             canvas.width = GRID_COLS * 32 * zoomLevel;
             canvas.height = GRID_ROWS * 32 * zoomLevel;
             canvas.style.width = `${GRID_COLS * 32 * zoomLevel}px`;
             canvas.style.height = `${GRID_ROWS * 32 * zoomLevel}px`;
             CELL_SIZE = 32;
        }
        if (mapLoaded && typeof drawGame === 'function') drawGame();
        return;
    }

    const cellWidthPotential = availableWidth / GRID_COLS;
    const cellHeightPotential = availableHeight / GRID_ROWS;
    const baseCellSize = Math.floor(Math.min(cellWidthPotential, cellHeightPotential));
    CELL_SIZE = Math.max(32, baseCellSize);
    
    // Вычисляем минимальный зум, при котором карта помещается в контейнер
    const minZoomToFit = Math.min(availableWidth / (GRID_COLS * CELL_SIZE), availableHeight / (GRID_ROWS * CELL_SIZE));

    if (canvas) { 
        canvas.width = GRID_COLS * CELL_SIZE * zoomLevel;
        canvas.height = GRID_ROWS * CELL_SIZE * zoomLevel;
        canvas.style.width = `${GRID_COLS * CELL_SIZE * zoomLevel}px`;
        canvas.style.height = `${GRID_ROWS * CELL_SIZE * zoomLevel}px`;
    } else {
        console.error("resizeCanvas: canvas не найден!");
        return;
    }

    if (typeof placedOperators !== 'undefined' && placedOperators.forEach) placedOperators.forEach(op => op.updatePosition());
    if (typeof activeEnemies !== 'undefined' && activeEnemies.forEach) activeEnemies.forEach(en => { en.updatePixelCoordinatesToCurrentPathIndex(); });

    if (mapLoaded && typeof drawGame === 'function') drawGame();
}

function updateBaseHpBar() {
    if (!baseHpBarFill || !baseHpBarText || (typeof gameEnded !== 'undefined' && gameEnded)) return;
    const currentHp = Math.max(0, gameBaseHp);
    const maxHp = INITIAL_BASE_HP;
    const hpPercentage = (currentHp / maxHp) * 100;
    baseHpBarFill.style.width = `${hpPercentage}%`;
    baseHpBarText.textContent = `${currentHp}/${maxHp}`;
    if (hpPercentage > 60) { baseHpBarFill.style.backgroundColor = '#4ade80'; } 
    else if (hpPercentage > 30) { baseHpBarFill.style.backgroundColor = '#facc15'; } 
    else { baseHpBarFill.style.backgroundColor = '#f87171'; }
}

function updateUIForPhase() {
    if((typeof gameEnded !== 'undefined' && gameEnded) || !currentPhaseDisplay) return;

    let phaseDisplayName = (typeof getPhaseName === 'function') ? getPhaseName(currentPhase) : currentPhase;
    if (currentPhase === 'purchase' && isBreakPeriodActive && battleToLoadAfterBreak > 0) {
        phaseDisplayName = `Перерыв (${breakRoundsLeft} р. до Боя ${battleToLoadAfterBreak})`;
    } else if (isBreakPeriodActive && breakRoundsLeft > 0) {
         phaseDisplayName = `Перерыв (${breakRoundsLeft} р.)`;
    }
    currentPhaseDisplay.textContent = phaseDisplayName;

    const isPurchasePhase = currentPhase === 'purchase';
    const isPlayerPhase = currentPhase === 'player';

    if(endPurchaseBtn) { 
        endPurchaseBtn.style.display = isPurchasePhase ? 'inline-block' : 'none';
        if(isPurchasePhase) {
            endPurchaseBtn.disabled = false; 
            if (isBreakPeriodActive) {
                endPurchaseBtn.textContent = 'След. раунд перерыва';
            } else {
                const noEnemiesOnField = activeEnemies.filter(e => !e.isDefeated && !e.reachedEnd).length === 0;
                const isInitialSetup = gameRound === 1 && noEnemiesOnField && !bossSpawnedThisBattle && currentWaveDeck && currentWaveDeck.length > 0 && gameBattle === 1;
                if (isInitialSetup) { endPurchaseBtn.textContent = 'Начать 1-й Бой'; } 
                else { endPurchaseBtn.textContent = 'Начать Фазу Врагов'; }
            }
        }
    }
    if(endAttackBtn) {
        endAttackBtn.style.display = isPlayerPhase ? 'inline-block' : 'none';
        if(isPlayerPhase) endAttackBtn.disabled = false; 
    }
    
    if(refreshShopBtn) refreshShopBtn.disabled = currentPhase !== 'purchase' || selectingDeckToRefresh;
    if(shopDecksContainer) {
        shopDecksContainer.style.pointerEvents = currentPhase === 'purchase' ? 'auto' : 'none';
        shopDecksContainer.style.opacity = currentPhase === 'purchase' ? '1' : '0.6';
    }
    
    if (currentPhase === 'purchase' && typeof renderShop === 'function') {
        renderShop();
    }

    if (currentPhase !== 'player') {
        if (selectedOperator) selectedOperator.isSelected = false;
        selectedOperator = null; targetingMode = false;
        aoeMainTarget = null; aoeSplashTargets = [];
        specialistHoverTarget = null; specialistSwapTarget = null;
        ifritAttackLine = null; ifritLineTargets = [];
        activeEnemies.forEach(e => { e.isTargeted = false; e.isAoeMainTarget = false; e.isAoeSplashTarget = false; e.isSpecialistTarget = false; e.isSpecialistSwapTarget = false; e.isIfritTarget = false; e.isDefenderStunTarget = false; // Новое
    e.isSupporterSlowTarget = false; e.isMainAttackTarget = false; });
        if(canvas) canvas.style.cursor = 'default';
    }
    if (currentPhase !== 'purchase') {
        placementMode = false; heldOperatorId = null;
        if(heldOperatorInfo) heldOperatorInfo.textContent = '';
        if(canvas) canvas.style.cursor = targetingMode ? 'crosshair' : 'default';
		if (typeof selectedShopOperatorId !== 'undefined') {
			selectedShopOperatorId = null;
		}
    }

    if(battleCounterSpan) battleCounterSpan.textContent = gameBattle;
    if(totalBattlesSpan) totalBattlesSpan.textContent = TOTAL_BATTLES;
    if(roundCounterSpan) roundCounterSpan.textContent = gameRound;
    if(shopLmdCounterSpan) shopLmdCounterSpan.textContent = gameLMD;
    if(typeof updateBaseHpBar === 'function') updateBaseHpBar();
    if (gameBaseHp <= 0 && !gameEnded && typeof endGame === 'function') {
        endGame(false);
    }
}

// --- Функции для кастомного модального окна подтверждения УЛУЧШЕНИЯ ---
function showUpgradeConfirmModal(operator, eliteData, cost) {
    if (!upgradeConfirmModalOverlay || !upgradeModalMessage) {
        console.error("Элементы модального окна УЛУЧШЕНИЯ не найдены! Используется стандартный confirm.");
        if (confirm(`Вы хотите улучшить ${operator.name} до ${eliteData.name} за ${cost} LMD?`)) {
            if (operator.upgrade()) { 
                 if(selectedOperator === operator) {
                    selectedOperator.isSelected = false; selectedOperator = null;
                    targetingMode = false; activeEnemies.forEach(e => e.isTargeted = false);
                    if(canvas) canvas.style.cursor = 'default';
                }
            }
        }
        return;
    }
    operatorToConfirmUpgrade = operator; 
    upgradeModalMessage.textContent = `Улучшить ${operator.name} до ${eliteData.name} за ${cost} LMD?`;
    upgradeConfirmModalOverlay.style.display = 'flex';
}

function hideUpgradeConfirmModal() {
    if (!upgradeConfirmModalOverlay) return;
    upgradeConfirmModalOverlay.style.display = 'none';
    operatorToConfirmUpgrade = null;
}

// --- Функции для кастомного модального окна подтверждения ПРОДАЖИ ---
function showSellConfirmModal(operator) {
    if (!sellConfirmModalOverlay || !sellModalMessage) {
        console.error("Элементы модального окна ПРОДАЖИ не найдены! Используется стандартный confirm.");
        const sellValue = typeof getOperatorSellValue === 'function' ? getOperatorSellValue(operator) : 0;
        if (confirm(`Продать ${operator.name} за ${sellValue} LMD?`)) {
            if(typeof sellOperator === 'function') sellOperator(operator);
        }
        return;
    }
    operatorToConfirmSell = operator; 
    const sellValue = typeof getOperatorSellValue === 'function' ? getOperatorSellValue(operator) : 0;
    sellModalMessage.textContent = `Продать ${operator.name} за ${sellValue} LMD?`;
    sellConfirmModalOverlay.style.display = 'flex';
}

function hideSellConfirmModal() {
    if (!sellConfirmModalOverlay) return;
    sellConfirmModalOverlay.style.display = 'none';
    operatorToConfirmSell = null;
}


window.addEventListener('DOMContentLoaded', () => {
	// Элементы начального экрана
		const startScreen = document.getElementById('startScreen');
		const gameInterface = document.getElementById('gameInterface');
		const startGameBtn = document.getElementById('startGameBtn');
		const mapCards = document.querySelectorAll('.map-card');

		// Обработка выбора карты
		mapCards.forEach(card => {
			card.addEventListener('click', () => {
				const mapType = card.dataset.map;
				
				if (mapType === 'editor') {
					// Открываем редактор карт
					startScreen.style.display = 'none';
					document.getElementById('mapEditorScreen').style.display = 'flex';
					MapEditor.init();
					return;
				}
				
				// Убираем выделение со всех карт
				mapCards.forEach(c => c.classList.remove('selected'));
				
				// Выделяем выбранную карту
				card.classList.add('selected');
				
				// Сохраняем выбор
				selectedMapName = card.dataset.map;
				
				// Активируем кнопку старта
				startGameBtn.disabled = false;
			});
		});

		// Обработка начала игры
		startGameBtn.addEventListener('click', () => {
			if (!selectedMapName) return;
			
			// Загружаем данные выбранной карты
			currentMapData = MAP_DATA[selectedMapName];
			
			if (!currentMapData) {
				console.error(`Данные для карты ${selectedMapName} не найдены!`);
				return;
			}
			
			// Обновляем путь к изображению карты
			MAP_IMAGE_SRC = currentMapData.imageSrc;
			
			// Скрываем начальный экран
			startScreen.style.display = 'none';
			
			// Показываем игровой интерфейс
			gameInterface.style.display = 'flex';
			gameInterface.style.flexDirection = 'column';
			gameInterface.style.height = '100vh';
			
			// Для кастомных карт сразу устанавливаем mapLoaded = true
			if (currentMapData.isCustom) {
				mapLoaded = true;
			}
			
			// Запускаем инициализацию игры
			initializeGame();
		});

// Переносим всю инициализацию игры в отдельную функцию
window.initializeGame = function() {
    if (typeof initializeDOMElements !== 'function' || !initializeDOMElements()) {
        console.error("Критическая ошибка: DOM-элементы не инициализированы в DOMContentLoaded!");
        const errDiv = document.getElementById('errorMessage') || document.createElement('div');
        if (!document.getElementById('errorMessage')) {
            errDiv.id = 'errorMessage';
            errDiv.className = 'error-message';
            document.body.appendChild(errDiv);
        }
        errDiv.textContent = "Критическая ошибка инициализации DOM! Проверьте консоль.";
        errDiv.style.display = 'block';
        return;
    }
    
    upgradeConfirmModalOverlay = document.getElementById('upgradeConfirmModalOverlay');
    upgradeModalMessage = document.getElementById('upgradeModalMessage');
    upgradeModalConfirmBtn = document.getElementById('upgradeModalConfirmBtn');
    upgradeModalCancelBtn = document.getElementById('upgradeModalCancelBtn');

    if (upgradeConfirmModalOverlay && upgradeModalConfirmBtn && upgradeModalCancelBtn) {
        upgradeModalConfirmBtn.addEventListener('click', () => {
            if (operatorToConfirmUpgrade) {
                if (operatorToConfirmUpgrade.upgrade()) { 
                     if(selectedOperator === operatorToConfirmUpgrade) {
                       selectedOperator.isSelected = false; selectedOperator = null;
                       targetingMode = false; activeEnemies.forEach(e => e.isTargeted = false);
                       if(canvas) canvas.style.cursor = 'default';
                   }
                }
            }
            hideUpgradeConfirmModal();
        });
        upgradeModalCancelBtn.addEventListener('click', hideUpgradeConfirmModal);
        upgradeConfirmModalOverlay.addEventListener('click', (event) => { 
            if (event.target === upgradeConfirmModalOverlay) {
                hideUpgradeConfirmModal();
            }
        });
    } else {
        console.error("Не все элементы модального окна УЛУЧШЕНИЯ найдены для назначения обработчиков!");
    }
    
    sellConfirmModalOverlay = document.getElementById('sellConfirmModalOverlay');
    sellModalMessage = document.getElementById('sellModalMessage');
    sellModalConfirmBtn = document.getElementById('sellModalConfirmBtn');
    sellModalCancelBtn = document.getElementById('sellModalCancelBtn');

    if (sellConfirmModalOverlay && sellModalConfirmBtn && sellModalCancelBtn) {
        sellModalConfirmBtn.addEventListener('click', () => {
            if (operatorToConfirmSell) {
                if(typeof sellOperator === 'function') sellOperator(operatorToConfirmSell);
            }
            hideSellConfirmModal();
        });
        sellModalCancelBtn.addEventListener('click', hideSellConfirmModal);
        sellConfirmModalOverlay.addEventListener('click', (event) => { 
            if (event.target === sellConfirmModalOverlay) {
                hideSellConfirmModal();
            }
        });
    } else {
         console.warn("Элементы модального окна ПРОДАЖИ не найдены (это нормально, т.к. мы вернули confirm).");
    }
    
    if(typeof addLogEntry === 'function') addLogEntry("Инициализация игры...", "game_state");
    if(totalBattlesSpan) totalBattlesSpan.textContent = TOTAL_BATTLES;
    if(typeof updateBaseHpBar === 'function') updateBaseHpBar();

    if(canvas) {
		canvas.style.pointerEvents = 'auto';
		
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('mousemove', handleCanvasMouseMove);
        canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
    }
    if(zoomInBtn) zoomInBtn.addEventListener('click', () => { if(gameEnded) return; zoomLevel = Math.min(MAX_ZOOM, zoomLevel * ZOOM_FACTOR); resizeCanvas(); });
    if(zoomOutBtn) {
		zoomOutBtn.addEventListener('click', () => { 
			if(gameEnded) return; 
			
			// Вычисляем минимальный зум
			if (gameArea) {
				const containerWidth = gameArea.clientWidth;
				const containerHeight = gameArea.clientHeight;
				const computedStyle = getComputedStyle(gameArea);
				const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
				const paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
				const availableWidth = containerWidth - paddingX;
				const availableHeight = containerHeight - paddingY;
				
				const minZoomToFit = Math.min(
					availableWidth / (GRID_COLS * CELL_SIZE), 
					availableHeight / (GRID_ROWS * CELL_SIZE)
				);
				
				// Ограничиваем минимальный зум
				const newZoom = zoomLevel / ZOOM_FACTOR;
				zoomLevel = Math.max(Math.max(MIN_ZOOM, minZoomToFit), newZoom);
			} else {
				zoomLevel = Math.max(MIN_ZOOM, zoomLevel / ZOOM_FACTOR);
			}
			
			resizeCanvas(); 
		});
	}
    
    if(endPurchaseBtn) endPurchaseBtn.addEventListener('click', () => { 
        if (gameEnded || currentPhase !== 'purchase') return; 
        if(typeof nextPhase === 'function') nextPhase(); 
    });
	
    if(endAttackBtn) {
		endAttackBtn.addEventListener('click', () => { 
			if (gameEnded || currentPhase !== 'player') return;
			
			if (typeof checkIfAnyOperatorCanStillAttack === 'function' && checkIfAnyOperatorCanStillAttack()) {
				// Показываем модальное окно вместо confirm
				const endAttackConfirmModal = document.getElementById('endAttackConfirmModalOverlay');
				if (endAttackConfirmModal) {
					endAttackConfirmModal.style.display = 'flex';
				}
			} else {
				if(typeof nextPhase === 'function') nextPhase();
			}
		});
	}

	// Добавьте обработчики для модального окна
	const endAttackConfirmModal = document.getElementById('endAttackConfirmModalOverlay');
	const endAttackModalConfirmBtn = document.getElementById('endAttackModalConfirmBtn');
	const endAttackModalCancelBtn = document.getElementById('endAttackModalCancelBtn');

	if (endAttackModalConfirmBtn) {
		endAttackModalConfirmBtn.addEventListener('click', () => {
			if (endAttackConfirmModal) {
				endAttackConfirmModal.style.display = 'none';
			}
			if(typeof nextPhase === 'function') nextPhase();
		});
	}

	if (endAttackModalCancelBtn) {
		endAttackModalCancelBtn.addEventListener('click', () => {
			if (endAttackConfirmModal) {
				endAttackConfirmModal.style.display = 'none';
			}
			if(typeof addLogEntry === 'function') addLogEntry("Завершение фазы атаки отменено.", "info");
		});
	}

	// Закрытие по клику вне окна
	if (endAttackConfirmModal) {
		endAttackConfirmModal.addEventListener('click', (event) => {
			if (event.target === endAttackConfirmModal) {
				endAttackConfirmModal.style.display = 'none';
				if(typeof addLogEntry === 'function') addLogEntry("Завершение фазы атаки отменено.", "info");
			}
		});
	}
	

    window.addEventListener('resize', () => {
        if (gameEnded) return;
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
        if(typeof resizeCanvas === 'function') resizeCanvas();
        if (mapLoaded && !gameEnded && typeof gameLoop === 'function') {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    });

    if (typeof initializeShop === 'function') initializeShop();
    if(typeof startBattle === 'function') startBattle(1);
    if(typeof setPhase === 'function') setPhase('purchase');


    if (currentMapData && currentMapData.isCustom) {
		// Для кастомных карт не нужно загружать изображение
		mapLoaded = true;
		if(typeof addLogEntry === 'function') addLogEntry("Кастомная карта загружена.", "game_state");
		if(typeof resizeCanvas === 'function') resizeCanvas();
		
		// Проверяем, не запущен ли уже gameLoop
		if (!animationFrameId && typeof gameLoop === 'function') {
			gameLoop();
		}
	} else {
		// Стандартная загрузка карты с изображением
		const mapLoader = new Image();
		mapLoader.src = MAP_IMAGE_SRC;
		mapLoader.onload = () => {
			mapImage = mapLoader;
			mapLoaded = true;
			if(typeof addLogEntry === 'function') addLogEntry("Карта загружена.", "game_state");
			if(typeof resizeCanvas === 'function') resizeCanvas();
			
			// Проверяем, не запущен ли уже gameLoop
			if (!animationFrameId && typeof gameLoop === 'function') {
				gameLoop();
			}
		};
	
    mapLoader.onerror = () => {
        if(errorMessageDiv) {
            errorMessageDiv.style.display = 'block';
            errorMessageDiv.textContent = `Ошибка загрузки карты! Путь: ${MAP_IMAGE_SRC}`;
        }
        if(typeof addLogEntry === 'function') addLogEntry(`Ошибка загрузки карты: ${MAP_IMAGE_SRC}`, 'error');
        if(typeof resizeCanvas === 'function') resizeCanvas();
        if(typeof gameLoop === 'function') gameLoop();
    };
}
	
	const languageSelector = document.getElementById('languageSelector');
	if (languageSelector) {
		languageSelector.addEventListener('change', (e) => {
			if (e.target.value) {
				// Запускаем Google Translate программно
				const googleTranslateSelect = document.querySelector('.goog-te-combo');
				if (googleTranslateSelect) {
					googleTranslateSelect.value = e.target.value;
					googleTranslateSelect.dispatchEvent(new Event('change'));
				}
			}
		});
	}
	
	// Инициализация таймера
	gameTimerElement = document.getElementById('gameTimer');
	startGameTimer();

	// Инициализация кнопки сдаться
	const surrenderBtn = document.getElementById('surrenderBtn');
	const surrenderConfirmModalOverlay = document.getElementById('surrenderConfirmModalOverlay');
	const surrenderModalConfirmBtn = document.getElementById('surrenderModalConfirmBtn');
	const surrenderModalCancelBtn = document.getElementById('surrenderModalCancelBtn');

	if (surrenderBtn) {
		surrenderBtn.addEventListener('click', () => {
			if (surrenderConfirmModalOverlay && !gameEnded) {
				surrenderConfirmModalOverlay.style.display = 'flex';
			}
		});
	}

	if (surrenderModalConfirmBtn) {
		surrenderModalConfirmBtn.addEventListener('click', () => {
			fullGameReset();
		});
	}

	if (surrenderModalCancelBtn) {
		surrenderModalCancelBtn.addEventListener('click', () => {
			if (surrenderConfirmModalOverlay) {
				surrenderConfirmModalOverlay.style.display = 'none';
			}
		});
	}

	// Закрытие по клику вне окна
	if (surrenderConfirmModalOverlay) {
		surrenderConfirmModalOverlay.addEventListener('click', (event) => {
			if (event.target === surrenderConfirmModalOverlay) {
				surrenderConfirmModalOverlay.style.display = 'none';
			}
		});
	}
	
	const statsBackToMenuBtn = document.getElementById('statsBackToMenuBtn');
	if (statsBackToMenuBtn) {
		statsBackToMenuBtn.addEventListener('click', () => {
			const gameStatsModal = document.getElementById('gameStatsModal');
			if (gameStatsModal) gameStatsModal.style.display = 'none';
			fullGameReset();
		});
	}
	
	// Инициализация кнопки обновления магазина
	if(refreshShopBtn && !isRefreshButtonInitialized) {
		refreshShopBtn.addEventListener('click', () => {
			if (gameEnded || currentPhase !== 'purchase') return;
			if(typeof handleRefreshShopButtonClick === 'function') handleRefreshShopButtonClick();
		});
		isRefreshButtonInitialized = true;
	}
	
	// Ifrit кнопка для тестирования
	//	const testIfritBtn = document.getElementById('testIfritBtn');
	//	if (testIfritBtn) {
	//		testIfritBtn.addEventListener('click', () => {
	//			if (gameEnded || currentPhase !== 'purchase') {
	//				addLogEntry("Разместить Ifrit можно только в фазу покупки!", "warning");
	//				return;
	//			}
	//			
	//			// Ищем свободную клетку для размещения
	//			let placed = false;
	//			for (const cell of easyPlacementCells) {
	//				if (!isCellOccupied(cell[0], cell[1])) {
	//					// Размещаем обычную версию Ifrit (ID: 74)
	//					const ifrit = new Operator(cell[0], cell[1], "74");
	//					placedOperators.push(ifrit);
	//					addLogEntry(`TEST: Ifrit размещен в [${cell[0] + 1}, ${cell[1] + 1}]`, 'success');
	//					placed = true;
	//					
	//					if (typeof drawGame === 'function') drawGame();
	//					if (typeof updateShopAvailabilityInfo === 'function') updateShopAvailabilityInfo();
	//					break;
	//				}
	//			}
	//			
	//			if (!placed) {
	//				addLogEntry("Нет свободных клеток для размещения Ifrit!", "warning");
	//			}
	//		});
	//	} //конец кнопки теста
}});

function checkIfAnyOperatorCanStillAttack() {
    if (!placedOperators || !activeEnemies) return false;
    for (const operator of placedOperators) {
        if (operator.attackTokensCurrent > 0) {
            if (operator.role === "Ifrit") {
                const livingEnemies = activeEnemies.filter(e => !e.isDefeated && !e.reachedEnd);
                if (livingEnemies.length > 0) return true; 
            } else {
                for (const enemy of activeEnemies) {
                    if (!enemy.isDefeated && !enemy.reachedEnd) {
                        if (operator.isInRange(enemy.pixelX, enemy.pixelY) &&
                            hasLineOfSight(operator, enemy)) {
                            return true; 
                        }
                    }
                }
            }
        }
    }
    return false; 
}

// Функция запуска таймера
function startGameTimer() {
    gameStartTime = Date.now();
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    
    gameTimerInterval = setInterval(updateGameTimer, 1000);
    updateGameTimer(); // Сразу обновляем
}

// Функция обновления таймера
function updateGameTimer() {
    if (!gameStartTime || !gameTimerElement) return;
    
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    gameTimerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Функция остановки таймера
function stopGameTimer() {
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }
}

// Функция сброса игры
function resetToStartScreen() {
    // Останавливаем игру
    gameEnded = true;
    stopGameTimer();
    
    // Очищаем интервалы
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
	
	// Дополнительная защита - отменяем все возможные анимационные кадры
    let id = window.requestAnimationFrame(() => {});
    while (id--) {
        window.cancelAnimationFrame(id);
    }
	
	 // Сбрасываем масштаб
    zoomLevel = 1.0;
    
    // Сбрасываем игровые переменные
    gameLMD = 480;
    gameBaseHp = INITIAL_BASE_HP;
    gameRound = 1;
    gameBattle = 1;
    placedOperators.length = 0;
    activeEnemies.length = 0;
    currentWaveDeck = [];
    currentBossId = null;
    bossSpawnedThisBattle = false;
    bossesDefeatedCount = 0;
    isBreakPeriodActive = false;
    breakRoundsLeft = 0;
    battleToLoadAfterBreak = 0;
    nextWaveEnemiesCanSpawn = false;
    unlockedTier3Count = 0;
    unlockedTier4Count = 0;
    selectedOperator = null;
    targetingMode = false;
    heldOperatorId = null;
    placementMode = false;
    hoveredOperatorInfo = null;
    hoveredShopOperatorInfoId = null;
    hoveredUpgradeButtonOp = null;
    hoveredEnemyInfo = null;
    selectedShopOperatorId = null;
    selectingDeckToRefresh = false;
    currentPhase = 'purchase';
    mapLoaded = false;
    mapImage = null;
    
    // Сбрасываем выбор карты
    selectedMapName = null;
    currentMapData = null;
	
	//сброс статистики
	totalLmdSpent = 0;
	totalOperatorsBought = 0;
	operatorDamageStats = {};
    
    // Очищаем лог
    if (logEntriesDiv) logEntriesDiv.innerHTML = '';
    
    // Сбрасываем UI
    if (heldOperatorInfo) {
        heldOperatorInfo.textContent = '';
        heldOperatorInfo.style.display = 'none';
    }
    if (gameStatusMessage) gameStatusMessage.style.display = 'none';
    if (tooltipElement) tooltipElement.style.display = 'none';
    
    // Скрываем модальные окна
    if (upgradeConfirmModalOverlay) upgradeConfirmModalOverlay.style.display = 'none';
    if (sellConfirmModalOverlay) sellConfirmModalOverlay.style.display = 'none';
    if (surrenderConfirmModalOverlay) surrenderConfirmModalOverlay.style.display = 'none';
    
    // Показываем начальный экран
    if (startScreen) startScreen.style.display = 'flex';
    if (gameInterface) gameInterface.style.display = 'none';
    
    // Сбрасываем выбор карты
    const mapCards = document.querySelectorAll('.map-card');
    mapCards.forEach(card => card.classList.remove('selected'));
    if (startGameBtn) startGameBtn.disabled = true;
    
    // Сбрасываем состояние канваса
    if (canvas) canvas.style.cursor = 'default';
	
	// Восстанавливаем обработчики событий канваса
    if (canvas) {
        canvas.style.pointerEvents = 'auto'; // Важно! Восстанавливаем взаимодействие
        canvas.style.cursor = 'default';
        
        // Удаляем старые обработчики
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('mousemove', handleCanvasMouseMove);
        canvas.removeEventListener('mouseleave', handleCanvasMouseLeave);
    }
    
    // Сбрасываем менеджер фазы врагов
    if (typeof enemyPhaseManager !== 'undefined') {
        enemyPhaseManager.isInitializedForTurn = false;
        enemyPhaseManager.state = 'idle';
        enemyPhaseManager.existingEnemiesToProcess = [];
        enemyPhaseManager.currentExistingEnemyIndex = -1;
        enemyPhaseManager.currentMovingEnemy = null;
        enemyPhaseManager.numNewEnemiesToSpawnThisTurn = 0;
        enemyPhaseManager.newEnemiesSpawnedCount = 0;
    }
    
	// Сбрасываем состояние кнопки обновления магазина
    selectingDeckToRefresh = false;
    if (refreshShopBtn) {
        refreshShopBtn.disabled = false;
        refreshShopBtn.textContent = `Обновить (${REFRESH_COST} LMD)`;
    }
	
    gameEnded = false;
}

function showGameStats(isVictory) {
    const gameStatsModal = document.getElementById('gameStatsModal');
    if (!gameStatsModal) {
        console.error("gameStatsModal не найден!");
        return;
    }
    
    const gameStatsTitle = document.getElementById('gameStatsTitle');
    const statsStars = document.getElementById('statsStars');
    const statsRounds = document.getElementById('statsRounds');
    const statsBaseHp = document.getElementById('statsBaseHp');
    const statsTime = document.getElementById('statsTime');
    const statsLmdSpent = document.getElementById('statsLmdSpent');
    const statsOperatorsBought = document.getElementById('statsOperatorsBought');
    const statsTopDamage = document.getElementById('statsTopDamage');
    
    // Заголовок
    if (gameStatsTitle) {
        gameStatsTitle.textContent = isVictory ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ';
        gameStatsTitle.className = `text-4xl font-bold mb-2 ${isVictory ? 'text-green-400 animate-pulse' : 'text-red-400'}`;
    }
    
    // Рейтинг звездами
    if (statsStars) {
        statsStars.innerHTML = '';
        if (isVictory) {
            let stars = 1;
            if (gameBaseHp >= INITIAL_BASE_HP * 0.8) stars++;
            if (gameBaseHp === INITIAL_BASE_HP) stars++;
            
            for (let i = 0; i < 3; i++) {
                const star = document.createElement('span');
                star.className = 'rating-star';
                star.textContent = i < stars ? '⭐' : '☆';
                statsStars.appendChild(star);
            }
        }
    }
    
    // Основная статистика
    if (statsRounds) statsRounds.textContent = gameRound;
    if (statsBaseHp) statsBaseHp.textContent = `${Math.max(0, gameBaseHp)}/${INITIAL_BASE_HP}`;
    
    // Время игры
    if (statsTime && gameStartTime) {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        statsTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (statsLmdSpent) statsLmdSpent.textContent = totalLmdSpent;
    if (statsOperatorsBought) statsOperatorsBought.textContent = totalOperatorsBought;
    
    // Топ 3 оператора
    if (statsTopDamage) {
        const sortedOperators = Object.entries(operatorDamageStats)
            .sort((a, b) => b[1].damage - a[1].damage)
            .slice(0, 3);
        
        statsTopDamage.innerHTML = '';
        if (sortedOperators.length === 0) {
            statsTopDamage.innerHTML = '<p class="text-gray-400">Нет данных об уроне</p>';
        } else {
            const maxDamage = sortedOperators[0][1].damage || 1;
            sortedOperators.forEach((op, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                const percentage = (op[1].damage / maxDamage) * 100;
                statsTopDamage.innerHTML += `
                    <div class="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
                        <span class="text-2xl">${medal}</span>
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-1">
                                <span class="font-medium">${op[1].name}</span>
                                <span class="font-bold text-orange-400">${op[1].damage}</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-1000 ease-out" 
                                     style="width: ${percentage}%;">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    }
    
    // Показываем модальное окно
    console.log("Показываем окно статистики");
    gameStatsModal.style.display = 'flex';
}

function fullGameReset() {
    // Закрываем все модальные окна
    const gameStatsModal = document.getElementById('gameStatsModal');
    if (gameStatsModal) gameStatsModal.style.display = 'none';
    if (surrenderConfirmModalOverlay) surrenderConfirmModalOverlay.style.display = 'none';
    
    // Вызываем общий сброс
    resetToStartScreen();
}