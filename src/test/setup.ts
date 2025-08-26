import '@testing-library/jest-dom';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    DEV: true,
    VITE_USDA_API_KEY: 'test-api-key',
  },
  writable: true,
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
  },
  writable: true,
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});