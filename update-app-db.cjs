const fs = require('fs');
const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Inside App.tsx, right after calculating newId and creating the new audit object, we POST it to the server.
content = content.replace(
  `MOCK_DB[newId] = {
            id: newId,`,
  `const finalAudit = {
            id: newId,`
);

content = content.replace(
  `...aiResult // Merge the AI-generated FMV, specs, results, verdict, etc.
          };`,
  `...aiResult // Merge the AI-generated FMV, specs, results, verdict, etc.
          };
          fetch('/api/v1/audits', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(finalAudit)
          }).then(() => {
             MOCK_DB[newId] = finalAudit;
          });`
);

content = content.replace(
  `MOCK_DB[newId] = {
          id: newId,
          name: scrapedProduct,
          verdict: 'REVIEW',`,
  `const fallbackAudit = {
          id: newId,
          name: scrapedProduct,
          verdict: 'REVIEW',`
);

content = content.replace(
  `url: 'https://flipkart.com' }
          ]
        };`,
  `url: 'https://flipkart.com' }
          ]
        };
        fetch('/api/v1/audits', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(fallbackAudit)
        }).then(() => {
             MOCK_DB[newId] = fallbackAudit;
        });`
);

// We should also fetch the DB on load and populate MOCK_DB.
const fetchCode = `useEffect(() => {
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
    const params = new URLSearchParams(window.location.search);`;

content = content.replace("useEffect(() => {\n    const params = new URLSearchParams(window.location.search);", fetchCode);

fs.writeFileSync(path, content);
