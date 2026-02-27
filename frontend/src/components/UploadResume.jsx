import { useState, useRef } from "react";
import { motion } from "framer-motion";
import GradientButton from "./GradientButton";

export default function UploadResume({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    if (onFileSelect) onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
    >
      <h2 className="text-2xl font-semibold mb-8">
        Upload Resume
      </h2>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center transition
          ${isDragging ? "border-indigo-400 bg-indigo-500/10" : "border-white/20"}
        `}
      >
        <motion.div
          animate={{ scale: isDragging ? 1.1 : 1 }}
          className="text-5xl mb-4"
        >
          📄
        </motion.div>

        {fileName ? (
          <p className="text-green-400 mb-6">{fileName}</p>
        ) : (
          <p className="text-slate-400 mb-6">
            Drag & drop your resume here
          </p>
        )}

        <GradientButton onClick={handleBrowseClick}>
          Browse File
        </GradientButton>

        {/* Hidden file input */}
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      <p className="text-xs text-slate-500 mt-6">
        Supported: PDF, DOCX
      </p>
    </motion.div>
  );
}
