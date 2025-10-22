/* ====================================================================
   SLIDING PUZZLE GAME LOGIC
   11-puzzle game (3x4 grid) - click tiles adjacent to blank to slide
   ==================================================================== */

// ====================================================================
// CONSTANTS AND CONFIGURATION
// ====================================================================

const GRID_COLS = 3;  // 3 columns
const GRID_ROWS = 4;  // 4 rows (changed from 5 to make puzzle easier)
const TILE_WIDTH = 64;  // px
const TILE_HEIGHT = 95; // px (380÷4 = 95)
const IMAGE_WIDTH = 192;  // px
const IMAGE_HEIGHT = 380; // px
const SHUFFLE_MOVES = 100; // Number of random moves to shuffle puzzle

// ====================================================================
// GAME STATE
// ====================================================================

let currentImagePath = null;  // Currently loaded puzzle image
let tiles = [];  // Array of tile div elements
let blankRow = 0;  // Current position of blank space
let blankCol = 0;  // Current position of blank space

// Generated puzzle images (created once at page load)
let arabicNumbersPuzzle = null;  // Data URL for Arabic numbers (1-11) puzzle
let chineseNumbersPuzzle = null; // Data URL for Chinese traditional numbers puzzle

// Image cycling for left box
let cyclingImages = [
  'assets/image1_192x380.png',
  'assets/image2_192x380.png',
  'assets/image3_192x380.png',
  'assets/image4_192x380.png'
];
let currentImageIndex = 0; // Tracks which image to load next
let leftBoxElement = null; // Reference to left box element for thumbnail updates

// ====================================================================
// NUMBERED PUZZLE GENERATION
// ====================================================================

/**
 * Generate a numbered puzzle image using canvas
 * Draws numbers on top of the domino background image
 * @param {Array<string>} numbers - Array of 11 numbers/characters to draw (positions 1-11)
 * @param {string} fontFamily - CSS font family to use
 * @param {number} fontSize - Font size in pixels
 * @param {string} color - Text color
 * @returns {Promise<string>} Promise that resolves to data URL of generated image
 */
function generateNumberedPuzzle(numbers, fontFamily = 'Arial, sans-serif', fontSize = 48, color = 'black') {
  return new Promise((resolve, reject) => {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = IMAGE_WIDTH;
    canvas.height = IMAGE_HEIGHT;
    const ctx = canvas.getContext('2d');

    // Load domino background
    const dominoImg = new Image();
    dominoImg.onload = () => {
      // Draw background
      ctx.drawImage(dominoImg, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

      // Set text style
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw numbers for each tile position (skip 0,0 blank)
      let numberIndex = 0;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          // Skip position (0,0) - that's the blank
          if (row === 0 && col === 0) {
            continue;
          }

          // Calculate center position of this tile
          const x = col * TILE_WIDTH + TILE_WIDTH / 2;
          const y = row * TILE_HEIGHT + TILE_HEIGHT / 2;

          // Draw embossed effect - 3 layers for depth
          // 1. White highlight (bottom-right) for raised appearance
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(numbers[numberIndex], x + 1, y + 1);

          // 2. Dark shadow (top-left) for depth
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillText(numbers[numberIndex], x - 1, y - 1);

          // 3. Main text in specified color
          ctx.fillStyle = color;
          ctx.fillText(numbers[numberIndex], x, y);

          numberIndex++;
        }
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };

    dominoImg.onerror = () => {
      reject(new Error('Failed to load domino background image'));
    };

    dominoImg.src = 'assets/domino_192x380.png';
  });
}

/**
 * Generate both numbered puzzle images (Arabic and Chinese)
 * Called once during initialization
 * @returns {Promise<void>}
 */
async function generateNumberedPuzzles() {
  // Arabic numbers 1-11
  const arabicNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

  // Chinese traditional numbers 1-11
  const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一'];

  try {
    // Generate both puzzles
    // Arabic: smaller (40px) and black
    arabicNumbersPuzzle = await generateNumberedPuzzle(arabicNumbers, 'Arial, sans-serif', 40, 'black');
    // Chinese: medium size (36px) and bold black
    chineseNumbersPuzzle = await generateNumberedPuzzle(chineseNumbers, 'SimSun, "Microsoft YaHei", serif', 36, 'black');

    console.log('Numbered puzzles generated successfully');
  } catch (error) {
    console.error('Error generating numbered puzzles:', error);
  }
}

// ====================================================================
// INITIALIZATION
// ====================================================================

/**
 * Initialize the puzzle game when page loads
 */
