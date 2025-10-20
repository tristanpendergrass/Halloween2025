/**
 * With this validator we are going for a shaky sort of validation. It is not a complete picture of whether a given word search
 * puzzle is valid but merely a helpful tool. It prints the number of times each word can be found in a given puzzle,
 * independently of the other words. This can be helpful because it clues you in to when you add multiple ways to find the
 * same word accidentally from when words overlap each other. Finding all words in the puzzle exactly once isn't a guarantee
 * it's valid (and having some of them found more than once doesn't mean the puzzle isn't valid either), but it's a start.
 *
 * Usage:
 * - npm run validate-word-haunt easy
 * - npm run validate-word-haunt medium
 * - npm run validate-word-haunt hard
 */

// Get puzzle name from command line argument (default to 'easy')
const puzzleName = process.argv[2] || 'easy';

// Validate puzzle name
if (!['easy', 'medium', 'hard'].includes(puzzleName)) {
  console.error(`❌ Invalid puzzle name: "${puzzleName}"`);
  console.error('Valid options: easy, medium, hard');
  console.error('Usage: npm run validate-word-haunt <puzzle-name>');
  process.exit(1);
}

// Load puzzle using dynamic import (for ES6 modules)
const puzzleModule = await import(`./${puzzleName}.mjs`);
const puzzle = puzzleModule.default;
const processedGrid = puzzle.grid;

function findWord(grid, word) {
  let found = 0;
  // Find the maximum column length for the usedLetter array
  const maxCols = Math.max(...grid.map(row => row.length));

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const usedLetter = new Array(grid.length).fill(null).map((foo) => (new Array(maxCols).fill(false)));
      const firstChar = word.charAt(0);
      const rest = word.slice(1);
      const foundHere = search(grid, firstChar, rest, row, col, usedLetter);
      found += foundHere;
    }
  }
  console.log('word', word, 'found', found, 'time(s)')
  return found;
}

const search = (grid, firstChar, rest, row, col, usedLetter) => {
  // Searching out of bounds
  if (row < 0 || row >= grid.length || col < 0 || !grid[row] || col >= grid[row].length) {
    return 0;
  }
  // Can't use the place we've been sent in the word
  if (firstChar !== grid[row][col] || usedLetter[row][col]) {
    return 0;
  }

  const nextFirstChar = rest.charAt(0);
  const nextRest = rest.slice(1);
  if (nextFirstChar === '') {
    return 1;
  }

  usedLetter[row][col] = true;
  return search(grid, nextFirstChar, nextRest, row - 1, col - 1, usedLetter)
    + search(grid, nextFirstChar, nextRest, row - 1, col, usedLetter)
    + search(grid, nextFirstChar, nextRest, row - 1, col + 1, usedLetter)
    + search(grid, nextFirstChar, nextRest, row, col - 1, usedLetter)
    + search(grid, nextFirstChar, nextRest, row, col + 1, usedLetter)
    + search(grid, nextFirstChar, nextRest, row + 1, col - 1, usedLetter)
    + search(grid, nextFirstChar, nextRest, row + 1, col, usedLetter)
    + search(grid, nextFirstChar, nextRest, row + 1, col + 1, usedLetter);
}

// Validate all words from the puzzle data
console.log('\n=== WORD HAUNT PUZZLE VALIDATION ===');
console.log('Puzzle:', puzzle.name);
console.log('Grid size:', processedGrid.length + 'x' + processedGrid[0].length);
console.log('Target words:', puzzle.words.length);
console.log('\n=== INDIVIDUAL WORD VALIDATION ===');

let totalFinds = 0;
let wordsFoundOnce = 0;
let wordsFoundMultiple = 0;
let wordsNotFound = 0;

puzzle.words.forEach(word => {
  const found = findWord(processedGrid, word);
  totalFinds += found;
  if (found === 1) {
    wordsFoundOnce++;
  } else if (found > 1) {
    wordsFoundMultiple++;
  } else {
    wordsNotFound++;
  }
});

console.log('\n=== VALIDATION SUMMARY ===');
console.log('Words found exactly once:', wordsFoundOnce + '/' + puzzle.words.length);
console.log('Words found multiple times:', wordsFoundMultiple);
console.log('Words not found:', wordsNotFound);
console.log('Total word instances found:', totalFinds);
console.log('\nValidation result:', (wordsFoundOnce === puzzle.words.length && wordsNotFound === 0) ? 'GOOD ✓' : 'NEEDS REVIEW ⚠️');