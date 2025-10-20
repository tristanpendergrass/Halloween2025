export default class TitleScreen {
  constructor() {
    this.score = 0;
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
                <h1>🦇 Halloween Minigames! 🦇</h1>
                <h2>2025 EDITION!</h2>
                <p>Choose a game from the menu to start playing!</p>
                <div class="halloween-decoration">
                    <span class="pumpkin">🎃</span>
                    <span class="ghost">👻</span>
                    <span class="spider">🕷️</span>
                </div>
            </div>
        `;
  }

  start() {
    console.log("Title screen active");
  }

  stop() {
    console.log("Leaving title screen");
  }

  getScore() {
    return 0;
  }
}
