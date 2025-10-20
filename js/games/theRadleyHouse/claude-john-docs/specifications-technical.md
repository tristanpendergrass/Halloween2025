# The Radley House - Technical Specifications
## v0.32 - Victory Celebration & Polish Complete

Last Updated: October 6, 2025

---

## Architecture Overview

### Technology Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6)
- **No frameworks:** Pure web standards for maximum compatibility
- **No build process:** Direct file editing and browser refresh
- **Deployment:** GitHub Pages compatible (static files only)

### File Organization
```
theRadleyHouse/
├── index.html                  # Main game shell
├── theRadleyHouse.css          # All styles and animations
├── theRadleyHouse.js           # Core game engine (~3150 lines)
├── HALLOWEEN-GAME/
│   ├── gameData.json           # Meta, about, startup text
│   ├── commands.json           # 17 command definitions
│   ├── rooms-w-doors.json      # 13 rooms, 13 doors, 3 puzzles
│   ├── items.json              # 27 regular items
│   ├── scavengerItems.json     # 11 scavenger items (9 active)
│   ├── uiConfig.json           # Status panel config
│   └── keyboardShortcuts.json  # (Currently unused)
└── assets/
    ├── scavenger/              # 9 items × 2 sizes
    ├── candy/                  # 23 items × 2 sizes
    └── background/             # Room backgrounds
```

---

## Victory Celebration System (v0.32)

### Implementation: showCelebrationGrid()

**Challenge:** Display 3×3 grid of scavenger items over text area without disrupting layout.

**Solution:**
1. **Fixed positioning:** Calculate text div position with `getBoundingClientRect()`
2. **Append to body:** Avoids overflow issues from text div's `overflow-y: auto`
3. **Absolute children:** Grid and text overlay positioned within fixed parent
4. **CSS animations:** GPU-accelerated transforms for smooth performance

**Code Architecture:**
```javascript
showCelebrationGrid() {
  // 1. Get text area coordinates
  const rect = textDiv.getBoundingClientRect();

  // 2. Create fixed overlay at exact position
  overlay.style.position = 'fixed';
  overlay.style.top = rect.top + 'px';
  overlay.style.left = rect.left + 'px';

  // 3. Build grid HTML with staggered animations
  scavengerItems.forEach((item, index) => {
    gridHTML += `<img ... style="animation-delay: ${index * 0.15}s">`;
  });

  // 4. Add text overlay after 5 seconds
  setTimeout(() => { /* Add victory text */ }, 5000);

  // 5. Set dismissal flag
  awaitingCelebrationDismiss = true;
}
```

**Animation Sequence:**
- **punchRotate:** 0.6s per image (scale + rotate)
- **glowPulse:** 2s infinite (starts after punch)
- **fadeInText:** 1s for victory message
- Total: ~8 seconds for full experience

**Performance Notes:**
- CSS transforms use GPU acceleration
- Images pre-loaded during gameplay
- Single DOM append (not 9 separate ones)
- Smooth 60fps on modern browsers

### Dismissal: restoreNormalDisplay()

**Clean Transition:**
```javascript
restoreNormalDisplay() {
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.5s ease-out';
  setTimeout(() => { overlay.remove(); }, 500);
  awaitingCelebrationDismiss = false;
}
```

**State Management:**
- Flag blocks input during animation
- Checked in `handleInput()` before processing
- Enter key calls restore function
- No memory leaks (removes DOM node)

---

## Two-Column Inventory System (v0.32)

### Problem: Vertical Overflow
- 9 scavenger items = 9 lines
- HOME screen text + inventory exceeded viewport
- Text scrolled out of visible area

### Solution: formatScavengerTwoColumns()

