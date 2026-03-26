import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Play, Pause, Headphones, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AudioFragment {
  name: string;
  url: string;
  timestamp: number;
}

export function LiveListening({ userId, alertId }: { userId: string; alertId: string | null }) {
  const [fragments, setFragments] = useState<AudioFragment[]>([]);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!alertId) return;

    const fetchFragments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from('emergency-recordings')
          .list(`${userId}/${alertId}`, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'desc' },
          });

        if (error) throw error;

        if (data) {
          const fragmentUrls = await Promise.all(
            data.map(async (file) => {
              const { data: urlData } = supabase.storage
                .from('emergency-recordings')
                .getPublicUrl(`${userId}/${alertId}/${file.name}`);
              
              return {
                name: file.name,
                url: urlData.publicUrl,
                timestamp: parseInt(file.name.split('.')[0]),
              };
            })
          );
          setFragments(fragmentUrls);
        }
      } catch (err) {
        console.error('Error fetching audio fragments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFragments();

    // Realtime subscription for new fragments (simulated via polling for this demo)
    const interval = setInterval(fetchFragments, 10000);
    return () => clearInterval(interval);
  }, [userId, alertId]);

  const togglePlay = (url: string) => {
    if (playingUrl === url) {
      setPlayingUrl(null);
    } else {
      setPlayingUrl(url);
    }
  };

  if (!alertId) return null;

  return (
    <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[#D4AF37]/20">
          <Headphones className="h-5 w-5 text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Escucha en Vivo</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Caja Negra de Audio Activa</p>
        </div>
        {loading && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="ml-auto"
          >
            <Clock className="h-4 w-4 text-[#D4AF37]/40" />
          </motion.div>
        )}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {fragments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center"
            >
              <AlertCircle className="h-8 w-8 text-white/10 mx-auto mb-2" />
              <p className="text-[10px] text-white/20 uppercase tracking-widest">Esperando primer fragmento...</p>
            </motion.div>
          ) : (
            fragments.map((fragment) => (
              <motion.div
                key={fragment.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-3 rounded-xl border transition-all flex items-center gap-4 ${
                  playingUrl === fragment.url 
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <button 
                  onClick={() => togglePlay(fragment.url)}
                  className={`p-2 rounded-full transition-colors ${
                    playingUrl === fragment.url ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-white'
                  }`}
                >
                  {playingUrl === fragment.url ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                
                <div className="flex-1">
                  <p className="text-[11px] font-mono text-white">
                    Fragmento {new Date(fragment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                      {playingUrl === fragment.url && (
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 20, ease: "linear" }}
                          className="h-full bg-[#D4AF37]"
                        />
                      )}
                    </div>
                    <span className="text-[9px] text-white/30 font-mono">20s</span>
                  </div>
                </div>

                {playingUrl === fragment.url && (
                  <audio 
                    src={fragment.url} 
                    autoPlay 
                    onEnded={() => setPlayingUrl(null)}
                    className="hidden"
                  />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-white/30 uppercase tracking-widest">Estado del Servidor</span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[#D4AF37] font-bold uppercase">Sincronizado</span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
