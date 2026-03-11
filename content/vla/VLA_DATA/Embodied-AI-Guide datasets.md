
<section id="datasets"></section>
## Datasets - 数据集

数据集决定了策略的“经验分布”。阅读数据集时建议关注四件事：  
**(1) 真实 vs 仿真**、**(2) 机器人同构 vs 异构**、**(3) 模态（RGB/RGB-D/语言/触觉/声音等）**、**(4) 是否附带训练代码与硬件搭建/采集流程**。下面把你的条目统一成一个紧凑表，避免过长的散点描述。

| 数据集                       | 链接                                                                                       | 关键特点（紧凑版）                                   |
| ------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| Open X-Embodiment（RT-X）   | [link](https://robotics-transformer-x.github.io/)                                        | 22 种机器人平台、百万级真实轨迹，覆盖大量技能与任务（大规模、跨本体）        |
| AgiBot World Datasets（智元） | [link](https://agibot-world.com/)                                                        | 百万级轨迹、同构机器人采集、多级质检与人工在环流程（工业化采集流程）          |
| RoboMIND                  | [link](https://x-humanoid-robomind.github.io/)                                           | 10.7 万真实演示、96 类物体、四种协作臂、任务按类别组织（真实多任务）      |
| ARIO（All Robots in One）   | [link](https://imaei.github.io/project_pages/ario/)                                      | 2D/3D/文本/触觉/声音五模态；操作+导航；仿真+真实；统一格式且规模大      |
| MimicGen                  | [link](https://github.com/NVlabs/mimicgen)<br>[link](https://mimicgen.github.io/)        | 基于 robosuite+MuJoCo 的数据生成框架；少量真人演示扩增为大量仿真数据 |
| RoboCasa                  | [link](https://github.com/robocasa/robocasa)<br>[link](https://robocasa.ai/)             | MuJoCo 厨房高保真平台；多环境多物体；原子任务+组合任务（偏家居厨房）      |
| DexMimicGen               | [link](https://github.com/NVlabs/dexmimicgen/)<br>[link](https://dexmimicgen.github.io/) | 面向双臂桌面操作；增强版 real2sim2real 数据生成；少量演示生成大量轨迹  |
| FUSE Dataset              | [link](https://fuse-model.github.io/)                                                    | 远程操控轨迹；语言指令 + 复杂遮挡；多任务设置（多传感器融合研究友好）        |
| BiPlay Dataset            | [link](https://dit-policy.github.io/)                                                    | 双臂轨迹；随机物体与背景；长视频切片成带语言描述的剪辑（泛化导向）           |
| DROID                     | [link](https://droid-dataset.github.io/)                                                 | 7.6 万轨迹、350 小时、564 场景、86 任务；附硬件与训练代码（真实大规模） |
| BridgeData V2             | [link](https://rail-berkeley.github.io/bridgedata/)                                      | 6 万轨迹；多环境多技能；目标图像/语言指令；包含远程操控与脚本执行          |
| Ego4D Sounds              | [link](https://ego4dsounds.github.io/)                                                   | 第一人称视频 + 环境声音；强调动作与声音对齐（声音模态很有价值）           |
| RH20T                     | [link](https://rh20t.github.io/)                                                         | 人机交互数据；含人脸与语音等敏感信息；体量大且提供缩减版（注意隐私与合规）       |
| 白虎数据集                     | [link](https://www.openloong.org.cn/cn/dataset)                                          | 异构机器人；多场景多任务；面向跨平台评估与训练（本体覆盖面广）             |


测试集

## LIBERO benchmark

包含：

- LIBERO-Spatial
    
- LIBERO-Object
    
- LIBERO-Goal
    
- LIBERO-Long