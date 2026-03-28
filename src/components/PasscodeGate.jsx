import { useState, useCallback } from "react";

const PASSCODE = import.meta.env.VITE_EDIT_PASSCODE || "";

export default function PasscodeGate({ children }) {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(!PASSCODE);
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(() => {
    if (input === PASSCODE) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }, [input]);

  if (unlocked) return children;

  return (
    <div className="text-center py-12">
      <div className="text-sm text-neutral-subtle mb-3 font-display">
        Enter passcode to edit
      </div>
      <input
        type="password"
        value={input}
        onChange={(e) => { setInput(e.target.value); setError(false); }}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Passcode"
        className="text-center text-sm py-1.5 px-3 border-0 border-b border-b-neutral-border bg-transparent text-neutral-text outline-none"
      />
      {error && (
        <div className="text-xs text-neutral-danger mt-2">
          Incorrect passcode
        </div>
      )}
    </div>
  );
}
