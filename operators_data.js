// operators_data.js

// Полный объект данных для всех операторов, извлеченный из CSV.
// Ключ - ID оператора (обычно соответствует имени файла без расширения).
// Значение - объект с характеристиками оператора.

const ALL_OPERATORS_DATA = {
    // --- Уровень 1 ---
    "1": { tier: 1, name: "KROOS", role: "Sniper", cost: 25, range: 1, attack: 1, attackTokens: 2, slow: null, imageSrc: "img/operators/1.png", eliteVersion: "1-2", ability: null },
    "1-2": { tier: 1, name: "KROOS Elite", role: "Sniper", cost: 50, range: 1, attack: 3, attackTokens: 2, slow: null, imageSrc: "img/operators/1-2.png", isElite: true, ability: null },
    "2": { tier: 1, name: "CATAPULT", role: "Sniper", cost: 50, range: 2, attack: 1, attackTokens: 2, slow: null, imageSrc: "img/operators/2.png", eliteVersion: "2-2", ability: null },
    "2-2": { tier: 1, name: "CATAPULT Elite", role: "Sniper", cost: 75, range: 2, attack: 3, attackTokens: 2, slow: null, imageSrc: "img/operators/2-2.png", isElite: true, ability: null },
    "3": { tier: 1, name: "JESSICA", role: "Sniper", cost: 50, range: 1, attack: 2, attackTokens: 2, slow: null, imageSrc: "img/operators/3.png", eliteVersion: "3-2", ability: null },
    "3-2": { tier: 1, name: "JESSICA Elite", role: "Sniper", cost: 75, range: 1, attack: 4, attackTokens: 2, slow: null, imageSrc: "img/operators/3-2.png", isElite: true, ability: null },
    "10": { tier: 1, name: "Melantha", role: "Guard", cost: 25, range: 1, attack: 2, attackTokens: 1, slow: null, imageSrc: "img/operators/10.png", eliteVersion: "10-2", ability: null },
    "10-2": { tier: 1, name: "Melantha Elite", role: "Guard", cost: 50, range: 1, attack: 5, attackTokens: 1, slow: null, imageSrc: "img/operators/10-2.png", isElite: true, ability: null },
    "11": { tier: 1, name: "Midnight", role: "Guard", cost: 25, range: 2, attack: 1, attackTokens: 1, slow: null, imageSrc: "img/operators/11.png", eliteVersion: "11-2", ability: null },
    "11-2": { tier: 1, name: "Midnight Elite", role: "Guard", cost: 50, range: 2, attack: 3, attackTokens: 1, slow: null, imageSrc: "img/operators/11-2.png", isElite: true, ability: null },
    "12": { tier: 1, name: "Popukar", role: "Guard", cost: 25, range: 1, attack: 1, attackTokens: 2, slow: null, imageSrc: "img/operators/12.png", eliteVersion: "12-2", ability: null },
    "12-2": { tier: 1, name: "Popukar Elite", role: "Guard", cost: 50, range: 1, attack: 3, attackTokens: 2, slow: null, imageSrc: "img/operators/12-2.png", isElite: true, ability: null },
    "65": { tier: 1, name: "Lava", role: "Caster AOE", cost: 30, range: 1, attack: "1(1)", attackTokens: 1, slow: null, imageSrc: "img/operators/65.png", eliteVersion: "65-2", ability: null },
    "65-2": { tier: 1, name: "Lava Elite", role: "Caster AOE", cost: 50, range: 1, attack: "3(1)", attackTokens: 1, slow: null, imageSrc: "img/operators/65-2.png", isElite: true, ability: null },
    "64": { tier: 1, name: "12F", role: "Caster AOE", cost: 30, range: 1, attack: "1(1)", attackTokens: 1, slow: null, imageSrc: "img/operators/64.png", eliteVersion: "64-2", ability: null },
    "64-2": { tier: 1, name: "12F Elite", role: "Caster AOE", cost: 50, range: 1, attack: "3(1)", attackTokens: 1, slow: null, imageSrc: "img/operators/64-2.png", isElite: true, ability: null },
    "67": { tier: 1, name: "Steward", role: "Caster", cost: 50, range: 1, attack: "2x2", attackTokens: 1, slow: null, imageSrc: "img/operators/67.png", eliteVersion: "67-2", ability: null },
    "67-2": { tier: 1, name: "Steward Elite", role: "Caster", cost: 75, range: 1, attack: "4x2", attackTokens: 1, slow: null, imageSrc: "img/operators/67-2.png", isElite: true, ability: null },
    "63": { tier: 1, name: "Durin", role: "Caster", cost: 25, range: 1, attack: "1x2", attackTokens: 1, slow: null, imageSrc: "img/operators/63.png", eliteVersion: "63-2", ability: null },
    "63-2": { tier: 1, name: "Durin Elite", role: "Caster", cost: 50, range: 1, attack: "3x2", attackTokens: 1, slow: null, imageSrc: "img/operators/63-2.png", isElite: true, ability: null },
    "62": { tier: 1, name: "Deepcolor", role: "Supporter", cost: 50, range: 1, attack: 2, attackTokens: 1, slow: 1, imageSrc: "img/operators/62.png", eliteVersion: "62-2", ability: { type: "slow", power: 1, duration: 1 } },
    "62-2": { tier: 1, name: "Deepcolor Elite", role: "Supporter", cost: 75, range: 1, attack: 3, attackTokens: 1, slow: 2, imageSrc: "img/operators/62-2.png", isElite: true, ability: { type: "slow", power: 1, duration: 1 } },
    "66": { tier: 1, name: "Orchid", role: "Supporter", cost: 50, range: 1, attack: 2, attackTokens: 1, slow: 1, imageSrc: "img/operators/66.png", eliteVersion: "66-2", ability: { type: "slow", power: 1, duration: 1 } },
    "66-2": { tier: 1, name: "Orchid Elite", role: "Supporter", cost: 75, range: 1, attack: 3, attackTokens: 1, slow: 2, imageSrc: "img/operators/66-2.png", isElite: true, ability: { type: "slow", power: 1, duration: 1 } },
    "37": { tier: 1, name: "Beagle", role: "Defender", cost: 50, range: 1, attack: 1, attackTokens: 1, slow: null, imageSrc: "img/operators/37.png", eliteVersion: "37-2", ability: { type: "stun", duration: 1 } },
    "37-2": { tier: 1, name: "Beagle Elite", role: "Defender", cost: 75, range: 2, attack: 4, attackTokens: 1, slow: null, imageSrc: "img/operators/37-2.png", isElite: true, ability: { type: "stun", duration: 1 } },
    "39": { tier: 1, name: "Cardigan", role: "Defender", cost: 50, range: 1, attack: 1, attackTokens: 1, slow: null, imageSrc: "img/operators/39.png", eliteVersion: "39-2", ability: { type: "stun", duration: 1 } },
    "39-2": { tier: 1, name: "Cardigan Elite", role: "Defender", cost: 75, range: 2, attack: 4, attackTokens: 1, slow: null, imageSrc: "img/operators/39-2.png", isElite: true, ability: { type: "stun", duration: 1 } },
    "38": { tier: 1, name: "Noir Corne", role: "Defender", cost: 50, range: 1, attack: 1, attackTokens: 1, slow: null, imageSrc: "img/operators/38.png", eliteVersion: "38-2", ability: { type: "stun", duration: 1 } },
    "38-2": { tier: 1, name: "Noir Corne Elite", role: "Defender", cost: 75, range: 2, attack: 4, attackTokens: 1, slow: null, imageSrc: "img/operators/38-2.png", isElite: true, ability: { type: "stun", duration: 1 } },

    // --- Уровень 2 ---
    "5": { tier: 2, name: "Meteor", role: "Sniper", cost: 75, range: 1, attack: 3, attackTokens: 2, slow: null, imageSrc: "img/operators/5.png", eliteVersion: "5-2", ability: null },
    "5-2": { tier: 2, name: "Meteor Elite", role: "Sniper", cost: 100, range: 1, attack: 4, attackTokens: 3, slow: null, imageSrc: "img/operators/5-2.png", isElite: true, ability: null },
    "4": { tier: 2, name: "ShiraYuki", role: "Sniper", cost: 100, range: 2, attack: 2, attackTokens: 2, slow: null, imageSrc: "img/operators/4.png", eliteVersion: "4-2", ability: null }, // ShiraYuki in some games has slow, but not in this design doc
    "4-2": { tier: 2, name: "ShiraYuki Elite", role: "Sniper", cost: 125, range: 2, attack: 3, attackTokens: 3, slow: null, imageSrc: "img/operators/4-2.png", isElite: true, ability: null },
    "6": { tier: 2, name: "Vermeil", role: "Sniper", cost: 75, range: 1, attack: 3, attackTokens: 2, slow: null, imageSrc: "img/operators/6.png", eliteVersion: "6-2", ability: null },
    "6-2": { tier: 2, name: "Vermeil Elite", role: "Sniper", cost: 100, range: 1, attack: 4, attackTokens: 3, slow: null, imageSrc: "img/operators/6-2.png", isElite: true, ability: null },
    "7": { tier: 2, name: "Estelle", role: "Guard", cost: 75, range: 1, attack: 3, attackTokens: 2, slow: null, imageSrc: "img/operators/7.png", eliteVersion: "7-2", ability: null },
    "7-2": { tier: 2, name: "Estelle Elite", role: "Guard", cost: 100, range: 1, attack: 6, attackTokens: 2, slow: null, imageSrc: "img/operators/7-2.png", isElite: true, ability: null },
    "9": { tier: 2, name: "Frostleaf", role: "Guard", cost: 100, range: 2, attack: 4, attackTokens: 1, slow: null, imageSrc: "img/operators/9.png", eliteVersion: "9-2", ability: null }, // Frostleaf in Arknights has slow, but not specified here.
    "9-2": { tier: 2, name: "Frostleaf Elite", role: "Guard", cost: 125, range: 2, attack: 10, attackTokens: 1, slow: null, imageSrc: "img/operators/9-2.png", isElite: true, ability: null },
    "8": { tier: 2, name: "Indra", role: "Guard", cost: 75, range: 1, attack: 6, attackTokens: 1, slow: null, imageSrc: "img/operators/8.png", eliteVersion: "8-2", ability: null },
    "8-2": { tier: 2, name: "Indra Elite", role: "Guard", cost: 100, range: 1, attack: 12, attackTokens: 1, slow: null, imageSrc: "img/operators/8-2.png", isElite: true, ability: null },
    "68": { tier: 2, name: "Gitano", role: "Caster AOE", cost: 70, range: 1, attack: "3(1)", attackTokens: 1, slow: null, imageSrc: "img/operators/68.png", eliteVersion: "68-2", ability: null },
    "68-2": { tier: 2, name: "Gitano Elite", role: "Caster AOE", cost: 100, range: 1, attack: "6(2)", attackTokens: 1, slow: null, imageSrc: "img/operators/68-2.png", isElite: true, ability: null },
    "69": { tier: 2, name: "Greyy", role: "Caster AOE", cost: 70, range: 1, attack: "3(1)", attackTokens: 1, slow: null, imageSrc: "img/operators/69.png", eliteVersion: "69-2", ability: null }, // Greyy in Arknights has slow, not specified here
    "69-2": { tier: 2, name: "Greyy Elite", role: "Caster AOE", cost: 100, range: 1, attack: "6(2)", attackTokens: 1, slow: null, imageSrc: "img/operators/69-2.png", isElite: true, ability: null },
    "70": { tier: 2, name: "Nightmare", role: "Caster", cost: 75, range: 1, attack: "3x2", attackTokens: 1, slow: null, imageSrc: "img/operators/70.png", eliteVersion: "70-2", ability: null },
    "70-2": { tier: 2, name: "Nightmare Elite", role: "Caster", cost: 125, range: 2, attack: "5x2", attackTokens: 1, slow: null, imageSrc: "img/operators/70-2.png", isElite: true, ability: null },
    "82": { tier: 2, name: "Haze", role: "Caster", cost: 75, range: 1, attack: "3x2", attackTokens: 1, slow: null, imageSrc: "img/operators/82.png", eliteVersion: "82-2", ability: null },
    "82-2": { tier: 2, name: "Haze Elite", role: "Caster", cost: 125, range: 2, attack: "5x2", attackTokens: 1, slow: null, imageSrc: "img/operators/82-2.png", isElite: true, ability: null },
    "75": { tier: 2, name: "Earthspirit", role: "Supporter", cost: 100, range: 1, attack: 2, attackTokens: 2, slow: 1, imageSrc: "img/operators/75.png", eliteVersion: "75-2", ability: { type: "slow", power: 1, duration: 1 } }, // Earthspirit also has stun in Arknights. Here only slow.
    "75-2": { tier: 2, name: "Earthspirit Elite", role: "Supporter", cost: 125, range: 1, attack: 5, attackTokens: 2, slow: 2, imageSrc: "img/operators/75-2.png", isElite: true, ability: { type: "slow", power: 2, duration: 1 } },
    "76": { tier: 2, name: "Podenco", role: "Supporter", cost: 100, range: 1, attack: 2, attackTokens: 2, slow: 1, imageSrc: "img/operators/76.png", eliteVersion: "76-2", ability: { type: "slow", power: 1, duration: 1 } },
    "76-2": { tier: 2, name: "Podenco Elite", role: "Supporter", cost: 125, range: 1, attack: 5, attackTokens: 2, slow: 2, imageSrc: "img/operators/76-2.png", isElite: true, ability: { type: "slow", power: 2, duration: 1 } },
    "40": { tier: 2, name: "Гум", role: "Defender", cost: 125, range: 2, attack: 4, attackTokens: 1, slow: null, imageSrc: "img/operators/40.png", eliteVersion: "40-2", ability: { type: "stun", duration: 1 } },
    "40-2": { tier: 2, name: "Гум Elite", role: "Defender", cost: 125, range: 2, attack: 11, attackTokens: 1, slow: null, imageSrc: "img/operators/40-2.png", isElite: true, ability: { type: "stun", duration: 1 } },
    "41": { tier: 2, name: "Dur-nar", role: "Defender", cost: 125, range: 2, attack: 4, attackTokens: 1, slow: null, imageSrc: "img/operators/41.png", eliteVersion: "41-2", ability: { type: "stun", duration: 1 } },
    "41-2": { tier: 2, name: "Dur-nar Elite", role: "Defender", cost: 125, range: 2, attack: 11, attackTokens: 1, slow: null, imageSrc: "img/operators/41-2.png", isElite: true, ability: { type: "stun", duration: 1 } },
    "42": { tier: 2, name: "Cuora", role: "Defender", cost: 125, range: 2, attack: 4, attackTokens: 1, slow: null, imageSrc: "img/operators/42.png", eliteVersion: "42-2", ability: { type: "stun", duration: 1 } },
    "42-2": { tier: 2, name: "Cuora Elite", role: "Defender", cost: 125, range: 2, attack: 11, attackTokens: 1, slow: null, imageSrc: "img/operators/42-2.png", isElite: true, ability: { type: "stun", duration: 1 } },
    "53": { tier: 2, name: "Rope", role: "Specialist(Hookmaster)", cost: 125, range: 1, attack: 6, attackTokens: 1, slow: null, imageSrc: "img/operators/53.png", eliteVersion: "54", ability: { type: "pull", power: 1 } },
    "54": { tier: 2, name: "Rope Elite", role: "Specialist(Hookmaster)", cost: 125, range: 2, attack: 12, attackTokens: 1, slow: null, imageSrc: "img/operators/54.png", isElite: true, ability: { type: "pull", power: 1 } },
    "55": { tier: 2, name: "Shaw", role: "Specialist(Push Stroker)", cost: 125, range: 1, attack: 6, attackTokens: 1, slow: null, imageSrc: "img/operators/55.png", eliteVersion: "56", ability: { type: "push", power: 1 } },
    "56": { tier: 2, name: "Shaw Elite", role: "Specialist(Push Stroker)", cost: 125, range: 2, attack: 12, attackTokens: 1, slow: null, imageSrc: "img/operators/56.png", isElite: true, ability: { type: "push", power: 1 } },

    // --- Уровень 3 ---
    "13": { tier: 3, name: "Executor", role: "Sniper", cost: 200, range: 1, attack: 6, attackTokens: 3, slow: null, imageSrc: "img/operators/13.png", eliteVersion: "13-2", ability: null },
    "13-2": { tier: 3, name: "Executor Elite", role: "Sniper", cost: 300, range: 2, attack: 8, attackTokens: 3, slow: null, imageSrc: "img/operators/13-2.png", isElite: true, ability: null },
    "15": { tier: 3, name: "Meteorite", role: "Sniper", cost: 250, range: 2, attack: 6, attackTokens: 3, slow: null, imageSrc: "img/operators/15.png", eliteVersion: "15-2", ability: null }, // Meteorite is AOE Sniper in Arknights. Here just Sniper.
    "15-2": { tier: 3, name: "Meteorite Elite", role: "Sniper", cost: 300, range: 2, attack: 8, attackTokens: 3, slow: null, imageSrc: "img/operators/15-2.png", isElite: true, ability: null },
    "14": { tier: 3, name: "Platinum", role: "Sniper", cost: 200, range: 1, attack: 6, attackTokens: 3, slow: null, imageSrc: "img/operators/14.png", eliteVersion: "14-2", ability: null },
    "14-2": { tier: 3, name: "Platinum Elite", role: "Sniper", cost: 300, range: 1, attack: 9, attackTokens: 3, slow: null, imageSrc: "img/operators/14-2.png", isElite: true, ability: null },
    "28": { tier: 3, name: "Sesa", role: "Sniper", cost: 250, range: 2, attack: 6, attackTokens: 3, slow: null, imageSrc: "img/operators/28.png", eliteVersion: "28-2", ability: null }, // Sesa is AOE Sniper in Arknights.
    "28-2": { tier: 3, name: "Sesa Elite", role: "Sniper", cost: 300, range: 2, attack: 8, attackTokens: 3, slow: null, imageSrc: "img/operators/28-2.png", isElite: true, ability: null },
    "29": { tier: 3, name: "Provence", role: "Sniper", cost: 200, range: 1, attack: 6, attackTokens: 3, slow: null, imageSrc: "img/operators/29.png", eliteVersion: "29-2", ability: null },
    "29-2": { tier: 3, name: "Provence Elite", role: "Sniper", cost: 300, range: 2, attack: 8, attackTokens: 3, slow: null, imageSrc: "img/operators/29-2.png", isElite: true, ability: null },
    "30": { tier: 3, name: "Blue Poison", role: "Sniper", cost: 200, range: 1, attack: 6, attackTokens: 3, slow: null, imageSrc: "img/operators/30.png", eliteVersion: "30-2", ability: null },
    "30-2": { tier: 3, name: "Blue Poison Elite", role: "Sniper", cost: 300, range: 1, attack: 9, attackTokens: 3, slow: null, imageSrc: "img/operators/30-2.png", isElite: true, ability: null },
    "18": { tier: 3, name: "Lappland", role: "Guard", cost: 250, range: 2, attack: 9, attackTokens: 2, slow: null, imageSrc: "img/operators/18.png", eliteVersion: "18-2", ability: null },
    "18-2": { tier: 3, name: "Lappland Elite", role: "Guard", cost: 300, range: 2, attack: 12, attackTokens: 2, slow: null, imageSrc: "img/operators/18-2.png", isElite: true, ability: null },
    "16": { tier: 3, name: "Savage", role: "Guard", cost: 200, range: 1, attack: 9, attackTokens: 2, slow: null, imageSrc: "img/operators/16.png", eliteVersion: "16-2", ability: null },
    "16-2": { tier: 3, name: "Savage Elite", role: "Guard", cost: 300, range: 1, attack: 9, attackTokens: 3, slow: null, imageSrc: "img/operators/16-2.png", isElite: true, ability: null },
    "17": { tier: 3, name: "Astesia", role: "Guard", cost: 250, range: 1, attack: 10, attackTokens: 2, slow: null, imageSrc: "img/operators/17.png", eliteVersion: "17-2", ability: null },
    "17-2": { tier: 3, name: "Astesia Elite", role: "Guard", cost: 300, range: 1, attack: 14, attackTokens: 2, slow: null, imageSrc: "img/operators/17-2.png", isElite: true, ability: null },
    "27": { tier: 3, name: "Broca", role: "Guard", cost: 200, range: 1, attack: 9, attackTokens: 2, slow: null, imageSrc: "img/operators/27.png", eliteVersion: "27-2", ability: null },
    "27-2": { tier: 3, name: "Broca Elite", role: "Guard", cost: 300, range: 1, attack: 9, attackTokens: 3, slow: null, imageSrc: "img/operators/27-2.png", isElite: true, ability: null },
    "26": { tier: 3, name: "Franka", role: "Guard", cost: 250, range: 1, attack: 10, attackTokens: 2, slow: null, imageSrc: "img/operators/26.png", eliteVersion: "26-2", ability: null },
    "26-2": { tier: 3, name: "Franka Elite", role: "Guard", cost: 300, range: 1, attack: 14, attackTokens: 2, slow: null, imageSrc: "img/operators/26-2.png", isElite: true, ability: null },
    "25": { tier: 3, name: "Ayerscarpe", role: "Guard", cost: 250, range: 2, attack: 9, attackTokens: 2, slow: null, imageSrc: "img/operators/25.png", eliteVersion: "25-2", ability: null },
    "25-2": { tier: 3, name: "Ayerscarpe Elite", role: "Guard", cost: 300, range: 2, attack: 12, attackTokens: 2, slow: null, imageSrc: "img/operators/25-2.png", isElite: true, ability: null },
    "60": { tier: 3, name: "Beeswax", role: "Caster AOE", cost: 250, range: 1, attack: "6(2)", attackTokens: 2, slow: null, imageSrc: "img/operators/60.png", eliteVersion: "60-2", ability: null },
    "60-2": { tier: 3, name: "Beeswax Elite", role: "Caster AOE", cost: 300, range: 2, attack: "6(3)", attackTokens: 2, slow: null, imageSrc: "img/operators/60-2.png", isElite: true, ability: null },
    "83": { tier: 3, name: "Skyfire", role: "Caster AOE", cost: 250, range: 1, attack: "6(2)", attackTokens: 2, slow: null, imageSrc: "img/operators/83.png", eliteVersion: "83-2", ability: null },
    "83-2": { tier: 3, name: "Skyfire Elite", role: "Caster AOE", cost: 300, range: 2, attack: "6(3)", attackTokens: 2, slow: null, imageSrc: "img/operators/83-2.png", isElite: true, ability: null },
    "58": { tier: 3, name: "Amiya", role: "Caster", cost: 250, range: 2, attack: "9x2", attackTokens: 1, slow: null, imageSrc: "img/operators/58.png", eliteVersion: "58-2", ability: null },
    "58-2": { tier: 3, name: "Amiya Elite", role: "Caster", cost: 300, range: 2, attack: "13x2", attackTokens: 1, slow: null, imageSrc: "img/operators/58-2.png", isElite: true, ability: null },
    "57": { tier: 3, name: "Absinthe", role: "Caster", cost: 250, range: 2, attack: "9x2", attackTokens: 1, slow: null, imageSrc: "img/operators/57.png", eliteVersion: "57-2", ability: null },
    "57-2": { tier: 3, name: "Absinthe Elite", role: "Caster", cost: 300, range: 2, attack: "13x2", attackTokens: 1, slow: null, imageSrc: "img/operators/57-2.png", isElite: true, ability: null },
    "77": { tier: 3, name: "Glaucus", role: "Supporter", cost: 250, range: 1, attack: 7, attackTokens: 2, slow: 2, imageSrc: "img/operators/77.png", eliteVersion: "77-2", ability: { type: "slow", power: 2, duration: 1 } },
    "77-2": { tier: 3, name: "Glaucus Elite", role: "Supporter", cost: 300, range: 2, attack: 7, attackTokens: 3, slow: 2, imageSrc: "img/operators/77-2.png", isElite: true, ability: { type: "slow", power: 2, duration: 1 } },
    "78": { tier: 3, name: "True", role: "Supporter", cost: 250, range: 1, attack: 7, attackTokens: 2, slow: 2, imageSrc: "img/operators/78.png", eliteVersion: "78-2", ability: { type: "slow", power: 2, duration: 1 } }, // Имя Elite было "ИСТИНА Elite" -> True Elite
    "78-2": { tier: 3, name: "True Elite", role: "Supporter", cost: 300, range: 2, attack: 7, attackTokens: 3, slow: 2, imageSrc: "img/operators/78-2.png", isElite: true, ability: { type: "slow", power: 2, duration: 1 } },
    "79": { tier: 3, name: "Mayer", role: "Supporter", cost: 250, range: 1, attack: 7, attackTokens: 2, slow: 2, imageSrc: "img/operators/79.png", eliteVersion: "79-2", ability: { type: "slow", power: 2, duration: 1 } },
    "79-2": { tier: 3, name: "Mayer Elite", role: "Supporter", cost: 300, range: 2, attack: 7, attackTokens: 3, slow: 2, imageSrc: "img/operators/79-2.png", isElite: true, ability: { type: "slow", power: 2, duration: 1 } },
    "43": { tier: 3, name: "Asbestos", role: "Defender", cost: 250, range: 2, attack: 11, attackTokens: 1, slow: null, imageSrc: "img/operators/43.png", eliteVersion: "43-2", ability: { type: "stun", duration: 1 } },
    "43-2": { tier: 3, name: "Asbestos Elite", role: "Defender", cost: 300, range: 2, attack: 18, attackTokens: 1, slow: null, imageSrc: "img/operators/43-2.png", isElite: true, ability: { type: "stun", duration: 1 } },
    "44": { tier: 3, name: "Nearl", role: "Defender", cost: 250, range: 2, attack: 11, attackTokens: 1, slow: null, imageSrc: "img/operators/44.png", eliteVersion: "44-2", ability: { type: "stun", duration: 1 } },
    "44-2": { tier: 3, name: "Nearl Elite", role: "Defender", cost: 300, range: 2, attack: 18, attackTokens: 1, slow: null, imageSrc: "img/operators/44-2.png", isElite: true, ability: { type: "stun", duration: 1 } },
    "45": { tier: 3, name: "Hung", role: "Defender", cost: 250, range: 2, attack: 11, attackTokens: 1, slow: null, imageSrc: "img/operators/45.png", eliteVersion: "45-2", ability: { type: "stun", duration: 1 } },
    "45-2": { tier: 3, name: "Hung Elite", role: "Defender", cost: 300, range: 2, attack: 18, attackTokens: 1, slow: null, imageSrc: "img/operators/45-2.png", isElite: true, ability: { type: "stun", duration: 1 } },
    "50": { tier: 3, name: "Cliffheart", role: "Specialist(Hookmaster)", cost: 250, range: 2, attack: 13, attackTokens: 1, slow: null, imageSrc: "img/operators/50.png", eliteVersion: "50-2", ability: { type: "pull", power: 1 } },
    "50-2": { tier: 3, name: "Cliffheart Elite", role: "Specialist(Hookmaster)", cost: 300, range: 2, attack: 21, attackTokens: 1, slow: null, imageSrc: "img/operators/50-2.png", isElite: true, ability: { type: "pull", power: 1 } },
    "51": { tier: 3, name: "Feater", role: "Specialist(Push Stroker)", cost: 250, range: 2, attack: 13, attackTokens: 1, slow: null, imageSrc: "img/operators/51.png", eliteVersion: "51-2", ability: { type: "push", power: 1 } },
    "51-2": { tier: 3, name: "FEater Elite", role: "Specialist(Push Stroker)", cost: 300, range: 2, attack: 21, attackTokens: 1, slow: null, imageSrc: "img/operators/51-2.png", isElite: true, ability: { type: "push", power: 1 } },
    "52": { tier: 3, name: "Snowsant", role: "Specialist(Hookmaster)", cost: 250, range: 2, attack: 13, attackTokens: 1, slow: null, imageSrc: "img/operators/52.png", eliteVersion: "52-2", ability: { type: "pull", power: 1 } },
    "52-2": { tier: 3, name: "Snowsant Elite", role: "Specialist(Hookmaster)", cost: 300, range: 2, attack: 21, attackTokens: 1, slow: null, imageSrc: "img/operators/52-2.png", isElite: true, ability: { type: "pull", power: 1 } },

    // --- Уровень 4 ---
    "19": { tier: 4, name: "Exusiai", role: "Sniper", cost: 550, range: 2, attack: 8, attackTokens: 3, slow: null, imageSrc: "img/operators/19.png", eliteVersion: "19-2", ability: null },
    "19-2": { tier: 4, name: "Exusiai Elite", role: "Sniper", cost: 550, range: 2, attack: 16, attackTokens: 3, slow: null, imageSrc: "img/operators/19-2.png", isElite: true, ability: null },
    "20": { tier: 4, name: "W", role: "Sniper", cost: 550, range: 2, attack: 8, attackTokens: 3, slow: null, imageSrc: "img/operators/20.png", eliteVersion: "20-2", ability: null }, // W in Arknights has stuns/bombs. Here just Sniper.
    "20-2": { tier: 4, name: "W Elite", role: "Sniper", cost: 550, range: 3, attack: 15, attackTokens: 3, slow: null, imageSrc: "img/operators/20-2.png", isElite: true, ability: null },
    "21": { tier: 4, name: "Schwarz", role: "Sniper", cost: 400, range: 1, attack: 8, attackTokens: 3, slow: null, imageSrc: "img/operators/21.png", eliteVersion: "21-2", ability: null },
    "21-2": { tier: 4, name: "Schwarz Elite", role: "Sniper", cost: 550, range: 2, attack: 16, attackTokens: 3, slow: null, imageSrc: "img/operators/21-2.png", isElite: true, ability: null },
    "31": { tier: 4, name: "Archetto", role: "Sniper", cost: 550, range: 2, attack: 8, attackTokens: 3, slow: null, imageSrc: "img/operators/31.png", eliteVersion: "31-2", ability: null },
    "31-2": { tier: 4, name: "Archetto Elite", role: "Sniper", cost: 550, range: 2, attack: 16, attackTokens: 3, slow: null, imageSrc: "img/operators/31-2.png", isElite: true, ability: null },
    "32": { tier: 4, name: "Rosmontis", role: "Sniper", cost: 550, range: 2, attack: 8, attackTokens: 3, slow: null, imageSrc: "img/operators/32.png", eliteVersion: "32-2", ability: null }, // Rosmontis has complex mechanics in Arknights.
    "32-2": { tier: 4, name: "Rosmontis Elite", role: "Sniper", cost: 550, range: 3, attack: 15, attackTokens: 3, slow: null, imageSrc: "img/operators/32-2.png", isElite: true, ability: null },
    "33": { tier: 4, name: "POCA", role: "Sniper", cost: 400, range: 1, attack: 8, attackTokens: 3, slow: null, imageSrc: "img/operators/33.png", eliteVersion: "33-2", ability: null }, // Assuming POCA is Fiammetta or similar.
    "33-2": { tier: 4, name: "POCA Elite", role: "Sniper", cost: 550, range: 2, attack: 16, attackTokens: 3, slow: null, imageSrc: "img/operators/33-2.png", isElite: true, ability: null },
    "24": { tier: 4, name: "SilverAsh", role: "Guard", cost: 550, range: 2, attack: 12, attackTokens: 2, slow: null, imageSrc: "img/operators/24.png", eliteVersion: "24-2", ability: null },
    "24-2": { tier: 4, name: "SilverAsh Elite", role: "Guard", cost: 550, range: 2, attack: 16, attackTokens: 3, slow: null, imageSrc: "img/operators/24-2.png", isElite: true, ability: null },
    "22": { tier: 4, name: "Blaze", role: "Guard", cost: 500, range: 1, attack: 9, attackTokens: 3, slow: null, imageSrc: "img/operators/22.png", eliteVersion: "22-2", ability: null },
    "22-2": { tier: 4, name: "Blaze Elite", role: "Guard", cost: 550, range: 2, attack: 12, attackTokens: 4, slow: null, imageSrc: "img/operators/22-2.png", isElite: true, ability: null },
    "23": { tier: 4, name: "Ch'en", role: "Guard", cost: 550, range: 1, attack: 14, attackTokens: 2, slow: null, imageSrc: "img/operators/23.png", eliteVersion: "23-2", ability: null },
    "23-2": { tier: 4, name: "Ch'en Elite", role: "Guard", cost: 550, range: 1, attack: 19, attackTokens: 3, slow: null, imageSrc: "img/operators/23-2.png", isElite: true, ability: null },
    "34": { tier: 4, name: "Thorns", role: "Guard", cost: 550, range: 2, attack: 12, attackTokens: 2, slow: null, imageSrc: "img/operators/34.png", eliteVersion: "34-2", ability: null },
    "34-2": { tier: 4, name: "Thorns Elite", role: "Guard", cost: 550, range: 2, attack: 16, attackTokens: 3, slow: null, imageSrc: "img/operators/34-2.png", isElite: true, ability: null },
    "36": { tier: 4, name: "Specter", role: "Guard", cost: 500, range: 1, attack: 9, attackTokens: 3, slow: null, imageSrc: "img/operators/36.png", eliteVersion: "36-2", ability: null },
    "36-2": { tier: 4, name: "Specter Elite", role: "Guard", cost: 550, range: 2, attack: 12, attackTokens: 4, slow: null, imageSrc: "img/operators/36-2.png", isElite: true, ability: null },
    "35": { tier: 4, name: "Surtr", role: "Guard", cost: 550, range: 1, attack: 14, attackTokens: 2, slow: null, imageSrc: "img/operators/35.png", eliteVersion: "35-2", ability: null },
    "35-2": { tier: 4, name: "Surtr Elite", role: "Guard", cost: 550, range: 1, attack: 19, attackTokens: 3, slow: null, imageSrc: "img/operators/35-2.png", isElite: true, ability: null },
    "71": { tier: 4, name: "Dusk", role: "Caster AOE", cost: 550, range: 2, attack: "6(3)", attackTokens: 2, slow: null, imageSrc: "img/operators/71.png", eliteVersion: "71-2", ability: null },
    "71-2": { tier: 4, name: "Dusk Elite", role: "Caster AOE", cost: 550, range: 2, attack: "8(4)", attackTokens: 3, slow: null, imageSrc: "img/operators/71-2.png", isElite: true, ability: null },
    "72": { tier: 4, name: "Mostima", role: "Caster AOE", cost: 550, range: 2, attack: "6(3)", attackTokens: 2, slow: null, imageSrc: "img/operators/72.png", eliteVersion: "72-2", ability: null }, // Mostima has slow/stun in Arknights.
    "72-2": { tier: 4, name: "Mostima Elite", role: "Caster AOE", cost: 550, range: 2, attack: "8(4)", attackTokens: 3, slow: null, imageSrc: "img/operators/72-2.png", isElite: true, ability: null },
    "73": { tier: 4, name: "Eyjafjalla", role: "Caster", cost: 550, range: 2, attack: "13x2", attackTokens: 1, slow: null, imageSrc: "img/operators/73.png", eliteVersion: "73-2", ability: null },
    "73-2": { tier: 4, name: "Eyjafjalla Elite", role: "Caster", cost: 600, range: 2, attack: "13x2", attackTokens: 2, slow: null, imageSrc: "img/operators/73-2.png", isElite: true, ability: null },
    "61": { tier: 4, name: "Ceobe", role: "Caster", cost: 550, range: 2, attack: "13x2", attackTokens: 1, slow: null, imageSrc: "img/operators/61.png", eliteVersion: "61-2", ability: null },
    "61-2": { tier: 4, name: "Ceobe Elite", role: "Caster", cost: 600, range: 2, attack: "13x2", attackTokens: 2, slow: null, imageSrc: "img/operators/61-2.png", isElite: true, ability: null },
    "74": { tier: 4, name: "Ifrit", role: "Ifrit", cost: 600, range: "all line", attack: 8, attackTokens: 1, slow: null, imageSrc: "img/operators/74.png", eliteVersion: "74-2", ability: null }, // Range "all line" implies its special attack.
    "74-2": { tier: 4, name: "Ifrit Elite", role: "Ifrit", cost: 600, range: "all line", attack: 16, attackTokens: 1, slow: null, imageSrc: "img/operators/74-2.png", isElite: true, ability: null },
    "59": { tier: 4, name: "Angelina", role: "Supporter", cost: 550, range: 2, attack: 7, attackTokens: 3, slow: 2, imageSrc: "img/operators/59.png", eliteVersion: "59-2", ability: { type: "slow", power: 2, duration: 1 } },
    "59-2": { tier: 4, name: "Angelina Elite", role: "Supporter", cost: 550, range: 2, attack: 13, attackTokens: 3, slow: 3, imageSrc: "img/operators/59-2.png", isElite: true, ability: { type: "slow", power: 3, duration: 1 } },
    "80": { tier: 4, name: "Magallan", role: "Supporter", cost: 550, range: 2, attack: 7, attackTokens: 3, slow: 2, imageSrc: "img/operators/80.png", eliteVersion: "80-2", ability: { type: "slow", power: 2, duration: 1 } }, // Magallan has drones in Arknights, complex. Here simplified to slow.
    "80-2": { tier: 4, name: "Magallan Elite", role: "Supporter", cost: 550, range: 2, attack: 13, attackTokens: 3, slow: 3, imageSrc: "img/operators/80-2.png", isElite: true, ability: { type: "slow", power: 3, duration: 1 } },
    "81": { tier: 4, name: "Suzuran", role: "Supporter", cost: 550, range: 2, attack: 7, attackTokens: 3, slow: 2, imageSrc: "img/operators/81.png", eliteVersion: "81-2", ability: { type: "slow", power: 2, duration: 1 } }, // Suzuran has more complex slow/fragile in Arknights.
    "81-2": { tier: 4, name: "Suzuran Elite", role: "Supporter", cost: 550, range: 2, attack: 13, attackTokens: 3, slow: 3, imageSrc: "img/operators/81-2.png", isElite: true, ability: { type: "slow", power: 3, duration: 1 } },
    "46": { tier: 4, name: "Eunectes", role: "Defender", cost: 550, range: 2, attack: 18, attackTokens: 1, slow: null, imageSrc: "img/operators/46.png", eliteVersion: "46-2", ability: { type: "stun", duration: 1 } },
    "46-2": { tier: 4, name: "Eunectes Elite", role: "Defender", cost: 550, range: 2, attack: 36, attackTokens: 1, slow: null, imageSrc: "img/operators/46-2.png", isElite: true, ability: { type: "stun", duration: 1 } },
    "48": { tier: 4, name: "Hoshiguma", role: "Defender", cost: 550, range: 2, attack: 18, attackTokens: 1, slow: null, imageSrc: "img/operators/48.png", eliteVersion: "48-2", ability: { type: "stun", duration: 1 } },
    "48-2": { tier: 4, name: "Hoshiguma Elite", role: "Defender", cost: 550, range: 2, attack: 36, attackTokens: 1, slow: null, imageSrc: "img/operators/48-2.png", isElite: true, ability: { type: "stun", duration: 1 } },
    "47": { tier: 4, name: "Nian", role: "Defender", cost: 550, range: 2, attack: 18, attackTokens: 1, slow: null, imageSrc: "img/operators/47.png", eliteVersion: "47-2", ability: { type: "stun", duration: 1 } },
    "47-2": { tier: 4, name: "Nian Elite", role: "Defender", cost: 550, range: 2, attack: 36, attackTokens: 1, slow: null, imageSrc: "img/operators/47-2.png", isElite: true, ability: { type: "stun", duration: 1 } },
    "49": { tier: 4, name: "Weedy", role: "Specialist(Push Stroker)", cost: 550, range: 2, attack: 21, attackTokens: 1, slow: null, imageSrc: "img/operators/49.png", eliteVersion: "49-2", ability: { type: "push", power: 1 } }, // Weedy has more complex push. Simplified.
    "49-2": { tier: 4, name: "Weedy Elite", role: "Specialist(Push Stroker)", cost: 550, range: 2, attack: 39, attackTokens: 1, slow: null, imageSrc: "img/operators/49-2.png", isElite: true, ability: { type: "push", power: 1 } },

};

// Функция для получения данных по ID
function getOperatorData(id) {
    // Проверяем, существует ли ключ в объекте
    if (ALL_OPERATORS_DATA.hasOwnProperty(id)) {
        return ALL_OPERATORS_DATA[id];
    } else {
        console.error(`Данные для оператора с ID "${id}" не найдены!`);
        // Возвращаем null или объект по умолчанию, чтобы избежать ошибок дальше
        return null;
    }
}

// Пример использования:
// const kroosData = getOperatorData("1");
// console.log(kroosData);
// const ifritEliteData = getOperatorData("74-2");
// console.log(ifritEliteData);
