// ========================================
// === CONFIGURATION ===
// ========================================

// Configuration files location - change this to load different game configs
const CONFIG_LOCATION = "HALLOWEEN-GAME";

// Time-based scoring constants (easy to change!)
const GAME_START_TIME = { hours: 19, minutes: 31 }; // 7:31 PM
const GAME_DEADLINE = { hours: 20, minutes: 30 }; // 8:30 PM
const MAX_CONSECUTIVE_EATS = 5;

// ========================================
// === GAME STATE VARIABLES ===
// ========================================

// Text Buffer System
let textBuffer = [];

// Command History System
let commandHistory = [];
let historyIndex = -1;
let lastWasEmptyEnter = false;

// Commands loaded from JSON
let commands = {};

// Configuration data loaded from JSON files
let gameData = {};
let player = {};
let gameState = {};
let uiConfig = {};
let keyboardShortcuts = {};

// Quit confirmation flag
let awaitingQuitConfirmation = false;

// Celebration flag for 9th scavenger item
let awaitingCelebrationDismiss = false;

// Game world data
let rooms = {};
let doors = {};
let items = {};
let currentRoom = "STREET-01";

// Time-based scoring state
let gameTime = {
  hours: 19,
  minutes: 31,
  totalMinutes: 1171, // 19*60 + 31 = 1171 (7:31 PM)
};
let consecutiveEatsCounter = 0;
let lastCommandSucceeded = false; // Track if last command succeeded (for timer)

// ========================================
// === ERROR HANDLING FUNCTIONS ===
// ========================================

// Centralized error display function
function displayConfigError(
  filename,
  location,
  error,
  isCritical = false,
  fallbackAvailable = true
) {
  const errorCode = error.status || error.message || "Unknown error";
  const fullPath = `${location}/${filename}`;

  // Console logging with detailed information
  console.error(`Failed to load config file: ${filename}`);
  console.error(`Location: ${location}`);
  console.error(`Full path: ${fullPath}`);
  console.error(`Error: ${errorCode}`);
  console.error(`Critical: ${isCritical}`);
  console.error(`Fallback available: ${fallbackAvailable}`);

  // User-visible error message in game text area
  const errorMessages = [
    { text: `CONFIG ERROR: Failed to load ${filename}`, type: "error" },
    { text: `Location: ${fullPath}`, type: "error" },
    { text: `Error: ${errorCode}`, type: "error" },
  ];

  if (!fallbackAvailable) {
    errorMessages.push({
      text: `No fallback available - game cannot continue`,
      type: "error",
    });
    errorMessages.push({
      text: `Game will exit after this error.`,
      type: "error",
    });
  } else {
    errorMessages.push({
      text: `Using fallback defaults to continue`,
      type: "error",
    });
  }

  errorMessages.push({ text: "", type: "flavor" }); // Add blank line

  // Add to buffer if textBuffer exists (after initial load)
  if (typeof addToBuffer !== "undefined") {
    addToBuffer(errorMessages);
  }
}

// ========================================
// === FALLBACK DEFAULTS ===
// ========================================

// Fallback defaults for each config type
const CONFIG_FALLBACKS = {
  uiConfig: {
    statusPanel: {
      commands: {
        title: "COMMANDS:",
        list: [
          "(h)elp (l)ook (i)nventory",
          "(t)ake e(x)amine (d)rop",
          "(n)orth (s)outh (e)ast (w)est",
        ],
      },
      inventory: { title: "INVENTORY:" },
      status: { title: "STATUS:" },
    },
    fallbackText: {
      noGameText: "Configuration error. Type HELP for available commands.",
    },
  },

  commands: {
    help: {
      type: "system",
      shortcuts: ["h", "?"],
      action: "show_help",
    },
    look: {
      type: "action",
      shortcuts: ["l"],
      action: "examine_room",
    },
    inventory: {
      type: "system",
      shortcuts: ["i"],
      action: "show_inventory",
    },
    north: {
      type: "movement",
      shortcuts: ["n"],
      action: "move_north",
    },
    south: {
      type: "movement",
      shortcuts: ["s"],
      action: "move_south",
    },
    east: {
      type: "movement",
      shortcuts: ["e"],
      action: "move_east",
    },
    west: {
      type: "movement",
      shortcuts: ["w"],
      action: "move_west",
    },
    take: {
      type: "action",
      shortcuts: ["t", "get", "g"],
      action: "take_item",
    },
    examine: {
      type: "action",
      shortcuts: ["x", "ex", "read"],
      action: "examine_item",
    },
    drop: {
      type: "action",
      shortcuts: [],
      action: "drop_item",
    },
  },

  player: {
    core: {
      score: 0,
      health: 100,
      inventory: [],
      currentRoom: "STREET-01",
      visitedRooms: [],
    },
    gameStats: {
      treats: { current: 0, max: 40 },
      houses: { current: 0, max: 12 },
    },
  },

  gameState: {
    currentRoom: "start",
    visitedRooms: ["start"],
    gameFlags: {},
  },

  keyboardShortcuts: {
    navigation: [
      { key: "PageUp", action: "scrollUp", preventDefault: true },
      { key: "PageDown", action: "scrollDown", preventDefault: true },
    ],
  },

  gameText: [
    "SYSTEM NOTICE: Configuration files could not be loaded.",
    "Using fallback game configuration.",
    "You may experience limited functionality.",
    "",
    "Type HELP to see available commands.",
  ],

  initGame: {
    meta: {
      gameName: "Halloween Text Adventure (Fallback)",
      version: "1.0.0",
      author: "System",
    },
    startup: {
      room: "STREET-01",
      welcomeText: [
        { text: "FALLBACK: initGame.json could not be loaded.", type: "error" },
        { text: "Using system defaults.", type: "error" },
        { text: "", type: "flavor" },
        {
          text: "<span style='color: #ffcc00;'>[hint: Type <b>help</b> or <b>h</b> for a list of commands (which are also shown in the bottom-right of the screen!)]</span>",
          type: "flavor",
        },
      ],
      availableCommands: [
        "help",
        "look",
        "inventory",
        "north",
        "south",
        "east",
        "west",
      ],
    },
  },

  gameData: {
    meta: {
      gameName: "Halloween Text Adventure (Fallback)",
      version: "0.2.0",
      author: "System",
    },
    items: {},
    globalCommands: {},
  },
};

// ========================================
// === CRITICAL CONFIG VALIDATION ===
// ========================================

// Check if critical configurations loaded successfully
function checkCriticalConfigs() {
  let criticalErrors = [];

  // Check uiConfig
  if (!uiConfig || Object.keys(uiConfig).length === 0) {
    criticalErrors.push("uiConfig is empty or missing");
  } else {
    if (!uiConfig.statusPanel || !uiConfig.fallbackText) {
      criticalErrors.push(
        "uiConfig is missing required sections (statusPanel, fallbackText)"
      );
    }
  }

  // Check commands
  if (!commands || Object.keys(commands).length === 0) {
    criticalErrors.push("commands is empty or missing");
  } else {
    const requiredCommands = ["help", "look", "inventory"];
    const missingCommands = requiredCommands.filter((cmd) => !commands[cmd]);
    if (missingCommands.length > 0) {
      criticalErrors.push(
        `commands is missing required commands: ${missingCommands.join(", ")}`
      );
    }
  }

  if (criticalErrors.length > 0) {
    console.error("CRITICAL CONFIG ERRORS DETECTED:");
    criticalErrors.forEach((error) => console.error(`- ${error}`));

    // Display critical error message to user
    const criticalErrorMessages = [
      { text: "CRITICAL CONFIGURATION ERROR", type: "error" },
      {
        text: "One or more essential configuration files failed to load:",
        type: "error",
      },
      { text: "", type: "error" },
    ];

    criticalErrors.forEach((error) => {
      criticalErrorMessages.push({ text: `• ${error}`, type: "error" });
    });

    criticalErrorMessages.push(
      { text: "", type: "error" },
      {
        text: "The game cannot start properly with these errors.",
        type: "error",
      },
      {
        text: "Please check the console for detailed error information.",
        type: "error",
      },
      { text: "Input has been disabled.", type: "error" }
    );

    if (typeof addToBuffer !== "undefined") {
      addToBuffer(criticalErrorMessages);
    }

    return false;
  }

  console.log("All critical configurations validated successfully");
  return true;
}

// ========================================
// === DATA LOADING FUNCTIONS ===
// ========================================

// Load game text from JSON file
async function loadGameText() {
  const filename = "startGameText.json";
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback gameText defaults`);
    return CONFIG_FALLBACKS.gameText;
  }
}

// Load commands from JSON file
async function loadCommands() {
  const filename = "commands.json";
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, true, true);
    console.log(`Using fallback commands defaults`);
    return CONFIG_FALLBACKS.commands;
  }
}

// Load player data from JSON file
async function loadPlayer() {
  const filename = "player.json";
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Check if player.json is empty (new game scenario)
    if (Object.keys(data).length === 0) {
      console.log("player.json is empty - initializing from initGame");
      if (initGame && initGame.player) {
        console.log("Using player data from initGame.json");
        return initGame.player;
      } else {
        console.log("initGame.player not available - using fallback");
        return CONFIG_FALLBACKS.player;
      }
    }

    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback player defaults`);
    return CONFIG_FALLBACKS.player;
  }
}

// Load game state from JSON file
async function loadGameState() {
  const filename = "gameState.json";
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback gameState defaults`);
    return CONFIG_FALLBACKS.gameState;
  }
}

// Load UI configuration from JSON file
async function loadUIConfig() {
  const filename = "uiConfig.json";
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, true, true);
    console.log(`Using fallback uiConfig defaults`);
    return CONFIG_FALLBACKS.uiConfig;
  }
}

// Load keyboard shortcuts from JSON file
async function loadKeyboardShortcuts() {
  const filename = "keyboardShortcuts.json";
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback keyboardShortcuts defaults`);
    return CONFIG_FALLBACKS.keyboardShortcuts;
  }
}

// Load initial game configuration from JSON file
async function loadInitGame() {
  const filename = "initGame.json";
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback initGame defaults`);
    return CONFIG_FALLBACKS.initGame;
  }
}

// Load unified game data from JSON file
async function loadGameData() {
  const filename = "gameData.json";
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback gameData defaults`);
    return CONFIG_FALLBACKS.gameData;
  }
}

// Load rooms and doors data from JSON file
async function loadRoomsAndDoors() {
  const filename = "rooms-w-doors.json";
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, true, false);
    console.log(`Failed to load rooms data - game cannot continue`);
    return {};
  }
}

