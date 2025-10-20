class HalloweenGames {
  constructor() {
    this.currentGame = "title-screen";
    this.currentScore = 0;
    this.games = {};
    this.isPanelCollapsed = false;
    this.gameNames = {
      "title-screen": "Title Screen",
      "welcome-game": "welcome game",
      whosThatWitch: "Who's That Witch?",
      "word-haunt": "Word Haunt",
      theRadleyHouse: "The Radley House",
    };
    this.gameDescriptions = {
      "title-screen": "Halloween Minigames! Select a game to start playing.",
      "welcome-game": "Welcome to the game!",
      whosThatWitch:
        "Match the witches, then identify them! A spooky memory game.",
      "word-haunt": "Find Halloween words hidden in the letter grid!",
      theRadleyHouse: "A well-articulated treasure hunt text adventure.",
    };

    this.init();
  }

  async init() {
    // Save the original welcome screen HTML as a template
    const welcomeScreen = document.querySelector(".welcome-screen");
    this.welcomeScreenTemplate = welcomeScreen ? welcomeScreen.outerHTML : "";

    this.bindEvents();
    await this.loadGames();
    this.startCountdownTimer();
  }

  bindEvents() {
    const gameItems = document.querySelectorAll(".game-item");
    gameItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const gameId = item.getAttribute("data-game");
        this.switchGame(gameId);
      });
    });

    // Panel toggle button
    const toggleBtn = document.getElementById("panel-toggle-btn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.togglePanel();
      });
    }

    // Load panel state from localStorage
    const savedPanelState = localStorage.getItem("panelState");
    if (savedPanelState === "collapsed") {
      this.isPanelCollapsed = true;
      this.updatePanelState();
    }
  }

  async loadGames() {
    const gameIds = [
      "title-screen",
      "welcome-game",
      "whosThatWitch",
      "word-haunt",
      "theRadleyHouse",
    ];

    for (const gameId of gameIds) {
      try {
        let module;
        try {
          // Try subdirectory structure first (e.g., welcome-game/welcome-game.js)
          module = await import(`./games/${gameId}/${gameId}.js`);
        } catch (subError) {
          // Fall back to flat structure (e.g., game-0.js)
          module = await import(`./games/${gameId}.js`);
        }
        console.log(`Successfully loaded module for ${gameId}:`, module);
        this.games[gameId] = new module.default();
        console.log(
          `Successfully instantiated game ${gameId}:`,
          this.games[gameId]
        );
      } catch (error) {
        console.warn(`Could not load game ${gameId}:`, error);
        this.games[gameId] = this.createFallbackGame(gameId);
        console.log(`Using fallback game for ${gameId}`);
      }
    }

    // Initialize the title screen after all games are loaded
    this.switchGame("title-screen");
    this.updateUI();
  }

  togglePanel() {
    this.isPanelCollapsed = !this.isPanelCollapsed;
    this.updatePanelState();
    localStorage.setItem(
      "panelState",
      this.isPanelCollapsed ? "collapsed" : "expanded"
    );
  }

  updatePanelState() {
    const panel = document.querySelector(".right-nav");
    const arrow = document.querySelector(".toggle-arrow");
    const centerGame = document.querySelector(".center-game");

    if (this.isPanelCollapsed) {
      panel.classList.remove("expanded");
      panel.classList.add("collapsed");
      centerGame.classList.remove("panel-expanded");
      centerGame.classList.add("panel-collapsed");
      // Panel is collapsed, show expand arrow with simple format
      arrow.textContent = "←···";
    } else {
      panel.classList.remove("collapsed");
      panel.classList.add("expanded");
      centerGame.classList.remove("panel-collapsed");
      centerGame.classList.add("panel-expanded");
      // Panel is expanded, show collapse arrow pointing right
      arrow.textContent = "···→";
    }
  }

  createFallbackGame(gameId) {
    return {
      name: this.gameNames[gameId],
      description: this.gameDescriptions[gameId],
      score: 0,
      render: () => {
        return `
                    <div class="game-screen">
                        <h2>🎃 ${this.gameNames[gameId]} 🎃</h2>
                        <p>${this.gameDescriptions[gameId]}</p>
                        <div class="game-placeholder">
                            <div>
                                <p>Game content will be implemented here!</p>
                                <p style="margin-top: 20px; font-size: 2em;">
                                    ${this.getGameEmoji(gameId)}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
      },
      start: () => console.log(`Starting ${gameId}`),
      stop: () => console.log(`Stopping ${gameId}`),
      getScore: () => Math.floor(Math.random() * 1000),
    };
  }

  getGameEmoji(gameId) {
    const emojis = {
      "title-screen": "🦇👻🎃",
      "welcome-game": "🏢🍬💰",
      whosThatWitch: "🧙‍♀️🔮🧙‍♀️",
      "word-haunt": "🔍👻🔍",
      theRadleyHouse: "🏚️👻🏚️",
    };
    return emojis[gameId] || "🎃";
  }

  async switchGame(gameId) {
    console.log("=== SWITCH GAME DEBUG ===");
    console.log("Switching to game:", gameId);
    console.log("Current game:", this.currentGame);

    // Auto-collapse/expand panel based on game (do this even if same game)
    if (gameId === "title-screen") {
      // Title screen - expand panel
      if (this.isPanelCollapsed) {
        this.isPanelCollapsed = false;
        this.updatePanelState();
        localStorage.setItem("panelState", "expanded");
      }
    } else {
      // Any game - collapse panel for more space
      if (!this.isPanelCollapsed) {
        this.isPanelCollapsed = true;
        this.updatePanelState();
        localStorage.setItem("panelState", "collapsed");
      }
    }

    if (this.currentGame === gameId) {
      console.log("Already on this game, returning");
      return;
    }

    if (this.games[this.currentGame]) {
      console.log("Stopping current game:", this.currentGame);
      this.games[this.currentGame].stop();
    }

    this.currentGame = gameId;
    console.log("Set current game to:", gameId);

    const gameItems = document.querySelectorAll(".game-item");
    console.log("Found game items:", gameItems.length);
    gameItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("data-game") === gameId) {
        item.classList.add("active");
        console.log("Activated game item for:", gameId);
      }
    });

    console.log("Rendering current game...");
    this.renderCurrentGame();
    this.updateUI();

    if (this.games[gameId]) {
      console.log("Starting game:", gameId, "Game object:", this.games[gameId]);
      this.games[gameId].start();
    } else {
      console.log("ERROR: No game object found for:", gameId);
    }
    console.log("=== END SWITCH GAME DEBUG ===");
  }

  renderCurrentGame() {
    const gameContent = document.getElementById("game-content");
    const game = this.games[this.currentGame];

    if (game && game.render) {
      gameContent.innerHTML = game.render();
    } else {
      gameContent.innerHTML = `
                <div class="game-screen">
                    <h2>Game Loading...</h2>
                    <p>Please wait while the game loads.</p>
                </div>
            `;
    }
  }

  updateUI() {
    const currentGameName = document.getElementById("current-game-name");
    const currentScore = document.getElementById("current-score");
    const gameDescription = document.getElementById("game-description");

    const game = this.games[this.currentGame];

    if (currentGameName) {
      currentGameName.textContent =
        this.gameNames[this.currentGame] || "Unknown Game";
    }

    if (currentScore && game) {
      currentScore.textContent = game.getScore ? game.getScore() : "0";
    }

    if (gameDescription) {
      gameDescription.textContent =
        this.gameDescriptions[this.currentGame] || "No description available.";
    }
  }

  updateScore(newScore) {
    this.currentScore = newScore;
    const currentScoreElement = document.getElementById("current-score");
    if (currentScoreElement) {
      currentScoreElement.textContent = newScore;
    }
  }

  getCurrentGame() {
    return this.games[this.currentGame];
  }

  getHalloweenCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Trick or Treat time: October 31 at 6:00 PM (month 9, hour 18)
    let halloween = new Date(currentYear, 9, 31, 18, 0, 0, 0);

    // If we're past Halloween trick-or-treat time this year, use next year
    if (now > halloween) {
      halloween = new Date(currentYear + 1, 9, 31, 18, 0, 0, 0);
    }

    // Calculate difference in milliseconds
    const diff = halloween - now;

    // Convert to days, hours, minutes, seconds
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Format with leading zeros
    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  }

  updateCountdown() {
    const countdown = this.getHalloweenCountdown();

    const daysElement = document.getElementById("countdown-days");
    const hoursElement = document.getElementById("countdown-hours");
    const minutesElement = document.getElementById("countdown-minutes");
    const secondsElement = document.getElementById("countdown-seconds");

    if (daysElement) daysElement.textContent = countdown.days;
    if (hoursElement) hoursElement.textContent = countdown.hours;
    if (minutesElement) minutesElement.textContent = countdown.minutes;
    if (secondsElement) secondsElement.textContent = countdown.seconds;
  }

  startCountdownTimer() {
    // Update immediately
    this.updateCountdown();

    // Then update every second
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }
}

let gameApp;

document.addEventListener("DOMContentLoaded", () => {
  gameApp = new HalloweenGames();
});

window.gameApp = gameApp;
