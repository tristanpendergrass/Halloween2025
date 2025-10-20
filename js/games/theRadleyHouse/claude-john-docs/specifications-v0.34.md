# Halloween Text Adventure - Complete Specifications
# v0.34 - Streamlined Navigation

## Project Overview

**Game Title:** The Radley House
**Subtitle:** A well-articulated treasure hunt
**Version:** 0.34 (Streamlined Navigation)
**Total Project Size:** ~300KB (with all assets, images, and fonts)
**Source Files:** 8 core files + 7 data JSON files + 38 items + documentation + images
**Architecture:** Clean vanilla HTML/CSS/JavaScript with visual scavenger tracking, victory celebration animations, handwritten notes, locked doors, hidden items, interactive puzzles, two-column inventory, and comprehensive command system
**Target Platform:** Web browsers (GitHub Pages compatible)
**Current State:** Fully functional text adventure with streamlined intro, rich visual feedback, victory celebration, polished UI, hidden commands, and comprehensive player guidance

---

## Major Features Summary

### Victory Celebration System 🎉
- Congratulatory flash animation on each scavenger item pickup
- 9th item triggers dramatic 3×3 grid animation
- Punch-rotate effect with staggered delays
- Golden victory text overlay
- Player-dismissible with Enter key

### Two-Column Inventory Display
- Scavenger items display in 2 columns (saves vertical space)
- Reduces 9 lines to 5 lines
- Smart HTML tag stripping for alignment
- Used in INVENTORY command and HOME screen

### Hidden Commands System
- **HINT/SECRETS** - Reveals all secret commands and aliases
- **CELEBRATE** - Replay victory animation (requires all 9 items)
- **RESTART** - Reload game from beginning
- **ABOUT** - Display game info and credits
- **DEBUG** - Add items for testing
- **THROW** - Easter egg refusal responses

### Visual Features
- **Header:** Cinzel font, orange/purple Halloween theme
- **Inline images:** 150px for candy, 250px for scavenger items
- **3×3 scavenger grid:** Real-time discovery tracking
- **Handwritten notes:** Caveat font with paper effect
- **Styled titles:** "THE RADLEY HOUSE" dramatic formatting

---

## Game Structure

### Rooms (13 total) ⭐ UPDATED v0.34

**Exterior:**
- **START** - Initial spawn point, Halloween night intro, sees light to east
- **STREET-01** - Mrs. McGillicutty's house, includes game instructions
- **STREET-02** - The Radley House (dramatic styled title)
- **NICE-PORCH** - Mrs. McGillicutty's porch (doorbell interaction)
- **NICE-HOUSE** - Inside McGillicutty's (candy + clue note)
- **FRONT-PORCH** - Radley House porch (gong interaction)

**Interior (Radley House):**
- **FOYER** - Central hub, exits in all directions, pumpkin location
- **LIBRARY** - Books, reveals Frankenstein book
- **MUSIC-ROOM** - Audio system, secret door puzzle
- **GAME-ROOM** - End location (scavenger hunt finish)
- **DINING-ROOM** - Central room, multiple exits
- **KITCHEN** - Cup O' Noodles location
- **TV-ROOM** - DVD cabinet puzzle, Bringing Up Baby
- **STUDY** - Safe combination puzzle, Krugerrand
- **BEDROOM** - Locked door, requires key, mug location

**Special:**
- **HOME** - End game location, shows final inventory
- **INVENTORY** - Virtual room for carried items

**Changes from v0.33:**
- ❌ Removed INTRO room (was between START and STREET-01)
- ✅ Direct START → STREET-01 connection
- ✅ Integrated INTRO instructions into STREET-01

### Room Flow (Updated v0.34)
```
START (spawn point)
  ↓ east
STREET-01 (McGillicutty's, game instructions)
  ↓ east              ↓ north
STREET-02           NICE-PORCH → NICE-HOUSE (candy/clues)
  ↓ north
FRONT-PORCH (gong)
  ↓ north (locked initially)
FOYER (central hub)
  ├─ west → LIBRARY → north → MUSIC-ROOM → north → GAME-ROOM → HOME
  ├─ north → DINING-ROOM → north → KITCHEN
  │                       └─ east → TV-ROOM → north → BEDROOM (locked)
  └─ east → STUDY (safe puzzle)
                  └─ north → TV-ROOM
```

