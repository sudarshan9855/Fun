import type { DifficultyLevel } from "./ChatMessage";

interface DifficultyToggleProps {
  currentLevel: DifficultyLevel;
  onLevelChange?: (level: DifficultyLevel) => void;
}

export const DifficultyToggle = ({
  currentLevel,
  onLevelChange,
}: DifficultyToggleProps) => {
  const levels: { value: DifficultyLevel; label: string; emoji: string }[] = [
    { value: "beginner", label: "Beginner", emoji: "🌱" },
    { value: "intermediate", label: "Intermediate", emoji: "🚀" },
    { value: "advanced", label: "Advanced", emoji: "🌠" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {levels.map(({ value, label, emoji }) => (
        <button
          key={value}
          onClick={() => onLevelChange?.(value)}
          className={`mode-toggle ${
            currentLevel === value ? "mode-toggle-active" : "mode-toggle-inactive"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{emoji}</span>
            <span>{label}</span>
          </div>
        </button>
      ))}
    </div>
  );
};
