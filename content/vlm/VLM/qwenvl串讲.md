- **Qwen-VL** → 打基础（理解+定位+OCR）
- **Qwen2-VL** → 动态分辨率+位置编码统一（任意分辨率看世界）
- **Qwen2.5-VL** → 长视频+文档+Agent（实用落地）
- **Qwen3-VL** → 超长上下文+MoE+顶尖推理（当前 SOTA 级）


### 1. **Qwen-VL（2023 年首代）**

**论文标题**：Qwen-VL: A Versatile Vision-Language Model for Understanding, Localization, Text Reading, and Beyond **arXiv**：[https://arxiv.org/abs/2308.12966](https://arxiv.org/abs/2308.12966)（2023 年 8 月提交，10 月 v3） **作者**：Jinze Bai、Shuai Bai 等（Qwen 团队）

这是系列开山之作。基于 Qwen-LM 语言模型，新增视觉接收器（Visual Receptor）、输入输出接口、**3 阶段训练 pipeline**（预训练-多模态对齐-指令微调），并用多语言多模态清洗语料训练。 **核心创新**：通过 image-caption-box 三元组对齐，让模型首次原生支持 **visual grounding（目标定位）** 和 **OCR/文本阅读**，不再只是“看图说话”。 **亮点**：在同规模通用模型中，图像描述、问答、grounding 等基准上创下新纪录；Qwen-VL-Chat 在真实对话场景也优于当时主流视觉聊天机器人。 模型主要规模：7B 左右，开启了 Qwen 开源 VLM 路线。

### 2. **Qwen2-VL（2024 年二代）**

**论文标题**：Qwen2-VL: Enhancing Vision-Language Model’s Perception of the World at Any Resolution **arXiv**：[https://arxiv.org/abs/2409.12191](https://arxiv.org/abs/2409.12191)（2024 年 9 月提交） **作者**：Peng Wang、Shuai Bai 等

**最大突破**：彻底抛弃传统“固定分辨率”处理，提出 **Naive Dynamic Resolution**（朴素动态分辨率）机制——图像根据内容自动拆成不同数量的视觉 token，接近人类视觉方式。 同时引入 **Multimodal Rotary Position Embedding（M-RoPE）**，实现文本、图像、视频位置信息的统一融合；图像和视频采用完全一致的处理范式。 **还首次探讨了 LVLMs 的 scaling law**，推出 2B / 8B / 72B 三种规模。 **性能**：72B 版本在多模态基准上已接近 GPT-4o 和 Claude 3.5 Sonnet，超越当时其他开源通用模型。 这代开始真正“看清世界任意分辨率”，为后续长视频和 Agent 打下基础。

### 3. **Qwen2.5-VL（2025 年二点五代）**

**论文标题**：Qwen2.5-VL Technical Report **arXiv**：[https://arxiv.org/abs/2502.13923](https://arxiv.org/abs/2502.13923)（2025 年 2 月提交） **作者**：Shuai Bai、Keqin Chen 等

在 Qwen2-VL 基础上继续大升级，重点解决“精细感知 + 长时序 + Agent”问题。 **核心创新**：

- 动态分辨率 + **绝对时间编码（Absolute Time Encoding）**，支持小时级长视频，并实现秒级事件定位；
- 从零训练 **原生动态分辨率 ViT + Window Attention**，大幅降低计算开销，同时保持原生分辨率；
- 精确对象定位（支持 bounding box / point / JSON 格式）、全文档解析（发票、表格、图表、手写、化学式等）、结构化数据提取。

模型推出三种规模（3B / 7B / 72B），**72B 在文档、图表理解上匹敌 GPT-4o**，还能作为视觉 Agent 操作电脑/手机（推理 + 工具调用 + 执行）。同时保留了 Qwen2.5 LLM 的纯文本能力。 这代真正让模型“会看、会定位、会读文档、会看长视频、能当 Agent”。

### 4. **Qwen3-VL（2025 年三代，当前最强）**

**论文标题**：Qwen3-VL Technical Report **arXiv**：[https://arxiv.org/abs/2511.21631](https://arxiv.org/abs/2511.21631)（2025 年 11 月提交） **作者**：Shuai Bai 等（超长作者列表）

目前系列最强版本，被官方称为“Qwen 系列迄今最强视觉语言模型”。 **三大核心支柱**：

1. 纯文本理解大幅增强（甚至超越同规模纯 LLM）；
2. 原生支持 **256K 超长上下文**（文本+图像+视频交织），能跨文档/视频做精准检索和交叉引用；
3. 高级多模态推理（单图、多图、视频），在 MMMU、MathVista、MathVision 等复杂基准领先。

**架构三大升级**：

- 增强型 **interleaved-MRoPE**（空间-时间建模更强）；
- **DeepStack**（多层 ViT 特征融合，提升视觉-语言对齐）；
- **文本-based 时间对齐**（从 T-RoPE 进化到显式时间戳对齐，视频时间 grounding 更精准）。

模型家族同时提供 **dense（2B/4B/8B/32B）** 和 **MoE（30B-A3B / 235B-A22B）** 版本，满足不同延迟-质量需求。 官方愿景：作为图像 grounding 推理、Agent 决策、多模态代码智能的基础引擎。