import express from 'express';
import { executeCode } from '../utils/pistonClient.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/execute
// @desc    Execute code against test cases
// @access  Private (Student)
router.post('/', auth, async (req, res) => {
    const { language, code, testCases } = req.body;

    if (!language || !code || !testCases || !Array.isArray(testCases)) {
        return res.status(400).json({ msg: 'Missing code or test cases.' });
    }

    try {
        const results = [];
        let passedCount = 0;

        // Execute sequentially to avoid rate limits / overload
        for (const testCase of testCases) {
            const { input, output, isHidden } = testCase;

            const execution = await executeCode(language, code, input);
            
            // Compare Output
            // Check for strict equality or loose (trim whitespace)
            const actual = execution.stdout;
            const passed = actual === output;

            if (passed) passedCount++;

            results.push({
                passed,
                input: isHidden ? '(Hidden)' : input,
                expected: isHidden ? '(Hidden)' : output,
                actual: isHidden && !passed ? 'Hidden' : (execution.error || actual),
                error: execution.error,
                isHidden
            });
        }

        res.json({
            results,
            summary: `${passedCount}/${testCases.length} Test Cases Passed`
        });

    } catch (err) {
        console.error("Execution Route Error:", err);
        res.status(500).json({ msg: 'Server Error during execution.' });
    }
});

export default router;
