提出一种超紧凑离散 tokenizer，仅用 8 个 token 表示环境状态，从而实现高效的世界模型规划。



**《Planning in 8 Tokens: A Compact Discrete Tokenizer for Latent World Model》论文解读** （arXiv: 2603.05438，2026年3月5日提交；已被CVPR 2026接收）

作者：Dongwon Kim (KAIST)，Gawon Seo、Jinsung Lee、Minsu Cho、Suha Kwak (POSTECH 等) 项目页：[https://kdwonn.github.io/CompACT](https://kdwonn.github.io/CompACT) GitHub：[https://github.com/kdwonn/CompACT](https://github.com/kdwonn/CompACT)（含训练代码、预训练tokenizer、世界模型checkpoint）

一句话总结： 这篇工作把视觉观测压缩到**极致8个离散token**（约128 bits/图像），构建action-conditioned latent world model，实现规划速度**提升40–80倍**，而在导航、机器人操控等任务上规划性能基本持平甚至略优，是世界模型向实时具身智能部署的实用一步。

### 1. 核心问题与动机

当前主流latent world model（如DreamerV3、GAIA-1、Sora-style视频世界模型、RT-X等）在规划阶段（model-based RL或search-based planning）面临巨大瓶颈：

- 典型tokenizer（如VQ-VAE、VQ-GAN、MAGVIT-v2）把一张图像压缩到**几十到几百个token**（e.g. 32×32 patch → 数百token）
- Transformer-based dynamics model在autoregressive rollout时，每步预测都要处理长序列 → **计算量爆炸**
- 结果：即使在简单导航任务上，规划一次（e.g. 20–50步lookahead）也要几秒到几十秒，无法实时机器人控制

目标：能否把**单帧视觉信息极致压缩**，让dynamics model序列极短，从而让planning（MCTS、CEM、iLQR等）速度提升1–2个数量级，同时不牺牲关键的规划所需信息（物体存在、相对位置、大致布局、语义类别等）？

### 2. 核心贡献：CompACT Tokenizer

提出**CompACT**（Compact Action-Conditioned Tokenizer？论文中直接叫CompACT），一个专门为**planning-oriented latent world model**设计的极致压缩离散tokenizer。

关键设计：

- 输入：RGB图像（通常224×224或256×256）
- 输出：**8个离散token**（每个token从codebook中索引，codebook size通常4096–16384，token embedding dim 256–512）
- 总信息量 ≈ **8 × log₂(16384) ≈ 8×14 = 112–128 bits**（对比原图像几MB，压缩比极高）

如何做到只用8个token却保留规划所需信息？

- **两阶段量化 + 语义优先**：
    1. 先用强的视觉backbone（DINOv2 / SigLIP / CLIP等）提取高维特征图
    2. 设计**层次化 + 全局注意力**的量化头：强制模型先捕捉**最全局、最语义、最具规划价值的信息**（物体中心、主要方向、大类布局），再逐步填充细节
    3. 采用**commitment loss + codebook reset + EMA更新**的强正则VQ机制，避免codebook崩溃
    4. 显式加入**action-conditioned reconstruction**辅助任务，让tokenizer学到对动作敏感的表征（这点很重要，后续dynamics能更好预测）
- 实验验证：即使压缩到8 token，rFID（reconstruction FID）仍可接受；进一步ablation显示，**8 token版本在规划任务上居然优于64 token的传统tokenizer**（因为序列更短，优化更稳定，overfitting更少）。

### 3. Latent World Model构建

在CompACT token序列上训练**action-conditioned discrete autoregressive world model**（类似Llama，但输入是[obs_t tokens (8个) + action_t] → predict obs_{t+1} tokens）。

- 序列长度极短：每步只有8（obs）+1（action）个token
- Rollout 50步也才 ~450 token，Transformer inference极快
- 训练数据：大量机器人/导航轨迹（Bridge、Open X-Embodiment、D4RL等），或合成环境（ProcTHOR、Habitat等）

规划方式：

- 测试中主要用**CEM**（Cross-Entropy Method）和**MCTS**（少量实验）
- 由于序列短，**可做更深的搜索**（depth 30–50）或**更多采样**（particles 1000+），在相同墙时内完成更高质量规划

### 4. 实验结果亮点（硬核数据）

- **规划速度**：在相同硬件下，CompACT-based planner比基线（64–256 token的Dreamer-style或VQ世界模型）快**40–80×**（部分任务wall-time从10s+降到<200ms）
- **成功率**：
    - Navigation (Habitat / Gibson)：成功率持平或+2–5%
    - Robotic manipulation (Bridge / RT-1风格任务)：pick-and-place成功率基本持平，部分长horizon任务略胜
    - 极端压缩ablation：从64→32→16→8 token，规划性能先降后升（8 token居然最好），说明**极致压缩迫使模型聚焦最关键信息，反而泛化更好**
- 定性：重建图像当然很模糊（只有8 token），但**物体位置、朝向、大类语义、主要可达区域**保留得很好，正好是planning最需要的。

### 5. 为什么有效？论文的核心洞见

- Planning不需要photorealistic重建，只需要**粗粒度的世界几何 + 语义 + 动作影响**
- 传统tokenizer追求高保真重建 → 浪费容量在纹理、光影、背景细节上
- CompACT强制“先全局语义，后局部”，天然偏向规划所需表征
- 极短序列让dynamics model训练更稳定、rollout更可靠、search更深

### 6. 局限与展望

- 目前主要在**离散动作空间**（navigation、block manipulation）验证，连续控制（如MuJoCo dexterous）待扩展
- 重建质量低 → 不适合需要视觉美观的生成任务（但这不是目标）
- Tokenizer训练仍需大量无标注视频/轨迹（但比标注action的RL数据容易获取）

一句话定位： CompACT是世界模型tokenizer的一次**极端但务实**的压缩实验，证明**“规划用不了那么多token”**，为实时model-based机器人控制打开了一扇门。推荐所有做具身智能、世界模型、model-based RL的研究者阅读+复现！