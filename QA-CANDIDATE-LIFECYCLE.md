# Candidate Lifecycle QA Test Plan (Detailed)

## 0. Scope
This plan verifies the candidate lifecycle state machine, validation rules, timeline events, and UI behavior. It covers:
- All stage transitions (success + failure paths)
- All sub-status (substage) values and stage/subStatus compatibility
- Validation rules (resumeReady, batch, reasons, dates)
- Timeline event creation and rendering
- UI behavior and error handling

## 1. Test Environment
Backend: Spring Boot on `http://localhost:8080`
Frontend: Next.js on `http://localhost:3000`
Database: H2 (dev)

## 2. Test Data Setup
Run once on a clean DB:
```
./scripts/seed-data-timeline.sh http://localhost:8080
```
Notes:
- The script assumes a clean DB. Multiple runs create duplicates.
- If duplicates exist, restart backend (H2 resets) and seed once.

Seeded candidates (latest run):
- Sara: TRAINING / IN_TRAINING, resumeReady=true, batch=Java 202601
- Zack: SOURCING / SCREENING_SCHEDULED
- Vincent: SOURCING / SOURCED
- Mingkai: MARKETING / RESUME_READY
- Emma: SOURCING / SOURCED (no batch)
- Tom: ELIMINATED / CLOSED
- Nina: TRAINING / IN_TRAINING, resumeReady=false, batch=Java 202601

## 3. Stage Meaning + Entry Preconditions
SOURCING
Meaning: sourcing, outreach, screening pipeline.
Entry: default stage; no extra requirements.

TRAINING
Meaning: candidate is in training batch.
Entry: batch assigned AND subStatus=SCREENING_PASSED.

MARKETING
Meaning: candidate is ready to market to vendors/clients.
Entry (from TRAINING): resumeReady must be true.
Entry (direct from SOURCING): subStatus must be DIRECT_MARKETING_READY AND profile completeness required: name, (email or phone), workAuth, techTags, (city or state), resumeReady=true.
Return from INTERVIEWING/PLACED requires reason.

INTERVIEWING
Meaning: vendor/client interview rounds ongoing.
Entry: allowed only from MARKETING. No additional required fields.
Return from OFFERED requires reason.

OFFERED
Meaning: offer stage.
Entry: allowed only from INTERVIEWING. No additional required fields.

PLACED
Meaning: candidate has started (placed).
Entry: startDate is required.
Return to MARKETING requires reason.

ELIMINATED
Meaning: closed/lost.
Entry: closeReason is required.

WITHDRAWN
Meaning: candidate exited by choice.
Entry: withdrawReason is required.

ON_HOLD
Meaning: paused, waiting for next action.
Entry: holdReason and nextFollowUpAt are required.
Exit: returning to a stage that is NOT lastActiveStage requires reason.

## 4. SubStatus (Substage) Mapping and Meaning
Allowed subStatus values by stage (these are enforced during transition):

SOURCING
- SOURCED: basic sourcing completed
- CONTACTED: contacted candidate
- SCREENING_SCHEDULED: screening scheduled
- SCREENING_PASSED: screening passed (required for TRAINING)
- SCREENING_FAILED: screening failed
- DIRECT_MARKETING_READY: ready for direct marketing (required for SOURCING -> MARKETING)

TRAINING
- IN_TRAINING: in training
- HOMEWORK_PENDING: homework pending
- MOCK_IN_PROGRESS: mock ongoing
- TRAINING_COMPLETED: training completed

MARKETING
- RESUME_READY: resume ready for marketing
- PROFILE_PACKAGED: marketing package prepared
- VENDOR_OUTREACH: outreach to vendors started
- SUBMITTED: submitted to vendor/client

INTERVIEWING
- VENDOR_SCREEN: vendor screening
- CLIENT_ROUND_1: client round 1
- CLIENT_ROUND_2: client round 2
- CLIENT_ROUND_3_PLUS: client round 3+

OFFERED
- OFFER_PENDING: offer pending
- OFFER_ACCEPTED: offer accepted
- OFFER_DECLINED: offer declined

ON_HOLD
- WAITING_DOCS: waiting for docs
- PERSONAL_PAUSE: personal pause
- VISA_ISSUE: visa issue
- OTHER: other hold reason

PLACED
- PLACED_CONFIRMED: placement confirmed

ELIMINATED
- CLOSED: closed

WITHDRAWN
- SELF_WITHDRAWN: self withdrawn

Default subStatus per stage (when not provided in transition):
SOURCING=SOURCED, TRAINING=IN_TRAINING, MARKETING=RESUME_READY, INTERVIEWING=VENDOR_SCREEN,
OFFERED=OFFER_PENDING, ON_HOLD=OTHER, PLACED=PLACED_CONFIRMED, ELIMINATED=CLOSED, WITHDRAWN=SELF_WITHDRAWN.

