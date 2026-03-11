用 LLM 作为视觉 encoder，  
解决 CLIP encoder 的目标错配问题，  
让小规模 VLM 也能拥有强视觉理解能力。


Penguin-VL: Exploring the Efficiency Limits of VLM with LLM-based Vision Encoders（arXiv: 2603.06569，2026年3月6日发布，腾讯AI Lab出品）核心是在当前VLM（Vision-Language Model）普遍追求“更大模型+更多数据”的趋势下，提出了一种不同的效率路径：不靠scale模型，而是重新设计视觉编码器（Vision Encoder），把效率极限往小模型方向推。



代码已开源：https://github.com/tencent-ailab/Penguin-VL 模型在HuggingFace上也能直接下：Penguin-VL-2B / Penguin-VL-8B / Penguin-Encoder



### Penguin-VL 的核心创新：Penguin-Encoder

他们把视觉编码器的起点从“对比预训练ViT”改成了**“纯文本预训练LLM”**。

具体改造步骤：

1. 拿一个小的文本LLM（用了Qwen3-0.6B）
2. 把causal attention改成**bidirectional attention**（双向自注意力，让它能全局看图）
3. 加入**2D-RoPE**（二维旋转位置编码，支持任意分辨率图像）
4. 图像patch化后直接输入这个改造过的LLM，得到视觉token

这个视觉编码器被称为 **Penguin-Encoder**。

然后用混合监督（mixed supervision）继续预训练：

- 重建损失（reconstruction loss，帮助保留结构信息）
- 语言建模损失（language modeling loss，对齐到文本空间）

这样视觉编码器从一开始就带有很强的**语言先验**，token空间天然和LLM更接近，后续对齐成本更低，也更容易保留细粒度信息。