// Load items data from JSON file
async function loadItems() {
  const filename = "items.json";
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using empty items data as fallback`);
    return { items: {} };
  }
}

// Load scavenger items data from JSON file
async function loadScavengerItems() {
  const filename = "scavengerItems.json";
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    console.log(
      `No scavengerItems.json found - continuing without scavenger items`
    );
    return { scavengerItems: {} };
  }
}

// Process gameData to build active items and commands
function processGameData(gameData) {
  const processed = {
    activeItems: {},
    activeCommands: {},
    activeNPCs: {},
    playerInventory: [],
    startupData: gameData.startup || {},
  };

  // Filter active items
  if (gameData.items) {
    Object.entries(gameData.items).forEach(([itemId, item]) => {
      if (item.includeInGame === true) {
        processed.activeItems[itemId] = item;

        // Build player inventory from items with location: "player"
        if (item.location === "player") {
          processed.playerInventory.push(itemId);
        }
      }
    });
  }

  // Filter active NPCs
  if (gameData.npcs) {
    Object.entries(gameData.npcs).forEach(([npcId, npc]) => {
      if (npc.includeInGame === true) {
        processed.activeNPCs[npcId] = npc;
      }
    });
  }

  // Filter active commands (now from gameData.commands instead of globalCommands)
  if (gameData.commands) {
    Object.entries(gameData.commands).forEach(([commandId, command]) => {
      if (command.includeInGame === true) {
        processed.activeCommands[commandId] = command;
      }
    });
  }

  console.log(
    `Processed gameData: ${
      Object.keys(processed.activeItems).length
    } active items, ${Object.keys(processed.activeNPCs).length} active NPCs, ${
      Object.keys(processed.activeCommands).length
    } active commands`
  );
  console.log(
    `Built player inventory: ${processed.playerInventory.join(", ")}`
  );

  return processed;
}

// Validate gameData references
function validateGameData(gameData, processed) {
  const errors = [];

  // Check for items with invalid location
  Object.entries(processed.activeItems).forEach(([itemId, item]) => {
    if (item.location && item.location !== "player") {
      // This would be where we check if the room exists, but we don't have rooms loaded yet
      // For now, just log it
      console.log(`Item ${itemId} starts in location: ${item.location}`);
    }
  });

  return errors;
}

// ========================================
// === GAME ENGINE CORE FUNCTIONS ===
// ========================================

// Display current room description
function displayRoom(roomId = currentRoom) {
  if (!rooms[roomId]) {
    addToBuffer([{ text: "ERROR: Room not found!", type: "error" }]);
    return;
  }

  const room = rooms[roomId];

  // Count how many times this room has been visited
  const visitCount = player.core.visitedRooms.filter(
    (r) => r === roomId
  ).length;

  // Select appropriate enterText based on visit count
  let enterText;

  // Special handling for NICE-PORCH - text depends on porch light state, not visit count
  if (roomId === "NICE-PORCH") {
    const porchLight = items.porch_light_nice;
    if (porchLight && porchLight.visible === true) {
      // Light is still on (doorbell hasn't been used) - always show "first" text
      enterText =
        room.enterText?.first || room.lookText || `You are in ${room.name}`;
    } else {
      // Light is off (doorbell has been used) - show "second" or "repeat"
      enterText =
        room.enterText?.second ||
        room.enterText?.repeat ||
        room.lookText ||
        `You are in ${room.name}`;
    }
  } else if (visitCount === 0) {
    // First visit
    enterText =
      room.enterText?.first || room.lookText || `You are in ${room.name}`;
  } else if (visitCount === 1) {
    // Second visit - use second if available, otherwise repeat
    enterText =
      room.enterText?.second ||
      room.enterText?.repeat ||
      room.lookText ||
      `You are in ${room.name}`;
  } else {
    // Third+ visit - use repeat
    enterText =
      room.enterText?.repeat || room.lookText || `You are in ${room.name}`;
  }

  addToBuffer([{ text: enterText, type: "flavor" }]);

  // Special handling for FOYER - show different hints based on list status
  if (roomId === "FOYER") {
    const list = items.mrsmcgillicuttyslist;
    const hasListInInventory = list && list.location === "INVENTORY";
    const hasExaminedList = list && list.hasBeenExamined === true;

    if (hasListInInventory && hasExaminedList) {
      // Show original hint about picking up items
      addToBuffer([
        { text: "", type: "flavor" }, // Blank line
        {
          text: "<span style='color: #ffcc00;'>[hint: type <b>take &lt;item&gt;</b> or <b>get &lt;item&gt;</b> to pick up items you find.]</span>",
          type: "flavor",
        },
      ]);
    } else {
      // Show scavenger hunt hint
      addToBuffer([
        { text: "", type: "flavor" }, // Blank line
        {
          text: "<span style='color: #ffcc00;'>[Hint: You will need to <b>GET</b> and actually <b>EXAMINE</b> the scavenger hunt list from Mrs. McGillicutty to find the items!<br><br>[2nd Hint: Mrs. McGillicutty has to open her door!]</span>",
          type: "flavor",
        },
      ]);
    }
  }

  // Add room to visited rooms tracking
  player.core.visitedRooms.push(roomId);

  // Interior rooms list (used for exit formatting and "picked clean" message)
  const interiorRooms = [
    "FOYER",
    "LIBRARY",
    "MUSIC-ROOM",
    "GAME-ROOM",
    "KITCHEN",
    "BEDROOM",
    "STUDY",
    "DINING-ROOM",
    "TV-ROOM",
  ];

  // Show items in room (if any)
  const roomItems = Object.values(items).filter(
    (item) =>
      item.includeInGame && item.location === currentRoom && item.visible
  );

  // Filter for takeable items (items that can be picked up)
  const takeableItems = roomItems.filter(
    (item) => item.actions?.take?.addToInventory === true
  );

  // Show "picked clean" message for interior rooms with no takeable items
  if (interiorRooms.includes(currentRoom) && takeableItems.length === 0) {
    addToBuffer([
      { text: "", type: "flavor" }, // Blank line before message
      {
        text: "You have picked this room clean. Nothing left to take here.",
        type: "flavor",
      },
    ]);
  }

  // Show all visible items (if any)
  if (roomItems.length > 0) {
    addToBuffer([
      { text: "", type: "flavor" }, // Blank line before items
      { text: "You see:", type: "command" },
    ]);
    roomItems.forEach((item) => {
      addToBuffer([{ text: `  ${item.display}`, type: "flavor" }]);
    });
  }

  // Blank line before exits
  addToBuffer([{ text: "", type: "flavor" }]);

  // Show available exits (all visible doors)
  const allExits = Object.keys(room.exits || {});
  const availableExits = allExits.filter((direction) => {
    const exit = room.exits[direction];
    if (!exit || !exit.door) return true; // No door, always available

    const doorData = doors[exit.door];
    if (!doorData) return true; // Door data missing, show it

    // Only show if door is visible
    return doorData.visible;
  });

  if (availableExits.length > 0) {
    // Interior rooms show "SOUTH door, NORTH door" format
    let exitsText;
    if (interiorRooms.includes(currentRoom)) {
      exitsText = availableExits
        .map((dir) => `<b>${dir.toUpperCase()}</b> door`)
        .join(", ");
    } else {
      exitsText = availableExits.map((dir) => `<b>${dir}</b>`).join(", ");
    }
    addToBuffer([{ text: `Exits: ${exitsText}`, type: "command" }]);
  } else {
    addToBuffer([{ text: "No obvious exits.", type: "command" }]);
  }
}

// Check if movement through a door is allowed
function canMoveThrough(door) {
  if (!door)
    return { allowed: false, message: "There is no exit in that direction." };

  const doorData = doors[door.door];
  if (!doorData)
    return { allowed: false, message: "There is no exit in that direction." };

  // Check visibility
  if (!doorData.visible) {
    return { allowed: false, message: "There is no exit in that direction." };
  }

  // Check if door is locked
  if (doorData.locked) {
    const message = doorData.lockedMessage || "The door is locked.";
    return { allowed: false, message: message };
  }

  // Check if door is closed
  if (!doorData.open) {
    return { allowed: false, message: "The door is closed." };
  }

  return { allowed: true };
}

// Move player in a direction
function movePlayer(direction) {
  const room = rooms[currentRoom];
  if (!room || !room.exits) {
    addToBuffer([{ text: "You can't move from here.", type: "error" }]);
    return;
  }

  const exit = room.exits[direction];
  const moveResult = canMoveThrough(exit);

  if (!moveResult.allowed) {
    addToBuffer([{ text: moveResult.message, type: "error" }]);
    return;
  }

  // Move to new room
  currentRoom = exit.to;

  // Reset consecutive eat counter on any movement
  consecutiveEatsCounter = 0;

  updateScavengerBackground(currentRoom);
  displayRoom(currentRoom);

  // Mark command as successful
  lastCommandSucceeded = true;
}

// Show help command
function showHelp() {
  addToBuffer([
    { text: "Available commands:", type: "command" },
    { text: "", type: "flavor" },
    {
      text: "Movement: north (n), south (s), east (e), west (w)",
      type: "flavor",
    },
    {
      text: "Actions: look (l), inventory (i), help (h), take (get), examine (x), drop",
      type: "flavor",
    },
    { text: "", type: "flavor" },
  ]);

  // Show room description after help
  lookAtRoom();
}

// Helper function to convert numbers to words for scavenger hunt
function numberToWord(num) {
  const words = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  return words[num] || num.toString();
}

// ========================================
// === TIME-BASED SCORING FUNCTIONS ===
// ========================================

// Update game time by adding/subtracting minutes
function updateGameTime(minutesToAdd) {
  gameTime.totalMinutes += minutesToAdd;
  gameTime.hours = Math.floor(gameTime.totalMinutes / 60);
  gameTime.minutes = gameTime.totalMinutes % 60;
  updateGameStatus(); // Regenerate entire status panel to update curfew styling
}

// Format time as 12-hour clock (e.g., "7:31 PM")
function formatTime12Hour() {
  const hours12 =
    gameTime.hours > 12
      ? gameTime.hours - 12
      : gameTime.hours === 0
      ? 12
      : gameTime.hours;
  const ampm = gameTime.hours >= 12 ? "PM" : "AM";
  const mins = String(gameTime.minutes).padStart(2, "0");
  return `${hours12}:${mins} ${ampm}`;
}

// Format curfew time as 12-hour clock (e.g., "8:30 PM")
function formatCurfewTime() {
  const hours12 =
    GAME_DEADLINE.hours > 12
      ? GAME_DEADLINE.hours - 12
      : GAME_DEADLINE.hours === 0
      ? 12
      : GAME_DEADLINE.hours;
  const ampm = GAME_DEADLINE.hours >= 12 ? "PM" : "AM";
  const mins = String(GAME_DEADLINE.minutes).padStart(2, "0");
  return `${hours12}:${mins} ${ampm}`;
}

// Update the digital clock display in the status panel
function updateClockDisplay() {
  // Update only the first time-value (current time), not the curfew
  const timeElements = document.querySelectorAll(".time-value");
  if (timeElements.length > 0) {
    timeElements[0].textContent = formatTime12Hour();
  }
}

// Helper function to format scavenger items in two columns
function formatScavengerTwoColumns(scavengerItems) {
  const columnWidth = 33; // Display width for first column (including indentation)
  const formattedLines = [];

  // Calculate midpoint for splitting into two columns
  const midpoint = Math.ceil(scavengerItems.length / 2);

  // Build rows with two columns
  for (let i = 0; i < midpoint; i++) {
    const leftItem = scavengerItems[i];
    const rightItem = scavengerItems[i + midpoint];

    // Format left column item with non-breaking spaces for padding
    const leftText = `  ${leftItem.display}`;

    // Calculate actual display length (strip HTML tags for length calculation)
    const leftDisplayLength = leftText.replace(/<[^>]*>/g, "").length;
    const paddingNeeded = columnWidth - leftDisplayLength;
    const padding = "&nbsp;".repeat(Math.max(0, paddingNeeded));

    // Add right column item if it exists
    if (rightItem) {
      formattedLines.push(leftText + padding + rightItem.display);
    } else {
      formattedLines.push(leftText); // No padding needed if no right item
    }
  }

  return formattedLines;
}

// Show inventory
function showInventory() {
  // Get items from INVENTORY room
  const inventoryItems = Object.values(items).filter(
    (item) => item.includeInGame && item.location === "INVENTORY"
  );

  if (inventoryItems.length === 0) {
    addToBuffer([{ text: "Your inventory is empty.", type: "flavor" }]);
    // Show room description after inventory
    addToBuffer([{ text: "", type: "flavor" }]); // Blank line
    lookAtRoom();
    return;
  }

  // Separate by type
  const scavengerItems = inventoryItems.filter(
    (item) => item.type === "scavenger"
  );
  const toolItems = inventoryItems.filter((item) => item.type === "tools");
  const noteItems = inventoryItems.filter((item) => item.type === "notes");
  const candyItems = inventoryItems.filter((item) => item.type === "candy");

  // Combine tools and notes for ITEMS section
  const questItems = [...toolItems, ...noteItems];

  // Count total available scavenger items
  const totalScavenger = Object.values(items).filter(
    (item) => item.includeInGame && item.type === "scavenger"
  ).length;

  // Sort scavenger items by room displaySquare (0-8)
  scavengerItems.sort((a, b) => {
    const roomA = Object.values(rooms).find(
      (r) =>
        Object.keys(rooms).find((key) => rooms[key] === r) ===
        a.originalLocation
    );
    const roomB = Object.values(rooms).find(
      (r) =>
        Object.keys(rooms).find((key) => rooms[key] === r) ===
        b.originalLocation
    );
    const squareA = roomA?.special?.displaySquare ?? 999;
    const squareB = roomB?.special?.displaySquare ?? 999;
    return squareA - squareB;
  });

  addToBuffer([{ text: "You are carrying:", type: "command" }]);

  // Display quest items (tools and notes) first, each on own line
  if (questItems.length > 0) {
    addToBuffer([{ text: `ITEMS`, type: "underlined" }]);
    questItems.forEach((item) => {
      addToBuffer([
        { text: `  ${item.inventoryDisplay || item.display}`, type: "flavor" },
      ]);
    });
  }

  // Blank line between sections
  if (questItems.length > 0 && scavengerItems.length > 0) {
    addToBuffer([{ text: "", type: "flavor" }]);
  }

  // Display scavenger items second, in two columns
  if (scavengerItems.length > 0) {
    addToBuffer([
      {
        text: `SCAVENGER ITEMS (${scavengerItems.length}/${totalScavenger})`,
        type: "underlined",
      },
    ]);

    // Format items in two columns
    const formattedLines = formatScavengerTwoColumns(scavengerItems);
    formattedLines.forEach((line) => {
      addToBuffer([{ text: line, type: "flavor" }]);
    });
  }

  // Blank line between sections
  if (
    (questItems.length > 0 || scavengerItems.length > 0) &&
    candyItems.length > 0
  ) {
    addToBuffer([{ text: "", type: "flavor" }]);
  }

  // Display candy items, comma-separated
  if (candyItems.length > 0) {
    addToBuffer([
      { text: `TREATS (${candyItems.length}/20)`, type: "underlined" },
    ]);
    const candyList = candyItems.map((item) => item.display).join(", ");
    addToBuffer([{ text: `  ${candyList}`, type: "flavor" }]);
  }

  // Show room description after inventory
  addToBuffer([{ text: "", type: "flavor" }]); // Blank line
  lookAtRoom();
}

// Handle take/get command
function handleTakeCommand(command) {
  // Extract the item name - get everything after the command, lowercase, strip spaces
  const input = command.toLowerCase().trim();
  const firstSpace = input.indexOf(" ");

  if (firstSpace === -1) {
    addToBuffer([{ text: "Take what?", type: "error" }]);
    return;
  }

  const remainder = input.substring(firstSpace + 1).trim();
  const targetTypedName = remainder.replace(/\s+/g, ""); // Strip all spaces

  // Find item in current room with matching typedNames and a take action
  const roomItems = Object.entries(items).filter(
    ([key, item]) =>
      item.includeInGame &&
      item.location === currentRoom &&
      item.visible &&
      !item.locked &&
      item.typedNames?.includes(targetTypedName) &&
      item.actions?.take !== undefined
  );

  if (roomItems.length === 0) {
    // Check if item is already in inventory (was auto-added or already taken)
    const inventoryItems = Object.entries(items).filter(
      ([key, item]) =>
        item.includeInGame &&
        item.location === "INVENTORY" &&
        item.typedNames?.includes(targetTypedName)
    );

    if (inventoryItems.length > 0) {
      // Item already in inventory - show friendly message
      const [itemKey, item] = inventoryItems[0];
      addToBuffer([
        {
          text: `The ${item.display} is already in your inventory.<br><br><span style=\"color: #ffcc00;\">[hint: You might type <b>inventory</b> to see what you are carrying, or <b>examine ?</b> to get more information about any item.]</span>`,
          type: "flavor",
        },
      ]);
      addToBuffer([{ text: "", type: "flavor" }]); // Blank line
      lookAtRoom();
      lastCommandSucceeded = true;
      return;
    }

    // Not in room or inventory - show error
    addToBuffer([
      {
        text: `You don't see any "${targetTypedName}" here that you can take.`,
        type: "error",
      },
    ]);
    return;
  }

  // Take the first matching item
  const [itemKey, item] = roomItems[0];
  const takeAction = item.actions.take;

  // Show response message with image and examine text if available
  if (item.icon150 && item.type !== "scavenger") {
    // Candy items with 150px images
    addToBuffer([
      {
        text: takeAction.response || `You pick up the ${item.display}.`,
        type: "flavor",
      },
      {
        text: `<img src="${item.icon150}" style="display:block; margin:10px 0; max-width:150px;" onload="document.querySelector('.text').scrollTop = document.querySelector('.text').scrollHeight;">`,
        type: "flavor",
      },
      {
        text: item.actions?.examine || "",
        type: "flavor",
      },
    ]);
  } else if (item.icon250x250 && item.type === "scavenger") {
    // Scavenger items with 250px images
    // Count how many scavenger items are now in inventory (including this one being added)
    const scavengerCount = Object.values(items).filter(
      (i) =>
        i.includeInGame &&
        i.type === "scavenger" &&
        (i.location === "INVENTORY" || i === item)
    ).length;

    // Total scavenger items in game
    const totalScavenger = Object.values(items).filter(
      (i) => i.includeInGame && i.type === "scavenger"
    ).length;

    // Show congratulatory message with word-based count
    const countWord = numberToWord(scavengerCount).toLowerCase();
    const totalWord = numberToWord(totalScavenger).toLowerCase();

    addToBuffer([
      {
        text: takeAction.response || `You pick up the ${item.display}.`,
        type: "flavor",
      },
      {
        text: "",
        type: "flavor",
      },
      {
        text: `<div style="display: flex; align-items: flex-start; gap: 80px; margin: 10px 0;">
      <img src="${item.icon250x250}" style="width: 250px; height: 250px; flex-shrink: 0;" onload="document.querySelector('.text').scrollTop = document.querySelector('.text').scrollHeight;">
      <div style="text-align: center; line-height: 1.2; padding-top: 25px;">
        <span class="scavenger-found" style="display: block;">*********</span>
        <span class="scavenger-found" style="display: block;">SCAVENGER</span>
        <span class="scavenger-found" style="display: block;">HUNT</span>
        <span class="scavenger-found" style="display: block;">&nbsp;ITEM</span>
        <span class="scavenger-found" style="display: block;">*********</span>
        <span class="scavenger-found" style="display: block; margin-top: 5px;">&nbsp;${countWord}</span>
        <span class="scavenger-found" style="display: block;">&nbsp;of</span>
        <span class="scavenger-found" style="display: block;">&nbsp;${totalWord}</span>
      </div>
    </div>`,
        type: "flavor",
      },
      {
        text: "",
        type: "flavor",
      },
      {
        text: item.description || "",
        type: "flavor",
      },
    ]);
  } else {
    addToBuffer([
      {
        text: takeAction.response || `You pick up the ${item.display}.`,
        type: "flavor",
      },
    ]);
  }

  // Only move to inventory if addToInventory is true
  if (takeAction.addToInventory === true) {
    // Move item to inventory
    item.location = "INVENTORY";

    // Mark as found if specified (for scavenger hunt)
    if (takeAction.markAsFound) {
      item.found = true;
    }

    // Update the status panel to show new inventory
    updateGameStatus();

    // Update scavenger grid if item was marked as found
    updateScavengerGrid();

    // Show room description after taking any item
    addToBuffer([{ text: "", type: "flavor" }]); // Blank line
    lookAtRoom();

    // Check for celebration if this was a scavenger item
    if (item.type === "scavenger") {
      // Count scavenger items now in inventory
      const scavengerCount = Object.values(items).filter(
        (i) =>
          i.includeInGame &&
          i.type === "scavenger" &&
          i.location === "INVENTORY"
      ).length;

      // Total scavenger items in game
      const totalScavenger = Object.values(items).filter(
        (i) => i.includeInGame && i.type === "scavenger"
      ).length;

      // DEBUG: Log the counts
      console.log(`DEBUG CELEBRATION: Item type: ${item.type}`);
      console.log(
        `DEBUG CELEBRATION: Scavenger count in inventory: ${scavengerCount}`
      );
      console.log(
        `DEBUG CELEBRATION: Total scavenger items: ${totalScavenger}`
      );
      console.log(
        `DEBUG CELEBRATION: Should trigger? ${
          scavengerCount === totalScavenger
        }`
      );

      // Special celebration for collecting all items
      if (scavengerCount === totalScavenger) {
        console.log(
          `DEBUG CELEBRATION: Triggering celebration in 1.5 seconds!`
        );
        setTimeout(() => {
          console.log(`DEBUG CELEBRATION: showCelebrationGrid() called`);
          showCelebrationGrid();
        }, 1500);
      }
    }

    // Mark command as successful
    lastCommandSucceeded = true;
  }
}

