<?php
/**
 * /api/book-call.php — discovery call booking endpoint.
 * ---------------------------------------------------------------------------
 * WHY PHP AND NOT A NEXT ROUTE HANDLER
 *
 * next.config.ts sets `output: "export"`. That produces a folder of static
 * .html/.css/.js with no Node process behind it, so `app/api/**\/route.ts`
 * cannot run — there is nothing to run it. Hostinger does serve PHP, and
 * everything in /public is copied verbatim into /out at build time, so this
 * file ships to https://<domain>/api/book-call.php alongside the HTML.
 *
 * WHAT IT DOES
 *   1. validates the JSON posted by components/contact/BookingCalendar.tsx
 *   2. creates a real Zoom meeting (Server-to-Server OAuth) if credentials
 *      are configured; otherwise falls back to a fixed meeting room link
 *   3. emails the studio and the person who booked
 *   4. appends the booking to a JSON-lines log
 *   5. answers with JSON the widget can render
 *
 * SETUP
 *   cp config.sample.php config.php   and fill in the values.
 *   config.php is gitignored — never commit credentials.
 *
 * The endpoint degrades rather than fails: if Zoom is unreachable the booking
 * is still recorded and emailed, and the response says the link will follow.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

/* -------------------------------------------------------------------------
   Config
   ------------------------------------------------------------------------- */

$defaults = [
    'studio_email'      => 'info@prodesignity.com',
    'studio_name'       => 'ProDesignity',
    'from_email'        => 'no-reply@prodesignity.com',
    'site_url'          => 'https://prodesignity.com',
    'studio_timezone'   => 'Asia/Dhaka',
    // Used when Zoom credentials are absent or the API call fails.
    'fallback_join_url' => '',
    // Zoom Server-to-Server OAuth app credentials. Leave blank to disable.
    'zoom_account_id'   => '',
    'zoom_client_id'    => '',
    'zoom_client_secret'=> '',
    'log_file'          => __DIR__ . '/bookings.log',
    // Max bookings accepted from one IP per hour.
    'rate_limit'        => 5,
];

$config = $defaults;
if (is_readable(__DIR__ . '/config.php')) {
    /** @var array<string,mixed> $userConfig */
    $userConfig = require __DIR__ . '/config.php';
    if (is_array($userConfig)) {
        $config = array_merge($defaults, $userConfig);
    }
}

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(int $status, string $message): never
{
    respond($status, ['ok' => false, 'error' => $message]);
}

/** Strips CR/LF so user input can never inject extra mail headers. */
function headerSafe(string $value): string
{
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', $value));
}

function clientIp(): string
{
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            return explode(',', (string) $_SERVER[$key])[0];
        }
    }
    return 'unknown';
}

/* -------------------------------------------------------------------------
   Request guards
   ------------------------------------------------------------------------- */

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    header('Allow: POST');
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    fail(405, 'Method not allowed.');
}

$raw = file_get_contents('php://input');
if ($raw === false || $raw === '' || strlen($raw) > 20000) {
    fail(400, 'Empty or oversized request body.');
}

$input = json_decode($raw, true);
if (!is_array($input)) {
    fail(400, 'Body must be JSON.');
}

/* -------------------------------------------------------------------------
   Validation
   ------------------------------------------------------------------------- */

$name    = headerSafe((string) ($input['name'] ?? ''));
$email   = headerSafe((string) ($input['email'] ?? ''));
$company = headerSafe((string) ($input['company'] ?? ''));
$notes   = trim((string) ($input['notes'] ?? ''));
$date    = (string) ($input['date'] ?? '');
$startUtc = (string) ($input['startUtc'] ?? '');
$duration = (int) ($input['durationMinutes'] ?? 30);
$visitorTz = headerSafe((string) ($input['visitorTimezone'] ?? ''));

