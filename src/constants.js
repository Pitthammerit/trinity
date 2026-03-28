export const SECTION_META = {
  beginning: { label: "Beginning", letter: "A", color: "#D85A30" },
  middle:    { label: "Middle",    letter: "U", color: "#1D9E75" },
  end:       { label: "End",       letter: "M", color: "#534AB7" },
};

export const SECTION_KEYS = ["beginning", "middle", "end"];

export const MODE_EXPLORER = "explorer";
export const MODE_LIST = "list";
export const MODE_DATA = "data";

export const MODES = [
  { key: MODE_EXPLORER, label: "Explorer" },
  { key: MODE_LIST,     label: "List" },
  { key: MODE_DATA,     label: "Data" },
];

export const FONTS = {
  display: "Georgia, 'Palatino Linotype', serif",
  body: "system-ui, sans-serif",
};

export const NEUTRAL = {
  line: "#c8c5be",
  text: "#111",
  muted: "#888",
  subtle: "#aaa",
  border: "#e0e0e0",
  borderLight: "#ddd",
  surface: "#f8f8f8",
  disabled: "#ccc",
  white: "#ffffff",
  danger: "#c0392b",
  success: "#22c55e",
  focus: "#3b82f6",
  pillTrack: "#f0f0f0",
  navActive: "#333",
};

/* SVG transitions MUST stay as inline styles (SVG elements don't support Tailwind). */
export const ANIM = {
  circleExpand: "all 0.4s ease",
  valIn:  "opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s",
  valOut: "opacity 0.35s ease, transform 0.35s ease",
  letIn:  "opacity 0.4s ease 0.1s",
  letOut: "opacity 0.25s ease",
  strokeGrow: "stroke 0.4s ease, opacity 0.4s ease, stroke-width 0.4s ease",
  fillChange: "fill 0.4s ease",
  breathingDelay: 420,
  opacityFade: "opacity 0.4s ease",
  glassHeader: "background 0.3s ease, backdrop-filter 0.3s ease",
  rowTransition: "all 0.15s",
  pillSlide: "left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)",
  triangleCollapse: "max-height 0.45s ease, opacity 0.35s ease, transform 0.4s ease",
};

export const OM_GRADIENT_STOPS = ["#D8A030", "#50B860", "#4070B0"];

export const SVG = {
  cx: 200,
  cy: 200,
  r: 145,
  viewBox: "0 0 400 395",
  restR: 36,
  activeR: 48,
  arcOffset: 0.24,
  arrowLength: 20,
  arrowHalfWidth: 7,
  ribbonStartHW: 0.25,
  ribbonEndHW: 1.5,
  ribbonSegments: 24,
  omFontSize: 80,
};
