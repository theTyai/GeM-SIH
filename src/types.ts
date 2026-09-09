export interface ConfidenceMetrics {
  overall: number;
  identity: number;
  specs: number;
  brand: number;
  warranty: number;
}

export interface ProductResult {
  plat: string;
  base: number;
  tax: number;
  freight: number;
  warrantyCalc: number;
  landed: number;
  isTarget: boolean;
  conf?: string;
  freshness?: string;
  url?: string;
  imageUrl?: string;
  evidenceType?: string;
  timestamp?: string; // e.g. "09 Sep 2026 14:32 IST"
}

export interface SpecPlatform {
  name: string;
  value: string;
  isMismatch: boolean;
}

export interface Spec {
  key: string;
  gem: string;
  platforms: SpecPlatform[];
}

export interface RiskScore {
  total: number;
  breakdown: {
    priceVariance: number;
    specMismatch: number;
    sellerRisk: number;
    evidenceConfidence: number;
    priceVolatility: number;
  };
  primaryDriver: string;
}

export interface SellerIntelligence {
  name: string;
  totalAudits: number;
  flagged: number;
  averagePremium: number;
  risk: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface OfficerDecision {
  status: 'PENDING' | 'ACCEPTED' | 'JUSTIFIED' | 'REJECTED';
  reason?: string;
  justification?: string;
  timestamp?: string;
  officerName?: string;
}

export interface AuditData {
  id: string;
  name: string;
  verdict: 'COMPLIANT' | 'ANOMALY' | 'REVIEW' | 'HIGH RISK';
  gemPrice: number;
  fmv: number;
  variance: number;
  history: number[];
  specs: Spec[];
  results: ProductResult[];
  confidence: ConfidenceMetrics;
  freshness: string;
  evidence: string[];
  
  // New structured fields
  riskScore?: RiskScore;
  seller?: SellerIntelligence;
  decision?: OfficerDecision;
  dataQuality?: 'HIGH' | 'MODERATE' | 'LOW';
  potentialSavings?: number;
}

export interface Certificate {
  id: string;
  date: string;
  product: string;
  verdict: string;
  hash: string;
  prevHash?: string;
}

export interface LogEntry {
  msg: string;
  time: string;
  colorClass: string;
}
