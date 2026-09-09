const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
appCode = appCode.replace(
  "import LoginView from './components/LoginView';",
  "import LoginView from './components/LoginView';\nimport VerifyView from './components/VerifyView';"
);

// Update state type
appCode = appCode.replace(
  "const [view, setView] = useState<'landing' | 'login' | 'app'>('landing');",
  "const [view, setView] = useState<'landing' | 'login' | 'app' | 'verify'>('landing');"
);

// Add verify state handler in useEffect
appCode = appCode.replace(
  "const scrapedSpecs = params.get('specs');",
  "const scrapedSpecs = params.get('specs');\n    const verifyHash = params.get('verify');\n\n    if (verifyHash) {\n      setView('verify');\n      return;\n    }"
);

// Add verify view to render
appCode = appCode.replace(
  "{view === 'landing' ? (",
  "{view === 'verify' ? (\n        <VerifyView hash={new URLSearchParams(window.location.search).get('verify') || ''} onBack={() => { window.history.replaceState({}, document.title, \"/\"); setView('landing'); }} />\n      ) : view === 'landing' ? ("
);

fs.writeFileSync('src/App.tsx', appCode);
