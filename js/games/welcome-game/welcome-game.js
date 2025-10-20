export default class WelcomeGame {
    constructor() {
        this.score = 0;
        this.rotation = 5;
        this.rotationInterval = null;
        this.isOnTarget = false;
        this.keydownHandler = null;
        this.clickHandler = null;
        this.rotationSpeed = 2.152;
        this.targetDegree = 0;
    }

    positionOnCircle(degreesFromTop) {
        // Circle properties
        const centerX = 5;      // spinner center X
        const centerY = 35;     // spinner center Y
        const radius = 120;     // canvas is 200x200

        // Convert "degrees from top" to standard angle
        // (0° = right, 90° = down, 180° = left, 270° = up)
        const standardAngle = degreesFromTop - 90;
        const radians = standardAngle * Math.PI / 180;

        // Calculate position on circle
        const x = centerX + radius * Math.cos(radians);
        const y = centerY + radius * Math.sin(radians);

        // Rotation to point toward center
        // degreesFromTop + 180 makes it point inward
        const rotation = degreesFromTop + 180;

        return `translateX(${x}px) translateY(${y}px) rotate(${rotation}deg)`;
    }

    repositionTarget() {
        // Generate random degree 0-360
        this.targetDegree = Math.random() * 360;

        // Update target element position
        const target = document.getElementById('candy-corn-target');
        if (target) {
            target.style.transform = this.positionOnCircle(this.targetDegree);
        }
    }

    // Background image progression:
    // - score = 0: Halloween_1.png
    // - score = 1: Halloween_2.png
    // - score = n (for n = 0-13): Halloween_{n+1}.png
    // - score = 14: Halloween_Final.png (winning state)
    updateBackground() {
        const background = document.getElementById('game-background');
        if (background) {
            let bgImage;
            if (this.score === 14) {
                bgImage = 'Halloween_Final.png';
            } else {
                bgImage = `Halloween_${this.score + 1}.png`;
            }
            background.src = `js/games/welcome-game/${bgImage}`;
        }
    }

    setWinState() {
        // Hide spinner and target
        const candyCorn = document.getElementById('candy-corn');
        const target = document.getElementById('candy-corn-target');
        if (candyCorn) candyCorn.style.opacity = '0';
        if (target) target.style.opacity = '0';

        // Get game content area
        const gameContent = document.getElementById('game-content');
        if (!gameContent) return;

        const contentRect = gameContent.getBoundingClientRect();

        // Create shower container
        const showerContainer = document.createElement('div');
        showerContainer.id = 'candy-corn-shower';
        showerContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            overflow: hidden;
        `;
        gameContent.style.position = 'relative'; // Ensure parent is positioned
        gameContent.appendChild(showerContainer);

        // Create 180 falling candy corns
        const numCorns = 180;
        for (let i = 0; i < numCorns; i++) {
            const corn = document.createElement('img');
            corn.src = 'js/games/welcome-game/Candy_Corn.png';

            // Random properties
            const startX = Math.random() * contentRect.width;
            const height = 40 + Math.random() * 40; // 40-80px height
            const duration = 2 + Math.random() * 2; // 2-4 seconds
            const delay = Math.random() * 2; // 0-2s delay (continuous spawning)
            const rotations = 1 + Math.random() * 3; // 1-4 full rotations

            corn.style.cssText = `
                position: absolute;
                left: ${startX}px;
                top: -100px;
                height: ${height}px;
                width: auto;
                animation: fall-${i} ${duration}s linear ${delay}s forwards,
                           rotate-${i} ${duration}s linear ${delay}s infinite;
            `;

            // Create unique keyframes for each corn
            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                @keyframes fall-${i} {
                    to { top: ${contentRect.height + 100}px; }
                }
                @keyframes rotate-${i} {
                    to { transform: rotate(${rotations * 360}deg); }
                }
            `;
            document.head.appendChild(styleSheet);

            showerContainer.appendChild(corn);
        }

        // Clean up after 7 seconds (2s spawn + 4s max fall + 1s buffer)
        setTimeout(() => {
            if (showerContainer && showerContainer.parentNode) {
                showerContainer.parentNode.removeChild(showerContainer);
            }

            // Wait 1 more second, then reset and restore game
            setTimeout(() => {
                // Reset game state
                this.score = 0;
                this.rotationSpeed = 2.152;
                this.rotation = 5;

                // Update score display
                const scoreDisplay = document.getElementById('score-display');
                if (scoreDisplay) {
                    scoreDisplay.textContent = 'Score: 0';
                }

                // Update game app score
                if (window.gameApp) {
                    window.gameApp.updateScore(0);
                }

                // Reposition target
                this.repositionTarget();

                // Update background to default
                this.updateBackground();

                // Restore game elements AFTER reset
                if (candyCorn) candyCorn.style.opacity = '1';
                if (target) target.style.opacity = '1';
            }, 1000);
        }, 7000);
    }

    render() {
        return `<div style="background-color: rgb(36, 28, 70); width: 100%; height: 100%; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div id="score-display" style="color: white; font-size: 32px; font-weight: bold; margin-bottom: 20px;">Score: 0</div>
                <div style="display: grid; grid-template: 1fr / 1fr; place-items: center; background: radial-gradient(ellipse at center, #fff6a0 0%, #ffaa00 30%, #ff4400 70%, #cc0000 100%); height: 404px; position: relative;">
                    <img id="game-background" src="js/games/welcome-game/halloween_bg.png" style="grid-area: 1/1; width: 100%; height: 100%; object-fit: contain;">
                    <img id="candy-corn" src="js/games/welcome-game/Candy_Corn.png" style="grid-area: 1/1; z-index: 1; height: 180px; transform: translateX(5px) translateY(35px) rotate(5deg);">
                    <img id="candy-corn-target" src="js/games/welcome-game/Candy_Corn.png" style="grid-area: 1/1; z-index: 1; height: 60px; transform: translateX(5px) translateY(-85px) rotate(180deg); transition: height 0.15s ease-out;">
                </div>
        </div>`;
    }

    start() {
        console.log('Welcome game started');
        const candyCorn = document.getElementById('candy-corn');
        const target = document.getElementById('candy-corn-target');
        const scoreDisplay = document.getElementById('score-display');
        const canvas = document.getElementById('game-canvas');

        // Position target at random location
        this.repositionTarget();

        // Set initial background
        this.updateBackground();

        // Draw circle on canvas
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = canvas.width / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = 'lime';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        if (candyCorn && target) {
            // 360 degrees over 5 seconds = 72 degrees per second
            // Update every 16ms (roughly 60fps) = 1.152 degrees per frame
            this.rotationInterval = setInterval(() => {
                this.rotation += this.rotationSpeed;
                const normalizedRotation = ((this.rotation % 360) + 360) % 360;

                // Check if spinner is pointing at target (within tolerance)
                const tolerance = 25;
                const diff = Math.abs(normalizedRotation - this.targetDegree);
                // Handle wrap-around (e.g., 355° and 5° are 10° apart, not 350°)
                const angleDiff = Math.min(diff, 360 - diff);
                this.isOnTarget = angleDiff <= tolerance;

                // Update spinner rotation
                candyCorn.style.transform = `translateX(5px) translateY(35px) rotate(${this.rotation}deg)`;

                // Update target size based on whether spinner is on target
                const targetSize = this.isOnTarget ? '90px' : '60px';
                if (target) target.style.height = targetSize;
            }, 16);
        }

        // Scoring logic (shared between keydown and click)
        const handleScore = () => {
            if (this.isOnTarget) {
                this.score++;
                if (scoreDisplay) {
                    scoreDisplay.textContent = `Score: ${this.score}`;
                }
                // Update the game app score
                if (window.gameApp) {
                    window.gameApp.updateScore(this.score);
                }

                // Update background based on new score
                this.updateBackground();

                // Trigger win state at score 14
                if (this.score === 14) {
                    this.setWinState();
                }

                // Reverse rotation direction and increase speed
                this.rotationSpeed *= -1;
                const speedMultiplier = 1.1; // 10% faster each time
                this.rotationSpeed = this.rotationSpeed > 0
                    ? this.rotationSpeed * speedMultiplier
                    : this.rotationSpeed * speedMultiplier;
                // Reposition target to random location
                this.repositionTarget();
            }
        };

        // Add keydown listener (any key, except browser shortcuts)
        this.keydownHandler = (e) => {
            // Don't interfere with browser shortcuts (cmd/ctrl + key)
            if (e.metaKey || e.ctrlKey) {
                return;
            }
            e.preventDefault();
            handleScore();
        };
        document.addEventListener('keydown', this.keydownHandler);

        // Add click listener
        this.clickHandler = () => {
            handleScore();
        };
        document.addEventListener('click', this.clickHandler);
    }

    stop() {
        console.log('Welcome game stopped');
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        if (this.clickHandler) {
            document.removeEventListener('click', this.clickHandler);
            this.clickHandler = null;
        }
    }

    getScore() {
        return this.score;
    }
}
