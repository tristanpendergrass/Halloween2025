# The Radley House - Game Specifications
# v0.19.1d - FINAL RELEASE

## Project Overview

**Game Title:** The Radley House
**Subtitle:** A well-articulated treasure hunt
**Version:** 0.19.1d (FINAL)
**Status:** ✅ RELEASED - Feature Complete!
**Total Project Size:** ~350KB (with all assets, images, and fonts)
**Source Files:** 8 core files + 7 data JSON files + 38 items + documentation + images
**Architecture:** Clean vanilla HTML/CSS/JavaScript with visual scavenger tracking, victory celebration animations, handwritten notes, locked doors, hidden items, interactive puzzles, two-column inventory, and comprehensive command system
**Target Platform:** Web browsers (GitHub Pages compatible)
**Current State:** Fully functional text adventure with rich visual feedback, victory celebration, polished UI, hidden commands, and comprehensive player guidance

---

## Major Features

### Scavenger Item Display System ✨ NEW in v0.35

#### Side-by-Side Layout
When taking a scavenger item, the display now shows:
- **250×250px item image** on the left
- **Stacked text badge** on the right

**Badge Format:**
```
*********
SCAVENGER
  HUNT
   ITEM
*********
   one
   of
  nine
```

**Technical Implementation:**
- Flexbox layout (`display: flex; align-items: flex-start;`)
- Gap: 20px between image and badge
- Badge padding-top: 60px (vertical centering)
- Each line is a separate span with `scavenger-found` class
- Manual `&nbsp;` spacing for staggered indent effect
- Flashing animation on all badge text

**Display Sequence:** (Updated in v0.36)
1. Take response text
2. Blank line
3. **Image + Badge (side-by-side)**
4. Blank line
5. **Item description** (not full examine text)
6. Blank line
7. Auto-LOOK (room description, items, exits)

**Note:** Full examine text (including legal disclaimers) only shows when player explicitly examines the item.

**Space Requirements:**
- Text area width: 607px (577px usable)
- Image + gap + badge: ~390px (fits comfortably)

#### Scavenger Item Discovery Animations
- **Flashing badge animation:**
  - Duration: 2s
  - Easing: ease-in-out
  - Loop: infinite
  - Effect: opacity 1.0 → 0.3 → 1.0
  - Color: #ffa500 (bright orange/gold)
  - Applied to all badge spans

### Auto-LOOK After Scavenger Pickup NEW in v0.35

**Behavior:**
After collecting any scavenger item, automatically displays:
- Blank line
- Room description ("You are in the LIBRARY")
- Items in room ("YOU SEE: brass key")
- Exits ("EXITS: east, north")

**Purpose:**
- Smooth continuation of gameplay
- Reorients player after item pickup
- Shows what else is available to explore
- No manual LOOK command needed

### Empty Enter Key Handler NEW in v0.35

**Behavior:**
- **First empty Enter:** Shows helpful hint + auto-executes LOOK
- **Subsequent empty Enters:** Silent (anti-spam)
- **Reset:** Any actual command resets the flag

**Hint Message:**
```
I'll remind you of where you are now - but... btw... you can always use the
scroll bar to scroll back in your game to see what happened earlier!
```

**Purpose:**
- Helps confused/stuck players
- Teaches scroll functionality
- Reorients player without punishment
- Prevents accidental spam

### Content Updates - v0.35

#### Beatles → Monster Mash
**Monster Mash CD** (MUSIC-ROOM)
- Bobby Pickett, 1962
- Clue: "Graveyard smash"
- Description: "The 1962 Monster Mash song by Bobby Pickett - a twisted horror song"
- Examine: "A scary, vampire themed horror song that kids play repeatedly when they want to REALLY annoy their parents. 'I was working in the lab, late one night... We did the Monster Mash!'"
- Images: monsterMashCD90x90.png, monsterMashCD250x250.png
- Points: 10

#### Bringing Up Baby → Stranger Things
**Stranger Things DVD** (TV-ROOM)
- Netflix 2016 series, starring Millie Bobby Brown
- Clue: "Schwinn Sting-Ray" (bikes featured in show)
- Description: "A DVD of the 2016 Netflix series Stranger Things"
- Examine: "An old style clamshell case DVD of the 2016 Netflix series Stranger Things. Not scratched at all!"
- **Legal Disclaimer** (slow-blinking animation):
  ```
  (LEGAL DISCLAIMER:'Stranger Things' is a trademark of Netflix Inc.
  and is brought to you by paid subscription only by Netflix.
  Click HERE to subscribe. Season 5, Volume 1 COMING SOON on November 26, 2025!
  Hold onto your walkie-talkies and mark your calendar!)
  ```
