/**
 * The Radley House - Wrapper Module
 * Integrates the standalone game into the Halloween Games framework using an iframe
 */

export default class TheRadleyHouse {
    constructor() {
        this.score = 0;
    }

    render() {
        return `
            <iframe
                id="theRadleyHouse-iframe"
                src="js/games/theRadleyHouse/index.html"
                style="width: 100%; height: 100%; border: none; display: block;"
                title="The Radley House Game">
            </iframe>
        `;
    }

    start() {
        console.log('The Radley House game started');
        // Game auto-starts when iframe loads
    }

    stop() {
        console.log('The Radley House game stopped');
        // Game will reload fresh next time it's activated
    }

    getScore() {
        // Return 0 since we're not communicating with the iframe
        return 0;
    }
}
