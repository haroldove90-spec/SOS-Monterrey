import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Camera, Mic, Bell, Settings, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PermissionState {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'granted' | 'denied' | 'prompt';
}

export function SecuritySetup({ onComplete }: { onComplete: () => void }) {
  const [permissions, setPermissions] = useState<PermissionState[]>([
    { 
      id: 'location', 
      label: 'Localización', 
      description: 'Seguimiento GPS en tiempo real para rescate inmediato.',
      icon: <MapPin className="h-5 w-5" />, 
      status: 'prompt' 
    },
    { 
      id: 'camera', 
      label: 'Cámara', 
      description: 'Registro de evidencia visual y placas de vehículos.',
      icon: <Camera className="h-5 w-5" />, 
      status: 'prompt' 
    },
    { 
      id: 'microphone', 
      label: 'Micrófono', 
      description: 'Grabación de audio discreta (Caja Negra).',
      icon: <Mic className="h-5 w-5" />, 
      status: 'prompt' 
    },
    { 
      id: 'notifications', 
      label: 'Notificaciones', 
      description: 'Alertas críticas y confirmaciones de seguridad.',
      icon: <Bell className="h-5 w-5" />, 
      status: 'prompt' 
    }
  ]);

  const checkPermissions = async () => {
    // Mocking permission checks for web environment
    // In a real app, we'd use navigator.permissions.query
    const updated = [...permissions];
    
    // Simulating some granted, some prompt
    setPermissions(updated);
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const requestPermission = async (id: string) => {
    try {
      let status: 'granted' | 'denied' = 'denied';
      
      if (id === 'location') {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        if (pos) status = 'granted';
      } else if (id === 'camera' || id === 'microphone') {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: id === 'camera', 
          audio: id === 'microphone' 
        });
        if (stream) {
          status = 'granted';
          stream.getTracks().forEach(t => t.stop());
        }
      } else if (id === 'notifications') {
        const res = await Notification.requestPermission();
        if (res === 'granted') status = 'granted';
      }

      setPermissions(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (err) {
      console.error(`Error requesting ${id} permission:`, err);
      setPermissions(prev => prev.map(p => p.id === id ? { ...p, status: 'denied' } : p));
    }
  };

  const allGranted = permissions.every(p => p.status === 'granted');

  return (
    <div className="fixed inset-0 z-[90] bg-[#050505] flex flex-col p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-12">
        <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
          <Shield className="h-6 w-6 text-[#D4AF37]" />
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-white">Configuración</h2>
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Seguridad de Hardware</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {permissions.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl border transition-all ${
              p.status === 'granted' 
                ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20' 
                : p.status === 'denied' 
                  ? 'bg-red-500/5 border-red-500/20' 
                  : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  p.status === 'granted' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/10 text-white/40'
                }`}>
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">{p.label}</h3>
                  <p className="text-[10px] text-white/40 leading-relaxed max-w-[200px]">{p.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => requestPermission(p.id)}
                disabled={p.status === 'granted'}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  p.status === 'granted' ? 'bg-[#D4AF37]' : 'bg-white/10'
                }`}
              >
                <motion.div
                  animate={{ x: p.status === 'granted' ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
                />
              </button>
            </div>

            {p.status === 'denied' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-4 border-t border-red-500/20 mt-4"
              >
                <div className="flex items-start gap-3 text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed">
                    Este permiso es vital para tu seguridad en Monterrey. Sin él, no podremos asistirte correctamente en caso de emergencia.
                  </p>
                </div>
                <button 
                  onClick={() => window.open('app-settings:')}
                  className="mt-3 text-[10px] font-bold uppercase tracking-widest text-red-400 underline underline-offset-4"
                >
                  Abrir Ajustes del Sistema
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-white/5">
        <button
          onClick={onComplete}
          className={`w-full py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3 ${
            allGranted 
              ? 'bg-[#D4AF37] text-black shadow-[0_0_30px_rgba(212,175,55,0.3)]' 
              : 'bg-white/5 text-white/20 border border-white/10'
          }`}
        >
          {allGranted ? 'Finalizar Configuración' : 'Completar Permisos'}
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-center text-[9px] text-white/20 uppercase tracking-widest mt-6">
          Tus datos están encriptados y protegidos por S.O.S. Monterrey
        </p>
      </div>
    </div>
  );
}
