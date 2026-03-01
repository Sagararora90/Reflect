import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, Bell, Lock, Globe, Save, Monitor } from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'security', label: 'Security & Integrity', icon: Shield },
        { id: 'preferences', label: 'Preferences', icon: Globe },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-6 sm:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white border border-border shadow-sm rounded-xl flex items-center justify-center text-primary">
                        <Monitor size={22} />
                    </div>
                    <div>
                        <h1 className="heading-2">Platform Settings</h1>
                        <p className="text-text-secondary mt-1">Manage your account and assessment preferences.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="w-full md:w-64 shrink-0 space-y-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                                        isActive 
                                        ? 'bg-white text-primary shadow-sm border border-border/60' 
                                        : 'text-text-secondary hover:bg-panel hover:text-text-primary border border-transparent'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 space-y-6">
                        {activeTab === 'profile' && (
                            <div className="card p-6 md:p-8">
                                <h2 className="heading-3 mb-6">Profile Settings</h2>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text-primary">Full Name</label>
                                            <input type="text" className="input-field" defaultValue={user?.name || ''} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text-primary">Email Address</label>
                                            <input type="email" className="input-field bg-panel" defaultValue={user?.email || ''} readOnly />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-text-primary">Role</label>
                                        <input type="text" className="input-field bg-panel cursor-not-allowed text-text-secondary" defaultValue={user?.role?.toUpperCase() || ''} readOnly disabled />
                                    </div>
                                    
                                    <div className="pt-6 mt-6 border-t border-border flex justify-end">
                                        <button className="btn btn-primary"><Save size={16} /> Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="card p-6 md:p-8">
                                <h2 className="heading-3 mb-1">Security & Integrity Tracking</h2>
                                <p className="text-sm text-text-secondary mb-8">Configure the strictness of the automated proctoring Watcher.</p>
                                
                                <div className="space-y-4">
                                    <div className="p-4 border border-border rounded-xl bg-surface flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-text-primary mb-1">Strict Mode Proctoring</h3>
                                            <p className="text-xs text-text-secondary">Aggressively flags gaze movement and background noise.</p>
                                        </div>
                                        <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" defaultChecked />
                                    </div>

                                    <div className="p-4 border border-border rounded-xl bg-surface flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-text-primary mb-1">Enforce Fullscreen Lock</h3>
                                            <p className="text-xs text-text-secondary">Immediately auto-submit exams if the student exits fullscreen.</p>
                                        </div>
                                        <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                                    </div>
                                    
                                    <div className="space-y-4 pt-6 mt-2 border-t border-border">
                                        <h3 className="text-sm font-semibold text-text-primary">Change Password</h3>
                                        <input type="password" placeholder="Current Password" className="input-field max-w-sm" />
                                        <input type="password" placeholder="New Password" className="input-field max-w-sm" />
                                        <div className="flex justify-start pt-2">
                                            <button className="btn btn-secondary"><Lock size={16} /> Update Password</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="card p-6 md:p-8">
                                <h2 className="heading-3 mb-6">Platform Preferences</h2>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-text-primary">Timezone</label>
                                        <select className="input-field max-w-md">
                                            <option>GMT+00:00 (UTC)</option>
                                            <option>GMT-05:00 (EST)</option>
                                            <option>GMT+05:30 (IST)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-text-primary">Language</label>
                                        <select className="input-field max-w-md">
                                            <option>English</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="card p-6 md:p-8">
                                <h2 className="heading-3 mb-6">Email Notifications</h2>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Exam Completion Reports', desc: 'Receive a summary when an exam ends.' },
                                        { label: 'Security Alerts', desc: 'Get notified of severe proctoring violations instantly.' },
                                        { label: 'System Updates', desc: 'News about Reflect platform changes.' }
                                    ].map((item, i) => (
                                        <label key={i} className="flex flex-row items-center justify-between p-4 border border-border rounded-xl cursor-pointer hover:bg-panel/50 transition-colors bg-surface">
                                            <div>
                                                <p className="font-semibold text-text-primary text-sm mb-1">{item.label}</p>
                                                <p className="text-xs text-text-secondary">{item.desc}</p>
                                            </div>
                                            <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked={i < 2} />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