async function initPuzzleGame() {
  // Generate numbered puzzles first (this happens once)
  await generateNumberedPuzzles();

  // Set up LEFT BOX with cycling behavior
  leftBoxElement = document.querySelector('.image-box-left');
  if (leftBoxElement) {
    // Set initial thumbnail to image1
    leftBoxElement.style.backgroundImage = `url('${cyclingImages[0]}')`;

    // Add cycling click handler
    leftBoxElement.addEventListener('click', handleLeftBoxClick);
  }

  // Set up MIDDLE and RIGHT boxes (unchanged - numbers)
  const numberBoxes = [
    { element: document.querySelector('.image-box-middle'), image: arabicNumbersPuzzle },
    { element: document.querySelector('.image-box-right'), image: chineseNumbersPuzzle }
  ];

  numberBoxes.forEach(box => {
    if (box.element && box.image) {
      // Set thumbnail background
      box.element.style.backgroundImage = `url('${box.image}')`;

      // Add click handler to load this puzzle (with shuffle)
      box.element.addEventListener('click', () => loadPuzzle(box.image, true));
    }
  });

  // Load image1 by default in solved state (no shuffle)
  loadPuzzle(cyclingImages[0], false);
}

/**
 * Handle click on left box - cycles through images
 */
function handleLeftBoxClick() {
  // Get the current image to load
  const imageToLoad = cyclingImages[currentImageIndex];

  // Load the puzzle (with shuffle)
  loadPuzzle(imageToLoad, true);

  // Update thumbnail to show current image
  leftBoxElement.style.backgroundImage = `url('${imageToLoad}')`;

  // Move to next image (wrap around to 0 after 3)
  currentImageIndex = (currentImageIndex + 1) % cyclingImages.length;
}

// ====================================================================
// PUZZLE LOADING
// ====================================================================

/**
 * Load a new puzzle image
 * This is called when player clicks a thumbnail or on initial load
 * @param {string} imagePath - Path to the puzzle image (192x380)
 * @param {boolean} shouldShuffle - Whether to shuffle the puzzle (default: true)
 */
function loadPuzzle(imagePath, shouldShuffle = true) {
  currentImagePath = imagePath;

  // Clear any existing tiles
  clearTiles();

  // Create tiles in solved position
  createTiles(imagePath);

  // Shuffle using reverse-play algorithm (unless initial display)
  if (shouldShuffle) {
    shufflePuzzle();
  }

  // Update which tiles are clickable
  updateClickableStates();
}

/**
 * Clear all existing tiles from the game board
 */
function clearTiles() {
  const container = document.querySelector('.game-content-container');

  // Remove all tile elements
  tiles.forEach(tile => {
    if (tile && tile.parentNode) {
      tile.parentNode.removeChild(tile);
    }
  });

  tiles = [];
}

/**
 * Create the 11 tiles (12 spaces total, position 0,0 is blank)
 * Each tile shows a slice of the full image using background-position
 * @param {string} imagePath - Path to the puzzle image
 */
function createTiles(imagePath) {
  const container = document.querySelector('.game-content-container');

  // Create tiles for each position in the grid
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // Skip position (0,0) - that's the blank space
      if (row === 0 && col === 0) {
        continue;
      }

      // Create tile div
      const tile = document.createElement('div');
      tile.className = 'sliding-tile';

      // Set background image (full puzzle image)
      tile.style.backgroundImage = `url('${imagePath}')`;

      // Set background position to show this tile's slice
      // Negative offset: shift the background to show the correct piece
      const bgX = -(col * TILE_WIDTH);
      const bgY = -(row * TILE_HEIGHT);
      tile.style.backgroundPosition = `${bgX}px ${bgY}px`;

      // Store the original row/col (which slice of image this is)
      tile.dataset.originalRow = row;
      tile.dataset.originalCol = col;

      // Set initial position (starts in solved state)
      tile.dataset.row = row;
      tile.dataset.col = col;
      setTilePosition(tile, row, col);

      // Add click handler
      tile.addEventListener('click', handleTileClick);

      // Add to container and tracking array
      container.appendChild(tile);
      tiles.push(tile);
    }
  }

  // Blank starts at (0, 0)
  blankRow = 0;
  blankCol = 0;
}

/**
 * Set the visual position of a tile
 * @param {HTMLElement} tile - The tile element
 * @param {number} row - Grid row position
 * @param {number} col - Grid column position
 */
function setTilePosition(tile, row, col) {
  tile.style.left = `${col * TILE_WIDTH}px`;
  tile.style.top = `${row * TILE_HEIGHT}px`;
}

// ====================================================================
// SHUFFLING ALGORITHM
// ====================================================================

/**
 * Shuffle the puzzle using "reverse play" algorithm
 * Makes random valid moves to ensure puzzle is solvable
 * Excludes last moved tile to prevent backtracking
 */
