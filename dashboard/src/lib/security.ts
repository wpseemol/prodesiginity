/**
 * Client-side mirror of `backend-api/src/lib/security.ts`. Gives instant feedback
 * in forms; the API runs the same checks again and is the real gate.
 */

const SQL_PATTERNS: RegExp[] = [
  /\bunion(?:\s|\/\*.*?\*\/)+(?:all(?:\s|\/\*.*?\*\/)+)?select\b/i,
  /['"`]\s*(?:or|and|\|\||&&)\s*['"`]?\s*\w+['"`]?\s*(?:=|<>|!=|like\b|<|>)\s*['"`]?\s*\w+/i,
  /\b(?:or|and)\s+(\d+)\s*=\s*\1\b/i,
  /['"`]\s*\)?\s*(?:--|#|\/\*)\s*$/,
  /;\s*(?:drop|truncate|alter)\s+(?:table|database|schema)\b/i,
  /\bdrop\s+(?:table|database|schema)\s+(?:if\s+exists\s+)?[`"\w]+/i,
  /;\s*delete\s+from\s+[`"\w.]+\s*(?:where\b|;|--|#|$)/i,
  /;\s*(?:shutdown\s*(?:;|--|#|$)|exec(?:ute)?\s+(?:xp_|sp_|master\.))/i,
  /\binsert\s+into\s+[`"\w.]+\s*(?:\(|values\b|select\b)/i,
  /\bupdate\s+[`"\w.]+\s+set\s+[`"\w]+\s*=\s*['"`\d]/i,
  /\b(?:sleep|pg_sleep)\s*\(\s*\d+\s*\)/i,
  /\bbenchmark\s*\(\s*\d+\s*,/i,
  /\bwaitfor\s+delay\s+['"]/i,
  /\b(?:load_file\s*\(|into\s+(?:out|dump)file\b)/i,
  /\b(?:xp_cmdshell|sp_executesql|sp_oacreate)\b/i,
  /\b(?:information_schema|mysql\.user|sqlite_master|pg_catalog)\b/i,
  /@@(?:version|datadir|hostname|basedir)\b/i,
  /\b(?:concat|char)\s*\(\s*0x[0-9a-f]+/i,
  /\bchar\s*\(\s*\d+(?:\s*,\s*\d+){3,}\s*\)/i,
];

const XSS_PATTERNS: RegExp[] = [
  /<\s*\/?\s*(?:script|iframe|frame|frameset|object|embed|applet|meta|base|link|style|form|svg|math|template|xml)\b/i,
  /<[^>]*\son[a-z]+\s*=/i,
  /\b(?:javascript|vbscript|livescript)\s*:/i,
  /\bdata\s*:\s*(?:text\/html|application\/(?:x-)?javascript|image\/svg\+xml)/i,
  /%3c\s*(?:\/\s*)?(?:script|iframe|svg|img)/i,
  /&#x?0*(?:60|3c);?\s*(?:script|iframe|svg|img)/i,
  /\bsrcdoc\s*=/i,
];

export type ThreatKind = "sql" | "xss";

export function detectThreat(value: string): ThreatKind | null {
  if (!value) return null;
  let decoded = value;
  if (/%[0-9a-f]{2}/i.test(value)) {
    try {
      decoded = decodeURIComponent(value);
    } catch {
      decoded = value;
    }
  }
  for (const text of decoded === value ? [value] : [value, decoded]) {
    if (SQL_PATTERNS.some((re) => re.test(text))) return "sql";
    if (XSS_PATTERNS.some((re) => re.test(text))) return "xss";
  }
  return null;
}

export function threatMessage(label: string, value: string): string | null {
  const kind = detectThreat(value);
  if (kind === "sql") return `${label} contains SQL commands that are not allowed`;
  if (kind === "xss") return `${label} contains HTML or script code that is not allowed`;
  return null;
}

const LOCAL_UPLOAD_RE = /^\/uploads\/[A-Za-z0-9_\-./]+$/;
const VIDEO_EXT_RE = /\.(mp4|webm|mov)(?:\?.*)?$/i;
const VIDEO_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "vimeo.com",
  "player.vimeo.com",
]);

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.username || url.password) return false;
    if (url.protocol === "https:") return true;
    return url.protocol === "http:" && /^(localhost|127\.0\.0\.1)$/.test(url.hostname);
  } catch {
    return false;
  }
}

const hasTraversal = (value: string) => /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(value);

export function isSafeMediaUrl(value: string) {
  if (hasTraversal(value)) return false;
  return LOCAL_UPLOAD_RE.test(value) || isHttpUrl(value);
}

export function isSafeVideoUrl(value: string) {
  if (hasTraversal(value)) return false;
  if (LOCAL_UPLOAD_RE.test(value)) return VIDEO_EXT_RE.test(value);
  if (!isHttpUrl(value)) return false;
  const url = new URL(value);
  return VIDEO_HOSTS.has(url.hostname) || VIDEO_EXT_RE.test(url.pathname);
}
