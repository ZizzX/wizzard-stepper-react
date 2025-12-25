---
description: Migrate project to pnpm
---

This workflow guides you through migrating from npm to pnpm, setting up a monorepo workspace structure.

1. **Install pnpm** (if not installed)
   ```powershell
   npm install -g pnpm
   ```

2. **Clean old npm artifacts**
   // turbo
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Recurse -Force examples/demo/node_modules
   Remove-Item -Force package-lock.json
   Remove-Item -Force examples/demo/package-lock.json
   ```

3. **Install dependencies with pnpm**
   // turbo
   ```powershell
   pnpm install
   ```

4. **Verify Build**
   ```powershell
   pnpm build
   ```
