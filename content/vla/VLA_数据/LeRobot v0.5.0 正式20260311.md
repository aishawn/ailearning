自 v0.4.0 以来，项目已经合并了 **200+ 个 PR**，并迎来了 **50 多位新贡献者**。因此 **LeRobot v0.5.0** 成为目前规模最大的一次发布 —— 几乎在所有方向上都实现了扩展：支持更多机器人 (包括首个类人机器人) 、更多策略模型 (包括回归的自回归 VLA) 、更快的数据集处理、可以直接从 Hub 加载的仿真环境，以及基于 **Python 3.12 与 Transformers v5** 的现代化代码库。无论你是在仿真环境中训练策略，还是在真实硬件上部署，v0.5.0 都提供了大量新能力。

## TL;DR

LeRobot v0.5.0 新增 **Unitree G1 类人机器人完整支持 (全身控制模型)** ，并引入新的策略，包括 **Pi0-FAST 自回归 VLA** 和 **Real-Time Chunking (实时分块)** 用于实现更快响应的推理。同时还加入 **流式视频编码**，消除了录制任务之间的等待时间。

此外，本版本还推出了 **EnvHub**，允许直接从 Hugging Face Hub 加载仿真环境；集成 **NVIDIA IsaacLab-Arena**；并对代码库进行了全面现代化升级，包括 **Python 3.12+、Transformers v5 以及第三方策略插件系统**。

## 硬件：支持的机器人数量再创新高

LeRobot v0.5.0 大幅扩展了支持的硬件设备，从机械臂、移动机器人到完整的类人机器人。

### Unitree G1 Humanoid

本次发布中最重要的硬件新增是：**对 Unitree G1 类人机器人的完整支持**。这是 LeRobot 第一次集成类人机器人，而且支持非常全面：

- **运动能力 (Locomotion)** ：可以行走、导航并在环境中移动。
    
- **操作能力 (Manipulation)** ：能够执行精细的物体操作任务。
    
- **远程操控 (Teleoperation)** ：通过直观的遥操作界面远程控制 G1。
    
- **全身控制 (Whole-Body Control, WBC)** ：同时协调行走和操作，实现复杂的真实世界任务。
    

G1 的加入标志着 LeRobot 在通用机器人方向迈出了重要一步 —— 从桌面机械臂扩展到 **完整身体的具身智能系统**。你可以按照文档自己尝试。

- 文档https://hf.co/docs/lerobot/unitree_g1
    

