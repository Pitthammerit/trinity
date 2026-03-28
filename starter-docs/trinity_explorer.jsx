import { useState, useCallback, useRef, useEffect } from "react";

/* ─── DATA SOURCE ─── */
const INITIAL_DATA = [
  { id: 1,  beginning: "Governing",       middle: "Operating",       end: "Dissolution",      color: "#af574f" },
  { id: 2,  beginning: "Brahma",          middle: "Vishnu",          end: "Shankara",          color: "#af644f" },
  { id: 3,  beginning: "Saraswati",       middle: "Laxmi",           end: "Parvati",           color: "#af724f" },
  { id: 4,  beginning: "Yesterday",       middle: "Today",           end: "Tomorrow",          color: "#af804f" },
  { id: 5,  beginning: "Morning",         middle: "Afternoon",       end: "Night",             color: "#af8e4f" },
  { id: 6,  beginning: "Present",         middle: "Futur",           end: "Past",              color: "#af9c4f" },
  { id: 7,  beginning: "Body",            middle: "Mind",            end: "Soul",              color: "#afaa4f" },
  { id: 8,  beginning: "Physical",        middle: "Emotional",       end: "Spiritual",         color: "#a7af4f" },
  { id: 9,  beginning: "Father",          middle: "Son",             end: "Holy Spirit",       color: "#9aaf4f" },
  { id: 10, beginning: "Sato",            middle: "Rajas",           end: "Tamo",              color: "#8caf4f" },
  { id: 11, beginning: "Sthula",          middle: "Sukshma",         end: "Nirakari",          color: "#7eaf4f" },
  { id: 12, beginning: "Budhi",           middle: "Manas",           end: "Sanskara",          color: "#70af4f" },
  { id: 13, beginning: "Intellect",       middle: "Intelligence",    end: "Wisdom",            color: "#62af4f" },
  { id: 14, beginning: "Yantra",          middle: "Tantra",          end: "Mantra",            color: "#54af4f" },
  { id: 15, beginning: "Love",            middle: "Happiness",       end: "Health",            color: "#4faf57" },
  { id: 16, beginning: "Thoughts",        middle: "Knowledge",       end: "Impact",            color: "#4faf64" },
  { id: 17, beginning: "F1",              middle: "F2",              end: "F3",                color: "#4faf72" },
  { id: 18, beginning: "Illusion",        middle: "Delusion",        end: "Visualization",     color: "#4faf80" },
  { id: 19, beginning: "Teacher",         middle: "Guru",            end: "Satguru",           color: "#4faf8e" },
  { id: 20, beginning: "Atom",            middle: "Electron",        end: "Proton",            color: "#4faf9c" },
  { id: 21, beginning: "Corporal World",  middle: "Subtle World",    end: "Incorporal World",  color: "#4fafaa" },
  { id: 22, beginning: "Dhata",           middle: "Vidhata",         end: "Bhagya Vidhata",      color: "#4fa7af" },
  { id: 23, beginning: "Doctor",          middle: "Nurse",           end: "Surgeon",           color: "#4f9aaf" },
  { id: 24, beginning: "Akarma",          middle: "Sukarma",         end: "Vikarma",           color: "#4f8caf" },
  { id: 25, beginning: "True Words",      middle: "Necessary Words", end: "Helpful Words",     color: "#4f7eaf" },
  { id: 26, beginning: "Birth",           middle: "Choice",          end: "Death",             color: "#4f70af" },
  { id: 27, beginning: "Masculine",       middle: "Feminine",        end: "Trans Gender",      color: "#4f62af" },
  { id: 28, beginning: "Physical Healing",middle: "Mental Healing",   end: "Spiritual Healing", color: "#4f54af" },
  { id: 29, beginning: "Silence",         middle: "Sweet Silence",   end: "Dead Silence",      color: "#574faf" },
  { id: 30, beginning: "Vatha Dosha",     middle: "Kapha Dosha",     end: "Pitta Dosha",       color: "#644faf" },
  { id: 31, beginning: "Atma Vidhya",     middle: "Maha Vidhya",     end: "Sri Vidhya",        color: "#724faf" },
  { id: 32, beginning: "Testimonial",      middle: "Inferred",       end: "Experiential",      color: "#804faf" },
  { id: 33, beginning: "Sthula Sharir",    middle: "Sukshma Sharir", end: "Karan Sharir",        color: "#8e4faf" },
  { id: 34, beginning: "Day",             middle: "Year",            end: "Kalpa",             color: "#9c4faf" },
  { id: 35, beginning: "Left Eye",        middle: "Right Eye",       end: "Middle Eye",        color: "#aa4faf" },
  { id: 36, beginning: "Water",           middle: "Trees",           end: "Earth",             color: "#af4fa7" },
  { id: 37, beginning: "Advaitha",        middle: "Dwaitha",         end: "Vishishtadvaita",   color: "#af4f9a" },
  { id: 38, beginning: "Ida",             middle: "Pingala",         end: "Sushamna",          color: "#af4f8c" },
  { id: 39, beginning: "Yajur Veda",      middle: "Rigveda",         end: "Sama Veda",         color: "#af4f7e" },
  { id: 40, beginning: "Seeker",          middle: "Meditation",      end: "Bramh",            color: "#af4f70" },
  { id: 41, beginning: "Knower",          middle: "Knowing",         end: "Known",             color: "#af4f62" },
  { id: 42, beginning: "Nirvikari",       middle: "Nirahankari",    end: "Nirayani",          color: "#af4f54" },
];

