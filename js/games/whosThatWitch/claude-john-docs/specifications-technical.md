# Who's That Witch? - Technical Specifications

## Project Information

**Project Name:** Who's That Witch?
**Technology Stack:** HTML/CSS/JavaScript (Vanilla), Python (image processing)
**Development Environment:** Windows 11, WSL2 (Linux)
**Deployment:** GitHub Pages
**Date Started:** October 11, 2025
**Last Updated:** October 19, 2025 10:59
**GitHub Repository:** https://github.com/johnpendergrass/whosThatWitch.git
**Live URL:** https://johnpendergrass.github.io/whosThatWitch/

## File Structure

```
whosThatWitch/
├── index.html                              # Main HTML structure
├── css/
│   └── style.css                           # All game styling
├── js/
│   └── game.js                             # Main game logic
├── assets/
│   ├── witches/                            # Original witch images (76 PNGs, various sizes)
│   ├── 166sized/                           # 166×166 resized images (76 PNGs) - TO BE CREATED
│   ├── 124sized/                           # 124×124 resized images (76 PNGs) - TO BE CREATED
│   └── 99sized/                            # 99×99 resized images (76 PNGs) - TO BE CREATED
├── claude-john-docs/                       # Project documentation
│   ├── BEGINNING SPECS.txt
│   ├── specifications.md
│   ├── specifications-technical.md
│   └── Claude-ToBeContinued-*.md
└── resize_witch_images.py                  # Image resizing utility script
```

**Legacy Folders (may exist, can be deleted):**
- `assets/70sized/`, `assets/132sized/`, `assets/176sized/`
- `squarePositions/` folder (no longer needed)

## Technology Decisions

### Framework: Vanilla JavaScript (No Framework)
**Rationale:**
- Aligns with parent Halloween games project architecture
- Lightweight and fast
- No build process required
- Easy to understand and maintain
- Compatible with ES6 module system

### Module System: ES6 Modules
**For parent app integration, the game must:**
- Export a default class from `js/game.js`
- Implement required interface methods:
  - `constructor()` - Initialize game state
  - `render()` - Return HTML string for game content
  - `start()` - Called when game becomes active
  - `stop()` - Called when switching away from game
  - `getScore()` - Return current score value

**Parent App Integration Flow:**
1. Parent app dynamically imports: `import('./games/whosThatWitch/js/game.js')`
2. Parent instantiates: `new module.default()`
3. Parent renders: `innerHTML = game.render()`
4. Parent calls lifecycle: `game.start()` when active, `game.stop()` when switching

### Development Approach

**Current State: Standalone Development**
- Developing as standalone game in `index.html`
- Testing locally with `python3 -m http.server 8000`
- Will later wrap in module export for parent app integration

**Future Integration:**
- Will need to modify `js/game.js` to export ES6 class
- OR create separate `whosThatWitch.js` wrapper module
- Register game in parent's `main.js` (add to gameIds, gameNames, gameDescriptions)

## Development Environment

### Local Development Server
```bash
# From project root directory
python3 -m http.server 8000

# Then visit:
http://localhost:8000
```

### Browser Testing
- Chrome, Firefox, or Edge recommended
- ES6 support required (all modern browsers)
- No transpilation needed

### File Editing
- Use any text editor
- No build process - direct file editing
- Refresh browser to see changes

## Asset Processing

### Image Resizing Pipeline

**Tool:** Python script using Pillow (PIL) library
**Script:** `resize_witch_images.py`
**Method:** LANCZOS resampling (high-quality downsampling)

**Current Configuration:**
Resizes all 76 images from `assets/witches/` to three sizes:
- 166×166 pixels → `assets/166sized/` folder (filename + `_166` suffix)
- 124×124 pixels → `assets/124sized/` folder (filename + `_124` suffix)
- 99×99 pixels → `assets/99sized/` folder (filename + `_99` suffix)

**Running the Script:**
```bash
python3 resize_witch_images.py
```

**Output:**
- Creates 76 images per size (228 total images)
- Preserves PNG transparency (RGBA format)
- Filenames: `[original_name]_[size].png`
- Example: `Elphaba(Broadway_Oz)01_166.png`

