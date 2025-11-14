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

      logError(context, error);

      expect(console.error).toHaveBeenCalledWith(`[${context}]`, error);
    });

    it('should handle non-Error objects', () => {
      const context = 'Test Context';
      const error = 'String error';

      logError(context, error);

      expect(console.error).toHaveBeenCalledWith(`[${context}]`, error);
    });
  });

  describe('showErrorAlert', () => {
    it('should show alert with custom message', () => {
      const error = new Error('Test error');
      const title = 'Test Title';
      const message = 'Custom message';

      showErrorAlert(error, title, message);

      expect(Alert.alert).toHaveBeenCalledWith(title, message);
    });

    it('should show alert with error message when no custom message provided', () => {
      const error = new Error('Test error message');
      const title = 'Test Title';

      showErrorAlert(error, title);

      expect(Alert.alert).toHaveBeenCalledWith(title, 'Test error message');
    });

    it('should handle Firebase auth errors', () => {
      const error = { code: 'auth/user-not-found', message: 'User not found' };
      const title = 'Auth Error';

      showErrorAlert(error, title);

      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
