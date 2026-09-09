import React from 'react';
import { Certificate } from '../types';
import { Link2, ShieldCheck, Download, Search, FileText } from 'lucide-react';

export default function TrustLedgerTab({ certificates, onViewModal }: { certificates: Certificate[], onViewModal: (cert: Certificate) => void }) {
  return (
    <div className="animate-fade-in-up w-full max-w-6xl mx-auto space-y-6">
      
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Link2 className="w-5 h-5 text-indigo-600" /> Cryptographic Trust Ledger
            </h3>
            <p className="text-sm text-slate-500 mt-1">In-memory hash chain proving chronological tamper-evident audits.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search Hash..." className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none w-64 bg-slate-50" />
          </div>
        </div>

        <div className="p-8 bg-slate-50/50">
          <div className="max-w-4xl mx-auto relative">
            {certificates.length === 0 && (
              <div className="text-center py-10 text-slate-500 italic">No certificates generated yet. Run an audit to seed the ledger.</div>
            )}
            
            {certificates.map((cert, index) => {
              const isFirst = index === certificates.length - 1;
              const hasPrevHash = cert.prevHash && cert.prevHash !== '0000000000000000000000000000000000000000000000000000000000000000';
              
              return (
                <div key={cert.id} className="relative flex gap-6 mb-8">
                  {/* Timeline Line */}
                  {!isFirst && (
                    <div className="absolute left-[23px] top-[48px] bottom-[-40px] w-0.5 bg-indigo-200 z-0"></div>
                  )}

                  {/* Block Icon */}
                  <div className="w-12 h-12 bg-white border-2 border-indigo-500 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm z-10 shrink-0 relative mt-1">
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  {/* Block Data */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:border-indigo-300 transition-colors">
                    <div className="bg-slate-900 px-4 py-2 flex justify-between items-center text-white">
                      <span className="text-xs font-bold font-mono text-indigo-300">BLOCK: {cert.id}</span>
                      <span className="text-[10px] text-slate-400">{cert.date}</span>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payload Data</p>
                          <p className="text-sm font-semibold text-slate-800">{cert.product}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${cert.verdict === 'COMPLIANT' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {cert.verdict}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Previous Block Hash</p>
                          <p className="text-[10px] font-mono text-slate-500 truncate bg-slate-50 px-2 py-1 rounded">
                            {cert.prevHash || '0000000000000000000000000000000000000000000000000000000000000000'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Block Hash</p>
                          <p className="text-[10px] font-mono text-indigo-600 font-bold truncate bg-indigo-50 px-2 py-1 rounded">
                            {cert.hash}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-end">
                      <button onClick={() => onViewModal(cert)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        View Certificate <FileText className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
