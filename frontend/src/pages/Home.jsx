import { useState } from "react";
import Navbar from "../components/Navbar";
import HeroCarousel from "../components/HeroCarousel";
import ResumeUpload from "../components/ResumeUpload";
import JobDescriptionInput from "../components/JobDescriptionInput";
import ScoreSection from "../components/ScoreSection";
import Suggestions from "../components/Suggestions";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import { analyzeResume, submitFeedback, getHistory } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const { user, loading: authLoading, resendVerification } = useAuth();

  const handleAnalyze = async () => {
    setError("");
    setResult(null);
    setFeedbackSent(false);
    setFeedbackMessage("");

    if (!resumeFile) {
      setError("Please upload a resume file.");
      return;
    }
    if (jobDescription.trim().length < 10) {
      setError("Please paste a valid job description.");
      return;
    }

    if (!authLoading && !user) {
      setShowAuth(true);
      return;
    }
    if (user && !user.emailVerified) {
      setError("Please verify your email to see results.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDescription", jobDescription);

    setLoading(true);
    try {
      const data = await analyzeResume(formData, user?.uid);
      setResult(data);
    } catch (e) {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (useful) => {
    if (!result?.analysisId) return;
    await submitFeedback({ analysisId: result.analysisId, useful }, user?.uid);
    setFeedbackSent(true);
    setFeedbackMessage(useful ? "Thanks. We will improve the next score." : "Got it. We will tune the model.");
    setTimeout(() => {
      setFeedbackMessage("");
    }, 5000);
  };

  const loadHistory = async () => {
    if (!user?.uid) return;
    setHistoryLoading(true);
    try {
      const data = await getHistory(user.uid);
      setHistory(data.items || []);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-[var(--ink)]">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} initialMode={authMode} />
      <Navbar
        onLogin={() => {
          setAuthMode("login");
          setShowAuth(true);
        }}
        onSignup={() => {
          setAuthMode("register");
          setShowAuth(true);
        }}
      />
      <HeroCarousel />

      <section id="analyze" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-24">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <ResumeUpload
            file={resumeFile}
            onFileChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          />
          <JobDescriptionInput
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-[var(--accent)] text-white px-7 py-3 rounded-full font-semibold disabled:opacity-60 shadow-sm"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
          <div className="text-sm text-[var(--muted)]">
            Average analysis time: under 10 seconds
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {user && !user.emailVerified && (
            <button
              onClick={() => resendVerification()}
              className="px-4 py-2 rounded-full border border-[var(--border)] hover:border-[var(--accent)] transition text-sm"
            >
              Resend verification
            </button>
          )}
        </div>

        {result?.red_flags?.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
            {result.red_flags.join(" ")}
          </div>
        )}

        {loading && (
          <div className="mt-10 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-[var(--shadow)]">
            <div className="text-sm uppercase tracking-widest text-[var(--muted)]">Analyzing</div>
            <div className="text-2xl font-semibold mt-2">Working on your ATS report</div>
            <div className="mt-4 h-2 bg-[var(--bg)] rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] animate-pulse" />
            </div>
            <div className="mt-4 text-sm text-[var(--muted)]">
              Parsing resume • Matching skills • Scoring impact
            </div>
          </div>
        )}

        {result && !loading && (
          <>
            <ScoreSection score={result.score} subscores={result.subscores} />
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] shadow-[var(--shadow)]">
                <h4 className="font-semibold mb-2">Matched Keywords</h4>
                <div className="text-sm text-[var(--muted)]">
                  {result.matched?.length ? result.matched.join(", ") : "None"}
                </div>
              </div>
              <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] shadow-[var(--shadow)]">
                <h4 className="font-semibold mb-2">Missing Keywords</h4>
                <div className="text-sm text-[var(--muted)]">
                  {result.missing?.length ? result.missing.join(", ") : "None"}
                </div>
              </div>
            </div>
            <Suggestions suggestions={result.suggestions || []} />
            <div className="mt-8 flex items-center gap-4">
              {!feedbackSent && (
                <>
                  <div className="text-sm text-[var(--muted)]">Was this helpful?</div>
                  <button
                    onClick={() => handleFeedback(true)}
                    className="px-4 py-2 rounded-full border border-[var(--border)] hover:border-[var(--accent)] transition text-sm"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="px-4 py-2 rounded-full border border-[var(--border)] hover:border-[var(--accent)] transition text-sm"
                  >
                    No
                  </button>
                </>
              )}
              {feedbackMessage && (
                <div className="text-sm text-[var(--muted)]">{feedbackMessage}</div>
              )}
            </div>

            {user && (
              <div className="mt-8">
                <div className="flex items-center gap-4">
                  <button
                    onClick={loadHistory}
                    className="px-4 py-2 rounded-full border border-[var(--border)] hover:border-[var(--accent)] transition text-sm"
                  >
                    {historyLoading ? "Loading history..." : "View history"}
                  </button>
                  <div className="text-sm text-[var(--muted)]">Your last 10 analyses</div>
                </div>
                {history.length > 0 && (
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    {history.map((h) => (
                      <div key={h.id} className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] shadow-[var(--shadow)]">
                        <div className="text-xs text-[var(--muted)]">{new Date(h.createdAt).toLocaleString()}</div>
                        <div className="mt-1 text-lg font-semibold">{h.score ?? "—"}%</div>
                        <div className="text-sm text-[var(--muted)]">Role: {h.role || "unknown"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <Testimonials />
      <Footer />
    </div>
  );
}
