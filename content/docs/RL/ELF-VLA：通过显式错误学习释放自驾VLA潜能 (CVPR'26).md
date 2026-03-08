用于自动驾驶的视觉-语言-动作 (VLA) 模型在强化学习 (RL) 优化过程中经常会遇到性能瓶颈。这种停滞源于先前监督微调 (SFT) 限制了模型的探索能力，导致在长尾场景中“持续性失败”。在这些关键情况下，所有探索的动作都只会产生零值的驾驶得分。这种信息稀疏的奖励虽然表明模型出现失败，但却无法识别其根本原因——无论是错误的规划、错误的推理，还是糟糕的轨迹执行。为了解决这一局限性，我们提出了从显式失败中学习的VLA框架(**ELF-VLA**)，该框架通过结构化的诊断反馈来增强 RL。我们的方法不依赖于模糊的标量奖励，而是生成详细且可解释的报告，从而识别具体的失败模式。VLA 策略随后利用这些显式反馈来生成反馈引导的改进策略。通过将这些经过修正的高奖励样本重新注入强化学习训练批次，我们的方法提供了一个有针对性的梯度，使得策略能够解决无引导探索无法解决的关键场景。大量实验表明，我们的方法释放了VLA模型的潜在能力，在公开的NAVSIM基准测试中，针对整体PDMS、EPDMS和高级规划精度，均达到了目前最先进的性能。

- 论文标题：Unleashing VLA Potentials in Autonomous Driving via Explicit Learning from Failures
    

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/wY9PRjOpowxmfB70EicyajnnNxLTepic8sOeTnsicTU9vL5riaOdOIKda4mDo6ic9nP3SlUMo97ZTic6Owcv4mMyfOGQKbX9YybgERc3oHpicLGVO4/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=1)

## 一、背景回顾

自动驾驶系统的发展正经历着从传统模块化架构向端到端框架的范式转变。视觉-语言-动作（VLA）模型处于这一转变的前沿。这些模型通过对大型视觉-语言模型（VLM）应用监督式微调（SFT）和强化学习（RL），将原始摄像头传感器输入映射到连贯的车辆运动指令。这种集成设计消除了人工设计的接口，并支持大规模、数据驱动的策略学习。值得注意的是，VLA模型可以通过“思考”模块生成中间推理轨迹，模拟人类的问题解决策略，为实现可解释且值得信赖的自动驾驶提供了一个有前景的方向。

尽管取得了这些进展，强化学习微调仍然面临性能瓶颈：我们观察到，在SFT之后，模型的策略探索能力受到SFT数据集局限性的严重约束，其中常见场景非常普遍，而能够严格测试自主系统能力的安全关键场景却很少见。因此，在安全关键且具有挑战性的场景下，所有探索性规划均失败，导致驾驶得分为零，如图1顶部所示。现有的VLA-RL方法将训练期间的性能评估简化为单一标量奖励（例如，PDMS）。当模型失败时，这种信息稀疏的奖励不足以精确定位错误的根本原因，因此无法确定失败是源于“思考”模块中高层规划的累积误差、对关键目标的认知推理缺陷，还是底层轨迹的动态缺陷。为了克服这些局限性并实现持续学习，本文提出了一种新型的VLA训练框架，用于自动驾驶，该框架能够衔接失败诊断和策略修正。

如图1底部所示，其核心思想是提供结构化的失败分析反馈，以帮助VLA运用其“先思考后行动”的架构，而不是依赖简单的标量奖励。该方法包含两项核心创新：

1. VLA能力匹配反馈：我们引入了一种基于教师模型的反馈机制，当VLA遇到持续性失败时，该机制会被触发。该模型会生成一份与VLA能力相匹配的结构化诊断报告，精确指出VLA在规划、推理或执行层面的具体错误。
    
