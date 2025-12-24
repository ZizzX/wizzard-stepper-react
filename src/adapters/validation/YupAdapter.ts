import type { IValidatorAdapter, ValidationResult } from '../../types';
import type { YupLikeSchema, YupLikeError } from './internal-types';

export class YupAdapter<T> implements IValidatorAdapter<T> {
    private schema: YupLikeSchema<T>;

    constructor(schema: YupLikeSchema<T>) {
        this.schema = schema;
    }

    async validate(data: unknown): Promise<ValidationResult> {
        try {
            await this.schema.validate(data as T, { abortEarly: false });
            return { isValid: true };
        } catch (err) {
            if (err && typeof err === 'object' && 'inner' in err) {
                const yupError = err as YupLikeError;
                const errors: Record<string, string> = {};
                yupError.inner.forEach((error) => {
                    if (error.path) {
                        errors[error.path] = error.message;
                    }
                });
                return { isValid: false, errors };
            }
            throw err;
        }
    }
}
