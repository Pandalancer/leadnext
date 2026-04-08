"use client";

import { useState, FormEvent, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { isSafeUrl } from "@/lib/url";

function LoginForm() {
  const searchParams = useSearchParams();
  const paramUrl = searchParams.get("callbackUrl");
  const callbackUrl = isSafeUrl(paramUrl) ? paramUrl! : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting login...", email);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      console.log("Login result:", result);

      if (result?.error) {
        console.error("Login error:", result.error);
        setError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        console.log("Login successful, redirecting to:", callbackUrl);
        window.location.href = callbackUrl;
      } else {
        console.log("Unexpected result:", result);
        setError("Login failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Email */}
      <div>
        <label htmlFor="email" className="field-label">Email address</label>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)",
            color: "var(--text-muted)", pointerEvents: "none"
          }}>
            <Mail size={15} />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            style={{ paddingLeft: "2.25rem" }}
            placeholder="you@company.com"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
          <label htmlFor="password" className="field-label" style={{ margin: 0 }}>Password</label>
          <button
            type="button"
            style={{ fontSize: "0.75rem", color: "var(--emerald)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Forgot password?
          </button>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)",
            color: "var(--text-muted)", pointerEvents: "none"
          }}>
            <Lock size={15} />
          </span>
          <input
            id="password"
            name="password"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            style={{ paddingLeft: "2.25rem", paddingRight: "2.75rem" }}
            placeholder="••••••••"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{
              position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
              color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer",
              padding: 0, display: "flex", alignItems: "center"
            }}
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "0.75rem 1rem",
          borderRadius: "0.375rem",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          fontSize: "0.8125rem",
          color: "#991b1b"
        }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={isLoading} className="btn-emerald" style={{ width: "100%", padding: "0.75rem" }}>
        {isLoading ? (
          <>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

      {/* Footer note */}
      <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
        Contact your administrator to create an account
      </p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem"
    }}>
      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "var(--surface-card)",
        borderRadius: "0.75rem",
        padding: "2.5rem 2rem",
        boxShadow: "var(--shadow-float)"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <div style={{
            width: "44px", height: "44px",
            background: "linear-gradient(145deg, #10b981, #059669)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(16,185,129,0.35)"
          }}>
            {/* Diamond / Ledger icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ fontSize: "1.375rem", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            LeadCRM
          </span>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Sign in to your account
          </span>
        </div>

        <Suspense fallback={
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading…</div>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", lineHeight: "1.6" }}>
            © 2025 LeadCRM · Precise Ledger Architecture
          </p>
        </div>
      </div>
    </div>
  );
}
