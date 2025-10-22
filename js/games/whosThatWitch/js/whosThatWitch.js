/**
 * Who's That Witch? - Game Logic
 * Fully configurable via JSON files
 */

let gameConfig = null;
let tileData = null;
let imageList = null;
let groupedWitches = null; // Images organized by group number

// Game state variables for tile interaction
let selectedTiles = []; // Currently selected tiles (max 2)
let gameState = "WAITING_FOR_FIRST_TILE"; // Track game flow
let currentTileSize = null; // Track current difficulty's tile size for halftone images
let clickCount = 0; // Track player's matching attempts (witch-to-witch clicks only)
let currentDifficulty = null; // Track current difficulty for scoring

// Scoring system
let scoringEnabled = false; // Track if scoring is on/off
let cluesEnabled = false; // Track if clues (description tooltips) are shown for all witches
let bestScores = {
  easyTiles: null,
  mediumTiles: null,
  hardTiles: null,
}; // Best (lowest) scores for each difficulty

// Bonus tile configuration
const BONUS_REVEAL_DURATION = 5000; // How long (ms) bonus tile reveals adjacent tiles

// Track active animation timeouts for cancellation
let victoryAnimationTimeouts = []; // All timeouts from celebrateVictory
let transitionTimeouts = []; // All timeouts from transitionToClickMessage
let autoTransitionTimeout = null; // The 30-second auto-transition timeout

// Configuration file paths (easy to find and change)
const gameConfigFile = "json/gameConfig.json";
const tileSizesFile = "json/tileSizes.json";
const witchesFile = "json/witches.json";

// Victory celebration messages (9, 16, and 25 characters for easy/medium/hard)
const CELEBRATION_MESSAGES = {
  easyTiles: ["FANTASTIC", "EXCELLENT", "WONDERFUL", "MARVELOUS", "STELLAR!!"],
  mediumTiles: [
    "AMAZING MEMORY!!",
    "EXCELLENT MEMORY",
    "WHAT A MEMORY!!!",
    "SPELLBINDING JOB",
    "BEWITCHING SKILL",
    "SUPER WITCH WORK",
  ],
  hardTiles: [
    "ABSOLUTELY FANTASTIC WORK",
    "YOU ARE A MEMORY CHAMPION",
    "INCREDIBLE WITCH MATCHING",
    "SPECTACULAR ACHIEVEMENT!!",
    "SPELLBINDING PERFORMANCE!",
    "OUTSTANDING MASTERY SHOWN",
  ],
};

// "Click to start" idle messages (9, 16, and 25 characters for easy/medium/hard)
const CLICK_TO_START_MESSAGES = {
  easyTiles: "CLICK BTN",
  mediumTiles: "CLICK DIFFICULTY",
  hardTiles: "CLICK DIFFICULTY TO START",
};

// Grid square positions (left to right, top to bottom)
// Each position has: num (square index), row, col
const EASY_SQUARES = [
  { num: 0, row: 0, col: 0 },
  { num: 1, row: 0, col: 1 },
  { num: 2, row: 0, col: 2 },
  { num: 3, row: 1, col: 0 },
  { num: 4, row: 1, col: 1 },
  { num: 5, row: 1, col: 2 },
  { num: 6, row: 2, col: 0 },
  { num: 7, row: 2, col: 1 },
  { num: 8, row: 2, col: 2 },
];

const MEDIUM_SQUARES = [
  { num: 0, row: 0, col: 0 },
  { num: 1, row: 0, col: 1 },
  { num: 2, row: 0, col: 2 },
  { num: 3, row: 0, col: 3 },
  { num: 4, row: 1, col: 0 },
  { num: 5, row: 1, col: 1 },
  { num: 6, row: 1, col: 2 },
  { num: 7, row: 1, col: 3 },
  { num: 8, row: 2, col: 0 },
  { num: 9, row: 2, col: 1 },
  { num: 10, row: 2, col: 2 },
  { num: 11, row: 2, col: 3 },
  { num: 12, row: 3, col: 0 },
  { num: 13, row: 3, col: 1 },
  { num: 14, row: 3, col: 2 },
  { num: 15, row: 3, col: 3 },
];

const HARD_SQUARES = [
  { num: 0, row: 0, col: 0 },
  { num: 1, row: 0, col: 1 },
  { num: 2, row: 0, col: 2 },
  { num: 3, row: 0, col: 3 },
  { num: 4, row: 0, col: 4 },
  { num: 5, row: 1, col: 0 },
  { num: 6, row: 1, col: 1 },
  { num: 7, row: 1, col: 2 },
  { num: 8, row: 1, col: 3 },
  { num: 9, row: 1, col: 4 },
  { num: 10, row: 2, col: 0 },
  { num: 11, row: 2, col: 1 },
  { num: 12, row: 2, col: 2 },
  { num: 13, row: 2, col: 3 },
  { num: 14, row: 2, col: 4 },
  { num: 15, row: 3, col: 0 },
  { num: 16, row: 3, col: 1 },
  { num: 17, row: 3, col: 2 },
  { num: 18, row: 3, col: 3 },
  { num: 19, row: 3, col: 4 },
  { num: 20, row: 4, col: 0 },
  { num: 21, row: 4, col: 1 },
  { num: 22, row: 4, col: 2 },
  { num: 23, row: 4, col: 3 },
  { num: 24, row: 4, col: 4 },
];

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("Who's That Witch? - Game loaded");
  initGame();
});

/**
 * Initialize the game
 */
async function initGame() {
  const screenContainer = document.getElementById("screen");

  // Verify game container exists and has correct dimensions
  if (screenContainer) {
    const width = screenContainer.offsetWidth;
    const height = screenContainer.offsetHeight;
    console.log(`Screen container dimensions: ${width} x ${height}`);

    if (width === 950 && height === 714) {
      console.log("Screen container dimensions are correct!");
    } else {
      console.warn(`Expected 950x714, got ${width}x${height}`);
    }
  } else {
    console.error("Screen container not found!");
  }

  // Load game configuration first
  await loadGameConfig();

  // Load other data files based on config
  await loadTileData();
  await loadImageList();

  // Build grouped witches data structure
  buildGroupedWitches();

  // Preload back images to prevent flash on first play
  preloadBackImages();

  // Setup buttons dynamically from config
  setupButtons();

  // Load best scores from localStorage
  loadBestScores();

  // Setup scoring control button event listeners
  document
    .getElementById("scoring-toggle")
    .addEventListener("click", toggleScoring);
  document
    .getElementById("scoring-reset")
    .addEventListener("click", resetBestScores);
  document
    .getElementById("clues-toggle")
    .addEventListener("click", toggleClues);

  // Initialize display state based on scoring settings
  updateClickDisplay();
  updateBestScoresDisplay();

  // DEBUG: Global click detector to find what's blocking buttons
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target;
      console.log(
        "👆 GLOBAL CLICK detected on:",
        target.tagName,
        target.className || target.id
      );
      console.log("   Click coordinates:", e.clientX, e.clientY);

      // Get element at exact click position
      const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
      console.log("   Element at click point:", elementAtPoint);
      console.log(
        "   Element z-index:",
        getComputedStyle(elementAtPoint).zIndex
      );
      console.log(
        "   Element pointer-events:",
        getComputedStyle(elementAtPoint).pointerEvents
      );
    },
    true
  ); // Use capture phase to catch ALL clicks

  // Show idle state on startup (HARD grid with "CLICK DIFFICULTY TO START" message)
  // Don't draw a full game - wait for player to select difficulty
  drawInitialIdleState();
}

/**
 * Preload tile back images for all difficulty levels
 * Ensures images are cached before player starts game
 */
function preloadBackImages() {
  const backImages = [
    "assets/usedInGame/other/_back_witchOnBroom_99.png", // Hard
    "assets/usedInGame/other/_back_witchOnBroom_124.png", // Medium
    "assets/usedInGame/other/_back_witchOnBroom_166.png", // Easy
  ];

  backImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  console.log("Preloaded back images for all difficulty levels");
}

/**
 * Draw initial idle state on game startup
 * Shows HARD grid with tile backs and "click to start" message
 */
function drawInitialIdleState() {
  console.log("Drawing initial idle state...");

  const difficultyId = "hardTiles"; // Always use HARD for initial state
  const config = tileData[difficultyId];
  const gridSize = config.gridSize;
  const tileSize = config.tileSize;
  const lineSize = config.lineSize;
  const lineColor = config.lineColor;

  // Clear existing content
  clearBoard();

  // Calculate back image path
  const backImagePath = `assets/usedInGame/other/_back_witchOnBroom_${tileSize}.png`;

  // Get squares for HARD difficulty
  const squares = getSquaresForDifficulty(difficultyId);

  // Draw grid lines
  drawGridLines(gridSize, tileSize, lineSize, lineColor);

  // Draw tiles with only tile backs (no face-up images)
  const board = document.getElementById("board");
  squares.forEach((square) => {
    const x = square.col * (tileSize + lineSize);
    const y = square.row * (tileSize + lineSize);

    // Create tile container
    const tileContainer = document.createElement("div");
    tileContainer.className = "tile-container";
    tileContainer.style.left = `${x}px`;
    tileContainer.style.top = `${y}px`;
    tileContainer.style.width = `${tileSize}px`;
    tileContainer.style.height = `${tileSize}px`;
    tileContainer.dataset.squareNum = square.num;

    // Create back image
    const backImg = document.createElement("img");
    backImg.className = "tile-face-down";
    backImg.src = backImagePath;
    backImg.width = tileSize;
    backImg.height = tileSize;

    tileContainer.appendChild(backImg);
    board.appendChild(tileContainer);
  });

  // Show "click to start" message (without grayscale on opening screen)
  showClickToStartMessage(difficultyId, false);

  console.log("Initial idle state complete");
}

/**
 * Load master game configuration
 */
async function loadGameConfig() {
  try {
    const response = await fetch(gameConfigFile);
    gameConfig = await response.json();
    console.log(`Game config loaded: ${gameConfig.theme} theme`);
  } catch (error) {
    console.error("Error loading game config:", error);
  }
}

/**
 * Load tile/grid configuration from JSON
 */
async function loadTileData() {
  try {
    const response = await fetch(tileSizesFile);
    const data = await response.json();
    tileData = data.squareParameters;
    console.log("Tile data loaded:", tileData);
  } catch (error) {
    console.error("Error loading tile data:", error);
  }
}

/**
 * Load image list from JSON (character-grouped structure)
 */
async function loadImageList() {
  try {
    const response = await fetch(witchesFile);
    const data = await response.json();
    imageList = data.witchImages; // Character-grouped object
    const characterCount = Object.keys(imageList).length;
    console.log(`Images loaded: ${characterCount} unique characters`);
  } catch (error) {
    console.error("Error loading image list:", error);
  }
}

/**
 * Build grouped witches data structure
 * Reorganizes imageList by group number for easier selection
 * Structure: { 1: { "Elphaba": [...], "Galinda": [...] }, 2: {...}, ... }
 */
