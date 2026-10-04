/**
 * Unsaved blog edits kept in localStorage so a crash, closed tab or expired
 * session does not lose work. Keys are per user + article and entries expire
 * after a week. Sign-out wipes them all; signing in as someone else wipes the
 * previous user's (see api.ts / session.ts).
 */
export const BLOG_DRAFT_PREFIX = "pd-blog-draft:";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type LocalDraft<T> = { savedAt: number; values: T };

export function blogDraftKey(userId: number, postId: number | null) {
  return `${BLOG_DRAFT_PREFIX}${userId}:${postId ?? "new"}`;
}

export function saveLocalDraft<T>(key: string, values: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), values }));
    return true;
  } catch {
    return false;
  }
}

export function loadLocalDraft<T>(key: string): LocalDraft<T> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalDraft<T>>;
    if (typeof parsed.savedAt !== "number" || !parsed.values || typeof parsed.values !== "object") {
      localStorage.removeItem(key);
      return null;
    }
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed as LocalDraft<T>;
  } catch {
    return null;
  }
}

export function clearLocalDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // storage unavailable
  }
}

export function clearAllBlogDrafts(keepUserId?: number) {
  const keep = keepUserId === undefined ? null : `${BLOG_DRAFT_PREFIX}${keepUserId}:`;
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(BLOG_DRAFT_PREFIX) && !(keep && key.startsWith(keep))) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // storage unavailable
  }
}
