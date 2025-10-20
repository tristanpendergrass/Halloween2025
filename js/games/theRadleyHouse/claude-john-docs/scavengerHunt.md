# Halloween Scavenger Hunt Game - Design Document

## Game Overview

A time-based Halloween scavenger hunt where players explore the Radley House searching for specific candy items before time runs out. Players must solve puzzles, unlock doors/safes, and avoid hazards while collecting candy to maximize their score.

## Core Gameplay

### Objective
- Find all items on the scavenger list before the timer expires
- Maximize score by collecting high-value candy items
- Complete bonus objectives for extra points

### Game Flow
1. **Start**: Player begins at STREET-01 with a scavenger list and 10-minute timer
2. **Explore**: Navigate 15 rooms searching for candy
3. **Collect**: Use "take" command to pick up candy items
4. **Solve**: Unlock doors, safes, and containers using keys/passwords
5. **Manage**: Balance time vs. score (eat candy for time bonus vs. keep for points)
6. **Avoid**: Deal with rats that steal candy from inventory
7. **End**: Game ends when timer expires or all items collected

## Features by Implementation Phase

### Phase 1: MVP Core Mechanics (3-4 hours)
**Essential features for playable game:**

1. **Scavenger List System**
   - Display target items in status panel
   - Track found vs. remaining items
   - Show checkmarks for collected items
   - Example list: Snickers, Reese's, Kit-Kat, Twix, M&Ms

2. **Item Collection**
   - Add "take [item]" command
   - Add "drop [item]" command
   - Update inventory display with candy items
   - Validate item is in current room

3. **Timer System**
   - 10-minute countdown (600 seconds)
   - Display remaining time in status panel
   - Update every second
   - Warning at 1 minute remaining
   - Game over when timer expires

4. **Scoring System**
   - Candy types and values:
     - Mini bars: 10 points
     - Fun-size: 25 points
     - Full-size: 100 points
     - King-size: 200 points
   - Running score display
   - Final score screen at game end

5. **Basic Locked Areas**
   - Keys found in specific rooms
   - Locked doors require specific keys
   - Simple text hints for key locations

6. **Game Over Screen**
   - Display final score
   - Show items collected vs. missed
   - Time remaining bonus (if completed early)
   - Option to play again

### Phase 2: Puzzle & Discovery Elements (3-4 hours)
**Add depth and challenge:**

1. **Container System**
   - Safes with combination locks (3-digit codes)
   - Locked drawers requiring keys
   - Hidden compartments requiring "search" command
   - Cabinets, boxes, desks as containers

2. **Search Mechanics**
   - "search [location]" command (search room, search desk)
   - Hidden items only appear after searching
   - Some items hidden behind/under furniture
   - Clues in room descriptions hint at hidden items

3. **Password/Riddle System**
   - Some containers require password answers
   - Riddles found in books/notes
   - Example: "What has hands but cannot clap?" → "clock"
   - Password hints scattered across multiple rooms

4. **Eat Candy Mechanic**
   - "eat [candy]" command
   - Different candies give different time bonuses:
     - Mini: +15 seconds
     - Fun-size: +30 seconds
     - Full-size: +60 seconds
   - Eaten candy removed from inventory (no points)
   - Strategic decision: points vs. time

5. **Combination Puzzles**
   - Find combination pieces in different rooms
   - Math puzzles (simple addition/pattern)
   - Color/symbol sequences
   - Historical dates from house decorations

### Phase 3: Dynamic Elements (4-5 hours)
**Add movement and threats:**

1. **Rat NPCs**
   - Start in specific rooms (Kitchen, Dining Room)
   - Move between rooms every 30 seconds
   - Steal 1 random candy if in same room as player
   - Squeaking sound warns of presence
   - Can carry stolen candy to nest location

2. **Flashlight Mechanic**
   - Found in FOYER or STUDY
   - "use flashlight" scares rats away
   - Limited battery (100 uses)
   - Battery indicator in status
   - Spare batteries hidden in house

3. **Dynamic Candy Placement**
   - Some candy randomly placed each game
   - Ensures replay value
   - Certain rooms always have candy
   - Others have 50% chance

4. **Special Events**
   - Ghost appears at 5-minute mark
   - Wind blows doors shut (temporarily locked)
   - Power outage (need flashlight to see items)
   - Trick-or-treater at door (can trade candy)

5. **Noise System**
   - Running makes noise, attracts rats
   - "sneak" command for quiet movement
   - Rats flee from loud noises
   - "shout" command scares all rats for 30 seconds

### Phase 4: Polish & Advanced Features (3-4 hours)
**Enhanced player experience:**

1. **Difficulty Levels**
   - Easy: 15 minutes, fewer rats, more hints
   - Normal: 10 minutes, standard challenge
   - Hard: 7 minutes, more rats, fewer keys
   - Nightmare: 5 minutes, dark house, aggressive rats

