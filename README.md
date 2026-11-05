# kiro-payments

KIRO PAY: payment-provider adapters (PhonePe dynamic QR), verified webhooks, idempotent payment state, bill status. **Live payments are disabled** (PAYMENTS_ENABLED is not set anywhere).

Part of KIRO (Kitchen Intelligence & Restaurant Operations). Owner: @kirotick. Migrated with full history from `kirotick/KIRO_POS` (commit `252de09`), see kiro-documentation/governance/REPOSITORY_MIGRATION_PLAN.md.

## What this repository owns
- Payment service (`service/node/`): signing, encrypted merchant keys, QR creation, webhook verification, amount/merchant matching, replay protection
- Browser helper `service/node/client/phonepe-pay.js`
- Python reference implementation (`reference/python/`)

Nothing here may be copied into another KIRO repository; other repositories use it by version or through its API.

## Depends on
- **kiro-database**: `payments` migrations at the tag in `service/node/database-version.txt`
- Tokens issued by **kiro-backend** (verified with a contract copy of `auth.js`, ADR-0002)

## Build
`cd service/node && npm ci && npm start`. Without `PAYMENTS_ENABLED=true` every payment endpoint answers 503 "Payments are not enabled".

## Test
`cd service/node && npm test`; `npm run test:db` with the Neon qa branch in `.env.test`.

## Branches, reviews and releases
`main` is production and protected: changes arrive only by pull request with passing checks (see CONTRIBUTING.md). Versions follow semantic versioning; every release is a git tag `vMAJOR.MINOR.PATCH` with notes in CHANGELOG.md, so each deployment maps to one exact commit. Rollback = redeploy the previous tag.

## Security
See SECURITY.md. Never commit secrets: `.env` files are ignored, and secret scanning with push protection plus gitleaks in CI block them.
