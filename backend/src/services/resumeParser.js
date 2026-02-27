import path from "path";
import pdf from "pdf-parse-debugging-disabled";
import mammoth from "mammoth";

export const parseResumeBuffer = async (buffer, originalName) => {
  const ext = path.extname(originalName || "").toLowerCase();

  if (ext === ".pdf") {
    const data = await pdf(buffer);
    return data.text || "";
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  if (ext === ".txt") {
    return buffer.toString("utf8");
  }

  throw new Error(`Unsupported resume format: ${ext}`);
};
