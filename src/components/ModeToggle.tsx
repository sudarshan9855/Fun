import type { LearningMode } from "./ChatMessage";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";

interface ModeToggleProps {
  currentMode: LearningMode;
  onModeChange?: (mode: LearningMode) => void;
  onVisualGo?: () => void;
}

export const ModeToggle = ({ currentMode, onModeChange, onVisualGo }: ModeToggleProps) => {
  const modes: { value: LearningMode; label: string; emoji: string }[] = [
    { value: "visual", label: "Visual", emoji: "🌌" },
    { value: "mathematical", label: "Mathematical", emoji: "🔢" },
    { value: "mixed", label: "Mixed", emoji: "⚡" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {modes.map(({ value, label, emoji }) => (
          <button
            key={value}
            onClick={() => onModeChange?.(value)}
            className={`mode-toggle ${
              currentMode === value ? "mode-toggle-active" : "mode-toggle-inactive"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{emoji}</span>
              <span>{label}</span>
            </div>
          </button>
        ))}
      </div>
      
      {currentMode === "visual" && onVisualGo && (
        <div className="flex justify-center">
          <Button
            onClick={onVisualGo}
            size="sm"
            className="bg-gradient-nebula hover:shadow-glow transition-all"
          >
            <Zap className="w-4 h-4 mr-2" />
            Launch Visual Experience
          </Button>
        </div>
      )}
    </div>
  );
};
