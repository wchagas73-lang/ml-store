# Cloudflare setup for ML Store

This folder contains the database migration and deployment notes for the ML Store Cloudflare Pages project.

## Services
- Pages: public site and Pages Functions.
- D1: site settings, media metadata, ordering and audit records.
- R2: original image/video objects.

## Initial D1 migration
Apply `migrations/0001_init.sql` to the ML Store D1 database only.

## Required bindings (to be configured in the ML Store Pages project)
- D1 binding name: `DB`
- R2 binding name: `MEDIA_BUCKET`

## Required secrets (never commit values)
- `ADMIN_PASSWORD_HASH`: PBKDF2-SHA-256 password hash generated for the store owner.
- `SESSION_SECRET`: long random secret used to sign admin sessions.

Do not put passwords, API tokens, account IDs, or secret values in frontend files or this repository.

## Media behavior
The API must upload new objects to R2, save metadata in D1, and delete the old R2 object only after the replacement metadata has been saved successfully. Deletion must also remove the corresponding D1 record. Public media delivery should use a controlled Pages Function or a configured public R2 custom domain.

## Deployment safety
Do not deploy Functions that depend on missing bindings. Create and bind D1/R2 in the Cloudflare dashboard first, apply the migration, then configure secrets and deploy.