if ($name === '' || mb_strlen($name) > 120) {
    fail(422, 'Please enter your name.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail(422, 'Please enter a valid email address.');
}
if (mb_strlen($notes) > 4000) {
    fail(422, 'That message is too long.');
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    fail(422, 'Invalid date.');
}
if ($duration < 15 || $duration > 120) {
    $duration = 30;
}

// The instant must parse AND must be in the future. The browser can send
// anything; the server decides what a valid slot is.
try {
    $start = new DateTimeImmutable($startUtc, new DateTimeZone('UTC'));
} catch (Throwable) {
    fail(422, 'Invalid start time.');
}

$now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
if ($start <= $now) {
    fail(422, 'That slot is in the past. Please pick a future date.');
}
if ($start > $now->modify('+120 days')) {
    fail(422, 'Please pick a date within the next few months.');
}

/* -------------------------------------------------------------------------
   Crude per-IP rate limit. Not bulletproof, but it stops a script from
   filling the calendar in a loop.
   ------------------------------------------------------------------------- */

$rateFile = sys_get_temp_dir() . '/pd-book-' . md5(clientIp()) . '.txt';
$hits = is_readable($rateFile) ? (array) json_decode((string) file_get_contents($rateFile), true) : [];
$hits = array_values(array_filter($hits, static fn($t) => (int) $t > time() - 3600));
if (count($hits) >= (int) $config['rate_limit']) {
    fail(429, 'Too many booking attempts. Please try again later or message us on WhatsApp.');
}
$hits[] = time();
@file_put_contents($rateFile, json_encode($hits));

/* -------------------------------------------------------------------------
   Zoom — Server-to-Server OAuth
   ------------------------------------------------------------------------- */

/**
 * Exchanges the account credentials for a short-lived access token.
 * Returns null on any failure; the caller falls back gracefully.
 */
function zoomAccessToken(array $config): ?string
{
    if ($config['zoom_account_id'] === '' || $config['zoom_client_id'] === '' || $config['zoom_client_secret'] === '') {
        return null;
    }

    $url = 'https://zoom.us/oauth/token?grant_type=account_credentials&account_id='
        . urlencode((string) $config['zoom_account_id']);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_USERPWD        => $config['zoom_client_id'] . ':' . $config['zoom_client_secret'],
        CURLOPT_HTTPHEADER     => ['Content-Length: 0'],
    ]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code !== 200 || !is_string($body)) {
        return null;
    }
    $data = json_decode($body, true);
    return is_array($data) && !empty($data['access_token']) ? (string) $data['access_token'] : null;
}

/**
 * Creates a scheduled Zoom meeting. Returns join_url / id / password, or null.
 */
function zoomCreateMeeting(string $token, DateTimeImmutable $start, int $duration, string $topic, string $agenda): ?array
{
    $payload = [
        'topic'      => mb_substr($topic, 0, 200),
        'type'       => 2, // scheduled
        'start_time' => $start->format('Y-m-d\TH:i:s\Z'),
        'duration'   => $duration,
        'timezone'   => 'UTC',
        'agenda'     => mb_substr($agenda, 0, 2000),
        'settings'   => [
            'join_before_host' => true,
            'waiting_room'     => false,
            'approval_type'    => 2,
            'audio'            => 'both',
            'auto_recording'   => 'none',
        ],
    ];

    $ch = curl_init('https://api.zoom.us/v2/users/me/meetings');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_SLASHES),
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
        ],
    ]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code < 200 || $code >= 300 || !is_string($body)) {
        error_log('Zoom meeting creation failed: HTTP ' . $code . ' ' . (string) $body);
        return null;
    }

    $data = json_decode($body, true);
    if (!is_array($data) || empty($data['join_url'])) {
        return null;
    }

    return [
        'joinUrl'   => (string) $data['join_url'],
        'meetingId' => isset($data['id']) ? (string) $data['id'] : '',
        'passcode'  => isset($data['password']) ? (string) $data['password'] : '',
    ];
}

$studioTz = new DateTimeZone((string) $config['studio_timezone']);
$startStudio = $start->setTimezone($studioTz);
$humanStudio = $startStudio->format('l, j F Y \a\t g:i A') . ' (' . $studioTz->getName() . ')';
$humanUtc    = $start->format('l, j F Y \a\t H:i') . ' UTC';

