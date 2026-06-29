import express from 'express';
import { KnowledgeModel } from '../models/knowledgeModel.js';
import { refreshKnowledgeCache, getCacheStatus, loadKnowledgeFromDB } from '../config/genkit.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateKnowledgeRequest } from '../middleware/validation.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/knowledge', async (req, res) => {
    try {
        const knowledge = await KnowledgeModel.getAll();
        const cacheStatus = getCacheStatus();

        res.json({
            success: true,
            data: knowledge,
            count: knowledge.length,
            cache: cacheStatus,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching knowledge:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/knowledge/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const knowledge = await KnowledgeModel.getBySection(section);

        if (!knowledge) {
            return res.status(404).json({
                success: false,
                error: `Section '${section}' not found`
            });
        }

        res.json({
            success: true,
            data: knowledge,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.put('/knowledge/:section', validateKnowledgeRequest, async (req, res) => {
    try {
        const { section } = req.params;
        const data = req.body;
        const updatedBy = req.headers['x-user'] || 'admin';

        const result = await KnowledgeModel.upsert(section, data, updatedBy);

        await refreshKnowledgeCache();

        res.json({
            success: true,
            message: `Updated section: ${section}`,
            data: result,
            cacheRefreshed: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating knowledge:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.delete('/knowledge/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const result = await KnowledgeModel.delete(section);

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: `Section '${section}' not found`
            });
        }

        await refreshKnowledgeCache();

        res.json({
            success: true,
            message: `Deleted section: ${section}`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error deleting knowledge:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/knowledge/refresh', async (req, res) => {
    try {
        const result = await refreshKnowledgeCache();
        const cacheStatus = getCacheStatus();

        res.json({
            success: true,
            message: 'Cache refreshed successfully',
            cache: cacheStatus,
            result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error refreshing cache:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/knowledge/bulk', async (req, res) => {
    try {
        const sections = req.body;

        if (!sections || typeof sections !== 'object' || Object.keys(sections).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Request body must be an object with sections'
            });
        }

        const result = await KnowledgeModel.bulkUpsert(sections);
        await refreshKnowledgeCache();

        res.json({
            success: true,
            message: `Updated ${result.length} sections`,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error bulk uploading:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/cache/status', async (req, res) => {
    try {
        const cacheStatus = getCacheStatus();
        const dbCount = await KnowledgeModel.count();

        res.json({
            success: true,
            cache: cacheStatus,
            database: {
                totalSections: dbCount
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting cache status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;