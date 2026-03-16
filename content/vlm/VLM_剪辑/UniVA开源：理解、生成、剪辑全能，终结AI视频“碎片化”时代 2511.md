- **论文标题**：UniVA: Universal Video Agent towards Open-Source Next-Generation Video Generalist
    

- 👉 **项目主页 & 演示：** http://univa.online/
    
- 📄 **论文地址：** https://arxiv.org/abs/2511.08521
    
- 💻 **GitHub：** https://github.com/univa-agent/univa
    
- 🚩 **Benchmark**: https://huggingface.co/datasets/UniVA-Agent/UniVA-Bench
    

## 🚀 什么是 UniVA？

UniVA 是一个旨在实现“下一代视频通用人工智能”的开源框架 。与传统的端到端模型不同，UniVA 采用了一种更接近人类工作流的 **Plan-Act（规划-执行）双智体架构** 。

简单来说，UniVA 就像一个配备了顶级团队的“AI总导演”：

- **Planner（大脑）：** 理解你的复杂需求，将其拆解为分镜脚本、编辑指令等步骤。
    
- **Executor（双手）：** 调用各种专业的AI工具（生成、分割、编辑、配音）来执行任务。
    

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/f26b3ae9c7d983cc.png)

## 💡 核心黑科技：三大杀手锏

### 1. Plan-Act 双智体架构：拒绝“黑盒”操作

目前的视频大模型往往是“一锤子买卖”，生成好坏全看运气。UniVA 将过程解耦：

- **Planner Agent** 负责长程推理，它会先写好“剧本”（Storyboard），确立分镜 。
    
- **Executor Agent** 负责落地，通过模块化工具执行。如果中间步骤不满意，它还能自我反思并重新规划 。
- 
UniVA彻底改变了这种交互方式，基于Plan-Act（规划-执行）双智能体架构，让UniVA拥有了「思考」的能力。

全自动规划 (Automated Planning) ：UniVA的Planner Agent会自动将模糊需求拆解为结构化的分镜脚本，并将任务分发给Executor Agent执行。

主动式服务 (Proactive Assistance) ：不仅仅是执行命令，如果你的指令中有歧义，或者生成的中间结果不达标，UniVA 会进行自我反思 (Self-Reflection)。它会主动问你或自动修正错误，而不是把烂摊子丢给你。

多轮交互共创 (Interactive Co-creation) ：UniVA能记住多轮对话的上下文。你可以像和剪辑师聊天一样修改视频，让创作变成一场流畅的协作。
    

### 2. MCP 协议：无限扩展的工具库

UniVA 基于 **Model Context Protocol (MCP)** 构建 。这意味着它是一个开放的生态系统，可以“即插即用”地集成目前最强的工具：

- **生成：** 集成 Seedance, LTX-Video, Wan 等模型 。
    
- **理解：** 调用 InternVL3 等多模态大模型 。
    
- **视觉工具：** 包含 SAM2 分割、VACE 编辑、FLUX 绘图等 。
    
- **非AI工具：** 甚至能调用传统的视频剪切、合并工具 。
    

这意味着，UniVA 的能力没有天花板，随着社区新模型的发布，它会越来越强。



### 3. 三级记忆机制：让AI不再“健忘”

长视频生成最大的痛点是什么？是**一致性**。前一秒主角穿红衣，后一秒变绿衣。 UniVA 引入了分层记忆机制 ：

- **全局记忆 (Global)：** 存储通用知识和历史轨迹。
    
- **任务记忆 (Task)：** 存储当前的分镜脚本、中间生成的素材（Mask、Caption），确保上下文连贯。
    
- **用户记忆 (User)：** 记住你的偏好（比如“我喜欢赛博朋克风格”）。
    

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/be226390c4e4ce6f.png)

## 🎬 实测效果：碾压单一模型

UniVA 的强大在于处理**复杂、长链路**的任务。

### 🌟 场景一：超长叙事视频生成（LongText2Video）

用户输入一段复杂的制陶过程描述。UniVA 不会像普通模型那样生成一堆混乱的片段，而是先规划分镜：拉胚→特写→入窑→成品。
### 场景二：跨镜头角色一致性

让一个穿西装的男人展示工作的一天。 这对普通视频模型是噩梦，但 UniVA 完美保持了人物的身份（ID Preserving）。


**这才是真正的 AI 视频助理！**

### 📊 硬核评测：UniVA-Bench

为了验证效果，团队还发布了 **UniVA-Bench**，这是首个针对多步视频任务的评测基准 。 实验数据显示，在复杂的 **LongText2Video** 任务中，UniVA 在 MLLM Judge（大模型裁判）评分上达到了 **3.333**，显著优于 Wan (3.183) 和 LTX-Video (1.125) 等端到端模型 。这证明了在复杂任务中，“精心规划”比“暴力生成”更有效。

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/bd07932f7fd59ad3.png)

### 🔗 总结与开源

UniVA 不仅仅是一个工具，它代表了 AI 视频生成的未来方向：**从单一模型走向 Agent 协同，从盲目生成走向可控创作。** 它既是创作者的得力助手，也是开发者研究视频 Agent 的绝佳底座。