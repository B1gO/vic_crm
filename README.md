# VicCRM

VicCRM is an internal SaaS for managing software engineer candidates from Recruitment to Placement.

## Project Structure

```
vic_crm/
├── frontend/     # Next.js 16 + TailwindCSS v4
│   └── package.json
├── backend/      # Spring Boot 3.4 + Maven + Java 17
│   └── pom.xml
└── README.md
```

## Getting Started

### Frontend
```bash
cd frontend && npm install && npm run dev
```
Open http://localhost:3000

### Backend
```bash
cd backend && ./mvnw spring-boot:run
```
Server runs on http://localhost:8080

**H2 Console**: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:viccrm`
- Username: `sa`
- Password: (empty)

---

## Tech Stack
- **Frontend**: Next.js 16, React 19, TailwindCSS v4
- **Backend**: Spring Boot 3.4, Java 17, H2/PostgreSQL, Maven

---

## API Endpoints

### Users (Recruiters & Admins)
- [x] `GET /api/users` - List all users
- [x] `GET /api/users/{id}` - Get user by ID
- [x] `GET /api/users?role={role}` - Filter users by role (ADMIN, RECRUITER)
- [x] `POST /api/users` - Create user
- [x] `PUT /api/users/{id}` - Update user
- [x] `DELETE /api/users/{id}` - Delete user

### Candidates
- [x] `GET /api/candidates` - List all candidates
- [x] `GET /api/candidates/{id}` - Get candidate by ID
- [x] `GET /api/candidates?stage={stage}` - Filter by lifecycle stage
- [x] `POST /api/candidates` - Create candidate
- [x] `PUT /api/candidates/{id}` - Update candidate
- [x] `POST /api/candidates/{id}/transition` - Change lifecycle stage
- [x] `GET /api/candidates/{id}/transitions` - Get transition history

### Batches
- [x] `GET /api/batches` - List all batches
- [x] `GET /api/batches/{id}` - Get batch by ID
- [x] `POST /api/batches` - Create batch
- [x] `PUT /api/batches/{id}` - Update batch
- [x] `DELETE /api/batches/{id}` - Delete batch

---

## Lifecycle Stages

```
RECRUITMENT → TRAINING → MARKET_READY → PLACED
     ↓            ↓            ↓
 ELIMINATED   ELIMINATED   ELIMINATED
```

### Stage Transitions
| From | Allowed To |
|------|------------|
| RECRUITMENT | TRAINING, ELIMINATED |
| TRAINING | MARKET_READY, ELIMINATED |
| MARKET_READY | PLACED, ELIMINATED |
| PLACED | (none) |
| ELIMINATED | (none) |
