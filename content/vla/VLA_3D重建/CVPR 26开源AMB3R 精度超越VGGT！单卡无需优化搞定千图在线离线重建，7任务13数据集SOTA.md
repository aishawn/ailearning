在3D视觉领域，基于点图（Pointmap）的3D大模型正展现出颠覆性的潜力。然而，现有的多视角Transformer模型往往面临两大痛点：一是缺乏显式的空间几何推理；二是计算复杂度随图像数量呈二次方增长，面对大规模的图像序列时往往力不从心。

为了解决这一问题，在最新工作AMB3R中，作者团队受经典密集重建框架的启发，为神经网络引入了一个稀疏但紧致的3D后端，赋予了模型强大的3D显式几何推理能力。同时根据基于pointmap大模型的特性，作者团队还提出了AMB3R-VO和AMB3R-SfM两个无需训练，无需优化的即插即用框架，打破了3D大模型序列长度的桎梏。

**标题**：`AMB3R: Accurate Feed-forward Metric-scale 3D Reconstruction with Backend`  
**作者**：`Hengyi Wang, Lourdes Agapito`  
**单位**：`Department of Computer Science,University College London`  
**主页**：`https://hengyiwang.github.io/projects/amber`


### 主要贡献

1. 稀疏体素后端：AMB3R (Base model) 引入了一个稀疏且紧凑的体积场景表示作为神经网络后端，赋予了基于 pointmap 的网络在紧凑 3D 空间中进行显式几何推理的能力
    
2. 轻量真实尺度还原：设计了一个轻量级的尺度头，来从特征中恢复场景在真实世界中的物理尺寸
    
3. 超低训练成本：利用VGGT的权重作为初始化，AMB3R 中的后端以及尺度头的训练总计仅需约80个H100 GPU小时
    
4. 无缝扩展千图级VO/SfM：提出**AMB3R-VO** 和 **AMB3R-SfM** 两个无需训练，与模型无关的框架。它们可以搭配任意 VGGT 类型的 3D 大模型，实现处理任意长度序列的视觉里程计（VO）和运动恢复结构（SfM）
    

## 方法深度解析

### AMB3R (Base model)：实现3D显示几何推理

**1. 后端：稀疏体素表示引入**

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/4d39382b2c08c6c9.jpeg)

AMB3R 整体采用了冻结的 VGGT 作为前端来输出 pointmap 及其对应的特征 。其最核心的突破在于其**后端网络**的处理流程：

1. **体素化与序列化**：首先将 pointmap 和特征平均聚合成一个稀疏体素网格（Sparse voxel grid）。随后，通过空间填充曲线（Space-filling curves）将这些稀疏体素序列化为一维特征序列。
    
2. **Transformer特征融合**：利用 Transformer 高效地在紧凑的体素空间中处理这些一维序列特征，随后利用 KNN 插值将处理后的特征重新映射回 2D 视角。
    
3. **零卷积（Zero-convolution）特征回传**：通过零卷积将融合后的特征重新注入冻结的前端解码器（Decoder）中 。这样不仅完美复用了预训练权重，还保留了前端学习到的置信度，从而将后端的训练开销大幅压缩至约 50 H100 小时 。
    

**2. 轻量尺度头：告别全局拟合，解耦尺度预测**

为了还原预测与真实场景的尺度差，以往的方法往往尝试直接拟合全局尺度差。但这需要聚合所有帧的 decoder 特征，容易导致训练困难且极易过拟合 。AMB3R 采取了另一种的解耦策略：

1. **寻找预测目标**：找到每帧预测深度中位数所对应的像素
    
2. **独立拟合**：对每帧仅回归该像素对应的真实度量深度。由于这个深度是输入图片本身的固有属性，不依赖模型的全局几何预测，且每帧都可以用 encoder 特征独立还原，大幅降低了训练难度 。
    
3. **测试推理**：在推理时，利用每帧中位数深度对应的真实尺度深度预测来还原尺度差，通过所有帧尺度差的中位数进而得出鲁棒的真实全局尺度 。
    

### AMB3R-VO：打破二次复杂度限制的视觉里程计

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/edb61235467f38aa.png)

多视图Transformer面临着计算复杂度随图像数量呈二次方增长的致命缺陷 。以往的方法（如VGGT-SLAM）通常采用滑动重叠子图，并使用 Kabsch 算法对齐不同子图的坐标系 。但Kabsch对齐会引入显著误差（漂移），导致其严重依赖基于 BA（Bundle Adjustment）的后端优化。

