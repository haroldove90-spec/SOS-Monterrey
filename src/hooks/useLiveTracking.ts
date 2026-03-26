import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export const useLiveTracking = (userId: string, isEnabled: boolean) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const lastSavedLocation = useRef<Location | null>(null);
  const watchId = useRef<number | null>(null);

  const MIN_DISTANCE = 10; // 10 metros
  const SAVE_INTERVAL = 30000; // 30 segundos

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Radio de la tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const saveLocationToSupabase = async (location: Location) => {
    try {
      const { error } = await supabase
        .from('location_tracking')
        .insert([
          {
            user_id: userId,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: new Date(location.timestamp).toISOString(),
          }
        ]);

      if (error) throw error;
      lastSavedLocation.current = location;
      console.log('Ubicación sincronizada con Supabase');
    } catch (err) {
      console.error('Error saving location:', err);
    }
  };

  useEffect(() => {
    if (!isEnabled || !userId) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      return;
    }

    // En Expo usarías Location.watchPositionAsync
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        };

        setCurrentLocation(newLocation);

        // Lógica de optimización: Guardar si pasó el tiempo o se movió suficiente
        const now = Date.now();
        const lastSaved = lastSavedLocation.current;

        if (!lastSaved) {
          saveLocationToSupabase(newLocation);
        } else {
          const distance = calculateDistance(
            lastSaved.latitude,
            lastSaved.longitude,
            newLocation.latitude,
            newLocation.longitude
          );
          const timeElapsed = now - lastSaved.timestamp;

          if (distance >= MIN_DISTANCE || timeElapsed >= SAVE_INTERVAL) {
            saveLocationToSupabase(newLocation);
          }
        }
      },
      (error) => console.error('Geolocation error:', error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isEnabled, userId]);

  return { currentLocation };
};
