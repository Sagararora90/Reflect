import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useExam } from '../context/ExamContext';

export const useFaceDetection = (videoRef) => {
  const { dispatch, state } = useExam();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        console.log("AI Models Loaded");
      } catch (e) {
        console.error("Failed to load AI models:", e);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!modelsLoaded || !state.isExamActive || !videoRef.current) return;

    const detectFaces = async () => {
        if (videoRef.current && videoRef.current.readyState === 4) { // HAVE_ENOUGH_DATA
            const detections = await faceapi.detectAllFaces(
                videoRef.current, 
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks();

            // Analysis
            const faceCount = detections.length;

            if (faceCount === 0) {
                dispatch({ 
                    type: 'ADD_WARNING', 
                    payload: { reason: 'Face Not Detected', time: new Date().toLocaleTimeString() } 
                });
            } else if (faceCount > 1) {
                dispatch({ 
                    type: 'ADD_WARNING', 
                    payload: { reason: 'Multiple Faces Detected', time: new Date().toLocaleTimeString() } 
                });
            } else {
                 // Check Head Pose (Gaze roughly)
                 const face = detections[0];
                 const { pitch, roll, yaw } = face.angle;
                 // Thresholds (degrees)
                 if (Math.abs(yaw) > 30 || Math.abs(pitch) > 30) {
                     dispatch({ 
                        type: 'ADD_WARNING', 
                        payload: { reason: 'Looking Away (Head Movement)', time: new Date().toLocaleTimeString() } 
                    });
                 }
            }
        }
    };

    intervalRef.current = setInterval(detectFaces, 3000); // Check every 3 seconds

    return () => clearInterval(intervalRef.current);
  }, [modelsLoaded, state.isExamActive]);

  return { modelsLoaded };
};
