import fs from "fs";
import path from "path";
import pdf from "pdf-parse-debugging-disabled";
import mammoth from "mammoth";

export const parseResume = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    return data.text;
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }

  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf8");
  }

  throw new Error(`Unsupported resume format: ${ext}`);
};