2. 反馈引导的改进和重新注入：VLA策略模型（Student）利用该诊断报告生成修正后的轨迹。然后，将这个高奖励的修正样本重新注入到GRPO训练Batch中。该过程提供了一种目标导向的梯度信号，而这种信号在之前的Rollout batch中并不存在。
    

通过在 Navsim 基准测试集上的广泛评估，我们的方法相比现有的 VLA Baseline展现出显著的性能提升。我们的方法在整体驾驶指标 (PDMS、EPDMS) 和高级规划精度方面均达到了 SOTA 水平。通过将可解释反馈与策略修正相结合，我们的工作为 VLA 模型克服自动驾驶中的性能瓶颈提供了一条切实可行的途径。

## 二、ELF-VLA算法详解

![图片](https://mmbiz.qpic.cn/mmbiz_png/wY9PRjOpowzSecRoQ7v7nk7mcofpFSPqdvibwHG5F6iaLDQgvt00ukeGbGicL36kFbykRSwAnyRXU068qEG14DHGD02TZAiaC0RcOL2gn2O7R3Q/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=3)

在本节中，我们展示了我们提出的方法，它主要包含两个组成部分：

- （1）两阶段的监督微调（SFT）过程；
    
- （2）一种通过失败反馈增强的强化学习（RL）框架 。
    

### VLA 输入定义

在我们的方法中，VLA 模型同时作为生成器和优化器，旨在接受两种不同类型的输入：原始的无反馈基础输入，以及包含纠正指导的反馈输入 。

基础输入 (Base inputs)：基础输入查询包括表示为的前视图像、高级导航命令（例如，前进、左转、右转）、自车状态信息（例如，速度和加速度），以及频率为2Hz的过去三帧的历史轨迹。

反馈输入 (Feedback inputs)：基于基础输入，VLA模型输出一个原始响应，由包含思维链（CoT）的轨迹组成，然后基于阈值进行分类：PDMS得分超过的响应被视为“正确”的（），而得分低于的响应被视为“错误”的（）。

在响应正确的情况下，相应的反馈输入由三个部分组成：原始的基础输入 、正确的响应本身，以及基于规则的正向反馈。对于错误的响应，我们通过VLM教师模型引入外部干预。该教师模型接收基础输入 、错误的轨迹和真实（ground-truth）轨迹 ，从而生成结构化的反馈。

此反馈包括：

- （1）元动作分析（Meta Action Analysis）；
    
- （2）思考过程分析（Think Process Analysis）；
    
- （3）安全失败分析（Safety Failure Analysis）；
    
- （4）效率失败分析（Efficiency Failure Analysis）；
    
- （5）可执行的修正方案（包含横向和纵向组件）。
    

随后，通过结合基础输入、原始的错误响应  和生成的结构化反馈，来构建 VLA 的最终反馈输入。

### 用于认知和优化的两阶段SFT

我们采用两阶段的监督微调过程来开发一个结合了驾驶知识和轨迹规划能力的模型 。第一阶段旨在为模型注入通用的驾驶知识 。第二阶段则致力于使模型具备轨迹预测的能力，以及基于接收到的反馈实施优化的能力 。

在第一阶段，模型在一个包含大量驾驶相关问答对的数据集上进行预训练，以增强其对驾驶领域认知的理解。该数据集由多种开源驾驶问答数据集组成，包括DriveLM、LingoQA、Impromptu VLA以及其他开源驾驶数据集。此外，我们遵循CoT范式为NAVSIM构建了多轮问答推理数据集。此阶段解决的任务包括道路边界估计（可行驶区域）、关键目标识别（目标定位）、自车动作预测以及相关的交通语义。

随后，第二阶段引入了轨迹预测和优化任务。对于每个查询和（在第3.3节中定义），模型的输出受到真实轨迹的监督，旨在最大化条件似然：

其中表示包含的数据集，表示VLA模型。这种混合数据集训练方法使模型具备了轨迹预测和基于反馈的轨迹优化的双重能力，从而使模型能够在随后的强化学习阶段有效利用失败反馈 。

### 带有失败反馈的强化学习

我们的失败反馈机制用于GRPO算法的Rollout阶段。自动驾驶的传统 VLA 模型通常在RL训练期间遇到性能瓶颈。发生这种情况是因为它们无法有效处理复杂的长尾场景；因此，在这些情况下采样的轨迹获得的驾驶分数极低，导致了奖励稀疏问题。我们的方法通过引入一种反馈机制来解决这个问题，该机制成功提高了模型在这些关键场景中的驾驶分数，从而使智能体能够突破性能瓶颈。

高效的困难样本筛选。在引入带有反馈机制的GRPO之前，我们首先执行一种具有成本效益的数据筛选，以最大化训练效率。常规的RL训练常常将资源浪费在提供微弱学习信号的过于简单的场景上。我们的筛选旨在过滤掉这些样本，并将智能体集中在那些高价值、信息丰富的场景上，这些场景既包括困难样本（模型持续失败的地方），也包括模糊样本（模型最不确定的地方）。为了实现这一目标，我们利用SFT模型对每个样本进行次采样，并估计其平均奖励和奖励方差。然后我们丢弃具有高平均奖励和低方差特征的样本，因为这些指标表明模型在这些场景下能持续成功。这种策略有效地将训练集中在困难（低均值，低方差）和模糊（高方差）的场景上。通过这种方法，我们将最初的85k训练条目过滤成了一个包含24k高价值场景的核心数据集。

**奖励建模**。为了激励VLA模型学习有效的驾驶行为并确保其输出格式的稳定性，我们设计了一个包含三个组成部分的奖励函数：PDMS奖励、格式奖励和目标奖励。强化学习过程中的整体奖励是通过整合这部分来计算的，具体如下：

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/wY9PRjOpowxibuibpKaiaUnWTAic2xRLYYrngcQwibfZ5ImB4cAcD3fMaMV7W8dL6o1JmGEASzvn6xZjb3I7mI4xS8N8AI7rhLVOMmnUAtTia5CNI/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=4)

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/wY9PRjOpowzb1wnYLMBVPOMxLVO3Dsc5dInib3MzY1vmaCoOribrdEuz3qekRVNBX6uYEtpwyDJXswVDxY00ztbvcZRiatn3nsvgBQbJ6Ewlz4/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=5)

