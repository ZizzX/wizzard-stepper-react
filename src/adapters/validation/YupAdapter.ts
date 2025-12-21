import { Schema, ValidationError } from 'yup';
import { IValidatorAdapter, ValidationResult } from '../../types';

export class YupAdapter<T> implements IValidatorAdapter<T> {
    constructor(private schema: Schema<T>) { }

    async validate(data: T): Promise<ValidationResult> {
        try {
            await this.schema.validate(data, { abortEarly: false });
            return { isValid: true };
        } catch (err) {
            if (err instanceof ValidationError) {
                const errors: Record<string, string> = {};
                err.inner.forEach((error) => {
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
