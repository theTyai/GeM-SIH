import React, { useState, useEffect } from 'react';
import { Link2, ShieldCheck, Search, FileText, Loader2, Key } from 'lucide-react';

export default function TrustLedgerTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/v1/certificates')
      .then(res => res.json())
      .then(setCertificates)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (hash: string) => {
    setVerifying(hash);
    setVerificationResult(null);
    try {
      const res = await fetch(`/api/v1/verify/${hash}`);
      const data = await res.json();
      setVerificationResult(data);
    } catch (e) {
      console.error(e);
      setVerificationResult({ isValid: false, error: 'Network error during verification' });
    } finally {
      setVerifying(null);
    }
  };

  const filteredCertificates = certificates.filter(cert => 
    cert.currentHash.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cert.auditId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in-up w-full max-w-6xl mx-auto space-y-6 pb-20">
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Link2 className="w-5 h-5 text-indigo-600" /> Cryptographic Trust Ledger
            </h3>
            <p className="text-sm text-slate-500 mt-1">Independent hash chain proving chronological tamper-evident audits.</p>
          </div>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search Hash or Audit ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none w-full md:w-64 bg-slate-50" 
            />
          </div>
        </div>

        <div className="p-8 bg-slate-50/50">
          <div className="max-w-4xl mx-auto relative">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="text-center py-10 text-slate-500 italic">No certificates found matching criteria.</div>
            ) : (
              <div className="space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {filteredCertificates.map((cert) => (
                  <div key={cert.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Key className="w-4 h-4" />
                    </div>
                    
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${cert.decision === 'ISSUE_CERTIFICATE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {cert.decision}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{new Date(cert.createdAt).toLocaleString()}</span>
                      </div>
                      
                      <div className="mt-2 space-y-2">
                         <div className="p-2 bg-slate-50 rounded border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit ID</p>
                           <p className="font-mono text-xs text-slate-700 break-all">{cert.auditId}</p>
                         </div>
                         <div className="p-2 bg-slate-50 rounded border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Previous Hash</p>
                           <p className="font-mono text-xs text-slate-500 break-all">{cert.prevHash || 'GENESIS'}</p>
                         </div>
                         <div className="p-2 bg-slate-50 rounded border border-slate-100 shadow-inner">
                           <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Current Hash (SHA-256)</p>
                           <p className="font-mono text-xs text-indigo-900 break-all font-bold">{cert.currentHash}</p>
                         </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 text-right">
                         <button 
                           onClick={() => handleVerify(cert.currentHash)}
                           disabled={verifying === cert.currentHash}
                           className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-end gap-1 ml-auto"
                         >
                           {verifying === cert.currentHash ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                           Verify Cryptographic Integrity
                         </button>
                      </div>

                      {verificationResult && verifying !== cert.currentHash && verificationResult.certificate?.certificateHash === cert.currentHash && (
                        <div className={`mt-3 p-3 rounded-lg text-xs ${verificationResult.isValid ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                           {verificationResult.isValid ? (
                             <>
                               <div className="flex items-center gap-1 mb-1 font-bold"><CheckCircle className="w-4 h-4" /> Integrity Verified</div>
                               <p>The hash matches the canonical JSON payload precisely. No tampering detected.</p>
                             </>
                           ) : (
                             <>
                               <div className="flex items-center gap-1 mb-1 font-bold">Tamper Evident Failure</div>
                               <p>{verificationResult.error}</p>
                             </>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