**Algorithm:**
```javascript
function formatScavengerTwoColumns(scavengerItems) {
  const columnWidth = 33;  // Total width for left column
  const midpoint = Math.ceil(items.length / 2);

  for (let i = 0; i < midpoint; i++) {
    const leftItem = items[i];
    const rightItem = items[i + midpoint];

    // Key: Strip HTML tags before measuring length
    const leftText = `  ${leftItem.display}`;
    const displayLength = leftText.replace(/<[^>]*>/g, '').length;

    // Use &nbsp; entities (browsers won't collapse)
    const padding = '&nbsp;'.repeat(columnWidth - displayLength);

    // Combine columns
    formattedLines.push(leftText + padding + (rightItem?.display || ''));
  }
}
```

**Why This Works:**
- **HTML tag stripping:** `<b>Beatles</b>` counts as 7 chars, not 14
- **Non-breaking spaces:** Regular spaces collapse in HTML
- **Math.ceil:** Handles odd numbers (9 items = 5 rows)
- **Optional chaining:** Gracefully handles last row when odd

**Space Savings:**
- Before: 9 lines
- After: 5 lines
- Reduction: 44% vertical space

---

## HINT Command System (v0.32)

### Design Goal
Provide comprehensive reference for all commands and shortcuts in compact format.

### Implementation: handleHintCommand()

**Two-Section Display:**

1. **Hidden Commands** (vertical list):
   ```
   ABOUT - Game information
   DEBUG - Testing items
   CELEBRATE - Replay victory
   ...
   ```

2. **Command Aliases** (two columns):
   ```
   north      [n]         look       [l]
   south      [s]         examine    [x, ex, read]
   ...
   ```

**Column Alignment:**
```javascript
"  north      [n]" + "&nbsp;".repeat(23 - 16) + "look       [l]"
"  help       [h, ?]" + "&nbsp;".repeat(24 - 19) + "inventory  [i]"
```

**Variable Padding:**
- Left column items have different lengths
- Each line calculates padding independently
- `help [h, ?]` is longer, needs fewer spaces
- Maintains visual alignment across all rows

**Why Manual Padding?**
- HTML collapses multiple spaces
- CSS `white-space: pre` would affect entire game
- `&nbsp;` entities preserve exact spacing
- Full control over layout

---

## Command System Architecture

### Command Registration (commands.json)

**Structure:**
```json
{
  "command_name": {
    "includeInGame": true,
    "type": "action|movement|system",
    "shortcuts": ["alias1", "alias2"],
    "action": "handler_name"
  }
}
```

**Command Processing Flow:**
1. **Input:** Player types command
2. **findCommand():** Fuzzy matching (exact → shortcut → prefix)
3. **processCommand():** Routes to handler based on action
4. **Handler:** Executes command logic
5. **Buffer:** Results added to text display

### Fuzzy Matching Algorithm

```javascript
findCommand(cmd) {
  // 1. Exact match
  if (commands[cmd]) return { type: "exact", command: cmd };

  // 2. Shortcut match (priority)
  for (const [name, data] of Object.entries(commands)) {
    if (data.shortcuts?.includes(cmd)) {
      return { type: "shortcut", command: name };
    }
  }

  // 3. Prefix match (2+ characters)
  if (cmd.length >= 2) {
    const matches = Object.keys(commands).filter(name =>
      name.startsWith(cmd)
    );
    if (matches.length === 1) {
      return { type: "prefix", command: matches[0] };
    }
  }

  return { type: "unknown" };
}
```

**Why This Matters:**
- Typing "n" triggers "north" (shortcut)
- Typing "ex" triggers "examine" (prefix)
- Typing "e" is ambiguous (east or examine) → uses shortcut priority
- Natural, forgiving UX

### New Commands Added (v0.32)

**ABOUT:**
- **Storage:** gameData.json → "about" section
- **Rationale:** Non-developers can edit game info
- **Format:** Same as startup.welcomeText (array of text objects)
- **Handler:** Simple loop through text array

**RESTART:**
- **Implementation:** `location.reload()`
- **Why:** Simplest way to reset all state
- **Alternative considered:** Manual state reset (rejected as error-prone)

