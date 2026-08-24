"use client";

import { useState } from "react";
import { GENRES, type Character } from "@/lib/types";

export interface SetupPayload {
  genre: string;
  character: Character;
  worldSetting: string;
}

export default function StorySetup({
  onCreate,
  busy,
}: {
  onCreate: (p: SetupPayload) => void;
  busy: boolean;
}) {
  const [genre, setGenre] = useState<string>("悬疑推理");
  const [name, setName] = useState("");
  const [personality, setPersonality] = useState("");
  const [background, setBackground] = useState("");
  const [worldSetting, setWorldSetting] = useState("");
  const [touched, setTouched] = useState(false);

  const nameInvalid = name.trim().length === 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (nameInvalid || busy) return;
    onCreate({
      genre,
      character: {
        name: name.trim(),
        personality: personality.trim(),
        background: background.trim(),
      },
      worldSetting: worldSetting.trim(),
    });
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      <h2 className="text-base font-medium text-ink-900">开始一个新故事</h2>
      <p className="mt-1 text-sm text-ink-500">
        设定越具体，AI 写出的故事越贴合你的想象。只有主角名和类型是必填的。
      </p>

      <div className="mt-6">
        <span className="field-label">故事类型</span>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                genre === g
                  ? "border-ember-500 bg-ember-100 font-medium text-ember-600"
                  : "border-ink-400/25 bg-white text-ink-700 hover:border-ink-400/50"
              }`}
              aria-pressed={genre === g}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ch-name" className="field-label">
            主角名字 <span className="text-ember-500">*</span>
          </label>
          <input
            id="ch-name"
            className="field-input"
            placeholder="例如：林晚秋"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
          {touched && nameInvalid && (
            <p className="mt-1 text-xs text-red-600">请给主角起个名字</p>
          )}
        </div>
        <div>
          <label htmlFor="ch-personality" className="field-label">
            性格
          </label>
          <input
            id="ch-personality"
            className="field-input"
            placeholder="例如：外冷内热，观察力敏锐"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            maxLength={60}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="ch-background" className="field-label">
          角色背景
        </label>
        <input
          id="ch-background"
          className="field-input"
          placeholder="例如：退役的法医，独自经营着一家旧书店"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="ch-world" className="field-label">
          世界观
        </label>
        <textarea
          id="ch-world"
          className="field-input min-h-[72px] resize-y"
          placeholder="例如：近未来的江城，连续失踪案让全城人心惶惶"
          value={worldSetting}
          onChange={(e) => setWorldSetting(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-ink-400">数据保存在你的浏览器本地</p>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "正在生成开场…" : "开始创作"}
          {!busy && <span aria-hidden>→</span>}
        </button>
      </div>
    </form>
  );
}
