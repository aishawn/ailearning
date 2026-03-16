一个开源项目 UniVid，提出了一个「融合」方向：把理解 + 生成融为一体 —— 他们希望用一个统一的模型，兼顾「看懂视频」+「生成视频」的能力。

- 论文标题：UniVid: The Open-Source Unified Video Model
    
- 论文地址：https://arxiv.org/abs/2509.24200
    

  

UniVid 想解决什么问题？

  

UniVid 尝试把视频「理解」与「生成」融合为一体，构建出一个真正通用的统一视频模型（Unified Video Model），一个既能「理解」又能「生成」的视频多模态模型。

  

核心创新

1.统一结构：Adapter-based Unified Architecture

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/f995f9bf3c1e61cf.png)

  

在传统方案中，理解模型和生成模型是完全分开的系统，训练开销大、互通困难。要把它们融合，需要重新训练一个庞大的联合模型，成本极高。

  

本文采用适配器（Adapter）插入机制，在已有多模态大语言模型中插入轻量模块，使其具备视频生成能力。这样，理解模块 + 生成模块可以共享大部分参数，只需训练少量新增参数。

  

优势：

- 显著降低训练开销与算力成本；
    
- 提高模型扩展性：已有理解能力的模型能「平滑地」插入生成能力；
    
- 兼顾理解与生成，不牺牲已有强大的视觉 / 语言理解基础。
    

  

2. 温控对齐：Temperature Modality Alignment

在跨模态（文本 → 视频）生成中，文本与视觉之间表示尺度、语义强度往往不匹配。若直接融合注意力或特征，很容易出现「提示偏移」（Prompt Drift）：生成的视频越偏离最初的文字意图。

  

本文提出模态温度对齐机制（Temperature Modality Alignment）。在跨模态注意力层中对不同模态（文本 / 视觉特征）引入温度系数（类似 softmax 温度调节），动态调节它们的注意力权重与融合强度。在生成过程的早期阶段，更高权重给文本提示以加强语义引导；在后期阶段，则逐渐让视觉特征主导细节优化。

  

这能够有效减少提示偏移，提高语义一致性；让模型在「理解 → 生成」过程中过渡更自然；保证最终视频既符合提示，又具备高质量视觉细节。

  

3. 金字塔反射：Pyramid Reflection

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/f43f68a228fa58e4.jpeg)

  

视频是时序数据，理解和建模长时域依赖（远帧之间的关联）成本极高。传统 Transformer 全帧注意力的计算量呈平方级增长，难以扩展。

  

本文提出金字塔反射机制（Pyramid Reflection）：

- 在理解任务中采用 Reflector 模块，通过动态选择关键帧，并在金字塔层次上进行「反射 / 聚合」操作；
    
- 将帧序列映射到不同时间尺度，自底向上或自顶向下反射信息，使模型能在多个尺度上捕捉时序关系。
    

  

在视频 QA / 时序理解任务中，PR 模块结合 Actor – Evaluator – Reflector 循环结构，让模型能用最少的帧达到准确推理结果。

  

实验结果：打败 SOTA？

UniVid 在视频生成与理解两大方向上，都达到了同级模型最优表现。

  

1. 视频生成：VBench 全维度刷新记录

测试基准：VBench-Long，是目前最严格的视频生成综合评测集，涵盖多个维度：

  

- 技术质量（Technical Quality）
    
- 美学质量（Aesthetic Quality）
    
- 语义一致性（Semantic Fidelity）
    
- 对象 / 动作 / 场景 / 时序等细粒度指标
    

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/372317f6b017acc9.png)

  

UniVid 的成绩不仅在总分上超越所有主流视频生成模型，更在关键维度上超越同级：

  

- Temporal Consistency（时序一致性）：99.88（几乎满分）；
    
- Motion Smoothness（运动平滑度）：99.25；
    
- Semantic Alignment（语义一致性）：80.58（领先 EasyAnimate 的 77.01）；
    
- Imaging Quality（影像质量）：73.03（显著高于其他模型）。
    

  

