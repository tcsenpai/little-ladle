import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.stubGlobal('console', mockConsole);

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Logger functionality', () => {
    it('should always log errors regardless of environment', async () => {
      const { logger } = await import('./logger');
      logger.error('error message');
      expect(mockConsole.error).toHaveBeenCalledWith('[Little Ladle] error message');
    });

    it('should log messages with proper formatting', async () => {
      const { logger } = await import('./logger');
      logger.log('test message', { data: 'test' });
      // Should be called (in test environment DEV is true)
      expect(mockConsole.log).toHaveBeenCalledWith('[Little Ladle] test message', { data: 'test' });
    });

    it('should format debug logs correctly', async () => {
      const { debugLog } = await import('./logger');
      debugLog('debug message', { test: true });
      expect(mockConsole.log).toHaveBeenCalledWith('[Little Ladle] DEBUG: debug message', { test: true });
    });

    it('should format debug logs without data', async () => {
      const { debugLog } = await import('./logger');
      debugLog('debug message only');
      expect(mockConsole.log).toHaveBeenCalledWith('[Little Ladle] DEBUG: debug message only');
    });

    it('should log performance with timing', async () => {
      const { logPerformance } = await import('./logger');
      const startTime = Date.now() - 100; // Simulate 100ms ago
      logPerformance('test operation', startTime);
      
      // Just check that it was called with the right prefix
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[Little Ladle] Performance: test operation took')
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('ms')
      );
    });
  });
});