function buildGroupedWitches() {
  groupedWitches = {};

  // Iterate through each character
  for (const characterName in imageList) {
    const images = imageList[characterName];

    // Get group number from first image (all images for a character have same group)
    if (images.length > 0) {
      const groupNum = images[0].group;

      // Create group if it doesn't exist
      if (!groupedWitches[groupNum]) {
        groupedWitches[groupNum] = {};
      }

      // Add character's images to this group
      groupedWitches[groupNum][characterName] = images;
    }
  }

  const groupCount = Object.keys(groupedWitches).length;
  console.log(`Grouped witches built: ${groupCount} groups`);
}

/**
 * Setup button click handlers dynamically from config
 */
function setupButtons() {
  const buttonContainer = document.querySelector(".difficulty-buttons");

  // Clear existing buttons
  buttonContainer.innerHTML = "";

  // Map difficulty IDs to button images
  const buttonImages = {
    easyTiles: "assets/usedInGame/other/_easyButton_80x30.png",
    mediumTiles: "assets/usedInGame/other/_mediumButton_80x30.png",
    hardTiles: "assets/usedInGame/other/_hardButton_80x30.png",
  };

  // Create image buttons from config
  gameConfig.difficulties.forEach((difficulty) => {
    const button = document.createElement("img");
    button.id = difficulty.buttonId;
    button.src = buttonImages[difficulty.id];
    button.alt = difficulty.label;
    button.className = "difficulty-button-img";
    button.width = 80;
    button.height = 30;
    button.addEventListener("click", (e) => {
      console.log("🔘 Difficulty button clicked:", difficulty.id);

      // IMMEDIATELY clear all animations and state FIRST
      clearIdleState();

      // Force synchronous DOM reflow to ensure all changes are applied
      void document.body.offsetHeight;

      // Now start the new game
      drawGrid(difficulty.id);

      console.log("✅ New game started for:", difficulty.id);
    });
    buttonContainer.appendChild(button);
  });

  console.log(`Created ${gameConfig.difficulties.length} difficulty buttons`);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle (modifies in place)
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Get random element from array
 * @param {Array} array - Array to pick from
 * @returns {*} Random element
 */
function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Update the click counter display
 */
function updateClickDisplay() {
  const display = document.getElementById("current-clicks");
  if (display) {
    if (scoringEnabled) {
      display.textContent = `clicks: ${clickCount}`;
      display.style.display = "block";
    } else {
      display.style.display = "none";
    }
  }

  // Also hide/show best scores display
  const bestScoresDisplay = document.getElementById("best-scores-display");
  if (bestScoresDisplay) {
    if (scoringEnabled) {
      bestScoresDisplay.style.display = "flex";
    } else {
      bestScoresDisplay.style.display = "none";
    }
  }
}

/**
 * Load best scores from localStorage
 */
function loadBestScores() {
  const saved = localStorage.getItem("witchGameBestScores");
  if (saved) {
    try {
      bestScores = JSON.parse(saved);
      console.log("Best scores loaded from localStorage:", bestScores);
    } catch (error) {
      console.error("Error parsing saved scores:", error);
      bestScores = { easyTiles: null, mediumTiles: null, hardTiles: null };
    }
  }
  updateBestScoresDisplay();
}

/**
 * Save best scores to localStorage
 */
function saveBestScores() {
  localStorage.setItem("witchGameBestScores", JSON.stringify(bestScores));
  console.log("Best scores saved to localStorage:", bestScores);
}

/**
 * Update the best scores display
 */
function updateBestScoresDisplay() {
  document.getElementById("best-easy").textContent =
    bestScores.easyTiles !== null ? bestScores.easyTiles : "---";
  document.getElementById("best-medium").textContent =
    bestScores.mediumTiles !== null ? bestScores.mediumTiles : "---";
  document.getElementById("best-hard").textContent =
    bestScores.hardTiles !== null ? bestScores.hardTiles : "---";
}

/**
 * Toggle scoring on/off
 */
function toggleScoring() {
  scoringEnabled = !scoringEnabled;
  const toggleBtn = document.getElementById("scoring-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = scoringEnabled ? "ON" : "OFF";
  }
  updateClickDisplay();
  console.log(`Scoring ${scoringEnabled ? "enabled" : "disabled"}`);
}

/**
 * Reset all best scores
 */
function resetBestScores() {
  bestScores = { easyTiles: null, mediumTiles: null, hardTiles: null };
  saveBestScores();
  updateBestScoresDisplay();
  console.log("Best scores reset");
}

/**
 * Toggle clues on/off (show description tooltips for all witches)
 */
function toggleClues() {
  cluesEnabled = !cluesEnabled;
  const toggleBtn = document.getElementById("clues-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = cluesEnabled ? "ON" : "OFF";
  }

  // Add/remove body class for CSS to react immediately
  if (cluesEnabled) {
    document.body.classList.add("clues-enabled");
  } else {
    document.body.classList.remove("clues-enabled");
  }

  console.log(`Clues ${cluesEnabled ? "enabled" : "disabled"}`);
}

/**
 * Check if two positions are adjacent
 * @param {Object} pos1 - Position with {row, col}
 * @param {Object} pos2 - Position with {row, col}
 * @param {boolean} includeDiagonal - Include diagonal adjacency (default: true)
 * @returns {boolean} True if positions are adjacent
 */
function areAdjacent(pos1, pos2, includeDiagonal = true) {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);

  if (includeDiagonal) {
    // Adjacent if within 1 step in any direction (including diagonal)
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  } else {
    // Adjacent only horizontally or vertically
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }
}

/**
 * Get all adjacent tile containers for a given tile
 * @param {HTMLElement} tileContainer - The tile container to find neighbors for
 * @returns {Array} Array of adjacent tile container elements
 */
function getAdjacentTileContainers(tileContainer) {
  // Get row and col from the tile's dataset
  const squareNum = parseInt(tileContainer.dataset.squareNum);

  // Find which squares array we're using by checking board size
  const allTiles = document.querySelectorAll(".tile-container");
  const gridSize = allTiles.length;

  let squares;
  if (gridSize === 9) {
    squares = EASY_SQUARES;
  } else if (gridSize === 16) {
    squares = MEDIUM_SQUARES;
  } else if (gridSize === 25) {
    squares = HARD_SQUARES;
  } else {
    console.error(`Unknown grid size: ${gridSize}`);
    return [];
  }

  // Find the current tile's position
  const currentSquare = squares.find((s) => s.num === squareNum);
  if (!currentSquare) {
    console.error(`Could not find square ${squareNum}`);
    return [];
  }

  const currentRow = currentSquare.row;
  const currentCol = currentSquare.col;

  // Find all adjacent positions (8 directions: up, down, left, right, and diagonals)
  const adjacentContainers = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
      // Skip the center tile (current tile itself)
      if (rowOffset === 0 && colOffset === 0) continue;

      const adjacentRow = currentRow + rowOffset;
      const adjacentCol = currentCol + colOffset;

      // Find the square at this position
      const adjacentSquare = squares.find(
        (s) => s.row === adjacentRow && s.col === adjacentCol
      );

      // If square exists, find its tile container
      if (adjacentSquare) {
        const adjacentTile = document.querySelector(
          `.tile-container[data-square-num="${adjacentSquare.num}"]`
        );
        if (adjacentTile) {
          adjacentContainers.push(adjacentTile);
        }
      }
    }
  }

  console.log(
    `Found ${adjacentContainers.length} adjacent tiles for position ${squareNum} (row ${currentRow}, col ${currentCol})`
  );

  return adjacentContainers;
}

/**
 * Get positions that are available (not filled and not adjacent to excluded positions)
 * @param {Array} allPositions - All grid positions
 * @param {Array} filledPositions - Already filled positions
 * @param {Array} excludeAdjacentTo - Positions to avoid adjacency with
 * @returns {Array} Available positions
 */
