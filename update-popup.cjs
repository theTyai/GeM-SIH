const fs = require('fs');
const path = 'extension/popup.js';
let content = fs.readFileSync(path, 'utf8');

// Update scrapeProductDetails to include specs
const newScrapeCode = `function scrapeProductDetails() {
  const title = document.querySelector('.product-title')?.innerText || document.querySelector('h1')?.innerText || "Unknown Product";
  const price = document.querySelector('.m-w')?.innerText || document.querySelector('.m-w-price')?.innerText || document.querySelector('.price')?.innerText || "Price not found";
  
  let image = "";
  const imgEl = document.querySelector('.product-image img') || document.querySelector('#pro-img');
  if (imgEl && imgEl.src) {
     image = imgEl.src;
  }

  // Scrape specifications from GeM tables
  let specList = [];
  const rows = document.querySelectorAll('tr');
  rows.forEach(tr => {
    const tds = tr.querySelectorAll('td');
    // GeM specs usually have 2 columns per row
    if (tds.length === 2 && specList.length < 8) {
      specList.push({ 
         key: tds[0].innerText.trim(), 
         value: tds[1].innerText.trim() 
      });
    }
  });

  return { title, price, image, specs: specList };
}`;

content = content.replace(/function scrapeProductDetails\(\) \{[\s\S]*?\}/, newScrapeCode);

// Update the click handler to pass specs
const oldClickCode = `const appUrl = "https://ais-pre-jhfcnkx7otca2juoelgwp7-162326758375.asia-southeast1.run.app/";
        setTimeout(() => {
          chrome.tabs.create({ url: \`\${appUrl}?scrapedProduct=\${encodeURIComponent(data.title)}&scrapedPrice=\${encodeURIComponent(data.price)}\` });
        }, 800);`;

const newClickCode = `const appUrl = "https://ais-pre-jhfcnkx7otca2juoelgwp7-162326758375.asia-southeast1.run.app/";
        const queryParams = new URLSearchParams({
            scrapedProduct: data.title,
            scrapedPrice: data.price,
            specs: JSON.stringify(data.specs || [])
        }).toString();
        
        setTimeout(() => {
          chrome.tabs.create({ url: \`\${appUrl}?\${queryParams}\` });
        }, 800);`;

content = content.replace(oldClickCode, newClickCode);

fs.writeFileSync(path, content);