const SECTION_META = {
  beginning: { label: "Beginning", letter: "A", color: "#D85A30" },
  middle:    { label: "Middle",    letter: "U", color: "#1D9E75" },
  end:       { label: "End",       letter: "M", color: "#534AB7" },
};
const SECTION_KEYS = ["beginning", "middle", "end"];
const MODES = [
  { key: "explorer", label: "Explorer" },
  { key: "list",     label: "List" },
  { key: "data",     label: "Data" },
];

/* ─── GLASS STYLE (reusable) ─── */
const glassStyle = (opacity = 0.72) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
});

/* ─── COLOR UTILS ─── */
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s, l];
}
function hslToHex(h, s, l) {
  h /= 360;
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}
function colorVariants(hex) {
  const [r, g, b] = hexToRgb(hex);
  return {
    fill: hex,
    bg: rgbToHex(r + (255 - r) * 0.78, g + (255 - g) * 0.78, b + (255 - b) * 0.78),
    text: rgbToHex(r * 0.45, g * 0.45, b * 0.45),
  };
}
function generateUniqueColor(existingColors) {
  const hues = existingColors.map(c => rgbToHsl(...hexToRgb(c))[0]).sort((a, b) => a - b);
  if (hues.length === 0) return hslToHex(200, 0.38, 0.5);
  let maxGap = 0, gapStart = 0;
  for (let i = 0; i < hues.length; i++) {
    const next = i === hues.length - 1 ? hues[0] + 360 : hues[i + 1];
    const gap = next - hues[i];
    if (gap > maxGap) { maxGap = gap; gapStart = hues[i]; }
  }
  return hslToHex((gapStart + maxGap / 2) % 360, 0.35 + Math.random() * 0.1, 0.48 + Math.random() * 0.08);
}

/* ─── TEXT HIGHLIGHT ─── */
function HighlightText({ text, query, color }) {
  if (!query || query.length < 2) return text;
  const lc = text.toLowerCase(), q = query.toLowerCase();
  const parts = [];
  let last = 0, idx = lc.indexOf(q, last);
  while (idx !== -1) {
    if (idx > last) parts.push({ str: text.slice(last, idx), match: false });
    parts.push({ str: text.slice(idx, idx + q.length), match: true });
    last = idx + q.length;
    idx = lc.indexOf(q, last);
  }
  if (last < text.length) parts.push({ str: text.slice(last), match: false });
  if (parts.length === 0) return text;
  return parts.map((p, i) => p.match
    ? <span key={i} style={{ background: color + "40", borderRadius: 2, padding: "0 1px" }}>{p.str}</span>
    : <span key={i}>{p.str}</span>
  );
}

