import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const features = [
  "ATS-optimized scoring with evidence",
  "Role-aware keyword coverage",
  "Actionable rewrites and impact tips",
  "Recruiter-friendly formatting checks"
];

const carouselImages = [
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1484981138541-3d074aa97716?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80"
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="features" className="pt-28 pb-20 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <div className="text-sm uppercase tracking-widest text-[var(--muted)] mb-4">
            Trusted by ambitious job seekers
          </div>
          <div className="w-full h-[260px] md:h-[360px] overflow-hidden rounded-none md:rounded-3xl border-y md:border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]">
            <div className="relative w-full h-full">
              {carouselImages.map((src, i) => (
                <motion.img
                  key={src}
                  src={src}
                  alt="Career inspiration"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: i === index ? 1 : 0 }}
                  transition={{ duration: 0.8 }}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
              <div className="absolute bottom-6 left-6 text-white">
                <div className="text-sm uppercase tracking-widest">Career Ready</div>
                <div className="text-2xl font-semibold">Polished resumes get interviews</div>
              </div>
              <div className="absolute bottom-6 right-6 flex gap-2">
                {carouselImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-2 w-8 rounded-full transition ${
                      i === index ? "bg-white" : "bg-white/40"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold leading-tight"
            >
              Build a resume that
              <span className="block bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-transparent bg-clip-text">
                survives ATS and wins interviews
              </span>
            </motion.h2>
            <p className="mt-5 text-lg text-[var(--muted)]">
              Production‑grade scoring built for job seekers. We check content quality,
              role relevance, and formatting clarity to deliver a truthful ATS score.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href="#analyze"
                className="bg-[var(--accent)] text-white px-6 py-3 rounded-full shadow-sm hover:brightness-110 transition inline-flex items-center"
              >
                Analyze My Resume
              </a>
              <a
                href="#features"
                className="px-6 py-3 rounded-full border border-[var(--border)] text-[var(--ink)] hover:border-[var(--accent)] transition inline-flex items-center"
              >
                See How It Works
              </a>
            </div>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-[var(--shadow)]">
            <div className="text-sm uppercase tracking-widest text-[var(--muted)]">
              Example Score
            </div>
            <div className="mt-4 flex items-center gap-6">
              <div className="w-24 h-24 rounded-full border-8 border-[var(--accent)] flex items-center justify-center text-3xl font-bold text-[var(--accent)]">
                86
              </div>
              <div>
                <div className="text-xl font-semibold text-[var(--ink)]">Great fit</div>
                <div className="text-sm text-[var(--muted)]">Strong skills match, clear impact</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm text-[var(--ink)] bg-[var(--bg)] rounded-xl p-3 border border-[var(--border)]"
                >
                  {feature}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
