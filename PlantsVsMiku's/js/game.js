// Simple grid-based Plants vs Zombies style engine (prototype)
class Grid {
    constructor(rows, cols, offsetX, width, height, offsetY = 0) {
        this.rows = rows; this.cols = cols;
        this.offsetX = offsetX; this.width = width; this.height = height;
        this.offsetY = offsetY;
        this.cellW = width / cols; this.cellH = height / rows;
        this.cells = Array.from({ length: rows }, () => Array(cols).fill(null));
    }
    inBounds(r, c) { return r >= 0 && r < this.rows && c >= 0 && c < this.cols; }
    placePlant(r, c, plant) { if (!this.inBounds(r, c)) return false; if (this.cells[r][c]) return false; this.cells[r][c] = plant; return true; }
    removePlant(r, c) { if (!this.inBounds(r, c)) return; this.cells[r][c] = null; }
    getPlant(r, c) { if (!this.inBounds(r, c)) return null; return this.cells[r][c]; }
    // convert grid cell to canvas coords
    cellToCoord(r, c) { return { x: this.offsetX + c * this.cellW, y: this.offsetY + r * this.cellH, w: this.cellW, h: this.cellH }; }
    // convert canvas x,y to grid indices
    coordToCell(x, y) { const c = Math.floor((x - this.offsetX) / this.cellW); const r = Math.floor((y - this.offsetY) / this.cellH); return { r, c }; }
}

class Plant {
    constructor(type, row, col, grid) {
        const defs = Plant.TYPES[type];
        this.type = type; this.row = row; this.col = col; this.grid = grid;
        this.health = defs.health; this.cost = defs.cost; this.damage = defs.damage; this.cooldown = defs.cooldown;
        this.cool = 0; this.w = grid.cellW; this.h = grid.cellH;
        this.spriteImage = defs.spriteImage;
        this.sunTimer = defs.sunInterval || 0;
    }
    update(dt, game) {
        this.cool = Math.max(0, this.cool - dt);
        if (this.type === 'shooter' && this.cool === 0) {
            const pos = this.grid.cellToCoord(this.row, this.col);
            const proj = new Projectile(pos.x + this.w * 0.6, pos.y + this.h / 2, 300, this.damage, this.row);
            game.projectiles.push(proj);
            this.cool = this.cooldown;
        }

        if (this.type === 'sunflower') {
            this.sunTimer -= dt;
            if (this.sunTimer <= 0) {
                const pos = this.grid.cellToCoord(this.row, this.col);
                // spawn a sun that falls a short distance (collectible)
                const s = new Sun(pos.x + pos.w / 2, pos.y + pos.h / 2 - 10, 40);
                game.suns.push(s);
                this.sunTimer = Plant.TYPES['sunflower'].sunInterval;
            }
        }
    }
    draw(ctx) {
        const pos = this.grid.cellToCoord(this.row, this.col);
        // Draw plant sprite if available and successfully loaded
        if (this.spriteImage && this.spriteImage.complete && this.spriteImage.naturalWidth) {
            ctx.drawImage(this.spriteImage, pos.x + 4, pos.y + 4, pos.w - 8, pos.h - 8);
        } else {
            ctx.fillStyle = this.type === 'shooter' ? '#4caf50' : (this.type === 'sunflower' ? '#ffb300' : '#8d6e63');
            ctx.fillRect(pos.x + 4, pos.y + 4, pos.w - 8, pos.h - 8);
        }
        ctx.fillStyle = '#000'; ctx.font = '12px sans-serif'; ctx.fillText(Math.round(this.health), pos.x + 8, pos.y + 16);
    }
}
// Load plant images
const PLANT_IMAGES = {
    shooter: new Image(),
    wall: new Image(),
    sunflower: new Image()
};
PLANT_IMAGES.shooter.src = 'sprite/Leeku.png';
PLANT_IMAGES.wall.src = 'sprite/miku-nut.png';
PLANT_IMAGES.sunflower.src = 'sprite/Sunshine_Leek.png';
PLANT_IMAGES.shooter.onerror = () => console.warn('Failed to load plant image: sprite/Leeku.png');
PLANT_IMAGES.wall.onerror = () => console.warn('Failed to load plant image: sprite/miku-nut.png');
PLANT_IMAGES.sunflower.onerror = () => console.warn('Failed to load plant image: sprite/Sunshine_Leek.png');

