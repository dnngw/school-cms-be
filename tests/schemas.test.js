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

describe('animation options', async () => {
  const { sectionStyleSchema } = await import('../src/modules/sections/sections.schema.js');
  const { getSettingsSchema } = await import('../src/modules/settings/settings.schema.js');
  const { SETTINGS_DEFAULTS } = await import('../src/modules/settings/settings.defaults.js');

  it('accepts known section animations only', () => {
    assert.equal(sectionStyleSchema.parse({ animation: 'zoom' }).animation, 'zoom');
    assert.throws(() => sectionStyleSchema.parse({ animation: 'spin' }));
  });

  it('accepts known background decorations only', () => {
    assert.equal(sectionStyleSchema.parse({ decoration: 'waves' }).decoration, 'waves');
    assert.throws(() => sectionStyleSchema.parse({ decoration: 'confetti' }));
  });

  it('theme defaults are valid and include the animation level', () => {
    const theme = getSettingsSchema('theme').parse(SETTINGS_DEFAULTS.theme);
    assert.equal(theme.animation, 'subtle');
  });
});
