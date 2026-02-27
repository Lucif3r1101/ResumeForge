import { useState } from "react";
import GradientButton from "./GradientButton";

export default function JobInput({ onAnalyze }) {
  const [jobDescription, setJobDescription] = useState("");

  const handleClick = () => {
    if (!jobDescription.trim()) {
      alert("Please paste job description.");
      return;
    }
    onAnalyze(jobDescription);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

      <h2 className="text-2xl font-semibold mb-8">
        Job Description
      </h2>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description here..."
        className="w-full h-56 bg-black/40 border border-white/10 rounded-2xl p-5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />

      <div className="mt-8">
        <GradientButton full onClick={handleClick}>
          Analyze Resume
        </GradientButton>
      </div>

    </div>
  );
}
