'use strict';
// KIRO PAY HTTP service: PhonePe dynamic QR, webhook, gateway settings and bill status.
// Moved out of the core API (kiro-backend); handler, signing and storage code is unchanged.
const express = require('express');
const rateLimit = require('express-rate-limit');
const { corsMiddleware } = require('./cors');

function buildApp({ handlers, authMiddleware, corsOrigins = '', enabled = false }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.get('/health', (req, res) => res.json({ ok: true, paymentsEnabled: enabled }));
  // While payments are not approved, every payment endpoint refuses (no QR, no webhook processing).
  const off = (req, res) => res.status(503).json({ success: false, message: 'Payments are not enabled' });
  app.use('/api', corsMiddleware(corsOrigins));

  if (!enabled) { app.post('/phonepe-webhook', off); app.use('/api', off); return app; }

  // Public webhook: small body, rate limited, no auth (authenticity = X-Verify signature).
  app.post('/phonepe-webhook',
    rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: true, legacyHeaders: false }),
    express.json({ limit: '16kb' }),
    handlers.webhook);

  const api = express.Router();
  api.use(express.json({ limit: '64kb' }), authMiddleware);
  api.put('/gateway', handlers.saveGateway);
  api.post('/bills', handlers.createBill);
  api.post('/bills/:id/phonepe-qr', handlers.createQr);
  api.get('/bills/:id/status', handlers.billStatus);
  app.use('/api', api);
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => res.status(err.status && err.status < 500 ? err.status : 500).json({ success: false, message: 'Request failed' }));
  return app;
}
module.exports = { buildApp };