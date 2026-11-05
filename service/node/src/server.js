'use strict';
const { Pool } = require('pg');
const { loadConfig } = require('./config');
const makeStore = require('./store');
const { createHandlers } = require('./handlers');
const { requireAuth } = require('./auth');
const { buildApp } = require('./app');

const c = loadConfig();
const pool = new Pool({ connectionString: c.databaseUrl, max: Number(process.env.PG_POOL_MAX) || 10 });
const handlers = c.enabled ? createHandlers({ store: makeStore(pool), kek: c.kek, cfg: c.cfg, fetchImpl: fetch }) : null;
buildApp({ handlers, authMiddleware: requireAuth(c.jwtSecret), corsOrigins: process.env.CORS_ORIGINS, enabled: c.enabled })
  .listen(c.port, () => console.log(`KIRO PAY listening on ${c.port}; payments ${c.enabled ? 'ENABLED' : 'disabled'}`));