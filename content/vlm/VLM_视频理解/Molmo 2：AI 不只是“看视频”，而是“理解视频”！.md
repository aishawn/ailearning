由 Allen Institute for AI（Ai2）发布的 **Molmo 2**，是当前**最强开源视频理解模型之一**，在问答、指向定位、物体追踪等任务上，首次实现了“空间 + 时间 +语言”的三重理解，且**模型权重、数据集、推理 demo 全面开放**。

一、 Molmo2是什么

一个能“看懂视频内容”的多模态 AI，它不仅能回答问题，还能指出**发生的位置和时刻**，并**持续追踪视频中的物体与事件变化**。

官网博客：https://allenai.org/blog/molmo2  
论文链接：https://arxiv.org/abs/2401.03049[Molmo2Open Weights and Data for Vision-Language Models with Video Understanding and Grounding (1).pdf](https://mp.weixin.qq.com/s?__biz=MzE5OTEzOTE1Mg==&mid=2247484785&idx=1&sn=0d2398f1e3ba67ca90f475e4a8c0ab99&chksm=97f00e4e902de980fa2dea91eac7dfa6bf8eb1602406bf457bfc1254aa1be6817bbb76bb48dd&mpshare=1&scene=1&srcid=0315XC6lpBiLcW7572948AN1&sharer_shareinfo=0989ed4a4de2caa2d2bf080f2e5cf595&sharer_shareinfo_first=0989ed4a4de2caa2d2bf080f2e5cf595&click_id=29&key=daf9bdc5abc4e8d0df15be6debd1f809a23a1598a26465564599b97c16633783fc3ab910c7c7884f2c2a94c95ffc1b9f10f1c822f8f4dae42fa137da8456bd696517c8436a6b6ab881e04145c7dfed4de73f1dcf255e479f55d0f289fc389c3b45bcb0986c3e032371c2ab56d0ad79a6f2f6496e140519a75a4f6a5fdfb85a07&ascene=1&uin=MTM4NjMzMzkyMQ%3D%3D&devicetype=UnifiedPCWindows&version=f2541721&lang=zh_CN&countrycode=CN&exportkey=n_ChQIAhIQnjoubGUwiVWIt3AyiFrBPRLnAQIE97dBBAEAAAAAAFhtI2cfTX0AAAAOpnltbLcz9gKNyK89dVj08rV4A1q1BYxuxEkPztLlA0ggDJrmcXqUy2gc7qg4tQvC9XKMk9oYafsGoLy6hedvdcb4c4FzaIqU9Lj59DQ%2BpfFlt9XORPa%2BzrUNRx3mHJ6qK3Nz7MLRTIWMrZVsn5JIMymt%2Fp86%2B%2FGXM5Qjbtl%2F2i9XG41YjR7jxtbc3jG0Ygok8Tp8YUJO046ae0%2BFZJgVPsMleJTDc%2BIZpKUObydY0glo8k80ceLHAbjQ3ckw5aLd9ekq7MLysJf3T6sqM0mJ%2BA%3D%3D&acctmode=0&pass_ticket=ZULusEVA%2FxzzyNgkKZ%2Ba38bCwMIMIYMO90zo9%2Bk9DK8Wy3JqV40oV2vHcvd7hs99&wx_header=0&fasttmpl_type=0&fasttmpl_fullversion=8168177-zh_CN-html&from_xworker=1)  
模型权重：https://huggingface.co/allenai/Molmo2-8B  
数据集合集：https://github.com/allenai/molmo

二、 Molmo2核心能力


|功能模块|能力说明|示例|
|---|---|---|
|🎯 视频问答|基于视频和问题，生成自然语言答案|“小孩把什么掉到地上了？”|
|📍 指向定位（Pointing）|指出事件或物体的**时刻 + 空间位置**|“杯子什么时候摔了？在第几帧哪里？”|
|🧍‍♂️ 多对象追踪（Tracking）|标记并持续追踪人物/物体，保持一致身份|“画面中跟踪所有行人轨迹”|
|🔢 视频计数|回答动作发生的次数，并定位每次发生的时间段|“猫跳了几次？”|
|📝 长视频摘要|输出 dense caption / 多句描述，适用于长视频概括|“概括这段5分钟视频的主要内容”|

Molmo 2 不只是“理解”，它强调 **“可指认的理解”（grounded understanding）**：不仅知道答案，还能标出“证据”发生在哪一帧哪一点。

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/df9cd8151f39f7d0.png)

  

三、典型模型对比

|模型|视频问答|定位能力|多目标追踪|推理开放性|
|---|---|---|---|---|
|🟢 **Molmo 2 (8B)**|✅ 精确|✅ 时空级定位|✅ ID 连续跟踪|✅ 完全开源|
|🟡 Flamingo|✅ 一般|❌ 无定位输出|❌ 追踪弱|❌ 不开源|
|🔵 InternVid / Video-LLaVA|✅ 中等|⚠️ 文本定位|⚠️ 无跨帧追踪|部分开放|
|🔴 Gemini / GPT‑4V|✅ 强|⚠️ 无标注坐标|❌ 无 ID 跟踪|❌ 闭源|

Molmo 2 是目前**唯一一个开源的、支持“视频语义问答 + 时空定位 + 多目标连续追踪”的大模型系统**。

四、项目启发

| 项目主题        | 项目内容                           | 适用类型         |
| ----------- | ------------------------------ | ------------ |
| 🎯 视频事件定位系统 | 上传短视频 → 询问 → 返回答案 + 时间/位置      | 课程实验、AIGC 原型 |
| 🔁 多人物行为统计  | 追踪画面中每个人物行为次数和路径轨迹             | 体育分析、安防监控类   |
| 🧪 数据标注辅助工具 | 用 Molmo 2 自动生成视频标注草稿，人工微调      | 数据集建设方向      |
| 📦 自定义训练子集  | 用 Molmo 官方 pipeline 制作中文领域追踪数据 | 中文视频建模研究     |