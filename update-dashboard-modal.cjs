const fs = require('fs');
const path = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldCryptoHTML = `<div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg">
                             <div className="absolute -right-6 -top-6 text-slate-800 opacity-50 pointer-events-none">
                               <Link2 className="w-32 h-32" />
                             </div>
                             <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-6 relative z-10 flex items-center gap-2">
                               <ShieldCheck className="w-4 h-4" /> Cryptographic Integrity
                             </h3>
                             
                             <div className="space-y-4 relative z-10">
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                                 <span className="text-xs font-bold text-slate-400 uppercase">Evidence Hash</span>
                                 <div className="flex items-center gap-3">
                                   <span className="font-mono text-sm text-slate-300 truncate max-w-[200px] sm:max-w-[300px]" title={modalCert.hash}>
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
                                   <span className="font-mono text-sm text-slate-500 truncate max-w-[200px] sm:max-w-[300px]" title={modalCert.prevHash || '0000000000000000000000000000000000000000000000000000000000000000'}>
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
                          </div>`;

const newCryptoHTML = `<div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg flex flex-col md:flex-row gap-6 items-center">
                             <div className="absolute -right-6 -top-6 text-slate-800 opacity-50 pointer-events-none">
                               <Link2 className="w-32 h-32" />
                             </div>
                             
                             <div className="flex-1 w-full space-y-4 relative z-10">
                               <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                 <ShieldCheck className="w-4 h-4" /> Cryptographic Integrity (SHA-256)
                               </h3>
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                                 <span className="text-xs font-bold text-slate-400 uppercase">Evidence Hash</span>
                                 <div className="flex items-center gap-3">
                                   <span className="font-mono text-sm text-slate-300 truncate max-w-[200px]" title={modalCert.hash}>
                                     {modalCert.hash.substring(0, 16)}...
                                   </span>
                                   <button onClick={() => { navigator.clipboard.writeText(modalCert.hash); showToast('Hash copied to clipboard', 'success'); }} className="text-slate-500 hover:text-white transition-colors">
                                     <Copy className="w-4 h-4" />
                                   </button>
                                 </div>
                               </div>
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                                 <span className="text-xs font-bold text-slate-400 uppercase">Previous Hash</span>
                                 <div className="flex items-center gap-3">
                                   <span className="font-mono text-sm text-slate-500 truncate max-w-[200px]" title={modalCert.prevHash}>
                                     {(modalCert.prevHash || '00...').substring(0, 16)}...
                                   </span>
                                 </div>
                               </div>
                               <div className="flex items-center justify-between pt-1">
                                 <span className="text-xs font-bold text-slate-400 uppercase">Chain Integrity</span>
                                 <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20 flex items-center gap-1">
                                   <CheckCircle className="w-3 h-3" /> VERIFIED
                                 </span>
                               </div>
                             </div>

                             <div className="shrink-0 flex flex-col items-center gap-3 relative z-10 p-4 bg-white rounded-xl shadow-inner border border-slate-200">
                                <img src={\`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://gem-intel.ai.studio/verify/\${modalCert.id}\`} alt="QR Verification" className="w-24 h-24 sm:w-28 sm:h-28 rounded-md" />
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scan to Verify</div>
                             </div>
                          </div>`;

content = content.replace(oldCryptoHTML, newCryptoHTML);

// Add Download PDF button
const oldButtons = `<div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                       <button onClick={() => navigate(\`/verify/\${modalCert.id}\`)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                         <ShieldCheck className="w-5 h-5" /> VERIFY CERTIFICATE
                       </button>
                     </div>`;

const newButtons = `<div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                       <button onClick={() => showToast('Generating PDF via Puppeteer Engine...', 'success')} className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2">
                         <Download className="w-5 h-5" /> DOWNLOAD PDF
                       </button>
                       <button onClick={() => navigate(\`/verify/\${modalCert.id}\`)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                         <ShieldCheck className="w-5 h-5" /> VERIFY CERTIFICATE
                       </button>
                     </div>`;

if (!content.includes('Download,')) {
    content = content.replace('import { ShieldCheck', 'import { ShieldCheck, Download');
}

content = content.replace(oldButtons, newButtons);

fs.writeFileSync(path, content);
