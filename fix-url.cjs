const fs = require('fs');
let code = fs.readFileSync('extension/src/popup/App.tsx', 'utf8');

code = code.replace(
  "const url = `http://localhost:3000/?scrapedProduct=${encodeURIComponent(listingData.title)}&scrapedPrice=${listingData.price}&specs=${encodeURIComponent(JSON.stringify(listingData.rawSpecs || {}))}`;",
  "const url = `http://localhost:3000/?auditId=${auditId}`;"
);

fs.writeFileSync('extension/src/popup/App.tsx', code);