// Load projectile image
const PROJECTILE_IMAGE = new Image();
PROJECTILE_IMAGE.src = 'sprite/leek-projectile.png';
PROJECTILE_IMAGE.onerror = () => console.warn('Failed to load projectile image: sprite/leek-projectile.png');

Plant.TYPES = {
    shooter: { health: 100, cost: 100, damage: 20, cooldown: 1.2, spriteImage: PLANT_IMAGES.shooter },
    wall: { health: 300, cost: 50, damage: 0, cooldown: 1.0, spriteImage: PLANT_IMAGES.wall },
    sunflower: { health: 80, cost: 50, damage: 0, cooldown: 1.0, sunInterval: 7, spriteImage: PLANT_IMAGES.sunflower }
};

class Projectile {
    constructor(x, y, speed, damage, row) { this.x = x; this.y = y; this.vx = speed; this.damage = damage; this.row = row; this.radius = 6; this.dead = false; }
    update(dt, game) { this.x += this.vx * dt; if (this.x > game.width + 50) this.dead = true; }
    draw(ctx) { 
        if (PROJECTILE_IMAGE && PROJECTILE_IMAGE.complete && PROJECTILE_IMAGE.naturalWidth) {
            ctx.drawImage(PROJECTILE_IMAGE, this.x - 12, this.y - 12, 24, 24);
        } else {
            ctx.fillStyle = '#ffeb3b'; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        }
    }
}

class Sun {
    constructor(x, y, vy) { this.x = x; this.y = y; this.vy = vy; this.radius = 24; this.dead = false; this.landed = false; this.landedTimer = 0; }
    update(dt, game) { this.y += this.vy * dt; if (this.y > game.height - 40) { this.vy = 0; this.landed = true; } if (this.landed) { this.landedTimer += dt; if (this.landedTimer > 3) this.dead = true; } }
    draw(ctx) { ctx.fillStyle = '#ffeb3b'; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.font = '12px sans-serif'; ctx.fillText('+25', this.x - 10, this.y + 4); }
    contains(px, py) { const dx = px - this.x, dy = py - this.y; return dx * dx + dy * dy <= this.radius * this.radius; }
}

class MikuZombie {
    constructor(type, row, x, grid) {
        const defs = MikuZombie.TYPES[type];
        this.type = type;
        this.row = row;
        this.x = x;
        this.grid = grid;
        this.health = defs.health;
        this.speed = defs.speed;
        this.damage = defs.damage;
        this.cooldown = defs.cooldown;
        this.attackCool = 0;
        this.width = grid.cellW * 0.9;
        this.height = grid.cellH * 0.9;
        this.dead = false;
        this.spriteImage = defs.spriteImage;
    }

    update(dt, game) {
        if (this.dead) return;
        
        // find column index relative to grid
        const col = Math.floor((this.x - this.grid.offsetX) / this.grid.cellW);
        const aheadCol = Math.max(0, col);
        const plant = this.grid.getPlant(this.row, aheadCol);
        if (plant && this.x <= this.grid.offsetX + (aheadCol + 1) * this.grid.cellW - 10) {
            // attack
            this.attackCool = Math.max(0, this.attackCool - dt);
            if (this.attackCool === 0) {
                plant.health -= this.damage;
                this.attackCool = this.cooldown;
                if (plant.health <= 0) {
                    this.grid.removePlant(this.row, aheadCol);
                }
            }
        } else {
            this.x -= this.speed * dt;
        }
        if (this.x < 20) {
            game.gameOver = true;
        }
    }

