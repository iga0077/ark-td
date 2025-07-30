// map_editor.js

const MapEditor = {
    canvas: null,
    ctx: null,
    selectedTool: 'enemy_path',
    gridData: [],
    cellSize: 64,
    
    // Изображения для клеток
    images: {
        enemy_start: null,
        enemy_end: null,
        enemy_path: null,
        placement: null,
        wall: null
    },
    
    init() {
		this.canvas = document.getElementById('mapEditorCanvas');
		if (!this.canvas) return;
		
		this.ctx = this.canvas.getContext('2d');
		
		// Получаем размеры контейнера
		const container = this.canvas.parentElement;
		const containerWidth = container.clientWidth - 32; // Учитываем padding
		const containerHeight = container.clientHeight - 32;
		
		// Вычисляем оптимальный размер клетки
		const cellWidthPotential = containerWidth / GRID_COLS;
		const cellHeightPotential = containerHeight / GRID_ROWS;
		this.cellSize = Math.floor(Math.min(cellWidthPotential, cellHeightPotential));
		this.cellSize = Math.max(32, this.cellSize); // Минимум 32px
		
		this.canvas.width = GRID_COLS * this.cellSize;
		this.canvas.height = GRID_ROWS * this.cellSize;
		
		// Инициализация пустой сетки
		this.clearGrid();
		
		// Загрузка изображений
		this.loadImages();
		
		// Обработчики событий
		this.setupEventHandlers();
		
		// Первая отрисовка
		this.draw();
	},
    
    clearGrid() {
        this.gridData = [];
        for (let row = 0; row < GRID_ROWS; row++) {
            this.gridData[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                this.gridData[row][col] = null;
            }
        }
    },
    
    loadImages() {
        const imagePaths = {
            enemy_start: 'img/map/start_enemy_square.png',
            enemy_end: 'img/map/end_enemy_square.png',
            enemy_path: 'img/map/enemy_square.png',
            placement: 'img/map/deploy_square.png',
            wall: 'img/map/obstacle.png'
        };
        
        for (const [key, path] of Object.entries(imagePaths)) {
            const img = new Image();
            img.src = path;
            img.onload = () => {
                this.images[key] = img;
                this.draw();
            };
        }
    },
    
    setupEventHandlers() {
        // Выбор инструмента
        document.querySelectorAll('.editor-tool').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.editor-tool').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedTool = btn.dataset.tool;
            });
        });
        
        // Рисование на канвасе
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMove(e));
        
        // Кнопки действий
        document.getElementById('editorPlayBtn').addEventListener('click', () => this.playMap());
        document.getElementById('editorSaveBtn').addEventListener('click', () => this.saveMap());
        document.getElementById('editorLoadInput').addEventListener('change', (e) => this.loadMap(e));
        document.getElementById('editorClearBtn').addEventListener('click', () => {
			document.getElementById('editorClearModal').style.display = 'flex';
		});
        document.getElementById('editorClearConfirmBtn').addEventListener('click', () => {
			this.clearGrid();
			this.draw();
			document.getElementById('editorClearModal').style.display = 'none';
		});

		document.getElementById('editorClearCancelBtn').addEventListener('click', () => {
			document.getElementById('editorClearModal').style.display = 'none';
		});

		document.getElementById('editorClearModal').addEventListener('click', (e) => {
			if (e.target.id === 'editorClearModal') {
				document.getElementById('editorClearModal').style.display = 'none';
			}
		});
		 document.getElementById('editorBackBtn').addEventListener('click', () => this.backToMenu());
		
        // Модальное окно ошибки
        document.getElementById('editorErrorOkBtn').addEventListener('click', () => {
            document.getElementById('editorErrorModal').style.display = 'none';
        });
		
		//обработчик изменения размера окна
		window.addEventListener('resize', () => {
			if (this.canvas && this.canvas.parentElement) {
				const container = this.canvas.parentElement;
				const containerWidth = container.clientWidth - 32;
				const containerHeight = container.clientHeight - 32;
				
				const cellWidthPotential = containerWidth / GRID_COLS;
				const cellHeightPotential = containerHeight / GRID_ROWS;
				this.cellSize = Math.floor(Math.min(cellWidthPotential, cellHeightPotential));
				this.cellSize = Math.max(32, this.cellSize);
				
				this.canvas.width = GRID_COLS * this.cellSize;
				this.canvas.height = GRID_ROWS * this.cellSize;
				
				this.draw();
			}
		});
    },
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            if (this.selectedTool === 'eraser') {
                this.gridData[row][col] = null;
            } else {
                // Убираем старые старт/конец если размещаем новые
                if (this.selectedTool === 'enemy_start') {
                    this.removeAllOfType('enemy_start');
                } else if (this.selectedTool === 'enemy_end') {
                    this.removeAllOfType('enemy_end');
                }
                this.gridData[row][col] = this.selectedTool;
            }
            this.draw();
        }
    },
    
    handleCanvasMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        this.draw();
        
        // Подсветка клетки под курсором
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
        }
    },
    
    removeAllOfType(type) {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                if (this.gridData[row][col] === type) {
                    this.gridData[row][col] = null;
                }
            }
        }
    },
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем сетку
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_ROWS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(GRID_COLS * this.cellSize, i * this.cellSize);
            this.ctx.stroke();
        }
        for (let j = 0; j <= GRID_COLS; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(j * this.cellSize, 0);
            this.ctx.lineTo(j * this.cellSize, GRID_ROWS * this.cellSize);
            this.ctx.stroke();
        }
        
        // Рисуем клетки
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const cellType = this.gridData[row][col];
                if (cellType && this.images[cellType]) {
                    this.ctx.drawImage(this.images[cellType], col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
                    
                    // Дополнительные метки для старта и конца
                    if (cellType === 'enemy_start') {
                        this.ctx.fillStyle = '#4ade80';
                        this.ctx.font = 'bold 20px sans-serif';
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillText('START', col * this.cellSize + this.cellSize/2, row * this.cellSize + this.cellSize/2);
                    } else if (cellType === 'enemy_end') {
                        this.ctx.fillStyle = '#ef4444';
                        this.ctx.font = 'bold 20px sans-serif';
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillText('END', col * this.cellSize + this.cellSize/2, row * this.cellSize + this.cellSize/2);
                    }
                }
            }
        }
    },
    
    validateMap() {
        let startCell = null;
        let endCell = null;
        const pathCells = [];
        const placementCells = [];
        const wallCells = [];
        
        // Собираем все клетки
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const cellType = this.gridData[row][col];
                if (cellType === 'enemy_start') startCell = [row, col];
                else if (cellType === 'enemy_end') endCell = [row, col];
                else if (cellType === 'enemy_path') pathCells.push([row, col]);
                else if (cellType === 'placement') placementCells.push([row, col]);
                else if (cellType === 'wall') wallCells.push([row, col]);
            }
        }
        
        // Проверки
        if (!startCell) return { valid: false, error: 'Не установлена стартовая клетка врагов!' };
        if (!endCell) return { valid: false, error: 'Не установлена конечная клетка (база)!' };
        if (placementCells.length === 0) return { valid: false, error: 'Нет мест для размещения операторов!' };
        
        // Проверка пути
        const path = this.findPath(startCell, endCell, pathCells);
        if (!path) return { valid: false, error: 'Невозможно построить путь от старта до базы!' };
        
        return { valid: true, path, placementCells, wallCells };
    },
    
    findPath(start, end, pathCells) {
        // Простой поиск пути (BFS)
        const queue = [[start[0], start[1], [start]]];
        const visited = new Set([`${start[0]},${start[1]}`]);
        
        const isValidCell = (row, col) => {
            if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return false;
            const cellType = this.gridData[row][col];
            return cellType === 'enemy_path' || cellType === 'enemy_start' || cellType === 'enemy_end';
        };
        
        while (queue.length > 0) {
            const [row, col, path] = queue.shift();
            
            if (row === end[0] && col === end[1]) {
                return path;
            }
            
            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                const key = `${newRow},${newCol}`;
                
                if (!visited.has(key) && isValidCell(newRow, newCol)) {
                    visited.add(key);
                    queue.push([newRow, newCol, [...path, [newRow, newCol]]]);
                }
            }
        }
        
        return null;
    },
    
    playMap() {
    const validation = this.validateMap();
    
    if (!validation.valid) {
        this.showError(validation.error);
        return;
    }
    
    // Создаем данные карты
    const customMapData = {
        imageSrc: null,
        enemyPath: validation.path,
        placementCells: validation.placementCells,
        obstacleCells: validation.wallCells,
        isCustom: true
    };
    
    // Сохраняем в MAP_DATA
    MAP_DATA.custom = customMapData;
    
    // Запускаем игру
    selectedMapName = 'custom';
    currentMapData = customMapData;
    mapLoaded = true;
    
    // Проверяем загружены ли изображения
    if (!window.customMapImagesLoaded) {
        console.log("Изображения еще не загружены, ждем...");
        // Ждем загрузки изображений
        const checkImagesInterval = setInterval(() => {
            if (window.customMapImagesLoaded) {
                clearInterval(checkImagesInterval);
                this.startCustomGame();
            }
        }, 100);
    } else {
        this.startCustomGame();
    }
},