2. **Achievement System**
   - Speed Runner: Complete in under 5 minutes
   - Perfectionist: Collect all candy items
   - Pacifist: Never scare rats
   - Sugar Rush: Eat 5+ candies
   - Hoarder: Carry 15+ items at once

3. **Bonus Objectives**
   - Secret candy stash (500 points)
   - Golden candy bar (1000 points)
   - Complete without eating candy (+50% score)
   - Find all easter eggs

4. **Enhanced Scoring**
   - Combo multipliers for collecting same type
   - Speed bonus for quick collection
   - Perfect room bonus (find all items in room)
   - No-hint bonus

5. **Save/Load System**
   - Save current game state
   - Multiple save slots
   - Continue from last checkpoint
   - Track best scores

## Data Structure Specifications

### gameData.json Additions
```json
{
  "scavengerHunt": {
    "enabled": true,
    "targetItems": [
      "snickers_fun",
      "reeses_mini",
      "kitkat_full",
      "twix_fun",
      "mms_mini"
    ],
    "timer": {
      "initial": 600,
      "warning": 60,
      "critical": 30
    },
    "scoring": {
      "mini": 10,
      "fun_size": 25,
      "full_size": 100,
      "king_size": 200,
      "timeBonus": 1,
      "completionBonus": 500
    },
    "difficulty": "normal"
  }
}
```

### items.json Structure for Candy
```json
{
  "snickers_full": {
    "includeInGame": true,
    "display": "full-size Snickers bar",
    "description": "A full-size Snickers bar - substantial and satisfying",
    "startLocation": "KITCHEN",
    "hiddenIn": "cabinet_upper",
    "requiresSearch": true,
    "itemType": "candy",
    "size": "full_size",
    "points": 100,
    "timeBonus": 60,
    "actions": {
      "examine": "A pristine Snickers bar, probably worth a lot of points!",
      "eat": {
        "response": "Delicious! The chocolate and peanuts give you energy!",
        "addTime": 60,
        "removeItem": true
      },
      "take": {
        "response": "You pick up the Snickers bar.",
        "addToInventory": true
      }
    }
  }
}
```

### containers.json (New File)
```json
{
  "kitchen_cabinet": {
    "location": "KITCHEN",
    "display": "upper cabinet",
    "locked": true,
    "requiresKey": "cabinet_key",
    "requiresSearch": false,
    "contains": ["snickers_full", "reeses_mini"],
    "searchHint": "The cabinet doors are slightly ajar.",
    "lockedMessage": "The cabinet is locked. You need a key.",
    "emptyMessage": "The cabinet is empty."
  },
  "study_safe": {
    "location": "STUDY",
    "display": "wall safe",
    "locked": true,
    "requiresCombination": "742",
    "contains": ["golden_candy_bar"],
    "hint": "The combination is the house number.",
    "lockedMessage": "The safe requires a 3-digit combination.",
    "wrongComboMessage": "The combination is incorrect.",
    "emptyMessage": "The safe is empty."
  }
}
```

### npcs.json (New File)
```json
{
  "rat_1": {
    "type": "rat",
    "startLocation": "KITCHEN",
    "currentLocation": "KITCHEN",
    "movePattern": "random",
    "moveInterval": 30,
    "carriedItems": [],
    "maxCarry": 1,
    "stealChance": 0.5,
    "preferredItems": ["candy"],
    "scaredBy": ["flashlight", "shout"],
    "fearDuration": 60,
    "nestLocation": "BASEMENT",
    "description": "A large gray rat with beady eyes.",
    "soundEffect": "squeak squeak"
  }
}
```

## Command Additions

### New Commands for commands.json
```json
{
  "take": {
    "includeInGame": true,
    "type": "action",
    "shortcuts": ["get", "grab"],
    "action": "take_item",
    "usage": "take [item]"
  },
  "drop": {
    "includeInGame": true,
    "type": "action",
    "shortcuts": ["put"],
    "action": "drop_item",
    "usage": "drop [item]"
  },
  "search": {
    "includeInGame": true,
    "type": "action",
    "shortcuts": ["examine", "look at"],
    "action": "search_area",
    "usage": "search [location/container]"
  },
  "eat": {
    "includeInGame": true,
    "type": "action",
    "shortcuts": ["consume"],
    "action": "eat_item",
    "usage": "eat [candy]"
  },
  "use": {
    "includeInGame": true,
    "type": "action",
    "shortcuts": ["activate"],
    "action": "use_item",
    "usage": "use [item]"
  },
  "unlock": {
    "includeInGame": true,
    "type": "action",
    "shortcuts": ["open"],
    "action": "unlock_container",
    "usage": "unlock [container] with [key/combination]"
  }
}
```

## UI Layout Updates

