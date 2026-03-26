import React from 'react';
import { Settings, Wifi, Battery, Bluetooth, Bell, Lock, Globe, Info } from 'lucide-react';

export const DecoyInterface: React.FC = () => {
  const settings = [
    { icon: Wifi, label: 'Red e Internet', sub: 'Wi-Fi, Red móvil, Hotspot' },
    { icon: Bluetooth, label: 'Dispositivos conectados', sub: 'Bluetooth, Emparejamiento' },
    { icon: Bell, label: 'Notificaciones', sub: 'Historial, Conversaciones' },
    { icon: Battery, label: 'Batería', sub: '84% - Uso normal' },
    { icon: Lock, label: 'Seguridad y Privacidad', sub: 'Bloqueo de pantalla, Biometría' },
    { icon: Globe, label: 'Sistema', sub: 'Idiomas, Gestos, Hora' },
    { icon: Info, label: 'Acerca del dispositivo', sub: 'Versión de Android 14' },
  ];

  return (
    <div className="fixed inset-0 z-[300] bg-[#121212] text-white font-sans flex flex-col">
      {/* Header Aburrido */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4 border-b border-white/5">
        <Settings className="h-6 w-6 text-white/40" />
        <h1 className="text-xl font-medium">Ajustes</h1>
      </div>

      {/* Lista de Ajustes */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
              <span className="text-[#D4AF37] font-bold">H</span>
            </div>
            <div>
              <p className="text-sm font-medium">Harold Ove</p>
              <p className="text-xs text-white/40">Cuenta de Google, Servicios</p>
            </div>
          </div>

          {settings.map((item, idx) => (
            <div key={idx} className="flex items-center gap-5 py-5 border-b border-white/5 last:border-0">
              <item.icon className="h-5 w-5 text-white/40" />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[11px] text-white/40">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de Navegación Android Mockup */}
      <div className="h-16 flex items-center justify-around px-12 opacity-40">
        <div className="w-4 h-4 border-2 border-white rounded-sm" />
        <div className="w-4 h-4 border-2 border-white rounded-full" />
        <div className="w-0 h-0 border-y-[8px] border-y-transparent border-r-[12px] border-r-white" />
      </div>
    </div>
  );
};
