export default function Suggestions({ suggestions }) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 max-w-5xl mx-auto">
      <h3 className="text-2xl font-semibold mb-6 text-center">
        Improvement Suggestions
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-[var(--shadow)]"
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
