# Who's That Witch? - Specifications

## Project Overview

**Project Name:** Who's That Witch?
**Project Type:** Halloween-themed matching/memory tile game
**Location:** `/games/whosThatWitch/`
**Status:** v1.0 - COMPLETE and DEPLOYED to GitHub Pages
**Date Started:** October 11, 2025
**Last Updated:** October 19, 2025 10:59
**GitHub Pages URL:** https://johnpendergrass.github.io/whosThatWitch/

## Project Concept

A matching tile game where players:
1. Turn over tiles to reveal witch character images
2. Match two identical tiles together
3. Identify which witch character is shown (this is the twist!)
4. Score points based on matches and correct identification

**The Core Gameplay:** Players flip tiles to find matching pairs of witch characters. Once a match is found, they must correctly identify which witch it is to score points and continue playing.

## Game Container Specifications

**Exact Dimensions:** 950×714 pixels
- **Width:** 950px (exact)
- **Height:** 714px (not 720px - see rationale below)
- **Borders:** 3px white border (inside the container)
- **Background:** Black (#000000)
- **Position:** Relative, centered in page

**Rationale for 714px Height:**
The game is designed to fit inside a parent Halloween minigames app. The parent app has a center panel of 950×720 pixels, but 3px borders on top and bottom reduce usable space to 950×714. This ensures the game fits perfectly without overflow.

## Board Specifications

**Container:** 502×502 pixels
- **Position:** Absolute, bottom-left of screen
  - 35px from left edge (20px + 15px border)
  - 35px from bottom edge (20px + 15px border)
- **Border:** 15px ridge border (#7b2d8e - witchy purple)
  - Box-sizing: content-box (border is outside the 502px)
  - Total size with border: 532×532 pixels
- **Background:** #553963 (purple interior)
- **Purpose:** Contains the grid of tiles and grid lines

## Grid System

Three difficulty levels with different grid sizes:

### Easy (3×3 Grid)
- **Tile Count:** 9 tiles (4 pairs + 1 bonus)
- **Tile Size:** 166×166 pixels
- **Grid Lines:** 2px black lines between tiles
- **Total Calculation:** 3×166 + 2×2 = 498 + 4 = 502px ✓
- **Characters:** 4 different witches (+ 2 decoys in list)
- **Special Tiles:** 1 bonus tile (no bombs)

### Medium (4×4 Grid)
- **Tile Count:** 16 tiles (7 pairs + 1 BOMB-A + 1 bonus)
- **Tile Size:** 124×124 pixels
- **Grid Lines:** 2px black lines between tiles
- **Total Calculation:** 4×124 + 3×2 = 496 + 6 = 502px ✓
- **Characters:** 7 different witches (+ 2 decoys in list)
- **Special Tiles:** 1 BOMB-A tile, 1 bonus tile

### Hard (5×5 Grid)
- **Tile Count:** 25 tiles (11 pairs + 1 BOMB-A + 1 BOMB-B + 1 bonus)
- **Tile Size:** 99×99 pixels
- **Grid Lines:** 2px black lines between tiles
- **Total Calculation:** 5×99 + 4×2 = 495 + 8 = 503px (1px hidden under border)
- **Characters:** 11 different witches (+ 2 decoys in list)
- **Special Tiles:** 1 BOMB-A tile, 1 BOMB-B tile, 1 bonus tile

## Asset Inventory

### Witch Character Images

**Total Characters:** 25 unique witch characters (groups 1-25)
**Total Images:** 106+ individual photos (multiple photos per character)
**Source Material:** Movies, TV shows, books, anime, cartoons, mythology
**Image Formats:** PNG with transparency (RGBA)

**Available Sizes:**
- 166×166 pixels (stored in `assets/166sized/`) - For EASY difficulty
- 124×124 pixels (stored in `assets/124sized/`) - For MEDIUM difficulty
- 99×99 pixels (stored in `assets/99sized/`) - For HARD difficulty
- Original: Various sizes (stored in `assets/witches/`)

### Character Database

**Storage:** `json/witchesImages.json`

**Structure:** Character-grouped with metadata and group field
```json
{
  "witchImages": {
    "Elphaba": [
      {
        "filename": "Elphaba(Broadway_Oz)01",
        "group": "a",
        "name_text": "Elphaba",
        "description_text": "This is Elphaba, from the 2003 Broadway show Wicked!",
        "easy_path": "99sized",
        "medium_path": "124sized",
        "hard_path": "166sized"
      },
      ...more images for this character...
    ],
    "Galinda": [...],
    ...more characters...
  }
}
```

**Group System:**
- **Group A (Wicked):** Elphaba (9), Galinda (9) - always selected together
- **Group B (Bewitched):** Endora (3), Samantha (6), Tabitha (3) - always selected together
- **Group C (Addams Family):** Grandmama (3), Morticia (3), Wednesday (5) - always selected together
- **Group D (Sabrina):** Sabrina (4), Salem (3) - always selected together
- **Group E (Kiki):** Kiki (3), JiJi (3) - always selected together
- **Group Z (Singles):** 24 characters - selected independently

**Complete Character List (32 characters, 109 total images):**

**Grouped Characters (Groups 1-5):**
1. Elphaba (9 images) - Wicked, Wizard of Oz [Group 1]
2. Galinda (9 images) - Wicked, Wizard of Oz [Group 1]
3. Endora (3 images) - Bewitched [Group 2]
4. Samantha (6 images) - Bewitched [Group 2]
5. Tabitha (3 images) - Bewitched [Group 2]
6. Grandmama (3 images) - The Addams Family [Group 3]
7. Morticia (3 images) - The Addams Family [Group 3]
8. Wednesday (5 images) - The Addams Family [Group 3]
9. Sabrina (4 images) - Sabrina the Teenage Witch [Group 4]
10. Salem (3 images) - Sabrina the Teenage Witch [Group 4]
11. Kiki (3 images) - Kiki's Delivery Service [Group 5]
12. Jiji (3 images) - Kiki's Delivery Service [Group 5]

**Single Characters (Groups 6-25):**
13. Hermione (3 images) - Harry Potter [Group 6]
14. Jadis (3 images) - Chronicles of Narnia [Group 7]
15. Lafayette (3 images) - True Blood [Group 8]
16. Melisandre (3 images) - Game of Thrones [Group 9]
17. Mildred (3 images) - The Worst Witch [Group 10]
18. McGonagall (3 images) - Harry Potter [Group 11]
19. Wendy (3 images) - Harvey Comics [Group 12]
20. Willow (3 images) - Buffy the Vampire Slayer [Group 13]
21. Witch Hazel (3 images) - Looney Tunes [Group 14]
22. Yubaba (3 images) - Spirited Away [Group 15]
23-32. (10 more single characters in groups 16-25)

## Configuration System

**Master Config:** `json/gameConfig.json`

The entire game is controlled by configuration files, making it theme-agnostic:

```json
{
  "theme": "witches",
  "assetFolder": "assets",
  "folderPattern": "{size}sized",
  "filePattern": "{basename}_{size}.png",
  "imageListFile": "json/witchImages.json",
  "gridConfigFile": "json/tileSizes.json",
  "boardDimensions": {
    "width": 502,
    "height": 502
  },
  "difficulties": [
    {"id": "hardTiles", "label": "HARD", "buttonId": "btn-hard"},
    {"id": "mediumTiles", "label": "MEDIUM", "buttonId": "btn-medium"},
    {"id": "easyTiles", "label": "EASY", "buttonId": "btn-easy"}
  ],
  "defaultDifficulty": "mediumTiles"
}
```

**Benefits:**
- Change theme to baseball: just swap config and images
- No code changes needed for new themes
- All paths, patterns, dimensions configurable
- Buttons generated dynamically from config

## Design Decisions

### Visual Design

**Color Palette (Halloween Theme):**
- **Screen Background:** Black (#000000)
- **Screen Border:** White (#ffffff), 3px
- **Board Background:** Purple (#553963)
- **Board Border:** Purple ridge (#7b2d8e), 15px
- **Grid Lines:** Black, 2px
- **Button Primary:** Orange (#ff6600)
- **Button Hover:** Lighter orange (#ff8c42)

**Layout:**
- Board positioned in bottom-left (asymmetric, visually interesting)
- Buttons centered at top
- Plenty of negative space around board

### Game Mechanics (Partially Implemented)

**Current State (v0.11):**
- ✅ Grid displays with correct tile positions
- ✅ Simplified square position system (left→right, top→bottom)
- ✅ Group-based character selection with numeric groups
- ✅ Matching pairs created with pairId tracking
- ✅ Bomb and bonus tiles use dedicated images
- ✅ Full metadata preserved (name_text, description_text)
- ✅ Adjacency constraint algorithm implemented
- ✅ Special tiles never adjacent (including diagonals)
- ✅ GameTile pairs avoid adjacency (100-retry algorithm)
- ✅ Grid lines draw between tiles
- ✅ Three difficulty levels function
- ✅ Character list UI displays to the right
- ✅ Hover tooltips show character descriptions
- ✅ Code constants as single source of truth
- ✅ x/y calculated from row/col (no JSON positions)
- ✅ Clickable tiles with event listeners
- ✅ Tile flip interaction (face-down ↔ face-up with animation)
- ✅ Face-down tile back images integrated (broom design)
- ✅ Match detection (compare pairIds)
- ✅ Two-tile matching game logic
- ✅ Bomb/bonus tile click handling (immediate, no matching)
- ✅ Special tiles stay visible but muted after click
- ✅ Game state machine prevents invalid clicks
- ✅ Golden glow highlight on selected tiles
- ✅ CSS variable system for muted opacity
- ✅ Special tile click properly resets previous gameTile selections
- ✅ **v0.10: Character names clickable (only during WAITING_FOR_WITCH_SELECTION)**
- ✅ **v0.10: Character identification validation working**
- ✅ **v0.10: Success tooltip (green) - "Yes! I am witch [name]!"**
- ✅ **v0.10: Error tooltip (red) - "Nope! [name] is not my name!"**
- ✅ **v0.10: Tooltips stay visible 2 seconds minimum + until mouse leaves**
- ✅ **v0.10: Completed characters turn yellow with checkmark**
- ✅ **v0.10: Conditional hover tooltips (only show for completed witches)**
- ✅ **v0.10: Character hover effect (orange → medium white)**
- ✅ **v0.10: 2 decoy witches added to list (random from unused witches)**
- ✅ **v0.11: Fixed duplicate witch names bug (character key vs display name)**
- ✅ **v0.11: Fixed purple squares bug (unique pairId generation)**
- ✅ **v0.11: Game completion detection working**
- ✅ **v0.11: Decoy names struck through when all witches found**
- ✅ **v0.11: Auto-reveal unrevealed special tiles at game end**
- ✅ **v0.11: Halftone applied to all special tiles at completion**
- ✅ **v0.12: Bonus tile reveal effect (5 seconds, adjacent tiles glow)**
- ✅ **v0.12: BOMB-A and BOMB-B separated into distinct types**
- ✅ **v0.12: Dedicated handlers for each bomb type**
- ✅ **v0.12: All special tiles get halftone overlay when clicked**

**To Be Implemented:**
- ❌ BOMB-A tile effect/action when clicked (handler ready, needs design)
- ❌ BOMB-B tile effect/action when clicked (handler ready, needs design)
- ❌ Special tile images (user has created bombTileA and bombTileB images)
- ❌ Click counter implementation and display
- ❌ Best score tracking and display
- ✅ Celebration animation when game completes (v1.0)
- ✅ Victory/completion message overlay (v1.0)

### Tile Selection & Placement Strategy (IMPLEMENTED v0.06)

**Selection Algorithm:**
1. Load character-grouped database (`witches.json`) with numeric group field (1-25)
2. Build `groupedWitches` organizing images by group number
3. Calculate unique images needed: `imageTiles / 2`
4. Randomly select that many group numbers
5. For each selected group: randomly pick one character
6. For that character: randomly pick one image
7. Store full tile data: `{imagePath, name_text, description_text, type: 'gameTile', pairId: groupNum}`
8. Create matching pairs (push same object twice for matching)
9. Create separate bomb tiles: `{imagePath, type: 'bomb'}`
10. Create separate bonus tiles: `{imagePath, type: 'bonus'}`
11. Return organized by type: `{gameTiles, bombs, bonus}` (NO shuffle at this stage)

**Placement Algorithm with Adjacency Constraints:**

**Phase 1: Special Tiles (Bombs & Bonus)**
- Placed first with strict adjacency checking
- Each special tile placed randomly in position NOT adjacent (including diagonals) to previously placed special tiles
- Example: If bonus at center, bombs exclude all 8 surrounding squares
- Ensures special tiles are well-separated visually

**Phase 2: GameTiles (Matching Pairs) - Retry Algorithm**
- Goal: Place matching pairs so they are NOT adjacent (including diagonals)
- Up to 100 retry attempts:
  1. Clear any gameTiles from previous failed attempt (keep special tiles)
  2. For each pairId (unique pair):
     - Place first tile randomly in any available square
     - Place second tile randomly in non-adjacent square (excludes 8 surrounding squares)
     - If no non-adjacent square available → FAIL attempt, retry from step 1
  3. If all pairs placed successfully → SUCCESS, exit loop
- After 100 failed attempts: **Fallback Placement**
  - Clear any partial gameTile placements
  - Place all gameTiles randomly (accept adjacency)
  - Ensures game always completes

**Fallback Rationale:**
- EASY (3×3) grid often impossible to satisfy constraints with 4 pairs
- MEDIUM/HARD usually succeed within 1-20 attempts
- Fallback ensures playability over perfect adherence
- Players unlikely to notice/care on EASY difficulty

**Why Group-Based Selection:**
- Groups 1-5: Multi-character thematic sets appear together
- Groups 6-25: Individual characters can be mixed freely
- System extensible (new groups = new group numbers)
- Metadata preserved for "Who's That Witch?" feature
- Each game has variety of different characters

**Why pairId (v0.11 Update):**
- Explicit identification of matching pairs
- Uses unique sequential numbers (1, 2, 3...) not group numbers
- v0.11 Fix: Group numbers caused collisions (multiple witches per group)
- Easier debugging and pair detection
- More maintainable than object reference comparison
- Can filter/find pairs: `gameTiles.filter(t => t.pairId === 5)`

**Data Source: Code Constants as Single Source of Truth**
- Position data comes from `EASY_SQUARES`, `MEDIUM_SQUARES`, `HARD_SQUARES` (in code)
- Each square: `{num: index, row: row, col: col}`
- x/y coordinates calculated from row/col: `x = col * (tileSize + lineSize)`
- JSON only used for configuration values, not positions
- Eliminates index mismatch bugs between arrays

## Parent App Integration

**Parent App:** Halloween Minigames at `/halloween/index.html`

**Integration Requirements (Future):**
- Export default class from `whosThatWitch.js`
- Implement interface: `constructor()`, `render()`, `start()`, `stop()`, `getScore()`
- Parent will dynamically import and instantiate
- Game HTML injected into parent's `#game-content` div

**Current Status:** Standalone development mode

## Rationale

### Why Character-Grouped Database?
The `witchesImages.json` structure groups images by character rather than using a flat array. This allows:
- Selection of unique characters per game
- Metadata for identification feature (name, description)
- Prevents same character appearing twice
- Educational aspect (players learn character origins)

### Why Configuration-Driven?
Every aspect controlled by JSON files because:
- Easy theme switching (witches → baseball → Pokemon)
- No code changes needed for new content
- All customization in one master config file
- Buttons, paths, patterns all declarative

### Why Three Difficulty Levels?
- **Easy (3×3):** Quick games, larger tiles, easier to see/match
- **Medium (4×4):** Standard difficulty, balanced gameplay
- **Hard (5×5):** Maximum characters (all 20!), challenging memory test

### Why 502×502 Board?
Math works perfectly for all three grid sizes:
- Easy: 3×166 + 2×2 = 502 ✓
- Medium: 4×124 + 3×2 = 502 ✓
- Hard: 5×99 + 4×2 = 503 (1px under frame border) ✓

## Current Implementation Status

**Completed (v0.12 - Core Game Complete, BOMB-A/BOMB-B Setup Ready):**
- ✅ Screen and board layout (950×714, 502×502)
- ✅ Grid system with three difficulties
- ✅ Simplified square position arrays (left→right, top→bottom)
- ✅ Grid line rendering
- ✅ Dynamic button generation with custom 80×30px images
- ✅ Configuration system (fully theme-agnostic)
- ✅ Image processing script (166/124/99 sizes)
- ✅ Character database with full metadata and numeric groups (1-25)
- ✅ Group-based random selection with pairId tracking
- ✅ Matching pairs created (with pairId: groupNum)
- ✅ Dedicated bomb and bonus tile images
- ✅ Adjacency constraint algorithm:
  - ✅ Special tiles never adjacent (including diagonals)
  - ✅ GameTile pairs avoid adjacency (100-retry algorithm)
  - ✅ Fallback placement after 100 attempts
- ✅ Code constants as single source of truth
- ✅ x/y coordinates calculated from row/col
- ✅ Full metadata preservation on tiles
- ✅ Character list UI in status box (renamed from "witch list")
- ✅ Hover tooltips for character descriptions
- ✅ Helper functions (shuffleArray, getRandomFromArray, areAdjacent, getAvailablePositions)
- ✅ Game title ("Who's That Witch?" in Creepster font with purple glow)
- ✅ Game subtitle with instructions
- ✅ STATUS box container with character list
- ✅ Individual character points display (+10 per character)
- ✅ Integrated scoring summary (Clicks, Total Score)
- ✅ Difficulty buttons relocated to bottom of status box
- ✅ Consistent "character" naming throughout codebase
- ✅ Face-down tile back images integrated
- ✅ Two-layer tile DOM structure (face-up + face-down overlay)
- ✅ Click event handlers for tiles
- ✅ Tile reveal animation (opacity transition)
- ✅ Match detection (compare pairIds)
- ✅ Non-matching tiles flip back after delay
- ✅ Special tile handling (bomb/bonus show immediately, no matching)
- ✅ Special tiles stay visible but muted (CSS variable system)
- ✅ Game state machine (WAITING_FIRST → WAITING_SECOND → CHECKING_MATCH)
- ✅ Golden glow highlight for selected tiles
- ✅ Bug fix: Special tile click now properly hides previously selected gameTiles
- ✅ **v0.10: Character names clickable and validation working**
- ✅ **v0.10: Success/error tooltip system with smart timing**
- ✅ **v0.10: Completed characters turn yellow with checkmark**
- ✅ **v0.10: Hover on completed character highlights tiles**
- ✅ **v0.10: Decoy witch system (2 random unused witches)**
- ✅ **v0.11: Fixed duplicate witch names bug (seenCharacterKeys)**
- ✅ **v0.11: Fixed purple squares bug (unique sequential pairIds)**
- ✅ **v0.11: Game completion detection and decoy strikethrough**
- ✅ **v0.11: Auto-reveal and halftone special tiles at game end**
- ✅ **v0.12: Bonus tile reveal effect (5 seconds, adjacent tiles glow)**
- ✅ **v0.12: BOMB-A and BOMB-B separated with dedicated handlers**
- ✅ **v0.12: Fixed halftone not applying to bomb tiles**
- ✅ **v0.12: All special tiles get halftone overlay when clicked**
- ✅ **v0.13: Click counter tracking (witch-to-witch clicks only)**
- ✅ **v0.13: Best scores saved to localStorage per difficulty**
- ✅ **v0.13: Scoring ON/OFF toggle**
- ✅ **v0.13: Clues ON/OFF toggle for description tooltips**
- ✅ **v0.13: Reset best scores button**
- ✅ **v0.13: BOMB-A Swap action (swaps 2 pairs of covered tiles)**
- ✅ **v0.13: BOMB-B Redo action (reverts completed witch pairs)**
- ✅ **v0.13: Bonus tile countdown animation (5,4,3,2,1,blank)**
- ✅ **v0.14: Black cat hints image in top-right corner**
- ✅ **v0.14: Cat hover tooltip with game instructions**
- ✅ **v0.14: Difficulty-specific character list vertical centering**
- ✅ **v0.14: Fixed character tooltip z-index stacking (transparent status-box)**
- ✅ **v0.14: Scoring toggle also hides/shows best scores display**

**Completed (Phase 5 - Victory Celebration v1.0):**
- ✅ **v1.0: Victory celebration animation** - Letters appear randomly across grid
- ✅ **v1.0: "Click to start" idle state** - Auto-transitions after 30 seconds
- ✅ **v1.0: Initial game load state** - Shows "CLICK DIFFICULTY TO START"
- ✅ **v1.0: Timeout management** - All animations cancel when starting new game
- ✅ **v1.0: Enhanced hover during celebration** - Temporarily reveal full-color witches
- ✅ **v1.0: CRITICAL BUG FIX** - Fixed frozen difficulty buttons (pointer-events issue)

**Not Started:**
- ❌ Better tile back images (current are placeholder broom designs)
- ❌ Better bomb tile imagery (needs clearer penalty visual)
- ❌ Better bonus tile imagery (needs clearer reward visual)
- ❌ Bomb tile effect/penalty mechanics (design decision needed)
- ❌ Bonus tile effect/reward mechanics (design decision needed)
- ❌ Game win/completion detection
- ❌ Victory screen

## Development Philosophy

Following John's preferences:
- **Incremental development:** One feature at a time, test thoroughly
- **Simple, understandable code:** Readability over optimization
- **Well-documented:** Clear comments explaining "why"
- **Functional approach:** Prefer functional patterns
- **Configuration over code:** Everything in JSON files
- **Wait for approval:** Don't implement major features without confirmation

## Next Major Tasks (v0.08 - Game Mechanics)

### Immediate Priority: Three-Click Game Mechanic

**Workflow:**
1. Click 1: Player clicks face-down tile → flip to face-up, reveal image
2. Click 2: Player clicks another face-down tile → flip to face-up, reveal image
3. Click 3: Player clicks character name in list → identify the character

**Validation:**
- If tiles match (same pairId) AND character name is correct:
  - Mark tiles as "completed" (keep face-up, visual indicator)
  - Mark character in list as "identified"
  - Update character points (+10 earned)
  - Update Clicks counter (-1 per attempt)
  - Update TOTAL SCORE
- If tiles DON'T match OR character name is wrong:
  - Flip both tiles back face-down
  - Increment Clicks counter
  - No points earned

### Implementation Tasks

1. **Tile State Management** - Track face-up/face-down, completed status
2. **Click Event Handlers** - Tiles and character names clickable
3. **Tile Flip Logic** - Toggle between face-down back image and face-up character image
4. **Game State Machine** - Track current click (first tile, second tile, character selection)
5. **Match Validation** - Compare pairId values of two tiles
6. **Character ID Validation** - Verify selected name matches tile character
7. **Scoring Updates** - Calculate and display real-time scores
8. **Visual Feedback** - Show completed matches differently
9. **Click Counter** - Track and display total clicks made
10. **Prevent Invalid Clicks** - Don't allow clicking completed tiles

### Future Tasks

11. **Tile flip animation** - Smooth CSS transitions
12. **Bomb tile handling** - Penalties when clicked
13. **Bonus tile functionality** - Rewards when clicked
14. **Game completion** - Detect all pairs identified
15. **Victory screen** - Display final score and stats

---

## Asset Structure (v0.13)

### Consolidated Asset Organization

All game assets now consolidated into `assets/usedInGame/` folder:

```
assets/usedInGame/
├── witches/
│   └── {characterName}_{size}.png (327 files total)
│       - 109 witch images × 3 sizes (99, 124, 166)
│
├── specialTiles/
│   ├── __bomb_swap_{size}.png (3 files) - BombA action
│   ├── __bomb_redo_{size}.png (3 files) - BombB action
│   └── __bonus_freeLook_{number}_{size}.png (18 files)
│       - numbers: 5, 4, 3, 2, 1, blank
│       - Countdown animation tiles
│
└── other/
    ├── _back_witchOnBroom_{size}.png (3 files)
    ├── _halftone_blackSmall_{size}.png (3 files)
    ├── _easyButton_80x30.png
    ├── _mediumButton_80x30.png
    └── _hardButton_80x30.png
```

**Note:** All video elements removed - everything uses `<img>` tags.

---

## Special Tile Actions (v0.13)

### Bonus Tile - Countdown Reveal
**Image Sequence:** `__bonus_freeLook_5/4/3/2/1/blank_###.png`

**Action:**
1. Player clicks bonus tile → reveals tile with "5" image
2. Adjacent tiles (8 directions) are revealed temporarily
3. Countdown animation runs (1 second per number):
   - 0s: Shows "5"
   - 1s: Changes to "4"
   - 2s: Changes to "3"
   - 3s: Changes to "2"
   - 4s: Changes to "1"
   - 5s: Changes to "blank"
4. Adjacent tiles re-covered
5. Bonus tile gets halftone overlay
6. Total duration: 5 seconds

**Implementation:** `handleBonusTile()` in whosThatWitch.js:1407-1546

### BombA Tile - Swap
**Image:** `__bomb_swap_###.png`

**Action:**
1. Player clicks bombA tile → reveals swap icon
2. Finds all covered gameTiles (face-down, not matched)
3. **First swap:**
   - Selects 2 random covered tiles
   - Applies red glow and pulse animation (1 second)
   - Swaps their underlying data (face-up image, pairId, nameText, descriptionText)
   - Physical tile positions remain unchanged
4. **Second swap:**
   - If ≥4 covered tiles exist, selects 2 different tiles
   - Applies red glow and pulse (1 second)
   - Swaps their data
   - If <4 covered tiles, skips second swap
5. BombA tile gets halftone overlay
6. Total duration: ~2 seconds (1s per swap)

**Implementation:**
- `swapTileData()` - Helper function to swap tile data
- `handleBombATile()` - Main handler (lines 1239-1304)
- `finishBombATile()` - Cleanup (lines 1306-1328)

**CSS:** `.tile-bomb-swap`, `.tile-bomb-swap-pulse` with red glow animation

### BombB Tile - Redo
**Image:** `__bomb_redo_###.png`

**Action:**
1. Player clicks bombB tile → reveals redo icon
2. Finds all completed witch pairs (isMatched=true, type=gameTile)
3. **First redo:**
   - Randomly selects 1 completed witch pair
   - Applies red glow and pulse (2 seconds)
   - Reverts tiles to covered state:
     - Shows face-down image
     - Hides halftone overlay
     - Sets isMatched=false, isFaceUp=false
     - Keeps data intact (pairId, nameText, descriptionText)
   - Updates character list:
     - Removes checkmark from name
     - Sets completed=false
     - Removes hover event listeners
4. **Second redo:**
   - If another completed witch exists, repeats process
   - If only 1 witch was completed, skips
5. BombB tile gets halftone overlay
6. Total duration: 2-4 seconds (2s per redo)

**Implementation:**
- `revertWitchPair()` - Promise-based helper (lines 1330-1395)
- `handleBombBTile()` - Async main handler (lines 1397-1456)
- `finishBombBTile()` - Cleanup (lines 1458-1478)

---

## Scoring System (v0.13)

### Click Tracking
**Purpose:** Track player's matching attempts (witch-to-witch clicks only)

**Logic:**
- Counter increments ONLY when both 1st and 2nd click are gameTiles
- Special tiles don't increment counter
- Resets to 0 when any difficulty button is clicked (new game)
- If scoring is OFF, counter is hidden

**Implementation:** Line 1023-1026 in `handleTileClick()`

### Best Scores
**Storage:** localStorage (`witchGameBestScores`)
**Format:** `{ easyTiles: null, mediumTiles: null, hardTiles: null }`

**Logic:**
- Best score = lowest click count for each difficulty
- Updates ONLY when game completes (all witches matched AND named)
- Only updates if new score is lower than existing best
- Shows "---" when no score exists for a difficulty
- Persists across page reloads

**Implementation:**
- `loadBestScores()` - Load from localStorage on init
- `saveBestScores()` - Save when updated
- `updateBestScoresDisplay()` - Update UI
- Update logic in `checkGameCompletion()` (lines 2028-2045)

### Scoring Controls (Bottom-Right UI)

**Layout:**
```
         clicks: 13
     ---    22    ---
   EASY  MEDIUM  HARD

scoring on/off: ON    clues on/off: OFF
reset best score: [reset]
```

**Buttons:**
1. **Scoring ON/OFF:** Toggles click tracking and best score saving
   - ON: Counter visible, scores saved
   - OFF: Counter hidden, scores not saved
2. **Clues ON/OFF:** Toggles description tooltips
   - ON: Tooltips show for all witches on hover
   - OFF: Tooltips only show for completed witches
3. **Reset:** Clears all best scores, sets to "---"

**Functions:**
- `toggleScoring()` - Toggle scoring on/off
- `toggleClues()` - Toggle clues on/off
- `resetBestScores()` - Clear best scores
- `updateClickDisplay()` - Update counter display

**CSS:** `#scoring-area`, `#scoring-controls`, `.control-row`, `.control-label`

---

## Clues System (v0.13)

### Description Tooltips
**Purpose:** Show character description on hover over character names

**Default Behavior (Clues OFF):**
- Tooltips only show for **completed** witches
- CSS selector: `.character-item[data-completed="true"]:hover .character-description`

**Clues ON Behavior:**
- Tooltips show for **all** witches on hover
- CSS selector: `body.clues-enabled .character-item:hover .character-description`
- Body class added/removed via JavaScript

**Toggle:**
- Default: OFF (no localStorage persistence)
- Mid-game toggle takes effect immediately
- Provides strategic hint system for players who need help

**Implementation:**
- `toggleClues()` function (lines 358-373)
- CSS rule (lines 402-406 in style.css)
- Body class: `.clues-enabled`

---

## Victory Celebration & Idle States (v1.0)

### Celebration Animation

**When all witches are matched and identified:**
1. 3-second delay while special tiles get halftone overlays
2. Victory celebration begins automatically

**Celebration sequence:**
- Tiles revealed in random (shuffled) order
- Each tile: Remove halftone → Flash yellow → Apply grayscale → Overlay letter
- Letters are large (120px), colorful, random colors from palette
- Message builds across grid spelling congratulatory phrase

**Messages by difficulty:**
- EASY (9 chars): "WELL DONE", "FANTASTIC", "EXCELLENT", "WONDERFUL", "MARVELOUS", "STELLAR!!"
- MEDIUM (16 chars): "FANTASTIC EFFORT", "EXCELLENT MEMORY", "YOU ARE AMAZING!", "SPELLBINDING JOB", "BEWITCHING SKILL", "SUPER WITCH WORK"
- HARD (25 chars): "ABSOLUTELY FANTASTIC WORK", "YOU ARE A MEMORY CHAMPION", "INCREDIBLE WITCH MATCHING", "SPECTACULAR ACHIEVEMENT!!", "SPELLBINDING PERFORMANCE!", "OUTSTANDING MASTERY SHOWN"

**Visual styling:**
- Font: Creepster, 120px, bold
- Colors: 8 vibrant colors randomly assigned (gold, orange, yellow, magenta, lime, cyan, hot pink)
- Witch images: Grayscale + 60% brightness
- Timing: 200ms between tiles (configurable at top of `celebrateVictory()`)

**Implementation:**
- `celebrateVictory(difficultyId)` function (lines 2249-2359)
- CSS: `.victory-letter` (lines 473-493), `.tile-victory-grayscale` (lines 462-471)

### "Click to Start" Idle State

**After 30 seconds of celebration:**
- Auto-transitions from victory → idle
- Letters replace one-by-one at 2 per second
- Victory colors → White text with black shadow
- Witch images stay grayscale

**Three message types:**
- EASY: "CLICK BTN" (9 chars)
- MEDIUM: "CLICK DIFFICULTY" (16 chars)
- HARD: "CLICK DIFFICULTY TO START" (25 chars)

**Visual styling:**
- Font: Lakki Reddy, 80px, bold
- Color: White (#FFFFFF) with strong black text-shadow
- Padding-top: 35px (centered in tiles)

**Initial game load state:**
- Shows HARD grid (25 squares) with tile backs
- Tile backs in FULL COLOR (not grayscale)
- Message: Black (#000000) text with orange (#FF8C42) shadow
- Witch list is EMPTY (no names until difficulty selected)
- Different class: `.click-to-start-letter-initial`

**Implementation:**
- `showClickToStartMessage(difficultyId, applyGrayscale)` (lines 2366-2394)
- `transitionToClickMessage(difficultyId)` (lines 2401-2495)
- `drawInitialIdleState()` (lines 194-246)
- CSS: `.click-to-start-letter` (lines 495-517), `.click-to-start-letter-initial` (lines 519-541)

### Timeout Management

**Problem:** When player clicks difficulty button during animations, old setTimeout calls continued executing, causing letters to appear on new game grid.

**Solution:** Comprehensive timeout tracking and cancellation
- Global timeout arrays: `victoryAnimationTimeouts[]`, `transitionTimeouts[]`, `autoTransitionTimeout`
- All setTimeout calls pushed to arrays when created
- `clearIdleState()` function cancels all pending timeouts before clearing DOM

**Implementation:**
- Global variables (lines 30-33)
- All animation functions track their timeouts
- Button click handler calls `clearIdleState()` before `drawGrid()`

### Enhanced Hover During Celebration

**Feature:** When hovering over completed witch name during celebration/idle state:
- Letters on that witch's two tiles temporarily disappear (display: none)
- Grayscale filter removed → **Full color witch revealed**
- Golden glow applied
- Halftone hidden
- On mouse leave: Everything restored (letters, grayscale, halftone)

**Why:** Allows players to admire witches they correctly identified even during celebration

**Implementation:**
- Modified `handleCompletedHoverEnter()` (lines 1997-2026)
- Modified `handleCompletedHoverLeave()` (lines 2028-2062)
- Checks for victory/idle letter elements and hides them on hover

### CRITICAL BUG FIX: Frozen Difficulty Buttons

**Bug discovered:** After completing game (especially HARD) and waiting through celebration → "CLICK..." transition, difficulty buttons became completely unresponsive. Other buttons (scoring, clues, reset) still worked fine.

**Diagnosis:**
- Added extensive debug logging (global click detector, button coverage detection)
- Discovered clicks never reached button event handlers
- Global click detector showed clicks hitting `#character-list` div instead of buttons
- Element at button coordinates: `<div id="character-list">` not `<img class="difficulty-button-img">`

**Root cause:**
- `#character-list` has large bottom padding (65px) to prevent clipping tooltips
- This padding extended the div down over the button area (bottom-right of screen)
- Character list had `pointer-events: auto` (needed for clicking witch names)
- Result: Character list div intercepted all clicks on difficulty buttons

**The fix:**
```css
#character-list {
  pointer-events: none; /* Don't block clicks on buttons below */
}

.character-item {
  pointer-events: auto; /* Re-enable clicks on witch names */
}
```

**Why this works:**
- Empty space in character list → clicks pass through to buttons below
- Witch name elements (`.character-item`) → still clickable for identification
- Hovering still works (CSS :hover doesn't require pointer-events)
- Tooltips unaffected (absolutely positioned, outside normal flow)
- No layout changes needed, padding stays at 65px

**Files modified:**
- `css/style.css`: Line 313 (#character-list), Line 335 (.character-item)

**Verified:** Buttons now respond immediately after any animation state.

---

## Game State Variables (v0.13)

```javascript
// Tile interaction
let selectedTiles = [];              // Currently selected tiles (max 2)
let gameState = "WAITING_FOR_FIRST_TILE";
let currentTileSize = null;
let bannerActivationCount = 0;

// Scoring and tracking
let clickCount = 0;                  // Current game click count
let currentDifficulty = null;        // Track which difficulty for scoring
let scoringEnabled = true;           // Scoring on/off toggle
let cluesEnabled = false;            // Clues on/off toggle (no persistence)
let bestScores = {
  easyTiles: null,
  mediumTiles: null,
  hardTiles: null
};
```

---

## Next Development Phase

### Top-Right Corner Redesign (Planned)
- 🔲 Remove "WHO AM I?" banner
- 🔲 Remove flashing animation system
- 🔲 Add hints display system
- 🔲 Design what hints to show (TBD):
  - Character source/franchise?
  - Group information?
  - Visual clues?
  - Remaining witch count?
