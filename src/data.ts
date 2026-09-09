import { AuditData, Certificate } from './types';

export const MOCK_DB: Record<string, AuditData> = {
  'p1': {
    id: 'p1',
    name: 'HP ProBook 15 G8 Core i5',
    verdict: 'COMPLIANT',
    status: 'REVIEW_REQUIRED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    assignedOfficerId: 'user_1',
    gemPrice: 45200,
    fmv: 46100,
    variance: -2.0,
    freshness: '12 min ago',
    confidence: { overall: 96.2, identity: 99, specs: 98, brand: 100, warranty: 88 },
    dataQuality: 'HIGH',
    potentialSavings: 0,
    riskScore: {
      total: 12,
      breakdown: { priceVariance: 2, specMismatch: 5, sellerRisk: 2, evidenceConfidence: 2, priceVolatility: 1 },
      primaryDriver: 'Normal minor spec variance (OS version).'
    },
    seller: {
      name: 'TechMart Solutions',
      totalAudits: 142,
      flagged: 3,
      averagePremium: 1.2,
      risk: 'LOW'
    },
    decision: {
      status: 'PENDING'
    },
    evidence: [
      '3 comparable listings found with 96%+ specification match.',
      'GeM price is exactly in line with calculated Fair Market Value (-2.0%).',
      'No critical specification discrepancies detected.'
    ],
    history: [44500, 44800, 45000, 45200, 45200, 45200, 45200],
    specs: [
        { key: 'Processor', gem: 'Intel Core i5', platforms: [{name: 'Amazon', value: 'Intel Core i5', isMismatch: false}, {name: 'Flipkart', value: 'Intel Core i5', isMismatch: false}] },
        { key: 'RAM', gem: '16GB DDR4', platforms: [{name: 'Amazon', value: '16GB DDR4', isMismatch: false}, {name: 'Flipkart', value: '16GB DDR4', isMismatch: false}] },
        { key: 'Storage', gem: '512GB NVMe', platforms: [{name: 'Amazon', value: '512GB NVMe', isMismatch: false}, {name: 'Flipkart', value: '512GB NVMe', isMismatch: false}] },
        { key: 'Screen Size', gem: '15.6" FHD', platforms: [{name: 'Amazon', value: '15.6" FHD', isMismatch: false}, {name: 'Flipkart', value: '15.6" FHD', isMismatch: false}] },
        { key: 'OS', gem: 'Windows 11 Pro', platforms: [{name: 'Amazon', value: 'Windows 11 Pro', isMismatch: false}, {name: 'Flipkart', value: 'Windows 11 Home', isMismatch: true}] },
        { key: 'Warranty', gem: '1 Year Onsite', platforms: [{name: 'Amazon', value: '1 Year Onsite', isMismatch: false}, {name: 'Flipkart', value: '1 Year Onsite', isMismatch: false}] }
    ],
    results: [
      { plat: 'GeM', base: 45200, tax: 0, freight: 0, warrantyCalc: 0, landed: 45200, isTarget: true, conf: '-', evidenceType: 'Primary procurement source', url: 'https://gem.gov.in', imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80', timestamp: new Date(Date.now() - 720000).toLocaleString() },
      { plat: 'Amazon', base: 43000, tax: 3500, freight: 0, warrantyCalc: 0, landed: 46500, isTarget: false, conf: '96.2%', freshness: '12 min ago', evidenceType: 'Market evidence', url: 'https://amazon.in', imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80', timestamp: new Date(Date.now() - 720000).toLocaleString() },
      { plat: 'Flipkart', base: 43500, tax: 2600, freight: 0, warrantyCalc: 0, landed: 46100, isTarget: false, conf: '94.8%', freshness: '45 min ago', evidenceType: 'Market evidence', url: 'https://flipkart.com', imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80', timestamp: new Date(Date.now() - 2700000).toLocaleString() }
    ]
  },
  'p2': {
    id: 'p2',
    name: 'Samsung 55" 4K Smart TV',
    verdict: 'REVIEW',
    status: 'REVIEW_REQUIRED',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    assignedOfficerId: 'user_1',
    gemPrice: 64900,
    fmv: 51200,
    variance: 26.8,
    freshness: '8 min ago',
    confidence: { overall: 94.1, identity: 98, specs: 92, brand: 100, warranty: 68 },
    dataQuality: 'HIGH',
    potentialSavings: 13700,
    riskScore: {
      total: 73,
      breakdown: { priceVariance: 53, specMismatch: 10, sellerRisk: 10, evidenceConfidence: 6, priceVolatility: 4 },
      primaryDriver: '26.8% price premium & spec mismatch.'
    },
    seller: {
      name: 'Global Electronics Ltd',
      totalAudits: 84,
      flagged: 12,
      averagePremium: 8.7,
      risk: 'HIGH'
    },
    decision: {
      status: 'PENDING'
    },
    evidence: [
      'GeM\'s landed cost is ₹64,900, which is 26.8% above the Fair Market Value (₹51,200).',
      'GeM listing claims 3-Year Comprehensive Warranty and 2025 Model Year.',
      'Identical SKU on Amazon/Reliance is the 2023 model with 1-Year Standard Warranty.',
      'Spec inflation detected to justify the price hike.'
    ],
    history: [50000, 50500, 51000, 51200, 62000, 64000, 64900],
    specs: [
        { key: 'Display', gem: '55" 4K UHD', platforms: [{name: 'Amazon', value: '55" 4K UHD', isMismatch: false}, {name: 'Reliance', value: '55" 4K UHD', isMismatch: false}] },
        { key: 'Smart OS', gem: 'Tizen', platforms: [{name: 'Amazon', value: 'Tizen', isMismatch: false}, {name: 'Reliance', value: 'Tizen', isMismatch: false}] },
        { key: 'Model Year', gem: '2025', platforms: [{name: 'Amazon', value: '2023', isMismatch: true}, {name: 'Reliance', value: '2023', isMismatch: true}] },
        { key: 'Warranty', gem: '3 Years Comp', platforms: [{name: 'Amazon', value: '1 Year Std', isMismatch: true}, {name: 'Reliance', value: '1 Year Std', isMismatch: true}] }
    ],
    results: [
      { plat: 'GeM', base: 55000, tax: 9900, freight: 0, warrantyCalc: 0, landed: 64900, isTarget: true, conf: '-', evidenceType: 'Primary procurement source', url: 'https://gem.gov.in', imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80', timestamp: new Date(Date.now() - 480000).toLocaleString() },
      { plat: 'Amazon', base: 41525, tax: 7475, freight: 0, warrantyCalc: 500, landed: 49500, isTarget: false, conf: '94.1%', freshness: '8 min ago', evidenceType: 'Market evidence', url: 'https://amazon.in', imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80', timestamp: new Date(Date.now() - 480000).toLocaleString() },
      { plat: 'Reliance Digital', base: 43500, tax: 7830, freight: 0, warrantyCalc: 500, landed: 51830, isTarget: false, conf: '93.5%', freshness: '1 hr ago', evidenceType: 'Market evidence', url: 'https://reliancedigital.in', imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80', timestamp: new Date(Date.now() - 3600000).toLocaleString() }
    ]
  },
  'p3': {
    id: 'p3',
    name: 'Steel Filing Cabinet 4 Drawer',
    verdict: 'COMPLIANT',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    assignedOfficerId: 'user_2',
    gemPrice: 12500,
    fmv: 13000,
    variance: -3.8,
    freshness: '1 hr ago',
    confidence: { overall: 91.4, identity: 90, specs: 95, brand: 85, warranty: 99 },
    dataQuality: 'MEDIUM',
    potentialSavings: 0,
    riskScore: {
      total: 5,
      breakdown: { priceVariance: 0, specMismatch: 2, sellerRisk: 1, evidenceConfidence: 1, priceVolatility: 1 },
      primaryDriver: 'Low price variance.'
    },
    seller: {
      name: 'Steelworks India',
      totalAudits: 50,
      flagged: 1,
      averagePremium: 0,
      risk: 'LOW'
    },
    decision: {
      status: 'APPROVED',
      officerId: 'user_2',
      timestamp: new Date(Date.now() - 300000000).toISOString()
    },
    evidence: [
      '2 comparable listings found.',
      'GeM price is below the calculated Fair Market Value.'
    ],
    history: [12000, 12200, 12500, 12500, 12500, 12500, 12500],
    specs: [
        { key: 'Material', gem: 'CRCA Steel', platforms: [{name: 'IndiaMART', value: 'CRCA Steel', isMismatch: false}] },
        { key: 'Drawers', gem: '4', platforms: [{name: 'IndiaMART', value: '4', isMismatch: false}] },
        { key: 'Lock Type', gem: 'Central', platforms: [{name: 'IndiaMART', value: 'Standard Cam Lock', isMismatch: true}] },
        { key: 'Dimensions', gem: '1320 x 470 x 620 mm', platforms: [{name: 'IndiaMART', value: '1300 x 470 x 620 mm', isMismatch: false}] },
        { key: 'Thickness', gem: '0.8mm', platforms: [{name: 'IndiaMART', value: '0.8mm', isMismatch: false}] },
        { key: 'Finish', gem: 'Powder Coated', platforms: [{name: 'IndiaMART', value: 'Powder Coated', isMismatch: false}] }
    ],
    results: [
      { plat: 'GeM', base: 12500, tax: 0, freight: 0, warrantyCalc: 0, landed: 12500, isTarget: true, conf: '-', evidenceType: 'Primary procurement source', url: 'https://gem.gov.in', imageUrl: 'https://images.unsplash.com/photo-1628189874834-315ec02d7e00?auto=format&fit=crop&w=400&q=80' },
      { plat: 'IndiaMART', base: 11000, tax: 2000, freight: 0, warrantyCalc: 0, landed: 13000, isTarget: false, conf: '91.4%', freshness: '3 hrs ago', evidenceType: 'B2B market evidence', url: 'https://indiamart.com', imageUrl: 'https://images.unsplash.com/photo-1628189874834-315ec02d7e00?auto=format&fit=crop&w=400&q=80' }
    ]
  },
  'p4': {
    id: 'p4',
    name: 'Cisco Catalyst 9200 48-port Switch',
    verdict: 'COMPLIANT',
    status: 'CERTIFIED',
    createdAt: new Date(Date.now() - 400000000).toISOString(),
    assignedOfficerId: 'user_1',
    gemPrice: 125000,
    fmv: 128500,
    variance: -2.7,
    freshness: '15 min ago',
    confidence: { overall: 98.5, identity: 100, specs: 98, brand: 100, warranty: 90 },
    dataQuality: 'HIGH',
    potentialSavings: 0,
    riskScore: {
      total: 8,
      breakdown: { priceVariance: 0, specMismatch: 0, sellerRisk: 4, evidenceConfidence: 2, priceVolatility: 2 },
      primaryDriver: 'Pristine spec match.'
    },
    seller: {
      name: 'Network Solutions Pvt',
      totalAudits: 310,
      flagged: 12,
      averagePremium: 2.1,
      risk: 'LOW'
    },
    decision: {
      status: 'APPROVED',
      officerId: 'user_1',
      timestamp: new Date(Date.now() - 350000000).toISOString()
    },
    evidence: [
      '3 identical listings found across B2B platforms.',
      'GeM price is 2.7% below the Fair Market Value.',
      'All critical enterprise specifications match.'
    ],
    history: [130000, 128000, 126500, 125000, 125000, 125000, 125000],
    specs: [
        { key: 'Ports', gem: '48 x 10/100/1000', platforms: [{name: 'IndiaMART', value: '48 x 10/100/1000', isMismatch: false}, {name: 'Amazon B2B', value: '48 x 10/100/1000', isMismatch: false}] },
        { key: 'PoE+', gem: 'Yes', platforms: [{name: 'IndiaMART', value: 'Yes', isMismatch: false}, {name: 'Amazon B2B', value: 'Yes', isMismatch: false}] },
        { key: 'Uplinks', gem: '4 x 10G SFP+', platforms: [{name: 'IndiaMART', value: '4 x 10G SFP+', isMismatch: false}, {name: 'Amazon B2B', value: '4 x 10G SFP+', isMismatch: false}] },
        { key: 'Warranty', gem: '3 Years Limited Lifetime', platforms: [{name: 'IndiaMART', value: '3 Years', isMismatch: false}, {name: 'Amazon B2B', value: '3 Years', isMismatch: false}] }
    ],
    results: [
      { plat: 'GeM', base: 105932, tax: 19068, freight: 0, warrantyCalc: 0, landed: 125000, isTarget: true, conf: '-', evidenceType: 'Primary procurement source', url: 'https://gem.gov.in', imageUrl: 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&w=400&q=80' },
      { plat: 'Amazon B2B', base: 106000, tax: 19080, freight: 1200, warrantyCalc: 0, landed: 126280, isTarget: false, conf: '99.0%', freshness: '15 min ago', evidenceType: 'Market evidence', url: 'https://amazon.in/business', imageUrl: 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&w=400&q=80' },
      { plat: 'IndiaMART', base: 108000, tax: 19440, freight: 2500, warrantyCalc: 0, landed: 129940, isTarget: false, conf: '98.0%', freshness: '2 hrs ago', evidenceType: 'B2B market evidence', url: 'https://indiamart.com', imageUrl: 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&w=400&q=80' }
    ]
  },
  'p5': {
    id: 'p5',
    name: 'Dell OptiPlex 7090 Tower',
    verdict: 'HIGH RISK',
    status: 'REVIEW_REQUIRED',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    assignedOfficerId: 'user_1',
    gemPrice: 85000,
    fmv: 62000,
    variance: 37.1,
    freshness: 'Just now',
    confidence: { overall: 96.0, identity: 99, specs: 95, brand: 100, warranty: 85 },
    dataQuality: 'HIGH',
    potentialSavings: 23000,
    riskScore: {
      total: 82,
      breakdown: { priceVariance: 65, specMismatch: 5, sellerRisk: 10, evidenceConfidence: 1, priceVolatility: 1 },
      primaryDriver: '37.1% price premium.'
    },
    seller: {
      name: 'Alpha IT Traders',
      totalAudits: 60,
      flagged: 14,
      averagePremium: 12.5,
      risk: 'HIGH'
    },
    decision: {
      status: 'PENDING'
    },
    evidence: [
      'Landed cost is 37.1% above Fair Market Value (Critical Flag).',
      'GeM listing includes outdated Intel 10th Gen processor.',
      'Identical model available on Amazon for ₹58,000 base.',
      'Pattern matches 14 prior flags from this seller.'
    ],
    history: [60000, 61500, 62000, 62000, 85000, 85000, 85000],
    specs: [
        { key: 'Processor', gem: 'Intel Core i7 10th Gen', platforms: [{name: 'Amazon', value: 'Intel Core i7 10th Gen', isMismatch: false}, {name: 'Flipkart', value: 'Intel Core i7 10th Gen', isMismatch: false}] },
        { key: 'RAM', gem: '16GB DDR4', platforms: [{name: 'Amazon', value: '16GB DDR4', isMismatch: false}, {name: 'Flipkart', value: '8GB DDR4', isMismatch: true}] },
        { key: 'Storage', gem: '1TB HDD + 256GB SSD', platforms: [{name: 'Amazon', value: '1TB HDD + 256GB SSD', isMismatch: false}, {name: 'Flipkart', value: '512GB SSD', isMismatch: true}] },
        { key: 'OS', gem: 'Windows 10 Pro', platforms: [{name: 'Amazon', value: 'Windows 10 Pro', isMismatch: false}, {name: 'Flipkart', value: 'DOS', isMismatch: true}] }
    ],
    results: [
      { plat: 'GeM', base: 72034, tax: 12966, freight: 0, warrantyCalc: 0, landed: 85000, isTarget: true, conf: '-', evidenceType: 'Primary procurement source', url: 'https://gem.gov.in', imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80' },
      { plat: 'Amazon', base: 49152, tax: 8848, freight: 0, warrantyCalc: 0, landed: 58000, isTarget: false, conf: '97.5%', freshness: 'Just now', evidenceType: 'Market evidence', url: 'https://amazon.in', imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80' },
      { plat: 'Flipkart', base: 45000, tax: 8100, freight: 500, warrantyCalc: 8000, landed: 61600, isTarget: false, conf: '88.2%', freshness: '30 min ago', evidenceType: 'Market evidence', url: 'https://flipkart.com', imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80' }
    ]
  }
};

export const generateHash = () => {
  return Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

export const SYSTEM_RULES = {
  autoFlagVariance: 15,
  blockOrderVariance: 30,
  confidenceThreshold: 85,
  minSpecMatchScore: 90,
  maxMarketplaces: 5
};

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'GI-2026-001284',
    auditId: 'p4',
    productName: 'Cisco Catalyst 9200 Switch',
    officerName: 'Ashish Mishra',
    date: new Date(Date.now() - 350000000).toISOString(),
    status: 'VALID',
    verdict: 'COMPLIANT',
    decisionStatus: 'APPROVED',
    fmv: 128500,
    gemPrice: 125000,
    variance: -2.7,
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
  }
];
