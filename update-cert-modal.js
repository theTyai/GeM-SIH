const fs = require('fs');

const path = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `
        {/* Certificate Modal */}
        {modalCert && (
          <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm animate-fade-in overflow-y-auto" onClick={(e) => {if(e.target === e.currentTarget) setModalCert(null);}}>
            <div className="bg-white rounded-2xl w-full max-w-3xl my-8 flex flex-col shadow-2xl relative overflow-hidden">
              {(() => {
                 const certAuditId = modalCert.id.replace('CERT-2026-00', 'p');
                 const certAuditData = MOCK_DB[certAuditId] || Object.values(MOCK_DB)[1];
                 const isHighRisk = certAuditData.verdict === 'HIGH RISK' || certAuditData.verdict === 'REVIEW';
                 const verdictColor = certAuditData.verdict === 'COMPLIANT' ? 'emerald' : certAuditData.verdict === 'REVIEW' ? 'amber' : 'red';
                 
                 return (
                   <>
                     {/* Header */}
                     <div className="bg-slate-900 px-6 py-5 flex justify-between items-start sm:items-center text-white shrink-0 flex-col sm:flex-row gap-4">
                       <div>
                         <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                           <ShieldCheck className="w-4 h-4" /> VERIFIED PROCUREMENT AUDIT
                         </div>
                         <h2 className="text-2xl font-black text-white">{certAuditData.name}</h2>
                       </div>
                       <button onClick={() => setModalCert(null)} className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 absolute top-4 right-4 sm:static">
                         <X className="w-6 h-6" />
                       </button>
                     </div>
                     
                     <div className="p-0 sm:p-8 flex-1 overflow-y-auto bg-slate-50" style={{backgroundImage: \`url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")\`}}>
                        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 p-6 sm:p-0">
                          
                          {/* Issue Information */}
                          <div className="flex flex-wrap gap-6 text-xs font-bold uppercase tracking-wider text-slate-500 pb-4 border-b border-slate-200">
                            <div>
                               <span className="block opacity-70 mb-1">Certificate ID</span>
                               <span className="text-slate-900 font-mono">{modalCert.id}</span>
                            </div>
                            <div>
                               <span className="block opacity-70 mb-1">Audit ID</span>
                               <span className="text-slate-900 font-mono">AUDIT-2026-00{certAuditId.replace('p', '')}</span>
                            </div>
                            <div>
                               <span className="block opacity-70 mb-1">Issued</span>
                               <span className="text-slate-900">{modalCert.date.split(',')[0]}</span>
                            </div>
                            <div className="ml-auto flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                               <CheckCircle className="w-3 h-3" /> VERIFIED
                            </div>
                          </div>

                          {/* Verdict Banner */}
                          <div className={\`bg-\${verdictColor}-50 border border-\${verdictColor}-200 p-6 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center\`}>
                             <div className={\`w-12 h-12 rounded-full bg-\${verdictColor}-100 flex items-center justify-center shrink-0\`}>
                               {certAuditData.verdict === 'COMPLIANT' ? <CheckCircle className={\`w-6 h-6 text-\${verdictColor}-600\`} /> : <AlertTriangle className={\`w-6 h-6 text-\${verdictColor}-600\`} />}
                             </div>
                             <div>
                                <h3 className={\`text-xl font-black text-\${verdictColor}-900 uppercase tracking-tight mb-1\`}>{certAuditData.verdict}</h3>
                                <p className={\`text-sm text-\${verdictColor}-800 font-medium\`}>
                                   {certAuditData.verdict === 'COMPLIANT' ? 'Procurement price aligns with fair market value bounds.' : 'Market-normalized price exceeds calculated fair market value.'}
                                </p>
                             </div>
                          </div>

                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">GeM Price</p>
                               <p className="text-lg font-black text-slate-900">₹{certAuditData.gemPrice.toLocaleString()}</p>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fair Market Value</p>
                               <p className="text-lg font-black text-slate-900">₹{certAuditData.fmv.toLocaleString()}</p>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Variance</p>
                               <p className={\`text-lg font-black \${certAuditData.variance > 0 ? 'text-red-600' : 'text-emerald-600'}\`}>
                                 {certAuditData.variance > 0 ? '+' : ''}{certAuditData.variance.toFixed(1)}%
                               </p>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence</p>
                               <p className="text-lg font-black text-indigo-600">{certAuditData.confidence.overall}%</p>
                             </div>
                          </div>

                          {/* Why Flagged / Reasoning */}
                          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Why This Audit Was Flagged</h3>
                            <ul className="space-y-3">
                              {certAuditData.evidence.map((ev: string, idx: number) => (
                                <li key={idx} className="flex gap-3 text-sm text-slate-700 font-medium items-start">
                                  <span className={\`shrink-0 mt-0.5 \${certAuditData.verdict === 'COMPLIANT' ? 'text-emerald-500' : 'text-amber-500'}\`}>
                                    {certAuditData.verdict === 'COMPLIANT' ? <CheckCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                  </span>
                                  {ev}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Evidence Summary */}
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                              Evidence Summary
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {certAuditData.results.filter((r: any) => r.url).slice(0,2).map((src: any, idx: number) => (
                                <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col group relative">
                                  {src.imageUrl && (
                                    <div className="h-32 bg-slate-100 relative overflow-hidden">
                                      <img src={src.imageUrl} alt={certAuditData.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML='<div class="w-full h-full flex flex-col items-center justify-center text-slate-400"><svg class="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span class="text-xs font-bold uppercase">Product Evidence</span></div>'; }} />
                                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-slate-800 shadow-sm border border-slate-200/50">
                                        {src.plat}
                                      </div>
                                    </div>
                                  )}
                                  <div className="p-4 flex-1 flex flex-col">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{src.evidenceType || 'Market Evidence'}</p>
                                    <p className="font-black text-lg text-slate-900 mb-3">₹{src.landed.toLocaleString()}</p>
                                    <div className="mt-auto pt-3 border-t border-slate-100">
                                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:underline">
                                        Open Source <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Cryptographic Integrity */}
                          <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
                             <div className="absolute -right-6 -top-6 text-slate-800 opacity-50">
                               <Link2 className="w-32 h-32" />
                             </div>
                             <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-6 relative z-10 flex items-center gap-2">
                               <ShieldCheck className="w-4 h-4" /> Cryptographic Integrity
                             </h3>
                             
                             <div className="space-y-4 relative z-10">
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                                 <span className="text-xs font-bold text-slate-400 uppercase">Evidence Hash</span>
                                 <div className="flex items-center gap-3">
                                   <span className="font-mono text-sm text-slate-300 truncate max-w-[200px]" title={modalCert.hash}>
                                     {modalCert.hash.substring(0, 16)}...{modalCert.hash.substring(modalCert.hash.length - 8)}
                                   </span>
                                   <button onClick={() => { navigator.clipboard.writeText(modalCert.hash); showToast('Hash copied to clipboard', 'success'); }} className="text-slate-500 hover:text-white transition-colors" title="Copy full hash">
                                     <Copy className="w-4 h-4" />
                                   </button>
                                 </div>
                               </div>
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                                 <span className="text-xs font-bold text-slate-400 uppercase">Previous Hash</span>
                                 <div className="flex items-center gap-3">
                                   <span className="font-mono text-sm text-slate-500 truncate max-w-[200px]" title={modalCert.prevHash || '0000000000000000000000000000000000000000000000000000000000000000'}>
                                     {(modalCert.prevHash || '0000000000000000000000000000000000000000000000000000000000000000').substring(0, 16)}...
                                   </span>
                                 </div>
                               </div>
                               <div className="flex items-center justify-between pt-2">
                                 <span className="text-xs font-bold text-slate-400 uppercase">Chain Integrity</span>
                                 <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20 flex items-center gap-1">
                                   <CheckCircle className="w-3 h-3" /> VERIFIED
                                 </span>
                               </div>
                             </div>
                             
                             <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                                <button onClick={() => { setModalCert(null); setActiveTab('certificates'); }} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                                  View in Trust Ledger <ChevronRight className="w-3 h-3" />
                                </button>
                             </div>
                          </div>
                          
                        </div>
                     </div>
                     <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                       <button onClick={() => navigate(\`/verify/\${modalCert.id}\`)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                         <ShieldCheck className="w-5 h-5" /> VERIFY CERTIFICATE
                       </button>
                     </div>
                   </>
                 );
              })()}
            </div>
          </div>
        )}
`;

const startIndex = content.indexOf('{/* Certificate Modal */}');
const endIndex = content.indexOf('export default DashboardView;');

let newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex - 1); // rough bounds
fs.writeFileSync(path, newContent);