    draw(ctx) {
        const cellW = this.grid.cellW;
        const cellH = this.grid.cellH;
        const pos = this.grid.cellToCoord(this.row, Math.min(this.grid.cols - 1, Math.floor((this.x - this.grid.offsetX) / cellW)));
        
        // Draw sprite if loaded successfully, otherwise fallback to colored rect.
        // If this sprite failed, try using the normalmiku image as a fallback.
        let drawImg = null;
        if (this.spriteImage && this.spriteImage.complete && this.spriteImage.naturalWidth) drawImg = this.spriteImage;
        else if (SPRITE_IMAGES && SPRITE_IMAGES.normalmiku && SPRITE_IMAGES.normalmiku.complete && SPRITE_IMAGES.normalmiku.naturalWidth) drawImg = SPRITE_IMAGES.normalmiku;

        if (drawImg) {
            ctx.drawImage(
                drawImg,
                this.x - cellW / 2, pos.y - cellH * 0.3, cellW, cellH
            );
        } else {
            // Fallback: colored rectangle
            ctx.fillStyle = '#9c27b0';
            ctx.fillRect(this.x - cellW / 2, pos.y - cellH * 0.3, cellW, cellH);
        }
        
        // Draw health bar
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.fillText(Math.round(this.health), this.x - 8, pos.y + 14);
    }
}

// Load individual Miku images
const SPRITE_IMAGES = {
    gothmiku: new Image(),
    lowpoly: new Image(),
    normalmiku: new Image(),
    retardedmiku: new Image(),
    toastermiku: new Image()
};

// Try primary path under spriteSheets, fall back to sprite/ if load fails
function tryLoad(img, primaryPath, fallbackPath, name) {
    img.src = primaryPath;
    img.onerror = () => {
        console.warn('Primary sprite load failed for', primaryPath, '— trying', fallbackPath);
        img.onerror = () => console.warn('Failed to load sprite:', primaryPath, 'and', fallbackPath);
        img.src = fallbackPath;
    };
}

tryLoad(SPRITE_IMAGES.gothmiku, 'spriteSheets/goth-miku.png', 'sprite/goth-miku.png', 'gothmiku');
tryLoad(SPRITE_IMAGES.lowpoly, 'spriteSheets/fast-miku.png', 'sprite/fast-miku.png', 'lowpoly');
tryLoad(SPRITE_IMAGES.normalmiku, 'spriteSheets/main-miku.png', 'sprite/main-miku.png', 'normalmiku');
tryLoad(SPRITE_IMAGES.retardedmiku, 'spriteSheets/inverted-miku.png', 'sprite/inverted-miku.png', 'retardedmiku');
tryLoad(SPRITE_IMAGES.toastermiku, 'spriteSheets/toaster-miku.png', 'sprite/toaster-miku.png', 'toastermiku');

MikuZombie.TYPES = {
    gothmiku: { health: 120, speed: 20, damage: 10, cooldown: 0.9, spriteImage: SPRITE_IMAGES.gothmiku },
    lowpoly: { health: 80, speed: 40, damage: 8, cooldown: 0.8, spriteImage: SPRITE_IMAGES.lowpoly },
    normalmiku: { health: 100, speed: 25, damage: 12, cooldown: 0.9, spriteImage: SPRITE_IMAGES.normalmiku },
    retardedmiku: { health: 300, speed: 10, damage: 18, cooldown: 1.2, spriteImage: SPRITE_IMAGES.retardedmiku },
    toastermiku: { health: 150, speed: 35, damage: 15, cooldown: 1.0, spriteImage: SPRITE_IMAGES.toastermiku }
};