// Handle drop/put command
function handleDropCommand(command) {
  // Extract the item name - get everything after the command, lowercase, strip spaces
  const input = command.toLowerCase().trim();
  const firstSpace = input.indexOf(" ");

  if (firstSpace === -1) {
    addToBuffer([{ text: "Drop what?", type: "error" }]);
    return;
  }

  const remainder = input.substring(firstSpace + 1).trim();
  const targetTypedName = remainder.replace(/\s+/g, ""); // Strip all spaces

  // Find item in inventory with matching typedNames
  const inventoryItems = Object.entries(items).filter(
    ([key, item]) =>
      item.includeInGame &&
      item.location === "INVENTORY" &&
      item.typedNames?.includes(targetTypedName) &&
      item.actions?.take // Can only drop items that are portable (have take action)
  );

  if (inventoryItems.length === 0) {
    addToBuffer([
      { text: `You're not carrying any "${targetTypedName}".`, type: "error" },
    ]);
    return;
  }

  // Drop the first matching item
  const [itemKey, item] = inventoryItems[0];

  // Check if item is droppable
  if (item.droppable === false) {
    addToBuffer([
      {
        text: "You worked hard to find this treasure! You cannot drop it.",
        type: "error",
      },
    ]);
    return;
  }

  // Show response message
  addToBuffer([{ text: `You drop the ${item.display}.`, type: "flavor" }]);

  // Move item from inventory to current room
  item.location = currentRoom;

  // Update the status panel to show new inventory
  updateGameStatus();

  // Show room description after dropping
  addToBuffer([{ text: "", type: "flavor" }]); // Blank line
  lookAtRoom();

  // Mark command as successful
  lastCommandSucceeded = true;
}

// Handle throw command (Easter egg - doesn't actually do anything)
function handleThrowCommand(command) {
  // Extract the item name - get everything after the command, lowercase, strip spaces
  const input = command.toLowerCase().trim();
  const firstSpace = input.indexOf(" ");

  if (firstSpace === -1) {
    addToBuffer([{ text: "Throw what?", type: "error" }]);
    return;
  }

  const remainder = input.substring(firstSpace + 1).trim();
  const targetTypedName = remainder.replace(/\s+/g, ""); // Strip all spaces

  // Find item in inventory with matching typedNames
  const inventoryItems = Object.entries(items).filter(
    ([key, item]) =>
      item.includeInGame &&
      item.location === "INVENTORY" &&
      item.typedNames?.includes(targetTypedName)
  );

  if (inventoryItems.length === 0) {
    addToBuffer([
      { text: `You're not carrying any "${targetTypedName}".`, type: "error" },
    ]);
    return;
  }

  // Item exists, but refuse to throw it with a humorous message
  const [itemKey, item] = inventoryItems[0];

  const throwMessages = [
    "You consider throwing it, but decide that's a terrible idea.",
    "That seems like a waste. Better keep it.",
    "Nah, you might need that later.",
    "Why would you throw that? Think again.",
    "You raise your arm to throw, then think better of it.",
  ];

  // Pick a random message
  const randomMessage =
    throwMessages[Math.floor(Math.random() * throwMessages.length)];

  addToBuffer([{ text: randomMessage, type: "flavor" }]);

  // Show room description after throw command
  addToBuffer([{ text: "", type: "flavor" }]); // Blank line
  lookAtRoom();

  // Mark command as successful
  lastCommandSucceeded = true;
}

// Handle DEBUG command - adds all scavenger items except pumpkin to inventory
function handleDebugCommand() {
  // First, enable all scavenger items in the game
  Object.values(items).forEach((item) => {
    if (item.type === "scavenger") {
      item.includeInGame = true;
    }
  });

  // Find all scavenger items except pumpkin
  const scavengerItems = Object.entries(items).filter(
    ([key, item]) =>
      item.includeInGame &&
      item.type === "scavenger" &&
      !item.typedNames?.includes("pumpkin")
  );

  let scavengerCount = 0;

  scavengerItems.forEach(([key, item]) => {
    // Move to inventory
    item.location = "INVENTORY";
    // Mark as found
    item.found = true;
    scavengerCount++;
  });

  // Find candy/treat items and add 15 of them
  const candyItems = Object.entries(items).filter(
    ([key, item]) =>
      item.includeInGame &&
      item.type === "candy" &&
      item.location !== "INVENTORY"
  );

  let candyCount = 0;
  const candyToAdd = candyItems.slice(0, 15); // Take first 15

  candyToAdd.forEach(([key, item]) => {
    // Move to inventory
    item.location = "INVENTORY";
    // Mark as found if it has that property
    if (item.found !== undefined) {
      item.found = true;
    }
    candyCount++;
  });

  // Update game status and scavenger grid
  updateGameStatus();
  updateScavengerGrid();

  // Check if we now have all 9 scavenger items (in case player already had pumpkin)
  const totalScavengerInInventory = Object.values(items).filter(
    (item) =>
      item.includeInGame &&
      item.type === "scavenger" &&
      item.location === "INVENTORY"
  ).length;

  const totalScavenger = Object.values(items).filter(
    (item) => item.includeInGame && item.type === "scavenger"
  ).length;

  // Conditional message based on whether all items collected
  if (totalScavengerInInventory === totalScavenger) {
    addToBuffer([
      {
        text: `DEBUG: Added ${scavengerCount} scavenger items and ${candyCount} treats to inventory.`,
        type: "command",
      },
      {
        text: `You now have all 9 scavenger items! Celebration incoming...`,
        type: "flavor",
      },
    ]);

    // Show room description after debug command
    addToBuffer([{ text: "", type: "flavor" }]); // Blank line
    lookAtRoom();

    // Trigger celebration
    setTimeout(() => {
      showCelebrationGrid();
    }, 1500);
  } else {
    addToBuffer([
      {
        text: `DEBUG: Added ${scavengerCount} scavenger items and ${candyCount} treats to inventory.`,
        type: "command",
      },
      {
        text: `You still need to find the pumpkin - check the FOYER.`,
        type: "flavor",
      },
    ]);

    // Show room description after debug command
    addToBuffer([{ text: "", type: "flavor" }]); // Blank line
    lookAtRoom();
  }
}

// Handle CELEBRATE command - re-shows celebration if all 9 items collected
function handleCelebrateCommand() {
  // Count scavenger items in inventory
  const scavengerCount = Object.values(items).filter(
    (item) =>
      item.includeInGame &&
      item.type === "scavenger" &&
      item.location === "INVENTORY"
  ).length;

  // Total scavenger items in game
  const totalScavenger = Object.values(items).filter(
    (item) => item.includeInGame && item.type === "scavenger"
  ).length;

  if (scavengerCount === totalScavenger && scavengerCount === 9) {
    // Show celebration immediately
    showCelebrationGrid();
  } else {
    addToBuffer([
      {
        text: `You need to find all NINE scavenger items before you can celebrate.`,
        type: "error",
      },
      { text: `Found: ${scavengerCount} / ${totalScavenger}`, type: "flavor" },
    ]);

    // Show room description after celebrate command
    addToBuffer([{ text: "", type: "flavor" }]); // Blank line
    lookAtRoom();
  }
}

// Handle ABOUT command - shows game information from gameData.json
function handleAboutCommand() {
  // Display the about text from gameData
  if (gameData.about && gameData.about.text) {
    gameData.about.text.forEach((line) => {
      addToBuffer([line]);
    });
  } else {
    addToBuffer([{ text: "About information not available.", type: "error" }]);
  }
}

