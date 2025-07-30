// shop_module.js (Логика магазина и продажи)

let shopDecks = [[], [], [], [], [], [], [], []];
let unlockedTier3Count = 0;
let unlockedTier4Count = 0;
let selectingDeckToRefresh = false;
let selectedShopOperatorId = null; // ID выбранного в магазине оператора
let isRefreshButtonInitialized = false;

const CLASS_ABBREVIATIONS = {
    "Supporter": "Supp",
    "Caster": "Cast",
    "Caster AOE": "AOECast",
    "Sniper": "Sniper",
    "Ifrit": "Ifrit",
    "Guard": "Guard",
    "Defender": "Def",
    "Specialist": "Specialist"
};

// Константы LEFT_DECK_ROLES_BASE и RIGHT_DECK_ROLES_BASE 
// определены и используются из game_setup_classes.js

function getDeckRolesDisplay(tier, sideIndex) {
    let rolesToShow = [];
    if (sideIndex === 0) { // Левая колода
        rolesToShow = [...LEFT_DECK_ROLES_BASE]; 
        if (tier === 4) {
            if (!rolesToShow.includes("Ifrit")) {
                rolesToShow.push("Ifrit");
            }
        }
    } else { // Правая колода
        rolesToShow = [...RIGHT_DECK_ROLES_BASE]; 
        if (!rolesToShow.includes("Specialist")) {
             rolesToShow.push("Specialist");
        }
    }
    return rolesToShow.map(role => CLASS_ABBREVIATIONS[role] || role).join('/');
}


function initializeShop() {
    shopDecks = [[], [], [], [], [], [], [], []];
    for (const id in ALL_OPERATORS_DATA) {
        const data = getOperatorData(id);
        if (!data || data.isElite) continue;

        const tierIndex = data.tier - 1;
        let deckIndex = -1;

        if (data.role === "Ifrit") {
            if (data.tier === 4) {
                deckIndex = (4 - 1) * 2 + 0;
            } else {
                continue;
            }
        } else if (LEFT_DECK_ROLES_BASE.includes(data.role)) { 
            deckIndex = tierIndex * 2;
        } else if (RIGHT_DECK_ROLES_BASE.includes(data.role) || (data.role && data.role.startsWith("Specialist"))) { 
            deckIndex = tierIndex * 2 + 1;
        }

        if (deckIndex !== -1 && deckIndex >=0 && deckIndex < shopDecks.length) {
            shopDecks[deckIndex].push(id);
        } else if (data.role !== "Ifrit") {
            console.warn(`Оператор ${data.name} (ID: ${id}, Роль: ${data.role}, Тир: ${data.tier}) не попал ни в одну колоду.`);
        }
    }
    shopDecks.forEach(deck => {
        if (typeof shuffleArray === 'function') shuffleArray(deck); 
        else console.error("shuffleArray не определена в initializeShop");
    });
    if(typeof addLogEntry === 'function') addLogEntry("Магазин инициализирован.", "game_state");
    renderShop();
}

