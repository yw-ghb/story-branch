import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "分叙 StoryBranch — AI 分支叙事创作引擎",
  description:
    "面向互动小说与游戏叙事创作者的 AI 分支故事创作工具：设定角色与世界观，AI 生成场景与分支选项，随时回溯探索不同剧情走向。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-paper-50 text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
