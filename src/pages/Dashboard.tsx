import { GlassCard } from "@/components/GlassCard";
import { JournalCardExport } from "@/components/JournalCardExport";
import { MoodAuraBackground } from "@/components/MoodAuraBackground";
import { MoodStats } from "@/components/MoodStats";
import { Twemoji } from "@/components/Twemoji";
import { WeeklyMoodChart } from "@/components/WeeklyMoodChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { moods } from "@/lib/moods";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInCalendarDays, format, startOfDay, subDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, Edit3, Heart, Search, Share2, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
const greetings = [
  "Take a deep breath",
  "You're doing great",
  "Be gentle with yourself",
  "This moment matters",
];

type Entry = {
  id: string;
  mood: string;
  title: string | null;
  intensity: string | null;
  is_favorite: boolean | null;
  aura_recommendation: string;
  journal_text: string;
  created_at: string;
  user_id: string;
};

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [shareEntry, setShareEntry] = useState<Entry | null>(null);

  const greeting = useMemo(
    () => greetings[Math.floor(Math.random() * greetings.length)],
    []
  );

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ["journal-entries", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Entry[];
    },
    enabled: !!user,
  });

  const getMoodEmoji = (moodId: string) => moods.find((m) => m.id === moodId)?.emoji ?? "🫥";
  const getMoodLabel = (moodId: string) => moods.find((m) => m.id === moodId)?.label ?? moodId;

  const todayEntry = entries?.[0];
  const todayMood = todayEntry ? moods.find((m) => m.id === todayEntry.mood) : null;

  // Streak calculation
  const streak = useMemo(() => {
    if (!entries?.length) return 0;
    const uniqueDays = new Set(
      entries.map((e) => format(new Date(e.created_at), "yyyy-MM-dd"))
    );
    let count = 0;
    let day = startOfDay(new Date());
    while (uniqueDays.has(format(day, "yyyy-MM-dd"))) {
      count++;
      day = subDays(day, 1);
    }
    return count;
  }, [entries]);

  // Insights
  const insights = useMemo(() => {
    if (!entries?.length) return null;
    const thisWeek = entries.filter(
      (e) => differenceInCalendarDays(new Date(), new Date(e.created_at)) < 7
    );
    const counts: Record<string, number> = {};
    thisWeek.forEach((e) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
    if (!top) return null;
    const mood = moods.find((m) => m.id === top[0]);
    return { label: mood?.label ?? top[0], count: top[1], emoji: mood?.emoji ?? "🫥" };
  }, [entries]);

  // Filtered entries
  const filtered = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e) => {
      const matchesMood = !moodFilter || e.mood === moodFilter;
      const matchesSearch =
        !searchQuery ||
        e.journal_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesMood && matchesSearch;
    });
  }, [entries, moodFilter, searchQuery]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete entry");
    } else {
      queryClient.setQueryData(
        ["journal-entries", user?.id],
        (old: Entry[] | undefined) => old?.filter((e) => e.id !== id)
      );
      toast.success("Entry deleted");
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const toggleFavorite = async (entry: Entry) => {
    const newVal = !entry.is_favorite;
    queryClient.setQueryData(
      ["journal-entries", user?.id],
      (old: Entry[] | undefined) =>
        old?.map((e) => (e.id === entry.id ? { ...e, is_favorite: newVal } : e))
    );
    const { error } = await supabase
      .from("journal_entries")
      .update({ is_favorite: newVal })
      .eq("id", entry.id);
    if (error) {
      toast.error("Failed to update");
      queryClient.invalidateQueries({ queryKey: ["journal-entries", user?.id] });
    }
  };

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditText(entry.journal_text);
    setEditTitle(entry.title ?? "");
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from("journal_entries")
      .update({ journal_text: editText.trim(), title: editTitle.trim() || null })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update");
    } else {
      queryClient.setQueryData(
        ["journal-entries", user?.id],
        (old: Entry[] | undefined) =>
          old?.map((e) =>
            e.id === id ? { ...e, journal_text: editText.trim(), title: editTitle.trim() || null } : e
          )
      );
      toast.success("Entry updated ✨");
    }
    setEditingId(null);
  };

  const exportEntries = () => {
    if (!entries?.length) return;
    const text = entries
      .map(
        (e) =>
          `[${format(new Date(e.created_at), "MMM d, yyyy h:mm a")}] ${getMoodLabel(e.mood)}${e.title ? ` - ${e.title}` : ""}\n${e.journal_text}\n`
      )
      .join("\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auraspace-journal-${format(new Date(), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Journal exported ✨");
  };

  const displayName = profile?.display_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto relative">
      <MoodAuraBackground mood={todayEntry?.mood ?? null} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-semibold mb-1 glow-text tracking-tight">
            Hi, {displayName} <Twemoji emoji="💖" size={28} className="ml-1" />
          </h1>
          <p className="text-muted-foreground font-light">{greeting}</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 animate-pulse h-28" />
              ))}
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse h-28" />
            ))}
          </div>
        ) : entries && entries.length > 0 ? (
          <>
            {/* Top row: Today's Vibe, Streak, Insight */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {todayMood && (
                <GlassCard glow className="gradient-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Today's vibe</p>
                  <div className="flex items-center gap-3">
                    <Twemoji emoji={todayMood.emoji} size={36} />
                    <span className="font-display text-xl font-semibold text-foreground">{todayMood.label}</span>
                  </div>
                </GlassCard>
              )}

              <GlassCard className="gradient-border">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Streak</p>
                <div className="flex items-center gap-3">
                  <Twemoji emoji="🔥" size={36} />
                  <div>
                    <span className="font-display text-2xl font-semibold text-foreground">{streak}</span>
                    <span className="text-sm text-muted-foreground ml-1.5">day{streak !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </GlassCard>

              {insights && (
                <GlassCard className="gradient-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">This week</p>
                  <div className="flex items-center gap-2">
                    <Twemoji emoji={insights.emoji} size={24} />
                    <p className="text-sm text-foreground font-light">
                      You felt <span className="font-medium text-primary">{insights.label}</span> {insights.count} time{insights.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Stats & Chart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <MoodStats entries={entries} />
              <WeeklyMoodChart entries={entries} />
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entries..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/20 border border-border/20 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setMoodFilter(null)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    !moodFilter ? "bg-primary/20 text-primary" : "bg-muted/20 text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  All
                </button>
                {moods.slice(0, 5).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMoodFilter(moodFilter === m.id ? null : m.id)}
                    className={`px-2.5 py-2 rounded-lg transition-all ${
                      moodFilter === m.id ? "bg-primary/20 ring-1 ring-primary/40" : "bg-muted/20 hover:bg-muted/30"
                    }`}
                  >
                    <Twemoji emoji={m.emoji} size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
                Entries
                {filtered.length !== entries.length && (
                  <span className="text-sm text-muted-foreground font-light ml-2">
                    ({filtered.length} of {entries.length})
                  </span>
                )}
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportEntries}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground text-xs hover:bg-muted/30 transition-all"
              >
                <Download size={12} />
                Export
              </motion.button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {filtered.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                  >
                    <GlassCard className="hover:glow-border transition-all duration-300 group gradient-border">
                      <div className="flex items-start gap-4">
                        <Twemoji emoji={getMoodEmoji(entry.mood)} size={36} className="mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <h3 className="font-display text-lg font-semibold text-foreground truncate">
                                {editingId === entry.id ? (
                                  <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="bg-muted/30 border border-border/30 rounded-lg px-2 py-0.5 text-base w-full"
                                    placeholder="Title"
                                  />
                                ) : (
                                  entry.title || getMoodLabel(entry.mood)
                                )}
                              </h3>
                              {entry.intensity && entry.intensity !== "medium" && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary/70">
                                  {entry.intensity}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs text-muted-foreground/50 font-light">
                                {format(new Date(entry.created_at), "MMM d · h:mm a")}
                              </span>
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => toggleFavorite(entry)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  entry.is_favorite
                                    ? "text-secondary"
                                    : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-secondary"
                                }`}
                              >
                                <Heart size={14} fill={entry.is_favorite ? "currentColor" : "none"} />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => setShareEntry(entry)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary"
                              >
                                <Share2 size={14} />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => editingId === entry.id ? saveEdit(entry.id) : startEdit(entry)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary"
                              >
                                {editingId === entry.id ? <Check size={14} /> : <Edit3 size={14} />}
                              </motion.button>
                              {confirmDeleteId === entry.id ? (
                                <div className="flex items-center gap-1">
                                  <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => handleDelete(entry.id)}
                                    disabled={deletingId === entry.id}
                                    className="p-1.5 rounded-lg bg-destructive/20 text-destructive text-xs"
                                  >
                                    <Check size={14} />
                                  </motion.button>
                                  <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground"
                                  >
                                    <X size={14} />
                                  </motion.button>
                                </div>
                              ) : (
                                <motion.button
                                  whileTap={{ scale: 0.85 }}
                                  onClick={() => setConfirmDeleteId(entry.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 size={14} />
                                </motion.button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-primary/60 mb-2 italic">{entry.aura_recommendation}</p>
                          {editingId === entry.id ? (
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={3}
                              className="w-full bg-muted/20 border border-border/20 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground line-clamp-3 font-light leading-relaxed">
                              {entry.journal_text}
                            </p>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filtered.length === 0 && entries.length > 0 && (
                <GlassCard className="text-center py-12">
                  <Twemoji emoji="🔍" size={40} className="mx-auto mb-4" />
                  <p className="text-muted-foreground font-light">No entries match your search</p>
                </GlassCard>
              )}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard glow className="text-center py-20 gradient-border">
              <Twemoji emoji="✨" size={64} className="mx-auto mb-6" />
              <h3 className="font-display text-3xl font-semibold text-foreground mb-3">
                No entries yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-light leading-relaxed">
                Start your first reflection and discover the patterns in your inner world.
              </p>
              <Link
                to="/mood"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-lg hover:opacity-90 transition-all glow-border"
              >
                <Sparkles size={18} />
                Begin your journey
              </Link>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
      {shareEntry && (
        <JournalCardExport entry={shareEntry} onClose={() => setShareEntry(null)} />
      )}
    </div>
  );
}
