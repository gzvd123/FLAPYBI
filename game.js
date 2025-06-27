class FlappyBirdGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        // Game state
        this.gameState = 'start'; // start, playing, gameOver
        this.score = 0;
        this.bestScore = localStorage.getItem('flappyBestScore') || 0;
        
        // Bird properties
        this.birdTypes = ['🐦', '🦆', '🐔', '🦅'];
        this.selectedBird = 0;
        this.difficulty = 'easy'; // Default to easy mode for kids
        this.bird = {
            x: 100,
            y: 300,
            width: 30,
            height: 30,
            velocity: 0,
            gravity: 0.3, // Reduced from 0.5 to 0.3 (gentler falling)
            jumpPower: -8, // Reduced from -10 to -8 (easier to control)
            rotation: 0
        };
        
        // Pipes - Will be set by difficulty
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 200; // Will be updated by difficulty
        this.pipeSpeed = 2; // Will be updated by difficulty
        this.powerUpChance = 0.6; // Will be updated by difficulty
        this.pipeColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
        
        // Power-ups
        this.powerUps = [];
        this.activePowerUp = null;
        this.powerUpTypes = {
            invincible: { color: '#FFD700', symbol: '⭐', duration: 8000, text: 'Bất Tử!' }, // Increased from 5000 to 8000
            small: { color: '#FF69B4', symbol: '💫', duration: 10000, text: 'Nhỏ Xinh!' }, // Increased from 7000 to 10000
            slow: { color: '#98FB98', symbol: '🕒', duration: 9000, text: 'Thời Gian Chậm!' } // Increased from 6000 to 9000
        };
        
        // Particles
        this.particles = [];
        
        // Background elements
        this.clouds = [];
        this.stars = [];
        
        // Initialize
        this.init();
        this.generateClouds();
        this.generateStars();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDifficultySettings(); // Apply initial difficulty settings
        this.generateInitialPipes();
        this.gameLoop();
    }
    
    updateDifficultySettings() {
        if (this.difficulty === 'easy') {
            // Super easy mode for very young kids (3-5 years)
            this.pipeGap = 250;
            this.pipeSpeed = 1.5;
            this.bird.gravity = 0.25;
            this.bird.jumpPower = -7;
            this.powerUpChance = 0.8; // 80% chance
        } else {
            // Normal mode (still easier than original)
            this.pipeGap = 200;
            this.pipeSpeed = 2;
            this.bird.gravity = 0.3;
            this.bird.jumpPower = -8;
            this.powerUpChance = 0.6; // 60% chance
        }
    }
    
    setupEventListeners() {
        // Bird selection
        document.querySelectorAll('.bird-option').forEach((option, index) => {
            option.addEventListener('click', () => {
                document.querySelector('.bird-option.active').classList.remove('active');
                option.classList.add('active');
                this.selectedBird = index;
            });
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-option').forEach((option) => {
            option.addEventListener('click', () => {
                document.querySelector('.difficulty-option.active').classList.remove('active');
                option.classList.add('active');
                this.difficulty = option.dataset.difficulty;
                this.updateDifficultySettings();
            });
        });
        
        // Game controls
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        document.getElementById('homeButton').addEventListener('click', () => this.showStartScreen());
        
        // Input controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameState === 'playing') {
                e.preventDefault();
                this.jump();
            }
        });
        
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.jump();
            }
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.jump();
            }
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.bird.y = 300;
        this.bird.velocity = 0;
        this.pipes = [];
        this.powerUps = [];
        this.particles = [];
        this.activePowerUp = null;
        this.generateInitialPipes();
        
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameUI').classList.remove('hidden');
        this.updateScore();
    }
    
    restartGame() {
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.startGame();
    }
    
    showStartScreen() {
        this.gameState = 'start';
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('gameUI').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
    }
    
    jump() {
        this.bird.velocity = this.bird.jumpPower;
        this.createJumpParticles();
        
        // Visual feedback for jump
        this.bird.rotation = -20;
        setTimeout(() => {
            this.bird.rotation = 0;
        }, 200);
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update bird
        this.updateBird();
        
        // Update pipes
        this.updatePipes();
        
        // Update power-ups
        this.updatePowerUps();
        
        // Update particles
        this.updateParticles();
        
        // Check collisions
        this.checkCollisions();
        
        // Update background elements
        this.updateClouds();
        this.updateStars();
    }
    
    updateBird() {
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Rotation based on velocity
        if (this.bird.velocity > 0) {
            this.bird.rotation = Math.min(this.bird.rotation + 3, 30);
        }
        
        // Boundary check
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        
        if (this.bird.y > this.canvas.height - this.bird.height) {
            this.gameOver();
        }
    }
    
    updatePipes() {
        // Move pipes
        this.pipes.forEach(pipe => {
            const speed = this.activePowerUp?.type === 'slow' ? this.pipeSpeed * 0.5 : this.pipeSpeed;
            pipe.x -= speed;
        });
        
        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);
        
        // Add new pipes - Spacing based on difficulty
        const pipeSpacing = this.difficulty === 'easy' ? 300 : 250;
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - pipeSpacing) {
            this.generatePipe();
        }
        
        // Check for scoring
        this.pipes.forEach(pipe => {
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                this.updateScore();
                this.createScoreParticles();
                
                // Chance to spawn power-up - Based on difficulty level
                if (Math.random() < this.powerUpChance) {
                    this.spawnPowerUp(pipe.x + this.pipeWidth + 50);
                }
            }
        });
    }
    
    updatePowerUps() {
        // Move power-ups
        this.powerUps.forEach(powerUp => {
            const speed = this.activePowerUp?.type === 'slow' ? this.pipeSpeed * 0.5 : this.pipeSpeed;
            powerUp.x -= speed;
            powerUp.rotation += 5;
        });
        
        // Remove off-screen power-ups
        this.powerUps = this.powerUps.filter(powerUp => powerUp.x + 30 > 0);
        
        // Check active power-up duration
        if (this.activePowerUp && Date.now() - this.activePowerUp.startTime > this.activePowerUp.duration) {
            this.deactivatePowerUp();
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
        });
        
        this.particles = this.particles.filter(particle => particle.life > 0);
    }
    
    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.x -= 0.5;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width;
                cloud.y = Math.random() * 200;
            }
        });
    }
    
    updateStars() {
        this.stars.forEach(star => {
            star.twinkle += 0.1;
            star.opacity = 0.5 + Math.sin(star.twinkle) * 0.3;
        });
    }
    
    checkCollisions() {
        if (this.activePowerUp?.type === 'invincible') return;
        
        const birdSize = this.activePowerUp?.type === 'small' ? 20 : 30;
        const birdX = this.bird.x;
        const birdY = this.bird.y + (this.bird.height - birdSize) / 2;
        
        // Check pipe collisions
        this.pipes.forEach(pipe => {
            if (birdX + birdSize > pipe.x && birdX < pipe.x + this.pipeWidth) {
                if (birdY < pipe.topHeight || birdY + birdSize > pipe.topHeight + this.pipeGap) {
                    this.gameOver();
                }
            }
        });
        
        // Check power-up collisions
        this.powerUps.forEach((powerUp, index) => {
            if (birdX + birdSize > powerUp.x && birdX < powerUp.x + 30 &&
                birdY + birdSize > powerUp.y && birdY < powerUp.y + 30) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(index, 1);
            }
        });
    }
    
    generateInitialPipes() {
        const spacing = this.difficulty === 'easy' ? 320 : 280; // Even more spacing for easy mode
        for (let i = 0; i < 3; i++) {
            this.generatePipe(this.canvas.width + i * spacing);
        }
    }
    
    generatePipe(x = this.canvas.width) {
        const topHeight = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
        this.pipes.push({
            x: x,
            topHeight: topHeight,
            color: this.pipeColors[Math.floor(Math.random() * this.pipeColors.length)],
            scored: false
        });
    }
    
    spawnPowerUp(x) {
        const types = Object.keys(this.powerUpTypes);
        const type = types[Math.floor(Math.random() * types.length)];
        const y = Math.random() * (this.canvas.height - 200) + 100;
        
        this.powerUps.push({
            x: x,
            y: y,
            type: type,
            rotation: 0
        });
    }
    
    collectPowerUp(powerUp) {
        this.activePowerUp = {
            type: powerUp.type,
            startTime: Date.now(),
            duration: this.powerUpTypes[powerUp.type].duration
        };
        
        this.showPowerUpIndicator();
        this.createPowerUpParticles(powerUp.x, powerUp.y);
    }
    
    showPowerUpIndicator() {
        const indicator = document.getElementById('powerUpIndicator');
        const text = document.getElementById('powerUpText');
        const timer = document.getElementById('powerUpTimer');
        
        text.textContent = this.powerUpTypes[this.activePowerUp.type].text;
        timer.style.setProperty('--duration', this.activePowerUp.duration + 'ms');
        
        indicator.classList.remove('hidden');
    }
    
    deactivatePowerUp() {
        this.activePowerUp = null;
        document.getElementById('powerUpIndicator').classList.add('hidden');
    }
    
    createJumpParticles() {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.bird.x + this.bird.width / 2,
                y: this.bird.y + this.bird.height,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 2 + 1,
                color: '#87CEEB',
                size: Math.random() * 4 + 2,
                life: 30,
                maxLife: 30,
                alpha: 1
            });
        }
    }
    
    createScoreParticles() {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.bird.x + this.bird.width / 2,
                y: this.bird.y + this.bird.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: ['#FFD700', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 3)],
                size: Math.random() * 6 + 3,
                life: 40,
                maxLife: 40,
                alpha: 1
            });
        }
    }
    
    createPowerUpParticles(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x + 15,
                y: y + 15,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: this.powerUpTypes[this.activePowerUp.type].color,
                size: Math.random() * 8 + 4,
                life: 50,
                maxLife: 50,
                alpha: 1
            });
        }
    }
    
    generateClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 200,
                width: Math.random() * 60 + 40,
                height: Math.random() * 30 + 20
            });
        }
    }
    
    generateStars() {
        for (let i = 0; i < 20; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                twinkle: Math.random() * Math.PI * 2,
                opacity: 0.5
            });
        }
    }
    
    render() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background elements
        this.drawStars();
        this.drawClouds();
        
        // Draw game elements
        this.drawPipes();
        this.drawPowerUps();
        this.drawBird();
        this.drawParticles();
    }
    
    drawBird() {
        this.ctx.save();
        
        const birdSize = this.activePowerUp?.type === 'small' ? 20 : 30;
        const birdX = this.bird.x + (this.bird.width - birdSize) / 2;
        const birdY = this.bird.y + (this.bird.height - birdSize) / 2;
        
        this.ctx.translate(birdX + birdSize / 2, birdY + birdSize / 2);
        this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        
        // Bird glow effect if invincible
        if (this.activePowerUp?.type === 'invincible') {
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 20;
        }
        
        this.ctx.font = `${birdSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.birdTypes[this.selectedBird], 0, 0);
        
        this.ctx.restore();
    }
    
    drawPipes() {
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillStyle = pipe.color;
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.topHeight + this.pipeGap, this.pipeWidth, 
                             this.canvas.height - pipe.topHeight - this.pipeGap);
            
            // Pipe caps
            this.ctx.fillStyle = this.darkenColor(pipe.color, 20);
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight + this.pipeGap, this.pipeWidth + 10, 20);
        });
    }
    
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.ctx.save();
            this.ctx.translate(powerUp.x + 15, powerUp.y + 15);
            this.ctx.rotate(powerUp.rotation * Math.PI / 180);
            
            // Glow effect
            this.ctx.shadowColor = this.powerUpTypes[powerUp.type].color;
            this.ctx.shadowBlur = 15;
            
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.powerUpTypes[powerUp.type].symbol, 0, 0);
            
            this.ctx.restore();
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width * 0.3, cloud.y, cloud.width * 0.4, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width * 0.7, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawStars() {
        this.stars.forEach(star => {
            this.ctx.save();
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    updateScore() {
        document.getElementById('score').textContent = `Điểm: ${this.score}`;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBestScore', this.bestScore);
        }
        
        // Show game over screen
        document.getElementById('gameUI').classList.add('hidden');
        document.getElementById('finalScore').textContent = `Điểm: ${this.score} (Tốt nhất: ${this.bestScore})`;
        
        // Encouraging messages - More positive for kids
        const encouragements = [
            "Bạn đã chơi rất tốt! 🌟",
            "Tuyệt vời! Cố gắng tiếp nhé! 💪",
            "Bạn ngày càng giỏi hơn! 🎉",
            "Xuất sắc! Thử lại nào! ⭐",
            "Bạn đang tiến bộ từng ngày! 🚀",
            "Giỏi quá! Tiếp tục chơi nào! 🎮",
            "Chim nhỏ rất tự hào về bạn! 🐦",
            "Bạn là người chơi tuyệt vời! 🏆",
            "Đừng bỏ cuộc, bạn làm được! 💝",
            "Mỗi lần chơi bạn đều tốt hơn! ✨"
        ];
        
        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        document.getElementById('encouragement').textContent = randomEncouragement;
        
        setTimeout(() => {
            document.getElementById('gameOverScreen').classList.remove('hidden');
        }, 500);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new FlappyBirdGame();
}); 