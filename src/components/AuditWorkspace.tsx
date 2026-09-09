import React, { useState, useEffect } from 'react';
import { ApiAuditDetail } from '../types';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Loader2, Link2, Download, FileText, ChevronRight, ShieldCheck, Scale, Globe, Database, BrainCircuit, Activity } from 'lucide-react';

import { User } from '../types';

export default function AuditWorkspace({ auditId, onBack, onShowToast, currentUser }: { auditId: string, onBack: () => void, onShowToast: (msg: string, type: 'success'|'error') => void, currentUser: User | null }) {
  const [data, setData] = useState<ApiAuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [decision, setDecision] = useState<'ISSUE_CERTIFICATE' | 'REJECT' | 'JUSTIFY_AND_PROCEED' | null>(null);
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/audits/${auditId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch audit data');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [auditId]);

  const submitDecision = async () => {
    if (!decision) return;
    if ((data?.audit.riskLevel === 'HIGH' || decision === 'REJECT') && !justification) {
      onShowToast('Justification is mandatory for this decision.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/audits/${auditId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, justification })
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to submit decision');
      
      onShowToast(result.message || 'Decision recorded', 'success');
      
      // Refresh the page data
      const refreshRes = await fetch(`/api/v1/audits/${auditId}`);
      if (refreshRes.ok) setData(await refreshRes.json());
      
    } catch (err: any) {
      onShowToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  if (error || !data) return <div className="p-12 text-center text-red-500 font-bold">Error: {error}</div>;

  const { audit, listing, rules, snapshots, aiAnalysis, scoreProvenance, decisions } = data;
  
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Audit Workspace</h2>
          <p className="text-slate-500 text-sm mt-1">{listing.title} • {audit.gemListingId}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
             audit.status === 'COMPLIANT' ? 'bg-emerald-100 text-emerald-700' :
             audit.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
             audit.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-700' :
             'bg-slate-100 text-slate-700'
           }`}>
             {audit.status}
           </span>
           {audit.riskLevel && (
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                audit.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                audit.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
             }`}>
               {audit.riskLevel} RISK
             </span>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Evidence & AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
               <Database className="w-5 h-5 text-indigo-500" />
               <h3 className="font-bold text-slate-800">Immutable Evidence Snapshots</h3>
             </div>
             <div className="p-4 space-y-4">
                {snapshots.length === 0 ? <p className="text-slate-500 text-sm">No evidence captured yet.</p> : null}
                {snapshots.map(snap => (
                  <div key={snap.id} className="border border-slate-100 rounded-xl p-4">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <p className="font-bold text-slate-800">{snap.sourcePlatform}</p>
                         <a href={snap.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline break-all">
                           {snap.sourceUrl}
                         </a>
                       </div>
                       <div className="text-right">
                         <p className="text-xs font-medium text-slate-500 mb-1">Captured</p>
                         <p className="text-sm font-bold text-slate-700">{new Date(snap.scrapedAt).toLocaleString()}</p>
                       </div>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 rounded-lg p-3">
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Base Price</p>
                          <p className="text-sm font-bold">{snap.basePrice ? `₹${snap.basePrice}` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Landed Cost</p>
                          <p className="text-sm font-bold text-indigo-700">{snap.landedCost ? `₹${snap.landedCost}` : 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">WORM Evidence Hash</p>
                          <p className="text-[10px] font-mono text-slate-600 break-all">{snap.evidenceSha256 || 'Pending...'}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
               <BrainCircuit className="w-5 h-5 text-indigo-500" />
               <h3 className="font-bold text-slate-800">AI Specification Analysis</h3>
             </div>
             <div className="p-4 space-y-4">
                {aiAnalysis.length === 0 ? <p className="text-slate-500 text-sm">No AI analysis available.</p> : null}
                {aiAnalysis.map(analysis => (
                  <div key={analysis.id} className="border border-slate-100 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Model: {analysis.model}</p>
                        <p className="text-xs text-slate-500">Score: {analysis.specMatchScore}/100</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Provenance Hash</p>
                        <p className="text-[10px] font-mono text-slate-600">{analysis.responseHash.substring(0, 16)}...</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase">Mismatches</p>
                      {analysis.resultJson?.mismatches?.map((m: any, i: number) => (
                         <div key={i} className="flex items-center gap-2 text-sm bg-red-50 text-red-800 p-2 rounded border border-red-100">
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="font-medium">{m.attribute}:</span> Expected {m.target}, Found {m.observed}
                         </div>
                      ))}
                      {(!analysis.resultJson?.mismatches || analysis.resultJson.mismatches.length === 0) && (
                         <p className="text-xs text-emerald-600 font-medium">No mismatches found.</p>
                      )}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Scoring & Decision */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
               <Scale className="w-5 h-5 text-indigo-500" />
               <h3 className="font-bold text-slate-800">Deterministic Scoring</h3>
             </div>
             <div className="p-4">
                {scoreProvenance ? (
                   <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Target Price</p>
                          <p className="text-lg font-black text-slate-800">₹{listing.listedPrice}</p>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Calculated FMV</p>
                          <p className="text-lg font-black text-indigo-600">₹{scoreProvenance.fmv || 'N/A'}</p>
                       </div>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Price Variance</p>
                        <p className={`text-2xl font-black ${scoreProvenance.priceVariancePct && parseFloat(scoreProvenance.priceVariancePct) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                           {scoreProvenance.priceVariancePct ? `${parseFloat(scoreProvenance.priceVariancePct) > 0 ? '+' : ''}${parseFloat(scoreProvenance.priceVariancePct).toFixed(1)}%` : 'N/A'}
                        </p>
                     </div>
                     <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                       <p className="text-xs font-bold text-slate-800">Calculation Logs</p>
                       <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                          {scoreProvenance.resultJson?.details?.map((detail: string, i: number) => (
                             <li key={i}>{detail}</li>
                          ))}
                       </ul>
                     </div>
                   </div>
                ) : (
                  <p className="text-slate-500 text-sm">Scoring not completed yet.</p>
                )}
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-indigo-500" />
               <h3 className="font-bold text-slate-800">Officer Decision</h3>
             </div>
             <div className="p-4">
                {audit.status === 'IN_REVIEW' ? (
                   <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Decision</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
                          value={decision || ''}
                          onChange={(e) => setDecision(e.target.value as any)}
                        >
                          <option value="" disabled>Select a decision...</option>
                          <option value="ISSUE_CERTIFICATE">APPROVE: Issue Certificate</option>
                          <option value="JUSTIFY_AND_PROCEED">JUSTIFY: Proceed with warning</option>
                          <option value="REJECT">REJECT: Block transaction</option>
                        </select>
                      </div>

                      {(decision === 'REJECT' || audit.riskLevel === 'HIGH' || decision === 'JUSTIFY_AND_PROCEED') && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Mandatory Justification</label>
                          <textarea 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                            rows={3}
                            placeholder="Enter the official reason for this decision..."
                            value={justification}
                            onChange={e => setJustification(e.target.value)}
                          />
                        </div>
                      )}

                      <button 
                        onClick={submitDecision}
                        disabled={submitting || !decision}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        Submit Decision & Sign
                      </button>
                   </div>
                ) : (
                   <div className="text-center py-6">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
                        audit.status === 'COMPLIANT' ? 'bg-emerald-100 text-emerald-600' : 
                        audit.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                         {audit.status === 'COMPLIANT' ? <CheckCircle className="w-6 h-6" /> : 
                          audit.status === 'REJECTED' ? <XCircle className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin" />}
                      </div>
                      <p className="font-bold text-slate-800 text-lg mb-1">{audit.status}</p>
                      {audit.certificateLedgerRef && (
                         <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-left">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ledger Certificate Hash</p>
                           <p className="text-[10px] font-mono text-slate-700 break-all">{audit.certificateLedgerRef}</p>
                         </div>
                      )}
                   </div>
                )}
             </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
               <Activity className="w-5 h-5 text-indigo-500" />
               <h3 className="font-bold text-slate-800">Decision History</h3>
             </div>
             <div className="p-4 space-y-3">
               {decisions.length === 0 ? <p className="text-xs text-slate-500">No decisions recorded.</p> : null}
               {decisions.map(d => (
                 <div key={d.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-xs text-slate-700">{d.decision}</span>
                      <span className="text-[10px] text-slate-400">{new Date(d.createdAt).toLocaleString()}</span>
                    </div>
                    {d.justification && <p className="text-xs text-slate-600 italic">"{d.justification}"</p>}
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
      
        {/* Auditor Provenance Chain */}
        {currentUser?.role === 'AUDITOR' && (
          <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-700 shadow-xl overflow-hidden mt-8">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">Cryptographic Provenance Chain</h3>
            </div>
            <div className="p-6">
               <div className="space-y-4">
                  <div className="flex flex-col relative pl-6 border-l-2 border-slate-700 space-y-8">
                     
                     <div className="relative">
                        <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-900 mt-1"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">1. Evidence Captured</p>
                        <div className="flex flex-col gap-2">
                          {snapshots.map(s => (
                            <div key={s.id} className="bg-slate-800 p-2 rounded-lg border border-slate-700 flex justify-between items-center">
                               <span className="text-xs text-slate-300 font-mono truncate max-w-[200px]">{s.evidenceSha256 || 'Awaiting WORM Sync...'}</span>
                               <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300">{s.sourcePlatform}</span>
                            </div>
                          ))}
                        </div>
                     </div>

                     <div className="relative">
                        <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-indigo-500/20 border-2 border-slate-900 mt-1 flex items-center justify-center"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">2. AI Provenance</p>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <p className="text-xs text-slate-300">Model: <span className="font-mono text-indigo-400">{aiAnalysis?.aiModelVersion || 'gemini-3.6-flash'}</span></p>
                          <p className="text-xs text-slate-300 mt-1">Prompt Hash: <span className="font-mono text-slate-500">{aiAnalysis?.promptHash || 'simulated_hash'}</span></p>
                        </div>
                     </div>

                     <div className="relative">
                        <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-emerald-500/20 border-2 border-slate-900 mt-1 flex items-center justify-center"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">3. Immutable Rules Engine</p>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                          <span className="text-xs text-slate-300 font-mono">{rules?.id || 'v1.0.0'}</span>
                          <span className="text-[10px] text-emerald-400 uppercase font-bold">Active</span>
                        </div>
                     </div>

                     <div className="relative">
                        <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-900 mt-1"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">4. Officer Decision</p>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <p className="text-xs text-slate-300">Identity: <span className="font-mono text-slate-400">{audit.decidedBy || 'Pending'}</span></p>
                          <p className="text-xs text-slate-300 mt-1">Action: <span className="font-bold text-white">{audit.decision || 'Pending'}</span></p>
                        </div>
                     </div>

                     <div className="relative">
                        <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-900 mt-1"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">5. Ledger Anchor</p>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <p className="text-xs text-slate-300">Certificate Hash: <span className="font-mono text-amber-400">{audit.certificateLedgerRef || 'Not Issued'}</span></p>
                        </div>
                     </div>

                  </div>
               </div>
            </div>
          </div>
        )}

    </div>
  );
}
