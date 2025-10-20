# Command System Architecture Specification

## Overview

The game uses a two-tier command system:
1. **Global Commands** - Available everywhere (commands.json)
2. **Item Actions** - Available only when item is in current room (items.json)

## Parser Logic Flow

```
User Input → Parse Words → Route to Handler

Single Word:
  "look" → Check commands.json → Execute global command

Two Words:
  "ring doorbell" → Check items in current room → Find "doorbell" → Check if has "ring" action → Execute

Multiple Words:
  "look at doorbell" → Check aliases → Convert to "examine doorbell" → Process as two words
```

## Implementation Specification

### 1. Command Parser Function
```javascript
function parseCommand(input) {
  const words = input.toLowerCase().trim().split(/\s+/);

  if (words.length === 1) {
    return handleGlobalCommand(words[0]);
  }

  if (words.length === 2) {
    return handleItemAction(words[0], words[1]);
  }

  // Handle aliases and multi-word patterns
  return handleComplexCommand(words);
}
```

### 2. Global Command Handler
```javascript
function handleGlobalCommand(verb) {
  // Load commands.json
  const commands = loadCommands();

  // Check direct match or shortcuts
  for (let cmd in commands) {
    if (cmd === verb || commands[cmd].shortcuts?.includes(verb)) {
      return executeCommand(commands[cmd].action, verb);
    }
  }

  return { success: false, message: "I don't understand that command." };
}
```

