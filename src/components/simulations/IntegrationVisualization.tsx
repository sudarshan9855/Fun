import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FunctionType = "quadratic" | "sine" | "linear" | "cubic";

export const IntegrationVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [functionType, setFunctionType] = useState<FunctionType>("quadratic");
  const [lowerBound, setLowerBound] = useState([-10]);
  const [upperBound, setUpperBound] = useState([10]);
  const [rectangles, setRectangles] = useState([20]);
  const [showRectangles, setShowRectangles] = useState(true);
  const [animateIntegration, setAnimateIntegration] = useState(false);
  const [currentRect, setCurrentRect] = useState(0);
  const animationRef = useRef<number>();

  const functions = {
    quadratic: {
      f: (x: number) => 0.05 * x * x + 1,
      integral: (a: number, b: number) => (0.05 * (b * b * b - a * a * a)) / 3 + (b - a),
      name: "f(x) = 0.05x² + 1"
    },
    sine: {
      f: (x: number) => 2 * Math.sin(x / 5) + 3,
      integral: (a: number, b: number) => -10 * (Math.cos(b / 5) - Math.cos(a / 5)) + 3 * (b - a),
      name: "f(x) = 2sin(x/5) + 3"
    },
    linear: {
      f: (x: number) => 0.2 * x + 5,
      integral: (a: number, b: number) => 0.1 * (b * b - a * a) + 5 * (b - a),
      name: "f(x) = 0.2x + 5"
    },
    cubic: {
      f: (x: number) => 0.001 * x * x * x + 0.1 * x + 3,
      integral: (a: number, b: number) => 0.00025 * (b * b * b * b - a * a * a * a) + 0.05 * (b * b - a * a) + 3 * (b - a),
      name: "f(x) = 0.001x³ + 0.1x + 3"
    }
  };

  useEffect(() => {
    if (animateIntegration) {
      const animate = () => {
        setCurrentRect(prev => {
          const next = prev + 1;
          if (next >= rectangles[0]) {
            setAnimateIntegration(false);
            return rectangles[0];
          }
          return next;
        });
        setTimeout(() => {
          if (animateIntegration) {
            animationRef.current = requestAnimationFrame(animate);
          }
        }, 200);
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animateIntegration, rectangles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height * 0.8;
    const scale = 8;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;
    for (let i = -30; i <= 30; i += 5) {
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

    const currentFunc = functions[functionType];
    const a = lowerBound[0];
    const b = upperBound[0];
    const n = rectangles[0];

    // Draw rectangles (Riemann sum)
    if (showRectangles && b > a) {
      const dx = (b - a) / n;
      let riemannSum = 0;
      
      for (let i = 0; i < (animateIntegration ? currentRect : n); i++) {
        const x = a + i * dx;
        const y = currentFunc.f(x + dx / 2); // Midpoint rule
        riemannSum += y * dx;
        
        if (y > 0) {
          const rectX = centerX + x * scale;
          const rectY = centerY - y * scale;
          const rectWidth = dx * scale;
          const rectHeight = y * scale;
          
          // Fill rectangle
          ctx.fillStyle = `hsla(${200 + i * (160 / n)}, 70%, 60%, 0.3)`;
          ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
          
          // Outline rectangle
          ctx.strokeStyle = `hsla(${200 + i * (160 / n)}, 70%, 40%, 0.8)`;
          ctx.lineWidth = 1;
          ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
        }
      }
    }

    // Draw integration bounds
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    
    // Lower bound
    ctx.beginPath();
    ctx.moveTo(centerX + a * scale, 0);
    ctx.lineTo(centerX + a * scale, height);
    ctx.stroke();
    
    // Upper bound
    ctx.beginPath();
    ctx.moveTo(centerX + b * scale, 0);
    ctx.lineTo(centerX + b * scale, height);
    ctx.stroke();
    
    ctx.setLineDash([]);

    // Draw function curve
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.beginPath();
    let firstPoint = true;
    for (let x = -30; x <= 30; x += 0.2) {
      const y = currentFunc.f(x);
      const canvasX = centerX + x * scale;
      const canvasY = centerY - y * scale;
      
      if (canvasY >= 0 && canvasY <= height && y >= 0) {
        if (firstPoint) {
          ctx.moveTo(canvasX, canvasY);
          firstPoint = false;
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      }
    }
    ctx.stroke();

    // Fill area under curve between bounds
    if (b > a) {
      ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
      ctx.beginPath();
      ctx.moveTo(centerX + a * scale, centerY);
      
      for (let x = a; x <= b; x += 0.2) {
        const y = Math.max(0, currentFunc.f(x));
        const canvasX = centerX + x * scale;
        const canvasY = centerY - y * scale;
        ctx.lineTo(canvasX, canvasY);
      }
      
      ctx.lineTo(centerX + b * scale, centerY);
      ctx.closePath();
      ctx.fill();
    }

    // Draw axis labels
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    
    // X-axis labels
    for (let i = -20; i <= 20; i += 10) {
      if (i !== 0) {
        const x = centerX + i * scale;
        if (x >= 20 && x <= width - 20) {
          ctx.fillText(i.toString(), x, centerY + 15);
        }
      }
    }

    // Bound labels
    ctx.fillStyle = "#ef4444";
    ctx.font = "14px Arial";
    ctx.fillText(`a = ${a}`, centerX + a * scale, centerY + 30);
    ctx.fillText(`b = ${b}`, centerX + b * scale, centerY + 30);

    // Calculate and display values
    const exactIntegral = currentFunc.integral(a, b);
    const dx = (b - a) / n;
    let riemannSum = 0;
    
    for (let i = 0; i < n; i++) {
      const x = a + i * dx;
      const y = currentFunc.f(x + dx / 2);
      riemannSum += y * dx;
    }

    // Display calculations
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Exact Integral: ${exactIntegral.toFixed(3)}`, 10, 30);
    ctx.fillText(`Riemann Sum: ${riemannSum.toFixed(3)}`, 10, 50);
    ctx.fillText(`Error: ${Math.abs(exactIntegral - riemannSum).toFixed(3)}`, 10, 70);
    ctx.fillText(`Rectangles: ${animateIntegration ? currentRect : n}`, 10, 90);

  }, [functionType, lowerBound, upperBound, rectangles, showRectangles, animateIntegration, currentRect]);

  const startAnimation = () => {
    setCurrentRect(0);
    setAnimateIntegration(true);
  };

  const reset = () => {
    setAnimateIntegration(false);
    setCurrentRect(0);
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Integration Visualization</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startAnimation}
              disabled={animateIntegration}
              className="bg-primary/10 border-primary/30"
            >
              <Calculator className="w-4 h-4 mr-1" />
              Animate
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
          width={600}
          height={400}
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
                <SelectItem value="sine">Sine</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="cubic">Cubic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Rectangles: {rectangles[0]}</label>
            <Slider
              value={rectangles}
              onValueChange={setRectangles}
              max={100}
              min={5}
              step={5}
              className="mt-2"
              disabled={animateIntegration}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground/80">Lower Bound: {lowerBound[0]}</label>
            <Slider
              value={lowerBound}
              onValueChange={setLowerBound}
              max={upperBound[0] - 1}
              min={-20}
              step={1}
              className="mt-2"
              disabled={animateIntegration}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Upper Bound: {upperBound[0]}</label>
            <Slider
              value={upperBound}
              onValueChange={setUpperBound}
              max={20}
              min={lowerBound[0] + 1}
              step={1}
              className="mt-2"
              disabled={animateIntegration}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showRectangles}
              onChange={(e) => setShowRectangles(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-foreground/80">Show Riemann Rectangles</span>
          </label>
        </div>

        <div className="bg-background/50 p-3 rounded-lg space-y-2">
          <div className="text-sm">
            <span className="font-medium text-primary">Function:</span> {functions[functionType].name}
          </div>
          <div className="text-sm">
            <span className="font-medium text-accent">Integral:</span> ∫[{lowerBound[0]} to {upperBound[0]}] f(x)dx
          </div>
        </div>

        <div className="text-xs text-foreground/60 space-y-1">
          <div>🔵 Blue curve: Function f(x)</div>
          <div>🟦 Blue area: Exact integral (area under curve)</div>
          <div>🌈 Colored rectangles: Riemann sum approximation</div>
          <div>🔴 Red dashed lines: Integration bounds</div>
          <div>💡 More rectangles = better approximation!</div>
        </div>
      </div>
    </Card>
  );
};
