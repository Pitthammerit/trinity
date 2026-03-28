import { useState, useCallback, useRef, useEffect } from "react";
import { ANIM } from "../constants";

export function useBreathing() {
  const [active, setActive] = useState(null);
  const [displayActive, setDisplayActive] = useState(null);
  const switchTimer = useRef(null);
  const activeRef = useRef(null);

  // Keep ref in sync so handleRowClick never has a stale closure
  activeRef.current = active;

  const handleRowClick = useCallback((idx) => {
    if (switchTimer.current) clearTimeout(switchTimer.current);
    const prev = activeRef.current;
    const next = prev === idx ? null : idx;
    setActive(next);
    if (prev !== null && next !== null) {
      setDisplayActive(null);
      switchTimer.current = setTimeout(() => {
        setDisplayActive(next);
        switchTimer.current = null;
      }, ANIM.breathingDelay);
    } else {
      setDisplayActive(next);
    }
  }, []);

  const reset = useCallback(() => {
    if (switchTimer.current) clearTimeout(switchTimer.current);
    setActive(null);
    setDisplayActive(null);
  }, []);

  const shiftDown = useCallback(() => {
    setActive(prev => prev !== null ? prev - 1 : null);
    setDisplayActive(prev => prev !== null ? prev - 1 : null);
  }, []);

  useEffect(() => () => {
    if (switchTimer.current) clearTimeout(switchTimer.current);
  }, []);

  return { active, displayActive, handleRowClick, reset, shiftDown };
}
