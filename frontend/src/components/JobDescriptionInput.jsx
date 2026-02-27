export default function JobDescriptionInput({ value, onChange }) {
  return (
    <div className="bg-[var(--card)] p-8 rounded-2xl shadow-[var(--shadow)] border border-[var(--border)] mt-8 h-full flex flex-col">
      <h3 className="text-2xl font-semibold mb-2">Job Description</h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        Paste the exact job post for the most accurate score.
      </p>

      <textarea
        rows="6"
        value={value}
        onChange={onChange}
        className="w-full border border-[var(--border)] p-4 rounded-xl resize-none bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        placeholder="Paste job description here..."
      />
    </div>
  );
}
