import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { MODES_DESKTOP, MODES_MOBILE, MODE_EXPLORER, MODE_SPLIT, MODE_LIST, MODE_DATA, ANIM, NEUTRAL, SECTION_META, OM_GRADIENT_STOPS } from "./constants";
import { useBreathing } from "./hooks/useBreathing";
import { useTrinityData } from "./hooks/useTrinityData";
import Triangle from "./components/Triangle";
import DataTable from "./components/DataTable";
import ConfirmDialog from "./components/ConfirmDialog";
import PasscodeGate from "./components/PasscodeGate";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches,
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export default function App() {
  const [mode, setMode] = useState(MODE_EXPLORER);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [pillPos, setPillPos] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [intro, setIntro] = useState(true);
  const isDesktop = useIsDesktop();

  // "loading" = triangle loops draw+withdraw; "ready" = main app with intro
  const [phase, setPhase] = useState("loading");
  const [minTimeUp, setMinTimeUp] = useState(false);
  const [textFading, setTextFading] = useState(false);
  const pathRef = useRef(null);
  const exitingRef = useRef(false);

  const { active, displayActive, handleRowClick, reset, shiftDown } = useBreathing();
  const { data, loading, updateCell, deleteRow, addRow } = useTrinityData();

  const navRef = useRef(null);
  const btnRefs = useRef({});

  // Minimum 3s loading screen
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeUp(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // WHY exitingRef instead of state: setPhase("exiting") would re-render,
  // causing React's effect cleanup to cancel our scheduled timers.
  // Using a ref avoids the re-render entirely — animation continues undisturbed.
  useEffect(() => {
    if (!(!loading && minTimeUp && phase === "loading")) return;
    if (exitingRef.current) return;
    exitingRef.current = true;

    const path = pathRef.current;
    const anim = path?.getAnimations()[0];
    if (!path || !anim) { setPhase("ready"); return; }

    const duration = 3600; // matches CSS animation duration
    const currentTime = anim.currentTime;

    // Let current cycle finish naturally, then stop (no more loops)
    const targetIter = Math.ceil(currentTime / duration) || 1;
    anim.effect.updateTiming({ iterations: targetIter, fill: "forwards" });

    // Calculate when the last third of withdraw starts (82% of cycle)
    const endTime = targetIter * duration;
    const lastThirdStart = endTime - (duration * 0.18);
    const textDelay = Math.max(0, lastThirdStart - currentTime);

    // Fade text when last third of withdrawal begins
    setTimeout(() => setTextFading(true), textDelay);

    // Transition to ready after text fade (1s) fully completes
    const animRemaining = endTime - currentTime;
    setTimeout(() => setPhase("ready"), Math.max(animRemaining + 200, textDelay + 1500));
  }, [loading, minTimeUp, phase]);

  const dismissConfirm = useCallback(() => setConfirm(null), []);

  const handleReset = useCallback(() => {
    reset();
    setMode(MODE_EXPLORER);
    setSearch("");
    setResetKey(k => k + 1);
  }, [reset]);

  // Resolve effective mode: on mobile, Split falls back to List
  const effectiveMode = (mode === MODE_SPLIT && !isDesktop) ? MODE_LIST : mode;
  const isSplit = effectiveMode === MODE_SPLIT;
  const modes = isDesktop ? MODES_DESKTOP : MODES_MOBILE;

  // Map the mode key for pill measurement — on mobile, MODE_SPLIT maps to MODE_LIST
  const pillMode = (mode === MODE_SPLIT && !isDesktop) ? MODE_LIST : mode;

  const measurePill = useCallback(() => {
    const btn = btnRefs.current[pillMode];
    if (btn && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPillPos({ left: btnRect.left - navRect.left, width: btnRect.width });
    }
  }, [pillMode]);

  // WHY useLayoutEffect: measure pill before paint so it appears immediately on load
  useLayoutEffect(() => {
    measurePill();
  }, [measurePill, phase, isDesktop]);

  // Intro animation timer starts when app is ready
  useEffect(() => {
    if (phase === "ready" && intro) {
      const timer = setTimeout(() => setIntro(false), 2200);
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

  // Handle mode change — when switching between desktop/mobile, remap Split<->List
  const handleModeChange = useCallback((key) => {
    if (key === MODE_LIST && isDesktop) setMode(MODE_SPLIT);
    else if (key === MODE_SPLIT && !isDesktop) setMode(MODE_LIST);
    else setMode(key);
  }, [isDesktop]);

  if (phase !== "ready") {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <svg width="200" height="180" viewBox="0 0 100 90" fill="none">
          <path ref={pathRef} d="M50 5 L93 80 L7 80 Z"
            stroke={NEUTRAL.line} strokeWidth="0.6" strokeLinejoin="round"
            style={{
              strokeDasharray: 258,
              animation: "loading-triangle 3.6s ease-in-out infinite",
            }} />
        </svg>
        <div className="text-xs text-neutral-muted font-display uppercase tracking-[3px]"
          style={{
            opacity: textFading ? 0 : 1,
            transition: "opacity 1s ease-out",
          }}>
          Channeling Trinity
        </div>
      </div>
    );
  }

  const showTriangle = effectiveMode === MODE_EXPLORER || isSplit;

  // Nav bar renders in two slots: top (for split) and mid (for explorer/list/data)
  const navAtTop = isSplit;

  const navBar = (
    <div className="flex items-center justify-center gap-1"
      style={intro ? { animation: "intro-slide-down 0.5s ease-out 1.2s both" } : undefined}>
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
        {modes.map((m) => (
          <button
            key={m.key}
            ref={(el) => { btnRefs.current[m.key] = el; }}
            onClick={() => handleModeChange(m.key)}
            className="relative z-[1] py-[7px] px-2.5 text-[13px] bg-transparent border-none cursor-pointer transition-colors duration-300"
            style={{
              color: mode === m.key || (m.key === MODE_LIST && mode === MODE_SPLIT) || (m.key === MODE_SPLIT && mode === MODE_LIST)
                ? NEUTRAL.navActive : NEUTRAL.muted,
              fontWeight: mode === m.key || (m.key === MODE_LIST && mode === MODE_SPLIT) || (m.key === MODE_SPLIT && mode === MODE_LIST)
                ? 500 : 400,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="w-[72px] text-[13px] py-1 px-0 border-0 border-b border-b-neutral-border bg-transparent text-neutral-text outline-none"
      />

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
  );

  const tableMaxHeight = isSplit ? "none"
    : !isDesktop ? "100%"
    : effectiveMode === MODE_EXPLORER ? 380 : 600;

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
      maxHeight={tableMaxHeight}
      resetKey={resetKey}
    />
  );

  const tableContent = mode === MODE_DATA ? <PasscodeGate>{table}</PasscodeGate> : table;

  return (
    <div
      className="mx-auto px-2.5 pt-[18px] pb-4"
      style={{
        maxWidth: isSplit ? 1100 : 660,
        transition: ANIM.splitLayout,
        ...(!isDesktop && !isSplit ? { height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" } : {}),
      }}
    >
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

      {/* Nav at top position (Split mode) */}
      <div
        className="mb-2.5 mt-1"
        style={{
          opacity: navAtTop ? 1 : 0,
          transform: navAtTop ? "translateY(0)" : "translateY(-8px)",
          transition: ANIM.navReposition,
          pointerEvents: navAtTop ? "auto" : "none",
          position: navAtTop ? "relative" : "absolute",
          visibility: navAtTop ? "visible" : "hidden",
        }}
      >
        {navAtTop && navBar}
      </div>

      {isSplit ? (
        /* Split layout: two-column CSS Grid */
        <div
          className="split-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            transition: ANIM.splitLayout,
          }}
        >
          <div style={{ position: "sticky", top: 18, alignSelf: "start" }}>
            <Triangle active={displayActive} data={data} intro={intro} />
          </div>
          <div style={intro ? { animation: "intro-fade 0.5s ease-out 1.5s both" } : undefined}>
            {tableContent}
          </div>
        </div>
      ) : (
        /* Single-column layout (Explorer, List, Data) */
        <>
          <div
            style={{
              maxHeight: showTriangle ? "min(700px, calc(100vh - 280px))" : 0,
              opacity: showTriangle ? 1 : 0,
              transform: showTriangle ? "scale(1)" : "scale(0.6)",
              transformOrigin: "top center",
              transition: ANIM.triangleCollapse,
              overflow: "hidden",
            }}
          >
            <Triangle active={displayActive} data={data} intro={intro} />
          </div>

          {/* Nav at mid position (non-Split modes) */}
          <div
            className="mb-2.5 mt-1"
            style={{
              opacity: navAtTop ? 0 : 1,
              transform: navAtTop ? "translateY(8px)" : "translateY(0)",
              transition: ANIM.navReposition,
              pointerEvents: navAtTop ? "none" : "auto",
            }}
          >
            {!navAtTop && navBar}
          </div>

          <div style={{
            ...(intro ? { animation: "intro-fade 0.5s ease-out 1.5s both" } : undefined),
            ...(!isDesktop ? { flex: 1, minHeight: 0 } : {}),
          }}>
            {tableContent}
          </div>
        </>
      )}

      <div className="text-center mt-2 text-[10px] text-neutral-subtle tracking-[1px] font-display"
        style={intro ? { animation: "intro-fade 0.4s ease-out 1.8s both" } : undefined}>
        {"\u00A9"} 2026 Muralidher & Benjamin Kurtz, Mysuru, India
      </div>
    </div>
  );
}
