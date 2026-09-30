# Contributing to IntelliQuiz

Thanks for contributing to IntelliQuiz.

## Development setup

1. Install Node.js 20 or newer.
2. Clone the repository and enter the project directory.
3. Copy .env.example to .env.local.
4. Configure Auth.js, PostgreSQL, and the AI provider credentials required by your local setup.
5. Install dependencies with npm install.
6. Generate the Prisma client with npm run db:generate.
7. Apply the development schema with npm run db:push.
8. Start the app with npm run dev.

## Before opening a pull request

- Keep changes focused and explain user-visible behavior.
- Run npm run lint and npm run build when practical.
- If the Prisma schema changes, explain the migration/schema impact.
- If Socket.IO events change, document compatibility and client/server implications.
- If authentication or authorization changes, describe the security impact.
- Never commit API keys, OAuth secrets, database URLs, or production credentials.
- Update the README or architecture documentation when behavior or deployment assumptions change.
- Add or update tests when test infrastructure exists for the affected area.

## Commit style

Prefer small, descriptive commits such as:
- docs: clarify deployment setup
- feat: add quiz export
- fix: handle disconnected participants
- refactor: isolate session state

## Pull requests

Include:
- what changed
- why it changed
- how it was verified
- configuration or migration steps, if any
- screenshots for meaningful UI changes

## Architecture-sensitive changes

IntelliQuiz combines Next.js, a custom Node HTTP server, Socket.IO, Prisma/PostgreSQL, authentication, and external AI providers. Changes crossing these boundaries should be reviewed with the architecture guide in mind.

## License

By contributing, you agree that your contributions are provided under the repository's MIT License.
