import type { NextFunction, Request, Response } from "express";

/**
 * Input threat detection.
 *
 * Prisma already sends every value as a bound parameter, so these checks are
 * defence in depth: they reject obvious attack payloads (SQL injection, script
 * injection, prototype pollution) before they reach a controller, get stored,
 * or end up in a log viewer that renders HTML.
 *
 * Patterns are deliberately narrow so normal article prose ("select the best
 * option", "drop us a line") is never flagged.
 */

export type ThreatKind = "sql" | "xss" | "traversal";

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

const TRAVERSAL_PATTERNS: RegExp[] = [/(?:^|[\\/])\.\.(?:[\\/]|$)/, /%2e%2e(?:%2f|%5c|\/|\\)/i, /\0/];

/** Keys that can poison `Object.prototype` when merged into objects. */
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** Fields whose values are secrets and must never be pattern-matched or logged. */
const SKIP_KEY = /pass(word)?|token|secret/i;

const MAX_DEPTH = 12;

export function detectThreat(value: string): ThreatKind | null {
  if (!value) return null;
  // Decode once so `%27%20OR%201%3D1` is caught as well.
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

export function hasPathTraversal(value: string): boolean {
  return TRAVERSAL_PATTERNS.some((re) => re.test(value));
}

export type ThreatHit = { field: string; kind: ThreatKind | "pollution" | "depth" };

/** Walks any JSON-like value and returns the first suspicious field. */
export function scanForThreats(input: unknown, path = "", depth = 0): ThreatHit | null {
  if (depth > MAX_DEPTH) return { field: path || "body", kind: "depth" };

  if (typeof input === "string") {
    const kind = detectThreat(input);
    return kind ? { field: path || "value", kind } : null;
  }

  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i += 1) {
      const hit = scanForThreats(input[i], `${path}[${i}]`, depth + 1);
      if (hit) return hit;
    }
    return null;
  }

  if (input && typeof input === "object") {
    for (const key of Object.keys(input)) {
      const field = path ? `${path}.${key}` : key;
      if (FORBIDDEN_KEYS.has(key)) return { field, kind: "pollution" };
      if (SKIP_KEY.test(key)) continue;
      const keyThreat = detectThreat(key);
      if (keyThreat) return { field, kind: keyThreat };
      const hit = scanForThreats((input as Record<string, unknown>)[key], field, depth + 1);
      if (hit) return hit;
    }
  }

  return null;
}

const THREAT_MESSAGES: Record<ThreatHit["kind"], string> = {
  sql: "contains a pattern that looks like SQL injection",
  xss: "contains HTML or script code that is not allowed",
  traversal: "contains an invalid path",
  pollution: "uses a reserved field name",
  depth: "is nested too deeply",
};

export function threatMessage(hit: ThreatHit): string {
  return `Request rejected: "${hit.field}" ${THREAT_MESSAGES[hit.kind]}.`;
}

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * Rejects requests whose params, query or JSON/form body carry an attack
 * payload. Mount on routes that accept user content.
 */
export function blockMaliciousInput(req: Request, res: Response, next: NextFunction) {
  const sources: [string, unknown][] = [
    ["params", req.params],
    ["query", req.query],
    ["body", req.body],
  ];

  for (const [source, value] of sources) {
    const hit = scanForThreats(value, source);
    if (hit) {
      console.warn(
        `[security] blocked ${hit.kind} payload from ${clientIp(req)} ${req.method} ${req.originalUrl} field=${hit.field}`,
      );
      return res.status(400).json({ message: threatMessage(hit) });
    }
  }

  return next();
}

/** Strips ASCII control characters (keeps tab / newline) and trims. */
export function cleanText(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}
