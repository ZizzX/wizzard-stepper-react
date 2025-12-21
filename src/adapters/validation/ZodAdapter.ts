import { ZodType } from 'zod';
import { IValidatorAdapter, ValidationResult } from '../../types';

export class ZodAdapter<T> implements IValidatorAdapter<T> {
    constructor(private schema: ZodType<T>) { }

    async validate(data: T): Promise<ValidationResult> {
        const result = await this.schema.safeParseAsync(data);
        if (result.success) {
            return { isValid: true };
        }

        // Explicitly handle error case
        const errors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
            const path = err.path.join('.'); // nested.field
            errors[path] = err.message;
        });
        return { isValid: false, errors };
    }
}