// Handle HINT command - shows all hidden/secret commands
function handleHintCommand() {
  addToBuffer([
    { text: "<b>Hidden/Secret Commands:</b>", type: "command" },
    { text: "", type: "flavor" },
    { text: "  ABOUT - Game information", type: "flavor" },
    { text: "  DEBUG - Adds items to inventory for testing", type: "flavor" },
    {
      text: "  CELEBRATE - Re-shows the victory animation (if you've won)",
      type: "flavor",
    },
    { text: "  RESTART - Reloads the game from the beginning", type: "flavor" },
    {
      text: "  THROW <item> - Try to throw items.",
      type: "flavor",
    },
    {
      text: "  ORANGE - Orange borders, white prompt (current default)",
      type: "flavor",
    },
    {
      text: "  WHITE - White borders, yellow prompt (classic look)",
      type: "flavor",
    },
    { text: "  HINT - Shows this list", type: "flavor" },
    { text: "", type: "flavor" },
    { text: "<b>Command Aliases:</b>", type: "command" },
    { text: "", type: "flavor" },
    {
      text: "  north      [n]" + "&nbsp;".repeat(23 - 16) + "look       [l]",
      type: "flavor",
    },
    {
      text:
        "  south      [s]" +
        "&nbsp;".repeat(23 - 16) +
        "examine    [x, ex, read]",
      type: "flavor",
    },
    {
      text:
        "  east       [e]" +
        "&nbsp;".repeat(24 - 16) +
        "take       [t, get, g]",
      type: "flavor",
    },
    {
      text: "  west       [w]" + "&nbsp;".repeat(24 - 16) + "drop",
      type: "flavor",
    },
    {
      text: "  help       [h, ?]" + "&nbsp;".repeat(24 - 19) + "inventory  [i]",
      type: "flavor",
    },
    { text: "", type: "flavor" },
    { text: "  use        [u, ring, turn]", type: "flavor" },
    { text: "  eat", type: "flavor" },
    { text: "  open       [unlock]", type: "flavor" },
    { text: "  say        [speak, push, press, dial]", type: "flavor" },
    {
      text: "  quit       [home] - Requires typing twice!",
      type: "flavor",
    },
    { text: "", type: "flavor" },
    {
      text: "<b>Advice:</b>",
      type: "command",
    },
    {
      text: "<br>!!!!!! A common pattern is LOOK around, then TAKE or EXAMINE things, and finally USE, EAT or EXAMINE them.<br><br>For example: <b>TAKE key</b>, <b>EXAMINE key</b>, then, when later in the game you need a key, <b>USE key</b>.<br><br>Another example: <b>TAKE snickers</b>, <b>EAT snickers</b>. (oh, and yeah! You saved some time by eating the Snickers!)<br><br>By the way, you can go home at any time by typing <b>QUIT</b> or <b>HOME</b>. You do not need to find all the items.",
      type: "flavor",
    },
    {
      text: "<br><b>BY THE WAY, much of this <b>hint</b> command text has scrolled up and off the page! Scroll up to see the entire page.</b>",
      type: "command",
    },
  ]);

  // Show room description after hint command
  addToBuffer([{ text: "", type: "flavor" }]); // Blank line
  lookAtRoom();
}

// Handle SCORE command - explains time-based scoring system
function handleScoreCommand() {
  const currentTime = formatTime12Hour();
  const deadlineHours =
    GAME_DEADLINE.hours > 12 ? GAME_DEADLINE.hours - 12 : GAME_DEADLINE.hours;
  const deadlineTime = `${deadlineHours}:${String(
    GAME_DEADLINE.minutes
  ).padStart(2, "0")} PM`;
  const deadlineTotalMins = GAME_DEADLINE.hours * 60 + GAME_DEADLINE.minutes;
  const timeRemaining = deadlineTotalMins - gameTime.totalMinutes;

  const scavengerCount = Object.values(items).filter(
    (item) => item.type === "scavenger" && item.location === "INVENTORY"
  ).length;

  const treatsCount = Object.values(items).filter(
    (item) => item.type === "candy" && item.location === "INVENTORY"
  ).length;

  addToBuffer([
    { text: "=== TIME-BASED SCORING ===", type: "command" },
    { text: "", type: "flavor" },
    { text: `Current Time: ${currentTime}`, type: "flavor" },
    {
      text: `Curfew: You promised Atticus you'd be back by ${deadlineTime}`,
      type: "flavor",
    },
    { text: `Time Remaining: ${timeRemaining} minutes`, type: "flavor" },
    { text: "", type: "flavor" },
    { text: "How Timing Works:", type: "flavor" },
    { text: "• Most commands use 1 minute of time", type: "flavor" },
    { text: "• HELP, LOOK, INVENTORY are free (0 min)", type: "flavor" },
    { text: "• EATING treats gives you back 2 minutes!", type: "flavor" },
    { text: "• You can only eat 5 treats before moving", type: "flavor" },
    { text: "", type: "flavor" },
    { text: "Your Progress:", type: "flavor" },
    { text: `• Scavenger items: ${scavengerCount} / 9`, type: "flavor" },
    { text: `• Treats collected: ${treatsCount}`, type: "flavor" },
  ]);

  // Show current room after score info
  addToBuffer([{ text: "", type: "flavor" }]); // Blank line
  lookAtRoom();
}

// Handle ORANGE theme command - switches to orange borders and white prompt
function handleOrangeCommand() {
  // Get all elements that need border color changes
  const header = document.querySelector(".header");
  const text = document.querySelector(".text");
  const prompt = document.querySelector(".prompt");
  const scavenger = document.querySelector(".scavenger");
  const status = document.querySelector(".status");

  // Get celebration grid if it exists
  const celebrationGrid = document.querySelector(".celebration-grid");

  // Change borders to orange
  const orangeBorder = "2px solid #ff9500";
  if (header) header.style.border = orangeBorder;
  if (text) text.style.border = orangeBorder;
  if (prompt) prompt.style.border = orangeBorder;
  if (scavenger) scavenger.style.border = orangeBorder;
  if (status) status.style.border = orangeBorder;
  if (celebrationGrid) celebrationGrid.style.border = orangeBorder;

  // Change curfew box border to orange
  const curfewBoxes = document.querySelectorAll(".time-box.curfew");
  curfewBoxes.forEach((box) => {
    if (!box.classList.contains("curfew-late")) {
      box.style.borderColor = "#ff9500";
    }
  });

  // Change prompt text to white
  if (prompt) prompt.style.color = "white";
  const promptSymbol = document.querySelector(".prompt-symbol");
  if (promptSymbol) promptSymbol.style.color = "white";
  const commandInput = document.querySelector(".command-input");
  if (commandInput) commandInput.style.color = "white";

  // Update CSS for prompt-echo text (for future text display)
  const style = document.createElement("style");
  style.id = "theme-orange-style";
  style.textContent = ".prompt-echo { color: white !important; }";
  // Remove old theme style if exists
  const oldStyle = document.getElementById("theme-orange-style");
  if (oldStyle) oldStyle.remove();
  const oldWhiteStyle = document.getElementById("theme-white-style");
  if (oldWhiteStyle) oldWhiteStyle.remove();
  document.head.appendChild(style);

  addToBuffer([
    {
      text: "Theme changed to ORANGE (orange borders, white prompt).",
      type: "flavor",
    },
  ]);

  // Show room description
  addToBuffer([{ text: "", type: "flavor" }]); // Blank line
  lookAtRoom();
}

// Handle WHITE theme command - switches to white borders and yellow prompt
function handleWhiteCommand() {
  // Get all elements that need border color changes
  const header = document.querySelector(".header");
  const text = document.querySelector(".text");
  const prompt = document.querySelector(".prompt");
  const scavenger = document.querySelector(".scavenger");
  const status = document.querySelector(".status");

  // Get celebration grid if it exists
  const celebrationGrid = document.querySelector(".celebration-grid");

  // Change borders to white
  const whiteBorder = "2px solid white";
  if (header) header.style.border = whiteBorder;
  if (text) text.style.border = whiteBorder;
  if (prompt) prompt.style.border = whiteBorder;
  if (scavenger) scavenger.style.border = whiteBorder;
  if (status) status.style.border = whiteBorder;
  if (celebrationGrid) celebrationGrid.style.border = whiteBorder;

  // Change curfew box border to white
  const curfewBoxes = document.querySelectorAll(".time-box.curfew");
  curfewBoxes.forEach((box) => {
    if (!box.classList.contains("curfew-late")) {
      box.style.borderColor = "white";
    }
  });

  // Change prompt text to yellow-gold
  const yellowGold = "#ffcc00";
  if (prompt) prompt.style.color = yellowGold;
  const promptSymbol = document.querySelector(".prompt-symbol");
  if (promptSymbol) promptSymbol.style.color = yellowGold;
  const commandInput = document.querySelector(".command-input");
  if (commandInput) commandInput.style.color = yellowGold;

  // Update CSS for prompt-echo text (for future text display)
  const style = document.createElement("style");
  style.id = "theme-white-style";
  style.textContent = ".prompt-echo { color: #ffcc00 !important; }";
  // Remove old theme style if exists
  const oldStyle = document.getElementById("theme-white-style");
  if (oldStyle) oldStyle.remove();
  const oldOrangeStyle = document.getElementById("theme-orange-style");
  if (oldOrangeStyle) oldOrangeStyle.remove();
  document.head.appendChild(style);

  addToBuffer([
    {
      text: "Theme changed to WHITE (white borders, yellow prompt).",
      type: "flavor",
    },
  ]);

  // Show room description
  addToBuffer([{ text: "", type: "flavor" }]); // Blank line
  lookAtRoom();
}

// Handle eat command
function handleEatCommand(command) {
  // Check consecutive eat limit FIRST (before any other validation)
  if (consecutiveEatsCounter >= MAX_CONSECUTIVE_EATS) {
    addToBuffer([
      {
        text: "You cannot just gorge yourself on candy! Five is the limit here! Get moving!",
        type: "error",
      },
    ]);
    return; // Exit WITHOUT taking time penalty
  }

  // Extract the item name - get everything after the command, lowercase, strip spaces
  const input = command.toLowerCase().trim();
  const firstSpace = input.indexOf(" ");

  if (firstSpace === -1) {
    addToBuffer([{ text: "Eat what?", type: "error" }]);
    return;
  }

  const remainder = input.substring(firstSpace + 1).trim();
  const targetTypedName = remainder.replace(/\s+/g, ""); // Strip all spaces

  // Find item in inventory with matching typedNames
  const inventoryItems = Object.entries(items).filter(
    ([key, item]) =>
      item.includeInGame &&
      item.location === "INVENTORY" &&
      item.typedNames?.includes(targetTypedName)
  );

  if (inventoryItems.length === 0) {
    addToBuffer([
      { text: `You don't have any "${targetTypedName}".`, type: "error" },
    ]);
    return;
  }

  const [itemKey, item] = inventoryItems[0];

  // Check if item is eatable
  if (!item.eatable) {
    addToBuffer([
      { text: `You can't eat the ${item.display}.`, type: "error" },
    ]);
    return;
  }

  // Check if item has eat action
  if (!item.actions?.eat) {
    addToBuffer([
      { text: `You can't eat the ${item.display}.`, type: "error" },
    ]);
    return;
  }

  // Show response message
  addToBuffer([{ text: item.actions.eat.response, type: "flavor" }]);

  // Remove item from game if specified
  if (item.actions.eat.removeItem) {
    delete items[itemKey];
  }

  // Increment consecutive eat counter
  consecutiveEatsCounter++;

  // Update game time (use item's custom timer if specified, otherwise -2)
  const timeChange =
    item.actions.eat.timer !== undefined ? item.actions.eat.timer : -2;
  updateGameTime(timeChange);

  // Update the status panel to show new inventory
  updateGameStatus();

  // Show room description after eating
  addToBuffer([{ text: "", type: "flavor" }]); // Blank line
  lookAtRoom();

  // Mark command as successful
  lastCommandSucceeded = true;
}

