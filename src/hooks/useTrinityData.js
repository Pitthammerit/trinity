import { useState, useEffect, useCallback, useRef } from "react";

export function useTrinityData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    fetch("/api/data")
      .then(res => { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateCell = useCallback((idx, key, value) => {
    const row = dataRef.current[idx];
    if (!row) return;

    // Optimistic update
    setData(prev => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r));

    // Persist — rollback on failure
    fetch(`/api/data/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    }).then(res => { if (!res.ok) throw new Error(res.status); })
      .catch(() => {
        setData(prev => prev.map((r, i) => i === idx ? { ...r, [key]: row[key] } : r));
      });
  }, []);

  const deleteRow = useCallback((idx) => {
    const row = dataRef.current[idx];
    if (!row) return;

    // Optimistic update
    setData(prev => prev.filter((_, i) => i !== idx));

    // Persist — rollback on failure
    fetch(`/api/data/${row.id}`, { method: "DELETE" })
      .then(res => { if (!res.ok) throw new Error(res.status); })
      .catch(() => {
      setData(prev => {
        const next = [...prev];
        next.splice(idx, 0, row);
        return next;
      });
    });
  }, []);

  const addRow = useCallback((newRow, color) => {
    const body = { beginning: newRow.beginning.trim(), middle: newRow.middle.trim(), end: newRow.end.trim(), color };
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(res => { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(created => { setData(prev => [...prev, created]); })
      .catch(() => { /* row was never added to state, nothing to rollback */ });
  }, []);

  return { data, loading, updateCell, deleteRow, addRow };
}
