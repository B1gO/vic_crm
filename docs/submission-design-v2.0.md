Requirements Context（必须读）

业务目标

我们在做一个 Candidate 管理系统，用于跟踪候选人从 vendor 提交到 client 面试/offer/入职 的全过程，并能记录每一步的结果（pass/fail）与时间线。

核心事实与约束（来自你刚说的）
	1.	流程不固定
	•	OA / Screening / Interview 的顺序和下一步不固定
	•	用户希望：对某一步标记 PASS/FAIL 后，点击 “+” 手动选择下一步 step（而不是系统强制固定 workflow）
	2.	OA 和 Screening 属于 vendor 侧
	•	OA、Vendor Screening 是 vendor 对候选人的评估，不一定绑定某一个具体 position
	•	同一个 candidate 在同一个 vendor 下可能会做 不止一个 OA（多次 attempt）
	3.	同一 vendor 下存在不同 OA 类型（track）
	•	一个 candidate 在同一个 vendor 下可能分别做过：backend OA、fullstack OA、frontend OA 等
	•	投递（submission）时，用户应该能看到该 candidate 在该 vendor 下做过的 OA/Screening 历史
	4.	投递关系是多对多
	•	一个 candidate 可以被 多个 vendor 提交到 不同 positions
	•	一个 vendor 也可以为同一 candidate 提交 多个 positions
	5.	“OA used_for 某次投递”不应成为强约束
	•	允许（可选）把某次 OA/Screening attach 到某次投递（用于复盘/统计/合规）
	•	但 不 attach 也必须能投递（避免过严导致业务卡死）

UI 行为要求
	•	在 Opportunity（投递/流程实例）详情里：step 以树/分支形式展示（支持从某 step 点 “+” 新增下一步，流程可分叉）
	•	在投递时：可见 vendor 侧 OA/Screening 历史，并可选 attach（弱绑定）

⸻

Chosen Design（推荐方案）

分层：VendorEngagement / AssessmentAttempt / Opportunity / PipelineStep + 弱绑定 Link Table
	•	VendorEngagement：Candidate × Vendor 的关系（通道）
	•	AssessmentAttempt：该通道下 vendor 侧评估（OA/Screening），可多次，可 track 区分 backend/fullstack…
	•	Opportunity：一次投递实例（VendorEngagement × Position）
	•	PipelineStep：client-side 流程步骤（interview/offer/placed…），支持 parent_step_id 分支树
	•	opportunity_attempt_link：Opportunity 和 Attempt 的弱绑定（可选 attach，不强制）

⸻

Implementation Plan (Backend → Codex)

Phase 1 — DB Schema & Migration

1.1 Create tables
	•	vendor_engagement
	•	unique(candidate_id, vendor_id)
	•	assessment_template（可选，先简版）
	•	assessment_attempt（vendor-side attempts）
	•	client / position（若已有则复用）
	•	opportunity（投递实例）
	•	pipeline_step（client-side steps tree）
	•	opportunity_attempt_link（弱绑定）

1.2 Constraints (重要)
	•	assessment_attempt.result 仅当 state=Completed 才允许 PASS/FAIL
	•	pipeline_step.result 仅当 state=Completed 才允许 PASS/FAIL
	•	opportunity_attempt_link 不做 mandatory foreign key usage constraints（允许 0 条 link）
	•	索引：
	•	assessment_attempt(vendor_engagement_id, attempt_type, track, happened_at desc)
	•	opportunity(vendor_engagement_id, submitted_at desc)
	•	pipeline_step(opportunity_id, parent_step_id, happened_at)
	•	opportunity_attempt_link(attempt_id)

Phase 2 — Data Migration Rules (if legacy exists)

2.1 Populate vendor_engagement
	•	From old submissions/steps: upsert per (candidate_id, vendor_id)

2.2 Populate opportunities
	•	Create one opportunity per (vendor_engagement_id, position_id) submission instance
	•	If legacy “one submission contains multiple clients/positions” → split into multiple opportunities

2.3 Vendor-side steps → assessment_attempt
	•	OA / Vendor Screening steps migrate into assessment_attempt
	•	track if missing → unknown (or infer by keywords if available)

2.4 Client-side steps → pipeline_step
	•	Interview/Offer/Placed… migrate into pipeline_step(opportunity_id=...)
	•	If legacy is linear: chain parent_step_id sequentially

Phase 3 — Backend APIs (read models & writes)

3.1 Candidate aggregated view

GET /candidates/{id}/engagements
Return:
	•	engagements[]:
	•	vendor info + engagement status
	•	recent attempts summary (OA/Screening with track/result/time)
	•	opportunities summary (position/client/status/latest step)

3.2 Attempts (vendor-side)
	•	GET /vendor-engagements/{id}/attempts?attemptType=&track=&limit=
	•	POST /vendor-engagements/{id}/attempts (create OA/Screening attempt)

