/**
 * Behavioral Analysis Engine
 * Analyzes student behavior patterns during exam:
 * - Typing speed and pauses
 * - Sudden large pastes
 * - Time taken vs problem complexity
 * - Sudden jumps from wrong to perfect solution
 */

/**
 * Analyze typing patterns from keystroke data
 */
export function analyzeTypingPattern(keystrokeData) {
  if (!keystrokeData || keystrokeData.length === 0) {
    return {
      typingPattern: 50, // Neutral score
      averageSpeed: 0,
      pauseAnalysis: 50,
      suspiciousPauses: 0
    };
  }
  
  const timestamps = keystrokeData.map(k => k.timestamp);
  const intervals = [];
  
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }
  
  // Calculate average typing speed (keystrokes per minute)
  const totalTime = timestamps[timestamps.length - 1] - timestamps[0];
  const averageSpeed = totalTime > 0 ? (keystrokeData.length / totalTime) * 60000 : 0;
  
  // Detect suspicious pauses (> 30 seconds)
  const suspiciousPauses = intervals.filter(interval => interval > 30000).length;
  
  // Normal typing speed: 40-60 WPM (roughly 200-300 keystrokes per minute)
  // Very slow (< 20) or very fast (> 100) might indicate issues
  let typingPattern = 50; // Neutral
  
  if (averageSpeed < 100) {
    typingPattern = 30; // Suspiciously slow
  } else if (averageSpeed > 500) {
    typingPattern = 30; // Suspiciously fast (possible paste)
  } else if (averageSpeed >= 200 && averageSpeed <= 300) {
    typingPattern = 80; // Normal range
  }
  
  // Pause analysis
  const pauseScore = Math.max(0, 100 - (suspiciousPauses * 10));
  
  return {
    typingPattern,
    averageSpeed,
    pauseAnalysis: pauseScore,
    suspiciousPauses
  };
}

/**
 * Detect sudden large code pastes
 */
export function detectLargePastes(codeHistory) {
  if (!codeHistory || codeHistory.length < 2) {
    return {
      largePastes: 0,
      maxPasteSize: 0
    };
  }
  
  let largePastes = 0;
  let maxPasteSize = 0;
  
  for (let i = 1; i < codeHistory.length; i++) {
    const prevCode = codeHistory[i - 1].code || '';
    const currCode = codeHistory[i].code || '';
    
    const diff = currCode.length - prevCode.length;
    
    // If code increased by more than 200 characters in one step, likely a paste
    if (diff > 200) {
      largePastes++;
      maxPasteSize = Math.max(maxPasteSize, diff);
    }
  }
  
  return {
    largePastes,
    maxPasteSize
  };
}

/**
 * Analyze time taken vs problem complexity
 */
export function analyzeTiming(questionComplexity, timeTaken, averageTimeForComplexity) {
  // questionComplexity: 1-10 scale
  // timeTaken: seconds
  // averageTimeForComplexity: expected seconds for this complexity
  
  if (!averageTimeForComplexity || averageTimeForComplexity === 0) {
    return {
      timingAnalysis: 50,
      deviation: 0
    };
  }
  
  const deviation = Math.abs(timeTaken - averageTimeForComplexity) / averageTimeForComplexity;
  
  // If student solved it much faster than expected (deviation > 0.5), suspicious
  // If much slower, might indicate struggling or external help
  let timingAnalysis = 50;
  
  if (deviation > 0.7 && timeTaken < averageTimeForComplexity) {
    timingAnalysis = 20; // Suspiciously fast
  } else if (deviation > 0.5 && timeTaken > averageTimeForComplexity * 2) {
    timingAnalysis = 30; // Suspiciously slow
  } else if (deviation <= 0.3) {
    timingAnalysis = 80; // Normal timing
  }
  
  return {
    timingAnalysis,
    deviation
  };
}

/**
 * Detect sudden solution improvements
 */
export function detectSolutionJumps(codeHistory, testResults) {
  if (!codeHistory || codeHistory.length < 2 || !testResults) {
    return {
      solutionJumps: 0,
      jumpScore: 50
    };
  }
  
  let solutionJumps = 0;
  
  for (let i = 1; i < codeHistory.length; i++) {
    const prevResults = testResults[i - 1] || { passed: 0, total: 1 };
    const currResults = testResults[i] || { passed: 0, total: 1 };
    
    const prevPassRate = prevResults.passed / prevResults.total;
    const currPassRate = currResults.passed / currResults.total;
    
    // If pass rate jumped from < 30% to > 90% in one step, suspicious
    if (prevPassRate < 0.3 && currPassRate > 0.9) {
      solutionJumps++;
    }
  }
  
  const jumpScore = Math.max(0, 100 - (solutionJumps * 30));
  
  return {
    solutionJumps,
    jumpScore
  };
}

/**
 * Calculate overall behavioral risk score
 */
export function calculateBehavioralRisk(analysisData) {
  const {
    typingPattern = 50,
    pauseAnalysis = 50,
    timingAnalysis = 50,
    largePastes = 0,
    solutionJumps = 0
  } = analysisData;
  
  // Weighted average
  const weights = {
    typing: 0.25,
    pauses: 0.25,
    timing: 0.25,
    pastes: 0.15,
    jumps: 0.10
  };
  
  const pastePenalty = Math.min(30, largePastes * 10);
  const jumpPenalty = Math.min(30, solutionJumps * 15);
  
  const overallRisk = (
    typingPattern * weights.typing +
    pauseAnalysis * weights.pauses +
    timingAnalysis * weights.timing +
    (100 - pastePenalty) * weights.pastes +
    (100 - jumpPenalty) * weights.jumps
  );
  
  return {
    typingPattern,
    pauseAnalysis,
    timingAnalysis,
    overallRisk: Math.max(0, Math.min(100, overallRisk))
  };
}
