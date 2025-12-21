import { IPersistenceAdapter } from '../../types';

export class MemoryAdapter implements IPersistenceAdapter {
    private storage: Record<string, any> = {};

    saveStep<T>(stepId: string, data: T): void {
        this.storage[stepId] = data;
    }

    getStep<T>(stepId: string): T | undefined {
        return this.storage[stepId] as T;
    }

    clear(): void {
        this.storage = {};
    }
}
