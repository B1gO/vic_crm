# Design Document: Enhanced Submission Pipeline Tracking (V2)

## 1. Overview

The submission pipeline tracks a candidate's journey after being submitted to a **vendor**. The model is **tree-based** (like a mind map), where each node represents a step (OA, Screening, Interview, Offer, etc.) and the user manually adds steps by clicking a "+" button.

## 2. Key Design Decisions

| Question | Decision |
|----------|----------|
| Position pre-defined? | Yes, but can also add inline when creating submission |
| One Submission = multiple Positions? | No. One Submission = one Vendor. Steps can involve different Positions/Clients. |
| Step result | Each step can independently be marked Pass/Fail |
| Submission status | Manual update (not auto-derived) |
| Flow | User manually selects next step (non-linear) |

## 3. Data Model

### 3.1 New Entity: `Position`
```java
@Entity
public class Position {
    Long id;
    String title;              // e.g., "Senior Java Developer"
    
    @ManyToOne
    Client client;             // FK to Client
    
    String description;        // Job description
    String requirements;       // Technical requirements
    String location;           // e.g., "San Jose, CA" or "Remote"
    String status;             // OPEN, CLOSED, FILLED
    String notes;
    
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
```

### 3.2 New Entity: `SubmissionStep`
Replaces the linear status progression. Each step is a node in the tree.

```java
@Entity
public class SubmissionStep {
    Long id;
    
    @ManyToOne
    Submission submission;     // FK
    
    @ManyToOne
    SubmissionStep parentStep; // FK (nullable, root step has no parent)
    
    @Enumerated
    StepType type;             // OA, VENDOR_SCREENING, CLIENT_INTERVIEW, OFFER, PLACED, REJECTED, WITHDRAWN
    
    @ManyToOne
    Position position;         // FK (optional, for interviews/offers)
    
    Integer round;             // Interview round number (1, 2, 3...)
    
    LocalDateTime scheduledAt;
    LocalDateTime completedAt;
    
    @Enumerated
    StepResult result;         // PENDING, PASS, FAIL
    
    String feedback;
    String score;              // For OA
    
    LocalDateTime createdAt;
}
```

### 3.3 Updated `Submission`
Simplified - no longer needs OA/VS flags or round tracking:

```java
@Entity
public class Submission {
    Long id;
    Candidate candidate;
    Vendor vendor;
    String notes;
    
    @Enumerated
    SubmissionStatus status;   // ACTIVE, OFFERED, PLACED, REJECTED, WITHDRAWN
    
    LocalDateTime submittedAt;
    LocalDateTime updatedAt;
}
```

### 3.4 Enums

```java
public enum StepType {
    OA,
    VENDOR_SCREENING,
    CLIENT_INTERVIEW,
    OFFER,
    OFFER_ACCEPTED,
    OFFER_DECLINED,
    PLACED,
    REJECTED,
    WITHDRAWN
}

public enum StepResult {
    PENDING,
    PASS,
    FAIL
}

public enum SubmissionStatus {
    ACTIVE,      // In progress
    OFFERED,     // Has at least one offer
    PLACED,      // Successfully placed
    REJECTED,    // All paths failed
    WITHDRAWN    // Candidate withdrew
}
```

## 4. UI Design

### 4.1 Submission Card (Collapsed)
```
┌────────────────────────────────────────────────────────┐
│ 🏢 Infobahn → eBay                          [ACTIVE] > │
│    Latest: Client Interview R2 - PASS                  │
└────────────────────────────────────────────────────────┘
```

### 4.2 Submission Card (Expanded) - Mind Map View
```
┌────────────────────────────────────────────────────────┐
│ 🏢 Infobahn                                  [ACTIVE]   │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ● Submitted (12/26)                                    │
│  ├─ ✓ OA (12/27) - PASS - Score: 92/100               │
│  │   └─ ✓ Vendor Screening (12/28) - PASS             │
│  │       ├─ ✓ eBay R1 (12/30) - PASS                  │
│  │       │   └─ ⏳ eBay R2 (1/5) - PENDING   [+ Add]   │
│  │       └─ ✓ PayPal R1 (12/31) - PASS                │
│  │           └─ ⭐ Offer (1/3)              [+ Add]   │
│  └─ [+ Add Step]                                       │
│                                                         │
│ ─────────────────────────────────────────────────────  │
│ Status: [ACTIVE ▼]  Notes: [Edit]                      │
└────────────────────────────────────────────────────────┘
```

### 4.3 Add Step Modal
When user clicks `[+ Add]`:
```
┌─────────────────────────────────────────┐
│ Add Next Step                           │
├─────────────────────────────────────────┤
│ Type: [Client Interview ▼]              │
│                                         │
│ Position: [Senior Java Dev @ eBay ▼]    │
│           [+ Add New Position]          │
│                                         │
│ Round: [2]                              │
│ Scheduled: [2025-01-05 10:00]           │
│                                         │
│ [Cancel]                    [Add Step]  │
└─────────────────────────────────────────┘
```

## 5. API Design

### Positions
- `GET /api/positions` - List all positions
- `GET /api/positions?clientId=X` - Filter by client
- `POST /api/positions` - Create position
- `PUT /api/positions/{id}` - Update position

### Submission Steps
- `GET /api/submissions/{id}/steps` - Get all steps as tree
- `POST /api/submissions/{id}/steps` - Add a step (specify parentStepId)
- `PUT /api/steps/{id}` - Update step (scheduledAt, result, feedback)
- `DELETE /api/steps/{id}` - Remove step

### Submission Status
- `PUT /api/submissions/{id}/status` - Manually update status

## 6. Implementation Checklist

### Backend
- [ ] Create `Position` entity and repository
- [ ] Create `SubmissionStep` entity and repository
- [ ] Simplify `Submission` entity
- [ ] Update `SubmissionStatus` enum
- [ ] Create `PositionController` and `PositionService`
- [ ] Create `SubmissionStepService` with tree operations
- [ ] Update `SubmissionController` with new endpoints

### Frontend
- [ ] Create `PositionSelect` component (with inline add)
- [ ] Create `SubmissionStepTree` component (mind map view)
- [ ] Create `AddStepModal` component
- [ ] Update `SubmissionPipelineCard` to use tree view
- [ ] Add step result update UI (Pass/Fail buttons)
- [ ] Add manual status dropdown

### Migration
- [ ] Migrate existing `SubmissionEvent` data to `SubmissionStep`
- [ ] Update seed script