UniVid 在生成的同时，极大提升了语义契合度与画面连贯性。

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/d95853cf3f96cfd9.png)

与顶尖视频生成模型的比较

  

2. 视频理解：多项问答任务登顶

在视频问答（Video Question Answering, Video-QA）任务中，UniVid 同样登顶多个主流基准。

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/4647d5435e912146.png)

  

UniVid 在 MSVD-QA 和 ActivityNet-QA 上均创造新纪录，并在更复杂的长时序视频上展现出卓越的时序推理与语义理解能力。

  

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/09dd1eb798812126.png)

与顶尖视频生成模型的比较

  

Demo 展示

  

为了让大家更直观地理解 UniVid 的能力，研究团队还准备了视频 Demo，涵盖视频生成和视频理解两类任务。

  

视频生成：

![](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2650996752&idx=2&sn=f6981441d2cc5fb940e92e6abe8afa38&chksm=850f45807d5146783583aa8a4cd79a7e458e51b814f84ef83996721ab99da33aa227126782ee&mpshare=1&scene=1&srcid=03157DmOwC6UIK85lywT8sli&sharer_shareinfo=28505e97426997966c8e9161033b58f8&sharer_shareinfo_first=28505e97426997966c8e9161033b58f8&key=daf9bdc5abc4e8d0c140f878f5eec79b4d82b79fc9207d9d67cd054b2109e30a15fba69681360857cbc38cf2e7108ac1ad8b525d22fcc3466649beadf7b37fe591c0e5b0e834b28fe9877c493e9fb353c69888009fe141e0272cab83a344183456f477aeaa35397d4e61d86cc691fffb1f67f21015a58eef96e3656a21fb05d3&ascene=0&uin=MTM4NjMzMzkyMQ%3D%3D&devicetype=UnifiedPCWindows&version=f2541721&lang=zh_CN&countrycode=CN&exportkey=n_ChQIAhIQW%2B0F2Ew3b89ue4hCQDnhThL7AQIE97dBBAEAAAAAADlQAu8mH5QAAAAOpnltbLcz9gKNyK89dVj0nSibc6csHa0PcvYQ0tKESbNBBf1NAcLs2E0TDTexuZIzIXazLEn70x%2F9PgOeZ7fjKL%2FtLEZKJfkGq2P16smT8vcpSsiREswC%2BoiZOXtDTQ%2BV9scXKu9l0j7lsSuJtt67nQT1mf7AWCLumiTRfh%2FnMWb15nY43Iq2CMl1egWomnJLE4YODiq2rHqZ564ke4z0SETdUg%2F7iFY8Q7qhRiUTG1c8%2FK6aF6AOUS%2B9PM1LxhfFtufXlR1d6tszEv%2Ffcmu0VLlaLxy5mIHtAZ2KI3oM6Zwk2NcG&acctmode=0&pass_ticket=qYO7Ai989HUP9AQYU7OzNULsWwDAD94vSGInlFmvLwpt3s40hwT8Rcu0ZX3hFKzt&wx_header=0)

已关注

关注

重播 分享 赞

关闭

**观看更多**

更多

_退出全屏_

_切换到竖屏全屏__退出全屏_

机器之心已关注

分享视频

，时长00:05

0/0

00:00/00:05

切换到横屏模式

继续播放

进度条，百分之0

播放

00:00

/

00:05

00:05

倍速

_全屏_

倍速播放中

0.5倍 0.75倍 1.0倍 1.5倍 2.0倍

超清 流畅

您的浏览器不支持 video 标签

继续观看

告别「偏科」，UniVid实现视频理解与生成一体化

观看更多

转载

,

告别「偏科」，UniVid实现视频理解与生成一体化

机器之心已关注

分享点赞在看

已同步到看一看写下你的评论

视频详情

  

从左到右的 prompt 分别是：

- Mouse with large teeth aggressively eating cheese.
    
- A white cat in sunglasses relaxes on a surfboard at the beach under a sunny sky.
    
- Ten fluffy kittens eat breakfast together in warm sunlight.
    

  