## 5. Allowed Transitions Matrix (Summary)
SOURCING -> TRAINING | MARKETING | ELIMINATED | WITHDRAWN | ON_HOLD
TRAINING -> MARKETING | ELIMINATED | WITHDRAWN | ON_HOLD
MARKETING -> INTERVIEWING | ELIMINATED | WITHDRAWN | ON_HOLD
INTERVIEWING -> OFFERED | MARKETING | ELIMINATED | WITHDRAWN | ON_HOLD
OFFERED -> PLACED | INTERVIEWING | ELIMINATED | WITHDRAWN | ON_HOLD
PLACED -> MARKETING | ELIMINATED | WITHDRAWN
ELIMINATED -> SOURCING | TRAINING | MARKETING | INTERVIEWING | OFFERED
WITHDRAWN -> SOURCING | TRAINING | MARKETING | INTERVIEWING | OFFERED
ON_HOLD -> SOURCING | TRAINING | MARKETING | INTERVIEWING | OFFERED

Any other transition should fail with 400.

## 6. Automated API Validation
Run:
```
./scripts/validate-lifecycle.sh http://localhost:8080
```
Expected: all scenarios PASS, timeline events created for each transition.

## 7. Detailed API Test Cases (All Scenarios)
Use curl examples; replace IDs as needed. When creating QA candidates, use unique names (prefix QA_) to avoid confusion.

### 7.1 Candidate Creation Baseline
TC-API-01 Create candidate (default stage/subStatus)
Preconditions: backend running.
Steps:
1) POST /api/candidates with name + email.
Expected: stage=SOURCING, subStatus=SOURCED, timeline has CANDIDATE_CREATED.

### 7.2 SubStatus Enforcement (Stage Compatibility)
TC-API-02 Invalid subStatus for stage
Preconditions: candidate in MARKETING.
Steps:
1) POST transition to MARKETING with toSubStatus=CLIENT_ROUND_1.
Expected: 400 with “SubStatus CLIENT_ROUND_1 is not allowed for stage MARKETING”.

TC-API-03 Valid subStatus for stage
Preconditions: candidate in MARKETING.
Steps:
1) POST transition to MARKETING with toSubStatus=VENDOR_OUTREACH.
Expected: success, stage=MARKETING, subStatus=VENDOR_OUTREACH, timeline event STAGE_CHANGED.

### 7.3 SOURCING -> TRAINING (Batch + SCREENING_PASSED)
TC-API-04 Fail when no batch
Preconditions: candidate in SOURCING, subStatus=SCREENING_PASSED, batch=null.
Steps:
1) POST transition to TRAINING.
Expected: 400 “batch is required for TRAINING”.

TC-API-05 Fail when subStatus not SCREENING_PASSED
Preconditions: candidate in SOURCING, subStatus=CONTACTED, batch assigned.
Steps:
1) POST transition to TRAINING.
Expected: 400 “SCREENING_PASSED is required to enter TRAINING”.

TC-API-06 Success when batch + SCREENING_PASSED
Preconditions: candidate in SOURCING, subStatus=SCREENING_PASSED, batch assigned.
Steps:
1) POST transition to TRAINING.
Expected: 200, stage=TRAINING, subStatus defaults to IN_TRAINING (or provided), timeline event STAGE_CHANGED.

### 7.4 SOURCING -> MARKETING (Direct Marketing)
TC-API-07 Fail without DIRECT_MARKETING_READY
Preconditions: candidate in SOURCING, subStatus!=DIRECT_MARKETING_READY.
Steps:
1) POST transition to MARKETING.
Expected: 400 “DIRECT_MARKETING_READY is required for direct marketing”.

TC-API-08 Fail on incomplete profile
Preconditions: candidate in SOURCING, subStatus=DIRECT_MARKETING_READY, missing techTags or workAuth or city/state or resumeReady.
Steps:
1) POST transition to MARKETING.
Expected: 400 with specific missing field message.

TC-API-09 Success on direct marketing
Preconditions: candidate in SOURCING, subStatus=DIRECT_MARKETING_READY, name + (email/phone) + workAuth + techTags + city/state + resumeReady=true.
Steps:
1) POST transition to MARKETING.
Expected: 200, stage=MARKETING, subStatus defaults to RESUME_READY (or provided), timeline event STAGE_CHANGED.

### 7.5 TRAINING -> MARKETING (Resume Ready)
TC-API-10 Fail when resumeReady=false
Preconditions: candidate in TRAINING with resumeReady=false.
Steps:
1) POST transition to MARKETING.
Expected: 400 “resumeReady must be true to enter MARKETING”.

