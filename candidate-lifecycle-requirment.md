# Candidate Lifecycle Requirements (Revised)

## Stages
SOURCING -> TRAINING -> MOCKING -> MARKETING -> OFFERED -> PLACED
Terminal: ELIMINATED / WITHDRAWN
Overlay: ON_HOLD (can pause any non-terminal stage)

## Stage Definitions + SubStatus

### SOURCING
Purpose: sourcing, outreach, screening, and readiness for training or direct marketing.
SubStatus:
- SOURCED: candidate created in system
- CONTACTED
- SCREENING_SCHEDULED
- SCREENING_PASSED
- SCREENING_FAILED
- TRAINING_CONTRACT_SENT
- TRAINING_CONTRACT_SIGNED
- BATCH_ASSIGNED
- DIRECT_MARKETING_READY

Rules:
- Screening Mock scheduled -> SCREENING_SCHEDULED
- Screening Mock result: Strong Hire/Hire -> SCREENING_PASSED, otherwise SCREENING_FAILED
- Batch assignment allowed even if screening not passed

### TRAINING
Purpose: active training period.
SubStatus: (none required) optional default: IN_TRAINING
Rules:
- Batch start event moves candidates in that batch into TRAINING
- Batch end event moves only TRAINING candidates into MOCKING
- ON_HOLD candidates stay ON_HOLD

### MOCKING (Post-Training)
Purpose: resume prep + mock evaluation (theory then real).
SubStatus:
- MOCK_THEORY_READY (default when entering MOCKING; eligible to schedule theory mock)
- MOCK_THEORY_SCHEDULED
- MOCK_THEORY_PASSED
- MOCK_THEORY_FAILED
- MOCK_REAL_SCHEDULED
- MOCK_REAL_PASSED
- MOCK_REAL_FAILED

Rules:
- Create Theory Mock -> MOCK_THEORY_SCHEDULED
- Complete Theory Mock: Strong Hire/Hire -> MOCK_THEORY_PASSED; else MOCK_THEORY_FAILED
- Create Real Mock only if MOCK_THEORY_PASSED -> MOCK_REAL_SCHEDULED
- Complete Real Mock: Strong Hire/Hire -> MOCK_REAL_PASSED and auto-transition to MARKETING; else MOCK_REAL_FAILED
- Resume prep tracked by resumeReady flag + timeline event

### MARKETING
Purpose: vendor/client submissions and interview pipeline. No subStatus (timeline only).
Rules:
- Submission events write timeline entries (by vendor/client, OA, rounds, etc.)
- Timeline events should reference submissionId so UI can render per-vendor branches

### OFFERED
Purpose: candidate received offer.
SubStatus:
- OFFER_PENDING
- OFFER_ACCEPTED
- OFFER_DECLINED
Other fields:
- offerType: W2 | C2C
Rules:
- Offer event from submissions drives transition to OFFERED

### PLACED
Purpose: candidate started work.
SubStatus:
- PLACED_CONFIRMED
Rules:
- Manual action required to place + startDate required
- After contract ends, candidate can return to MARKETING with reason

### ON_HOLD
Purpose: paused for personal or timing reasons.
SubStatus:
- WAITING_DOCS | PERSONAL_PAUSE | VISA_ISSUE | OTHER
Rules:
- Can pause from any non-terminal stage
- Resume returns to lastActiveStage

### ELIMINATED
Purpose: closed for negative outcome.
SubStatus:
- CLOSED

### WITHDRAWN
Purpose: candidate exited by choice.
SubStatus:
- SELF_WITHDRAWN

---

## Event-Driven Rules Summary

### Screening Mock
- Create Mock(stage=Screening): if stage=SOURCING -> SCREENING_SCHEDULED
- Complete Mock(stage=Screening):
  - decision Strong Hire/Hire -> SCREENING_PASSED
  - else -> SCREENING_FAILED

### Batch
- Assign batch (candidate.batch set): subStatus -> BATCH_ASSIGNED (no screening requirement)
- Batch start: all candidates in batch -> TRAINING
- Batch end: only TRAINING candidates -> MOCKING (subStatus -> MOCK_THEORY_READY)

### Mocking
- Create Theory Mock -> MOCK_THEORY_SCHEDULED
- Complete Theory Mock: pass -> MOCK_THEORY_PASSED; fail -> MOCK_THEORY_FAILED
- Create Real Mock only if MOCK_THEORY_PASSED -> MOCK_REAL_SCHEDULED
- Complete Real Mock: pass -> MOCK_REAL_PASSED + stage -> MARKETING

### Marketing
- Submissions drive timeline events; no separate INTERVIEWING stage

### Offer / Placed
- Offer event drives stage -> OFFERED with offerType
- Place requires manual action + startDate
- Contract end can move candidate back to MARKETING (reason required)

---

## Manual Overrides
Recruiters can manually change stages or subStatus (with reason) for special cases:
- Late batch joiners
- Retroactive corrections
- Exception handling

All manual changes must still obey stage/subStatus validation rules.