**带反馈的GRPO**。 我们的方法采用了一种反馈机制来优化轨迹并增强奖励，从而使VLA模型能够超越其性能瓶颈。更具体地说，该过程首先使用基础输入采样一批轨迹响应。然后计算该批次对应的奖励 ，其中包括 、和。基于预定义的阈值，这些响应然后被分为两组：正确的响应  和错误的响应 。最后，遵循第3.1节的过程，对正确和错误的响应进行相应的处理，然后组合以创建最终的反馈输入 。

随后，VLA 模型根据反馈输入 生成一批新的响应 并计算它们的奖励 。我们从 的子集中随机选择个响应，要求这些响应的轨迹奖励 超过原始批次的最大轨迹奖励。如果符合这种“更好”条件的响应少于个，则通过复制获得了此最大奖励的原始响应来填补剩余的空位。由此产生了一个包含个rollout样本的最终批次，然后从该批次中计算相对优势。Rollout更新算法的细节见算法1。GRPO的最终优化目标定义如下：

其中， 是初始 SFT 模型的参考策略， 是一个超参数 。我们只对原始批次的 rollout 样本应用 CLIP 操作，而不对那些已通过反馈进行优化的响应应用 。为了计算优势，我们首先将两组奖励合并为一个统一的集合  。

然后使用这个组合集合的均值和标准差来标准化奖励并计算相对优势  和 ，如下所示：