**Reusability:**
The script can be re-run if:
- New witch images are added to `assets/witches/`
- Different sizes are needed (edit script and re-run)
- Images need to be regenerated for any reason

### Image Specifications

**Format:** PNG with alpha transparency
**Color Mode:** RGBA
**Aspect Ratio:** Exact squares (may slightly stretch/squash originals)
**Quality:** LANCZOS resampling ensures minimal quality loss

## Technical Constraints

### Hard Requirements
- No external dependencies (vanilla JS only)
- Must fit in 950×714 pixel container (exact)
- Must be compatible with GitHub Pages
- Must integrate with parent Halloween app architecture

### Browser Support
- Modern browsers with ES6 support
- No Internet Explorer support needed
- CSS Grid and Flexbox support required

## Code Standards

### JavaScript Style
- Clear, descriptive variable names
- Functional programming approach preferred
- Comprehensive comments explaining "why" not just "what"
- Simple algorithms over complex optimizations
- One feature at a time, well-tested

### CSS Style
- Mobile-first approach (even though this is fixed-size game)
- Clear class names
- Comments for major sections
- Halloween color palette consistency

### HTML Structure
- Semantic HTML5
- Minimal markup
- Clear hierarchy
- Accessibility considerations where appropriate

## Integration Checklist (For Future)

When ready to integrate with parent app:
- [ ] Create ES6 module export wrapper
- [ ] Implement required class interface (constructor, render, start, stop, getScore)
- [ ] Test in parent app's `js/games/` directory
- [ ] Update parent's `main.js`:
  - [ ] Add to `gameIds` array
  - [ ] Add to `gameNames` object
  - [ ] Add to `gameDescriptions` object
- [ ] Test game switching and lifecycle methods
- [ ] Verify 950×720 fit in parent's center panel
- [ ] Test with panel expanded and collapsed

## Performance Considerations

**Image Loading:**
- **Back images preloaded** - All three tile back images (99px, 124px, 166px) are preloaded at game startup via `preloadBackImages()` function to prevent flash on first play
- Witch images loaded just-in-time when difficulty selected
- Browser caching handles subsequent plays efficiently
- No lazy loading needed due to manageable image count

**DOM Manipulation:**
- Minimize reflows and repaints
- Use document fragments for bulk DOM creation
- Event delegation for dynamic elements

**Memory Management:**
- Comprehensive timeout tracking with cleanup in `clearIdleState()`
- All setTimeout calls tracked in global arrays and cancelled when starting new game
- Clean up event listeners in `stop()` method
- Release large objects when not needed

## Known Technical Details

**Parent App Game Container:**
- ID: `#game-content`
- Dimensions: 950×720px
- Background: `linear-gradient(135deg, #1a1410 0%, #261a10 100%)`
- Uses flexbox centering for content

**Game Communication:**
- Global reference: `window.gameApp`
- Score updates: `window.gameApp.updateScore(newScore)`
- UI updates handled by parent app

**Panel Behavior:**
- Title screen (game-0): Panel auto-expands
- All games: Panel auto-collapses for more space
- This happens automatically on game switch

## GitHub Pages Deployment

**Repository Configuration:**
- Repository: https://github.com/johnpendergrass/whosThatWitch.git
- Branch: main
- Deployment: GitHub Pages (automatic)
- URL: https://johnpendergrass.github.io/whosThatWitch/

**Critical Configuration:**
- **`.nojekyll` file** - Empty file in repository root prevents Jekyll processing
- Without this file, GitHub Pages' default Jekyll processor interferes with nested asset paths
- Caused 404 errors for `assets/usedInGame/other/` and `assets/usedInGame/specialTiles/` subdirectories
- Witch images worked because they're at `assets/usedInGame/witches/` (different depth)

**Deployment Process:**
1. Commit and push changes to main branch
2. GitHub Pages automatically builds and deploys
3. Changes typically live within 1-2 minutes
4. No build process required (vanilla JavaScript)

**Testing Deployment:**
- Test locally first: `python3 -m http.server 8000`
- Push to GitHub
- Wait ~2 minutes for deployment
- Test at live URL
- Check browser console for any 404 errors or loading issues
