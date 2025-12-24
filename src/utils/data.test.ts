import { describe, it, expect } from 'vitest';
import { getByPath, setByPath } from './data';

describe('Data Utils', () => {
    describe('getByPath', () => {
        const obj: any = { user: { name: 'John', roles: ['admin', 'user'] }, items: [{ id: 1 }] };

        it('should get shallow value', () => {
            expect(getByPath(obj, 'user')).toEqual(obj.user);
        });

        it('should get nested value', () => {
            expect(getByPath(obj, 'user.name')).toBe('John');
        });

        it('should get array value by index', () => {
            expect(getByPath(obj, 'user.roles[0]')).toBe('admin');
            expect(getByPath(obj, 'items[0].id')).toBe(1);
        });

        it('should return default value if path not found', () => {
            expect(getByPath(obj, 'user.age', 25)).toBe(25);
        });
    });

    describe('setByPath', () => {
        it('should set shallow value immutably', () => {
            const obj = { a: 1 };
            const next = setByPath(obj, 'a', 2);
            expect(next.a).toBe(2);
            expect(obj.a).toBe(1);
        });

        it('should set value with simple key (no dot or brackets)', () => {
            const obj = { foo: 'bar' };
            const next = setByPath(obj, 'foo', 'baz');
            expect(next.foo).toBe('baz');
            expect(obj.foo).toBe('bar');
        });

        it('should set nested value immutably', () => {
            const obj = { user: { name: 'John' } };
            const next = setByPath(obj, 'user.name', 'Jane');
            expect(next.user.name).toBe('Jane');
            expect(obj.user.name).toBe('John');
            expect(next.user).not.toBe(obj.user);
        });

        it('should set array value by index', () => {
            const obj = { roles: ['user'] };
            const next = setByPath(obj, 'roles[0]', 'admin');
            expect(next.roles[0]).toBe('admin');
            expect(obj.roles[0]).toBe('user');
        });

        it('should create missing paths', () => {
            const obj = {};
            const next = setByPath(obj as any, 'a.b.c', 1);
            expect(next).toEqual({ a: { b: { c: 1 } } });
        });

        it('should create arrays for numeric keys', () => {
            const obj = {};
            const next = setByPath(obj as any, 'items[0].id', 1);
            expect(Array.isArray(next.items)).toBe(true);
            expect(next.items[0].id).toBe(1);
        });
        
    });
});
