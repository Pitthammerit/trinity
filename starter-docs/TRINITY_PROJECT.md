# Concept of Trinity in the Universe — Interactive Explorer

## What This Is

An interactive web application visualizing 42 trinities from a handwritten spiritual chart by teacher **Muralidher** (Mysore, India). Each trinity maps three aspects of universal concepts across the AUM cycle: **Beginning** (A/Brahma), **Middle** (U/Vishnu), **End** (M/Shankara).

Built by **Benjamin Kurtz** for the Benjamin Kurtz Academy, digitizing sacred knowledge into an explorable, editable format.

---

## What We Built (Current State)

### Single-File React Artifact
- **File**: `trinity_explorer.jsx` (626 lines, monolithic)
- **Data backup**: `trinity_data.json` (42 rows, canonical reference)
- **Environment**: Claude.ai artifact sandbox (no filesystem access)

### Features
1. **Triangle SVG Visualization** — outer circle, tapered arc ribbons with arrowheads, inner triangle (3 colored edges), OM symbol with rainbow gradient, vertex circles with smart text fitting
2. **Three Modes** — Explorer (triangle + list), List (list only), Data (editable list)
3. **Sliding Pill Navigation** — dark pill slides behind active mode button with cubic-bezier ease
4. **Search** — case-insensitive, min 2 chars, matched characters highlighted with row color
5. **Inline Editing** — double-click cells, ✓ at row end to save, × for delete, confirm dialog
6. **Inline Row Creation** — new row at top of Data mode with auto-generated rainbow color
7. **Smart Text Fitting** — `fitText()` tries font sizes 13→6, auto line-breaks for multi-word values
8. **Breathing Animation** — scale + fade crossfade between datasets via `lastRowRef` pattern
9. **Rainbow Color System** — 42 hue-rotated hex colors, red→yellow→green→cyan→blue→purple

### Data Structure
```json
{
  "id": 1,
  "beginning": "Governing",
  "middle": "Operating",
  "end": "Dissolution",
  "color": "#af574f"
}
```

**Ordering**: Column A (rows 1–14), Column B (rows 15–28), Column C (rows 29–42), matching the original handwritten chart's column-first layout.

### Design System (Current — Inline Styles)

| Token | Value | Usage |
|-------|-------|-------|
| Section Beginning | `#D85A30` (red-orange) | A vertex, arcs, triangle edge, column header |
| Section Middle | `#1D9E75` (green) | U vertex, arcs, triangle edge, column header |
| Section End | `#534AB7` (purple-blue) | M vertex, arcs, triangle edge, column header |
| Neutral line | `#c8c5be` | Outer circle stroke |
| Title font | Georgia, Palatino Linotype, serif | Title, column headers, footer |
| Nav/body font | System sans-serif | Navigation, list, cells |
| OM gradient | 6-stop rainbow, vertical | `#D85A30` → `#D8A030` → `#50B860` → `#1D9E75` → `#4070B0` → `#534AB7` |

### Animation System

| Animation | In | Out |
|-----------|-----|-----|
| Circle radius | `r: 36→48, 0.4s ease` | `r: 48→36, 0.4s ease` |
| Value text | `opacity 0.5s ease 0.25s, scale 50%→100%` | `opacity 0.35s ease, scale 100%→50%` |
| Letter A/U/M | `opacity 0.25s ease` (fade out) | `opacity 0.4s ease 0.1s` (fade in delayed) |
| Triangle edges | `stroke-width 0.8→4.5, 0.4s ease` | `stroke-width 4.5→0.8, 0.4s ease` |
| Arc/arrow color | `fill 0.4s ease` | `fill 0.4s ease` |
| Pill slide | `left 0.35s cubic-bezier(0.4,0,0.2,1)` | same |
| Breathing | `displayActive→null` (350ms out) → 420ms wait → `displayActive→new` (500ms in) | |

**Key pattern**: `lastRowRef` keeps old text visible during scale-down. Without it, React clears the text content before CSS can animate the exit.

