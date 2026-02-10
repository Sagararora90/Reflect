import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../apiConfig';
import { 
  ChevronLeft, 
  User, 
  Calendar, 
  Activity, 
  Lock, 
  Globe, 
  AlertCircle,
  Database,
  Clock,
  Search,
  FileText
} from 'lucide-react';


const AuditLogs = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/audit`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setLogs(data || []);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        const a = action.toLowerCase();
        if (a.includes('login') || a.includes('auth')) return <Lock size={14} />;
        if (a.includes('create') || a.includes('add')) return <Database size={14} />;
        if (a.includes('delete') || a.includes('remove')) return <AlertCircle size={14} />;
        return <Activity size={14} />;
    };

    const filteredLogs = logs.filter(log => 
        log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-rf-canvas flex items-center justify-center rf-animate-bloom">
                <div className="w-10 h-10 border-3 border-rf-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rf-canvas pt-24 pb-12 px-4 sm:px-6 lg:px-8 rf-animate-bloom">
            <div className="max-w-4xl mx-auto">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button className="p-2 rf-btn rf-btn-secondary !rounded-lg" onClick={() => navigate('/admin/dashboard')}>
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-rf-text-pure">Audit Logs</h1>
                        <p className="text-xs text-rf-text-dim">System activity and admin actions</p>
                    </div>
                </div>
                
                <div className="rf-card-glass px-3 py-2 flex items-center gap-2 border-rf-border-glass">
                    <Search size={15} className="text-rf-text-muted" />
                    <input 
                        placeholder="Search logs..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm text-rf-text-pure placeholder:text-rf-text-muted w-44"
                    />
                </div>
            </header>

            {/* Logs List */}
            <div className="space-y-2">
                {filteredLogs.map((log, idx) => (
                    <div 
                        key={idx} 
                        className="rf-card-glass p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 hover:border-rf-accent/20 transition-all"
                    >
                        {/* Timestamp */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 min-w-[70px] shrink-0">
                            <span className="text-sm font-bold text-rf-text-pure">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-rf-text-muted">
                                {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-rf-border-glass" />

                        {/* Content */}
                        <div className="flex-1 flex items-center gap-4">
                            <div className="p-2 bg-rf-accent/10 border border-rf-accent/20 rounded-lg text-rf-accent shrink-0">
                                {getActionIcon(log.action)}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <span className="text-sm font-semibold text-rf-text-pure">{log.userId?.name || 'System'}</span>
                                    <span className="px-2 py-0.5 bg-rf-accent/10 text-rf-accent border border-rf-accent/20 rounded text-[10px] font-semibold">
                                        {log.action.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-rf-text-muted">
                                    {log.resource && (
                                        <span className="flex items-center gap-1"><Database size={10} /> {log.resource}</span>
                                    )}
                                    {log.ipAddress && (
                                        <span className="flex items-center gap-1"><Globe size={10} /> {log.ipAddress}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredLogs.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <FileText size={36} className="text-rf-text-muted mb-3 opacity-30" />
                        <h3 className="text-base font-bold text-rf-text-pure mb-1">No Logs Found</h3>
                        <p className="text-sm text-rf-text-dim">
                            {searchQuery ? 'No logs match your search.' : 'No activity has been recorded yet.'}
                        </p>
                    </div>
                )}
            </div>
            
            </div>
        </div>
    );
};

export default AuditLogs;
