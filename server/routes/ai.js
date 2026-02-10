import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Fallback question bank (used when Groq API is unavailable)
const questionBank = {
    javascript: [
        { type: 'mcq', text: "What is the output of `typeof null`?", options: ["'object'", "'null'", "'undefined'", "'number'"], correctAnswer: "'object'" },
        { type: 'mcq', text: "Which method removes the last element from an array?", options: ["pop()", "push()", "shift()", "unshift()"], correctAnswer: "pop()" },
        { type: 'mcq', text: "What does `===` check in JavaScript?", options: ["Value and type", "Only value", "Only type", "Reference"], correctAnswer: "Value and type" },
        { type: 'mcq', text: "Which keyword declares a block-scoped variable?", options: ["let", "var", "both", "none"], correctAnswer: "let" },
        { type: 'coding', text: "Write a function `sum(a, b)` that returns the sum of two numbers.", codeStub: "function sum(a, b) {\n  // Your code here\n}", testCases: [{input: "2, 3", output: "5"}, {input: "-1, 1", output: "0"}] },
        { type: 'coding', text: "Implement a function to check if a string is a palindrome.", codeStub: "function isPalindrome(str) {\n  // Your code here\n}", testCases: [{input: "'racecar'", output: "true"}, {input: "'hello'", output: "false"}] }
    ],
    python: [
         { type: 'mcq', text: "What runs the fastest in Python?", options: ["List Comprehension", "For Loop", "While Loop", "Recursion"], correctAnswer: "List Comprehension" },
         { type: 'mcq', text: "What is the output of `type([])`?", options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "Error"], correctAnswer: "<class 'list'>" },
         { type: 'coding', text: "Write a function to return the factorial of n.", codeStub: "def factorial(n):\n    # Your code here", testCases: [{input: "5", output: "120"}, {input: "0", output: "1"}] }
    ],
    general: [
         { type: 'mcq', text: "What is the capital of France?", options: ["Paris", "London", "Berlin", "Madrid"], correctAnswer: "Paris" },
         { type: 'mcq', text: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], correctAnswer: "Mars" }
    ]
};


// Build Groq prompt for question generation
function buildPrompt(topic, type, count) {
    if (type === 'coding') {
        return `Generate exactly ${count} coding questions about "${topic}". 
Return ONLY a valid JSON array, no extra text. Each object must have:
- "type": "coding"
- "text": the question description
- "codeStub": starter code template
- "testCases": array of {input, output} pairs (at least 2)

Example format:
[{"type":"coding","text":"Write a function...","codeStub":"function example() {\\n  // code\\n}","testCases":[{"input":"5","output":"10"}]}]`;
    }

    return `Generate exactly ${count} multiple choice questions about "${topic}".
Return ONLY a valid JSON array, no extra text. Each object must have:
- "type": "mcq"
- "text": the question text
- "options": array of exactly 4 answer choices
- "correctAnswer": the correct option (must match one of the options exactly)

Example format:
[{"type":"mcq","text":"What is...?","options":["A","B","C","D"],"correctAnswer":"A"}]`;
}


// Try generating questions via Groq API
async function generateWithGroq(topic, type, count) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.warn('⚠️  GROQ_API_KEY not set — using fallback questions');
        return null;
    }

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: 'You are a question generator for exams. Return ONLY valid JSON arrays. No markdown, no explanation, no ```json blocks.' },
                { role: 'user', content: buildPrompt(topic, type, count) }
            ],
            temperature: 0.7,
            max_tokens: 4096
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error('Groq API error:', response.status, errText);
        return null;
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    // Strip markdown code fences if present
    content = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    const questions = JSON.parse(content);
    if (!Array.isArray(questions) || questions.length === 0) return null;

    // Validate structure
    return questions.map(q => {
        if (type === 'mcq') {
            return {
                type: 'mcq',
                text: q.text || 'Question',
                options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
                correctAnswer: q.correctAnswer || q.options?.[0] || 'A'
            };
        }
        return {
            type: 'coding',
            text: q.text || 'Coding question',
            codeStub: q.codeStub || '// Write your code here',
            testCases: Array.isArray(q.testCases) ? q.testCases : [{ input: '', output: '' }]
        };
    });
}


// @route   POST api/ai/generate
// @desc    Generate questions based on topic (Groq AI with fallback)
// @access  Private
router.post('/generate', auth, async (req, res) => {
    try {
        const { topic, type, count } = req.body;
        const numCount = parseInt(count) || 5;

        // Try Groq API first
        try {
            const aiQuestions = await generateWithGroq(topic, type || 'mcq', numCount);
            if (aiQuestions && aiQuestions.length > 0) {
                console.log(`✅ Generated ${aiQuestions.length} questions via Groq AI for "${topic}"`);
                return res.json(aiQuestions);
            }
        } catch (aiErr) {
            console.error('Groq AI generation failed, using fallback:', aiErr.message);
        }
        
        // Fallback to local question bank
        console.log(`📦 Using fallback question bank for "${topic}"`);
        const key = Object.keys(questionBank).find(k => topic.toLowerCase().includes(k)) || 'javascript';
        
        let pool = questionBank[key].filter(q => q.type === (type || 'mcq'));
        
        if (pool.length === 0) {
            pool = type === 'coding' 
                ? [{ type: 'coding', text: `Write a program in ${topic} to print "Hello World".`, codeStub: `// Print Hello World in ${topic}`, testCases: [{input: "", output: "Hello World"}] }]
                : [{ type: 'mcq', text: `Identify the correct statement about ${topic}.`, options: [`${topic} is a language`, `${topic} is a compiler`, `${topic} is a framework`, `None of the above`], correctAnswer: `${topic} is a language` }];
        }

        const results = [];
        for (let i = 0; i < numCount; i++) {
            results.push(pool[i % pool.length]);
        }

        res.json(results);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('AI Service Error');
    }
});

export default router;
