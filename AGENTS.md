# Repository Guidelines

## Project Structure & Module Organization
- frontend/: Next.js 16 App Router with TypeScript and TailwindCSS v4; routes live in `frontend/app`, shared layout in `frontend/components/layout`, reusable UI in `frontend/components/ui`, domain widgets like tables in `frontend/components`, helpers in `frontend/lib`, shared types in `frontend/types`, and static assets in `frontend/public`. Global theme tokens sit in `frontend/app/globals.css`.
- backend/: Spring Boot 3 (Java 17) with Maven wrapper. Core code is under `backend/src/main/java/com/vic/crm` (controllers, services, repositories, entities, DTOs, enums). Config lives in `backend/src/main/resources/application.properties` (H2 defaults enabled, Postgres block commented). File uploads write to `backend/uploads/`; H2 console available at `/h2-console`.
- scripts/: `scripts/seed-data.sh` seeds sample users, batches, clients, vendors, candidates, and mock criteria after the backend is running.

## Build, Test, and Development Commands
- Frontend: `cd frontend && npm install` (first time), `npm run dev` (localhost:3000), `npm run build` (production bundle), `npm run lint` (eslint-config-next/core-web-vitals).
- Backend: `cd backend && ./mvnw spring-boot:run` (dev server on :8080 with H2), `./mvnw test` (JUnit 5), `./mvnw package` (JAR in target/). For Postgres, export `SPRING_PROFILES_ACTIVE=prod` and use the Postgres block in `application.properties`.
- Data seeding: `./scripts/seed-data.sh http://localhost:8080` to populate demo records.

## Coding Style & Naming Conventions
- Frontend: Use TypeScript; components/pages in PascalCase (e.g., `CandidateTable.tsx`), route folders lowercase. Favor functional components and hooks; style with Tailwind utilities plus `clsx`/`tailwind-merge` for conditional classes. Keep shared types in `types/` and avoid hard-coded colors outside `globals.css` tokens.
- Backend: Java 17, package root `com.vic.crm`; suffix classes with Controller/Service/Repository, DTOs in `dto/`, enums in `enums/`. Prefer constructor injection and Lombok annotations where present. Keep REST paths plural (`/api/users`, `/api/candidates`), and centralize validation in request DTOs.

## Testing Guidelines
- Backend: Add tests in `backend/src/test/java/**` with `*Tests` names. Default H2 config supports integration tests; use `@DataJpaTest`/`@WebMvcTest` for focused coverage and `@SpringBootTest` for full-stack flows. Run `./mvnw test` before opening a PR.
- Frontend: No automated tests yet; at minimum run `npm run lint`. If adding tests, align on React Testing Library for components and Playwright for routes, stored under `frontend/__tests__`.

## Commit & Pull Request Guidelines
- Commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, etc.) as seen in history.
- PRs should include a concise summary, linked issue/feature, test notes (`npm run lint`, `./mvnw test`, seed script if used), and screenshots/GIFs for UI changes. Call out schema/API changes, new environment needs (H2 vs Postgres), and whether uploads data needs cleanup.
