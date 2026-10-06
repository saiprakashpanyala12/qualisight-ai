import express from 'express';
import path from 'path';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { analyzeInspectionImage } from '../services/visionAi.js';

const router = express.Router();

// POST /api/inspect/analyze - Analyze image and persist inspection report
router.post('/analyze', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an inspection image.' });
    }

    const title = req.body.title || `Inspection - ${new Date().toLocaleTimeString()}`;
    const category = req.body.category || 'Industrial Quality';
    const notesHint = req.body.notesHint || '';

    // Relative image URL for client rendering
    const imageUrl = `/uploads/${req.file.filename}`;

    // Run Vision AI analysis
    const aiResult = await analyzeInspectionImage(req.file.path, req.file.mimetype, notesHint);

    const status = aiResult.status || 'PASS';
    const anomalyDetected = aiResult.anomaly_detected ? 1 : 0;
    const confidence = aiResult.confidence || 95.0;
    const summary = aiResult.summary || 'Visual inspection completed.';
    const detectedItems = JSON.stringify(aiResult.detected_items || []);
    const recommendations = JSON.stringify(aiResult.actionable_recommendations || []);

    // Save to DB
    const dbResult = await query.run(`
      INSERT INTO inspections (
        user_id, title, category, image_url, status, 
        anomaly_detected, confidence, summary, detected_items, recommendations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      title,
      category,
      imageUrl,
      status,
      anomalyDetected,
      confidence,
      summary,
      detectedItems,
      recommendations
    ]);

    const savedRecord = {
      id: dbResult.lastID,
      user_id: req.user.id,
      title,
      category,
      image_url: imageUrl,
      status,
      anomaly_detected: Boolean(anomalyDetected),
      confidence,
      summary,
      metrics: aiResult.metrics,
      detected_items: aiResult.detected_items || [],
      actionable_recommendations: aiResult.actionable_recommendations || [],
      poweredBy: aiResult.poweredBy,
      demoMode: aiResult.demoMode,
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Visual inspection completed successfully',
      inspection: savedRecord
    });
  } catch (err) {
    console.error('Inspection analysis error:', err);
    res.status(500).json({ error: 'Failed to process inspection: ' + err.message });
  }
});

// GET /api/inspect/history - List past inspections
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let sql = 'SELECT * FROM inspections WHERE user_id = ?';
    const params = [req.user.id];

    if (status && status !== 'ALL') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (category && category !== 'ALL') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR summary LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const rows = await query.all(sql, params);
    
    // Parse JSON fields
    const parsedRows = rows.map(r => ({
      ...r,
      anomaly_detected: Boolean(r.anomaly_detected),
      detected_items: JSON.parse(r.detected_items || '[]'),
      recommendations: JSON.parse(r.recommendations || '[]')
    }));

    res.json({ inspections: parsedRows });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch inspection history.' });
  }
});

// GET /api/inspect/:id - Get specific inspection details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const row = await query.get(
      'SELECT * FROM inspections WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!row) {
      return res.status(404).json({ error: 'Inspection report not found.' });
    }

    const inspection = {
      ...row,
      anomaly_detected: Boolean(row.anomaly_detected),
      detected_items: JSON.parse(row.detected_items || '[]'),
      recommendations: JSON.parse(row.recommendations || '[]')
    };

    res.json({ inspection });
  } catch (err) {
    console.error('Detail fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch inspection report.' });
  }
});

// DELETE /api/inspect/:id - Delete an inspection record
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await query.run(
      'DELETE FROM inspections WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Inspection record not found.' });
    }

    res.json({ message: 'Inspection record removed.' });
  } catch (err) {
    console.error('Delete inspection error:', err);
    res.status(500).json({ error: 'Failed to delete inspection record.' });
  }
});

export default router;
