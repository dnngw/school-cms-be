import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createSectionSchema,
  updateSectionSchema,
} from '../src/modules/sections/sections.schema.js';
import { createUserSchema, updateUserSchema } from '../src/modules/users/users.schema.js';

// Regression: Zod 4 `.partial()` keeps `.default()` values, which used to wipe data on partial updates.
describe('partial update schemas', () => {
  it('section update only contains the fields that were sent', () => {
    assert.deepEqual(updateSectionSchema.parse({ isVisible: false }), { isVisible: false });
  });

  it('section create still applies defaults', () => {
    const section = createSectionSchema.parse({ type: 'hero', label: 'Hero' });
    assert.deepEqual(section.content, {});
    assert.equal(section.isVisible, true);
  });

  it('user update does not reset role or status', () => {
    assert.deepEqual(updateUserSchema.parse({ name: 'Budi' }), { name: 'Budi' });
  });

  it('user create defaults to an active editor', () => {
    const user = createUserSchema.parse({ name: 'Budi', email: 'b@b.id', password: '12345678' });
    assert.equal(user.role, 'editor');
    assert.equal(user.isActive, true);
  });
});
