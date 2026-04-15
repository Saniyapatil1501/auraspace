import CursorGlow from "@/components/CursorGlow";
import { Twemoji } from "@/components/Twemoji";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden pt-16">

      {/* Cursor Glow */}
      <CursorGlow />

      {/* Background */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse-glow -translate-x-1/2 -translate-y-1/2" />

      {/* MAIN HERO */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl relative z-10"
      >

        {/* Emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 180 }}
          className="mb-6"
        >
          <Twemoji emoji="🌙" size={70} />
        </motion.div>

        {/* Tagline */}
        <p className="text-sm text-muted-foreground mb-6">
          Your private space for calm ✨
        </p>

        {/* KEEP SAME HEADING */}
        <h1 className="font-display text-5xl sm:text-7xl font-semibold mb-6 gradient-text">
          AuraSpace
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
          Track your mood, journal your thoughts, and feel better every day.
        </p>

        {/* Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/mood"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-semibold text-lg"
          >
            <Sparkles size={18} />
            Get Started
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
}