function getAvailablePositions(
  allPositions,
  filledPositions,
  excludeAdjacentTo = []
) {
  return allPositions.filter((pos) => {
    // Skip if already filled
    if (filledPositions.some((fp) => fp.num === pos.num)) {
      return false;
    }

    // Skip if adjacent to any excluded position
    for (const excludePos of excludeAdjacentTo) {
      if (areAdjacent(pos, excludePos, true)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Build image path from base name using config patterns
 * @param {string} baseName - Base image name
 * @param {number} size - Image size
 * @returns {string} Full path to image
 */
function buildImagePath(baseName, size) {
  // Error checking
  if (!gameConfig) {
    console.error("ERROR: gameConfig is not loaded!");
    return undefined;
  }

  if (!baseName) {
    console.error("ERROR: baseName is undefined or null!");
    return undefined;
  }

  if (!size) {
    console.error("ERROR: size is undefined or null!");
    return undefined;
  }

  const folder = gameConfig.folderPattern.replace("{size}", size);
  const filename = gameConfig.filePattern
    .replace("{basename}", baseName)
    .replace("{size}", size);

  const fullPath = `${gameConfig.assetFolder}/${folder}/${filename}`;

  return fullPath;
}

/**
 * Get the appropriate squares array for difficulty level
 * @param {string} difficultyId - Difficulty identifier
 * @returns {Array} Squares array with {num, row, col}
 */
function getSquaresForDifficulty(difficultyId) {
  switch (difficultyId) {
    case "easyTiles":
      return EASY_SQUARES;
    case "mediumTiles":
      return MEDIUM_SQUARES;
    case "hardTiles":
      return HARD_SQUARES;
    default:
      return MEDIUM_SQUARES;
  }
}

/**
 * Select images for a difficulty level
 * @param {Object} difficultyConfig - Difficulty configuration from gameConfig
 * @param {number} tileSize - Size of tiles for this difficulty
 * @returns {Object} Object with {gameTiles, bombsA, bombsB, bonus} arrays
 */
function selectImagesForDifficulty(difficultyConfig, tileSize) {
  const tiles = [];
  const imageTiles = difficultyConfig.imageTiles;
  const bombTiles = difficultyConfig.bombTiles;
  const bonusTiles = difficultyConfig.bonusTiles;

  // Calculate how many unique images we need (each appears twice)
  const uniqueImagesNeeded = imageTiles / 2;

  // NEW ALGORITHM: Select witch characters directly (not groups)
  // This ensures equal probability for all witches
  const allWitchNames = Object.keys(imageList); // All 25 witch character names

  // Shuffle all witch names and select the number we need
  const shuffledWitches = shuffleArray([...allWitchNames]);
  const selectedWitchNames = shuffledWitches.slice(0, uniqueImagesNeeded);

  console.log(
    `Selected ${selectedWitchNames.length} witches (need ${uniqueImagesNeeded}):`,
    selectedWitchNames
  );

  // For each selected witch, pick one random image
  const selectedImages = [];

  // Generate unique pairIds for each witch (can't use group number since multiple witches share groups)
  let nextPairId = 1;

  for (const witchName of selectedWitchNames) {
    const characterImages = imageList[witchName];

    // Randomly select one image from this character's images
    const selectedImage = getRandomFromArray(characterImages);

    // Build the image path
    const imagePath = buildImagePath(selectedImage.filename, tileSize);

    // Store full tile data with metadata
    // Use a unique pairId for each witch (NOT group number, since multiple witches can share a group)
    const tileData = {
      imagePath: imagePath,
      name_text: selectedImage.name_text,
      description_text: selectedImage.description_text,
      type: "gameTile",
      pairId: nextPairId, // Use unique pairId for this witch's pair
    };
    selectedImages.push(tileData);

    console.log(
      `Witch "${witchName}": selected ${selectedImage.filename} (${selectedImage.name_text}, group ${selectedImage.group}, pairId ${nextPairId})`
    );

    nextPairId++; // Increment for next witch
  }

  // Create pairs (each image twice)
  for (const tileData of selectedImages) {
    tiles.push(tileData);
    tiles.push(tileData); // Same object reference for matching
  }

  // Build separate arrays for BOMB-A tiles (first bomb)
  const bombAArray = [];
  if (bombTiles >= 1) {
    const bombAPath = `assets/usedInGame/specialTiles/__bomb_swap_${tileSize}.png`;
    bombAArray.push({
      imagePath: bombAPath,
      type: "bombA",
    });
  }

  // Build separate arrays for BOMB-B tiles (second bomb, Hard mode only)
  const bombBArray = [];
  if (bombTiles >= 2) {
    const bombBPath = `assets/usedInGame/specialTiles/__bomb_redo_${tileSize}.png`;
    bombBArray.push({
      imagePath: bombBPath,
      type: "bombB",
    });
  }

  // Build separate array for bonus tiles
  const bonusPath = `assets/usedInGame/specialTiles/__bonus_freeLook_5_${tileSize}.png`;
  const bonusArray = [];
  for (let i = 0; i < bonusTiles; i++) {
    bonusArray.push({
      imagePath: bonusPath,
      type: "bonus",
    });
  }

  console.log(
    `Created tiles organized by type: ${imageTiles} gameTiles (${uniqueImagesNeeded} pairs) + ${bombAArray.length} bombA + ${bombBArray.length} bombB + ${bonusTiles} bonus`
  );

  // Return organized by type (no shuffle yet - will be done during placement)
  return {
    gameTiles: tiles,
    bombsA: bombAArray,
    bombsB: bombBArray,
    bonus: bonusArray,
  };
}

/**
 * Assign tiles to grid positions with adjacency constraints for special tiles
 * @param {Object} tilesByType - Object with {gameTiles, bombsA, bombsB, bonus}
 * @param {Array} squares - Grid squares with {num, row, col}
 * @returns {Array} Array where index = position number, value = tile object
 */
function assignTilesToPositions(tilesByType, squares) {
  const result = new Array(squares.length).fill(null);
  const filledSquares = [];
  const excludeAdjacent = [];

  // Step 1: Place special tiles (bombA, bombB, then bonus) with adjacency checking
  const specialTiles = [
    ...tilesByType.bombsA,
    ...tilesByType.bombsB,
    ...tilesByType.bonus,
  ];

  for (const specialTile of specialTiles) {
    const available = getAvailablePositions(
      squares,
      filledSquares,
      excludeAdjacent
    );

    if (available.length === 0) {
      console.warn(
        "No available positions for special tile! Using any unfilled position."
      );
      const unfilled = squares.filter(
        (s) => !filledSquares.some((f) => f.num === s.num)
      );
      if (unfilled.length > 0) {
        const selectedSquare = getRandomFromArray(unfilled);
        result[selectedSquare.num] = specialTile;
        filledSquares.push(selectedSquare);
      }
      continue;
    }

    // Pick random available position
    const selectedSquare = getRandomFromArray(available);
    result[selectedSquare.num] = specialTile;
    filledSquares.push(selectedSquare);
    excludeAdjacent.push(selectedSquare);

    console.log(
      `Placed ${specialTile.type} at position ${selectedSquare.num} (row ${selectedSquare.row}, col ${selectedSquare.col})`
    );
  }

  // Step 2: Place gameTiles with adjacency constraints for matching pairs
  const maxAttempts = 100;
  let placementSuccessful = false;

  // Get unique pairIds
  const uniquePairIds = [
    ...new Set(tilesByType.gameTiles.map((t) => t.pairId)),
  ];
  console.log(
    `Attempting to place ${uniquePairIds.length} pairs with adjacency constraints...`
  );

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Reset gameTile placements (keep special tiles)
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i].type === "gameTile") {
        result[i] = null;
      }
    }

    // Reset filled squares to only special tiles
    const gameTileFilledSquares = [];
    let attemptFailed = false;

    // Try to place each pair
    for (const pairId of uniquePairIds) {
      // Get both tiles with this pairId
      const tilesWithPairId = tilesByType.gameTiles.filter(
        (t) => t.pairId === pairId
      );

      if (tilesWithPairId.length !== 2) {
        console.error(
          `Expected 2 tiles with pairId ${pairId}, found ${tilesWithPairId.length}`
        );
        continue;
      }

      // Get available positions (not filled by special tiles or other gameTiles this attempt)
      const availableForFirst = squares.filter(
        (s) =>
          !filledSquares.some((f) => f.num === s.num) &&
          !gameTileFilledSquares.some((f) => f.num === s.num)
      );

      if (availableForFirst.length === 0) {
        attemptFailed = true;
        break;
      }

      // Place first tile randomly
      const firstSquare = getRandomFromArray(availableForFirst);
      result[firstSquare.num] = tilesWithPairId[0];
      gameTileFilledSquares.push(firstSquare);

      // Get available positions for second tile (not adjacent to first)
      const availableForSecond = squares.filter(
        (s) =>
          !filledSquares.some((f) => f.num === s.num) &&
          !gameTileFilledSquares.some((f) => f.num === s.num) &&
          !areAdjacent(s, firstSquare, true)
      );

      if (availableForSecond.length === 0) {
        // Can't place second tile non-adjacently, retry
        attemptFailed = true;
        break;
      }

      // Place second tile randomly in non-adjacent position
      const secondSquare = getRandomFromArray(availableForSecond);
      result[secondSquare.num] = tilesWithPairId[1];
      gameTileFilledSquares.push(secondSquare);
    }

    if (!attemptFailed) {
      placementSuccessful = true;
      console.log(
        `Successfully placed all pairs with adjacency constraints on attempt ${attempt}`
      );
      break;
    }
  }

  // If we failed after max attempts, place remaining pairs randomly (accept adjacency)
  if (!placementSuccessful) {
    console.warn(
      `Could not place all pairs non-adjacently after ${maxAttempts} attempts. Placing remaining randomly.`
    );

    // Clear any partially placed gameTiles from the failed 100th attempt
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i].type === "gameTile") {
        result[i] = null;
      }
    }

    // DIAGNOSTIC: Check state before fallback placement
    console.log(`FALLBACK DIAGNOSTICS:`);
    console.log(`  Total squares: ${squares.length}`);
    console.log(
      `  filledSquares (special tiles): ${filledSquares.length}`,
      filledSquares.map((s) => s.num)
    );
    console.log(`  gameTiles to place: ${tilesByType.gameTiles.length}`);

    // Count nulls in result after clearing (should equal gameTiles to place)
    const nullsBefore = result.filter((r) => r === null).length;
    console.log(`  Null positions in result after clearing: ${nullsBefore}`);

    // Get remaining empty squares (not filled by special tiles)
    const remainingSquares = squares.filter(
      (s) => !filledSquares.some((f) => f.num === s.num)
    );
    console.log(
      `  remainingSquares: ${remainingSquares.length}`,
      remainingSquares.map((s) => s.num)
    );

    // Since we cleared all gameTiles at start of last failed attempt, place all of them
    const shuffledTiles = shuffleArray([...tilesByType.gameTiles]);
    const shuffledSquares = shuffleArray([...remainingSquares]);

    console.log(`  shuffledTiles: ${shuffledTiles.length}`);
    console.log(
      `  shuffledSquares: ${shuffledSquares.length}`,
      shuffledSquares.map((s) => s.num)
    );

    for (
      let i = 0;
      i < shuffledTiles.length && i < shuffledSquares.length;
      i++
    ) {
      result[shuffledSquares[i].num] = shuffledTiles[i];
      console.log(
        `    Placed tile at square ${shuffledSquares[i].num} (pairId: ${shuffledTiles[i].pairId})`
      );
    }

    // Count nulls after placement
    const nullsAfter = result.filter((r) => r === null).length;
    console.log(`  Null positions in result after: ${nullsAfter}`);
    console.log(
      `  Placed ${shuffledTiles.length} gameTiles randomly (adjacency accepted)`
    );
  }

  return result;
}

/**
 * Get tile images for the grid
 * @param {string} difficultyId - Difficulty identifier (e.g., "easyTiles")
 * @param {number} tileSize - Tile size
 * @returns {Array} Array of tile objects with imagePath and metadata
 */
function getTileImages(difficultyId, tileSize) {
  // Find the difficulty config
  const difficultyConfig = gameConfig.difficulties.find(
    (d) => d.id === difficultyId
  );

  if (!difficultyConfig) {
    console.error(`Difficulty config not found for: ${difficultyId}`);
    return [];
  }

  return selectImagesForDifficulty(difficultyConfig, tileSize);
}

/**
 * Clear all content from the board and witch list
 */
function clearBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  const characterList = document.getElementById("character-list");
  characterList.innerHTML = "";
}

/**
 * Draw grid for the selected difficulty
 * @param {string} difficultyId - Difficulty identifier (e.g., "hardTiles")
 */
function drawGrid(difficultyId) {
  console.log(`Drawing grid: ${difficultyId}`);

  if (!tileData) {
    console.error("Tile data not loaded yet");
    return;
  }

  if (!groupedWitches) {
    console.error("Grouped witches not loaded yet");
    return;
  }

  // Clear existing content
  clearBoard();

  // Reset game state
  selectedTiles = [];
  gameState = "WAITING_FOR_FIRST_TILE";
  currentDifficulty = difficultyId; // Track current difficulty for scoring

  // Set difficulty class on status-box for CSS styling (vertical centering)
  const statusBox = document.getElementById("status-box");
  if (statusBox) {
    statusBox.className = difficultyId; // Sets class to "easyTiles", "mediumTiles", or "hardTiles"
  }

  // Reset click counter for new game
  clickCount = 0;
  updateClickDisplay();

  const config = tileData[difficultyId];
  const gridSize = config.gridSize;
  const tileSize = config.tileSize;
  const lineSize = config.lineSize;
  const lineColor = config.lineColor;

  // Track current tile size for halftone images
  currentTileSize = tileSize;

  // Get tiles organized by type
  const tilesByType = getTileImages(difficultyId, tileSize);

  // Get squares for adjacency logic (single source of truth)
  const squares = getSquaresForDifficulty(difficultyId);

  // Assign tiles to positions with adjacency constraints
  const positionToTileMap = assignTilesToPositions(tilesByType, squares);

  // Calculate back image path (same for all tiles at this difficulty)
  const backImagePath = `assets/usedInGame/other/_back_witchOnBroom_${tileSize}.png`;

  // Draw grid lines
  drawGridLines(gridSize, tileSize, lineSize, lineColor);

  // Draw tiles using squares (calculate x/y from row/col)
  drawTiles(squares, tileSize, lineSize, positionToTileMap, backImagePath);

  // Update character list (extract all tiles from map)
  const allTiles = positionToTileMap.filter((t) => t !== null);
  updateCharacterList(allTiles);

  console.log(`Grid drawn: ${squares.length} tiles`);
}