**CELEBRATE:**
- **Implementation:** Calls `showCelebrationGrid()` directly
- **Validation:** Checks scavenger count before allowing
- **Use case:** Demos, testing, showing off to friends

**HINT:**
- **Implementation:** Static text display
- **Alternative considered:** Dynamic command list generation (rejected as overkill)
- **Trade-off:** Manual updates when commands change vs. complex code

---

## State Management

### Global State Variables
```javascript
let currentRoom = "STREET-01";          // Player location
let items = {};                          // All game items
let rooms = {};                          // All rooms
let doors = {};                          // Door states
let awaitingQuitConfirmation = false;   // QUIT flow
let awaitingCelebrationDismiss = false; // Animation flow
```

### Item State Tracking
```javascript
items['pumpkin'] = {
  location: "FOYER",           // Current location
  found: false,                // Scavenger tracking
  visible: true,               // Can player see it?
  locked: false,               // Is it locked?
  hasBeenOpened: false,        // One-time state
  // ... other properties
}
```

### State Transitions

**Item Collection:**
```
1. Player types TAKE PUMPKIN
2. Validation (is item here? can we take it?)
3. Update: item.location = "INVENTORY"
4. Update: item.found = true (if scavenger)
5. Check: Is this 9th item?
6. Trigger: showCelebrationGrid() if yes
7. Update: UI panels (status, scavenger grid)
```

**Door Unlocking:**
```
1. Player moves NORTH
2. Check: Is door locked?
3. Check: Does player have key?
4. Update: door.locked = false
5. Update: door.open = true
6. Move: currentRoom = destination
```

---

## CSS Animation System (v0.32)

### Keyframe Animations

**Punch-Rotate (Victory Grid):**
```css
@keyframes punchRotate {
  0% {
    transform: scale(0.1) rotate(0deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.1) rotate(360deg);  /* Overshoot */
  }
  100% {
    transform: scale(1) rotate(360deg);    /* Settle */
    opacity: 1;
  }
}
```

**Why 60% Overshoot?**
- Creates "bounce" effect
- More satisfying than linear growth
- Draws eye to each item
- Classic animation principle

**Glow Pulse (Victory Grid):**
```css
@keyframes glowPulse {
  0%, 100% {
    filter: drop-shadow(0 0 10px orange);
  }
  50% {
    filter: drop-shadow(0 0 20px orange);
  }
}
```

**Stacked Animations:**
```css
animation: punchRotate 0.6s ease-out forwards,
           glowPulse 2s ease-in-out infinite 0.6s;
```
- First: Punch-rotate once
- Second: Glow pulse forever (starts after punch)
- `forwards`: Keeps end state
- `infinite`: Loops continuously

**Flash (Scavenger Discovery):**
```css
@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```
- 2s duration
- Infinite loop
- Attached to `.scavenger-found` class

### Text Shadow Effects

**Chiseled Title:**
```css
text-shadow:
  0 0 10px #6a0dad,      /* Purple glow */
  0 0 20px #6a0dad,      /* Stronger purple */
  2px 2px 4px #000;      /* Black depth */
```

**Why Multiple Shadows?**
- Layering creates depth
- Glow + shadow = 3D effect
- Works on black background
- Readable at any size

---

## Performance Considerations

### Text Buffer System
- **Problem:** Directly appending to DOM is slow
- **Solution:** Buffer text lines, batch update
- **Implementation:** `addToBuffer([])` → `updateTextDisplay()`

### Image Loading
- **Problem:** Layout shift when images load
- **Solution:** `onload` handler scrolls after dimensions known
- **Code:** `onload="document.querySelector('.text').scrollTop = ..."`

### Animation Performance
- **Transforms:** Use `transform` (GPU) not `left/top` (CPU)
- **Opacity:** Animating opacity is efficient
- **Will-change:** Not needed (modern browsers optimize automatically)

