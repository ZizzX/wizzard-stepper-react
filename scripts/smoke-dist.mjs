#!/usr/bin/env node
/**
 * Smoke-test the *built* package, not `src/`.
 *
 * Everything else in this repo (unit tests, the demo app) resolves the library
 * through `src/`, so a build that emits a broken bundle, drops an export or
 * ships bad types would pass every existing check. This packs the tarball
 * exactly as npm would, installs it into a throwaway consumer against a real
 * React version, and exercises the public API through `dist`.
 *
 * Usage: node scripts/smoke-dist.mjs [reactMajor]   (default: 18)
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SMOKE = String.raw`
import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { z } from "zod";
import {
  WizardProvider, useWizardContext, createWizardFactory, ZodAdapter,
  LocalStorageAdapter, MemoryAdapter, loggerMiddleware, WizardStepRenderer,
  useWizardValue, useWizardActions, useWizardState, useWizardSelector,
  useWizardError, useWizard, getByPath, setByPath,
} from "wizzard-stepper-react";
import type { IWizardConfig, IStepConfig } from "wizzard-stepper-react";

describe("published package (dist)", () => {
  it("exposes the documented API", () => {
    for (const [name, v] of Object.entries({
      WizardProvider, useWizardContext, createWizardFactory, ZodAdapter,
      LocalStorageAdapter, MemoryAdapter, loggerMiddleware, WizardStepRenderer,
      useWizardValue, useWizardActions, useWizardState, useWizardSelector,
      useWizardError, useWizard, getByPath, setByPath,
    })) {
      expect(v, name).toBeDefined();
    }
  });

  it("validates, navigates and applies dependsOn/clearData", async () => {
    const schema = z.object({ name: z.string().min(3) });
    const steps: IStepConfig<any, any>[] = [
      { id: "a", label: "A", validationAdapter: new ZodAdapter(schema) },
      { id: "b", label: "B", dependsOn: ["name"], clearData: ["derived"] },
    ];
    const config: IWizardConfig<any, any> = { steps };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WizardProvider config={config} initialData={{ name: "", derived: "stale" }}>
        {children}
      </WizardProvider>
    );
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    await act(async () => { await result.current.goToNextStep(); });
    expect(result.current.currentStepId).toBe("a");
    expect(result.current.allErrors.a?.name).toBeTruthy();

    act(() => { result.current.setData("name", "hello"); });
    await waitFor(() => expect(result.current.getData("derived")).toBeUndefined());

    await act(async () => { await result.current.goToNextStep(); });
    await waitFor(() => expect(result.current.currentStepId).toBe("b"));
  });

  it("works through the typed factory", async () => {
    type Data = { user: { email: string } };
    const f = createWizardFactory<Data>();
    const config = { steps: [{ id: "one", label: "One" }] } as any;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <f.WizardProvider config={config} initialData={{ user: { email: "x@y.z" } }}>
        {children}
      </f.WizardProvider>
    );
    const { result } = renderHook(() => f.useWizardValue("user.email"), { wrapper });
    await waitFor(() => expect(result.current).toBe("x@y.z"));
  });

  it("hydrates navigation state from persistence", async () => {
    const adapter = new LocalStorageAdapter("smoke_");
    adapter.saveStep("__wizzard_meta__", {
      currentStepId: "c", visited: ["a", "b", "c"], completed: ["a", "b"], history: ["a", "b", "c"],
    });
    const config = {
      steps: [{ id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }],
      persistence: { adapter },
    } as any;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WizardProvider config={config} initialData={{}}>{children}</WizardProvider>
    );
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper });
    await waitFor(() => expect(result.current.currentStepId).toBe("c"));
    adapter.clear();
  });
});
`;

const CJS = String.raw`
const lib = require("wizzard-stepper-react");
const need = ["WizardProvider","useWizardContext","createWizardFactory","ZodAdapter",
  "YupAdapter","LocalStorageAdapter","MemoryAdapter","loggerMiddleware","devToolsMiddleware",
  "WizardStepRenderer","WizardDevTools","useWizardValue","useWizardActions","useWizardState",
  "useWizardSelector","useWizardError","useWizard","getByPath","setByPath","toPath","shallowEqual"];
const missing = need.filter((k) => lib[k] === undefined);
if (missing.length) { console.error("MISSING CJS EXPORTS:", missing); process.exit(1); }
console.log("  CJS exports present:", need.length);
`;

const REACT = process.argv[2] || "18";
const ROOT = resolve(import.meta.dirname, "..");
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });

const PKG = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
// Name the tarball explicitly. Globbing for the first *.tgz would happily pick
// up one left behind by an earlier failed run and report a green smoke test for
// a version that is not the one being published.
const tarball = `${PKG.name.replace(/^@/, "").replace("/", "-")}-${PKG.version}.tgz`;

console.log(`\n[smoke] building and packing ${PKG.name}@${PKG.version}`);
rmSync(join(ROOT, tarball), { force: true });
run("npm", ["run", "build"], ROOT);
run("npm", ["pack", "--silent"], ROOT);
if (!existsSync(join(ROOT, tarball))) {
  throw new Error(`npm pack did not produce ${tarball}`);
}

const dir = mkdtempSync(join(tmpdir(), "wizzard-smoke-"));
console.log(`[smoke] consumer: ${dir} (react@${REACT})`);
mkdirSync(join(dir, "src"));

writeFileSync(
  join(dir, "package.json"),
  JSON.stringify({ name: "smoke", private: true, type: "module" }, null, 2)
);
writeFileSync(
  join(dir, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        types: ["vitest/globals"],
      },
      include: ["src"],
    },
    null,
    2
  )
);
writeFileSync(
  join(dir, "vitest.config.ts"),
  `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], test: { environment: 'jsdom', globals: true } });
`
);
writeFileSync(join(dir, "src/smoke.test.tsx"), SMOKE);
writeFileSync(join(dir, "cjs.cjs"), CJS);

run(
  "npm",
  [
    "install", "--silent", "--no-fund", "--no-audit",
    `react@${REACT}`, `react-dom@${REACT}`, `@types/react@${REACT}`, `@types/react-dom@${REACT}`,
    "zod@4", "vitest@4.0.16", "jsdom", "@testing-library/react", "@vitejs/plugin-react",
    "typescript", join(ROOT, tarball),
  ],
  dir
);

console.log("[smoke] ESM + behaviour");
run("npx", ["vitest", "run"], dir);
console.log("[smoke] CJS require()");
run("node", ["cjs.cjs"], dir);
console.log("[smoke] consumer typecheck against shipped .d.ts");
run("npx", ["tsc", "--noEmit"], dir);

rmSync(join(ROOT, tarball), { force: true });
rmSync(dir, { recursive: true, force: true });
console.log(`\n[smoke] OK — dist works for a react@${REACT} consumer\n`);
