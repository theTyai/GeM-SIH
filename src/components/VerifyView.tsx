import { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, Clock, CheckCircle2, ChevronLeft, Link as LinkIcon, Database, CheckSquare, Search, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function VerifyView({ hash, onBack }: { hash: string; onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/verify/${hash}`)
      .then(res => res.json())
      .then(result => {
        if (!result.isValid) {
          setError(result.error || 'Verification failed');
        } else {
          setData(result);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hash]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="z-10 w-full max-w-2xl">
        <button 
          onClick={onBack}
          className="flex items-center text-sm font-semibold text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Platform
        </button>

        {loading ? (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-white mb-2">Verifying Cryptographic Ledger...</h2>
            <p className="text-slate-400">Recomputing canonical hashes and verifying chain anchors</p>
          </div>
        ) : error || !data ? (
          <div className="bg-rose-950/30 backdrop-blur-xl border border-rose-900/50 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Verification Failed</h2>
            <p className="text-rose-300 font-mono text-sm mb-6 max-w-md mx-auto">{error || 'Certificate tampered or not found.'}</p>
            <p className="text-slate-400 text-sm">
              The provided hash could not be verified against the WORM trust ledger. This document cannot be cryptographically proven.
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-8 text-center">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Valid Trust Certificate</h2>
              <p className="text-emerald-400 text-sm font-semibold tracking-wide">CRYPTOGRAPHICALLY VERIFIED</p>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Certificate Hash</p>
                <div className="bg-slate-900/50 p-3 rounded-lg flex items-center justify-between border border-slate-700/50">
                  <span className="font-mono text-sm text-indigo-300 break-all">{data.certificate.certificateHash}</span>
                  <LinkIcon className="w-4 h-4 text-slate-500 ml-4 shrink-0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/30">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                    <CheckSquare className="w-3 h-3 mr-1" /> Decision
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {data.certificate.decision.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/30">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                    <Search className="w-3 h-3 mr-1" /> Officer
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {data.certificate.decidedBy}
                  </p>
                </div>
                <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/30 col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> Issued At
                  </p>
                  <p className="text-sm font-mono text-slate-300">
                    {new Date(data.certificate.issuedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Ledger Chain</p>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 flex flex-col gap-2">
                  <div className="flex items-start">
                    <Database className="w-4 h-4 text-slate-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Previous Block Hash</p>
                      <p className="text-xs font-mono text-slate-500 truncate mt-0.5">{data.certificate.previousLedgerHash}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50 flex items-center text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                This certificate proves that immutable evidence was captured, scored deterministically, and reviewed by an authorized officer.
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
