import { useState } from "react";
import { motion } from "framer-motion";
import { Send, GraduationCap, Sparkles } from "lucide-react";
import { ChatMessage, type LearningMode, type DifficultyLevel } from "@/components/ChatMessage";
import { QuickChips } from "@/components/QuickChips";
import { Starfield } from "@/components/Starfield";
import cosmicBanner from "@/assets/cosmic-banner.jpg";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "tutor";
  content: string;
  mode?: LearningMode;
  difficulty?: DifficultyLevel;
  showControls?: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "tutor",
      content: "🌌 Welcome to the Cosmic Learning Hub! I'm your AI tutor for AP Physics and Mathematics. \n\nI can explain concepts through different lenses - visualize them like nebulae 🌌, break them down mathematically 🔢, or blend both approaches ⚡. \n\nWhat cosmic knowledge shall we explore today?",
      mode: "mixed",
      difficulty: "intermediate",
      showControls: false,
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate tutor response
    setTimeout(() => {
      const tutorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: getSampleResponse(input),
        mode: "mixed",
        difficulty: "intermediate",
        showControls: true,
      };
      setMessages((prev) => [...prev, tutorMessage]);
    }, 800);
  };

  const handleChipClick = (topic: string) => {
    setInput(topic);
    toast.success("Question added! Press send to continue.");
  };

  const handleModeChange = (messageId: string, newMode: LearningMode) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, mode: newMode } : msg
      )
    );
    toast.success(`Switched to ${newMode} mode`);
  };

  const handleDifficultyChange = (messageId: string, newLevel: DifficultyLevel) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, difficulty: newLevel } : msg
      )
    );
    toast.success(`Switched to ${newLevel} level`);
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Animated Starfield Background */}
      <Starfield />
      
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-56 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${cosmicBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="relative h-full flex items-center justify-center z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-nebula bg-clip-text text-transparent">
                Cosmic Learning Hub
              </h1>
              <GraduationCap className="w-10 h-10 text-accent" />
            </div>
            <p className="text-lg md:text-xl text-foreground/90 font-medium">
              AP Physics & Mathematics • Learn from the Stars 🌟
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col relative z-10">
        {/* Messages */}
        <div className="flex-1 space-y-6 overflow-y-auto mb-6 relative z-10">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              mode={message.mode}
              difficulty={message.difficulty}
              showControls={message.showControls}
              onModeChange={(mode) => handleModeChange(message.id, mode)}
              onDifficultyChange={(level) => handleDifficultyChange(message.id, level)}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Input Area */}
        <div className="space-y-4 sticky bottom-0 backdrop-blur-xl bg-background/60 pt-4 pb-2 rounded-t-3xl border-t border-border/30 relative z-10">
          {messages.length <= 1 && <QuickChips onChipClick={handleChipClick} />}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex gap-3 items-end"
          >
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="What do you want to learn today? 🌌"
                className="w-full px-6 py-4 pr-14 rounded-2xl border-2 border-border/50 bg-card/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all min-h-[60px] max-h-[200px] shadow-lg"
                rows={1}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-[60px] w-[60px] rounded-2xl bg-gradient-nebula text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:shadow-glow shadow-lg"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Sample response generator (will be replaced with real AI later)
const getSampleResponse = (question: string): string => {
  const lower = question.toLowerCase();
  
  if (lower.includes("newton")) {
    return `Great question! Let me explain Newton's Three Laws of Motion:

**First Law (Law of Inertia):** An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by a net external force.

**Second Law:** F = ma (Force equals mass times acceleration). This fundamental equation relates force, mass, and acceleration.

**Third Law:** For every action, there is an equal and opposite reaction.

Would you like to see some visual examples or practice problems?`;
  }
  
  if (lower.includes("integral") || lower.includes("integration")) {
    return `Integration is one of the fundamental concepts in calculus!

An **integral** represents the accumulation of quantities - you can think of it as the "opposite" of a derivative.

**Basic Concept:** ∫ f(x)dx represents the area under the curve f(x)

**Fundamental Theorem:** If F'(x) = f(x), then ∫[a to b] f(x)dx = F(b) - F(a)

Try adjusting the learning mode to see this concept explained differently!`;
  }
  
  if (lower.includes("projectile")) {
    return `Projectile motion is a combination of two independent motions:

**Horizontal Motion:** Constant velocity (no acceleration)
- x = v₀ₓt

**Vertical Motion:** Constant acceleration due to gravity
- y = v₀yt - ½gt²

The beautiful thing is that these two motions are independent - gravity doesn't affect horizontal motion!

Want to see an animated trajectory or work through some examples?`;
  }
  
  if (lower.includes("derivative")) {
    return `Derivatives measure the **rate of change** of a function!

**Definition:** f'(x) = lim[h→0] (f(x+h) - f(x))/h

**Geometric Meaning:** The slope of the tangent line at a point

**Common Rules:**
- Power Rule: d/dx(xⁿ) = nxⁿ⁻¹
- Product Rule: d/dx(uv) = u'v + uv'
- Chain Rule: d/dx(f(g(x))) = f'(g(x))·g'(x)

Would you like to practice with some problems?`;
  }
  
  return `That's an interesting topic! I can help explain that concept in different ways. Try using the learning mode controls below to switch between visual, mathematical, or mixed explanations. You can also adjust the difficulty level to match your current understanding.`;
};

export default Index;
