import { IPersistenceAdapter } from '../../types';

export class LocalStorageAdapter implements IPersistenceAdapter {
    private prefix: string;

    constructor(prefix: string = 'wizard_') {
        this.prefix = prefix;
    }

    private getKey(stepId: string): string {
        return `${this.prefix}${stepId}`;
    }

    saveStep<T>(stepId: string, data: T): void {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(this.getKey(stepId), JSON.stringify(data));
        } catch (error) {
            console.warn('LocalStorageAdapter: Failed to save step', error);
        }
    }

    getStep<T>(stepId: string): T | undefined {
        if (typeof window === 'undefined') return undefined;
        try {
            const item = localStorage.getItem(this.getKey(stepId));
            return item ? JSON.parse(item) : undefined;
        } catch (error) {
            console.warn('LocalStorageAdapter: Failed to get step', error);
            return undefined;
        }
    }

    clear(): void {
        if (typeof window === 'undefined') return;
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}
