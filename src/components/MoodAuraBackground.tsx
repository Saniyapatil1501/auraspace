import { motion, AnimatePresence } from "framer-motion";

const moodColors: Record<string, { primary: string; secondary: string }> = {
  happy: { primary: "rgba(250, 204, 21, 0.08)", secondary: "rgba(251, 146, 60, 0.06)" },
  calm: { primary: "rgba(52, 211, 153, 0.08)", secondary: "rgba(45, 212, 191, 0.06)" },
  sad: { primary: "rgba(96, 165, 250, 0.08)", secondary: "rgba(129, 140, 248, 0.06)" },
  anxious: { primary: "rgba(251, 191, 36, 0.08)", secondary: "rgba(248, 113, 113, 0.06)" },
  excited: { primary: "rgba(244, 114, 182, 0.08)", secondary: "rgba(251, 113, 133, 0.06)" },
  tired: { primary: "rgba(148, 163, 184, 0.06)", secondary: "rgba(107, 114, 128, 0.05)" },
  grateful: { primary: "rgba(192, 132, 252, 0.08)", secondary: "rgba(244, 114, 182, 0.06)" },
  angry: { primary: "rgba(248, 113, 113, 0.08)", secondary: "rgba(251, 146, 60, 0.06)" },
};

interface MoodAuraBackgroundProps {
  mood: string | null;
}

export const MoodAuraBackground = ({ mood }: MoodAuraBackgroundProps) => {
  const colors = mood ? moodColors[mood] : null;

  return (
    <AnimatePresence>
      {colors && (
        <motion.div
          key={mood}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 pointer-events-none z-0"
        >
          <div
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] animate-float"
            style={{ background: colors.primary }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[130px] animate-float"
            style={{ background: colors.secondary, animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px] animate-pulse-glow"
            style={{ background: colors.primary }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
