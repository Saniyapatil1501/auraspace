import { useMemo } from "react";
import { Twemoji } from "@/components/Twemoji";
import { motion } from "framer-motion";

const prompts = [
  "What made you smile today?",
  "What's something you're grateful for right now?",
  "Describe your current mood in 3 words.",
  "What's one thing you'd like to let go of?",
  "What brought you peace today?",
  "If your feelings were weather, what would today be?",
  "Write a letter to your future self.",
  "What's a small win you had recently?",
  "What does self-care look like for you today?",
  "Describe a moment of calm you experienced.",
  "What's weighing on your mind?",
  "What are you looking forward to?",
  "How did you show kindness today?",
  "What's something you need to hear right now?",
  "Describe your ideal peaceful moment.",
];

export const DailyPrompt = () => {
  const prompt = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return prompts[dayOfYear % prompts.length];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-xl px-5 py-4 gradient-border flex items-start gap-3"
    >
      <Twemoji emoji="💭" size={20} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground/50 uppercase tracking-widest mb-1">
          Today's prompt
        </p>
        <p className="text-sm text-foreground font-light italic leading-relaxed">
          {prompt}
        </p>
      </div>
    </motion.div>
  );
};
