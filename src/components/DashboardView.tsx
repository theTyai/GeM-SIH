import React, { useState } from 'react';
import { Scale, AlertTriangle, FileSignature, User, X, Shield, Link as LinkIcon, FileText, ArrowRight, PieChart, ShieldCheck, Download, Link2, Search, ChevronRight, Lock, Unlock, Menu, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PriceAuditsTab from './PriceAuditsTab';
import OverviewTab from './OverviewTab';
import TrustLedgerTab from './TrustLedgerTab';
import ChatAssistant from './ChatAssistant';
import { Certificate, AuditData } from '../types';
import { INITIAL_CERTIFICATES, generateHash, MOCK_DB } from '../data';
import { Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { useNavigate } from 'react-router-dom';

type TabType = 'overview' | 'audits' | 'anomalies' | 'certificates';

export default function DashboardView({ onExit }: { onExit: () => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('audits');
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [modalCert, setModalCert] = useState<Certificate | null>(null);
  const [isAirGapped, setIsAirGapped] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<{product: string, variance: string} | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleIssueCertificate = (data: AuditData) => {
    const prevHash = certificates.length > 0 ? certificates[0].hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const newCert: Certificate = {
      id: `CERT-${data.id.replace('p', '2026-00')}`,
      date: new Date().toLocaleString(),
      product: data.name,
      verdict: data.verdict,
      hash: generateHash(),
      prevHash: prevHash
    };
    setCertificates([newCert, ...certificates]);
    setModalCert(newCert);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex animate-fade-in w-full overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:relative w-64 bg-white border-r border-slate-200 h-screen flex flex-col z-50 shrink-0 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center text-white font-bold italic text-xl">GI</div>
          <span className="text-xl font-extrabold tracking-tight text-slate-800">GeM-Intel</span>
          <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-800 md:hidden ml-auto"><X className="w-5 h-5" /></button>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          <button onClick={() => { setActiveTab('audits'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === 'audits' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}>
            <Search className="w-5 h-5" /> Investigate
          </button>
          <button onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}>
            <PieChart className="w-5 h-5" /> Overview
          </button>
          <button onClick={() => { setActiveTab('anomalies'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-between ${activeTab === 'anomalies' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}>
            <div className="flex items-center gap-3"><AlertTriangle className="w-5 h-5" /> Anomalies Center</div>
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
          </button>
          <button onClick={() => { setActiveTab('certificates'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === 'certificates' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}>
            <FileSignature className="w-5 h-5" /> Trust Ledger
          </button>
        </nav>
        
        <div className="p-6 border-t border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0"><User className="w-5 h-5 text-slate-500" /></div>
          <div className="text-sm overflow-hidden">
            <p className="font-bold text-slate-700 truncate">R. Sharma</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Procurement Officer</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-hidden bg-slate-50 flex flex-col w-full md:w-auto">
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-slate-800 truncate">
                {activeTab === 'audits' && 'Audit Investigation'}
                {activeTab === 'overview' && 'Executive Dashboard'}
                {activeTab === 'anomalies' && 'Anomaly Center'}
                {activeTab === 'certificates' && 'Cryptographic Trust Ledger'}
              </h2>
              <p className="hidden md:block text-sm text-slate-400 mt-1">GeM-Intel Price Intelligence Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsAirGapped(!isAirGapped)} 
              className={`text-[10px] md:text-xs font-bold flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded-full border transition-colors ${isAirGapped ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
              title="Toggle Air-Gapped Local Inference Mode"
            >
              {isAirGapped ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isAirGapped ? 'Air-Gapped: ON' : 'Air-Gapped: OFF'}</span>
            </button>
            <button onClick={onExit} className="text-[10px] md:text-sm font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 px-2 md:px-4 py-1.5 md:py-2 rounded-xl border border-slate-200 shadow-sm transition-colors flex items-center">
              Exit <X className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 flex-1 space-y-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'audits' && <PriceAuditsTab onIssueCertificate={handleIssueCertificate} isAirGapped={isAirGapped} onShowToast={showToast} />}

              {activeTab === 'anomalies' && (
                <div className="space-y-8 animate-fade-in-up">
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">Active Pricing Anomalies</h3>
                        <p className="text-sm text-slate-500">Listings flagged by the ARIMA forecasting engine.</p>
                      </div>
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {Object.values(MOCK_DB).filter(d => d.verdict === 'HIGH RISK' || d.verdict === 'REVIEW' || d.verdict === 'ANOMALY').length} Flags
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4">Date Detected</th>
                            <th className="px-6 py-4">Product Name</th>
                            <th className="px-6 py-4">Variance</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Object.values(MOCK_DB).filter(d => d.verdict === 'HIGH RISK' || d.verdict === 'REVIEW' || d.verdict === 'ANOMALY').map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-slate-600">{item.freshness}</td>
                              <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                              <td className="px-6 py-4 text-red-600 font-bold">+{item.variance}%</td>
                              <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${item.verdict === 'HIGH RISK' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>{item.verdict}</span></td>
                              <td className="px-6 py-4">
                                <button onClick={() => {
                                  sessionStorage.setItem('gemIntel_scraped_id', item.id);
                                  sessionStorage.setItem('gemIntel_autorun', 'true');
                                  setActiveTab('audits');
                                }} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center">
                                  Investigate <ArrowRight className="w-3 h-3 ml-1" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {Object.values(MOCK_DB).filter(d => d.verdict === 'HIGH RISK' || d.verdict === 'REVIEW' || d.verdict === 'ANOMALY').length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">No active anomalies detected.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="font-bold text-slate-800">Seller Risk Profile</h3>
                         <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Pattern Detected</span>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                           <h4 className="font-bold text-slate-900 text-lg mb-1">{Object.values(MOCK_DB).find(d => d.seller)?.seller?.name || 'ABC Technologies'}</h4>
                           <p className="text-xs text-slate-500 font-medium mb-3">GeM Seller ID: SELLER-{Math.floor(Math.random() * 10000)}</p>
                           <div className="grid grid-cols-2 gap-4 text-sm">
                             <div>
                               <p className="text-slate-500 text-xs font-bold uppercase">Flagged Listings</p>
                               <p className="font-black text-slate-800 text-lg">{Object.values(MOCK_DB).find(d => d.seller)?.seller?.flagged || 14}</p>
                             </div>
                             <div>
                               <p className="text-slate-500 text-xs font-bold uppercase">Avg Variance</p>
                               <p className="font-black text-red-600 text-lg">+{Object.values(MOCK_DB).find(d => d.seller)?.seller?.averagePremium || 28.4}%</p>
                             </div>
                             <div>
                               <p className="text-slate-500 text-xs font-bold uppercase">GeM Audits</p>
                               <p className="font-black text-slate-800 text-lg">{Object.values(MOCK_DB).find(d => d.seller)?.seller?.totalAudits || 84}</p>
                             </div>
                             <div>
                               <p className="text-slate-500 text-xs font-bold uppercase">Risk Level</p>
                               <p className="font-black text-amber-600 text-lg">{Object.values(MOCK_DB).find(d => d.seller)?.seller?.risk || 'HIGH'}</p>
                             </div>
                           </div>
                           <button onClick={() => showToast('Seller suspended pending investigation.', 'success')} className="mt-4 w-full bg-white border border-slate-300 text-slate-700 font-bold text-xs py-2 rounded-lg hover:bg-slate-50 transition-colors">
                             Suspend Seller Account
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'certificates' && (
                <TrustLedgerTab certificates={certificates} onViewModal={setModalCert} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        
        {/* Certificate Modal */}
        {modalCert && (
          <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm animate-fade-in overflow-y-auto" onClick={(e) => {if(e.target === e.currentTarget) setModalCert(null);}}>
            <div id="certificate-modal-content" className="bg-white rounded-2xl w-full max-w-3xl my-8 flex flex-col shadow-2xl relative overflow-hidden">
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
                     
                     <div className="p-0 sm:p-8 flex-1 overflow-y-auto bg-slate-50" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`}}>
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
                            <div className="ml-auto flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                               <CheckCircle className="w-3 h-3" /> VERIFIED
                            </div>
                          </div>

                          {/* Verdict Banner */}
                          <div className={`bg-${verdictColor}-50 border border-${verdictColor}-200 p-6 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center`}>
                             <div className={`w-12 h-12 rounded-full bg-${verdictColor}-100 flex items-center justify-center shrink-0`}>
                               {certAuditData.verdict === 'COMPLIANT' ? <CheckCircle className={`w-6 h-6 text-${verdictColor}-600`} /> : <AlertTriangle className={`w-6 h-6 text-${verdictColor}-600`} />}
                             </div>
                             <div>
                                <h3 className={`text-xl font-black text-${verdictColor}-900 uppercase tracking-tight mb-1`}>{certAuditData.verdict}</h3>
                                <p className={`text-sm text-${verdictColor}-800 font-medium`}>
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
                               <p className={`text-lg font-black ${certAuditData.variance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
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
                                  <span className={`shrink-0 mt-0.5 ${certAuditData.verdict === 'COMPLIANT' ? 'text-emerald-500' : 'text-amber-500'}`}>
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
                          <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg flex flex-col md:flex-row gap-6 items-center">
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
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://gem-intel.ai.studio/verify/${modalCert.id}`} alt="QR Verification" className="w-24 h-24 sm:w-28 sm:h-28 rounded-md" />
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scan to Verify</div>
                             </div>
                          </div>
                          
                        </div>
                     </div>
                     <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                       <button onClick={async () => {
                          showToast('Generating Cryptographic PDF...', 'success');
                          
                          // Temporarily add a clone to body with fixed width for perfect A4 rendering
                          const element = document.getElementById('certificate-modal-content');
                          if (element) {
                             const clone = element.cloneNode(true) as HTMLElement;
                             clone.style.width = '800px';
                             clone.style.position = 'absolute';
                             clone.style.left = '-9999px';
                             clone.style.top = '-9999px';
                             // Remove the buttons from the clone
                             const buttonsDiv = clone.querySelector('.flex.justify-end.gap-3');
                             if (buttonsDiv) buttonsDiv.remove();
                             const closeButton = clone.querySelector('button.absolute');
                             if (closeButton) closeButton.remove();
                             
                             document.body.appendChild(clone);
                             
                             try {
                               const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                               const imgData = canvas.toDataURL('image/png');
                               const pdf = new jsPDF('p', 'mm', 'a4');
                               const pdfWidth = pdf.internal.pageSize.getWidth();
                               const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                               
                               // Add a nice header
                               pdf.setFillColor(30, 41, 59); // slate-800
                               pdf.rect(0, 0, pdfWidth, 24, 'F');
                               pdf.setTextColor(255, 255, 255);
                               pdf.setFontSize(16);
                               pdf.text('GeM-Intel Official Cryptographic Audit Certificate', 15, 15);
                               
                               pdf.addImage(imgData, 'PNG', 0, 24, pdfWidth, pdfHeight);
                               
                               // Add footer
                               const footerY = pdf.internal.pageSize.getHeight() - 15;
                               pdf.setFillColor(248, 250, 252); // slate-50
                               pdf.rect(0, footerY - 5, pdfWidth, 20, 'F');
                               pdf.setFontSize(9);
                               pdf.setTextColor(100, 116, 139); // slate-500
                               pdf.text('Generated securely by GeM-Intel AI Engine • Verified on blockchain-equivalent ledger', 15, footerY + 5);
                               pdf.text(`Hash: ${modalCert.hash}`, 15, footerY + 10);
                               
                               pdf.save(`GeM_Intel_Audit_${modalCert.id}.pdf`);
                               showToast('PDF Downloaded Successfully!', 'success');
                             } finally {
                               document.body.removeChild(clone);
                             }
                          }
                       }} className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2">
                         <Download className="w-5 h-5" /> DOWNLOAD PDF
                       </button>
                       <button onClick={() => navigate(`/verify/${modalCert.id}`)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                         <ShieldCheck className="w-5 h-5" /> VERIFY CERTIFICATE
                       </button>
                     </div>
                   </>
                 );
              })()}
            </div>
          </div>
        )}
{/* Floating AI Chat */}
        <ChatAssistant />

        {/* Global Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200]"
            >
              <div className={`px-6 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                {toast.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