### Items (38 total)

**Scavenger Items (9):**
1. NVidia 5090 Video Card (GAME-ROOM)
2. Cup O' Noodles (KITCHEN)
3. Odd Dog (DINING-ROOM)
4. Beatles Revolver CD (MUSIC-ROOM)
5. Cat Mug (BEDROOM - locked room)
6. Bringing Up Baby DVD (TV-ROOM - hidden in cabinet)
7. Frankenstein book (LIBRARY)
8. Decorative Pumpkin (FOYER)
9. Krugerrand coin (STUDY - in safe)

**Candy Items (23):**
Distributed across rooms, 150×150px images, Halloween treats

**Quest Items (6):**
- Doorbell (NICE-PORCH) - Ring to enter house
- Gong (FRONT-PORCH) - Use to unlock front door
- Key (revealed item) - Unlocks bedroom
- Safe (STUDY) - Combination puzzle
- Cabinet (TV-ROOM) - Opens to reveal DVD
- Clue notes (various) - Hints for puzzles

### Doors (13 total) ⭐ UPDATED v0.34

**Unlocked/Open:**
- start2street-01 ⭐ NEW (was two doors via INTRO)
- street-012street-02
- street-012nice-porch
- nice-porch2nice-house
- street022front-porch
- foyer2library, foyer2study, foyer2dining-room
- library2music-room
- dining-room2kitchen, dining-room2tv-room
- study2tv-room

**Locked/Requires Action:**
- front-porch2foyer (locked, opens with gong)
- music-room2game-room (secret door, requires SAY FRIEND)
- bedroom2tv-room (locked, requires key)

**Removed in v0.34:**
- ❌ start2intro
- ❌ intro2street-01

### Commands (17 total)

**Movement:** north [n], south [s], east [e], west [w]

**Observation:** look [l], examine [x, ex, read]

**Inventory Management:**
- inventory [i] - Show carried items
- take [t, get, g, grab, pick] - Pick up items
- drop [put, place] - Drop items

**Actions:**
- use [u, ring, turn] - Use items (doorbell, gong, etc)
- eat - Consume candy
- open [unlock] - Open containers (safe, cabinet)
- say [speak, push, press, dial] - Speak phrases (puzzles)

**System:**
- help [h, ?] - Show command list
- quit [home] - End game (with confirmation)
- hint [secrets] - Show hidden commands
- restart - Reload game
- about - Game info and credits

**Hidden:**
- throw [toss, chuck, hurl] - Easter egg
- debug - Add test items
- celebrate - Replay victory (requires 9 items)

---

## Puzzles and Interactions

### 1. Mrs. McGillicutty's House
**Location:** NICE-PORCH → NICE-HOUSE
**Action:** USE DOORBELL or RING DOORBELL
**Rewards:**
- 2 candy items added to inventory
- Handwritten clue note (reveals scavenger locations)
**State:** One-time interaction, porch light turns off after

### 2. Radley House Front Door
**Location:** FRONT-PORCH
**Action:** USE GONG or USE HANDLE
**Effect:** Unlocks front-porch2foyer door, allows entry to house
**Narrative:** Deep resonant sound, Mr. Radley appears briefly

