export const validateKnowledgeRequest = (req, res, next) => {
    const { section } = req.params;
    const data = req.body;

    if (!section || typeof section !== 'string' || section.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Section parameter is required and must be a non-empty string'
        });
    }

    // Only allow alphanumeric + underscores to prevent injection via section names.
    // No fixed whitelist — new sections can be added freely via the admin API.
    if (!/^[a-zA-Z0-9_]+$/.test(section)) {
        return res.status(400).json({
            success: false,
            error: 'Section name may only contain letters, numbers, and underscores'
        });
    }

    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Request body must be a non-empty object'
        });
    }

    next();
};

export const validateChatRequest = (req, res, next) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (typeof message !== 'string') {
        return res.status(400).json({ error: 'Message must be a string' });
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
        return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (trimmed.length > (process.env.MAX_MESSAGE_LENGTH || 1000)) {
        return res.status(400).json({
            error: `Message exceeds maximum length of ${process.env.MAX_MESSAGE_LENGTH || 1000} characters`
        });
    }

    req.sanitizedMessage = trimmed.replace(/[<>]/g, '');
    next();
};