对于反馈生成的输出的 token 级别概率比率，由于条件设定的不匹配带来了一个挑战。这些样本是使用反馈查询生成的，但我们的优化目标却是以基础查询 为条件的。这种差异可能导致被优化的响应在优化策略下具有极低的概率，从而导致高方差、潜在的梯度爆炸以及训练不稳定性。因此，受LUFFY启发，我们采用Policy Shaping。这项技术为中的低概率token分配了更高的权重。

这种机制鼓励模型从那些罕见但正确的轨迹中学习有价值的知识，而这些知识否则很容易被忽略。标准比率 和policy shaping后的比率  定义如下：

## 实验结果分析

### 实施细节

**指标**：我们在两个不同的自动驾驶方面评估了我们方法的性能：高级规划和轨迹预测。Meta Action：我们使用Meta Action的准确率 (High-Level Planning Accuracy)，它严格要求整个元动作（包括纵向速度和横向路径）与GT完全匹配。这里的Meta Action GT是由GT轨迹生成的，详细信息见附录。

Navsim Benchmark：我们使用NAVSIMv1的PDMS和NAVSIMv2的EPDMS作为闭环规划指标。**训练细节**：我们使用InternVL3-8B作为基础模型，分三个阶段进行训练。首先，我们在大规模驾驶知识数据集上进行预训练。其次，我们在一个混合数据集上微调模型，该数据集由经过筛选的Navsim规划数据集（带有CoT注释）和第3节中的反馈数据集组成。第三，我们使用32张NVIDIA H20 GPU应用强化学习。我们使用 Qwen3-VL-32B作为教师模型。RL参数包括每组8次推演，阈值 ，策略整形参数和个修正响应。

### 性能比较

**Navsim Benchmark。**

表 1 展示了 ELF-VLA 与当前领先方法在 NAVSIMv1 基准测试上的性能比较。在纯视觉（vision-only）设置下，ELF-VLA 获得了 91.0 的 PDMS，确立了新的最先进水平（SOTA）。这一结果表明，与之前最好的纯视觉方法 DriveVLA 相比，其 PDMS 取得了 0.7 的显著提升。此外，ELF-VLA 分别以 3.6 和 2.0 的 PDMS 优势超越了仅使用监督微调（SFT-only，InternVL3-8B-SFT）和传统强化学习（traditional RL，InternVL3-8B-RL）的baseline模型。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/wY9PRjOpowyh4KxFOMlS9nOz0b4AkESDLp8yzsvBpenGCNMTXzAawwNdBGBgpuY0Z32wLTjxrEv3CImm2npnDYl5308I5OW49ib7TrFpTpFA/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=6)

在 NAVSIMv2 基准测试（表2）中，ELF-VLA 延续了其强劲的表现，以 87.1 的 EPDMS 创下了新的 SOTA。这一得分比之前由 DriveVLA-W0 创下的最佳成绩高出了 1.0 个 EPDMS。这些发现表明，与传统的强化学习方法相比，我们的方法 ELF-VLA 显著增强了模型的自动驾驶能力，特别是在应对具有挑战性的复杂驾驶场景时。此外，在两个基准测试中的出色表现证实，ELF-VLA 并非仅仅是对 PDMS 指标的过拟合；相反，它在截然不同且更为全面的 EPDMS 指标上同样表现优异，展现出了强大的泛化能力。

![图片](https://mmbiz.qpic.cn/mmbiz_png/wY9PRjOpowz7k0WN0nBicbsz3EKPS3QvAzyjmzDiculC5s0tjJlk2iafzNx0183EYMzk4Hia7CUEWj7atav6oKHPQg2Aw4FuY5MFkcFfAKoSZhA/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=7)

**定量评估**。 我们将 ELF-VLA（表 3）的性能与几种精心设计的消融模型进行了比：

- SFT（baseline）：仅通过监督微调训练的基础模型。
    
- GRPO：使用传统的 GRPO 算法对 SFT 模型进行进一步微调。
    
- GT-GRPO：在添加了真实轨迹 (GT) 的响应集上对 SFT 模型进行微调，这些真实轨迹是直接添加的。
    
- Rule-GRPO：在添加了新响应的响应集上对 SFT 模型进行微调，这些新响应是基于预定义规则的反馈重新生成的。
    
- ELF-VLA：SFT模型基于一个包含新的、改进的响应集进行微调，这些响应集是根据我们教师模型的结构化反馈重新生成的。
    

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/wY9PRjOpowwicfBSJGicjzQycRPiblZPmHbusUPgUtcvKDrngkKjXnVia5YxE9plOicicknemEkw8n3x2tsTbQmlqOicaOhoOA4tyGsTsLp6GORSBM/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=8)

