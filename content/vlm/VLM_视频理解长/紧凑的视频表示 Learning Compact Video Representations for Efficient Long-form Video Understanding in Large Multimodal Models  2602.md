
# Learning Compact Video Representations for Efficient Long-form Video Understanding in Large Multimodal Models

**Authors:** Yuxiao Chen, Jue Wang, Zhikang Zhang, Jingru Yi, Xu Zhang, Yang Zou, Zhaowei Cai, Jianbo Yuan, Xinyu Li, Hao Yang, Davide Modolo


1) 如何在内存限制下高效处理大量帧；2) 如何从海量输入数据中提取最具辨别力的信息。


基于信息密度的自适应视频采样器（AVS）和一个基于自动编码器的时空视频压缩器（SVC），并将其与多模态大语言模型（MLLM）集成。该系统具有两大优势：
能够自适应地捕捉不同长度视频序列中的核心信息，并在保持关键辨别信息的同时实现高压缩率。


“整体大于部分之和。” —— 亚里士多德


为此，我们提出了一个全面的长视频理解方案：

1. **自适应视频采样器（AVS）**：基于信息密度选择帧。
    
2. **基于自动编码器的时空视频压缩器（SVC）**：仅需视频数据即可训练，实现 64 倍压缩。
    
3. **MLLM 集成**：与采样器和压缩器无缝结合。


- VideoAgent、LLoVi 等多阶段方法。由于 AVS 高效过滤冗余和 SVC 保留长时空信息，我们的端到端方法避免了误差传播。
    
- **与 SoTA MLLM 对比**：尽管只使用了部分 SFT 数据，我们的模型在多个基准上达到了顶尖水平。值得注意的是，在处理 EgoSchema 时，我们的模型平均仅需 1,440 个视觉 token，远少于 LLaVA-OV 的约 6,000 个，证明了极高的计算效率。