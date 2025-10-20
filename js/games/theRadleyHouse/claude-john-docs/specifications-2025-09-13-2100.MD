# Text Adventure Game - Project Specifications

# Updated: 2025-09-13-2100 - Doors System Complete & Movement Engine Ready

## Project Overview

A browser-based text adventure game in the style of 1970s/1980s Zork-style games.
Theme: Halloween Edition - "An exciting game of Trick or Treating and Suspense!"

**Current Layout:** Optimized 950×720px format for compact display while maintaining full functionality.

## Current Architecture Status (September 13, 2025)

### ✅ PERFECT FOUNDATION COMPLETE - Single Source Architecture Achieved
**Ultimate data consolidation accomplished:**
- No duplication across entire codebase
- Each data element exists in exactly ONE place
- Perfect DRY principle implementation
- Clean separation of concerns between files

### ✅ DOORS SYSTEM COMPLETE - Ready for Engine Implementation
**Advanced navigation system fully designed and validated:**
- Complete rooms-w-doors.json with 15 rooms and 13 doors
- Door states (visible/invisible, locked/unlocked)
- Puzzle system integration
- Bidirectional connection validation

### 🎮 NEXT PHASE - Movement Engine Implementation
Moving from perfect data architecture to playable navigation system.

## Critical Architectural Insight

### **Single Source of Truth ≠ Single File**
**The real principle**: Each piece of data exists in exactly ONE place
- **What matters**: No duplication, clear ownership, no sync issues
- **What doesn't matter**: File count or file size (within reason)
- **Multiple files are BETTER** with clean separation of concerns

### **Clean Separation Benefits**
- **Version control** - See exactly what changed where
- **Team collaboration** - Different people edit different files
- **Loading optimization** - Load only what you need
- **Swappable content** - Replace navigation without touching items
- **Clearer organization** - Know where to look for specific data

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

## FINALIZED ARCHITECTURE: Perfect Separation of Concerns

### Architecture Goals (ACHIEVED)
1. **Single source principle** - No duplication anywhere
2. **Clean separation** - Navigation vs Content in separate files
3. **Flexible management** - includeInGame flags for instant enable/disable
4. **Swappable systems** - Change maps or content independently
5. **Clear ownership** - Know exactly where to find/change anything

### Data Flow Architecture (CURRENT)

```
NEW GAME:
rooms-w-doors.json → Load navigation/doors/puzzles
gameData.json → Filter includeInGame:true → Build inventory → Initialize runtime

MOVEMENT:
User Input → Movement Parser → Door Validation → Room Transition → Display Response

ROOM CONTENT:
Current Room + gameData items/NPCs with matching startLocation → Display

SAVE/LOAD:
Runtime State ↔ player.json + gameState.json (auto-created)
```

### File Architecture (OPTIMIZED)

#### **Navigation System**
- **rooms-w-doors.json** (9KB) - Complete navigation, doors, and puzzles
  - 15 rooms with enterText (first/repeat), lookText, exits
  - 13 doors with descriptions, visibility, locked states
  - Puzzle system (requirements and effects)
  - Bidirectional connection validation

#### **Game Content System**
- **gameData.json** (8KB) - All dynamic game content
  - Meta information (game name, version, author)
  - Startup configuration (room, ASCII art, welcome text, player stats)
  - Commands (7 core + item-specific commands)
  - Items with startLocation and actions
  - NPCs with startLocation and actions

#### **Display & Configuration Files**
- **asciiArt.txt** - ASCII art library with comment support
- **asciiArtConfig.json** - Display settings (grid, animations, speeds)
- **uiConfig.json** - UI labels and text
- **keyboardShortcuts.json** - Key bindings

#### **Runtime Files** (Auto-created for saves)
- **player.json** - Current player state (created when saving)
- **gameState.json** - Current world state (created when saving)

#### **Engine**
- **textAdventure.js** - Unified game engine with dual-source processing
- **textAdventure.html/css** - Game interface

