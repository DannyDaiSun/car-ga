# Module Memory - Rendering (src/render/)

> This file contains rendering system knowledge.
> Update when visual assets, rendering algorithm, or canvas drawing changes.

## Module Purpose

**What this module does:** Renders the game world to HTML5 Canvas. Draws the track, cars with their parts, visual effects (jetpack indicators), and game UI overlays.

**Key responsibilities:**
- Draw track terrain as line
- Draw car parts (blocks, wheels, jetpacks) as rectangles/circles
- Render car IDs and fitness information
- Handle viewport/camera tracking champion car
- Render visual effects (jetpack thrust indicators)

## Structure

```
src/render/
├── renderWorld.js         # Main rendering system
├── renderWorld.test.js    # Render tests
└── assetDimensions.json   # Asset metadata (for future)
```

**Key files:**
- `renderWorld.js`: Main rendering function; handles all canvas drawing

## Rendering System

**Canvas Setup:**
- 2D context (`canvas.getContext('2d')`)
- Scale: 20 pixels per meter (matches physics SCALE constant)
- Coordinate system: X increases right, Y increases down (canvas default)
- Camera: Follows champion car (max position)

**Coordinate Transformation:**
```javascript
// Physics world (meters) → Canvas pixels
pixelX = (worldX - cameraX) * SCALE + canvasWidth/2;
pixelY = canvasHeight - (worldY * SCALE);  // Y-flip for visual
```

**Drawing Components:**

1. **Track**: Polyline following terrain height function
2. **Cars**:
   - Root body as rectangle (w × h × SCALE)
   - Child parts as rectangles or circles (wheels)
   - Part colors based on kind (block=brown, wheel=black, jetpack=red)
3. **Car Labels**: Car ID and fitness text above each car
4. **Jetpack Indicators**: Colored outline or flame effect when active

## Usage Patterns

**Common tasks:**

### Rendering a Frame
```javascript
import { render } from './renderWorld.js';

const cars = [...];  // Array of car objects with position, rootBody, parts
const champion = cars[0];  // Or find max distance car
const trackHeightFn = (x) => track.getTrackHeight(x);

render(canvas, cars, champion, trackHeightFn, timestep);
```

**Code patterns:**
- Camera follows champion (world max position)
- Off-screen culling: Only render cars within viewport
- Text rendering: Car IDs, fitness values, generation counter
- Color coding: Parts colored by kind for visual distinction

## Dependencies

**Internal:**
- None (pure canvas rendering)

**External:**
- None

## Testing

**Test location:** `src/render/renderWorld.test.js`

**Running tests:**
```bash
npm run test -- src/render
```

**Test patterns:**
- Render function called without errors (smoke tests)
- Specific part types render correctly
- Camera positioning calculations verified
- Text rendering for car IDs

## API / Interface

**renderWorld.js:**
- `render(canvas, cars, champion, trackHeightFn, timestep)`: Render single frame
  - canvas: HTML5 Canvas element
  - cars: Array of car objects (each has position, parts, etc.)
  - champion: Car object with max distance (for camera tracking)
  - trackHeightFn: Function (x) → height for track drawing
  - timestep: Current simulation timestep (for UI info)

## Configuration

**Visual Constants (in renderWorld.js):**
- SCALE = 20 (pixels per meter)
- COLORS = { block: '#8B4513', wheel: '#000000', jetpack: '#FF4500', ... }
- Camera: Centered on champion with some lead-ahead

## Domain Logic

**Camera System:**
- Follows the champion (car with maximum distance)
- Canvas center is offset to show terrain ahead (lookahead)
- Viewport dynamically adjusts based on champion position

**Part Rendering:**
- Each part rendered as rectangle or circle based on kind
- Rotation applied to parts connected via joints
- Jetpack parts rendered with special visual (outlined, flame effect)
- Wheels rendered as circles with rotation

**Text Rendering:**
- Car ID above root body
- Distance/fitness text below
- Generation counter in corner
- FPS/timestep info if available

**Jetpack Visual Indicator (as of 2025-01-14):**
- Jetpack parts drawn with red outline when thrusting
- Flame effect or glow when boost active
- Energy bar or indicator for remaining charge

## Known Issues & Workarounds

- **Canvas coordinate flip**: Y-axis inverted from physics; requires calculation in transform
- **Text readability**: On busy scenes, car ID text can overlap; consider staggering
- **Performance**: 200+ cars visible at once can slow rendering; off-screen culling helps
- **Jetpack visual sync**: Ensure render uses current energy state from physics

## Recent Changes

- [2025-01-14] Jetpack visual indicators added for thrust and energy
- [2025-01-14] Camera improvements for champion tracking
- [2025-01-08] Rendering refactored for clarity and performance
- Previous: Initial Canvas rendering system

---
*Last updated: 2025-01-14 - Documented jetpack visuals and camera system*
