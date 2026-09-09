import { pgTable, text, timestamp, boolean, uuid, numeric, integer, jsonb, pgEnum, serial, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['OFFICER', 'AUDITOR', 'ADMIN']);
export const auditStatusEnum = pgEnum('audit_status', [
  'PENDING', 
  'SCRAPING', 
  'MATCHING', 
  'SCORING', 
  'IN_REVIEW', 
  'COMPLIANT', 
  'REJECTED', 
  'ESCALATED'
]);
export const riskLevelEnum = pgEnum('risk_level', ['LOW', 'MEDIUM', 'HIGH']);
export const jobStatusEnum = pgEnum('job_status', ['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED']);

// Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: userRoleEnum('role').notNull(),
  department: text('department'),
  signingPublicKey: text('signing_public_key'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Sellers
export const sellers = pgTable('sellers', {
  id: uuid('id').defaultRandom().primaryKey(),
  gemSellerId: text('gem_seller_id').notNull().unique(),
  name: text('name').notNull(),
  gstin: text('gstin'),
  status: text('status').default('ACTIVE').notNull(), // ACTIVE, UNDER_REVIEW, SUSPENDED
  riskScore: numeric('risk_score', { precision: 5, scale: 2 }).default('0').notNull(),
  flagRate: numeric('flag_rate', { precision: 5, scale: 2 }).default('0').notNull(),
  avgPremiumPct: numeric('avg_premium_pct', { precision: 6, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Seller Status Events (Append-only log)
export const sellerStatusEvents = pgTable('seller_status_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  sellerId: uuid('seller_id').references(() => sellers.id).notNull(),
  oldStatus: text('old_status').notNull(),
  newStatus: text('new_status').notNull(),
  reason: text('reason').notNull(),
  actorUserId: uuid('actor_user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// GeM Listings
export const gemListings = pgTable('gem_listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  gemListingId: text('gem_listing_id').notNull().unique(),
  sellerId: uuid('seller_id').references(() => sellers.id).notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  specJson: jsonb('spec_json').notNull(),
  listedPrice: numeric('listed_price', { precision: 12, scale: 2 }).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  scrapedAt: timestamp('scraped_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Rule Versions
export const ruleVersions = pgTable('rule_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  autoFlagVariancePct: numeric('auto_flag_variance_pct', { precision: 5, scale: 2 }).notNull(),
  minSpecMatchConfidence: numeric('min_spec_match_confidence', { precision: 5, scale: 2 }).notNull(),
  blockOrderThresholdPct: numeric('block_order_threshold_pct', { precision: 5, scale: 2 }).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  // Self-referential FK is typically omitted in basic Drizzle setups unless explicitly queried, but here it is:
  previousVersionId: uuid('previous_version_id'),
});

// Audits
export const audits = pgTable('audits', {
  id: uuid('id').defaultRandom().primaryKey(),
  gemListingId: uuid('gem_listing_id').references(() => gemListings.id).notNull(),
  assignedOfficerId: uuid('assigned_officer_id').references(() => users.id),
  status: auditStatusEnum('status').default('PENDING').notNull(),
  riskLevel: riskLevelEnum('risk_level'),
  priceVariancePct: numeric('price_variance_pct', { precision: 6, scale: 2 }),
  fmv: numeric('fmv', { precision: 12, scale: 2 }),
  minSpecMatchScore: numeric('min_spec_match_score', { precision: 5, scale: 2 }),
  rulesVersionId: uuid('rules_version_id').references(() => ruleVersions.id).notNull(),
  // decision fields left on the audit row as a materialized view of the latest state
  decision: text('decision'), // ISSUE_CERTIFICATE, JUSTIFY_AND_PROCEED, REJECT
  decisionJustification: text('decision_justification'),
  decidedBy: uuid('decided_by').references(() => users.id),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  certificateLedgerRef: text('certificate_ledger_ref'), // Pointer to QLDB / Notarized hash
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    statusIdx: index('idx_audits_status').on(table.status),
    officerIdx: index('idx_audits_officer').on(table.assignedOfficerId),
    riskIdx: index('idx_audits_risk').on(table.riskLevel),
  }
});

// Append-only Officer Decisions
export const auditDecisions = pgTable('audit_decisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  auditId: uuid('audit_id').references(() => audits.id).notNull(),
  officerId: uuid('officer_id').references(() => users.id).notNull(),
  decision: text('decision').notNull(), // ISSUE_CERTIFICATE, REJECT, ESCALATE
  justification: text('justification'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Market Evidence Snapshots
export const marketSnapshots = pgTable('market_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  auditId: uuid('audit_id').references(() => audits.id).notNull(),
  sourcePlatform: text('source_platform').notNull(), // AMAZON, INDIAMART, etc.
  sourceUrl: text('source_url').notNull(),
  basePrice: numeric('base_price', { precision: 12, scale: 2 }), // Extracted by AI later
  taxPct: numeric('tax_pct', { precision: 5, scale: 2 }),
  freight: numeric('freight', { precision: 12, scale: 2 }).default('0'),
  warrantyValue: numeric('warranty_value', { precision: 12, scale: 2 }).default('0'),
  landedCost: numeric('landed_cost', { precision: 12, scale: 2 }),
  specJson: jsonb('spec_json'),
  specMatchScore: numeric('spec_match_score', { precision: 5, scale: 2 }),
  evidenceObjectKey: text('evidence_object_key').notNull(), // S3 / GCS bucket WORM
  evidenceSha256: text('evidence_sha256').notNull(),
  isSimulated: boolean('is_simulated').default(false).notNull(),
  scrapedAt: timestamp('scraped_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// AI Match Analysis Provenance
export const matchAnalysis = pgTable('match_analysis', {
  id: uuid('id').defaultRandom().primaryKey(),
  snapshotId: uuid('snapshot_id').references(() => marketSnapshots.id).notNull(),
  rulesVersionId: uuid('rules_version_id').references(() => ruleVersions.id).notNull(),
  model: text('model').notNull(), // e.g. gemini-2.5-pro
  promptVersion: text('prompt_version').notNull(),
  responseHash: text('response_hash').notNull(), // SHA256 of the exact JSON string returned by Gemini
  specMatchScore: numeric('spec_match_score', { precision: 5, scale: 2 }).notNull(),
  resultJson: jsonb('result_json').notNull(),
  analyzedAt: timestamp('analyzed_at', { withTimezone: true }).defaultNow().notNull(),
});

// Deterministic Scoring Provenance
export const scoreAnalysis = pgTable('score_analysis', {
  id: uuid('id').defaultRandom().primaryKey(),
  auditId: uuid('audit_id').references(() => audits.id).notNull(),
  rulesVersionId: uuid('rules_version_id').references(() => ruleVersions.id).notNull(),
  inputSnapshotIds: jsonb('input_snapshot_ids').notNull(), // Array of snapshot IDs used in the final math
  fmv: numeric('fmv', { precision: 12, scale: 2 }), // Nullable if insufficient evidence
  priceVariancePct: numeric('price_variance_pct', { precision: 6, scale: 2 }),
  minSpecMatchScore: numeric('min_spec_match_score', { precision: 5, scale: 2 }),
  riskLevel: riskLevelEnum('risk_level'), // LOW, MEDIUM, HIGH
  calculationVersion: text('calculation_version').notNull(), // e.g., gem-intel-scorer@1.0.0
  resultJson: jsonb('result_json').notNull(), // Detailed risk explanation/flags
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Activity Log
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  actorUserId: uuid('actor_user_id').references(() => users.id),
  action: text('action').notNull(),
  resourceType: text('resource_type'),
  resourceId: uuid('resource_id'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Trust Ledger (Certificates)
// Implements Option A: Hash-chained Postgres table
export const certificates = pgTable('certificates', {
  id: uuid('id').defaultRandom().primaryKey(),
  auditId: uuid('audit_id').notNull(),
  officerId: uuid('officer_id').notNull(),
  decision: text('decision').notNull(),
  payloadJson: jsonb('payload_json').notNull(), // The full serialized state at time of issuance
  signature: text('signature'), // Optional: Officer's cryptographic signature
  prevHash: text('prev_hash'), // Hash of the immediately preceding certificate in the ledger
  currentHash: text('current_hash').notNull().unique(), // SHA256(payloadJson + prevHash)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Periodic KMS Ledger Anchors
export const ledgerAnchors = pgTable('ledger_anchors', {
  id: uuid('id').defaultRandom().primaryKey(),
  merkleRoot: text('merkle_root').notNull(),
  startCertHash: text('start_cert_hash').notNull(),
  endCertHash: text('end_cert_hash').notNull(),
  kmsSignature: text('kms_signature').notNull(),
  wormAnchorId: text('worm_anchor_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Async Job Tracking & Idempotency
export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  auditId: uuid('audit_id').references(() => audits.id).notNull(),
  jobType: text('job_type').notNull(), // SCRAPE, MATCH, SCORE
  status: jobStatusEnum('status').default('QUEUED').notNull(),
  attempt: integer('attempt').default(0).notNull(),
  idempotencyKey: text('idempotency_key').notNull().unique(), // e.g. {auditId}-{jobType} without attempt for real idempotency
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Complete Audit Timeline / Event Trail
export const auditEvents = pgTable('audit_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  auditId: uuid('audit_id').references(() => audits.id).notNull(),
  eventType: text('event_type').notNull(),
  actorId: uuid('actor_id').references(() => users.id), // Null for system jobs
  jobId: uuid('job_id').references(() => jobs.id),
  previousState: text('previous_state'),
  newState: text('new_state'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
