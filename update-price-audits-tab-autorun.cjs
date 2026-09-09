const fs = require('fs');
const path = 'src/components/PriceAuditsTab.tsx';
let content = fs.readFileSync(path, 'utf8');

// I need to add a useEffect inside PriceAuditsTab that calls runPipeline() if sessionStorage.getItem('gemIntel_autorun') is 'true'
// Let's find a good place to inject the useEffect. 
// Right after const runPipeline = async () => { ... } is not great because runPipeline is not a stable dependency (unless it's wrapped in useCallback, but it might not be).
// Alternatively, we can inject it right before the return statement of PriceAuditsTab.

const returnIdx = content.indexOf('return (');

const useEffectCode = `
  useEffect(() => {
    if (sessionStorage.getItem('gemIntel_autorun') === 'true') {
      sessionStorage.removeItem('gemIntel_autorun');
      // small delay to let UI render before running animation
      setTimeout(() => {
        runPipeline();
      }, 500);
    }
  }, []);
  
  `;

content = content.substring(0, returnIdx) + useEffectCode + content.substring(returnIdx);

// Also need to make sure useEffect is imported in PriceAuditsTab.tsx
if (!content.includes('useEffect')) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");
}

fs.writeFileSync(path, content);
