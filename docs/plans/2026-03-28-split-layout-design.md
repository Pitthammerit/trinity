# Split Layout Mode Design

## Summary

Add a "Split" mode to the desktop nav that displays Trinity SVG and DataTable side-by-side in a two-column CSS Grid layout. On mobile, the middle nav button stays as "List" (existing behavior). The nav bar animates to the top (under the title) when entering Split mode.

## Modes

| Viewport       | Nav buttons              | Middle button |
|----------------|--------------------------|---------------|
| Desktop >=1024 | Explorer \| Split \| Data | Split         |
| Mobile <1024   | Explorer \| List \| Data  | List          |

New constant: `MODE_SPLIT = "split"`.

On mobile viewports, Split mode falls back to List behavior (Trinity hidden, table full-width).

## Layout: Explorer Mode (unchanged)

- Single column, `max-w-[520px] sm:max-w-[660px]`
- Trinity SVG centered above
- Nav bar in mid-position (between triangle and table)
- Table below

## Layout: Split Mode (desktop)

- CSS Grid container: `grid-template-columns: 1fr 1fr`, `gap: 2rem`
- Container widens to `max-w-[1100px]`
- Left column: Trinity SVG, `align-self: center`
- Right column: DataTable, `overflow-y: auto` (scrolls only if needed)
- Nav bar moves to top position (under title, above the grid)

## Layout: Split Mode (mobile fallback)

Identical to List mode: Trinity collapses via existing `maxHeight/opacity/scale` animation, table full-width.

## Animations (Explorer <-> Split, desktop only)

Duration: 0.4s ease-out for all transitions.

### Explorer -> Split

1. Nav bar: fades out at mid-position, fades in at top position
2. Container: width transitions from 660px to 1100px
3. Grid: `grid-template-columns` transitions from `1fr` to `1fr 1fr`
4. Trinity: slides left, scales down slightly
5. Table: shifts right into its column

### Split -> Explorer

Reverse of above. Grid collapses to single column, Trinity centers and scales up, nav drops back to mid-position, container narrows.

## UI Changes

- Remove magnifying glass SVG icon from search (keep text input + underline only)
- Middle nav button: renders "Split" on desktop (>=1024px), "List" on mobile (<1024px)
- Pill gradient animation unchanged

## Files to Modify

1. `src/constants.js` - Add `MODE_SPLIT`, update `MODES` array
2. `src/App.jsx` - Layout logic, nav positioning, grid container, responsive mode swap
3. `src/index.css` - Grid transition styles, nav position animation keyframes
4. `src/components/DataTable.jsx` - May need height adjustment for split column

## What Stays the Same

- Mobile layout entirely unchanged
- Data mode + PasscodeGate
- Intro/loading animations
- Row interactions, breathing animation
- All existing animations for Explorer/List/Data transitions

## Technical Approach

CSS Grid with animated `grid-template-columns`. Modern browser support required (Chrome 107+, Safari 16.4+). Fits the project's Vite 8 + React 19 + Tailwind 4 stack.

Nav position animated via CSS transitions on `transform/opacity` — two render slots (top and mid), with the inactive one hidden via `opacity: 0, pointer-events: none`.
