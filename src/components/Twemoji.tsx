const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/";

export function emojiToTwemojiUrl(emoji: string): string {
  const codePoints = [...emoji]
    .map((char) => char.codePointAt(0)!.toString(16))
    .filter((cp) => cp !== "fe0f")
    .join("-");
  return `${TWEMOJI_BASE}${codePoints}.png`;
}

interface TwemojiProps {
  emoji: string;
  size?: number;
  className?: string;
}

export const Twemoji = ({ emoji, size = 32, className = "" }: TwemojiProps) => {
  const url = emojiToTwemojiUrl(emoji);

  return (
    <img
      src={url}
      alt={emoji}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      draggable={false}
      loading="lazy"
      onError={(e) => {
        // fallback to normal emoji
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
};