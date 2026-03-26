import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SafetyTimerProps {
  userId: string;
  onCancelRequest: () => void;
  isActive: boolean;
  onStart: (minutes: number) => void;
}

export const SafetyTimer: React.FC<SafetyTimerProps> = ({ userId, onCancelRequest, isActive, onStart }) => {
  const [selectedMinutes, setSelectedMinutes] = useState(30);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const options = [15, 30, 60, 120];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleStart = async () => {
    const arrivalTime = new Date();
    arrivalTime.setMinutes(arrivalTime.getMinutes() + selectedMinutes);
    
    try {
      const { error } = await supabase
        .from('pending_checkins')
        .insert([
          { 
            user_id: userId, 
            estimated_arrival_time: arrivalTime.toISOString(),
            is_active: true 
          }
        ]);

      if (error) throw error;
      
      setTimeLeft(selectedMinutes * 60);
      onStart(selectedMinutes);
    } catch (err) {
      console.error('Error starting safety timer:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#D4AF37]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Temporizador de Seguridad</h3>
        </div>
        {isActive && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[8px] font-bold text-[#D4AF37] uppercase tracking-tighter">Activo</span>
          </div>
        )}
      </div>

      {!isActive ? (
        <div className="flex flex-col items-center">
          {/* Selector Circular de Tiempo */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-white/5" />
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="90"
                fill="transparent"
                stroke="url(#goldGradient)"
                strokeWidth="8"
                strokeDasharray={565}
                strokeDashoffset={565 - (565 * (selectedMinutes / 120))}
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#F9E29C" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-white tabular-nums">{selectedMinutes}</span>
              <span className="text-[10px] uppercase tracking-widest text-white/40">Minutos</span>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedMinutes(opt)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedMinutes === opt 
                  ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                  : 'bg-white/5 text-white/40 border border-white/10'
                }`}
              >
                {opt}'
              </button>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37] transition-colors"
          >
            Iniciar Trayecto Seguro
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4">
          <div className="text-6xl font-bold text-[#D4AF37] mb-2 tabular-nums tracking-tighter">
            {formatTime(timeLeft)}
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-10">
            Tiempo restante para llegada
          </p>

          <div className="flex gap-4 w-full">
            <button
              onClick={onCancelRequest}
              className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Confirmar Llegada</span>
            </button>
          </div>
          
          {timeLeft < 120 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-3 bg-red-600/20 border border-red-600/40 rounded-xl flex items-center gap-3 w-full"
            >
              <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                SOS Automático en {timeLeft} segundos
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
