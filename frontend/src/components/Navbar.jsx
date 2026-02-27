import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onLogin, onSignup }) {
  const { user, logout } = useAuth();
  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)] z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Resume<span className="text-[var(--accent)]">Forge</span>
        </h1>

        <div className="space-x-8 hidden md:flex text-[var(--muted)]">
          <a href="#features" className="hover:text-[var(--accent)] transition">
            Features
          </a>
          <a href="#analyze" className="hover:text-[var(--accent)] transition">
            Analyze
          </a>
          <a href="#testimonials" className="hover:text-[var(--accent)] transition">
            Testimonials
          </a>
        </div>

        {user ? (
          <button
            onClick={logout}
            className="bg-[var(--accent)] text-white px-5 py-2 rounded-full hover:brightness-110 transition shadow-sm"
          >
            Sign out {user.displayName ? `(${user.displayName})` : ""}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onLogin}
              className="px-5 py-2 rounded-full border border-[var(--border)] hover:border-[var(--accent)] transition"
            >
              Login
            </button>
            <button
              onClick={onSignup}
              className="bg-[var(--accent)] text-white px-5 py-2 rounded-full hover:brightness-110 transition shadow-sm"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
