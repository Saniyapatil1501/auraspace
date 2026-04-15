import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Props {
  entries: any[];
}

export const AIInsight = ({ entries }: Props) => {
  if (!entries || entries.length === 0) return null;

  // simple AI logic (no backend needed)
  const moods = entries.map((e) => e.mood);

  const count: Record<string, number> = {};
  moods.forEach((m) => {
    count[m] = (count[m] || 0) + 1;
  });

  const topMood = Object.entries(count).sort((a, b) => b[1] - a[1])[0];

  const insightText = topMood
    ? `You've mostly been feeling "${topMood[0]}" lately. Take time to reflect and balance your energy ✨`
    : "Start journaling to unlock insights ✨";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl glass gradient-border mb-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <Sparkles size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          AI Insight
        </h3>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {insightText}
      </p>
    </motion.div>
  );
};