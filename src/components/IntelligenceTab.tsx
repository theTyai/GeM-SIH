import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Store, Activity, Loader2, BarChart3, Search, ChevronRight } from 'lucide-react';
import { ApiAuditListResponse } from '../types';

export default function IntelligenceTab({ onInvestigate }: { onInvestigate: (id: string) => void }) {
  const [activeSection, setActiveSection] = useState<'TRENDS' | 'PRODUCTS' | 'SELLERS'>('TRENDS');
  const [trends, setTrends] = useState<any[]>([]);
  const [productQuery, setProductQuery] = useState('Laptop');
  const [productData, setProductData] = useState<any>(null);
  const [sellerId, setSellerId] = useState('unknown');
  const [sellerData, setSellerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeSection === 'TRENDS') {
      setLoading(true);
      fetch('/api/v1/analytics/trends')
        .then(res => res.json())
        .then(setTrends)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeSection === 'PRODUCTS') {
      searchProduct(productQuery);
    } else if (activeSection === 'SELLERS') {
      searchSeller(sellerId);
    }
  }, [activeSection]);

  const searchProduct = (query: string) => {
    setLoading(true);
    fetch(`/api/v1/analytics/products?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(setProductData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const searchSeller = (id: string) => {
    setLoading(true);
    fetch(`/api/v1/analytics/sellers/${encodeURIComponent(id)}`)
      .then(res => res.json())
      .then(setSellerData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div className="animate-fade-in-up w-full max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Intelligence & Analytics</h2>
          <p className="text-slate-500 text-sm mt-1">Backend-derived historical market intelligence and risk models.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveSection('TRENDS')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeSection === 'TRENDS' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'bg-white text-slate-600 border border-transparent hover:bg-slate-50 border-slate-200 shadow-sm'}`}
          >
            <TrendingUp className="w-5 h-5" /> Market Trends
          </button>
          <button 
            onClick={() => setActiveSection('PRODUCTS')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeSection === 'PRODUCTS' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'bg-white text-slate-600 border border-transparent hover:bg-slate-50 border-slate-200 shadow-sm'}`}
          >
            <BarChart3 className="w-5 h-5" /> Product History
          </button>
          <button 
            onClick={() => setActiveSection('SELLERS')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeSection === 'SELLERS' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'bg-white text-slate-600 border border-transparent hover:bg-slate-50 border-slate-200 shadow-sm'}`}
          >
            <Store className="w-5 h-5" /> Seller Risk Profile
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
             <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
             </div>
          ) : (
             <>
               {activeSection === 'TRENDS' && (
                 <div className="p-6 space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                       <Activity className="w-5 h-5 text-indigo-600" /> 30-Day Market Anomaly Trends
                    </h3>
                    {trends.length === 0 ? (
                      <p className="text-slate-500 italic p-8 text-center border border-dashed rounded-xl border-slate-200">No sufficient data for trends calculation.</p>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Audits Recorded</p>
                            <p className="text-2xl font-black text-slate-800">{trends.reduce((acc, t) => acc + t.totalAudits, 0)}</p>
                          </div>
                          <div className="bg-rose-50 p-4 border border-rose-100 rounded-xl">
                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">High Risk Flags</p>
                            <p className="text-2xl font-black text-rose-600">{trends.reduce((acc, t) => acc + t.highRiskCount, 0)}</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 mt-6">
                           <p className="font-bold text-slate-700 text-sm mb-4">Daily Variance Averages</p>
                           {trends.map(t => (
                             <div key={t.date} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                               <span className="text-xs font-medium text-slate-500">{t.date}</span>
                               <div className="flex-1 mx-4">
                                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className={`h-full ${t.avgVariance > 10 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, Math.max(0, t.avgVariance))}%` }}></div>
                                  </div>
                               </div>
                               <span className={`text-xs font-bold ${t.avgVariance > 10 ? 'text-red-600' : 'text-emerald-600'}`}>{t.avgVariance.toFixed(1)}%</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                 </div>
               )}

               {activeSection === 'PRODUCTS' && (
                 <div className="p-6 space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                       <BarChart3 className="w-5 h-5 text-indigo-600" /> Historical Product Intelligence
                    </h3>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={productQuery} 
                         onChange={e => setProductQuery(e.target.value)}
                         className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                         placeholder="Search product category (e.g. Laptop)"
                       />
                       <button 
                         onClick={() => searchProduct(productQuery)}
                         className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
                       >
                         Search
                       </button>
                    </div>

                    {productData && productData.history.length > 0 ? (
                      <div className="space-y-6 mt-6 animate-fade-in-up">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Average FMV</p>
                            <p className="text-2xl font-black text-slate-800">₹{productData.averageFmv.toFixed(0)}</p>
                          </div>
                          <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Market Range</p>
                            <p className="text-xl font-black text-slate-800">₹{productData.marketRange.min} - ₹{productData.marketRange.max}</p>
                          </div>
                        </div>

                        <div>
                           <p className="font-bold text-slate-700 text-sm mb-3">Historical Listings</p>
                           <div className="space-y-2">
                             {productData.history.map((h: any, i: number) => (
                               <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                                 <div>
                                   <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{h.title}</p>
                                   <p className="text-[10px] text-slate-500">{new Date(h.date).toLocaleDateString()}</p>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-xs font-bold text-slate-800">₹{h.listedPrice}</p>
                                   <p className={`text-[10px] font-bold ${h.variance > 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                                     {h.variance > 0 ? '+' : ''}{parseFloat(h.variance).toFixed(1)}% Variance
                                   </p>
                                 </div>
                               </div>
                             ))}
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8 text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm font-bold text-slate-500">No historical market data found for this query.</p>
                      </div>
                    )}
                 </div>
               )}

               {activeSection === 'SELLERS' && (
                 <div className="p-6 space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                       <Store className="w-5 h-5 text-indigo-600" /> Seller Risk Profile
                    </h3>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={sellerId} 
                         onChange={e => setSellerId(e.target.value)}
                         className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                         placeholder="Enter Seller ID"
                       />
                       <button 
                         onClick={() => searchSeller(sellerId)}
                         className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
                       >
                         Analyze
                       </button>
                    </div>

                    {sellerData && sellerData.totalListingsAudited > 0 ? (
                      <div className="space-y-6 mt-6 animate-fade-in-up">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Audits</p>
                            <p className="text-xl font-black text-slate-800">{sellerData.totalListingsAudited}</p>
                          </div>
                          <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Premium</p>
                            <p className={`text-xl font-black ${sellerData.averageVariancePct > 10 ? 'text-red-600' : 'text-slate-800'}`}>
                               {sellerData.averageVariancePct > 0 ? '+' : ''}{sellerData.averageVariancePct.toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">High Risk</p>
                            <p className="text-xl font-black text-slate-800">{sellerData.highRiskFlags}</p>
                          </div>
                          <div className={`p-4 border rounded-xl ${sellerData.riskProfile === 'HIGH' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${sellerData.riskProfile === 'HIGH' ? 'text-red-500' : 'text-emerald-500'}`}>Risk Profile</p>
                            <p className={`text-xl font-black ${sellerData.riskProfile === 'HIGH' ? 'text-red-600' : 'text-emerald-600'}`}>{sellerData.riskProfile}</p>
                          </div>
                        </div>

                        <div>
                           <p className="font-bold text-slate-700 text-sm mb-3">Audit History</p>
                           <div className="space-y-2">
                             {sellerData.history.map((h: any, i: number) => (
                               <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => onInvestigate(h.id)}>
                                 <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${h.riskLevel === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                     <AlertTriangle className="w-4 h-4" />
                                   </div>
                                   <div>
                                     <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{h.listingTitle}</p>
                                     <p className="text-[10px] text-slate-500">{new Date(h.createdAt).toLocaleDateString()}</p>
                                   </div>
                                 </div>
                                 <div className="text-right flex items-center gap-4">
                                   <div className="text-right">
                                     <p className="text-xs font-bold text-slate-800">₹{h.listedPrice}</p>
                                     <p className={`text-[10px] font-bold ${parseFloat(h.variance) > 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                                       {parseFloat(h.variance) > 0 ? '+' : ''}{parseFloat(h.variance).toFixed(1)}%
                                     </p>
                                   </div>
                                   <ChevronRight className="w-4 h-4 text-slate-400" />
                                 </div>
                               </div>
                             ))}
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8 text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm font-bold text-slate-500">No data found for this seller.</p>
                      </div>
                    )}
                 </div>
               )}
             </>
          )}
        </div>
      </div>
    </div>
  );
}
