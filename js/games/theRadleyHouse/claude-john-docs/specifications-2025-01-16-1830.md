# Halloween Text Adventure - Updated Specifications
# Post-ASCII Removal & Scavenger Hunt Foundation

## Project Overview

**Total Project Size:** ~150KB (reduced from 196KB)
**Source Files:** 8 core files (HTML, CSS, JavaScript, JSON)
**Architecture:** Clean vanilla HTML/CSS/JavaScript focused on text adventure mechanics
**Target Platform:** Web browsers (GitHub Pages compatible)

## Overall Structure & Size

### Directory Structure
```
/mnt/d/dev/projects/halloween/games/textAdventure/
├── textAdventure.html           (44 lines)
├── textAdventure.css            (193 lines, cleaned up)
├── textAdventure.js             (~1000 lines, down from 1580)
├── HALLOWEEN-GAME/
│   ├── gameData.json            (35 lines)
│   ├── rooms-w-doors.json       (350 lines)
│   ├── commands.json            (46 lines)
│   ├── items.json               (113 lines, standardized)
│   ├── scavengerItems.json      (175 lines, new)
│   ├── uiConfig.json            (existing)
│   └── keyboardShortcuts.json   (15 lines, navigation only)
└── claude-john-docs/
    ├── scavengerHunt.md         (complete game design)
    ├── specifications-2025-01-16-1830.md (this file)
    └── Claude-ToBeContinued-2025-01-16-1830.md
```

**Total JavaScript Code:** ~1000 lines (500+ lines removed from ASCII cleanup)
**Game Data:** 719 lines across 5 JSON files

## Screen Layout & Fixed Dimensions

### Main Game Area (Unchanged)
- **Total Size:** 1280px × 720px (completely fixed, not responsive)
- **Position:** Absolute center of viewport using transform: translate(-50%, -50%)
- **Border:** 3px solid #ff6600 (orange)
- **Border Radius:** 15px
- **Background:** Dark gradient with Halloween theme colors

### Three-Panel Layout (Simplified)

