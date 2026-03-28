import { useRef, useMemo } from "react";
import { SECTION_META, ANIM, SVG, NEUTRAL, FONTS, OM_GRADIENT_STOPS } from "../constants";
import { colorVariants } from "../utils/colors";
import { fitText } from "../utils/fitText";

/* ── Static geometry (computed once at module load, never changes) ── */

const { cx, cy, r } = SVG;
const topX = cx, topY = cy - r;
const blX = cx - r * Math.cos(Math.PI / 6), blY = cy + r * Math.sin(Math.PI / 6);
const brX = cx + r * Math.cos(Math.PI / 6), brY = cy + r * Math.sin(Math.PI / 6);

const VERTICES = [
  { x: topX, y: topY, key: "beginning" },
  { x: brX, y: brY, key: "middle" },
  { x: blX, y: blY, key: "end" },
];

const EDGES = [
  { x1: topX, y1: topY, x2: brX, y2: brY, color: SECTION_META.beginning.color },
  { x1: brX, y1: brY, x2: blX, y2: blY, color: SECTION_META.middle.color },
  { x1: blX, y1: blY, x2: topX, y2: topY, color: SECTION_META.end.color },
];

const RIBBON_DATA = (() => {
  const { arcOffset: off, arrowLength: aL, arrowHalfWidth: aH,
          ribbonSegments: segs, ribbonStartHW: startHW, ribbonEndHW: endHW } = SVG;
  const angles = [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6];
  const arcs = [
    { from: 0, to: 1, sectionColor: SECTION_META.beginning.color },
    { from: 1, to: 2, sectionColor: SECTION_META.middle.color },
    { from: 2, to: 0, sectionColor: SECTION_META.end.color },
  ];
  return arcs.map(({ from, to, sectionColor }) => {
    const a1 = angles[from] + off;
    let a2 = angles[to] - off;
    if (a2 < a1) a2 += Math.PI * 2;
    const aA = a1 + (a2 - a1) * 0.5;
    const arcEndA = aA - (aL / 2) / r;
    const mid = { x: cx + r * Math.cos(aA), y: cy + r * Math.sin(aA) };
    const tx = -Math.sin(aA), ty = Math.cos(aA), nx = Math.cos(aA), ny = Math.sin(aA);
    const tipX = mid.x + (aL / 2) * tx, tipY = mid.y + (aL / 2) * ty;
    const bx = mid.x - (aL / 2) * tx, by = mid.y - (aL / 2) * ty;
    const outer = [], inner = [];
    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const a = a1 + (arcEndA - a1) * t;
      const hw = startHW + t * (endHW - startHW);
      outer.push(`${cx + (r + hw) * Math.cos(a)},${cy + (r + hw) * Math.sin(a)}`);
      inner.push(`${cx + (r - hw) * Math.cos(a)},${cy + (r - hw) * Math.sin(a)}`);
    }
    const ribbonD = "M" + outer[0] + " " + outer.slice(1).map(p => "L" + p).join(" ") +
      " L" + inner[inner.length - 1] + " " + inner.slice(0, -1).reverse().map(p => "L" + p).join(" ") + " Z";
    const arrowPoints = `${tipX},${tipY} ${bx + aH * nx},${by + aH * ny} ${bx - aH * nx},${by - aH * ny}`;
    return { ribbonD, arrowPoints, sectionColor };
  });
})();

/* ── Intro animation geometry ── */
const CIRCLE_CIRCUMFERENCE = Math.ceil(2 * Math.PI * r);
const EDGE_LENGTH = Math.ceil(r * Math.sqrt(3));

/* ── Component ── */

