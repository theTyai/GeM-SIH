// gem-detector.ts equivalent
function extractListingData() {
  const url = window.location.href;
  if (!url.includes('gem.gov.in')) return null;

  try {
    const title = document.querySelector('h1')?.innerText || document.title;
    
    // Robust price extraction for GeM
    let priceText = '';
    
    // 1. Look for standard price selectors
    const priceEl = document.querySelector('.m-w-price, .price, .variant-price, span.m-w');
    if (priceEl) priceText = priceEl.textContent || '';
    
    // 2. Fallback: Search table rows for "Offer Price/Unit"
    if (!priceText || priceText === '0' || priceText.trim() === '') {
      const rows = document.querySelectorAll('tr, li, div');
      for (const row of Array.from(rows)) {
        if (row.textContent?.includes('Offer Price/Unit') || row.textContent?.includes('Price For :')) {
          priceText = row.textContent;
          break;
        }
      }
    }
    
    // 3. Fallback: Just find the biggest ₹ text on the page
    if (!priceText || !priceText.includes('₹')) {
      const allText = document.body.innerText;
      const match = allText.match(/₹\s*[\d,]+\.?\d*/);
      if (match) priceText = match[0];
    }

    // Extract numbers only
    const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;
    // Note: Since price might have decimals (.00), replace(/[^0-9]/g, '') on "48,000.00" -> 4800000. 
    // Wait, let's fix the regex to handle decimals correctly!
    let parsedPrice = 0;
    const cleanPriceStr = priceText.replace(/,/g, '').match(/\d+(\.\d+)?/);
    if (cleanPriceStr) {
      parsedPrice = Math.floor(parseFloat(cleanPriceStr[0]));
    }
    
    // Attempt to parse ID from URL (e.g. /products/xxxx)
    const urlParts = url.split('/');
    const productIdMatch = url.match(/-p-(\d+)-/); // e.g. -p-5116877-
    const productId = productIdMatch ? `gem_${productIdMatch[1]}` : (urlParts[urlParts.length - 1].split('?')[0] || `gem_${Date.now()}`);

    // Extract specs
    const specs: Record<string, string> = {};
    document.querySelectorAll('table tr, .spec-table tr, .specifications tr').forEach(row => {
      if (row.children.length >= 2) {
        const key = row.children[0]?.textContent?.trim();
        const val = row.children[1]?.textContent?.trim();
        if (key && val && key.length < 50 && val.length < 200) specs[key] = val;
      }
    });

    return {
      productId,
      title,
      price: parsedPrice,
      url,
      rawSpecs: specs
    };
  } catch (e) {
    console.error('GeM-Intel Extraction Error:', e);
    return null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_LISTING') {
    const data = extractListingData();
    sendResponse(data);
  }
});
