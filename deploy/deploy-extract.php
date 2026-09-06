<?php
/**
 * deploy-extract.php — one-shot deployment unzipper.
 * ---------------------------------------------------------------------------
 * FTP can upload a zip but it cannot run `unzip`, and Hostinger's shared plans
 * do not all include SSH. The workable pattern on PHP hosting is therefore:
 *
 *     1. CI zips ./out into site.zip
 *     2. CI uploads ONLY site.zip + this file over FTP  (two files, one
 *        connection — far faster than several thousand small files)
 *     3. CI calls this file over HTTPS with a one-time token
 *     4. this file extracts the zip, then deletes the zip AND ITSELF
 *
 * Step 4 is the important one. A permanently reachable extractor sitting in
 * the document root is a remote-code-execution hole, so this script is written
 * fresh with a new token on every deploy and removes itself when finished.
 *
 * The token is substituted by the workflow before upload — the placeholder
 * below is never a valid token, and the script refuses to run while it is
 * still in place.
 *
 * Query parameters:
 *   token   required, must match DEPLOY_TOKEN
 *   purge=1 optional, deletes files that are not in the zip (see PROTECTED_PATHS)
 */

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

/** Replaced by the deploy workflow with `openssl rand -hex 24`. */
const DEPLOY_TOKEN = '__DEPLOY_TOKEN__';

const ZIP_NAME = 'site.zip';

/**
 * Never deleted by purge=1. These live on the server rather than in the repo:
 * killing them would take down redirects, API credentials, mail routing or
 * domain-verification files.
 */
const PROTECTED_PATHS = [
    '.htaccess',
    '.well-known',
    'cgi-bin',
    'php.ini',
    '.user.ini',
    'error_log',
    'api/config.php',
    'api/bookings.log',
    'deploy-extract.php',
    ZIP_NAME,
];

function done(int $code, string $message): never
{
    http_response_code($code);
    echo $message, "\n";
    exit;
}

/* ---------------------------- Authorisation ---------------------------- */

if (DEPLOY_TOKEN === '__DEPLOY_' . 'TOKEN__' || strlen(DEPLOY_TOKEN) < 24) {
    done(500, 'FAIL: deploy token was not substituted.');
}

$supplied = (string) ($_GET['token'] ?? '');
// hash_equals, not ===, so the comparison does not leak the token by timing.
if ($supplied === '' || !hash_equals(DEPLOY_TOKEN, $supplied)) {
    done(403, 'FAIL: bad token.');
}

/* ------------------------------ Extraction ----------------------------- */

$root = __DIR__;
$zipPath = $root . DIRECTORY_SEPARATOR . ZIP_NAME;

if (!is_readable($zipPath)) {
    done(404, 'FAIL: ' . ZIP_NAME . ' not found. Did the FTP upload finish?');
}

if (!class_exists('ZipArchive')) {
    done(500, 'FAIL: the PHP zip extension is not enabled on this host.');
}

$zip = new ZipArchive();
if ($zip->open($zipPath) !== true) {
    done(500, 'FAIL: could not open ' . ZIP_NAME . '.');
}

// Collect the entry list before extracting so --purge knows what is current.
$shipped = [];
for ($i = 0; $i < $zip->numFiles; $i++) {
    $entry = $zip->getNameIndex($i);
    if ($entry === false) {
        continue;
    }
    // Refuse traversal entries outright rather than trusting the archive.
    if (str_contains($entry, '..')) {
        $zip->close();
        done(400, 'FAIL: archive contains a path traversal entry.');
    }
    $shipped[rtrim($entry, '/')] = true;
}

if (!$zip->extractTo($root)) {
    $zip->close();
    done(500, 'FAIL: extraction failed — check directory permissions.');
}
$zip->close();

$extracted = count($shipped);

/* -------------------------------- Purge -------------------------------- */
/**
 * Off by default. Removing stale files keeps the deploy honest, but on shared
 * hosting the document root often contains things the repository knows nothing
 * about, so this stays opt-in and always honours PROTECTED_PATHS.
 */

$removed = 0;

if (($_GET['purge'] ?? '') === '1') {
    $walk = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($walk as $item) {
        /** @var SplFileInfo $item */
        $relative = str_replace('\\', '/', substr($item->getPathname(), strlen($root) + 1));

        if (isset($shipped[$relative])) {
            continue;
        }

        $isProtected = false;
        foreach (PROTECTED_PATHS as $keep) {
            if ($relative === $keep || str_starts_with($relative, $keep . '/')) {
                $isProtected = true;
                break;
            }
        }
        if ($isProtected) {
            continue;
        }

        if ($item->isDir()) {
            // Only removes empties; CHILD_FIRST means children went first.
            if (@rmdir($item->getPathname())) {
                $removed++;
            }
        } elseif (@unlink($item->getPathname())) {
            $removed++;
        }
    }
}

/* ------------------------------- Cleanup ------------------------------- */

@unlink($zipPath);

// Self-destruct. Do this last: once the file is gone nothing else can run.
$selfDeleted = @unlink(__FILE__);

echo "OK\n";
echo 'extracted: ' . $extracted . " entries\n";
echo 'purged: ' . $removed . " paths\n";
echo 'self-removed: ' . ($selfDeleted ? 'yes' : 'NO — delete deploy-extract.php manually') . "\n";
