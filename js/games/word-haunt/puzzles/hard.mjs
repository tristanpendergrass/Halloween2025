/**
 * Halloween Word Haunt Puzzle #1
 * 
 * A 7x8 grid containing Halloween-themed words
 */

export default {
    name: "Halloween Word Haunt",
    description: "Find Halloween words hidden in the letter grid!",

    // 7 rows x 8 columns grid
    grid: [
        ['R', 'N', 'O', 'B', 'W', 'E', 'F', 'F'],
        ['E', 'C', 'E', 'G', 'C', 'O', 'B', 'I'],
        ['T', 'N', 'A', 'E', 'H', 'S', 'D', 'N'],
        ['G', 'R', 'A', 'L', 'O', 'K', 'N', 'U'],
        ['Y', 'O', 'I', 'A', 'B', 'A', 'C', 'O'],
        ['L', 'T', 'W', 'R', 'R', 'A', 'H', 'R'],
        ['E', 'H', 'E', 'E', 'J', 'I', 'E', 'S']
    ],

    // Target words to find (total length should equal grid size: 7*8 = 56)
    words: [
        'EERIE',       // 5 letters
        'JACKOLANTERN', // 12 letters
        'COBWEB',      // 6 letters
        'BANSHEE',     // 7 letters
        'WRAITH',      // 6 letters
        'SHROUD',      // 6 letters
        'GARGOYLE',    // 8 letters
        'COFFIN'       // 6 letters
    ],
    // Total: 5+12+6+7+6+6+8+6 = 56 letters ✓

    gridSize: 56,
    totalWordLength: 56
};