## Doors System Architecture (IMPLEMENTED)

### Complete Door Structure
```json
{
  "doors": {
    "front-porch2foyer": {
      "between": ["FRONT-PORCH", "FOYER"],
      "description": "It is a heavy front door.",
      "visible": true,
      "locked": true
    },
    "music-room2game-room": {
      "between": ["MUSIC-ROOM", "GAME-ROOM"],
      "visible": false,
      "locked": true,
      "requirements": [
        { "type": "puzzle", "id": "say-friend" }
      ],
      "messages": {
        "hidden": "The wall looks seamless.",
        "locked": "The stone grinds but won't open… perhaps a password?",
        "unlocked": "Something shifts inside the stonework."
      },
      "alias": "secret door"
    }
  }
}
```

### Door Processing Features
1. **Visibility Control** - Hide secret passages until discovered
2. **Lock States** - Block movement until requirements met
3. **Requirements System** - Support keys, puzzles, conditions
4. **Custom Messages** - Different text for different door states
5. **Bidirectional Validation** - Ensures connection consistency

### Puzzle System Integration
```json
{
  "puzzles": {
    "say-friend": {
      "prompt": "An inscription reads: 'Speak, friend, and enter.'",
      "solutions": ["friend"],
      "effects": [
        { "op": "unlock", "door": "music-room2game-room" },
        { "op": "reveal", "door": "music-room2game-room" }
      ]
    }
  }
}
```

## Command System Architecture (DESIGNED)

### Two-Tier Command System
**File Structure:**
- **commands.json** - Global commands available everywhere
- **items.json** - Item actions available when item is in current room

### Command Processing Flow
```
Single Word:     "look" → Global command (commands.json)
Two Words:       "ring doorbell" → Item action (items.json)
Multiple Words:  "look at doorbell" → Alias → "examine doorbell"
```

### Global Commands (7 total)
1. **help** (h, ?) - Show available commands
2. **look** (l) - Examine current room and visible exits
3. **inventory** (i) - Show player inventory
4. **north/south/east/west** (n/s/e/w) - Movement commands

### Item Actions (Room-Specific)
- **ring doorbell**, **push doorbell** - Doorbell interactions
- **eat snickers**, **eat whatchamacallit** - Consume candy
- **knock door**, **use door** - Door knocker actions
- **examine [item]** - Inspect any item

### Parser Implementation
```javascript
function parseCommand(input) {
  const words = input.toLowerCase().trim().split(/\s+/);

  if (words.length === 1) {
    return handleGlobalCommand(words[0]);
  }

  if (words.length === 2) {
    return handleItemAction(words[0], words[1]); // verb + target
  }

  return handleComplexCommand(words); // aliases, multi-word
}
```

### Movement Command Processing Flow
```javascript
function processMovement(direction) {
  // 1. Get current room from gameState
  // 2. Get exit for direction from rooms data
  // 3. Find door by door ID in doors section
  // 4. Check door.visible (can player see it?)
  // 5. Check door.locked (can player pass?)
  // 6. Check requirements if they exist
  // 7. If valid: move to room, show enterText, update state
  // 8. If blocked: show appropriate door message
}
```

## Room System Architecture (PERFECTED)

### World Map (15 Rooms Total)
- **2 Street locations**: STREET-01 (start), STREET-02
- **2 Nice House areas**: NICE-PORCH, NICE-HOUSE (Mrs. McGillicutty)
- **10 Radley House rooms**: FRONT-PORCH, FOYER, LIBRARY, DINING-ROOM, STUDY, MUSIC-ROOM, GAME-ROOM, KITCHEN, BEDROOM, TV-ROOM
- **1 End location**: HOME (game completion)

