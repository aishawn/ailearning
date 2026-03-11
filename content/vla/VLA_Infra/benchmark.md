<h1 align="center">Embodied-AI-Guide<br>Benchmarks</h1>


## Benchmarks - 基准集

基准集通常定义了：**任务集合 + 评测协议 +（可选）参考实现**。它们的价值是让不同方法在同一套任务与指标上可复现对比。下面列的是你当前条目中最常见、且各自定位清晰的基准。

| 基准 | 链接 | 一句话定位 |
|---|---|---|
| RoboTwin 2.0 | [link](https://github.com/robotwin-Platform/RoboTwin) | 程序化生成双臂任务数据与 50 个双臂评测任务（偏“双臂+规模化生成”） |
| SimplerENV | [link](https://github.com/simpler-env/SimplerEnv) | 轻量化、可快速对比策略在操作任务上的表现 |
| LIBERO | [link](https://github.com/Lifelong-Robot-Learning/LIBERO)<br>[link](https://libero-project.github.io/intro.html) | 程序化生成管道 + 视觉运动策略架构与终身学习设置（偏“终身/顺序学习”） |
| CALVIN | [link](https://github.com/mees/calvin)<br>[link](http://calvin.cs.uni-freiburg.de/) | 语言条件 + 多模态输入 + 长视野操纵（偏“长程任务与规划”） |
| Meta-World | [link](https://meta-world.github.io/) | 50 操作任务，经典多任务/元强化学习基准（偏“多任务泛化”） |
| Embodied Agent Interface | [link](https://embodied-agent-interface.github.io/) | 评测 LLM 在具身决策链路（理解/分解/序列化），不强调低层执行 |
| RoboGen | [link](https://github.com/Genesis-Embodied-AI/RoboGen)<br>[link](https://robogen-ai.github.io/) | 生成任务/场景/带标注数据（偏“生成数据而非直接生成 policy”） |

---

