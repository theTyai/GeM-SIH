const fs = require('fs');
const path = 'src/VerifyCertificateView.tsx';

const content = `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ShieldCheck, ArrowLeft, ExternalLink, Link as LinkIcon, AlertTriangle, Link2, Copy, ChevronRight } from 'lucide-react';
import { MOCK_DB } from './data';

export default function VerifyCertificateView() {
  const { id } = useParams<{ id: string }>();
  
  // Extract product ID from cert ID (e.g., CERT-2026-004 -> p4)
  const productId = id?.replace('CERT-2026-00', 'p');
  const auditData = (productId && MOCK_DB[productId]) ? MOCK_DB[productId] : null;

  if (!auditData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Certificate Not Found</h1>
          <p className="text-slate-500 mb-6">The supplied certificate could not be verified in the cryptographic ledger.</p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-sm text-slate-700 mb-6">
            Certificate ID: {id}
          </div>
          <Link to="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isHighRisk = auditData.verdict === 'HIGH RISK' || auditData.verdict === 'REVIEW';
  const verdictColor = auditData.verdict === 'COMPLIANT' ? 'emerald' : auditData.verdict === 'REVIEW' ? 'amber' : 'red';
  const mockHash = "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4";
  const prevHash = "0000000000000000000000000000000000000000000000000000000000000000";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sm:px-10 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg shadow-md flex items-center justify-center text-white font-bold italic text-sm">GI</div>
          <span className="text-lg font-extrabold tracking-tight text-slate-800">GeM-Intel Verify</span>
        </div>
        <Link to="/" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to App
        </Link>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8 animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 px-6 sm:px-8 py-6 flex justify-between items-start sm:items-center text-white shrink-0 flex-col sm:flex-row gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" /> VERIFIED PROCUREMENT AUDIT
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{auditData.name}</h2>
            </div>
            <div className="text-left sm:text-right shrink-0">
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Status</p>
               <div className="inline-flex items-center gap-2 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-lg font-bold text-sm">
                 <CheckCircle className="w-4 h-4" /> VALID CERTIFICATE
               </div>
            </div>
          </div>
          
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto bg-slate-50" style={{backgroundImage: \`url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")\`}}>
            <div className="space-y-8">
              
              {/* Issue Information */}
              <div className="flex flex-wrap gap-6 sm:gap-10 text-xs font-bold uppercase tracking-wider text-slate-500 pb-6 border-b border-slate-200">
                <div>
                    <span className="block opacity-70 mb-1">Certificate ID</span>
                    <span className="text-slate-900 font-mono text-sm">{id}</span>
                </div>
                <div>
                    <span className="block opacity-70 mb-1">Audit ID</span>
                    <span className="text-slate-900 font-mono text-sm">AUDIT-2026-00{productId?.replace('p', '')}</span>
                </div>
                <div>
                    <span className="block opacity-70 mb-1">Issued</span>
                    <span className="text-slate-900 text-sm">07 Sep 2026</span>
                </div>
              </div>

              {/* Verdict Banner */}
              <div className={\`bg-\${verdictColor}-50 border border-\${verdictColor}-200 p-6 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm\`}>
                  <div className={\`w-14 h-14 rounded-full bg-\${verdictColor}-100 flex items-center justify-center shrink-0\`}>
                    {auditData.verdict === 'COMPLIANT' ? <CheckCircle className={\`w-7 h-7 text-\${verdictColor}-600\`} /> : <AlertTriangle className={\`w-7 h-7 text-\${verdictColor}-600\`} />}
                  </div>
                  <div>
                    <h3 className={\`text-2xl font-black text-\${verdictColor}-900 uppercase tracking-tight mb-1\`}>{auditData.verdict}</h3>
                    <p className={\`text-sm text-\${verdictColor}-800 font-medium\`}>
                        {auditData.verdict === 'COMPLIANT' ? 'Procurement price aligns with fair market value bounds.' : 'Market-normalized price exceeds calculated fair market value.'}
                    </p>
                  </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">GeM Price</p>
                    <p className="text-xl font-black text-slate-900">₹{auditData.gemPrice.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fair Market Value</p>
                    <p className="text-xl font-black text-slate-900">₹{auditData.fmv.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Variance</p>
                    <p className={\`text-xl font-black \${auditData.variance > 0 ? 'text-red-600' : 'text-emerald-600'}\`}>
                      {auditData.variance > 0 ? '+' : ''}{auditData.variance.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence</p>
                    <p className="text-xl font-black text-indigo-600">{auditData.confidence.overall}%</p>
                  </div>
              </div>

              {/* Why Flagged / Reasoning */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">Why This Audit Was Flagged</h3>
                <ul className="space-y-4">
                  {auditData.evidence.map((ev: string, idx: number) => (
                    <li key={idx} className="flex gap-4 text-sm text-slate-700 font-medium items-start">
                      <span className={\`shrink-0 mt-0.5 \${auditData.verdict === 'COMPLIANT' ? 'text-emerald-500' : 'text-amber-500'}\`}>
                        {auditData.verdict === 'COMPLIANT' ? <CheckCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      </span>
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Evidence Summary */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                  Evidence Sources
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {auditData.results.filter((r: any) => r.url).map((src: any, idx: number) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col group relative">
                      {src.imageUrl && (
                        <div className="h-40 bg-slate-100 relative overflow-hidden">
                          <img src={src.imageUrl} alt={auditData.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML='<div class="w-full h-full flex flex-col items-center justify-center text-slate-400"><svg class="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span class="text-xs font-bold uppercase tracking-wider">Product Evidence</span></div>'; }} />
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-md text-[10px] font-bold uppercase text-slate-800 shadow-sm border border-slate-200/50 tracking-wider">
                            {src.plat}
                          </div>
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">{src.evidenceType || 'Market Evidence'}</p>
                        <p className="font-black text-xl text-slate-900 mb-4">₹{src.landed.toLocaleString()}</p>
                        <div className="mt-auto pt-4 border-t border-slate-100">
                          <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 group-hover:underline w-fit">
                            Open Source <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Integrity */}
              <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative shadow-xl mt-8">
                  <div className="absolute -right-10 -top-10 text-slate-800 opacity-40 pointer-events-none">
                    <Link2 className="w-48 h-48" />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-8 relative z-10 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Cryptographic Integrity
                  </h3>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence Hash</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-slate-200 break-all bg-black/40 px-3 py-1.5 rounded-lg border border-slate-700/50">
                          {mockHash}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previous Hash</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-slate-500 break-all bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800/50">
                          {prevHash}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Evidence Integrity</span>
                        <span className="text-emerald-400 text-xs font-bold">VERIFIED</span>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Hash Match</span>
                        <span className="text-emerald-400 text-xs font-bold">VERIFIED</span>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Chain Link</span>
                        <span className="text-emerald-400 text-xs font-bold">VERIFIED</span>
                      </div>
                    </div>
                  </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
`;

fs.writeFileSync(path, content);
