import app, { initializeServer } from '../index.js';

export default async function handler(req, res) {
	try {
		await initializeServer();
	} catch (err) {
		console.error('Initialization error in backend serverless handler:', err);
	}

	return app(req, res);
}
