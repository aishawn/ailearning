上下文窗口有限、微调成本高昂、视觉-文本对齐不足等问题

用开源工具提取视频中的视觉对齐辅助文本，通过 RAG 筛选出与查询相关的信息，再输入任意 LVLM 生成答案。整个流程无需训练，可即插即用，具体分为三个阶段。

第一步：查询解耦
第二步：辅助文本生成与检索
第三步：整合与生成



![图2 Video-RAG 整体框架示意图i](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/c034c64f9ff93f6e.png)

图2 Video-RAG 整体框架示意图i

![图3 Video-RAG 示例](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/6a5f13cb3133303c.png)

图3 Video-RAG 示例



它通过提取视频中与视觉对齐的辅助文本（如音频转录、文字识别、目标检测结果），结合检索增强生成（Retrieval-Augmented Generation, RAG）技术，为任意多模态视频语言模型注入长视频理解能力。




论文题目： Video-RAG: Visually-aligned Retrieval-Augmented Long Video Comprehension

论文链接：https://arxiv.org/abs/2411.13093

代码链接：https://github.com/Leon1207/Video-RAG-master

项目主页：https://video-rag.github.io/