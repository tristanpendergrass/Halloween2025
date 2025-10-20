/**
 * Easy Halloween Word Haunt Puzzle
 *
 * A 6x6 grid with simple, short Halloween words
 * Perfect for beginners or quick games
 */

export default {
    name: "Spotted on Halloween night",
    description: "Find all the words",

    // 6 rows x 6 columns grid
    grid: [
        ['F', 'I', 'R', 'E', 'F', 'I', 'G', 'H',],
        ['L', 'S', 'A', 'B', 'U', 'Z', 'Z', 'T',],
        ['E', 'Y', 'A', 'D', 'S', 'U', 'M', 'E',],
        ['W', 'E', 'D', 'N', 'E', 'R', 'I', 'R',],
        ['N', 'A', 'M', 'R', 'E', 'P', 'U', 'S',],
    ],

    // Target words to find - all simple, short Halloween words
    words: [
        'BUZZ',
        'ELSA',
        'FIREFIGHTER',
        'RUMI',
        'SUPERMAN',
        'WEDNESDAY',
    ],

    gridSize: 40,
    totalWordLength: 40
};