/**
 * Draw grid lines (vertical and horizontal)
 */
function drawGridLines(gridSize, tileSize, lineSize, lineColor) {
  const board = document.getElementById("board");
  const boardWidth = gameConfig.boardDimensions.width;
  const boardHeight = gameConfig.boardDimensions.height;

  // Draw vertical lines (between columns)
  for (let i = 0; i < gridSize - 1; i++) {
    const line = document.createElement("div");
    line.className = "grid-line";
    line.style.left = `${(i + 1) * tileSize + i * lineSize}px`;
    line.style.top = "0px";
    line.style.width = `${lineSize}px`;
    line.style.height = `${boardHeight}px`;
    line.style.backgroundColor = lineColor;
    board.appendChild(line);
  }

  // Draw horizontal lines (between rows)
  for (let i = 0; i < gridSize - 1; i++) {
    const line = document.createElement("div");
    line.className = "grid-line";
    line.style.left = "0px";
    line.style.top = `${(i + 1) * tileSize + i * lineSize}px`;
    line.style.width = `${boardWidth}px`;
    line.style.height = `${lineSize}px`;
    line.style.backgroundColor = lineColor;
    board.appendChild(line);
  }
}

/**
 * Draw tiles with images (two-layer structure: face-up + face-down overlay)
 * @param {Array} squares - Grid squares with {num, row, col}
 * @param {number} tileSize - Size of tiles
 * @param {number} lineSize - Size of grid lines
 * @param {Array} positionToTileMap - Array mapping square number to tile object
 * @param {string} backImagePath - Path to back image (same for all tiles)
 */
function drawTiles(
  squares,
  tileSize,
  lineSize,
  positionToTileMap,
  backImagePath
) {
  const board = document.getElementById("board");

  squares.forEach((square) => {
    const tileData = positionToTileMap[square.num];

    // Skip if no tile data at this position
    if (!tileData) {
      console.warn(`No tile data at square ${square.num}`);
      return;
    }

    // Calculate x/y coordinates from row/col
    const x = square.col * (tileSize + lineSize);
    const y = square.row * (tileSize + lineSize);

    // Create container div for this tile position
    const tileContainer = document.createElement("div");
    tileContainer.className = "tile-container";
    tileContainer.style.left = `${x}px`;
    tileContainer.style.top = `${y}px`;
    tileContainer.style.width = `${tileSize}px`;
    tileContainer.style.height = `${tileSize}px`;

    // Store metadata and state on the container
    tileContainer.dataset.squareNum = square.num;
    tileContainer.dataset.type = tileData.type;
    tileContainer.dataset.isFaceUp = "false"; // Start face-down
    tileContainer.dataset.isMatched = "false";

    if (tileData.pairId) {
      tileContainer.dataset.pairId = tileData.pairId;
    }
    if (tileData.name_text) {
      tileContainer.dataset.nameText = tileData.name_text;
    }
    if (tileData.description_text) {
      tileContainer.dataset.descriptionText = tileData.description_text;
    }

    // Create face-up image (bottom layer - the witch/character/bomb/bonus)
    const faceUpElement = document.createElement("img");
    faceUpElement.className = "tile-face-up";
    faceUpElement.src = tileData.imagePath;
    faceUpElement.alt = `Tile ${square.num}`;
    faceUpElement.style.width = `${tileSize}px`;
    faceUpElement.style.height = `${tileSize}px`;

    // Create halftone overlay (middle layer - for completed witches)
    const halftoneImg = document.createElement("img");
    halftoneImg.className = "tile-halftone";
    halftoneImg.src = `assets/usedInGame/other/_halftone_blackSmall_${tileSize}.png`;
    halftoneImg.alt = "Halftone overlay";
    halftoneImg.style.width = `${tileSize}px`;
    halftoneImg.style.height = `${tileSize}px`;
    halftoneImg.style.opacity = "0"; // Initially hidden

    // Create face-down image (top layer - the back with broom)
    const faceDownImg = document.createElement("img");
    faceDownImg.className = "tile-face-down";
    faceDownImg.src = backImagePath;
    faceDownImg.alt = "Face down";
    faceDownImg.style.width = `${tileSize}px`;
    faceDownImg.style.height = `${tileSize}px`;

    // Add all three layers to container (bottom to top: face-up, halftone, face-down)
    tileContainer.appendChild(faceUpElement);
    tileContainer.appendChild(halftoneImg);
    tileContainer.appendChild(faceDownImg);

    // Add click event listener
    tileContainer.addEventListener("click", () =>
      handleTileClick(tileContainer)
    );

    // Add container to board
    board.appendChild(tileContainer);
  });
}

/**
 * Handle tile click event
 * @param {HTMLElement} tileContainer - The clicked tile container
 */
function handleTileClick(tileContainer) {
  // Block clicks if we're checking a match
  if (gameState === "CHECKING_MATCH") {
    console.log("Currently checking match, ignoring click");
    return;
  }

  // Check if tile is face-down and not already matched
  const isFaceUp = tileContainer.dataset.isFaceUp === "true";
  const isMatched = tileContainer.dataset.isMatched === "true";

  if (isFaceUp || isMatched) {
    console.log("Tile already face-up or matched, ignoring click");
    return;
  }

  // Block if we already have 2 tiles selected
  if (selectedTiles.length >= 2) {
    console.log("Already have 2 tiles selected, ignoring click");
    return;
  }

  // Reveal the tile
  revealTile(tileContainer);

  // Check if this is a special tile (bombA, bombB, or bonus)
  const tileType = tileContainer.dataset.type;
  if (tileType === "bombA") {
    // BOMB-A tile - use dedicated handler
    gameState = "CHECKING_MATCH"; // Block other clicks
    setTimeout(() => handleBombATile(tileContainer), 1000);
    return;
  } else if (tileType === "bombB") {
    // BOMB-B tile - use dedicated handler
    gameState = "CHECKING_MATCH"; // Block other clicks
    setTimeout(() => handleBombBTile(tileContainer), 1000);
    return;
  } else if (tileType === "bonus") {
    // Bonus tile - use dedicated bonus handler
    gameState = "CHECKING_MATCH"; // Block other clicks
    setTimeout(() => handleBonusTile(tileContainer), 1000);
    return;
  }

  // Regular gameTile - proceed with matching logic
  if (selectedTiles.length === 1) {
    gameState = "WAITING_FOR_SECOND_TILE";
  } else if (selectedTiles.length === 2) {
    // Increment click counter if both tiles are gameTiles
    const tile1Type = selectedTiles[0].dataset.type;
    const tile2Type = selectedTiles[1].dataset.type;

    if (tile1Type === "gameTile" && tile2Type === "gameTile") {
      clickCount++;
      updateClickDisplay();
    }

    gameState = "CHECKING_MATCH";
    // Check for match after brief delay to allow animation to complete
    setTimeout(() => checkForMatch(), 500);
  }
}

/**
 * Reveal a tile by animating the face-down image to transparent
 * @param {HTMLElement} tileContainer - The tile container to reveal
 */
function revealTile(tileContainer) {
  // Get the face-down image
  const faceDownImg = tileContainer.querySelector(".tile-face-down");

  // Animate to transparent (reveal the face-up image underneath)
  faceDownImg.style.opacity = "0";

  // Update state
  tileContainer.dataset.isFaceUp = "true";

  // Add highlight effect
  tileContainer.classList.add("tile-selected");

  // Add to selected tiles array
  selectedTiles.push(tileContainer);

  console.log(
    `Tile ${tileContainer.dataset.squareNum} revealed (type: ${tileContainer.dataset.type}, pairId: ${tileContainer.dataset.pairId})`
  );
}

/**
 * Handle special tile - shared helper function for bomb and bonus tiles
 * Applies halftone overlay, reverts any other selected tiles
 * @param {HTMLElement} tileContainer - The special tile container
 */
function handleSpecialTile(tileContainer) {
  const tileType = tileContainer.dataset.type;
  console.log(
    `Handling special tile: ${tileType} at position ${tileContainer.dataset.squareNum}`
  );

  // Get the face-down and halftone images
  const faceDownImg = tileContainer.querySelector(".tile-face-down");
  const halftoneImg = tileContainer.querySelector(".tile-halftone");

  // Hide face-down image completely
  faceDownImg.style.opacity = "0";

  // Show halftone overlay
  halftoneImg.style.opacity = "1";

  // Tile stays face-up
  tileContainer.dataset.isFaceUp = "true";

  // Remove golden highlight
  tileContainer.classList.remove("tile-selected");

  // Mark as matched so it can't be clicked again
  tileContainer.dataset.isMatched = "true";

  // Hide any previously selected gameTiles before clearing
  selectedTiles.forEach((tile) => {
    if (tile !== tileContainer && tile.dataset.type === "gameTile") {
      const faceDownImg = tile.querySelector(".tile-face-down");
      faceDownImg.style.opacity = "1";
      tile.dataset.isFaceUp = "false";
      tile.classList.remove("tile-selected");
    }
  });

  // Clear selected tiles
  selectedTiles = [];

  // Reset game state
  gameState = "WAITING_FOR_FIRST_TILE";

  console.log(
    `${tileType} tile now complete with halftone overlay, ready for next selection`
  );
}

/**
 * Swap the underlying data between two tile containers
 * Swaps face-up image and metadata while keeping physical position unchanged
 * @param {HTMLElement} tile1 - First tile container
 * @param {HTMLElement} tile2 - Second tile container
 */
function swapTileData(tile1, tile2) {
  // Swap face-up images
  const img1 = tile1.querySelector(".tile-face-up");
  const img2 = tile2.querySelector(".tile-face-up");
  const tempSrc = img1.src;
  img1.src = img2.src;
  img2.src = tempSrc;

  // Swap metadata (pairId, nameText, descriptionText)
  const tempPairId = tile1.dataset.pairId;
  tile1.dataset.pairId = tile2.dataset.pairId;
  tile2.dataset.pairId = tempPairId;

  const tempNameText = tile1.dataset.nameText;
  tile1.dataset.nameText = tile2.dataset.nameText;
  tile2.dataset.nameText = tempNameText;

  const tempDescriptionText = tile1.dataset.descriptionText;
  tile1.dataset.descriptionText = tile2.dataset.descriptionText;
  tile2.dataset.descriptionText = tempDescriptionText;

  console.log(
    `Swapped tile ${tile1.dataset.squareNum} with tile ${tile2.dataset.squareNum}`
  );
}

/**
 * Handle BOMB-A tile click - swaps pairs of hidden tiles
 * @param {HTMLElement} bombTileContainer - The BOMB-A tile container
 */
