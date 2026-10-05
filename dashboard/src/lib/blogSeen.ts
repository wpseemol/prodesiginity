/**
 * Remembers, per user and per device, which version (`updatedAt`) of each blog
 * article the user last saw, so the list can flag articles someone else
 * created or edited since then.
 */
const PREFIX = "pd-blog-seen:";

type SeenMap = Record<string, string>;

const keyFor = (userId: number) => `${PREFIX}${userId}`;

export type SeenState = "new" | "updated" | null;

export function loadSeen(userId: number): SeenMap | null {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as SeenMap) : null;
  } catch {
    return null;
  }
}

function store(userId: number, map: SeenMap) {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(map));
  } catch {
    // storage unavailable — badges simply won't persist
  }
}

/** Mark the given versions as seen, keeping entries for other articles. */
export function markSeen(userId: number, posts: { id: number; updatedAt: string }[]) {
  const map = loadSeen(userId) ?? {};
  for (const post of posts) map[post.id] = post.updatedAt;
  store(userId, map);
}

/** Replace the map with exactly these versions (drops deleted articles). */
export function resetSeen(userId: number, posts: { id: number; updatedAt: string }[]) {
  store(userId, Object.fromEntries(posts.map((p) => [p.id, p.updatedAt])));
}

export function seenState(map: SeenMap | null, post: { id: number; updatedAt: string }): SeenState {
  if (!map) return null;
  const seen = map[post.id];
  if (seen === undefined) return "new";
  return seen === post.updatedAt ? null : "updated";
}
