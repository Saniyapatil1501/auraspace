import { useRef } from "react";
import { motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";
import { Twemoji } from "@/components/Twemoji";
import { format } from "date-fns";
import { moods } from "@/lib/moods";
import { toast } from "sonner";

interface JournalCardExportProps {
  entry: {
    mood: string;
    title: string | null;
    journal_text: string;
    created_at: string;
    aura_recommendation: string;
  };
  onClose: () => void;
}

export const JournalCardExport = ({ entry, onClose }: JournalCardExportProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mood = moods.find((m) => m.id === entry.mood);

  const handleCopy = async () => {
    const text = `${mood?.emoji} ${entry.title || mood?.label}\n\n"${entry.journal_text}"\n\n— ${format(new Date(entry.created_at), "MMMM d, yyyy")}\n\n✨ AuraSpace`;
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard ✨");
  };

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, "#1a1025");
    grad.addColorStop(0.5, "#1e1230");
    grad.addColorStop(1, "#0f0a18");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // Decorative circle
    ctx.beginPath();
    ctx.arc(650, 100, 200, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(168, 85, 247, 0.05)";
    ctx.fill();

    // Title
    ctx.font = "bold 28px 'Cormorant Garamond', Georgia, serif";
    ctx.fillStyle = "#e8ddd5";
    const title = entry.title || mood?.label || "My Reflection";
    ctx.fillText(title, 60, 80);

    // Date
    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = "rgba(232, 221, 213, 0.4)";
    ctx.fillText(format(new Date(entry.created_at), "MMMM d, yyyy · h:mm a"), 60, 110);

    // Journal text (word wrap)
    ctx.font = "16px Inter, sans-serif";
    ctx.fillStyle = "rgba(232, 221, 213, 0.7)";
    const words = entry.journal_text.split(" ");
    let line = "";
    let y = 170;
    const maxWidth = 680;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line.trim(), 60, y);
        line = word + " ";
        y += 26;
        if (y > 480) {
          ctx.fillText("...", 60, y);
          break;
        }
      } else {
        line = test;
      }
    }
    if (y <= 480) ctx.fillText(line.trim(), 60, y);

    // Brand
    ctx.font = "italic 14px 'Cormorant Garamond', Georgia, serif";
    ctx.fillStyle = "rgba(168, 85, 247, 0.5)";
    ctx.fillText("✨ AuraSpace", 60, 560);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auraspace-${format(new Date(entry.created_at), "yyyy-MM-dd")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Card downloaded ✨");
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        {/* Preview card */}
        <div
          ref={cardRef}
          className="rounded-2xl p-8 mb-4 gradient-border"
          style={{
            background: "linear-gradient(135deg, hsl(270 25% 10%), hsl(275 20% 14%), hsl(270 25% 8%))",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Twemoji emoji={mood?.emoji ?? "🫥"} size={32} />
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {entry.title || mood?.label}
              </h3>
              <p className="text-xs text-muted-foreground/50">
                {format(new Date(entry.created_at), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-6 mb-4">
            {entry.journal_text}
          </p>
          <p className="text-xs text-primary/40 font-display italic">✨ AuraSpace</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl glass gradient-border flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:bg-muted/30 transition-all"
          >
            <Download size={16} />
            Download
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl glass gradient-border flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:bg-muted/30 transition-all"
          >
            <Share2 size={16} />
            Copy Text
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
