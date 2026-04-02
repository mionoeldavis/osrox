"use client";

import { useState, useRef, useEffect } from "react";

interface PasswordScreenProps {
  onSuccess: () => void;
}

const PROMPT_LINES = [
  { text: "OSROX SECURITY LAYER v4.2.0", delay: 150 },
  { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", delay: 100 },
  { text: "WARNING: Unauthorized access is prohibited.", delay: 200 },
  { text: "All sessions are monitored and logged.", delay: 150 },
  { text: "", delay: 100 },
];

export default function PasswordScreen({ onSuccess }: PasswordScreenProps) {
  const [introLines, setIntroLines] = useState<string[]>([]);
  const [introComplete, setIntroComplete] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 0; i < PROMPT_LINES.length; i++) {
        await new Promise((r) => setTimeout(r, PROMPT_LINES[i].delay));
        if (cancelled) return;
        setIntroLines((prev) => [...prev, PROMPT_LINES[i].text]);
      }
      if (!cancelled) setIntroComplete(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (introComplete && inputRef.current) {
      inputRef.current.focus();
    }
  }, [introComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || checking) return;

    setChecking(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.ok) {
        sessionStorage.setItem("osrox_auth", "1");
        onSuccess();
      } else {
        setAttempts((a) => a + 1);
        setError("ACCESS DENIED — invalid credentials");
        setPassword("");
        setChecking(false);
      }
    } catch {
      setError("CONNECTION FAILED — retry");
      setChecking(false);
    }
  };

  const handleContainerClick = () => {
    if (introComplete && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-start justify-start p-8 overflow-hidden cursor-text"
      onClick={handleContainerClick}
    >
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-neon-green text-glow-green text-lg font-bold tracking-widest">
          ╔══════════════════════════════════════════╗
          <br />
          ║&nbsp;&nbsp;&nbsp;&nbsp;O S R O X&nbsp;&nbsp;—&nbsp;&nbsp;S E C U R E&nbsp;&nbsp;L O G I N&nbsp;&nbsp;║
          <br />
          ╚══════════════════════════════════════════╝
        </div>

        <div className="space-y-1 mb-4">
          {introLines.map((line, i) => (
            <div
              key={i}
              className={`font-mono text-sm ${
                line.includes("WARNING")
                  ? "text-neon-red text-glow-red"
                  : line.includes("━")
                  ? "text-neon-green/40"
                  : "text-green-400/80"
              }`}
            >
              {line || "\u00A0"}
            </div>
          ))}
        </div>

        {introComplete && (
          <>
            {error && (
              <div className="font-mono text-sm text-neon-red text-glow-red mb-2">
                [!] {error}
                {attempts > 1 && (
                  <span className="text-neon-yellow ml-2">
                    ({attempts} failed attempts)
                  </span>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center font-mono text-sm">
              <span className="text-neon-green text-glow-green mr-1">
                operator@osrox:~$
              </span>
              <span className="text-green-400/80 mr-2">password:</span>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={checking}
                  autoComplete="off"
                  spellCheck={false}
                  className="bg-transparent border-none outline-none text-neon-green text-sm font-mono w-full caret-transparent"
                  style={{ color: "transparent" }}
                />
                <div
                  className="absolute inset-0 pointer-events-none flex items-center text-neon-green text-sm"
                  aria-hidden
                >
                  {"*".repeat(password.length)}
                  {!checking && (
                    <span className="cursor-blink" />
                  )}
                </div>
              </div>
            </form>

            {checking && (
              <div className="font-mono text-sm text-neon-cyan text-glow-cyan mt-2 animate-pulse">
                Verifying credentials...
              </div>
            )}
          </>
        )}
      </div>

      <div className="absolute bottom-4 right-6 text-text-dim text-xs">
        OSROX SECURITY // ENCRYPTED CHANNEL
      </div>
    </div>
  );
}
