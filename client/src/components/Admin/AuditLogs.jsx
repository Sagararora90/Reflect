import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../apiConfig';
import { 
  ChevronLeft, 
  User, 
  Database,
  Search,
  FileText,
  Activity,
  Lock,
  AlertCircle,
  Globe
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text-primary pt-24 pb-12 px-6 sm:px-8">
            <div className="max-w-4xl mx-auto">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button className="btn btn-secondary px-3 py-2" onClick={() => navigate('/admin/dashboard')}>
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="heading-2 mb-1">Audit Logs</h1>
                        <p className="text-body mt-0">System activity and admin actions</p>
                    </div>
                </div>
                
                <div className="card px-3 py-2 flex items-center gap-2">
                    <Search size={16} className="text-text-tertiary" />
                    <input 
                        placeholder="Search logs..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary w-44"
                    />
                </div>
            </header>

            {/* Logs List */}
            <div className="card overflow-hidden">
                <div className="divide-y divide-border bg-surface">
                    {filteredLogs.map((log, idx) => (
                        <div 
                            key={idx} 
                            className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:bg-panel/40 transition-colors"
                        >
                            {/* Timestamp */}
                            <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 min-w-[70px] shrink-0">
                                <span className="text-sm font-semibold text-text-primary">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-xs text-text-secondary">
                                    {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-border" />

                            {/* Content */}
                            <div className="flex-1 flex items-center gap-4">
                                <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0">
                                    {getActionIcon(log.action)}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-text-primary truncate">{log.userId?.name || 'System'}</span>
                                        <span className="badge badge-neutral">
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                                        {log.resource && (
                                            <span className="flex items-center gap-1.5"><Database size={12} /> <span className="truncate max-w-[120px]">{log.resource}</span></span>
                                        )}
                                        {log.ipAddress && (
                                            <span className="flex items-center gap-1.5"><Globe size={12} /> {log.ipAddress}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredLogs.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-surface">
                        <FileText size={36} className="text-text-tertiary mb-4 opacity-50" />
                        <h3 className="text-sm font-semibold text-text-primary mb-1">No Logs Found</h3>
                        <p className="text-sm text-text-secondary">
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
