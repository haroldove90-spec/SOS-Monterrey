import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { MapPin, Navigation } from 'lucide-react';

interface LiveMapProps {
  userId: string;
  userLocation: { latitude: number; longitude: number } | null;
}

export const LiveMap: React.FC<LiveMapProps> = ({ userId, userLocation }) => {
  const [contactsLocations, setContactsLocations] = useState<any[]>([]);

  useEffect(() => {
    // Suscripción Realtime para ver a otros contactos (simulado)
    const channel = supabase
      .channel('public:location_tracking')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'location_tracking' },
        (payload) => {
          if (payload.new.user_id !== userId) {
            setContactsLocations((prev) => {
              const filtered = prev.filter((loc) => loc.user_id !== payload.new.user_id);
              return [...filtered, payload.new];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="relative w-full h-64 rounded-3xl bg-[#111] border border-white/10 overflow-hidden shadow-2xl">
      {/* Simulación de Mapa Dark Mode */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        {/* Líneas de cuadrícula decorativas para simular mapa */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#D4AF37 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
        
        {/* Marcador del Usuario Principal */}
        {userLocation && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Efecto de Pulso Radiante */}
              <motion.div
                className="absolute -inset-4 rounded-full bg-[#D4AF37]/20"
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute -inset-8 rounded-full bg-[#D4AF37]/10"
                animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
              
              {/* Punto Dorado */}
              <div className="relative z-10 h-4 w-4 rounded-full bg-[#D4AF37] border-2 border-black shadow-[0_0_15px_#D4AF37]" />
            </div>
          </div>
        )}

        {/* Marcadores de Contactos (Simulados en posiciones aleatorias) */}
        {contactsLocations.map((contact, idx) => (
          <motion.div
            key={contact.id || idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute h-2 w-2 rounded-full bg-white/40"
            style={{ 
              top: `${40 + (idx * 10)}%`, 
              left: `${30 + (idx * 15)}%` 
            }}
          />
        ))}
      </div>

      {/* UI Overlay del Mapa */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
        <Navigation className="h-3 w-3 text-[#D4AF37]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Live Tracking</span>
      </div>

      <div className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
        <MapPin className="h-4 w-4 text-[#D4AF37]" />
      </div>
    </div>
  );
};