// 5-level progression with increasing difficulty
const LEVELS = [
    {
        name: 'Level 1: Garden Beginner',
        totalZombieCount: 20,
        waves: [
            { zombieCount: 6, spawnInterval: 4.0, allowedTypes: ['gothmiku'] },
            { zombieCount: 7, spawnInterval: 3.0, allowedTypes: ['gothmiku', 'lowpoly'] },
            { zombieCount: 7, spawnInterval: 2.5, allowedTypes: ['gothmiku', 'lowpoly'], final: true }
        ]
    },
    {
        name: 'Level 2: Growing Threat',
        totalZombieCount: 28,
        waves: [
            { zombieCount: 8, spawnInterval: 3.5, allowedTypes: ['gothmiku', 'lowpoly'] },
            { zombieCount: 10, spawnInterval: 2.5, allowedTypes: ['gothmiku', 'lowpoly', 'normalmiku'] },
            { zombieCount: 10, spawnInterval: 1.8, allowedTypes: ['gothmiku', 'lowpoly', 'normalmiku'], final: true }
        ]
    },
    {
        name: 'Level 3: Invasion',
        totalZombieCount: 35,
        waves: [
            { zombieCount: 10, spawnInterval: 3.2, allowedTypes: ['gothmiku', 'lowpoly', 'normalmiku'] },
            { zombieCount: 12, spawnInterval: 2.0, allowedTypes: ['gothmiku', 'lowpoly', 'normalmiku', 'retardedmiku'] },
            { zombieCount: 13, spawnInterval: 1.2, allowedTypes: ['gothmiku', 'lowpoly', 'normalmiku', 'retardedmiku', 'toastermiku'], final: true }
        ]
    },
    {
        name: 'Level 4: Onslaught',
        totalZombieCount: 42,
        waves: [
            { zombieCount: 12, spawnInterval: 2.8, allowedTypes: ['gothmiku', 'lowpoly', 'normalmiku', 'retardedmiku'] },
            { zombieCount: 15, spawnInterval: 1.5, allowedTypes: ['gothmiku', 'lowpoly', 'normalmiku', 'retardedmiku', 'toastermiku'] },
            { zombieCount: 15, spawnInterval: 1.0, allowedTypes: ['gothmiku', 'lowpoly', 'normalmiku', 'retardedmiku', 'toastermiku'], final: true }
        ]
    },
    {
        name: 'Level 5: Final Stand',
        totalZombieCount: 50,
        waves: [
            { zombieCount: 15, spawnInterval: 2.5, allowedTypes: ['gothmiku', 'lowpoly', 'normalmiku', 'retardedmiku', 'toastermiku'] },
            { zombieCount: 18, spawnInterval: 1.2, allowedTypes: ['gothmiku', 'lowpoly', 'normalmiku', 'retardedmiku', 'toastermiku'] },
            { zombieCount: 17, spawnInterval: 0.8, allowedTypes: ['gothmiku', 'lowpoly', 'normalmiku', 'retardedmiku', 'toastermiku'], final: true }
        ]
    }
];

