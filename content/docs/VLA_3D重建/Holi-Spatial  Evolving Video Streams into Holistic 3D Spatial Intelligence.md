
视频转3D


**《Holi-Spatial: Evolving Video Streams into Holistic 3D Spatial Intelligence》论文解读**（arXiv: 2603.07660，2026年3月8日提交）

这篇论文来自上海人工智能实验室、北理工、西交大、南洋理工等多机构合作（第一作者及共同一作：Yuanyuan Gao、Hao Li、Yifei Liu 等；通讯作者：Dingwen Zhang、Zhihang Zhong）。核心目标是解决**空间智能（Spatial Intelligence）**训练数据稀缺的问题：现有数据集依赖少量人工标注的3D扫描（如ScanNet仅几千个场景、50类语义），无法规模化，且存在领域差距。论文提出**Holi-Spatial**——全球首个**全自动化、无需人工干预**的视频流到 holistic 3D 空间智能的端到端数据构建流水线，并基于此打造了**Holi-Spatial-4M** 大规模数据集（约12K场景、超400万标注）。

### 1. 核心贡献（论文亮点）

- **全自动化流水线**：从任意原始视频（无需RGB-D传感器）直接生成高保真3DGS重建 + 多层级空间标注（几何、物体级、关系级 + 空间QA）。
- **Holi-Spatial-4M数据集**：12K优化3DGS场景、130万2D掩码、32万3D包围盒、32万实例描述、120万3D grounding实例、120万空间QA对。支持从几何重建到复杂空间推理的全链路监督。
- **质量碾压**：在ScanNet、ScanNet++、DL3DV上，深度估计F1提升0.5、3D检测AP50提升64%，远超现有per-scene优化或feed-forward方法。
- **VLM赋能**：用该数据集微调Vision-Language Model后，空间推理任务大幅提升（如MMSI-Bench +1.5%、MindCube +19.7%、ScanNet++ grounding AP50 +14.48%）。

项目官网：[https://visionary-laboratory.github.io/holi-spatial/](https://visionary-laboratory.github.io/holi-spatial/) GitHub（代码+模型）：[https://github.com/Visionary-Laboratory/holi-spatial](https://github.com/Visionary-Laboratory/holi-spatial)

### 2. 方法：三阶段全自动化流水线（核心创新）

论文设计了**Geometric Optimization → Image-level Perception → Scene-level Refinement** 三阶段闭环，无需人工标注，全部靠现有SOTA模型+一致性约束驱动。

**阶段1：几何优化（Geometric Optimization）**

- 输入原始视频 → SfM（Structure-from-Motion）恢复相机内参/外参。
- 用Depth-Anything-V3提供单目深度先验初始化稠密点云。
- 采用**3D Gaussian Splatting (3DGS)** 进行场景优化，同时加入多视角深度一致性正则化（消除浮动物/ghosting）。
- 输出：干净的3DGS表示 + 多视角一致的深度图渲染。

**阶段2：图像级感知（Image-level Perception）**

- 采样关键帧，**Gemini-3-Pro** 生成动态类标签记忆库（保证跨帧语义一致性）。
- 用记忆库提示**SAM3** 进行开放词汇实例分割，得到2D掩码。
- 2D→3D提升：通过深度图反投影（公式： P=Dt(u)⋅K−1u~ \mathbf{P} = D_t(\mathbf{u}) \cdot \mathbf{K}^{-1} \tilde{\mathbf{u}} P=Dt​(u)⋅K−1u~ 其中 Dt D_t Dt​ 为深度图，K \mathbf{K} K 为内参）。
- 后处理：掩码腐蚀 + 网格引导深度过滤 + 地板对齐OBB（用PCA回退对齐yaw轴）。

**阶段3：场景级精炼（Scene-level Refinement）**

- 多视角合并：同类物体按3D IoU > 0.2聚类，保留最高置信度实例。
- 置信度过滤 + VLM验证（0.8~0.9区间用Qwen3-VL-30B放大+重分割验证）。
- 实例描述：选最佳视角，用Qwen3-VL-30B生成自然语言caption。
- 空间QA自动生成：模板驱动，覆盖**相机中心**（运动方向、距离）和**物体中心**（相对位置、尺寸对比、语义关系）三大类推理。

关键创新：**多视图一致性 + VLM作为“自动标注引擎”**，形成正向数据飞轮，彻底摆脱人工标注和领域限制。

### 3. 数据集：Holi-Spatial-4M（规模与质量）

- **来源**：ScanNet、ScanNet++、DL3DV-10K等公开视频。
- **统计**（超4M标注）：
    - 12K优化3DGS场景
    - 1.3M 2D实例掩码
    - 32万3D bounding boxes + 32万实例caption
    - 120万3D grounding实例
    - 120万空间QA对（几何/关系/语义多任务）
- **开放词汇**：支持任意类别（不限于50类固定标签）。
- **质量控制**：多视图合并、置信度过滤、几何正则化，保证标注比人工ScanNet标签更锐利、遮挡处理更好。

项目页提供交互可视化：可旋转对比Holi-Spatial vs Ground Truth / SpatialLLM / LLaVA-3D的3D网格，同步播放视频+深度+grounding；还有空间QA实时演示（“相机向前移动了0.94米？”“桌子比篮球长吗？”等）。

### 4. 实验结果（硬核对比）

**A. 数据构建质量评估**（Table 2）

- 深度F1：ScanNet 0.98、ScanNet++ 0.89（M3-Spatial仅0.39/0.23）
- 2D分割IoU：ScanNet++ 0.64（SA2VA仅0.25）
- 3D检测AP50：ScanNet++ 70.05（LLaVA-3D仅4.80），提升巨大
- 定性：深度图更干净、无浮动物，掩码边界更锐利，OBB更紧凑。

**B. VLM微调提升**（Tables 3-4）

- MMSI-Bench：Qwen3-VL-8B + Holi-Spatial = 32.6（基线31.1）
- MindCube：49.1（基线29.4）
- ScanNet++ 3D Grounding AP50：27.98（基线13.50，+107%相对提升）

消融实验证明：多视图合并 + VLM验证 + 地板对齐是性能关键。

### 5. 结论与展望

Holi-Spatial证明了**“视频流 → 自动化3D空间智能”**的可行性，彻底打破了人工标注瓶颈，为机器人、AR/VR、具身智能提供了海量高质量训练数据。未来工作可能扩展到动态场景、更大规模视频流、或端到端视频-3D联合建模。

**一句话总结**：这不是又一个3D数据集，而是**把互联网上海量视频变成“活的3D大脑”**的自动化工厂，质量和规模都实现了质的飞跃，强烈推荐空间智能/3D VLM/具身AI研究者立刻下载试用！