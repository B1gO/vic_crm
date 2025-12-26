# Candidate Lifecycle QA Test Plan (Updated)

## Preconditions
- Backend running at `http://localhost:8080`
- Frontend running at `http://localhost:3000`
- Seed data loaded:
  - `./scripts/seed-data-timeline.sh http://localhost:8080`
Note: Each seed run creates new records. If you seeded multiple times, you may see duplicates.

Seeded candidates (latest run):
- Sara: TRAINING / IN_TRAINING (resumeReady=true)
- Zack: SOURCING / SCREENING_SCHEDULED
- Vincent: SOURCING / SOURCED
- Mingkai: MARKETING / MARKETING_ACTIVE
- Emma: SOURCING / SOURCED (no batch)
- Tom: ELIMINATED / CLOSED
- Nina: TRAINING / IN_TRAINING (resumeReady=false)

## Stage Definitions (Quick Ref)
- SOURCING: 招募/筛选
- TRAINING: 培训进行中
- MOCKING: 培训后 Mock 阶段
- MARKETING: 营销期（subStatus 不使用）
- OFFERED: Offer 阶段
- PLACED: 已入职
- ELIMINATED: 淘汰关闭
- WITHDRAWN: 候选人退出
- ON_HOLD: 暂停跟进

## SubStatus Mapping (All Values)
SOURCING:
- SOURCED, CONTACTED, SCREENING_SCHEDULED, SCREENING_PASSED, SCREENING_FAILED
- TRAINING_CONTRACT_SENT, TRAINING_CONTRACT_SIGNED, BATCH_ASSIGNED, DIRECT_MARKETING_READY

TRAINING:
- IN_TRAINING

MOCKING:
- MOCK_THEORY_READY, MOCK_THEORY_SCHEDULED, MOCK_THEORY_PASSED, MOCK_THEORY_FAILED
- MOCK_REAL_SCHEDULED, MOCK_REAL_PASSED, MOCK_REAL_FAILED

MARKETING:
- MARKETING_ACTIVE (占位，不作为子阶段)

OFFERED:
- OFFER_PENDING, OFFER_ACCEPTED, OFFER_DECLINED

ON_HOLD:
- WAITING_DOCS, PERSONAL_PAUSE, VISA_ISSUE, OTHER

PLACED:
- PLACED_CONFIRMED

ELIMINATED:
- CLOSED

WITHDRAWN:
- SELF_WITHDRAWN

## Automated API Validation
Run:
```
./scripts/validate-lifecycle.sh http://localhost:8080
```
Expected: all scenarios PASS.

## API Test Cases (Core Scenarios)

### A) Training Rules
1) Emma -> TRAINING without batch
- POST `/api/candidates/{emmaId}/transition` with `{toStage:"TRAINING"}`
- Expect 400 (batch is required)

2) Batch assigned -> Start batch -> TRAINING
- Assign Emma to batch via candidate update
- POST `/api/batches/{batchId}/start`
- Expect Emma stage=TRAINING

### B) Mocking Rules
3) Batch end -> MOCKING
- POST `/api/batches/{batchId}/end`
- Expect TRAINING candidates move to MOCKING with subStatus=MOCK_THEORY_READY

4) MOCKING -> MARKETING should fail unless MOCK_REAL_PASSED
- POST `/api/candidates/{id}/transition` `{toStage:"MARKETING"}`
- Expect 400 if subStatus != MOCK_REAL_PASSED

### C) Offer Rules
5) MARKETING -> OFFERED requires offerType
- POST `/api/candidates/{id}/transition` `{toStage:"OFFERED"}`
- Expect 400
- POST with `{toStage:"OFFERED", offerType:"W2"}` -> 200

### D) Screening Mock (Event Driven)
6) Create Screening Mock (Mock.stage=Screening)
- POST `/api/mocks` with candidate in SOURCING
- Expect candidate subStatus=SCREENING_SCHEDULED + MOCK timeline event

7) Complete Screening Mock
- PATCH `/api/mocks/{id}` with `completed=true`, decision=`Strong Hire` -> SCREENING_PASSED
- decision=`No Hire` -> SCREENING_FAILED

### E) Theory/Real Mock (Event Driven)
8) Create Theory Mock in MOCKING
- Candidate stage=MOCKING, subStatus=MOCK_THEORY_READY or MOCK_THEORY_FAILED
- POST `/api/mocks` with stage=TechMock -> MOCK_THEORY_SCHEDULED

9) Complete Theory Mock
- decision Strong Hire/Hire -> MOCK_THEORY_PASSED
- decision Weak/No -> MOCK_THEORY_FAILED

10) Create Real Mock only after Theory Passed
- If subStatus != MOCK_THEORY_PASSED -> 400
- If passed -> MOCK_REAL_SCHEDULED

11) Complete Real Mock
- decision Strong Hire/Hire -> MOCK_REAL_PASSED + auto transition to MARKETING
- decision Weak/No -> MOCK_REAL_FAILED (stay in MOCKING)

## UI Test Cases

### 1) Stage/SubStatus selector
- Open candidate detail
- Left column shows stages in order
- Right column shows subStatus for selected stage
- Only current stage allows subStatus update

### 2) Batch Start/End
- Open batch detail page
- Click “Start Batch” -> candidates move to TRAINING
- Click “End Batch” -> TRAINING candidates move to MOCKING

### 3) Mock Flow
- Mocks tab: create Screening mock for SOURCING candidate -> subStatus changes to SCREENING_SCHEDULED
- Complete feedback as Strong Hire -> SCREENING_PASSED
- After batch end, create Theory mock -> MOCK_THEORY_SCHEDULED
- Complete Theory mock as Strong Hire -> MOCK_THEORY_PASSED
- Create Real mock -> MOCK_REAL_SCHEDULED
- Complete Real mock as Strong Hire -> candidate auto moves to MARKETING

### 4) Offer Flow
- From MARKETING, click “Move to OFFERED” and enter offer type (W2/C2C)
- Missing offer type should fail

### 5) Timeline
- Verify timeline shows SUBSTATUS_CHANGED and MOCK/BATCH events with correct titles

## Pass/Fail Criteria
PASS if all required transitions succeed, invalid transitions are blocked with correct errors, and timeline updates match stage/subStatus changes.