function handleBombATile(bombTileContainer) {
  console.log(
    `Handling BOMB-A tile at position ${bombTileContainer.dataset.squareNum}`
  );

  // Step 1: If bomb was clicked as 2nd pick, revert the 1st pick
  if (selectedTiles.length === 2) {
    const firstPick = selectedTiles.find((tile) => tile !== bombTileContainer);
    if (firstPick && firstPick.dataset.type === "gameTile") {
      console.log(`Reverting 1st pick (tile ${firstPick.dataset.squareNum})`);
      const faceDownImg = firstPick.querySelector(".tile-face-down");
      faceDownImg.style.opacity = "1";
      firstPick.dataset.isFaceUp = "false";
      firstPick.classList.remove("tile-selected");
    }
  }

  // Step 2: Find all covered gameTiles
  const allTiles = document.querySelectorAll(".tile-container");
  const coveredGameTiles = Array.from(allTiles).filter((tile) => {
    const isFaceUp = tile.dataset.isFaceUp === "true";
    const isMatched = tile.dataset.isMatched === "true";
    const isGameTile = tile.dataset.type === "gameTile";
    return !isFaceUp && !isMatched && isGameTile;
  });

  console.log(`Found ${coveredGameTiles.length} covered game tiles`);

  // Step 3: Perform first swap (if at least 2 tiles available)
  if (coveredGameTiles.length >= 2) {
    // Pick random tiles (shuffle once for all swaps)
    const shuffled = shuffleArray([...coveredGameTiles]);
    const tile1 = shuffled[0];
    const tile2 = shuffled[1];

    // Add red glow and pulse
    tile1.classList.add("tile-bomb-swap", "tile-bomb-swap-pulse");
    tile2.classList.add("tile-bomb-swap", "tile-bomb-swap-pulse");

    // Swap their data
    swapTileData(tile1, tile2);

    // After 1 second, remove glow/pulse and do second swap
    setTimeout(() => {
      tile1.classList.remove("tile-bomb-swap", "tile-bomb-swap-pulse");
      tile2.classList.remove("tile-bomb-swap", "tile-bomb-swap-pulse");

      // Step 4: Perform second swap (if at least 4 tiles total, use different tiles)
      if (coveredGameTiles.length >= 4) {
        const tile3 = shuffled[2];
        const tile4 = shuffled[3];

        // Add red glow and pulse
        tile3.classList.add("tile-bomb-swap", "tile-bomb-swap-pulse");
        tile4.classList.add("tile-bomb-swap", "tile-bomb-swap-pulse");

        // Swap their data
        swapTileData(tile3, tile4);

        // After 1 second, remove glow/pulse and finish
        setTimeout(() => {
          tile3.classList.remove("tile-bomb-swap", "tile-bomb-swap-pulse");
          tile4.classList.remove("tile-bomb-swap", "tile-bomb-swap-pulse");
          finishBombATile(bombTileContainer);
        }, 1000);
      } else {
        // Not enough tiles for second swap, finish immediately
        finishBombATile(bombTileContainer);
      }
    }, 1000);
  } else {
    // Not enough tiles even for first swap, just finish
    finishBombATile(bombTileContainer);
  }
}

/**
 * Finish bomb-A tile handling - apply halftone and reset state
 * @param {HTMLElement} bombTileContainer - The BOMB-A tile container
 */
function finishBombATile(bombTileContainer) {
  // Apply halftone to bomb tile
  const faceDownImg = bombTileContainer.querySelector(".tile-face-down");
  const halftoneImg = bombTileContainer.querySelector(".tile-halftone");

  faceDownImg.style.opacity = "0";
  halftoneImg.style.opacity = "1";

  // Remove golden glow
  bombTileContainer.classList.remove("tile-selected");

  // Mark as matched/unclickable
  bombTileContainer.dataset.isMatched = "true";

  console.log("BOMB-A tile now complete with halftone overlay");

  // Clear selected tiles array
  selectedTiles = [];

  // Reset game state
  gameState = "WAITING_FOR_FIRST_TILE";

  console.log("BOMB-A effect complete, ready for next selection");
}

/**
 * Revert a completed witch pair back to covered state
 * @param {string} nameText - The name of the witch to revert
 * @returns {Promise} Promise that resolves after revert animation completes
 */
function revertWitchPair(nameText) {
  return new Promise((resolve) => {
    // Find both tiles with this nameText
    const allTiles = document.querySelectorAll(".tile-container");
    const witchTiles = Array.from(allTiles).filter(
      (tile) =>
        tile.dataset.nameText === nameText && tile.dataset.type === "gameTile"
    );

    if (witchTiles.length !== 2) {
      console.warn(
        `Expected 2 tiles for ${nameText}, found ${witchTiles.length}`
      );
      resolve();
      return;
    }

    console.log(`Reverting witch pair: ${nameText}`);

    // Apply red glow and pulse to both tiles
    witchTiles.forEach((tile) => {
      tile.classList.add("tile-bomb-swap", "tile-bomb-swap-pulse");
    });

    // After 2 seconds, revert tiles to covered state
    setTimeout(() => {
      witchTiles.forEach((tile) => {
        // Remove glow/pulse
        tile.classList.remove("tile-bomb-swap", "tile-bomb-swap-pulse");
        tile.classList.remove("tile-selected");

        // Revert to covered state
        tile.dataset.isFaceUp = "false";
        tile.dataset.isMatched = "false";

        // Show face-down image, hide halftone
        const faceDownImg = tile.querySelector(".tile-face-down");
        const halftoneImg = tile.querySelector(".tile-halftone");
        faceDownImg.style.opacity = "1";
        halftoneImg.style.opacity = "0";

        // Keep data intact (pairId, nameText, descriptionText stay the same)
        console.log(
          `  Reverted tile ${tile.dataset.squareNum} to covered state`
        );
      });

      // Update character list - remove checkmark and reset completed status
      const characterList = document.getElementById("character-list");
      const characterItems = characterList.querySelectorAll(".character-item");

      characterItems.forEach((item) => {
        if (item.dataset.characterName === nameText) {
          // Remove checkmark from name
          const characterName = item.querySelector(".character-name");
          characterName.textContent = nameText; // Remove "✓ " prefix

          // Reset completed status
          item.dataset.completed = "false";

          // Remove hover event listeners by cloning and replacing
          // This removes all event listeners attached to the element
          const newItem = item.cloneNode(true);
          item.parentNode.replaceChild(newItem, item);

          // Re-add click handler for character selection
          newItem.addEventListener("click", () =>
            handleCharacterClick(newItem)
          );

          console.log(`  Reset character list for ${nameText}`);
        }
      });

      resolve();
    }, 2000); // 2 second pulse
  });
}

/**
 * Handle BOMB-B tile click - reverts completed witch pairs back to covered state
 * @param {HTMLElement} bombTileContainer - The BOMB-B tile container
 */
async function handleBombBTile(bombTileContainer) {
  console.log(
    `Handling BOMB-B tile at position ${bombTileContainer.dataset.squareNum}`
  );

  // Step 1: If bomb was clicked as 2nd pick, revert the 1st pick
  if (selectedTiles.length === 2) {
    const firstPick = selectedTiles.find((tile) => tile !== bombTileContainer);
    if (firstPick && firstPick.dataset.type === "gameTile") {
      console.log(`Reverting 1st pick (tile ${firstPick.dataset.squareNum})`);
      const faceDownImg = firstPick.querySelector(".tile-face-down");
      faceDownImg.style.opacity = "1";
      firstPick.dataset.isFaceUp = "false";
      firstPick.classList.remove("tile-selected");
    }
  }

  // Step 2: Find all completed witch pairs
  const allTiles = document.querySelectorAll(".tile-container");
  const completedGameTiles = Array.from(allTiles).filter((tile) => {
    const isMatched = tile.dataset.isMatched === "true";
    const isGameTile = tile.dataset.type === "gameTile";
    return isMatched && isGameTile;
  });

  // Get unique witch names from completed tiles
  const completedWitchNames = [
    ...new Set(
      completedGameTiles.map((tile) => tile.dataset.nameText).filter(Boolean)
    ),
  ];

  console.log(`Found ${completedWitchNames.length} completed witches`);

  const resetWitches = []; // Track which witches we've reset

  // Step 3: First redo (if at least 1 completed witch exists)
  if (completedWitchNames.length >= 1) {
    // Pick a random completed witch
    const witch1 = getRandomFromArray(completedWitchNames);
    resetWitches.push(witch1);
    await revertWitchPair(witch1);
  }

  // Step 4: Second redo (if at least 2 completed witches exist, excluding first)
  const remainingWitches = completedWitchNames.filter(
    (name) => !resetWitches.includes(name)
  );

  if (remainingWitches.length >= 1) {
    // Pick a random witch from remaining
    const witch2 = getRandomFromArray(remainingWitches);
    resetWitches.push(witch2);
    await revertWitchPair(witch2);
  }

  // Step 5: Finish - apply halftone to bombB tile
  finishBombBTile(bombTileContainer);
}

/**
 * Finish bomb-B tile handling - apply halftone and reset state
 * @param {HTMLElement} bombTileContainer - The BOMB-B tile container
 */
function finishBombBTile(bombTileContainer) {
  // Apply halftone to bomb tile
  const faceDownImg = bombTileContainer.querySelector(".tile-face-down");
  const halftoneImg = bombTileContainer.querySelector(".tile-halftone");

  faceDownImg.style.opacity = "0";
  halftoneImg.style.opacity = "1";

  // Remove golden glow
  bombTileContainer.classList.remove("tile-selected");

  // Mark as matched/unclickable
  bombTileContainer.dataset.isMatched = "true";

  console.log("BOMB-B tile now complete with halftone overlay");

  // Clear selected tiles array
  selectedTiles = [];

  // Reset game state
  gameState = "WAITING_FOR_FIRST_TILE";

  console.log("BOMB-B effect complete, ready for next selection");
}

/**
 * Handle bonus tile click - reveals adjacent tiles temporarily
 * @param {HTMLElement} bonusTileContainer - The bonus tile container
 */
