import Canvas from '@/components/canvas/Canvas';
import Hero from '@/components/hero/Hero';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchEvent = (e : any) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const touch = new TouchEvent(e.type, {
      bubbles: true,
      cancelable: true,
      view: window,
      touches: e.touches,
      targetTouches: e.targetTouches,
      changedTouches: e.changedTouches
    });

    canvas.dispatchEvent(touch);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    if (!isMobile) {
      e.preventDefault();

      navigator.clipboard.writeText('narwhster@gmail.com').then(() => {
        toast({
          description: 'Email copied!',
          duration: 2000,
        });
      }).catch((err) => {
        console.error('Failed to copy email:', err);
      });
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">      
      <nav className="absolute w-full flex items-center justify-around py-4 z-20">
        <div className="bg-background p-3 rounded-full flex gap-4 text-primary text-lg md:text-xl">
          <a href="https://blog.narwhster.com/" className="hover:scale-105 duration-200 transition-all">Blog</a>
          <a href="https://blog.narwhster.com/search?tags=project" className="hover:scale-105 duration-200 transition-all">Projects</a>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href="mailto:narwhster@gmail.com" 
                  onClick={handleContactClick}
                  className="hover:scale-105 duration-200 transition-all cursor-pointer"
                >
                  Contact
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to copy email!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-4 p-2 rounded-full">
          <a href="https://github.com/narwhster" className="bg-accent-dark hover:bg-accent hover:scale-105 p-2 rounded-full duration-200 transition-all">
            <img src="./github.svg" alt="Github" className="w-6 h-6 md:w-7 md:h-7" />
          </a>
          <a href="https://x.com/narwhster" className="bg-accent-dark hover:bg-accent hover:scale-105 p-2 rounded-full duration-200 transition-all">
            <img src="./twitter.svg" alt="Twitter" className="w-6 h-6 md:w-7 md:h-7" />
          </a>
          <a href="https://www.youtube.com/@narwhster" className="bg-accent-dark hover:bg-accent hover:scale-105 p-2 rounded-full duration-200 transition-all">
            <img src="./youtube.svg" alt="Youtube" className="w-6 h-6 md:w-7 md:h-7" />
          </a>
        </div>
      </nav>

      <main className="flex-1 w-full overflow-hidden relative">
        <div className="absolute inset-0">
          <Canvas />
        </div>
        <div 
          className="relative h-full flex items-center p-24 justify-center pointer-events-none"
          onPointerDown={handleTouchEvent}
          onPointerMove={handleTouchEvent}
          onPointerUp={handleTouchEvent}
        >
          <div>
            <div className="w-full px-4 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-14">
              <div className="md:order-2 pointer-events-auto hover:scale-105 duration-200 transition-all">
                <Hero />
              </div>
              <div className="flex flex-col gap-4 md:order-1">
                <div className="text-center">
                  <motion.h1 className="text-3xl md:text-6xl font-bold text-primary"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 1 }}
                  >
                    Narwhster
                  </motion.h1>
                  <motion.p className="text-lg md:text-xl text-primary"
                    initial={{ opacity: 0}}
                    animate={{ opacity: 1}}
                    transition={{ delay: 2.5, duration: 1 }}
                  >
                    Making the world my canvas
                  </motion.p>
                </div>
                <div className="flex flex-col items-center justify-center pointer-events-auto gap-3">
                  <motion.a href="https://blog.narwhster.com/"
                    initial={{ opacity: 0}}
                    animate={{ opacity: 1}}
                    transition={{ delay: 2.5, duration: 1 }}
                  >
                    {/* secondary */}
                    <Button variant="secondary">
                      My Blog
                    </Button>
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

export default App