import { useMemo } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Twemoji } from "@/components/Twemoji";
import { moods } from "@/lib/moods";
import { TrendingUp } from "lucide-react";

interface Entry {
  mood: string;
  created_at: string;
}

export const MoodStats = ({ entries }: { entries: Entry[] }) => {
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return sorted.map(([moodId, count]) => {
      const mood = moods.find((m) => m.id === moodId);
      return {
        emoji: mood?.emoji ?? "🫥",
        label: mood?.label ?? moodId,
        count,
        pct: Math.round((count / entries.length) * 100),
      };
    });
  }, [entries]);

  return (
    <GlassCard glow className="gradient-border">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={16} className="text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">Top Moods</h3>
      </div>
      <div className="space-y-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <Twemoji emoji={s.emoji} size={24} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-foreground font-medium">{s.label}</span>
                <span className="text-muted-foreground/60 font-light">{s.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/50 mt-4 font-light">{entries.length} total entries</p>
    </GlassCard>
  );
};
