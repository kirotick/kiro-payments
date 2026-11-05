'use strict';
// KIRO PAY settings. Payments are DISABLED unless PAYMENTS_ENABLED=true (and then every PhonePe setting is required).
// Do not enable in production until the provider, merchant onboarding, security testing and owner approval are done.
const { loadKey } = require('./crypto');

function loadConfig(env = process.env) {
  const need = (k) => { if (!env[k]) throw new Error('Missing required env var ' + k); return env[k]; };
  if (need('JWT_SECRET').length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
  const enabled = env.PAYMENTS_ENABLED === 'true';
  const base = { port: Number(env.PORT || 3100), databaseUrl: need('DATABASE_URL'), jwtSecret: env.JWT_SECRET, enabled };
  if (!enabled) return base;
  const publicBaseUrl = need('PUBLIC_BASE_URL').replace(/\/+$/, '');
  if (env.NODE_ENV === 'production' && !publicBaseUrl.startsWith('https://')) throw new Error('PUBLIC_BASE_URL must be https in production');
  return {
    ...base,
    kek: loadKey(need('PHONEPE_KEK')),
    cfg: {
      baseUrl: need('PHONEPE_BASE_URL'),                    // no default on purpose: take it from PhonePe's docs
      qrPath: env.PHONEPE_QR_PATH || '/v3/qr/init',         // must be exactly the path PhonePe signs
      publicBaseUrl,
      qrExpirySeconds: Number(env.QR_EXPIRY_SECONDS || 600),
      maxBillPaise: Number(env.MAX_BILL_PAISE || 10000000), // Rs 1,00,000
    },
  };
}
module.exports = { loadConfig };