### SVG Geometry

| Constant | Value | Notes |
|----------|-------|-------|
| `viewBox` | `0 0 400 395` | |
| `cx, cy` | `200, 200` | Triangle center = geometric centroid |
| `r` | `145` | Circle radius |
| Top vertex | `(200, 55)` | `cy - r` |
| Bottom-left | `(74.4, 272.5)` | End vertex |
| Bottom-right | `(325.6, 272.5)` | Middle vertex |
| Initial circle `r` | `36` | Vertex circles at rest |
| Active circle `r` | `48` | Vertex circles with data |
| Arc offset | `0.24 rad` | Gap between arc start and vertex |
| Arrow length | `20` | `aL` |
| Arrow half-width | `7` | `aH` |
| Ribbon taper | `0.25 → 1.5` | `startHW → endHW` |
| OM font size | `120` | With rainbow gradient fill |

### Components (Currently in Single File)

| Component | Lines | Responsibility |
|-----------|-------|---------------|
| `HighlightText` | ~10 | Search match highlighting |
| `ConfirmDialog` | ~15 | Modal confirmation for destructive actions |
| `EditableCell` | ~20 | Double-click inline editing with ✓/× |
| `fitText` | ~25 | Smart text sizing for circle labels |
| `Triangle` | ~120 | Full SVG visualization |
| `TrinityExplorer` | ~200 | Main app, state, all three modes |

### Utility Functions

| Function | Purpose |
|----------|---------|
| `hexToRgb` | Hex → [r, g, b] |
| `rgbToHex` | [r, g, b] → hex |
| `rgbToHsl` | RGB → HSL |
| `hslToHex` | HSL → hex |
| `colorVariants(hex)` | Derives `fill`, `bg` (light), `text` (dark) from any hex |
| `generateUniqueColor(existing)` | Finds largest hue gap, places new color in middle |
| `glassStyle(opacity)` | Frosted glass CSS with backdrop-filter |
| `fitText(text, maxWidth)` | Returns `{ lines[], fontSize }` for circle labels |

---

## Current Limitations (Artifact Sandbox)

1. **No file persistence** — data lives in React state, resets on reload
2. **No true file read/write** — JSON file is static backup only
3. **No Git** — can't version control or revert
4. **Monolithic** — 626 lines in one file, can't split into modules
5. **No build system** — can't use Tailwind, can't optimize
6. **No auth** — anyone viewing the artifact can see Data mode
7. **No API** — can't save edits to a server

---

## Migration Plan: Vite + React + Tailwind 4 + Cloudflare

### Target Architecture

```
trinity-explorer/
├── public/
│   └── data/
│       └── trinity_data.json        # SSOT — served statically, writable via API
├── src/
│   ├── components/
│   │   ├── Triangle.jsx             # SVG visualization only
│   │   ├── VertexCircle.jsx         # Single vertex with text fitting
│   │   ├── ArcRibbon.jsx            # Single tapered arc + arrowhead
│   │   ├── DataTable.jsx            # List rendering (all 3 modes)
│   │   ├── EditableCell.jsx         # Inline cell editing
│   │   ├── PasscodeGate.jsx         # Simple passcode prompt for Data mode
│   │   └── HighlightText.jsx        # Search match highlighting
│   ├── hooks/
│   │   ├── useBreathing.js          # displayActive state machine
│   │   └── useTrinityData.js        # Data loading, CRUD operations
│   ├── utils/
│   │   ├── colors.js                # colorVariants, generateUniqueColor, hex/rgb/hsl
│   │   └── fitText.js               # Smart text sizing
│   ├── constants.js                 # SECTION_META, MODES, SECTION_KEYS
│   ├── App.jsx                      # Orchestrator — state, modes, layout
│   ├── App.css                      # @import "tailwindcss" + custom CSS for SVG animations
│   └── main.jsx                     # Entry point
├── functions/                       # Cloudflare Workers (serverless API)
│   └── api/
│       └── data.js                  # GET/PUT trinity_data.json via D1 or KV
├── tailwind.config.js               # Design tokens
├── vite.config.js
├── wrangler.toml                    # Cloudflare config
└── package.json
```