function handleBonusTile(bonusTileContainer) {
  console.log(
    `Handling bonus tile at position ${bonusTileContainer.dataset.squareNum}`
  );

  // Step 1: If bonus was clicked as 2nd pick, revert the 1st pick
  if (selectedTiles.length === 2) {
    // Find the first pick (not the bonus tile)
    const firstPick = selectedTiles.find((tile) => tile !== bonusTileContainer);

    if (firstPick && firstPick.dataset.type === "gameTile") {
      console.log(`Reverting 1st pick (tile ${firstPick.dataset.squareNum})`);

      // Cover it again
      const faceDownImg = firstPick.querySelector(".tile-face-down");
      faceDownImg.style.opacity = "1";

      // Remove from selected state
      firstPick.dataset.isFaceUp = "false";
      firstPick.classList.remove("tile-selected");
    }
  }

  // Step 2: Apply flash animation to bonus tile itself
  bonusTileContainer.classList.add("tile-bonus-flash");

  // Remove flash class after animation completes (0.8s from CSS)
  setTimeout(() => {
    bonusTileContainer.classList.remove("tile-bonus-flash");
  }, 800);

  // Step 3: Get all adjacent tiles
  const adjacentTiles = getAdjacentTileContainers(bonusTileContainer);

  console.log(`Found ${adjacentTiles.length} adjacent tiles to bonus tile`);

  // Step 4: Filter for only face-down, non-matched tiles
  const tilesToReveal = adjacentTiles.filter((tile) => {
    const isFaceUp = tile.dataset.isFaceUp === "true";
    const isMatched = tile.dataset.isMatched === "true";
    return !isFaceUp && !isMatched;
  });

  console.log(`Revealing ${tilesToReveal.length} covered adjacent tiles`);

  // Step 5: Reveal each tile with bonus-revealed styling
  tilesToReveal.forEach((tile) => {
    const faceDownImg = tile.querySelector(".tile-face-down");
    faceDownImg.style.opacity = "0";
    tile.classList.add("tile-bonus-revealed");

    console.log(
      `  Temporarily revealing tile ${tile.dataset.squareNum} (${tile.dataset.type})`
    );
  });

  // Step 6: Start countdown animation on bonus tile
  // Get the face-up image element to update during countdown
  const bonusFaceUpImg = bonusTileContainer.querySelector(".tile-face-up");

  // Get current tile size from the existing image src
  const currentSrc = bonusFaceUpImg.src;
  const sizeMatch = currentSrc.match(/_(\d+)\.png$/);
  const tileSize = sizeMatch ? sizeMatch[1] : "166"; // Default to 166 if not found

  // Countdown sequence: 4, 3, 2, 1, blank (5 is already showing)
  const countdownNumbers = [4, 3, 2, 1, "blank"];

  countdownNumbers.forEach((number, index) => {
    setTimeout(() => {
      // Update the bonus tile image to show countdown
      bonusFaceUpImg.src = `assets/usedInGame/specialTiles/__bonus_freeLook_${number}_${tileSize}.png`;
      console.log(`Countdown: ${number}`);
    }, (index + 1) * 1000); // 1s, 2s, 3s, 4s, 5s
  });

  // Step 7: After countdown completes, re-cover tiles and finish bonus tile handling
  setTimeout(() => {
    console.log(
      `Bonus reveal timeout (${BONUS_REVEAL_DURATION}ms) - re-covering tiles`
    );

    // Re-cover all temporarily revealed tiles
    tilesToReveal.forEach((tile) => {
      const faceDownImg = tile.querySelector(".tile-face-down");
      faceDownImg.style.opacity = "1";
      tile.classList.remove("tile-bonus-revealed");

      console.log(`  Re-covered tile ${tile.dataset.squareNum}`);
    });

    // Apply halftone to bonus tile (which is now showing blank)
    const faceDownImg = bonusTileContainer.querySelector(".tile-face-down");
    const halftoneImg = bonusTileContainer.querySelector(".tile-halftone");

    // Hide face-down image completely
    faceDownImg.style.opacity = "0";

    // Show halftone overlay
    halftoneImg.style.opacity = "1";

    // Remove golden glow
    bonusTileContainer.classList.remove("tile-selected");

    // Mark bonus as matched/unclickable
    bonusTileContainer.dataset.isMatched = "true";

    console.log(`Bonus tile now complete with halftone overlay`);

    // Clear selected tiles array
    selectedTiles = [];

    // Reset game state
    gameState = "WAITING_FOR_FIRST_TILE";

    console.log("Bonus tile handling complete, ready for next selection");
  }, BONUS_REVEAL_DURATION);
}

/**
 * Check if the two selected tiles match
 */
function checkForMatch() {
  if (selectedTiles.length !== 2) {
    console.error("checkForMatch called without 2 tiles selected");
    return;
  }

  const tile1 = selectedTiles[0];
  const tile2 = selectedTiles[1];

  // Get pairIds (only gameTiles have pairIds)
  const pairId1 = tile1.dataset.pairId;
  const pairId2 = tile2.dataset.pairId;

  console.log(
    `Checking match: tile1 pairId=${pairId1}, tile2 pairId=${pairId2}`
  );

  // Check if they match
  if (pairId1 && pairId2 && pairId1 === pairId2) {
    // MATCH!
    console.log(
      "✓ MATCH! Tiles stay revealed (Phase 3 will handle witch selection)"
    );
    // Reset state but keep tiles selected for Phase 3 (witch selection)
    gameState = "WAITING_FOR_WITCH_SELECTION";
  } else {
    // NO MATCH
    console.log("✗ NO MATCH - hiding tiles after delay");
    // Hide tiles after 1 second delay
    setTimeout(() => hideNonMatchingTiles(), 1000);
  }
}

/**
 * Hide non-matching tiles (flip them back face-down)
 */
function hideNonMatchingTiles() {
  if (selectedTiles.length !== 2) {
    console.error("hideNonMatchingTiles called without 2 tiles");
    return;
  }

  // Flip both tiles back
  selectedTiles.forEach((tileContainer) => {
    // Get face-down image
    const faceDownImg = tileContainer.querySelector(".tile-face-down");

    // Animate back to opaque (hide face-up image)
    faceDownImg.style.opacity = "1";

    // Update state
    tileContainer.dataset.isFaceUp = "false";

    // Remove highlight
    tileContainer.classList.remove("tile-selected");
  });

  // Clear selected tiles
  selectedTiles = [];

  // Reset game state
  gameState = "WAITING_FOR_FIRST_TILE";

  console.log("Tiles hidden, ready for next selection");
}

/**
 * Handle character name click from the list
 * @param {HTMLElement} characterItem - The clicked character list item
 */
function handleCharacterClick(characterItem) {
  // Only allow clicks when waiting for witch selection
  if (gameState !== "WAITING_FOR_WITCH_SELECTION") {
    console.log("Not in witch selection state, ignoring character click");
    return;
  }

  // Ignore clicks on already completed characters
  if (characterItem.dataset.completed === "true") {
    console.log("Character already completed, ignoring click");
    return;
  }

  // Get the clicked character name
  const clickedName = characterItem.dataset.characterName;

  // Get the expected name from the selected tiles (both have same name)
  const expectedName = selectedTiles[0].dataset.nameText;

  console.log(`Character clicked: ${clickedName}, Expected: ${expectedName}`);

  // Compare names
  if (clickedName === expectedName) {
    // CORRECT!
    console.log("✓ CORRECT! Character identified");
    setTimeout(() => handleCorrectMatch(characterItem), 500);
  } else {
    // INCORRECT
    console.log("✗ INCORRECT! Wrong character selected");
    handleIncorrectMatch(characterItem);
  }
}

/**
 * Handle correct character identification
 * @param {HTMLElement} characterItem - The character list item that was correctly identified
 */
function handleCorrectMatch(characterItem) {
  // Create success tooltip
  const successTooltip = document.createElement("div");
  successTooltip.className = "success-tooltip";
  successTooltip.innerHTML = `Yes! I am witch <strong>${characterItem.dataset.characterName}</strong>!`;

  // Position it relative to the character item
  successTooltip.style.position = "absolute";
  successTooltip.style.left = "0";
  successTooltip.style.top = "25px";
  successTooltip.style.background = "#006400";
  successTooltip.style.color = "#ffffff";
  successTooltip.style.padding = "10px";
  successTooltip.style.border = "2px solid #00ff00";
  successTooltip.style.borderRadius = "5px";
  successTooltip.style.width = "300px";
  successTooltip.style.zIndex = "1001";
  successTooltip.style.lineHeight = "1.4";
  successTooltip.style.fontSize = "14px";
  successTooltip.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.5)";
  successTooltip.style.fontWeight = "bold";
  successTooltip.style.pointerEvents = "none"; // Prevent tooltip from interfering with hover detection

  // Add to character item
  characterItem.appendChild(successTooltip);

  // Track hover state and time elapsed
  let isHovering = true; // User just clicked, so they're hovering
  let minTimeElapsed = false;
  let hoverCheckInterval = null; // Track interval for cleanup

  // Store reference to matched tiles for later use
  const matchedTiles = [...selectedTiles];

  // Function to try removing tooltip (only if both conditions met)
  const tryRemoveTooltip = () => {
    if (minTimeElapsed && !isHovering) {
      successTooltip.remove();

      // Apply halftone effect to both matched tiles
      matchedTiles.forEach((tileContainer) => {
        // Remove golden glow
        tileContainer.classList.remove("tile-selected");

        // Hide the face-down broom image
        const faceDownImg = tileContainer.querySelector(".tile-face-down");
        faceDownImg.style.opacity = "0";

        // Show the halftone overlay
        const halftoneImg = tileContainer.querySelector(".tile-halftone");
        halftoneImg.style.opacity = "1";
      });

      // Clean up listeners and interval
      characterItem.removeEventListener("mouseenter", handleMouseEnter);
      characterItem.removeEventListener("mouseleave", handleMouseLeave);

      if (hoverCheckInterval) {
        clearInterval(hoverCheckInterval);
        hoverCheckInterval = null;
      }
    }
  };

  // Mouse event handlers
  const handleMouseEnter = () => {
    isHovering = true;
  };

  const handleMouseLeave = () => {
    isHovering = false;
    tryRemoveTooltip();
  };

  // Add hover listeners
  characterItem.addEventListener("mouseenter", handleMouseEnter);
  characterItem.addEventListener("mouseleave", handleMouseLeave);

  // Periodic hover verification to catch stuck hover state
  // Check every 500ms if element is actually still being hovered
  hoverCheckInterval = setInterval(() => {
    const actuallyHovering = characterItem.matches(":hover");

    // If we think we're hovering but actually aren't, fix the state
    if (isHovering && !actuallyHovering) {
      console.log(
        "Detected stuck hover state - correcting and attempting tooltip removal"
      );
      isHovering = false;
      tryRemoveTooltip();
    }
  }, 500);

  // After 2 seconds, mark time as elapsed and try to remove
  setTimeout(() => {
    minTimeElapsed = true;
    tryRemoveTooltip();
  }, 2000);

  // Mark both tiles as matched (permanently completed)
  selectedTiles.forEach((tileContainer) => {
    tileContainer.dataset.isMatched = "true";
    // Tiles stay face-up with golden glow
  });

  // Update character item as completed
  characterItem.dataset.completed = "true";

  // Add checkmark to character name
  const characterName = characterItem.querySelector(".character-name");
  characterName.textContent = "✓ " + characterItem.dataset.characterName;

  // Add hover functionality to highlight tiles when hovering over completed character name
  const handleCompletedHoverEnter = () => {
    // Find both tiles with this character name
    const characterNameText = characterItem.dataset.characterName;
    const tilesToHighlight = document.querySelectorAll(
      `[data-name-text="${characterNameText}"][data-is-matched="true"]`
    );

    tilesToHighlight.forEach((tile) => {
      // Hide halftone overlay
      const halftoneImg = tile.querySelector(".tile-halftone");
      if (halftoneImg) {
        halftoneImg.style.opacity = "0";
      }

      // Temporarily hide any celebration/idle letters
      const victoryLetter = tile.querySelector(".victory-letter");
      const clickLetter = tile.querySelector(".click-to-start-letter");
      const clickLetterInitial = tile.querySelector(
        ".click-to-start-letter-initial"
      );

      if (victoryLetter) victoryLetter.style.display = "none";
      if (clickLetter) clickLetter.style.display = "none";
      if (clickLetterInitial) clickLetterInitial.style.display = "none";

      // Temporarily remove grayscale filter
      tile.classList.remove("tile-victory-grayscale");

      // Add stronger golden glow
      tile.classList.add("tile-completed-glow");
    });
  };

  const handleCompletedHoverLeave = () => {
    // Find both tiles with this character name
    const characterNameText = characterItem.dataset.characterName;
    const tilesToHighlight = document.querySelectorAll(
      `[data-name-text="${characterNameText}"][data-is-matched="true"]`
    );

    tilesToHighlight.forEach((tile) => {
      // Show halftone overlay
      const halftoneImg = tile.querySelector(".tile-halftone");
      if (halftoneImg) {
        halftoneImg.style.opacity = "1";
      }

      // Restore any celebration/idle letters
      const victoryLetter = tile.querySelector(".victory-letter");
      const clickLetter = tile.querySelector(".click-to-start-letter");
      const clickLetterInitial = tile.querySelector(
        ".click-to-start-letter-initial"
      );

      if (victoryLetter) victoryLetter.style.display = "flex";
      if (clickLetter) clickLetter.style.display = "flex";
      if (clickLetterInitial) clickLetterInitial.style.display = "flex";

      // Restore grayscale filter if game is in celebration/idle state
      // Check if any celebration/idle letters exist on the board
      if (
        document.querySelector(".victory-letter") ||
        document.querySelector(".click-to-start-letter") ||
        document.querySelector(".click-to-start-letter-initial")
      ) {
        tile.classList.add("tile-victory-grayscale");
      }

      // Remove golden glow
      tile.classList.remove("tile-completed-glow");
    });
  };

  // Add hover listeners for completed character
  characterItem.addEventListener("mouseenter", handleCompletedHoverEnter);
  characterItem.addEventListener("mouseleave", handleCompletedHoverLeave);

  // Check if all real witches have been found (to strikethrough decoys)
  checkGameCompletion();

  // Clear selected tiles array
  selectedTiles = [];

  // Reset game state
  gameState = "WAITING_FOR_FIRST_TILE";

  console.log("Match completed successfully!");
}