### 3. Item Action Handler
```javascript
function handleItemAction(verb, target) {
  // Get items in current room (from gameState and items.json)
  const roomItems = getCurrentRoomItems();

  // Find target item by display name or ID
  const item = findItemByName(roomItems, target);
  if (!item) {
    return { success: false, message: `You don't see a ${target} here.` };
  }

  // Check if item has this action
  if (!item.actions[verb]) {
    return { success: false, message: `You can't ${verb} the ${target}.` };
  }

  return executeItemAction(item, verb);
}
```

## File Structure

### commands.json
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

### items.json
```json
{
  "items": {
    "doorbell": {
      "display": "doorbell",
      "startLocation": "NICE-PORCH",
      "actions": {
        "ring": {"response": "Ding-dong!"},
        "push": {"response": "Ding-dong!"},
        "examine": "A brass doorbell button."
      }
    }
  }
}
```

## Supported Command Patterns

### Single Word Commands (Global)
- `help`, `h`, `?` → Show help
- `look`, `l` → Examine room
- `inventory`, `i` → Show inventory
- `north`, `n` → Move north
- `south`, `s` → Move south
- `east`, `e` → Move east
- `west`, `w` → Move west

### Two Word Commands (Item Actions)
- `ring doorbell` → Execute doorbell.actions.ring
- `push doorbell` → Execute doorbell.actions.push
- `eat snickers` → Execute snickers_bar.actions.eat
- `examine doorbell` → Execute doorbell.actions.examine
- `knock door` → Execute door_knocker.actions.knock
- `use flashlight` → Execute flashlight.actions.use

### Multi-Word Aliases (Convert to Two Word)
- `look at doorbell` → `examine doorbell`
- `turn on flashlight` → `use flashlight` (if defined)

## Item Matching Logic

### Target Resolution
1. Exact match on item.display: "doorbell" matches display: "doorbell"
2. Partial match: "light" matches "porch light"
3. ID match: "porch_light_nice" matches item ID

### Ambiguity Handling
If multiple items match target:
1. Prioritize exact matches over partial
2. Show disambiguation: "Which light? (nice light, front light)"
3. Let player specify: "examine nice light"

## Response Handling

### Simple String Response
```json
"examine": "A brass doorbell button."
```
Engine displays the string directly.

### Complex Object Response
```json
"eat": {
  "response": "Delicious! You feel healthier.",
  "addHealth": 5,
  "removeItem": true
}
```
Engine processes effects then displays response.

## Engine Integration Points

1. **Room Entry** - Load items for current room from items.json
2. **Command Input** - Parse and route through command system
3. **Action Execution** - Process responses and apply game effects
4. **State Updates** - Modify player stats, inventory, item states

## Performance Considerations

- Cache loaded JSON files
- Build room item list once per room entry
- Use hash maps for fast command lookup
- Precompile regex patterns for aliases

## Error Handling

- Unknown command: "I don't understand that."
- Item not in room: "You don't see a [target] here."
- Action not available: "You can't [verb] the [target]."
- Ambiguous target: "Which [target]? ([options])"

This architecture provides natural language interaction while maintaining simple, efficient parsing logic.

## Future Command System Expansion

### Decision Framework: Commands vs Actions

When adding new verbs, use these criteria:

**Add to commands.json (Global Commands) if:**
- Works universally with any appropriate target ("get flashlight", "get candy")
- Core game mechanic players expect everywhere
- Implementation is identical for all targets
- Could potentially work without a target

**Keep in items.json (Item Actions) if:**
- Only specific items support it ("ring bell", "eat food")
- Different items handle it completely differently
- Nonsensical without the right target type
- Response is highly item-specific

### Planned Command Classifications

#### Future Global Commands (add to commands.json)
```json
{
  "get": {
    "pattern": "get {item}",
    "aliases": ["take", "pick up"],
    "handler": "pickup_item",
    "description": "Pick up an item"
  },
  "drop": {
    "pattern": "drop {item}",
    "handler": "drop_item",
    "description": "Drop an item from inventory"
  },
  "examine": {
    "pattern": "examine {target}",
    "aliases": ["look at", "inspect"],
    "handler": "examine_target",
    "description": "Look closely at something"
  },
  "use": {
    "pattern": "use {item}",
    "handler": "use_item",
    "description": "Use or activate an item"
  }
}
```

#### Remain as Item Actions (items.json)
- **eat** - Only for edible items (candy, food)
- **ring** - Only for bells, doorbells
- **knock** - Only for doors with knockers
- **unlock** - Only for lockable items
- **push/pull** - Item-specific responses
- **turn on/off** - Only for devices with power states

### Implementation Templates

#### Global Command Handler Template
```javascript
function handleGlobalCommandWithTarget(verb, target) {
  // 1. Find target in current room or inventory
  const item = findItem(target);
  if (!item) {
    return `You don't see a ${target} here.`;
  }

  // 2. Check if this command makes sense for this item
  if (!isValidTarget(verb, item)) {
    return `You can't ${verb} the ${target}.`;
  }

  // 3. Execute the universal behavior
  switch(verb) {
    case 'get':
      return pickupItem(item);
    case 'drop':
      return dropItem(item);
    case 'examine':
      return examineItem(item);
    case 'use':
      return useItem(item);
  }
}
```

#### Parser Updates Needed
```javascript
function parseCommand(input) {
  const words = input.toLowerCase().trim().split(/\s+/);

  if (words.length === 1) {
    return handleGlobalCommand(words[0]);
  }

  if (words.length === 2) {
    const [verb, target] = words;

    // NEW: Check if verb is a global command with target pattern
    if (isGlobalCommandWithTarget(verb)) {
      return handleGlobalCommandWithTarget(verb, target);
    }

    // EXISTING: Check item actions
    return handleItemAction(verb, target);
  }

  return handleComplexCommand(words);
}
```

### Engine Priority Order
1. **Single-word global commands** (help, look, inventory, n/s/e/w)
2. **Two-word global commands** (get item, drop item, examine item, use item)
3. **Item-specific actions** (ring doorbell, eat candy, knock door)
4. **Error message** ("I don't understand that")

### Migration Strategy
When ready to implement:

1. **Add common verbs to commands.json**
   - get, take, drop, examine, use

2. **Update parser** to check global commands first

3. **Keep existing item actions** for specialized interactions

4. **Test thoroughly** to ensure no conflicts

5. **Update help system** to show both global and contextual commands

### Benefits of This Approach
- **Consistency**: "get" always works the same way
- **Discoverability**: Players know core verbs work everywhere
- **Flexibility**: Unique interactions remain item-specific
- **Maintainability**: Clear separation of universal vs specific behaviors

This hybrid approach balances predictability with flexibility, giving players reliable core commands while preserving rich item interactions.