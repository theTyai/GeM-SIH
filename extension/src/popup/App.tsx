import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Search, Activity, ExternalLink, Settings } from 'lucide-react';

export default function App() {
  const [listingData, setListingData] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [appUrl, setAppUrl] = useState('https://ais-dev-jhfcnkx7otca2juoelgwp7-162326758375.asia-southeast1.run.app');
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    // Load saved App URL
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['appUrl'], (result) => {
        if (result.appUrl) setAppUrl(result.appUrl);
      });
    }
  }, []);

  const saveSettings = () => {
    let cleanUrl = appUrl.trim().replace(/\/$/, ''); // remove trailing slash
    setAppUrl(cleanUrl);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ appUrl: cleanUrl });
    }
    setShowSettings(false);
  };

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'EXTRACT_LISTING' }, (response) => {
            if (response && response.title) {
              setListingData(response);
            }
          });
        }
      });
    } else {
      // Standalone browser fallback for preview
      setListingData({
        title: 'Dell OptiPlex 7090 Desktop Computer',
        price: 68499,
        rawSpecs: { "Processor": "Intel Core i7", "RAM": "16GB" }
      });
    }
  }, []);

  const launchAudit = () => {
    if (!listingData) return;
    setIsLaunching(true);
    
    // The web app expects specs as an array of objects or stringified JSON
    const specsString = JSON.stringify(listingData.rawSpecs || {});
    
    const url = new URL(appUrl);
    url.searchParams.set('scrapedProduct', listingData.title);
    url.searchParams.set('scrapedPrice', listingData.price.toString());
    url.searchParams.set('specs', specsString);
    
    setTimeout(() => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({ url: url.toString() });
        setIsLaunching(false);
      } else {
        window.open(url.toString(), '_blank');
        setIsLaunching(false);
      }
    }, 500);
  };

  if (showSettings) {
    return (
      <div className="flex flex-col h-[500px] bg-slate-50 p-6 space-y-4">
        <h2 className="font-bold text-lg text-slate-800">Extension Settings</h2>
        <div className="space-y-2 flex-1">
          <label className="text-sm font-bold text-slate-700">GeM-Intel App URL</label>
          <input 
            type="text" 
            value={appUrl}
            onChange={(e) => setAppUrl(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded text-sm"
            placeholder="https://..."
          />
          <p className="text-xs text-slate-500">
            This is the URL where you will be redirected to view and run the full audit investigation.
          </p>
        </div>
        <button onClick={saveSettings} className="w-full bg-slate-900 text-white font-bold py-2 rounded">
          Save Settings
        </button>
      </div>
    );
  }

  if (!listingData) {
    return (
      <div className="flex flex-col h-[500px] bg-slate-50 relative">
        <button onClick={() => setShowSettings(true)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 z-20">
          <Settings className="w-5 h-5" />
        </button>
        <div className="p-6 text-center space-y-4 text-slate-500 flex flex-col items-center justify-center h-full">
          <Search className="w-12 h-12 opacity-20" />
          <p className="font-medium">Navigate to a GeM product listing to begin analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-slate-50 relative">
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h1 className="font-black tracking-wider text-sm uppercase">GeM-Intel</h1>
        </div>
        <button onClick={() => setShowSettings(true)} className="text-slate-400 hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {/* Listing Header */}
        <div className="mb-6">
          <h2 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-1">{listingData.title}</h2>
          <p className="text-xl font-black text-slate-900">₹{listingData.price.toLocaleString()}</p>
        </div>

        <div className="space-y-4 mt-8 flex-1 flex flex-col justify-center">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
            <Activity className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs text-indigo-800 font-medium">Ready to extract immutable evidence and perform deterministic market analysis.</p>
          </div>
          
          <button 
            onClick={launchAudit}
            disabled={isLaunching}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 disabled:opacity-75"
          >
            {isLaunching ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Launching...</>
            ) : (
              <>Run Audit Investigation <ExternalLink className="w-4 h-4 ml-1" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
