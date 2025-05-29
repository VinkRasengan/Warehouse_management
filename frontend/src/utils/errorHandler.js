import { message, notification } from 'antd';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

// Error messages
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
  [ERROR_TYPES.VALIDATION]: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
  [ERROR_TYPES.AUTHENTICATION]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  [ERROR_TYPES.AUTHORIZATION]: 'Bạn không có quyền thực hiện thao tác này.',
  [ERROR_TYPES.NOT_FOUND]: 'Không tìm thấy dữ liệu yêu cầu.',
  [ERROR_TYPES.SERVER]: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  [ERROR_TYPES.UNKNOWN]: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
};

// Determine error type from error object
export const getErrorType = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return ERROR_TYPES.NETWORK;
  }

  // HTTP status code errors
  if (error.response?.status) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return ERROR_TYPES.VALIDATION;
      case 401:
        return ERROR_TYPES.AUTHENTICATION;
      case 403:
        return ERROR_TYPES.AUTHORIZATION;
      case 404:
        return ERROR_TYPES.NOT_FOUND;
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_TYPES.SERVER;
      default:
        return ERROR_TYPES.UNKNOWN;
    }
  }

  return ERROR_TYPES.UNKNOWN;
};

// Get user-friendly error message
export const getErrorMessage = (error) => {
  const errorType = getErrorType(error);
  
  // Try to get specific message from response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  // Fallback to generic message
  return ERROR_MESSAGES[errorType];
};

// Handle different types of errors
export const handleError = (error, options = {}) => {
  const {
    showNotification = true,
    showMessage = false,
    customMessage = null,
    onAuthError = null,
    silent = false,
  } = options;

  const errorType = getErrorType(error);
  const errorMessage = customMessage || getErrorMessage(error);

  // Log error for debugging
  console.error('Error occurred:', {
    type: errorType,
    message: errorMessage,
    originalError: error,
    stack: error.stack,
  });

  // Handle authentication errors
  if (errorType === ERROR_TYPES.AUTHENTICATION) {
    if (onAuthError) {
      onAuthError();
    } else {
      // Default auth error handling
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return;
  }

  // Don't show UI feedback if silent mode
  if (silent) {
    return;
  }

  // Show notification or message
  if (showNotification) {
    notification.error({
      message: 'Lỗi',
      description: errorMessage,
      duration: 5,
      placement: 'topRight',
    });
  } else if (showMessage) {
    message.error(errorMessage);
  }
};

// Async error handler for promises
export const handleAsyncError = (promise, options = {}) => {
  return promise.catch((error) => {
    handleError(error, options);
    throw error; // Re-throw to allow caller to handle if needed
  });
};

// Error boundary error handler
export const handleErrorBoundary = (error, errorInfo) => {
  console.error('Error Boundary caught an error:', error, errorInfo);
  
  // Log to external service (e.g., Sentry, LogRocket)
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }
  
  notification.error({
    message: 'Lỗi ứng dụng',
    description: 'Đã xảy ra lỗi không mong muốn. Trang sẽ được tải lại.',
    duration: 0,
    btn: (
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#1890ff',
          color: 'white',
          border: 'none',
          padding: '4px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Tải lại trang
      </button>
    ),
  });
};

// Validation error handler
export const handleValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    errors.forEach((error) => {
      message.error(error.message || error);
    });
  } else if (typeof errors === 'object') {
    Object.values(errors).forEach((error) => {
      if (Array.isArray(error)) {
        error.forEach((msg) => message.error(msg));
      } else {
        message.error(error);
      }
    });
  } else {
    message.error(errors || 'Dữ liệu không hợp lệ');
  }
};

// API error interceptor
export const createErrorInterceptor = (onAuthError) => {
  return (error) => {
    handleError(error, {
      showNotification: true,
      onAuthError,
    });
    return Promise.reject(error);
  };
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    handleError(event.reason, {
      showNotification: true,
      customMessage: 'Đã xảy ra lỗi không mong muốn.',
    });
    
    // Prevent the default browser behavior
    event.preventDefault();
  });
  
  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    handleError(event.error, {
      showNotification: true,
      customMessage: 'Đã xảy ra lỗi JavaScript.',
    });
  });
};

const errorHandler = {
  handleError,
  handleAsyncError,
  handleErrorBoundary,
  handleValidationErrors,
  createErrorInterceptor,
  retryRequest,
  setupGlobalErrorHandlers,
  getErrorType,
  getErrorMessage,
  ERROR_TYPES,
};

export default errorHandler;
