import { LoggerService } from '@/services/logger.service';
import { createLogger, transports, format } from 'winston';
import * as fs from 'fs';
import { vi } from 'vitest';

// Mock winston transports and functions
vi.mock('winston', () => {
  const actualWinston = vi.importActual('winston');

  return {
    ...actualWinston,
    createLogger: vi.fn(),
    format: {
      ...actualWinston.format,
      combine: actualWinston.format.combine,
      timestamp: actualWinston.format.timestamp,
      printf: actualWinston.format.printf,
    },
    transports: {
      DailyRotateFile: class {
        constructor(options: any) {
          // Mock DailyRotateFile transport
          this.options = options;
        }
        options: any;
      },
      Console: class {
        constructor(options: any) {
          // Mock Console transport
          this.options = options;
        }
        options: any;
      },
    },
  };
});

// Mock winston-daily-rotate-file
vi.mock('winston-daily-rotate-file', () => vi.fn());

describe('LoggerService', () => {
  let service: LoggerService;
  const mockLogger = {
    info: jest.fn(),
    verbose: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(() => {
    // Mock createLogger to return our mock logger
    (createLogger as any).mockImplementation(() => mockLogger as any);

    service = new LoggerService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería llamar a createLoggers en el constructor', () => {
    // Verify that createLogger was called multiple times for different loggers
    expect(createLogger).toHaveBeenCalledTimes(3);
  });

  describe('método log', () => {
    it('debería llamar al método info en los loggers all e info', () => {
      const message = 'Test log message';
      const context = 'TestContext';

      service.log(message, context);

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(message, { context });
    });

    it('debería llamar al método info con contexto undefined cuando no se proporciona contexto', () => {
      const message = 'Test log message';

      service.log(message);

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(message, { context: undefined });
    });
  });

  describe('método verbose', () => {
    it('debería llamar al método verbose en el logger all', () => {
      const message = 'Test verbose message';
      const context = 'TestContext';

      service.verbose(message, context);

      expect(mockLogger.verbose).toHaveBeenCalledTimes(1);
      expect(mockLogger.verbose).toHaveBeenCalledWith(message, { context });
    });
  });

  describe('método debug', () => {
    it('debería llamar al método debug en el logger all', () => {
      const message = 'Test debug message';
      const context = 'TestContext';

      service.debug(message, context);

      expect(mockLogger.debug).toHaveBeenCalledTimes(1);
      expect(mockLogger.debug).toHaveBeenCalledWith(message, { context });
    });
  });

  describe('método error', () => {
    it('debería llamar al método error en los loggers all y error', () => {
      const message = 'Test error message';
      const context = 'TestContext';

      service.error(message, context);

      expect(mockLogger.error).toHaveBeenCalledTimes(2);
      expect(mockLogger.error).toHaveBeenCalledWith(message, { context });
    });

    it('debería llamar al método error con contexto undefined cuando no se proporciona contexto', () => {
      const message = 'Test error message';

      service.error(message);

      expect(mockLogger.error).toHaveBeenCalledTimes(2);
      expect(mockLogger.error).toHaveBeenCalledWith(message, { context: undefined });
    });
  });

  describe('método warn', () => {
    it('debería llamar al método warn en el logger all', () => {
      const message = 'Test warn message';
      const context = 'TestContext';

      service.warn(message, context);

      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(message, { context });
    });
  });
});