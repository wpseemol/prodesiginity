<?php
/**
 * deploy-extract.php — one-shot deployment unzipper.
 * ---------------------------------------------------------------------------
 * Lives in the repo at deploy/deploy-extract.php. The workflow copies it,
 * substitutes DEPLOY_TOKEN, uploads it next to site.zip, then calls it once.
 *
 *     1. CI zips the contents of ./out into site.zip
 *     2. CI uploads site.zip + this file over FTPS (two files, one connection)
 *     3. CI calls this file over HTTPS with a one-time token
 *     4. this file extracts the zip, then deletes the zip AND ITSELF
 *
 * Step 4 matters: a permanently reachable extractor in the document root is a
 * remote-code-execution hole, so a fresh token is minted on every deploy and
 * the script removes itself when finished.
 *
 * Query parameters:
 *   token   required, must match DEPLOY_TOKEN
 *   purge=1 optional, deletes files that are not in the zip (see PROTECTED_PATHS)
 *
 * Requires PHP 8.1+ (never return type) and the zip extension.
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
    ZIP_NAME,
];

function done(int $code, string $message): never
{
    http_response_code($code);
    echo $message, "\n";
    exit;
}

/* ---------------------------- Authorisation ---------------------------- */

// The placeholder is split so `sed` can never accidentally rewrite this line.
if (DEPLOY_TOKEN === '__DEPLOY_' . 'TOKEN__' || strlen(DEPLOY_TOKEN) < 24) {
    done(500, 'FAIL: deploy token was not substituted.');
}

$supplied = (string) ($_GET['token'] ?? '');
// hash_equals, not ===, so the comparison does not leak the token by timing.
if ($supplied === '' || !hash_equals(DEPLOY_TOKEN, $supplied)) {
    done(403, 'FAIL: bad token.');
}

/* ------------------------------ Extraction ----------------------------- */

$root    = rtrim(str_replace('\\', '/', __DIR__), '/');
$self    = basename(__FILE__);
$zipPath = $root . '/' . ZIP_NAME;

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

/**
 * Collect the entry list before extracting so purge knows what is current.
 *
 * `zip -r archive.zip .` can emit names as "./index.html" depending on the zip
 * build, so every entry is normalised here. Without this the purge pass would
 * not recognise the files it had just extracted and would delete the whole
 * site.
 */
$shipped   = [];
$extracted = 0;

for ($i = 0; $i < $zip->numFiles; $i++) {
    $entry = $zip->getNameIndex($i);
    if ($entry === false || $entry === '') {
        continue;
    }

    $entry = str_replace('\\', '/', $entry);
    while (str_starts_with($entry, './')) {
        $entry = substr($entry, 2);
    }
    $entry = ltrim($entry, '/');

    // Refuse traversal entries outright rather than trusting the archive.
    if ($entry === '..' || str_starts_with($entry, '../') || str_contains($entry, '/../')) {
        $zip->close();
        done(400, 'FAIL: archive contains a path traversal entry.');
    }

    $isDir = str_ends_with($entry, '/');
    $entry = rtrim($entry, '/');
    if ($entry === '' || $entry === '.') {
        continue;
    }

    if (!$isDir) {
        $extracted++;
    }
    $shipped[$entry] = true;

    // Register every parent directory too, in case the archive stores no
    // explicit directory entries.
    $parent = $entry;
    while (($pos = strrpos($parent, '/')) !== false) {
        $parent = substr($parent, 0, $pos);
        if ($parent === '') {
            break;
        }
        $shipped[$parent] = true;
    }
}

if ($extracted === 0) {
    $zip->close();
    done(500, 'FAIL: ' . ZIP_NAME . ' contains no files.');
}

if (!$zip->extractTo($root)) {
    $zip->close();
    done(500, 'FAIL: extraction failed — check directory permissions.');
}
$zip->close();

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

        if ($relative === '' || isset($shipped[$relative])) {
            continue;
        }

        // Never purge this script, whatever it happens to be called.
        if ($relative === $self) {
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
echo 'extracted: ' . $extracted . " files\n";
echo 'purged: ' . $removed . " paths\n";
echo 'self-removed: ' . ($selfDeleted ? 'yes' : 'NO — delete deploy-extract.php manually') . "\n";