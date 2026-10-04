# Security notes

How the Prodesignity site is protected, what each audit found, and the rules to
follow when adding code. Update the audit log at the bottom after every review.

## How the site is protected

| Attack | Protection | Where |
| --- | --- | --- |
| Password guessing / brute force | 10 failed logins per IP per 15 min; register, refresh, Google sign-in, careers, booking and mail-test endpoints are rate limited too | `backend-api/src/middleware/rateLimit.ts`, `frontend/public/api/book-call.php` |
| Stolen sessions | Short access tokens (15 min), rotating refresh tokens stored hashed; reuse of an old refresh token revokes every session; password change / disable / role change revokes sessions | `backend-api/src/lib/tokens.ts` |
| Token theft by page scripts (website) | Tokens only in `HttpOnly` cookies (`pd_access` path `/api`, `pd_refresh` path `/api/auth`), `Secure` + `SameSite=Lax` in production | `backend-api/src/lib/authCookies.ts` |
| CSRF | Cookie-authenticated writes must come from an `ALLOWED_ORIGINS` origin; unknown origins get read-only CORS without credentials | `backend-api/src/middleware/auth.ts`, `backend-api/src/config/cors.ts` |
| SQL injection | Prisma sends every value as a bound parameter (no `$queryRawUnsafe`); public blog routes also reject obvious SQL/XSS payloads | `backend-api/src/lib/security.ts` |
| Stored XSS | No raw HTML rendering except JSON-LD (escapes `<`) and the hero pill (escaped, only `b/strong/em/i/u/br` restored); emails escape all text | `frontend/src/components/home/JsonLd.tsx`, `HeroSection.tsx`, `backend-api/src/lib/mailer.ts` |
| Malicious uploads | Allow-listed MIME types, size limits, file bytes checked against the type (`fileMatchesMime`), extension chosen from the type (never the client filename), SVG with script refused, `/uploads` served with `nosniff` + sandbox CSP, CVs kept outside `/uploads` and streamed to admins only | `backend-api/src/middleware/upload.ts`, `backend-api/src/lib/uploads.ts`, `backend-api/src/app.ts` |
| Privilege escalation | `requireAuth` → `requireStaff` / `requireAdmin` on every non-public route; blog authors can only edit their own posts unless admin | `backend-api/src/routes/*` |
| IP spoofing to dodge limits | API trusts `X-Forwarded-For` only from a proxy on the same machine (`trust proxy = loopback`); `proxy.php` overwrites it with `REMOTE_ADDR` | `backend-api/src/app.ts`, `backend-api/deploy/proxy.php` |
| Clickjacking, MIME sniffing, downgrade | Helmet on the API; `.htaccess` headers on the website; `vercel.json` headers on the dashboard | `frontend/public/.htaccess`, `dashboard/vercel.json` |
| Leaked secrets | `.env`, `config.php`, `backend-api/storage/` are gitignored; saved SMTP/Resend keys are AES-256-GCM encrypted | `.gitignore`, `backend-api/src/lib/secretBox.ts` |
| Exposed server files | Dotfiles, logs, backups, `config.php`, `bookings.log` denied by `.htaccess`; directory listing off | `frontend/public/.htaccess`, `frontend/public/api/.htaccess` |
| Deploy hijack | `deploy-extract.php` needs a fresh random token per deploy, refuses path traversal, deletes itself | `frontend/deploy/deploy-extract.php` |

## Production checklist

- `NODE_ENV=production`
- `JWT_SECRET` and `JWT_REFRESH_SECRET` set, different, 48+ random bytes each (the API refuses to start without them)
- `SETTINGS_ENCRYPTION_KEY` set and never changed (changing it makes saved mail credentials unreadable)
- `ALLOWED_ORIGINS` lists only the real HTTPS origins (no `localhost`)
- Node listens on `127.0.0.1:4000` only, never a public port
- `proxy.php` and `.htaccess` on the API host are the current versions from `backend-api/deploy/`
- `frontend/public/api/config.php` exists on the server only, never in git
- Run `pnpm audit --prod` before each release

