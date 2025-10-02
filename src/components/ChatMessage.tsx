import { motion } from "framer-motion";
import { InlineMath, BlockMath } from "react-katex";
import { ModeToggle } from "./ModeToggle";
import { DifficultyToggle } from "./DifficultyToggle";
import { BookOpen, Sparkles, Play } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

// Import simulations
import { NewtonLawsSimulation } from "./simulations/NewtonLawsSimulation";
import { ProjectileMotionSimulation } from "./simulations/ProjectileMotionSimulation";
import { DerivativeVisualization } from "./simulations/DerivativeVisualization";
import { IntegrationVisualization } from "./simulations/IntegrationVisualization";

export type MessageRole = "user" | "tutor";
export type LearningMode = "visual" | "mathematical" | "mixed";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  mode?: LearningMode;
  difficulty?: DifficultyLevel;
  showControls?: boolean;
  onModeChange?: (mode: LearningMode) => void;
  onDifficultyChange?: (level: DifficultyLevel) => void;
  delay?: number;
}

// Function to detect topic and return appropriate simulation
const getSimulationForTopic = (content: string): React.ComponentType | null => {
  const lower = content.toLowerCase();
  
  if (lower.includes("newton") || lower.includes("force") || lower.includes("f = ma")) {
    return NewtonLawsSimulation;
  }
  if (lower.includes("projectile") || lower.includes("trajectory") || lower.includes("parabola")) {
    return ProjectileMotionSimulation;
  }
  if (lower.includes("derivative") || lower.includes("slope") || lower.includes("tangent")) {
    return DerivativeVisualization;
  }
  if (lower.includes("integral") || lower.includes("integration") || lower.includes("area under")) {
    return IntegrationVisualization;
  }
  
  return null;
};

export const ChatMessage = ({
  role,
  content,
  mode = "mixed",
  difficulty = "intermediate",
  showControls = false,
  onModeChange,
  onDifficultyChange,
  delay = 0,
}: ChatMessageProps) => {
  const [showSimulation, setShowSimulation] = useState(false);
  const SimulationComponent = getSimulationForTopic(content);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`w-full flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] md:max-w-[75%] ${role === "user" ? "w-auto" : "w-full"}`}>
        <div
          className={`message-bubble ${
            role === "user" ? "message-user" : "message-tutor"
          }`}
        >
          {role === "tutor" && (
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold bg-gradient-nebula bg-clip-text text-transparent">
                AI Tutor
              </span>
            </div>
          )}
          
          <div className="text-base leading-relaxed whitespace-pre-wrap">
            {content}
          </div>

          {/* Visual Simulation Section */}
          {role === "tutor" && mode === "visual" && SimulationComponent && (
            <div className="mt-6">
              {!showSimulation ? (
                <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="mb-4">
                    <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      Interactive Visual Simulation Available!
                    </h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Experience this concept through hands-on interaction and real-time visualization.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowSimulation(true)}
                    className="bg-gradient-nebula hover:shadow-glow transition-all"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Launch Visual Simulation
                  </Button>
                </div>
              ) : (
                <div className="mt-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SimulationComponent />
                  </motion.div>
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowSimulation(false)}
                      className="text-sm"
                    >
                      Hide Simulation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {showControls && role === "tutor" && (
            <div className="mt-6 pt-4 border-t border-border space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Learning Mode:
                </span>
              </div>
              <ModeToggle 
                currentMode={mode} 
                onModeChange={onModeChange}
                onVisualGo={() => setShowSimulation(true)}
              />
              
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs font-medium text-muted-foreground">
                  Difficulty:
                </span>
              </div>
              <DifficultyToggle
                currentLevel={difficulty}
                onLevelChange={onDifficultyChange}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
