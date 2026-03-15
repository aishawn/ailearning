MTP： muti-token prediction
[1] 训练早期收敛更快
输入: x1 x2 x3  
输出: x4 x5 x6 x7
[2] 增加多个 MTP Head

MTP **不是直接一次生成 4 token**。

而是用于 **推测解码（Speculative Decoding）**
[1]主模型生成候选
[2]主模型再验证：真实概率是否合理; 否则：回退

理论加速：

speed ≈ K 倍

实际：

2x ~ 3x


# 为什么 DeepSeek 特别适合 MTP？

因为：

DeepSeek 是 **MoE**

MoE 推理：

GPU利用率低

MTP：

一次 forward 多 token

**大幅提高 GPU 利用率**