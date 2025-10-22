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
              <img src="assets/background/pumpkin_patch_BACKGROUND_950x714.png" alt="Pumpkin Patch" class="title-screen-background">
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
