import { Router } from 'express';
import { db } from '../../src/db/index';
import { audits, gemListings, marketSnapshots, scoreAnalysis } from '../../src/db/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Apply auth to all analytics routes
// router.use(requireAuth);

/**
 * Historical Market Trends
 * Returns average FMV and price variances over time
 */
router.get('/v1/analytics/trends', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentScores = await db.select({
      createdAt: scoreAnalysis.createdAt,
      fmv: scoreAnalysis.fmv,
      variance: scoreAnalysis.priceVariancePct,
      riskLevel: scoreAnalysis.riskLevel
    })
    .from(scoreAnalysis)
    .where(gte(scoreAnalysis.createdAt, thirtyDaysAgo))
    .orderBy(scoreAnalysis.createdAt);

    // Group by day for simple charting
    const dailyData: Record<string, { fmvSum: number; varianceSum: number; count: number; highRiskCount: number }> = {};
    
    for (const score of recentScores) {
      const day = score.createdAt.toISOString().split('T')[0];
      if (!dailyData[day]) {
        dailyData[day] = { fmvSum: 0, varianceSum: 0, count: 0, highRiskCount: 0 };
      }
      dailyData[day].fmvSum += parseFloat(score.fmv || '0');
      dailyData[day].varianceSum += parseFloat(score.priceVariancePct || '0');
      dailyData[day].count++;
      if (score.riskLevel === 'HIGH') dailyData[day].highRiskCount++;
    }

    const trends = Object.keys(dailyData).map(day => ({
      date: day,
      avgFmv: dailyData[day].fmvSum / dailyData[day].count,
      avgVariance: dailyData[day].varianceSum / dailyData[day].count,
      highRiskCount: dailyData[day].highRiskCount,
      totalAudits: dailyData[day].count
    }));

    res.json(trends);
  } catch (err) {
    console.error('Failed to fetch trends:', err);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

/**
 * Seller Intelligence
 * Returns risk patterns and history for a specific seller
 */
router.get('/v1/analytics/sellers/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;
    // We would join on gem_listings where seller_id = sellerId
    
    const sellerAudits = await db.select({
      id: audits.id,
      riskLevel: audits.riskLevel,
      variance: audits.priceVariancePct,
      status: audits.status,
      createdAt: audits.createdAt,
      listingTitle: gemListings.title,
      listedPrice: gemListings.listedPrice
    })
    .from(audits)
    .leftJoin(gemListings, eq(audits.gemListingId, gemListings.id))
    .where(eq(gemListings.sellerId, sellerId))
    .orderBy(desc(audits.createdAt));

    let totalVariance = 0;
    let highRiskCount = 0;
    
    for (const a of sellerAudits) {
      totalVariance += parseFloat(a.variance || '0');
      if (a.riskLevel === 'HIGH') highRiskCount++;
    }

    res.json({
      sellerId,
      totalListingsAudited: sellerAudits.length,
      averageVariancePct: sellerAudits.length > 0 ? totalVariance / sellerAudits.length : 0,
      highRiskFlags: highRiskCount,
      riskProfile: highRiskCount > 0 ? 'HIGH' : 'LOW',
      history: sellerAudits
    });
  } catch (err) {
    console.error('Failed to fetch seller intel:', err);
    res.status(500).json({ error: 'Failed to fetch seller intel' });
  }
});

/**
 * Product Price Intelligence
 * Returns the market history and anomaly patterns for a specific product category/title
 */
router.get('/v1/analytics/products', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter ?q= is required' });
    }

    // Very naive text search for prototype
    const matchingListings = await db.select()
      .from(gemListings)
      .where(sql`${gemListings.title} ILIKE ${'%' + query + '%'}`);

    if (matchingListings.length === 0) {
      return res.json({ history: [], averageFmv: 0, marketRange: { min: 0, max: 0 } });
    }

    const listingIds = matchingListings.map(l => l.id);

    const relatedAudits = await db.select({
      fmv: scoreAnalysis.fmv,
      variance: scoreAnalysis.priceVariancePct,
      riskLevel: scoreAnalysis.riskLevel,
      date: scoreAnalysis.createdAt,
      listedPrice: gemListings.listedPrice,
      title: gemListings.title
    })
    .from(scoreAnalysis)
    .leftJoin(audits, eq(audits.id, scoreAnalysis.auditId))
    .leftJoin(gemListings, eq(gemListings.id, audits.gemListingId))
    .where(inArray(audits.gemListingId, listingIds))
    .orderBy(scoreAnalysis.createdAt);

    let minFmv = Infinity;
    let maxFmv = 0;
    let totalFmv = 0;

    for (const a of relatedAudits) {
      const fmv = parseFloat(a.fmv || '0');
      if (fmv > 0) {
        if (fmv < minFmv) minFmv = fmv;
        if (fmv > maxFmv) maxFmv = fmv;
        totalFmv += fmv;
      }
    }

    res.json({
      query,
      averageFmv: relatedAudits.length > 0 ? totalFmv / relatedAudits.length : 0,
      marketRange: { min: minFmv === Infinity ? 0 : minFmv, max: maxFmv },
      history: relatedAudits
    });

  } catch (err) {
    console.error('Failed to fetch product intel:', err);
    res.status(500).json({ error: 'Failed to fetch product intel' });
  }
});

export default router;
