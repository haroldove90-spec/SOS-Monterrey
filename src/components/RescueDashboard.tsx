import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Shield, 
  MapPin, 
  Phone, 
  Navigation, 
  Battery, 
  Signal, 
  Clock, 
  Play, 
  Image as ImageIcon,
  AlertCircle,
  ChevronRight,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlertData {
  id: string;
  status: string;
  type: string;
  created_at: string;
  profiles: {
    full_name: string;
    phone_number: string;
  };
  battery_level?: number;
  gps_signal?: boolean;
}

interface LocationPoint {
  latitude: number;
  longitude: number;
  created_at: string;
}

interface Evidence {
  name: string;
  url: string;
  type: 'audio' | 'image';
  created_at: string;
}

export function RescueDashboard() {
  const { alertId, token } = useParams<{ alertId: string; token: string }>();
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  const latestLocation = useMemo(() => locations[0] || null, [locations]);

  useEffect(() => {
    if (!alertId || !token) return;

    const fetchData = async () => {
      try {
        // Fetch alert with profile info
        const { data: alertData, error: alertError } = await supabase
          .from('alerts')
          .select('*, profiles(full_name, phone_number)')
          .eq('id', alertId)
          .eq('security_token', token)
          .single();

        if (alertError || !alertData) {
          setError('Acceso Denegado: Alerta no encontrada o token inválido.');
          setLoading(false);
          return;
        }

        setAlert(alertData);

        // Fetch initial locations
        const { data: locData } = await supabase
          .from('location_tracking')
          .select('latitude, longitude, created_at')
          .eq('alert_id', alertId)
          .order('created_at', { ascending: false });

        if (locData) setLocations(locData);

        // Fetch evidence (mocking for now, in real app we'd list from storage)
        // In a real app, we'd have a table 'evidence_metadata' or list storage
        const { data: audioFiles } = await supabase.storage
          .from('emergency-recordings')
          .list(`${alertData.user_id}/${alertId}`);
        
        if (audioFiles) {
          const audioEvidence: Evidence[] = audioFiles.map(f => ({
            name: f.name,
            url: supabase.storage.from('emergency-recordings').getPublicUrl(`${alertData.user_id}/${alertId}/${f.name}`).data.publicUrl,
            type: 'audio',
            created_at: f.created_at
          }));
          setEvidence(prev => [...prev, ...audioEvidence]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching rescue data:', err);
        setError('Error al cargar los datos de rescate.');
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscriptions
    const locationSubscription = supabase
      .channel(`location_${alertId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'location_tracking',
        filter: `alert_id=eq.${alertId}`
      }, (payload) => {
        setLocations(prev => [payload.new as LocationPoint, ...prev]);
      })
      .subscribe();

    return () => {
      locationSubscription.unsubscribe();
    };
  }, [alertId, token]);

  // Elapsed time counter
  useEffect(() => {
    if (!alert) return;
    
    const interval = setInterval(() => {
      const start = new Date(alert.created_at).getTime();
      const now = new Date().getTime();
      const diff = now - start;
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [alert]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-[#D4AF37] font-bold uppercase tracking-widest text-sm"
        >
          Iniciando Portal de Rescate...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Error de Acceso</h2>
        <p className="text-white/40 text-sm max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D4AF37]/30">
      {/* Pulsing Gold Border */}
      <div className="fixed inset-0 pointer-events-none border-[3px] border-[#D4AF37]/30 z-50">
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute inset-0 border-[3px] border-[#D4AF37] shadow-[inset_0_0_50px_rgba(212,175,55,0.2)]"
        />
      </div>

      {/* Header */}
      <header className="p-6 border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              <Shield className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-[0.2em]">Rescate en Tiempo Real</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Alerta Activa</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Tiempo Transcurrido</p>
            <p className="text-xl font-mono font-bold text-[#D4AF37] tracking-tighter">{elapsedTime}</p>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6 pb-32">
        {/* User Info & Status */}
        <section className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-4">Usuario en Peligro</p>
            <p className="text-lg font-bold text-white truncate">{alert?.profiles.full_name}</p>
            <p className="text-[10px] text-white/40 mt-1">{alert?.profiles.phone_number}</p>
          </div>
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Battery className={`h-4 w-4 ${alert?.battery_level && alert.battery_level < 20 ? 'text-red-500' : 'text-[#D4AF37]'}`} />
                <span className="text-xs font-bold">{alert?.battery_level || 85}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Signal className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">GPS Activo</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/5">
              <p className="text-[9px] text-white/20 uppercase tracking-widest">Última Actualización</p>
              <p className="text-[10px] font-medium mt-1">
                {latestLocation ? new Date(latestLocation.created_at).toLocaleTimeString() : 'Buscando señal...'}
              </p>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="aspect-video rounded-3xl overflow-hidden border border-white/10 relative bg-white/5">
          {latestLocation ? (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${latestLocation.latitude},${latestLocation.longitude}&z=18&output=embed`}
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="p-4 rounded-full border-2 border-dashed border-[#D4AF37]/30"
              >
                <MapPin className="h-8 w-8 text-[#D4AF37]/50" />
              </motion.div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Esperando coordenadas GPS...</p>
            </div>
          )}
          
          {/* Map Overlay Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button 
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${latestLocation?.latitude},${latestLocation?.longitude}`)}
              className="p-4 rounded-2xl bg-[#D4AF37] text-black shadow-xl flex items-center gap-3 font-bold uppercase tracking-widest text-[10px]"
            >
              <Navigation className="h-4 w-4" />
              Trazar Ruta
            </button>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => window.open('tel:911')}
            className="w-full py-6 rounded-3xl bg-red-600 text-white flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(220,38,38,0.3)]"
          >
            <Phone className="h-6 w-6 fill-current" />
            <span className="text-sm font-bold uppercase tracking-[0.2em]">Llamar al 911 Monterrey</span>
          </button>
        </section>

        {/* Evidence Panel */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Panel de Evidencia</h2>
            <span className="text-[10px] text-white/30 uppercase tracking-widest">{evidence.length} Archivos</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {evidence.length > 0 ? (
              evidence.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/5 text-[#D4AF37]">
                      {item.type === 'audio' ? <Volume2 className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                        {item.type === 'audio' ? 'Caja Negra (Audio)' : 'Captura Visual'}
                      </p>
                      <p className="text-[9px] text-white/30 mt-1">
                        {new Date(item.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.open(item.url)}
                    className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:text-[#D4AF37] transition-colors"
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="p-12 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                <Volume2 className="h-8 w-8 text-white/10 mb-4" />
                <p className="text-[10px] text-white/20 uppercase tracking-widest">Sincronizando evidencia en tiempo real...</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent pointer-events-none">
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Conexión Segura LuxGuard</p>
          </div>
          <p className="text-[9px] text-white/20 uppercase tracking-widest">ID: {alertId?.slice(0, 8)}</p>
        </div>
      </footer>
    </div>
  );
}