class Game {
    constructor(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.width = canvas.width = canvas.clientWidth; this.height = canvas.height = canvas.clientHeight;
        this.rows = 5; this.cols = 9;
        // Playfield is the canvas parent; grid uses full canvas width
        // Grid layout: entire canvas is the playfield (no left/right margins here)
        const gridHeight = Math.max(0, this.height - 8);
        const gridOffsetY = 4;
        this.grid = new Grid(this.rows, this.cols, 0, this.width, gridHeight, gridOffsetY);

        this.plants = []; this.zombies = []; this.projectiles = []; this.suns = [];
        // Level progression
        this.currentLevel = 0;
        this.levelConfig = LEVELS[this.currentLevel];
        this.totalLevels = LEVELS.length;
        this.finalVictory = false;
        // runtime counters
        this.zombiesSpawned = 0; this.zombiesAlive = 0; this.currentWaveIndex = -1; this.inWave = false; this.waveSpawnTimer = 0; this.wavePauseTimer = 0; this.wavePauseDuration = 3;
        this.showFinalWaveMsg = false; this.finalWaveMsgTimer = 0;
        this.spawnSunTimer = 0; this.spawnSunInterval = 5; // falling sun every 5s
        this.difficultyTimer = 0; this.sun = 150; this.selectedPlant = null; this.gameOver = false; this.win = false; this.gameStarted = false;
        this.last = performance.now();
        this.initInput();
        this.updatePanelDisplay();
        requestAnimationFrame(this.loop.bind(this));
    }
    resize() {
        this.width = this.canvas.width = this.canvas.clientWidth;
        this.height = this.canvas.height = this.canvas.clientHeight;
        const gridHeight = Math.max(0, this.height - 8);
        const gridOffsetY = 4;
        this.grid.width = this.width;
        this.grid.height = gridHeight;
        this.grid.offsetY = gridOffsetY;
        this.grid.cellW = this.grid.width / this.grid.cols;
        this.grid.cellH = this.grid.height / this.grid.rows;
    }
    updatePanelDisplay() {
        const waveTotal = this.levelConfig.waves.length;
        const waveNum = Math.max(1, this.currentWaveIndex + 1);
        const totalZom = this.levelConfig.totalZombieCount;
        let el = document.getElementById('wave-number'); if(el) el.textContent = String(waveNum);
        el = document.getElementById('wave-total'); if(el) el.textContent = String(waveTotal);
        el = document.getElementById('zombie-spawned'); if(el) el.textContent = String(this.zombiesSpawned);
        el = document.getElementById('zombie-total'); if(el) el.textContent = String(totalZom);
        el = document.getElementById('level-display'); if(el) el.textContent = `${this.currentLevel + 1}/5`;
    }
    startNextWave() {
        const next = this.currentWaveIndex + 1;
        if (next >= this.levelConfig.waves.length) return;
        this.currentWaveIndex = next;
        const wave = this.levelConfig.waves[this.currentWaveIndex];
        // copy remaining counter so we don't mutate config
        wave.remaining = wave.zombieCount;
        this.inWave = true;
        this.waveSpawnTimer = 0;
        // show final wave announcement if this wave is marked final
        if (wave.final) {
            this.showFinalWaveMsg = true;
            this.finalWaveMsgTimer = 4.0; // show for 4 seconds
        }
    }
    nextLevel() {
        this.currentLevel += 1;
        if (this.currentLevel >= this.totalLevels) {
            this.finalVictory = true;
            return;
        }
        // Reset for next level
        this.levelConfig = LEVELS[this.currentLevel];
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.suns = [];
        this.zombiesSpawned = 0;
        this.zombiesAlive = 0;
        this.currentWaveIndex = -1;
        this.inWave = false;
        this.waveSpawnTimer = 0;
        this.wavePauseTimer = 0;
        this.showFinalWaveMsg = false;
        this.win = false;
        this.gameStarted = true; // Auto-start next level
        this.sun = 150;
        this.updatePanelDisplay();
    }
    initInput() {
        this.canvas.addEventListener('click', (ev) => {
            const rect = this.canvas.getBoundingClientRect(); const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
            // first, check suns (click to collect)
            for (let i = this.suns.length - 1; i >= 0; i--) {
                const s = this.suns[i]; if (s.contains(x, y)) { this.sun += 25; this.suns.splice(i, 1); this.updateSunDisplay(); return; }
            }

            // else attempt to plant
            // check if inside lawn region
            if (x < this.grid.offsetX || x > this.grid.offsetX + this.grid.width) return;
            const { r, c } = this.grid.coordToCell(x, y);
            if (!this.grid.inBounds(r, c)) return;
            if (!this.selectedPlant) return;
            const def = Plant.TYPES[this.selectedPlant]; if (this.sun < def.cost) { this.toast('Not enough sun'); return; }
            if (this.grid.getPlant(r, c)) { this.toast('Tile occupied'); return; }
            const p = new Plant(this.selectedPlant, r, c, this.grid);
            this.grid.placePlant(r, c, p); this.sun -= def.cost; this.updateSunDisplay();
        });
    }
    toast(msg) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el); setTimeout(() => el.remove(), 1200); }
    updateSunDisplay() { const el = document.getElementById('sun-count'); if (el) el.textContent = String(this.sun); }
    spawnZombie(type) {
        if (this.zombiesSpawned >= this.levelConfig.totalZombieCount) return null;
        const row = Math.floor(Math.random() * this.rows);
        const spawnX = this.width + 40;
        const z = new MikuZombie(type, row, spawnX, this.grid);
        this.zombies.push(z);
        this.zombiesSpawned += 1;
        this.zombiesAlive += 1;
        this.updatePanelDisplay();
        return z;
    }
    spawnFallingSun() { const minX = this.grid.offsetX + 20; const maxX = this.grid.offsetX + this.grid.width - 20; const x = Math.random() * (maxX - minX) + minX; const s = new Sun(x, -20, 60); this.suns.push(s); }
    loop(now) {
        const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
        if (this.gameOver) { this.draw(); this.drawGameOver(); requestAnimationFrame(this.loop.bind(this)); return; }
        // Don't update game logic until started, but still draw
        if (!this.gameStarted) { this.draw(); requestAnimationFrame(this.loop.bind(this)); return; }
        // update difficulty (keeps legacy behavior for other scaling if needed)
        this.difficultyTimer += dt; if (this.difficultyTimer > 20) { this.difficultyTimer = 0; }

        // Wave management
        if (!this.inWave) {
            // start first wave if none started
            if (this.currentWaveIndex === -1) this.startNextWave();
            else {
                // pause between waves
                this.wavePauseTimer += dt;
                if (this.wavePauseTimer >= this.wavePauseDuration) {
                    this.startNextWave();
                }
            }
        } else {
            const wave = this.levelConfig.waves[this.currentWaveIndex];
            // spawn periodically during current wave until its quota is met
            if (wave && wave.remaining > 0 && this.zombiesSpawned < this.levelConfig.totalZombieCount) {
                this.waveSpawnTimer += dt;
                if (this.waveSpawnTimer >= wave.spawnInterval) {
                    this.waveSpawnTimer = 0;
                    // pick allowed type
                    const types = wave.allowedTypes;
                    const type = types[Math.floor(Math.random() * types.length)];
                    this.spawnZombie(type);
                    wave.remaining -= 1;
                    // if this wave finished spawning
                    if (wave.remaining <= 0) {
                        this.inWave = false; this.wavePauseTimer = 0;
                    }
                }
            } else if (wave && wave.remaining <= 0) {
                this.inWave = false; this.wavePauseTimer = 0;
            }
        }

        // spawn falling suns
        this.spawnSunTimer += dt; if (this.spawnSunTimer > this.spawnSunInterval) { this.spawnSunTimer = 0; this.spawnFallingSun(); }

            // final wave message timer
            if (this.showFinalWaveMsg) {
                this.finalWaveMsgTimer -= dt;
                if (this.finalWaveMsgTimer <= 0) this.showFinalWaveMsg = false;
            }
        
            // update plants
        for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) { const plant = this.grid.getPlant(r, c); if (plant) plant.update(dt, this); }
        // update projectiles
        for (const proj of this.projectiles) proj.update(dt, this);
        // collisions projectile vs zombies
        for (const proj of this.projectiles) {
            for (const z of this.zombies) {
                if (z.row !== proj.row) continue;
                const dx = Math.abs(proj.x - z.x);
                if (dx < 24) { z.health -= proj.damage; proj.dead = true; if (z.health <= 0) z.dead = true; break; }
            }
        }
        // update zombies
        for (const z of this.zombies) z.update(dt, this);
        // update suns
        for (const s of this.suns) s.update(dt, this);
        // cleanup: handle dead zombies (decrement alive counter once)
        this.projectiles = this.projectiles.filter(p => !p.dead);
        const remainingZ = [];
        for (const z of this.zombies) {
            if (z.dead) {
                if (!z._countedDead) { z._countedDead = true; this.zombiesAlive = Math.max(0, this.zombiesAlive - 1); }
                continue;
            }
            remainingZ.push(z);
        }
        this.zombies = remainingZ;
        this.suns = this.suns.filter(s => !s.dead);

        // Check win condition: all zombies spawned and none alive
        const allWavesSpawned = (this.zombiesSpawned >= this.levelConfig.totalZombieCount);
        if (allWavesSpawned && this.zombiesAlive === 0 && !this.win) {
            this.win = true;
            // Auto-advance to next level after 2 seconds
            setTimeout(() => this.nextLevel(), 2000);
        }
        // draw
        this.draw();
        requestAnimationFrame(this.loop.bind(this));
    }
    draw() {
        const ctx = this.ctx; ctx.clearRect(0, 0, this.width, this.height);
        // grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        for (let r = 0; r <= this.rows; r++) { const y = this.grid.offsetY + r * this.grid.cellH; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke(); }
        for (let c = 0; c <= this.cols; c++) { const x = this.grid.offsetX + c * this.grid.cellW; ctx.beginPath(); ctx.moveTo(x, this.grid.offsetY); ctx.lineTo(x, this.grid.offsetY + this.grid.height); ctx.stroke(); }

        // plants
        for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) { const plant = this.grid.getPlant(r, c); if (plant) plant.draw(ctx); }
        // projectiles
        for (const proj of this.projectiles) proj.draw(ctx);
        // zombies
        for (const z of this.zombies) z.draw(ctx);
        // suns
        for (const s of this.suns) s.draw(ctx);
        if (this.finalVictory) this.drawFinalVictory();
        else if (this.win) this.drawLevelWin();
        // final wave announcement overlay
        if (this.showFinalWaveMsg) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, this.height*0.35, this.width, this.height*0.3);
            ctx.fillStyle = '#ff4444'; ctx.font = '56px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Final Wave!', this.width/2, this.height/2 + 10);
            ctx.textAlign = 'start';
        }
    }
    drawLevelWin() { const ctx = this.ctx; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, this.width, this.height); ctx.fillStyle = '#fff'; ctx.font = '48px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Level Complete!', this.width / 2, this.height / 2 - 20); ctx.font = '24px sans-serif'; ctx.fillText('Next level in 2 seconds...', this.width / 2, this.height / 2 + 30); ctx.textAlign = 'start'; }
    drawFinalVictory() { const ctx = this.ctx; ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, this.width, this.height); ctx.fillStyle = '#ffeb3b'; ctx.font = 'bold 64px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🏆 YOU WIN! 🏆', this.width / 2, this.height / 2 - 60); ctx.fillStyle = '#fff'; ctx.font = '32px sans-serif'; ctx.fillText('You defeated all 5 levels!', this.width / 2, this.height / 2 + 30); ctx.font = '20px sans-serif'; ctx.fillText('Your trophy will appear here soon!', this.width / 2, this.height / 2 + 80); ctx.textAlign = 'start'; }
    drawGameOver() { const ctx = this.ctx; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, this.width, this.height); ctx.fillStyle = '#fff'; ctx.font = '48px sans-serif'; ctx.fillText('Game Over', this.width / 2 - 120, this.height / 2); }
}

// Wire up UI
window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas');
    const startBtn = document.getElementById('start-btn');
    const startOverlay = document.getElementById('start-overlay');
    
    // ensure canvas matches layout and notify game on resize
    let game = null;
    function resize() { 
        canvas.width = canvas.clientWidth; 
        canvas.height = canvas.clientHeight; 
        if (game && typeof game.resize === 'function') game.resize();
    }
    window.addEventListener('resize', resize);
    
    game = new Game(canvas);
    resize();

    // Start button handler
    if (startBtn && startOverlay) {
        startBtn.addEventListener('click', () => {
            console.log('Start button clicked');
            game.gameStarted = true;
            startOverlay.classList.add('hidden');
        });
    } else {
        console.warn('Start button or overlay not found');
    }

    // plant picker
    document.querySelectorAll('.plant-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.plant-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            game.selectedPlant = btn.dataset.type;
        });
    });
    // default select
    const first = document.querySelector('.plant-btn'); if (first) first.click();
});
