const fs = require('fs');
const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `import { useState, useEffect } from 'react';
import LandingView from './components/LandingView';
import DashboardView from './components/DashboardView';
import { MOCK_DB } from './data';

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scrapedProduct = params.get('scrapedProduct');
    const scrapedPrice = params.get('scrapedPrice');
    const scrapedSpecs = params.get('specs');

    if (scrapedProduct && scrapedPrice) {
      const rawPrice = scrapedPrice.split('.')[0].replace(/[^0-9]/g, '');
      const priceNum = parseInt(rawPrice, 10) || 50000;
      
      const fmv = Math.round(priceNum * 0.85); // Simulated fair market value
      const variance = Number(((priceNum - fmv) / fmv * 100).toFixed(1));
      
      let parsedSpecs = [];
      try {
         if (scrapedSpecs) parsedSpecs = JSON.parse(scrapedSpecs);
      } catch(e) {}

      const finalSpecs = parsedSpecs.length > 0 
        ? parsedSpecs.map((s: any) => ({
            key: s.key.substring(0, 40),
            gem: s.value.substring(0, 50),
            platforms: [
                { name: 'Amazon', value: s.value.substring(0, 50), isMismatch: false },
                { name: 'Flipkart', value: s.value.substring(0, 50), isMismatch: false }
            ]
          }))
        : [
            { key: 'Product', gem: scrapedProduct, platforms: [{name: 'Amazon', value: scrapedProduct, isMismatch: false}] }
          ];

      const newId = 'scraped_' + Date.now();
      MOCK_DB[newId] = {
        id: newId,
        name: scrapedProduct,
        verdict: 'REVIEW',
        gemPrice: priceNum,
        fmv: fmv,
        variance: variance,
        freshness: 'Just now',
        confidence: { overall: 89.4, identity: 95, specs: 90, brand: 92, warranty: 80 },
        history: [fmv - 1500, fmv, fmv, priceNum, priceNum],
        evidence: [
          'Trigger: Detected via Browser Extension on GeM portal.',
          \`Anomaly Alert: GeM price (₹\${priceNum.toLocaleString()}) exceeds Fair Market Value (₹\${fmv.toLocaleString()}) by \${variance}%.\`,
          'AI Matching: Cross-referenced via SBERT across Amazon, Flipkart, and IndiaMART.',
          'Compliance: Flags potential violation of GFR 2017 Rule 149 (Reasonability of Rates).'
        ],
        specs: finalSpecs,
        results: [
          { plat: 'GeM', base: priceNum, tax: 0, freight: 0, warrantyCalc: 0, landed: priceNum, isTarget: true, conf: '-' },
          { plat: 'Amazon', base: fmv - 2000, tax: 2000, freight: 0, warrantyCalc: 0, landed: fmv, isTarget: false, conf: '89.4%', freshness: 'Just now', url: 'https://amazon.in' },
          { plat: 'Flipkart', base: fmv - 1500, tax: 1500, freight: 500, warrantyCalc: 0, landed: fmv + 500, isTarget: false, conf: '87.1%', freshness: '2 hrs ago', url: 'https://flipkart.com' },
          { plat: 'IndiaMART', base: fmv - 3000, tax: 1500, freight: 500, warrantyCalc: 0, landed: fmv - 1000, isTarget: false, conf: '76.2%', freshness: '1 day ago', url: 'https://indiamart.com' }
        ]
      };
      
      sessionStorage.setItem('gemIntel_scraped_id', newId);
      sessionStorage.setItem('gemIntel_autorun', 'true');
      setView('app');
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      {view === 'landing' ? (
        <LandingView onLaunch={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setView('app');
        }} />
      ) : (
        <DashboardView onExit={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setView('landing');
        }} />
      )}
    </div>
  );
}`;

fs.writeFileSync(path, replacement);
