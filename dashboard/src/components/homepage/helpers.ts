export function asObj(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function asArr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function asStr(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asNum(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function asBool(value: unknown): boolean {
  return value === true;
}

export function cloneContent(content: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(asObj(content))) as Record<string, unknown>;
}
