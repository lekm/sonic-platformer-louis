class SonicGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.gameState = 'characterSelect';
        this.selectedCharacter = 0;
        this.characters = [
            { name: 'Sonic', color: '#0066FF', superColor: '#FFD700', speed: 5, jumpPower: 15, ability: 'none' },
            { name: 'Shadow', color: '#1C1C1C', superColor: '#FF0000', speed: 6, jumpPower: 14, ability: 'teleport' },
            { name: 'Tails', color: '#FF8C00', superColor: '#FFFF00', speed: 4, jumpPower: 18, ability: 'fly' },
            { name: 'Knuckles', color: '#FF0000', superColor: '#FF69B4', speed: 4, jumpPower: 12, ability: 'glide' },
            { name: 'Amy', color: '#FF69B4', superColor: '#FF1493', speed: 4.5, jumpPower: 16, ability: 'doubleJump' },
            { name: 'Dark Sonic', color: '#2F2F2F', superColor: '#800080', speed: 7, jumpPower: 17, ability: 'superSpinDash' }
        ];
        
        this.camera = { x: 0, y: 0 };
        this.score = 0;
        this.rings = 0;
        this.lives = 3;
        this.currentLevel = 1;
        this.levelComplete = false;
        this.totalLevels = 3;
        this.superSonic = false;
        this.superSonicTimer = 0;
        this.superSonicDuration = 600; // 10 seconds at 60fps
        
        this.particles = [];
        this.animationTime = 0;
        this.backgroundOffset = 0;
        
        this.audioContext = null;
        this.sounds = {};
        this.initAudio();
        
        this.player = {
            x: 100,
            y: 400,
            width: 32,
            height: 32,
            velocityX: 0,
            velocityY: 0,
            speed: 5,
            jumpPower: 15,
            onGround: false,
            spindash: false,
            spindashCharge: 0,
            animFrame: 0,
            direction: 1,
            trail: [],
            character: 0,
            // Ability-specific states
            flying: false,
            flyTime: 0,
            gliding: false,
            doubleJumpUsed: false,
            teleportCooldown: 0,
            invulnerable: false,
            invulnerableTime: 0,
            // Speed boost mechanics
            speedBoost: 0,
            speedBoostTime: 0,
            maxSpeedBoost: 2.5
        };
        
        this.levels = this.initializeLevels();
        this.loadLevel(this.currentLevel);
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    initializeLevels() {
        return {
            1: {
                name: "Green Hill",
                platforms: [
                    // Starting platform - wide and flat
                    { x: 0, y: 550, width: 800, height: 50 },
                    
                    // Speed boost section - gentle slope down
                    { x: 800, y: 560, width: 200, height: 40 },
                    { x: 1000, y: 570, width: 200, height: 40 },
                    { x: 1200, y: 575, width: 300, height: 40 },
                    
                    // Loop-de-loop approach
                    { x: 1500, y: 575, width: 100, height: 40 },
                    
                    // Loop-de-loop structure (circular path)
                    { x: 1600, y: 570, width: 50, height: 20 },    // entry ramp
                    { x: 1650, y: 560, width: 40, height: 20 },
                    { x: 1690, y: 540, width: 30, height: 20 },
                    { x: 1720, y: 510, width: 30, height: 20 },
                    { x: 1750, y: 470, width: 30, height: 20 },
                    { x: 1780, y: 420, width: 30, height: 20 },
                    { x: 1810, y: 360, width: 30, height: 20 },
                    { x: 1840, y: 300, width: 30, height: 20 },
                    { x: 1870, y: 250, width: 30, height: 20 },    // top of loop
                    { x: 1900, y: 200, width: 40, height: 20 },    // peak
                    { x: 1940, y: 250, width: 30, height: 20 },    // start descent
                    { x: 1970, y: 300, width: 30, height: 20 },
                    { x: 2000, y: 360, width: 30, height: 20 },
                    { x: 2030, y: 420, width: 30, height: 20 },
                    { x: 2060, y: 470, width: 30, height: 20 },
                    { x: 2090, y: 510, width: 30, height: 20 },
                    { x: 2120, y: 540, width: 30, height: 20 },
                    { x: 2150, y: 560, width: 40, height: 20 },
                    { x: 2190, y: 570, width: 50, height: 20 },    // exit ramp
                    
                    // Post-loop straight section
                    { x: 2240, y: 575, width: 400, height: 40 },
                    
                    // Speed boost zone before upside-down section
                    { x: 2640, y: 575, width: 160, height: 40, type: 'speedboost' },
                    
                    // Upside-down section (requires speed to stick)
                    { x: 2800, y: 575, width: 50, height: 20 },    // ramp up
                    { x: 2850, y: 560, width: 50, height: 20 },
                    { x: 2900, y: 540, width: 50, height: 20 },
                    { x: 2950, y: 510, width: 50, height: 20 },
                    { x: 3000, y: 470, width: 50, height: 20 },
                    { x: 3050, y: 420, width: 50, height: 20 },
                    { x: 3100, y: 350, width: 60, height: 20 },    // top section
                    { x: 3160, y: 280, width: 80, height: 20, type: 'ceiling' },  // upside-down bit
                    { x: 3240, y: 280, width: 80, height: 20, type: 'ceiling' },
                    { x: 3320, y: 280, width: 80, height: 20, type: 'ceiling' },
                    { x: 3400, y: 350, width: 60, height: 20 },    // come back down
                    { x: 3460, y: 420, width: 50, height: 20 },
                    { x: 3510, y: 470, width: 50, height: 20 },
                    { x: 3560, y: 510, width: 50, height: 20 },
                    { x: 3610, y: 540, width: 50, height: 20 },
                    { x: 3660, y: 560, width: 50, height: 20 },
                    { x: 3710, y: 575, width: 50, height: 20 },    // back to ground
                    
                    // Final straight section to finish
                    { x: 3760, y: 575, width: 600, height: 40 }
                ],
                collectibles: [
                    // Starting section rings - flowing along the ground
                    { x: 200, y: 520, type: 'ring', collected: false },
                    { x: 250, y: 520, type: 'ring', collected: false },
                    { x: 300, y: 520, type: 'ring', collected: false },
                    { x: 350, y: 520, type: 'ring', collected: false },
                    { x: 400, y: 520, type: 'ring', collected: false },
                    { x: 450, y: 520, type: 'ring', collected: false },
                    { x: 500, y: 520, type: 'ring', collected: false },
                    { x: 550, y: 520, type: 'ring', collected: false },
                    { x: 600, y: 520, type: 'ring', collected: false },
                    { x: 650, y: 520, type: 'ring', collected: false },
                    { x: 700, y: 520, type: 'ring', collected: false },
                    { x: 750, y: 520, type: 'ring', collected: false },
                    
                    // Speed boost approach rings
                    { x: 850, y: 530, type: 'ring', collected: false },
                    { x: 900, y: 530, type: 'ring', collected: false },
                    { x: 950, y: 530, type: 'ring', collected: false },
                    { x: 1050, y: 540, type: 'ring', collected: false },
                    { x: 1100, y: 540, type: 'ring', collected: false },
                    { x: 1150, y: 540, type: 'ring', collected: false },
                    { x: 1250, y: 545, type: 'ring', collected: false },
                    { x: 1300, y: 545, type: 'ring', collected: false },
                    { x: 1350, y: 545, type: 'ring', collected: false },
                    { x: 1400, y: 545, type: 'ring', collected: false },
                    { x: 1450, y: 545, type: 'ring', collected: false },
                    
                    // Loop-de-loop entry rings
                    { x: 1550, y: 545, type: 'ring', collected: false },
                    { x: 1620, y: 540, type: 'ring', collected: false },
                    { x: 1670, y: 530, type: 'ring', collected: false },
                    { x: 1710, y: 510, type: 'ring', collected: false },
                    { x: 1740, y: 480, type: 'ring', collected: false },
                    { x: 1770, y: 440, type: 'ring', collected: false },
                    { x: 1800, y: 390, type: 'ring', collected: false },
                    { x: 1830, y: 330, type: 'ring', collected: false },
                    { x: 1860, y: 280, type: 'ring', collected: false },
                    { x: 1890, y: 230, type: 'ring', collected: false },
                    
                    // Top of loop and descent
                    { x: 1920, y: 180, type: 'ring', collected: false },
                    { x: 1950, y: 230, type: 'ring', collected: false },
                    { x: 1980, y: 280, type: 'ring', collected: false },
                    { x: 2010, y: 330, type: 'ring', collected: false },
                    { x: 2040, y: 390, type: 'ring', collected: false },
                    { x: 2070, y: 440, type: 'ring', collected: false },
                    { x: 2100, y: 480, type: 'ring', collected: false },
                    { x: 2130, y: 510, type: 'ring', collected: false },
                    { x: 2170, y: 530, type: 'ring', collected: false },
                    { x: 2210, y: 540, type: 'ring', collected: false },
                    
                    // Post-loop straight section
                    { x: 2300, y: 545, type: 'ring', collected: false },
                    { x: 2350, y: 545, type: 'ring', collected: false },
                    { x: 2400, y: 545, type: 'ring', collected: false },
                    { x: 2450, y: 545, type: 'ring', collected: false },
                    { x: 2500, y: 545, type: 'ring', collected: false },
                    { x: 2550, y: 545, type: 'ring', collected: false },
                    { x: 2600, y: 545, type: 'ring', collected: false },
                    
                    // Speed boost zone rings (special visual effect)
                    { x: 2670, y: 545, type: 'ring', collected: false },
                    { x: 2700, y: 545, type: 'ring', collected: false },
                    { x: 2730, y: 545, type: 'ring', collected: false },
                    { x: 2760, y: 545, type: 'ring', collected: false },
                    
                    // Upside-down section approach
                    { x: 2820, y: 545, type: 'ring', collected: false },
                    { x: 2870, y: 530, type: 'ring', collected: false },
                    { x: 2920, y: 510, type: 'ring', collected: false },
                    { x: 2970, y: 480, type: 'ring', collected: false },
                    { x: 3020, y: 440, type: 'ring', collected: false },
                    { x: 3070, y: 390, type: 'ring', collected: false },
                    { x: 3120, y: 320, type: 'ring', collected: false },
                    
                    // Upside-down ceiling rings (reward for maintaining speed)
                    { x: 3180, y: 250, type: 'ring', collected: false },
                    { x: 3220, y: 250, type: 'ring', collected: false },
                    { x: 3260, y: 250, type: 'ring', collected: false },
                    { x: 3300, y: 250, type: 'ring', collected: false },
                    { x: 3340, y: 250, type: 'ring', collected: false },
                    
                    // Coming back down
                    { x: 3420, y: 320, type: 'ring', collected: false },
                    { x: 3480, y: 390, type: 'ring', collected: false },
                    { x: 3530, y: 440, type: 'ring', collected: false },
                    { x: 3580, y: 480, type: 'ring', collected: false },
                    { x: 3630, y: 510, type: 'ring', collected: false },
                    { x: 3680, y: 530, type: 'ring', collected: false },
                    { x: 3730, y: 545, type: 'ring', collected: false },
                    
                    // Final stretch rings
                    { x: 3800, y: 545, type: 'ring', collected: false },
                    { x: 3850, y: 545, type: 'ring', collected: false },
                    { x: 3900, y: 545, type: 'ring', collected: false },
                    { x: 3950, y: 545, type: 'ring', collected: false },
                    { x: 4000, y: 545, type: 'ring', collected: false },
                    { x: 4050, y: 545, type: 'ring', collected: false },
                    { x: 4100, y: 545, type: 'ring', collected: false },
                    { x: 4150, y: 545, type: 'ring', collected: false },
                    { x: 4200, y: 545, type: 'ring', collected: false },
                    { x: 4250, y: 545, type: 'ring', collected: false },
                    
                    // Bonus rings for exploration (above the main path)
                    { x: 400, y: 400, type: 'ring', collected: false },
                    { x: 450, y: 400, type: 'ring', collected: false },
                    { x: 500, y: 400, type: 'ring', collected: false },
                    { x: 1920, y: 150, type: 'ring', collected: false }, // Top of loop bonus
                    { x: 3280, y: 200, type: 'ring', collected: false }, // Above ceiling section
                    { x: 4000, y: 400, type: 'ring', collected: false },
                    { x: 4050, y: 400, type: 'ring', collected: false },
                    
                    // Powerups strategically placed
                    { x: 1200, y: 515, type: 'superpower', collected: false }, // Before loop
                    { x: 2700, y: 515, type: 'superpower', collected: false }, // In speed boost zone
                    { x: 4100, y: 515, type: 'superpower', collected: false }  // Near finish
                ],
                enemies: [
                    // Ground badniks along the main path - spaced to avoid breaking flow
                    { x: 600, y: 520, width: 24, height: 24, direction: 1, speed: 1, type: 'ground' },
                    { x: 1350, y: 545, width: 24, height: 24, direction: -1, speed: 1, type: 'ground' },
                    { x: 2400, y: 545, width: 24, height: 24, direction: 1, speed: 1, type: 'ground' },
                    { x: 3800, y: 545, width: 24, height: 24, direction: -1, speed: 1, type: 'ground' },
                    
                    // Flying badniks - positioned to threaten but not block the main path
                    { x: 900, y: 400, width: 24, height: 24, direction: 1, speed: 0.8, type: 'flying', startY: 400, flyRange: 60 },
                    { x: 2300, y: 450, width: 24, height: 24, direction: -1, speed: 0.8, type: 'flying', startY: 450, flyRange: 50 },
                    { x: 3200, y: 350, width: 24, height: 24, direction: 1, speed: 0.8, type: 'flying', startY: 350, flyRange: 80 },
                    { x: 4000, y: 450, width: 24, height: 24, direction: -1, speed: 0.8, type: 'flying', startY: 450, flyRange: 60 },
                    
                    // Cannon badniks - positioned to add challenge without stopping momentum
                    { x: 1100, y: 545, width: 32, height: 32, direction: 1, speed: 0, type: 'cannon', lastShot: 0, shotCooldown: 180 },
                    { x: 3000, y: 440, width: 32, height: 32, direction: -1, speed: 0, type: 'cannon', lastShot: 0, shotCooldown: 180 },
                    { x: 4200, y: 545, width: 32, height: 32, direction: 1, speed: 0, type: 'cannon', lastShot: 0, shotCooldown: 180 }
                ],
                projectiles: [],
                finish: { x: 4300, y: 475, width: 50, height: 100 },
                startX: 100,
                startY: 450
            },
            2: {
                name: "Marble Zone",
                platforms: [
                    { x: 0, y: 550, width: 300, height: 50 },
                    { x: 400, y: 480, width: 150, height: 20 },
                    { x: 650, y: 420, width: 100, height: 20 },
                    { x: 850, y: 360, width: 100, height: 20 },
                    { x: 1050, y: 300, width: 150, height: 20 },
                    { x: 1300, y: 240, width: 100, height: 20 },
                    { x: 1500, y: 180, width: 200, height: 20 },
                    { x: 1800, y: 240, width: 100, height: 20 },
                    { x: 2000, y: 300, width: 150, height: 20 },
                    { x: 2250, y: 360, width: 100, height: 20 },
                    { x: 2450, y: 420, width: 200, height: 20 },
                    { x: 2750, y: 480, width: 150, height: 20 },
                    { x: 3000, y: 540, width: 100, height: 20 },
                    { x: 3200, y: 480, width: 200, height: 20 },
                    { x: 3500, y: 420, width: 150, height: 20 },
                    { x: 3750, y: 360, width: 300, height: 20 },
                    { x: 4150, y: 300, width: 200, height: 20 },
                    { x: 4450, y: 240, width: 150, height: 20 },
                    { x: 4700, y: 180, width: 200, height: 20 },
                    { x: 5000, y: 240, width: 300, height: 20 },
                    { x: 5400, y: 350, width: 200, height: 20 },
                    { x: 5700, y: 450, width: 400, height: 50 }
                ],
                collectibles: [
                    { x: 450, y: 450, type: 'ring', collected: false },
                    { x: 700, y: 390, type: 'ring', collected: false },
                    { x: 900, y: 330, type: 'ring', collected: false },
                    { x: 1100, y: 270, type: 'ring', collected: false },
                    { x: 1350, y: 210, type: 'ring', collected: false },
                    { x: 1600, y: 150, type: 'ring', collected: false },
                    { x: 1850, y: 210, type: 'ring', collected: false },
                    { x: 2100, y: 270, type: 'ring', collected: false },
                    { x: 2300, y: 330, type: 'ring', collected: false },
                    { x: 2550, y: 390, type: 'ring', collected: false },
                    { x: 2800, y: 450, type: 'ring', collected: false },
                    { x: 3250, y: 450, type: 'ring', collected: false },
                    { x: 3600, y: 390, type: 'ring', collected: false },
                    { x: 3850, y: 330, type: 'ring', collected: false },
                    { x: 4200, y: 270, type: 'ring', collected: false },
                    { x: 4500, y: 210, type: 'ring', collected: false },
                    { x: 4800, y: 150, type: 'ring', collected: false },
                    { x: 5100, y: 210, type: 'ring', collected: false },
                    { x: 5500, y: 320, type: 'ring', collected: false }
                ],
                enemies: [
                    { x: 500, y: 450, width: 24, height: 24, direction: 1, speed: 1.2 },
                    { x: 1100, y: 270, width: 24, height: 24, direction: -1, speed: 1.2 },
                    { x: 1600, y: 150, width: 24, height: 24, direction: 1, speed: 1.2 },
                    { x: 2100, y: 270, width: 24, height: 24, direction: -1, speed: 1.2 },
                    { x: 2600, y: 390, width: 24, height: 24, direction: 1, speed: 1.2 },
                    { x: 3300, y: 450, width: 24, height: 24, direction: -1, speed: 1.2 },
                    { x: 4000, y: 330, width: 24, height: 24, direction: 1, speed: 1.2 },
                    { x: 4600, y: 210, width: 24, height: 24, direction: -1, speed: 1.2 },
                    { x: 5200, y: 210, width: 24, height: 24, direction: 1, speed: 1.2 }
                ],
                finish: { x: 6000, y: 350, width: 50, height: 100 },
                startX: 100,
                startY: 450
            },
            3: {
                name: "Spring Yard",
                platforms: [
                    { x: 0, y: 550, width: 250, height: 50 },
                    { x: 350, y: 500, width: 100, height: 20 },
                    { x: 550, y: 450, width: 80, height: 20 },
                    { x: 730, y: 400, width: 80, height: 20 },
                    { x: 900, y: 350, width: 100, height: 20 },
                    { x: 1100, y: 300, width: 80, height: 20 },
                    { x: 1280, y: 250, width: 80, height: 20 },
                    { x: 1460, y: 200, width: 100, height: 20 },
                    { x: 1650, y: 150, width: 80, height: 20 },
                    { x: 1830, y: 200, width: 80, height: 20 },
                    { x: 2010, y: 250, width: 100, height: 20 },
                    { x: 2200, y: 300, width: 80, height: 20 },
                    { x: 2380, y: 350, width: 80, height: 20 },
                    { x: 2560, y: 400, width: 100, height: 20 },
                    { x: 2750, y: 450, width: 80, height: 20 },
                    { x: 2930, y: 500, width: 80, height: 20 },
                    { x: 3110, y: 450, width: 100, height: 20 },
                    { x: 3300, y: 400, width: 80, height: 20 },
                    { x: 3480, y: 350, width: 80, height: 20 },
                    { x: 3660, y: 300, width: 100, height: 20 },
                    { x: 3850, y: 250, width: 80, height: 20 },
                    { x: 4030, y: 200, width: 80, height: 20 },
                    { x: 4210, y: 150, width: 100, height: 20 },
                    { x: 4400, y: 100, width: 200, height: 20 },
                    { x: 4700, y: 150, width: 80, height: 20 },
                    { x: 4880, y: 200, width: 80, height: 20 },
                    { x: 5060, y: 250, width: 100, height: 20 },
                    { x: 5250, y: 300, width: 80, height: 20 },
                    { x: 5430, y: 350, width: 80, height: 20 },
                    { x: 5610, y: 400, width: 100, height: 20 },
                    { x: 5800, y: 450, width: 200, height: 20 },
                    { x: 6100, y: 500, width: 300, height: 50 }
                ],
                collectibles: [
                    { x: 380, y: 470, type: 'ring', collected: false },
                    { x: 580, y: 420, type: 'ring', collected: false },
                    { x: 760, y: 370, type: 'ring', collected: false },
                    { x: 930, y: 320, type: 'ring', collected: false },
                    { x: 1130, y: 270, type: 'ring', collected: false },
                    { x: 1310, y: 220, type: 'ring', collected: false },
                    { x: 1490, y: 170, type: 'ring', collected: false },
                    { x: 1680, y: 120, type: 'ring', collected: false },
                    { x: 1860, y: 170, type: 'ring', collected: false },
                    { x: 2040, y: 220, type: 'ring', collected: false },
                    { x: 2230, y: 270, type: 'ring', collected: false },
                    { x: 2410, y: 320, type: 'ring', collected: false },
                    { x: 2590, y: 370, type: 'ring', collected: false },
                    { x: 2780, y: 420, type: 'ring', collected: false },
                    { x: 2960, y: 470, type: 'ring', collected: false },
                    { x: 3140, y: 420, type: 'ring', collected: false },
                    { x: 3330, y: 370, type: 'ring', collected: false },
                    { x: 3510, y: 320, type: 'ring', collected: false },
                    { x: 3690, y: 270, type: 'ring', collected: false },
                    { x: 3880, y: 220, type: 'ring', collected: false },
                    { x: 4060, y: 170, type: 'ring', collected: false },
                    { x: 4240, y: 120, type: 'ring', collected: false },
                    { x: 4500, y: 70, type: 'ring', collected: false },
                    { x: 4730, y: 120, type: 'ring', collected: false },
                    { x: 4910, y: 170, type: 'ring', collected: false },
                    { x: 5090, y: 220, type: 'ring', collected: false },
                    { x: 5280, y: 270, type: 'ring', collected: false },
                    { x: 5460, y: 320, type: 'ring', collected: false },
                    { x: 5640, y: 370, type: 'ring', collected: false },
                    { x: 5850, y: 420, type: 'ring', collected: false }
                ],
                enemies: [
                    { x: 400, y: 470, width: 24, height: 24, direction: 1, speed: 1.5 },
                    { x: 800, y: 370, width: 24, height: 24, direction: -1, speed: 1.5 },
                    { x: 1200, y: 270, width: 24, height: 24, direction: 1, speed: 1.5 },
                    { x: 1600, y: 170, width: 24, height: 24, direction: -1, speed: 1.5 },
                    { x: 2000, y: 220, width: 24, height: 24, direction: 1, speed: 1.5 },
                    { x: 2400, y: 320, width: 24, height: 24, direction: -1, speed: 1.5 },
                    { x: 2800, y: 420, width: 24, height: 24, direction: 1, speed: 1.5 },
                    { x: 3200, y: 420, width: 24, height: 24, direction: -1, speed: 1.5 },
                    { x: 3600, y: 320, width: 24, height: 24, direction: 1, speed: 1.5 },
                    { x: 4000, y: 220, width: 24, height: 24, direction: -1, speed: 1.5 },
                    { x: 4400, y: 120, width: 24, height: 24, direction: 1, speed: 1.5 },
                    { x: 4800, y: 170, width: 24, height: 24, direction: -1, speed: 1.5 },
                    { x: 5200, y: 270, width: 24, height: 24, direction: 1, speed: 1.5 },
                    { x: 5600, y: 370, width: 24, height: 24, direction: -1, speed: 1.5 }
                ],
                finish: { x: 6300, y: 400, width: 50, height: 100 },
                startX: 100,
                startY: 450
            }
        };
    }
    
    loadLevel(levelNum) {
        if (!this.levels[levelNum]) return;
        
        const level = this.levels[levelNum];
        this.platforms = [...level.platforms];
        this.collectibles = [...level.collectibles];
        this.enemies = [...level.enemies];
        this.projectiles = [];
        this.finish = level.finish;
        this.player.x = level.startX;
        this.player.y = level.startY;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.camera.x = 0;
        this.levelComplete = false;
        
        this.collectibles.forEach(collectible => {
            collectible.collected = false;
        });
    }
    
    nextLevel() {
        if (this.currentLevel < this.totalLevels) {
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
            this.playTone(880, 0.5);
        } else {
            this.gameState = 'gameComplete';
        }
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createBackgroundMusic();
        } catch (e) {
            console.warn('Audio not supported');
        }
    }
    
    createBackgroundMusic() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.type = 'square';
        gainNode.gain.value = 0.1;
        
        this.playMelody();
    }
    
    playMelody() {
        if (!this.audioContext) return;
        
        const notes = [440, 493, 523, 587, 659, 698, 784, 880];
        let noteIndex = 0;
        
        setInterval(() => {
            if (this.gameState === 'playing') {
                this.playTone(notes[noteIndex % notes.length], 0.3);
                noteIndex++;
            }
        }, 800);
    }
    
    playTone(frequency, duration) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'square';
        gainNode.gain.value = 0.05;
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    createParticle(x, y, color, size = 3) {
        this.particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 8,
            velocityY: (Math.random() - 0.5) * 8,
            color: color,
            size: size,
            life: 30,
            maxLife: 30
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.life--;
            particle.velocityY += 0.2;
            return particle.life > 0;
        });
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            if (this.gameState === 'characterSelect') {
                if (e.key === 'ArrowLeft' || e.key === 'a') {
                    this.selectedCharacter = (this.selectedCharacter - 1 + this.characters.length) % this.characters.length;
                    this.playTone(440, 0.1);
                } else if (e.key === 'ArrowRight' || e.key === 'd') {
                    this.selectedCharacter = (this.selectedCharacter + 1) % this.characters.length;
                    this.playTone(440, 0.1);
                } else if (e.key === 'Enter' || e.key === ' ') {
                    this.startGame();
                }
            } else if ((this.gameState === 'gameOver' || this.gameState === 'gameComplete') && e.key === 'r') {
                this.restartGame();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.player.character = this.selectedCharacter;
        const char = this.characters[this.selectedCharacter];
        this.player.speed = char.speed;
        this.player.jumpPower = char.jumpPower;
        this.playTone(659, 0.3);
    }
    
    restartGame() {
        this.gameState = 'characterSelect';
        this.currentLevel = 1;
        this.score = 0;
        this.rings = 0;
        this.lives = 3;
        this.superSonic = false;
        this.superSonicTimer = 0;
        this.levelComplete = false;
        this.selectedCharacter = 0;
    }
    
    update() {
        this.animationTime++;
        this.updatePlayer();
        this.updateSuperSonic();
        this.updateEnemies();
        this.updateProjectiles();
        this.updateCamera();
        this.checkCollisions();
        this.updateParticles();
        this.updateUI();
        this.backgroundOffset += 0.5;
    }
    
    updateSuperSonic() {
        if (this.superSonic) {
            this.superSonicTimer--;
            if (this.superSonicTimer <= 0) {
                this.superSonic = false;
                this.superSonicTimer = 0;
            }
            
            if (this.animationTime % 2 === 0) {
                this.createParticle(
                    this.player.x + Math.random() * 32, 
                    this.player.y + Math.random() * 32, 
                    '#FFD700', 
                    Math.random() * 3 + 2
                );
            }
        }
    }
    
    updatePlayer() {
        const char = this.characters[this.player.character];
        
        // Handle speed boost decay
        if (this.player.speedBoost > 0) {
            this.player.speedBoostTime--;
            if (this.player.speedBoostTime <= 0) {
                this.player.speedBoost = Math.max(0, this.player.speedBoost - 0.05);
            }
        }
        
        // Calculate effective speed with boosts
        let baseSpeed = this.player.speed;
        if (this.superSonic) baseSpeed *= 1.5;
        if (this.player.speedBoost > 0) baseSpeed *= (1 + this.player.speedBoost);
        
        const speed = baseSpeed;
        const jumpPower = this.superSonic ? this.player.jumpPower * 1.2 : this.player.jumpPower;
        
        // Handle ability cooldowns
        if (this.player.teleportCooldown > 0) {
            this.player.teleportCooldown--;
        }
        
        // Handle invulnerability frames
        if (this.player.invulnerable) {
            this.player.invulnerableTime--;
            if (this.player.invulnerableTime <= 0) {
                this.player.invulnerable = false;
            }
        }
        
        // Reset double jump when on ground
        if (this.player.onGround) {
            this.player.doubleJumpUsed = false;
            this.player.flying = false;
            this.player.gliding = false;
        }
        
        // Horizontal movement
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.velocityX = -speed;
            this.player.direction = -1;
        } else if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.velocityX = speed;
            this.player.direction = 1;
        } else {
            this.player.velocityX *= 0.8;
        }
        
        // Jump and character-specific abilities
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys[' ']) {
            this.handleJumpAndAbilities(jumpPower, char);
        } else {
            // Stop flying when not holding jump
            if (char.ability === 'fly') {
                this.player.flying = false;
            }
        }
        
        // Spin dash (enhanced for Dark Sonic)
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.handleSpinDash(char);
        } else if (this.player.spindash) {
            const dashMultiplier = char.ability === 'superSpinDash' ? 3 : 2;
            this.player.velocityX = this.player.spindashCharge * dashMultiplier * (this.player.direction);
            this.player.spindash = false;
            this.player.spindashCharge = 0;
            this.playTone(880, 0.3);
        }
        
        // Special ability handling
        this.handleSpecialAbilities(char);
        
        // Animation
        if (Math.abs(this.player.velocityX) > 0.1) {
            this.player.animFrame = (this.player.animFrame + 0.3) % 4;
        }
        
        // Trail
        this.player.trail.push({x: this.player.x + 16, y: this.player.y + 16});
        if (this.player.trail.length > 8) {
            this.player.trail.shift();
        }
        
        // Physics
        if (!this.player.flying) {
            this.player.velocityY += 0.8; // Gravity
        }
        
        // Handle gliding
        if (this.player.gliding) {
            this.player.velocityY = Math.min(this.player.velocityY, 2); // Slow fall
            this.player.velocityX += this.player.direction * 0.2; // Slight forward movement
        }
        
        // Movement
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Death check - fall below level
        if (this.player.y > 650) {
            this.resetPlayer();
        }
        
        // Reset gliding when on ground
        if (this.player.onGround) {
            this.player.gliding = false;
            this.player.doubleJumpUsed = false;
        }
    }
    
    handleJumpAndAbilities(jumpPower, char) {
        if (this.player.onGround) {
            // Regular jump
            this.player.velocityY = -jumpPower;
            this.player.onGround = false;
            this.playTone(659, 0.2);
            this.createParticle(this.player.x + 16, this.player.y + 32, '#FFD700', 4);
        } else {
            // Character-specific abilities
            switch (char.ability) {
                case 'fly':
                    if (this.player.flyTime < 300) { // 5 seconds at 60fps
                        this.player.flying = true;
                        this.player.velocityY = -3;
                        this.player.flyTime++;
                        if (this.animationTime % 10 === 0) {
                            this.createParticle(this.player.x + 16, this.player.y + 32, '#FFFF00', 3);
                        }
                    }
                    break;
                case 'doubleJump':
                    if (!this.player.doubleJumpUsed) {
                        this.player.velocityY = -jumpPower * 0.8;
                        this.player.doubleJumpUsed = true;
                        this.playTone(800, 0.2);
                        for (let i = 0; i < 12; i++) {
                            this.createParticle(
                                this.player.x + Math.random() * 32, 
                                this.player.y + Math.random() * 32, 
                                '#FF69B4', 
                                3
                            );
                        }
                    }
                    break;
                case 'glide':
                    if (!this.player.gliding && this.player.velocityY > 0) {
                        this.player.gliding = true;
                        this.playTone(700, 0.3);
                    }
                    break;
            }
        }
    }
    
    handleSpinDash(char) {
        if (this.player.onGround) {
            this.player.spindash = true;
            const chargeRate = char.ability === 'superSpinDash' ? 1.0 : 0.5;
            this.player.spindashCharge = Math.min(this.player.spindashCharge + chargeRate, 10);
            if (this.animationTime % 3 === 0) {
                const color = char.ability === 'superSpinDash' ? '#800080' : '#0066FF';
                this.createParticle(this.player.x + Math.random() * 32, this.player.y + 32, color, 2);
            }
        } else if (char.ability === 'glide' && this.player.velocityY > 0) {
            this.player.gliding = true;
        }
    }
    
    handleSpecialAbilities(char) {
        // Shadow teleport (X key)
        if (char.ability === 'teleport' && this.keys['x'] && this.player.teleportCooldown === 0) {
            const teleportDistance = 150;
            const newX = this.player.x + (this.player.direction * teleportDistance);
            
            // Check if teleport destination is valid (not inside a wall)
            let canTeleport = true;
            this.platforms.forEach(platform => {
                if (newX < platform.x + platform.width &&
                    newX + this.player.width > platform.x &&
                    this.player.y < platform.y + platform.height &&
                    this.player.y + this.player.height > platform.y) {
                    canTeleport = false;
                }
            });
            
            if (canTeleport && newX > 0 && newX < 5000) {
                // Teleport particles at old position
                for (let i = 0; i < 15; i++) {
                    this.createParticle(
                        this.player.x + Math.random() * 32, 
                        this.player.y + Math.random() * 32, 
                        '#FF0000', 
                        4
                    );
                }
                
                this.player.x = newX;
                this.player.teleportCooldown = 120; // 2 second cooldown
                this.playTone(1200, 0.2);
                
                // Teleport particles at new position
                for (let i = 0; i < 15; i++) {
                    this.createParticle(
                        this.player.x + Math.random() * 32, 
                        this.player.y + Math.random() * 32, 
                        '#FF0000', 
                        4
                    );
                }
            }
        }
        
        // Reset fly time when on ground
        if (this.player.onGround) {
            this.player.flyTime = 0;
        }
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            // Skip destroyed enemies
            if (enemy.x < -50) return;
            
            switch (enemy.type) {
                case 'ground':
                    enemy.x += enemy.direction * enemy.speed;
                    // More reasonable boundary checking
                    if (enemy.x < -100 || enemy.x > 5100) {
                        enemy.direction *= -1;
                        enemy.x = Math.max(-100, Math.min(5100, enemy.x));
                    }
                    break;
                    
                case 'flying':
                    enemy.x += enemy.direction * enemy.speed;
                    // Flying pattern
                    const flyOffset = Math.sin(this.animationTime * 0.05 + enemy.x * 0.01) * enemy.flyRange;
                    enemy.y = enemy.startY + flyOffset;
                    if (enemy.x < -100 || enemy.x > 5100) {
                        enemy.direction *= -1;
                        enemy.x = Math.max(-100, Math.min(5100, enemy.x));
                    }
                    break;
                    
                case 'cannon':
                    // Stationary, but shoots projectiles
                    enemy.lastShot++;
                    if (enemy.lastShot >= enemy.shotCooldown) {
                        // Only shoot if player is relatively close
                        const playerDistance = Math.abs(this.player.x - enemy.x);
                        if (playerDistance < 400) {
                            this.createProjectile(enemy.x + 16, enemy.y + 16, enemy.direction);
                        }
                        enemy.lastShot = 0;
                    }
                    break;
            }
        });
    }
    
    createProjectile(x, y, direction) {
        this.projectiles.push({
            x: x,
            y: y,
            velocityX: direction * 4,
            velocityY: 0,
            width: 8,
            height: 8,
            life: 300 // 5 seconds
        });
    }
    
    updateProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.x += projectile.velocityX;
            projectile.y += projectile.velocityY;
            projectile.life--;
            
            // Remove if out of bounds or life expired
            return projectile.life > 0 && projectile.x > -50 && projectile.x < 5100;
        });
    }
    
    updateCamera() {
        this.camera.x = this.player.x - 400;
        const maxCameraX = Math.max(0, (this.finish ? this.finish.x + 200 : 4400) - 800);
        this.camera.x = Math.max(0, Math.min(this.camera.x, maxCameraX));
    }
    
    checkCollisions() {
        this.player.onGround = false;
        
        this.platforms.forEach(platform => {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y < platform.y + platform.height &&
                this.player.y + this.player.height > platform.y) {
                
                // Handle ceiling platforms (upside-down sections)
                if (platform.type === 'ceiling' && this.player.velocityY < 0 && this.player.y > platform.y) {
                    // Only stick to ceiling if moving fast enough
                    if (this.player.speedBoost > 0.5 || Math.abs(this.player.velocityX) > 8) {
                        this.player.y = platform.y + platform.height;
                        this.player.velocityY = 0;
                        this.player.onGround = true;
                    }
                }
                // Handle normal platform collision
                else if (!platform.type || platform.type !== 'ceiling') {
                    if (this.player.velocityY > 0 && this.player.y < platform.y) {
                        this.player.y = platform.y - this.player.height;
                        this.player.velocityY = 0;
                        this.player.onGround = true;
                        
                        // Apply speed boost if this is a speed boost platform
                        if (platform.type === 'speedboost') {
                            this.player.speedBoost = Math.min(this.player.maxSpeedBoost, this.player.speedBoost + 1.5);
                            this.player.speedBoostTime = 300; // 5 seconds at 60fps
                            
                            // Visual effect
                            for (let i = 0; i < 15; i++) {
                                this.createParticle(
                                    this.player.x + Math.random() * this.player.width,
                                    this.player.y + this.player.height,
                                    '#00FF00',
                                    4 + Math.random() * 3
                                );
                            }
                            this.playTone(1200, 0.2);
                        }
                    }
                }
            }
        });
        
        this.collectibles.forEach(collectible => {
            if (!collectible.collected &&
                this.player.x < collectible.x + 20 &&
                this.player.x + this.player.width > collectible.x &&
                this.player.y < collectible.y + 20 &&
                this.player.y + this.player.height > collectible.y) {
                
                collectible.collected = true;
                
                if (collectible.type === 'ring') {
                    this.rings++;
                    this.score += 10;
                    this.playTone(800, 0.15);
                    for (let i = 0; i < 8; i++) {
                        this.createParticle(collectible.x + 10, collectible.y + 10, '#FFD700', 3);
                    }
                } else if (collectible.type === 'superpower') {
                    this.superSonic = true;
                    this.superSonicTimer = this.superSonicDuration;
                    this.score += 100;
                    this.playTone(1200, 0.5);
                    for (let i = 0; i < 20; i++) {
                        this.createParticle(
                            collectible.x + Math.random() * 20, 
                            collectible.y + Math.random() * 20, 
                            ['#FFD700', '#FF6B6B', '#4169E1'][Math.floor(Math.random() * 3)], 
                            Math.random() * 4 + 2
                        );
                    }
                }
            }
        });
        
        this.enemies.forEach(enemy => {
            // Skip enemies that are already destroyed
            if (enemy.x < -50) return;
            
            if (this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y) {
                
                if (this.superSonic || this.player.invulnerable) {
                    // Invulnerable when SuperSonic or during invulnerability frames - destroy enemy
                    this.score += 200;
                    enemy.x = -100;
                    this.playTone(1000, 0.2);
                    for (let i = 0; i < 10; i++) {
                        this.createParticle(enemy.x + 12, enemy.y + 12, '#FFD700', 3);
                    }
                } else if (this.player.velocityY > 3 && this.player.y < enemy.y - 5) {
                    // Jump on enemy from above with more forgiving conditions
                    this.player.velocityY = -10;
                    this.score += 100;
                    enemy.x = -100;
                    this.playTone(880, 0.2);
                    for (let i = 0; i < 8; i++) {
                        this.createParticle(enemy.x + 12, enemy.y + 12, '#FFD700', 3);
                    }
                } else {
                    this.takeDamage();
                }
            }
        });
        
        if (this.finish && !this.levelComplete &&
            this.player.x < this.finish.x + this.finish.width &&
            this.player.x + this.player.width > this.finish.x &&
            this.player.y < this.finish.y + this.finish.height &&
            this.player.y + this.player.height > this.finish.y) {
            
            this.levelComplete = true;
            this.score += 1000;
            this.playTone(1000, 0.3);
            
            setTimeout(() => {
                this.nextLevel();
            }, 1000);
        }
        
        // Check projectile collisions with smaller hitbox
        this.projectiles.forEach((projectile, index) => {
            const hitboxShrink = 4; // Make collision area smaller
            if (this.player.x + hitboxShrink < projectile.x + projectile.width &&
                this.player.x + this.player.width - hitboxShrink > projectile.x &&
                this.player.y + hitboxShrink < projectile.y + projectile.height &&
                this.player.y + this.player.height - hitboxShrink > projectile.y) {
                
                if (!this.superSonic && !this.player.invulnerable) {
                    this.takeDamage();
                } else {
                    // Destroy projectile if SuperSonic
                    this.projectiles.splice(index, 1);
                    this.score += 50;
                    for (let i = 0; i < 8; i++) {
                        this.createParticle(projectile.x + 4, projectile.y + 4, '#FFD700', 2);
                    }
                }
            }
        });
    }
    
    takeDamage() {
        if (this.player.invulnerable) return;
        
        // Set invulnerability frames
        this.player.invulnerable = true;
        this.player.invulnerableTime = 120; // 2 seconds at 60fps
        
        // Knock back the player
        this.player.velocityX = this.player.direction * -3;
        this.player.velocityY = -5;
        
        // Play damage sound
        this.playTone(220, 0.3);
        
        // Create damage particles
        for (let i = 0; i < 15; i++) {
            this.createParticle(
                this.player.x + Math.random() * 32, 
                this.player.y + Math.random() * 32, 
                '#FF0000', 
                3
            );
        }
        
        this.resetPlayer();
    }
    
    resetPlayer() {
        this.player.x = 100;
        this.player.y = 400;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.lives--;
        
        if (this.lives <= 0) {
            this.gameState = 'gameOver';
        }
    }
    
    updateUI() {
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('score').textContent = this.score;
        document.getElementById('rings').textContent = this.rings;
        document.getElementById('lives').textContent = this.lives;
        
        const superSonicElement = document.getElementById('supersonic');
        if (this.superSonic) {
            superSonicElement.style.display = 'block';
            superSonicElement.style.color = '#FFD700';
        } else {
            superSonicElement.style.display = 'none';
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'characterSelect') {
            this.renderCharacterSelect();
            return;
        }
        
        this.renderBackground();
        
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        this.renderPlatforms();
        this.renderCollectibles();
        this.renderEnemies();
        this.renderProjectiles();
        this.renderFinishFlag();
        this.renderPlayer();
        this.renderParticles();
        
        this.ctx.restore();
        
        if (this.gameState === 'gameOver') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
        
        if (this.gameState === 'gameComplete') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CONGRATULATIONS!', this.canvas.width / 2, this.canvas.height / 2 - 50);
            this.ctx.font = '32px Arial';
            this.ctx.fillText('All Levels Complete!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.fillText('Press R to play again', this.canvas.width / 2, this.canvas.height / 2 + 80);
        }
        
        if (this.levelComplete) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            this.ctx.font = '36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    renderCharacterSelect() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1E3A8A');
        gradient.addColorStop(1, '#3B82F6');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SELECT CHARACTER', this.canvas.width / 2, 100);
        
        const characterY = 200;
        const characterSpacing = 120;
        const startX = (this.canvas.width - (this.characters.length - 1) * characterSpacing) / 2;
        
        this.characters.forEach((character, index) => {
            const x = startX + index * characterSpacing;
            const isSelected = index === this.selectedCharacter;
            
            if (isSelected) {
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                this.ctx.fillRect(x - 40, characterY - 20, 80, 120);
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(x - 40, characterY - 20, 80, 120);
            }
            
            this.drawCharacterSprite(x, characterY, character, isSelected);
            
            this.ctx.fillStyle = isSelected ? '#FFD700' : 'white';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(character.name, x, characterY + 70);
            
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`Speed: ${character.speed}`, x, characterY + 85);
            this.ctx.fillText(`Jump: ${character.jumpPower}`, x, characterY + 98);
        });
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Use Arrow Keys or A/D to select', this.canvas.width / 2, this.canvas.height - 80);
        this.ctx.fillText('Press ENTER or SPACE to start', this.canvas.width / 2, this.canvas.height - 50);
    }
    
    drawCharacterSprite(x, y, character, isSelected) {
        const scale = isSelected ? 1.2 : 1;
        const bounce = isSelected ? Math.sin(this.animationTime * 0.2) * 3 : 0;
        
        this.ctx.save();
        this.ctx.translate(x, y + bounce);
        this.ctx.scale(scale, scale);
        
        const mainColor = character.color;
        const accentColor = character.superColor;
        
        this.ctx.fillStyle = mainColor;
        this.ctx.fillRect(-8, -16, 16, 6);
        this.ctx.fillRect(-12, -10, 24, 8);
        this.ctx.fillRect(-8, -2, 16, 8);
        
        this.ctx.fillStyle = '#FFE4B5';
        this.ctx.fillRect(-4, -10, 8, 12);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-2, -8, 2, 2);
        this.ctx.fillRect(2, -8, 2, 2);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(-4, -4, 8, 4);
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(-9, 6, 6, 8);
        this.ctx.fillRect(3, 6, 6, 8);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(-7, 8, 2, 4);
        this.ctx.fillRect(5, 8, 2, 4);
        
        if (isSelected) {
            const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
            glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
            glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            this.ctx.fillStyle = glowGradient;
            this.ctx.fillRect(-25, -25, 50, 50);
        }
        
        this.ctx.restore();
    }
    
    renderBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#98FB98');
        gradient.addColorStop(1, '#90EE90');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < 20; i++) {
            const x = (i * 100 + this.backgroundOffset) % (this.canvas.width + 100);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(x, 50 + Math.sin(i * 0.5) * 20, 60, 4);
        }
    }
    
    renderPlatforms() {
        this.platforms.forEach(platform => {
            let gradient, grassColor;
            
            // Different visuals for different platform types
            if (platform.type === 'speedboost') {
                // Speed boost platforms - green/yellow gradient with energy effect
                gradient = this.ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
                gradient.addColorStop(0, '#00FF00');
                gradient.addColorStop(0.5, '#32CD32');
                gradient.addColorStop(1, '#228B22');
                grassColor = '#ADFF2F';
                
                // Add pulsing effect
                const pulse = Math.sin(this.animationTime * 0.1) * 0.3 + 0.7;
                this.ctx.globalAlpha = pulse;
            } else if (platform.type === 'ceiling') {
                // Ceiling platforms - darker, metallic look
                gradient = this.ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
                gradient.addColorStop(0, '#4A4A4A');
                gradient.addColorStop(0.5, '#696969');
                gradient.addColorStop(1, '#2F2F2F');
                grassColor = '#556B2F';
            } else {
                // Normal platforms
                gradient = this.ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
                gradient.addColorStop(0, '#8B4513');
                gradient.addColorStop(0.5, '#A0522D');
                gradient.addColorStop(1, '#654321');
                grassColor = '#228B22';
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Grass/surface layer
            this.ctx.fillStyle = grassColor;
            if (platform.type === 'ceiling') {
                this.ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 8);
            } else {
                this.ctx.fillRect(platform.x, platform.y - 8, platform.width, 8);
            }
            
            // Reset alpha for speed boost platforms
            if (platform.type === 'speedboost') {
                this.ctx.globalAlpha = 1;
                
                // Add arrow indicators for speed boost direction
                this.ctx.fillStyle = '#FFFF00';
                for (let i = 0; i < platform.width; i += 40) {
                    const arrowX = platform.x + i + 20;
                    const arrowY = platform.y - 4;
                    this.ctx.beginPath();
                    this.ctx.moveTo(arrowX, arrowY);
                    this.ctx.lineTo(arrowX + 8, arrowY - 4);
                    this.ctx.lineTo(arrowX + 8, arrowY + 4);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            }
        });
    }
    
    renderCollectibles() {
        this.collectibles.forEach(collectible => {
            if (!collectible.collected) {
                if (collectible.type === 'ring') {
                    this.drawRingSprite(collectible.x, collectible.y);
                } else if (collectible.type === 'superpower') {
                    this.drawSuperPowerSprite(collectible.x, collectible.y);
                }
            }
        });
    }
    
    drawRingSprite(x, y) {
        const rotation = (this.animationTime * 0.1) % (Math.PI * 2);
        const scale = 1 + Math.sin(this.animationTime * 0.15) * 0.1;
        
        this.ctx.save();
        this.ctx.translate(x + 10, y + 10);
        this.ctx.rotate(rotation);
        this.ctx.scale(scale, scale);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.arc(-1, -1, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(-2, -2, 2, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawSuperPowerSprite(x, y) {
        const pulse = Math.sin(this.animationTime * 0.3) * 0.3 + 1;
        const rotation = (this.animationTime * 0.2) % (Math.PI * 2);
        
        this.ctx.save();
        this.ctx.translate(x + 10, y + 10);
        this.ctx.rotate(rotation);
        this.ctx.scale(pulse, pulse);
        
        // Outer glow
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FF6B6B');
        gradient.addColorStop(1, '#4169E1');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner star
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const radius = i % 2 === 0 ? 8 : 4;
            const starX = Math.cos(angle) * radius;
            const starY = Math.sin(angle) * radius;
            if (i === 0) {
                this.ctx.moveTo(starX, starY);
            } else {
                this.ctx.lineTo(starX, starY);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    renderEnemies() {
        this.enemies.forEach(enemy => {
            switch (enemy.type) {
                case 'ground':
                    this.drawGroundBadnik(enemy.x, enemy.y, enemy.direction);
                    break;
                case 'flying':
                    this.drawFlyingBadnik(enemy.x, enemy.y, enemy.direction);
                    break;
                case 'cannon':
                    this.drawCannonBadnik(enemy.x, enemy.y, enemy.direction);
                    break;
            }
        });
    }
    
    renderProjectiles() {
        this.projectiles.forEach(projectile => {
            this.ctx.fillStyle = '#FF4500';
            this.ctx.beginPath();
            this.ctx.arc(projectile.x + 4, projectile.y + 4, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#FF0000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    drawGroundBadnik(x, y, direction) {
        const bounce = Math.sin(this.animationTime * 0.2) * 2;
        const actualY = y + bounce;
        
        this.ctx.save();
        this.ctx.translate(x + 12, actualY + 12);
        if (direction < 0) {
            this.ctx.scale(-1, 1);
        }
        
        this.ctx.fillStyle = '#FF4500';
        this.ctx.fillRect(-10, -8, 20, 16);
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(-8, -6, 16, 12);
        
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillRect(-6, -4, 3, 3);
        this.ctx.fillRect(3, -4, 3, 3);
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(-2, 0, 4, 2);
        
        this.ctx.fillStyle = '#666666';
        this.ctx.fillRect(-8, 6, 4, 6);
        this.ctx.fillRect(4, 6, 4, 6);
        
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(-6, 8, 2, 4);
        this.ctx.fillRect(4, 8, 2, 4);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-5, -3, 1, 1);
        this.ctx.fillRect(4, -3, 1, 1);
        
        this.ctx.restore();
    }
    
    drawFlyingBadnik(x, y, direction) {
        const wingFlap = Math.sin(this.animationTime * 0.3) * 3;
        
        this.ctx.save();
        this.ctx.translate(x + 12, y + 12);
        if (direction < 0) {
            this.ctx.scale(-1, 1);
        }
        
        // Body
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(-8, -6, 16, 12);
        
        // Wings
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(-12, -4 + wingFlap, 8, 3);
        this.ctx.fillRect(4, -4 + wingFlap, 8, 3);
        this.ctx.fillRect(-10, 1 - wingFlap, 6, 2);
        this.ctx.fillRect(4, 1 - wingFlap, 6, 2);
        
        // Eyes
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillRect(-4, -3, 2, 2);
        this.ctx.fillRect(2, -3, 2, 2);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-3, -2, 1, 1);
        this.ctx.fillRect(3, -2, 1, 1);
        
        this.ctx.restore();
    }
    
    drawCannonBadnik(x, y, direction) {
        this.ctx.save();
        this.ctx.translate(x + 16, y + 16);
        
        // Base
        this.ctx.fillStyle = '#666666';
        this.ctx.fillRect(-12, -8, 24, 16);
        
        this.ctx.fillStyle = '#888888';
        this.ctx.fillRect(-10, -6, 20, 12);
        
        // Cannon barrel
        this.ctx.fillStyle = '#333333';
        if (direction > 0) {
            this.ctx.fillRect(8, -3, 12, 6);
        } else {
            this.ctx.fillRect(-20, -3, 12, 6);
        }
        
        // Details
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(-6, -4, 2, 2);
        this.ctx.fillRect(4, -4, 2, 2);
        
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillRect(-2, -2, 4, 4);
        
        this.ctx.restore();
    }
    
    renderPlayer() {
        this.player.trail.forEach((point, index) => {
            const alpha = index / this.player.trail.length * 0.3;
            const char = this.characters[this.player.character];
            const trailColor = this.superSonic ? char.superColor : char.color;
            this.ctx.fillStyle = `${trailColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        if (this.player.spindash) {
            this.drawSpinDashPlayer();
        } else {
            this.drawPlayerSprite();
        }
    }
    
    drawPlayerSprite() {
        const x = this.player.x;
        const y = this.player.y;
        const flip = this.player.direction < 0;
        const char = this.characters[this.player.character];
        
        // Skip rendering if invulnerable and flashing
        if (this.player.invulnerable && Math.floor(this.animationTime / 5) % 2 === 0) {
            return;
        }
        
        this.ctx.save();
        if (flip) {
            this.ctx.translate(x + 16, y + 16);
            this.ctx.scale(-1, 1);
            this.ctx.translate(-16, -16);
        } else {
            this.ctx.translate(x, y);
        }
        
        // SuperSonic glow effect
        if (this.superSonic) {
            const glowSize = Math.sin(this.animationTime * 0.5) * 3 + 5;
            const gradient = this.ctx.createRadialGradient(16, 16, 0, 16, 16, 25);
            const superColor = char.superColor;
            gradient.addColorStop(0, `${superColor}99`);
            gradient.addColorStop(0.5, `${superColor}66`);
            gradient.addColorStop(1, `${superColor}33`);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(-glowSize, -glowSize, 32 + glowSize * 2, 32 + glowSize * 2);
        }
        
        // Speed boost effect
        if (this.player.speedBoost > 0) {
            const boostIntensity = this.player.speedBoost / this.player.maxSpeedBoost;
            const boostSize = Math.sin(this.animationTime * 0.8) * 2 + 3;
            const gradient = this.ctx.createRadialGradient(16, 16, 0, 16, 16, 20);
            gradient.addColorStop(0, `#00FF00${Math.floor(boostIntensity * 150).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(0.5, `#32CD32${Math.floor(boostIntensity * 100).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `#00FF0033`);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(-boostSize, -boostSize, 32 + boostSize * 2, 32 + boostSize * 2);
            
            // Speed lines behind the player
            this.ctx.strokeStyle = '#00FF00';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                const lineX = -10 - i * 8;
                const lineY = 8 + Math.sin(this.animationTime * 0.3 + i) * 4;
                this.ctx.beginPath();
                this.ctx.moveTo(lineX, lineY);
                this.ctx.lineTo(lineX - 15, lineY);
                this.ctx.stroke();
            }
        }
        
        // Main character colors
        const mainColor = this.superSonic ? char.superColor : char.color;
        
        this.ctx.fillStyle = mainColor;
        this.ctx.fillRect(8, 2, 16, 6);
        this.ctx.fillRect(4, 8, 24, 8);
        this.ctx.fillRect(8, 16, 16, 8);
        
        this.ctx.fillStyle = '#FFE4B5';
        this.ctx.fillRect(12, 8, 8, 12);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(14, 10, 2, 2);
        this.ctx.fillRect(18, 10, 2, 2);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(12, 12, 8, 4);
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(6, 20, 6, 8);
        this.ctx.fillRect(20, 20, 6, 8);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(8, 22, 2, 4);
        this.ctx.fillRect(22, 22, 2, 4);
        
        this.ctx.restore();
    }
    
    drawSpinDashPlayer() {
        const x = this.player.x;
        const y = this.player.y;
        const char = this.characters[this.player.character];
        const dashColor = this.superSonic ? char.superColor : char.color;
        
        for (let i = 0; i < 5; i++) {
            const rgb = this.hexToRgb(dashColor);
            this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(5-i)/5 * 0.8})`;
            this.ctx.beginPath();
            this.ctx.arc(x + 16 - i * 6, y + 16, 12, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.fillStyle = dashColor;
        this.ctx.beginPath();
        this.ctx.arc(x + 16, y + 16, 14, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 8; i++) {
            const angle = (this.animationTime * 0.5 + i * Math.PI / 4) % (Math.PI * 2);
            const spinX = x + 16 + Math.cos(angle) * 8;
            const spinY = y + 16 + Math.sin(angle) * 8;
            this.ctx.fillRect(spinX - 1, spinY - 1, 2, 2);
        }
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderFinishFlag() {
        if (!this.finish) return;
        
        const flagWave = Math.sin(this.animationTime * 0.1) * 3;
        
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.finish.x + 5, this.finish.y, 8, this.finish.height);
        
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(this.finish.x + 13, this.finish.y + 10 + flagWave, 30, 15);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(this.finish.x + 13, this.finish.y + 25 + flagWave, 30, 15);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('FINISH', this.finish.x + 25, this.finish.y + this.finish.height + 15);
        
        if (this.levelComplete) {
            for (let i = 0; i < 20; i++) {
                const sparkleX = this.finish.x + Math.random() * 50;
                const sparkleY = this.finish.y + Math.random() * this.finish.height;
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
        } else if (this.gameState === 'characterSelect') {
            this.animationTime++;
        }
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize EmailJS
emailjs.init("Yb9XsQ_h3DSDJ_bIA"); // Replace with your EmailJS public key

// Feedback Form Functionality
class FeedbackManager {
    constructor() {
        this.modal = document.getElementById('feedbackModal');
        this.feedbackBtn = document.getElementById('feedbackBtn');
        this.closeBtn = document.querySelector('.close');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.form = document.getElementById('feedbackForm');
        this.submitBtn = document.getElementById('submitBtn');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Open modal
        this.feedbackBtn.addEventListener('click', () => this.openModal());
        
        // Close modal
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Handle form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }
    
    openModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetForm();
    }
    
    resetForm() {
        this.form.reset();
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = 'Send Feedback';
    }
    
    validateSecurityAnswer(answer) {
        const validAnswers = ['liam', 'jamie'];
        
        const cleanAnswer = answer.toLowerCase().trim();
        return validAnswers.some(valid => cleanAnswer.includes(valid) || valid.includes(cleanAnswer));
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate security answer
        if (!this.validateSecurityAnswer(data.securityAnswer)) {
            alert('Security question failed! Please enter your favourite uncle\'s name.');
            return;
        }
        
        // Disable submit button
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Sending...';
        
        try {
            // Prepare email data
            const emailData = {
                feedback_type: data.feedbackType,
                character: data.currentCharacter,
                level: data.currentLevel,
                description: data.description,
                security_answer: data.securityAnswer,
                timestamp: new Date().toLocaleString(),
                user_agent: navigator.userAgent
            };
            
            // Send email using EmailJS
            await emailjs.send(
                'service_p2fplrx', // Replace with your EmailJS service ID
                'template_pb19ka6', // Replace with your EmailJS template ID
                emailData
            );
            
            // Success message
            alert('Thank you for your feedback! Your message has been sent successfully.');
            this.closeModal();
            
        } catch (error) {
            console.error('Error sending feedback:', error);
            alert('Sorry, there was an error sending your feedback. Please try again later.');
            
            // Re-enable submit button
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Send Feedback';
        }
    }
}

// Initialize the game and feedback system
new SonicGame();
new FeedbackManager();