// Handle SAY command - for combinations and passwords
function handleSayCommand(command) {
  // Extract the phrase - get everything after the command
  const input = command.toLowerCase().trim();
  const firstSpace = input.indexOf(" ");

  if (firstSpace === -1) {
    addToBuffer([{ text: "Say what?", type: "error" }]);
    return;
  }

  const phrase = input.substring(firstSpace + 1).trim();
  // Normalize: remove spaces, dashes, and convert to lowercase
  const normalizedPhrase = phrase.replace(/[\s\-]/g, "").toLowerCase();

  // Check if at STUDY with safe combination
  if (currentRoom === "STUDY") {
    const safe = items["safe"];
    const bookmark = items["oldnote"];

    if (safe && !safe.hasBeenOpened && normalizedPhrase === "666") {
      // Check if player has examined the safe first
      if (!safe.hasBeenExamined) {
        addToBuffer([
          {
            text: "You should examine the safe first to see how it works.",
            type: "error",
          },
        ]);
        // Return without setting lastCommandSucceeded = true (no time penalty)
        return;
      }

      // Check if player has the bookmark and has examined it
      if (!bookmark || bookmark.location !== "INVENTORY") {
        addToBuffer([
          {
            text: "You don't know the combination. You'll need to find a clue somewhere. I've heard that Arthur used to keep reminders like that stuffed into books.",
            type: "error",
          },
        ]);
        return;
      }

      if (!bookmark.hasBeenExamined) {
        console.log(
          "DEBUG: Bookmark hasBeenExamined =",
          bookmark.hasBeenExamined
        );
        addToBuffer([
          {
            text: "The safe will not open until you find the clue about the combination. I've heard that Arthur used to keep reminders like that stuffed into books.",
            type: "error",
          },
        ]);
        return;
      }

      // Correct combination! Open the safe
      addToBuffer([
        { text: "You dial the combination: <b>6-6-6</b>", type: "flavor" },
        {
          text: "CLICK! The safe door swings open with a satisfying thunk.",
          type: "flavor",
        },
        {
          text: "Inside you see two <b>Indian Head pennies</b>! c1909. Nice! Those are part of the scavenger hunt! You should probably <b>take</b> those. Oh, and you also notice an old piece of <b>parchment</b>. That looks important! You should <b>take parchment</b> also, so you can then <b>examine parchment</b>.",
          type: "flavor",
        },
      ]);

      // Mark safe as opened
      safe.hasBeenOpened = true;

      // Reveal Indian Head pennies in STUDY
      const indianheadpennies = items["indianheadpennies"];
      if (indianheadpennies) {
        indianheadpennies.location = "STUDY";
        indianheadpennies.visible = true;
      }

      // Reveal password paper in STUDY
      const passwordpaper = items["passwordpaper"];
      if (passwordpaper) {
        passwordpaper.location = "STUDY";
        passwordpaper.visible = true;
      }

      // Show room state
      addToBuffer([{ text: "", type: "flavor" }]);
      lookAtRoom();
      lastCommandSucceeded = true;
      return;
    }
  }

  // Check if at MUSIC-ROOM - music system and secret door
  if (currentRoom === "MUSIC-ROOM") {
    const secretDoor = doors["music-room2game-room"];
    const musicSystem = items["musicsystem"];

    // Check if trying to press buttons before examining the stereo
    if (
      (normalizedPhrase.includes("music") ||
        normalizedPhrase.includes("movie") ||
        normalizedPhrase.includes("theater") ||
        normalizedPhrase.includes("theatre") ||
        normalizedPhrase.includes("game") ||
        normalizedPhrase.includes("gaming")) &&
      musicSystem &&
      !musicSystem.hasBeenExamined
    ) {
      addToBuffer([
        {
          text: `I don't see any '${phrase}' button. Maybe you should <b>examine</b> something?`,
          type: "error",
        },
      ]);
      // Return without setting lastCommandSucceeded = true (no time penalty)
      return;
    }

    // Check for music system sound options
    if (normalizedPhrase.includes("music")) {
      addToBuffer([
        { text: `You say: "${phrase}"`, type: "flavor" },
        {
          text: "The system responds with a soft chime. 'Music mode selected - warm equalization active.'",
          type: "flavor",
        },
      ]);
      // Show room description after SAY
      addToBuffer([{ text: "", type: "flavor" }]); // Blank line
      lookAtRoom();
      lastCommandSucceeded = true;
      return;
    }

    if (
      normalizedPhrase.includes("movie") ||
      normalizedPhrase.includes("theater") ||
      normalizedPhrase.includes("theatre")
    ) {
      addToBuffer([
        { text: `You say: "${phrase}"`, type: "flavor" },
        {
          text: "The system responds with a soft chime. 'Movie mode selected - surround sound optimized.'",
          type: "flavor",
        },
      ]);
      // Show room description after SAY
      addToBuffer([{ text: "", type: "flavor" }]); // Blank line
      lookAtRoom();
      lastCommandSucceeded = true;
      return;
    }

    if (
      normalizedPhrase.includes("game") ||
      normalizedPhrase.includes("gaming")
    ) {
      if (secretDoor && !secretDoor.visible) {
        addToBuffer([
          { text: `You say: "${phrase}"`, type: "flavor" },
          {
            text: "The system responds with a soft chime. 'Gaming mode selected - bass boost active.' <br><br>",
            type: "flavor",
          },
          {
            text: "<b>You also hear a mechanical CLICK from the <b>north</b> wall... looking there you see the wall slide back, revealing a secret door into another room!  But that secret door is still locked! You will need to SAY the password to open it.  I bet Mr. Radley put the password in a safe somewhere?</b>",
            type: "flavor",
          },
        ]);

        // Make door visible but keep it locked
        secretDoor.visible = true;

        // Show room state with new exit
        addToBuffer([{ text: "", type: "flavor" }]);
        lookAtRoom();
        lastCommandSucceeded = true;
        return;
      } else if (secretDoor && secretDoor.visible) {
        addToBuffer([
          { text: `You say: "${phrase}"`, type: "flavor" },
          {
            text: "The system responds with a soft chime. 'Gaming mode already active.'",
            type: "flavor",
          },
        ]);
        // Show room description after SAY
        addToBuffer([{ text: "", type: "flavor" }]); // Blank line
        lookAtRoom();
        lastCommandSucceeded = true;
        return;
      }
    }

    // Check for secret door password
    if (normalizedPhrase.includes("friend")) {
      const passwordPaper = items["passwordpaper"];

      // Check if player has the parchment paper with the password
      if (!passwordPaper || passwordPaper.location !== "INVENTORY") {
        addToBuffer([
          {
            text: "You don't know about any secret door password. Maybe you need to find a clue first?",
            type: "error",
          },
        ]);
        // Return without setting lastCommandSucceeded = true (no time penalty)
        return;
      }

      // Check if player has examined the parchment paper
      if (!passwordPaper.hasBeenExamined) {
        addToBuffer([
          {
            text: "You have the parchment, but you haven't read it yet. Maybe you should <b>examine</b> it?",
            type: "error",
          },
        ]);
        // Return without setting lastCommandSucceeded = true (no time penalty)
        return;
      }

      if (secretDoor && secretDoor.visible && secretDoor.locked) {
        // Door is visible but locked - unlock it
        addToBuffer([
          { text: `You say: "${phrase}"`, type: "flavor" },
          {
            text: "The door rumbles and shakes! It swings open with a loud THUNK, revealing an entryway into the next room!",
            type: "flavor",
          },
        ]);

        // Unlock the door
        secretDoor.locked = false;
        secretDoor.open = true;

        // Show room state
        addToBuffer([{ text: "", type: "flavor" }]);
        lookAtRoom();
        lastCommandSucceeded = true;
        return;
      } else if (secretDoor && !secretDoor.visible) {
        // Door not visible yet
        addToBuffer([
          { text: `You say: "${phrase}"`, type: "flavor" },
          {
            text: "You sense there might be a secret here, but you don't see a door.",
            type: "flavor",
          },
        ]);
        // Show room description after SAY
        addToBuffer([{ text: "", type: "flavor" }]); // Blank line
        lookAtRoom();
        lastCommandSucceeded = true;
        return;
      } else if (secretDoor && secretDoor.visible && !secretDoor.locked) {
        // Door already unlocked
        addToBuffer([
          { text: "The secret door is already open.", type: "flavor" },
        ]);
        // Show room description after SAY
        addToBuffer([{ text: "", type: "flavor" }]); // Blank line
        lookAtRoom();
        lastCommandSucceeded = true;
        return;
      }
    }
  }

  // Default response - invalid SAY command (no time penalty)
  addToBuffer([
    { text: `"${phrase}" doesn't really do anything.`, type: "error" },
  ]);
  // Don't set lastCommandSucceeded = true (no time consumed for invalid SAY commands)
}

// Handle OPEN command - for opening containers and cabinets
function handleOpenCommand(command) {
  // Extract the item name - get everything after the command, lowercase, strip spaces
  const input = command.toLowerCase().trim();
  const firstSpace = input.indexOf(" ");

  if (firstSpace === -1) {
    addToBuffer([{ text: "Open what?", type: "error" }]);
    return;
  }

  const targetName = input.substring(firstSpace + 1).trim();
  const targetTypedName = targetName.replace(/\s+/g, "");

  // Find matching items in room or inventory
  const matchingItems = Object.entries(items).filter(
    ([key, item]) =>
      item.includeInGame &&
      item.typedNames.includes(targetTypedName) &&
      (item.location === currentRoom || item.location === "INVENTORY")
  );

  if (matchingItems.length === 0) {
    addToBuffer([
      {
        text: `You don't see any "${targetName}" here to open.`,
        type: "error",
      },
    ]);
    return;
  }

  const [itemKey, item] = matchingItems[0];

  // Check if item has open action
  if (!item.actions?.open) {
    addToBuffer([
      { text: `You can't open the ${item.display}.`, type: "error" },
    ]);
    return;
  }

  // Special handling for DVD cabinet
  if (itemKey === "dvdcabinet") {
    // Check if examined first
    if (!item.hasBeenExamined) {
      addToBuffer([
        {
          text: "You should <b>examine</b> the cabinet first before trying to open it.",
          type: "error",
        },
      ]);
      // No time penalty - return without setting lastCommandSucceeded
      return;
    }

    if (!item.hasBeenOpened) {
      // First time opening
      addToBuffer([{ text: item.actions.open, type: "flavor" }]);

      // Mark as opened
      item.hasBeenOpened = true;

      // Reveal the DVD
      if (item.revealsItem) {
        const revealedItem = items[item.revealsItem];
        if (revealedItem && revealedItem.location === "HIDDEN") {
          revealedItem.location = currentRoom;
          revealedItem.visible = true;
          updateGameStatus();

          // Show room state with new item
          addToBuffer([{ text: "", type: "flavor" }]);
          lookAtRoom();
        }
      }
    } else {
      // Already opened
      addToBuffer([{ text: "The cabinet is already open.", type: "flavor" }]);
    }
    lastCommandSucceeded = true;
    return;
  }

  // Special handling for safe
  if (itemKey === "safe") {
    if (!item.hasBeenOpened) {
      // Safe is locked - show hint
      addToBuffer([
        {
          text: "The <b>safe</b> requires a combination. Type <b>'SAY ##-##-##'</b> to unlock the safe. You need to find a clue about the combination somewhere in the house; I've heard that books are a good place to secret away reminders like that.",
          type: "flavor",
        },
      ]);
    } else {
      // Safe already opened
      addToBuffer([
        {
          text: "The <b>safe</b> door is open. You can see the items inside.",
          type: "flavor",
        },
      ]);
    }
    lastCommandSucceeded = true;
    return;
  }

  // Generic open handler for other items
  addToBuffer([{ text: item.actions.open, type: "flavor" }]);
  lastCommandSucceeded = true;
}

// Handle QUIT/HOME command - moves player to HOME room
function handleQuitCommand() {
  // Check if awaiting confirmation
  if (!awaitingQuitConfirmation) {
    // First time - show confirmation message
    addToBuffer([
      {
        text: "<span style='color: #ffcc00;'>!*!*!*! HEY! This will take you back to your home and <u>QUIT THE GAME</u>! Type <b>HOME</b> or <b>QUIT</b> again to confirm you want to do this.</span>",
        type: "flavor",
      },
    ]);
    awaitingQuitConfirmation = true;
    return;
  }

  // Confirmed - execute quit
  awaitingQuitConfirmation = false;

  // Move to HOME room
  currentRoom = "HOME";

  // Reset consecutive eat counter when going home
  consecutiveEatsCounter = 0;

  // Update background image for scavenger box
  updateScavengerBackground("HOME");

  // Custom HOME room display with inventory
  const homeRoom = rooms["HOME"];
  if (!homeRoom) {
    addToBuffer([{ text: "ERROR: HOME room not found!", type: "error" }]);
    return;
  }

  // Track visit
  player.core.visitedRooms.push("HOME");

  // Display first part of HOME text
  addToBuffer([
    { text: "", type: "flavor" }, // Blank line before
    { text: homeRoom.enterText.first, type: "flavor" },
  ]);

  // Get inventory items
  const inventoryItems = Object.values(items).filter(
    (item) => item.includeInGame && item.location === "INVENTORY"
  );

  // Separate by type
  const scavengerItems = inventoryItems.filter(
    (item) => item.type === "scavenger"
  );
  const candyItems = inventoryItems.filter((item) => item.type === "candy");

  // Count total scavenger items in game (all 9, regardless of includeInGame status)
  const totalScavenger = Object.values(items).filter(
    (item) => item.type === "scavenger"
  ).length;

  // Always show inventory sections (even if empty)
  addToBuffer([
    { text: "", type: "flavor" }, // Blank line
  ]);

  // Display scavenger items section
  addToBuffer([
    {
      text: `SCAVENGER ITEMS (${scavengerItems.length}/${totalScavenger})`,
      type: "underlined",
    },
  ]);

  if (scavengerItems.length > 0) {
    // Format items in two columns
    const formattedLines = formatScavengerTwoColumns(scavengerItems);
    formattedLines.forEach((line) => {
      addToBuffer([{ text: line, type: "flavor" }]);
    });
  } else {
    // Show message when no scavenger items collected
    addToBuffer([
      { text: "  You did not collect any scavenger items.", type: "flavor" },
    ]);
  }

  // Blank line between sections
  addToBuffer([{ text: "", type: "flavor" }]);

  // Display treats section
  addToBuffer([
    { text: `TREATS (${candyItems.length}/20)`, type: "underlined" },
  ]);

  if (candyItems.length > 0) {
    const candyList = candyItems.map((item) => item.display).join(", ");
    addToBuffer([{ text: `  ${candyList}`, type: "flavor" }]);
  } else {
    // Show message when no treats collected
    addToBuffer([
      { text: "  You did not collect any treats.", type: "flavor" },
    ]);
  }

  // Time-based message based on whether player made the deadline
  const deadlineTotalMins = GAME_DEADLINE.hours * 60 + GAME_DEADLINE.minutes;
  const currentTime = formatTime12Hour();
  const madeDeadline = gameTime.totalMinutes <= deadlineTotalMins;

  if (madeDeadline) {
    const minutesEarly = deadlineTotalMins - gameTime.totalMinutes;
    addToBuffer([
      { text: "", type: "flavor" },
      {
        text: `<span style='color: #ffcc00;'><b>  ***** You made it home at ${currentTime}! *****</b></span><br>`,
        type: "flavor",
      },
    ]);

    // Context-aware message based on scavenger items collected
    if (scavengerItems.length === totalScavenger && scavengerItems.length > 0) {
      // All 9 items + on time
      addToBuffer([
        {
          text: `<span style='color: #ffcc00;'><b>Atticus beams with pride: 'Very well done! You found all nine scavenger hunt items, but I'm even happier that you respected my curfew.  Authur will be impressed that you found all of his treasures! Well done!'</b></span>`,
          type: "flavor",
        },
      ]);
    } else if (scavengerItems.length > 0) {
      // Some items + on time
      addToBuffer([
        {
          text: `<span style='color: #ffcc00;'><b>Atticus looks you over and says: I'm glad you are back on time. Thank you for respecting the curfew. And it looks like you found some of those scavenger hunt items that Arthur put out! Some of those are real treasures!</b></span>`,
          type: "flavor",
        },
      ]);
    } else {
      // 0 items + on time
      addToBuffer([
        {
          text: `<span style='color: #ffcc00;'><b>Atticus smiles: "Right on time! You made it with ${minutesEarly} minute${
            minutesEarly !== 1 ? "s" : ""
          } to spare! It's a shame you didn't find any of those scavenger hunt items that Arthur put out! He will be disappointed."</b></span>`,
          type: "flavor",
        },
      ]);
    }
  } else {
    const minutesLate = gameTime.totalMinutes - deadlineTotalMins;
    addToBuffer([
      { text: "", type: "flavor" },
      {
        text: `<span style='color: #ffcc00;'><b>You made it home at ${currentTime}...<br></b></span>`,
        type: "flavor",
      },
    ]);

    // Context-aware message based on scavenger items collected
    if (scavengerItems.length === totalScavenger && scavengerItems.length > 0) {
      // All 9 items + late
      addToBuffer([
        {
          text: `<span style='color: #ffcc00;'><b>'Atticus looks a bit disappointed: "Arthur will be impressed you found all nine scavenger hunt items. But I was getting worried about the time. We'll discuss your missing the curfew later. I'm glad you are home and safe though.'</b></span>`,
          type: "flavor",
        },
      ]);
    } else if (scavengerItems.length > 0) {
      // Some items + late
      addToBuffer([
        {
          text: `<span style='color: #ffcc00;'><b>Atticus looks concerned: 'I was getting worried about you. I didn't think the scavenger hunt would take that long! We'll talk later. But I am glad you found some of Arthur's treasures.'</b></span>`,
          type: "flavor",
        },
      ]);
    } else {
      // 0 items + late
      addToBuffer([
        {
          text: `<span style='color: #ffcc00;'><b>Atticus frowns: 'I'm disappointed you missed the curfew. You're late and it looks like you didn't participate in the scavenger hunt at all. What were you doing all that time?'</b></span>`,
          type: "flavor",
        },
      ]);
    }
  }

  // Display second part of HOME text
  addToBuffer([
    { text: "", type: "flavor" }, // Blank line
    { text: homeRoom.enterText.second, type: "flavor" },
  ]);

  // Mark command as successful
  lastCommandSucceeded = true;
}

