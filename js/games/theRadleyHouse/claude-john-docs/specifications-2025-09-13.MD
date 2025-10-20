# Text Adventure Game - Project Specifications

# Updated: 2025-09-13 - Perfect Single-Source Architecture

## Project Overview

A browser-based text adventure game in the style of 1970s/1980s Zork-style games.
Theme: Halloween Edition - "An exciting game of Trick or Treating and Suspense!"

**Current Layout:** Optimized 950×720px format for compact display while maintaining full functionality.

## Current Architecture Status (September 13, 2025)

### ✅ PERFECT FOUNDATION COMPLETE - Single Source of Truth Achieved

**Ultimate data consolidation accomplished:**

- Single gameData.json file contains ALL game content
- Zero duplication across entire codebase
- includeInGame flags enable instant content management
- Perfect DRY principle implementation

### 🚪 NEXT PHASE - Doors/Connections System + Minimum Game Engine

Moving from perfect data architecture to playable game mechanics.

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

## PERFECT ARCHITECTURE: Single Source of Truth

### Architecture Goals (ACHIEVED)

1. **Single source of truth** - gameData.json contains ALL game content
2. **Zero duplication** - Every element defined exactly once
3. **Flexible management** - includeInGame flags for instant enable/disable
4. **Clean separation** - Configuration vs Runtime data
5. **Theme switching** - Swap games by changing one file

### Data Flow Architecture (CURRENT)

```
NEW GAME:
gameData.json → Filter includeInGame:true → Build inventory → Initialize runtime → Start

GAMEPLAY:
User Input → Command Parser → Game Engine → State Update → Display Response

ROOM NAVIGATION:
Movement Command → Doors/Connections Check → Room Transition → Display Content

SAVE/LOAD:
Runtime State ↔ player.json + gameState.json (auto-created)
```

### File Architecture (PERFECTED)

#### **Single Source File**

- **gameData.json** - THE source of truth for all game content (6KB)
  - Meta information (game name, version, author)
  - Startup configuration (room, ASCII art, welcome text, player stats)
  - Commands (7 core + item-specific commands)
  - Items with startLocation and actions
  - NPCs with startLocation and actions

#### **Navigation & Display Files**

- **rooms.json** - Pure navigation data (name, enterText, lookText, exits)
- **asciiArt.txt** - ASCII art library with comment support
- **asciiArtConfig.json** - Display settings (grid, animations, speeds)
- **uiConfig.json** - UI labels and text
- **keyboardShortcuts.json** - Key bindings

#### **Runtime Files** (Auto-created for saves)

- **player.json** - Current player state (created when saving)
- **gameState.json** - Current world state (created when saving)

#### **Engine**

- **textAdventure.js** - Unified game engine with single-source processing
- **textAdventure.html/css** - Game interface

## Command System Architecture (IMPLEMENTED)

### Perfect Command Structure

```json
{
  "commands": {
    "help": {
      "includeInGame": true,
      "type": "system",
      "shortcuts": ["h", "?"],
      "action": "show_help"
    },
    "examine": {
      "includeInGame": true,
      "pattern": "examine {item}",
      "checksItemAction": true,
      "aliases": ["look at", "inspect"]
    }
  }
}
```

### Seven Core Commands (Implemented)

1. **help** - Show available commands
2. **look** - Examine current room
3. **inventory** - Show player inventory
4. **north/south/east/west** - Movement commands

### Item-Specific Commands (Implemented)

5. **examine {item}** - Look closely at items/NPCs
6. **eat {item}** - Consume items
7. **use {item}** - Use/activate items

## Content Management System (PERFECT)

### Universal includeInGame Flag System

**Every game element has includeInGame property:**

```json
{
  "flashlight": {
    "includeInGame": true,     // Active in game
    "startLocation": "player", // Automatically added to inventory
    "actions": { "examine": "Fresh batteries...", "turn_on": {...} }
  },
  "magic_sword": {
    "includeInGame": false,    // Disabled (not deleted!)
    "startLocation": "MUSIC-ROOM",
    "actions": { "wield": "Power flows through you!" }
  }
}
```

### Smart Location System

**startLocation property automatically places content:**

- `"player"` → Added to starting inventory
- `"ROOM-ID"` → Placed in that room
- Engine builds room contents dynamically from item locations

### Content Processing Flow

```javascript
1. Load gameData.json
2. Filter where includeInGame === true
3. Separate by startLocation:
   - "player" → Starting inventory
   - Room IDs → Room contents
4. Initialize runtime player/gameState from startup data
```

## Room System Architecture (CLEANED)

### World Map (15 Rooms Total)

- **2 Street locations**: STREET-01 (start), STREET-02
- **2 Nice House areas**: NICE-PORCH, NICE-HOUSE (Mrs. McGillicutty)
- **10 Radley House rooms**: FRONT-PORCH, FOYER, LIBRARY, DINING-ROOM, STUDY, MUSIC-ROOM, GAME-ROOM, KITCHEN, BEDROOM, TV-ROOM
- **1 End location**: HOME (game completion)