startCustomGame() {
	// Останавливаем предыдущую игру если она была
    if (window.animationFrameId) {
        cancelAnimationFrame(window.animationFrameId);
        window.animationFrameId = null;
    }
	
    document.getElementById('mapEditorScreen').style.display = 'none';
    document.getElementById('gameInterface').style.display = 'flex';
    document.getElementById('gameInterface').style.flexDirection = 'column';
    document.getElementById('gameInterface').style.height = '100vh';
    
    if (typeof window.initializeGame === 'function') {
        window.initializeGame();
    }
},
    
    saveMap() {
        const validation = this.validateMap();
        
        if (!validation.valid) {
            this.showError(validation.error);
            return;
        }
        
        const mapData = {
            gridData: this.gridData,
            path: validation.path,
            placementCells: validation.placementCells,
            wallCells: validation.wallCells
        };
        
        const json = JSON.stringify(mapData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom_map.json';
        a.click();
        URL.revokeObjectURL(url);
    },
    
    loadMap(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const mapData = JSON.parse(e.target.result);
                if (mapData.gridData) {
                    this.gridData = mapData.gridData;
                    this.draw();
                }
            } catch (error) {
                this.showError('Ошибка загрузки файла карты!');
            }
        };
        reader.readAsText(file);
        
        // Очищаем input для повторной загрузки того же файла
        event.target.value = '';
    },
    
    clearMap() {
        if (confirm('Вы уверены, что хотите очистить всю карту?')) {
            this.clearGrid();
            this.draw();
        }
    },
    
    backToMenu() {
        document.getElementById('mapEditorScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'flex';
    },
    
    showError(message) {
        document.getElementById('editorErrorMessage').textContent = message;
        document.getElementById('editorErrorModal').style.display = 'flex';
    }
};