export type Role = 'OFFICER' | 'AUDITOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export type AuditStatus = 'PENDING' | 'SCRAPING' | 'MATCHING' | 'SCORING' | 'IN_REVIEW' | 'COMPLIANT' | 'REJECTED' | 'ESCALATED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ApiAuditListResponse {
  id: string;
  gemListingId: string;
  status: AuditStatus;
  riskLevel: RiskLevel | null;
  priceVariancePct: string | null;
  createdAt: string;
  updatedAt: string;
  title: string | null;
  listedPrice: string | null;
  decision: string | null;
}

export interface ApiSnapshot {
  id: string;
  sourcePlatform: string;
  sourceUrl: string;
  basePrice: string | null;
  taxPct: string | null;
  freight: string | null;
  warrantyValue: string | null;
  landedCost: string | null;
  specJson: any | null;
  specMatchScore: string | null;
  evidenceObjectKey: string;
  evidenceSha256: string;
  isSimulated: boolean;
  scrapedAt: string;
}

export interface ApiMatchAnalysis {
  id: string;
  snapshotId: string;
  model: string;
  responseHash: string;
  specMatchScore: string;
  resultJson: {
    matched_attributes: any[];
    mismatches: any[];
    unknown_attributes: string[];
    confidence: number;
  };
  analyzedAt: string;
}

export interface ApiScoreAnalysis {
  id: string;
  inputSnapshotIds: string[];
  fmv: string | null;
  priceVariancePct: string | null;
  minSpecMatchScore: string | null;
  riskLevel: RiskLevel | null;
  calculationVersion: string;
  resultJson: {
    details: string[];
    targetPrice: number;
    evidenceCount: number;
    specThresholdPassed: boolean;
    evidenceSufficient: boolean;
    requiresOfficerReview: boolean;
  };
  createdAt: string;
}

export interface ApiAuditDecision {
  id: string;
  decision: string;
  justification: string | null;
  createdAt: string;
  officerId: string;
}

export interface ApiAuditDetail {
  audit: {
    id: string;
    gemListingId: string;
    status: AuditStatus;
    riskLevel: RiskLevel | null;
    priceVariancePct: string | null;
    fmv: string | null;
    minSpecMatchScore: string | null;
    rulesVersionId: string;
    decision: string | null;
    decisionJustification: string | null;
    decidedBy: string | null;
    decidedAt: string | null;
    certificateLedgerRef: string | null;
    createdAt: string;
    updatedAt: string;
  };
  listing: {
    id: string;
    title: string;
    category: string;
    listedPrice: string;
    specJson: any;
  };
  rules: {
    id: string;
    autoFlagVariancePct: string;
    minSpecMatchConfidence: string;
    blockOrderThresholdPct: string;
  };
  snapshots: ApiSnapshot[];
  aiAnalysis: ApiMatchAnalysis[];
  scoreProvenance: ApiScoreAnalysis | null;
  decisions: ApiAuditDecision[];
  timeline: any[];
}

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
  timestamp?: string;
  snapshotTimestamp?: string;
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
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AuditData {
  id: string;
  name: string;
  verdict: 'COMPLIANT' | 'REVIEW' | 'FLAGGED' | 'HIGH RISK' | 'ANOMALY';
  status: AuditStatus;
  createdAt: string;
  assignedOfficerId: string;
  gemPrice: number;
  fmv: number;
  variance: number;
  freshness: string;
  confidence: ConfidenceMetrics;
  history: number[];
  results: ProductResult[];
  specs: Spec[];
  evidence: string[];
  riskScore: RiskScore;
  dataQuality: 'LOW' | 'MEDIUM' | 'HIGH';
  seller: SellerIntelligence;
  potentialSavings: number;
  isSimulated?: boolean;
  decision: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'JUSTIFIED';
    reason?: string;
    officerId?: string;
    timestamp?: string;
  };
}

export interface Certificate {
  id: string;
  auditId: string;
  productName: string;
  officerName: string;
  date: string;
  hash: string;
  status: 'VALID' | 'REVOKED';
  verdict: 'COMPLIANT' | 'REVIEW' | 'FLAGGED' | 'HIGH RISK' | 'ANOMALY';
  decisionStatus: 'APPROVED' | 'REJECTED' | 'JUSTIFIED';
  fmv: number;
  gemPrice: number;
  variance: number;
  prevHash?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  auditId: string;
  metadata?: any;
}

export interface LogEntry {
  msg: string;
  time: string;
  colorClass: string;
}

