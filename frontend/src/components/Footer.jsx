export default function Footer() {
  return (
    <footer className="mt-20 py-10 text-center text-[var(--muted)] text-sm border-t border-[var(--border)]">
      ResumeForge helps job seekers present clear, ATS‑ready resumes.
      <div className="mt-4 flex justify-center gap-6 text-xs">
        <a href="/privacy" className="hover:text-[var(--ink)]">Privacy</a>
        <a href="/terms" className="hover:text-[var(--ink)]">Terms</a>
      </div>
    </footer>
  );
}