TC-API-11 Success when resumeReady=true
Preconditions: candidate in TRAINING with resumeReady=true.
Steps:
1) POST transition to MARKETING.
Expected: 200, stage=MARKETING, timeline event STAGE_CHANGED.

### 7.6 MARKETING -> INTERVIEWING
TC-API-12 Success (no extra rules)
Preconditions: candidate in MARKETING.
Steps:
1) POST transition to INTERVIEWING with toSubStatus=CLIENT_ROUND_1 (optional).
Expected: 200, stage=INTERVIEWING, subStatus set, timeline event STAGE_CHANGED.

### 7.7 INTERVIEWING -> OFFERED
TC-API-13 Success (no extra rules)
Preconditions: candidate in INTERVIEWING.
Steps:
1) POST transition to OFFERED.
Expected: 200, stage=OFFERED, timeline event OFFERED.

### 7.8 OFFERED -> PLACED (Start Date Required)
TC-API-14 Fail when startDate missing
Preconditions: candidate in OFFERED.
Steps:
1) POST transition to PLACED without startDate.
Expected: 400 “startDate is required for PLACED”.

TC-API-15 Success when startDate provided
Preconditions: candidate in OFFERED.
Steps:
1) POST transition to PLACED with startDate.
Expected: 200, stage=PLACED, timeline event PLACED.

### 7.9 ELIMINATED / WITHDRAWN Requirements
TC-API-16 ELIMINATED requires closeReason
Preconditions: candidate in MARKETING.
Steps:
1) POST transition to ELIMINATED without closeReason.
Expected: 400 “closeReason is required for ELIMINATED”.

TC-API-17 ELIMINATED success
Preconditions: candidate in MARKETING.
Steps:
1) POST transition to ELIMINATED with closeReason=NO_RESPONSE.
Expected: 200, stage=ELIMINATED, subStatus=CLOSED, timeline event ELIMINATED.

TC-API-18 WITHDRAWN requires withdrawReason
Preconditions: candidate in MARKETING.
Steps:
1) POST transition to WITHDRAWN without withdrawReason.
Expected: 400 “withdrawReason is required for WITHDRAWN”.

TC-API-19 WITHDRAWN success
Preconditions: candidate in MARKETING.
Steps:
1) POST transition to WITHDRAWN with withdrawReason.
Expected: 200, stage=WITHDRAWN, subStatus=SELF_WITHDRAWN, timeline event WITHDRAWN.

### 7.10 ON_HOLD Requirements + Return Logic
TC-API-20 ON_HOLD requires holdReason and nextFollowUpAt
Preconditions: candidate in MARKETING.
Steps:
1) POST transition to ON_HOLD missing holdReason or nextFollowUpAt.
Expected: 400 “holdReason and nextFollowUpAt are required for ON_HOLD”.

TC-API-21 ON_HOLD success
Preconditions: candidate in MARKETING.
Steps:
1) POST transition to ON_HOLD with holdReason + nextFollowUpAt.
Expected: 200, stage=ON_HOLD, lastActiveStage=MARKETING, timeline event ON_HOLD.

TC-API-22 ON_HOLD return to lastActiveStage (no reason)
Preconditions: candidate in ON_HOLD with lastActiveStage=MARKETING.
Steps:
1) POST transition to MARKETING without reason.
Expected: 200 success.

TC-API-23 ON_HOLD jump to different stage requires reason
Preconditions: candidate in ON_HOLD with lastActiveStage=MARKETING.
Steps:
1) POST transition to INTERVIEWING without reason.
Expected: 400 “reason is required to jump from ON_HOLD to a new stage”.

### 7.11 Reactivation (from ELIMINATED / WITHDRAWN)
TC-API-24 Reactivation requires reactivateReason
Preconditions: candidate in ELIMINATED.
Steps:
1) POST transition to MARKETING without reactivateReason.
Expected: 400 “reactivateReason is required to reactivate a candidate”.

TC-API-25 Reactivation success
Preconditions: candidate in ELIMINATED.
Steps:
1) POST transition to MARKETING with reactivateReason.
Expected: 200, stage=MARKETING, timeline event REACTIVATED.

### 7.12 Return-to-Stage Reasons
TC-API-26 INTERVIEWING -> MARKETING requires reason
Preconditions: candidate in INTERVIEWING.
Steps:
1) POST transition to MARKETING without reason.
Expected: 400 “reason is required to return to MARKETING”.

TC-API-27 OFFERED -> INTERVIEWING requires reason
Preconditions: candidate in OFFERED.
Steps:
1) POST transition to INTERVIEWING without reason.
Expected: 400 “reason is required to return to INTERVIEWING”.

