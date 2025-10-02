import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

export const NewtonLawsSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mass, setMass] = useState([5]);
  const [force, setForce] = useState([10]);
  const [friction, setFriction] = useState([0.1]);
  const [position, setPosition] = useState(50);
  const [velocity, setVelocity] = useState(0);
  const [acceleration, setAcceleration] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = "#374151";
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Draw grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height - 20);
      ctx.stroke();
    }

    // Draw box
    const boxSize = 30 + mass[0] * 2; // Size based on mass
    const boxY = canvas.height - 20 - boxSize;
    
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(position, boxY, boxSize, boxSize);
    
    // Draw mass label
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${mass[0]}kg`, position + boxSize/2, boxY + boxSize/2 + 4);

    // Draw force arrow
    if (force[0] > 0) {
      const arrowLength = force[0] * 3;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(position + boxSize + 5, boxY + boxSize/2);
      ctx.lineTo(position + boxSize + 5 + arrowLength, boxY + boxSize/2);
      ctx.stroke();
      
      // Arrow head
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(position + boxSize + 5 + arrowLength, boxY + boxSize/2);
      ctx.lineTo(position + boxSize + 5 + arrowLength - 8, boxY + boxSize/2 - 4);
      ctx.lineTo(position + boxSize + 5 + arrowLength - 8, boxY + boxSize/2 + 4);
      ctx.fill();
      
      // Force label
      ctx.fillStyle = "#ef4444";
      ctx.font = "10px Arial";
      ctx.fillText(`F=${force[0]}N`, position + boxSize + 15 + arrowLength/2, boxY + boxSize/2 - 10);
    }

    // Draw friction arrow (if moving)
    if (Math.abs(velocity) > 0.1) {
      const frictionForce = friction[0] * mass[0] * 9.8;
      const frictionLength = frictionForce * 3;
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (velocity > 0) {
        ctx.moveTo(position - 5, boxY + boxSize/2);
        ctx.lineTo(position - 5 - frictionLength, boxY + boxSize/2);
      } else {
        ctx.moveTo(position + boxSize + 5, boxY + boxSize/2);
        ctx.lineTo(position + boxSize + 5 + frictionLength, boxY + boxSize/2);
      }
      ctx.stroke();
      
      ctx.fillStyle = "#f59e0b";
      ctx.font = "10px Arial";
      ctx.fillText(`f=${frictionForce.toFixed(1)}N`, position + (velocity > 0 ? -30 : boxSize + 15), boxY + boxSize/2 + 15);
    }

  }, [position, mass, force, friction, velocity]);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        // Calculate net force
        const appliedForce = force[0];
        const frictionForce = friction[0] * mass[0] * 9.8 * (velocity > 0 ? -1 : velocity < 0 ? 1 : 0);
        const netForce = appliedForce + frictionForce;
        
        // F = ma, so a = F/m
        const newAcceleration = netForce / mass[0];
        setAcceleration(newAcceleration);
        
        // Update velocity and position
        setVelocity(prev => {
          const newVel = prev + newAcceleration * 0.1;
          return Math.abs(newVel) < 0.01 ? 0 : newVel; // Stop if very slow
        });
        
        setPosition(prev => {
          const newPos = prev + velocity * 2;
          // Bounce off walls
          if (newPos < 0 || newPos > 350) {
            setVelocity(v => -v * 0.8); // Bounce with energy loss
            return Math.max(0, Math.min(350, newPos));
          }
          return newPos;
        });
        
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, force, mass, friction, velocity]);

  const reset = () => {
    setIsPlaying(false);
    setPosition(50);
    setVelocity(0);
    setAcceleration(0);
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Newton's Laws Interactive Demo</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-primary/10 border-primary/30"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="bg-secondary/10 border-secondary/30"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full border border-border/50 rounded-lg bg-background/50"
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground/80">Mass: {mass[0]}kg</label>
            <Slider
              value={mass}
              onValueChange={setMass}
              max={15}
              min={1}
              step={1}
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Force: {force[0]}N</label>
            <Slider
              value={force}
              onValueChange={setForce}
              max={30}
              min={0}
              step={1}
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Friction: {friction[0]}</label>
            <Slider
              value={friction}
              onValueChange={setFriction}
              max={0.5}
              min={0}
              step={0.05}
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-primary/10 rounded">
            <div className="font-medium text-primary">Velocity</div>
            <div className="text-lg">{velocity.toFixed(1)} m/s</div>
          </div>
          <div className="text-center p-2 bg-accent/10 rounded">
            <div className="font-medium text-accent">Acceleration</div>
            <div className="text-lg">{acceleration.toFixed(1)} m/s²</div>
          </div>
          <div className="text-center p-2 bg-secondary/10 rounded">
            <div className="font-medium text-foreground/80">Net Force</div>
            <div className="text-lg">{(force[0] - (Math.abs(velocity) > 0.1 ? friction[0] * mass[0] * 9.8 : 0)).toFixed(1)} N</div>
          </div>
        </div>

        <div className="text-xs text-foreground/60 space-y-1">
          <div>🔵 Blue box represents the object (size = mass)</div>
          <div>🔴 Red arrow shows applied force</div>
          <div>🟡 Yellow arrow shows friction force (when moving)</div>
          <div>💡 Try different combinations to see F = ma in action!</div>
        </div>
      </div>
    </Card>
  );
};
