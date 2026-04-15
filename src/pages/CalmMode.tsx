import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Twemoji } from "@/components/Twemoji";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const phases = ["Breathe in", "Hold", "Breathe out", "Hold"];
const durations = [4, 7, 8, 4]; // 4-7-8 technique

const affirmations = [
  "You are enough",
  "This moment is yours",
  "Let go of what you can't control",
  "Peace begins within",
  "You are safe right now",
  "Breathe. Release. Be.",
];

export default function CalmMode() {
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(durations[0]);
  const [active, setActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  const affirmation = affirmations[cycles % affirmations.length];

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setPhase((p) => {
            const next = (p + 1) % 4;
            if (next === 0) setCycles((cy) => cy + 1);
            setCount(durations[next]);
            return next;
          });
          return 1;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [active]);

  const circleScale = phase === 0 ? 1.4 : phase === 2 ? 0.8 : phase === 1 ? 1.4 : 0.8;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center z-10"
      >
        <Twemoji emoji="🧘" size={48} className="mx-auto mb-6" />
        <h1 className="font-display text-4xl font-semibold glow-text tracking-tight mb-2">
          Calm Mode
        </h1>
        <p className="text-muted-foreground font-light mb-12">4-7-8 breathing technique</p>

        {/* Breathing circle */}
        <div className="relative w-56 h-56 mx-auto mb-10 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            animate={{
              scale: active ? circleScale : 1,
              borderColor: active
                ? `hsl(var(--primary) / 0.4)`
                : `hsl(var(--primary) / 0.2)`,
            }}
            transition={{ duration: durations[phase], ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-4 rounded-full bg-primary/5"
            animate={{
              scale: active ? circleScale : 1,
              opacity: active ? 0.3 : 0.1,
            }}
            transition={{ duration: durations[phase], ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-8 rounded-full bg-primary/8 glow-border"
            animate={{
              scale: active ? circleScale : 1,
            }}
            transition={{ duration: durations[phase], ease: "easeInOut" }}
          />
          <div className="relative z-10 text-center">
            {active ? (
              <>
                <p className="font-display text-xl font-semibold text-foreground mb-1">
                  {phases[phase]}
                </p>
                <p className="text-3xl font-display font-bold text-primary">{count}</p>
              </>
            ) : (
              <p className="text-muted-foreground font-light text-sm">Tap to begin</p>
            )}
          </div>
        </div>

        {/* Affirmation */}
        <AnimatePresence mode="wait">
          {active && (
            <motion.p
              key={affirmation}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-muted-foreground/60 font-display text-lg italic mb-8"
            >
              "{affirmation}"
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setActive(!active);
            if (!active) {
              setPhase(0);
              setCount(durations[0]);
            }
          }}
          className={`px-10 py-3.5 rounded-2xl font-display font-semibold text-lg transition-all glow-border ${
            active
              ? "bg-muted/20 text-foreground border border-border/20"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {active ? "Stop" : "Begin Breathing"}
        </motion.button>

        {cycles > 0 && (
          <p className="text-xs text-muted-foreground/40 mt-6">
            {cycles} cycle{cycles !== 1 ? "s" : ""} completed
          </p>
        )}
      </motion.div>
    </div>
  );
}
