import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parseResume } from "../services/resumeParser.js";
import { analyzeWithAI } from "../services/aiService.js";

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const allowedExt = new Set([".pdf", ".docx", ".txt"]);
const allowedMime = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExt.has(ext) && allowedMime.has(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Unsupported file type"));
  },
});

// POST /api/analyze
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    console.log("Request received");

    const resumeTextInput = req.body?.resumeText;
    const hasFile = Boolean(req.file);

    if (!hasFile && (!resumeTextInput || resumeTextInput.trim().length < 50)) {
      return res.status(400).json({ error: "No resume provided" });
    }

    const filePath = req.file?.path;
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 10) {
      if (filePath) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ error: "Invalid job description" });
    }

    console.log("Parsing resume...");
    const resumeText = hasFile ? await parseResume(filePath) : resumeTextInput;

    console.log("Calling OpenRouter AI...");
    const aiResult = await analyzeWithAI(
      resumeText,
      jobDescription
    );

    const analysisId = crypto.randomUUID();
    const userId = req.headers["x-user-id"] || null;
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const logEntry = {
      id: analysisId,
      userId,
      createdAt: new Date().toISOString(),
      jobDescription,
      resumeText,
      result: aiResult
    };
    fs.appendFileSync(
      path.join(dataDir, "analyses.jsonl"),
      JSON.stringify(logEntry) + "\n"
    );

    // Delete uploaded file after processing
    if (filePath) {
      fs.unlinkSync(filePath);
    }

    console.log("Response sent");

    res.json({ ...aiResult, analysisId });

  } catch (error) {
    console.error("Route ERROR:", error);

    return res.status(500).json({
      score: 0,
      matched: [],
      missing: [],
      suggestions: [
        "Server error occurred.",
        "Please try again later."
      ]
    });
  }
});

// POST /api/feedback
router.post("/feedback", async (req, res) => {
  try {
    const { analysisId, useful, scoreAccuracy, comment } = req.body || {};
    if (!analysisId) {
      return res.status(400).json({ error: "Missing analysisId" });
    }
    const userId = req.headers["x-user-id"] || null;
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const feedback = {
      analysisId,
      userId,
      useful: Boolean(useful),
      scoreAccuracy: scoreAccuracy || null,
      comment: comment || "",
      createdAt: new Date().toISOString()
    };
    fs.appendFileSync(
      path.join(dataDir, "feedback.jsonl"),
      JSON.stringify(feedback) + "\n"
    );
    res.json({ ok: true });
  } catch (error) {
    console.error("Feedback ERROR:", error);
    res.status(500).json({ error: "Feedback failed" });
  }
});

// GET /api/history
router.get("/history", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(400).json({ error: "Missing user id" });
    }
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "analyses.jsonl");
    if (!fs.existsSync(filePath)) {
      return res.json({ items: [] });
    }
    const lines = fs.readFileSync(filePath, "utf8").trim().split("\n");
    const items = [];
    for (let i = lines.length - 1; i >= 0 && items.length < 10; i--) {
      const line = lines[i].trim();
      if (!line) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.userId === userId) {
          items.push({
            id: obj.id,
            createdAt: obj.createdAt,
            score: obj.result?.score ?? null,
            role: obj.result?.subscores?.role_detected ?? null
          });
        }
      } catch {
        // ignore malformed lines
      }
    }
    res.json({ items });
  } catch (error) {
    console.error("History ERROR:", error);
    res.status(500).json({ error: "History failed" });
  }
});

export default router;
