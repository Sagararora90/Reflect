import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Check, X, Terminal, Code2 } from 'lucide-react';
import API_URL from '../apiConfig';

const CodeEditor = ({ question, onCodeChange }) => {
    const [language, setLanguage] = useState(question.allowedLanguages?.[0] || 'javascript');
    const [code, setCode] = useState(question.codeStub || '// Write your solution here\n');
    const [output, setOutput] = useState(null);
    const [testResults, setTestResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    const stubs = {
        javascript: question.codeStub || `// Solve: ${question.text}\nfunction solution(input) {\n    return input;\n}`,
        python: `# Solve: ${question.text}\ndef solution(input):\n    return input`,
        java: `// Solve: ${question.text}\nclass Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello");\n    }\n}`
    };

    useEffect(() => {
        setCode(stubs[language] || '');
        setTestResults([]);
        setOutput(null);
    }, [question, language]);
    
    const handleEditorChange = (value) => {
        setCode(value);
        if (onCodeChange) onCodeChange(value);
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput("Running execution environment...");
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    language,
                    code,
                    testCases: question.testCases
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.msg || 'Execution failed');
            }

            setTestResults(data.results);
            setOutput(data.summary);

        } catch (err) {
            setOutput(`Error: ${err.message}`);
            setTestResults([]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            
            {/* Toolbar */}
            <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                        <Code2 size={16} className="text-primary" />
                    </div>
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-white border border-border rounded-md px-3 py-1.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                    >
                        {(question.allowedLanguages || ['javascript']).map(lang => (
                            <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                     <button 
                        className="p-2 bg-white border border-border rounded-md text-text-secondary hover:text-text-primary hover:bg-panel transition-all shadow-sm" 
                        onClick={() => setCode(stubs[language])} 
                        title="Reset code"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button 
                        className="btn btn-primary py-1.5 px-4 text-xs font-bold gap-1.5 shadow-sm" 
                        onClick={runCode} 
                        disabled={isRunning}
                    >
                        {isRunning ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Play size={13} />
                        )}
                        {isRunning ? 'Executing...' : 'Run Code'}
                    </button>
                </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 bg-white rounded-xl border border-border overflow-hidden shadow-inner">
                <Editor
                    height="100%"
                    defaultLanguage={language}
                    language={language}
                    value={code}
                    theme="light"
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        scrollbar: {
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                        },
                    }}
                />
            </div>

            {/* Output Console */}
            <div className="bg-surface border border-border rounded-xl p-4 max-h-[200px] overflow-y-auto custom-scrollbar shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-text-tertiary" />
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Console Output</span>
                    </div>
                    {testResults.length > 0 && (
                        <span className="text-[10px] uppercase font-bold text-status-success tracking-wider bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                            {output}
                        </span>
                    )}
                </div>
                
                <pre className={`font-mono text-sm whitespace-pre-wrap ${output?.includes('Error') ? 'text-status-danger' : 'text-text-primary'}`}>
                    {output || 'No output to display. Click "Run Code" to execute.'}
                </pre>
                
                {testResults.length > 0 && (
                    <div className="space-y-2 pt-4 mt-4 border-t border-border">
                        {testResults.map((res, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border-l-4 border-y border-r bg-white shadow-sm ${res.passed ? 'border-l-status-success border-y-border border-r-border' : 'border-l-status-danger border-y-border border-r-border'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-1.5 rounded-md ${res.passed ? 'bg-green-50 text-status-success' : 'bg-red-50 text-status-danger'}`}>
                                        {res.passed ? <Check size={14} /> : <X size={14} />}
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-text-primary">Test Case {idx + 1}</span>
                                        <p className="text-[11px] font-mono text-text-secondary mt-0.5">
                                            {res.isHidden ? 'Hidden evaluation case' : `In: ${res.input} | Out: ${res.expected}`}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${res.passed ? 'text-status-success bg-green-50 border-green-200' : 'text-status-danger bg-red-50 border-red-200'}`}>
                                    {res.passed ? 'Passed' : 'Failed'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeEditor;
