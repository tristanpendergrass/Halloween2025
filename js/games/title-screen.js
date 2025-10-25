export default class TitleScreen {
  constructor() {
    this.score = 0;
    this.cycleTimer = null;
    this.messageTimeout = null; // Store timeout ID for message fade
    this.currentRiseDuration = 0; // Store rise duration for calculating fall duration
    this.currentFallDuration = 0; // Store fall duration
    this.characters = [
      "silhouette_batman_transparent_250h.png",
      "silhouette_darthVader_transparent_250h.png",
      "silhouette_jiji_transparent_250h.png",
      "silhouette_luke_transparent_250h.png",
      "silhouette_m_boo_transparent_250h.png",
      "silhouette_m_mike_transparent_250h.png",
      "silhouette_m_sully_transparent_250h.png",
      "silhouette_otgw_gregory_transparent_250h.png",
      "silhouette_otgw_theBeast_transparent_250h.png",
      "silhouette_otgw_wirt_transparent_250h.png",
      "silhouette_snoopy_transparent_250h.png",
      "silhouette_superman_transparent_250h.png",
      "silhouette_totoro_transparent_250h.png",
      "silhouette_ts_boPeep_transparent_250h.png",
      "silhouette_ts_buzz_transparent_250h.png",
      "silhouette_ts_jessie_transparent_250h.png",
      "silhouette_ts_rexx_transparent_250h.png",
      "silhouette_ts_sporky_transparent_250h.png",
      "silhouette_wickedWitch_transparent_250h.png",
    ];
    this.shuffledCharacters = []; // Holds shuffled order of characters
    this.currentCharacterIndex = 0; // Tracks position in shuffled list
  }

  shuffleCharacterList() {
    // Create a copy of the characters array
    this.shuffledCharacters = [...this.characters];

    // Fisher-Yates shuffle algorithm
    for (let i = this.shuffledCharacters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledCharacters[i], this.shuffledCharacters[j]] = [
        this.shuffledCharacters[j],
        this.shuffledCharacters[i],
      ];
    }

    // Reset index to start of new shuffled list
    this.currentCharacterIndex = 0;

    console.log(
      `[TitleScreen] Shuffled character list for new cycle of ${this.shuffledCharacters.length} characters`
    );
  }

  getNextCharacter() {
    // Get character at current index
    const character = this.shuffledCharacters[this.currentCharacterIndex];

    console.log(
      `[TitleScreen] Character ${this.currentCharacterIndex + 1}/${
        this.shuffledCharacters.length
      }: ${character}`
    );

    // Move to next character
    this.currentCharacterIndex++;

    // If we've shown all characters, reshuffle for next cycle
    if (this.currentCharacterIndex >= this.shuffledCharacters.length) {
      console.log(`[TitleScreen] Completed full cycle, reshuffling...`);
      this.shuffleCharacterList();
    }

    return character;
  }

  // edit the tile text and such in the index.html file

  render() {
    // Use the shared welcome screen template from main app
    if (window.gameApp && window.gameApp.welcomeScreenTemplate) {
      return window.gameApp.welcomeScreenTemplate;
    }

    // Fallback if template not available
    return `
            <div class="welcome-screen">
              <img src="assets/background/pumpkin_patch_BACKGROUND_950x714.png" alt="Pumpkin Patch" class="title-screen-background">
              <img id="character-silhouette" src="assets/background/silhouette_batman_transparent_250h.png" alt="Character Silhouette" class="batman-silhouette">
              <img src="assets/background/pumpkin_patch_950x714_justBelowHorizon.png" alt="Pumpkin Patch Foreground" class="title-screen-foreground">
              <!-- Credits Button -->
              <button id="credits-button" class="credits-button-center">Credits</button>
            </div>
        `;
  }

  setupCharacterCycling() {
    const characterImg = document.querySelector(".batman-silhouette");
    if (!characterImg) {
      console.error("[TitleScreen] Could not find .batman-silhouette element!");
      return;
    }

    // Random horizontal position between 175 and 285
    const randomizePosition = () => {
      const randomX = Math.floor(Math.random() * 111) + 175; // 175-285
      const midpoint = (175 + 285) / 2; // 230px

      // Set horizontal position
      characterImg.style.left = `${randomX}px`;

      // Flip if to the right of midpoint
      if (randomX > midpoint) {
        characterImg.classList.add("flipped");
        console.log(
          `[TitleScreen] Character positioned at x=${randomX}px (flipped, right of ${midpoint})`
        );
      } else {
        characterImg.classList.remove("flipped");
        console.log(
          `[TitleScreen] Character positioned at x=${randomX}px (normal, left of ${midpoint})`
        );
      }
    };

    // Start rise animation
    const startRise = () => {
      // Random rise duration: 2-4 seconds
      this.currentRiseDuration = Math.random() * 2 + 2; // 2-4 seconds
      // Fall is 1 second faster (minimum 1 second)
      this.currentFallDuration = Math.max(1, this.currentRiseDuration - 1);

      console.log(
        `[TitleScreen] Rising (${this.currentRiseDuration.toFixed(
          1
        )}s), will fall (${this.currentFallDuration.toFixed(1)}s)`
      );

      characterImg.classList.remove("rise", "fall");
      void characterImg.offsetWidth; // Force reflow
      characterImg.style.animationDuration = `${this.currentRiseDuration}s`;
      characterImg.classList.add("rise");
    };

    // Start fall animation
    const startFall = () => {
      console.log(
        `[TitleScreen] Falling (${this.currentFallDuration.toFixed(1)}s)...`
      );

      characterImg.classList.remove("rise", "fall");
      void characterImg.offsetWidth; // Force reflow
      characterImg.style.animationDuration = `${this.currentFallDuration}s`;
      characterImg.classList.add("fall");
    };

    // Animation sequence handler
    const onAnimationEnd = (event) => {
      if (
        event.animationName === "batman-rise" ||
        event.animationName === "batman-rise-flipped"
      ) {
        // Character reached the top, pause randomly 1-4 seconds
        const topPause = Math.random() * 3000 + 1000; // 1-4 seconds
        console.log(
          `[TitleScreen] Reached top, pausing for ${(topPause / 1000).toFixed(
            1
          )}s`
        );

        this.cycleTimer = setTimeout(() => {
          startFall();
        }, topPause);
      } else if (
        event.animationName === "batman-fall" ||
        event.animationName === "batman-fall-flipped"
      ) {
        // Character reached the bottom, pause randomly 5-15 seconds
        const bottomPause = Math.random() * 10000 + 5000; // 5-15 seconds
        console.log(
          `[TitleScreen] Reached bottom, pausing for ${(
            bottomPause / 1000
          ).toFixed(1)}s before next character`
        );

        this.cycleTimer = setTimeout(() => {
          // Get next character from shuffled list
          const newCharacter = this.getNextCharacter();

          console.log(`[TitleScreen] Switching to: ${newCharacter}`);

          // Update the image source
          characterImg.src = `assets/background/${newCharacter}`;

          // Randomize position and start new cycle
          randomizePosition();
          startRise();
        }, bottomPause);
      }
    };

    // Add event listener for animation end
    characterImg.addEventListener("animationend", onAnimationEnd);

    // Shuffle the character list to create random order for first cycle
    this.shuffleCharacterList();

    // Start the first cycle with first character from shuffled list
    console.log("[TitleScreen] Starting character cycling");
    const firstCharacter = this.getNextCharacter();
    characterImg.src = `assets/background/${firstCharacter}`;
    randomizePosition();
    startRise();
  }

  setupClickMessage() {
    const welcomeScreen = document.querySelector(".welcome-screen");
    const message = document.getElementById("silhouette-message");

    if (!welcomeScreen || !message) {
      console.error(
        "[TitleScreen] Could not find welcome screen or message element!"
      );
      return;
    }

    // Click handler to show message
    this.clickHandler = () => {
      // Clear any existing timeout
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
      }

      // Show message
      message.classList.add("show");

      // Hide message after 6 seconds
      this.messageTimeout = setTimeout(() => {
        message.classList.remove("show");
      }, 6000);
    };

    welcomeScreen.addEventListener("click", this.clickHandler);
    console.log("[TitleScreen] Click message handler set up");
  }

  start() {
    console.log("Title screen active");
    this.setupCharacterCycling();
    // setupClickMessage() disabled - message removed from UI
  }

  stop() {
    console.log("Leaving title screen");
    // Clear the cycle timer when leaving title screen
    if (this.cycleTimer) {
      clearTimeout(this.cycleTimer);
      this.cycleTimer = null;
    }

    // Clear the message timeout
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }

    // Remove click handler
    const welcomeScreen = document.querySelector(".welcome-screen");
    if (welcomeScreen && this.clickHandler) {
      welcomeScreen.removeEventListener("click", this.clickHandler);
    }

    // Hide message if shown
    const message = document.getElementById("silhouette-message");
    if (message) {
      message.classList.remove("show");
    }

    // Remove animation classes
    const characterImg = document.querySelector(".batman-silhouette");
    if (characterImg) {
      characterImg.classList.remove("rise", "fall");
    }
  }

  getScore() {
    return 0;
  }
}
