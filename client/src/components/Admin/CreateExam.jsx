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
  Calendar, 
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
            // Convert local datetime-local strings to UTC ISO strings for the server
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
            <div className="min-h-screen bg-rf-canvas flex items-center justify-center p-4 rf-animate-bloom">
                <div className="rf-card-glass max-w-md w-full text-center p-8">
                    <div className="w-16 h-16 bg-rf-success/10 border border-rf-success/20 rounded-xl flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 size={32} className="text-rf-success" />
                    </div>
                    <h2 className="text-xl font-bold text-rf-text-pure mb-1">Exam Created</h2>
                    <p className="text-sm text-rf-text-dim mb-6">Share this link with your students</p>
                    
                    <div className="bg-rf-panel/30 border border-rf-border-glass rounded-xl p-4 mb-6 flex items-center gap-3">
                        <span className="text-sm text-rf-accent font-mono break-all flex-1 text-left">{generatedLink}</span>
                        <button 
                            className="p-2 rf-btn rf-btn-secondary !rounded-lg shrink-0"
                            onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Copied!"); }}
                        >
                            <Copy size={16} />
                        </button>
                    </div>

                    <button className="rf-btn rf-btn-primary w-full py-3 text-sm font-bold group" onClick={() => navigate('/admin/dashboard')}>
                        Back to Dashboard <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform ml-1" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rf-canvas pt-24 pb-12 px-4 sm:px-6 lg:px-8 rf-animate-bloom">
            <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button className="p-2 rf-btn rf-btn-secondary !rounded-lg" onClick={() => navigate('/admin/dashboard')}>
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-rf-text-pure">Create Exam</h1>
                        <p className="text-xs text-rf-text-dim">Set up questions, timing, and proctoring</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="rf-btn rf-btn-secondary !py-2 !px-4 !rounded-lg text-sm" onClick={() => navigate('/admin/dashboard')}>Cancel</button>
                    <button className="rf-btn rf-btn-primary !py-2 !px-5 !rounded-lg text-sm font-bold" onClick={handleSubmit}>
                        <Save size={15} /> Publish Exam
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
                
                {/* Main Content */}
                <div className="flex flex-col gap-6">
                    
                    {/* Exam Settings */}
                    <div className="rf-card-glass p-6">
                        <h3 className="text-sm font-bold text-rf-text-pure mb-5 pb-3 border-b border-rf-border-glass">Exam Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Exam Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Midterm Exam" />
                            <FormInput label="Duration (minutes)" name="duration" type="number" value={formData.duration} onChange={handleChange} placeholder="60" />
                        </div>

                        {/* Scheduling */}
                        <div className="mt-5 pt-4 border-t border-rf-border-glass">
                            <label className="text-xs font-semibold text-rf-text-dim mb-3 block">Schedule</label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {[
                                    { label: 'Start Now', offset: 0 },
                                    { label: 'In 1 hour', offset: 60 },
                                    { label: 'In 2 hours', offset: 120 },
                                    { label: 'Tomorrow', offset: 1440 },
                                ].map(preset => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        className="rf-btn rf-btn-secondary !px-3 !py-1.5 !rounded-lg text-[11px] font-semibold"
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
                                        <Clock size={11} className="mr-1" /> {preset.label}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Start Time" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} />
                                <FormInput label="End Time" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Question Builder */}
                    <div className="rf-card-glass p-6">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-rf-border-glass">
                            <h3 className="text-sm font-bold text-rf-text-pure">Add Question</h3>
                            
                            {/* Type Toggle */}
                            <div className="flex bg-rf-panel/40 p-1 rounded-lg border border-rf-border-glass">
                                <button 
                                    onClick={() => handleQChange('type', 'mcq')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${newQ.type === 'mcq' ? 'bg-rf-accent text-white' : 'text-rf-text-dim hover:text-rf-text-pure'}`}
                                >
                                    <List size={13} /> MCQ
                                </button>
                                <button 
                                    onClick={() => handleQChange('type', 'coding')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${newQ.type === 'coding' ? 'bg-rf-accent text-white' : 'text-rf-text-dim hover:text-rf-text-pure'}`}
                                >
                                    <Code size={13} /> Coding
                                </button>
                            </div>
                        </div>

                        <div className="bg-rf-panel/20 rounded-xl border border-rf-border-glass p-5">
                            {/* Question Text */}
                            <div className="mb-5">
                                <label className="block text-xs font-semibold text-rf-text-dim mb-2">Question Text</label>
                                <textarea 
                                    value={newQ.text} 
                                    onChange={(e) => handleQChange('text', e.target.value)}
                                    placeholder="Type your question here..."
                                    className="w-full bg-rf-surface/50 border border-rf-border-glass rounded-lg p-4 text-sm text-rf-text-pure outline-none focus:border-rf-accent/50 min-h-[100px] resize-none transition-all"
                                />
                            </div>

                            {newQ.type === 'mcq' ? (
                                <div className="space-y-3">
                                    <label className="block text-xs font-semibold text-rf-text-dim mb-2">Answer Options</label>
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <input 
                                                value={newQ.options[i]} 
                                                onChange={(e) => handleOptionChange(i, e.target.value)}
                                                placeholder={`Option ${i + 1}`}
                                                className="flex-1 bg-rf-surface/50 border border-rf-border-glass rounded-lg px-4 py-2.5 text-sm text-rf-text-pure outline-none focus:border-rf-accent/50 transition-all"
                                            />
                                            <button 
                                                onClick={() => handleQChange('correctAnswer', newQ.options[i])}
                                                className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${newQ.correctAnswer === newQ.options[i] && newQ.options[i] !== '' ? 'bg-rf-success border-rf-success' : 'border-rf-border-glass hover:border-rf-success/40'}`}
                                                title="Mark as correct"
                                            >
                                                {newQ.correctAnswer === newQ.options[i] && newQ.options[i] !== '' && <CheckCircle2 size={16} className="text-white" />}
                                            </button>
                                        </div>
                                    ))}
                                    <p className="text-[11px] text-rf-text-muted mt-1">Click the checkbox to mark the correct answer</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-rf-text-dim">Test Cases</label>
                                        <button onClick={addTestCase} className="rf-btn rf-btn-secondary !px-3 !py-1.5 !rounded-lg text-xs">
                                            <Plus size={13} /> Add
                                        </button>
                                    </div>
                                    {newQ.testCases.map((tc, i) => (
                                        <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-center bg-rf-surface/30 p-3 rounded-lg border border-rf-border-glass">
                                            <input className="bg-transparent border border-rf-border-glass rounded-lg px-3 py-2 text-sm text-rf-text-pure outline-none focus:border-rf-accent/50 font-mono" placeholder="Input" value={tc.input} onChange={(e) => handleTestCaseChange(i, 'input', e.target.value)} />
                                            <input className="bg-transparent border border-rf-border-glass rounded-lg px-3 py-2 text-sm text-rf-accent outline-none focus:border-rf-accent/50 font-mono" placeholder="Expected output" value={tc.output} onChange={(e) => handleTestCaseChange(i, 'output', e.target.value)} />
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(i, 'isHidden', e.target.checked)} className="accent-rf-accent" />
                                                <span className="text-xs text-rf-text-muted whitespace-nowrap">Hidden</span>
                                            </label>
                                            <button onClick={() => removeTestCase(i)} className="p-1.5 text-rf-text-muted hover:text-rf-danger transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-5 pt-4 border-t border-rf-border-glass flex justify-end">
                                <button className="rf-btn rf-btn-primary !px-5 !py-2 !rounded-lg text-xs font-bold" onClick={addQuestionToExam}>
                                    <Plus size={14} /> Add Question
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-6">
                    
                    {/* Proctoring Settings */}
                    <div className="rf-card-glass p-5">
                        <h3 className="text-sm font-bold text-rf-text-pure mb-4 pb-3 border-b border-rf-border-glass">Proctoring</h3>
                        <div className="space-y-3">
                            <ToggleItem 
                                icon={<Camera size={16} />} 
                                label="Require Camera" 
                                active={formData.webcamRequired} 
                                onClick={() => setFormData({...formData, webcamRequired: !formData.webcamRequired})} 
                            />
                            <ToggleItem 
                                icon={<Monitor size={16} />} 
                                label="Require Screen Share" 
                                active={formData.screenShareRequired} 
                                onClick={() => setFormData({...formData, screenShareRequired: !formData.screenShareRequired})} 
                            />
                        </div>
                    </div>

                    {/* AI Generator */}
                    <div className="rf-card-glass p-5 border-rf-accent/20">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={16} className="text-rf-accent" />
                            <h3 className="text-sm font-bold text-rf-text-pure">AI Generate</h3>
                        </div>
                        <p className="text-xs text-rf-text-dim mb-4 leading-relaxed">Auto-generate questions on a topic using AI.</p>
                        
                        <div className="space-y-3">
                            <FormInput label="Topic" id="ai-topic" placeholder="e.g. Data Structures" />
                            <FormInput label="Number of Questions" id="ai-count" type="number" defaultValue="3" />
                            <button 
                                className="rf-btn rf-btn-primary w-full py-2.5 text-xs font-bold" 
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
                                {isGenerating ? 'Generating...' : 'Generate Questions'} <Sparkles size={13} className="ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* AI Preview Panel */}
                    {aiPreview.length > 0 && (
                        <div className="rf-card-glass p-5 border-rf-accent/20">
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-rf-border-glass">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={13} className="text-rf-accent" />
                                    <span className="text-sm font-bold text-rf-accent">AI Generated ({aiPreview.length})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        className="rf-btn rf-btn-primary !px-3 !py-1.5 !rounded-lg text-[10px] font-bold flex items-center gap-1"
                                        onClick={() => { setQuestions([...questions, ...aiPreview]); setAiPreview([]); }}
                                    >
                                        <PlusCircle size={11} /> Add All
                                    </button>
                                    <button 
                                        className="p-1.5 text-rf-text-muted hover:text-rf-danger transition-colors"
                                        onClick={() => setAiPreview([])}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                                {aiPreview.map((q, i) => (
                                    <div 
                                        key={i} 
                                        className="bg-rf-surface/40 border border-rf-border-glass rounded-lg p-3 flex items-center justify-between gap-2 hover:border-rf-accent/30 transition-all cursor-pointer group"
                                        onClick={() => {
                                            setNewQ({ ...q, options: q.options || ['', '', '', ''], testCases: q.testCases || [{ input: '', output: '', isHidden: false }], allowedLanguages: q.allowedLanguages || ['javascript', 'python', 'java'], codeStub: q.codeStub || '' });
                                            setAiPreview(aiPreview.filter((_, idx) => idx !== i));
                                        }}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-6 h-6 rounded-md bg-rf-accent/10 flex items-center justify-center shrink-0">
                                                <span className="text-[9px] font-bold text-rf-accent">{i+1}</span>
                                            </div>
                                            <span className="text-xs text-rf-text-dim truncate group-hover:text-rf-text-pure transition-colors">{q.text}</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Edit3 size={12} className="text-rf-text-muted group-hover:text-rf-accent transition-colors" />
                                            <span className="text-[9px] text-rf-text-muted group-hover:text-rf-accent transition-colors">Edit</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-rf-text-muted mt-2">Click a question to edit it before adding, or use "Add All".</p>
                        </div>
                    )}

                    {/* Question List */}
                    <div className="rf-card-glass p-5 flex-1">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-rf-border-glass">
                            <h3 className="text-sm font-bold text-rf-text-pure">Questions</h3>
                            <span className="text-xs font-bold text-rf-accent bg-rf-accent/10 px-2 py-0.5 rounded-full">{questions.length}</span>
                        </div>
                         
                        <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                            {questions.length === 0 ? (
                                <div className="py-10 flex flex-col items-center justify-center text-center opacity-40">
                                    <List size={28} className="text-rf-text-muted mb-2" />
                                    <p className="text-xs text-rf-text-muted">No questions added yet</p>
                                </div>
                            ) : (
                                questions.map((q, i) => (
                                    <div key={i} className="bg-rf-panel/20 border border-rf-border-glass rounded-lg p-3 flex items-center justify-between gap-3 group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-7 h-7 rounded-md bg-rf-accent/10 flex items-center justify-center shrink-0">
                                                <span className="text-[10px] font-bold text-rf-accent">{i+1}</span>
                                            </div>
                                            <span className="text-xs text-rf-text-dim truncate group-hover:text-rf-text-pure transition-colors">{q.text}</span>
                                        </div>
                                        <button onClick={() => removeQuestion(i)} className="p-1.5 text-rf-text-muted hover:text-rf-danger transition-colors shrink-0"><Trash2 size={14} /></button>
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
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-rf-text-dim">{label}</label>
        <input 
            {...props}
            className="w-full bg-rf-surface/50 border border-rf-border-glass rounded-lg px-4 py-2.5 text-sm text-rf-text-pure outline-none focus:border-rf-accent/50 transition-all"
        />
    </div>
);

const ToggleItem = ({ icon, label, active, onClick }) => (
    <div 
        onClick={onClick}
        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${active ? 'bg-rf-accent/10 border-rf-accent/30' : 'bg-rf-panel/20 border-rf-border-glass hover:border-rf-accent/20'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg border ${active ? 'bg-rf-accent text-white border-rf-accent' : 'bg-rf-panel text-rf-accent border-rf-border-glass'}`}>
                {icon}
            </div>
            <span className={`text-sm font-semibold ${active ? 'text-rf-text-pure' : 'text-rf-text-dim'}`}>{label}</span>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'bg-rf-accent border-rf-accent' : 'border-rf-border-glass'}`}>
            {active && <CheckCircle2 size={10} className="text-white" />}
        </div>
    </div>
);

export default CreateExam;
