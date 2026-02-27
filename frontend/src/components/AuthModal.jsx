import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const PASSWORD_RULES = {
  min: 12,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};
const FORCE_UPGRADE_ON_SIGNIN = true;

export default function AuthModal({ open, onClose, initialMode = "login" }) {
  const { login, register, loginWithGoogle, setRememberMe, resetPassword } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const strength = (() => {
    const p = password || "";
    let score = 0;
    if (p.length >= 12) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[a-z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return score;
  })();

  const strengthLabel = ["Weak", "Fair", "Good", "Strong", "Very strong", "Excellent"][strength] || "Weak";

  if (!open) return null;

  const passwordErrors = [];
  if (mode === "register" || FORCE_UPGRADE_ON_SIGNIN) {
    if (password.length < PASSWORD_RULES.min) passwordErrors.push("Min 12 characters");
    if (!PASSWORD_RULES.upper.test(password)) passwordErrors.push("1 uppercase letter");
    if (!PASSWORD_RULES.lower.test(password)) passwordErrors.push("1 lowercase letter");
    if (!PASSWORD_RULES.number.test(password)) passwordErrors.push("1 number");
    if (!PASSWORD_RULES.special.test(password)) passwordErrors.push("1 special character");
  }

  const mapAuthError = (msg) => {
    if (!msg) return "Authentication failed.";
    if (msg.includes("auth/user-not-found")) return "User does not exist. Please register.";
    if (msg.includes("auth/wrong-password")) return "Incorrect password. Try again.";
    if (msg.includes("auth/invalid-credential")) return "Invalid credentials. Check email/password.";
    if (msg.includes("auth/email-already-in-use")) return "Email already in use. Please sign in.";
    if (msg.includes("auth/invalid-email")) return "Invalid email format.";
    if (msg.includes("auth/too-many-requests")) return "Too many attempts. Try later.";
    if (msg.includes("auth/operation-not-allowed")) return "Email/password auth is disabled in Firebase.";
    return msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await setRememberMe(remember);
      if (mode === "login") {
        if (FORCE_UPGRADE_ON_SIGNIN && passwordErrors.length > 0) {
          setError("Your password does not meet new security rules. Please reset it.");
          setLoading(false);
          return;
        }
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        if (passwordErrors.length > 0) {
          setError("Password does not meet requirements.");
          setLoading(false);
          return;
        }
        await register(email, password, name);
      }
      if (mode === "register") {
        setError("Verification email sent. Please verify to access results.");
        return;
      }
      onClose();
    } catch (err) {
      setError(mapAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message || "Google auth failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError("Enter your email to reset password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setError("Password reset email sent.");
    } catch (err) {
      setError(mapAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-[var(--shadow)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
          aria-label="Close"
        >
          Close
        </button>
        <div className="text-2xl font-semibold">
          {mode === "login" ? "Sign in to continue" : "Create your account"}
        </div>
        <p className="text-sm text-[var(--muted)] mt-2">
          You can browse freely, but you must sign in to see analysis results.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full name"
              className="w-full border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>
          {mode === "register" && (
            <div className="text-xs text-[var(--muted)]">
              Password strength: <span className="text-[var(--ink)]">{strengthLabel}</span>
            </div>
          )}
          {passwordErrors.length > 0 && (
            <div className="text-xs text-[var(--muted)]">
              Required: {passwordErrors.join(", ")}
            </div>
          )}
          {mode === "register" && (
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white py-3 rounded-full font-semibold disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {mode === "login" && (
          <button
            onClick={handleReset}
            disabled={loading}
            className="mt-3 text-sm text-[var(--accent)]"
          >
            Forgot password?
          </button>
        )}

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="mt-4 w-full border border-[var(--border)] py-3 rounded-full hover:border-[var(--accent)] transition text-sm"
        >
          Continue with Google
        </button>

        <div className="mt-4 text-xs text-[var(--muted)]">
          Caution: "Sign in with Google" is recommended to reduce password‑related vulnerabilities.
        </div>

        <div className="mt-4 text-sm text-[var(--muted)]">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            className="text-[var(--accent)] font-semibold"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </div>

        <div className="mt-4 text-xs text-[var(--muted)]">
          You can skip sign‑in for now, but analysis results will remain hidden.
        </div>
      </div>
    </div>
  );
}
