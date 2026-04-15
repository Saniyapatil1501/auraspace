import { DailyPrompt } from "@/components/DailyPrompt";
import { GlassCard } from "@/components/GlassCard";
import { MoodAuraBackground } from "@/components/MoodAuraBackground";
import { Twemoji } from "@/components/Twemoji";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { MoodOption, moods } from "@/lib/moods";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const intensities = [
  { id: "low", label: "Low", emoji: "🌱" },
  { id: "medium", label: "Medium", emoji: "🌿" },
  { id: "high", label: "High", emoji: "🔥" },
];

const MAX_CHARS = 1000;

export default function MoodPage() {
  const [selected, setSelected] = useState<MoodOption | null>(null);
  const [intensity, setIntensity] = useState("medium");
  const [title, setTitle] = useState("");
  const [journal, setJournal] = useState("");
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSave = async () => {
    console.log("USER:", user);

    if (!selected || !journal.trim()) {
      toast.error("Please select mood and write something");
      return;
    }

    if (!user) {
      toast.error("User not logged in");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("journal_entries").insert([
      {
        user_id: user.id,
        mood: selected.id,
        intensity,
        title: title.trim() || null,
        aura_recommendation: selected.aura,
        journal_text: journal.trim(),
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("Failed to save entry");
    } else {
      toast.success("Entry saved ✨");
      navigate("/dashboard");
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto relative">
      <MoodAuraBackground mood={selected?.id ?? null} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-semibold mb-2">How are you feeling?</h1>
        <p className="text-muted-foreground mb-6">Select your mood</p>

        <DailyPrompt />

        {/* Mood Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelected(mood)}
              className={`p-4 rounded-xl border transition ${
                selected?.id === mood.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted/20"
              }`}
            >
              <Twemoji emoji={mood.emoji} size={32} />
              <p className="text-foreground mt-1">{mood.label}</p>
            </button>
          ))}
        </div>

        {/* Journal Section */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="mb-4">
                <p className="text-muted-foreground">{selected.aura}</p>
              </GlassCard>

              {/* FIXED INPUT */}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full mb-3 px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />

              {/* FIXED TEXTAREA */}
              <textarea
                value={journal}
                onChange={(e) =>
                  setJournal(e.target.value.slice(0, MAX_CHARS))
                }
                rows={4}
                placeholder="Write your thoughts..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-all mb-2"
              />

              <div className="text-right text-xs text-muted-foreground mb-4">
                {journal.length}/{MAX_CHARS}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Entry"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}