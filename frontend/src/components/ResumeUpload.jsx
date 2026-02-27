export default function ResumeUpload({ onFileChange, file }) {
  return (
    <div className="bg-[var(--card)] p-8 rounded-2xl shadow-[var(--shadow)] border border-[var(--border)] h-full flex flex-col">
      <h3 className="text-2xl font-semibold mb-2">Upload Resume</h3>
      <p className="text-sm text-gray-500 mb-6">
        PDF, DOCX, or TXT. We never share your data.
      </p>

      <label className="block w-full cursor-pointer border-2 border-dashed border-[var(--border)] rounded-2xl p-10 text-center hover:border-[var(--accent)] transition bg-[var(--bg)]">
        <div className="text-[var(--ink)] font-semibold">Drag & drop your resume</div>
        <div className="text-xs text-[var(--muted)] mt-2">or click to browse</div>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={onFileChange}
          className="hidden"
        />
      </label>

      {file && (
        <div className="mt-4 text-sm text-[var(--muted)]">
          Selected: <span className="text-[var(--ink)] font-medium">{file.name}</span>
        </div>
      )}
    </div>
  );
}
