import { useState, useEffect } from 'react';
import { SOSButton } from './components/SOSButton';
import { CameraOverlay } from './components/CameraOverlay';
import { LiveMap } from './components/LiveMap';
import { NotificationBanner } from './components/NotificationBanner';
import { PinEntry } from './components/PinEntry';
import { DecoyInterface } from './components/DecoyInterface';
import { useUploadEvidence } from './hooks/useUploadEvidence';
import { useLiveTracking } from './hooks/useLiveTracking';
import { Shield, Camera, CheckCircle2, Map as MapIcon, Power } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from './lib/supabase';

type AuthState = 'locked' | 'authenticated' | 'decoy';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('locked');
  const [showCamera, setShowCamera] = useState(false);
  const [isTrackingActive, setIsTrackingActive] = useState(true);
  const [lastEvidence, setLastEvidence] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  
  const userId = 'user_123'; // Mock user ID
  const { uploadPlate, uploading } = useUploadEvidence();
  const { currentLocation } = useLiveTracking(userId, isTrackingActive);

  const handleAuthSuccess = (type: 'real' | 'duress') => {
    if (type === 'real') {
      setAuthState('authenticated');
    } else {
      setAuthState('decoy');
      triggerSilentSOS();
    }
  };

  const triggerSilentSOS = async () => {
    console.log('SILENT SOS ACTIVATED');
    try {
      // 1. Disparar alerta silenciosa en Supabase
      await supabase.from('alerts').insert([
        { 
          user_id: userId, 
          type: 'silent',
          created_at: new Date().toISOString()
        }
      ]);

      // 2. Simular grabación de audio ambiente (en Expo usarías expo-av)
      console.log('Iniciando grabación de audio ambiente en segundo plano...');
      // Subiríamos fragmentos de 30s al bucket 'evidence-audio'
    } catch (err) {
      console.error('Error triggering silent SOS:', err);
    }
  };

  // Suscripción Realtime para alertas
  useEffect(() => {
    const channel = supabase
      .channel('alerts-monitor')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          if (payload.new.user_id !== userId) {
            setShowNotification(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSOS = () => {
    console.log('ALERTA ACTIVADA');
    setTimeout(() => setShowNotification(true), 500);
  };

  const handleCapture = async () => {
    const mockUri = 'https://picsum.photos/seed/plate/800/600';
    const url = await uploadPlate(mockUri, userId);
    if (url) {
      setLastEvidence(url);
      setTimeout(() => setShowCamera(false), 1000);
    }
  };

  if (authState === 'locked') {
    return <PinEntry onSuccess={handleAuthSuccess} />;
  }

  if (authState === 'decoy') {
    return <DecoyInterface />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#D4AF37] selection:text-black overflow-hidden pb-24">
      <NotificationBanner 
        isVisible={showNotification}
        userName="Harold Ove"
        onClose={() => setShowNotification(false)}
        onViewMap={() => setShowNotification(false)}
      />

      {/* Header Premium */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#D4AF37]" />
          <h1 className="font-serif text-2xl tracking-tight italic">LuxGuard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowCamera(true)}
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 transition-colors"
          >
            <Camera className="h-5 w-5 text-[#D4AF37]" />
          </button>
          <button 
            onClick={() => setIsTrackingActive(!isTrackingActive)}
            className={`p-2 rounded-full border transition-all ${isTrackingActive ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : 'bg-white/5 border-white/10'}`}
          >
            <Power className={`h-5 w-5 ${isTrackingActive ? 'text-[#D4AF37]' : 'text-white/20'}`} />
          </button>
        </div>
      </header>

      <main className="flex flex-col items-center px-6 pt-8">
        {/* Mapa de Seguimiento */}
        <div className="w-full max-w-md mb-12">
          <LiveMap userId={userId} userLocation={currentLocation} />
          <div className="mt-4 flex justify-between items-center px-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-white/30">Coordenadas</span>
              <span className="text-[11px] font-mono text-[#D4AF37]">
                {currentLocation ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` : 'Buscando señal...'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-white/30">Precisión</span>
              <span className="text-[11px] font-mono text-[#D4AF37]">Alta</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2 tracking-tighter">SOS Monterrey</h2>
          <p className="text-white/40 max-w-xs mx-auto text-[10px] uppercase tracking-[0.3em]">
            Monitoreo en tiempo real activo
          </p>
        </div>

        <SOSButton onActivate={handleSOS} userId={userId} />

        <div className="mt-16 grid grid-cols-2 gap-4 w-full max-w-md">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2"
          >
            <span className="text-[10px] uppercase tracking-widest text-white/30">Estado</span>
            <span className="text-sm font-semibold text-[#D4AF37]">Protegido</span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2"
          >
            <span className="text-[10px] uppercase tracking-widest text-white/30">Evidencia</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#D4AF37]">
                {lastEvidence ? 'Registrada' : 'Ninguna'}
              </span>
              {lastEvidence && <CheckCircle2 className="h-3 w-3 text-[#D4AF37]" />}
            </div>
          </motion.div>
        </div>

        {lastEvidence && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center gap-4 w-full max-w-md"
          >
            <div className="w-12 h-12 rounded-lg bg-black border border-[#D4AF37]/30 overflow-hidden">
              <img src={lastEvidence} alt="Evidence" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Placa Registrada</p>
              <p className="text-[10px] text-white/40">Sincronizado con Supabase</p>
            </div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showCamera && (
          <CameraOverlay 
            onClose={() => setShowCamera(false)} 
            onCapture={handleCapture}
            isCapturing={uploading}
          />
        )}
      </AnimatePresence>

      {/* Footer / Navigation Mockup */}
      <nav className="fixed bottom-0 w-full px-8 py-6 flex justify-around items-center bg-black/80 backdrop-blur-xl border-t border-white/5 z-40">
        <div className="flex flex-col items-center gap-1">
          <Shield className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-[8px] uppercase tracking-widest text-[#D4AF37]">Seguridad</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-30">
          <MapIcon className="h-5 w-5 text-white" />
          <span className="text-[8px] uppercase tracking-widest text-white">Mapa</span>
        </div>
        <div className="h-1 w-12 rounded-full bg-white/10 absolute top-2" />
      </nav>
    </div>
  );
}
