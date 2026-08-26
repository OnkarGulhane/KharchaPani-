# AGENTS.md — Kharcha Pani

**Read this file before making any change to the repository.**

1. Treat `Prd.md` and `Srs.md` as the source of truth. Do not invent requirements or change approved behavior without explicit approval.

2. Make only the changes required for the requested task. Do not modify unrelated files, functionality, architecture, or existing user changes.

3. V1 scope must remain limited to the approved MVP. Do not pull Phase 2+ features into V1 unless explicitly requested.

4. Read and understand the relevant existing code before changing it. Follow the existing project structure, naming conventions, architecture, and coding style.

5. Never hardcode secrets, credentials, API keys, database URLs, ports, deployment URLs, or environment-specific values. Use environment variables.

6. Never read, expose, modify, print, or commit `.env` / `.env.local` or their secret values.

7. Never hardcode business data. Expenses, budgets, dashboard totals, charts, reports, and transaction data must come from the real database. No demo/fake application data.

8. Only the approved default starter categories may be seeded. Never seed demo expenses or demo budgets.

9. Follow the approved architecture:
   **Next.js → FastAPI → PostgreSQL/Supabase**
   Frontend must never access the database directly.

10. Follow the approved core stack and do not replace technologies unnecessarily:
    Next.js/TypeScript/Tailwind, FastAPI, SQLAlchemy 2.0 async, Alembic, PostgreSQL/Supabase, Zod/react-hook-form, React Query, Recharts, and Framer Motion.

11. Keep backend business logic in services and API contracts in schemas/types. Keep routers focused on request/response handling.

12. Use Alembic for database schema changes. Never manually change the database schema in deployed environments.

13. Store monetary values using precise numeric/decimal types. Never use floating-point persistence for money.

14. Never perform destructive database operations or delete real user data without explicit approval.

15. Preserve required validation on both frontend and backend:
    - amount must be positive;
    - expense date cannot be in the future.

16. Category deletion must follow the approved safe flow:
    unused → delete;
    linked expenses → explicit warning + reassign or confirmed cascade.
    Never silently delete linked expenses.

17. Dashboard, reports, charts, budget balance, comparisons, averages, and category rankings must use real database-driven values.

18. Do not silently bypass or weaken validation, error handling, database constraints, or security checks.

19. V1 access control must remain enabled for all non-health API routes using the shared-access-key mechanism defined in the SRS. Never expose the key.

20. Keep the UI responsive and follow the existing Tailwind/component system. Do not use inline styling. Use Framer Motion only for purposeful micro-interactions.

21. Use 3D only for the limited approved cases such as empty-state or budget-achievement visuals. Never use 3D for authoritative financial charts.

22. When changing backend behavior, update the relevant tests. When changing frontend behavior, update the relevant component/hook tests.

23. Backend tests must continue to cover expenses, categories, budget, and dashboard behavior. Test category reassign/cascade behavior when affected.

24. After changes, run the relevant tests, lint, type checks, build, or migration validation and fix errors caused by the changes.

25. Inspect the final diff and ensure no unrelated changes, hardcoded data, secrets, or disabled checks were introduced.

26. Do not commit, push, force-push, or modify Git history unless explicitly requested. Never push directly to `main`.

27. Never remove tests, disable checks, or use fake/static data as a shortcut to make a feature appear complete.

28. Before declaring a task complete, verify that the implementation matches the relevant PRD/SRS requirement and that existing functionality still works.

29.At the beginning of every new session, before performing any task, respond with exactly:

Hello Omii! AGENTS.md loaded successfully. I am ready to work according to the project rules.

Do not invent, modify, or omit this message. If AGENTS.md is not available or cannot be read, explicitly state that instead of pretending it was loaded.