### Room Structure (Clean Navigation)
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
      "north": { "to": "CONNECTED-ROOM-ID", "door": "door-id" }
    },
    "special": {
      "starting-location": true  // Only for game mechanics
    }
  }
}
```

### Room Content Population (Dynamic)
- **No hardcoded items/NPCs** in room definitions
- **Engine populates** rooms from gameData items/NPCs with matching startLocation
- **Look command shows**: Room description + visible exits + items present + NPCs present

## NEXT PRIORITY: Movement Engine Implementation

### Core Engine Requirements
**Basic playable navigation system to implement:**

```javascript
// Essential functions to implement:
function loadGameData() {
  // Load both rooms-w-doors.json and gameData.json
  // Validate all door connections
  // Build lookup tables for efficient processing
}

function processMovement(direction) {
  // 1. Get current room and requested exit
  // 2. Find door and validate visibility/locked state
  // 3. Check requirements (keys, puzzles, etc.)
  // 4. Update current room if movement allowed
  // 5. Display appropriate response (enterText or blocked message)
}

function examineRoom() {
  // 1. Show current room lookText
  // 2. List visible exits (check door visibility)
  // 3. Show items in room (startLocation = currentRoom)
  // 4. Show NPCs in room (startLocation = currentRoom)
}

function handleCommand(input) {
  // Parse user input for movement commands
  // Support: north, south, east, west, n, s, e, w
  // Also: look, help, inventory
}
```

### State Management Integration
- **gameState.json**: currentRoom, visitedRooms, doorStates, puzzleStates
- **player.json**: inventory, stats, progress
- **Persistent saves**: Auto-save on room transitions
- **First/repeat logic**: Track room visits for appropriate enterText

### Door Validation Logic
```javascript
function canMoveThrough(doorId) {
  const door = doors[doorId];

  // Check visibility
  if (!door.visible) {
    return { allowed: false, message: "You don't see a way to go that direction." };
  }

  // Check locked state
  if (door.locked) {
    const message = door.description + " It's locked.";
    return { allowed: false, message: message };
  }

  // Check requirements
  if (door.requirements) {
    // Check if player has keys, solved puzzles, etc.
  }

  return { allowed: true };
}
```

## Development Approach (Next Session)

### Phase 1: Movement Engine Core (IMMEDIATE)
1. **Load both JSON files** - rooms-w-doors.json and gameData.json
2. **Implement movement parsing** - Process n/s/e/w commands
3. **Door validation system** - Check visibility, locked state, requirements
4. **Room transition logic** - Update currentRoom, show enterText
5. **Look command** - Show room description, exits, items, NPCs
6. **Testing** - Verify navigation through all 15 rooms

### Phase 2: Enhanced Movement Features (After Core Works)
1. **Save/load system** - Persist game state between sessions
2. **Puzzle integration** - Handle "say friend" puzzle for secret door
3. **First/repeat text** - Track visited rooms for appropriate messages
4. **Item/NPC display** - Show room contents based on startLocation
5. **ASCII art integration** - Update art based on current room

### Phase 3: Full Game Features (Future)
1. **Item interactions** - examine, take, use, drop
2. **NPC conversations** - talk, give items
3. **Inventory management** - capacity, organization
4. **Game events** - triggers, cutscenes, achievements

## Success Criteria for Movement Engine

### Movement System Success:
- Player can navigate all 15 rooms using n/s/e/w commands
- Locked door at front-porch2foyer blocks entry until unlocked
- Secret door at music-room2game-room is hidden until puzzle solved
- Door descriptions appear when examining blocked passages
- Movement commands work with both full words and single letters

### Room Display Success:
- Look command shows room description and visible exits only
- Items appear in rooms based on startLocation from gameData
- NPCs appear in rooms based on startLocation from gameData
- First/repeat enterText works based on visit history
- Help command shows available movement commands

### State Management Success:
- Current room persists in gameState.json
- Visited rooms tracked for first/repeat text
- Door states can be modified by puzzles/keys
- Game state loads correctly on restart

This architecture provides the perfect foundation for implementing a full-featured text adventure game with professional-grade data organization, robust doors system, and unlimited expansion potential while maintaining clean separation of navigation and content systems.