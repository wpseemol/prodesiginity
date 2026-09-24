<?php
/**
 * api/config.sample.php
 * ---------------------------------------------------------------------------
 * Copy this to `config.php` ON THE SERVER and fill in the real values.
 *
 *     cp config.sample.php config.php
 *
 * config.php is listed in .gitignore, so credentials never reach the
 * repository and never reach the deployed zip. Because the deploy workflow
 * replaces the site folder wholesale, keep config.php somewhere the deploy
 * does not purge, or re-add it after the first deploy — see api/README.md.
 *
 * Every key is optional. Anything you leave out falls back to the defaults in
 * book-call.php, and missing Zoom credentials simply disable meeting creation
 * rather than breaking the endpoint.
 */

declare(strict_types=1);

return [
    /* --- Identity ------------------------------------------------------- */
    'studio_email'    => 'info@prodesignity.com',
    'studio_name'     => 'ProDesignity',

    /**
     * Must be a mailbox on your own domain. Sending "from" a Gmail or Yahoo
     * address through Hostinger's mail() will fail SPF and land in spam.
     */
    'from_email'      => 'no-reply@prodesignity.com',
    'site_url'        => 'https://prodesignity.com',
    'studio_timezone' => 'Asia/Dhaka',

    /* --- Zoom Server-to-Server OAuth ------------------------------------ */
    /**
     * marketplace.zoom.us → Develop → Build App → Server-to-Server OAuth.
     * Required scopes: meeting:write:admin (or meeting:write:meeting:admin
     * on the granular scope model). Activate the app before using it.
     *
     * Leave all three blank and the endpoint will use fallback_join_url.
     */
    'zoom_account_id'    => '',
    'zoom_client_id'     => '',
    'zoom_client_secret' => '',

    /**
     * A permanent meeting room (Zoom PMI or a Google Meet room) used when
     * Zoom credentials are absent or the API call fails. Strongly recommended
     * even if Zoom is configured — it is the difference between a booking that
     * still works and one that dead-ends.
     */
    'fallback_join_url' => '',

    /* --- Operational ---------------------------------------------------- */
    'log_file'   => __DIR__ . '/bookings.log',
    'rate_limit' => 5, // bookings per IP per hour
];