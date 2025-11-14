import { logError, showErrorAlert } from '../errorHandler';
import { Alert } from 'react-native';

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  describe('logError', () => {
    it('should log error to console', () => {
      const context = 'Test Context';
      const error = new Error('Test error');

      logError(error, context);

      expect(console.error).toHaveBeenCalledWith(
        `[ERROR] ${context}:`,
        expect.objectContaining({
          code: expect.any(String),
          message: 'Test error',
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle non-Error objects', () => {
      const context = 'Test Context';
      const error = 'String error';

      logError(error, context);

      expect(console.error).toHaveBeenCalledWith(
        `[ERROR] ${context}:`,
        expect.objectContaining({
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('showErrorAlert', () => {
    it('should show alert with user-friendly message', () => {
      const error = new Error('Test error');
      const context = 'Test Context';
      const title = 'Error';

      showErrorAlert(error, context, title);

      expect(Alert.alert).toHaveBeenCalledWith(
        title,
        'Something went wrong. Please try again.',
        [{ text: 'OK', style: 'default' }],
        { cancelable: true }
      );
    });

    it('should show alert with default title when not provided', () => {
      const error = new Error('Test error message');
      const context = 'Test Context';

      showErrorAlert(error, context);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK', style: 'default' }],
        { cancelable: true }
      );
    });

    it('should handle Firebase auth errors', () => {
      const error = { code: 'auth/user-not-found', message: 'User not found' };
      const context = 'Auth Context';

      showErrorAlert(error, context);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'No account found with this email.',
        [{ text: 'OK', style: 'default' }],
        { cancelable: true }
      );
    });
  });
});