- Images: strangerThings90x90.png, strangerThings250x250.png
- Points: 10

#### Mrs. McGillicutty's List Updates
Changed clues:
- "Fab Four" → "Graveyard smash" (Monster Mash)
- "Playful tiger" → "Schwinn Sting-Ray" (Stranger Things)

#### TV ROOM Description Updates
- Changed from "Bringing Up Baby" movie to "Stranger Things" show
- New description: "kids on bikes are racing through a dark forest, flashlights cutting through the fog"
- Look text: "currently playing 'Stranger Things'"
- DVD cabinet reveals "strangerthings" item (not "bringingupbaby")

### FOYER Entrance Effect NEW in v0.35

**Staggered "cautiously" text:**
```
You c
     a
      u
       t
        i
         o
          u
           s
            l
             y enter the Radley House FOYER...
```

Implementation: `<br>&nbsp;` tags with incrementing spaces (c=0, a=5, u=6, etc.)
Purpose: Dramatic emphasis for entering the scary house

### Room Name Capitalization NEW in v0.35

All house room names standardized to UPPERCASE:
- FOYER, LIBRARY, DINING ROOM, STUDY
- MUSIC ROOM, GAME ROOM, KITCHEN
- BEDROOM, TV ROOM

Consistent display throughout game text.

### 9th Item Victory Celebration Animation

**Sequence:**
1. Normal "nine of nine" message displays
2. 3-second delay
3. **Grid Animation Begins:**
   - Semi-transparent dark overlay (85% opacity black)
   - 3×3 grid of all 9 scavenger items
   - Images sized to 165×165px with 5px gaps
   - 2px white border around grid
   - Centered in text area using fixed positioning

**Animation Details:**
- **Punch-rotate effect:**
  - Each image starts at 10% scale, 0° rotation, opacity 0
  - Rotates 360° while scaling to 110% (60% mark)
  - Settles to 100% scale, opacity 1
  - 0.6s duration per image
  - Staggered by 0.15s (9 images = ~1.5s total animation)
- **Glowing aura:**
  - Orange/gold drop-shadow filters
  - Pulsing animation (2s infinite loop)
  - Starts after punch animation completes

**Victory Text Overlay:**
- Appears 5 seconds after grid starts
- Centered over grid with fade-in + scale animation
- **Content:**
  ```
  YOU WON! (48px)
  You found all NINE
  SCAVENGER ITEMS!

  Arthur and Mr. Radley (28px)
  CONGRATULATE YOU!! (28px)
  ```
