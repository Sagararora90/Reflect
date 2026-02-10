/**
 * BehavioralService.js
 * Analyzes typing patterns, timing, and sudden large pastes.
 */

class BehavioralService {
    /**
     * Calculate a risk score based on keystroke intervals and patterns.
     * @param {Array} keystrokes - List of { key, timestamp, questionIndex }
     */
    static calculateTypingScore(keystrokes) {
        if (!keystrokes || keystrokes.length < 10) return 0;

        const intervals = [];
        for (let i = 1; i < keystrokes.length; i++) {
            intervals.push(keystrokes[i].timestamp - keystrokes[i-1].timestamp);
        }

        // Filter out large pauses (e.g., > 2 seconds) to get "active typing" speed
        const activeIntervals = intervals.filter(v => v < 2000);
        if (activeIntervals.length === 0) return 0;

        const avgInterval = activeIntervals.reduce((a, b) => a + b, 0) / activeIntervals.length;
        
        // Simple heuristic: extremely consistent timing or extremely high speed might be suspicious
        // (but usually slow and steady is clean).
        // Let's focus on Variance. Humans have variable timing. Bots/Pastes don't.
        const variance = activeIntervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / activeIntervals.length;
        const stdDev = Math.sqrt(variance);

        // Low stdDev means very robotic typing
        return stdDev < 15 ? 80 : 20; 
    }

    /**
     * Analyze sudden large pastes.
     * @param {Array} pastes - List of { length, timestamp, questionIndex }
     */
    static analyzePastes(pastes) {
        let risk = 0;
        pastes.forEach(p => {
            if (p.length > 200) risk += 50; // Massively large paste
            else if (p.length > 50) risk += 20; // Medium paste
        });
        return Math.min(risk, 100);
    }

    /**
     * Analyze timing vs complexity (simplified for now).
     */
    static analyzeTiming(timeTaken, totalQuestions) {
        const avgTimePerQuestion = timeTaken / totalQuestions;
        if (avgTimePerQuestion < 10) return 90; // Suspiciously fast (under 10s per question)
        if (avgTimePerQuestion < 30) return 40; // Quick
        return 10; // Normal
    }

    static process(data, timeTaken, totalQuestions) {
        const typingScore = this.calculateTypingScore(data.keystrokes || []);
        const pasteRisk = this.analyzePastes(data.pastes || []);
        const timingRisk = this.analyzeTiming(timeTaken, totalQuestions);

        const overallRisk = Math.max(typingScore, pasteRisk, timingRisk);

        return {
            typingPattern: typingScore,
            pasteAnalysis: pasteRisk,
            timingAnalysis: timingRisk,
            overallRisk: Math.round(overallRisk)
        };
    }
}

export default BehavioralService;
