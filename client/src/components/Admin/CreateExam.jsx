import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../apiConfig';
import { 
  Plus, 
  Trash2,
  Code, 
  List, 
  Clock, 
  Camera, 
  Monitor, 
  Sparkles, 
  CheckCircle2,
  Copy,
  ChevronLeft,
  ArrowRight,
  Save,
  Edit3,
  PlusCircle,
  X
} from 'lucide-react';

const CreateExam = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '',
        duration: 60,
        startTime: '',
        endTime: '',
        webcamRequired: true,
        screenShareRequired: true,
    });
    
    const [questions, setQuestions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPreview, setAiPreview] = useState([]);

    const [newQ, setNewQ] = useState({
        type: 'mcq',
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        testCases: [{ input: '', output: '', isHidden: false }],
        allowedLanguages: ['javascript', 'python', 'java'],
        codeStub: ''
    });

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleQChange = (field, value) => {
        setNewQ({ ...newQ, [field]: value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...newQ.options];
        newOptions[index] = value;
        setNewQ({ ...newQ, options: newOptions });
    };

    const handleTestCaseChange = (index, field, value) => {
        const newCases = [...newQ.testCases];
        newCases[index][field] = value;
        setNewQ({ ...newQ, testCases: newCases });
    };

    const addTestCase = () => {
        setNewQ({ ...newQ, testCases: [...newQ.testCases, { input: '', output: '', isHidden: false }] });
    };

    const removeTestCase = (index) => {
        setNewQ({ ...newQ, testCases: newQ.testCases.filter((_, i) => i !== index) });
    };

    const addQuestionToExam = () => {
        if (!newQ.text) return alert("Please enter a question.");
        if (newQ.type === 'mcq' && !newQ.correctAnswer) return alert("Please select the correct answer.");
        
        setQuestions([...questions, { ...newQ }]);
        setNewQ({
            type: 'mcq',
            text: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            testCases: [{ input: '', output: '', isHidden: false }],
            allowedLanguages: ['javascript', 'python', 'java'],
            codeStub: ''
        });
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const [generatedLink, setGeneratedLink] = useState('');

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!formData.title.trim()) return alert("Please enter an exam title.");
        if (questions.length === 0) return alert("Please add at least one question.");

        try {
            const payload = { 
                ...formData, 
                startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
                endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
                questions 
            };
            const res = await fetch(`${API_URL}/api/exam`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                const link = `${window.location.origin}/landing/${data._id}`;
                setGeneratedLink(link);
            } else {
                alert('Error: ' + data.msg);
            }
        } catch (err) {
            console.error(err);
            alert('Server error');
        }
    };

    /* Success screen */
    if (generatedLink) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="card max-w-md w-full text-center p-8 md:p-10">
                    <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} className="text-status-success" />
                    </div>
                    <h2 className="heading-2 mb-2">Exam Generated</h2>
                    <p className="text-text-secondary mb-8">Ready for deployment. Share this link with your participants.</p>
                    
                    <div className="bg-surface border border-border rounded-xl p-4 mb-8 flex items-center gap-3">
                        <span className="text-sm text-primary font-mono break-all flex-1 text-left">{generatedLink}</span>
                        <button 
                            className="p-2 btn btn-secondary shrink-0 group relative"
                            onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Copied!"); }}
                        >
                            <Copy size={16} />
                        </button>
                    </div>

                    <button className="btn btn-primary w-full py-3.5 group" onClick={() => navigate('/admin/dashboard')}>
                        Back to Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform ml-1" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text-primary pt-24 pb-12 px-6 sm:px-8">
            <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button className="btn btn-secondary px-3 py-2" onClick={() => navigate('/admin/dashboard')}>
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="heading-2 mb-1">Create Exam</h1>
                        <p className="text-body mt-0">Establish structure, timing, and proctoring constraints</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary px-5 py-2" onClick={() => navigate('/admin/dashboard')}>Discard</button>
                    <button className="btn btn-primary px-6 py-2" onClick={handleSubmit}>
                        <Save size={16} /> Publish Exam
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
                
                {/* Main Content */}
                <div className="flex flex-col gap-8">
                    
                    {/* Exam Settings */}
                    <div className="card p-6 md:p-8">
                        <h3 className="heading-3 mb-6">Core Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                            <FormInput label="Exam Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Q4 Software Engineering Evaluate" />
                            <FormInput label="Duration (minutes)" name="duration" type="number" value={formData.duration} onChange={handleChange} placeholder="60" />
                        </div>

                        {/* Scheduling */}
                        <div className="pt-6 border-t border-border">
                            <label className="text-sm font-semibold text-text-primary mb-3 block">Timing Window</label>
                            <div className="flex flex-wrap gap-2 mb-5">
                                {[
                                    { label: 'Start Now', offset: 0 },
                                    { label: 'In 1 hour', offset: 60 },
                                    { label: 'In 2 hours', offset: 120 },
                                    { label: 'Tomorrow', offset: 1440 },
                                ].map(preset => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        className="btn btn-secondary py-1.5 px-3 text-xs"
                                        onClick={() => {
                                            const start = new Date(Date.now() + preset.offset * 60000);
                                            const end = new Date(start.getTime() + (formData.duration || 60) * 60000);
                                            const fmt = d => {
                                                const y = d.getFullYear();
                                                const mo = String(d.getMonth() + 1).padStart(2, '0');
                                                const da = String(d.getDate()).padStart(2, '0');
                                                const h = String(d.getHours()).padStart(2, '0');
                                                const mi = String(d.getMinutes()).padStart(2, '0');
                                                return `${y}-${mo}-${da}T${h}:${mi}`;
                                            };
                                            setFormData({ ...formData, startTime: fmt(start), endTime: fmt(end) });
                                        }}
                                    >
                                        <Clock size={12} className="mr-1.5 opacity-70" /> {preset.label}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormInput label="Start Time" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} />
                                <FormInput label="End Time" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Question Builder */}
                    <div className="card p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="heading-3">Content Builder</h3>
                            
                            {/* Type Toggle */}
                            <div className="flex bg-panel p-1 rounded-lg border border-border">
                                <button 
                                    onClick={() => handleQChange('type', 'mcq')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${newQ.type === 'mcq' ? 'bg-white text-primary shadow-sm border border-border/50' : 'text-text-secondary hover:text-text-primary border border-transparent'}`}
                                >
                                    <List size={14} /> Multiple Choice
                                </button>
                                <button 
                                    onClick={() => handleQChange('type', 'coding')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${newQ.type === 'coding' ? 'bg-white text-primary shadow-sm border border-border/50' : 'text-text-secondary hover:text-text-primary border border-transparent'}`}
                                >
                                    <Code size={14} /> Coding Activity
                                </button>
                            </div>
                        </div>

                        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
                            {/* Question Text */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-text-primary mb-2">Prompt / Problem Statement</label>
                                <textarea 
                                    value={newQ.text} 
                                    onChange={(e) => handleQChange('text', e.target.value)}
                                    placeholder="Enter the main question text here..."
                                    className="input-field min-h-[120px] resize-none"
                                />
                            </div>

                            {newQ.type === 'mcq' ? (
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Selectable Options</label>
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <input 
                                                value={newQ.options[i]} 
                                                onChange={(e) => handleOptionChange(i, e.target.value)}
                                                placeholder={`Option ${i + 1}`}
                                                className="input-field"
                                            />
                                            <button 
                                                onClick={() => handleQChange('correctAnswer', newQ.options[i])}
                                                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${newQ.correctAnswer === newQ.options[i] && newQ.options[i] !== '' ? 'bg-status-success border-status-success' : 'border-border hover:border-status-success/40 bg-white'}`}
                                                title="Mark as correct answer"
                                            >
                                                {newQ.correctAnswer === newQ.options[i] && newQ.options[i] !== '' && <CheckCircle2 size={18} className="text-white" />}
                                            </button>
                                        </div>
                                    ))}
                                    <p className="text-xs text-text-tertiary mt-2">Check the box on the right to identify the correct answer. Empty fields are ignored.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-text-primary">Evaluation Test Cases</label>
                                        <button onClick={addTestCase} className="btn btn-secondary px-3 py-1.5 text-xs">
                                            <Plus size={14} /> Add Pattern
                                        </button>
                                    </div>
                                    {newQ.testCases.map((tc, i) => (
                                        <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 items-center bg-white p-4 rounded-lg border border-border shadow-sm">
                                            <input className="input-field font-mono text-xs" placeholder="stdin input" value={tc.input} onChange={(e) => handleTestCaseChange(i, 'input', e.target.value)} />
                                            <input className="input-field font-mono text-xs text-primary" placeholder="stdout expected" value={tc.output} onChange={(e) => handleTestCaseChange(i, 'output', e.target.value)} />
                                            <label className="flex items-center gap-2 cursor-pointer ml-2">
                                                <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(i, 'isHidden', e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                                                <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Hidden Case</span>
                                            </label>
                                            <button onClick={() => removeTestCase(i)} className="p-2 text-text-tertiary hover:text-status-danger transition-colors hover:bg-red-50 rounded-md"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 pt-5 border-t border-border flex justify-end">
                                <button className="btn btn-primary" onClick={addQuestionToExam}>
                                    <Plus size={16} /> Append to Exam
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-6">
                    
                    {/* Proctoring Settings */}
                    <div className="card p-6">
                        <h3 className="heading-3 mb-5">Integrity & Proctoring</h3>
                        <div className="space-y-3">
                            <ToggleItem 
                                icon={<Camera size={18} />} 
                                label="Camera Capture Required" 
                                active={formData.webcamRequired} 
                                onClick={() => setFormData({...formData, webcamRequired: !formData.webcamRequired})} 
                            />
                            <ToggleItem 
                                icon={<Monitor size={18} />} 
                                label="Screen Capture Required" 
                                active={formData.screenShareRequired} 
                                onClick={() => setFormData({...formData, screenShareRequired: !formData.screenShareRequired})} 
                            />
                        </div>
                    </div>

                    {/* AI Generator */}
                    <div className="card p-6 border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-primary/10 rounded text-primary"><Sparkles size={16} /></div>
                            <h3 className="heading-3">AI Copilot</h3>
                        </div>
                        <p className="text-sm text-text-secondary mb-5">Generate standard schema questions instantly utilizing your linked LLM.</p>
                        
                        <div className="space-y-4">
                            <FormInput label="Subject Area / Context" id="ai-topic" placeholder="e.g. React hooks theory" />
                            <FormInput label="Quantity" id="ai-count" type="number" defaultValue="3" />
                            <button 
                                className="btn btn-primary w-full py-3 shadow-md" 
                                disabled={isGenerating}
                                onClick={async () => {
                                    const topic = document.getElementById('ai-topic').value;
                                    const count = document.getElementById('ai-count').value;
                                    if(!topic) return alert("Please enter a topic.");
                                    setIsGenerating(true);
                                    try {
                                        const res = await fetch(`${API_URL}/api/ai/generate`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('token') },
                                            body: JSON.stringify({ topic, count, type: newQ.type })
                                        });
                                        const data = await res.json();
                                        if(res.ok) setAiPreview(data);
                                    } catch(e) { console.error(e); }
                                    setIsGenerating(false);
                                }}
                            >
                                {isGenerating ? 'Synthesizing...' : 'Generate Block'} <Sparkles size={14} className="ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* AI Preview Panel */}
                    {aiPreview.length > 0 && (
                        <div className="card p-5 border-primary shadow-lg ring-4 ring-primary/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={14} className="text-primary" />
                                    <span className="text-sm font-bold text-primary">Preview Drafts ({aiPreview.length})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        className="btn btn-primary py-1 px-3 text-xs"
                                        onClick={() => { setQuestions([...questions, ...aiPreview]); setAiPreview([]); }}
                                    >
                                        <PlusCircle size={14} className="mr-1" /> Add All
                                    </button>
                                    <button 
                                        className="p-1 px-2 text-text-tertiary hover:text-status-danger hover:bg-red-50 rounded transition-colors"
                                        onClick={() => setAiPreview([])}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                {aiPreview.map((q, i) => (
                                    <div 
                                        key={i} 
                                        className="bg-white border border-border rounded-lg p-3.5 flex items-center justify-between gap-3 hover:border-primary/40 cursor-pointer group shadow-sm transition-all"
                                        onClick={() => {
                                            setNewQ({ ...q, options: q.options || ['', '', '', ''], testCases: q.testCases || [{ input: '', output: '', isHidden: false }], allowedLanguages: q.allowedLanguages || ['javascript', 'python', 'java'], codeStub: q.codeStub || '' });
                                            setAiPreview(aiPreview.filter((_, idx) => idx !== i));
                                        }}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-[10px] font-bold text-primary">{i+1}</span>
                                            </div>
                                            <span className="text-sm text-text-secondary truncate group-hover:text-text-primary transition-colors">{q.text}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit3 size={14} className="text-primary" />
                                            <span className="text-[10px] font-medium text-primary">Edit</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Question List Box */}
                    <div className="card p-6 flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="heading-3">Live Roster</h3>
                            <span className="badge badge-primary font-bold px-2.5 py-1 text-xs">{questions.length} Items</span>
                        </div>
                         
                        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                            {questions.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="p-4 bg-panel rounded-full mb-3">
                                        <List size={24} className="text-text-tertiary" />
                                    </div>
                                    <p className="text-sm text-text-secondary font-medium">Exam container is empty</p>
                                    <p className="text-xs text-text-tertiary mt-1 max-w-[200px]">Add questions from the builder or generate with AI to populate.</p>
                                </div>
                            ) : (
                                questions.map((q, i) => (
                                    <div key={i} className="bg-surface border border-border rounded-lg p-3 md:p-4 flex items-center justify-between gap-3 group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-panel border border-border flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-text-secondary group-hover:text-primary transition-colors">{i+1}</span>
                                            </div>
                                            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary truncate transition-colors">{q.text}</span>
                                        </div>
                                        <button onClick={() => removeQuestion(i)} className="p-2 text-text-tertiary hover:text-status-danger hover:bg-red-50 rounded-md transition-colors shrink-0">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
            </div>
        </div>
    );
};

/* Sub-components */
const FormInput = ({ label, icon, ...props }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-text-primary">{label}</label>
        <input 
            {...props}
            className="input-field"
        />
    </div>
);

const ToggleItem = ({ icon, label, active, onClick }) => (
    <div 
        onClick={onClick}
        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${active ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface border-border hover:border-primary/30'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-panel text-text-secondary'}`}>
                {icon}
            </div>
            <span className={`text-sm font-semibold ${active ? 'text-primary' : 'text-text-secondary'}`}>{label}</span>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'bg-primary border-primary' : 'border-border'}`}>
            {active && <CheckCircle2 size={12} className="text-white" />}
        </div>
    </div>
);

export default CreateExam;
