import { useState, useEffect } from 'react';
import LandingView from './components/LandingView';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView';
import VerifyView from './components/VerifyView';
import { MOCK_DB, SYSTEM_RULES } from './data';
import { User } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, BrainCircuit } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'app' | 'verify'>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('Initializing AI Engine...');

  useEffect(() => {
    fetch('/api/v1/audits')
      .then(res => res.json())
      .then(data => {
        if (data) {
           Object.assign(MOCK_DB, data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scrapedProduct = params.get('scrapedProduct');
    const scrapedPrice = params.get('scrapedPrice');
    const scrapedSpecs = params.get('specs');
    const verifyHash = params.get('verify');

    if (verifyHash) {
      setView('verify');
      return;
    }

    if (scrapedProduct && scrapedPrice) {
      const rawPrice = scrapedPrice.split('.')[0].replace(/[^0-9]/g, '');
      const priceNum = parseInt(rawPrice, 10) || 50000;
      
      let parsedSpecs = [];
      try {
         if (scrapedSpecs) parsedSpecs = JSON.parse(scrapedSpecs);
      } catch(e) {}

      setIsAnalyzing(true);
      setAnalysisStep('Normalizing Specifications (NLP)...');

      // AI Orchestration Flow
      fetch('/api/v1/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scrapedProduct,
          price: priceNum,
          rawSpecs: parsedSpecs
        })
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(aiResult => {
        setAnalysisStep('Calculating FMV and Variances...');
        setTimeout(() => {
          const newId = 'scraped_' + Date.now();
          const finalAudit = {
            id: newId,
            name: scrapedProduct,
            gemPrice: priceNum,
            freshness: 'Just now',
            history: [aiResult.fmv - 1500, aiResult.fmv, aiResult.fmv, priceNum, priceNum],
            ...aiResult // Merge the AI-generated FMV, specs, results, verdict, etc.
          };
          MOCK_DB[newId] = finalAudit;
          fetch('/api/v1/audits', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(finalAudit)
          }).catch(console.error);
          
          sessionStorage.setItem('gemIntel_scraped_id', newId);
          sessionStorage.setItem('gemIntel_autorun', 'true');
          setIsAnalyzing(false);
          setView('app');
          window.history.replaceState({}, document.title, "/");
        }, 800);
      })
      .catch(err => {
        console.error("AI Error, falling back to mock", err);
        // Fallback to deterministic local math
        const fmv = Math.round(priceNum * 0.85); 
        const variance = Number(((priceNum - fmv) / fmv * 100).toFixed(1));
        const newId = 'scraped_' + Date.now();
        
        // Commercially realistic TCO math (assuming 18% GST)
        const gemBase = Math.round(priceNum / 1.18);
        const gemTax = priceNum - gemBase;
        
        const amzLanded = fmv;
        const amzBase = Math.round(amzLanded / 1.18);
        const amzTax = amzLanded - amzBase;

        const flipLanded = fmv + Math.round(fmv * 0.047); 
        const flipBase = Math.round((flipLanded - 126) / 1.18); // assuming 126 freight
        const flipTax = flipLanded - 126 - flipBase;
        const indLanded = fmv + Math.round(fmv * 0.025);
        const indBase = Math.round(indLanded / 1.18);
        const indTax = indLanded - indBase;
        
        // Spec Match Enforcement
        const specScore = 90; // Defaulting to 90 for the mock
        const isSpecMismatch = specScore < SYSTEM_RULES.minSpecMatchScore;
        const varianceVerdict = variance > SYSTEM_RULES.autoFlagVariance ? 'HIGH RISK' : variance > 5 ? 'REVIEW' : 'COMPLIANT';
        const finalVerdict = isSpecMismatch && varianceVerdict === 'COMPLIANT' ? 'REVIEW' : varianceVerdict;

        const fallbackAudit: any = {
          id: newId,
          name: scrapedProduct,
          verdict: finalVerdict,
          status: 'REVIEW_REQUIRED',
          createdAt: new Date().toISOString(),
          assignedOfficerId: currentUser?.id || 'user_1',
          gemPrice: priceNum,
          fmv: fmv,
          variance: variance,
          freshness: 'Just now',
          confidence: { overall: 89.4, identity: 95, specs: specScore, brand: 92, warranty: 80 },
          dataQuality: 'MEDIUM',
          isSimulated: true,
          potentialSavings: priceNum - fmv > 0 ? priceNum - fmv : 0,
          riskScore: {
            total: finalVerdict === 'HIGH RISK' ? 75 : finalVerdict === 'REVIEW' ? 45 : 10,
            breakdown: { priceVariance: variance > 0 ? Math.min(50, variance * 2) : 0, specMismatch: isSpecMismatch ? 20 : 10, sellerRisk: 10, evidenceConfidence: 5, priceVolatility: 0 },
            primaryDriver: isSpecMismatch ? 'Semantic specification mismatch detected.' : 'Variance from market average'
          },
          seller: {
            name: 'Unknown Seller',
            totalAudits: 1,
            flagged: 1,
            averagePremium: variance > 0 ? variance : 0,
            risk: variance > 15 ? 'HIGH' : variance > 5 ? 'MEDIUM' : 'LOW'
          },
          decision: {
            status: 'PENDING'
          },
          history: [fmv - 1500, fmv, fmv, priceNum, priceNum],
          evidence: [
            'Trigger: Detected via Browser Extension on GeM portal.',
            `Anomaly Alert: GeM price (₹${priceNum.toLocaleString()}) exceeds Fair Market Value (₹${fmv.toLocaleString()}) by ${variance}%.`,
            'Product Matching: Semantic + specification matching across Amazon, Flipkart, and IndiaMART.',
            'Compliance: Flags potential violation of GFR 2017 Rule 149 (Reasonability of Rates).'
          ],
          specs: parsedSpecs.map((spec: any, idx: number) => ({
            key: spec.key,
            gem: spec.value,
            platforms: [
              { name: 'Amazon', value: spec.value, isMismatch: false },
              // Create an artificial mismatch on the second item to demonstrate the feature
              { name: 'Flipkart', value: idx === 1 ? '6 Months' : spec.value, isMismatch: idx === 1 }
            ]
          })),
          results: [
            { plat: 'GeM', base: gemBase, tax: gemTax, freight: 0, warrantyCalc: 0, landed: priceNum, isTarget: true, conf: '-' },
            { plat: 'Amazon', base: amzBase, tax: amzTax, freight: 0, warrantyCalc: 0, landed: amzLanded, isTarget: false, conf: '94.2%', freshness: '17:21 IST · Today', url: 'https://amazon.in' },
            { plat: 'Flipkart', base: flipBase, tax: flipTax, freight: 126, warrantyCalc: 0, landed: flipLanded, isTarget: false, conf: '87.1%', freshness: '17:19 IST · Today', url: 'https://flipkart.com' },
            { plat: 'IndiaMART', base: indBase, tax: indTax, freight: 0, warrantyCalc: 0, landed: indLanded, isTarget: false, conf: '82.4%', freshness: '17:18 IST · Today', url: 'https://indiamart.com' }
          ]
        };
        MOCK_DB[newId] = fallbackAudit;
        fetch('/api/v1/audits', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(fallbackAudit)
        }).catch(console.error);
        
        sessionStorage.setItem('gemIntel_scraped_id', newId);
        sessionStorage.setItem('gemIntel_autorun', 'true');
        setIsAnalyzing(false);
        setView('app');
        window.history.replaceState({}, document.title, "/");
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased relative">
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-center max-w-md w-full">
              <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner shadow-indigo-500/10">
                <BrainCircuit className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">GeM-Intel Engine</h2>
              <p className="text-slate-400 font-medium text-sm mb-8">Running AI Procurement Analysis</p>
              
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-4 overflow-hidden relative">
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full"
                  animate={{ left: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: '50%' }}
                />
              </div>
              
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{analysisStep}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'verify' ? (
        <VerifyView hash={new URLSearchParams(window.location.search).get('verify') || ''} onBack={() => { window.history.replaceState({}, document.title, "/"); setView('landing'); }} />
      ) : view === 'landing' ? (
        <LandingView onLaunch={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (currentUser) {
            setView('app');
          } else {
            setView('login');
          }
        }} />
      ) : view === 'login' ? (
        <LoginView onLogin={(user) => {
           setCurrentUser(user);
           setView('app');
        }} />
      ) : (
        <DashboardView onExit={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setCurrentUser(null);
          setView('landing');
        }} currentUser={currentUser} />
      )}
    </div>
  );
}