# Qwen3.5 技术要点

## 模型概览

- **定位**：原生多模态（Native Multimodality），视觉-语言一体；全系列支持图文/视频、思考模式、工具调用
- **已开源**：从 27B 稠密到 397B MoE 多档位，小模型已放出，便于本地/中等算力部署

## 模型系列与规格

| 模型 | 总参 / 激活 | 类型 | 层数 | 上下文 | 云端对应 |
|------|-------------|------|------|--------|----------|
| **Qwen3.5-27B** | 27B | 稠密 (Dense) | 64 | 262k → 1M (YaRN) | — |
| **Qwen3.5-35B-A3B** | 35B / **3B** | MoE | 40 | 262k → 1M | **Qwen3.5-Flash**（1M 默认、内置工具） |
| **Qwen3.5-122B-A10B** | 122B / **10B** | MoE | 48 | 262k → 1M | — |
| **Qwen3.5-397B-A17B** | 397B / **17B** | MoE | 60 | 262k → 1M | **Qwen3.5-Plus**（1M、内置工具、自适应工具） |

- **稠密 27B**：Gated DeltaNet/Attention + **FFN**（无 MoE），适合单卡/少卡高利用率。
- **MoE 三档**：Gated DeltaNet/Attention + **MoE**；35B-A3B 为当前最小激活（3B），122B/397B 为 10B/17B 激活。
- **统一**：词表 248320、原生 262k、支持 YaRN 扩至约 1M；默认思考模式（`<think>`），可 API 关掉。
- **HF**：[27B](https://huggingface.co/Qwen/Qwen3.5-27B) · [35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B) · [122B-A10B](https://huggingface.co/Qwen/Qwen3.5-122B-A10B) · [397B-A17B](https://huggingface.co/Qwen/Qwen3.5-397B-A17B)

**选型简述**：要**最低显存/延迟**→ 35B-A3B（3B 激活）；要**稠密、无 MoE 路由**→ 27B；要**性能与成本折中**→ 122B-A10B；要**顶格多模态+Agent**→ 397B-A17B。云端无运维可选 Flash（≈35B-A3B）/ Plus（≈397B-A17B）。

## 核心亮点

| 维度 | 要点 |
|------|------|
| **MoE** | 多档稀疏：35B-A3B / 122B-A10B / 397B-A17B 仅激活 3B–17B，显存与延迟友好 |
| **性能** | 预训练全维度（中英/多语/STEM/推理）与 1T+ 的 Qwen3-Max-Base 相当 |
| **多模态** | 早期文本-视觉融合，非“外挂”视觉模块；优于同规模 Qwen3-VL |
| **多语言** | 119 → **201** 种语言/方言；词表 15 万 → **25 万**，多数语言编解码效率提升约 10%–60% |

## 架构

- **基础**：Qwen3-Next
- **注意力**：**Gated DeltaNet + Gated Attention** 混合，兼顾长文本与稳定性
- **MoE**：更高稀疏度，在保持性能下减少计算冗余
- **基准**：BFCL-V4、VITA-Bench、DeepPlanning 等表现突出

## 预训练

- **能力**：更大规模视觉-文本语料 + 更强中英/多语/STEM/推理数据与过滤 → 跨代持平 1T 基座
- **效率**：32k/256k 上下文下，解码吞吐约为 Qwen3-Max 的 **8.6×/19×**，与 Qwen3-235B-A22B 的 **3.5×/7.2×**
- **通用性**：早期视觉融合 + 扩展视觉/STEM/视频数据 → 原生多模态

## 后训练（Post-training）

- 性能提升主要来自 **强化学习（RL）**：RL 任务与环境全面扩展
- 不针对单指标或窄类 query，而是 **RL 环境难度与可泛化性** 的 scaling
- RL Environment scaling → 通用 Agent 能力明显提升
- Tool-Decathlon、MCP-Mark 等工具调用与规划表现突出

## 能力示例

- **Agent**：多模态下边思考、边搜索、边调用工具
- **代码/智能体**：网页开发、与 OpenClaw 集成做编程与信息整理
- **视觉智能体**：GUI 操作（手机/PC）、视觉编程（草图→前端代码、视频→逻辑/网页/图表）、**空间智能**（计数、相对位置、驾驶场景等）

## 训练与部署

- **多模态训练**：视觉与语言解耦并行 + 稀疏激活，多模态训练吞吐接近纯文本基线，近 100% 硬件利用率
- **异步 RL 框架**：训推分离、百万级 Agent 环境；投机采样、Rollout 路由回放等 → 端到端训练约 **3×–5×** 加速
- **部署**：全系列统一用 SGLang / vLLM / KTransformers / Transformers 主分支，`--model-path` 换为对应 HF 模型 id 即可；262k 上下文、`reasoning-parser qwen3`、工具调用、MTP；ModelScope API-Inference 支持 397B-A17B 等

## 资源链接

- [GitHub](https://github.com/QwenLM/Qwen3.5) · [Blog](https://qwen.ai/blog?id=qwen3.5) · [QwenChat](https://chat.qwen.ai/)
- **模型**：Hugging Face 见上表各链接；ModelScope 例 [397B-A17B](https://www.modelscope.cn/models/Qwen/Qwen3.5-397B-A17B)
