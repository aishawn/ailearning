OpenVE-3M A Large-Scale High-Quality Dataset for Instruction-Guided Video Editing


Global Style,
Background Change, 
Local Change, 
Local Remove, 
Local Add, 
and Subtitles Edit 共 6 类



 3 大主要评测指标：指令遵循、Consistency & Detail Fidelity 和 Visual Quality & Stability，每个指标评分 1-5 分进行打分。
 
最终计算 Qwen3-VL-A3B 模型准确率为 61%，Intern3.5-VL-38B 模型准确率为 66%，Seed1.6-VL 准确率为 70%，Gemini2.5-Pro 准确率为 69%。但是受限于 Seed1.6-VL 和 Gemini2.5-Pro 的 API TPM 的限制，作者最终选用 Intern3.5-VL-38B 模型用于打分并过滤所有得分大于 3 分的视频编辑对



 **OpenVE-Edit 指令跟随视频编辑模型**

  

![](https://pic3.zhimg.com/v2-0c6b84e44d459988f375bf329d28968a_1440w.jpg)

_图 8: OpenVE-Edit 的整体架构。(a) OpenVE-Edit 的架构。(b) [MoE-Connector](https://zhida.zhihu.com/search?content_id=267767010&content_type=Article&match_order=1&q=MoE-Connector&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3NzM5OTgzODIsInEiOiJNb0UtQ29ubmVjdG9yIiwiemhpZGFfc291cmNlIjoiZW50aXR5IiwiY29udGVudF9pZCI6MjY3NzY3MDEwLCJjb250ZW50X3R5cGUiOiJBcnRpY2xlIiwibWF0Y2hfb3JkZXIiOjEsInpkX3Rva2VuIjpudWxsfQ.0e5-PYWoPEfj2rM2FIF-Nc36Wz5IgLSM7Zx7Vh8MAP8&zhida_source=entity) 模块的详细结构。_

  

**OpenVE-Edit 创新点：**

  

- 仅用 T5 特征只能得到字面意思的指令编辑表示而不能获取更高维度的指令与视觉语义空间关系表示。因此，作者将输入原始视频和编辑指令一同输入到多模态大模型中，这使模型能够捕捉更高维度编辑指令和视觉特征之间的语义与空间关系。
- 为了应对多样化视频编辑的各种不同需求，任务异质性在使用单一模型时会导致参数效率低下，因为共享参数会将易受干扰的表征内化，从而导致专业化程度不理想并增加参数数量。因此，基于多任务感知的 MoE-Connector 模块被设计用于同时应对图像和视频不同编辑类型。
- 由于现有的视频生成模型都已经经过大规模的数据预训练，而 MoE-Connector 在训练开始时是随机初始化的。如果它直接输出一堆无意义的「噪声」视觉特征给下游模型，很可能会严重干扰下游模型的稳定状态，导致训练崩溃或收敛缓慢。因此，为了降低训练难度，提高训练效率，受 ControlNet 工作的启发，作者将 MoE-Connector 最后一个 MLP 层初始化权重为全零。并将其输出的特征与原本编辑指令通过 T5 得到的特征在通道维度拼接起来。这样，T5 特征在训练的第 0 步完全不会被新加的模块所影响。