// Handle examine command
function handleExamineCommand(command) {
  // Extract the item name - get everything after the command, lowercase, strip spaces
  const input = command.toLowerCase().trim();
  const firstSpace = input.indexOf(" ");

  if (firstSpace === -1) {
    addToBuffer([{ text: "Examine what?", type: "error" }]);
    return;
  }

  const remainder = input.substring(firstSpace + 1).trim();
  const targetTypedName = remainder.replace(/\s+/g, ""); // Strip all spaces

  // Find item by typedNames in either inventory or current room
  const allItems = Object.entries(items).filter(
    ([key, item]) =>
      item.includeInGame && item.typedNames?.includes(targetTypedName)
  );

  if (allItems.length === 0) {
    addToBuffer([
      { text: `You don't see any "${targetTypedName}" here.`, type: "error" },
    ]);
    return;
  }

  const [itemKey, item] = allItems[0];

  // Special case: examining Mrs. McGillicutty's list enables all scavenger items
  if (itemKey === "mrsmcgillicuttyslist") {
    item.hasBeenExamined = true;
    Object.values(items).forEach((scavItem) => {
      if (scavItem.type === "scavenger") {
        scavItem.includeInGame = true;
      }
    });
  }

  // Check if item has examine action
  if (!item.actions || !item.actions.examine) {
    addToBuffer([
      { text: `You can't examine the ${item.display}.`, type: "error" },
    ]);
    return;
  }

  // Determine examine rules based on whether item can be taken to inventory
  if (item.actions.take && item.actions.take.addToInventory === true) {
    // Item can be taken to inventory - must be in inventory to examine
    if (item.location === "INVENTORY") {
      // Use notes type for notes items, flavor for others
      const textType = item.type === "notes" ? "notes" : "flavor";

      // Add image if available
      if (item.icon150 && item.type !== "scavenger") {
        // Candy items with 150px images
        addToBuffer([
          { text: item.display, type: "flavor" },
          {
            text: `<img src="${item.icon150}" style="display:block; margin:10px 0; max-width:150px;" onload="document.querySelector('.text').scrollTop = document.querySelector('.text').scrollHeight;">`,
            type: "flavor",
          },
          { text: item.actions.examine, type: textType },
        ]);
      } else if (item.icon250x250 && item.type === "scavenger") {
        // Scavenger items with 250px images
        addToBuffer([
          { text: item.display, type: "flavor" },
          {
            text: `<img src="${item.icon250x250}" style="display:block; margin:10px 0; max-width:250px;" onload="document.querySelector('.text').scrollTop = document.querySelector('.text').scrollHeight;">`,
            type: "flavor",
          },
          { text: item.actions.examine, type: textType },
        ]);
      } else {
        addToBuffer([{ text: item.actions.examine, type: textType }]);
      }

      // Mark bookmark as examined (needed for safe combination)
      if (itemKey === "oldnote") {
        item.hasBeenExamined = true;
        console.log("DEBUG: Bookmark examined, hasBeenExamined set to true");
      }

      // Mark password paper as examined (needed for "say friend" command)
      if (itemKey === "passwordpaper") {
        item.hasBeenExamined = true;
      }

      // Check if examining this item reveals a hidden item (first time only)
      if (item.revealsItem && !item.hasBeenSearched) {
        const revealedItem = items[item.revealsItem];
        if (revealedItem && revealedItem.location === "HIDDEN") {
          revealedItem.location = "INVENTORY";
          revealedItem.visible = true;
          item.hasBeenSearched = true;
          updateGameStatus();
        }
      }
    } else {
      addToBuffer([
        {
          text: `You need to <b>take ${item.display}</b> first.  Then you can <b>examine ${item.display}</b> to study it closely.`,
          type: "error",
        },
      ]);
    }
  } else {
    // Item doesn't have take action - can examine if visible in current room OR in inventory
    if (
      (item.location === currentRoom || item.location === "INVENTORY") &&
      item.visible &&
      !item.locked
    ) {
      // Special handling for safe - show different text if opened
      if (itemKey === "safe" && item.hasBeenOpened) {
        addToBuffer([{ text: "The safe door is open.", type: "flavor" }]);
      } else {
        // Use notes type for notes items, flavor for others
        const textType = item.type === "notes" ? "notes" : "flavor";

        // Add image if available
        if (item.icon150 && item.type !== "scavenger") {
          // Candy items with 150px images
          addToBuffer([
            { text: item.display, type: "flavor" },
            {
              text: `<img src="${item.icon150}" style="display:block; margin:10px 0; max-width:150px;" onload="document.querySelector('.text').scrollTop = document.querySelector('.text').scrollHeight;">`,
              type: "flavor",
            },
            { text: item.actions.examine, type: textType },
          ]);
        } else if (item.icon250x250 && item.type === "scavenger") {
          // Scavenger items with 250px images
          addToBuffer([
            { text: item.display, type: "flavor" },
            {
              text: `<img src="${item.icon250x250}" style="display:block; margin:10px 0; max-width:250px;" onload="document.querySelector('.text').scrollTop = document.querySelector('.text').scrollHeight;">`,
              type: "flavor",
            },
            { text: item.actions.examine, type: textType },
          ]);
        } else {
          addToBuffer([{ text: item.actions.examine, type: textType }]);
        }

        // Mark bookmark as examined (needed for safe combination)
        if (itemKey === "oldnote") {
          item.hasBeenExamined = true;
          console.log(
            "DEBUG: Bookmark examined (fixed item path), hasBeenExamined set to true"
          );
        }

        // Mark musicsystem as examined (needed for press commands)
        if (itemKey === "musicsystem") {
          item.hasBeenExamined = true;
        }

        // Mark password paper as examined (needed for "say friend" command)
        if (itemKey === "passwordpaper") {
          item.hasBeenExamined = true;
        }

        // Mark DVD cabinet as examined (needed for open command)
        if (itemKey === "dvdcabinet") {
          item.hasBeenExamined = true;
        }

        // Mark safe as examined (needed for SAY 666 command)
        if (itemKey === "safe") {
          item.hasBeenExamined = true;
        }

        // Check if examining this fixed item reveals a hidden item (first time only)
        // Skip auto-reveal for items with open action (they reveal on OPEN instead)
        if (item.revealsItem && !item.hasBeenSearched && !item.actions?.open) {
          const revealedItem = items[item.revealsItem];
          if (revealedItem && revealedItem.location === "HIDDEN") {
            // For fixed items, reveal in current room (not INVENTORY)
            revealedItem.location = currentRoom;
            revealedItem.visible = true;
            item.hasBeenSearched = true;
            updateGameStatus();
          }
        }
      }
    } else {
      addToBuffer([
        { text: `You don't see any "${targetTypedName}" here.`, type: "error" },
      ]);
      return;
    }
  }

  // Show room description after examining any item
  addToBuffer([{ text: "", type: "flavor" }]); // Blank line
  lookAtRoom();

  // Mark command as successful (only reached if no early return from errors)
  lastCommandSucceeded = true;
}

// Handle use command
function handleUseCommand(command) {
  // Extract the item name - get everything after the command, lowercase, strip spaces
  const input = command.toLowerCase().trim();
  const firstSpace = input.indexOf(" ");

  if (firstSpace === -1) {
    addToBuffer([{ text: "Use what?", type: "error" }]);
    return;
  }

  const remainder = input.substring(firstSpace + 1).trim();
  const targetTypedName = remainder.replace(/\s+/g, ""); // Strip all spaces

  // Find item by typedNames in either inventory or current room
  const allItems = Object.entries(items).filter(
    ([key, item]) =>
      item.includeInGame && item.typedNames?.includes(targetTypedName)
  );

  if (allItems.length === 0) {
    addToBuffer([
      { text: `You don't see any "${targetTypedName}" here.`, type: "error" },
    ]);
    return;
  }

  const [itemKey, item] = allItems[0];

  // Check if item has use action
  if (!item.actions || !item.actions.use) {
    addToBuffer([
      { text: `You can't use the ${item.display}.`, type: "error" },
    ]);
    return;
  }

  // Check if item is in current room or inventory
  if (item.location !== currentRoom && item.location !== "INVENTORY") {
    addToBuffer([
      { text: `You don't see any "${targetTypedName}" here.`, type: "error" },
    ]);
    return;
  }

  // Special handling for doorbell
  if (itemKey === "doorbell") {
    if (item.hasBeenUsed) {
      // Subsequent uses
      addToBuffer([
        { text: "You ring and ring, but no one answers.", type: "flavor" },
      ]);
      // Show room description after USE
      addToBuffer([{ text: "", type: "flavor" }]); // Blank line
      lookAtRoom();
    } else {
      // First use - Mrs. McGillicutty interaction
      addToBuffer([
        { text: item.actions.use.response, type: "flavor" },
        { text: "", type: "flavor" }, // Blank line after speech
      ]);

      // Give the note to player
      if (items.mrsmcgillicuttyslist) {
        items.mrsmcgillicuttyslist.location = "INVENTORY";
      }

      // Turn off the porch light
      if (items.porch_light_nice) {
        items.porch_light_nice.visible = false;
      }

      // Mark doorbell as used
      item.hasBeenUsed = true;

      updateGameStatus();

      // Redisplay current room to show exits and updated items
      lookAtRoom();
    }
    lastCommandSucceeded = true;
  } else if (itemKey === "door_knocker") {
    // Special handling for DOOR GONG
    if (item.hasBeenUsed) {
      // Door is already unlocked
      addToBuffer([{ text: "The door is already unlocked.", type: "flavor" }]);
      // Show room description after USE
      addToBuffer([{ text: "", type: "flavor" }]); // Blank line
      lookAtRoom();
    } else {
      // First use - unlock the door
      addToBuffer([{ text: item.actions.use.response, type: "flavor" }]);

      // Unlock and open the door
      if (doors["front-porch2foyer"]) {
        doors["front-porch2foyer"].locked = false;
        doors["front-porch2foyer"].open = true;
      }

      // Mark DOOR GONG as used
      item.hasBeenUsed = true;

      // Redisplay current room to show the north exit is now available
      lookAtRoom();
    }
    lastCommandSucceeded = true;
  } else if (itemKey === "brass_key") {
    // Special handling for brass key
    if (item.hasBeenUsed) {
      // Door is already unlocked
      addToBuffer([
        { text: "The bedroom door is already unlocked.", type: "flavor" },
      ]);
      // Show room description after USE
      addToBuffer([{ text: "", type: "flavor" }]); // Blank line
      lookAtRoom();
      lastCommandSucceeded = true;
    } else {
      // Check if player is at TV-ROOM (where bedroom door is)
      if (currentRoom !== "TV-ROOM") {
        addToBuffer([
          { text: "There's nothing to unlock here.", type: "error" },
        ]);
        return;
      }

      // Unlock the door
      addToBuffer([{ text: item.actions.use.response, type: "flavor" }]);

      if (doors["bedroom2tv-room"]) {
        doors["bedroom2tv-room"].locked = false;
        doors["bedroom2tv-room"].open = true;
      }

      item.hasBeenUsed = true;
      lookAtRoom();
      lastCommandSucceeded = true;
    }
  } else if (itemKey === "safe") {
    // Special handling for safe
    if (!item.hasBeenOpened) {
      // Safe is locked - show hint
      addToBuffer([
        {
          text: "The <b>safe</b> requires a combination. Type <b>'SAY ##-##-##'</b> to unlock the safe.",
          type: "flavor",
        },
      ]);
    } else {
      // Safe already opened
      addToBuffer([
        {
          text: "The <b>safe</b> door is open. You can see the items inside.",
          type: "flavor",
        },
      ]);
    }
    // Show room description after USE
    addToBuffer([{ text: "", type: "flavor" }]); // Blank line
    lookAtRoom();
    lastCommandSucceeded = true;
  } else {
    // Generic use action for other items
    const response =
      item.actions.use.response || `You use the ${item.display}.`;
    addToBuffer([{ text: response, type: "flavor" }]);
    // Show room description after USE
    addToBuffer([{ text: "", type: "flavor" }]); // Blank line
    lookAtRoom();
    lastCommandSucceeded = true;
  }
}

