import app, { initializeServer } from '../backend/index.js';

export default async function handler(req, res) {
	try {
		await initializeServer();
	} catch (err) {
		console.error('Initialization error in serverless handler:', err);
		// Continue to let the app handle the request which may return errors
	}

	return app(req, res);
}