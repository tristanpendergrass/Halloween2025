/**
 * Medium Halloween Word Haunt Puzzle
 *
 * A 7x7 grid with moderate difficulty Halloween words
 * Mix of horizontal, vertical, and diagonal placements
 */

export default {
  name: "Trick 'r Treat Goodness",
  description: "Find spooky words with moderate challenge!",

  // old grid- the original w problem solutions
  // grid: [
  //    ['E', 'N', 'C', 'N', 'R', 'O'],
  //    ['Y', 'O', 'N', 'A', 'C', 'B'],
  //    ['L', 'M', 'D', 'O', 'P', 'O'],
  //    ['L', 'A', 'Y', 'P', 'N', 'U'],
  //    ['C', 'F', 'B', 'C', 'R', 'E'],
  //    ['A', 'R', 'T', 'Y', 'O', 'L'],
  //    ['R', 'U', 'I', 'K', 'C', 'P'],
  //    ['A', 'M', 'E', 'L', 'A', 'P'],
  //],
  // new grid - maybe will work?
  grid: [
    ["E", "N", "Y", "N", "R", "O"],
    ["Y", "O", "D", "N", "C", "B"],
    ["L", "M", "A", "O", "P", "O"],
    ["L", "A", "C", "P", "N", "U"],
    ["C", "F", "B", "C", "K", "E"],
    ["A", "R", "T", "Y", "C", "L"],
    ["R", "U", "I", "R", "O", "P"],
    ["A", "M", "E", "L", "A", "P"],
  ],

  // grid: [
  //     [' ', ' ', ' ', ' ', ' ', ' '],
  //     [' ', ' ', ' ', ' ', ' ', ' '],
  //     [' ', ' ', ' ', ' ', ' ', ' '],
  //     [' ', ' ', ' ', ' ', ' ', ' '],
  //     [' ', ' ', ' ', ' ', ' ', ' '],
  //     [' ', ' ', ' ', ' ', ' ', ' '],
  //     [' ', ' ', ' ', ' ', ' ', ' '],
  //     [' ', ' ', ' ', ' ', ' ', ' '],
  // ],
  // grid: [
  //     ['Y', 'D', 'N', 'A', 'C', ' '],
  //     ['B', 'O', 'U', ' ', ' ', ' '],
  //     [' ', ' ', ' ', 'N', 'C', ' '],
  //     [' ', ' ', ' ', ' ', ' ', 'Y'],
  //     ['C', ' ', ' ', ' ', 'B', 'E'],
  //     ['A', ' ', ' ', ' ', 'A', 'L'],
  //     ['R', ' ', ' ', 'L', 'L', 'P'],
  //     ['A', 'M', 'E', 'L', 'A', 'P'],
  // ],

  // Target words to find - mix of lengths and orientations
  words: [
    "CARAMELAPPLE", //
    "CANDY",
    "MONEY",
    "POPCORN", //
    "FRUIT", //
    "BOUNCYBALL", //
    "ROCK", //
  ],

  gridSize: 48,
  totalWordLength: 48,
};
