import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Map, X, AlertCircle } from 'lucide-react';

interface NotificationBannerProps {
  isVisible: boolean;
  userName: string;
  onClose: () => void;
  onViewMap: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ isVisible, userName, onClose, onViewMap }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-6 left-4 right-4 z-[100] max-w-md mx-auto"
        >
          <div className="bg-black/90 backdrop-blur-xl border border-[#D4AF37]/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="p-4 flex gap-4">
              {/* Icono App Dorado */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <Shield className="h-7 w-7 text-black" />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                    Alerta de Rescate
                  </span>
                  <button onClick={onClose} className="text-white/30 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="text-sm font-bold text-white truncate">
                  ¡EMERGENCIA! {userName}
                </h4>
                <p className="text-xs text-white/60 leading-relaxed mt-1">
                  Se ha activado un protocolo SOS. El equipo de respuesta ha sido notificado.
                </p>
              </div>
            </div>

            {/* Botón de Acción Rápida */}
            <button
              onClick={onViewMap}
              className="w-full py-3 bg-[#D4AF37] flex items-center justify-center gap-2 hover:bg-[#C5A02E] transition-colors"
            >
              <Map className="h-4 w-4 text-black" />
              <span className="text-xs font-bold uppercase tracking-widest text-black">
                Ver Mapa de Rescate
              </span>
            </button>
          </div>
          
          {/* Indicador de Prioridad Alta */}
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
            <AlertCircle className="h-2 w-2" />
            HIGH PRIORITY
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
