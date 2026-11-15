# Cloudflare setup for ML Store

This repository contains the ML Store Pages site, Pages Functions, D1 migration and R2 media handling.

## Cloudflare resources

Create these resources in the Cloudflare account that owns the ML Store Pages project:

- D1 database, for example `ml-store-db`.
- R2 bucket, for example `ml-store-media`.

## Bindings

In the ML Store Pages project settings, add these production bindings:

| Type | Binding name | Resource |
| --- | --- | --- |
| D1 database | `DB` | The ML Store D1 database |
| R2 bucket | `MEDIA_BUCKET` | The ML Store R2 bucket |

Add the same bindings to Preview only if you intend to test admin uploads in Preview. Prefer a separate test database and bucket for Preview.

## Apply the D1 migration

Run the complete file `migrations/0001_init.sql` against the ML Store database. It creates site settings, media metadata, audit history and login throttling tables. Do not apply it to any other project.

## Configure admin secrets

1. Open `/cloudflare/generate-hash.html` on the deployed ML Store domain over HTTPS.
2. Create a unique password with at least 12 characters and generate the credentials. The page uses browser Web Crypto locally. The password is not sent to a server.
3. In Pages project settings, add these as encrypted production secrets:
   - `ADMIN_PASSWORD_HASH`: the generated PBKDF2 hash.
   - `SESSION_SECRET`: the generated random secret.
4. Do not paste either value into GitHub, source files, chat, WhatsApp or public variables.
5. Close the credential generator after saving the secrets.

The expected password hash format is `pbkdf2$sha256$210000$SALT$HASH`.

## Features implemented

- `/admin.html`: mobile-friendly admin login and content editor.
- `/api/admin/login`, `/api/admin/session`, `/api/admin/logout`: signed, HttpOnly admin session.
- `/api/content`: public content read and authenticated content save.
- `/api/media`: authenticated media upload and media listing.
- `/api/media/:id`: authenticated media title, order and deletion operations.
- `/media/:key`: controlled public delivery from the R2 bucket.

The admin session expires after 12 hours. Login attempts are throttled by a hashed client address. Uploads accept JPEG, PNG, WebP and AVIF images up to 8 MB, and MP4 or WebM videos up to 40 MB. The total gallery limit is 16 media files. These limits are enforced by the API, not just the browser.

## Replacement and deletion behavior

Upload a replacement first, save its metadata, then remove the old file from the panel. Deleting a media item removes its D1 metadata and the corresponding R2 object. This keeps storage from growing indefinitely when old content is actually deleted.

## Deployment safety

The public site continues to use the static JSON demonstration content until the D1 and R2 bindings, migration and secrets are configured. Do not treat the admin panel as production-ready until those Cloudflare resources are connected and login, upload, public media delivery and deletion have all been tested on the deployed domain.
