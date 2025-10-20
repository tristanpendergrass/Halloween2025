# Text Adventure Game - Project Specifications

# Updated: 2025-09-12 - Startup-Driven Architecture

## Project Overview

A browser-based text adventure game in the style of 1970s/1980s Zork-style games.
Theme: Halloween Edition - "An exciting game of Trick or Treating and Suspense!"

**Current Layout:** Optimized 950×720px format for compact display while maintaining full functionality.

## Current Architecture Status (September 12, 2025)

### ✅ FOUNDATION COMPLETE - Ready for Game Engine

All core systems implemented and tested:

- Complete error handling with fallbacks
- Clean command structure (7 commands)
- Full world map (15 rooms)
- Data-driven configuration system

### 🔧 NEXT PHASE - Startup-Driven Game Engine

Moving from configuration-driven to gameplay-driven architecture.

## Technical Specifications

### Layout

- Fixed window size: 950x720 pixels
- 5-section grid layout with 2px white borders and 10px gutters:
  1. **HEADER** - Full width (930px), 120px height, centered text
  2. **TEXT** - Left column (607px), main content area
  3. **ASCIIART** - Right column (313px), 280px height, ASCII art display
  4. **PROMPT** - Left column (607px), 40px height, command input area
  5. **STATUS** - Right column (313px), remaining height - **NEW ORDER**: Status, Inventory, Commands

### ASCIIART Section

- **Advanced ASCII Art Display System (FULLY INTEGRATED):**
  - Fixed grid: 60 characters wide × 32 rows tall (1,920 total characters)
  - Technical specs: 8px "Courier New" monospace font, line-height: 1
  - Fixed height: 280px (no scrolling required)
  - Content area: 289px width (optimized for 950px layout)
  - Character-addressable grid system with 8 animation effects
  - **Comment Support**: JavaScript-style comments (`//` and `/* */`) in ASCII art files

## NEW ARCHITECTURE: Startup-Driven System

### Architecture Goals

1. **Startup-based initialization** - New games start from startup.json
2. **Runtime state management** - player.json and gameState.json as containers
3. **Clean separation** - Startup data vs. runtime data vs. configuration
4. **Game engine processing** - Commands trigger game actions, not static responses

### Data Flow Architecture

```
NEW GAME:
startup.json → Initialize player.json + gameState.json → Start game

RUNTIME:
User Input → Command Parser → Game Engine → Update State → Display Response

ROOM SYSTEM:
Movement → rooms.json lookup → Update current room → Display text

LOOK SYSTEM:
Look command → Room description + Dynamic exits + Items/NPCs
```

### File Architecture (NEW)

#### **Configuration Files** (Static game setup)

- `asciiArtConfig.json` - ASCII art display settings (grid, animation, defaults)
- `uiConfig.json` - UI text and labels
- `commands.json` - Command definitions (7 commands with actions)
- `keyboardShortcuts.json` - Keyboard shortcuts
- `rooms.json` - Complete world map (15 rooms)
- `asciiArt.txt` - ASCII art library

#### **Startup Files** (New game initialization)

- `startup.json` - **NEW** Starting configuration for new games

#### **Runtime Files** (Dynamic game state)

- `player.json` - Current player data (gets populated from startup.json)
- `gameState.json` - Current world state (gets populated from startup.json)

## Command System Architecture

### Command Structure (IMPLEMENTED)

```json
{
  "command_name": {
    "type": "system|action|movement",
    "shortcuts": ["array", "of", "aliases"],
    "action": "action_identifier"
  }
}
```

### Seven Essential Commands

1. **help** - type: "system", action: "show_help"
2. **look** - type: "action", action: "examine_room"
3. **inventory** - type: "system", action: "show_inventory"
4. **north** - type: "movement", action: "move_north"
5. **south** - type: "movement", action: "move_south"
6. **east** - type: "movement", action: "move_east"
7. **west** - type: "movement", action: "move_west"

### Game Engine Processing (TO IMPLEMENT)

```javascript
// Command processing flow:
1. Parse user input → find command
2. Identify action from commands.json
3. Process action based on type:
   - system: show_help, show_inventory
   - action: examine_room
   - movement: move_direction
4. Update gameState as needed
5. Display appropriate response
```

## Room System Architecture

### World Map (IMPLEMENTED)

**15 Total Rooms:**

- **2 Street locations**: STREET-01 (start), STREET-02
- **2 Nice House areas**: NICE-PORCH, NICE-HOUSE (Mrs. McGillicutty)
- **10 Radley House rooms**: FRONT-PORCH, FOYER, LIBRARY, DINING-ROOM, STUDY, MUSIC-ROOM, GAME-ROOM, KITCHEN, BEDROOM, TV-ROOM
- **1 End location**: HOME (game completion)

### Room JSON Structure (IMPLEMENTED)

```json
{
  "ROOM-ID": {
    "name": "Display Name",
    "enterText": {
      "first": "Text for first visit",
      "repeat": "Text for return visits"
    },
    "lookText": "Base description for look command",
    "exits": {
      "north": "CONNECTED-ROOM-ID",
      "south": "ANOTHER-ROOM-ID"
    },
    "special": {
      "features": ["array", "of", "items"],
      "npc": "npc_name",
      "secret_door": "hidden_room"
    }
  }
}
```

### Room Navigation System (TO IMPLEMENT)

- **Current room tracking** in gameState.json
- **Visit history** for first/repeat entry text
- **Dynamic exit generation** from rooms.json exits object
- **Look command enhancement** with exits, items, NPCs

## Startup System Design (TO IMPLEMENT)

### startup.json Structure

