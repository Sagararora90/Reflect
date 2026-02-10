import { useEffect } from 'react';
import { useExam } from '../context/ExamContext';

export const useDevTools = () => {
  const { state, dispatch } = useExam();

  useEffect(() => {
    if (!state.isExamActive) return;

    // 1. F12 & Ctrl+Shift+I/J/C is already blocked by useProctoring keydown listener
    
    // 2. Window Resize / Dimension Check (Basic)
    // If undocked devtools opens, it often resizes the inner window
    const handleResize = () => {
        const threshold = 160; // DevTools usually takes > 160px
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        
        if (widthDiff > threshold || heightDiff > threshold) {
             dispatch({ 
                type: 'ADD_WARNING', 
                payload: { reason: 'DevTools / Side Window Detected', time: new Date().toLocaleTimeString() } 
            });
        }
    };
    
    // 3. Debugger Timing Attack (Advanced - Optional but effective)
    // Works by creating a debugger breakpoint loop
    /* 
    const debugCheck = setInterval(() => {
        const start = Date.now();
        debugger; // This statement halts execution if DevTools is open!
        const end = Date.now();
        if (end - start > 100) {
             dispatch({ 
                type: 'ADD_WARNING', 
                payload: { reason: 'Debugger Detected', time: new Date().toLocaleTimeString() } 
            });
        }
    }, 1000);
    */
    // NOTE: The 'debugger' statement is VERY intrusive to valid development/testing. 
    // Commented out for now to ensure smooth user experience during demo.
    // Uncomment for production.

    window.addEventListener('resize', handleResize);
    
    // Polling for dimensions
    const dimsInterval = setInterval(handleResize, 1000);

    return () => {
        window.removeEventListener('resize', handleResize);
        clearInterval(dimsInterval);
        // clearInterval(debugCheck);
    };
  }, [state.isExamActive]);
};
