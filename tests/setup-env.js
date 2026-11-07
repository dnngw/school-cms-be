// Loaded before every test file (see the `test` script in package.json).
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgres://localhost:5432/school_cms_test';
process.env.JWT_SECRET ??= 'test-secret-that-is-long-enough-for-validation';
