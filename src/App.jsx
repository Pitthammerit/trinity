import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { MODES, MODE_EXPLORER, MODE_DATA, ANIM, NEUTRAL } from "./constants";
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

  const { active, displayActive, handleRowClick, reset, shiftDown } = useBreathing();
  const { data, loading, updateCell, deleteRow, addRow } = useTrinityData();

  const navRef = useRef(null);
  const btnRefs = useRef({});

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
  }, [measurePill, loading]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-base text-neutral-muted font-display">
        Loading...
      </div>
    );
  }

  const showTriangle = mode === MODE_EXPLORER;

  return (
    <div className="max-w-[520px] mx-auto px-2.5 pt-[18px] pb-8">
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={dismissConfirm}
        />
      )}

      <div className="text-center">
        <div className="text-[13px] font-normal uppercase tracking-[5px] text-neutral-subtle font-display">
          Concept of
        </div>
        <div className="text-2xl font-medium uppercase tracking-[3px] text-neutral-text font-display">
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
        <Triangle active={displayActive} data={data} />
      </div>

      <div className="flex items-center justify-center gap-1 mb-2.5 mt-1">
        <span className="text-[11px] text-neutral-muted whitespace-nowrap">
          {search.length >= 2 ? filteredData.length + "/" : ""}
          {data.length}{"\u25B3"}
        </span>

        <div ref={navRef} className="relative flex">
          {pillPos && (
            <div
              className="absolute top-0 h-full rounded-full z-0"
              style={{
                background: NEUTRAL.pillTrack,
                left: pillPos.left,
                width: pillPos.width,
                transition: ANIM.pillSlide,
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
            className="w-[72px] text-[12px] py-1 px-0 border-0 border-b border-b-neutral-border bg-transparent text-neutral-text outline-none"
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

      <div className="text-center mt-6 text-[10px] text-neutral-subtle tracking-[1px] font-display">
        {"\u00A9"} 2026 Muralidher & Benjamin Kurtz, Mysuru, India
      </div>
    </div>
  );
}
