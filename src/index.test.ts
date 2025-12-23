import { describe, it, expect } from 'vitest';
import * as exports from './index';

describe('Entry point', () => {
  it('should export useWizard', () => {
    expect(exports.useWizard).toBeDefined();
  });

  it('should export adapters', () => {
    expect(exports.MemoryAdapter).toBeDefined();
    expect(exports.LocalStorageAdapter).toBeDefined();
    expect(exports.ZodAdapter).toBeDefined();
    expect(exports.YupAdapter).toBeDefined();
  });
});
