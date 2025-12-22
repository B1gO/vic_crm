# VicCRM

VicCRM is an internal SaaS for managing software engineer candidates from Recruitment to Placement.

## Project Structure

```
vic_crm/
├── frontend/     # Next.js 16 + TailwindCSS v4
│   └── package.json
├── backend/      # Spring Boot 3.4 + Maven + Java 21
│   └── pom.xml
└── README.md
```

## Getting Started

### Frontend
```bash
cd frontend && npm install && npm run dev
```

### Backend
```bash
cd backend && ./mvnw spring-boot:run
```

## Tech Stack
- **Frontend**: Next.js 16, React 19, TailwindCSS v4
- **Backend**: Spring Boot 3.4, Java 21, PostgreSQL, Maven
