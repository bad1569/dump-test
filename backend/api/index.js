import app, { initializeServer } from '../index.js';

const initPromise = initializeServer();

export default async function handler(req, res) {
  await initPromise;
  return app(req, res);
}
