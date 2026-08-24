"use client";

import { useCallback, useEffect, useState } from "react";
import StorySetup, { type SetupPayload } from "@/components/StorySetup";
import StoryView from "@/components/StoryView";
import { loadStories, saveStory, deleteStory } from "@/lib/storage";
import type { Story } from "@/lib/types";
import { pathTo } from "@/lib/types";

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [active, setActive] = useState<Story | null>(null);
  const [creating, setCreating] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStories(loadStories());
    setHydrated(true);
  }, []);

  const persist = useCallback((s: Story) => {
    saveStory(s);
    setStories((prev) => {
      const rest = prev.filter((x) => x.id !== s.id);
      return [s, ...rest].sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }, []);

  function handleCreate(p: SetupPayload) {
    setCreating(true);
    const now = Date.now();
    const rootId = `n-${now}-root`;
    const story: Story = {
      id: `s-${now}`,
      title: `${p.character.name}的故事`,
      genre: p.genre,
      character: p.character,
      worldSetting: p.worldSetting,
      rootId,
      currentId: rootId,
      nodes: {
        [rootId]: {
          id: rootId,
          parentId: null,
          choiceText: null,
          sceneText: "",
          choices: [],
          createdAt: now,
        },
      },
      createdAt: now,
      updatedAt: now,
    };
    persist(story);
    setActive(story);
    setCreating(false);
    window.scrollTo({ top: 0 });
  }

  function handleExit() {
    if (active) persist(active);
    setActive(null);
  }

  function handleDelete(id: string) {
    deleteStory(id);
    setStories((prev) => prev.filter((s) => s.id !== id));
  }

  if (active) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <StoryView
          story={active}
          onChange={(s) => {
            setActive(s);
            persist(s);
          }}
          onExit={handleExit}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      {/* Hero */}
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
          StoryBranch
        </p>
        <h1 className="mt-3 font-serif text-3xl text-ink-900 sm:text-4xl">
          分叙
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500 sm:text-base">
          AI 分支叙事创作引擎。设定你的角色与世界观，AI 为你写场景、出选项；
          每一次选择都是一条新支线，随时回溯，探索故事的另一种可能。
        </p>
      </header>

      {/* 三步说明 */}
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          ["1", "设定故事", "类型、主角、世界观，一分钟完成"],
          ["2", "AI 执笔", "生成场景与三个走向各异的选项"],
          ["3", "回溯探索", "回到任意一幕，换一个选择，长出新的支线"],
        ].map(([num, title, desc]) => (
          <div key={num} className="card p-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ember-100 text-xs font-medium text-ember-600">
              {num}
            </div>
            <h3 className="mt-3 text-sm font-medium text-ink-900">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* 创建表单 */}
      <div className="mt-8">
        <StorySetup onCreate={handleCreate} busy={creating} />
      </div>

      {/* 我的故事 */}
      {hydrated && stories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-medium text-ink-900">我的故事</h2>
          <ul className="mt-3 space-y-2">
            {stories.map((s) => {
              const path = pathTo(s, s.currentId);
              return (
                <li
                  key={s.id}
                  className="card flex items-center gap-4 px-4 py-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <button
                      className="block w-full truncate text-left text-sm font-medium text-ink-900 hover:text-ember-500"
                      onClick={() => {
                        setActive(s);
                        window.scrollTo({ top: 0 });
                      }}
                    >
                      {s.title}
                      <span className="ml-2 rounded-full bg-paper-200 px-2 py-0.5 text-[10px] font-normal text-ink-500">
                        {s.genre}
                      </span>
                    </button>
                    <p className="mt-0.5 text-xs text-ink-400">
                      已写到第 {path.length} 幕 ·{" "}
                      {new Date(s.updatedAt).toLocaleString("zh-CN", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    className="shrink-0 text-xs text-ink-400 transition-colors hover:text-red-500"
                    onClick={() => handleDelete(s.id)}
                  >
                    删除
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <footer className="mt-14 text-center text-xs text-ink-400">
        StoryBranch · AI 分支叙事创作引擎 · 数据仅存于本地浏览器
      </footer>
    </main>
  );
}
