# Prodesignity API

## Prisma Quick Reference
To sync schema changes and generate the client, use the following commands:

```bash
# Push schema changes to the database
pnpm exec prisma db push

# Regenerate Prisma client
pnpm exec prisma generate
```

## MaxMind GeoLite2 (visitor country)

Visit tracking resolves country from:

1. CDN headers (`CF-IPCountry`, Vercel, CloudFront) when present  
2. **MaxMind GeoLite2-Country** local database (IP → country)  
3. Otherwise `Unknown`

### Setup

1. Free account: [GeoLite2 signup](https://www.maxmind.com/en/geolite2/signup)  
2. Create a license key (Account → Manage License Keys)  
3. Add to `backend/.env`:

```env
MAXMIND_ACCOUNT_ID=123456
MAXMIND_LICENSE_KEY=your_license_key
# optional custom path:
# GEOIP_DB_PATH=C:\path\to\GeoLite2-Country.mmdb
```

4. Download the database (repeat monthly — files expire ~30 days):

```bash
npm run geoip:download
```

5. Restart the API.

The MMDB is stored at `data/geoip/GeoLite2-Country.mmdb` (gitignored).
