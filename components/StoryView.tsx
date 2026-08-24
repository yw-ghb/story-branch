"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Choice, Story } from "@/lib/types";
import { pathTo } from "@/lib/types";
import PathPanel from "./PathPanel";
import ReadingMode from "./ReadingMode";

interface Props {
  story: Story;
  onChange: (s: Story) => void;
  onExit: () => void;
}

export default function StoryView({ story, onChange, onExit }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [reading, setReading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);
  const lastAttemptRef = useRef<Choice | null>(null);
  const path = pathTo(story, story.currentId);
  const current = path[path.length - 1];

  const update = useCallback(
    (mutate: (draft: Story) => void) => {
      const draft: Story = JSON.parse(JSON.stringify(story));
      mutate(draft);
      draft.updatedAt = Date.now();
      onChange(draft);
    },
    [story, onChange]
  );

  const generate = useCallback(
    async (choice: Choice | null) => {
      if (loading) return;
      lastAttemptRef.current = choice;
      setLoading(true);
      setError(null);
      try {
        const completed = path.filter((n) => n.sceneText);
        const history = completed.map((n, i) => ({
          sceneText: n.sceneText,
          chosenText:
            i < completed.length - 1
              ? (completed[i + 1].choiceText ?? null)
              : (choice?.text ?? null),
        }));

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            genre: story.genre,
            character: story.character,
            worldSetting: story.worldSetting,
            history,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "生成失败，请重试");
        }
        if (data.demo) setIsDemo(true);
        else setIsDemo(false);

        const scene: string = data.scene;
        const choiceTexts: string[] = data.choices;

        if (choice === null) {
          // 填充根节点开场
          update((draft) => {
            const root = draft.nodes[draft.rootId];
            root.sceneText = scene;
            root.choices = choiceTexts.map((t) => ({
              id: `c-${Math.random().toString(36).slice(2, 10)}`,
              text: t,
              childId: null,
            }));
          });
        } else {
          // 由选项生成后续节点
          update((draft) => {
            const parent = draft.nodes[story.currentId];
            const nodeId = `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            draft.nodes[nodeId] = {
              id: nodeId,
              parentId: parent.id,
              choiceText: choice.text,
              sceneText: scene,
              choices: choiceTexts.map((t) => ({
                id: `c-${Math.random().toString(36).slice(2, 10)}`,
                text: t,
                childId: null,
              })),
              createdAt: Date.now(),
            };
            const target = parent.choices.find((c) => c.id === choice.id);
            if (target) target.childId = nodeId;
            draft.currentId = nodeId;
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "生成失败，请重试");
      } finally {
        setLoading(false);
      }
    },
    [loading, path, story, update]
  );

  // 进入故事页时，若开场尚未生成则自动生成
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (!current?.sceneText) {
      void generate(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 新内容出现时滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [path.length, loading]);

  function handleChoice(choice: Choice) {
    if (loading) return;
    if (choice.childId) {
      update((draft) => {
        draft.currentId = choice.childId as string;
      });
    } else {
      void generate(choice);
    }
  }

  function jumpTo(nodeId: string) {
    if (loading || nodeId === story.currentId) return;
    update((draft) => {
      draft.currentId = nodeId;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
      <div className="min-w-0">
        {/* 顶栏 */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-ink-400">
              {story.genre}
            </p>
            <h1 className="truncate font-serif text-xl text-ink-900">
              {story.character.name}的故事
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={onExit}>
              保存并返回
            </button>
            <button
              className="btn-primary"
              onClick={() => setReading(true)}
              disabled={!current?.sceneText}
            >
              阅读模式
            </button>
          </div>
        </div>

        {isDemo && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
            当前为<b>演示模式</b>：服务器未配置 AI Key，场景由预置模板生成，
            交互流程与真实模式完全一致。部署时配置环境变量
            <code className="mx-1 rounded bg-amber-100 px-1 py-0.5">AI_API_KEY</code>
            即切换为 AI 实时创作。
          </div>
        )}

        {/* 剧情流 */}
        <div className="space-y-5">
          {path.map((node, i) => {
            const isLast = i === path.length - 1;
            const madeChoice = !isLast ? path[i + 1].choiceText : null;
            return (
              <div key={node.id} className="animate-fade-up">
                {node.choiceText && (
                  <div className="mb-3 flex items-center justify-center">
                    <span className="rounded-full bg-paper-200 px-3 py-1 text-xs text-ink-500">
                      你选择了：{node.choiceText}
                    </span>
                  </div>
                )}
                <article className="card p-5 sm:p-6">
                  <p className="whitespace-pre-wrap font-serif text-[15px] leading-8 text-ink-700">
                    {node.sceneText}
                  </p>

                  {madeChoice !== null && !isLast && (
                    <div className="mt-4 flex justify-end border-t border-paper-200 pt-3">
                      <button
                        className="text-xs text-ink-400 transition-colors hover:text-ember-500"
                        onClick={() => jumpTo(node.id)}
                      >
                        ↩ 回到此幕，换个选择
                      </button>
                    </div>
                  )}
                </article>
              </div>
            );
          })}

          {/* 选项区（仅当前幕） */}
          {current?.sceneText && (
            <div className="animate-fade-up space-y-2.5">
              {current.choices.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleChoice(c)}
                  disabled={loading}
                  className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all ${
                    c.childId
                      ? "border-moss-600/30 bg-moss-100/50 text-ink-700 hover:border-moss-600/60"
                      : "border-ink-400/25 bg-white text-ink-700 hover:border-ember-500/60 hover:bg-ember-100/40"
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500/30 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium ${
                      c.childId
                        ? "border-moss-600/40 bg-moss-600 text-white"
                        : "border-ink-400/40 text-ink-400 group-hover:border-ember-500 group-hover:bg-ember-500 group-hover:text-white"
                    }`}
                    aria-hidden
                  >
                    {c.childId ? "✓" : "→"}
                  </span>
                  <span className="leading-relaxed">{c.text}</span>
                  {c.childId && (
                    <span className="ml-auto shrink-0 text-[10px] text-moss-600">
                      已探索
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 生成中 */}
          {loading && (
            <div className="card animate-fade-up p-5" aria-live="polite">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-ember-500" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-ember-500 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-ember-500 [animation-delay:300ms]" />
                <span className="ml-2 text-sm text-ink-400">AI 正在执笔…</span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-paper-200" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-paper-200" />
                <div className="h-3 w-4/6 animate-pulse rounded bg-paper-200" />
              </div>
            </div>
          )}

          {/* 错误与重试 */}
          {error && !loading && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p>{error}</p>
              <div className="mt-3 flex gap-2">
                <button
                  className="btn-ghost !py-1.5 !text-xs"
                  onClick={() => generate(lastAttemptRef.current)}
                >
                  重试
                </button>
                {current?.sceneText && (
                  <span className="self-center text-xs text-red-400">
                    将继续刚才未完成的选择
                  </span>
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 路径面板 */}
      <div className="hidden lg:block">
        <PathPanel story={story} onJump={jumpTo} />
      </div>
      {/* 移动端折叠 */}
      <details className="lg:hidden">
        <summary className="cursor-pointer text-sm font-medium text-ink-700">
          故事路径（点击回溯）
        </summary>
        <div className="mt-3">
          <PathPanel story={story} onJump={jumpTo} />
        </div>
      </details>

      {reading && (
        <ReadingMode story={story} onClose={() => setReading(false)} />
      )}
    </div>
  );
}
