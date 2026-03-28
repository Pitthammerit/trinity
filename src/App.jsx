import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { MODES, MODE_EXPLORER, MODE_DATA, ANIM, NEUTRAL, SECTION_META, OM_GRADIENT_STOPS } from "./constants";
import { useBreathing } from "./hooks/useBreathing";
import { useTrinityData } from "./hooks/useTrinityData";
import Triangle from "./components/Triangle";
import DataTable from "./components/DataTable";
import ConfirmDialog from "./components/ConfirmDialog";
import PasscodeGate from "./components/PasscodeGate";

export default function App() {
  const [mode, setMode] = useState(MODE_EXPLORER);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [pillPos, setPillPos] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [intro, setIntro] = useState(true);

  // WHY phase system: loading screen stays visible ≥2.5s, then fades out, then intro plays
  // "loading" → show Channeling Trinity; "fading" → fade-out transition; "ready" → main app
  const [phase, setPhase] = useState("loading");
  const [minTimeUp, setMinTimeUp] = useState(false);

  const { active, displayActive, handleRowClick, reset, shiftDown } = useBreathing();
  const { data, loading, updateCell, deleteRow, addRow } = useTrinityData();

  const navRef = useRef(null);
  const btnRefs = useRef({});

  // Minimum 2.5s loading screen
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeUp(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // When data is loaded AND min time elapsed, start fade-out
  useEffect(() => {
    if (!loading && minTimeUp && phase === "loading") {
      setPhase("fading");
    }
  }, [loading, minTimeUp, phase]);

  // After fade-out animation (600ms), enter ready phase
  useEffect(() => {
    if (phase === "fading") {
      const timer = setTimeout(() => setPhase("ready"), 600);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const dismissConfirm = useCallback(() => setConfirm(null), []);

  const handleReset = useCallback(() => {
    reset();
    setMode(MODE_EXPLORER);
    setSearch("");
    setResetKey(k => k + 1);
  }, [reset]);

  const measurePill = useCallback(() => {
    const btn = btnRefs.current[mode];
    if (btn && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPillPos({ left: btnRect.left - navRect.left, width: btnRect.width });
    }
  }, [mode]);

  // WHY useLayoutEffect: measure pill before paint so it appears immediately on load
  useLayoutEffect(() => {
    measurePill();
  }, [measurePill, phase]);

  // Intro animation timer starts when app is ready
  useEffect(() => {
    if (phase === "ready" && intro) {
      const timer = setTimeout(() => setIntro(false), 3200);
      return () => clearTimeout(timer);
    }
  }, [phase, intro]);

  const filteredData = useMemo(() => {
    if (search.length >= 2) {
      const q = search.toLowerCase();
      return data
        .map((row, idx) => ({ ...row, _idx: idx }))
        .filter(
          (row) =>
            row.beginning.toLowerCase().includes(q) ||
            row.middle.toLowerCase().includes(q) ||
            row.end.toLowerCase().includes(q),
        );
    }
    return data.map((row, idx) => ({ ...row, _idx: idx }));
  }, [data, search]);

  const requestDelete = useCallback(
    (idx) => {
      const row = data[idx];
      setConfirm({
        title: "Delete trinity?",
        message: `Are you sure you want to delete row ${row.id}: "${row.beginning} \u2192 ${row.middle} \u2192 ${row.end}"? This cannot be undone.`,
        onConfirm: () => {
          deleteRow(idx);
          if (active === idx) {
            reset();
          } else if (active !== null && active > idx) {
            shiftDown();
          }
          setConfirm(null);
        },
      });
    },
    [data, active, deleteRow, reset, shiftDown],
  );

  if (phase !== "ready") {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3"
        style={{
          opacity: phase === "fading" ? 0 : 1,
          transition: "opacity 0.6s ease-out",
        }}>
        <svg width="200" height="180" viewBox="0 0 100 90" fill="none">
          <path d="M50 5 L93 80 L7 80 Z"
            stroke={NEUTRAL.line} strokeWidth="1.2" strokeLinejoin="round"
            style={{ strokeDasharray: 258, animation: "loading-triangle 2.4s ease-in-out infinite" }} />
        </svg>
        <div className="text-xs text-neutral-muted font-display uppercase tracking-[3px]"
          style={{ animation: "loading-pulse 2.4s ease-in-out infinite" }}>
          Channeling Trinity
        </div>
      </div>
    );
  }

  const showTriangle = mode === MODE_EXPLORER;

  return (
    <div className="max-w-[520px] sm:max-w-[660px] mx-auto px-2.5 pt-[18px] pb-8">
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={dismissConfirm}
        />
      )}

      <div className="text-center">
        <div className="text-[14px] font-normal uppercase tracking-[5px] text-neutral-muted font-display"
          style={intro ? { animation: "intro-fade 1.0s ease-out both" } : undefined}>
          Concept of
        </div>
        <div className="text-2xl font-medium uppercase tracking-[3px] text-neutral-text font-display"
          style={intro ? { animation: "intro-fade 1.0s ease-out 0.5s both" } : undefined}>
          Trinity in the Universe
        </div>
      </div>

      <div
        style={{
          maxHeight: showTriangle ? 700 : 0,
          opacity: showTriangle ? 1 : 0,
          transform: showTriangle ? "scale(1)" : "scale(0.6)",
          transformOrigin: "top center",
          transition: ANIM.triangleCollapse,
          overflow: "hidden",
        }}
      >
        <Triangle active={displayActive} data={data} intro={intro} />
      </div>

      <div className="flex items-center justify-center gap-1 mb-2.5 mt-1"
        style={intro ? { animation: "intro-slide-down 0.5s ease-out 2.0s both" } : undefined}>
        <span className="text-[13px] text-neutral-muted whitespace-nowrap">
          {search.length >= 2 ? filteredData.length + "/" : ""}
          {data.length}{"\u25B3"}
        </span>

        <div ref={navRef} className="relative flex">
          {pillPos && (
            <div
              className="absolute top-0 h-full rounded-full z-0"
              style={{
                left: pillPos.left,
                width: pillPos.width,
                transition: ANIM.pillSlide,
                background: `linear-gradient(135deg, ${SECTION_META.beginning.color}35, ${OM_GRADIENT_STOPS[0]}28, ${SECTION_META.middle.color}30, ${OM_GRADIENT_STOPS[2]}28, ${SECTION_META.end.color}35)`,
                boxShadow: `inset 0 0 0 1px ${SECTION_META.middle.color}20, 0 1px 4px ${SECTION_META.middle.color}15`,
              }}
            />
          )}
          {MODES.map((m) => (
            <button
              key={m.key}
              ref={(el) => { btnRefs.current[m.key] = el; }}
              onClick={() => setMode(m.key)}
              className="relative z-[1] py-[7px] px-2.5 text-[13px] bg-transparent border-none cursor-pointer transition-colors duration-300"
              style={{
                color: mode === m.key ? NEUTRAL.navActive : NEUTRAL.muted,
                fontWeight: mode === m.key ? 500 : 400,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5">
          <svg width={13} height={13} viewBox="0 0 16 16" fill="none"
            stroke={NEUTRAL.subtle} strokeWidth={1.5} strokeLinecap="round">
            <circle cx={7} cy={7} r={4.5} />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-[72px] text-[12px] py-1 px-0 border-0 border-b border-b-neutral-border bg-transparent text-neutral-text outline-none font-display"
          />
        </div>

        <button
          onClick={handleReset}
          className="p-1 bg-transparent text-neutral-subtle border-none cursor-pointer flex items-center justify-center hover:text-neutral-muted"
        >
          <svg width={13} height={13} viewBox="0 0 16 16" fill="none"
            stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 8a6 6 0 0111.47-2.4" />
            <path d="M14 8a6 6 0 01-11.47 2.4" />
            <polyline points="2 2 2 5.5 5.5 5.5" />
            <polyline points="14 14 14 10.5 10.5 10.5" />
          </svg>
        </button>
      </div>

      <div style={intro ? { animation: "intro-fade 0.5s ease-out 2.3s both" } : undefined}>
      {(() => {
        const table = (
          <DataTable
            data={data}
            filteredData={filteredData}
            mode={mode}
            search={search}
            active={active}
            onRowClick={handleRowClick}
            onUpdateCell={updateCell}
            onDeleteRow={requestDelete}
            onAddRow={addRow}
            maxHeight={mode === MODE_EXPLORER ? 380 : 600}
            resetKey={resetKey}
          />
        );
        return mode === MODE_DATA ? <PasscodeGate>{table}</PasscodeGate> : table;
      })()}
      </div>

      <div className="text-center mt-6 text-[10px] text-neutral-subtle tracking-[1px] font-display"
        style={intro ? { animation: "intro-fade 0.4s ease-out 2.6s both" } : undefined}>
        {"\u00A9"} 2026 Muralidher & Benjamin Kurtz, Mysuru, India
      </div>
    </div>
  );
}
