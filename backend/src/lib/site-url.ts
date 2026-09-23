/** Marketing site origin used when building absolute URLs for CAPI. */
export function siteConfigUrl() {
  return (
    process.env.SITE_URL ||
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://prodesignity.com"
  );
}