/* ─── CONFIRM DIALOG (reusable) ─── */
function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = "Yes, delete", cancelLabel = "Cancel", danger = true }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, ...glassStyle(0.3) }} onClick={onCancel} />
      <div style={{
        position: "relative", zIndex: 1, ...glassStyle(0.92),
        border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)",
        padding: "20px 24px", maxWidth: 380, width: "90%",
      }}>
        {title && <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>{title}</div>}
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: 20 }}>{message}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "7px 16px", fontSize: 12, cursor: "pointer", background: "transparent", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)" }}>{cancelLabel}</button>
          <button onClick={onConfirm} style={{ padding: "7px 16px", fontSize: 12, cursor: "pointer", background: danger ? "#c0392b" : "var(--color-text-primary)", color: "#fff", border: "none", borderRadius: "var(--border-radius-md)" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── EDITABLE CELL ─── */
function EditableCell({ value, onSave, onEditStart, onEditEnd, style: cellStyle }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  useEffect(() => { setDraft(value); }, [value]);
  const commit = () => { const t = draft.trim(); if (t && t !== value) onSave(t); setEditing(false); onEditEnd?.(); };
  const startEdit = () => { setEditing(true); onEditStart?.(); };
  if (editing) {
    return (
      <td style={{ ...cellStyle, padding: "2px 4px" }}>
        <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); onEditEnd?.(); } }}
          style={{ width: "100%", fontSize: 13, padding: "3px 4px", border: "1.5px solid var(--color-border-info)", borderRadius: 3, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box", outline: "none" }} />
      </td>
    );
  }
  return <td style={{ ...cellStyle, cursor: "text" }} onDoubleClick={startEdit} title="Double-click to edit">{value}</td>;
}

/* ─── SMART TEXT FIT ─── */
function fitText(text, maxW) {
  const cw = { 13: 7.8, 12: 7.2, 11: 6.6, 10: 6, 9: 5.4, 8: 4.8, 7: 4.2, 6: 3.6 };
  const sizes = [13, 12, 11, 10, 9, 8, 7, 6];
  const words = text.split(" ");
  const multi = words.length > 1;
  for (const s of sizes) {
    if (text.length * cw[s] <= maxW) return { lines: [text], fontSize: s };
    if (multi) {
      let best = 0, bestDiff = Infinity;
      for (let i = 1; i < words.length; i++) {
        const l1 = words.slice(0, i).join(" ").length;
        const l2 = words.slice(i).join(" ").length;
        const diff = Math.abs(l1 - l2);
        if (diff < bestDiff) { bestDiff = diff; best = i; }
      }
      const line1 = words.slice(0, best).join(" ");
      const line2 = words.slice(best).join(" ");
      if (Math.max(line1.length, line2.length) * cw[s] <= maxW) {
        return { lines: [line1, line2], fontSize: s };
      }
    }
  }
  if (multi) {
    const mid = Math.ceil(words.length / 2);
    return { lines: [words.slice(0, mid).join(" "), words.slice(mid).join(" ")], fontSize: 6 };
  }
  return { lines: [text], fontSize: 6 };
}