// Show room description (look command)
function lookAtRoom() {
  const room = rooms[currentRoom];
  if (!room) {
    addToBuffer([{ text: "You can't see anything here.", type: "error" }]);
    return;
  }

  // Special handling for NICE-PORCH based on porch light state
  let lookText;
  if (currentRoom === "NICE-PORCH") {
    if (items.porch_light_nice && items.porch_light_nice.visible === false) {
      // Light is off - gloomy description
      lookText =
        "You are standing on Mrs. McGillicutty's porch. The porch light is now off; the porch is gloomy and sort of scary.";
    } else {
      // Light is on - normal description
      lookText =
        "You are standing on Mrs. McGillicutty's porch. The porch light is on, casting a warm welcoming glow.";
    }
  } else {
    // All other rooms use standard lookText
    lookText =
      room.lookText || room.enterText?.first || `You are in ${room.name}`;
  }

  addToBuffer([{ text: lookText, type: "flavor" }]);

  // Interior rooms list (used for exit formatting and "picked clean" message)
  const interiorRooms = [
    "FOYER",
    "LIBRARY",
    "MUSIC-ROOM",
    "GAME-ROOM",
    "KITCHEN",
    "BEDROOM",
    "STUDY",
    "DINING-ROOM",
    "TV-ROOM",
  ];

  // Show items in room (if any)
  const roomItems = Object.values(items).filter(
    (item) =>
      item.includeInGame && item.location === currentRoom && item.visible
  );

  // Filter for takeable items (items that can be picked up)
  const takeableItems = roomItems.filter(
    (item) => item.actions?.take?.addToInventory === true
  );

  // Show "picked clean" message for interior rooms with no takeable items
  if (interiorRooms.includes(currentRoom) && takeableItems.length === 0) {
    addToBuffer([
      { text: "", type: "flavor" }, // Blank line before message
      {
        text: "You have picked this room clean. Nothing left to take here.",
        type: "flavor",
      },
    ]);
  }

  // Show all visible items (if any)
  if (roomItems.length > 0) {
    addToBuffer([
      { text: "", type: "flavor" }, // Blank line before items
      { text: "You see:", type: "command" },
    ]);
    roomItems.forEach((item) => {
      addToBuffer([{ text: `  ${item.display}`, type: "flavor" }]);
    });
  }

  // Blank line before exits
  addToBuffer([{ text: "", type: "flavor" }]);

  // Show available exits (all visible doors)
  const allExits = Object.keys(room.exits || {});
  const availableExits = allExits.filter((direction) => {
    const exit = room.exits[direction];
    if (!exit || !exit.door) return true; // No door, always available

    const doorData = doors[exit.door];
    if (!doorData) return true; // Door data missing, show it

    // Only show if door is visible
    return doorData.visible;
  });

  if (availableExits.length > 0) {
    // Interior rooms show "SOUTH door, NORTH door" format
    let exitsText;
    if (interiorRooms.includes(currentRoom)) {
      exitsText = availableExits
        .map((dir) => `<b>${dir.toUpperCase()}</b> door`)
        .join(", ");
    } else {
      exitsText = availableExits.map((dir) => `<b>${dir}</b>`).join(", ");
    }
    addToBuffer([{ text: `Exits: ${exitsText}`, type: "command" }]);
  }
}

