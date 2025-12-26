# Design Document: Enhanced Submission Pipeline Tracking

## 1. Overview
The goal of the enhanced submission pipeline is to provide a flexible, granular, and visually intuitive system for tracking candidates once they are submitted to vendors. The pipeline supports optional pre-interview stages (OA, Vendor Screening) and dynamic client interview rounds.

## 2. Core Features
- **Optional Stages**: Support for Online Assessments (OA) and Vendor Screenings that can be toggled per submission.
- **Dynamic Interviews**: Support for a variable number of client interview rounds (1 to N).
- **Outcome Tracking**: Granular tracking of Pass/Fail/Score/Feedback at every stage.
- **Timeline History**: Automatic event logging for every status transition and result recording.
- **Visual Pipeline**: A progress-indicator UI that highlights current, completed, and failed stages.

## 3. Data Model

### 3.1 Enums
#### `SubmissionStatus`
Expanded to include specific states for each stage:
- `SUBMITTED`
- `OA_SCHEDULED`, `OA_PASSED`, `OA_FAILED`
- `VENDOR_SCREENING_SCHEDULED`, `VENDOR_SCREENING_PASSED`, `VENDOR_SCREENING_FAILED`
- `CLIENT_INTERVIEW`
- `OFFERED`, `OFFER_ACCEPTED`, `OFFER_DECLINED`
- `PLACED`, `REJECTED`, `WITHDRAWN`

### 3.2 Entities
#### `Submission`
Enhanced with fields for stage-specific details:
- `hasOa`, `hasVendorScreening`: Flags to enable/disable optional stages.
- `currentRound`, `totalRounds`: To track progress through client interviews.
- `oaScore`, `oaFeedback`, `vendorScreeningFeedback`, `lastFeedback`: For qualitative data.
- `failReason`: Captured specifically when status moves to a "FAILED" state.

#### `SubmissionEvent`
New entity for audit trails and activity feeds:
- `fromStatus`, `toStatus`
- `eventType` (OA, INTERVIEW, STATUS_CHANGE, etc.)
- `title`, `notes`, `result`, `round`
- `actor` (User who performed the action)

## 4. Pipeline Logic

### 4.1 State Machine
The pipeline follows a sequential flow but permits skipping optional stages:
1. **Submitted** -> (Optional OA) -> (Optional Vendor Screen) -> **Client Interview** -> **Offer** -> **Final**

### 4.2 Dynamic Interviews
If `totalRounds` is specified (e.g., 3), the status remains `CLIENT_INTERVIEW` until the 3rd round is recorded as "Passed".
- Round 1 Pass -> Status: `CLIENT_INTERVIEW` (Round incremented)
- Final Round Pass -> Status: `OFFERED`
- Any Round Fail -> Status: `REJECTED`

## 5. API Design
Located in `SubmissionController`:
- `POST /api/submissions`: Create with optional stage flags.
- `POST /api/submissions/{id}/oa/result`: Record result and transition status.
- `POST /api/submissions/{id}/vendor-screening/result`: Record result and transition status.
- `POST /api/submissions/{id}/interview/result`: Handles round logic and auto-advancement.
- `GET /api/submissions/{id}/events`: Returns the timeline for the specific submission.

## 6. Frontend UI
### `SubmissionPipelineCard`
A React component that uses a step-indicator pattern:
- **Icons**: Distinct icons for Submitted, OA, VS, Interview, and Offer.
- **Color Coding**: 
  - Green: Completed
  - Blue: Current
  - Red: Failed
  - Gray: Pending/Skipped
- **Action Dashboard**: Context-aware buttons (e.g., "Schedule OA" only appears if `hasOa` is true and status is `SUBMITTED`).
- **Timeline**: Integrated expander to view the history of the specific submission without leaving the page.
