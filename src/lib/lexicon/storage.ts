import type { Block } from "./blocks";

const TEMPLATES_KEY = "lexicon.templates.v1";
const HISTORY_KEY = "lexicon.history.v1";
const SESSION_KEY = "lexicon.session.v1";

export interface SavedItem {
  id: string;
  name: string;
  blocks: Block[];
  createdAt: number;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export const storage = {
  // Templates (named, user-saved)
  listTemplates(): SavedItem[] {
    return safeParse<SavedItem[]>(localStorage.getItem(TEMPLATES_KEY), []);
  },
  saveTemplate(name: string, blocks: Block[]): SavedItem {
    const items = storage.listTemplates();
    const item: SavedItem = {
      id: `tpl_${Date.now().toString(36)}`,
      name: name.trim() || "Untitled template",
      blocks: structuredClone(blocks),
      createdAt: Date.now(),
    };
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify([item, ...items].slice(0, 30)));
    return item;
  },
  deleteTemplate(id: string) {
    const items = storage.listTemplates().filter((i) => i.id !== id);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(items));
  },

  // History (auto, snapshots)
  listHistory(): SavedItem[] {
    return safeParse<SavedItem[]>(localStorage.getItem(HISTORY_KEY), []);
  },
  pushHistory(blocks: Block[]) {
    if (!blocks.length) return;
    const items = storage.listHistory();
    const item: SavedItem = {
      id: `his_${Date.now().toString(36)}`,
      name: `Snapshot · ${new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}`,
      blocks: structuredClone(blocks),
      createdAt: Date.now(),
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...items].slice(0, 20)));
  },
  deleteHistory(id: string) {
    const items = storage.listHistory().filter((i) => i.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  },

  // Session (auto-restore on load)
  loadSession(): Block[] | null {
    return safeParse<Block[] | null>(localStorage.getItem(SESSION_KEY), null);
  },
  saveSession(blocks: Block[]) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(blocks));
  },
};
