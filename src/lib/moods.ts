export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  aura: string;
}

export const moods: MoodOption[] = [
  {
    id: "happy",
    label: "Happy",
    emoji: "😊",
    color: "from-yellow-400/20 to-orange-400/20",
    aura: "Celebrate this feeling! Write 3 things you're grateful for today.",
  },
  {
    id: "calm",
    label: "Calm",
    emoji: "😌",
    color: "from-emerald-400/20 to-teal-400/20",
    aura: "Take a deep breath. Try 5 minutes of mindful journaling.",
  },
  {
    id: "sad",
    label: "Sad",
    emoji: "😢",
    color: "from-blue-400/20 to-indigo-400/20",
    aura: "It's okay to feel this way. Listen to calming music & write your feelings.",
  },
  {
    id: "anxious",
    label: "Anxious",
    emoji: "😰",
    color: "from-amber-400/20 to-red-400/20",
    aura: "Ground yourself: 4-7-8 breathing technique. Then journal what's on your mind.",
  },
  {
    id: "excited",
    label: "Excited",
    emoji: "🤩",
    color: "from-pink-400/20 to-rose-400/20",
    aura: "Channel this energy! Write about what's making you excited.",
  },
  {
    id: "tired",
    label: "Tired",
    emoji: "😴",
    color: "from-slate-400/20 to-gray-400/20",
    aura: "Rest is productive. Reflect on your day gently and plan for tomorrow.",
  },
  {
    id: "grateful",
    label: "Grateful",
    emoji: "🥰",
    color: "from-purple-400/20 to-pink-400/20",
    aura: "Beautiful energy! List 5 things you appreciate right now.",
  },
  {
    id: "angry",
    label: "Angry",
    emoji: "😤",
    color: "from-red-400/20 to-orange-400/20",
    aura: "Release it safely. Write down what triggered this and let it go.",
  },
];
