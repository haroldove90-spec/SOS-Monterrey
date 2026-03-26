import React from 'react';
import { motion } from 'motion/react';
import { Camera, X, Scan } from 'lucide-react';

interface CameraOverlayProps {
  onClose: () => void;
  onCapture: () => void;
  isCapturing?: boolean;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({ onClose, onCapture, isCapturing }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white">
          <X className="h-6 w-6" />
        </button>
        <span className="font-sans text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
          Registro de Placa
        </span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Viewport / Frame */}
      <div className="flex-1 relative flex items-center justify-center px-10">
        {/* Simulación de cámara para web */}
        <div className="w-full aspect-[4/3] bg-zinc-900 rounded-lg overflow-hidden relative border border-white/5">
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-12 w-12 text-white/10" />
          </div>
          
          {/* Marco Dorado Minimalista */}
          <div className="absolute inset-6 border border-[#D4AF37]/40 rounded-sm">
            {/* Esquinas reforzadas */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />
            
            {/* Guía Central */}
            <div className="absolute inset-0 flex items-center justify-center">
               <Scan className="h-8 w-8 text-[#D4AF37]/20" />
            </div>
          </div>
        </div>
        
        <p className="absolute bottom-10 text-center text-[10px] uppercase tracking-widest text-white/40 px-12">
          Alinea la placa dentro del recuadro dorado para un reconocimiento óptimo
        </p>
      </div>

      {/* Controls */}
      <div className="h-40 flex items-center justify-center bg-black">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onCapture}
          disabled={isCapturing}
          className="relative flex items-center justify-center"
        >
          {/* Halo exterior */}
          <div className="absolute w-24 h-24 rounded-full border border-[#D4AF37]/20" />
          
          {/* Botón Shutter */}
          <div className="w-20 h-20 rounded-full bg-black border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            {isCapturing ? (
              <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/5" />
            )}
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};