export default function Triangle({ active, data, intro }) {
  const hasActive = active !== null && active < data.length;
  const row = hasActive ? data[active] : null;

  const cv = useMemo(
    () => hasActive ? colorVariants(row.color) : null,
    [hasActive, row?.color],
  );

  // WHY: lastRowRef keeps old text visible during scale-down fade-out
  const lastRowRef = useRef(null);
  const lastCvRef = useRef(null);
  if (row) { lastRowRef.current = row; lastCvRef.current = cv; }
  const showRow = row || lastRowRef.current;
  const showCv = cv || lastCvRef.current;

  const fits = useMemo(() =>
    VERTICES.map(v => {
      const val = showRow ? showRow[v.key] : "";
      return val ? fitText(val, SVG.activeR * 1.5) : { lines: [""], fontSize: 11 };
    }),
    [showRow?.beginning, showRow?.middle, showRow?.end],
  );

  return (
    <svg viewBox={SVG.viewBox} style={{ width: "100%", display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="omRainbow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={SECTION_META.beginning.color} stopOpacity="0.35" />
          <stop offset="20%" stopColor={OM_GRADIENT_STOPS[0]} stopOpacity="0.3" />
          <stop offset="40%" stopColor={OM_GRADIENT_STOPS[1]} stopOpacity="0.25" />
          <stop offset="60%" stopColor={SECTION_META.middle.color} stopOpacity="0.25" />
          <stop offset="80%" stopColor={OM_GRADIENT_STOPS[2]} stopOpacity="0.3" />
          <stop offset="100%" stopColor={SECTION_META.end.color} stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={NEUTRAL.line} strokeWidth="0.5"
          transform={intro ? `rotate(-90 ${cx} ${cy})` : undefined}
          style={intro ? {
            strokeDasharray: CIRCLE_CIRCUMFERENCE,
            animation: "intro-draw-circle 1.0s ease-out 0.5s both",
          } : undefined} />
        {RIBBON_DATA.map(({ ribbonD, arrowPoints, sectionColor }, i) => {
          const fill = hasActive ? cv.fill : sectionColor;
          return (
            <g key={i} style={intro
              ? { animation: `intro-fade 0.5s ease-out ${1.4 + i * 0.2}s both` }
              : { transition: ANIM.opacityFade }
            }>
              <path d={ribbonD} fill={fill} style={intro ? undefined : { transition: ANIM.fillChange }} />
              <polygon points={arrowPoints} fill={fill} style={intro ? undefined : { transition: ANIM.fillChange }} />
            </g>
          );
        })}
      </g>

      {EDGES.map((edge, i) => (
        <line key={i} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
          stroke={hasActive ? cv.fill : edge.color}
          strokeWidth={hasActive ? 4.5 : 0.8}
          opacity={hasActive ? 0.3 : 0.4}
          style={intro
            ? { strokeDasharray: EDGE_LENGTH, animation: `intro-draw-edge 0.5s ease-out ${0.9 + i * 0.15}s both` }
            : { transition: ANIM.strokeGrow }
          } />
      ))}

      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="central"
        style={{
          fontSize: SVG.omFontSize, fontWeight: 300, fill: "url(#omRainbow)", fontFamily: FONTS.display,
          ...(intro ? { animation: "intro-breathe 0.8s ease-out 0.3s both", transformOrigin: `${cx}px ${cy}px` } : {}),
        }}>
        {"\u0950"}
      </text>

      {VERTICES.map((v, vi) => {
        const sm = SECTION_META[v.key];
        const fit = fits[vi];
        const valColor = showCv ? showCv.fill : sm.color;
        const line1 = fit.lines[0] || "";
        const line2 = fit.lines[1] || "";
        const hasTwo = fit.lines.length === 2;
        const y1 = hasTwo ? v.y - 11 : v.y - 5;
        return (
          <g key={v.key} style={intro ? {
            animation: `intro-bloom 0.6s ease-out ${1.0 + vi * 0.2}s both`,
            transformOrigin: `${v.x}px ${v.y}px`,
          } : undefined}>
            <circle cx={v.x} cy={v.y} r={hasActive ? SVG.activeR : SVG.restR}
              fill={hasActive ? cv.bg : sm.color}
              fillOpacity={hasActive ? 1 : 0.08}
              stroke={hasActive ? cv.fill : sm.color}
              strokeWidth={hasActive ? 1 : 0.5}
              strokeOpacity={hasActive ? 0.8 : 0.25}
              style={{ transition: ANIM.circleExpand }} />
            {/* WHY asymmetric: fades out fast, fades in with delay — prevents flash */}
            <text x={v.x} y={v.y - 3} textAnchor="middle" dominantBaseline="central"
              style={{
                fontSize: 20, fontWeight: 500, fill: sm.color, fontFamily: FONTS.display,
                opacity: hasActive ? 0 : 1,
                transition: hasActive ? ANIM.letOut : ANIM.letIn,
              }}>
              {sm.letter}
            </text>
            <text x={v.x} y={y1} textAnchor="middle" dominantBaseline="central"
              style={{
                fontSize: fit.fontSize, fontWeight: 500, fill: valColor,
                opacity: hasActive ? 1 : 0,
                transform: hasActive ? "scale(1)" : "scale(0.5)",
                transformOrigin: `${v.x}px ${v.y}px`,
                transition: hasActive ? ANIM.valIn : ANIM.valOut,
              }}>
              {line1}
            </text>
            <text x={v.x} y={v.y + 3} textAnchor="middle" dominantBaseline="central"
              style={{
                fontSize: fit.fontSize, fontWeight: 500, fill: valColor,
                opacity: hasActive && hasTwo ? 1 : 0,
                transform: hasActive ? "scale(1)" : "scale(0.5)",
                transformOrigin: `${v.x}px ${v.y}px`,
                transition: hasActive ? ANIM.valIn : ANIM.valOut,
              }}>
              {line2}
            </text>
            <text x={v.x} y={v.y + 18} textAnchor="middle"
              style={{
                fontSize: 7, fill: sm.color,
                opacity: hasActive ? 0.8 : 0.5,
                letterSpacing: 1, textTransform: "uppercase",
                transition: ANIM.opacityFade,
              }}>
              {sm.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
