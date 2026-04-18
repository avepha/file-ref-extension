# Contributing

## Development

```bash
npm install
npm run build
npm run test
```

## Release workflow

- Pull requests are validated by `.github/workflows/release-validation.yml`.
- Pushes to `main` run `.github/workflows/release.yml`, where `semantic-release` calculates the next SemVer from commit messages and updates `package.json`, `package-lock.json`, and `CHANGELOG.md`. The workflow then packages one versioned VSIX and publishes that same file to both VS Code Marketplace and Open VSX.
- Required repository secrets: `VSCE_PAT` for VS Code Marketplace and `OVSX_PAT` for Open VSX. `GITHUB_TOKEN` comes from GitHub Actions automatically.

### Commit rules

- Use Conventional Commits on the commits that land on `main`.
- `fix:` triggers a patch release.
- `feat:` triggers a minor release.
- Add `!` to the type or include a `BREAKING CHANGE:` footer to trigger a major release.
- `docs:`, `chore:`, `test:`, and `refactor:` do not publish a release unless they also mark a breaking change.
- If you use squash merges, the squash commit title must follow the same format because semantic-release reads the final commits on `main`.

See [docs/release-checklist.md](docs/release-checklist.md) for maintainer setup, secret names, and cross-platform verification guidance.