function renderShop() {
    if (!shopDecksContainer || (typeof gameEnded !== 'undefined' && gameEnded)) {
        return;
    }
    shopDecksContainer.innerHTML = '';
    if (typeof updateShopAvailabilityInfo === 'function') updateShopAvailabilityInfo(); 
    else console.error("updateShopAvailabilityInfo не определена в renderShop");


    for (let tier = 1; tier <= 4; tier++) {
        const deckRow = document.createElement('div');
        deckRow.className = 'deck-row-custom';

        for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
            const deckIndex = (tier - 1) * 2 + sideIndex;
            const deck = shopDecks[deckIndex];

            const deckRolesDisplay = getDeckRolesDisplay(tier, sideIndex);

            const deckContainer = document.createElement('div');
            deckContainer.className = 'deck-container-custom';
            deckContainer.dataset.deckIndex = deckIndex;

            const title = document.createElement('div');
            title.className = `shop-card-title-custom tier-text-${tier}`;

            const tierSpan = document.createElement('span');
            tierSpan.className = `tier-text-${tier}`;
            tierSpan.textContent = `Ур.${tier} `;

            const rolesSpan = document.createElement('span');
            rolesSpan.className = 'deck-roles-text-color';
            rolesSpan.textContent = `(${deckRolesDisplay || 'Классы'})`;

            title.appendChild(tierSpan);
            title.appendChild(rolesSpan);
            deckContainer.appendChild(title);

            const cardElement = document.createElement('div');
            const operatorId = deck.length > 0 ? deck[0] : null;
            let operatorData = null;
            let isPurchaseable = false;

            if (operatorId) {
                operatorData = getOperatorData(operatorId);
                if (operatorData) {
                    cardElement.className = 'shop-card';
					if (selectedShopOperatorId === operatorId && placementMode) {
						cardElement.classList.add('selected-shop-card');
					}
                    isPurchaseable = checkOperatorPurchaseability(operatorData);
                    
                    const imagePath = operatorData.imageSrc.replace(/\\/g, '/'); // Используем старый replace, так как он здесь безопасен для строк
                    cardElement.dataset.operatorId = operatorId;

                    cardElement.innerHTML = `
                        <div class="shop-card-info-btn" data-op-id-info="${operatorId}">?</div>
                        <img src="${imagePath}" alt="${operatorData.name}" onerror="this.style.display='none'; cardElement.textContent='${operatorData.name}';">
                        <div class="info-overlay">
                            <span class="op-name">${operatorData.name}</span>
                            <span class="op-cost">${operatorData.cost} LMD</span>
                        </div>
                    `;

                    if (!isPurchaseable) {
                        cardElement.classList.add('disabled');
                        if (operatorData.tier > 2 && (operatorData.tier === 3 ? placedOperators.filter(op_1 => getOperatorData(op_1.id)?.tier === 3).length >= unlockedTier3Count : placedOperators.filter(op_2 => getOperatorData(op_2.id)?.tier === 4).length >= unlockedTier4Count)) {
                           cardElement.title = `Лимит операторов Ур.${operatorData.tier} достигнут или уровень не разблокирован.`;
                        } else if (gameLMD < operatorData.cost) {
                            cardElement.title = `Недостаточно LMD (нужно ${operatorData.cost})`;
                        } else if (placedOperators.length >= MAX_OPERATORS_ON_FIELD) {
                            cardElement.title = `Нет места на поле (макс. ${MAX_OPERATORS_ON_FIELD})`;
                        }
                    }

                    if (isPurchaseable && currentPhase === 'purchase') {
                        cardElement.addEventListener('click', (event) => {
                            if (event.target.classList.contains('shop-card-info-btn')) {
                                return;
                            }
                            // handleShopCardClick - глобальная функция из ui_interactions.js
                            if (typeof handleShopCardClick === 'function') handleShopCardClick(event);
                        });
                    } else {
                        if (!cardElement.classList.contains('disabled')) {
                            cardElement.classList.add('disabled');
                        }
                    }
                } else {
                     cardElement.className = 'shop-card-placeholder';
                     cardElement.textContent = 'Ошибка данных';
                }
            } else {
                 cardElement.className = 'shop-card-placeholder';
                 cardElement.textContent = 'Пусто';
            }
            deckContainer.appendChild(cardElement);

            if (currentPhase === 'purchase' && selectingDeckToRefresh) {
                if (deck.length > 1) {
                    deckContainer.classList.add('refresh-highlight');
                    deckContainer.style.cursor = 'pointer';
                    deckContainer.addEventListener('click', handleDeckRefreshClickEvent);
                } else {
                    deckContainer.style.cursor = 'not-allowed';
                }
            } else {
                deckContainer.style.cursor = 'default';
            }
            deckRow.appendChild(deckContainer);
        }
        shopDecksContainer.appendChild(deckRow);
    }
    if (typeof attachShopInfoButtonListeners === 'function') attachShopInfoButtonListeners(); 
    else console.error("attachShopInfoButtonListeners не определена в renderShop");
}

