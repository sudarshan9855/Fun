import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FunctionType = "quadratic" | "cubic" | "sine" | "exponential";

export const DerivativeVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [functionType, setFunctionType] = useState<FunctionType>("quadratic");
  const [xPosition, setXPosition] = useState([0]);
  const [showDerivative, setShowDerivative] = useState(true);
  const [showTangent, setShowTangent] = useState(true);
  const [animatePoint, setAnimatePoint] = useState(false);
  const animationRef = useRef<number>();

  const functions = {
    quadratic: {
      f: (x: number) => 0.1 * x * x - 2,
      df: (x: number) => 0.2 * x,
      name: "f(x) = 0.1x² - 2",
      derivative: "f'(x) = 0.2x"
    },
    cubic: {
      f: (x: number) => 0.01 * x * x * x - 0.1 * x * x - x + 2,
      df: (x: number) => 0.03 * x * x - 0.2 * x - 1,
      name: "f(x) = 0.01x³ - 0.1x² - x + 2",
      derivative: "f'(x) = 0.03x² - 0.2x - 1"
    },
    sine: {
      f: (x: number) => 3 * Math.sin(x / 10) + 1,
      df: (x: number) => (3 / 10) * Math.cos(x / 10),
      name: "f(x) = 3sin(x/10) + 1",
      derivative: "f'(x) = 0.3cos(x/10)"
    },
    exponential: {
      f: (x: number) => Math.exp(x / 20) - 1,
      df: (x: number) => (1 / 20) * Math.exp(x / 20),
      name: "f(x) = e^(x/20) - 1",
      derivative: "f'(x) = (1/20)e^(x/20)"
    }
  };

  useEffect(() => {
    if (animatePoint) {
      const animate = () => {
        setXPosition(prev => {
          const newX = prev[0] + 2;
          return [newX > 50 ? -50 : newX];
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
  }, [animatePoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 4;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;
    for (let i = -50; i <= 50; i += 10) {
      const x = centerX + i * scale;
      const y = centerY + i * scale;
      
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      if (y >= 0 && y <= height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw axes
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 2;
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    for (let i = -40; i <= 40; i += 20) {
      if (i !== 0) {
        const x = centerX + i * scale;
        const y = centerY + i * scale;
        
        if (x >= 20 && x <= width - 20) {
          ctx.fillText(i.toString(), x, centerY + 15);
        }
        if (y >= 20 && y <= height - 20) {
          ctx.save();
          ctx.translate(centerX - 15, y);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(i.toString(), 0, 0);
          ctx.restore();
        }
      }
    }

    const currentFunc = functions[functionType];

    // Draw original function
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    let firstPoint = true;
    for (let x = -50; x <= 50; x += 0.5) {
      const y = currentFunc.f(x);
      const canvasX = centerX + x * scale;
      const canvasY = centerY - y * scale;
      
      if (canvasY >= 0 && canvasY <= height) {
        if (firstPoint) {
          ctx.moveTo(canvasX, canvasY);
          firstPoint = false;
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      }
    }
    ctx.stroke();

    // Draw derivative function
    if (showDerivative) {
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      firstPoint = true;
      for (let x = -50; x <= 50; x += 0.5) {
        const y = currentFunc.df(x);
        const canvasX = centerX + x * scale;
        const canvasY = centerY - y * scale;
        
        if (canvasY >= 0 && canvasY <= height) {
          if (firstPoint) {
            ctx.moveTo(canvasX, canvasY);
            firstPoint = false;
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        }
      }
      ctx.stroke();
    }

    // Draw point and tangent line
    const currentX = xPosition[0];
    const currentY = currentFunc.f(currentX);
    const slope = currentFunc.df(currentX);
    
    const pointCanvasX = centerX + currentX * scale;
    const pointCanvasY = centerY - currentY * scale;

    // Draw tangent line
    if (showTangent) {
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      const tangentLength = 30;
      const x1 = currentX - tangentLength;
      const y1 = currentY + slope * (-tangentLength);
      const x2 = currentX + tangentLength;
      const y2 = currentY + slope * tangentLength;
      
      ctx.moveTo(centerX + x1 * scale, centerY - y1 * scale);
      ctx.lineTo(centerX + x2 * scale, centerY - y2 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw point on function
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(pointCanvasX, pointCanvasY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw point on derivative
    if (showDerivative) {
      const derivativeY = currentFunc.df(currentX);
      const derivativeCanvasY = centerY - derivativeY * scale;
      
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(pointCanvasX, derivativeCanvasY, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw slope triangle
    if (showTangent && Math.abs(slope) < 10) {
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1;
      ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
      
      const deltaX = 10;
      const deltaY = slope * deltaX;
      
      ctx.beginPath();
      ctx.moveTo(pointCanvasX, pointCanvasY);
      ctx.lineTo(pointCanvasX + deltaX * scale, pointCanvasY);
      ctx.lineTo(pointCanvasX + deltaX * scale, pointCanvasY - deltaY * scale);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Labels for triangle
      ctx.fillStyle = "#10b981";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Δx", pointCanvasX + (deltaX * scale) / 2, pointCanvasY + 15);
      ctx.fillText("Δy", pointCanvasX + deltaX * scale + 15, pointCanvasY - (deltaY * scale) / 2);
    }

    // Draw values
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`x = ${currentX.toFixed(1)}`, 10, 30);
    ctx.fillText(`f(x) = ${currentY.toFixed(2)}`, 10, 50);
    ctx.fillText(`f'(x) = ${slope.toFixed(2)}`, 10, 70);

  }, [functionType, xPosition, showDerivative, showTangent]);

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Derivative Visualization</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnimatePoint(!animatePoint)}
              className="bg-primary/10 border-primary/30"
            >
              {animatePoint ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setXPosition([0])}
              className="bg-secondary/10 border-secondary/30"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={500}
          height={350}
          className="w-full border border-border/50 rounded-lg bg-background/80"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground/80">Function Type</label>
            <Select value={functionType} onValueChange={(value: FunctionType) => setFunctionType(value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quadratic">Quadratic</SelectItem>
                <SelectItem value="cubic">Cubic</SelectItem>
                <SelectItem value="sine">Sine</SelectItem>
                <SelectItem value="exponential">Exponential</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">X Position: {xPosition[0]}</label>
            <Slider
              value={xPosition}
              onValueChange={setXPosition}
              max={40}
              min={-40}
              step={0.5}
              className="mt-2"
              disabled={animatePoint}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showDerivative}
              onChange={(e) => setShowDerivative(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-foreground/80">Show Derivative</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showTangent}
              onChange={(e) => setShowTangent(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-foreground/80">Show Tangent Line</span>
          </label>
        </div>

        <div className="bg-background/50 p-3 rounded-lg space-y-2">
          <div className="text-sm">
            <span className="font-medium text-primary">Function:</span> {functions[functionType].name}
          </div>
          <div className="text-sm">
            <span className="font-medium text-red-500">Derivative:</span> {functions[functionType].derivative}
          </div>
        </div>

        <div className="text-xs text-foreground/60 space-y-1">
          <div>🔵 Blue curve: Original function f(x)</div>
          <div>🔴 Red curve: Derivative f'(x) (slope of blue curve)</div>
          <div>🟢 Green line: Tangent line at current point</div>
          <div>🔺 Green triangle: Rise over run (Δy/Δx)</div>
          <div>💡 The derivative shows the rate of change at each point!</div>
        </div>
      </div>
    </Card>
  );
};
