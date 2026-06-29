export const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey) {
        console.warn('ADMIN_API_KEY not set in environment variables');
        return res.status(500).json({
            success: false,
            error: 'Admin API key not configured'
        });
    }

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API key required'
        });
    }

    if (apiKey !== adminKey) {
        return res.status(403).json({
            success: false,
            error: 'Invalid API key'
        });
    }

    next();
};