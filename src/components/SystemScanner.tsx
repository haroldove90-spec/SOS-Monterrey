import { useState, useEffect } from 'react';
import { Shield, Cpu, Wifi, MapPin, Camera, Mic, Bell, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SystemScanner({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    { icon: <Cpu className="h-5 w-5" />, label: "Iniciando núcleo de seguridad..." },
    { icon: <Wifi className="h-5 w-5" />, label: "Estableciendo conexión encriptada..." },
    { icon: <MapPin className="h-5 w-5" />, label: "Sincronizando satélites GPS..." },
    { icon: <Camera className="h-5 w-5" />, label: "Calibrando sensores ópticos..." },
    { icon: <Mic className="h-5 w-5" />, label: "Verificando caja negra de audio..." },
    { icon: <Bell className="h-5 w-5" />, label: "Activando protocolos de alerta..." },
    { icon: <Shield className="h-5 w-5" />, label: "Sistema S.O.S. Monterrey listo." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev === steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-8"
        >
          <div className="relative mb-12">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[#D4AF37]/20 blur-3xl rounded-full"
            />
            <Shield className="h-24 w-24 text-[#D4AF37] relative z-10" />
          </div>

          <div className="w-full max-w-xs space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold uppercase tracking-[0.4em] text-white">Escaneando Sistema</h2>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">Protocolo de Seguridad V4.2</p>
            </div>

            <div className="space-y-4">
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: step >= i ? 1 : 0.1,
                    x: step >= i ? 0 : -10,
                    color: step > i ? "#D4AF37" : step === i ? "#FFFFFF" : "rgba(255,255,255,0.1)"
                  }}
                  className="flex items-center gap-4"
                >
                  <div className={`p-2 rounded-lg ${step > i ? 'bg-[#D4AF37]/10' : step === i ? 'bg-white/10' : 'bg-transparent'}`}>
                    {step > i ? <CheckCircle2 className="h-4 w-4" /> : s.icon}
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wider">{s.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="pt-8">
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  className="h-full bg-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
