# Releasing

Two paths reach npm, and they are deliberately separate.

| | Stable | Release candidate |
|---|---|---|
| Trigger | version bump commit reaches `main` | push a `v*-*` tag |
| Workflow | `publish.yml` | `release-rc.yml` |
| npm dist-tag | `latest` | `next` |
| Who gets it | `npm i wizzard-stepper-react` | only `npm i wizzard-stepper-react@next` |

Both run the same gate first — lint, `tsc --noEmit`, the unit suite, and
`scripts/smoke-dist.mjs` against React 18 and 19. An RC that skipped the checks
would tell you nothing about the release it stands in for.

## Release candidate

From the branch you want to ship:

```bash
pnpm release:rc:dry   # inspect the version bump, changelog and tag
pnpm release:rc       # bumps to x.y.z-rc.N, commits, tags, pushes
```

`release-it` does not publish to npm itself (`npm.publish: false`). Pushing the
tag is what starts `release-rc.yml`, which runs the gate and publishes with
`--tag next`.

`latest` is untouched, so nobody upgrades into an RC by accident. Verify it in a
real project:

```bash
npm i wizzard-stepper-react@next
```

Further candidates are just `pnpm release:rc` again — `rc.0`, `rc.1`, …

## Promoting an RC

Cut the stable release from the same commit:

```bash
pnpm release:dry
pnpm release
```

There is deliberately no dist-tag move. Two reasons:

1. `latest` pointing at `3.0.0-rc.0` is a bad state — semver-aware tooling and
   humans both read a prerelease version as "not the stable one".
2. npm's trusted publishing does not support `npm dist-tag` over OIDC, so a
   promote workflow would need a long-lived token, reintroducing exactly the
   secret this setup removes.

The RC and the stable build come from the same tree and pass the same gate; the
only difference between the two tarballs is the version string.

## Stable release

```bash
pnpm release:dry     # inspect the computed version and changelog
pnpm release         # bumps, commits, tags, pushes
```

Run it on `main`. The bump commit reaching `main` is what triggers
`publish.yml`, which runs the gate and publishes under `latest`.

## What decides that a release happens

The version in `package.json`, not the push. Do not edit it by hand -
`release-it` derives the next version from the commit history, so a manual bump
gets counted twice (a hand-set `3.0.0` plus a `feat!` commit proposes
`4.0.0`).

`publish.yml` skips when:

- the version is a prerelease - `release-rc.yml` owns those, and a candidate
  must never go out under `latest`;
- the version is already on npm - which is every ordinary merged pull request.

So merging feature work to `main` is quiet. Only a release commit publishes.

## Authentication

Publishing uses npm [trusted publishing](https://docs.npmjs.com/trusted-publishers/):
GitHub Actions mints a short-lived OIDC token, so there is no `NPM_TOKEN` secret
to rotate or leak, and npm attaches a provenance attestation automatically.

Both `publish.yml` and `release-rc.yml` must be registered as trusted publishers
for the package on npmjs.com (Settings -> Trusted publishers), each with:

- Organization or user: `ZizzX`
- Repository: `wizzard-stepper-react`
- Workflow filename: `publish.yml` / `release-rc.yml`

This is why the publish step uses `npm publish` rather than `pnpm publish` -
OIDC is only wired into the npm CLI - and why the workflows pin Node 24 and
upgrade npm: trusted publishing needs Node >= 22.14 and npm >= 11.5.1.

## Rolling back

Published versions cannot be replaced. Move the tag back instead, from a
machine logged in with `npm login` — dist-tag changes cannot go through OIDC:

```bash
npm dist-tag add wizzard-stepper-react@<last-good-version> latest
```

Use `npm deprecate` for a bad version; reach for `npm unpublish` only inside the
72-hour window and only if nothing depends on it yet.

## Checking what is live

```bash
npm dist-tag ls wizzard-stepper-react
npm view wizzard-stepper-react versions --json
```
