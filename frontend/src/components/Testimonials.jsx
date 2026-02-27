import { motion } from "framer-motion";

export default function Testimonials() {
  const reviews = [
    {
      name: "Ava Martinez",
      role: "Product Manager",
      quote: "Got my interview rate from 2% to 12% in 3 weeks.",
      img: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Rohan Patel",
      role: "Data Analyst",
      quote: "The role‑match breakdown was the missing piece.",
      img: "https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Lena Brooks",
      role: "Software Engineer",
      quote: "Clear, actionable edits that recruiters notice.",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <section id="testimonials" className="mt-24 py-20 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-3xl font-bold">What Users Say</h2>
          <div className="text-sm text-[var(--muted)]">Trusted by early job seekers</div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-[var(--shadow)]"
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={r.img}
                  alt={r.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-[var(--ink)]">{r.name}</div>
                  <div className="text-xs text-[var(--muted)]">{r.role}</div>
                </div>
              </div>
              <div className="mt-4 text-[var(--ink)]">{r.quote}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