function checkOperatorPurchaseability(operatorData) {
    if (!operatorData) return false;
    let tierAllowed = false;
    if (operatorData.tier <= 2) {
        tierAllowed = true;
    } else if (operatorData.tier === 3) {
        const placedTier3 = placedOperators.filter(op => getOperatorData(op.id)?.tier === 3).length;
        tierAllowed = placedTier3 < unlockedTier3Count;
    } else if (operatorData.tier === 4) {
        const placedTier4 = placedOperators.filter(op => getOperatorData(op.id)?.tier === 4).length;
        tierAllowed = placedTier4 < unlockedTier4Count;
    }
    // Убедимся, что глобальные переменные доступны
    const currentLMD = (typeof gameLMD !== 'undefined') ? gameLMD : 0;
    const currentPlacedOperatorsLength = (typeof placedOperators !== 'undefined') ? placedOperators.length : MAX_OPERATORS_ON_FIELD;

    const costAllowed = currentLMD >= operatorData.cost;
    const fieldSpaceAvailable = currentPlacedOperatorsLength < MAX_OPERATORS_ON_FIELD;
    
    return tierAllowed && costAllowed && fieldSpaceAvailable;
}

function updateShopAvailabilityInfo() {
    if (!shopAvailabilityInfo) return;
    let info = "Доступно: Ур. 1, Ур. 2";
    const placedTier3 = placedOperators.filter(op => getOperatorData(op.id)?.tier === 3).length;
    const remainingTier3 = unlockedTier3Count - placedTier3;
    if (unlockedTier3Count > 0) info += `, Ур. 3 (ост. ${Math.max(0,remainingTier3)} из ${unlockedTier3Count})`;

    const placedTier4 = placedOperators.filter(op => getOperatorData(op.id)?.tier === 4).length;
    const remainingTier4 = unlockedTier4Count - placedTier4;
    if (unlockedTier4Count > 0) info += `, Ур. 4 (ост. ${Math.max(0,remainingTier4)} из ${unlockedTier4Count})`;

    shopAvailabilityInfo.textContent = info;
}

function handleDeckRefreshClickEvent(event) {
    if (gameEnded || currentPhase !== 'purchase' || !selectingDeckToRefresh) return;
    const deckContainer = event.currentTarget.closest('.deck-container-custom');
    if (!deckContainer) return;
    const deckIndex = parseInt(deckContainer.dataset.deckIndex, 10);
    if (isNaN(deckIndex) || deckIndex < 0 || deckIndex >= shopDecks.length) return;

    if (gameLMD < REFRESH_COST) {
       if(typeof addLogEntry === 'function') addLogEntry(`Недостаточно LMD для обновления колоды (нужно ${REFRESH_COST}).`, 'warning');
       selectingDeckToRefresh = false;
       if(refreshShopBtn) {
           refreshShopBtn.disabled = false;
           refreshShopBtn.textContent = `Обновить (${REFRESH_COST} LMD)`;
       }
       renderShop();
       return;
    }

    gameLMD -= REFRESH_COST;
    if(shopLmdCounterSpan) shopLmdCounterSpan.textContent = gameLMD;
    if(typeof addLogEntry === 'function') addLogEntry(`Потрачено ${REFRESH_COST} LMD.`, 'action');

    const deck = shopDecks[deckIndex];
    const tier = Math.floor(deckIndex / 2) + 1;
    const sideDisplay = getDeckRolesDisplay(tier, deckIndex % 2);


    if (deck.length > 1) {
       const topCard = deck.shift();
       deck.push(topCard);
       if(typeof addLogEntry === 'function') addLogEntry(`Обновлена колода Ур.${tier} (${sideDisplay}).`, 'action');
    } else {
       if(typeof addLogEntry === 'function') addLogEntry(`В колоде Ур.${tier} (${sideDisplay}) недостаточно карт для обновления. LMD все равно списаны.`, 'warning');
    }

    selectingDeckToRefresh = false;
    if(refreshShopBtn) {
       refreshShopBtn.disabled = false;
       refreshShopBtn.textContent = `Обновить (${REFRESH_COST} LMD)`;
    }
    renderShop();
}

function findDeckIndexByOperatorId(operatorId) {
   for (let i = 0; i < shopDecks.length; i++) {
       if (shopDecks[i].length > 0 && shopDecks[i][0] === operatorId) {
           return i;
       }
   }
   return -1;
}

