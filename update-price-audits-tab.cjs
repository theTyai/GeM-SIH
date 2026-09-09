const fs = require('fs');
const path = 'src/components/PriceAuditsTab.tsx';
let content = fs.readFileSync(path, 'utf8');

// Safeguard against missing selectedProduct due to refresh
content = content.replace(
  "const [selectedProduct, setSelectedProduct] = useState(() => sessionStorage.getItem('gemIntel_scraped_id') || 'p1');",
  "const [selectedProduct, setSelectedProduct] = useState(() => (sessionStorage.getItem('gemIntel_scraped_id') && MOCK_DB[sessionStorage.getItem('gemIntel_scraped_id')!]) ? sessionStorage.getItem('gemIntel_scraped_id')! : 'p1');"
);

fs.writeFileSync(path, content);
