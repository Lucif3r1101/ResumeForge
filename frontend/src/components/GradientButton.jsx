import { motion } from "framer-motion";

export default function GradientButton({ children, onClick, full }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        relative overflow-hidden
        px-8 py-3
        ${full ? "w-full" : ""}
        rounded-xl
        font-semibold
        bg-gradient-to-r from-indigo-500 to-purple-600
        shadow-lg
        transition-all duration-300
      `}
    >
      {/* Glow layer */}
      <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>

      {/* Shine animation */}
      <span className="absolute -left-20 top-0 h-full w-20 bg-white/20 skew-x-12 transform translate-x-0 hover:translate-x-[400%] transition-transform duration-700"></span>

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
