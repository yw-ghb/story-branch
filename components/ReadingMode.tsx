"use client";

import { useEffect, useRef } from "react";
import type { Story } from "@/lib/types";
import { pathTo } from "@/lib/types";

/** 沉浸阅读当前路径的完整故事 */
export default function ReadingMode({
  story,
  onClose,
}: {
  story: Story;
  onClose: () => void;
}) {
  const path = pathTo(story, story.currentId);
  const totalChars = path.reduce((s, n) => s + n.sceneText.length, 0);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink-900/60 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="阅读模式"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={topRef}
        tabIndex={-1}
        className="mx-auto max-w-2xl rounded-2xl bg-paper-50 p-8 shadow-2xl sm:p-12"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-400">
              {story.genre}
            </p>
            <h2 className="mt-1 font-serif text-2xl text-ink-900">
              {story.character.name}的故事
            </h2>
            <p className="mt-1 text-xs text-ink-400">
              {path.length} 幕 · 约 {totalChars} 字 · 当前路径
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost shrink-0">
            关闭
          </button>
        </div>

        <article className="mt-8 space-y-6">
          {path.map((node, i) => (
            <section key={node.id}>
              {node.choiceText && (
                <p className="mb-4 text-center text-xs tracking-wide text-ink-400">
                  —— 你选择了：{node.choiceText} ——
                </p>
              )}
              <p className="whitespace-pre-wrap font-serif text-[15px] leading-8 text-ink-700">
                {node.sceneText}
              </p>
              {i < path.length - 1 && (
                <div className="mx-auto mt-8 h-px w-16 bg-paper-200" />
              )}
            </section>
          ))}
        </article>

        <p className="mt-10 text-center text-xs text-ink-400">
          故事仍在继续 —— 回到创作页，做出下一个选择
        </p>
      </div>
    </div>
  );
}
