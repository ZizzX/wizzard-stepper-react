import { describe, it, expect } from 'vitest';
import * as yup from 'yup';
import { YupAdapter } from './YupAdapter';

describe('YupAdapter', () => {
    it('should validate correctly using a real yup schema', async () => {
        const schema = yup.object({
            name: yup.string().min(3).required(),
            age: yup.number().min(18).required()
        });

        const adapter = new YupAdapter(schema);

        // Valid data
        const validResult = await adapter.validate({ name: 'John', age: 25 });
        expect(validResult.isValid).toBe(true);

        // Invalid data
        const invalidResult = await adapter.validate({ name: 'Jo', age: 15 } as any);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toEqual({
            name: 'name must be at least 3 characters',
            age: 'age must be greater than or equal to 18'
        });
    });

    it('should handle nested paths correctly', async () => {
        const schema = yup.object({
            user: yup.object({
                profile: yup.object({
                    bio: yup.string().min(10).required()
                })
            })
        });

        const adapter = new YupAdapter(schema);
        const result = await adapter.validate({ user: { profile: { bio: 'short' } } } as any);

        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual({
            'user.profile.bio': 'user.profile.bio must be at least 10 characters'
        });
    });
});
