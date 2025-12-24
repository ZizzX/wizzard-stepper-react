# Changelog

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