function handleRefreshShopButtonClick() {
   if (gameEnded || currentPhase !== 'purchase') return;
	
   if (selectingDeckToRefresh) {
       selectingDeckToRefresh = false;
       if(refreshShopBtn) {
           refreshShopBtn.disabled = false;
           refreshShopBtn.textContent = `Обновить (${REFRESH_COST} LMD)`;
       }
       if(typeof addLogEntry === 'function') addLogEntry("Выбор колоды для обновления отменен.", "info");
       renderShop();
       return;
   }

   if (gameLMD < REFRESH_COST) {
       if(typeof addLogEntry === 'function') addLogEntry(`Недостаточно LMD для обновления (нужно ${REFRESH_COST}).`, 'warning');
       return;
   }

   if(typeof addLogEntry === 'function') addLogEntry(`Выберите колоду для обновления (стоимость ${REFRESH_COST} LMD).`, 'action');
   selectingDeckToRefresh = true;
   if(refreshShopBtn) {
       refreshShopBtn.textContent = 'Отмена Выбора';
       refreshShopBtn.disabled = false;
   }
   renderShop();
}

function getOperatorSellValue(operator) {
   if (!operator) return 0;
   let sellPrice = Math.floor(operator.currentCost / 2);
   sellPrice = Math.floor(sellPrice / 5) * 5;
   return Math.max(0, sellPrice);
}

function sellOperator(operatorToSell) {
   if (!operatorToSell || currentPhase !== 'purchase') return;
   const sellValue = getOperatorSellValue(operatorToSell);
   const operatorName = operatorToSell.name;
   const operatorId = operatorToSell.id; // Сохраняем ID проданного оператора
   
   const index = placedOperators.indexOf(operatorToSell);
   if (index > -1) {
       placedOperators.splice(index, 1);
   } else {
       console.error("Ошибка: Попытка продать оператора, который не найден в placedOperators.");
       return;
   }
   
   gameLMD += sellValue;
   if (shopLmdCounterSpan) shopLmdCounterSpan.textContent = gameLMD;
   if(typeof addLogEntry === 'function') addLogEntry(`Продан ${operatorName} за ${sellValue} LMD.`, 'action');
   
   // Возвращаем проданного оператора в соответствующую колоду
   const operatorData = getOperatorData(operatorId);
   if (operatorData && !operatorData.isElite) { // Только не-элитные версии возвращаются в магазин
       let deckIndex = -1;
       const tierIndex = operatorData.tier - 1;
       
       if (operatorData.role === "Ifrit" && operatorData.tier === 4) {
           deckIndex = (4 - 1) * 2 + 0;
       } else if (LEFT_DECK_ROLES_BASE.includes(operatorData.role)) {
           deckIndex = tierIndex * 2;
       } else if (RIGHT_DECK_ROLES_BASE.includes(operatorData.role) || (operatorData.role && operatorData.role.startsWith("Specialist"))) {
           deckIndex = tierIndex * 2 + 1;
       }
       
       if (deckIndex !== -1 && deckIndex >= 0 && deckIndex < shopDecks.length) {
           shopDecks[deckIndex].push(operatorId); // Добавляем в конец колоды
           if(typeof addLogEntry === 'function') addLogEntry(`${operatorName} возвращен в колоду магазина.`, 'info');
       }
   }
   
   updateShopAvailabilityInfo();
   renderShop(); 
   
   
   if (selectedOperator === operatorToSell) {
       selectedOperator.isSelected = false;
       selectedOperator = null;
       targetingMode = false;
       aoeMainTarget = null; aoeSplashTargets = [];
       specialistHoverTarget = null; specialistSwapTarget = null;
       ifritAttackLine = null; ifritLineTargets = [];
       activeEnemies.forEach(e => {
           e.isTargeted = false;
           e.isAoeMainTarget = false; e.isAoeSplashTarget = false;
           e.isSpecialistTarget = false; e.isSpecialistSwapTarget = false;
           e.isIfritTarget = false;
       });
       if(canvas) canvas.style.cursor = 'default';
   }
   if(typeof drawGame === 'function') drawGame();
}

