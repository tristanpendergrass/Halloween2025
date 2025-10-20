# Text Adventure Game - Project Specifications

# Updated: 2025-09-14-1700 - Ready for Engine Development

## Project Overview

A browser-based text adventure game in the style of 1970s/1980s Zork-style games.
Theme: Halloween Edition - "An exciting game of Trick or Treating and Suspense!"

**Current Status:** Data architecture complete, ready for game engine development.

## PERFECT FOUNDATION ACHIEVED - Data Architecture Complete

### ✅ Optimal File Organization (Finalized)
**Clean separation of concerns across 4 focused files:**
- **gameData.json** (35 lines) - Game metadata, startup config, player stats
- **commands.json** (30 lines) - Global commands available everywhere
- **items.json** (71 lines) - All items with room-specific actions
- **rooms-w-doors.json** (350 lines) - Complete navigation, doors, puzzles

### ✅ Single Source Principle (Achieved)
- **No data duplication** - Each element exists in exactly one place
- **Clear ownership** - Know exactly where to find/change anything
- **Perfect DRY implementation** - No synchronization issues
- **Maintainable architecture** - Independent editing of different concerns

## Technical Specifications

### Layout (Unchanged)
- Fixed window size: 950x720 pixels
- 5-section grid layout with 2px white borders and 10px gutters:
  1. **HEADER** - Full width (930px), 120px height, centered text
  2. **TEXT** - Left column (607px), main content area
  3. **ASCIIART** - Right column (313px), 280px height, ASCII art display
  4. **PROMPT** - Left column (607px), 40px height, command input area
  5. **STATUS** - Right column (313px), remaining height - Status, Inventory, Commands

### ASCIIART Section (Fully Integrated)
- **Advanced ASCII Art Display System:**
  - Fixed grid: 60 characters wide × 32 rows tall (1,920 total characters)
  - Technical specs: 8px "Courier New" monospace font, line-height: 1
  - Fixed height: 280px (no scrolling required)
  - Content area: 289px width (optimized for 950px layout)
  - Character-addressable grid system with 8 animation effects
  - **Comment Support**: JavaScript-style comments (`//` and `/* */`) in ASCII art files

## Data Architecture (OPTIMIZED)

### File Structure Summary
```
gameData.json       - Game config, player stats, startup
commands.json       - Global commands (help, look, n/s/e/w)
items.json          - Items with actions (ring, eat, examine)
rooms-w-doors.json  - Navigation, doors, puzzles
```

### gameData.json Structure
```json
{
  "meta": {
    "gameName": "Halloween Text Adventure",
    "version": "0.2.0",
    "author": "Poppy/John"
  },
  "startup": {
    "room": "STREET-01",
    "asciiArt": {...},
    "welcomeText": [...],
    "playerStats": {
      "score": 0,
      "health": 100,
      "currentRoom": "STREET-01",
      "visitedRooms": [],
      "treats": {"current": 0, "max": 40},
      "houses": {"current": 0, "max": 12}
    }
  }
}
```

### commands.json Structure
```json
{
  "commands": {
    "help": {
      "type": "system",
      "shortcuts": ["h", "?"],
      "action": "show_help"
    },
    "north": {
      "type": "movement",
      "shortcuts": ["n"],
      "action": "move_north"
    }
  }
}
```

### items.json Structure
```json
{
  "items": {
    "doorbell": {
      "display": "doorbell",
      "description": "A brass doorbell button",
      "startLocation": "NICE-PORCH",
      "actions": {
        "ring": {"response": "Ding-dong!"},
        "examine": "A brass doorbell button."
      }
    }
  }
}
```

### rooms-w-doors.json Structure
```json
{
  "rooms": {
    "STREET-01": {
      "name": "Street",
      "enterText": {"first": "...", "repeat": "..."},
      "lookText": "You are on the street.",
      "exits": {
        "north": {"to": "NICE-PORCH", "door": "street-012nice-porch"}
      }
    }
  },
  "doors": {
    "front-porch2foyer": {
      "between": ["FRONT-PORCH", "FOYER"],
      "description": "It is a heavy front door.",
      "visible": true,
      "locked": true,
      "open": false,
      "requiresItem": "gold-key"
    }
  },
  "puzzles": {
    "say-friend": {
      "prompt": "An inscription reads: 'Speak, friend, and enter.'",
      "solutions": ["friend"],
      "effects": [
        {"op": "unlock", "door": "music-room2game-room"},
        {"op": "reveal", "door": "music-room2game-room"}
      ]
    }
  }
}
```

## Command System Architecture (DESIGNED)

### Two-Tier Command System
**Global Commands (commands.json)** - Available everywhere
**Item Actions (items.json)** - Available when item is in current room

### Command Processing Flow
```
Single Word:     "look" → Global command (commands.json)
Two Words:       "ring doorbell" → Item action (items.json)
Multiple Words:  "look at doorbell" → Alias → "examine doorbell"
```

### Current Global Commands (7 total)
1. **help** (h, ?) - Show available commands
2. **look** (l) - Examine current room and visible exits
3. **inventory** (i) - Show player inventory
4. **north/south/east/west** (n/s/e/w) - Movement commands

