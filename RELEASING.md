# Releasing

Two paths reach npm, and they are deliberately separate.

| | Stable | Release candidate |
|---|---|---|
| Trigger | merge to `main` | push a `v*-*` tag |
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

When the candidate holds up, run the **Promote to latest** workflow from the
Actions tab with the exact version (e.g. `3.0.0-rc.2`). It moves the `latest`
dist-tag onto that already-published build — nothing is rebuilt, so the bits
people install are the bits that were tested.

Prefer this over re-publishing a stable version with the same code: it removes a
whole class of "the RC passed but the release differs" problems.

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

## Rolling back

Published versions cannot be replaced. Move the tag back instead:

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