function getShopOperatorTooltipHTML(operatorId) {
   const data = getOperatorData(operatorId);
   if (!data) return "Данные не найдены";
   
   let html = `<strong>${data.name}</strong> (${data.role})<br>`;
   html += `Уровень: ${data.tier}${data.isElite ? ' (Elite)' : ''}<br>`;
   
   let attackDisplay = data.attack;
   if (typeof data.attack === 'string') {
       attackDisplay = data.attack;
   } else if (typeof data.attack === 'number') {
       attackDisplay = data.attack;
   }
   
   html += `Атака: ${attackDisplay} | Дальность: ${data.range === "all line" ? "Линия" : data.range}<br>`;
   html += `Жетоны: ${data.attackTokens}<br>`;
   
   if (data.ability) {
       if (data.ability.type === 'slow' && data.slow) { 
           html += `Замедление: ${data.slow}<br>`; 
       }
       else if (data.ability.type === 'stun') { 
           html += `Оглушение: ${data.ability.duration} раунд<br>`; 
       }
       else if (data.ability.type === 'pull') { 
           html += `Притягивание: ${data.ability.power} кл.<br>`; 
       }
       else if (data.ability.type === 'push') { 
           html += `Отталкивание: ${data.ability.power} кл.<br>`; 
       }
   }
   
   html += `Стоимость: ${data.cost} LMD`;
   
   // Добавляем информацию об Elite версии
   if (!data.isElite && data.eliteVersion) {
       const eliteData = getOperatorData(data.eliteVersion);
       if (eliteData) {
           html += `<br><br><strong style="color: #facc15;">Elite версия:</strong><br>`;
           html += `Улучшение: ${eliteData.cost} LMD<br>`;
           
           let eliteAttackDisplay = eliteData.attack;
           if (typeof eliteData.attack === 'string') {
               eliteAttackDisplay = eliteData.attack;
           } else if (typeof eliteData.attack === 'number') {
               eliteAttackDisplay = eliteData.attack;
           }
           
           html += `Атака: ${eliteAttackDisplay} | Дальность: ${eliteData.range === "all line" ? "Линия" : eliteData.range}<br>`;
           html += `Жетоны: ${eliteData.attackTokens}`;
           
           if (eliteData.ability) {
               if (eliteData.ability.type === 'slow' && eliteData.slow) { 
                   html += `<br>Замедление: ${eliteData.slow}`; 
               }
               else if (eliteData.ability.type === 'stun') { 
                   html += `<br>Оглушение: ${eliteData.ability.duration} раунд`; 
               }
               else if (eliteData.ability.type === 'pull') { 
                   html += `<br>Притягивание: ${eliteData.ability.power} кл.`; 
               }
               else if (eliteData.ability.type === 'push') { 
                   html += `<br>Отталкивание: ${eliteData.ability.power} кл.`; 
               }
           }
       }
   }
   
   return html;
}

function attachShopInfoButtonListeners() {
   document.querySelectorAll('.shop-card-info-btn').forEach(button => {
       button.addEventListener('mouseenter', (event) => {
           if ((typeof gameEnded !== 'undefined' && gameEnded) || !tooltipElement) return;
           const operatorId = event.target.dataset.opIdInfo;
           if (operatorId) {
               tooltipElement.innerHTML = getShopOperatorTooltipHTML(operatorId);
               tooltipElement.style.display = 'block';
               const rect = event.target.getBoundingClientRect();
               tooltipElement.style.left = `${rect.right + 5}px`;
               tooltipElement.style.top = `${rect.top}px`;
               const tooltipRect = tooltipElement.getBoundingClientRect();
               if (tooltipRect.right > window.innerWidth) {
                   tooltipElement.style.left = `${rect.left - tooltipRect.width - 5}px`;
               }
               if (tooltipRect.bottom > window.innerHeight) {
                   tooltipElement.style.top = `${rect.bottom - tooltipRect.height}px`;
               }
                if (tooltipRect.top < 0) {
                   tooltipElement.style.top = `0px`;
               }
           }
       });
       button.addEventListener('mouseleave', () => {
           if (tooltipElement) tooltipElement.style.display = 'none';
       });
   });
}