```json
{
  "game": {
    "title": "Halloween Text Adventure",
    "version": "1.0"
  },
  "player": {
    "startingRoom": "STREET-01",
    "inventory": [],
    "stats": {
      "treats": { "current": 0, "max": 10 },
      "houses": { "current": 0, "max": 25 },
      "score": 0
    }
  },
  "gameState": {
    "currentRoom": "STREET-01",
    "visitedRooms": [],
    "gameFlags": {}
  },
  "ui": {
    "welcomeText": [
      "Welcome to the Halloween Text Adventure!",
      "Type HELP for available commands.",
      ""
    ]
  },
  "commands": {
    "availableAtStart": [
      "help",
      "look",
      "inventory",
      "north",
      "south",
      "east",
      "west"
    ]
  }
}
```

### Initialization Process (TO IMPLEMENT)

1. **Load startup.json** on new game
2. **Populate player.json** with starting player data
3. **Populate gameState.json** with starting world state
4. **Display welcome text** from startup.json
5. **Place player** in starting room
6. **Begin game loop** with available commands

## Game Engine Requirements (TO IMPLEMENT)

### Core Engine Functions Needed

```javascript
// Movement system
function movePlayer(direction) {
  // Check exits in current room
  // Validate movement
  // Update current room in gameState
  // Display entry text (first/repeat)
  // Update visit history
}

// Look system
function examineRoom() {
  // Get current room from gameState
  // Display lookText from rooms.json
  // Generate exit list dynamically
  // Show items/NPCs if present
}

// System commands
function showHelp() {
  // Display available commands
  // Show command shortcuts
}

function showInventory() {
  // Display current inventory from player.json
  // Show item counts/status
}
```

### State Management

- **gameState.json**: currentRoom, visitedRooms, gameFlags
- **player.json**: inventory, stats, progress
- **Persistent state**: Save/load capability for later

## Error Handling Architecture (IMPLEMENTED)

### Comprehensive Error System

- **Centralized error display**: Console + user messages
- **Complete fallbacks**: All 9 config files have defaults
- **Critical validation**: Game won't start with missing essential files
- **Professional logging**: Detailed debug information
- **Graceful degradation**: Game continues with fallbacks when possible

### Config File Classification

**Critical files** (game cannot run without):

- asciiArtConfig.json, uiConfig.json, commands.json

**Non-critical files** (have fallbacks):

- player.json, gameState.json, keyboardShortcuts.json, startGameText.json, asciiArt.txt

## Development Approach

### Incremental Development Strategy

1. **Foundation** ✅ - Error handling, commands, rooms (COMPLETE)
2. **Startup System** 🔧 - startup.json creation and integration
3. **Basic Engine** 🔧 - 7 commands working with rooms
4. **Enhanced Features** 📋 - Items, NPCs, advanced mechanics
5. **Game Content** 📋 - Full Halloween adventure implementation

### Testing Strategy

- **Component testing** - Test each system individually
- **Integration testing** - Ensure systems work together
- **User testing** - Verify game flow and usability
- **Error testing** - Confirm fallbacks work correctly

## Files Structure

### Main Game (950×720px)

- `textAdventure.html` - HTML structure with 5-section layout
- `textAdventure.css` - All styling, layout, colors, responsive design
- `textAdventure.js` - Game engine with comprehensive error handling
- `CONFIG_LOCATION = "HALLOWEEN-GAME"` - Single configuration point

### Configuration Data (HALLOWEEN-GAME/)

- `asciiArtConfig.json` - ASCII art display settings (grid, animations, defaults)
- `uiConfig.json` - UI text and labels
- `commands.json` - 7 clean commands with action definitions
- `keyboardShortcuts.json` - Keyboard shortcuts (Alt+ only)
- `rooms.json` - Complete world map with 15 rooms
- `asciiArt.txt` - ASCII art library with JavaScript-style comment support
- `startup.json` - **NEW** Starting configuration for new games
- `player.json` - Runtime player data (populated from startup.json)
- `gameState.json` - Runtime world state (populated from startup.json)

### Test Environment (/asciiArt-stuff/)

- `testASCII.html/css/js` - 4-box test interface with all 8 animation effects
- Complete ASCII art system with comment-enabled validation/parsing

### Documentation (/claude-john-docs/)

- `specifications-2025-09-12.MD` - This file (current specifications)
- `Claude-ToBeContinued-2025-09-12-1430.md` - Current project status and tasks
- `textAdventure-program-analysis.md` - Complete program analysis

## Next Session Implementation Plan

### IMMEDIATE PRIORITIES

1. **Create startup.json** - New game initialization configuration
2. **Strip runtime files** - Make player.json and gameState.json empty containers
3. **Implement game engine** - Process 7 commands with room system
4. **Test basic gameplay** - Ensure movement and commands work

### SUCCESS CRITERIA

- Player can move between rooms using n/s/e/w
- Look command shows room description and exits
- Help and inventory commands work
- Game state persists properly
- All 15 rooms accessible via proper navigation

## Technical Notes

### Comment System in ASCII Files

- **Single-line comments**: `//` prefix ignores entire line
- **Multi-line comments**: `/* ... */` blocks ignore all content between markers
- **Same-line comments**: `/* comment */` works within single lines
- **Performance**: Minimal overhead, comments efficiently skipped during parsing

### Animation System

- **8 effects available**: Instant, Fade In, Typewriter, V-Sweep, Random, Spiral In/Out, Diagonal
- **3 speed settings**: Slow, Medium, Fast (configurable in asciiArtConfig.json)
- **Batch processing**: Optimized character-by-character updates
- **Grid system**: 32×60 character addressable display

This architecture provides a solid foundation for implementing a full-featured text adventure game with professional error handling, clean separation of concerns, and unlimited expansion potential while maintaining excellent performance and reliability.
