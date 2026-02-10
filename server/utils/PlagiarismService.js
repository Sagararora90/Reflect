/**
 * PlagiarismService.js
 * Detects code similarity using token-based analysis.
 */

import ExamSubmission from '../models/ExamSubmission.js';

class PlagiarismService {
    /**
     * Simple Jaccard similarity between two sets of tokens.
     */
    static compareStrings(s1, s2) {
        const set1 = new Set(s1.split(/\s+/));
        const set2 = new Set(s2.split(/\s+/));
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return (intersection.size / union.size) * 100;
    }

    /**
     * Checks a submission against others for the same exam.
     */
    static async checkSubmissions(currentSubmission, examId) {
        const others = await ExamSubmission.find({ 
            examId, 
            studentId: { $ne: currentSubmission.studentId } 
        });

        let maxSimilarity = 0;
        let bestMatch = null;

        // Current submission answers as a single string for comparison
        const currentContent = JSON.stringify(currentSubmission.answers);

        for (const other of others) {
            const otherContent = JSON.stringify(other.answers);
            const similarity = this.compareStrings(currentContent, otherContent);
            
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                bestMatch = other.studentId;
            }
        }

        return {
            percentage: Math.round(maxSimilarity),
            integrityScore: Math.round(100 - maxSimilarity),
            matches: maxSimilarity > 70 ? [{
                source: 'cross-candidate',
                similarity: Math.round(maxSimilarity),
                details: `High similarity with candidate ID: ${bestMatch}`
            }] : []
        };
    }
}

export default PlagiarismService;
