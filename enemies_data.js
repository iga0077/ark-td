// enemies_data.js

// Полный объект данных для всех противников и боссов.
// Ключ - уникальный ID врага (например, имя в нижнем регистре).
// Значение - объект с характеристиками.

const ALL_ENEMIES_DATA = {
    // Обычные противники
    "regular_inmate": { type: "Противник", name: "Regular Inmate", hp: 3, speed: 3, attack: 1, reward: 5, imageSrc: "img/enemy/1.png" },
    "sicilian": { type: "Противник", name: "Sicilian", hp: 6, speed: 3, attack: 1, reward: 10, imageSrc: "img/enemy/2.png" },
    "marksman": { type: "Противник", name: "Marksman", hp: 9, speed: 2, attack: 1, reward: 15, imageSrc: "img/enemy/3.png" },
    "second_inmate": { type: "Противник", name: "Second Inmate", hp: 12, speed: 2, attack: 1, reward: 20, imageSrc: "img/enemy/4.png" },
    "caster": { type: "Противник", name: "Caster", hp: 15, speed: 2, attack: 1, reward: 25, imageSrc: "img/enemy/5.png" },
    "caster_elite": { type: "Противник", name: "Caster Elite", hp: 18, speed: 4, attack: 2, reward: 30, imageSrc: "img/enemy/6.png" },
    "soldier": { type: "Противник", name: "Soldier", hp: 21, speed: 4, attack: 2, reward: 35, imageSrc: "img/enemy/7.png" },
    "soldier_2": { type: "Противник", name: "Soldier 2", hp: 24, speed: 3, attack: 2, reward: 40, imageSrc: "img/enemy/8.png" },
    "leithanien_rebel": { type: "Противник", name: "Leithanien Rebel", hp: 27, speed: 3, attack: 2, reward: 45, imageSrc: "img/enemy/9.png" },
    "crownslayer": { type: "Противник", name: "Crownslayer", hp: 30, speed: 3, attack: 2, reward: 50, imageSrc: "img/enemy/10.png" },
    "tiakau_warrior": { type: "Противник", name: "Tiakau Warrior", hp: 33, speed: 4, attack: 3, reward: 55, imageSrc: "img/enemy/11.png" },
    "tiakau_warlock": { type: "Противник", name: "Tiakau Warlock", hp: 36, speed: 3, attack: 3, reward: 60, imageSrc: "img/enemy/12.png" },
    "infected_picket": { type: "Противник", name: "Infected Picket", hp: 39, speed: 4, attack: 3, reward: 65, imageSrc: "img/enemy/13.png" },
    "sarkaz_swordsman": { type: "Противник", name: "Sarkaz Swordsman", hp: 42, speed: 3, attack: 3, reward: 70, imageSrc: "img/enemy/14.png" },
    "junkman": { type: "Противник", name: "Junkman", hp: 45, speed: 4, attack: 3, reward: 75, imageSrc: "img/enemy/15.png" },
    "yeti_caster": { type: "Противник", name: "Yeti Caster", hp: 48, speed: 5, attack: 4, reward: 80, imageSrc: "img/enemy/16.png" },
    "plastic_knight": { type: "Противник", name: "Plastic Knight", hp: 51, speed: 4, attack: 4, reward: 85, imageSrc: "img/enemy/17.png" },
    "great_swordsman": { type: "Противник", name: "Great Swordsman", hp: 54, speed: 5, attack: 4, reward: 90, imageSrc: "img/enemy/18.png" },
    "rusted_bronze_knight": { type: "Противник", name: "Rusted Bronze Knight", hp: 57, speed: 4, attack: 4, reward: 95, imageSrc: "img/enemy/19.png" },
    "skullshatterer": { type: "Противник", name: "Skullshatterer", hp: 60, speed: 4, attack: 4, reward: 100, imageSrc: "img/enemy/20.png" },
    "talulah": { type: "Противник", name: "Talulah", hp: 63, speed: 6, attack: 5, reward: 105, imageSrc: "img/enemy/21.png" },
    "left_handed_titus_bayer": { type: "Противник", name: "Left-Handed Titus Bayer", hp: 66, speed: 6, attack: 5, reward: 110, imageSrc: "img/enemy/22.png" },
    "big_bob": { type: "Противник", name: "Big Bob", hp: 69, speed: 5, attack: 5, reward: 115, imageSrc: "img/enemy/23.png" },
    "frostnova": { type: "Противник", name: "Frostnova", hp: 72, speed: 7, attack: 5, reward: 120, imageSrc: "img/enemy/24.png" },
    "defiled_knight": { type: "Противник", name: "Defiled Knight", hp: 75, speed: 6, attack: 5, reward: 125, imageSrc: "img/enemy/25.png" },
    "jeston_williams": { type: "Противник", name: "Jeston Williams", hp: 80, speed: 6, attack: 6, reward: 130, imageSrc: "img/enemy/26.png" },
    "mephisto": { type: "Противник", name: "Mephisto", hp: 85, speed: 7, attack: 6, reward: 135, imageSrc: "img/enemy/27.png" },
    "faust": { type: "Противник", name: "Faust", hp: 90, speed: 6, attack: 6, reward: 140, imageSrc: "img/enemy/28.png" },
    "patriot": { type: "Противник", name: "Patriot", hp: 105, speed: 6, attack: 6, reward: 150, imageSrc: "img/enemy/29.png" },

    // Боссы
    "crownslayer_boss": { type: "Босс", name: "Crownslayer BOSS", hp: 30, speed: 3, attack: 5, reward: 120, imageSrc: "img/boss/1.png", isBoss: true },
    "skullshatterer_boss": { type: "Босс", name: "Skullshatterer BOSS", hp: 60, speed: 3, attack: 5, reward: 240, imageSrc: "img/boss/2.png", isBoss: true },
    "defiled_knight_boss": { type: "Босс", name: "Defiled Knight BOSS", hp: 90, speed: 4, attack: 5, reward: 360, imageSrc: "img/boss/3.png", isBoss: true },
    "patriot_boss": { type: "Босс", name: "Patriot BOSS", hp: 120, speed: 5, attack: 8, reward: 480, imageSrc: "img/boss/4.png", isBoss: true },
    "mudrock_boss": { type: "Босс", name: "Mudrock BOSS", hp: 150, speed: 5, attack: 10, reward: 600, imageSrc: "img/boss/5.png", isBoss: true },
    "emperors_blade": { type: "Босс", name: "Emperor's Blade", hp: 200, speed: 6, attack: 10, reward: 720, imageSrc: "img/boss/6.png", isBoss: true },
};

// Функция для получения данных врага по ID
function getEnemyData(id) {
    if (ALL_ENEMIES_DATA.hasOwnProperty(id)) {
        return ALL_ENEMIES_DATA[id];
    } else {
        console.error(`Данные для врага с ID "${id}" не найдены!`);
        return null; // Возвращаем null, чтобы избежать ошибок
    }
}

// Пример использования:
// const inmateData = getEnemyData("regular_inmate");
// console.log(inmateData);
// const mudrockData = getEnemyData("mudrock_boss");
// console.log(mudrockData);