$topic  = 'Strategy call — ' . $name . ($company !== '' ? ' (' . $company . ')' : '');
$agenda = $notes !== '' ? $notes : 'Free discovery call booked from ' . $config['site_url'];

$meeting = null;
$token = zoomAccessToken($config);
if ($token !== null) {
    $meeting = zoomCreateMeeting($token, $start, $duration, $topic, $agenda);
}

if ($meeting === null && $config['fallback_join_url'] !== '') {
    $meeting = [
        'joinUrl'   => (string) $config['fallback_join_url'],
        'meetingId' => '',
        'passcode'  => '',
    ];
}

/* -------------------------------------------------------------------------
   Notifications
   ------------------------------------------------------------------------- */

$joinLine = $meeting !== null
    ? 'Zoom link: ' . $meeting['joinUrl']
    : 'Zoom link: will be emailed shortly.';

$studioBody = implode("\n", [
    'New discovery call booked.',
    '',
    'Name:      ' . $name,
    'Email:     ' . $email,
    'Company:   ' . ($company !== '' ? $company : '—'),
    '',
    'Slot:      ' . $humanStudio,
    '           ' . $humanUtc,
    'Visitor TZ:' . ($visitorTz !== '' ? ' ' . $visitorTz : ' unknown'),
    'Duration:  ' . $duration . ' minutes',
    '',
    $joinLine,
    '',
    'Notes:',
    $notes !== '' ? $notes : '—',
    '',
    '---',
    'IP: ' . clientIp(),
]);

$clientBody = implode("\n", [
    'Hi ' . $name . ',',
    '',
    'Your call with ' . $config['studio_name'] . ' is confirmed.',
    '',
    'When: ' . $humanStudio,
    'Duration: ' . $duration . ' minutes',
    $joinLine,
    $meeting !== null && $meeting['passcode'] !== '' ? 'Passcode: ' . $meeting['passcode'] : '',
    '',
    'If you need to move it, just reply to this email.',
    '',
    $config['studio_name'],
    $config['site_url'],
]);

$fromHeader = 'From: ' . $config['studio_name'] . ' <' . $config['from_email'] . '>';

@mail(
    (string) $config['studio_email'],
    'New call booked — ' . $name . ' — ' . $startStudio->format('j M, g:i A'),
    $studioBody,
    implode("\r\n", [
        $fromHeader,
        'Reply-To: ' . $name . ' <' . $email . '>',
        'Content-Type: text/plain; charset=UTF-8',
    ])
);

@mail(
    $email,
    'Your call with ' . $config['studio_name'] . ' is confirmed',
    (string) preg_replace("/\n{3,}/", "\n\n", $clientBody),
    implode("\r\n", [
        $fromHeader,
        'Reply-To: ' . $config['studio_name'] . ' <' . $config['studio_email'] . '>',
        'Content-Type: text/plain; charset=UTF-8',
    ])
);

/* -------------------------------------------------------------------------
   Local record — the source of truth if an email bounces.
   ------------------------------------------------------------------------- */

@file_put_contents(
    (string) $config['log_file'],
    json_encode([
        'received'  => $now->format(DATE_ATOM),
        'startUtc'  => $start->format(DATE_ATOM),
        'date'      => $date,
        'name'      => $name,
        'email'     => $email,
        'company'   => $company,
        'notes'     => $notes,
        'timezone'  => $visitorTz,
        'joinUrl'   => $meeting['joinUrl'] ?? null,
        'meetingId' => $meeting['meetingId'] ?? null,
        'ip'        => clientIp(),
    ], JSON_UNESCAPED_SLASHES) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

respond(200, [
    'ok'        => true,
    'joinUrl'   => $meeting['joinUrl'] ?? null,
    'meetingId' => $meeting['meetingId'] ?? null,
    'passcode'  => $meeting['passcode'] ?? null,
    'startUtc'  => $start->format(DATE_ATOM),
]);
