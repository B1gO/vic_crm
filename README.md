# VicCRM

VicCRM is an internal SaaS for managing software engineer candidates from Recruitment to Placement.

## Project Structure

```
vic_crm/
├── frontend/                    # Next.js 16 + TailwindCSS v4
│   ├── app/                    # App Router pages
│   │   ├── candidates/         # Candidate list & detail
│   │   ├── batches/           # Batch management
│   │   └── users/             # User management
│   ├── components/            # React components
│   │   ├── layout/           # Sidebar, AppShell
│   │   └── ui/               # Card, Button, Badge
│   ├── lib/                   # API client, utilities
│   └── types/                 # TypeScript definitions
│
└── backend/                     # Spring Boot 3.4 + Maven
    └── src/main/java/com/vic/crm/
        ├── controller/        # REST APIs
        ├── service/           # Business logic
        ├── repository/        # Data access
        ├── entity/            # JPA entities
        ├── enums/             # LifecycleStage, WorkAuth, Role
        └── config/            # CORS, etc.
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

## API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |

### Candidates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/candidates` | List all candidates |
| GET | `/api/candidates?stage=TRAINING` | Filter by stage |
| POST | `/api/candidates` | Create candidate |
| PUT | `/api/candidates/{id}` | Update candidate |
| POST | `/api/candidates/{id}/transition` | Change lifecycle stage |
| GET | `/api/candidates/{id}/transitions` | Get transition history |

### Batches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/batches` | List all batches |
| POST | `/api/batches` | Create batch |
| PUT | `/api/batches/{id}` | Update batch |
| DELETE | `/api/batches/{id}` | Delete batch |

---

## Candidate Data Model

### Basic Profile
| Field | Type | Description |
|-------|------|-------------|
| name | string | Full name |
| email, phone | string | Contact info |
| wechatId, wechatName | string | WeChat |
| discordName | string | Discord |
| city, state | string | Location |
| workAuth | enum | CITIZEN, GC, OPT, H1B, CPT |
| education | string | Educational background |
| techTags | string | Skills (comma-separated) |

### Workspace
| Field | Type | Description |
|-------|------|-------------|
| lifecycleStage | enum | RECRUITMENT → TRAINING → MARKET_READY → PLACED |
| batch | FK | Training cohort |
| recruiter | FK | Owner |
| resumeReady | boolean | Gate for Marketing |
| completionRate | int | 0-100% |

---

## Lifecycle Stages

```
RECRUITMENT → TRAINING → MARKET_READY → PLACED
     ↓            ↓            ↓
 ELIMINATED   ELIMINATED   ELIMINATED
```

## Dev Tools

- **H2 Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:viccrm`
  - User: `sa`, Password: (empty)
