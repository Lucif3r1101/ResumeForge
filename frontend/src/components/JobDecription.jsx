export default function JobDescriptionInput({ value, onChange }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md mt-8">
      <h3 className="text-xl font-semibold mb-4">Job Description</h3>

      <textarea
        rows="6"
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 p-4 rounded-lg resize-none"
        placeholder="Paste job description here..."
      />
    </div>
  );
}