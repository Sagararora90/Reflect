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
        setOutput("Running...");
        
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
        <div className="flex flex-col h-full gap-3 rf-animate-bloom">
            
            {/* Toolbar */}
            <div className="bg-black/40 backdrop-blur-md border border-rf-border-glass rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Code2 size={16} className="text-rf-accent" />
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-rf-surface/50 border border-rf-border-glass rounded-lg px-3 py-1.5 text-xs font-semibold text-rf-text-pure outline-none focus:border-rf-accent transition-all"
                    >
                        {(question.allowedLanguages || ['javascript']).map(lang => (
                            <option key={lang} value={lang} className="bg-rf-void">{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                     <button 
                        className="p-2 bg-white/5 border border-rf-border-glass rounded-lg text-rf-text-muted hover:text-rf-text-pure hover:bg-white/10 transition-all" 
                        onClick={() => setCode(stubs[language])} 
                        title="Reset code"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button 
                        className="rf-btn rf-btn-primary !px-4 !py-2 !rounded-lg text-xs font-bold gap-1.5" 
                        onClick={runCode} 
                        disabled={isRunning}
                    >
                        {isRunning ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Play size={13} />
                        )}
                        {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 bg-black/20 rounded-xl border border-rf-border-glass overflow-hidden">
                <Editor
                    height="100%"
                    defaultLanguage={language}
                    language={language}
                    value={code}
                    theme="vs-dark"
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
                    }}
                />
            </div>

            {/* Output Console */}
            <div className="bg-rf-surface/40 backdrop-blur-xl border border-rf-border-glass rounded-xl p-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-rf-border-glass">
                    <div className="flex items-center gap-2">
                        <Terminal size={13} className="text-rf-accent" />
                        <span className="text-xs font-semibold text-rf-text-dim">Output</span>
                    </div>
                    {testResults.length > 0 && (
                        <span className="text-[10px] font-bold text-rf-success bg-rf-success/10 px-2 py-0.5 rounded-full">
                            {output}
                        </span>
                    )}
                </div>
                
                <pre className={`font-mono text-sm whitespace-pre-wrap ${output?.includes('Error') ? 'text-rf-danger' : 'text-rf-text-pure'}`}>
                    {output || 'Click "Run Code" to see output'}
                </pre>
                
                {testResults.length > 0 && (
                    <div className="space-y-2 pt-3 mt-3 border-t border-rf-border-glass">
                        {testResults.map((res, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${res.passed ? 'bg-rf-success/5 border-rf-success/20' : 'bg-rf-danger/5 border-rf-danger/20'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded ${res.passed ? 'bg-rf-success text-white' : 'bg-rf-danger text-white'}`}>
                                        {res.passed ? <Check size={12} /> : <X size={12} />}
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-rf-text-pure">Test Case {idx + 1}</span>
                                        <p className="text-[10px] text-rf-text-muted">
                                            {res.isHidden ? 'Hidden test case' : `Input: ${res.input} → Expected: ${res.expected}`}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold ${res.passed ? 'text-rf-success' : 'text-rf-danger'}`}>
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
