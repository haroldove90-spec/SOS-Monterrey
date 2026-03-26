import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useUploadEvidence = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPlate = async (uri: string, userId: string) => {
    setUploading(true);
    setError(null);

    try {
      // En un entorno real de Expo, usaríamos expo-image-manipulator para comprimir
      // Aquí simulamos la compresión y preparamos el archivo
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const timestamp = Date.now();
      const fileName = `${userId}/${timestamp}.jpg`;
      const filePath = `evidence-plates/${fileName}`;

      // 1. Subir a Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('evidence-plates')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (storageError) throw storageError;

      // 2. Obtener Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('evidence-plates')
        .getPublicUrl(fileName);

      // 3. Guardar en la tabla 'alerts'
      const { error: dbError } = await supabase
        .from('alerts')
        .insert([
          { 
            user_id: userId, 
            evidence_url: publicUrl, 
            type: 'PLATE_REGISTRATION',
            created_at: new Date().toISOString() 
          }
        ]);

      if (dbError) throw dbError;

      return publicUrl;
    } catch (err: any) {
      setError(err.message);
      console.error('Error uploading evidence:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadPlate, uploading, error };
};