/**
 * Handle incorrect character identification
 * @param {HTMLElement} characterItem - The character item that was incorrectly clicked
 */
function handleIncorrectMatch(characterItem) {
  // Create temporary error tooltip
  const errorTooltip = document.createElement("div");
  errorTooltip.className = "error-tooltip";
  errorTooltip.innerHTML = `Nope! <strong>${characterItem.dataset.characterName}</strong> is not my name!`;

  // Position it relative to the character item
  errorTooltip.style.position = "absolute";
  errorTooltip.style.left = "0";
  errorTooltip.style.top = "25px";
  errorTooltip.style.background = "#8B0000";
  errorTooltip.style.color = "#ffffff";
  errorTooltip.style.padding = "10px";
  errorTooltip.style.border = "2px solid #ff0000";
  errorTooltip.style.borderRadius = "5px";
  errorTooltip.style.width = "300px";
  errorTooltip.style.zIndex = "1001";
  errorTooltip.style.lineHeight = "1.4";
  errorTooltip.style.fontSize = "14px";
  errorTooltip.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.5)";
  errorTooltip.style.fontWeight = "bold";

  // Add to character item
  characterItem.appendChild(errorTooltip);

  // Track hover state and time elapsed
  let isHovering = true; // User just clicked, so they're hovering
  let minTimeElapsed = false;

  // Function to try removing tooltip and hiding tiles (only if both conditions met)
  const tryRemoveTooltip = () => {
    if (minTimeElapsed && !isHovering) {
      errorTooltip.remove();
      hideNonMatchingTiles();
      // Clean up listeners
      characterItem.removeEventListener("mouseenter", handleMouseEnter);
      characterItem.removeEventListener("mouseleave", handleMouseLeave);
    }
  };

  // Mouse event handlers
  const handleMouseEnter = () => {
    isHovering = true;
  };

  const handleMouseLeave = () => {
    isHovering = false;
    tryRemoveTooltip();
  };

  // Add hover listeners
  characterItem.addEventListener("mouseenter", handleMouseEnter);
  characterItem.addEventListener("mouseleave", handleMouseLeave);

  // After 2 seconds, mark time as elapsed and try to remove
  setTimeout(() => {
    minTimeElapsed = true;
    tryRemoveTooltip();
  }, 2000);
}

/**
 * Check if all real witches have been found and strikethrough decoys
 */
function checkGameCompletion() {
  // Get all character items from the list
  const allCharacterItems = document.querySelectorAll(".character-item");

  // Count total non-decoy characters
  const realCharacters = Array.from(allCharacterItems).filter(
    (item) => item.dataset.characterType === "gameTile"
  );

  // Count completed non-decoy characters
  const completedRealCharacters = realCharacters.filter(
    (item) => item.dataset.completed === "true"
  );

  console.log(
    `Game completion check: ${completedRealCharacters.length}/${realCharacters.length} real witches found`
  );

  // If all real witches have been found, apply strikethrough to decoys
  if (
    completedRealCharacters.length === realCharacters.length &&
    realCharacters.length > 0
  ) {
    console.log("🎉 All real witches found! Striking through decoys...");

    // Update best score if scoring is enabled
    if (scoringEnabled && currentDifficulty) {
      const currentScore = clickCount;
      const bestScore = bestScores[currentDifficulty];

      if (bestScore === null || currentScore < bestScore) {
        bestScores[currentDifficulty] = currentScore;
        saveBestScores();
        updateBestScoresDisplay();
        console.log(
          `🏆 New best score for ${currentDifficulty}: ${currentScore} clicks!`
        );
      } else {
        console.log(`Final score: ${currentScore} clicks (best: ${bestScore})`);
      }
    }

    // Find all decoy character items
    const decoyItems = Array.from(allCharacterItems).filter(
      (item) => item.dataset.characterType === "decoy"
    );

    // Add strikethrough class to each decoy's name
    decoyItems.forEach((decoyItem) => {
      const decoyName = decoyItem.querySelector(".character-name");
      if (decoyName) {
        decoyName.classList.add("character-decoy-strikethrough");
      }
    });

    console.log(`Strikethrough applied to ${decoyItems.length} decoy names`);

    // Check for any unrevealed bombA/bombB/bonus tiles
    const allTiles = document.querySelectorAll(".tile-container");
    const unrevealedSpecialTiles = Array.from(allTiles).filter((tile) => {
      const tileType = tile.dataset.type;
      const isFaceUp = tile.dataset.isFaceUp === "true";
      return (
        (tileType === "bombA" ||
          tileType === "bombB" ||
          tileType === "bonus") &&
        !isFaceUp
      );
    });

    if (unrevealedSpecialTiles.length > 0) {
      console.log(
        `Found ${unrevealedSpecialTiles.length} unrevealed special tiles. Auto-revealing...`
      );

      // Reveal each special tile
      unrevealedSpecialTiles.forEach((tile) => {
        // Get the face-down image
        const faceDownImg = tile.querySelector(".tile-face-down");

        // Read the muted opacity value from CSS variable
        const mutedOpacity = getComputedStyle(document.documentElement)
          .getPropertyValue("--tile-muted-opacity")
          .trim();

        // Reveal with muted opacity
        faceDownImg.style.opacity = mutedOpacity;

        // Update state
        tile.dataset.isFaceUp = "true";
        tile.dataset.isMatched = "true";
        tile.classList.add("tile-muted");

        console.log(
          `Auto-revealed ${tile.dataset.type} at position ${tile.dataset.squareNum}`
        );
      });
    }

    // After 3 seconds, apply halftone to all special tiles (including previously revealed ones)
    // This runs regardless of whether special tiles were unrevealed or clicked earlier
    setTimeout(() => {
      const allSpecialTiles = Array.from(allTiles).filter((tile) => {
        const tileType = tile.dataset.type;
        return (
          tileType === "bombA" || tileType === "bombB" || tileType === "bonus"
        );
      });

      allSpecialTiles.forEach((tile) => {
        // Hide the face-down image completely
        const faceDownImg = tile.querySelector(".tile-face-down");
        faceDownImg.style.opacity = "0";

        // Show the halftone overlay
        const halftoneImg = tile.querySelector(".tile-halftone");
        halftoneImg.style.opacity = "1";

        console.log(
          `Applied halftone to ${tile.dataset.type} at position ${tile.dataset.squareNum}`
        );
      });

      console.log("🎮 GAME OVER - All tiles completed!");

      // Start victory celebration
      celebrateVictory(currentDifficulty);
    }, 3000);
  }
}

/**
 * Victory celebration - reveals tiles in random order with message letters
 * @param {string} difficultyId - Current difficulty (easyTiles, mediumTiles, hardTiles)
 */