// Show celebration grid overlay for 9th scavenger item
function showCelebrationGrid() {
  console.log("showCelebrationGrid() - START");

  // Get all scavenger items in inventory
  const scavengerItems = Object.values(items).filter(
    (item) =>
      item.includeInGame &&
      item.type === "scavenger" &&
      item.location === "INVENTORY"
  );

  console.log(`Found ${scavengerItems.length} scavenger items in inventory`);
  console.log(
    "Scavenger items:",
    scavengerItems.map((i) => i.display)
  );

  // Sort by room displaySquare (0-8) to show in grid order
  scavengerItems.sort((a, b) => {
    const roomA = Object.values(rooms).find(
      (r) =>
        Object.keys(rooms).find((key) => rooms[key] === r) ===
        a.originalLocation
    );
    const roomB = Object.values(rooms).find(
      (r) =>
        Object.keys(rooms).find((key) => rooms[key] === r) ===
        b.originalLocation
    );
    const squareA = roomA?.special?.displaySquare ?? 999;
    const squareB = roomB?.special?.displaySquare ?? 999;
    return squareA - squareB;
  });

  const textDiv = document.querySelector(".text");
  console.log("Text div found:", textDiv);

  // Create overlay - position over text div using fixed positioning
  const overlay = document.createElement("div");
  overlay.className = "celebration-overlay";
  overlay.id = "celebration-overlay";
  console.log("Overlay created:", overlay);

  // Get text div position for overlay placement
  const rect = textDiv.getBoundingClientRect();
  overlay.style.position = "fixed";
  overlay.style.top = rect.top + "px";
  overlay.style.left = rect.left + "px";
  overlay.style.width = rect.width + "px";
  overlay.style.height = rect.height + "px";

  // Create grid
  let gridHTML = '<div class="celebration-grid">';
  scavengerItems.forEach((item, index) => {
    gridHTML += `<img src="${item.icon250x250}"
                      alt="${item.display}"
                      style="animation-delay: ${index * 0.15}s">`;
  });
  gridHTML += "</div>";

  console.log("Grid HTML:", gridHTML);

  overlay.innerHTML = gridHTML;
  // Append to body instead of text div
  document.body.appendChild(overlay);

  console.log("Overlay appended to body");
  console.log("Overlay position:", overlay.style.position);
  console.log("Overlay coordinates:", overlay.style.top, overlay.style.left);

  // Add text overlay after 5 seconds
  setTimeout(() => {
    const textOverlay = document.createElement("div");
    textOverlay.className = "celebration-text";
    textOverlay.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">You found<br>ALL NINE <br>SCAVENGER ITEMS!<br><br></div>
      <div style="font-size: 24px;">Arthur and Mr. Radley</div>
      <div style="font-size: 24px;">CONGRATULATE YOU!!</div>
      <div style="font-size: 16px;"><br><br>just hit 'enter' or 'return' to remove this message and continue playing. You can also type <u>HOME</u> if you want to go home! (which quits the game)</div>
    `;
    overlay.appendChild(textOverlay);
    console.log("Celebration text overlay added");
  }, 5000);

  // Set flag to wait for dismissal
  awaitingCelebrationDismiss = true;
  console.log(
    "showCelebrationGrid() - END, awaitingCelebrationDismiss =",
    awaitingCelebrationDismiss
  );
}

// Restore normal display after celebration
function restoreNormalDisplay() {
  const overlay = document.getElementById("celebration-overlay");

  if (overlay) {
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.5s ease-out";
    setTimeout(() => {
      overlay.remove();
    }, 500);
  }
  awaitingCelebrationDismiss = false;
}

// ========================================
// === TEXT BUFFER MANAGEMENT ===
// ========================================

// Initialize the buffer with game text
async function initializeBuffer(processedGameData) {
  // Use gameData.startup.welcomeText if available, otherwise fallback to loadGameText()
  if (
    processedGameData &&
    processedGameData.startupData &&
    processedGameData.startupData.welcomeText
  ) {
    textBuffer = processedGameData.startupData.welcomeText;
    console.log("Using welcomeText from gameData.json");
  } else if (gameData && gameData.startup && gameData.startup.welcomeText) {
    textBuffer = gameData.startup.welcomeText;
    console.log("Using welcomeText from gameData.json (direct)");
  } else {
    textBuffer = await loadGameText();
    console.log("Fallback to loadGameText()");
  }
  updateDisplay();
}

// Update the text display (now shows all buffer content)
function updateDisplay() {
  const textDiv = document.querySelector(".text");

  // Convert buffer objects to HTML with appropriate classes
  const htmlLines = textBuffer.map((entry) => {
    if (typeof entry === "string") {
      // Handle legacy string entries
      return `<span class="flavor-text">${entry}</span>`;
    }

    let className;
    switch (entry.type) {
      case "prompt":
        className = "prompt-echo";
        break;
      case "command":
        className = "command-output";
        break;
      case "error":
        className = "error-text";
        break;
      case "underlined":
        className = "underlined-text";
        break;
      case "notes":
        // Special handling for notes - use div instead of span and preserve line breaks
        return `<div class="notes-text">${entry.text}</div>`;
      case "flavor":
      default:
        className = "flavor-text";
        break;
    }

    return `<span class="${className}">${entry.text}</span>`;
  });

  textDiv.innerHTML = htmlLines.join("<br>");

  // Auto-scroll to bottom when new content is added
  textDiv.scrollTop = textDiv.scrollHeight;
}

// Scroll up (PAGE UP) - now uses native scrolling
function scrollUp() {
  const textDiv = document.querySelector(".text");
  const lineHeight = parseInt(getComputedStyle(textDiv).lineHeight);
  textDiv.scrollTop -= lineHeight; // Scroll up 1 line
}

// Scroll down (PAGE DOWN) - now uses native scrolling
function scrollDown() {
  const textDiv = document.querySelector(".text");
  const lineHeight = parseInt(getComputedStyle(textDiv).lineHeight);
  textDiv.scrollTop += lineHeight; // Scroll down 1 line
}

// Add text to buffer (for commands and responses)
function addToBuffer(text, type = "flavor") {
  if (Array.isArray(text)) {
    // Check if array items are already objects with text and type
    if (
      text.length > 0 &&
      typeof text[0] === "object" &&
      text[0].text !== undefined
    ) {
      // Array of properly formatted objects, add directly
      textBuffer.push(...text);
    } else {
      // Array of strings, convert to objects
      const textObjects = text.map((line) => ({
        text: line,
        type: type,
      }));
      textBuffer.push(...textObjects);
    }
  } else if (typeof text === "object" && text.text !== undefined) {
    // Already an object with text and type
    textBuffer.push(text);
  } else {
    // Single string
    textBuffer.push({
      text: text,
      type: type,
    });
  }

  // Update display with new content
  updateDisplay();
}

// Add command echo to buffer
function echoCommand(command) {
  addToBuffer([
    { text: "", type: "flavor" },
    { text: "> " + command, type: "prompt" },
    { text: "", type: "flavor" },
  ]);
}

// ========================================
// === STATUS FUNCTIONS ===
// ========================================

function updateGameStatus() {
  const statusDiv = document.querySelector(".status");

  // Get inventory items from INVENTORY room
  const inventory = Object.values(items).filter(
    (item) => item.includeInGame && item.location === "INVENTORY"
  );

  // Count scavenger items and treats separately
  const scavengerCount = inventory.filter(
    (item) => item.type === "scavenger"
  ).length;
  const treatsCount = inventory.filter((item) => item.type === "candy").length;
  const displayTreatsCount = Math.min(treatsCount, 20);

  // Check if player is past curfew
  const deadlineTotalMinutes = GAME_DEADLINE.hours * 60 + GAME_DEADLINE.minutes;
  const isPastCurfew = gameTime.totalMinutes > deadlineTotalMinutes;
  const minutesLate = gameTime.totalMinutes - deadlineTotalMinutes;
  const isVeryLate = minutesLate > 10; // More than 10 minutes late
  const isSuperLate = minutesLate > 15; // More than 15 minutes late (urgent)

  let curfewClass = "curfew";
  if (isPastCurfew) {
    curfewClass += " curfew-late";
    if (isVeryLate) {
      curfewClass += " curfew-very-late";
    }
    if (isSuperLate) {
      curfewClass += " curfew-super-late";
    }
  }

  // Generate side-by-side time boxes and item counts
  let statsHTML = `
    <div class="time-display-container">
      <div class="time-box">
        <div class="time-label">Time</div>
        <div class="time-value">${formatTime12Hour()}</div>
      </div>
      <div class="time-box ${curfewClass}">
        <div class="time-label">Curfew</div>
        <div class="time-value">${formatCurfewTime()}</div>
      </div>
    </div>
  `;
  statsHTML += `<div class="time-items">`;
  statsHTML += `<div>Scavenger: ${scavengerCount}/9  Treats: ${displayTreatsCount}/20</div>`;
  statsHTML += `</div>`;

  // Commands section with 3-column alignment
  const commandsTitle = uiConfig?.statusPanel?.commands?.title || "COMMANDS";
  const commandsHTML = `<div class="command-grid">
  <div>(h)elp</div>
  <div>(l)ook</div>
  <div>(i)nventory</div>
  <div>(t)ake ?</div>
  <div>(d)rop ?</div>
  <div>e(x)amine ?</div>
  <div>(u)se ?</div>
  <div>eat ?</div>
  <div>say ?</div>
</div>`;

  // ASCII compass
  const compassHTML = `<div class="compass">             (n)orth
                |
      (w)est ------ (e)ast
                |
score        (s)outh        HOME</div>`;

  statusDiv.innerHTML = `
    ${statsHTML}

    <div class="status-section">
      <div class="status-title">${commandsTitle}</div>
      ${commandsHTML}
      ${compassHTML}
    </div>
  `;
}

// Initialize scavenger grid display
function initScavengerGrid() {
  updateScavengerGrid();
}

// Update scavenger grid based on found items
function updateScavengerGrid() {
  const scavengerDiv = document.querySelector(".scavenger");

  // Create 9 squares for the 3x3 grid
  let gridHTML = "";

  for (let squareIndex = 0; squareIndex < 9; squareIndex++) {
    // Find room with this displaySquare number
    const room = Object.values(rooms).find(
      (r) => r.special?.displaySquare === squareIndex
    );

    let imgSrc = ""; // Default image commented out: "assets/scavenger/default90x90.png"
    let isFound = false;

    if (room) {
      const roomName = Object.keys(rooms).find((key) => rooms[key] === room);

      // Find scavenger item that was originally in this room with includeInGame: true
      const item = Object.values(items).find(
        (item) =>
          item.includeInGame &&
          item.isScavengerItem &&
          item.originalLocation === roomName
      );

      // If item found, use its icon
      if (item && item.found) {
        imgSrc = item.icon90x90 || ""; // "assets/scavenger/default90x90.png";
        isFound = true;
      }
    }

    gridHTML += `
      <div class="scavenger-square${isFound ? " found" : ""}">
        ${imgSrc ? `<img src="${imgSrc}" alt="Square ${squareIndex}">` : ""}
      </div>
    `;
  }

  scavengerDiv.innerHTML = gridHTML;
}

// Update scavenger grid background based on current room
function updateScavengerBackground(roomName) {
  const scavengerDiv = document.querySelector(".scavenger");
  if (!scavengerDiv) return;

  const room = rooms[roomName];
  if (!room) return;

  // Get backgroundPic from room's special properties, or use default
  const backgroundPic =
    room.special?.backgroundPic || "assets/scavenger/RadleyHouse250x250.png";

  // Update the background-image style
  scavengerDiv.style.backgroundImage = `url("${backgroundPic}")`;
}

// ========================================
// === COMMAND PROCESSING ===
// ========================================

// Smart command matching function
function findCommand(input) {
  const fullInput = input.toLowerCase().trim();
  const cmd = fullInput.split(/\s+/)[0]; // Extract first word for command matching

  // Check for exact matches first (including full command names)
  if (commands[cmd]) {
    return { type: "exact", command: cmd };
  }

  // Check single-letter shortcuts (priority shortcuts)
  for (const [commandName, commandData] of Object.entries(commands)) {
    if (commandData.shortcuts && commandData.shortcuts.includes(cmd)) {
      return { type: "shortcut", command: commandName };
    }
  }

  // Check prefix matches for longer inputs (2+ characters)
  if (cmd.length >= 2) {
    const matches = Object.keys(commands).filter((commandName) =>
      commandName.startsWith(cmd)
    );

    if (matches.length === 1) {
      return { type: "prefix", command: matches[0] };
    } else if (matches.length > 1) {
      return { type: "ambiguous", matches: matches };
    }
  }

  return { type: "unknown" };
}

// Command processing with smart matching
function processCommand(command) {
  // Strip "go" prefix if present (support "go north", "go take apple", etc.)
  const words = command.trim().split(/\s+/);
  if (words.length > 1 && words[0].toLowerCase() === "go") {
    command = words.slice(1).join(" ");
  }

  // Reset quit confirmation flag for any non-quit command
  const firstWord = command.trim().split(/\s+/)[0];
  const lowerFirst = firstWord.toLowerCase();
  if (lowerFirst !== "quit" && lowerFirst !== "home") {
    awaitingQuitConfirmation = false;
  }

  // Check for QUIT/HOME uppercase requirement

  if (
    (lowerFirst === "quit" || lowerFirst === "home") &&
    firstWord !== firstWord.toUpperCase()
  ) {
    addToBuffer([
      { text: "QUIT and HOME must be typed in uppercase.", type: "error" },
    ]);
    return false;
  }

  const result = findCommand(command);
  let isValid = false;

  switch (result.type) {
    case "exact":
    case "shortcut":
    case "prefix":
      const cmd = commands[result.command];

      // Reset command success flag (will be set to true if command succeeds)
      lastCommandSucceeded = false;

      // Handle different command actions
      switch (cmd.action) {
        case "move_north":
          movePlayer("north");
          break;
        case "move_south":
          movePlayer("south");
          break;
        case "move_east":
          movePlayer("east");
          break;
        case "move_west":
          movePlayer("west");
          break;
        case "examine_room":
          lookAtRoom();
          lastCommandSucceeded = true;
          break;
        case "show_inventory":
          showInventory();
          lastCommandSucceeded = true;
          break;
        case "show_help":
          showHelp();
          lastCommandSucceeded = true;
          break;
        case "take_item":
          handleTakeCommand(command);
          break;
        case "examine_item":
          handleExamineCommand(command);
          break;
        case "drop_item":
          handleDropCommand(command);
          break;
        case "quit_game":
          handleQuitCommand();
          break;
        case "use_item":
          handleUseCommand(command);
          break;
        case "eat_item":
          handleEatCommand(command);
          break;
        case "say_phrase":
          handleSayCommand(command);
          break;
        case "open_item":
          handleOpenCommand(command);
          break;
        case "throw_item":
          handleThrowCommand(command);
          break;
        case "debug_scavenger":
          handleDebugCommand();
          lastCommandSucceeded = true;
          break;
        case "celebrate_again":
          handleCelebrateCommand();
          lastCommandSucceeded = true;
          break;
        case "show_secrets":
          handleHintCommand();
          lastCommandSucceeded = true;
          break;
        case "restart_game":
          location.reload();
          lastCommandSucceeded = true;
          break;
        case "show_about":
          handleAboutCommand();
          lastCommandSucceeded = true;
          break;
        case "show_score":
          handleScoreCommand();
          lastCommandSucceeded = true;
          break;
        case "theme_orange":
          handleOrangeCommand();
          lastCommandSucceeded = true;
          break;
        case "theme_white":
          handleWhiteCommand();
          lastCommandSucceeded = true;
          break;
        default:
          addToBuffer([
            { text: `Unknown action: ${cmd.action}`, type: "error" },
          ]);
      }

      // Update game time based on command's timer property
      // (Note: EAT command handles timer specially due to consecutive eat limit)
      // Only apply time if command succeeded
      if (
        cmd.timer !== undefined &&
        cmd.action !== "eat_item" &&
        lastCommandSucceeded
      ) {
        updateGameTime(cmd.timer);
      }

      isValid = true;
      break;

    case "ambiguous":
      addToBuffer([
        { text: `Did you mean: ${result.matches.join(", ")}?`, type: "error" },
      ]);
      isValid = false;
      break;

    case "unknown":
    default:
      addToBuffer([
        {
          text: "I don't understand that command. Type HELP for",
          type: "error",
        },
        { text: "a list of available commands.", type: "error" },
      ]);
      isValid = false;
      break;
  }

  return isValid;
}

// ========================================
// === COMMAND HISTORY MANAGEMENT ===
// ========================================

// Navigate command history
function navigateHistory(direction, input) {
  if (commandHistory.length === 0) return;

  if (direction === "up") {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[commandHistory.length - 1 - historyIndex];
    }
  } else if (direction === "down") {
    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[commandHistory.length - 1 - historyIndex];
    } else if (historyIndex === 0) {
      historyIndex = -1;
      input.value = "";
    }
  }
}

// Add command to history (with intelligent filtering)
function addToHistory(command, wasValid) {
  // Don't add invalid commands to history
  if (!wasValid) return;

  const lastCommand = commandHistory[commandHistory.length - 1];
  const normalizedCommand = command.toLowerCase().trim();
  const normalizedLast = lastCommand ? lastCommand.toLowerCase().trim() : "";

  // Check if this is a duplicate stateless command
  if (lastCommand && normalizedCommand === normalizedLast) {
    // Find the actual command name to check if it's stateless
    const result = findCommand(command);
    let actualCommand = "";

    if (result.type === "exact") {
      actualCommand = result.command;
    } else if (result.type === "shortcut" || result.type === "prefix") {
      actualCommand = result.command;
    }

    // Check if the command is marked as system type (equivalent to stateless)
    if (
      actualCommand &&
      commands[actualCommand] &&
      commands[actualCommand].type === "system"
    ) {
      return; // Don't add duplicate system command
    }
  }

  commandHistory.push(command);
  historyIndex = -1; // Reset history navigation
}

// ========================================
// === INPUT HANDLING ===
// ========================================

// Handle input from the command line
function handleInput(event) {
  const input = event.target;

  if (event.key === "Enter") {
    // Check if we're waiting for celebration dismissal
    if (awaitingCelebrationDismiss) {
      restoreNormalDisplay();
      input.value = "";
      return;
    }

    const command = input.value.trim();

    if (command) {
      // Reset empty Enter flag when actual command is entered
      lastWasEmptyEnter = false;

      // Echo the command to the text buffer
      echoCommand(command);

      // Process the command and get validity
      const wasValid = processCommand(command);

      // Add to history buffer only if valid and not duplicate stateless
      addToHistory(command, wasValid);

      // Clear the input
      input.value = "";
    } else {
      // Handle empty Enter press - show helpful reminder and execute LOOK
      // Only show hint if last action wasn't also an empty Enter (prevent spam)
      if (!lastWasEmptyEnter) {
        addToBuffer([{ text: "", type: "flavor" }]);
        addToBuffer([
          {
            text: "<span style='color: #ffcc00;'>I'll remind you of where you are now - but... btw... you can always use the scroll bar to scroll back in your game to see what happened earlier!</span>",
            type: "flavor",
          },
        ]);
        addToBuffer([{ text: "", type: "flavor" }]);
        lookAtRoom();
        lastWasEmptyEnter = true; // Set flag to prevent repeated hints
      }
      // Clear input regardless
      input.value = "";
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    navigateHistory("up", input);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    navigateHistory("down", input);
  }
}

// ========================================
// === INITIALIZATION FUNCTIONS ===
// ========================================

// Initialize status information display
function initializeStatusInfo() {
  updateGameStatus();
}

// Initialize input system
function initializeInput() {
  const commandInput = document.getElementById("commandInput");
  commandInput.addEventListener("keydown", handleInput);

  // Focus the input field
  commandInput.focus();
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", async function () {
  console.log(
    `Starting game initialization with CONFIG_LOCATION: ${CONFIG_LOCATION}`
  );

  try {
    // Load all configuration files first
    console.log("Loading configuration files...");
    gameData = await loadGameData();
    uiConfig = await loadUIConfig();

    // Load commands from separate commands.json file
    const commandsData = await loadCommands();
    commands = commandsData.commands || {};

    // Load game world data
    const roomsData = await loadRoomsAndDoors();
    rooms = roomsData.rooms || {};
    doors = roomsData.doors || {};

    const itemsData = await loadItems();
    items = itemsData.items || {};

    // Load and merge scavenger items
    const scavengerData = await loadScavengerItems();
    const scavengerItems = scavengerData.scavengerItems || {};

    // Mark scavenger items for scoring purposes and save original location
    Object.values(scavengerItems).forEach((item) => {
      item.isScavengerItem = true;
      // Only set originalLocation if not already defined (for items starting HIDDEN)
      if (!item.originalLocation) {
        item.originalLocation = item.location; // Save original location for grid display
      }
    });

    // Merge scavenger items into main items object
    items = { ...items, ...scavengerItems };
    console.log(
      `Merged ${
        Object.keys(scavengerItems).length
      } scavenger items into main items list`
    );

    // Set starting room from gameData
    currentRoom = gameData.startup?.room || "STREET-01";

    // Note: player data built from gameData, but check for existing save
    const savedPlayer = await loadPlayer();
    gameState = await loadGameState();
    keyboardShortcuts = await loadKeyboardShortcuts();

    // Process gameData to get active items and commands
    const processedGameData = processGameData(gameData);

    // Create runtime player data from gameData.startup.playerStats and items
    const runtimePlayerData = {
      core: {
        score: gameData.startup?.playerStats?.score || 0,
        health: gameData.startup?.playerStats?.health || 100,
        inventory: processedGameData.playerInventory,
        currentRoom: gameData.startup?.playerStats?.currentRoom || "STREET-01",
        visitedRooms: gameData.startup?.playerStats?.visitedRooms || [],
      },
      gameStats: {
        treats: gameData.startup?.playerStats?.treats || {
          current: 0,
          max: 40,
        },
        houses: gameData.startup?.playerStats?.houses || {
          current: 0,
          max: 12,
        },
      },
    };

    // Use runtime data if player.json is empty (new game) or use saved data (continue game)
    if (Object.keys(savedPlayer).length === 0) {
      player = runtimePlayerData;
      console.log(
        "New game: Built player data from gameData.startup:",
        processedGameData.playerInventory
      );
    } else {
      player = savedPlayer;
      console.log("Continue game: Using saved player data");
    }

    // Validate critical configurations
    const configsValid = checkCriticalConfigs();

    if (!configsValid) {
      console.error(
        "Critical configuration validation failed - game cannot start"
      );
      // Initialize buffer to show error messages, but disable input
      await initializeBuffer();

      // Disable the input field
      const commandInput = document.getElementById("commandInput");
      if (commandInput) {
        commandInput.disabled = true;
        commandInput.placeholder = "Input disabled due to configuration errors";
      }
      return; // Exit early - do not continue initialization
    }

    console.log("Initializing game systems...");

    // Initialize game time to start time
    gameTime.hours = GAME_START_TIME.hours;
    gameTime.minutes = GAME_START_TIME.minutes;
    gameTime.totalMinutes =
      GAME_START_TIME.hours * 60 + GAME_START_TIME.minutes;

    await initializeBuffer(processedGameData);
    initializeStatusInfo();
    initScavengerGrid();
    updateScavengerBackground(currentRoom);
    initializeInput();

    // Show starting room after welcome text
    addToBuffer([{ text: "", type: "flavor" }]);
    displayRoom(currentRoom);

    console.log("Game initialization completed successfully");

    // Show the game container with fade-in effect
    document.querySelector(".container").classList.add("ready");

    // Add keyboard event listener using config-based shortcuts
    document.addEventListener("keydown", async function (e) {
      // Handle navigation shortcuts
      const navShortcuts = keyboardShortcuts?.navigation || [];
      for (const shortcut of navShortcuts) {
        if (e.key === shortcut.key) {
          if (shortcut.preventDefault) e.preventDefault();
          if (shortcut.action === "scrollUp") scrollUp();
          else if (shortcut.action === "scrollDown") scrollDown();
          return;
        }
      }
    });
  } catch (error) {
    console.error("Fatal error during game initialization:", error);

    // Try to show error in game if possible
    if (typeof addToBuffer !== "undefined") {
      addToBuffer([
        { text: "FATAL INITIALIZATION ERROR", type: "error" },
        { text: `Error: ${error.message}`, type: "error" },
        { text: "The game could not start properly.", type: "error" },
        {
          text: "Please check the console for detailed error information.",
          type: "error",
        },
      ]);
    }

    // Disable input
    const commandInput = document.getElementById("commandInput");
    if (commandInput) {
      commandInput.disabled = true;
      commandInput.placeholder = "Input disabled due to fatal error";
    }
  }
});
