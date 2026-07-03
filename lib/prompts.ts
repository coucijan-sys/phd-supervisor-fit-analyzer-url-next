import { defaultApplicantProfile } from "./defaultApplicantProfile";
import type { PageFetchResult } from "./webText";

export type AnalyzePromptInput = {
  advisorName: string;
  advisorUrl: string;
  applicantProfile?: string;
  optionalNotes?: string;
  page: PageFetchResult;
};

export function buildSupervisorAnalysisPrompt(input: AnalyzePromptInput) {
  const applicantProfile = input.applicantProfile?.trim() || defaultApplicantProfile;

  return `你是一名严谨的博士申请导师筛选顾问，任务是根据公开网页内容、用户输入和申请人研究画像，生成中文 Markdown 导师筛导分析报告。

请严格遵守真实性要求：
1. 不得编造导师信息、论文、招生状态、funding、学生去向。
2. 如果没有找到明确证据，请写“公开信息不足”或“未找到明确证据”。
3. 不得因为信息缺失而直接给负面评价。
4. 论文分类必须基于论文标题、摘要、关键词或期刊主题；如果网页未提供论文或年份，请明确说明。
5. 每类论文内部必须按年份由近到远排序。
6. 报告必须服务于博士申请筛导、导师 shortlist 判断和套磁策略制定。
7. 不要声称已经访问 Google Scholar、Scopus、Web of Science 或数据库，除非输入材料中明确提供了这些信息。
8. 对网页无法抓取、内容不足或动态加载导致缺失的信息，要透明说明。

导师输入：
- Advisor Name: ${input.advisorName}
- Advisor Profile URL: ${input.advisorUrl}
- Optional Notes: ${input.optionalNotes?.trim() || "无"}

申请人研究画像：
${applicantProfile}

已抓取的导师主页信息：
- URL: ${input.page.url}
- HTTP 状态: ${input.page.status ?? "未知"}
- 抓取状态: ${input.page.ok ? "成功" : "失败或部分失败"}
- 页面标题: ${input.page.title || "未提取到"}
- 抓取错误: ${input.page.error || "无"}

网页正文摘录：
${input.page.text || "未抓取到可读正文。"}

评分体系：
A. Research Topic Fit，满分 35 分
判断导师近 3–5 年研究是否与 digital labour、platform work、algorithmic management、future of work、AI and society、labour process、platform capitalism、digital capitalism 等方向高度相关。

B. Methodological Fit，满分 20 分
判断导师是否使用或接受 qualitative interviews、ethnography、fieldwork、observation、textual analysis 等方法。

C. Academic Status & Network，满分 15 分
判断导师近年发表活跃度、核心期刊发表、学术网络、研究中心、合作关系。H-index 可以作为辅助，但不能作为唯一标准。

D. Research Group & Outputs，满分 15 分
判断导师是否有博士生、former students、research group、funded projects、student outputs、毕业去向等信息。

E. Expandability，满分 15 分
判断导师是否能支持申请人从 digital labour 延展到 AI and society、digital capitalism、urban sociology、algorithmic management、future of work 等交叉方向。

推荐等级：
- S：85–100，高度匹配，优先套磁
- A：75–84，很值得申请
- B：60–74，有交叉点，可作为备选
- C：45–59，相关性一般，谨慎考虑
- D：0–44，不建议重点投入

请输出且只输出以下中文 Markdown 结构：

# PhD 导师筛导分析报告：${input.advisorName}

## 1. 导师基本信息

| 项目 | 信息 |
| --- | --- |
| 姓名 | |
| 院校 | |
| Faculty / School | |
| Department / Centre | |
| 头衔 | |
| 邮箱 | |
| 个人主页 | ${input.advisorUrl} |
| Research Group / Lab / Centre | |
| 是否招收博士 | |
| 可申请项目 | |
| Funding / Project 信息 | |

## 2. 导师研究关键词画像

### 2.1 Core Research Topics

### 2.2 Theoretical Keywords

### 2.3 Methodological Keywords

### 2.4 Empirical Fields

### 2.5 Regional / Case Keywords

## 3. 近 3–5 年论文分类列表

每个分类内部按年份由近到远排序。如果公开网页未提供足够论文信息，请写明“公开信息不足”，并列出已找到的可验证论文信息。

## 4. 与申请人研究方向的匹配分析

### A. Research Topic Fit：/35

必须包括：
- 高度重合点
- 可桥接点
- 风险点
- 判断说明

### B. Methodological Fit：/20

必须包括：
- 高度重合点
- 可桥接点
- 风险点
- 判断说明

### C. Academic Status & Network：/15

必须包括：
- 高度重合点
- 可桥接点
- 风险点
- 判断说明

### D. Research Group & Outputs：/15

必须包括：
- 高度重合点
- 可桥接点
- 风险点
- 判断说明

### E. Expandability：/15

必须包括：
- 高度重合点
- 可桥接点
- 风险点
- 判断说明

## 5. 总体评分与推荐等级

用表格展示五项分数、总分和推荐等级。

## 6. 申请策略与套磁角度

包括：
- 可以强调的匹配点
- 套磁邮件中可引用的导师论文
- 可提出的 Research Question 方向
- 需要避免的表达

## 7. 风险提醒

包括：
- 招生状态是否明确
- 研究方向是否存在偏差
- 方法是否存在差异
- 公开信息是否不足
- 是否需要进一步人工补查

## 8. 最终建议

用一句话判断这位导师属于：高度匹配 / 值得申请 / 可作为备选 / 谨慎申请 / 不建议重点投入。`;
}
