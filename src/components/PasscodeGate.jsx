import { useState, useCallback, useEffect, useRef } from "react";

const PASSCODE = import.meta.env.VITE_EDIT_PASSCODE || "";
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

export default function PasscodeGate({ children }) {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(!PASSCODE);
  const [error, setError] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Load Turnstile script and render widget
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || unlocked) return;

    const renderWidget = () => {
      if (turnstileRef.current && window.turnstile && widgetIdRef.current === null) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(""),
          theme: "light",
          size: "normal",
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = renderWidget;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [unlocked]);

  const handleSubmit = useCallback(() => {
    if (TURNSTILE_SITE_KEY && !turnstileToken) return;
    if (input === PASSCODE) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }, [input, turnstileToken]);

  if (unlocked) return children;

  const canSubmit = input.length > 0 && (!TURNSTILE_SITE_KEY || turnstileToken);

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <input
        type="password"
        value={input}
        onChange={(e) => { setInput(e.target.value); setError(false); }}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Enter Passcode"
        className="text-center text-sm py-1.5 px-3 border-0 border-b border-b-neutral-border bg-transparent text-neutral-text outline-none"
      />
      {error && (
        <div className="text-xs text-neutral-danger">
          Incorrect passcode
        </div>
      )}
      {TURNSTILE_SITE_KEY && <div ref={turnstileRef} />}
    </div>
  );
}
