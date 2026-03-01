<section id="llm_robot"></section>

## (4) LLM for Robotics —— 大语言模型在机器人中的应用

LLM 在机器人领域的价值，更多体现在**高层语义理解与任务组织**：把自然语言指令转成结构化计划，或者与传统规划器、3D 感知模块协作形成“可执行”的中间表示。需要强调的是：在多数可落地系统中，LLM 并不直接输出低层控制量，而是充当**高层策略/规划器**或**工具调用与代码生成器**。

| 方向 | 代表资源 / 工作 | 链接 | 说明 |
|---|---|---|---|
| 综述 / 入门 | Robotics+LLM 系列 | [link](https://zhuanlan.zhihu.com/p/668053911) | 系列文章，适合快速扫全景 |
| 概念基础 | Embodied Agent | [link](https://en.wikipedia.org/wiki/Embodied_agent) | 具身智能体基本概念 |
| Agent 综述 | Lilian Weng：AI Agent | 中文：[link](https://mp.weixin.qq.com/s/Jb8HBbaKYXXxTSQOBsP5Wg) / 英文：[link](https://lilianweng.github.io/posts/2023-06-23-agent/) | 讲清 Agent 系统常见范式 |
| LLM 做高层规划 | PaLM-E / DIAC / LBYL / EmbodiedGPT | PaLM-E：[link](https://arxiv.org/abs/2303.03378) / DIAC：[link](https://arxiv.org/abs/2204.01691) / LBYL：[link](https://arxiv.org/abs/2311.17842) / EmbodiedGPT：[link](https://arxiv.org/abs/2305.15021) | 用 LLM 做策略/规划或决策 |
| 统一高低层 | RT-2 | [link](https://arxiv.org/abs/2307.15818) | 将语言-视觉与动作更紧密地统一 |
| LLM + Planner | LLM+P / AutoTAMP / Text2Motion | LLM+P：[link](https://arxiv.org/abs/2304.11477) / AutoTAMP：[link](https://arxiv.org/abs/2306.06531) / Text2Motion：[link](https://arxiv.org/abs/2303.12153) | 结合传统规划器提高可执行性 |
| Code 能力 | Code as Policy / Instruction2Act | CaP：[link](https://arxiv.org/abs/2209.07753) / I2A：[link](https://arxiv.org/abs/2305.11176) | 用代码中间层提升可控性 |
| 3D 感知 + LLM | VoxPoser / OmniManip | VoxPoser：[link](https://arxiv.org/abs/2307.05973) / OmniManip：[link](https://arxiv.org/abs/2501.03841) | 3D 表征辅助规划与约束 |
| 多机器人协同 | RoCo / Scalable-Multi-Robot | RoCo：[link](https://arxiv.org/abs/2307.04738) / Scalable：[link](https://arxiv.org/abs/2309.15943) | 多机器人协同规划 |

如果你更关心“离落地更近”的通用策略（而不是纯 LLM 规划），通常会与 VLA / 通用控制模型一起看：

| 更贴近落地的通用策略 | 链接 | 说明 |
|---|---|---|
| OpenVLA | [link](https://openvla.github.io/) / [link](https://arxiv.org/abs/2406.09246) | 通用操控策略代表作之一 |
| Octo | [link](https://octo-models.github.io/) / [link](https://github.com/octo-models/octo) | 强基线与工程化实现较完整 |

**小结**：  
LLM 在机器人里最可靠的定位通常是**高层理解 + 规划 + 工具调用**，与传统规划/约束或 VLA 低层执行配合，系统更可控、更可复现。