/* ─── TRIANGLE ─── */
function Triangle({ active, data }) {
  const cx = 200, cy = 200, r = 145;
  const topX = cx, topY = cy - r;
  const blX = cx - r * Math.cos(Math.PI / 6), blY = cy + r * Math.sin(Math.PI / 6);
  const brX = cx + r * Math.cos(Math.PI / 6), brY = cy + r * Math.sin(Math.PI / 6);
  const vertices = [
    { x: topX, y: topY, key: "beginning" },
    { x: brX, y: brY, key: "middle" },
    { x: blX, y: blY, key: "end" },
  ];
  const hasActive = active !== null && active < data.length;
  const row = hasActive ? data[active] : null;
  const cv = hasActive ? colorVariants(row.color) : null;
  const lineColor = "#c8c5be";

  /* Remember last row so text stays during scale-down fade-out */
  const lastRowRef = useRef(null);
  const lastCvRef = useRef(null);
  if (row) { lastRowRef.current = row; lastCvRef.current = cv; }
  const showRow = row || lastRowRef.current;
  const showCv = cv || lastCvRef.current;

  return (
    <svg viewBox="0 0 400 395" style={{ width: "100%", display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="omRainbow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D85A30" stopOpacity="0.35" />
          <stop offset="20%" stopColor="#D8A030" stopOpacity="0.3" />
          <stop offset="40%" stopColor="#50B860" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#1D9E75" stopOpacity="0.25" />
          <stop offset="80%" stopColor="#4070B0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#534AB7" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {/* Tapered arc ribbons + arrows */}
      {(() => {
        const off = 0.24, angles = [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6];
        const arcs = [
          { from: 0, to: 1, color: SECTION_META.beginning.color },
          { from: 1, to: 2, color: SECTION_META.middle.color },
          { from: 2, to: 0, color: SECTION_META.end.color },
        ];
        const aL = 20, aH = 7, segs = 24, startHW = 0.25, endHW = 1.5;
        return (
          <g>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={lineColor} strokeWidth="0.5" />
            {arcs.map(({ from, to, color: arcColor }, i) => {
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
              const fillC = hasActive ? cv.fill : arcColor;
              return (<g key={i} style={{ transition: "opacity 0.4s ease" }}>
                <path d={ribbonD} fill={fillC} style={{ transition: "fill 0.4s ease" }} />
                <polygon points={`${tipX},${tipY} ${bx + aH * nx},${by + aH * ny} ${bx - aH * nx},${by - aH * ny}`} fill={fillC} style={{ transition: "fill 0.4s ease" }} />
              </g>);
            })}
          </g>
        );
      })()}

      {/* Inner triangle — three colored edges */}
      {[
        { x1: topX, y1: topY, x2: brX, y2: brY, color: SECTION_META.beginning.color },
        { x1: brX, y1: brY, x2: blX, y2: blY, color: SECTION_META.middle.color },
        { x1: blX, y1: blY, x2: topX, y2: topY, color: SECTION_META.end.color },
      ].map((edge, i) => (
        <line key={i} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
          stroke={hasActive ? cv.fill : edge.color}
          strokeWidth={hasActive ? 4.5 : 0.8}
          opacity={hasActive ? 0.3 : 0.4}
          style={{ transition: "stroke 0.4s ease, opacity 0.4s ease, stroke-width 0.4s ease" }} />
      ))}

      {/* OM — large rainbow gradient */}
      <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 120, fontWeight: 300, fill: "url(#omRainbow)", opacity: 1, transition: "opacity 0.4s ease", fontFamily: "Georgia, serif" }}>ॐ</text>

      {/* Vertex circles */}
      {vertices.map((v) => {
        const sm = SECTION_META[v.key];
        const val = showRow ? showRow[v.key] : "";
        const activeR = 48;
        const fit = val ? fitText(val, activeR * 1.5) : { lines: [""], fontSize: 11 };
        const valIn = "opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s";
        const valOut = "opacity 0.35s ease, transform 0.35s ease";
        const letIn = "opacity 0.4s ease 0.1s";
        const letOut = "opacity 0.25s ease";
        const valColor = showCv ? showCv.fill : sm.color;
        return (<g key={v.key}>
          <circle cx={v.x} cy={v.y} r={hasActive ? activeR : 36}
            fill={hasActive ? cv.bg : sm.color}
            fillOpacity={hasActive ? 1 : 0.08}
            stroke={hasActive ? cv.fill : sm.color}
            strokeWidth={hasActive ? 1 : 0.5}
            strokeOpacity={hasActive ? 0.8 : 0.25}
            style={{ transition: "all 0.4s ease" }} />
          {/* Letter — fades out fast, fades in with slight delay */}
          <text x={v.x} y={v.y - 3} textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 20, fontWeight: 500, fill: sm.color, fontFamily: "serif", opacity: hasActive ? 0 : 1, transition: hasActive ? letOut : letIn }}>{sm.letter}</text>
          {/* Value — text persists during scale-down via showRow */}
          {(() => {
            const line1 = fit.lines[0] || "";
            const line2 = fit.lines[1] || "";
            const hasTwo = fit.lines.length === 2;
            const y1 = hasTwo ? v.y - 11 : v.y - 5;
            return (
              <>
                <text x={v.x} y={y1} textAnchor="middle" dominantBaseline="central"
                  style={{ fontSize: fit.fontSize, fontWeight: 500, fill: valColor, opacity: hasActive ? 1 : 0, transform: hasActive ? "scale(1)" : "scale(0.5)", transformOrigin: `${v.x}px ${v.y}px`, transition: hasActive ? valIn : valOut }}>{line1}</text>
                <text x={v.x} y={v.y + 3} textAnchor="middle" dominantBaseline="central"
                  style={{ fontSize: fit.fontSize, fontWeight: 500, fill: valColor, opacity: hasActive && hasTwo ? 1 : 0, transform: hasActive ? "scale(1)" : "scale(0.5)", transformOrigin: `${v.x}px ${v.y}px`, transition: hasActive ? valIn : valOut }}>{line2}</text>
              </>
            );
          })()}
          {/* Label — fixed below circle */}
          <text x={v.x} y={v.y + 18} textAnchor="middle"
            style={{ fontSize: 7, fill: sm.color, opacity: hasActive ? 0.8 : 0.5, letterSpacing: 1, textTransform: "uppercase", transition: "opacity 0.4s ease" }}>{sm.label}</text>
        </g>);
      })}
    </svg>
  );
}

