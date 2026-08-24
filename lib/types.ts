export interface Choice {
  id: string;
  /** 选项文案（一句话概括走向） */
  text: string;
  /** 该选项指向的子节点，null 表示尚未生成 */
  childId: string | null;
}

export interface StoryNode {
  id: string;
  /** 父节点 id，根节点为 null */
  parentId: string | null;
  /** 引出本节点的选项文案，根节点为 null */
  choiceText: string | null;
  /** 场景正文 */
  sceneText: string;
  /** 本节点提供的分支选项 */
  choices: Choice[];
  createdAt: number;
}

export interface Character {
  name: string;
  personality: string;
  background: string;
}

export interface Story {
  id: string;
  title: string;
  genre: string;
  character: Character;
  worldSetting: string;
  rootId: string;
  currentId: string;
  /** id -> node */
  nodes: Record<string, StoryNode>;
  updatedAt: number;
  createdAt: number;
}

export interface GenerateRequest {
  genre: string;
  character: Character;
  worldSetting: string;
  /** 从根到当前节点的路径（不含待生成节点） */
  history: { sceneText: string; chosenText: string | null }[];
}

export interface GenerateResponse {
  scene: string;
  choices: string[];
  demo?: boolean;
}

export const GENRES = [
  "悬疑推理",
  "奇幻冒险",
  "科幻未来",
  "都市情感",
  "武侠江湖",
  "恐怖惊悚",
  "温馨日常",
  "历史架空",
] as const;

export function nodeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 获取从根到指定节点的路径（含该节点） */
export function pathTo(story: Story, targetId: string): StoryNode[] {
  const path: StoryNode[] = [];
  let cur = story.nodes[targetId];
  let guard = 0;
  while (cur && guard < 1000) {
    path.unshift(cur);
    cur = cur.parentId ? story.nodes[cur.parentId] : (undefined as unknown as StoryNode);
    guard++;
  }
  return path;
}
