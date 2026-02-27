import { useMemo, useState } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../services/firebase";

const PASSWORD_RULES = {
  min: 12,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

export default function ResetPassword({ oobCode }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    const list = [];
    if (password.length < PASSWORD_RULES.min) list.push("Min 12 characters");
    if (!PASSWORD_RULES.upper.test(password)) list.push("1 uppercase letter");
    if (!PASSWORD_RULES.lower.test(password)) list.push("1 lowercase letter");
    if (!PASSWORD_RULES.number.test(password)) list.push("1 number");
    if (!PASSWORD_RULES.special.test(password)) list.push("1 special character");
    if (confirm && password !== confirm) list.push("Passwords must match");
    return list;
  }, [password, confirm]);

  const handleReset = async () => {
    setError("");
    setMessage("");
    if (errors.length > 0) {
      setError("Password does not meet requirements.");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage("Password reset successful. You can close this tab.");
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-[var(--shadow)]">
        <div className="text-2xl font-semibold">Reset your password</div>
        <p className="text-sm text-[var(--muted)] mt-2">
          Use a strong password to protect your account.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            className="w-full border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            className="w-full border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>
          {errors.length > 0 && (
            <div className="text-xs text-[var(--muted)]">
              Required: {errors.join(", ")}
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-700 text-sm">{message}</div>}
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white py-3 rounded-full font-semibold disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
