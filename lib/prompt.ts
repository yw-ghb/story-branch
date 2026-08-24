import type { GenerateRequest } from "./types";

export function buildPrompt(req: GenerateRequest): { system: string; user: string } {
  const { genre, character, worldSetting, history } = req;

  const system = `你是一位资深的互动叙事作家，擅长${genre}类型的故事创作。你的任务是根据用户设定的世界观和角色，续写互动故事的下一个场景。

创作要求：
1. 使用第二人称"你"叙事，让读者有代入感
2. 场景描述 100~200 字，有画面感、有张力，推进剧情
3. 严格保持角色性格与世界观的一致性，不能与前文矛盾
4. 每次给出 3 个选项，方向差异要明显（如：冒险推进 / 谨慎观察 / 人际互动），避免同质化
5. 每个选项一句话（15~30字），只描述"你"要做的动作，不剧透后果

输出严格的 JSON 格式（不要包含任何其他文字）：
{"scene": "场景描述", "choices": ["选项1", "选项2", "选项3"]}`;

  const historyText =
    history.length === 0
      ? "（这是故事的开头，请从一个有吸引力的开场场景写起）"
      : history
          .map((h, i) => {
            const label = h.chosenText ? `【选择：${h.chosenText}】` : "【开场】";
            return `第${i + 1}幕 ${label}\n${h.sceneText}`;
          })
          .join("\n\n");

  const user = `【故事设定】
类型：${genre}
主角：${character.name}
性格：${character.personality || "（未指定，自行设计一个贴合类型的性格）"}
背景：${character.background || "（未指定）"}
世界观：${worldSetting || "（未指定，自行设计一个贴合类型的背景）"}

【已经发生的剧情】
${historyText}

请续写下一幕。`;

  return { system, user };
}
