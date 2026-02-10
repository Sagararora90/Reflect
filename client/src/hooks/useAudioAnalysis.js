import { useEffect, useRef } from 'react';
import { useExam } from '../context/ExamContext';

export const useAudioAnalysis = (stream, captureSnapshot) => {
  const { state, dispatch } = useExam();
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const processingRef = useRef(false);
  
  // Keep captureSnapshot in a ref if needed, or just use closure
  // But since startAssessment defines captureSnapshot inside component, we pass it in.

  useEffect(() => {
    if (!state.isExamActive || !stream || !stream.getAudioTracks().length) return;

    const initAudio = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);
            
            processingRef.current = true;
            analyze();
        } catch (e) {
            console.error("Audio Context Error:", e);
        }
    };

    const analyze = () => {
        if (!processingRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const volume = dataArray.reduce((src, a) => src + a, 0) / dataArray.length;
        
        // Threshold (adjustable) - 20 is typically background noise, 50+ is talking
        if (volume > 45) {
             const evidence = captureSnapshot ? captureSnapshot() : null;
             dispatch({ 
                type: 'ADD_WARNING', 
                payload: { reason: 'Significant Noise / Talking Detected', time: new Date().toLocaleTimeString(), evidence } 
            });
            // Cooldown to avoid spamming
            processingRef.current = false;
            setTimeout(() => { processingRef.current = true; analyze(); }, 2000); 
            return;
        }

        requestAnimationFrame(analyze);
    };

    initAudio();

    return () => {
        processingRef.current = false;
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
             audioContextRef.current.close().catch(() => {});
        }
    };
  }, [state.isExamActive, stream]); // captureSnapshot is stable usually
};
