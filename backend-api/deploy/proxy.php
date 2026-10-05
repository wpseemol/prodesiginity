<?php
/**
 * ProDesignity API bridge for Hostinger public_html
 * -----------------------------------------------------------------
 * Place this file + .htaccess in the document root of
 *   api.prodesignity.com  (or public_html/api/)
 *
 * Node/pm2 must listen on 127.0.0.1:PORT (default 4000).
 *
 * Supports:
 *   - GET / HEAD / OPTIONS
 *   - POST / PUT / PATCH / DELETE with JSON body
 *   - POST multipart (file uploads) via $_FILES rebuild
 *   - PUT / PATCH multipart via raw php://input (PHP does not fill $_FILES)
 */
declare(strict_types=1);

// ---- Config (edit if your Node port is different) ----
$BACKEND_ORIGIN = getenv('PRODESIGNITY_BACKEND') ?: 'http://127.0.0.1:4000';
$CONNECT_TIMEOUT = 10;
$TIMEOUT = 180; // large homepage video uploads up to ~120MB

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$backendUrl = rtrim($BACKEND_ORIGIN, '/') . $uri;

/**
 * The proxy's own error responses never reach Node, so they carry no CORS
 * headers and the browser would report "CORS error" instead of the real
 * problem. Let the page read the error (no credentials, so nothing is exposed).
 */
function proxy_error(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    if (!empty($_SERVER['HTTP_ORIGIN'])) {
        header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
        header('Vary: Origin');
    }
    echo json_encode($body);
    exit;
}

$ch = curl_init($backendUrl);
if ($ch === false) {
    proxy_error(500, ['error' => 'Proxy could not init cURL']);
}

curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CONNECTTIMEOUT => $CONNECT_TIMEOUT,
    CURLOPT_TIMEOUT => $TIMEOUT,
    // Node on localhost — no TLS
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => 0,
]);

$contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
$isMultipart = stripos($contentType, 'multipart/form-data') !== false;

/**
 * Hop-by-hop / unsafe headers we must not forward.
 */
$skipHeaders = [
    'host' => true,
    'connection' => true,
    'content-length' => true,
    'transfer-encoding' => true,
    'keep-alive' => true,
    'proxy-authenticate' => true,
    'proxy-authorization' => true,
    'te' => true,
    'trailers' => true,
    'upgrade' => true,
    'expect' => true,
    // Client-supplied IP headers are dropped and rebuilt below, otherwise anyone
    // could fake their IP and dodge the API's rate limits.
    'x-forwarded-for' => true,
    'x-forwarded-host' => true,
    'x-forwarded-proto' => true,
    'x-real-ip' => true,
    'forwarded' => true,
];

$headers = [];
if (function_exists('getallheaders')) {
    foreach (getallheaders() as $key => $value) {
        $lk = strtolower((string) $key);
        if (isset($skipHeaders[$lk])) {
            continue;
        }
        // When rebuilding multipart POST, let cURL set Content-Type + boundary
        if ($isMultipart && $method === 'POST' && ($lk === 'content-type')) {
            continue;
        }
        $headers[] = $key . ': ' . $value;
    }
} else {
    // Fallback if getallheaders() missing
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
            $lk = strtolower($name);
            if (isset($skipHeaders[$lk])) {
                continue;
            }
            if ($isMultipart && $method === 'POST' && $lk === 'content-type') {
                continue;
            }
            $headers[] = $name . ': ' . $value;
        }
    }
    if (!empty($contentType) && !($isMultipart && $method === 'POST')) {
        $headers[] = 'Content-Type: ' . $contentType;
    }
}

$headers[] = 'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? '');
$headers[] = 'X-Forwarded-Proto: ' . ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
if (!empty($_SERVER['HTTP_HOST'])) {
    $headers[] = 'X-Forwarded-Host: ' . $_SERVER['HTTP_HOST'];
}

// ---- Body ----
if ($method !== 'GET' && $method !== 'HEAD') {
    if ($isMultipart && $method === 'POST') {
        // PHP already parsed the body into $_POST / $_FILES
        $postFields = [];

        foreach ($_POST as $key => $value) {
            $postFields[$key] = $value;
        }

        foreach ($_FILES as $key => $file) {
            if (is_array($file['name'])) {
                // Multiple files under same field name
                $count = count($file['name']);
                for ($i = 0; $i < $count; $i++) {
                    if (($file['error'][$i] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
                        continue;
                    }
                    $postFields[$key . '[' . $i . ']'] = new CURLFile(
                        $file['tmp_name'][$i],
                        $file['type'][$i] ?: 'application/octet-stream',
                        $file['name'][$i],
                    );
                }
            } else {
                if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
                    continue;
                }
                $postFields[$key] = new CURLFile(
                    $file['tmp_name'],
                    $file['type'] ?: 'application/octet-stream',
                    $file['name'],
                );
            }
        }

        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    } else {
        // JSON, urlencoded, or PUT/PATCH multipart (raw body still in php://input)
        $raw = file_get_contents('php://input');
        if ($raw !== false && $raw !== '') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $raw);
        } elseif ($method === 'POST' && !empty($_POST)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($_POST));
        }
    }
}

if (!empty($headers)) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
}

$response = curl_exec($ch);
if ($response === false) {
    // Details go to the server log only; visitors don't need the internal address.
    error_log('[proxy] Node API unreachable at ' . $BACKEND_ORIGIN . ': ' . curl_error($ch)
        . ' (check: pm2 status && curl http://127.0.0.1:4000/api/health)');
    curl_close($ch);
    proxy_error(502, [
        'error' => 'Bad Gateway',
        'message' => 'The API is temporarily unavailable. Please try again shortly.',
    ]);
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

http_response_code($httpCode > 0 ? $httpCode : 502);

$skipResponseHeaders = [
    'transfer-encoding' => true,
    'connection' => true,
    'keep-alive' => true,
    'content-encoding' => true, // body already decoded by curl in most setups
];

foreach (explode("\r\n", $responseHeaders) as $headerLine) {
    if ($headerLine === '' || stripos($headerLine, 'HTTP/') === 0) {
        continue;
    }
    $colon = strpos($headerLine, ':');
    if ($colon === false) {
        continue;
    }
    $name = strtolower(trim(substr($headerLine, 0, $colon)));
    if (isset($skipResponseHeaders[$name])) {
        continue;
    }
    header($headerLine, false);
}

echo $responseBody;
