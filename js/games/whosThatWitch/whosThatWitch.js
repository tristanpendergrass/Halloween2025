/**
 * Who's That Witch - Wrapper Module
 * Integrates the standalone game into the Halloween Games framework using an iframe
 */

export default class WhosThatWitch {
    constructor() {
        this.score = 0;
    }

    render() {
        return `
            <iframe
                id="whosThatWitch-iframe"
                src="js/games/whosThatWitch/index.html"
                style="width: 100%; height: 100%; border: none; display: block;"
                title="Who's That Witch Game">
            </iframe>
        `;
    }

    start() {
        console.log('Who\'s That Witch game started');
        // Game auto-starts when iframe loads
    }

    stop() {
        console.log('Who\'s That Witch game stopped');
        // Game will reload fresh next time it's activated
    }

    getScore() {
        // Return 0 since we're not communicating with the iframe
        return 0;
    }
}
