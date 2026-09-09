document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url.includes("gem.gov.in")) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scrapeProductDetails,
  }, (results) => {
    if (results && results[0] && results[0].result) {
      const data = results[0].result;
      
      document.getElementById('loading').style.display = 'none';
      document.getElementById('product-details').style.display = 'block';
      
      document.getElementById('prod-title').innerText = data.title;
      document.getElementById('prod-price').innerText = data.price;
      
      if (data.image) {
        document.getElementById('prod-img').src = data.image;
      } else {
        document.getElementById('prod-img').style.display = 'none';
      }

      document.getElementById('run-audit-btn').addEventListener('click', () => {
        const btn = document.getElementById('run-audit-btn');
        btn.innerText = "INITIALIZING AUDIT...";
        btn.style.opacity = "0.7";
        
        // Use the current preview URL dynamically or fallback
        const appUrl = "https://ais-pre-jhfcnkx7otca2juoelgwp7-162326758375.asia-southeast1.run.app";
        const queryParams = new URLSearchParams({
            scrapedProduct: data.title,
            scrapedPrice: data.price,
            specs: JSON.stringify(data.specs || [])
        }).toString();
        
        setTimeout(() => {
          chrome.tabs.create({ url: `${appUrl}?${queryParams}` });
        }, 800);
      });
    } else {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('error-state').style.display = 'block';
      document.getElementById('error-state').innerText = "Could not detect product details on this page.";
    }
  });
});

function scrapeProductDetails() {
  const title = document.querySelector('.product-title')?.innerText || document.querySelector('h1')?.innerText || "Unknown Product";
  const price = document.querySelector('.m-w')?.innerText || document.querySelector('.m-w-price')?.innerText || document.querySelector('.price')?.innerText || "Price not found";
  
  let image = "";
  const imgEl = document.querySelector('.product-image img') || document.querySelector('#pro-img');
  if (imgEl && imgEl.src) {
     image = imgEl.src;
  }

  let specList = [];
  const rows = document.querySelectorAll('tr');
  rows.forEach(tr => {
    const tds = tr.querySelectorAll('td');
    if (tds.length === 2 && specList.length < 8) {
      specList.push({ 
         key: tds[0].innerText.trim(), 
         value: tds[1].innerText.trim() 
      });
    }
  });

  return { title, price, image, specs: specList };
}