### Status Panel Modifications
```
╔════════════════════════╗
║ SCAVENGER LIST         ║
║ ☐ Snickers bar         ║
║ ☑ Reese's cup         ║
║ ☐ Kit-Kat             ║
║ ☐ Twix                ║
║ ☐ M&Ms                ║
║                        ║
║ TIME: 08:45           ║
║ SCORE: 125            ║
║                        ║
║ INVENTORY:            ║
║ • Reese's cup (mini)  ║
║ • Flashlight (75%)    ║
║ • Bronze key          ║
╚════════════════════════╝
```

## Game State Management

### State Variables to Track
```javascript
gameState = {
  // Basic state
  currentRoom: "STREET-01",
  score: 0,
  timeRemaining: 600,
  gameActive: true,

  // Scavenger hunt
  targetItems: ["snickers", "reeses", "kitkat"],
  collectedItems: [],

  // Inventory
  inventory: [],
  maxInventory: 15,

  // Containers
  openedContainers: [],
  searchedLocations: [],

  // NPCs
  ratPositions: { "rat_1": "KITCHEN" },
  ratFearTimers: {},

  // Special items
  flashlightBattery: 100,
  hasFlashlight: false,

  // Statistics
  candyEaten: 0,
  doorsUnlocked: 0,
  containersOpened: 0,
  ratsScared: 0,
  totalMoves: 0
}
```

## Victory Conditions

### Win Conditions
1. **Complete Victory**: Find all scavenger list items
2. **Time Victory**: Complete with >50% time remaining
3. **Perfect Victory**: All items + all bonus candies

### Loss Conditions
1. **Time Out**: Timer reaches zero
2. **Empty Handed**: Timer expires with <3 items

### Scoring Formula
```
Base Score = Sum of candy point values
Time Bonus = Seconds remaining × 1 point
Completion Bonus = 500 (if all target items found)
Perfect Bonus = 1000 (if ALL candy found)
Difficulty Multiplier = Easy(0.5), Normal(1.0), Hard(1.5), Nightmare(2.0)

Final Score = (Base + Bonuses) × Difficulty Multiplier
```

## Testing Checklist

### Phase 1 Testing
- [ ] Timer counts down properly
- [ ] Game ends at 0:00
- [ ] Take command works for items in room
- [ ] Drop command removes from inventory
- [ ] Score updates when collecting candy
- [ ] Scavenger list shows checkmarks
- [ ] Final score screen displays correctly

### Phase 2 Testing
- [ ] Safes require correct combination
- [ ] Keys unlock correct doors/containers
- [ ] Search reveals hidden items
- [ ] Eat command adds time
- [ ] Eaten candy removed from inventory
- [ ] Riddles accept correct answers

### Phase 3 Testing
- [ ] Rats move between rooms
- [ ] Rats steal candy when in same room
- [ ] Flashlight scares rats
- [ ] Battery depletes with use
- [ ] Special events trigger at correct times

### Phase 4 Testing
- [ ] Difficulty levels work correctly
- [ ] Achievements unlock properly
- [ ] Save/load preserves game state
- [ ] Bonus objectives tracked
- [ ] High scores saved

## Future Enhancement Ideas

1. **Multiplayer Mode**: Race against friends
2. **Seasonal Events**: Christmas, Easter versions
3. **Custom Houses**: Level editor
4. **Story Mode**: Narrative wrapper
5. **Procedural Generation**: Random house layouts
6. **Power-Ups**: Speed boost, X-ray vision
7. **Costume System**: Different characters with abilities
8. **Photo Mode**: Screenshot favorite moments
9. **Daily Challenges**: New scavenger lists daily
10. **Trading Cards**: Collect rare candy cards

## Technical Notes

### Performance Considerations
- Timer updates: Use requestAnimationFrame for smooth countdown
- State saves: Debounce to every 5 seconds
- NPC movement: Batch updates to reduce redraws

### Browser Compatibility
- LocalStorage for save games
- Web Audio API for sound effects (future)
- CSS animations for visual feedback

### Code Organization
```
textAdventure.js
├── Core Engine (existing)
├── Scavenger Module
│   ├── Timer System
│   ├── Scoring System
│   └── List Management
├── Container Module
│   ├── Lock System
│   ├── Search System
│   └── Combination System
├── NPC Module
│   ├── Rat AI
│   ├── Movement System
│   └── Interaction Handler
└── UI Module
    ├── Status Updates
    ├── Animation Effects
    └── Score Display
```

## Development Priority

### Must Have (MVP)
1. Scavenger list
2. Timer
3. Basic scoring
4. Take/drop commands
5. Game over screen

### Should Have
1. Locked doors/containers
2. Search command
3. Eat candy for time
4. Multiple candy sizes
5. Combination safes

### Nice to Have
1. Rat NPCs
2. Flashlight
3. Achievements
4. Difficulty levels
5. Save/load

### Future Version
1. Multiplayer
2. Level editor
3. Seasonal events
4. Voice commands
5. Mobile app

---

*This document serves as the complete design specification for the Halloween Scavenger Hunt game. It should be referenced throughout development to ensure consistent implementation and feature completeness.*