### Tailwind 4 Token Mapping

```js
// tailwind.config.js (v4 uses CSS-first config, but tokens map like this)
export default {
  theme: {
    extend: {
      colors: {
        section: {
          beginning: '#D85A30',
          middle: '#1D9E75',
          end: '#534AB7',
        },
        neutral: {
          line: '#c8c5be',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Palatino Linotype', 'serif'],
        body: ['system-ui', 'sans-serif'],
      },
      fontSize: {
        'title': ['1.5rem', { letterSpacing: '0.15em', fontWeight: '500' }],
        'subtitle': ['0.8125rem', { letterSpacing: '0.25em', fontWeight: '400' }],
        'nav': ['0.875rem', { fontWeight: '400' }],
        'header': ['0.875rem', { fontWeight: '500' }],
        'cell': ['0.8125rem', { fontWeight: '400' }],
      },
      borderRadius: {
        pill: '0.5rem',
      },
      transitionTimingFunction: {
        'pill': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
}
```

### Animation Preservation Strategy

SVG animations use inline `style={{ transition }}` which **cannot be replaced by Tailwind classes** (SVG elements don't support utility classes the same way). Strategy:

1. **SVG transitions** → keep as inline styles in Triangle/VertexCircle/ArcRibbon components. Document each timing in a constants file.
2. **CSS transitions** (pill, mode switch, glass header) → convert to Tailwind `transition-*` utilities.
3. **Breathing state machine** → extract to `useBreathing` hook. The `lastRowRef` pattern is critical — must be preserved exactly.

```js
// src/constants.js — animation timings (SSOT)
export const ANIM = {
  circleExpand: 'all 0.4s ease',
  valIn: 'opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s',
  valOut: 'opacity 0.35s ease, transform 0.35s ease',
  letIn: 'opacity 0.4s ease 0.1s',
  letOut: 'opacity 0.25s ease',
  strokeGrow: 'stroke 0.4s ease, opacity 0.4s ease, stroke-width 0.4s ease',
  fillChange: 'fill 0.4s ease',
  breathingDelay: 420, // ms between fade-out and fade-in
};
```

### Security: Passcode for Data Mode

No login system. Simple client-side passcode stored as env variable:

```jsx
// PasscodeGate.jsx
function PasscodeGate({ onUnlock, children }) {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  if (unlocked) return children;

  return (
    <div className="text-center py-8">
      <p className="text-sm text-neutral-500 mb-2">Enter passcode to edit</p>
      <input type="password" value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && input === import.meta.env.VITE_EDIT_PASSCODE) {
            setUnlocked(true);
            onUnlock();
          }
        }}
        className="border-b border-neutral-300 px-2 py-1 text-center outline-none"
      />
    </div>
  );
}
```

Set in `.env`: `VITE_EDIT_PASSCODE=your_secret_here`

**Note**: This is client-side only — not truly secure, but prevents casual editing. For real security, the API endpoint should validate the passcode server-side.

### Data Persistence (Cloudflare)

**Option A: Static JSON + KV** (simplest)
- `trinity_data.json` served from `public/`
- Edits saved via Cloudflare Workers to KV store
- Worker reads from KV, falls back to static JSON

**Option B: Cloudflare D1** (SQLite, more robust)
- Single table: `trinities (id, beginning, middle, end, color, sort_order)`
- Worker API: `GET /api/data`, `PUT /api/data`, `POST /api/data/row`, `DELETE /api/data/row/:id`
- Automatic backups, query capability

**Recommendation**: Start with Option A (KV). Upgrade to D1 only if you need querying or relational features.

---

## Migration: Claude Code Prompt

**Local project path**: `/Users/benjaminkurtz/Documents/localcoding/trinity`

**Files to place there before starting**:
- `trinity_explorer.jsx` — the working monolithic app
- `trinity_data.json` — the 42-row dataset
- `TRINITY_PROJECT.md` — this document (migration blueprint)

### Prompt for Claude Code

```
Read /Users/benjaminkurtz/Documents/localcoding/trinity/TRINITY_PROJECT.md — this is a comprehensive migration plan for an interactive spiritual chart app.

The source files are in the same folder: trinity_explorer.jsx (working React app, 626 lines monolith) and trinity_data.json (42 rows of data).

Execute the migration in order:

PHASE 1 — Scaffold:
- cd /Users/benjaminkurtz/Documents/localcoding/trinity
- npm create vite@latest . -- --template react (use current directory)
- npm install tailwindcss @tailwindcss/vite @radix-ui/react-navigation-menu @radix-ui/react-dialog
- Configure vite.config.js with @vitejs/plugin-react and @tailwindcss/vite
- Replace src/index.css with: @import "tailwindcss";
- Copy trinity_data.json to public/data/
- git init && git add . && git commit -m "phase 1: scaffold"

PHASE 2 — Split monolith:
- Read trinity_explorer.jsx completely
- Split into the component structure from TRINITY_PROJECT.md
- CRITICAL: Keep ALL SVG inline styles exactly as they are — they contain animation timings that cannot be converted to Tailwind (SVG elements)
- CRITICAL: Preserve the lastRowRef pattern in Triangle — it keeps text visible during scale-down animation
- CRITICAL: Preserve asymmetric transitions (valIn/valOut/letIn/letOut) — they prevent the flash bug
- Use Radix NavigationMenu with Indicator for the sliding pill (replaces custom pillPos/btnRefs/useEffect)
- Use Radix AlertDialog for the confirm dialog (replaces custom ConfirmDialog)
- git commit -m "phase 2: split into components"

PHASE 3 — Tailwind:
- Convert all HTML inline styles to Tailwind classes
- Keep SVG inline styles untouched
- Define design tokens in tailwind config (section colors, fonts, spacing)
- git commit -m "phase 3: tailwind migration"

After each phase, run npm run dev and verify the app works before proceeding.
```

### Why NOT to Use a Starter Template

The `react-ts-starter` and similar templates include Nitro, Husky, lint-staged, TypeScript strict mode, and complex folder structures — all unnecessary for this project. Use the official `npm create vite@latest` with the `react` template. Add only what you need.

### Quick Start Reference (Correct Versions)

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  // NOT react-refresh
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

```css
/* src/index.css */
@import "tailwindcss";
```

---

## Migration Steps (Claude Code)

### Phase 1: Project Setup
1. `npm create vite@latest trinity-explorer -- --template react`
2. `cd trinity-explorer && npm install`
3. Install Tailwind 4: `npm install tailwindcss @tailwindcss/vite`
4. Install Radix UI: `npm install @radix-ui/react-tabs @radix-ui/react-dialog @radix-ui/react-navigation-menu`
5. Configure `vite.config.js` with Tailwind plugin
6. Copy `trinity_data.json` to `public/data/`
7. Init Git: `git init && git add . && git commit -m "initial scaffold"`

### Phase 2: Split Components (from monolith)
1. Extract constants → `src/constants.js`
2. Extract utilities → `src/utils/colors.js`, `src/utils/fitText.js`
3. Extract `EditableCell` → `src/components/EditableCell.jsx`
4. Extract `HighlightText` → `src/components/HighlightText.jsx`
5. Extract `Triangle` → `src/components/Triangle.jsx` (keep SVG inline styles)
6. Build navigation with `@radix-ui/react-navigation-menu` (replaces custom pill + refs)
7. Build confirm dialog with `@radix-ui/react-dialog` (replaces custom ConfirmDialog)
8. Extract `DataTable` → `src/components/DataTable.jsx`
9. Build `App.jsx` as orchestrator
10. Commit: `git commit -m "split monolith into components with Radix primitives"`

### Phase 3: Tailwind Migration
1. Replace all inline `style={{ }}` on HTML elements with Tailwind classes
2. Keep SVG inline styles (Tailwind can't target SVG attributes)
3. Define design tokens in `tailwind.config.js`
4. Create `App.css` with `@import "tailwindcss"` and custom SVG animations
5. Commit: `git commit -m "migrate to Tailwind 4"`

### Phase 4: Data Persistence
1. Create `src/hooks/useTrinityData.js` — loads JSON, exposes CRUD
2. Add `functions/api/data.js` — Cloudflare Worker for read/write
3. Set up `wrangler.toml` for D1 or KV
4. Add `PasscodeGate.jsx` for Data mode auth
5. Commit: `git commit -m "add data persistence and auth"`

### Phase 5: Deploy
1. `npx wrangler pages deploy dist/`
2. Configure custom domain: `trinity.benjaminkurtz.de`
3. Set environment variables in Cloudflare dashboard
4. Test all modes, animations, edit flow

---

### Radix UI Integration

Replace hand-coded interactive components with **Radix Primitives** for accessibility, keyboard navigation, and animation support out of the box.

```bash
npm install @radix-ui/react-tabs @radix-ui/react-dialog @radix-ui/react-navigation-menu
```

| Current Component | Replace With | Why |
|-------------------|-------------|-----|
| Pill navigation (mode tabs) | `@radix-ui/react-tabs` | Built-in keyboard nav, ARIA, animated content panels |
| Confirm dialog | `@radix-ui/react-dialog` (`AlertDialog`) | Focus trap, escape key, portal, overlay |
| Sliding pill animation | `@radix-ui/react-navigation-menu` | Built-in indicator animation (sliding pill) via `NavigationMenu.Indicator` |
| Search input | Keep custom | Simple enough, no Radix needed |
| EditableCell | Keep custom | Highly specific to this UI |

**Pill animation via Radix NavigationMenu:**
```jsx
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Explorer</NavigationMenu.Trigger>
    </NavigationMenu.Item>
    {/* ... */}
    <NavigationMenu.Indicator className="bg-blue-50 border border-blue-300 rounded-md transition-transform duration-300" />
  </NavigationMenu.List>
</NavigationMenu.Root>
```

The `Indicator` element automatically slides to the active trigger — no manual ref measurement needed. This replaces the custom `pillPos` / `btnRefs` / `useEffect` pattern entirely.

**AlertDialog for confirmations:**
```jsx
import * as AlertDialog from '@radix-ui/react-alert-dialog';

<AlertDialog.Root open={!!confirm}>
  <AlertDialog.Portal>
    <AlertDialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
    <AlertDialog.Content className="fixed top-1/2 left-1/2 ...">
      <AlertDialog.Title>{confirm?.title}</AlertDialog.Title>
      <AlertDialog.Description>{confirm?.message}</AlertDialog.Description>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onClick={confirm?.onConfirm}>Delete</AlertDialog.Action>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

---

## Pre-Migration Checklist (Do Before Leaving Artifact)

- [x] Data order verified (Column A → B → C)
- [x] All 42 trinity names verified against original chart
- [x] 13 corrections applied (Akarma, Atma Vidhya, Testimonial, etc.)
- [x] Rainbow colors correctly assigned
- [x] JSON and JSX data match exactly
- [x] Animation system documented
- [x] SVG geometry documented
- [ ] Final design change (user mentioned one more before migration)
- [ ] Export final JSX as reference

---

## Credits

- **Chart**: Muralidher, Mysore, India
- **Digital adaptation**: Benjamin Kurtz, Benjamin Kurtz Academy LLC
- **Copyright**: © 2026 Muralidher & Benjamin Kurtz, Mysuru, India
- **Built with**: Claude (Anthropic), React, SVG

---

*Last updated: March 28, 2026*