3.3 Opportunity (submission instance)
	•	POST /vendor-engagements/{id}/opportunities
Body:
	•	positionId
	•	submittedAt
	•	attachAttemptIds (optional array)
Rules:
	•	if attachAttemptIds empty → still create opportunity

3.4 Steps tree (client-side)
	•	GET /opportunities/{id}/steps
	•	POST /opportunities/{id}/steps (supports parent_step_id)
	•	PATCH /pipeline-steps/{id}

3.5 Weak attach/detach after creation
	•	POST /opportunities/{id}/attempt-links
	•	DELETE /opportunities/{id}/attempt-links/{attemptId}

3.6 Attempt recommendation (not enforced)

When creating/viewing opportunity:
	•	Recommend attempts matching:
	•	same vendor_engagement
	•	attempt_type=OA (or needed type)
	•	track matches position.track (if position has track)
	•	PASS > FAIL, not expired > expired, recent > old

Phase 4 — Status derivation
	•	Default opportunity.status derived from steps:
	•	Placed step completed → Placed
	•	Offer completed → Offered
	•	Any Interview step exists → Interviewing
	•	Else Active
	•	Allow manual override via status_override

⸻

Implementation Plan (Frontend → Claude code)

Page 1: Candidate Detail (group by VendorEngagement)

For each vendor card:
	•	Vendor Assessments panel
	•	list attempts (OA/Screening), show track badges (backend/fullstack…)
	•	add new attempt button
	•	Opportunities panel
	•	each row: client + position + status + latest step summary
	•	click to open Opportunity detail

Page 2: Create Opportunity (Submit)
	•	pick position
	•	right panel: attempts history + recommended attempts
	•	allow selecting attempts to attach (optional)
	•	submit creates opportunity even if no attempt selected

Page 3: Opportunity Detail
	•	header: vendor + client + position + status
	•	section: attached attempts (add/remove)
	•	section: Steps Tree (parent_step_id)
	•	each step supports pass/fail update
	•	“+” adds next step under this step (manual selection of step type)

⸻

Acceptance Criteria (must satisfy)
	1.	Candidate can have multiple OA attempts under same vendor; attempts can be different tracks (backend/fullstack…)
	2.	Creating an opportunity does not require selecting/attaching an OA
	3.	Submission time UI can always see “what OA/screening this candidate has done with this vendor”
	4.	Steps inside an opportunity support non-linear branching via “+ next step” (parent_step_id)
	5.	Offer/Placed are always tied to a single opportunity (single position), never cross-client mixed
---

## UI 实现细节（已实现）

### 内联可展开行（Inline Expandable Rows）
- 替代模态框，直接在页面内展开 Opportunity 详情
- 展开后显示：Attached Assessments、Pipeline Steps Tree
- 右侧状态显示：从加载的实际 steps 数据获取最新状态

### 智能默认展开（Smart Default Expansion）
| 状态 | 默认 | 原因 |
|------|------|------|
| `INTERVIEWING` | ✅ 展开 | 正在面试中 |
| `OFFERED` | ✅ 展开 | 等待决定 |
| `ACTIVE` | ❌ 收起 | 刚提交 |
| `PLACED` | ❌ 收起 | 终止状态 |

### 终止状态（Terminal States - 自动收起）
加载数据后，如果检测到以下终止状态，自动收起：
- `CLIENT_INTERVIEW` 且 `result === 'FAIL'` - 面试失败
- `REJECTED` - 被拒绝
- `WITHDRAWN` - 撤回
- `PLACED` - 已成功入职

### Pass/Fail 按钮逻辑
- 只有 `CLIENT_INTERVIEW` 类型的 Step 显示 Update/Pass/Fail 按钮
- 其他类型（Offer, Placed, Rejected, Withdrawn 等）是终止/里程碑状态，无 Pass/Fail 概念

---

## V2.1 - Position Intake via Vendor (2025-12)

### 背景
Contractor 通常通过 Vendor 获取职位机会信息。虽然 Position 从数据模型上仍属于 Client，但需要支持从 Vendor 页面录入 Position 的工作流。

### 数据模型变更
**Position entity 扩展字段**：
- `sourceVendor` - FK 关联提供职位信息的 Vendor
- `teamName` - Client 内部团队名
- `hiringManager` - 招聘经理
- `track` - 技术方向 (backend/fullstack/frontend/qa/devops)
- `employmentType` - 雇佣类型 (CONTRACT/FULLTIME/C2H)
- `billRate` / `payRate` - 费率
- `headcount` - 招聘人数
- `status` 新增 `ON_HOLD` 状态

### API 扩展
- `GET /api/positions?vendorId={id}` - 查询来源于特定 Vendor 的职位

### Frontend 变更
1. **Vendor 详情页** - 新增 Positions 区块，支持录入 Position（必须选择 Client）
2. **Opportunity 创建** - Position 下拉分组显示：优先展示当前 Vendor 的职位
