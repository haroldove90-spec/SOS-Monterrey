import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Delete } from 'lucide-react';

interface PinEntryProps {
  onSuccess: (type: 'real' | 'duress') => void;
}

export const PinEntry: React.FC<PinEntryProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const REAL_PIN = '1234'; // En producción esto vendría de SecureStore
  const DURESS_PIN = '9999';

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === REAL_PIN) {
            onSuccess('real');
          } else if (newPin === DURESS_PIN) {
            onSuccess('duress');
          } else {
            setPin(''); // PIN Incorrecto
          }
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 flex flex-col items-center"
      >
        <Shield className="h-12 w-12 text-[#D4AF37]/40 mb-6" />
        <h2 className="text-white/60 text-xs uppercase tracking-[0.4em] font-sans">
          Ingrese su Código de Acceso
        </h2>
      </motion.div>

      {/* Indicadores de PIN */}
      <div className="flex gap-6 mb-20">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i}
            className={`w-3 h-3 rounded-full border border-[#D4AF37]/30 transition-all duration-200 ${
              pin.length > i ? 'bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]' : ''
            }`}
          />
        ))}
      </div>

      {/* Teclado Numérico */}
      <div className="grid grid-cols-3 gap-x-12 gap-y-8 max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, idx) => {
          if (key === '') return <div key={idx} />;
          if (key === 'del') {
            return (
              <button 
                key={idx}
                onClick={handleDelete}
                className="w-16 h-16 flex items-center justify-center text-white/20 hover:text-white transition-colors"
              >
                <Delete className="h-6 w-6" />
              </button>
            );
          }
          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNumberPress(key)}
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-light text-[#D4AF37]/80 hover:text-[#D4AF37] hover:bg-white/5 transition-all"
            >
              {key}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-20">
        <p className="text-[10px] text-white/10 uppercase tracking-widest">
          Encriptación de Grado Militar Activa
        </p>
      </div>
    </div>
  );
};