### Current Item Actions (Room-Specific)
- **ring doorbell**, **push doorbell** - Doorbell interactions
- **eat snickers**, **eat whatchamacallit** - Consume candy
- **knock door**, **use door** - Door knocker actions
- **examine [item]** - Inspect any item

### Future Command Expansion (Planned)
**Additional global commands to add later:**
- **get/take** - Pick up items
- **drop** - Drop items from inventory
- **examine** - Universal inspection (move from items to commands)
- **use** - Universal item interaction

## World Architecture (COMPLETE)

### World Map (15 Rooms Total)
- **2 Street locations**: STREET-01 (start), STREET-02
- **2 Nice House areas**: NICE-PORCH, NICE-HOUSE (Mrs. McGillicutty)
- **10 Radley House rooms**: FRONT-PORCH, FOYER, LIBRARY, DINING-ROOM, STUDY, MUSIC-ROOM, GAME-ROOM, KITCHEN, BEDROOM, TV-ROOM
- **1 End location**: HOME (game completion)

### Room Structure (Consistent)
```json
{
  "ROOM-ID": {
    "name": "Display Name",
    "enterText": {
      "first": "Detailed text when first entering",
      "repeat": "Shorter text on return visits"
    },
    "lookText": "Description when typing LOOK",
    "exits": {
      "north": {"to": "CONNECTED-ROOM-ID", "door": "door-id"}
    },
    "special": {
      "starting-location": true  // Only for STREET-01
    }
  }
}
```

### Door System (SIMPLIFIED)
**Essential fields only:**
- `between` - Connecting rooms
- `description` - Door description
- `visible` - Can player see it?
- `locked` - Can player pass through?
- `open` - Door open/closed state
- `requiresItem` - Item needed to unlock (optional)
- `requiresPuzzle` - Puzzle needed to unlock (optional)

## NEXT PRIORITY: Game Engine Development

### Phase 1: Basic Movement Engine (IMMEDIATE)

**Goal:** Create minimal playable version that allows navigation through all 15 rooms.

#### Essential Engine Functions
```javascript
// Core engine requirements
function loadGameData() {
  // Load all 4 JSON files
  // Initialize game state with startup values
  // Return loaded data objects
}

function initializeGame() {
  // Set starting room from gameData.json
  // Initialize player stats
  // Display welcome text
  // Show starting room description
}

function parseCommand(input) {
  // Split input into words
  // Route single words to global commands
  // Route two words to item actions
  // Handle aliases and multi-word patterns
}

function movePlayer(direction) {
  // Get current room exits
  // Find door for direction
  // Move if possible (ignore locks in Phase 1)
  // Display appropriate enterText (first/repeat)
  // Update currentRoom and visitedRooms
}

function displayRoom() {
  // Show lookText from current room
  // List visible exits
  // Show items in room based on startLocation
}

function processGlobalCommand(command) {
  // Handle help, look, inventory, movement
  // Return appropriate response text
}
```

#### Phase 1 Success Criteria
- Player can navigate all 15 rooms using n/s/e/w commands
- Room descriptions display correctly
- First/repeat enterText logic works
- Help command shows available commands
- Look command shows room and exits
- Basic error handling for invalid directions

#### Phase 1 Implementation Notes
```html
<!-- Minimal HTML structure -->
<div id="game-container">
  <div id="game-output"></div>
  <input id="command-input" type="text" placeholder="Enter command...">
</div>
```

```javascript
// Essential game state
let gameState = {
  currentRoom: "STREET-01",
  visitedRooms: [],
  playerStats: {...from gameData.json...}
};

// Essential data containers
let rooms, doors, commands, items;
```

### Phase 2: Door Mechanics (NEXT)
After basic movement works, add:
- Door visibility checks
- Door lock validation
- Door state messages
- Puzzle system integration

### Phase 3: Full Game Features (FUTURE)
After door mechanics work, add:
- Item pickup/drop mechanics
- NPC interactions
- Inventory management
- Save/load system
- Complete item action system

## Engine Integration Points

### Data Loading Flow
```
Game Start → Load 4 JSON files → Initialize game state → Display welcome → Show starting room
```

### Command Processing Flow
```
User Input → Parse command → Check global commands → Check item actions → Execute → Update display
```

### Movement Processing Flow
```
Movement command → Get room exits → Find door → Check door state → Move or block → Display result
```

### State Management
- **currentRoom** - Track player location
- **visitedRooms** - Array for first/repeat logic
- **playerStats** - Health, score, inventory
- **doorStates** - Track door changes from puzzles

## Success Criteria for Engine Implementation

### Movement System Success
- Navigation works through all 15 connected rooms
- Room descriptions show correctly
- Exit listing shows only valid directions
- First visit vs repeat visit text works
- Movement commands accept both full words and shortcuts (n/s/e/w)

### Command System Success
- Help shows all available commands
- Look examines current room properly
- Parser handles both single and two-word commands
- Error messages are clear and helpful
- Command shortcuts work correctly

### Integration Success
- All 4 JSON files load without errors
- Game state persists during session
- Room navigation matches door definitions
- Items appear in correct starting locations
- ASCII art updates based on rooms/events

This specification provides the roadmap for building a complete text adventure game engine with professional-grade architecture, starting with basic movement and expanding to full functionality.