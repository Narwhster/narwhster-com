import { useState } from "react";
import { motion } from "framer-motion";
import Sketch from "./HeroSketch";
import Coloring from "./HeroColoring";

const Hero = () => {
  const [isSpinning, setIsSpinning] = useState(false);

  return (
    <motion.div
      className="relative"
      animate={{ rotateY: isSpinning ? 360 : 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      onPointerDown={() => setIsSpinning(!isSpinning)}
    >
      <div className="z-10">
        <Sketch />
      </div>
      <div className="absolute top-0 -left-8 md:-left-10">
        <Coloring />
      </div>
    </motion.div>
  );
};

export default Hero;
