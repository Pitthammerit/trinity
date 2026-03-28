import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { SECTION_META, SECTION_KEYS, MODE_DATA, NEUTRAL, ANIM, FONTS } from "../constants";
import { colorVariants, generateUniqueColor, glassStyle } from "../utils/colors";
import EditableCell from "./EditableCell";
import HighlightText from "./HighlightText";

const ICON_BTN = {
  width: 20, height: 20, border: "none", borderRadius: 4,
  background: "transparent", cursor: "pointer", lineHeight: 1, padding: 0,
};

const EMPTY_ROW = Object.fromEntries(SECTION_KEYS.map(k => [k, ""]));

export default function DataTable({
  data, filteredData, mode, search, active,
  onRowClick, onUpdateCell, onDeleteRow, onAddRow,
  maxHeight, resetKey,
}) {
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState(EMPTY_ROW);
  const [scrolled, setScrolled] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (resetKey > 0) setNewRow(EMPTY_ROW);
  }, [resetKey]);

  const isData = mode === MODE_DATA;
  const canAdd = newRow.beginning.trim() && newRow.middle.trim() && newRow.end.trim();

  const colorMap = useMemo(
    () => new Map(data.map(r => [r.id, colorVariants(r.color)])),
    [data],
  );

  const handleScroll = useCallback((e) => {
    const next = e.target.scrollTop > 4;
    setScrolled(prev => prev === next ? prev : next);
  }, []);

  const addRow = useCallback(() => {
    if (!canAdd) return;
    const color = generateUniqueColor(data.map(d => d.color));
    onAddRow(newRow, color);
    setNewRow(EMPTY_ROW);
    setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 50);
  }, [newRow, canAdd, data, onAddRow]);

  useEffect(() => {
    if (active === null) return;
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-row="${active}"]`);
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  const glassHeader = useMemo(() => ({
    position: "sticky", top: 0, zIndex: 2,
    ...glassStyle(scrolled ? 0.78 : 0.98),
    transition: ANIM.glassHeader,
  }), [scrolled]);

  return (
    <div ref={listRef} onScroll={handleScroll}
      className="overflow-y-auto transition-[max-height] duration-[400ms] ease-in-out"
      style={{ maxHeight }}>
      <table className="w-full border-separate text-[14px]"
        style={{ borderSpacing: "0 2px", tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th className="w-8 py-1.5 px-1 text-center text-[10px] text-neutral-subtle font-normal"
              style={glassHeader}>#</th>
            {SECTION_KEYS.map((key) => (
              <th key={key} style={{
                padding: "8px 8px", textAlign: "left", fontSize: 14, fontWeight: 500,
                color: SECTION_META[key].color, borderBottom: `2px solid ${SECTION_META[key].color}`,
                fontFamily: FONTS.display,
                ...glassHeader,
              }}>{SECTION_META[key].label}</th>
            ))}
            {isData && <th className="w-8" style={glassHeader}></th>}
          </tr>
        </thead>
        <tbody>
          {isData && (
            <tr className="bg-neutral-surface">
              <td className="p-1 text-center text-[11px] text-neutral-subtle rounded-l"
                style={{ borderLeft: `4px solid ${NEUTRAL.borderLight}` }}>+</td>
              {SECTION_KEYS.map((key) => (
                <td key={key} className="py-0.5 px-1">
                  <input type="text" value={newRow[key]}
                    onChange={(e) => setNewRow(prev => ({ ...prev, [key]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addRow()}
                    placeholder={SECTION_META[key].label + "..."}
                    className="w-full text-xs py-1 px-1 border-0 rounded-none bg-transparent text-neutral-text outline-none box-border"
                    style={{ borderBottom: `1px solid ${SECTION_META[key].color}40` }}
                  />
                </td>
              ))}
              <td className="p-1 text-center rounded-r">
                <button onClick={addRow} disabled={!canAdd}
                  style={{ ...ICON_BTN, fontSize: 16, cursor: canAdd ? "pointer" : "default", color: canAdd ? NEUTRAL.success : NEUTRAL.disabled }}
                  title="Save new trinity">{"\u2713"}</button>
              </td>
            </tr>
          )}

          {filteredData.map((row, displayIdx) => {
            const idx = row._idx;
            const cv = colorMap.get(row.id);
            const isActive = active === idx;
            const cellStyle = {
              padding: "6px 8px", fontSize: 14,
              color: isActive ? NEUTRAL.white : cv.fill, fontWeight: isActive ? 500 : 400,
              background: isActive ? cv.fill : cv.bg + "55",
              transition: ANIM.rowTransition,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            };
            return (
              <tr key={row.id} data-row={idx} onClick={() => onRowClick(idx)}
                className="cursor-pointer transition-colors duration-150">
                <td style={{
                  padding: "6px 4px", textAlign: "center", fontSize: 11,
                  color: cv.fill, fontWeight: 500,
                  borderLeft: `4px solid ${cv.fill}`, borderRadius: "4px 0 0 4px",
                  background: isActive ? cv.bg : cv.bg + "55",
                }}>{displayIdx + 1}</td>
                {SECTION_KEYS.map((key) => (
                  isData ? (
                    <EditableCell key={key} value={row[key]}
                      onSave={(val) => onUpdateCell(idx, key, val)}
                      onEditStart={() => setEditingRow(idx)}
                      onEditEnd={() => setEditingRow(null)}
                      style={cellStyle} />
                  ) : (
                    <td key={key} style={cellStyle}>
                      <HighlightText text={row[key]} query={search} color={row.color} />
                    </td>
                  )
                ))}
                {isData && (
                  <td style={{ padding: "4px", textAlign: "center", background: isActive ? cv.fill : cv.bg + "55", borderRadius: "0 4px 4px 0" }}>
                    {editingRow === idx ? (
                      <button onClick={(e) => { e.stopPropagation(); document.activeElement?.blur(); }}
                        style={{ ...ICON_BTN, fontSize: 16, color: NEUTRAL.success }}
                        title="Save edit">{"\u2713"}</button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); onDeleteRow(idx); }}
                        style={{ ...ICON_BTN, fontSize: 14, color: isActive ? NEUTRAL.white + "80" : NEUTRAL.disabled }}
                        title="Delete row">{"\u00d7"}</button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
