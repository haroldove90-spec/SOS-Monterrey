import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface SOSButtonProps {
  onActivate: () => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onActivate }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const LONG_PRESS_DURATION = 2000; // 2 segundos

  const startPress = () => {
    setIsPressing(true);
    setProgress(0);
    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= LONG_PRESS_DURATION) {
        handleActivate();
      }
    }, 16);
  };

  const endPress = () => {
    setIsPressing(false);
    setProgress(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleActivate = () => {
    onActivate();
    endPress();
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Halos de animación (Pulsación) */}
      <AnimatePresence>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-[#D4AF37]/30"
            initial={{ width: 160, height: 160, opacity: 0.5 }}
            animate={{
              width: [160, 300],
              height: [160, 300],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Botón Principal */}
      <motion.button
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 flex h-40 w-40 flex-col items-center justify-center rounded-full border-4 border-[#D4AF37] bg-black shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-shadow duration-300 hover:shadow-[0_0_50px_rgba(212,175,55,0.5)]"
      >
        {/* Progreso Circular */}
        <svg className="absolute inset-0 h-full w-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="76"
            fill="transparent"
            stroke="#D4AF37"
            strokeWidth="4"
            strokeDasharray={477}
            strokeDashoffset={477 - (477 * progress) / 100}
            className="transition-all duration-100 ease-linear"
            style={{ opacity: isPressing ? 1 : 0 }}
          />
        </svg>

        <AlertTriangle className="mb-2 h-12 w-12 text-[#D4AF37]" />
        <span className="font-sans text-xl font-bold tracking-widest text-[#D4AF37]">
          SOS
        </span>
        
        {isPressing && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-12 whitespace-nowrap font-sans text-xs uppercase tracking-widest text-[#D4AF37]/80"
          >
            Mantén para activar
          </motion.span>
        )}
      </motion.button>
    </div>
  );
};