TC-API-28 PLACED -> MARKETING requires reason
Preconditions: candidate in PLACED.
Steps:
1) POST transition to MARKETING without reason.
Expected: 400 “reason is required to return to MARKETING”.

### 7.13 Invalid Transition Matrix
TC-API-29 Block invalid transition
Preconditions: candidate in MARKETING.
Steps:
1) POST transition to TRAINING.
Expected: 400 “Transition from MARKETING to TRAINING is not allowed”.

### 7.14 Timeline Event Verification
TC-API-30 Event type mapping
Preconditions: candidate transitions through stages.
Steps:
1) Perform transitions to ON_HOLD, ELIMINATED, WITHDRAWN, OFFERED, PLACED, REACTIVATED.
2) GET /api/candidates/{id}/timeline.
Expected: eventType is ON_HOLD / ELIMINATED / WITHDRAWN / OFFERED / PLACED / REACTIVATED accordingly. Each event contains fromStage/toStage/subStatus.

## 8. Detailed UI Test Cases (All Scenarios)
UI only supports stage transitions (subStatus is API-only for now). Use API for subStatus coverage in section 7.

UI-01 Dashboard stage cards
Steps:
1) Open `http://localhost:3000`.
Expected: stage cards include Sourcing, Training, Marketing, Interviewing, Offered, Placed, Eliminated, Withdrawn, On Hold.

UI-02 Candidate list shows stage + subStatus
Steps:
1) Open Candidates list.
Expected: each row shows stage badge and subStatus chip.

UI-03 Nina TRAINING -> MARKETING fail (resumeReady=false)
Steps:
1) Open Nina.
2) Click Move to MARKETING.
Expected: inline error banner appears in Market Entry Gate card; no timeline event added; Network shows 400.

UI-04 Sara TRAINING -> MARKETING success
Steps:
1) Open Sara.
2) Click Move to MARKETING.
Expected: success; timeline event added with STAGE_CHANGED; stage badge updates.

UI-05 Emma SOURCING -> TRAINING fail (no batch)
Steps:
1) Open Emma.
2) Click Move to TRAINING.
Expected: prompt may appear for reason if ON_HOLD; otherwise fail with inline error “batch is required for TRAINING”.

UI-06 Zack SOURCING -> TRAINING fail (SCREENING_PASSED required)
Steps:
1) Open Zack (subStatus SCREENING_SCHEDULED).
2) Click Move to TRAINING.
Expected: inline error “SCREENING_PASSED is required to enter TRAINING”.

UI-07 MARKETING -> INTERVIEWING success
Steps:
1) Open Mingkai.
2) Click Move to INTERVIEWING.
Expected: success; timeline event STAGE_CHANGED.

UI-08 INTERVIEWING -> MARKETING requires reason
Steps:
1) Using a candidate in INTERVIEWING, click Move to MARKETING.
2) Cancel the reason prompt.
Expected: transition not executed.

UI-09 OFFERED -> INTERVIEWING requires reason
Steps:
1) Using a candidate in OFFERED, click Move to INTERVIEWING.
2) Cancel the reason prompt.
Expected: transition not executed.

UI-10 PLACED -> MARKETING requires reason
Steps:
1) Using a candidate in PLACED, click Move to MARKETING.
2) Cancel the reason prompt.
Expected: transition not executed.

UI-11 ELIMINATED requires closeReason
Steps:
1) Open any candidate in MARKETING.
2) Click Move to ELIMINATED and cancel closeReason prompt.
Expected: transition not executed.

UI-12 WITHDRAWN requires withdrawReason
Steps:
1) Open any candidate in MARKETING.
2) Click Move to WITHDRAWN and cancel prompt.
Expected: transition not executed.

UI-13 ON_HOLD requires holdReason + nextFollowUpAt
Steps:
1) Open any candidate in MARKETING.
2) Click Move to ON_HOLD and cancel prompts.
Expected: transition not executed.

UI-14 ON_HOLD jump requires reason
Steps:
1) Put candidate ON_HOLD from MARKETING.
2) From ON_HOLD, click Move to INTERVIEWING.
3) Cancel reason prompt.
Expected: transition not executed.

UI-15 Timeline rendering
Steps:
1) Open any candidate with 3+ events.
Expected: timeline shows event date, title, description; icons align with eventType (stage change, offered, placed, eliminated, on hold).

## 9. Pass/Fail Criteria
PASS if all required transitions succeed, invalid transitions are blocked with correct error messages, timeline events are created and rendered correctly, and UI reflects stage/subStatus consistently.

## 10. Known Limitations / Notes
- UI does not allow choosing subStatus; subStatus validation is API-only.
- Timeline events are displayed by eventDate; new events should appear at the top.
- The "Resume Ready" timeline event does not toggle the resumeReady boolean; check Market Entry Gate for the real flag.
