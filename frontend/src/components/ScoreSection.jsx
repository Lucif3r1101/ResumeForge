import { motion } from "framer-motion";

export default function ScoreSection({ score, subscores }) {
  const safeScore = typeof score === "number" ? Math.min(100, Math.max(0, score)) : 0;
  const entries = subscores ? Object.entries(subscores) : [];
  const cards = entries.filter(([k, v]) => typeof v === "number");
  const meta = entries.filter(([k, v]) => typeof v !== "number");

  return (
    <div className="mt-12">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-[var(--shadow)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-sm uppercase tracking-widest text-[var(--muted)]">ATS Score</div>
            <div className="text-5xl font-bold text-[var(--ink)] mt-2">{safeScore}%</div>
            <div className="text-sm text-[var(--muted)] mt-2">
              Balanced for ATS matching, role relevance, and resume quality.
            </div>
          </div>

          <div className="flex-1">
            <div className="h-3 bg-[var(--bg)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${safeScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {meta.map(([k, v]) => (
                <div key={k} className="text-xs text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] px-3 py-1 rounded-full">
                  {k.replace(/_/g, " ")}: <span className="text-[var(--ink)]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {cards.map(([k, v]) => (
            <div key={k} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-[var(--shadow)]">
              <div className="flex items-center justify-between">
                <div className="text-sm uppercase tracking-wide text-[var(--muted)]">
                  {k.replace(/_/g, " ")}
                </div>
                <div className="text-lg font-semibold text-[var(--ink)]">{v}%</div>
              </div>
              <div className="mt-3 h-2 bg-[var(--bg)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${v}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-[var(--accent-3)]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
