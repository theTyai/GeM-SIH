import React, { useEffect, useRef } from 'react';
import { Rocket, ArrowRight, CheckCircle2, XCircle, AlertTriangle, CheckSquare, Zap, Brain, Calculator, LineChart, ShieldCheck, Code2, Server, TerminalSquare, ArrowDown, Shield } from 'lucide-react';

export default function LandingView({ onLaunch }: { onLaunch: () => void }) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));

    const handleScroll = () => {
      if (!timelineRef.current || !progressRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startPos = rect.top - (windowHeight / 2);
      const totalHeight = rect.height;
      
      if (startPos < 0) {
        let percentage = Math.abs(startPos) / totalHeight * 100;
        percentage = Math.min(100, Math.max(0, percentage + 5));
        progressRef.current.style.height = `${percentage}%`;
        
        stepsRef.current.forEach((step, index) => {
          if(!step) return;
          const stepTriggerPoint = (index / (stepsRef.current.length - 1)) * 100 - 10;
          if (percentage >= stepTriggerPoint) {
            step.classList.add('active');
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="block opacity-100 animate-fade-in">
      <nav className="fixed w-full z-50 glass-nav transition-all duration-300" id="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center text-white font-bold italic text-xl">GI</div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-800">GeM-Intel</span>
            </div>
            
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#what-we-do" className="text-slate-600 hover:text-primary font-medium transition-colors">What We Do</a>
              <a href="#workflow" className="text-slate-600 hover:text-primary font-medium transition-colors">Pipeline</a>
              <a href="#architecture" className="text-slate-600 hover:text-primary font-medium transition-colors">Architecture</a>
              <button onClick={onLaunch} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md transform hover:-translate-y-0.5 animate-pulse-glow flex items-center gap-2">
                <Rocket className="w-4 h-4" /> Launch Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-400 rounded-full blur-3xl mix-blend-multiply filter"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left reveal">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-6 shadow-sm uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                SIH 2026 • Problem Statement 1360
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6 uppercase">
                Procurement Intelligence for <br/>
                <span className="text-indigo-600">Government Buyers</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Know the true market rate before public money leaves the system. Compare GeM products against external e-marketplaces using verifiable AI semantic matching.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={onLaunch} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group">
                  Run Investigation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="#workflow" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  See the Evidence
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none reveal delay-100 animate-float">
              <div className="rounded-2xl shadow-2xl border border-slate-200 bg-slate-900 overflow-hidden relative">
                <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="text-xs text-slate-400 ml-4 font-mono">GeM-Intel Dashboard</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">HP ProBook 15 G8 Core i5</h3>
                      <p className="text-slate-400 text-sm">Target: GeM Base Price ₹45,200</p>
                    </div>
                    <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded border border-emerald-500/30 text-sm font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> COMPLIANT
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-800 rounded p-3 flex justify-between items-center border border-slate-700">
                        <span className="text-slate-300 text-sm">Amazon (Landed Cost)</span>
                        <span className="text-white font-mono font-bold">₹46,500</span>
                    </div>
                    <div className="bg-slate-800 rounded p-3 flex justify-between items-center border border-slate-700">
                        <span className="text-slate-300 text-sm">Flipkart (Landed Cost)</span>
                        <span className="text-white font-mono font-bold">₹46,100</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><Shield className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Rule 149</p>
                  <p className="font-bold text-slate-800">Compliance Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="what-we-do" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-2">The Challenge & Solution</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Transforming Procurement Audits</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 reveal-left flex flex-col relative overflow-hidden shadow-sm hover:border-red-200 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-50 text-red-500 rounded-xl border border-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-bold text-slate-800">The Manual Way</h4>
              </div>
              <ul className="space-y-4 text-slate-600 flex-grow">
                <li className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 mt-0.5 text-red-400 shrink-0" /> <span>Time-consuming manual searches across multiple browser tabs.</span></li>
                <li className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 mt-0.5 text-red-400 shrink-0" /> <span>Comparing misleading headline prices without accounting for GST or Freight.</span></li>
                <li className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 mt-0.5 text-red-400 shrink-0" /> <span>Ad-hoc paper notes lacking a verifiable digital audit trail.</span></li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-8 border border-blue-200 reveal-right flex flex-col relative overflow-hidden shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-bold text-secondary">The GeM-Intel Way</h4>
              </div>
              <ul className="space-y-4 text-slate-700 flex-grow">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" /> <span>One-click AI semantic matching accurately identifies products across platforms.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" /> <span>Dynamic True Cost of Ownership (TCO) normalization standardizes landed costs.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" /> <span>Generates instant, tamper-proof blockchain-hashed audit certificates.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="py-24 bg-secondary text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-2">Processing Pipeline</h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">End-to-End Workflow</h3>
            <p className="text-slate-400 text-lg">Scroll down to trace the data flow through the AI engine.</p>
          </div>

          <div className="timeline-container" ref={timelineRef}>
            <div className="timeline-line">
              <div className="timeline-progress" ref={progressRef}></div>
            </div>

            {[ 
              { icon: Zap, title: "1. Trigger & Extraction", desc: "Node.js API receives request. Python Scraper Fleet pulls GeM specs and fetches external listings via DaaS/Puppeteer.", color: "text-primary" },
              { icon: Brain, title: "2. Semantic Matching", desc: "Sentence-Transformers and TF-IDF models align unstructured product attributes to find exact equivalents across marketplaces.", color: "text-purple-400" },
              { icon: Calculator, title: "3. TCO Normalization", desc: "AI Engine standardizes prices by computing GST slabs, PIN-code specific Freight, and warranties to form a True Landed Cost.", color: "text-amber-400" },
              { icon: LineChart, title: "4. Anomaly Detection", desc: "ARIMA/Prophet forecasting checks if the GeM listing exceeds the statistical Fair Market Value band, flagging potential overpricing.", color: "text-rose-400" },
              { icon: ShieldCheck, title: "5. Audit Output", desc: "Dashboard displays the comparison matrix and issues a tamper-proof, SHA-256 hashed PDF compliance certificate.", color: "text-emerald-400", special: true }
            ].map((step, i) => (
              <div className="timeline-step" key={i} ref={(el) => { if (el) stepsRef.current[i] = el; }}>
                <div className="timeline-dot"></div>
                <div className={`bg-slate-800/80 backdrop-blur p-6 rounded-xl timeline-content ${step.special ? 'border border-primary/30 shadow-[0_0_20px_rgba(14,165,233,0.15)] text-left' : (i % 2 === 0 ? 'text-left' : '')}`}>
                  <step.icon className={`w-8 h-8 mb-4 ${step.color}`} />
                  <h4 className={`text-xl font-bold mb-2 ${step.special ? 'text-white' : ''}`}>{step.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="architecture" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-2">System Design</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-secondary">Robust 3-Tier Architecture</h3>
          </div>

          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 reveal shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center"><Code2 className="w-6 h-6" /></div>
                <h4 className="text-xl font-bold text-slate-800">Client Tier</h4>
              </div>
              <p className="text-sm text-slate-600 mb-3">React.js Web Dashboard & Chrome Extension.</p>
              <div className="flex gap-2"><span className="text-xs font-semibold bg-white px-2 py-1 rounded text-blue-700 border border-blue-100">React</span><span className="text-xs font-semibold bg-white px-2 py-1 rounded text-blue-700 border border-blue-100">Tailwind CSS</span></div>
            </div>

            <div className="flex justify-center text-slate-300 reveal delay-100"><ArrowDown className="w-6 h-6" /></div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 reveal delay-200 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center"><Server className="w-6 h-6" /></div>
                <h4 className="text-xl font-bold text-slate-800">API & Orchestration Tier</h4>
              </div>
              <p className="text-sm text-slate-600 mb-3">Node.js/Express API Gateway, BullMQ async job queues, JWT Auth, PDF generation microservice.</p>
              <div className="flex gap-2"><span className="text-xs font-semibold bg-white px-2 py-1 rounded text-emerald-700 border border-emerald-100">Express</span><span className="text-xs font-semibold bg-white px-2 py-1 rounded text-emerald-700 border border-emerald-100">BullMQ</span></div>
            </div>

            <div className="flex justify-center text-slate-300 reveal delay-300"><ArrowDown className="w-6 h-6" /></div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 reveal delay-100 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-lg flex items-center justify-center"><TerminalSquare className="w-6 h-6" /></div>
                <h4 className="text-xl font-bold text-slate-800">AI & Data Tier</h4>
              </div>
              <p className="text-sm text-slate-600 mb-3">FastAPI hosting Python Scraper Fleet, Sentence-Transformers, TCO logic, and ARIMA Forecasting. Backed by MongoDB & Redis.</p>
              <div className="flex gap-2 flex-wrap"><span className="text-xs font-semibold bg-white px-2 py-1 rounded text-amber-700 border border-amber-100">FastAPI</span><span className="text-xs font-semibold bg-white px-2 py-1 rounded text-amber-700 border border-amber-100">Scikit-Learn</span><span className="text-xs font-semibold bg-white px-2 py-1 rounded text-amber-700 border border-amber-100">MongoDB</span><span className="text-xs font-semibold bg-white px-2 py-1 rounded text-amber-700 border border-amber-100">Redis</span></div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-secondary text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>Smart India Hackathon 2026 • SIH 1360</p>
          <p className="mt-2">Built with by <strong>Team Valeryon</strong></p>
        </div>
      </footer>
    </div>
  );
}