### Memory Management
- **Celebration cleanup:** `overlay.remove()` not `overlay.style.display = 'none'`
- **Event listeners:** Minimal use, centralized handling
- **Image assets:** Reasonably sized (~20KB each)

---

## Data Structure Decisions

### Why Separate items.json and scavengerItems.json?

**Rationale:**
1. **Conceptual separation:** Different item types, different purposes
2. **Easier editing:** Scavenger items have extra properties (displaySquare, icon250x250)
3. **Merge at runtime:** `mergeScavengerItems()` combines them
4. **Historical:** Scavenger system added later

**Alternative Considered:**
- Single items.json with `type: "scavenger"` flag
- **Rejected:** Harder to navigate large file

### Why gameData.json for ABOUT text?

**Rationale:**
1. **Non-technical editing:** No code knowledge required
2. **Consistency:** Same format as welcomeText
3. **Future-proof:** Easy to add more configurable text sections

**How It Works:**
```javascript
gameData.about.text.forEach(line => addToBuffer([line]));
```

Simple loop, no special parsing needed.

---

## Future Enhancement Possibilities

### Technical Debt
- None currently identified
- Code is clean and maintainable

### Potential Features (Technical Notes)

**Save Game System:**
- **Implementation:** localStorage.setItem('gameState', JSON.stringify(state))
- **Load:** Parse JSON, restore item locations and flags
- **Challenge:** Version compatibility (what if items change?)

**Sound Effects:**
- **Library:** Howler.js or Web Audio API
- **Triggers:** Item pickup, door unlock, celebration
- **Challenge:** Asset size (keep under 1MB total)

**Achievements:**
- **Storage:** Same as save game (localStorage)
- **Tracking:** New state object `achievements = {}`
- **Display:** Modal overlay similar to celebration

**Mobile Support:**
- **Challenge:** Text input on mobile keyboards
- **Solution:** Virtual button panel for common commands?
- **Alternative:** Optimize for landscape orientation

**Accessibility:**
- **Screen readers:** Add ARIA labels
- **Keyboard nav:** Already supported (text input)
- **High contrast:** CSS variables for theme swapping

---

## Development Workflow

### Testing Checklist
1. Full playthrough (collect all items)
2. Test DEBUG → CELEBRATE → RESTART sequence
3. Verify HOME screen layout (no overflow)
4. Test all hidden commands
5. Check animations on different browsers
6. Verify mobile/responsive behavior

### Git Workflow
- Checkpoint before major features
- v0.31: "BEFORE FINAL CELEBRATION" (safe rollback)
- Descriptive commit messages
- Keep working directory clean

### Documentation Maintenance
- Update specifications.md after major features
- Create ToBeContinued file each session
- Keep only 3 most recent ToBeContinued files
- Technical notes in specifications-technical.md

---

## Browser Compatibility

### Tested Browsers
- Chrome/Edge (Chromium): ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (minor text-shadow differences)

### Required Features
- ES6 JavaScript (arrow functions, template literals)
- CSS Grid
- CSS Animations
- fetch API (for JSON loading)
- localStorage (for future save system)

### Fallbacks
- Google Fonts: Generic fallbacks specified
- Images: Alt text for screen readers
- Animations: Game still playable without (graceful degradation)

---

## Code Quality Notes

### Naming Conventions
- **Functions:** camelCase (`handleTakeCommand`)
- **Variables:** camelCase (`scavengerItems`)
- **Constants:** Not used (no true constants in this codebase)
- **CSS classes:** kebab-case (`scavenger-found`)

### Code Organization
- **Sections:** Clearly marked with comment headers
- **Function length:** Mostly under 50 lines
- **Commenting:** Strategic, not excessive
- **DRY principle:** Helper functions for repeated logic

### Refactoring Opportunities
- None currently critical
- `formatScavengerTwoColumns()` could be generalized
- Consider extracting animation configs to constants

---

*Last updated: October 6, 2025*
*All systems functional and well-documented*
