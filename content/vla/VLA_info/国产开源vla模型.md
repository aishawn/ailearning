# 六大国产开源VLA大模型

---

## 一、宇树开源 UnifoLM-VLA-0

UnifoLM-VLA-0 是宇树科技开源的通用视觉-语言-动作（VLA）大模型，基于 Qwen2.5-VL-7B 架构进行持续预训练，核心在于将强大的视觉语言理解能力，精准地投射到物理动作上。

**硬核性能：**

- 能通过自然语言指令控制人形机器人完成复杂操作任务，包括整理物品、叠毛巾、分拣水果、工具归位、擦拭桌面等 12 类多步骤长程任务
- 模型深度融合 2D/3D 空间感知与轨迹预测，具备极强的空间推理能力；在 LIBERO 仿真基准测试中，平均准确率高达 **98.7%**
- 能准确理解「将左边的积木块叠到红色积木上」这类空间关系指令，并规划出合理的抓取路径

> 参考：[Unitree Robotics Open-Sources Multimodal Vision-Language-Action Model: UnifoLM-VLA-0 - Pandaily](https://pandaily.com/)

**开源地址：** <https://github.com/unitreerobotics/unifolm-vla>

---

## 二、小米开源 Xiaomi-Robotics-0

小米机器人团队开源了阶段性研究成果 **Xiaomi-Robotics-0**，拥有 47 亿参数的 VLA 模型，基于 Qwen3-VL 架构研发。主要提升机器人的通用感知与实时执行能力，最突出的贡献在于解决推理延迟导致的动作卡顿。

**核心特点：**

- 采用「大脑+小脑」的 MoT 混合架构：Qwen3-VL 作为「大脑」理解指令，Diffusion Transformer 作为「小脑」生成高频动作块
- 支持推理与执行并行，边想边做，消除延迟卡顿，保障动作连贯流畅
- 支持双手配合完成积木拆解、毛巾折叠等复杂长周期任务

> 参考：Xiaomi announces Xiaomi-Robotics-0, its first-generation robot large-scale model

**开源地址：** <https://github.com/XiaomiRobotics/Xiaomi-Robotics-0>

---

## 三、阿里达摩院开源 RynnBrain

首次赋予机器人**时空记忆**和**物理空间推理**能力，在 16 项具身开源评测中刷新纪录，超越谷歌 Gemini Robotics ER 1.5 等顶尖模型。

**核心能力：**

- 基于 Qwen3-VL 训练，能在完整历史记忆中定位物体、预测轨迹；执行 A 任务被中断后转做 B 任务，仍可自动续接 A 任务，并记得当时的时间与空间状态
- 一次开源 7 个全系列模型，包括业界首个 **30B MoE 架构**具身模型，仅需 3B 激活参数即可高效推理
- 支持环境感知、对象推理、第一人称视觉问答、空间推理与轨迹预测等 16 项具身能力

> 参考：阿里推 RynnBrain，助機器人擁時空記憶／空間推理力 | TechNews 科技新報

**开源地址：** <https://github.com/alibaba-damo-academy/RynnBrain>

---

## 四、星海图开源 VLA G0 Tiny

G0 Tiny 是星海图开源的**面向端侧部署**的具身智能应用模型，在仅 **250M** 参数规模下，保留完整视觉与语言理解能力，实现「小模型、全能力」的高效设计。

**核心特点：**

- 首个开源端侧部署 VLA 模型，提供 R1 Pro 开箱即用的物品传递体验，支持「万物抓取」与「衣物折叠」等高泛化操作
- 几条命令即可 5 分钟内完成部署，支持 TensorRT 量化部署，在 NVIDIA Orin 平台实现端侧 **10Hz 实时推理**

> 参考：G0Plus Overview

**开源地址：** <https://github.com/OpenGalaxea/GalaxeaVLA>

---

## 五、自变量开源 WALL-OSS

自变量机器人开源的 **WALL-OSS** 仅用 **4.2B** 参数击碎「模态统一、动作精度、能力泛化」不可能三角，是唯一具备语言、视觉、动作多模态**端到端统一输出**能力的开源具身模型。

**架构与能力：**

- 首创「共享注意力+专家分流」架构，将语言、视觉、动作统一在同一表示空间处理，避免知识遗忘并保留各模态表达能力
- 两阶段训练策略与统一跨层级思维链，具备内生高级推理能力；面对未见任务时可自主拆解步骤、逐步思考

**开源地址：** <https://github.com/X-Square-Robot/wall-x>

---

## 六、千寻开源 Spirit v1.5

千寻智能开源的 **Spirit v1.5** 在机器人「全球统考」RoboChallenge 真机评测中，以总分 **66.09** 超越美国 pi 0.5，登顶第一。

**训练与表现：**

- 预训练阶段大量使用多样互联网视频，建立对真实物理世界的广泛认知，再以高质量遥操作数据微调
- 抗干扰与泛化能力突出，在多任务连续执行、复杂指令拆解及跨构型迁移等维度表现稳定

**开源地址：** <https://github.com/Spirit-AI-Team/spirit-v1.5>

---