#### Left Navigation Panel (Unchanged)
- **Position:** absolute at (0, 0)
- **Width:** 250px (fixed)
- **Height:** 720px
- **Content:** Game title, current game name, score display, game description
- **Background:** Linear gradient (#3d2817 to #2a1810)

#### Center Game Area (Unchanged)
- **Position:** absolute at (250px, 0)
- **Width:** 950px
- **Height:** 720px
- **Content:** Text adventure output and command input
- **Background:** Linear gradient (#1a1410 to #261a10)

#### Right Panel - Now "Scavenger" (UPDATED)
- **Position:** absolute at (1030px, 0)
- **Width:** 250px (or collapsible to 80px)
- **Height:** 720px
- **Content:** **READY FOR SCAVENGER HUNT UI**
- **Background:** Linear gradient (#3d2817 to #2a1810)
- **CSS Class:** `.scavenger` (renamed from `.ascii-art`)

## Data Architecture (COMPLETELY RESTRUCTURED)

### Unified Item System
**All items now have identical properties:**

```json
{
  "includeInGame": true,
  "display": "item name",
  "description": "item description",
  "startLocation": "ROOM-NAME",
  "itemType": "",              // "scavenger" or ""
  "points": 0,                 // 10 for scavenger items, 0 for regular
  "found": false,              // tracking property
  "capacity": 0,               // 40 for containers, 0 for others
  "actions": {
    "examine": "examine text",
    "take": null,              // take action object if takeable
    // other actions as needed
  }
}
```

### Item Distribution Across Rooms
**Regular Items (7 total):**
- MUSIC-ROOM: candy_bag (takeable)
- FOYER: snickers_bar (takeable)
- LIBRARY: whatchamacallit (takeable)
- NICE-PORCH: doorbell, porch_light_nice
- FRONT-PORCH: door_knocker, porch_light_front

**Scavenger Items (10 total):**
- KITCHEN: Scavenger item #1, #2
- LIBRARY: Scavenger item #3, #4
- STUDY: Scavenger item #5, #6
- DINING-ROOM: Scavenger item #7, #8
- FOYER: Scavenger item #9
- BEDROOM: Scavenger item #10

### Room Navigation System (15 Rooms)
**Layout unchanged - fully connected world:**
```
STREET-01 ↔ STREET-02
    ↑           ↑
NICE-PORCH  FRONT-PORCH
    ↑           ↑
NICE-HOUSE   FOYER ← Central hub
             ↑ ↑ ↑
         LIBRARY DINING-ROOM STUDY
             ↑       ↑          ↑
      MUSIC-ROOM  KITCHEN   TV-ROOM
             ↑                  ↑
       GAME-ROOM            BEDROOM
             ↑
           HOME (end game)
```

## Game Mechanics Implementation

### Current Commands (7 total)
**Movement:** north (n), south (s), east (e), west (w)
**Actions:** help (h), look (l), inventory (i)

### Command Processing Flow
```
User Input → findCommand() → processCommand() → Execute Action

Single Word Commands:
- Movement: movePlayer(direction)
- Actions: lookAtRoom(), showInventory(), showHelp()

Ready for Implementation:
- take [item]: handleTakeCommand() (needs implementation)
```

### Item Interaction System
**Room Entry:**
1. Load room data
2. Show enterText
3. List exits
4. **NEW: Show items automatically** (implemented)

**Item Actions:**
- **examine**: Show item description
- **take**: Add to inventory, remove from room (ready for implementation)
- **eat**: Consume item with effects (candy items)
- **use**: Activate item functions (doorbell, knocker)

## Code Architecture (SIMPLIFIED)

### Core Functions (textAdventure.js)
```javascript
// Data Loading (NEW)
loadItems()           // Load items.json
loadScavengerItems()  // Load scavengerItems.json (NEW)
loadRoomsAndDoors()   // Load room/door data
loadCommands()        // Load command definitions

// Game Engine (ENHANCED)
displayRoom()         // Show room + exits + items (UPDATED)
movePlayer()          // Handle movement with door validation
processCommand()      // Parse and execute commands

// Item System (NEW FOUNDATION)
lookAtRoom()          // Show room description + items
showInventory()       // Display player inventory
// handleTakeCommand() // READY TO IMPLEMENT

// UI Management
updateGameStatus()    // Update status panel
addToBuffer()         // Text output management
```

### Removed Systems (500+ lines deleted)
- ASCII art display grid (32×60 character grid)
- Animation effects (fadeIn, typewriter, spiral, etc.)
- ASCII art loading and parsing
- Display refresh and grid management
- ASCII art keyboard shortcuts

## Current State Validation

### Working Features ✅
- **Room navigation** - All 15 rooms connected with proper door logic
- **Item display** - Items show automatically when entering rooms
- **Command system** - help, look, inventory, movement all functional
- **Data loading** - All JSON files load and merge correctly
- **Unified items** - Both regular and scavenger items processed identically

### Ready for Implementation 🚀
- **Take command** - Data structures complete, handler needed
- **Scavenger hunt UI** - Container ready, needs content display
- **Score tracking** - Points system defined, needs implementation
- **Timer system** - Architecture prepared per scavengerHunt.md

### Testing Status
- ✅ **JSON validation** - All files syntactically correct
- ✅ **Item loading** - 17 total items load correctly (7 regular + 10 scavenger)
- ✅ **Room display** - Items appear in correct rooms
- ✅ **Command processing** - All existing commands work
- ✅ **Server compatibility** - Game loads at http://localhost:8000/textAdventure.html

## Next Development Phase

### Immediate Priority: Take Command Implementation
**Estimated Time:** 1-2 hours
**Files to Modify:**
1. commands.json - Add take command definition
2. textAdventure.js - Add handleTakeCommand() function

### Implementation Template:
```javascript
// In processCommand() switch statement:
case "take_item":
  handleTakeCommand(getTargetFromInput(command));
  break;

// New function:
function handleTakeCommand(itemName) {
  // Find item in current room
  // Check if item has take action
  // Execute take action
  // Update inventory
  // Remove item from room
  // Show response message
}
```

### Success Criteria:
- Player can type "take candy bag" and pick up items
- Inventory updates correctly
- Items disappear from rooms after taking
- Both regular and scavenger items work identically
- Foundation ready for scavenger hunt UI

## Performance & Compatibility

### Optimizations Achieved
- **Reduced bundle size** - 500+ lines of unused code removed
- **Simplified initialization** - No ASCII art loading delays
- **Cleaner memory usage** - No display grid or animation systems
- **Faster room transitions** - Direct text display, no animations

### Browser Support
- **Modern browsers** with ES6 module support
- **No external dependencies** - Fully self-contained
- **GitHub Pages compatible** - Static file serving only

### File Size Summary
- **HTML:** 44 lines (minimal structure)
- **CSS:** 193 lines (cleaned, focused styling)
- **JavaScript:** ~1000 lines (core game logic only)
- **JSON Data:** 719 lines (game content)
- **Total:** ~150KB project (was 196KB)

## Design Philosophy & Future

### Current Approach
**Clean Text Adventure Foundation** - Removed all visual complexity to focus on solid game mechanics. The scavenger hunt will be a text-based experience with clear item tracking and score display.

### Scavenger Hunt Integration
The `.scavenger` container (950×720px) is ready for:
- Scavenger list with checkmarks
- Real-time score display
- Timer countdown
- Progress indicators

### Expandability
The unified item system makes future features easy:
- Random item placement
- Different candy types with varying points
- Container/puzzle systems
- Multiple difficulty levels

---

*This specification documents the complete restructuring from ASCII-art game to scavenger hunt foundation. The codebase is now clean, focused, and ready for implementing the interactive scavenger hunt experience.*