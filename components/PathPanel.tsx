"use client";

import type { Story, StoryNode } from "@/lib/types";
import { pathTo } from "@/lib/types";

/** 渲染已探索的故事树（缩进列表形态），当前路径高亮，可点击回溯 */
export default function PathPanel({
  story,
  onJump,
}: {
  story: Story;
  onJump: (nodeId: string) => void;
}) {
  const currentPathIds = new Set(pathTo(story, story.currentId).map((n) => n.id));

  const rows: { node: StoryNode; depth: number }[] = [];
  function walk(id: string, depth: number) {
    const node = story.nodes[id];
    if (!node) return;
    rows.push({ node, depth });
    node.choices.forEach((c) => {
      if (c.childId) walk(c.childId, depth + 1);
    });
  }
  walk(story.rootId, 0);

  return (
    <aside className="card sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto p-4">
      <h3 className="text-sm font-medium text-ink-900">故事路径</h3>
      <p className="mt-0.5 text-xs text-ink-400">
        共 {rows.length} 幕 · 点击任意一幕回溯
      </p>
      <ul className="mt-3 space-y-0.5">
        {rows.map(({ node, depth }) => {
          const isCurrent = node.id === story.currentId;
          const onPath = currentPathIds.has(node.id);
          return (
            <li key={node.id}>
              <button
                onClick={() => onJump(node.id)}
                className={`w-full rounded-md px-2 py-1.5 text-left text-xs leading-relaxed transition-colors ${
                  isCurrent
                    ? "bg-ember-100 font-medium text-ember-600"
                    : onPath
                      ? "text-ink-700 hover:bg-paper-100"
                      : "text-ink-400 hover:bg-paper-100"
                }`}
                style={{ paddingLeft: `${8 + depth * 14}px` }}
                title={node.sceneText.slice(0, 60)}
              >
                {depth === 0 ? (
                  <span>开场</span>
                ) : (
                  <span className="line-clamp-1">
                    {node.choiceText ?? "（未选择）"}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