### 3. Safe Combination Puzzle
**Location:** STUDY
**Current Combination:** 13-97-55 ⚠️ TO BE CHANGED
**Command:** SAY 13-97-55 (or SAY 139755, spaces/dashes ignored)
**Reveals:**
- Krugerrand (scavenger item #9)
- Password parchment (clue for secret door)
**Implementation:** textAdventure.js line 1370

### 4. DVD Cabinet
**Location:** TV-ROOM
**Action:** OPEN CABINET
**State:** First open reveals hidden DVD
**Reveals:** Bringing Up Baby DVD (scavenger item #6)
**Narrative:** Movie playing on TV, but DVD is in cabinet (mystery!)

### 5. Secret Door - Speak Friend
**Location:** MUSIC-ROOM
**Command:** SAY FRIEND (Tolkien reference)
**Effect:**
- Reveals hidden door to GAME-ROOM
- Unlocks music-room2game-room door
**Clue:** Password parchment from safe, inscription in room

### 6. Bedroom Door
**Location:** TV-ROOM → BEDROOM
**Requirement:** Key item in inventory
**Auto-unlocks:** When moving north with key
**Contains:** Cat Mug (scavenger item #5)

---

## Scoring System ⚠️ TO BE IMPLEMENTED

### Current Display
- Scavenger Items: X / 9
- Treats: X / 20

### Proposed Point System (v0.35)
**Total: 100 points possible**

**Scavenger Items:** 10 points each = 90 points
- NVidia 5090: 10 pts
- Cup O' Noodles: 10 pts
- Odd Dog: 10 pts
- Beatles Revolver CD: 10 pts
- Cat Mug: 10 pts
- Bringing Up Baby DVD: 10 pts
- Frankenstein book: 10 pts
- Decorative Pumpkin: 10 pts
- Krugerrand coin: 10 pts

**Treats:** 0.5 points each = 10 points (20 treats max)

**Display:**
- Status panel: Keep current X/9 and X/20 display
- Add: "Points: XX / 100"
- HOME screen: Final score with grade
  - 100 pts: "PERFECT! Master Treasure Hunter!"
  - 90-99 pts: "EXCELLENT! Nearly Perfect!"
  - 70-89 pts: "GREAT! Well Done!"
  - 50-69 pts: "GOOD! Keep Exploring!"
  - <50 pts: "Nice Try! Come Back for More!"

**Future Enhancements:**
- Bonus points for puzzle completion
- Time-based scoring
- Difficulty levels

---

## Visual Design

### Color Palette
- **Orange:** #ff9500 (title), #ffa500 (celebrations)
- **Purple:** #6a0dad (dark), #b19cd9 (pale)
- **Yellow:** #ffcc00 (prompts, hints)
- **Green:** #00ff00 (main text), #1acdb2 (command output)
- **Gold:** #ffd700 (victory text)
- **Black:** Background
- **White:** Borders

### Typography
- **Headers:** Cinzel (elegant serif, 40px, bold, orange)
- **Subtitle:** Special Elite (typewriter, 16px, italic, pale purple)
- **Body:** Courier New (monospace, 14px, green)
- **Notes:** Caveat (handwritten cursive, 20px, dark on cream)
- **Victory:** Bold, gold, chiseled text-shadow

### Layout (950×720px game area)
- **Grid:** 607px text area, 313px right panel
- **Header:** 120px (title, subtitle, hints)
- **Text area:** Variable height, scrollable
- **Scavenger grid:** 280px (3×3 with background)
- **Status panel:** Variable (score + commands + compass)
- **Prompt:** 40px input area

### Animations
- **Flash:** Scavenger discovery (2s infinite opacity)
- **Punch-rotate:** Grid celebration (0.6s scale + rotate)
- **Glow-pulse:** Victory grid (2s infinite drop-shadow)
- **Fade-in:** Victory text (1s opacity + scale)

---

## File Structure

### Core Files
- **textAdventure.html** - Main game shell (147 lines)
- **textAdventure.css** - All styles and animations (300+ lines)
- **textAdventure.js** - Core game engine (~2600 lines)

### Data Files (HALLOWEEN-GAME/)
- **gameData.json** - Meta, about, startup text, initial room
- **commands.json** - 17 command definitions with shortcuts
- **rooms-w-doors.json** - 13 rooms, 13 doors, 3 puzzles ⭐ UPDATED
- **items.json** - 27 regular items (candy + quest items)
- **scavengerItems.json** - 11 scavenger items (9 active)
- **uiConfig.json** - Status panel configuration
- **keyboardShortcuts.json** - (Currently unused)

### Assets
- **scavenger/** - 9 items × 2 sizes (90×90, 250×250)
- **candy/** - 23 items × 2 sizes (90×90, 150×150)
- **background/** - Room background images
- **Google Fonts:** Cinzel, Special Elite, Caveat

---

## Technical Architecture

### State Management
```javascript
let currentRoom = "START";              // Player location
let items = {};                          // All game items
let rooms = {};                          // All rooms
let doors = {};                          // Door states
let awaitingQuitConfirmation = false;   // QUIT confirmation
let awaitingCelebrationDismiss = false; // Animation state
```

### Key Functions
- `handleInput()` - Process player commands
- `moveToRoom()` - Navigate between rooms
- `handleTakeCommand()` - Pick up items
- `handleSayCommand()` - Puzzle phrase input
- `showCelebrationGrid()` - Victory animation
- `updateScavengerGrid()` - Real-time grid updates
- `formatScavengerTwoColumns()` - Inventory formatting

### Data Flow
1. Load JSON files (rooms, items, commands)
2. Initialize game state (currentRoom = START)
3. Display welcome text
4. Input loop:
   - Player types command
   - Find and parse command
   - Execute handler function
   - Update game state
   - Update display
   - Check for victory condition

---

## Design Decisions (v0.34 Updates)

### Why Remove INTRO Room?
**Rationale:**
1. **Redundant:** INTRO served only as transition space
2. **Instructions:** Better delivered in STREET-01 where context is relevant
3. **Pacing:** Players reach meaningful content faster
4. **Simplicity:** Fewer rooms = easier to maintain and understand
5. **Flow:** Direct START → STREET-01 feels more natural

**What Was Preserved:**
- All instructional text moved to STREET-01
- Command hints integrated into first arrival
- Narrative connection (light seen from START)

**What Was Lost:**
- Nothing essential - INTRO was purely transitional

### Safe Combination Philosophy
**Current:** 13-97-55 (arbitrary)
**Future Consideration:** Should be:
- Memorable (pattern or significance)
- Hinted in clues
- Not too obvious
- Fits game theme

### Scoring Philosophy (Proposed)
**Goals:**
- Round number (100) feels complete
- Scavenger items worth more (core objective)
- Treats add bonus (completionist reward)
- Grade display motivates replay
- Simple calculation (no complex formulas)

---

## Browser Compatibility

**Tested Browsers:**
- Chrome/Edge (Chromium): ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (minor text-shadow differences)

**Required Features:**
- ES6 JavaScript (arrow functions, template literals)
- CSS Grid and Flexbox
- CSS Animations and Transforms
- Fetch API (JSON loading)
- localStorage (future save system)

**Graceful Degradation:**
- Google Fonts fallback to system fonts
- Images have alt text
- Game playable without animations
- No external dependencies

---

## Version History

**v0.34** (Current) - Streamlined Navigation
- Removed INTRO room completely
- Direct START → STREET-01 connection
- Integrated instructions into STREET-01
- Fixed "well-lit front" typo
- 13 rooms, 13 doors (was 14/14)

**v0.33** - New START Room
- Added START as initial spawn point
- Enhanced STREET-02 with styled "THE RADLEY HOUSE"
- Improved narrative flow

**v0.32** - Victory Celebration & Polish
- 9th item celebration animation
- Two-column inventory
- HINT/CELEBRATE/RESTART/ABOUT commands
- Header redesign

**v0.31** - Pre-celebration checkpoint
**v0.30** - Working game, needs scoring/ending
**Earlier versions** - Core development

---

## Known Issues

**None currently identified** - v0.34 is stable and functional

**Pending Improvements:**
1. Change safe combination to something more thematic
2. Implement point-based scoring system
3. Polish START and STREET-01 introduction text

---

## Future Enhancements

### Short-term (v0.35)
- New safe combination
- Point-based scoring (100-point scale)
- Grade display on HOME screen
- Polish introduction text

### Medium-term
- Save game system (localStorage)
- Achievement tracking
- Sound effects (door creaks, celebration music)
- Mobile optimization

### Long-term
- Additional rooms/areas
- More puzzles
- Multiple endings
- Difficulty levels
- Hint system expansion

---

*Last updated: October 7, 2025*
*Version 0.34: Streamlined Navigation*
*Game ready for scoring implementation and text polish*