值得注意的是，ELF-VLA 实现了最佳的整体性能。我们的方法比传统的GRPO方法高出 2.0 PDMS。这表明，通过引入结构化反馈和重新生成更好的分布内的轨迹，我们的方法解决了持续性失败问题。此外，ELF-VLA 分别超过了 GT-GRPO 和 Rule-GRPO 1.8 和 1.4 PDMS。这凸显了这两个baseline的明显局限性。对于 GT-GRPO，GT 轨迹表现出与原始 VLA 生成的响应有显著的分布偏移。这些低概率性的GT响应使得优化变得困难。对于 Rule-GRPO，预定义规则的反馈对模型的影响有限。这个过程类似于简单的自我修正，缺乏细粒度的指导，导致模型无法从如此简单的反馈中学习到有效的轨迹校正。相反，ELF-VLA 利用教师模型广泛的通用知识对原始响应进行深入的结构化分析。VLA 模型接收这种全面的反馈，使其能够从错误中学习并微调轨迹。这个过程产生了一个卓越的、更容易优化的微调轨迹。

**总失败率分析**。 我们分析了这些模型在强化学习训练阶段的失败率，如图 4 所示。具体来说，我们测量了所有展开轨迹在以下关键指标上同时失败的样本比例：PDMS、DAC 和 NC。如图所示，虽然像 GT-GRPO 和 Rule-GRPO 这样的中间策略有助于降低失败率，但 ELF-VLA 在所有指标上都展现了最显著的改善。ELF-VLA 将总失败的 PDMS 发生率从 2.73%（对于 GRPO）降低到仅 1.08%，在 NC 和 DAC 上也观察到了同样明显的降低。这一结果进一步验证了我们的方法使模型能够从错误中学习，解决持续失败的问题，并最终提高整体的驾驶安全性和鲁棒性。

