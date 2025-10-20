# Word Haunt Puzzles

This directory contains word haunt puzzle definitions and validation tools for the Halloween word haunt game.

## Puzzle Format

Word haunt puzzles are defined as CommonJS modules that export a puzzle object with the following structure:

```javascript
module.exports = {
  name: "Puzzle Name",
  description: "Brief description of the puzzle theme",

  // 2D array of letters representing the grid
  grid: [
    ["A", "B", "C", "D"],
    ["E", "F", "G", "H"],
    ["I", "J", "K", "L"],
    ["M", "N", "O", "P"],
  ],

  // Array of target words to find in the grid
  words: ["WORD1", "WORD2", "WORD3"],

  // Optional metadata
  gridSize: 16, // Total grid cells (rows � cols)
  totalWordLength: 15, // Sum of all word lengths
};
```

### Required Properties

- **`name`** (string): Display name for the puzzle
- **`description`** (string): Brief description shown to players
- **`grid`** (array): 2D array of uppercase letters
- **`words`** (array): Array of uppercase words to find

### Optional Properties

- **`gridSize`**: Total number of grid cells (for documentation)
- **`totalWordLength`**: Sum of all target word lengths (for validation)

## Adding New Puzzles

1. **Create a new puzzle file** (e.g., `easy.js`, `medium.js`):

   ```javascript
   module.exports = {
     name: "Easy Halloween Puzzle",
     description: "Find spooky words in this beginner-friendly grid!",
     grid: [
       // Your letter grid here
     ],
     words: [
       // Your target words here
     ],
   };
   ```

2. **Design your grid** with hidden words:

   - Words can be placed horizontally, vertically, or diagonally
   - Words can be forwards or backwards
   - Words can overlap with other words
   - Fill remaining spaces with random letters

3. **Validate your puzzle** using the validation script (see below)

4. **Update the game** to use your new puzzle by modifying the word search game file

## Validation Script

Use `validate.js` to check if your puzzle is correctly constructed:

### Running Validation

```bash
# From the project root directory
node js/games/word-search/puzzles/validate.js
```

### What It Checks

The validator searches for each target word in the grid and reports:

- How many times each word appears
- Summary statistics
- Overall validation result

### Example Output

```
=== WORD SEARCH PUZZLE VALIDATION ===
Puzzle: Halloween Word Haunt
Grid size: 7x8
Target words: 8

=== INDIVIDUAL WORD VALIDATION ===
word EERIE found 1 time(s)
word JACKOLANTERN found 1 time(s)
word COBWEB found 1 time(s)
...

=== VALIDATION SUMMARY ===
Words found exactly once: 8/8
Words found multiple times: 0
Words not found: 0
Total word instances found: 8

Validation result: GOOD 
```

### Validation Results

- **GOOD **: All words found exactly once (ideal)
- **NEEDS REVIEW �**: Some issues detected:
  - Words found multiple times (may confuse players)
  - Words not found (typos or placement errors)
  - Missing words from the target list

### Validating Different Puzzles

To validate a different puzzle file, modify the `require()` statement in `validate.js`:

```javascript
// Change this line
const puzzle = require("./hard");

// To point to your puzzle file
const puzzle = require("./your-puzzle-name");
```
