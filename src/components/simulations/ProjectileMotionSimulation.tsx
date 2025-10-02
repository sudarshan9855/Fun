import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
}

export const ProjectileMotionSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [angle, setAngle] = useState([45]);
  const [velocity, setVelocity] = useState([20]);
  const [gravity, setGravity] = useState([9.8]);
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [maxHeight, setMaxHeight] = useState(0);
  const [range, setRange] = useState(0);
  const [timeOfFlight, setTimeOfFlight] = useState(0);
  const animationRef = useRef<number>();
  const startTime = useRef<number>(0);

  const launchProjectile = () => {
    const angleRad = (angle[0] * Math.PI) / 180;
    const vx = velocity[0] * Math.cos(angleRad);
    const vy = velocity[0] * Math.sin(angleRad);
    
    setProjectile({
      x: 50,
      y: 350,
      vx,
      vy,
      trail: []
    });
    
    // Calculate theoretical values
    const theoreticalMaxHeight = (vy * vy) / (2 * gravity[0]);
    const theoreticalRange = (velocity[0] * velocity[0] * Math.sin(2 * angleRad)) / gravity[0];
    const theoreticalTime = (2 * vy) / gravity[0];
    
    setMaxHeight(theoreticalMaxHeight);
    setRange(theoreticalRange);
    setTimeOfFlight(theoreticalTime);
    
    startTime.current = Date.now();
    setIsPlaying(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#98FB98");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height - 30);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height - 30; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw cannon
    const cannonX = 50;
    const cannonY = 350;
    const angleRad = (angle[0] * Math.PI) / 180;
    
    ctx.fillStyle = "#2D4A22";
    ctx.fillRect(cannonX - 15, cannonY - 10, 30, 20);
    
    // Cannon barrel
    ctx.strokeStyle = "#2D4A22";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cannonX, cannonY);
    ctx.lineTo(cannonX + 25 * Math.cos(angleRad), cannonY - 25 * Math.sin(angleRad));
    ctx.stroke();

    // Draw angle arc
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cannonX, cannonY, 15, -angleRad, 0);
    ctx.stroke();
    
    // Angle label
    ctx.fillStyle = "#FFD700";
    ctx.font = "12px Arial";
    ctx.fillText(`${angle[0]}°`, cannonX + 20, cannonY + 15);

    // Draw velocity vector
    const velScale = 2;
    ctx.strokeStyle = "#FF4500";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cannonX, cannonY);
    ctx.lineTo(cannonX + velocity[0] * velScale * Math.cos(angleRad), cannonY - velocity[0] * velScale * Math.sin(angleRad));
    ctx.stroke();
    
    // Velocity components
    ctx.strokeStyle = "#FF6B6B";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    // Horizontal component
    ctx.beginPath();
    ctx.moveTo(cannonX, cannonY);
    ctx.lineTo(cannonX + velocity[0] * velScale * Math.cos(angleRad), cannonY);
    ctx.stroke();
    // Vertical component
    ctx.beginPath();
    ctx.moveTo(cannonX + velocity[0] * velScale * Math.cos(angleRad), cannonY);
    ctx.lineTo(cannonX + velocity[0] * velScale * Math.cos(angleRad), cannonY - velocity[0] * velScale * Math.sin(angleRad));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw projectile and trail
    if (projectile) {
      // Draw trail
      ctx.strokeStyle = "#FF69B4";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (projectile.trail.length > 0) {
        ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
        for (let i = 1; i < projectile.trail.length; i++) {
          ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y);
        }
      }
      ctx.stroke();

      // Draw projectile
      ctx.fillStyle = "#FF0000";
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw velocity vectors on projectile
      const scale = 0.5;
      // Horizontal velocity (constant)
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(projectile.x, projectile.y);
      ctx.lineTo(projectile.x + projectile.vx * scale, projectile.y);
      ctx.stroke();
      
      // Vertical velocity (changes)
      ctx.strokeStyle = "#0000FF";
      ctx.beginPath();
      ctx.moveTo(projectile.x, projectile.y);
      ctx.lineTo(projectile.x, projectile.y - projectile.vy * scale);
      ctx.stroke();
    }

    // Draw predicted trajectory (parabola)
    if (!isPlaying) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      
      const vx = velocity[0] * Math.cos(angleRad);
      const vy = velocity[0] * Math.sin(angleRad);
      
      for (let t = 0; t <= timeOfFlight; t += 0.1) {
        const x = cannonX + vx * t * 10;
        const y = cannonY - (vy * t * 10 - 0.5 * gravity[0] * t * t * 10);
        
        if (y >= cannonY) break;
        
        if (t === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [projectile, angle, velocity, gravity, isPlaying, maxHeight, range, timeOfFlight]);

  useEffect(() => {
    if (isPlaying && projectile) {
      const animate = () => {
        const currentTime = (Date.now() - startTime.current) / 1000;
        
        setProjectile(prev => {
          if (!prev) return null;
          
          const dt = 0.016; // ~60fps
          const newVy = prev.vy - gravity[0] * dt;
          const newX = prev.x + prev.vx * dt * 10;
          const newY = prev.y - prev.vy * dt * 10;
          
          // Add to trail
          const newTrail = [...prev.trail, { x: prev.x, y: prev.y }];
          if (newTrail.length > 100) newTrail.shift();
          
          // Check if hit ground
          if (newY >= 350) {
            setIsPlaying(false);
            return {
              ...prev,
              x: newX,
              y: 350,
              vy: 0,
              trail: newTrail
            };
          }
          
          return {
            ...prev,
            x: newX,
            y: newY,
            vy: newVy,
            trail: newTrail
          };
        });
        
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, projectile, gravity]);

  const reset = () => {
    setIsPlaying(false);
    setProjectile(null);
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Projectile Motion Simulator</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={launchProjectile}
              disabled={isPlaying}
              className="bg-primary/10 border-primary/30"
            >
              <Target className="w-4 h-4 mr-1" />
              Launch
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
          width={500}
          height={400}
          className="w-full border border-border/50 rounded-lg"
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground/80">Angle: {angle[0]}°</label>
            <Slider
              value={angle}
              onValueChange={setAngle}
              max={90}
              min={0}
              step={5}
              className="mt-2"
              disabled={isPlaying}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Initial Velocity: {velocity[0]} m/s</label>
            <Slider
              value={velocity}
              onValueChange={setVelocity}
              max={40}
              min={5}
              step={1}
              className="mt-2"
              disabled={isPlaying}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Gravity: {gravity[0]} m/s²</label>
            <Slider
              value={gravity}
              onValueChange={setGravity}
              max={20}
              min={1}
              step={0.1}
              className="mt-2"
              disabled={isPlaying}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-primary/10 rounded">
            <div className="font-medium text-primary">Max Height</div>
            <div className="text-lg">{maxHeight.toFixed(1)} m</div>
          </div>
          <div className="text-center p-2 bg-accent/10 rounded">
            <div className="font-medium text-accent">Range</div>
            <div className="text-lg">{range.toFixed(1)} m</div>
          </div>
          <div className="text-center p-2 bg-secondary/10 rounded">
            <div className="font-medium text-foreground/80">Flight Time</div>
            <div className="text-lg">{timeOfFlight.toFixed(1)} s</div>
          </div>
        </div>

        <div className="text-xs text-foreground/60 space-y-1">
          <div>🎯 Adjust angle and velocity, then press Launch</div>
          <div>🟢 Green arrow: horizontal velocity (constant)</div>
          <div>🔵 Blue arrow: vertical velocity (changes due to gravity)</div>
          <div>🌈 Pink trail: projectile path</div>
          <div>⚪ White dashed line: predicted trajectory</div>
        </div>
      </div>
    </Card>
  );
};
