import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || '#1890ff';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Update CSS variables for custom styling
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#141414' : '#ffffff');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
  }, [primaryColor]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const changePrimaryColor = (color) => {
    setPrimaryColor(color);
  };

  // Ant Design theme configuration
  const antdTheme = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: primaryColor,
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: primaryColor,
      borderRadius: 8,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      // Dark mode specific tokens
      ...(isDarkMode && {
        colorBgContainer: '#1f1f1f',
        colorBgElevated: '#262626',
        colorBgLayout: '#141414',
        colorText: '#ffffff',
        colorTextSecondary: '#a6a6a6',
        colorBorder: '#434343',
        colorBorderSecondary: '#303030',
      })
    },
    components: {
      Button: {
        borderRadius: 8,
        fontWeight: 500,
      },
      Card: {
        borderRadius: 12,
        boxShadow: isDarkMode 
          ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
          : '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      Table: {
        borderRadius: 8,
      },
      Input: {
        borderRadius: 8,
      },
      Select: {
        borderRadius: 8,
      },
      Layout: {
        bodyBg: isDarkMode ? '#141414' : '#f5f5f5',
        headerBg: isDarkMode ? '#1f1f1f' : '#ffffff',
        siderBg: isDarkMode ? '#1f1f1f' : '#ffffff',
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: isDarkMode ? '#1668dc' : '#e6f7ff',
        itemHoverBg: isDarkMode ? '#262626' : '#f5f5f5',
      }
    },
  };

  const value = {
    isDarkMode,
    primaryColor,
    toggleTheme,
    changePrimaryColor,
    theme: antdTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
