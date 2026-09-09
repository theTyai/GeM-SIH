import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, AlertTriangle, Search, Activity, FileText, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api/v1/extension';

export default function App() {
  const [appState, setAppState] = useState<'IDLE' | 'ANALYZING' | 'RESULTS' | 'ERROR'>('IDLE');
  const [listingData, setListingData] = useState<any>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [auditStatus, setAuditStatus] = useState<string>('');
  const [summary, setSummary] = useState<any>(null);
  const [evidence, setEvidence] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Detect if we are on a valid page (Mocking chrome.tabs for standalone testing)
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'EXTRACT_LISTING' }, (response) => {
            if (response && response.productId) {
              setListingData(response);
            }
          });
        }
      });
    } else {
      // Standalone browser fallback for preview
      setListingData({
        productId: 'gem_demo_' + Date.now(),
        title: 'Dell OptiPlex 7090 Desktop Computer',
        price: 68499,
        url: 'https://mkp.gem.gov.in/demo'
      });
    }
  }, []);

  const startAnalysis = async () => {
    if (!listingData) return;
    setAppState('ANALYZING');
    setAuditStatus('PENDING');

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start analysis');

      setAuditId(data.auditId);
      pollStatus(data.auditId);
    } catch (err: any) {
      setAppState('ERROR');
      setErrorMsg(err.message);
    }
  };

  const pollStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/audits/${id}/status`);
        if (res.ok) {
          const data = await res.json();
          setAuditStatus(data.status);
          
          if (data.status === 'IN_REVIEW' || data.status === 'COMPLIANT' || data.status === 'REJECTED') {
            clearInterval(interval);
            await fetchResults(id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);
  };

  const fetchResults = async (id: string) => {
    try {
      const [sumRes, evRes] = await Promise.all([
        fetch(`${API_BASE}/audits/${id}/summary`),
        fetch(`${API_BASE}/audits/${id}/evidence`)
      ]);
      
      if (sumRes.ok && evRes.ok) {
        setSummary(await sumRes.json());
        setEvidence(await evRes.json());
        setAppState('RESULTS');
      } else {
        throw new Error('Failed to fetch intelligence');
      }
    } catch (err: any) {
      setAppState('ERROR');
      setErrorMsg(err.message);
    }
  };

  const openAudit = () => {
    const url = `http://localhost:3000/?auditId=${auditId}`;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  if (!listingData) {
    return (
      <div className="p-6 text-center space-y-4 text-slate-500 flex flex-col items-center justify-center h-[500px]">
        <Search className="w-12 h-12 opacity-20" />
        <p className="font-medium">Navigate to a GeM product listing to begin analysis.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-slate-50">
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h1 className="font-black tracking-wider text-sm uppercase">GeM-Intel</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Listing Header */}
        <div className="mb-6">
          <h2 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-1">{listingData.title}</h2>
          <p className="text-xl font-black text-slate-900">₹{listingData.price.toLocaleString()}</p>
        </div>

        {appState === 'IDLE' && (
          <div className="space-y-4 mt-12">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
              <Activity className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs text-indigo-800 font-medium">Ready to extract immutable evidence and perform deterministic market analysis.</p>
            </div>
            <button 
              onClick={startAnalysis}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2"
            >
              Analyze Listing
            </button>
          </div>
        )}

        {appState === 'ANALYZING' && (
          <div className="space-y-6 mt-8">
            <div className="flex justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={auditStatus === 'PENDING' || auditStatus === 'SCRAPING' ? 'text-indigo-600' : 'text-slate-400'}>1. Evidence Capture</span>
                {auditStatus !== 'PENDING' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={auditStatus === 'MATCHING' ? 'text-indigo-600' : 'text-slate-400'}>2. Specification Match</span>
                {(auditStatus === 'SCORING' || auditStatus === 'IN_REVIEW') && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={auditStatus === 'SCORING' ? 'text-indigo-600' : 'text-slate-400'}>3. Risk Calculation</span>
                {auditStatus === 'IN_REVIEW' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
            </div>
          </div>
        )}

        {appState === 'RESULTS' && summary && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            
            {/* Risk Card */}
            <div className={`p-4 rounded-xl border ${summary.riskLevel === 'HIGH' ? 'bg-red-50 border-red-200' : summary.riskLevel === 'REVIEW' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
               <div className="flex justify-between items-start mb-3">
                 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Procurement Risk</p>
                 <span className={`text-xs font-black uppercase ${summary.riskLevel === 'HIGH' ? 'text-red-600' : summary.riskLevel === 'REVIEW' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {summary.riskLevel === 'HIGH' ? '🔴 HIGH' : summary.riskLevel === 'REVIEW' ? '🟡 REVIEW' : '🟢 LOW'}
                 </span>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mb-4">
                 <div>
                   <p className="text-[10px] text-slate-500 uppercase font-bold">Market FMV</p>
                   <p className="text-sm font-black text-slate-800">₹{summary.fmv.toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] text-slate-500 uppercase font-bold">Variance</p>
                   <p className={`text-sm font-black ${parseFloat(summary.variancePct) > 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                     {parseFloat(summary.variancePct) > 0 ? '+' : ''}{parseFloat(summary.variancePct).toFixed(1)}%
                   </p>
                 </div>
               </div>

               <div className="pt-3 border-t border-black/5 flex justify-between items-center">
                 <p className="text-xs text-slate-600"><strong>{summary.specMatchScore}%</strong> Spec Match</p>
                 <button className="text-[10px] font-bold text-indigo-600 hover:underline">Why?</button>
               </div>
            </div>

            {/* Evidence Verification Indicator */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-3 shadow-sm">
               {evidence?.verified ? (
                 <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
               ) : (
                 <Loader2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
               )}
               <div>
                 <p className="text-xs font-bold text-slate-800">{evidence?.verified ? 'Evidence Verified' : 'Evidence Pending'}</p>
                 {evidence?.verified && evidence.snapshots?.[0] && (
                   <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate w-64">
                     SHA: {evidence.snapshots[0].hash}
                   </p>
                 )}
               </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-2">
              <span>Rule Set: {summary.rulesVersion.substring(0,8)}</span>
              <span>Audit #{auditId?.substring(0,6)}</span>
            </div>
          </div>
        )}

        {appState === 'ERROR' && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            <AlertTriangle className="w-6 h-6 mb-2" />
            {errorMsg}
          </div>
        )}
      </div>

      {appState === 'RESULTS' && (
        <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <button 
            onClick={openAudit}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex justify-center items-center gap-2"
          >
            Open Full Audit <FileText className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
