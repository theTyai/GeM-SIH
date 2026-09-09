// gem-detector.ts equivalent
function extractListingData() {
  const url = window.location.href;
  if (!url.includes('gem.gov.in')) return null;

  try {
    // These selectors are mocked for the structure, as actual GeM selectors differ
    const title = document.querySelector('h1')?.innerText || document.title;
    const priceText = document.querySelector('.m-w-price, .price, .variant-price')?.textContent || '0';
    const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;
    
    // Attempt to parse ID from URL (e.g. /products/xxxx)
    const urlParts = url.split('/');
    const productId = urlParts[urlParts.length - 1].split('?')[0] || `gem_${Date.now()}`;

    // Extract specs
    const specs: Record<string, string> = {};
    document.querySelectorAll('table.spec-table tr, .specifications tr').forEach(row => {
      const key = row.children[0]?.textContent?.trim();
      const val = row.children[1]?.textContent?.trim();
      if (key && val) specs[key] = val;
    });

    return {
      productId,
      title,
      price,
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
