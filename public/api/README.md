# `/api` — server code for a static site

The site builds with `output: "export"`, so there is no Node server and
`app/api/**/route.ts` cannot run. Anything in `public/` is copied verbatim into
`out/`, so PHP placed here ends up at `https://prodesignity.com/api/…` on
Hostinger, next to the exported HTML. That is where the server code lives.

**Requires PHP 8.1 or newer** (the code uses `never` return types,
non-capturing `catch`, `str_contains` and `str_starts_with`). Set the PHP
version in hPanel → Advanced → PHP Configuration. The `curl` and `zip`
extensions must be enabled — both are on by default.

## Files

| File | Purpose |
| --- | --- |
| `book-call.php` | Receives the booking, creates the Zoom meeting, emails both sides, logs the record. |
| `config.sample.php` | Template. Copy to `config.php` **on the server** and fill in. |
| `.htaccess` | Blocks HTTP access to `config.php`, `*.log` and this README. |
| `config.php` | Your real credentials. Gitignored — never committed, never in the deploy zip. |
| `bookings.log` | JSON-lines record of every booking. Created automatically. |

## First-time setup

1. Deploy as normal. `book-call.php`, `config.sample.php` and `.htaccess`
   arrive under `public_html/api/`.
2. Over FTP or the hPanel file manager, copy `config.sample.php` to
   `config.php` in the same folder.
3. Fill in `config.php`:
   - `from_email` **must** be a mailbox on your own domain. Sending "from" a
     Gmail address through `mail()` fails SPF and lands in spam.
   - `fallback_join_url` — set this even if you configure Zoom. It is what
     stands between an API hiccup and a booking that dead-ends.
4. Test: book a slot on `/contact/`. You should get two emails and a new line
   in `bookings.log`.

Without `config.php` the endpoint still works — it falls back to the defaults
baked into `book-call.php`, skips Zoom, and emails the booking to
`info@prodesignity.com`.

## Zoom meeting creation

Optional. Without credentials the endpoint uses `fallback_join_url`.

1. marketplace.zoom.us → **Develop → Build App → Server-to-Server OAuth**.
2. Add the scope `meeting:write:admin` (or `meeting:write:meeting:admin` on
   the granular scope model).
3. **Activate** the app — an unactivated app returns 401 on every call.
4. Copy the Account ID, Client ID and Client Secret into `config.php`.

The endpoint requests a token per booking rather than caching one. At a handful
of bookings a day that is the right trade: no shared state, nothing to expire
badly.

## Keeping `config.php` through deploys

`deploy.yml` runs with `dangerous-clean-slate: true`, which **wipes the server
directory before uploading** — including `api/config.php`. Pick one:

- **Recommended:** switch to `deploy-zip.yml`, whose extractor treats
  `api/config.php` and `api/bookings.log` as protected paths and never deletes
  them.
- Or set `dangerous-clean-slate: false` in `deploy.yml`.
- Or re-upload `config.php` after each deploy.

## Frontend contract

`components/contact/BookingCalendar.tsx` POSTs JSON:

```jsonc
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "company": "Acme",
  "notes": "Shopify rebuild",
  "date": "2026-09-18",          // YYYY-MM-DD, studio local
  "studioHour": 15,               // 24h, studio local
  "startUtc": "2026-09-18T09:00:00.000Z",
  "durationMinutes": 30,
  "visitorTimezone": "Europe/London"
}
```

Success returns `{ ok: true, joinUrl, meetingId, passcode, startUtc }`.
Failure returns `{ ok: false, error }` with a 4xx/5xx status, and the widget
falls back to a prefilled WhatsApp message so the enquiry is never lost.

The server re-validates the slot rather than trusting the browser: the email
must parse, the start time must be in the future, and it must fall within the
next 120 days. There is also a crude per-IP limit of five bookings an hour.