- **Styling:**
  - Gold color (#ffd700)
  - Bold font
  - Chiseled text-shadow effect (black + white highlights)
  - Additional gold glow
  - Semi-transparent black background (85%)
  - 4px gold border with rounded corners

**Dismissal:**
- Player presses Enter to dismiss
- Overlay fades out over 0.5s
- Returns to normal game display
- Input blocked during celebration (`awaitingCelebrationDismiss` flag)

### Two-Column Inventory Display

**Implementation:**
- Scavenger items display in 2 columns instead of 1
- Reduces vertical space from 9 lines to 5 lines
- Prevents text overflow on HOME/QUIT screen

**Layout:**
```
SCAVENGER ITEMS (9/9)
  NVidia 5090 Video Card    Monster Mash CD
  Wrigley's Doublemint Gum  Cat Mug
  Odd Dog                   Stranger Things DVD
  Frankenstein book         Decorative Pumpkin
  Indian Head pennies
```

### Hidden Commands System

#### HINT Command
- **Purpose:** Reveals all secret commands and aliases
- **Shortcut:** SECRETS
- Displays two-column formatted list of all command shortcuts

#### CELEBRATE Command
- **Purpose:** Replay victory animation
- **Requirement:** Must have all 9 scavenger items
- **Error:** "You have not won yet! You must collect all nine scaventer items to win."
- Shows count: "Found: X / 9"

#### RESTART Command
- **Purpose:** Reload game from beginning
- Implementation: `location.reload()`
- Header hint: "Type **RESTART** to start a new game"

#### DEBUG Command (Enhanced in v0.35)
- **Purpose:** Testing and development
- Adds 8 scavenger items (all except pumpkin)
- Adds 15 random candy/treats
- Marks all as found
- Updates inventory and scavenger grid
- **NEW:** Checks if all 9 items collected after adding
- **NEW:** Triggers celebration if player already had pumpkin
- **Messages:**
  - With pumpkin: "You now have all 9 scavenger items! Celebration incoming..."
  - Without pumpkin: "You still need to find the pumpkin - check the FOYER."

#### ABOUT Command
- Display game information and credits
- Editable in gameData.json

#### THROW Command (Easter Egg)
- Hidden command not in HELP
- Shortcuts: throw, toss, chuck, hurl
- Always refuses with humorous messages

### Command Shortcuts Cleanup NEW in v0.35

**Valid Shortcuts (matching commands.json):**
- take: [t, get, g] ❌ NOT: grab, pick
- examine: [x, ex, read]
- drop: [] ❌ NO shortcuts (not put, place)
- help: [h, ?]
- use: [u, ring, turn]
- say: [speak, push, press, dial]
- open: [unlock]

**Fixed Locations:**
- showHelp() function display
- handleHintCommand() alias list
- CONFIG_FALLBACKS command definitions

### Visual Scavenger Hunt System

**3×3 Grid Display:**
- Grid area: 313×280px in top-right of screen
- 9 squares representing each scavenger item
- Background: Radley House silhouette or HOME background
- Real-time updates as items are discovered

**Item Discovery:**
- Green checkmark (✓) appears when item found
- 90×90px image displays in grid
- Square position determined by room's `displaySquare` property
- Items remain visible throughout game

---

## v0.19.1d Final Polish 🆕

### Dynamic Curfew Urgency System
**Problem:** Static curfew display didn't convey urgency when player was late.
**Solution:** Three-tier visual feedback system.

**Stages:**
1. **On Time (before 8:30 PM):**
   - White text and border
   - Matches status box styling

2. **Late (8:31 PM+):**
   - Medium bright red (#ff5555)
   - Static (no animation)

3. **Very Late (8:41 PM+):**
   - Medium bright red
   - Slow flash (1.5s cycle)
   - Time value fades 100% → 40% → 100%

4. **Super Late (8:46 PM+):**
   - Medium bright red
   - Fast urgent flash (0.6s cycle)
   - Rapid pulsing effect

**Implementation:**
- CSS: `curfewFlash` keyframe animation
- JavaScript: Classes `curfew-late`, `curfew-very-late`, `curfew-super-late`
- Only time value flashes (box and label remain solid)

**Bug Fix:** Changed `updateGameTime()` to call `updateGameStatus()` instead of `updateClockDisplay()` so curfew styling updates when time advances.

### Universal Auto-LOOK System 🆕
**Problem:** Players felt "left hanging" after commands - no orientation or guidance.
**Solution:** Automatically display room description after EVERY typed command.

**Commands Enhanced (9 total):**
- EAT - Shows room after eating candy
- INVENTORY - Shows room after viewing inventory
- DROP - Shows room after dropping item
- HELP - Shows room after help text
- SAY - Shows room after saying phrases (5 branches)
- USE - Shows room after using items (5 branches)

**Pattern:**
```
[Command output]
[Blank line]
[Room name]
[Items present]
[Available exits]
```

**Result:** Players always know where they are and what to do next.

### Bookmark Drop Bug Fix 🆕
**Problem:** Bookmark showed in inventory but couldn't be dropped (error message).
**Root Cause:** Missing `take` action in items.json prevented DROP command from finding it.
**Solution:** Added `take` action to oldnote (bookmark) item definition.
**Result:** Now shows proper message: "You worked hard to find this treasure! You cannot drop it."

---

## v0.19.1 New Features

### Cheerful Doorbell Color 🆕
**Problem:** Doorbell "Ding Dong!" used light blue (#00BFFF) - not welcoming enough for friendly Mrs. McGillicutty.
**Solution:** Changed to bright golden yellow (#FFD700) with sunny glow effect.
- Location: `items.json` line 57 (doorbell use action)
- Creates warm, cheerful, welcoming appearance

### Context-Aware FOYER Hints 🆕
**Problem:** Static hint about picking up items wasn't helpful for players without the scavenger list.
**Solution:** Two different hints based on list status.

**With List (examined):**
```
[hint: type take <item> or get <item> to pick up items you find.]
```

**Without List (or not examined):**
```
[Hint: You will need to obtain and examine the scavenger hunt list from Mrs. McGillicutty to find the items!]
```
(Displayed in **bold** for emphasis)

- Implementation: theRadleyHouse.js lines 679-698
- Added `hasBeenExamined` flag to mrsmcgillicuttyslist
- Conditional logic checks both possession AND examination

### SAY Command Time Penalty Fix 🆕
**Problem:** ALL SAY commands consumed 1 minute, even nonsensical ones like "SAY BLAHBLAH".
**Solution:** Invalid SAY commands now show error with NO time penalty.

**Valid SAY commands that consume time:**
- SAY 666 (opens safe)
- SAY friend (unlocks secret door)
- SAY music/movie/game (stereo buttons)

**Invalid SAY commands (no time penalty):**
- Shows error: `"blahblah" doesn't really do anything.`
- Location: theRadleyHouse.js lines 1884-1889

### HOME/QUIT Zero Time Penalty 🆕
**Problem:** HOME/QUIT had 2-minute timer, typed twice = 4 minutes penalty!
**Solution:** Changed to 0 minutes (matches other system commands).
- Location: `commands.json` line 77
- Now consistent with help, look, inventory, score, etc.

### DVD Cabinet Examination Requirement 🆕
**Problem:** Players could open cabinet immediately without discovering it first.
**Solution:** Gate opening behind examination (matching other puzzle patterns).

**Implementation:**
- Added `hasBeenExamined: false` to dvdcabinet (items.json line 278)
- Hint moved from TV-ROOM enterText to cabinet examine text
- Gate logic in handleOpenCommand (theRadleyHouse.js lines 1935-1942)
- Flag set when examined (theRadleyHouse.js lines 2357-2360)
- **Failed open attempts have NO time penalty**

**Flow:**
1. Enter TV-ROOM → see cabinet mentioned
2. Examine cabinet → see hint about opening
3. Open cabinet → get Stranger Things DVD

---

## Game Structure

### Scavenger Hunt Items (9 Total)

**Current List:**

1. **NVidia 5090 Video Card** (GAME-ROOM)
   - Clue: "Video game hardware helper"
   - Hidden, revealed by examining powerful PC
   - Points: 10

2. **Wrigley's Doublemint Gum** (KITCHEN)
   - Clue: "Double your fun"
   - Visible from start
   - Points: 10

3. **Indian Head Pennies** (STUDY) 🆕 v0.36
   - Clue: "Old sense" (sounds like "old cents")
   - Two Indian Head pennies, c1909
   - Hidden in safe, requires combination 6-6-6
   - Must find and examine bookmark (from Frankenstein book) to learn combination
   - Points: 10

4. **Monster Mash CD** (MUSIC-ROOM) 🆕
   - Clue: "Graveyard smash"
   - Bobby Pickett, 1962
   - Visible from start
   - Points: 10

5. **Cat Mug** (DINING-ROOM)
   - Clue: "Scary Feline"
   - Black ceramic cat-shaped mug
   - Visible from start
   - Points: 10

6. **Stranger Things DVD** (TV-ROOM) 🆕
   - Clue: "Schwinn Sting-Ray" (bikes in show)
   - Netflix 2016 series
   - Hidden in DVD cabinet (must examine cabinet before opening - v0.19.1)
   - Points: 10

7. **Frankenstein Book** (LIBRARY)
   - Clue: "Not a monster" (Frankenstein is the doctor)
   - First Edition 1818 novel
   - Visible from start
   - Contains bookmark with safe combination
   - Points: 10

8. **Decorative Pumpkin** (FOYER)
   - Clue: "gourd"
   - Glass hand-blown pumpkin
   - Visible from start
   - Points: 10

9. **Odd Dog** (BEDROOM)
   - Clue: "Odd pup"
   - King Charles Cavalier ceramic figurine
   - Requires brass key from LIBRARY
   - Points: 10

### Rooms (13 total)

**Exterior:**
- START - Halloween Night (starting location)
- STREET-01, STREET-02
- NICE-PORCH (McGillicutty's)
- FRONT-PORCH (Radley House)

**Interior (Radley House):**
- FOYER, LIBRARY, DINING ROOM, STUDY
- MUSIC ROOM, GAME ROOM, KITCHEN
- BEDROOM, TV ROOM

**Special:**
- HOME (end game location)

### Commands (17 total)

**Movement:** north/n, south/s, east/e, west/w
**Observation:** look/l, examine/x/ex/read
**Inventory:** inventory/i, take/t/get/g, drop
**Actions:** use/u/ring/turn, eat, open/unlock, say/speak/push/press/dial
**System:** help/h/?, quit/home, hint/secrets, restart, about
**Hidden:** throw/toss/chuck/hurl, debug, celebrate

---

## Visual Design

### Layout Dimensions

**Overall Game Panel**: 950px × 720px

**Grid Layout:**
- Left column: 607px (text area + prompt)
- Right column: 313px (scavenger grid + status)
- Gap: 10px

**Text Area Usable Width**: 577px (607px - 30px padding)

### Color Palette

**Primary Colors:**
- Background: `#0a0a0a` (near black)
- Text (standard): `#00ff00` (bright green)
- Borders: `#ffffff` (white)
- Error text: `#ff0000` (red)
- Hint text: `#ffcc00` (yellow-gold)

**Accent Colors:**
- Scavenger found: `#ffa500` (bright orange/gold) - flashing
- Title: `#ff9500` (orange) with purple glow (`#6a0dad`)
- Legal disclaimer: `#ffdd77` (warm golden-yellow) - slow blinking

### Animations

**Flash Animation** (scavenger-found):
- Duration: 2s, infinite loop
- Effect: opacity 1.0 → 0.3 → 1.0

**Slow Blink Animation** (legal disclaimers): 🆕
- Duration: 3s, infinite loop
- Effect: opacity 1.0 → 0.5 → 1.0
- Used for Stranger Things disclaimer

**Punch Rotate** (celebration):
- Duration: 0.6s per item
- Staggered start (0.15s delay each)
- Effect: scale + rotate

---

## Technical Notes

### File Structure

```
theRadleyHouse/
├── theRadleyHouse.js        # Main game logic (~3150 lines)
├── theRadleyHouse.css       # Styling + animations
├── index.html              # Game container
├── HALLOWEEN-GAME/         # Game data (JSON)
│   ├── gameData.json
│   ├── commands.json
│   ├── rooms-w-doors.json
│   ├── items.json
│   └── scavengerItems.json
├── assets/
│   ├── scavenger/          # 90x90 + 250x250 images
│   └── background/
└── claude-john-docs/
```

### State Management

- `currentRoom` - Player location
- `items[].location` - Item placement
- `items[].found` - Discovery tracking
- `awaitingQuitConfirmation` - Quit flow
- `awaitingCelebrationDismiss` - Animation control
- `lastWasEmptyEnter` - Empty Enter spam prevention 🆕

### Key Helper Functions

- `formatScavengerTwoColumns()` - Two-column layout
- `numberToWord()` - Number to word conversion
- `showCelebrationGrid()` - Victory animation
- `lookAtRoom()` - Room description display
- `updateScavengerGrid()` - Visual updates

---

## Version History

**v0.19.1d** (Current) - FINAL RELEASE! 🎉
- Dynamic curfew urgency system (white → red → slow flash → fast flash)
- Universal auto-LOOK after all commands (9 commands enhanced)
- Bookmark drop bug fix (added take action)
- Bug fix: curfew color now updates when time advances
- **STATUS:** Feature complete, RELEASED! ✅

**v0.19.1** - RELEASE CANDIDATE
- Doorbell color changed to cheerful golden yellow (#FFD700)
- FOYER hints now context-aware (list status dependent)
- SAY command fixed (no time penalty for invalid phrases)
- HOME/QUIT zero time penalty (was 4 minutes total!)
- DVD cabinet examination requirement added

**v0.39** - Puzzle Gating, Context-Aware HOME Messages, UI Improvements
- Scavenger items gated by list examination
- Six context-aware HOME messages (on time/late × items collected)
- Puzzle examination requirements (stereo, parchment)
- Premium apple enhancement (-4 timer)
- HOME screen always shows inventory
- Multiple bug fixes

**v0.37** - Wrigley's Doublemint Gum Replacement
- Replaced Cup O' Noodles with Wrigley's Doublemint Gum (KITCHEN)
- Updated Mrs. McGillicutty's list clue #2: "Food from the sea" → "Double your fun"
- New images: wrigleysOldDoublemintGumPack90x90.png, wrigleysOldDoublemintGumPack250x250.png
- Description: "An unopened pack of Wrigley's Doublemint Gum."
- Examine: "Old pack of Wrigley's Doublemint Gum. Very old. 'Double your pleasure, double your fun, with Doublemint, Doublemint chewing gum!'"

**v0.36** - Safe Puzzle Enhancement & Indian Head Pennies
- NICE-PORCH light behavior fix (based on doorbell use, not visit count)
- Scavenger pickup shows description instead of full examine text
- Safe combination changed to 6-6-6 ("number of the beast")
- Bookmark clue changed from showing numbers to "number of the beast"
- Krugerrand replaced with Indian Head pennies (c1909)
- Mrs. McGillicutty's list clue #3: "Atomic 79" → "Old sense"
- Safe requires bookmark in inventory AND examined
- NICE-PORCH enterText less presumptive about player actions

**v0.35** - Scavenger Display Redesign & Content Updates
- Side-by-side scavenger item display (image + badge)
- Empty Enter key handler with helpful hint
- Beatles → Monster Mash replacement
- Bringing Up Baby → Stranger Things replacement
- Mrs. McGillicutty's list clue updates
- Room name capitalization standardization
- FOYER "cautiously" staggered text effect
- Gong handle text fixes
- Command shortcuts cleanup
- Auto-LOOK after scavenger pickup
- DEBUG command celebration trigger
- CELEBRATE error message update

**v0.32** - Victory Celebration & Polish
- 9th item celebration animation
- Two-column inventory
- HINT/CELEBRATE/RESTART/ABOUT commands
- Header redesign with Halloween theme

**v0.31** - Pre-celebration checkpoint
**v0.30** - Working game, needs scoring/ending
**Earlier versions** - Core development

---

---

## Current Scoring System ⚠️ NOT IMPLEMENTED

### Status: COUNTS ONLY - No Point Calculation

**The game displays "SCORE" but only shows item COUNTS, not actual points.**

#### What Exists:
- All items have a `points` property defined in JSON
- `player.score` variable initialized in gameData.json
- UI panel titled "SCORE"

#### What's Missing:
- ❌ No score calculation when items collected
- ❌ No score update in handleTakeCommand()
- ❌ No final score display on HOME/QUIT screen
- ❌ Status panel shows counts instead of points

### Current vs. Desired Display

**Current (v0.37):**
```
SCORE
Scavenger Items: 3 / 9
Treats:          5 / 20
```

**Desired:**
```
SCORE: 35 / 108
Scavenger Items: 3 / 9 (30 pts)
Treats:          5 / 20 (5 pts)
```

### Point Values Defined (But Not Used)

**Scavenger Items:** 10 points each
- Total possible: 90 points (9 items)

**Candy/Treats:** 1 point each
- Total possible: ~18 points (~18 items)

**Maximum Score:** ~108 points

### Code Locations for Implementation

1. **Score Update:** theRadleyHouse.js:1076-1083 (handleTakeCommand)
   - Add: `player.score += (item.points || 0);`

2. **Display Update:** theRadleyHouse.js:2548-2553 (updateGameStatus)
   - Show actual score instead of just counts

3. **Final Score:** HOME/QUIT screen
   - Add score breakdown and grade/ranking

### Planned Enhancements

**Bonus Points:**
- All 9 scavenger items: +10 bonus
- Collect 20 treats: +5 bonus
- Perfect game bonuses

**Scoring Tiers:**
- 100-108: A+ (Perfect!)
- 90-99: A (Excellent!)
- 80-89: B (Very Good!)
- 70-79: C (Good!)
- 60-69: D (Acceptable)
- 0-59: F (Try Again!)

**Next Major Task:** Implement full scoring system with point calculation and display.

---

## Safe Puzzle System 🆕 v0.36

### Requirements to Open Safe
1. Player must be in STUDY room
2. Player must have **bookmark** in inventory (revealed by examining Frankenstein book)
3. Player must have **examined the bookmark** (shows "number of the beast")
4. Player must enter correct combination: **SAY 6-6-6**

### Puzzle Flow
1. Find **Frankenstein book** in LIBRARY
2. **EXAMINE BOOK** → reveals bookmark (auto-added to inventory)
3. **EXAMINE BOOKMARK** → see "number of the beast"
4. Recognize that "number of the beast" = 666
5. Go to STUDY
6. **SAY 6-6-6** (or SAY 666)
7. Safe opens, reveals Indian Head pennies + parchment

### Error Messages
- Without bookmark: "You don't know the combination. You'll need to find a clue somewhere."
- With bookmark but not examined: "The safe will not open until you find the clue about the combination."

### Technical Implementation
- `bookmark.hasBeenExamined` flag tracks examination
- Flag set in both examine code paths (items with/without take actions)
- Safe opening validates: bookmark location, hasBeenExamined flag, combination match

---

*Last updated: October 14, 2025 - v0.19.1d FINAL RELEASE*
*The Radley House is READY for Halloween 2025!* 🎃👻🏚️✅
