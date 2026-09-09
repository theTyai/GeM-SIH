import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle, FileText, Loader2, XCircle } from 'lucide-react';
import { ApiAuditListResponse } from '../types';

export default function AuditQueueTab({ onSelectAudit }: { onSelectAudit: (auditId: string) => void }) {
  const [filter, setFilter] = useState<'ALL' | 'IN_REVIEW' | 'COMPLIANT' | 'REJECTED' | 'PENDING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [audits, setAudits] = useState<ApiAuditListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/audits');
        if (!res.ok) throw new Error('Failed to fetch audits');
        const data = await res.json();
        setAudits(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  const filteredAudits = audits.filter(audit => {
    const matchesFilter = filter === 'ALL' || audit.status === filter;
    const searchTarget = `${audit.id} ${audit.title || ''} ${audit.gemListingId}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="animate-fade-in-up w-full max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Audit Cases</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and review pending procurement audits.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID, Product Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['ALL', 'PENDING', 'IN_REVIEW', 'COMPLIANT', 'REJECTED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100 min-h-[400px]">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
               <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-medium">
               Error: {error}
            </div>
          ) : filteredAudits.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-medium">No audit cases found matching criteria.</p>
            </div>
          ) : (
            filteredAudits.map((audit) => (
              <div key={audit.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer" onClick={() => onSelectAudit(audit.id)}>
                
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 md:mt-0 ${
                    audit.status === 'COMPLIANT' ? 'bg-emerald-100 text-emerald-600' : 
                    audit.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                    audit.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-600' : 
                    'bg-indigo-100 text-indigo-600'
                  }`}>
                    {audit.status === 'COMPLIANT' ? <CheckCircle className="w-5 h-5" /> : 
                     audit.status === 'REJECTED' ? <XCircle className="w-5 h-5" /> :
                     audit.status === 'IN_REVIEW' ? <AlertTriangle className="w-5 h-5" /> : 
                     <ShieldCheck className="w-5 h-5" />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{audit.gemListingId}</span>
                      {audit.riskLevel && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          audit.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' : 
                          audit.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {audit.riskLevel} RISK
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{audit.title || 'Pending Capture...'}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                      <span>Listed: ₹{audit.listedPrice ? parseFloat(audit.listedPrice).toLocaleString() : '---'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>Created: {new Date(audit.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 ml-14 md:ml-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Variance</p>
                    <p className={`font-black text-lg ${audit.priceVariancePct ? (parseFloat(audit.priceVariancePct) > 0 ? 'text-red-600' : 'text-emerald-600') : 'text-slate-400'}`}>
                      {audit.priceVariancePct ? `${parseFloat(audit.priceVariancePct) > 0 ? '+' : ''}${parseFloat(audit.priceVariancePct).toFixed(1)}%` : '---'}
                    </p>
                  </div>
                  <div className="text-right hidden lg:block w-32">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                     <p className="text-sm font-bold text-slate-700">{audit.status}</p>
                  </div>
                  <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition-colors shrink-0">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
