import axios from 'axios';

const PISTON_API = 'https://emkc.org/api/v2/piston';

// Language Versions (Piston requires version)
const RUNTIMES = {
    javascript: { language: 'javascript', version: '18.15.0' },
    python: { language: 'python', version: '3.10.0' },
    java: { language: 'java', version: '15.0.2' },
    c: { language: 'c', version: '10.2.0' },
    cpp: { language: 'c++', version: '10.2.0' }
};

/**
 * Wraps user code to handle STDIN/STDOUT based on language.
 * We want the user to write a function `solution(input)`, but Piston runs a script.
 * So we append code to read stdin, call solution(), and print result.
 */
const wrapCode = (language, userCode) => {
    switch (language) {
        case 'javascript':
            return `
${userCode}

// Hidden Runner Code
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
try {
    const result = solution(input);
    console.log(result);
} catch (e) {
    console.error(e.message);
}
`;
        case 'python':
            return `
import sys

${userCode}

# Hidden Runner Code
if __name__ == "__main__":
    try:
        input_data = sys.stdin.read().strip()
        result = solution(input_data)
        print(result)
    except Exception as e:
        print(e, file=sys.stderr)
`;
        case 'java':
            // userCode must be the Solution class
            // We need to merge it or ensure structure. 
            // Simplified: User writes 'class Solution { ... }'
            // We append a Main class or assume user provides main.
            // For now, let's assume specific template for Java:
            // "class Solution { public static String solve(String input) { ... } }"
            return `
import java.util.Scanner;

${userCode}

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNext()) {
            String input = scanner.next(); // or nextLine()
            System.out.println(Solution.solve(input));
        }
    }
}
`;
        default:
            return userCode;
    }
};

export const executeCode = async (language, code, input) => {
    const runtime = RUNTIMES[language];
    if (!runtime) throw new Error(`Language ${language} not supported yet.`);

    const wrappedCode = wrapCode(language, code);

    try {
        const response = await axios.post(`${PISTON_API}/execute`, {
            language: runtime.language,
            version: runtime.version,
            files: [
                {
                    name: language === 'java' ? 'Main.java' : undefined,
                    content: wrappedCode
                }
            ],
            stdin: input
        });

        const data = response.data;
        return {
            stdout: data.run.stdout?.trim(),
            stderr: data.run.stderr?.trim(),
            error: data.run.code !== 0 ? (data.run.stderr || 'Runtime Error') : null
        };
    } catch (error) {
        console.error("Piston Execution Error:", error.message);
        return { error: 'Execution environment unavailable.' };
    }
};