![图片](https://mmbiz.qpic.cn/mmbiz_png/wY9PRjOpowyDWxnA7Jicfo5MtnLicZibSz6U9QIgxxcjYVewkccaz2F4fBJTTgV0JiaV6vNTIzunrOS7emsNj5fCWtnJaLzjTQhefg3ic5OsVzZE/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=9)

**Meta Action评估**。 如表4所示，我们的结果突显了ELF-VLA在高层规划方面的显著优势。ELF-VLA在纵向速度精度和横向路径精度方面均取得了最佳结果，整体规划精度高达80.3%，比传统的GRPO高出1.0%。此外，与开源模型相比，ELF-VLA的精度比规模更大的Qwen2.5-VL-72B模型高出51.6%。这一改进源于教师模型提供了修正的meta action，VLA模型学习并内化了这些meta action。这表明ELF-VLA能够从失败案例中学习，从而改进其高层规划策略。 4.3. 消融实验

![图片](https://mmbiz.qpic.cn/mmbiz_png/wY9PRjOpowySn70iaZLUy3MF1XSO1KS3UmetuPkicPxO29e55j94MS9N26ib0jzWY1pSEdD931neRTNqZ4IJSP8ibPtibJhu6Fy2ZFx8fvZja12A/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=10)

**训练数据消融**。 如表 5 所示，我们研究了训练数据量和组成对强化学习 (RL) 的影响。使用完整的 85k 数据集（89.1 PDMS）或随机抽取的 24k 子集（88.9 PDMS）均未获得最优结果。相比之下，我们根据第 3.3 节的指导精心整理的 24k 数据集 (24k*) 取得了 91.0 PDMS 的最佳性能。这表明完整的 85k 数据集主要由简单的场景组成，提供的学习信号有限，从而削弱了整体梯度信号，导致策略更新效率低下，主要集中在已掌握的场景上。我们的整理策略有效地提炼了最有价值的数据。结合我们的反馈机制，这些数据可以针对这些复杂场景进行有针对性的训练。这种方法最终提高了模型性能，并增强了训练效率。

![图片](https://mmbiz.qpic.cn/mmbiz_png/wY9PRjOpowzHwC6tcXic9pe72NAG5CaKHrT4PdrAsT1ictACfXqu0MHtrwPgSAz01dEE9jOGKYhxRCZxkLiaoBAVM6KGM25W2NNA4iaBucKbUn8/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=11)

**反馈数量消融**。 表 6 分析了我们的反馈组件。我们首先改变修正响应的数量 。在  时实现了最佳性能 (91.0 PDMS)。增加会降低性能，在  时降至89.0。这表明虽然单个有针对性的细化是有效的，但多个基于反馈的响应可能会分散策略的注意力。我们还评估了Policy shaping (PS)的效果。移除PS（在  时）导致 PDMS 显著下降1.7%，从91.0降至89.3。这证实了PS对于防止训练崩溃和格式错误至关重要，确保模型能够从高优势、低概率的细化轨迹中正确学习。

![图片](https://mmbiz.qpic.cn/mmbiz_png/wY9PRjOpowzO3aHlO5icxDet6CjfYruIrsqYHC5WSo68sR700Dz0e3ibvib0EDlMmnmbn0cibwiaCjx02ZveG1M3ZViaZ4wJeiccmAylziaF9eWZfiaI/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=12)

### 细化过程的可视化

图 5 展示了一个定性示例，其中 ELF-VLA 在复杂的左转场景中纠正了错误的轨迹。最初的错误轨迹（红色曲线）导致了潜在的碰撞，其根源在于对关键障碍物的严重错误估计（预测：前方 15.57 米，左侧 8.11 米）。我们的教师模型提供了结构化反馈，准确识别了这个“思维过程”错误，并估计了更准确的位置（前方 11.43 米，左侧 4.11 米）。同时，它提供了可操作的更正，例如对目标横向位置和纵向速度的调整。基于此反馈，模型生成了修正后的轨迹（蓝色曲线）。修正方案中相应的“关键障碍物分析”反映了这种修正的感知，使智能体能够规划一条成功避开障碍物的更安全轨迹。

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/wY9PRjOpowwzvAbBiaO4ZdictHibSVHliaDiaN57o3FDVyd6qOCp2vPIbGUeGk31K100XTrET6RtYqLamibAvaje5OqDEicCcUZT4xf593RWUpm8Pg/640?wx_fmt=jpeg&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=13)

## 结论

本文提出了一种名为 ELF-VLA 的框架，用于从失败中显式学习。我们的方法通过一个强大的教师模型增强了 VLA 策略，该教师模型能够生成结构化的诊断报告，并在每次发生故障时识别潜在的故障模式。然后，该策略利用这种显式的、类似人类的反馈来合成一条修正后的、高回报的轨迹。通过将这些修正后的样本重新注入到强化学习 (RL) 训练批次中，ELF-VLA 提供了有针对性的梯度，使该策略能够解决那些无引导探索难以克服的挑战性场景。

该方法的主要局限性在于它依赖于外部教师模型，这本质上限制了学生模型的性能，使其受限于教师的分析能力。此外，所有实验均在 Navsim 基准测试集上进行，这是一个非反应式仿真环境。未来的工作将包括探索不同教师模型的作用，以及在更多样化的数据集上进行闭环评估。