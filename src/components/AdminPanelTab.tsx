import React, { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Users, Sliders, Database, Save, CheckCircle, Loader2 } from 'lucide-react';
import { USERS } from '../auth';

export default function AdminPanelTab() {
  const [activeSection, setActiveSection] = useState<'RULES' | 'USERS' | 'SYSTEM'>('RULES');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [rules, setRules] = useState({
    autoFlagVariancePct: 15,
    minSpecMatchConfidence: 80,
    blockOrderThresholdPct: 30
  });

  useEffect(() => {
    fetch('/api/v1/rules/current')
      .then(res => res.json())
      .then(data => {
        if (data.autoFlagVariancePct) {
          setRules({
            autoFlagVariancePct: parseFloat(data.autoFlagVariancePct),
            minSpecMatchConfidence: parseFloat(data.minSpecMatchConfidence),
            blockOrderThresholdPct: parseFloat(data.blockOrderThresholdPct)
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules)
      });
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up w-full max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Admin Control Panel</h2>
          <p className="text-slate-500 text-sm mt-1">Configure system rules, risk thresholds, and manage user access.</p>
        </div>
        {activeSection === 'RULES' && (
          <button 
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaved ? 'Saved' : 'Save Rules'}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveSection('RULES')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeSection === 'RULES' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'bg-white text-slate-600 border border-transparent hover:bg-slate-50 border-slate-200'}`}
          >
            <Sliders className="w-5 h-5" /> Intelligence Rules
          </button>
          <button 
            onClick={() => setActiveSection('USERS')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeSection === 'USERS' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'bg-white text-slate-600 border border-transparent hover:bg-slate-50 border-slate-200'}`}
          >
            <Users className="w-5 h-5" /> User Management
          </button>
          <button 
            onClick={() => setActiveSection('SYSTEM')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeSection === 'SYSTEM' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'bg-white text-slate-600 border border-transparent hover:bg-slate-50 border-slate-200'}`}
          >
            <Database className="w-5 h-5" /> System Health
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {activeSection === 'RULES' && (
            <div className="p-6 md:p-8 space-y-8">
              {loading ? (
                <div className="flex justify-center p-12">
                   <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-indigo-600" /> Automated Risk Thresholds
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">Configure the automated triggers that flag audits for manual officer review. All changes are cryptographically versioned.</p>
                    
                    <div className="space-y-6 max-w-2xl">
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-bold text-slate-700">Auto-Flag Price Variance (%)</label>
                          <span className="text-indigo-600 font-black">{rules.autoFlagVariancePct}%</span>
                        </div>
                        <input 
                          type="range" min="5" max="100" step="1"
                          value={rules.autoFlagVariancePct}
                          onChange={(e) => setRules({...rules, autoFlagVariancePct: parseInt(e.target.value)})}
                          className="w-full accent-indigo-600"
                        />
                        <p className="text-xs text-slate-500">Any product priced higher than FMV by this percentage will be automatically flagged for review.</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-bold text-slate-700">Auto-Block Order Variance (%)</label>
                          <span className="text-red-600 font-black">{rules.blockOrderThresholdPct}%</span>
                        </div>
                        <input 
                          type="range" min="20" max="200" step="5"
                          value={rules.blockOrderThresholdPct}
                          onChange={(e) => setRules({...rules, blockOrderThresholdPct: parseInt(e.target.value)})}
                          className="w-full accent-red-600"
                        />
                        <p className="text-xs text-slate-500">Hard stop. Prevents issuance of certificate completely if variance exceeds this limit.</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-600" /> AI Evidence Constraints
                    </h3>
                    <div className="space-y-6 max-w-2xl mt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-bold text-slate-700">Minimum Spec Match Confidence (0-100)</label>
                          <span className="text-emerald-600 font-black">{rules.minSpecMatchConfidence}</span>
                        </div>
                        <input 
                          type="range" min="50" max="100" step="1"
                          value={rules.minSpecMatchConfidence}
                          onChange={(e) => setRules({...rules, minSpecMatchConfidence: parseInt(e.target.value)})}
                          className="w-full accent-emerald-600"
                        />
                        <p className="text-xs text-slate-500">The minimum confidence score required from the Gemini AI to consider a market snapshot as valid evidence for FMV calculation.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeSection === 'USERS' && (
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Active Users
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {USERS.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {user.name}
                          <div className="text-xs text-slate-500 font-normal">{user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'OFFICER' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{user.department}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-indigo-600 hover:underline font-medium text-xs">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'SYSTEM' && (
            <div className="p-6 md:p-8">
               <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" /> System Integrations
              </h3>
              <div className="space-y-4 max-w-2xl">
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                   <div>
                     <p className="font-bold text-slate-800">Gemini 2.5 Pro API</p>
                     <p className="text-xs text-slate-500 mt-1">Used for spec extraction and unstructured analysis</p>
                   </div>
                   <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-lg">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     Connected
                   </div>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                   <div>
                     <p className="font-bold text-slate-800">GeM Marketplace API</p>
                     <p className="text-xs text-slate-500 mt-1">Source of truth for initial listings</p>
                   </div>
                   <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-lg">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     Connected
                   </div>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between opacity-60">
                   <div>
                     <p className="font-bold text-slate-800">PFMS / IFD Integration</p>
                     <p className="text-xs text-slate-500 mt-1">Public Financial Management System</p>
                   </div>
                   <div className="flex items-center gap-2 text-slate-500 text-sm font-bold bg-slate-100 px-3 py-1 rounded-lg">
                     Pending
                   </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
