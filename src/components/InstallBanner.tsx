import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-6 right-6 z-50 p-4 rounded-2xl bg-[#D4AF37] text-black shadow-2xl flex items-center gap-4"
        >
          <div className="p-2 bg-black/10 rounded-xl">
            <Smartphone className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">Instalar App</h4>
            <p className="text-[10px] opacity-70 leading-tight">Añade S.O.S. Monterrey a tu pantalla de inicio para acceso rápido.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleInstall}
              className="px-3 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg"
            >
              Instalar
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-2 text-black/40 hover:text-black transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
