import React, { useState, useRef, useEffect } from 'react';
import { Search, Brain, Loader2, CheckCircle, CheckCircle2, ExternalLink, AlertTriangle, FileSignature, Globe, Calculator, TrendingUp, Fingerprint, TableProperties, Play, Layers, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { MOCK_DB } from '../data';
import { AuditData } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function PriceAuditsTab({ onIssueCertificate, isAirGapped, onShowToast }: { onIssueCertificate: (data: AuditData) => void, isAirGapped?: boolean, onShowToast: (msg: string, type: 'success'|'error') => void }) {
  const [audits, setAudits] = useState<Record<string, AuditData>>(MOCK_DB);
  const [selectedProduct, setSelectedProduct] = useState(() => sessionStorage.getItem('gemIntel_scraped_id') || 'p1');
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [result, setResult] = useState<AuditData | null>(null);
  const [explainModal, setExplainModal] = useState<string | null>(null);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  useEffect(() => {
    fetch('/api/v1/audits')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
           Object.assign(MOCK_DB, data);
           setAudits({ ...MOCK_DB });
           if (sessionStorage.getItem('gemIntel_scraped_id') && data[sessionStorage.getItem('gemIntel_scraped_id')!]) {
             setSelectedProduct(sessionStorage.getItem('gemIntel_scraped_id')!);
           }
        }
      })
      .catch(console.error);
  }, []);

  const runPipeline = async () => {
    setStatus('running');
    setResult(null);
    setCurrentStep(1);

    const target = audits[selectedProduct] || MOCK_DB[selectedProduct];

    // Step 1
    await sleep(1200);
    setCurrentStep(2);
    
    // Step 2
    await sleep(1500);
    setCurrentStep(3);

    // Step 3
    await sleep(1000);
    setCurrentStep(4);

    // Step 4
    await sleep(1400);
    
    setCurrentStep(5); // Complete
    setResult(target);
    setStatus('complete');
  };

  const getTrendChartData = (history: number[]) => ({
    labels: ['D-30', 'D-25', 'D-20', 'D-15', 'D-10', 'D-5', 'Today'],
    datasets: [{
      label: 'Price History (₹)',
      data: history,
      borderColor: '#4f46e5', // indigo-600
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { maxTicksLimit: 5 } },
      x: { grid: { display: false } }
    }
  };

  const steps = [
    { 
      id: 1, 
      title: isAirGapped ? 'Local Data Ingestion (Air-Gapped)' : 'Extraction & Sourcing', 
      desc: isAirGapped ? 'Ingesting secure local data dumps from approved catalogs.' : 'Scraping GeM specs and scanning external markets (Amazon, Flipkart) via DaaS.', 
      icon: Globe, 
      loadingText: isAirGapped ? 'Mounting encrypted local datasets...' : 'Routing through proxy fleet...' 
    },
    { 
      id: 2, 
      title: isAirGapped ? 'Local On-Device NLP Matching' : 'Semantic Matching (NLP)', 
      desc: isAirGapped ? 'Using localized on-device embeddings model for secure semantic comparison.' : 'Aligning unstructured specs using Sentence-Transformers to find exact matches.', 
      icon: Brain, 
      loadingText: isAirGapped ? 'Running local Sentence-Transformers...' : 'Computing cosine similarity matrices...', 
      color: 'text-purple-500' 
    },
    { 
      id: 3, 
      title: 'TCO Normalization', 
      desc: 'Applying GST slabs and volumetric freight calculations for true landed costs.', 
      icon: Calculator, 
      loadingText: 'Normalizing tax and shipping tariffs...', 
      color: 'text-amber-500' 
    },
    { 
      id: 4, 
      title: 'Forecasting & Analytics', 
      desc: 'Running ARIMA models to detect price gouging against expected Fair Market Value.', 
      icon: TrendingUp, 
      loadingText: 'Analyzing variance thresholds...', 
      color: 'text-emerald-500' 
    }
  ];

  
  useEffect(() => {
    if (sessionStorage.getItem('gemIntel_autorun') === 'true') {
      sessionStorage.removeItem('gemIntel_autorun');
      // small delay to let UI render before running animation
      setTimeout(() => {
        runPipeline();
      }, 500);
    }
  }, []);
  
  return (
    <div className="animate-fade-in-up max-w-6xl mx-auto pb-10">
      
      {/* Audit Setup Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Run Rule 149 Audit</h2>
            <p className="text-sm text-slate-500">Benchmark GeM prices against Amazon, Flipkart, & IndiaMART.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded">NLP Enabled</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target GeM Product ID / URL</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select 
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={status === 'running'}
                  className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 bg-slate-50 appearance-none disabled:opacity-50 text-sm font-medium"
                >
                  {Object.values(audits).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.id.startsWith('scraped_') ? 'GeM Extension: ' : ''}{item.name} (Expected: {item.verdict})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-full md:w-32">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Delivery PIN</label>
              <input type="text" defaultValue="110001" disabled={status === 'running'} className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none disabled:opacity-50 font-medium" />
            </div>
            <div className="w-full md:w-32">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Qty</label>
              <input type="number" defaultValue="1" disabled={status === 'running'} className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-slate-50 text-slate-800 outline-none disabled:opacity-50 font-medium" />
            </div>
            <div className="w-full md:w-auto">
              <button 
                onClick={runPipeline}
                disabled={status === 'running'}
                className="w-full bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} 
                {status === 'running' ? 'Processing' : 'Benchmark'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Execution Pipeline */}
      {(status === 'running' || status === 'complete') && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6 relative"
        >
          {/* Scanning Animation Overlay */}
          {status === 'running' && (
            <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none z-40 overflow-hidden">
              <div className="absolute w-full h-1 bg-indigo-500 shadow-[0_0_20px_5px_rgba(79,70,229,0.5)] animate-scan"></div>
            </div>
          )}
          
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <Brain className="text-indigo-600 w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-sm">AI Pipeline Execution</h3>
            <span className={`ml-auto text-xs font-bold uppercase tracking-wider ${status === 'complete' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {status === 'complete' ? 'Pipeline Complete' : 'Initializing...'}
            </span>
          </div>
          <div className="p-8 pb-4 relative">
            {steps.map((step, idx) => {
              const isPast = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="relative pl-12 mb-8">
                  {/* Vertical Line */}
                  {idx !== steps.length - 1 && (
                    <div className="absolute left-[19px] top-[40px] bottom-[-32px] w-0.5 bg-slate-200 z-0"></div>
                  )}
                  
                  {/* Icon */}
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300 ${isPast ? 'bg-emerald-500 border-emerald-500 text-white' : isCurrent ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_0_0_4px_rgba(79,70,229,0.2)]' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {isPast ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  
                  {/* Content */}
                  <div className={`pt-1 transition-opacity duration-300 ${isPast || isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                    <h4 className="text-sm font-bold text-slate-800">{step.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                    
                    {/* Active Loading State */}
                    {isCurrent && (
                      <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs font-mono text-slate-600 flex items-center gap-2 animate-fade-in">
                        <div className={`flex items-center gap-1 ${step.color || 'text-indigo-500'}`}>
                          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                        </div>
                        {step.loadingText}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Results Output */}
      {status === 'complete' && result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Verdict & Evidence */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Verdict Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className={`px-6 py-4 border-b flex justify-between items-center ${result.verdict === 'COMPLIANT' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : result.verdict === 'HIGH RISK' ? 'bg-red-100 border-red-200 text-red-900' : 'bg-amber-50 border-amber-100 text-amber-900'}`}>
                  <div className="flex items-center gap-3">
                    {result.verdict === 'COMPLIANT' ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <AlertTriangle className={`w-6 h-6 ${result.verdict === 'HIGH RISK' ? 'text-red-700 animate-pulse' : 'text-amber-600'}`} />}
                    <h3 className="text-lg font-black tracking-tight">
                       {result.verdict === 'COMPLIANT' ? 'LOW RISK' : result.verdict === 'REVIEW' ? 'MODERATE RISK' : 'HIGH RISK'}
                    </h3>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    {result.dataQuality && (
                       <div className="flex items-center gap-1.5 bg-white/50 px-2.5 py-1 rounded-md text-xs font-bold border border-black/5 shadow-sm">
                          <span className={`w-2 h-2 rounded-full ${result.dataQuality === 'HIGH' ? 'bg-emerald-500' : result.dataQuality === 'LOW' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                          Data Quality: {result.dataQuality}
                       </div>
                    )}
                    <div className="text-xs font-bold opacity-80 uppercase tracking-wider">
                      Audit #{result.id.replace('p', 'GM-2026-00')}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-slate-100">
                  <div className="px-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">GeM Price</p>
                    <p className="text-xl font-black text-slate-900">₹{result.gemPrice.toLocaleString()}</p>
                  </div>
                  <div className="px-4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Fair Market Value</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-black text-slate-900">₹{result.fmv.toLocaleString()}</p>
                      <button onClick={() => setExplainModal('fmv')} className="text-[10px] bg-slate-100 text-slate-500 hover:bg-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1 mb-1 font-medium transition-colors">ⓘ How calculated</button>
                    </div>
                  </div>
                  <div className="px-4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Variance</p>
                    <div className="flex items-end gap-2">
                      <p className={`text-xl font-black ${result.variance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {result.variance > 0 ? '+' : ''}{result.variance.toFixed(1)}%
                      </p>
                      <button onClick={() => setExplainModal('variance')} className="text-[10px] bg-slate-100 text-slate-500 hover:bg-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1 mb-1 font-medium transition-colors">ⓘ Explain</button>
                    </div>
                  </div>
                  <div className="px-4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Confidence</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-black text-indigo-600">{result.confidence.overall}%</p>
                      <button onClick={() => setExplainModal('confidence')} className="text-[10px] bg-slate-100 text-slate-500 hover:bg-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1 mb-1 font-medium transition-colors">ⓘ Details</button>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-4 pt-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Data Freshness: {result.freshness}
                  </div>
                </div>
              </div>

              {/* Evidence & Reasoning */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Why Was This Flagged?</h3>
                <ul className="space-y-3">
                  {result.evidence.map((ev, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-slate-700 font-medium">
                      <span className={`shrink-0 mt-0.5 ${result.verdict === 'COMPLIANT' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {result.verdict === 'COMPLIANT' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </span>
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Comparison Matrix & TCO */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TableProperties className="text-slate-400 w-4 h-4" />
                    <h3 className="font-bold text-slate-800 text-sm">True Cost of Ownership (TCO) Breakdown</h3>
                  </div>
                  <button onClick={() => setExplainModal('tco')} className="text-[10px] bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 px-2 py-1 rounded flex items-center gap-1 font-bold uppercase tracking-wider transition-colors">ⓘ Explain TCO</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white text-slate-500 font-semibold text-[10px] uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Source / Status</th>
                        <th className="px-4 py-3 text-right">Base</th>
                        <th className="px-4 py-3 text-right">GST</th>
                        <th className="px-4 py-3 text-right">Frt/Wrnty</th>
                        <th className="px-4 py-3 text-right">Landed Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.results.map((row, i) => (
                        <tr key={i} className={`${row.isTarget ? 'bg-indigo-50/30' : 'hover:bg-slate-50'} transition-colors`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                              {row.isTarget && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                              <span className={row.isTarget ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}>{row.plat}</span>
                            </div>
                            {!row.isTarget && <div className="text-[10px] text-slate-400 font-medium flex items-center gap-2">Match: {row.conf} • {row.freshness} {row.url && <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-0.5">Open Source <ExternalLink className="w-2.5 h-2.5" /></a>}</div>}
                            {row.isTarget && <div className="text-[10px] text-slate-400 font-medium flex items-center gap-2">Target Listing {row.url && <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-0.5">Open Source <ExternalLink className="w-2.5 h-2.5" /></a>}</div>}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-500">₹{row.base.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-500">₹{row.tax.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-500">₹{(row.freight + row.warrantyCalc).toLocaleString()}</td>
                          <td className={`px-4 py-3 text-right font-mono font-bold ${row.isTarget ? 'text-indigo-700 text-base' : 'text-slate-900 text-sm'}`}>₹{row.landed.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Col: Insights & Confidence */}
            <div className="space-y-6">
              
              {/* Confidence Score Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">AI Match Confidence</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span className="text-slate-700">Identity Match</span>
                      <span className="text-slate-900">{result.confidence.identity}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${result.confidence.identity}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span className="text-slate-700">Specifications</span>
                      <span className="text-slate-900">{result.confidence.specs}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${result.confidence.specs}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span className="text-slate-700">Brand Alignment</span>
                      <span className="text-slate-900">{result.confidence.brand}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${result.confidence.brand}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span className="text-slate-700">Warranty Normalized</span>
                      <span className={`${result.confidence.warranty < 80 ? 'text-amber-600' : 'text-slate-900'}`}>{result.confidence.warranty}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${result.confidence.warranty < 80 ? 'bg-amber-500' : 'bg-indigo-600'}`} style={{ width: `${result.confidence.warranty}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="text-indigo-600 w-4 h-4" /> Price Forecast vs Actual
                </h3>
                <div className="h-40 w-full relative">
                  <Line data={getTrendChartData(result.history)} options={chartOptions} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center">ARIMA expected price band mapped over 30 days.</p>
              </div>

              {/* Explainable Risk Score */}
              {result.riskScore && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Score</h3>
                    <span className={`text-xl font-black ${result.riskScore.total > 60 ? 'text-red-600' : result.riskScore.total > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>{result.riskScore.total} / 100</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-24 font-bold text-slate-600">Price Variance</div>
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                        <div className="bg-red-500 h-full" style={{ width: `${(result.riskScore.breakdown.priceVariance / 60) * 100}%` }}></div>
                      </div>
                      <div className="w-6 text-right font-mono text-slate-400">{result.riskScore.breakdown.priceVariance}</div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-24 font-bold text-slate-600">Spec Mismatch</div>
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                        <div className="bg-amber-500 h-full" style={{ width: `${(result.riskScore.breakdown.specMismatch / 20) * 100}%` }}></div>
                      </div>
                      <div className="w-6 text-right font-mono text-slate-400">{result.riskScore.breakdown.specMismatch}</div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-24 font-bold text-slate-600">Seller Risk</div>
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                        <div className="bg-indigo-500 h-full" style={{ width: `${(result.riskScore.breakdown.sellerRisk / 20) * 100}%` }}></div>
                      </div>
                      <div className="w-6 text-right font-mono text-slate-400">{result.riskScore.breakdown.sellerRisk}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500"><span className="font-bold text-slate-800">Primary Risk Driver:</span> {result.riskScore.primaryDriver}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cross-Platform Spec Comparison Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-6">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Layers className="text-slate-400 w-4 h-4" />
              <h3 className="font-bold text-slate-800 text-sm">Cross-Platform Feature Verification</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 w-1/4">Specification</th>
                    <th className="px-5 py-4 w-1/4 bg-indigo-50/30 text-indigo-900 border-l border-slate-100">
                      GeM Listing (Target)
                      <span className="ml-2 bg-indigo-100 text-indigo-600 text-[9px] px-1.5 py-0.5 rounded font-bold">AI NORMALIZED</span>
                    </th>
                    {result.specs[0].platforms.map(p => (
                      <th key={p.name} className="px-5 py-4 border-l border-slate-100">{p.name} Match</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.specs.map((spec, i) => {
                    const hasMismatch = spec.platforms.some(p => p.isMismatch);
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-700 flex items-center gap-2">
                           {spec.key}
                           {hasMismatch && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">Variance</span>}
                        </td>
                        <td className={`px-5 py-4 font-semibold bg-indigo-50/30 border-l border-slate-100 ${hasMismatch ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{spec.gem}</td>
                        {spec.platforms.map((p, j) => (
                          <td key={j} className={`px-5 py-4 border-l border-slate-100 ${p.isMismatch ? 'bg-red-50/20 text-red-700 font-bold' : 'text-slate-600'}`}>
                            <div className="flex items-center justify-between gap-2">
                               <span>{p.value}</span>
                               {p.isMismatch && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                               {!p.isMismatch && <CheckCircle2 className="w-4 h-4 text-emerald-500/50 shrink-0" />}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Seller Intelligence */}
            {result.seller && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Seller Intelligence</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl font-black text-slate-400">{result.seller.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{result.seller.name}</h4>
                    <p className="text-xs font-medium text-slate-500">Seller Risk: <span className={result.seller.risk === 'HIGH' ? 'text-red-600 font-bold' : result.seller.risk === 'LOW' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{result.seller.risk}</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">GeM Audits</p>
                    <p className="text-lg font-black text-slate-800">{result.seller.totalAudits}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Anomalies</p>
                    <p className="text-lg font-black text-amber-600">{result.seller.flagged}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Avg Premium</p>
                    <p className="text-lg font-black text-slate-800">+{result.seller.averagePremium}%</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Officer Decision Layer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between border-t-4 border-t-indigo-600">
              <div>
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Officer Decision Required</h3>
                <p className="text-sm text-slate-600 mb-4">Record your final assessment of price reasonability based on the evidence provided above.</p>
                <textarea 
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-100 outline-none resize-none" 
                  rows={2} 
                  placeholder="Enter justification (required for exceptions)..."
                ></textarea>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => {
                    result.decision = { status: 'ACCEPTED', justification: 'Price confirmed as reasonable.' };
                    onShowToast('Price confirmed as reasonable.', 'success');
                    onIssueCertificate(result);
                  }} 
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-all text-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Accept
                </button>
                <button 
                  onClick={() => {
                    const justification = prompt("Enter justification for accepting exception:");
                    if (justification) {
                      result.decision = { status: 'JUSTIFIED', justification };
                      onShowToast('Proceeding with justification.', 'success');
                      onIssueCertificate(result);
                    }
                  }} 
                  className="flex-1 bg-amber-50 text-amber-700 font-bold py-2.5 px-4 rounded-xl hover:bg-amber-100 transition-all text-xs border border-amber-200"
                >
                  Justify & Proceed
                </button>
                <button 
                  onClick={() => {
                    result.decision = { status: 'REJECTED', justification: 'Price rejected as unreasonable.' };
                    onShowToast('Price rejected as unreasonable.', 'error');
                    onIssueCertificate(result);
                  }} 
                  className="flex-1 bg-red-50 text-red-700 font-bold py-2.5 px-4 rounded-xl hover:bg-red-100 transition-all text-xs border border-red-200 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={() => onIssueCertificate(result)} className="bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
              <FileSignature className="w-5 h-5" /> Generate Audit Certificate
            </button>
          </div>
        </motion.div>
      )}

      {/* Explanation Modals */}
      {explainModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setExplainModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {explainModal === 'fmv' && 'Fair Market Value Calculation'}
                {explainModal === 'variance' && 'Variance Explanation'}
                {explainModal === 'confidence' && 'Confidence Matrix'}
                {explainModal === 'tco' && 'True Cost of Ownership (TCO)'}
              </h3>
              <button onClick={() => setExplainModal(null)} className="text-slate-400 hover:text-slate-700"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {explainModal === 'fmv' && (
                <div className="space-y-4 text-sm text-slate-600">
                  <p>The Fair Market Value (FMV) is calculated using a weighted average of identical and highly comparable listings found across open e-marketplaces (Amazon, Flipkart, etc.).</p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-500">Methodology</p>
                    <div className="flex justify-between items-center">
                      <span>Amazon (Landed Cost)</span>
                      <span className="font-mono font-medium">₹{(result?.results?.find(r => r.plat === 'Amazon')?.landed || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Flipkart/Reliance (Landed Cost)</span>
                      <span className="font-mono font-medium">₹{(result?.results?.find(r => r.plat !== 'Amazon' && r.plat !== 'GeM')?.landed || 0).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-bold text-slate-900">
                      <span>Resulting Estimate</span>
                      <span className="font-mono">₹{(result?.fmv || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
              {explainModal === 'variance' && (
                <div className="space-y-4 text-sm text-slate-600">
                  <p>Variance measures the percentage difference between the GeM Listing Price and the calculated Fair Market Value.</p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                     <p className="font-mono text-center">((GeM Price - FMV) / FMV) * 100</p>
                     <div className="flex justify-center gap-2 items-center text-lg">
                        <span className="font-bold text-slate-900">₹{result?.gemPrice.toLocaleString()}</span>
                        <span className="text-slate-400">vs</span>
                        <span className="font-bold text-slate-900">₹{result?.fmv.toLocaleString()}</span>
                     </div>
                  </div>
                </div>
              )}
              {explainModal === 'confidence' && (
                <div className="space-y-4 text-sm text-slate-600">
                  <p>The Confidence Score represents the AI engine's certainty that the matched external listings are identical to the GeM product.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Identity:</strong> Brand, Model Number, and SKU matching.</li>
                    <li><strong>Specs:</strong> Technical specification similarity via NLP.</li>
                    <li><strong>Warranty:</strong> Normalization of warranty duration and coverage.</li>
                  </ul>
                </div>
              )}
              {explainModal === 'tco' && (
                <div className="space-y-4 text-sm text-slate-600">
                  <p>True Cost of Ownership (TCO) normalizes external prices to match GeM's inclusive pricing model.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Base Price:</strong> The listed price on external platforms.</li>
                    <li><strong>Taxes:</strong> GST/IGST slabs applied based on category.</li>
                    <li><strong>Logistics:</strong> Calculated based on PIN distance and volumetric weight.</li>
                    <li><strong>Warranty Equalization:</strong> Value added for extended warranties.</li>
                  </ul>
                  <p className="font-mono text-center bg-slate-50 p-3 rounded-lg border border-slate-100">Base + Taxes + Logistics + Warranty = Landed Cost</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setExplainModal(null)} className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-bold text-sm transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
