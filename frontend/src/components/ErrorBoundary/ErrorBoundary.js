import React from 'react';
import { Result, Button, Typography, Card } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';
import { handleErrorBoundary } from '../../utils/errorHandler';

const { Paragraph, Text } = Typography;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    this.setState({
      error,
      errorInfo
    });

    // Handle the error using our error handler
    handleErrorBoundary(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    // Create error report
    const errorReport = {
      id: errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error report copied to clipboard. Please send it to support.');
      })
      .catch(() => {
        alert('Failed to copy error report. Please manually copy the error details.');
      });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f5f5f5',
          padding: '20px'
        }}>
          <Card style={{ maxWidth: 600, width: '100%' }}>
            <Result
              status="error"
              title="Oops! Something went wrong"
              subTitle="We're sorry, but something unexpected happened. Please try reloading the page."
              extra={[
                <Button 
                  type="primary" 
                  key="reload" 
                  icon={<ReloadOutlined />}
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>,
                <Button 
                  key="home" 
                  icon={<HomeOutlined />}
                  onClick={this.handleGoHome}
                >
                  Go Home
                </Button>,
                <Button 
                  key="report" 
                  icon={<BugOutlined />}
                  onClick={this.handleReportError}
                >
                  Report Error
                </Button>,
              ]}
            >
              <div style={{ textAlign: 'left' }}>
                <Paragraph>
                  <Text strong>Error ID:</Text> {this.state.errorId}
                </Paragraph>
                
                {isDevelopment && error && (
                  <div style={{ marginTop: 16 }}>
                    <Paragraph>
                      <Text strong>Error Details (Development Mode):</Text>
                    </Paragraph>
                    <Card size="small" style={{ background: '#f6f6f6' }}>
                      <pre style={{ 
                        fontSize: '12px', 
                        overflow: 'auto',
                        maxHeight: '200px',
                        margin: 0 
                      }}>
                        {error.toString()}
                        {errorInfo.componentStack}
                      </pre>
                    </Card>
                  </div>
                )}
                
                <Paragraph style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    If this problem persists, please contact support with the Error ID above.
                  </Text>
                </Paragraph>
              </div>
            </Result>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