## Rules for new code

1. Every new route that changes data needs `requireAuth` plus the narrowest role check (`requireStaff` / `requireAdmin`), and a rate limiter if it is public or sends email.
2. Validate every request body with a zod schema; never pass `req.body` straight to Prisma.
3. Never use `$queryRawUnsafe` / `$executeRawUnsafe`; use Prisma queries or tagged `$queryRaw`.
4. Uploads: add the multer handler in `middleware/upload.ts`, name files with `uniqueUploadNameForMime`, and wrap it with `withContentCheck` (or call `fileMatchesMime` in the controller).
5. Never render user or CMS text with `dangerouslySetInnerHTML`. If formatting is needed, escape first and allow-list tags, like `safePillHtml`.
6. Read the client IP from `req.ip` (backend) or `REMOTE_ADDR` (PHP). Never trust `X-Forwarded-For` / `CF-Connecting-IP` directly.
7. Don't return internal error messages, stack traces or server addresses to the client in production.
8. Secrets live in `.env` / `config.php` only. Never commit them, never log them.

## Audit log

### 2026-10-04 full project audit

Fixed:

- **Brute force**: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout` had no rate limit. Added `loginLimiter` (failed attempts only), `registerLimiter`, `sessionLimiter`; added `trackingLimiter` to the public `/track/visit` beacon.
- **Upload XSS**: profile, team, site and homepage uploads kept the client's file extension and did not check file contents, so any registered user could upload `evil.html` labelled `image/png` and the API would serve it as a web page. Extensions now come from the MIME type, every upload's bytes are verified, SVGs with scripts are refused, and `/uploads` responses carry `Content-Security-Policy: sandbox`.
- **Staff-only upload**: `PUT /api/team/me` accepted uploads from any client account; now `requireStaff`.
- **IP spoofing**: `proxy.php` forwarded the client's own `X-Forwarded-For`, and `book-call.php` / tracking trusted it, so attackers could fake IPs to skip rate limits (booking form could be used to email anyone). Proxy now sets the header from `REMOTE_ADDR`; API trusts only loopback; PHP uses `REMOTE_ADDR`.
- **Tokens**: removed the pre-hardening fallback that accepted JWTs without audience/issuer; pinned `HS256`.
- **Info leaks**: `/api/health` and `proxy.php` no longer expose DB errors / internal addresses in production.
- **Account deletion**: self-delete now removes the user's uploaded photos and clears auth cookies.
- **Stored XSS (admin)**: hero pill HTML from the CMS is escaped with a small tag allow-list.
- **Headers**: added HSTS, `nosniff`, frame protection, referrer and permissions policies to the website (`.htaccess`) and dashboard (`vercel.json`); blocked dotfiles/logs/backups on the website host.
- **Dependencies**: `next` 16.3.3 → 16.3.8 (critical RCE advisory), `nodemailer` 9 → 10.0.14 (6 advisories), `mariadb` / `mysql2` (via Prisma) forced to patched versions with pnpm overrides. Audit: 13 → 2.
- **Lint**: fixed 3 React lint errors (`Logo`, `TeamSection`, `CareerForm`) and an unused import.

Open / recommended next:

- `deepmerge-ts` (inside the Prisma CLI) and `braces` (inside the shadcn CLI) still show in `pnpm audit`. Both are developer tools that never handle web requests; no compatible fix yet. Re-check on the next Prisma / shadcn release.
- The dashboard keeps its refresh token in a JavaScript-readable (encrypted) cookie, so an XSS bug in the dashboard could steal a staff session. Moving the dashboard to the same `HttpOnly` cookie flow as the website would close that.
- Consider 2FA (TOTP) for admin accounts.
- Consider a full Content-Security-Policy for the website once all third-party script hosts (Google sign-in, analytics, Meta pixel) are listed.
- `backend-api/scripts/tmp-dev-token.ts` mints an access token for any user. It needs server access and secrets, but delete it if it is no longer needed.
- Dashboard `oxlint` reports only warnings (`set-state-in-effect`, fast-refresh exports); no errors.