视频理解：

![](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2650996752&idx=2&sn=f6981441d2cc5fb940e92e6abe8afa38&chksm=850f45807d5146783583aa8a4cd79a7e458e51b814f84ef83996721ab99da33aa227126782ee&mpshare=1&scene=1&srcid=03157DmOwC6UIK85lywT8sli&sharer_shareinfo=28505e97426997966c8e9161033b58f8&sharer_shareinfo_first=28505e97426997966c8e9161033b58f8&key=daf9bdc5abc4e8d0c140f878f5eec79b4d82b79fc9207d9d67cd054b2109e30a15fba69681360857cbc38cf2e7108ac1ad8b525d22fcc3466649beadf7b37fe591c0e5b0e834b28fe9877c493e9fb353c69888009fe141e0272cab83a344183456f477aeaa35397d4e61d86cc691fffb1f67f21015a58eef96e3656a21fb05d3&ascene=0&uin=MTM4NjMzMzkyMQ%3D%3D&devicetype=UnifiedPCWindows&version=f2541721&lang=zh_CN&countrycode=CN&exportkey=n_ChQIAhIQW%2B0F2Ew3b89ue4hCQDnhThL7AQIE97dBBAEAAAAAADlQAu8mH5QAAAAOpnltbLcz9gKNyK89dVj0nSibc6csHa0PcvYQ0tKESbNBBf1NAcLs2E0TDTexuZIzIXazLEn70x%2F9PgOeZ7fjKL%2FtLEZKJfkGq2P16smT8vcpSsiREswC%2BoiZOXtDTQ%2BV9scXKu9l0j7lsSuJtt67nQT1mf7AWCLumiTRfh%2FnMWb15nY43Iq2CMl1egWomnJLE4YODiq2rHqZ564ke4z0SETdUg%2F7iFY8Q7qhRiUTG1c8%2FK6aF6AOUS%2B9PM1LxhfFtufXlR1d6tszEv%2Ffcmu0VLlaLxy5mIHtAZ2KI3oM6Zwk2NcG&acctmode=0&pass_ticket=qYO7Ai989HUP9AQYU7OzNULsWwDAD94vSGInlFmvLwpt3s40hwT8Rcu0ZX3hFKzt&wx_header=0)

已关注

关注

重播 分享 赞

关闭

**观看更多**

更多

_退出全屏_

_切换到竖屏全屏__退出全屏_

机器之心已关注

分享视频

，时长00:13

0/0

00:00/00:13

切换到横屏模式

继续播放

进度条，百分之0

播放

00:00

/

00:13

00:13

倍速

_全屏_

倍速播放中

0.5倍 0.75倍 1.0倍 1.5倍 2.0倍

超清 流畅

您的浏览器不支持 video 标签

继续观看

告别「偏科」，UniVid实现视频理解与生成一体化

观看更多

转载

,

告别「偏科」，UniVid实现视频理解与生成一体化

机器之心已关注

分享点赞在看

已同步到看一看写下你的评论

视频详情

  

应用价值与意义

  

1. 视频创作与生成

在影视、广告、短视频等场景中，创作者只需输入文字脚本或图像提示，UniVid 就能自动生成连贯、符合语义逻辑的视频。它能「理解」剧情后再去「创作镜头」，让内容生产更自然、更高效。

  

2. 视频理解与分析

UniVid 还能看懂视频。无论是体育赛事、监控画面还是教学视频，它都能识别动作、人物、事件逻辑，生成精准摘要或问答结果。让机器不仅看到画面，更「理解故事」。

  

3. 机器人与具身智能

在机器人导航、自动驾驶或智能体系统中，UniVid 可以理解摄像头输入并生成未来场景预测，帮助智能体进行规划与决策。它让机器人不仅「看得到」，还能「想得出下一步」。

  

4. 开源生态与科研价值

与闭源视频模型不同，UniVid 的代码开源，任何研究者或开发者都可自由使用、复现、二次开发。它为视频智能研究提供了一个通用底座，也让产业界能以更低成本构建自己的视频生成系统。