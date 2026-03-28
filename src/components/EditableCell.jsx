import { useState, useRef, useEffect } from "react";

export default function EditableCell({ value, onSave, onEditStart, onEditEnd, style: cellStyle }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => {
    const t = draft.trim();
    if (t && t !== value) onSave(t);
    setEditing(false);
    onEditEnd?.();
  };
  const startEdit = () => { setEditing(true); onEditStart?.(); };

  if (editing) {
    return (
      <td style={{ ...cellStyle, padding: "2px 4px" }}>
        <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") { setDraft(value); setEditing(false); onEditEnd?.(); }
          }}
          className="w-full text-[13px] py-[3px] px-1 border-[1.5px] border-neutral-focus rounded-[3px] bg-white text-neutral-text box-border outline-none"
        />
      </td>
    );
  }
  return <td style={{ ...cellStyle, cursor: "text" }} onDoubleClick={startEdit} title="Double-click to edit">{value}</td>;
}
