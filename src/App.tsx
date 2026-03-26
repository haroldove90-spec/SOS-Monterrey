import { useState } from 'react';
import { SOSButton } from './components/SOSButton';
import { CameraOverlay } from './components/CameraOverlay';
import { useUploadEvidence } from './hooks/useUploadEvidence';
import { Shield, Camera, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [lastEvidence, setLastEvidence] = useState<string | null>(null);
  const { uploadPlate, uploading } = useUploadEvidence();

  const handleSOS = () => {
    console.log('ALERTA ACTIVADA');
  };

  const handleCapture = async () => {
    // Simulación de captura (en Expo usarías cameraRef.current.takePictureAsync)
    const mockUri = 'https://picsum.photos/seed/plate/800/600';
    const userId = 'user_123'; // Esto vendría de auth.currentUser.uid
    
    const url = await uploadPlate(mockUri, userId);
    if (url) {
      setLastEvidence(url);
      setTimeout(() => setShowCamera(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#D4AF37] selection:text-black overflow-hidden">
      {/* Header Premium */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-white/5">
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
          <div className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_10px_#D4AF37]" />
        </div>
      </header>

      <main className="flex flex-col items-center justify-center px-6 pt-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 tracking-tighter">Sistema de Emergencia</h2>
          <p className="text-white/40 max-w-xs mx-auto text-sm uppercase tracking-[0.2em]">
            Protección de élite activa 24/7
          </p>
        </div>

        <SOSButton onActivate={handleSOS} />

        <div className="mt-20 grid grid-cols-2 gap-4 w-full max-w-md">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2"
          >
            <span className="text-[10px] uppercase tracking-widest text-white/30">Estado</span>
            <span className="text-sm font-semibold text-[#D4AF37]">Encriptado</span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2"
          >
            <span className="text-[10px] uppercase tracking-widest text-white/30">Evidencia</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#D4AF37]">
                {lastEvidence ? 'Registrada' : 'Pendiente'}
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
      <nav className="fixed bottom-0 w-full px-8 py-8 flex justify-around items-center bg-gradient-to-t from-black to-transparent">
        <div className="h-1 w-12 rounded-full bg-white/20" />
      </nav>
    </div>
  );
}