function celebrateVictory(difficultyId) {
  console.log("🎉 Starting victory celebration!");

  // Clear any existing animation timeouts from previous celebrations
  victoryAnimationTimeouts.forEach(clearTimeout);
  victoryAnimationTimeouts = [];
  if (autoTransitionTimeout) {
    clearTimeout(autoTransitionTimeout);
    autoTransitionTimeout = null;
  }

  // TIMING CONFIGURATION - Easy to adjust
  const CELEBRATION_CONFIG = {
    delayBetweenTiles: 200, // ms between each tile reveal
    flashDuration: 200, // ms for yellow flash animation
  };

  // Celebration letter colors - vibrant and varied
  const LETTER_COLORS = [
    "#FFD700", // Gold
    "#FF8C42", // Orange
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FF00", // Lime
    "#00FFFF", // Cyan
    "#FF69B4", // Hot Pink
    "#FFA500", // Orange
  ];

  // Get the squares for this difficulty
  const squares = getSquaresForDifficulty(difficultyId);
  const numSquares = squares.length;

  // Create shuffled array of square indices
  const shuffledIndices = Array.from({ length: numSquares }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = shuffledIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledIndices[i], shuffledIndices[j]] = [
      shuffledIndices[j],
      shuffledIndices[i],
    ];
  }

  // Select random celebration message for this difficulty
  const messages = CELEBRATION_MESSAGES[difficultyId];
  const message = messages[Math.floor(Math.random() * messages.length)];
  console.log(`Celebration message: "${message}"`);

  // Loop through shuffled indices and reveal tiles with letters
  let revealIndex = 0;

  function revealNextTile() {
    if (revealIndex >= numSquares) {
      // All tiles revealed - set 30 second timeout to transition to idle message
      console.log(
        "Celebration complete! Will auto-transition to idle in 30 seconds..."
      );

      // Schedule automatic transition to "click to start" message after 30 seconds
      autoTransitionTimeout = setTimeout(() => {
        console.log("Auto-transitioning to idle message after 30s...");
        transitionToClickMessage(difficultyId);
      }, 30000);

      return;
    }

    const squareIndex = shuffledIndices[revealIndex];
    const letter = message[squareIndex]; // Use squareIndex so letter matches square position

    // Find the tile container for this square
    const tile = document.querySelector(
      `.tile-container[data-square-num="${squareIndex}"]`
    );

    if (tile) {
      // Step 1: Remove halftone overlay to reveal the witch
      const halftoneImg = tile.querySelector(".tile-halftone");
      if (halftoneImg) {
        halftoneImg.style.opacity = "0";
      }

      // Step 2: Apply grayscale filter to dim the witch
      tile.classList.add("tile-victory-grayscale");

      // Step 3: Flash the tile yellow
      tile.classList.add("tile-victory-flash");

      // Step 4: After flash completes, add the letter overlay
      const flashTimeout = setTimeout(() => {
        // Remove flash class
        tile.classList.remove("tile-victory-flash");

        // Create letter overlay with random color
        const letterDiv = document.createElement("div");
        letterDiv.className = "victory-letter";
        letterDiv.textContent = letter;

        // Assign random color from array
        const randomColor =
          LETTER_COLORS[Math.floor(Math.random() * LETTER_COLORS.length)];
        letterDiv.style.color = randomColor;

        tile.appendChild(letterDiv);

        console.log(
          `Revealed square ${squareIndex} with letter "${letter}" in ${randomColor}`
        );
      }, CELEBRATION_CONFIG.flashDuration);
      victoryAnimationTimeouts.push(flashTimeout);
    }

    revealIndex++;
    const nextTileTimeout = setTimeout(
      revealNextTile,
      CELEBRATION_CONFIG.delayBetweenTiles
    );
    victoryAnimationTimeouts.push(nextTileTimeout);
  }

  // Start the reveal sequence
  revealNextTile();
}

/**
 * Show "click to start" idle message on grid
 * @param {string} difficultyId - Difficulty level (easyTiles, mediumTiles, hardTiles)
 * @param {boolean} applyGrayscale - Whether to apply grayscale to tiles (default: true)
 */
function showClickToStartMessage(difficultyId, applyGrayscale = true) {
  console.log(`Showing "click to start" message for ${difficultyId}`);

  // Get the message for this difficulty
  const message = CLICK_TO_START_MESSAGES[difficultyId];

  // Get all tiles
  const allTiles = document.querySelectorAll(".tile-container");

  // Apply grayscale to all tiles (if requested)
  if (applyGrayscale) {
    allTiles.forEach((tile) => {
      tile.classList.add("tile-victory-grayscale");
    });
  }

  // Add letters sequentially to each square
  allTiles.forEach((tile, index) => {
    const letter = message[index];
    if (letter) {
      const letterDiv = document.createElement("div");
      letterDiv.className = "click-to-start-letter-initial";
      letterDiv.textContent = letter;
      tile.appendChild(letterDiv);
    }
  });

  console.log(`"Click to start" message displayed: "${message}"`);
}

/**
 * Transition from victory message to "click to start" message
 * Replaces letters one at a time at 2 per second
 * @param {string} difficultyId - Difficulty level
 */
function transitionToClickMessage(difficultyId) {
  console.log("Transitioning from victory to click-to-start message...");

  // Clear any existing transition timeouts
  transitionTimeouts.forEach(clearTimeout);
  transitionTimeouts = [];

  const message = CLICK_TO_START_MESSAGES[difficultyId];
  const squares = getSquaresForDifficulty(difficultyId);
  let replaceIndex = 0;

  function replaceNextLetter() {
    if (replaceIndex >= squares.length) {
      console.log("Transition complete");

      // DEBUG: Check if scoring area and buttons are accessible
      const scoringArea = document.getElementById("scoring-area");
      const difficultyButtons = document.querySelectorAll(
        ".difficulty-button-img"
      );
      if (scoringArea) {
        console.log(
          "📍 Scoring area pointer-events:",
          getComputedStyle(scoringArea).pointerEvents
        );
        console.log(
          "📍 Scoring area z-index:",
          getComputedStyle(scoringArea).zIndex
        );
      }
      difficultyButtons.forEach((btn, idx) => {
        const btnStyle = getComputedStyle(btn);
        console.log(`📍 Button ${idx} pointer-events:`, btnStyle.pointerEvents);
        console.log(`📍 Button ${idx} display:`, btnStyle.display);
        console.log(`📍 Button ${idx} visibility:`, btnStyle.visibility);

        // Check what element is actually at button's center position
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const elementAtCenter = document.elementFromPoint(centerX, centerY);

        console.log(
          `🎯 Button ${idx} center (${centerX.toFixed(0)}, ${centerY.toFixed(
            0
          )}):`
        );
        console.log(`   Element at center:`, elementAtCenter);
        console.log(`   Element tag:`, elementAtCenter?.tagName);
        console.log(`   Element class:`, elementAtCenter?.className);
        console.log(
          `   Element z-index:`,
          elementAtCenter ? getComputedStyle(elementAtCenter).zIndex : "N/A"
        );
        console.log(`   IS the button?:`, elementAtCenter === btn);
      });

      return;
    }

    const squareIndex = replaceIndex;
    const newLetter = message[squareIndex];

    // Find the tile
    const tile = document.querySelector(
      `.tile-container[data-square-num="${squareIndex}"]`
    );
    if (tile) {
      // Remove old victory letter
      const oldLetter = tile.querySelector(".victory-letter");
      if (oldLetter) {
        oldLetter.remove();
      }

      // Add new click-to-start letter
      const letterDiv = document.createElement("div");
      letterDiv.className = "click-to-start-letter";
      letterDiv.textContent = newLetter;
      tile.appendChild(letterDiv);
    }

    replaceIndex++;
    const nextLetterTimeout = setTimeout(replaceNextLetter, 500); // 500ms = 2 letters per second
    transitionTimeouts.push(nextLetterTimeout);
  }

  replaceNextLetter();
}

/**
 * Clear idle state - remove all letter overlays and grayscale effects
 * Called when starting a new game
 */
function clearIdleState() {
  console.log("🧹 clearIdleState() called - IMMEDIATE cleanup starting");

  // STEP 1: IMMEDIATELY remove all animation DOM elements FIRST
  // This ensures visual cleanup happens before anything else
  const victoryLetters = document.querySelectorAll(".victory-letter");
  const clickLetters = document.querySelectorAll(".click-to-start-letter");
  const clickLettersInitial = document.querySelectorAll(
    ".click-to-start-letter-initial"
  );

  victoryLetters.forEach((el) => {
    if (el.parentNode) {
      el.parentNode.removeChild(el); // Force immediate removal
    }
  });

  clickLetters.forEach((el) => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });

  clickLettersInitial.forEach((el) => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });

  console.log(
    `🗑️ Removed ${
      victoryLetters.length + clickLetters.length + clickLettersInitial.length
    } letter elements`
  );

  // STEP 2: Remove grayscale effect from all tiles
  const grayscaleTiles = document.querySelectorAll(".tile-victory-grayscale");
  grayscaleTiles.forEach((tile) => {
    tile.classList.remove("tile-victory-grayscale");
  });

  console.log(`🎨 Removed grayscale from ${grayscaleTiles.length} tiles`);

  // STEP 3: Cancel all pending animation timeouts
  console.log(
    `⏱️ Cancelling timeouts: ${victoryAnimationTimeouts.length} victory + ${
      transitionTimeouts.length
    } transition + ${autoTransitionTimeout ? "1" : "0"} auto`
  );

  if (autoTransitionTimeout) {
    clearTimeout(autoTransitionTimeout);
    autoTransitionTimeout = null;
  }

  victoryAnimationTimeouts.forEach(clearTimeout);
  victoryAnimationTimeouts = [];

  transitionTimeouts.forEach(clearTimeout);
  transitionTimeouts = [];

  console.log("✅ Idle state cleared completely");
}

/**
 * Update the character list display
 * Shows unique characters in the current game
 */
function updateCharacterList(tileDataArray) {
  const characterListDiv = document.getElementById("character-list");
  characterListDiv.innerHTML = "";

  // Extract unique characters (filter out bombsA/bombsB/bonus and duplicates)
  const uniqueCharacters = [];
  const seenNames = new Set();
  const seenCharacterKeys = new Set(); // Track character keys (e.g., "Jadis") not name_text

  for (const tileData of tileDataArray) {
    if (
      tileData.type === "gameTile" &&
      tileData.name_text &&
      !seenNames.has(tileData.name_text)
    ) {
      uniqueCharacters.push(tileData);
      seenNames.add(tileData.name_text);

      // Find the character key that corresponds to this name_text
      for (const characterKey in imageList) {
        const characterImages = imageList[characterKey];
        if (
          characterImages.length > 0 &&
          characterImages[0].name_text === tileData.name_text
        ) {
          seenCharacterKeys.add(characterKey);
          break;
        }
      }
    }
  }

  // Add 2 decoy witches (witches not in the game)
  // Get all available witch names from imageList
  const allWitchNames = Object.keys(imageList);

  // Filter out witches already in the game (using character keys, not name_text)
  const availableDecoys = allWitchNames.filter(
    (name) => !seenCharacterKeys.has(name)
  );

  // Randomly select 2 decoys
  const numDecoys = Math.min(2, availableDecoys.length);
  for (let i = 0; i < numDecoys; i++) {
    const decoyName = getRandomFromArray(availableDecoys);

    // Remove from available list to avoid duplicates
    const index = availableDecoys.indexOf(decoyName);
    availableDecoys.splice(index, 1);

    // Get character data from imageList
    const decoyImages = imageList[decoyName];
    if (decoyImages && decoyImages.length > 0) {
      const decoyData = {
        name_text: decoyImages[0].name_text,
        description_text: decoyImages[0].description_text,
        type: "decoy",
      };
      uniqueCharacters.push(decoyData);
    }
  }

  // Shuffle the character list so decoys are mixed in
  shuffleArray(uniqueCharacters);

  // Create list items for each unique character
  uniqueCharacters.forEach((character) => {
    const characterItem = document.createElement("div");
    characterItem.className = "character-item";

    // Add data attributes for tracking
    characterItem.dataset.completed = "false";
    characterItem.dataset.characterName = character.name_text;
    characterItem.dataset.characterType = character.type || "gameTile"; // Store type to identify decoys

    const characterName = document.createElement("div");
    characterName.className = "character-name";
    characterName.textContent = character.name_text;

    const characterDesc = document.createElement("div");
    characterDesc.className = "character-description";
    characterDesc.textContent = character.description_text;

    // Add click handler for character selection
    characterItem.addEventListener("click", () =>
      handleCharacterClick(characterItem)
    );

    characterItem.appendChild(characterName);
    characterItem.appendChild(characterDesc);
    characterListDiv.appendChild(characterItem);
  });

  console.log(
    `Character list updated: ${uniqueCharacters.length} unique characters`
  );
}