### Room Structure (Pure Navigation)

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
      "north": "CONNECTED-ROOM-ID",
      "south": "ANOTHER-ROOM-ID"
    },
    "special": {
      "starting_location": true // Only for game mechanics
    }
  }
}
```

### Room Content Population (Dynamic)

- **No hardcoded items/NPCs** in rooms.json
- **Engine populates** rooms from gameData items/NPCs with matching startLocation
- **Look command shows**: Room description + exits + items present + NPCs present

## NEXT PRIORITY: Doors/Connections System

### Current Problem

- **Rooms.json exits** are simple room IDs with no validation
- **No door states**: Can't handle locked doors, keys, puzzles
- **No visibility control**: Can't hide secret passages
- **No extensibility**: Won't work for space station airlocks, teleporters, etc.

### Proposed Connections Architecture

#### Option A: Integrated into gameData.json

```json
{
  "connections": {
    "FOYER_TO_LIBRARY": {
      "from": "FOYER",
      "to": "LIBRARY",
      "direction": "west",
      "barrier": {
        "type": "door",
        "display": "heavy oak door",
        "states": {
          "visible": true,
          "open": false,
          "locked": true
        },
        "requirements": {
          "unlock": { "needsItem": "brass_key" },
          "open": { "needsState": "unlocked" }
        }
      }
    },
    "MUSIC-ROOM_SECRET": {
      "from": "MUSIC-ROOM",
      "to": "GAME-ROOM",
      "direction": "north",
      "barrier": {
        "type": "secret_door",
        "display": "section of wall",
        "states": {
          "visible": { "requires": "found_secret", "default": false },
          "open": false
        },
        "requirements": {
          "reveal": { "method": "examine wall" },
          "open": { "method": "push" }
        }
      }
    }
  }
}
```

#### Movement Processing Flow

```javascript
// Player types: "go north"
1. Get current room exits.north
2. Find connection where from=currentRoom, direction=north
3. Check barrier.states.visible (can player see it?)
4. Check barrier.states.open (is passage open?)
5. Check requirements (has key? solved puzzle?)
6. If all pass: transition to new room
7. Display appropriate text and update state
```

### Benefits of Connections System

1. **Extensible**: Works for doors, windows, transport pads, teleporters
2. **Stateful**: Track locked/unlocked, open/closed, visible/hidden
3. **Requirements**: Support keys, puzzles, conditions
4. **Flexible**: Different barrier types with different mechanics
5. **Single source**: Each connection defined once

## NEXT PRIORITY: Minimum Game Engine

### Core Engine Requirements

**Basic playable navigation system:**

```javascript
// Essential functions to implement:
function processMovement(direction) {
  // 1. Get current room
  // 2. Check connections for barriers/doors
  // 3. Validate movement requirements
  // 4. Update current room in gameState
  // 5. Display enter text (first/repeat)
  // 6. Update visit history
}

function examineRoom() {
  // 1. Get current room lookText
  // 2. List available exits dynamically
  // 3. Show items present (startLocation = currentRoom)
  // 4. Show NPCs present (startLocation = currentRoom)
}

function showHelp() {
  // Display available commands from gameData.commands
}

function showInventory() {
  // Display items from player.core.inventory
}
```

### State Management Integration

- **gameState.json**: currentRoom, visitedRooms, doorStates
- **player.json**: inventory, stats, progress
- **Persistent saves**: Auto-save on room transitions

## Development Approach

### Phase 1: Doors/Connections System (Next)

1. **Design connections data structure** (gameData vs separate file)
2. **Implement door state management** (visible, open, locked)
3. **Create movement validation** (check requirements before allowing passage)
4. **Test with simple/complex door scenarios**

### Phase 2: Minimum Game Engine (After doors)

1. **Movement processing** - Process north/south/east/west with door validation
2. **Room display system** - Show descriptions, exits, items, NPCs
3. **Look command** - Enhanced room examination
4. **State persistence** - Save/load game state
5. **Testing** - Verify navigation works through all 15 rooms

### Phase 3: Enhanced Interactions (Future)

1. **Item interactions** - examine, take, use, drop
2. **NPC conversations** - talk, give items
3. **Inventory management** - capacity, organization
4. **Game events** - triggers, cutscenes, achievements

## Files Structure (Current Perfect State)

### Core Game Engine

- **gameData.json** (6KB) - THE single source of truth
- **rooms.json** (5KB) - Pure navigation data
- **textAdventure.js** - Unified game engine
- **textAdventure.html/css** - Game interface

### Display & Configuration

- **asciiArtConfig.json** - Display settings
- **uiConfig.json** - UI labels
- **keyboardShortcuts.json** - Key bindings
- **asciiArt.txt** - Art library

### Runtime (Auto-created)

- **player.json** - Save game data
- **gameState.json** - World state

## Success Criteria for Next Phase

### Doors System Success:

- Player can encounter locked doors that block movement
- Keys can unlock doors
- Secret doors can be found and opened
- Different door types work (simple, locked, secret, etc.)
- State persists between game sessions

### Minimum Engine Success:

- Player can navigate all 15 rooms using n/s/e/w commands
- Look command shows room description, exits, items, and NPCs
- Help and inventory commands work correctly
- Game state persists properly (current room, visited rooms)
- First/repeat enter text works correctly
- Items and NPCs appear in correct rooms based on startLocation

This architecture provides the perfect foundation for implementing a full-featured text adventure game with professional-grade single-source-of-truth data management, extensible doors system, and unlimited expansion potential.
