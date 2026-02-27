import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { parseResumeBuffer } from "../services/resumeParser.js";
import { analyzeWithAI } from "../services/aiService.js";
import { firestore, storage } from "../services/firebaseAdmin.js";

const router = express.Router();

const storageEngine = multer.memoryStorage();

const allowedExt = new Set([".pdf", ".docx", ".txt"]);
const allowedMime = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const upload = multer({
  storage: storageEngine,
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

    const fileBuffer = req.file?.buffer;
    const originalName = req.file?.originalname;
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 10) {
      return res.status(400).json({ error: "Invalid job description" });
    }

    console.log("Parsing resume...");
    const resumeText = hasFile
      ? await parseResumeBuffer(fileBuffer, originalName)
      : resumeTextInput;

    console.log("Calling OpenRouter AI...");
    const aiResult = await analyzeWithAI(
      resumeText,
      jobDescription
    );

    const analysisId = crypto.randomUUID();
    const userId = req.headers["x-user-id"] || null;

    let storagePath = null;
    if (hasFile) {
      const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
      storagePath = `uploads/${analysisId}-${originalName}`;
      await bucket.file(storagePath).save(fileBuffer, {
        contentType: req.file.mimetype,
      });
    }

    const doc = {
      id: analysisId,
      userId,
      createdAt: new Date().toISOString(),
      jobDescription,
      resumeText,
      result: aiResult,
      storagePath
    };
    await firestore.collection("analyses").doc(analysisId).set(doc);

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
    const feedback = {
      analysisId,
      userId,
      useful: Boolean(useful),
      scoreAccuracy: scoreAccuracy || null,
      comment: comment || "",
      createdAt: new Date().toISOString()
    };
    await firestore.collection("feedback").add(feedback);
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
    const snap = await firestore
      .collection("analyses")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    const items = snap.docs.map((d) => {
      const obj = d.data();
      return {
        id: obj.id,
        createdAt: obj.createdAt,
        score: obj.result?.score ?? null,
        role: obj.result?.subscores?.role_detected ?? null
      };
    });
    res.json({ items });
  } catch (error) {
    console.error("History ERROR:", error);
    res.status(500).json({ error: "History failed" });
  }
});

export default router;
