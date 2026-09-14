# Continuous integration

`CI` runs on every pull request, pushes to `main`, and manual dispatch. The
`Required checks` job succeeds only when every test and image build succeeds.
Configure that job as a required branch-protection check in GitHub.

- Web: frozen pnpm install, TypeScript checks, lint, package tests and production build on Node 22.
- Go: all four modules (`server`, `runtime`, `cli`, `e2e`), vet, uncached race tests, coverage and builds.
- Database: isolated PostgreSQL 17 service per Go job. The test user can create the private databases the suites require.
- Images: server, web and Remote runtime Dockerfiles build without publishing or deployment credentials.
- Evidence: complete Go JSON event logs and coverage are uploaded even on test failure. Empty, skipped or unfinished test execution fails CI.

Run the same Go checks locally with `TEST_DATABASE_URL` pointing to a dedicated
test PostgreSQL instance and `bash scripts/ci/go-test.sh server` (or another
module). Never point these tests at a production database.

The integration suite runs real server, runtime and CLI processes with a
simulated coding CLI. CI does not prove live provider execution, OAuth consent,
payment completion, production migration or scheduler handoff. Those remain
separate entries in `migration-verification.md`.
