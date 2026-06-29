import express from 'express';
import { handleChat } from '../controllers/chatController.js';
import { validateChatRequest } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validateChatRequest, handleChat);

router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

export default router;