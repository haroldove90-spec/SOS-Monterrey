import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useAudioEvidence(userId: string, alertId: string | null, isActive: boolean) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    if (!alertId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/m4a' });
        await uploadFragment(audioBlob);
        chunksRef.current = [];
        
        // Restart recording for next fragment if still active
        if (isActive) {
          startRecording();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop after 20 seconds to trigger upload and restart
      intervalRef.current = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 20000);

    } catch (err) {
      console.error('Error starting audio recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    setIsRecording(false);
  };

  const uploadFragment = async (blob: Blob) => {
    if (!alertId) return;

    const timestamp = new Date().getTime();
    const fileName = `${userId}/${alertId}/${timestamp}.m4a`;

    try {
      const { error } = await supabase.storage
        .from('emergency-recordings')
        .upload(fileName, blob, {
          contentType: 'audio/m4a',
          cacheControl: '3600',
        });

      if (error) throw error;
      console.log('Audio fragment uploaded:', fileName);
    } catch (err) {
      console.error('Error uploading audio fragment:', err);
      // Fallback: Save to local storage (mocked for web)
      saveLocally(blob, fileName);
    }
  };

  const saveLocally = (blob: Blob, fileName: string) => {
    console.log('Saving audio fragment locally (fallback):', fileName);
    // In a real Expo app, we'd use FileSystem.writeAsStringAsync
    // For web preview, we'll just log it.
  };

  useEffect(() => {
    if (isActive && alertId) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => stopRecording();
  }, [isActive, alertId]);

  return { isRecording };
}
