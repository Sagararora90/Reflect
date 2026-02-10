import { useEffect, useRef } from 'react';
import { useExam } from '../context/ExamContext';

export const useProctoring = ({ onViolation, captureSnapshot } = {}) => {
  const { state, dispatch } = useExam();
  // We use a ref for the callback to avoid re-binding effects constantly
  const onViolationRef = useRef(onViolation);
  const captureRef = useRef(captureSnapshot);
  
  useEffect(() => {
      onViolationRef.current = onViolation;
      captureRef.current = captureSnapshot;
  }, [onViolation, captureSnapshot]);

  const triggerViolation = async (reason) => {
      let evidence = null;
      if (captureRef.current) {
          try {
              evidence = await captureRef.current();
          } catch (e) { console.error("Snapshot failed during violation", e); }
      }

      if (onViolationRef.current) {
          onViolationRef.current(reason, evidence);
      } else {
          dispatch({ 
            type: 'ADD_WARNING', 
            payload: { 
                reason, 
                time: new Date().toLocaleTimeString(),
                timestamp: new Date(),
                evidence // Attach the captured evidence
            } 
          });
      }
  };

  useEffect(() => {
    if (!state.isExamActive) return;

    const handleFullscreenChange = () => {
      const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      if (!isFS) {
        dispatch({ type: 'SET_FULLSCREEN', payload: false });
        triggerViolation('Exited Fullscreen');
      } else {
        dispatch({ type: 'SET_FULLSCREEN', payload: true });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Tab Switch / Hidden');
      }
    };

    const handleBlur = () => {
        setTimeout(() => {
            if (!document.hasFocus()) {
                triggerViolation('Focus Lost (Window Blur)');
            }
        }, 1000); // 1s buffer for loose focus events
    };

    // Prevent Key Combos
    const handleKeyDown = (e) => {
        const prohibited = ['Alt', 'Tab', 'Meta', 'F12', 'PrintScreen'];
        if (prohibited.includes(e.key) || (e.ctrlKey && ['c', 'v', 'p'].includes(e.key))) {
            e.preventDefault();
            triggerViolation(`Restricted Key: ${e.key}`);
        }
    };

    const handleContextMenu = (e) => e.preventDefault();

    // Track Stream Termination (Fail-safe)
    if (state.streams.webcam) {
        state.streams.webcam.getTracks().forEach(track => {
            track.onended = () => triggerViolation('Webcam Stream Terminated');
        });
    }
    if (state.streams.screen) {
        state.streams.screen.getTracks().forEach(track => {
            track.onended = () => triggerViolation('Screen Sharing Terminated');
        });
    }

    // Attach Listeners
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => 
        document.addEventListener(evt, handleFullscreenChange)
    );
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    // Initial Fullscreen Request removed (handled by UI overlay in Exam.jsx)
    // if (!document.fullscreenElement) {
    //    document.documentElement.requestFullscreen().catch(e => console.log(e));
    // }

    return () => {
        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => 
            document.removeEventListener(evt, handleFullscreenChange)
        );
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [state.isExamActive]);

  return {};
};
