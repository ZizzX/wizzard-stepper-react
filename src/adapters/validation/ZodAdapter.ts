import type { IValidatorAdapter, ValidationResult } from '../../types';
import type { ZodLikeSchema } from './internal-types';

export class ZodAdapter<T> implements IValidatorAdapter<T> {
    private schema: ZodLikeSchema<T>;

    constructor(schema: ZodLikeSchema<T>) {
        this.schema = schema;
    }

    async validate(data: unknown): Promise<ValidationResult> {
        const result = await this.schema.safeParseAsync(data as T);
        if (result.success) {
            return { isValid: true };
        }

        // Explicitly handle error case
        const errors: Record<string, string> = {};
        if (result.error) {
            result.error.issues.forEach((err) => {
                const path = err.path.join('.'); // nested.field
                errors[path] = err.message;
            });
        }
        return { isValid: false, errors };
    }
}