AMB3R团队发现：**基于 pointmap 的模型输出自带“第一帧坐标系”的先验** 。因此，根本无需进行极易产生漂移的 Kabsch 相对变换对齐，只需估计尺度即可 ！基于此，团队提出了 AMB3R-VO，其核心机制在于**关键帧选取与混合内存（Hybrid Memory）**：

- **局部与全局内存**：维护一个包含少量关键帧的 Active memory（与新帧共同作为网络输入），以及一个存储全局显式几何信息的 Global memory。
    
- **稳定的坐标对齐**：预测后，若新 map 坐标系非第一帧，则根据 Active memory 中的第一帧对应全局地图位姿将全局地图转换到新map的坐标系中，对齐尺度差。之后，算出全局和新map对应关键帧的置信度加权相对位姿，将新 map 映射回全局坐标系 。最后以加权平均的方式更新 Global memory。
    
- **帧率恒定不掉速**：只有 Active memory 中的关键帧会作为模型输入。当 Active memory 满时，会根据最新关键帧从全局历史中重采样（甚至包含闭环的后向搜索） 。这使得 **AMB3R-VO 成功逃脱了二次复杂度的诅咒。**
    

一个直观的总结是：

1. 相比VGGT-SLAM这种滑动重叠子图的方式，AMB3R-VO的重叠帧永远是那组精选的关键帧（显著减少 drift）
    
2. AMB3R-VO并没有使用Kabsch估计相对变换，而是通过预测出的pose和置信度直接加权
    
3. 混合内存策略令AMB3R-VO可以逃脱二次复杂度的诅咒，帧率并不随视频长度改变，同时全局的显式几何保证了全局一致性
    

### AMB3R-SfM：分治策略征服无序图像集

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/5890d0db2b8d1230.png)

AMB3R-SfM整体是遵循AMB3R-VO的memory设计，并额外提出了一个分治策略来针对大规模的无序图片集的重建，整体思路如下：

1. **图片聚类 (Image Clustering)** ：利用 encoder 特征构建相似度矩阵，并通过 FPS (Farthest Point Sampling) 算法进行聚类，确保每个 Cluster 图像数量适中 。
    
2. **粗配准 (Coarse Registration)** ：选取置信度最高的 Cluster 进行初始化。随后，利用特征相似度选取 Top-k clusters 与关键帧一起预测。若全局关键帧过多，则会根据位姿距离打散为小 cluster 辅助后续匹配，始终保留置信度最高的那组cluster预测结果更新地图。
    
3. **全局预测优化 (Global Mapping)** ：为了提升精度，对关键帧根据置信度和位姿距离执行 BFS（广度优先搜索），依次预测并更新全局地图。最后，对每个非关键帧选取 Top-k 关键帧再次预测更新。 AMB3R-SfM整个过程都无需任何传统的非线性优化！
    

## 实验

AMB3R作者团队在 **13个涵盖室内、室外、静态与动态场景的公开数据集上，对模型进行了多达8项3D视觉任务的全面评估** 。结果显示，无论是作为一个基础网络，还是作为 VO/SfM 的前馈框架，AMB3R 都展现出了极优秀的性能。整体实验所用的数据和代码也已一并开源。

### 单目估计

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/0a657db3e16304f4.png)

### 相机位姿估计

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/35502cdfcb320ffb.png)

### 多视角深度估计

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/a563b737de29cb95.png)

### 多视角真实尺度深度估计

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/21c131a1806af1b3.png)

### 3D重建

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/d61c45f78629909c.png)

### 动态重建

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/7984baef503db2f9.png)

### 视觉里程计/SLAM （在线重建）

其中这里在7scenes上，amb3r-vo的性能甚至超越了7scenes数据集原本的pseudo GT。

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/d704af79815a7cd7.png)

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/cd2d8eca84ac3f87.png)

### 运动恢复结构 （SfM）

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/4ddd70dafc4e03ac.png)

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/bcbf40eac56000f2.png)

## 总结

AMB3R 成功地将稀疏且紧凑的体积场景表示融合到了前馈模型的后端之中 。事实证明，这种空间紧凑性可以显著提升在位姿估计，深度估计、3D 重建等众多核心 3D 视觉任务上的表现。同时AMB3R-VO和AMB3R-SfM这两个即插即用的框架也成功的突破了3D大模型二次复杂度的限制，实现了单卡千图以上VO/SfM的同时无需任何优化模块。这无疑为构建一个真正可扩展、大一统且具备高度泛化能力的前馈 3D 感知系统迈出了重要的一步 。