import express from 'express';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/summary - Dashboard statistics
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await query.get(`
      SELECT 
        COUNT(*) as total_inspections,
        SUM(CASE WHEN status = 'PASS' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN status = 'WARNING' THEN 1 ELSE 0 END) as warning_count,
        SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) as fail_count,
        SUM(CASE WHEN anomaly_detected = 1 THEN 1 ELSE 0 END) as total_anomalies,
        AVG(confidence) as avg_confidence
      FROM inspections 
      WHERE user_id = ?
    `, [userId]);

    const total = stats.total_inspections || 0;
    const passCount = stats.pass_count || 0;
    const warningCount = stats.warning_count || 0;
    const failCount = stats.fail_count || 0;
    const totalAnomalies = stats.total_anomalies || 0;
    const passRate = total > 0 ? Math.round((passCount / total) * 100) : 100;
    const avgConfidence = stats.avg_confidence ? Number(stats.avg_confidence.toFixed(1)) : 95.0;

    // Recent 5 inspections
    const recentRows = await query.all(`
      SELECT id, title, category, status, anomaly_detected, confidence, created_at 
      FROM inspections 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [userId]);

    res.json({
      metrics: {
        total,
        passCount,
        warningCount,
        failCount,
        totalAnomalies,
        passRate,
        avgConfidence
      },
      recentInspections: recentRows.map(r => ({
        ...r,
        anomaly_detected: Boolean(r.anomaly_detected)
      }))
    });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
  }
});

export default router;
