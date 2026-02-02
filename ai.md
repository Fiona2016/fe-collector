### 2.2
https://huggingface.co/learn/agents-course/unit1/agent-steps-and-structure 
AI Agent 三要素：
- Thought 
- Action
- Observation

首先进行思考和推理，根据问题分析需要调用的工具，通过action(tools, mcp, skill)等进行处理，并监听结果。得到结果后再发起第二轮思考。直到observation得到了结果。
这个循环叫做ReAct。

QA
1. think是使用的LLM的能力吗？
    是的。think，一般的流程是将query + system context 发送给LLM，让其返回下一步需要执行的action。
3. observation是一个异步监听吗？观测了什么？ 
   不是。一般情况下指的是调用action得到的结果。为什么不叫result？
   - ReAct 的核心创新之一就是：action 让模型接触外部真实世界，observation 再把外部信息带回来帮助模型继续 reasoning。
   - 这里的observation观测到的内容，是每一步得到的中间态产物，不是最终结果。Observation 是因为它最准确地描述了“外部环境对我 action 的客观回应”，



### 12.30
https://mp.weixin.qq.com/s/xInB5TRU3iESKdkqQQ6qAg 
- 技术债在 AI 眼里并不是“债”，只是更多的代码而已。
- 开发人员还是需要作为第一责任人来负责代码的生成。
- 简单(simple)和容易(easy)不一样，不能贪图一键生成的便利，而导致自己对维护的代码不够了解。


### 12.9
1. b23.tv/tOHOcn4 gemini生成网页，capacitor框架可以支持跨端，思路是生成app，通过webview加载网页。
### 2025

### 学习资料
1. https://intro-llm.github.io/ 大语言模型的教科书，配课件
2. https://github.com/microsoft/AI-For-Beginners
3. https://aigc.phodal.com/prelude.html 

### 12.25 
https://learnprompting.org/zh-Hans/docs/basics/few_shot prompt工程师从入门到进阶，还有专业的培训
