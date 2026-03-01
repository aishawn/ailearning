# VLA 后新趋势：VAM 视频动作模型 6 篇汇总

2025 年底至 2026 年初，用**视频生成模型**做机器人控制的 **VAM（Video Action Model）** 方向兴起。VAM 与 VLA 的核心区别：VLA 需从机器人数据中学习物理规律，数据需求大；VAM 将「世界理解」放在视频生成模型中，只需学习**两帧变化对应的动作**，数据需求相对更低。英伟达称类似技术为 **WAM（World Action Model）**，内核一致。

---

## 两大流派

**流派一：先想象，再模仿（Explicit Video Generation）**  
先生成完整未来视频，再转化为动作。代表：**LVP**、**1XWM**。

**流派二：借脑 / 联合策略（Internal Representation / Joint Policy）**  
不必然生成完整视频，利用视频模型内部表示或与动作联合生成。代表：**Video Policy**、**Cosmos Policy**、**mimic-video**、**DreamZero**。

---

## 六篇方法简表

| 方法 | 核心角色 | 如何得到动作 | 是否生成完整视频 | 数据量 | 亮点 |
|------|----------|--------------|------------------|--------|------|
| **Video Policy** | 视频 U-Net + 动作 U-Net | 视频中间层特征→动作网络 | 是 | 少（~50 demos） | 联合去噪，可用无动作视频训视频模型 |
| **LVP** | 14B 视频生成→视觉流水线 | 视频→HaMeR/MegaSAM→重定向 | 是 | 少（生成动作阶段免训练） | 互联网视频，零样本泛化强；多步误差累积 |
| **1XWM** | 世界模型 + IDM | 生成帧→IDM→动作 | 是 | 多（自家 NEO 数据） | 为特定硬件打造，物理一致性与模拟器合一 |
| **mimic-video** | 视频 backbone + 动作解码器 | 中间层 latent→解码器→动作 | 否（部分去噪即可） | 少 | 效率高，省 10 倍数据 |
| **Cosmos Policy** | 单一 Transformer | 潜在注入，动作作 token 与视频同生成 | 是 | 多（含价值信号） | 策略+世界模型+价值三合一，Best-of-N 规划 |
| **DreamZero** | 14B 自回归 DiT（WAM） | 视频与动作联合去噪、自回归生成 | 是 | 少（强调多样非重复） | 7Hz 实时；KV 回灌闭环修正；大模型碾压小模型 |

---

## 从视频到动作的三种方式

1. **显式提取+重定向**（LVP）：CV 工具 3D 手部重建→MegaSAM 平滑→重定向到机器人。  
2. **独立 IDM/动作头**（Video Policy、1XWM、mimic-video）：用生成帧或中间特征训练逆动力学或小动作网络。  
3. **统一生成**（Cosmos Policy、DreamZero）：动作作为 token 或与视频潜变量一起去噪/流匹配，同一模型端到端输出。

---

## 局限性

- **算力与实时性**：VAM 需一定程度的视频推理，对算力要求高；DreamZero 通过优化达到 7Hz，仍依赖高端 GPU。  
- **物理真实性**：视频模型是否真正学到物理规律，还是仅模仿画面，会直接影响控制误差；未来需依赖视频 scaling、涌现，以及视频 CoT、RL 等（如 Jim Fan「第二种预训练范式」所述）。

VAM 采用的 **next physical state prediction** 范式，有望成为继 VLA 之后的重要技术路线，与 next token prediction 带来 LLM 爆发类似，推动具身智能的下一阶段。
