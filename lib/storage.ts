import type { Story } from "./types";

const STORE_KEY = "sb_stories_v1";

export function loadStories(): Story[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, Story>;
    return Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveStory(story: Story): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, Story>) : {};
    map[story.id] = story;
    window.localStorage.setItem(STORE_KEY, JSON.stringify(map));
  } catch {
    // 存储失败（隐私模式/超限）时静默降级为内存态
  }
}

export function deleteStory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, Story>;
    delete map[id];
    window.localStorage.setItem(STORE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}
