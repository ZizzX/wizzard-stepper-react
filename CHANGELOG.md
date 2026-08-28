# Changelog

# [3.0.0-rc.0](https://github.com/ZizzX/wizzard-stepper-react/compare/v2.0.1...v3.0.0-rc.0) (2026-08-28)


* feat!: require React 18 or newer ([ec63335](https://github.com/ZizzX/wizzard-stepper-react/commit/ec63335e9b134b40f1f0249bb54cbc5b67ee540c))


### Bug Fixes

* **core:** correct clearData, hydration, validation and data cloning ([a8bfa57](https://github.com/ZizzX/wizzard-stepper-react/commit/a8bfa57a61faa40a93e5b3b27801f191fa2de5bb))
* **release:** let release-it own the version, and only publish new versions ([db6c5df](https://github.com/ZizzX/wizzard-stepper-react/commit/db6c5df374e9294c5a8974d156a824ad434333a0))
* **release:** use a preset that actually exists ([a2b925c](https://github.com/ZizzX/wizzard-stepper-react/commit/a2b925c9e68378e11659fb8efafb522424d5d1cb))


### BREAKING CHANGES

* peerDependencies now require react and react-dom >= 18.0.0.

The provider has been built on useSyncExternalStore - a React 18 API - since
v2, but peerDependencies still advertised >= 16.8.0. On React 16 or 17 the
package installed without a single warning, loaded fine, and then crashed on
the first render because React.useSyncExternalStore was undefined. Narrowing
a peer range is breaking per semver, hence the major.

No code change is required for anyone already on React 18 or 19: every
export, type and signature in dist/index.d.ts is byte-identical to 2.0.1.
Verified by building both revisions and diffing the emitted declarations.

Adding a use-sync-external-store shim to genuinely support 16.8+ was
considered and rejected: it would be the library's first runtime dependency,
for React versions that no longer have meaningful usage.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01WAVcb8RWeqksGmPjw9GW3m

## [2.0.1](https://github.com/ZizzX/wizzard-stepper-react/compare/v2.0.0...v2.0.1) (2026-01-04)


### Features

* add configurable validation debounce time ([9c52b31](https://github.com/ZizzX/wizzard-stepper-react/commit/9c52b31548eeb2ac91c7796e145c51d578690fb6))
* add optimization wizard demo ([4c7c88b](https://github.com/ZizzX/wizzard-stepper-react/commit/4c7c88b0e58d59de3fb8aacf49d2abb6ec6ed73c))
* add wizard reset and page reload on last step completion ([ea12556](https://github.com/ZizzX/wizzard-stepper-react/commit/ea12556e68230e48818a0b5410ae700c497500f1))
* introduce typed wizard data with `createWizardFactory` ([b24ab22](https://github.com/ZizzX/wizzard-stepper-react/commit/b24ab22dd3e2f7170a4ec78703def8e8864c2945))
* update language context with new language selection capabilities ([b830f06](https://github.com/ZizzX/wizzard-stepper-react/commit/b830f06af8c4ee96c719369fd59cba90a4ee9b3e))

# [2.0.0](https://github.com/ZizzX/wizzard-stepper-react/compare/v1.7.2...v1.8.0) (2026-01-01)


### Features

* add `useWizardActions` and optional `MySteps` type parameter ([6a3a15c](https://github.com/ZizzX/wizzard-stepper-react/commit/6a3a15c6209516c2efdc5e03683759c500485bc2))
* add async step conditions and `beforeLeave` guards, ([ee8ff07](https://github.com/ZizzX/wizzard-stepper-react/commit/ee8ff07267c0c8764324819f5442f4c020b22a9a))
* add documentation ([96d3bef](https://github.com/ZizzX/wizzard-stepper-react/commit/96d3bef7063112c30fb6ce4557d378d6465cfe6a))
* add Enterprise Guide documentation and demo ([cb74746](https://github.com/ZizzX/wizzard-stepper-react/commit/cb747460d86e52ca7f70b59530ed81994d8c4b69))
* add i18n support and refactor documentation ([76593e5](https://github.com/ZizzX/wizzard-stepper-react/commit/76593e532a8a7ecdd0a7691b413bca3d16ccba9c))
* allow `update` to track multiple changed paths ([e43e398](https://github.com/ZizzX/wizzard-stepper-react/commit/e43e398d4ed779a61569d7348345e0197de4158a))
* document v2.0.0 release with breaking changes and new features ([d8379e6](https://github.com/ZizzX/wizzard-stepper-react/commit/d8379e6bb86e20113f4fa11a2ba2d802c1e62fa5))
* enhance WizardStore with combined state for improved selector access ([5689d48](https://github.com/ZizzX/wizzard-stepper-react/commit/5689d480c04c2e6d8f291ad4f839e8e98573ff19))
* enterprise Cloud Wizard demo, update its routing ([6784e2e](https://github.com/ZizzX/wizzard-stepper-react/commit/6784e2e0f6aae508e3dde8ffefbafeecd910f295))
* implement dynamic documentation navigation and add a new docs configuration ([a42c09b](https://github.com/ZizzX/wizzard-stepper-react/commit/a42c09b0bd69a156f527e2f0f0937f153b9cd1bd))
* implement dynamic version injection for build and demo applications ([48788ba](https://github.com/ZizzX/wizzard-stepper-react/commit/48788ba91cad0e93dd9a5082a021334607073105))
* introduce `clearData` option for steps to automatically reset data when dependencies change ([9e39f55](https://github.com/ZizzX/wizzard-stepper-react/commit/9e39f55b002aef6932005cbe635021dde853a63e))
* introduce Pro Package components ([80994fa](https://github.com/ZizzX/wizzard-stepper-react/commit/80994faa99da7674266ebf4caa76b03a6bb8b0d4))
* introduce typed wizard events with automatic tracking ([d0f743a](https://github.com/ZizzX/wizzard-stepper-react/commit/d0f743a509e4dff1383f1bfa6fec87583d26c9e2))
* introduce typed wizard events with automatic tracking ([74665f4](https://github.com/ZizzX/wizzard-stepper-react/commit/74665f41b57f36a1d8a127f6aca3ad562cac2e90))
* introduce WizardStore with middleware support and devtools ([f71847d](https://github.com/ZizzX/wizzard-stepper-react/commit/f71847df713903d0a5379a08dcf227182242c784))
* pass wizard metadata as a third argument to the `beforeLeave` guard function ([05eaf32](https://github.com/ZizzX/wizzard-stepper-react/commit/05eaf328c9c4f35b600fc112cab63466e67c6910))
* release v2.0.0 introducing versioned ([7174fe0](https://github.com/ZizzX/wizzard-stepper-react/commit/7174fe058a1ecc5ea7e6b89f46079a63e5a76bcb))
* аdd busy state management ([6f6d314](https://github.com/ZizzX/wizzard-stepper-react/commit/6f6d314a698c2d1a4561de88af97583b0adbeb56))

## [2.0.0](https://github.com/ZizzX/wizzard-stepper-react/compare/v1.8.0...v2.0.0) (2026-01-02)

### ⚠ BREAKING CHANGES

* **Factory Pattern**: The primary way to create wizards is now via `createWizardFactory`. The old `WizardProvider` is deprecated but supported for legacy.
* **Middleware**: New middleware system replaces old monolithic logic.
* **Types**: stricter type safety, removed `any` assertions in core paths.

### Features

* **Architecture**: Introduced `createWizardFactory` for perfect type inference and scalable state management.
* **Middleware**: Added support for custom middleware (logging, analytics, persistence).
* **DevTools**: Added `WizardDevTools` and `devToolsMiddleware` for visual debugging.
* **Build**: Automated version injection during build process.

### Bug Fixes

* **Typos**: Fixed multiple documentation typos and improved consistent terminology.
* **Performance**: Optimized selector re-renders.

---

## [1.8.0](https://github.com/ZizzX/wizzard-stepper-react/compare/v1.7.2...v1.8.0) (2026-01-01)

### Features

* **Analytics**: Standardized and strictly typed event system (`step_change`, `validation_error`, `wizard_reset`).
* **Store**: Exposed `isDirty` and `dirtyFields` in `IWizardState` for better form tracking.
* **Context**: Added `metadata` as the third argument to `condition` and `beforeLeave` callbacks for easier access to global state.

### Breaking Changes

* **Types**: Renamed `IWizardStore` to `IWizardHandle` to clarify its role as the public API object. `IWizardStore` is now the interface for the internal store class.
* **Callbacks**: `condition` and `beforeLeave` signatures have changed to include `metadata`. Existing callbacks using only one or two arguments remain compatible, but TypeScript might require updates if strictly typed.

---

## [1.7.2](https://github.com/ZizzX/wizzard-stepper-react/compare/v1.7.1...v1.7.2) (2025-12-26)


### Bug Fixes

* update `removeChild` useCallback dependencies and improve code formatting ([490172e](https://github.com/ZizzX/wizzard-stepper-react/commit/490172e2847e3e12959604c2b5420e1320edf4a8))

## [1.7.1](https://github.com/ZizzX/wizzard-stepper-react/compare/v1.7.0...v1.7.1) (2025-12-25)


### Features

* add main application layout with header, navigation, and footer ([6286cd2](https://github.com/ZizzX/wizzard-stepper-react/commit/6286cd2f5ddd4b158d02a1f28267d5a175a45493))

# [1.7.0](https://github.com/ZizzX/wizzard-stepper-react/compare/v1.5.0...v1.7.0) (2025-12-25)


### Features

*  document new `setData` optimizations and granular validation modes ([68fb537](https://github.com/ZizzX/wizzard-stepper-react/commit/68fb5374261b4b86318eb2b3f797fb8cd6ecba3f))
*  fix page links ([a33317a](https://github.com/ZizzX/wizzard-stepper-react/commit/a33317ab4e3f5381be1108594535ee7632f80e93))
* add  documentation section to the demo application with dedicated layout and navigation ([7107651](https://github.com/ZizzX/wizzard-stepper-react/commit/7107651c466d77fe5c2922dcdf0753da7bad2bb4))
* add complex wizard example demonstrating nested data, dynamic forms, and typed hooks ([70dea93](https://github.com/ZizzX/wizzard-stepper-react/commit/70dea93c88b818aeea832b6e1810b4212df7811c))
* add comprehensive documentation ([b53b0d0](https://github.com/ZizzX/wizzard-stepper-react/commit/b53b0d0d754f4dec672647d66d84cc32629f610d))
* add demo application routing with examples, documentation, and scroll-to-top functionality ([cb2c10c](https://github.com/ZizzX/wizzard-stepper-react/commit/cb2c10c89ce3909ba573a28f39207efda514fb34))
* add documentation and examples for various form libraries and wizard features ([938f9f1](https://github.com/ZizzX/wizzard-stepper-react/commit/938f9f1389bf90ec319d70dd9bf880d0fc4d9a75))
* add documentation layout and Hooks API page with detailed explanations for wizard hooks ([4552327](https://github.com/ZizzX/wizzard-stepper-react/commit/45523270390c4aa6c9af83915d5258f700f6991a))
* add documentation page for conditional logic in the wizard stepper ([856e5de](https://github.com/ZizzX/wizzard-stepper-react/commit/856e5de31289e86b4152cfe56a1e128ce516dbaa))
* add documentation page for routing and URL synchronization ([fdf7bdd](https://github.com/ZizzX/wizzard-stepper-react/commit/fdf7bdd27f9002f944f67d9bb5278112eabe1b69))
* add documentation pages and layout for core concepts and hooks API ([33374de](https://github.com/ZizzX/wizzard-stepper-react/commit/33374debce64a3277d261c6e772954b164fa5154))
* add documentation pages for TanStack Form, Valibot, Formik, Mantine Form, RHF, and Security ([405c8bb](https://github.com/ZizzX/wizzard-stepper-react/commit/405c8bbb0e02eceb07d8043becf21c6b9f9f2a78))
* add documentation pages integration ([3b1378f](https://github.com/ZizzX/wizzard-stepper-react/commit/3b1378f9becb4d740d2fe020390917f3dc62c187))
* add Hooks API documentation page ([4da1a9d](https://github.com/ZizzX/wizzard-stepper-react/commit/4da1a9d6538b486fe58f91df5c04b1b670f33efd))
* add Hooks API documentation page to the demo site ([77627aa](https://github.com/ZizzX/wizzard-stepper-react/commit/77627aafdd14ee7226d9819064ffd2f0e4be013e))
* add installation documentation page with package manager commands and dependency information ([4c27b45](https://github.com/ZizzX/wizzard-stepper-react/commit/4c27b45946b1ab15688b90dfd5236cc6ea68173d))
* add new demo application with routing, main layout, and comprehensive documentation pages ([aac2c98](https://github.com/ZizzX/wizzard-stepper-react/commit/aac2c98f46302d3bc2ead11dd1e2cd27d6c0de68))
* add new wizard examples for conditional logic, form libraries, and complex data ([3fcfed5](https://github.com/ZizzX/wizzard-stepper-react/commit/3fcfed50b17d8d9223da85f63752be32b32eac0c))
* add package configuration for new demo project ([8438983](https://github.com/ZizzX/wizzard-stepper-react/commit/843898331e8bda3c8025b767d41af50171cdf832))
* add performance documentation, DeferredList component, and complex data wizard example ([81e2e3b](https://github.com/ZizzX/wizzard-stepper-react/commit/81e2e3b8395a8cf1a44c73561bb5fc4b6af8bcf1))
* add React Context-based wizard state management API with dedicated hooks and documentation ([39905d3](https://github.com/ZizzX/wizzard-stepper-react/commit/39905d367ea562e404498ac935b2e475d45d3f1f))
* add tutorial page with interactive wizard demo and reusable StepperControls component ([d53655c](https://github.com/ZizzX/wizzard-stepper-react/commit/d53655c094148f4a6718c5164bbaee2d59112814))
* add Vite configuration for the demo and update package exports for improved module resolution ([c352879](https://github.com/ZizzX/wizzard-stepper-react/commit/c3528790bfd179766ac223c1d765094d99580232))
* create initial demo application structure including routing, layout, and home page ([124432d](https://github.com/ZizzX/wizzard-stepper-react/commit/124432d83e8bb0b10bac24b2cbbb8365d0b0d247))
* implement a new React wizard stepper component with context, hooks, and a complex data example ([d4176de](https://github.com/ZizzX/wizzard-stepper-react/commit/d4176dee1881729a64619faa780ccb95541aff0e))
* implement demo application with main layout ([f9df6e9](https://github.com/ZizzX/wizzard-stepper-react/commit/f9df6e9a80892082f928f9811e8b3e4da20f7845))
* introduce a new React wizard stepper implementation with factory API ([e35a23f](https://github.com/ZizzX/wizzard-stepper-react/commit/e35a23f25b043b34a2ac2730ec9c9e403b061499))
* introduce core WizardContext and Provider for React stepper functionality ([91c5bd4](https://github.com/ZizzX/wizzard-stepper-react/commit/91c5bd4860491104cad18ada722ea67b00557dd7))
* introduce documentation layout and pages for performance ([bf8fb0a](https://github.com/ZizzX/wizzard-stepper-react/commit/bf8fb0adcf456779241285aab4e1098a163bd21f))
* introduce new demo pages, migrate to pnpm, and establish CI/CD workflows ([176d37a](https://github.com/ZizzX/wizzard-stepper-react/commit/176d37ad6ceb9ce7cbf541a5bb4bf93eff482ac9))
* introduce new documentation pages examples, and update the README ([91a6626](https://github.com/ZizzX/wizzard-stepper-react/commit/91a662661365d3dd48d34edd5535b81433a7d287))
* ref initial demo homepage ([1efc6f7](https://github.com/ZizzX/wizzard-stepper-react/commit/1efc6f7b45ecaeea8885ac5f43139ce72311ec0b))

# [1.5.0](https://github.com/ZizzX/wizzard-stepper-react/compare/v1.4.0...v1.5.0) (2025-12-24)


### Features

* `handleStepChange` for parent name and add `debounceValidation` to child data updates ([af9dc99](https://github.com/ZizzX/wizzard-stepper-react/commit/af9dc995c3340bee83fa2f12d29fb8c22fb54387))
* add `updateData` function for bulk data updates ([572babc](https://github.com/ZizzX/wizzard-stepper-react/commit/572babc6ec04ad1664e364b5678efc48eda9420c))
* add advanced features example and refine text formatting on the Home page ([312dacc](https://github.com/ZizzX/wizzard-stepper-react/commit/312dacc50cfbedf2ca73c8b3d13e57ff395901d4))
* add advanced wizard demo showcasing persistence adapters and framer-motion animations ([9189be7](https://github.com/ZizzX/wizzard-stepper-react/commit/9189be79ad4eaec776650f151ee445c730e607cf))
* bump wizzard-stepper-react to version 1.4.0 and update demo dependency ([a240066](https://github.com/ZizzX/wizzard-stepper-react/commit/a240066daaf2da4f0dd86a34fedc1903be8db5e1))
* bump wizzard-stepper-react to version 1.5.0 ([a9cd193](https://github.com/ZizzX/wizzard-stepper-react/commit/a9cd19366998e3df93981b4e03362b5bbaaeb878))
* declarative step rendering, routing integration, and granular persistence ([928947f](https://github.com/ZizzX/wizzard-stepper-react/commit/928947fc283c98780469842ba8bf86ee3dd29051))
* document advanced demo features; fix: improve debounced validation ([2ff4f2b](https://github.com/ZizzX/wizzard-stepper-react/commit/2ff4f2b4e5902637266f877d6260b39304ef555e))
* factory pattern for type-safe wizard creation, add migration guide and updated examples ([99b5f3e](https://github.com/ZizzX/wizzard-stepper-react/commit/99b5f3e4a85963471f327c3c85f6bbf236f277a0))
* introduce wizard factory, centralize types, and update core and examples ([6c52fa6](https://github.com/ZizzX/wizzard-stepper-react/commit/6c52fa65bd1777c323a90da49a030cc9e4107ebe))
* validation errors from `validateAll` and demo's autofill and error display ([f16abd5](https://github.com/ZizzX/wizzard-stepper-react/commit/f16abd55a04053f12677ab99bb0968893853c44d))

# [1.4.0](https://github.com/ZizzX/wizzard-stepper-react/compare/v1.3.0...v1.4.0) (2025-12-24)


### Features

* implement granular state subscriptions, new selector hooks ([3203949](https://github.com/ZizzX/wizzard-stepper-react/commit/3203949906841c4041a4ba30b48a5910552ec71f))
* introduce granular state hooks and refactor wizard state management with a store ([e9f9047](https://github.com/ZizzX/wizzard-stepper-react/commit/e9f90476963ab225afd78ba85b14ebb9897fd57e))
* performance optimization with granular subscriptions and debounce ([03a3760](https://github.com/ZizzX/wizzard-stepper-react/commit/03a3760e33cf20343b593352251c6e3ee8d35b5f))
* refactor validation adapters ([b136cdd](https://github.com/ZizzX/wizzard-stepper-react/commit/b136cdd6d409eda1d2b60dff48e20e379a0ab367))
* добавить тест для установки значения с простым ключом в функции setByPath ([137480d](https://github.com/ZizzX/wizzard-stepper-react/commit/137480d65f98951aacbbd480bead5b376b48c9a0))
* удалить комментарий о простом пути в функции setByPath ([03fcc27](https://github.com/ZizzX/wizzard-stepper-react/commit/03fcc27683e8bd512958d789724f9b6c985e454e))

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.3.1 (2025-12-24)

### Features

* **validation:** optimize adapters to use structural typing (duck typing). Removed direct hard dependencies on `zod` and `yup` types, making the library truly headless and smaller in bundle size.
* **data:** add support for nested objects and arrays in `setData` and `getData` using dot notation (e.g., `user.profile.name` or `items[0].value`).
* **context:** add `setData` and `getData` to `useWizard` hook for complex form handling.

## 1.2.0 (2025-12-23)


### Features

* add package metadata and initial build output files ([ab5d625](https://github.com/ZizzX/wizzard-stepper-react/commit/ab5d6253acbffbba8c76e8617102ce2bf73e8f3f))
* introduce wizzard stepper React component and its build artifacts. ([35b2b8e](https://github.com/ZizzX/wizzard-stepper-react/commit/35b2b8e7cbd0c282f5e666c508215452d2d2d320))


### Bug Fixes

* bypass tsc in demo deploy to use vite alias ([9acf82a](https://github.com/ZizzX/wizzard-stepper-react/commit/9acf82a45a65138b8fc91cf358a148355c6bdcfb))
* explicit vite outDir and debug logging ([ea4d46e](https://github.com/ZizzX/wizzard-stepper-react/commit/ea4d46e60cde71ccd6179ec7d72f3fb930240c71))
* **package.json:** update package.json to correct module paths and add exports field ([b7f1aa2](https://github.com/ZizzX/wizzard-stepper-react/commit/b7f1aa29d97e713edc1d0a824faf351877bd5ec8))
* remove deploy-demo workflow and update .gitignore for examples directory ([82bccdc](https://github.com/ZizzX/wizzard-stepper-react/commit/82bccdce0a183366f811b1965beba4ef785d413d))
* streamline demo build process by removing redundant npm install and commands ([bd36d5e](https://github.com/ZizzX/wizzard-stepper-react/commit/bd36d5eb53272a9b267b9016f224d851d2637b39))
* track examples/demo in git ([9a11a68](https://github.com/ZizzX/wizzard-stepper-react/commit/9a11a687564f55e5bc0ed639d8807b66cce01f0d))
* track examples/demo in git ([944e6f7](https://github.com/ZizzX/wizzard-stepper-react/commit/944e6f764f68e210aa83d89e6f2a62b22c1247b3))
* update demo build command to use npx vite build ([f605da6](https://github.com/ZizzX/wizzard-stepper-react/commit/f605da60732dbaf3abc42c957a9746d288b8a085))
* update GitHub Actions workflows for demo and publish processes ([d1d4649](https://github.com/ZizzX/wizzard-stepper-react/commit/d1d4649dd4bd71bc2bcd4dd7aa6ef1a9d45e1e7b))
* update installation instructions to remove zod dependency ([ccd7863](https://github.com/ZizzX/wizzard-stepper-react/commit/ccd7863c4f2945774d6d1531b334ad0152341f92))
* update subproject commit reference and version to 1.0.5 in package.json ([2fd059c](https://github.com/ZizzX/wizzard-stepper-react/commit/2fd059ca3a34ab291377f8efee0798ffbd1972a4))
* update subproject commit reference in demo ([b8a575d](https://github.com/ZizzX/wizzard-stepper-react/commit/b8a575d7ec0c160f62a4cd4c8d54ddcf2ef931dd))
* update version to 1.0.4 in package.json ([a2bce31](https://github.com/ZizzX/wizzard-stepper-react/commit/a2bce31b4fd6af7810362601c9c8adf6479bd736))
* vite config dirname and base url ([acb0e8b](https://github.com/ZizzX/wizzard-stepper-react/commit/acb0e8b8ab5003e148f2a16b24c85794a3d234a1))

## 1.1.0 (2025-12-23)


### Features

* add package metadata and initial build output files ([ab5d625](https://github.com/ZizzX/wizzard-stepper-react/commit/ab5d6253acbffbba8c76e8617102ce2bf73e8f3f))
* introduce wizzard stepper React component and its build artifacts. ([35b2b8e](https://github.com/ZizzX/wizzard-stepper-react/commit/35b2b8e7cbd0c282f5e666c508215452d2d2d320))


### Bug Fixes

* bypass tsc in demo deploy to use vite alias ([9acf82a](https://github.com/ZizzX/wizzard-stepper-react/commit/9acf82a45a65138b8fc91cf358a148355c6bdcfb))
* explicit vite outDir and debug logging ([ea4d46e](https://github.com/ZizzX/wizzard-stepper-react/commit/ea4d46e60cde71ccd6179ec7d72f3fb930240c71))
* remove deploy-demo workflow and update .gitignore for examples directory ([82bccdc](https://github.com/ZizzX/wizzard-stepper-react/commit/82bccdce0a183366f811b1965beba4ef785d413d))
* streamline demo build process by removing redundant npm install and commands ([bd36d5e](https://github.com/ZizzX/wizzard-stepper-react/commit/bd36d5eb53272a9b267b9016f224d851d2637b39))
* track examples/demo in git ([9a11a68](https://github.com/ZizzX/wizzard-stepper-react/commit/9a11a687564f55e5bc0ed639d8807b66cce01f0d))
* track examples/demo in git ([944e6f7](https://github.com/ZizzX/wizzard-stepper-react/commit/944e6f764f68e210aa83d89e6f2a62b22c1247b3))
* update demo build command to use npx vite build ([f605da6](https://github.com/ZizzX/wizzard-stepper-react/commit/f605da60732dbaf3abc42c957a9746d288b8a085))
* update GitHub Actions workflows for demo and publish processes ([d1d4649](https://github.com/ZizzX/wizzard-stepper-react/commit/d1d4649dd4bd71bc2bcd4dd7aa6ef1a9d45e1e7b))
* update installation instructions to remove zod dependency ([ccd7863](https://github.com/ZizzX/wizzard-stepper-react/commit/ccd7863c4f2945774d6d1531b334ad0152341f92))
* update subproject commit reference and version to 1.0.5 in package.json ([2fd059c](https://github.com/ZizzX/wizzard-stepper-react/commit/2fd059ca3a34ab291377f8efee0798ffbd1972a4))
* update subproject commit reference in demo ([b8a575d](https://github.com/ZizzX/wizzard-stepper-react/commit/b8a575d7ec0c160f62a4cd4c8d54ddcf2ef931dd))
* update version to 1.0.4 in package.json ([a2bce31](https://github.com/ZizzX/wizzard-stepper-react/commit/a2bce31b4fd6af7810362601c9c8adf6479bd736))
* vite config dirname and base url ([acb0e8b](https://github.com/ZizzX/wizzard-stepper-react/commit/acb0e8b8ab5003e148f2a16b24c85794a3d234a1))
