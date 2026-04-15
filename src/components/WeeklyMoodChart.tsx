import { useMemo } from "react";
import { GlassCard } from "@/components/GlassCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { subDays, format, isAfter, startOfDay } from "date-fns";
import { BarChart3 } from "lucide-react";

interface Entry {
  mood: string;
  created_at: string;
}

const BAR_COLOR = "hsl(260, 60%, 65%)";
const BAR_COLOR_ALT = "hsl(330, 40%, 65%)";

export const WeeklyMoodChart = ({ entries }: { entries: Entry[] }) => {
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return {
        date,
        label: format(date, "EEE"),
        count: 0,
      };
    });

    entries.forEach((e) => {
      const entryDate = startOfDay(new Date(e.created_at));
      const day = days.find(
        (d) => format(d.date, "yyyy-MM-dd") === format(entryDate, "yyyy-MM-dd")
      );
      if (day) day.count++;
    });

    return days;
  }, [entries]);

  return (
    <GlassCard glow>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-secondary" />
        <h3 className="font-display font-semibold text-foreground text-sm">This Week</h3>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={chartData} barCategoryGap="20%">
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(260, 10%, 55%)", fontSize: 11 }}
          />
          <YAxis hide allowDecimals={false} />
          <Tooltip
            cursor={false}
            contentStyle={{
              background: "hsl(260, 20%, 12%)",
              border: "1px solid hsl(260, 15%, 20%)",
              borderRadius: "12px",
              fontSize: 12,
              color: "hsl(260, 10%, 92%)",
            }}
            formatter={(value: number) => [`${value} entries`, "Entries"]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? BAR_COLOR : BAR_COLOR_ALT} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
};
