# Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.
All commits — including those made by AI agents — must follow this format.

## Format

```
<type>(<scope>): <description>
```

### Types

| Type     | Usage                                      |
|----------|--------------------------------------------|
| `feat`   | A new feature                              |
| `fix`    | A bug fix                                  |
| `docs`   | Documentation only changes                 |
| `style`  | Formatting, missing semicolons, etc.       |
| `refactor` | Code change that neither fixes nor adds |
| `test`   | Adding or updating tests                   |
| `ci`     | CI configuration and scripts               |
| `chore`  | Maintenance, deps, build tooling           |

### Scope

One of: `frontend`, `backend`, `e2e`, `spec`, `ci`, `docs`.

### Description

- Imperative mood, lowercase, no period
- Keep under 72 characters

### Examples

```
feat(backend): add slot generation with timezone support
fix(frontend): show times in owner timezone instead of UTC
test(e2e): add booking conflict scenario
ci: add Playwright e2e workflow
docs: update README with setup instructions
```

## Rationale

Consistent commit format enables automatic changelog generation and version
bumping via [release-please](https://github.com/googleapis/release-please).