function shufflePuzzle() {
  let lastMovedTile = null;

  for (let i = 0; i < SHUFFLE_MOVES; i++) {
    // Find all tiles adjacent to blank
    const adjacentTiles = getAdjacentTiles(blankRow, blankCol);

    // Exclude the last moved tile to prevent backtracking
    const availableTiles = lastMovedTile
      ? adjacentTiles.filter(t => t !== lastMovedTile)
      : adjacentTiles;

    // If we filtered out all tiles, just use all adjacent tiles
    const tilesToChooseFrom = availableTiles.length > 0 ? availableTiles : adjacentTiles;

    // Pick random tile to move
    const randomIndex = Math.floor(Math.random() * tilesToChooseFrom.length);
    const tileToMove = tilesToChooseFrom[randomIndex];

    if (tileToMove) {
      // Get tile's current position
      const tileRow = parseInt(tileToMove.dataset.row);
      const tileCol = parseInt(tileToMove.dataset.col);

      // Swap with blank (no animation during shuffle)
      swapTileWithBlank(tileRow, tileCol, false);

      // Remember this tile for next iteration
      lastMovedTile = tileToMove;
    }
  }
}

// ====================================================================
// TILE MOVEMENT
// ====================================================================

/**
 * Handle click on a tile
 * Only moves the tile if it's adjacent to blank
 * @param {Event} event - Click event
 */
function handleTileClick(event) {
  const tile = event.currentTarget;
  const tileRow = parseInt(tile.dataset.row);
  const tileCol = parseInt(tile.dataset.col);

  // Check if this tile is adjacent to blank
  if (isAdjacent(tileRow, tileCol, blankRow, blankCol)) {
    // Swap with blank (with animation)
    swapTileWithBlank(tileRow, tileCol, true);

    // Update which tiles can now be clicked
    updateClickableStates();
  }
}

/**
 * Swap a tile with the blank space
 * @param {number} tileRow - Row of tile to swap
 * @param {number} tileCol - Column of tile to swap
 * @param {boolean} animate - Whether to use CSS animation (true) or instant (false)
 */
function swapTileWithBlank(tileRow, tileCol, animate) {
  // Find the tile at this position
  const tile = getTileAt(tileRow, tileCol);

  if (!tile) return;

  // Temporarily disable animation if requested
  if (!animate) {
    tile.style.transition = 'none';
  }

  // Move tile to blank position
  tile.dataset.row = blankRow;
  tile.dataset.col = blankCol;
  setTilePosition(tile, blankRow, blankCol);

  // Update blank position to where tile was
  blankRow = tileRow;
  blankCol = tileCol;

  // Re-enable animation
  if (!animate) {
    // Force reflow before re-enabling transition
    tile.offsetHeight;
    tile.style.transition = '';
  }
}

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

/**
 * Check if two positions are adjacent (left/right/up/down, NOT diagonal)
 * @param {number} row1 - First position row
 * @param {number} col1 - First position column
 * @param {number} row2 - Second position row
 * @param {number} col2 - Second position column
 * @returns {boolean} True if positions are adjacent
 */
function isAdjacent(row1, col1, row2, col2) {
  const rowDiff = Math.abs(row1 - row2);
  const colDiff = Math.abs(col1 - col2);

  // Adjacent if same row and 1 column apart, OR same column and 1 row apart
  return (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0);
}

/**
 * Get all tiles adjacent to a position
 * @param {number} row - Row position
 * @param {number} col - Column position
 * @returns {Array} Array of adjacent tile elements
 */
function getAdjacentTiles(row, col) {
  const adjacent = [];

  // Check all four directions
  const directions = [
    { row: row - 1, col: col },  // Up
    { row: row + 1, col: col },  // Down
    { row: row, col: col - 1 },  // Left
    { row: row, col: col + 1 }   // Right
  ];

  directions.forEach(pos => {
    // Skip if out of bounds
    if (pos.row < 0 || pos.row >= GRID_ROWS || pos.col < 0 || pos.col >= GRID_COLS) {
      return;
    }

    // Find tile at this position
    const tile = getTileAt(pos.row, pos.col);
    if (tile) {
      adjacent.push(tile);
    }
  });

  return adjacent;
}

/**
 * Find the tile currently at a specific position
 * @param {number} row - Row to search
 * @param {number} col - Column to search
 * @returns {HTMLElement|null} Tile element at position, or null if none
 */
function getTileAt(row, col) {
  return tiles.find(tile => {
    return parseInt(tile.dataset.row) === row && parseInt(tile.dataset.col) === col;
  }) || null;
}

/**
 * Update visual state of all tiles to show which are clickable
 * Only tiles adjacent to blank should show hover effect
 */
function updateClickableStates() {
  const adjacentTiles = getAdjacentTiles(blankRow, blankCol);

  tiles.forEach(tile => {
    if (adjacentTiles.includes(tile)) {
      tile.classList.add('sliding-tile-clickable');
      tile.classList.remove('sliding-tile-locked');
    } else {
      tile.classList.add('sliding-tile-locked');
      tile.classList.remove('sliding-tile-clickable');
    }
  });
}

// ====================================================================
// START THE GAME
// ====================================================================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initPuzzleGame);
