import { motion } from "framer-motion";

interface QuickChipsProps {
  onChipClick: (topic: string) => void;
}

const topics = [
  { label: "Newton's Laws", topic: "Explain Newton's three laws of motion", emoji: "🎯" },
  { label: "Integrals", topic: "Teach me about integration in calculus", emoji: "📈" },
  { label: "Projectile Motion", topic: "How does projectile motion work?", emoji: "🚀" },
  { label: "Derivatives", topic: "Explain derivatives and their applications", emoji: "⚡" },
];

export const QuickChips = ({ onChipClick }: QuickChipsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-wrap gap-2 justify-center"
    >
      {topics.map(({ label, emoji, topic }, index) => (
        <motion.button
          key={label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChipClick(topic)}
          className="chip-button"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            <span>{label}</span>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
};