![图片](https://pub-adba99cbc4cd4237a5ed7de21ad26f3c.r2.dev/md-img/036a5abf4ca2b85c.jpeg)

### OpenArm & OpenArm Mini

我们新增了对OpenArm机械臂以及其配套 **OpenArm Mini** 遥操作设备的支持。OpenArm 是一款性能出色的机械臂，并且已经实现完整的 LeRobot 集成，而 Mini 则作为它的自然遥操作设备。

- OpenArmhttps://openarm.dev
    

两者都支持 **双臂配置 (bi-manual)** ，可以构建双机械臂系统，从而完成更复杂的操作任务。更多信息可查看文档。

- 文档https://hf.co/docs/lerobot/openarm
    

### 更多机器人

硬件生态仍在持续扩展：

- **Earth Rover**：LeRobot 首次支持移动机器人，可用于户外导航和地面移动任务。
    
- **OMX Robot**：新增的机械臂平台，支持可配置夹爪参数和校准功能。
    
- **SO-100/SO-101 统一实现**：我们将 SO-100 和 SO-101 的实现整合到一个更简洁的代码库中 (包括双臂配置) ，减少重复代码，更易维护，同时保持原有功能。
    

- Earth Roverhttps://shop.frodobots.com/products/miniplus
    
- OMX Robothttps://ai.robotis.com/omx/hardware_omx.html
    

### CAN 总线电机

通过 **CAN (Controller Area Network) 总线**新增了对电机控制器的支持，从而能够接入更高性能的执行器：

- **RobStride**：基于 CAN 的电机控制器，适用于高扭矩应用。
    
- **Damiao**：另一种 CAN 总线电机控制器，进一步扩展兼容硬件范围。
    

- RobStridehttps://github.com/RobStride/Product_Information
    

这意味着 LeRobot 现在不仅支持 Dynamixel 和 Feetech，也能够驱动更多 **专业级执行器**。

## 策略模型：不断扩展的模型库

本次发布为 LeRobot 新增 **6 种策略或技术**，进一步推动开源机器人学习的发展。

### Pi0-FAST：自回归 VLA

**Pi0-FAST** 将自回归的 **Vision-Language-Action (VLA) 模型**引入 LeRobot，并采用 **FAST (Frequency-space Action Sequence Tokenization)** 方法。

与 Pi0 使用的 flow-matching 方法不同，Pi0-FAST 使用 **基于 Gemma 300M 的自回归动作专家模型**，生成离散化的动作 token，实现：

- **FAST Tokenization**：动作被 token 化，便于自回归解码，使用专门的FAST action tokenizer。
    
- **灵活解码**：可以通过温度参数和最大解码步数，在速度与质量之间进行权衡。
    
- **兼容 RTC**：可与 Real-Time Chunking 结合，实现更快速的推理。
    

- FAST action tokenizerhttps://hf.co/lerobot/fast-action-tokenizer
    

`lerobot-train \     --policy.type=pi0_fast \     --dataset.repo_id=lerobot/aloha_sim_insertion_human \     --policy.device=cuda   `

### Real-Time Chunking (RTC)

**Real-Time Chunking** 是来自Physical Intelligence的推理阶段技术，可以显著提升 flow-matching 策略的响应速度。

- Physical Intelligencehttps://www.pi.website
    

传统方法需要等一个完整动作序列生成后再重新规划，而 RTC 会 **持续融合新的预测与正在执行的动作**，使机器人行为更加平滑、响应更快。

RTC 不是独立策略，而是一个增强模块，可用于 **Pi0 系列、SmolVLA 与 Diffusion** 等策略。

启用方式：

`--policy.rtc_config.enabled=true   `

在真实机器人部署中 (对延迟敏感的场景) ，这是一个非常重要的改进。更多技术细节见论文和文档。

- 论文https://hf.co/papers/2506.07339
    
- 文档https://hf.co/docs/lerobot/rtc
    

### Wall-X

**Wall-X** 是一个新的 VLA 策略，基于Qwen2.5-VL构建，并使用 flow-matching 进行动作预测。

- Qwen2.5-VLhttps://hf.co/collections/Qwen/qwen25-vl
    

它将 Qwen2.5-VL 的强大视觉语言理解能力与 flow-matching 控制头结合，实现 **跨机器人形态控制 (cross-embodiment control)** 。

`pip install lerobot[wall_x]   lerobot-train \     --policy.type=wall_x \     --dataset.repo_id=lerobot/aloha_sim_insertion_human   `

### X-VLA

**X-VLA** 将 **基于 Florence2 的 VLA 模型**引入 LeRobot。

该模型基于 Microsoft 的 **Florence-2 视觉语言模型**，为机器人学习提供了另一种基础模型选择，进一步增加模型多样性。

查看训练指南和基础模型。

- 训练指南https://hf.co/docs/lerobot/xvla
    
- 基础模型https://hf.co/lerobot/xvla-base
    

`pip install lerobot[xvla]   lerobot-train \     --policy.type=xvla \     --dataset.repo_id=lerobot/bimanual-so100-handover-cube   `

### SARM

**SARM (Stage-Aware Reward Modeling)** 用于解决机器人学习中一个非常困难的问题：**长时序任务 (long-horizon tasks)** 。

传统方法通常使用单一线性进度信号，而 SARM 会 **同时预测任务阶段以及阶段内进度**，从而更准确地描述任务进展。

这种方式可以显著提高复杂多步骤操作任务的训练效果。更多信息请查看文档。

- 文档https://hf.co/docs/lerobot/sarm
    

  

![](https://mp.weixin.qq.com/s?__biz=Mzk0MDQyNTY4Mw==&mid=2247496647&idx=1&sn=6cb078e922305485765f2059438d1b2b&chksm=c3545156704dd2bbeb601ecb95ba03f419248396b60cbf3f523af969518ae7421d735fc5361e&mpshare=1&scene=1&srcid=0312m0rnN8utkrUxPaPemHzv&sharer_shareinfo=40a420b2e2def4c5feb5b4e120c44831&sharer_shareinfo_first=40a420b2e2def4c5feb5b4e120c44831&click_id=12&key=daf9bdc5abc4e8d0792cc08d84532045e92f8e86aa119f50940c7ce916e8f7e6589972331f06066310469d250fe1028a5f197dec169f85a39efca1b75865517fa331582dd6d1f9220746fceb336f9149147ece2e9ecb57fd11180630347da227693e2a2af02623f357b8a87221d05150af2296492a28b94bdaf3a50b195d7e61&ascene=1&uin=MTM4NjMzMzkyMQ%3D%3D&devicetype=UnifiedPCWindows&version=f2541721&lang=zh_CN&countrycode=CN&exportkey=n_ChQIAhIQ916oy77IGsjT6wFCCeE2KxLnAQIE97dBBAEAAAAAAIWSJKaC8KoAAAAOpnltbLcz9gKNyK89dVj0qx%2BTSGgjAP%2B4n5cJSudHvnX%2B7%2FUobmgKiwhblPIclmucw2wzR6pzGPRbbyth9UXKHiCGj2wJCroREO2Twuv%2FNHOZdKved4E9hYctKXpA8t0gBdaS%2Bn2XPq5fROUc1wLIo5oJiSOZGK7Bm7GGyASTvPZMocc0H5B3qbkth5CnEHLB5tcJ8gEUA3sTU70jyJTAOQ5CnxFxUpRLKeOBe1WbMGO4DPrfb0ZHFskNTyAoznJDkd6hJbvgLuCmSAeQOZSA%2Fg%3D%3D&acctmode=0&pass_ticket=KLtHZd7PXgZkMMj6RIDMDYQi3v%2FaB%2Bu%2BC0gOm2Jj0g4v7v2Yd8XFKfiJWTMW18bE&wx_header=0&fasttmpl_type=0&fasttmpl_fullversion=8166817-zh_CN-html&from_xworker=1)

已关注

关注

重播 分享 赞

关闭

**观看更多**

更多

_退出全屏_

_切换到竖屏全屏__退出全屏_

Hugging Face已关注

分享视频

，时长00:21

0/0

00:00/00:21

切换到横屏模式

继续播放

进度条，百分之0

播放

00:00

/

00:21

00:21

倍速

_全屏_

倍速播放中

0.5倍 0.75倍 1.0倍 1.5倍 2.0倍

超清 流畅

您的浏览器不支持 video 标签

继续观看

LeRobot v0.5.0 正式发布

观看更多

转载

,

LeRobot v0.5.0 正式发布

Hugging Face已关注

分享点赞在看

已同步到看一看写下你的评论

视频详情

  

### PEFT 支持

现在你可以使用 **LoRA 等 PEFT 方法对大型 VLA 模型进行微调**，而无需修改核心训练流程。

PEFT 配置在策略层进行管理，可以用较少算力将大型基础模型适配到特定机器人和任务。

详情见文档。

- 文档https://hf.co/docs/lerobot/peft_training
    

`lerobot-train \     --policy.type=pi0 \     --policy.peft_config.use_peft=true \     --dataset.repo_id=lerobot/aloha_sim_insertion_human   `

## 数据集：录制更快，训练更快

本次发布对数据集处理流程进行了重大优化，使 **数据采集和训练速度显著提升**。

### 流式视频编码

过去在录制数据集时，每个 episode 结束后都需要等待视频编码完成。

**现在不需要等待了。**

通过 **Streaming Video Encoding (流式视频编码)** ，视频帧会在采集时实时编码，实现 **episode 之间零等待时间**。

系统还支持 **自动检测硬件编码器**，如果 GPU 提供视频编码能力，会自动使用。

`dataset = LeRobotDataset.create(       repo_id="my/dataset",       fps=30,       video_backend="auto",       streaming_encoding=True,   )   `

### 图像训练速度提升 10 倍，编码速度提升 3 倍

在底层实现中，我们修复了数据访问瓶颈，并重构了图像处理流程：

- **图像训练速度提升 10 倍**：优化图像变换流程并修复隐藏的数据访问瓶颈。
    
- **编码速度提升 3 倍**：默认启用并行编码，并根据数据类型动态调整压缩级别。
    
- **更高 CPU 利用率**：录制和数据集创建时资源使用更加高效。
    

### 新的数据集工具

数据集编辑工具也持续增强：

- **子任务支持**：可以在 episode 中标注子任务，支持层级任务学习。
    
- **图像转视频**：将现有图像数据集转换为视频格式，提高存储效率，并支持多个 episode 合并到同一视频文件。
    
- **更多编辑操作**：新增 `info` 数据集检查功能、任务修改工具，以及对拆分、合并、特征编辑等操作的修复。
    
- **更多配置选项**：可自定义视频编码格式、容差设置和元数据缓冲大小。
    

## EnvHub：从 Hub 加载仿真环境

**EnvHub** 让 LeRobot 可以 **直接从 Hugging Face Hub 加载仿真环境**。

过去需要在本地安装环境并手动注册，现在只需要指定 Hub 仓库即可：

- 自动下载环境代码
    
- 自动注册到 Gymnasium
    
- 直接用于训练和评估
    

Hub 环境使用 `HubEnvConfig`，会下载并执行远程 `make_env` 函数：

`lerobot-train \     --env.type=hub \     --env.hub_path="username/my-custom-env" \     --policy.type=act   `

这大大降低了分享自定义仿真环境的门槛。只需打包环境并上传到 Hub，其他人就能直接使用。

更多信息见文档。

- 文档https://hf.co/docs/lerobot/envhub
    

示例教程：LeIsaac x LeRobot EnvHub tutorial

- LeIsaac x LeRobot EnvHub tutorialhttps://hf.co/docs/lerobot/envhub_leisaac
    

### NVIDIA IsaacLab-Arena

我们还集成了 **NVIDIA IsaacLab-Arena**，为 LeRobot 带来 **GPU 加速仿真**。

IsaacLab-Arena 提供了一系列基于 **NVIDIA Isaac Sim** 的操作任务环境，并支持大规模并行环境实例，从而加速强化学习训练。

该集成包括：

- 专门的前处理和后处理流程
    
- 与 LeRobot 训练流程完全兼容
    

详情见文档。

- 文档https://hf.co/docs/lerobot/envhub_isaaclab_arena
    

## 代码库：现代化基础设施

本版本对代码库进行了全面升级：

- **Python 3.12+** ：LeRobot 现在要求 **Python 3.12** 作为最低版本，从而能够使用更现代的语法并获得更好的性能。
    
- **Transformers v5**：项目已经迁移到 **Hugging Face Transformers v5**，以保持与最新模型生态的兼容。
    
- **第三方策略插件**：类似于 v0.4.0 的硬件插件系统，现在也可以把自定义策略注册为可安装的插件包，例如：`pip install lerobot_policy_mypolicy`，然后通过 `--policy.type=mypolicy` 使用，无需修改核心库代码。具体方法可以参考文档。
    
- **远程 Rerun 可视化**：可以使用 Rerun 远程可视化机器人的遥测数据，并支持图像压缩，从而实现更节省带宽的数据流传输。
    
- **安装流程改进**：新增 `uv` 的安装说明，同时进一步明确了安装步骤，并优化了依赖管理。现在顺序安装流程也在文档中有清晰说明。
    
- **文档版本管理**：文档现在支持版本化，可以始终查阅与你当前安装版本对应的文档。
    
- **PyTorch 版本更新**：更新了 PyTorch 的版本范围，以支持 **NVIDIA Blackwell GPU**。
    

- 文档https://hf.co/docs/lerobot/bring_your_own_policies
    
- 安装说明https://hf.co/docs/lerobot/installation
    

## 社区与生态

- **Discord 社区升级**：对 Discord 社区进行了更新，优化了频道结构，使这个最活跃的社区交流平台更加清晰、有序。
    
- **GitHub README、模板与自动标签**：更新了 README，新增 issue 和 PR 模板、贡献指南，以及自动化标签系统，让社区成员更容易参与和贡献。
    
- **ICLR 2026 论文录用**：LeRobot 论文已被ICLR 2026接收。
    

- ICLR 2026https://openreview.net/forum?id=CiZMMAFQR3
    

- **LeRobot Visualizer 更新**：可视化工具进行了升级，新增数据集可视化徽章，并改进了整体功能。可以在这里体验
    

- 可以在这里体验https://hf.co/spaces/lerobot/visualize_dataset?path=%2Fimstevenpmwork%2Fthanos_picking_power_gem%2Fepisode_0
    

- **LeRobot Annotation Studio**：推出了一个 HuggingFace Space，用于给数据集中的每个时刻添加自然语言子任务标注，让数据标注更加方便。查看项目
    

- 查看项目https://hf.co/spaces/lerobot/annotate