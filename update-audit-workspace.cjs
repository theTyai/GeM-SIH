const fs = require('fs');
let content = fs.readFileSync('src/components/AuditWorkspace.tsx', 'utf8');

// Add currentUser to props
content = content.replace(
  "export default function AuditWorkspace({ auditId, onBack, onShowToast }: { auditId: string, onBack: () => void, onShowToast: (msg: string, type: 'success'|'error') => void }) {",
  "import { User } from '../types';\n\nexport default function AuditWorkspace({ auditId, onBack, onShowToast, currentUser }: { auditId: string, onBack: () => void, onShowToast: (msg: string, type: 'success'|'error') => void, currentUser: User | null }) {"
);

const auditorBlock = `
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
`;

// Insert auditorBlock right before the closing div of the left column (which holds Evidence & AI Analysis)
// I will just append it at the bottom of the right column instead to keep it clean.
content = content.replace(
  "</div>\n      </div>\n    </div>\n  );\n}",
  `</div>\n      </div>\n      ${auditorBlock}\n    </div>\n  );\n}`
);

fs.writeFileSync('src/components/AuditWorkspace.tsx', content);
