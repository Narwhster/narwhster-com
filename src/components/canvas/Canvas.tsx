import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
  timestamp: number;
  fadeStartTime: number | null;
}

interface Stroke {
  points: Point[];
  isComplete: boolean;
}

interface AnimatedWave {
  slope: number;
  currentX: number;
  currentY: number;
  direction: { x: number, y: number };
}

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const scaleRef = useRef<number>(1);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [lastStrokeTimestamp, setLastStrokeTimestamp] = useState<number | null>(null);
  const [animatedWaves, setAnimatedWaves] = useState<AnimatedWave[]>([]);

  const isDrawingRef = useRef(isDrawing);
  const strokesRef = useRef(strokes);
  const lastStrokeTimestampRef = useRef(lastStrokeTimestamp);
  const animatedWavesRef = useRef(animatedWaves);

  const GRID_SIZE = 20;
  const DOT_SIZE = 6;
  const DOT_COLOR = '#CAF0F8';
  const STROKE_COLOR_TEMPLATE = `rgba(0, 180, 216, %s)`;
  const STROKE_WIDTH = 3;
  const FADE_DELAY = 1000;
  const FADE_DURATION = 500;
  const MAX_DOT_GROWTH = 2;
  
  const getWaveRange = () => {
    if (window.innerWidth >= 768) {
      return 400;
    } 
    return 200;
  }
  const getWaveSpeed = () => {
    if (window.innerWidth >= 768) {
      return 10;
    } 
    return 2;
  }

  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    animatedWavesRef.current = animatedWaves;
  }, [animatedWaves]);

  useEffect(() => {
    lastStrokeTimestampRef.current = lastStrokeTimestamp;
  }, [lastStrokeTimestamp]);

  const getAllPoints = (strokes: Stroke[]): Point[] => {
    return strokes
      .flatMap(stroke => stroke.points)
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const getPointOpacity = (point: Point, now: number): number => {
    if (!point.fadeStartTime) return 1;
    
    const timeSinceFadeStart = now - point.fadeStartTime;
    if (timeSinceFadeStart < 0) return 1;
    if (timeSinceFadeStart >= FADE_DURATION) return 0;
    
    return 1 - (timeSinceFadeStart / FADE_DURATION);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const containerRect = container.getBoundingClientRect();
      
      canvas.width = containerRect.width * pixelRatio;
      canvas.height = containerRect.height * pixelRatio;
      
      canvas.style.width = `${containerRect.width}px`;
      canvas.style.height = `${containerRect.height}px`;
      
      scaleRef.current = pixelRatio;
      ctx.scale(pixelRatio, pixelRatio);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);
    updateCanvasSize();

    const drawGrid = (waves: AnimatedWave[]) => {
      const rect = canvas.getBoundingClientRect();
      
      const cols = Math.floor(rect.width / GRID_SIZE);
      const rows = Math.floor(rect.height / GRID_SIZE);
      
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * GRID_SIZE;
          const y = j * GRID_SIZE;
          
          let bonus = 0;

          for (const wave of waves) {
            const distance = 
              (Math.abs((wave.slope * x - y + (wave.currentY - wave.slope * wave.currentX))) / 
              (Math.sqrt(1 + wave.slope * wave.slope)));
            
            if (distance < getWaveRange()) {
              const growth = MAX_DOT_GROWTH * (1 - distance / getWaveRange());
              bonus = Math.max(bonus, growth);
            }
          }
          
          ctx.fillStyle = DOT_COLOR;
          ctx.beginPath();
          ctx.arc(x, y, (DOT_SIZE / 2) + bonus, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      setAnimatedWaves(prev => {
        return prev.filter(wave => {
          const canvasDiagonalSlope = rect.height / rect.width;
          wave.currentX = getWaveSpeed() * wave.direction.x + wave.currentX;
          wave.currentY = getWaveSpeed() * canvasDiagonalSlope * wave.direction.y + wave.currentY;
          
          return (
            wave.currentX >= 0 &&
            wave.currentX <= rect.width &&
            wave.currentY >= 0 &&
            wave.currentY <= rect.height
          );
        });
      });
      
      drawGrid(animatedWavesRef.current);
      
      ctx.lineWidth = STROKE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const now = Date.now();
      const lastTimestamp = lastStrokeTimestampRef.current;

      if (lastTimestamp && now >= lastTimestamp + FADE_DELAY && !isDrawingRef.current) {
        setStrokes(prev => {
          const allPoints = getAllPoints(prev);
          const pointCount = allPoints.length;
          const fadeStartInterval = FADE_DURATION / pointCount;
          
          return prev.map(stroke => ({
            ...stroke,
            points: stroke.points.map(point => {
              if (point.fadeStartTime !== null) return point;
              if (!stroke.isComplete) return point;
              
              const pointIndex = allPoints.findIndex(p => 
                p.timestamp === point.timestamp && p.x === point.x && p.y === point.y
              );
              const fadeStartTime = lastTimestamp + FADE_DELAY + (pointIndex * fadeStartInterval);
              return { ...point, fadeStartTime };
            })
          }));
        });
      }

      for (const stroke of strokesRef.current) {
        if (stroke.points.length < 2) continue;
        
        for (let i = 1; i < stroke.points.length; i++) {
          const point = stroke.points[i];
          const prevPoint = stroke.points[i - 1];
          
          if (!stroke.isComplete) {
            ctx.beginPath();
            ctx.strokeStyle = STROKE_COLOR_TEMPLATE.replace('%s', '1');
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            continue;
          }

          const opacity = Math.min(
            getPointOpacity(point, now),
            getPointOpacity(prevPoint, now)
          );

          if (opacity > 0) {
            ctx.beginPath();
            ctx.strokeStyle = STROKE_COLOR_TEMPLATE.replace('%s', opacity.toString());
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      
      setStrokes(prev => {
        return prev.filter(stroke => {
          if (!stroke.isComplete) return true;
          return stroke.points.some(point => 
            !point.fadeStartTime || now - point.fadeStartTime < FADE_DURATION
          );
        });
      });
    }, 1000);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(cleanupInterval);
    };
  }, []);

  const getRelativeCoords = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, timestamp: Date.now(), fadeStartTime: null };

    const rect = canvas.getBoundingClientRect();
    const scale = scaleRef.current;
    
    return {
      x: (e.clientX - rect.left) / scale * scale,
      y: (e.clientY - rect.top) / scale * scale,
      timestamp: Date.now(),
      fadeStartTime: null
    };
  };
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    const point = getRelativeCoords(e);
    setStrokes(prev => [...prev, { 
      points: [point],
      isComplete: false
    }]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const point = getRelativeCoords(e);
    setStrokes(prev => {
      const lastStroke = prev[prev.length - 1];
      return [
        ...prev.slice(0, -1),
        {
          ...lastStroke,
          points: [...lastStroke.points, point]
        }
      ];
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const point = getRelativeCoords(e);
    
    setStrokes(prev => {
      const lastStroke = prev[prev.length - 1];
      const newPoints = [...lastStroke.points, point];
      
      if (newPoints.length >= 2) {
        const p1 = newPoints[0];
        const p2 = newPoints[newPoints.length - 1];
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        let perpSlope;
        if (dx === 0) {
          perpSlope = 0;
        } else if (dy === 0) {
          perpSlope = Infinity;
        } else {
          perpSlope = -dx / dy;
        }
        
        const goingUp = dy > 0;
        const goingRight = dx > 0;
        const direction = {
          x: goingRight ? 1 : -1,
          y: goingUp ? 1 : -1
        };
        
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const newWave: AnimatedWave = {
            slope: perpSlope,
            currentX: goingRight ? 0 : rect.width,
            currentY: goingUp ? 0 : rect.height,
            direction
          };
          
          setAnimatedWaves(prev => [...prev, newWave]);
        }
      }

      const currentTimestamp = Date.now();
      setLastStrokeTimestamp(currentTimestamp);

      return [
        ...prev.slice(0, -1),
        {
          points: newPoints,
          isComplete: true
        }
      ];
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
};

export default Canvas;