/* ─── MAIN APP ─── */
export default function TrinityExplorer() {
  const [data, setData] = useState(INITIAL_DATA);
  const [active, setActive] = useState(null);
  const [displayActive, setDisplayActive] = useState(null);
  const [mode, setMode] = useState("explorer");
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [pillPos, setPillPos] = useState({ left: 0, width: 0 });
  const navRef = useRef(null);
  const btnRefs = useRef({});

  /* Clear any stale storage from previous versions */
  useEffect(() => {
    (async () => {
      try { await window.storage.delete("trinity-data"); } catch (e) {}
    })();
  }, []);
  const [newRow, setNewRow] = useState({ beginning: "", middle: "", end: "" });
  const [scrolled, setScrolled] = useState(false);
  const listRef = useRef(null);
  const switchTimer = useRef(null);

  const showTriangle = mode === "explorer";

  const filteredData = search.length >= 2
    ? data.map((row, idx) => ({ ...row, _idx: idx })).filter(row => {
        const q = search.toLowerCase();
        return row.beginning.toLowerCase().includes(q) || row.middle.toLowerCase().includes(q) || row.end.toLowerCase().includes(q);
      })
    : data.map((row, idx) => ({ ...row, _idx: idx }));

  const handleRowClick = useCallback((idx) => {
    if (switchTimer.current) clearTimeout(switchTimer.current);
    const prev = active;
    const next = prev === idx ? null : idx;
    setActive(next);
    if (prev !== null && next !== null) {
      setDisplayActive(null);
      switchTimer.current = setTimeout(() => { setDisplayActive(next); switchTimer.current = null; }, 420);
    } else {
      setDisplayActive(next);
    }
  }, [active]);

  const updateCell = useCallback((idx, key, value) => {
    setData(prev => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r));
  }, []);

  const requestDelete = useCallback((idx) => {
    const row = data[idx];
    setConfirm({
      title: "Delete trinity?",
      message: `Are you sure you want to delete row ${row.id}: "${row.beginning} → ${row.middle} → ${row.end}"? This cannot be undone.`,
      onConfirm: () => {
        setData(prev => prev.filter((_, i) => i !== idx));
        if (active === idx) { setActive(null); setDisplayActive(null); }
        else if (active > idx) { setActive(prev => prev - 1); setDisplayActive(prev => prev !== null ? prev - 1 : null); }
        setConfirm(null);
      },
    });
  }, [data, active]);

  const addRow = useCallback(() => {
    if (!newRow.beginning.trim() || !newRow.middle.trim() || !newRow.end.trim()) return;
    const color = generateUniqueColor(data.map(d => d.color));
    const maxId = data.reduce((m, d) => Math.max(m, d.id), 0);
    setData(prev => [...prev, { id: maxId + 1, beginning: newRow.beginning.trim(), middle: newRow.middle.trim(), end: newRow.end.trim(), color }]);
    setNewRow({ beginning: "", middle: "", end: "" });
    setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 50);
  }, [newRow, data]);

  const handleScroll = useCallback((e) => {
    setScrolled(e.target.scrollTop > 4);
  }, []);

  useEffect(() => {
    if (active !== null && listRef.current) {
      const r = listRef.current.querySelector(`[data-row="${active}"]`);
      if (r) r.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [active]);

  useEffect(() => () => { if (switchTimer.current) clearTimeout(switchTimer.current); }, []);

  /* Measure pill position on mode change */
  useEffect(() => {
    const btn = btnRefs.current[mode];
    if (btn && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPillPos({ left: btnRect.left - navRect.left, width: btnRect.width });
    }
  }, [mode]);

  const glassHeader = {
    position: "sticky", top: 0, zIndex: 2,
    ...glassStyle(scrolled ? 0.78 : 0.98),
    transition: "background 0.3s ease, backdrop-filter 0.3s ease",
  };

  const canAdd = newRow.beginning.trim() && newRow.middle.trim() && newRow.end.trim();

  return (
    <div style={{ padding: "1rem 0" }}>
      {confirm && <ConfirmDialog title={confirm.title} message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h1 style={{ fontSize: 13, fontWeight: 400, margin: 0, color: "var(--color-text-tertiary)", letterSpacing: 5, textTransform: "uppercase", fontFamily: "Georgia, 'Palatino Linotype', serif" }}>Concept of</h1>
        <h2 style={{ fontSize: 24, fontWeight: 500, margin: "4px 0 0", color: "var(--color-text-primary)", letterSpacing: 3, textTransform: "uppercase", fontFamily: "Georgia, 'Palatino Linotype', serif" }}>Trinity in the Universe</h2>
      </div>

      {/* Triangle */}
      <div style={{
        overflow: "hidden",
        maxHeight: showTriangle ? 700 : 0,
        opacity: showTriangle ? 1 : 0,
        transform: showTriangle ? "scale(1)" : "scale(0.6)",
        transformOrigin: "top center",
        transition: "max-height 0.45s ease, opacity 0.35s ease, transform 0.4s ease",
      }}>
        <Triangle active={displayActive} data={data} />
      </div>

      {/* Navigation bar: counter + pill tabs + search + reset */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 4 }}>
        <span style={{ fontSize: 14, color: "var(--color-text-secondary)", marginRight: 2 }}>
          {search.length >= 2 ? `${filteredData.length}/` : ""}{data.length} Trinities
        </span>
        <div ref={navRef} style={{ position: "relative", display: "flex", gap: 0, borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: -1, height: "calc(100% + 2px)",
            left: pillPos.left, width: pillPos.width,
            background: "#e8f0fe",
            border: "1px solid #a8c4e6",
            borderRadius: "var(--border-radius-md)",
            transition: "left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)",
            zIndex: 0,
          }} />
          {MODES.map((m) => (
            <button key={m.key} ref={el => { btnRefs.current[m.key] = el; }}
              onClick={() => setMode(m.key)} style={{
              position: "relative", zIndex: 1,
              padding: "7px 20px", fontSize: 14, cursor: "pointer",
              background: "transparent", border: "none",
              color: mode === m.key ? "#1a56a0" : "var(--color-text-secondary)",
              fontWeight: mode === m.key ? 500 : 400,
              transition: "color 0.3s ease, font-weight 0.3s ease",
            }}>{m.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
            style={{ width: 110, fontSize: 13, padding: "4px 0", border: "none", borderBottom: "1px solid var(--color-border-secondary)", borderRadius: 0, background: "transparent", color: "var(--color-text-primary)", outline: "none" }} />
        </div>
        <button onClick={() => { if (switchTimer.current) clearTimeout(switchTimer.current); setActive(null); setDisplayActive(null); setMode("explorer"); setSearch(""); setNewRow({ beginning: "", middle: "", end: "" }); }} style={{
          padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent", color: "var(--color-text-tertiary)",
          border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)",
        }} title="Reset to initial view">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.5 3.5A5 5 0 1 0 12 7" /><polyline points="8,1 10.5,3.5 8,5.5" />
          </svg>
        </button>
      </div>

      <div ref={listRef} onScroll={handleScroll} style={{
        maxHeight: mode === "explorer" ? 380 : 600,
        overflowY: "auto",
        transition: "max-height 0.4s ease",
      }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 2px", fontSize: 13, tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: 32, padding: "6px 4px", textAlign: "center", fontSize: 10, color: "var(--color-text-tertiary)", fontWeight: 400, ...glassHeader }}>#</th>
              {SECTION_KEYS.map((key) => (
                <th key={key} style={{
                  padding: "8px 8px", textAlign: "left", fontSize: 14, fontWeight: 500,
                  color: SECTION_META[key].color, borderBottom: `2px solid ${SECTION_META[key].color}`,
                  fontFamily: "Georgia, 'Palatino Linotype', serif",
                  ...glassHeader,
                }}>{SECTION_META[key].label}</th>
              ))}
              {mode === "data" && <th style={{ width: 32, ...glassHeader }}></th>}
            </tr>
          </thead>
          <tbody>
            {/* Inline new row — Data mode only */}
            {mode === "data" && (
              <tr style={{ background: "var(--color-background-secondary)" }}>
                <td style={{ padding: "4px", textAlign: "center", fontSize: 11, color: "var(--color-text-tertiary)", borderLeft: "4px solid var(--color-border-tertiary)", borderRadius: "4px 0 0 4px" }}>+</td>
                {SECTION_KEYS.map((key) => (
                  <td key={key} style={{ padding: "2px 4px" }}>
                    <input type="text" value={newRow[key]}
                      onChange={(e) => setNewRow(prev => ({ ...prev, [key]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addRow()}
                      placeholder={SECTION_META[key].label + "..."}
                      style={{ width: "100%", fontSize: 12, padding: "4px 4px", border: "none", borderBottom: `1px solid ${SECTION_META[key].color}40`, borderRadius: 0, background: "transparent", color: "var(--color-text-primary)", outline: "none", boxSizing: "border-box" }} />
                  </td>
                ))}
                <td style={{ padding: "4px", textAlign: "center", borderRadius: "0 4px 4px 0" }}>
                  <button onClick={addRow} disabled={!canAdd}
                    style={{ width: 20, height: 20, border: "none", borderRadius: 4, background: "transparent", cursor: canAdd ? "pointer" : "default", fontSize: 16, lineHeight: 1, padding: 0, color: canAdd ? "var(--color-text-success)" : "var(--color-text-tertiary)" }}
                    title="Save new trinity">✓</button>
                </td>
              </tr>
            )}

            {filteredData.map((row) => {
              const idx = row._idx;
              const cv = colorVariants(row.color);
              const isActive = active === idx;
              return (
                <tr key={row.id} data-row={idx} onClick={() => handleRowClick(idx)}
                  style={{ cursor: "pointer", transition: "background 0.15s" }}>
                  <td style={{
                    padding: "6px 4px", textAlign: "center", fontSize: 11,
                    color: cv.fill, fontWeight: 500,
                    borderLeft: `4px solid ${cv.fill}`, borderRadius: "4px 0 0 4px",
                    background: isActive ? cv.bg : cv.bg + "55",
                  }}>{row.id}</td>
                  {mode === "data" ? (
                    SECTION_KEYS.map((key) => (
                      <EditableCell key={key} value={row[key]}
                        onSave={(val) => updateCell(idx, key, val)}
                        onEditStart={() => setEditingRow(idx)}
                        onEditEnd={() => setEditingRow(null)}
                        style={{
                          padding: "6px 8px", fontSize: 13,
                          color: isActive ? "#fff" : cv.fill, fontWeight: isActive ? 500 : 400,
                          background: isActive ? cv.fill : cv.bg + "55",
                          transition: "all 0.15s",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }} />
                    ))
                  ) : (
                    SECTION_KEYS.map((key) => (
                      <td key={key} style={{
                        padding: "6px 8px", fontSize: 13,
                        color: isActive ? "#fff" : cv.fill, fontWeight: isActive ? 500 : 400,
                        background: isActive ? cv.fill : cv.bg + "55",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}><HighlightText text={row[key]} query={search} color={row.color} /></td>
                    ))
                  )}
                  {mode === "data" && (
                    <td style={{ padding: "4px", textAlign: "center", background: isActive ? cv.fill : cv.bg + "55", borderRadius: "0 4px 4px 0" }}>
                      {editingRow === idx ? (
                        <button onClick={(e) => { e.stopPropagation(); document.activeElement?.blur(); }}
                          style={{ width: 20, height: 20, border: "none", borderRadius: 4, background: "transparent", cursor: "pointer", fontSize: 16, color: "var(--color-text-success)", lineHeight: 1, padding: 0 }}
                          title="Save edit">✓</button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); requestDelete(idx); }}
                          style={{ width: 20, height: 20, border: "none", borderRadius: 4, background: "transparent", cursor: "pointer", fontSize: 14, color: isActive ? "rgba(255,255,255,0.5)" : "var(--color-text-tertiary)", lineHeight: 1, padding: 0 }}
                          title="Delete row">×</button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: "center", marginTop: 24, fontSize: 10, color: "var(--color-text-tertiary)", letterSpacing: 1, fontFamily: "Georgia, serif" }}>
        © 2026 Muralidher & Benjamin Kurtz, Mysuru, India
      </div>
    </div>
  );
}
