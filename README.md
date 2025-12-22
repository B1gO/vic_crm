# VicCRM

VicCRM is an internal SaaS for managing software engineer candidates from Recruitment to Placement.

## Project Structure

```
vic_crm/
├── frontend/                    # Next.js 16 + TailwindCSS v4
│   ├── app/                    # App Router pages
│   │   ├── candidates/         # Candidate list & detail
│   │   ├── batches/           # Batch list & detail
│   │   └── users/             # User management
│   ├── components/            # React components
│   ├── lib/                   # API client, utilities
│   └── types/                 # TypeScript definitions
│
└── backend/                     # Spring Boot 3.4 + Maven
    └── src/main/java/com/vic/crm/
        ├── controller/        # REST APIs
        ├── service/           # Business logic
        ├── repository/        # Data access
        ├── entity/            # JPA entities
        ├── dto/               # BatchDetail, RecruiterStats
        └── enums/             # LifecycleStage, WorkAuth, etc.
```

## Quick Start

### Backend
```bash
cd backend && ./mvnw spring-boot:run
```
→ http://localhost:8080

### Frontend
```bash
cd frontend && npm install && npm run dev
```
→ http://localhost:3000

---

## Data Model

```
Candidate ──┬── ManyToOne ──▶ Recruiter (User)
            └── ManyToMany ──▶ Batches []

Batch ─────── ManyToOne ──▶ Trainer (User)
```

## API Endpoints

### Candidates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/candidates` | List all |
| POST | `/api/candidates` | Create |
| PUT | `/api/candidates/{id}` | Update |
| POST | `/api/candidates/{id}/transition` | Change stage |
| POST | `/api/candidates/{id}/batches/{batchId}` | Assign to batch |

### Batches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/batches` | List all |
| GET | `/api/batches/{id}/detail` | Get with recruiter stats |
| POST | `/api/batches` | Create |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all |
| POST | `/api/users` | Create |

---

## Lifecycle Stages

```
RECRUITMENT → TRAINING → MARKET_READY → PLACED
     ↓            ↓            ↓
 ELIMINATED   ELIMINATED   ELIMINATED
```

## Dev Tools

- **H2 Console**: http://localhost:8080/h2-console  
  JDBC URL: `jdbc:h2:mem:viccrm`, User: `sa`
