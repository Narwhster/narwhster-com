import { AnimatePresence, motion } from "framer-motion";
const Tooltip = ({ message, isVisible, x, y }: { message: string; isVisible: boolean; x: number; y: number }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{ 
            position: 'fixed',
            left: x,
            top: y,
            transform: 'translate(-50%, 100%)',
            zIndex: 50,
          }}
          className="bg-background border border-secondary text-secondary px-3 py-1.5 rounded-md shadow-lg text-sm whitespace-nowrap"
        >
          {message}
          <div 
            className="absolute -top-1 left-1/2 w-2 h-2 bg-background border-t border-l border-secondary -translate-x-1/2 rotate-45"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Tooltip;