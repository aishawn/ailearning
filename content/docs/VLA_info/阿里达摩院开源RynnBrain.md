# RynnBrain：阿里达摩院具身基础模型，16 项 SOTA

阿里达摩院开源 **RynnBrain**，基于 physical reality 的具身基础模型，在 20 项具身 Benchmark 上全面超越英伟达 Cosmos-reason2、谷歌 Gemini Robotics ER 1.5 等，取得 **16 个 SOTA**。

- **GitHub**：https://github.com/alibaba-damo-academy/RynnBrain  
- **主页**：https://alibaba-damo-academy.github.io/RynnBrain.github.io/  
- **Hugging Face**：https://huggingface.co/collections/Alibaba-DAMO-Academy/rynnbrain

---

## 定位与能力

- 目标不仅是「观测」环境，而是通过**自我中心认知、时空定位与任务规划**将理解锚定于物理世界，从被动观测迈向主动、物理感知的推理与复杂任务执行。
- **模型规格**：已发布 2B、8B 参数模型与 30B MoE 混合专家；专项模型包括 RynnBrain-Plan（操作规划）、RynnBrain-Nav（导航）、RynnBrain-CoP（空间推理）。

---

## 架构与评测

- **架构**：统一编码器-解码器（Dense / MoE），将全视角视觉与文本指令转化为多模态输出（空间轨迹、物理指向、行动规划）；在丰富时空与物理空间数据上训练，兼顾通用能力与具身推理/规划。
- **RynnBrain-Bench**：高维具身理解基准，从物体认知、空间认知、语义定位、指向交互四维评估连续视频中的细粒度理解与时空定位精度。
